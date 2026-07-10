import type { Metadata } from "next";
import AIWorkflowPortfolioCommand from "@/components/AIWorkflowPortfolioCommand";
import { getPortfolioCodeArtifacts } from "@/lib/portfolio-code-artifacts";

export const metadata: Metadata = {
  title: "AI Workflow Portfolio",
  description: "A light case-study portfolio page for practical AI workflow cleanup, verification, and role-fit examples.",
  alternates: {
    canonical: "/ai-workflow-portfolio/",
  },
};

export default async function AIWorkflowPortfolioPage() {
  const codeArtifacts = await getPortfolioCodeArtifacts();

  return <AIWorkflowPortfolioCommand codeArtifacts={codeArtifacts} />;
}
