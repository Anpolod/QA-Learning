import { redirect } from "next/navigation";

// Progress was merged into the dashboard. Keep the route as a redirect so old
// links/bookmarks still work.
export default function ProgressPage() {
  redirect("/dashboard");
}
