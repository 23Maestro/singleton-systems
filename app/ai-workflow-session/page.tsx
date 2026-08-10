import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AiWorkflowSessionForm from "./AiWorkflowSessionForm";
import { siteUrl } from "../site";

export const metadata: Metadata = {
  title: "AI Workflow Session",
  description: "Tell Singleton Systems what you would like AI to make easier.",
  alternates: {
    canonical: "/ai-workflow-session",
  },
  openGraph: {
    title: "AI Workflow Session | Singleton Systems",
    description: "Tell Singleton Systems what you would like AI to make easier.",
    url: `${siteUrl}/ai-workflow-session`,
  },
};

export default function AiWorkflowSessionPage() {
  return <main className="min-h-dvh bg-white px-6 py-14 text-neutral-950 sm:px-8 sm:py-20"><div className="mx-auto max-w-[38rem]"><Link href="/" className="mx-auto block w-72 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-4 sm:w-80" aria-label="Singleton Systems home"><Image src="/singleton-systems-wordmark.svg" alt="Singleton Systems" width={660} height={260} priority className="h-auto w-full" /></Link><section className="mt-16 sm:mt-20"><h1 className="text-center text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">AI Workflow Session</h1><div className="mt-16"><AiWorkflowSessionForm /></div></section></div></main>;
}
