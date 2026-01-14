import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PresentationPageClient from "./PresentationPageClient";

export default async function PresentationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <PresentationPageClient />;
}
