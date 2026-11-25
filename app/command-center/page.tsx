import { dashboardOwner } from "@/lib/dashboard-auth";
import CommandCenterApp from "./CommandCenterApp";

export const dynamic = "force-dynamic";
export default async function CommandCenterPage() {
  if (!await dashboardOwner()) return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-bold">Your dashboard</h1>
      <p className="mt-4">Sign in with your Google account.</p>
      <a className="mt-4 inline-block underline" href="/auth/dashboard/start">Sign in with Google</a>
    </main>
  );
  return <CommandCenterApp />;
}
