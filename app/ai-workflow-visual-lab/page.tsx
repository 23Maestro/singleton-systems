import type { Metadata } from "next";
import JointWorkflowCodeMap from "@/components/JointWorkflowCodeMap";

export const metadata: Metadata = {
  title: "AI Workflow Visual Lab",
  description: "Interactive JointJS planning playground for Singleton Systems AI workflow portfolio decisions.",
  alternates: {
    canonical: "/ai-workflow-visual-lab/",
  },
};

export default function AIWorkflowVisualLabPage() {
  return <JointWorkflowCodeMap />;
}
