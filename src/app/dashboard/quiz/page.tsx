import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import QuizPageClient from "./QuizPageClient";

export default async function QuizPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <QuizPageClient />;
}
