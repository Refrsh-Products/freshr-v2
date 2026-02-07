"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, FileText, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface StorageFile {
  name: string;
  id: string;
  created_at: string;
  metadata: Record<string, any>;
}

export default function FilesPage() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please sign in to view files");
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const { data, error } = await supabase.storage
      .from("presentation-files")
      .list(user.id, {
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      toast.error("Failed to fetch files");
      console.error("Fetch error:", error);
      setFiles([]);
    } else {
      // Filter out placeholder files
      const userFiles = (data || []).filter(
        (file) => !file.name.startsWith(".empty"),
      );
      setFiles(userFiles);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async (fileName: string) => {
    if (!userId) return;

    setDeleting(fileName);
    const supabase = createClient();

    const filePath = `${userId}/${fileName}`;
    console.log("Attempting to delete file at path:", filePath);

    try {
      const { data, error } = await supabase.storage
        .from("presentation-files")
        .remove([filePath]);

      console.log("Delete API response:", { data, error });

      if (error) {
        toast.error(`Failed to delete file: ${error.message}`);
        console.error("Delete error:", error);
      } else {
        console.log("Delete API succeeded, verifying file was removed...");

        // Verify the file was actually deleted
        const { data: checkData, error: checkError } = await supabase.storage
          .from("presentation-files")
          .list(userId);

        console.log("Files remaining after delete:", checkData);

        const fileStillExists = checkData?.some((f) => f.name === fileName);

        if (fileStillExists) {
          console.error(
            "FILE STILL EXISTS AFTER DELETE - This is a permissions issue!",
          );
          toast.error(
            "Delete failed: Permission denied. Check Supabase Storage policies.",
          );
        } else {
          console.log("File successfully deleted from storage");
          toast.success("File deleted successfully");
        }

        setFiles(files.filter((f) => f.name !== fileName));

        // Refresh the file list to confirm deletion
        setTimeout(() => {
          fetchFiles();
        }, 500);
      }
    } catch (err) {
      console.error("Exception during delete:", err);
      toast.error("An error occurred while deleting the file");
    }

    setDeleting(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/home">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Link href="/home" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                FRESHR
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Files</h1>
            <p className="text-muted-foreground mt-2">
              Manage your uploaded files from storage.
            </p>
          </div>
          <Button onClick={fetchFiles} variant="outline" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files ({files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No files found in storage</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => {
                    // Extract original filename from storage path
                    // Format: timestamp__filename or legacy: timestamp-uuid.ext
                    let displayName = file.name;
                    if (file.name.includes("__")) {
                      // New format: timestamp__filename
                      displayName = file.name.split("__")[1] || file.name;
                    } else if (file.metadata?.originalName) {
                      // Has metadata with original name
                      displayName = file.metadata.originalName;
                    }

                    // Get file extension
                    const extension =
                      displayName.split(".").pop()?.toUpperCase() || "Unknown";

                    // Get mime type from metadata
                    const mimeType =
                      file.metadata?.mimetype || file.metadata?.type;

                    // Format file type display
                    let fileType = extension;
                    if (mimeType) {
                      if (mimeType.includes("pdf")) fileType = "PDF";
                      else if (mimeType.includes("text")) fileType = "TXT";
                    }

                    return (
                      <TableRow key={file.name}>
                        <TableCell className="font-medium">
                          {displayName}
                        </TableCell>
                        <TableCell>{fileType}</TableCell>
                        <TableCell>
                          {formatFileSize(file.metadata?.size || 0)}
                        </TableCell>
                        <TableCell>{formatDate(file.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(file.name)}
                            disabled={deleting === file.name}
                          >
                            {deleting === file.name ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
