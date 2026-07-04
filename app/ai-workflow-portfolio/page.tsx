import type { Metadata } from "next";
import AIWorkflowPortfolioCommand from "@/components/AIWorkflowPortfolioCommand";

export const metadata: Metadata = {
  title: "AI Workflow Portfolio",
  description: "A light case-study portfolio page for practical AI workflow cleanup, evidence, verification, and role-fit examples.",
  alternates: {
    canonical: "/ai-workflow-portfolio/",
  },
};

export default function AIWorkflowPortfolioPage() {
  return <AIWorkflowPortfolioCommand />;
}
