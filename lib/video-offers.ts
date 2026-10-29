export const VIDEO_OFFERS = [
  { value: "free-test-edit", name: "Free Test Edit", price: 0, label: "Video test edit — $0", summary: "See 30–45 seconds of your footage edited in your brand's style before booking a bundle." },
  { value: "four-video-bundle", name: "4 Long-Form + 2 Shorts", price: 1306, label: "Video bundle: 4 long-form + 2 shorts — $1,306", summary: "Four finished videos with two short cutdowns from the same footage." },
  { value: "eight-video-bundle", name: "8 Long-Form + 4 Shorts", price: 2396, label: "Video bundle: 8 long-form + 4 shorts — $2,396", summary: "Eight finished videos and four short cutdowns at a lower rate per main video." },
] as const;

export type VideoOffer = (typeof VIDEO_OFFERS)[number]["value"];
export const VIDEO_OFFER_VALUES = VIDEO_OFFERS.map(({ value }) => value) as [VideoOffer, ...VideoOffer[]];
export function isVideoOffer(value: unknown): value is VideoOffer {
  return typeof value === "string" && VIDEO_OFFER_VALUES.includes(value as VideoOffer);
}
export function videoOffer(value: VideoOffer) {
  return VIDEO_OFFERS.find((offer) => offer.value === value)!;
}
export function videoInquiryUrl(value: VideoOffer) {
  return `/video-inquiry?offer=${value}`;
}

export const VIDEO_FAQ = [
  ["What Do I Get in the Free Test Edit?", "A 30-45 second sample from footage you supply, using your existing branding. One sample per business considering recurring editing. It lets you check the editing style before booking a bundle."],
  ["How Do the Bundle Prices Work?", "The 4 + 2 bundle is $1,306: four main videos at $305 each and two shorts at $43 each. The 8 + 4 bundle is $2,396: eight main videos at $278 each and four shorts at $43 each. Basic brand style setup is included."],
  ["How Does Payment Work?", "We confirm the footage, scope and delivery dates first. Pay a 50% deposit to start: $653 for the 4 + 2 bundle or $1,198 for the 8 + 4 bundle. The remaining 50% is due after approval, before final delivery. The test edit is free."],
  ["When Will My Videos Arrive?", "We confirm delivery dates after reviewing your footage and before payment. You can book one bundle or arrange ongoing monthly delivery. Timely footage and one consolidated set of notes per revision round keep that schedule moving."],
  ["Are the Shorts Separate Productions?", "The shorts are cutdowns from moments we select in your completed long-form videos, up to 60 seconds each. They include vertical framing and captions. A separate script, new footage or custom animation needs its own quote."],
  ["How Do Revisions Work?", "Each video in a paid bundle includes two revision rounds. Leave timestamped comments in Frame.io, with your team's feedback combined into one set of notes per round. I fix mistakes on my side without using a round. New footage, a new creative direction or extra rounds are quoted before work starts."],
  ["What if I Need Longer Videos?", "Each main video covers up to 20 finished minutes from up to 60 minutes of organized footage. Send longer or more complex work for a quote before booking."],
] as const;
