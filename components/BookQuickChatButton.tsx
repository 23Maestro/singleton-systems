"use client";

import { CAL_LINK } from "@/app/site";

const CAL_NAMESPACE = "workflow-chat";

type BookQuickChatButtonProps = {
  className?: string;
};

export default function BookQuickChatButton({ className }: BookQuickChatButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        const { getCalApi } = await import("@calcom/embed-react");
        const cal = await getCalApi({ namespace: CAL_NAMESPACE });
        cal("ui", {
          theme: "light",
          styles: {
            branding: { brandColor: "#050505" },
          },
        });
        cal("modal", { calLink: CAL_LINK });
      }}
    >
      Book a Free Call
    </button>
  );
}
