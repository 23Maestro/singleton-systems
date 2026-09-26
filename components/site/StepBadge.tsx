// Numbered badge in the homepage icon language: the SolutionIcon circle sizes and tones
// from "What I Fix", with the stroked white numeral from the "Step 1 / Step 2" badges.
const TONES = ["bg-black", "bg-[#ffc83d]", "bg-[#ff6257]", "bg-[#25c266]"] as const;

export default function StepBadge({ step }: { step: number }) {
  const tone = TONES[(step - 1) % TONES.length];

  return (
    <span
      aria-label={`Step ${step}`}
      className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-black ${tone} text-[2rem] font-black leading-none text-white sm:h-16 sm:w-16 sm:text-[2.35rem]`}
      style={{ WebkitTextStroke: "1.4px black" }}
    >
      {step}
    </span>
  );
}
