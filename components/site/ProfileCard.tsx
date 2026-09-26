import Image from "next/image";

export default function ProfileCard() {
  return (
    <div className="mt-10 w-full max-w-[12rem] overflow-hidden rounded-[1.45rem] border border-[#2b5f8f]/22 bg-white shadow-[0_14px_36px_rgba(35,54,79,0.08)] backdrop-blur sm:mt-14 sm:max-w-[14rem]">
      <Image
        src="/23-hero.png"
        alt="Jerami Singleton"
        width={1254}
        height={1254}
        priority
        fetchPriority="high"
        sizes="(min-width: 640px) 14rem, 12rem"
        className="aspect-square w-full rounded-b-[1.18rem] object-cover"
      />
      <div className="px-3 pb-3.5 pt-2.5 text-left sm:px-4">
        <p className="text-base font-semibold tracking-[-0.04em] text-neutral-950">Jerami Singleton</p>
        <p className="mt-1 text-xs font-medium leading-relaxed text-neutral-600 sm:text-sm">
          <span className="block">2 years of Programming | IT</span>
          <span className="block">at St. Petersburg College</span>
          <span className="mt-2 block">Video Editing since 2022</span>
          <span className="mt-2 block">Building with AI since 2024</span>
        </p>
      </div>
    </div>
  );
}
