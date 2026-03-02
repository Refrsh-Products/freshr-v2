"use client";

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react";
import Markdown from "react-markdown";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Stack,
  InputAdornment,
  Popover,
  Tooltip,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useRouter } from "next/navigation";

interface Source {
  content: string;
  metadata: {
    chunk_id?: number;
    raw_text?: string;
    tables_html?: string;
  };
}

function SourceChip({ source, index }: { source: Source; index: number }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title={`View source ${index + 1}`} placement="top">
        <Chip
          label={`[${index + 1}]`}
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          clickable
          sx={{
            fontSize: 11,
            height: 22,
            bgcolor: "rgba(255,255,255,0.06)",
            color: "primary.light",
            border: "1px solid",
            borderColor: "rgba(255,255,255,0.1)",
            "&:hover": {
              bgcolor: "rgba(99,102,241,0.15)",
              borderColor: "primary.main",
            },
          }}
        />
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
        PaperProps={{
          sx: {
            maxWidth: 480,
            width: "90vw",
            maxHeight: 380,
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.25,
            borderBottom: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <Typography variant="caption" fontWeight={600} color="text.secondary">
            Source {index + 1}
            {source.metadata?.chunk_id != null
              ? ` · Chunk #${source.metadata.chunk_id}`
              : ""}
          </Typography>
        </Box>
        <Box sx={{ p: 2, overflowY: "auto" }}>
          <Typography
            variant="body2"
            sx={{
              whiteSpace: "pre-wrap",
              fontSize: 13,
              lineHeight: 1.7,
              color: "text.primary",
            }}
          >
            {source.content}
          </Typography>
        </Box>
      </Popover>
    </>
  );
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

const EXAMPLE_QUESTIONS = [
  "What programs does IUB offer?",
  "How do I apply for admission?",
  "What are the tuition fees?",
];

export default function UniAdvisorPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typedContent, setTypedContent] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef("");
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typedContent]);

  // Keep targetRef in sync with the latest streamed content
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === "assistant") {
      targetRef.current = last.content;
    }
  }, [messages]);

  // Start/stop the character-reveal typing animation
  useEffect(() => {
    if (loading) {
      targetRef.current = "";
      setTypedContent("");
      typingIntervalRef.current = setInterval(() => {
        setTypedContent((prev) => {
          const target = targetRef.current;
          if (prev.length >= target.length) return prev;
          // Reveal up to 6 chars per tick at 20ms ≈ 300 chars/sec
          return target.slice(0, prev.length + 6);
        });
      }, 20);
    } else {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      setTypedContent(targetRef.current);
    }
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [loading]);

  async function handleSubmit(query: string) {
    if (!query.trim() || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: query.trim() }]);
    setLoading(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      abortRef.current = new AbortController();
      const res = await fetch(
        `/api/rag/chat/stream?query_text=${encodeURIComponent(query.trim())}`,
        { signal: abortRef.current.signal }
      );

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop()!;

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const event = JSON.parse(line.slice(6));

          if (event.type === "token") {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: updated[updated.length - 1].content + event.data,
              };
              return updated;
            });
          } else if (event.type === "sources") {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                sources: event.data,
              };
              return updated;
            });
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: "Sorry, I couldn't get a response. Please try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function onFormSubmit(e: FormEvent) {
    e.preventDefault();
    handleSubmit(input);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 3,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.default",
          flexShrink: 0,
        }}
      >
        <Tooltip title="Back to home" placement="right">
          <IconButton
            onClick={() => router.push("/home")}
            size="small"
            sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: 34,
            height: 34,
          }}
        >
          <SchoolRoundedIcon sx={{ fontSize: 18 }} />
        </Avatar>
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            lineHeight={1.2}
            color="text.primary"
          >
            IUB Assistant
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Independent University, Bangladesh
          </Typography>
        </Box>
      </Box>

      {/* Messages area */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {isEmpty ? (
          /* Empty state */
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              px: 3,
              gap: 3,
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <AutoAwesomeIcon sx={{ color: "white", fontSize: 30 }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
                How can I help you?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ask me anything about Independent University, Bangladesh.
              </Typography>
            </Box>
            <Stack direction="column" spacing={1} alignItems="center">
              {EXAMPLE_QUESTIONS.map((q) => (
                <Chip
                  key={q}
                  label={q}
                  onClick={() => handleSubmit(q)}
                  variant="outlined"
                  clickable
                  sx={{
                    borderColor: "rgba(255,255,255,0.15)",
                    color: "text.secondary",
                    fontSize: 13,
                    height: 36,
                    "&:hover": {
                      borderColor: "primary.main",
                      color: "primary.main",
                      bgcolor: "transparent",
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>
        ) : (
          /* Message list */
          <Box
            sx={{
              maxWidth: 760,
              width: "100%",
              mx: "auto",
              px: { xs: 2, sm: 3 },
              py: 3,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {messages.map((msg, i) =>
              msg.role === "user" ? (
                /* User message */
                <Box
                  key={i}
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}
                >
                  <Box
                    sx={{
                      maxWidth: "75%",
                      bgcolor: "primary.main",
                      color: "white",
                      borderRadius: "18px 18px 4px 18px",
                      px: 2.5,
                      py: 1.5,
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                      {msg.content}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "rgba(255,255,255,0.1)",
                      flexShrink: 0,
                      alignSelf: "flex-end",
                    }}
                  >
                    <PersonRoundedIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.6)" }} />
                  </Avatar>
                </Box>
              ) : (
                /* Assistant message */
                <Box key={i} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "primary.main",
                      flexShrink: 0,
                    }}
                  >
                    <SchoolRoundedIcon sx={{ fontSize: 17 }} />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {(() => {
                      const isStreaming = loading && i === messages.length - 1;
                      const content = isStreaming ? typedContent : msg.content;
                      const isThinking = isStreaming && typedContent === "";

                      if (isThinking) {
                        return (
                          /* Thinking dots */
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, pt: 0.75 }}>
                            {[0, 1, 2].map((dot) => (
                              <Box
                                key={dot}
                                sx={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: "50%",
                                  bgcolor: "primary.light",
                                  animation: "thinking-bounce 1.2s ease-in-out infinite",
                                  animationDelay: `${dot * 0.2}s`,
                                  "@keyframes thinking-bounce": {
                                    "0%, 80%, 100%": { transform: "scale(0.7)", opacity: 0.4 },
                                    "40%": { transform: "scale(1)", opacity: 1 },
                                  },
                                }}
                              />
                            ))}
                          </Box>
                        );
                      }

                      return (
                        <Box
                          sx={{
                            "& p": { mt: 0, mb: 1.5, lineHeight: 1.75 },
                            "& p:last-child": { mb: 0 },
                            "& ul, & ol": { pl: 2.5, mb: 1.5 },
                            "& li": { mb: 0.5, lineHeight: 1.75 },
                            "& h1, & h2, & h3": { fontWeight: 600, mt: 2, mb: 1 },
                            "& code": {
                              bgcolor: "rgba(255,255,255,0.07)",
                              px: 0.75,
                              py: 0.25,
                              borderRadius: 1,
                              fontSize: "0.85em",
                              fontFamily: "monospace",
                            },
                            "& pre": {
                              bgcolor: "rgba(255,255,255,0.07)",
                              p: 2,
                              borderRadius: 2,
                              overflowX: "auto",
                              mb: 1.5,
                            },
                            "& strong": { fontWeight: 600 },
                            color: "text.primary",
                            fontSize: 15,
                            lineHeight: 1.75,
                          }}
                        >
                          <Markdown>{content}</Markdown>
                          {isStreaming && (
                            <Box
                              component="span"
                              sx={{
                                display: "inline-block",
                                width: "2px",
                                height: "1em",
                                bgcolor: "primary.light",
                                ml: "2px",
                                verticalAlign: "text-bottom",
                                borderRadius: "1px",
                                animation: "cursor-blink 0.7s step-end infinite",
                                "@keyframes cursor-blink": {
                                  "0%, 100%": { opacity: 1 },
                                  "50%": { opacity: 0 },
                                },
                              }}
                            />
                          )}
                        </Box>
                      );
                    })()}
                    {msg.sources && msg.sources.length > 0 && (
                      <Stack direction="row" flexWrap="wrap" gap={0.75} mt={1.5} alignItems="center">
                        <Typography variant="caption" color="text.secondary" sx={{ mr: 0.25 }}>
                          Sources:
                        </Typography>
                        {msg.sources.map((src, j) => (
                          <SourceChip key={j} source={src} index={j} />
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Box>
              )
            )}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* Input area */}
      <Box
        sx={{
          flexShrink: 0,
          px: { xs: 2, sm: 3 },
          py: 2,
          borderTop: isEmpty ? "none" : "1px solid",
          borderColor: "divider",
          bgcolor: "background.default",
        }}
      >
        <Box sx={{ maxWidth: 760, mx: "auto" }}>
          <form onSubmit={onFormSubmit}>
            <TextField
              fullWidth
              multiline
              maxRows={6}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Message IUB Assistant…"
              disabled={loading}
              variant="outlined"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="submit"
                        disabled={loading || !input.trim()}
                        sx={{
                          bgcolor: input.trim() && !loading ? "primary.main" : "rgba(255,255,255,0.08)",
                          color: input.trim() && !loading ? "white" : "rgba(255,255,255,0.3)",
                          width: 34,
                          height: 34,
                          "&:hover": {
                            bgcolor: input.trim() && !loading ? "primary.dark" : "rgba(255,255,255,0.08)",
                          },
                          transition: "all 0.15s ease",
                        }}
                      >
                        <SendRoundedIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: "16px",
                    bgcolor: "background.paper",
                    fontSize: 15,
                    alignItems: "flex-end",
                    pb: 0.75,
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.1)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255,255,255,0.15)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "primary.main",
                      borderWidth: "1px",
                    },
                  },
                },
              }}
            />
          </form>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", textAlign: "center", mt: 1 }}
          >
            IUB Assistant may make mistakes. Verify important information.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
