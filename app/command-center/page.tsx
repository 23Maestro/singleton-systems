import { headers } from "next/headers";
import { owner } from "@/lib/studio-session";
import CommandCenterApp from "./CommandCenterApp";

export default async function CommandCenterPage() {
  if (!owner({ headers: await headers() })) return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-bold">Your dashboard is private</h1>
      <p className="mt-4">Open your private Studio bookmark, then return here.</p>
      <a className="mt-4 inline-block underline" href="/studio">Open Studio</a>
    </main>
  );
  return <CommandCenterApp />;
}
