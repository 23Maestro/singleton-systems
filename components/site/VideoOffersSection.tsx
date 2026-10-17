import Link from "next/link";
import EvilIcon from "@/components/site/EvilIcon";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { VIDEO_OFFERS, VIDEO_FAQ, videoInquiryUrl } from "@/lib/video-offers";

const inclusions = [
  ["30–45 seconds from your supplied footage", "Your existing branding", "One sample per business considering recurring editing", "No payment or bundle commitment"],
  ["4 long-form videos + 2 shorts", "Videos up to 20 minutes", "Shorts up to 60 seconds from your completed videos", "Basic brand style setup included"],
  ["8 long-form videos + 4 shorts", "Videos up to 20 minutes", "Shorts up to 60 seconds from your completed videos", "Basic brand style setup included"],
];

export default function VideoOffersSection() {
  return <section id="offers" className="px-6 pb-20 pt-6 sm:px-8 sm:pb-24 sm:pt-10 lg:px-10" aria-labelledby="offers-heading">
    <div className="mx-auto max-w-6xl">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-base font-bold uppercase tracking-[0.16em] text-[#126f39]">Video editing bundles</p>
        <h2 id="offers-heading" className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">Start With a Free Test Edit</h2>
        <p className="mt-5 text-lg font-medium leading-relaxed text-neutral-600 sm:text-xl">Choose 4 or 8 long-form edits, with short cutdowns included in each bundle.</p>
      </div>
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {VIDEO_OFFERS.map((offer, index) => <article key={offer.value} className={`flex flex-col rounded-[2rem] p-7 shadow-[0_16px_42px_rgba(15,23,42,0.07)] sm:p-8 ${index !== 1 ? "bg-black text-white" : "border border-neutral-200/80 bg-white"}`}>
          <header className="video-offer-card-header">
          <p className={`text-base font-bold uppercase tracking-[0.14em] ${index !== 1 ? "text-[#62d26f]" : "text-[#075985]"}`}>{["Try your footage", "4-video bundle", "8-video bundle"][index]}</p>
          <h3 className="mt-4 text-3xl font-bold tracking-[-0.035em]">{offer.name}</h3>
          <p className="mt-5 text-4xl font-bold tracking-[-0.045em]">${offer.price.toLocaleString("en-US")}<span className={`ml-2 text-base font-medium tracking-normal ${index !== 1 ? "text-white/70" : "text-neutral-600"}`}>{index === 0 ? "one sample" : "per bundle"}</span></p>
          {index !== 0 && <p className={`mt-3 text-base font-semibold ${index === 2 ? "text-white/80" : "text-neutral-700"}`}>50% to start · 50% on approval</p>}
          </header>
          <p className={`mt-4 text-lg font-medium leading-relaxed ${index !== 1 ? "text-white/80" : "text-neutral-700"}`}>{offer.summary}</p>
          <ul className="mt-6 flex-1 space-y-3 text-base font-semibold">
            {inclusions[index].map((item) => <li key={item} className="flex items-start gap-2.5"><Check className={`mt-0.5 h-5 w-5 shrink-0 ${index !== 1 ? "text-[#62d26f]" : "text-[#126f39]"}`} weight="bold" aria-hidden="true" /><span>{item}</span></li>)}
          </ul>
          <Link href={videoInquiryUrl(offer.value)} className={`mt-8 inline-flex min-h-12 items-center justify-center rounded-full px-5 text-base font-bold transition focus:outline-none focus:ring-2 focus:ring-[#2383e2] focus:ring-offset-2 ${index !== 1 ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"}`}>{["Try my footage free", "Choose 4 + 2", "Choose 8 + 4"][index]}</Link>
        </article>)}
      </div>
      <div className="mt-8 rounded-[2rem] border border-neutral-200/80 bg-white p-7 text-lg leading-relaxed text-neutral-700 sm:p-8">
        <h3 className="text-2xl font-semibold text-neutral-950">What’s Included</h3>
        <ul className="mt-5 grid gap-x-10 gap-y-4 sm:grid-cols-2">
          <li className="flex items-start gap-2"><EvilIcon name="clock" className="h-7 w-7 shrink-0 text-[#126f39]" /><span>Up to 60 minutes of organized footage per main video.</span></li>
          <li className="flex items-start gap-2"><EvilIcon name="play" className="h-7 w-7 shrink-0 text-[#126f39]" /><span>1080p horizontal exports, audio cleanup and a caption file.</span></li>
          <li className="flex items-start gap-2"><EvilIcon name="image" className="h-7 w-7 shrink-0 text-[#126f39]" /><span>Fonts, colors and simple titles from your existing brand.</span></li>
          <li className="flex items-start gap-2"><EvilIcon name="play" className="h-7 w-7 shrink-0 text-[#126f39]" /><span>Vertical shorts with captions, up to 60 seconds each.</span></li>
          <li className="flex items-start gap-2"><EvilIcon name="pencil" className="h-7 w-7 shrink-0 text-[#126f39]" /><span>Shorts cut from moments we select in your completed videos.</span></li>
          <li className="flex items-start gap-2"><EvilIcon name="comment" className="h-7 w-7 shrink-0 text-[#126f39]" /><span>Two revision rounds per video, with feedback in Frame.io.</span></li>
        </ul>
        <ul className="mt-6 list-disc space-y-3 border-t border-neutral-200 pl-5 pt-6 text-base">
          <li>Footage and delivery dates confirmed before payment.</li>
          <li>50% deposit to start. Remaining 50% due after approval, before final delivery.</li>
          <li>Book once or arrange monthly delivery, with no automatic renewal.</li>
          <li>Separate quotes for filming, custom animation, extensive asset sourcing or posting.</li>
          <li>New footage or a new creative direction changes the scope.</li>
        </ul>
      </div>
      <div className="mt-10">
        <h3 className="text-center text-3xl font-semibold">Your Questions, Answered</h3>
        <div className="mt-6 space-y-3">{VIDEO_FAQ.map(([question, answer]) => <details key={question} className="rounded-2xl border border-neutral-200 bg-white p-6"><summary className="cursor-pointer text-lg font-bold">{question}</summary><p className="mt-4 text-lg leading-relaxed text-neutral-700">{answer}</p></details>)}</div>
      </div>
    </div>
  </section>;
}
