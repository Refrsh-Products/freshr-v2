import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Redirect to home page as the main starting point
  redirect("/home");
}
