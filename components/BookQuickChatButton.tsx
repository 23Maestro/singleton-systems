"use client";

const CAL_NAMESPACE = "workflow-chat";
const CAL_LINK = "workflow-chat/15min";

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
      Book a Flow Check
    </button>
  );
}
