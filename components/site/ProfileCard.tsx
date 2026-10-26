import Image from "next/image";
import EvilIcon from "@/components/site/EvilIcon";
import { FigmaLogo } from "@phosphor-icons/react/dist/ssr";

export default function ProfileCard({ video = false }: { video?: boolean }) {
  return (
    <div data-profile-card className="mt-10 w-full max-w-[18rem] overflow-hidden rounded-[1.45rem] border border-[#2b5f8f]/22 bg-white shadow-[0_14px_36px_rgba(35,54,79,0.08)] backdrop-blur sm:mt-14">
      <Image
        src="/23-hero.png"
        alt="Jerami Singleton"
        width={1254}
        height={1254}
        sizes="18rem"
        className="aspect-square w-full rounded-b-[1.18rem] object-cover"
      />
      <div className="px-3 pb-3.5 pt-2.5 text-left sm:px-4">
        <p className="text-base font-semibold tracking-[-0.04em] text-neutral-950">Jerami Singleton</p>
        <p className="mt-1 text-base font-medium leading-relaxed text-neutral-600">
          {video ? <span className="block">Your editor, from sample to final cut</span> : <><span className="block">2 years of Programming | IT</span><span className="block">at St. Petersburg College</span></>}
          <span className={video ? "mt-3 flex items-start gap-2" : "mt-2 block"}>{video && <EvilIcon name="camera" className="-ml-1 h-7 w-7 shrink-0 text-neutral-900" />}<span>Broadcast Production since 2014</span></span>
          <span className={video ? "mt-3 flex items-start gap-2" : "mt-2 block"}>{video && <EvilIcon name="play" className="-ml-1 h-7 w-7 shrink-0 text-neutral-900" />}<span>Video Editing since 2022</span></span>
          <span className={video ? "mt-3 flex items-start gap-2" : "mt-2 block"}>{video ? <><FigmaLogo className="mt-0.5 h-5 w-5 shrink-0 text-neutral-900" aria-hidden="true" /><span>Reusable graphics in Figma</span></> : "Building with AI since 2024"}</span>
        </p>
      </div>
    </div>
  );
}
