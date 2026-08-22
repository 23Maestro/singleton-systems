import { Composition } from "remotion";
import { ClinicalSetup1944 } from "./scenes/ClinicalSetup1944";
import { FoodManiaLabelTexture, FoodManiaTextLayer } from "./scenes/FoodManiaAssets";
import { CalendarMonthTexture, StarvationGridLayer } from "./scenes/StarvationPhaseAssets";
import { SectionTitle, type SectionTitleProps } from "./josh-vsl/SectionTitle";
import { EmphasisCallout, type EmphasisCalloutProps } from "./josh-vsl/EmphasisCallout";
import { ColdCallingProductStory } from "./josh-vsl/ColdCallingProductStory";
import { PixelConditioningEngine } from "./josh-vsl/PixelConditioningEngine";
import { CashOfferDecisionEngine } from "./josh-vsl/CashOfferDecisionEngine";
import { FourFulfillmentPaths } from "./josh-vsl/FourFulfillmentPaths";
import { CampaignEconomics } from "./josh-vsl/CampaignEconomics";
import { SystemDeployment } from "./josh-vsl/SystemDeployment";
import {
  TranscriptCallout,
  type TranscriptCalloutProps,
} from "./future-voices/TranscriptCallout";

const futureVoicesCallouts: Array<{
  id: string;
  durationInFrames: number;
  props: TranscriptCalloutProps;
}> = [
  {
    id: "FutureVoicesCalloutAlgae",
    durationInFrames: 54,
    props: {
      rows: [
        {
          tokens: [
            { text: "Algae", highlighted: true, appearFrame: 2 },
            { text: "in the", appearFrame: 9 },
          ],
          scale: 1.08,
          opacity: 0.82,
        },
        {
          tokens: [{ text: "reflecting pool", appearFrame: 17 }],
          scale: 0.92,
        },
      ],
      fontSize: 112,
    },
  },
  {
    id: "FutureVoicesCalloutBiggerThanOnePool",
    durationInFrames: 90,
    props: {
      rows: [
        {
          tokens: [
            { text: "Bigger", highlighted: true, appearFrame: 3 },
            { text: "than", appearFrame: 11 },
          ],
          scale: 0.86,
        },
        {
          tokens: [{ text: "one reflecting pool", appearFrame: 23 }],
          scale: 0.68,
        },
      ],
      fontSize: 92,
      accentColor: "#04ACEC",
      highContrastAccent: true,
      rowGap: 28,
    },
  },
  {
    id: "FutureVoicesCalloutLakesAndOceans",
    durationInFrames: 84,
    props: {
      rows: [
        {
          tokens: [{ text: "All of our", appearFrame: 2 }],
          scale: 1.02,
          opacity: 0.82,
        },
        {
          tokens: [
            { text: "lakes and", appearFrame: 21 },
            { text: "oceans", highlighted: true, appearFrame: 34 },
          ],
          scale: 0.88,
        },
      ],
      fontSize: 112,
    },
  },
  {
    id: "FutureVoicesCalloutBiggerProblem",
    durationInFrames: 105,
    props: {
      rows: [
        {
          tokens: [{ text: "A bigger problem", appearFrame: 3 }],
          scale: 0.84,
          opacity: 0.92,
        },
        {
          tokens: [{ text: "than most people", appearFrame: 27 }],
          scale: 0.72,
        },
        {
          tokens: [{ text: "realize", highlighted: true, appearFrame: 51 }],
          scale: 0.76,
        },
      ],
      fontSize: 88,
      accentColor: "#04ACEC",
      highContrastAccent: true,
    },
  },
];

const joshSections: SectionTitleProps[] = [
  { number: "01", title: "The Cold Open" },
  { number: "02", title: "Who This Is For" },
  { number: "03", title: "The Problem" },
  { number: "04", title: "The Front End, and Why It’s a Cash Offer" },
  { number: "05", title: "The Filter, Question by Question" },
  { number: "06", title: "Pixel Conditioning, or Why Your Leads Get Cheaper" },
  { number: "07", title: "The Cash Offer Question, Answered Completely" },
  { number: "08", title: "The Money Math, Including the 4 Percent Move" },
  { number: "09", title: "What I Build, What You Do, and Who Owns It" },
  { number: "10", title: "Proof" },
  { number: "11", title: "Price, Guarantee, and Why Now" },
];

const joshCallouts: EmphasisCalloutProps[] = [
  { value: "5 LISTINGS", label: "IN 11 BUSINESS DAYS", kicker: "RESULT", side: "left" },
  { value: "$90 / DAY", label: "CURRENT CAMPAIGN SPEND", kicker: "AD SPEND", side: "right" },
  { value: "$228", label: "PER SIGNED LISTING", kicker: "COST", side: "left" },
  { value: "4%", label: "COMMISSION ON FOUR LISTINGS", kicker: "POSITIONING", side: "right" },
  { value: "RENTING", label: "OR GRINDING", kicker: "THE OLD MODEL", side: "left" },
  { value: "67 HOURS", label: "OF DIALING FOR ONE LISTING", kicker: "COLD CALLING", side: "right" },
  { value: "$5 LEAD", label: "QUALIFIED SELLER", kicker: "AUTHENTIC WINS", side: "left" },
  { value: "9 QUESTIONS", label: "A REAL SELLER FILTER", kicker: "GOOD FRICTION", side: "right" },
  { value: "QUESTION 9", label: "PHONE NUMBER COMES LAST", kicker: "ON PURPOSE", side: "left" },
  { value: "PIXEL", label: "CONDITIONING", kicker: "MORE LIKE THIS ONE", side: "right" },
  { value: "$100K+", label: "CASH OFFER VS. LISTING GAP", kicker: "$400K HOUSE", side: "left" },
  { value: "9 OUT OF 10", label: "CHOOSE TO LIST", kicker: "THE MATH CONVERTS", side: "right" },
  { value: "DO BOTH", label: "CASH OFFER + TRADITIONAL LISTING", kicker: "YOUR ADVANTAGE", side: "left" },
  { value: "60% RAISE", label: "ON EVERY SINGLE DEAL", kicker: "2.5% → 4%", side: "right" },
  { value: "48 HOURS", label: "UNTIL EVERYTHING IS BUILT", kicker: "DELIVERY", side: "left" },
  { value: "YOU OWN IT", label: "EVERY PIECE OF THE SYSTEM", kicker: "NO RENTING", side: "right" },
  { value: "7 APPOINTMENTS", label: "IN HER FIRST 8 DAYS", kicker: "BRANDY · DFW", side: "left", compact: true },
  { value: "$4,800", label: "PAID IN FULL · SAVE $1,200", kicker: "PRICE", side: "right" },
  { value: "KEEP IT ALL", label: "FULL REFUND + EVERYTHING BUILT", kicker: "THE GUARANTEE", tone: "green", side: "left" },
  { value: "3.63%", label: "REFUND RATE ACROSS ALL CLIENTS", kicker: "TRACK RECORD", tone: "green", side: "right" },
];

export const RemotionRoot = () => {
  return (
    <>
      {futureVoicesCallouts.map((callout) => (
        <Composition
          key={callout.id}
          id={callout.id}
          component={TranscriptCallout}
          defaultProps={callout.props}
          durationInFrames={callout.durationInFrames}
          fps={30}
          width={1080}
          height={1920}
        />
      ))}
      {joshSections.map((section) => (
        <Composition
          key={section.number}
          id={`JoshSection${section.number}`}
          component={SectionTitle}
          defaultProps={section}
          durationInFrames={90}
          fps={29.97}
          width={1920}
          height={1080}
        />
      ))}
      {joshCallouts.map((callout, index) => (
        <Composition
          key={`callout-${index + 1}`}
          id={`JoshCallout${String(index + 1).padStart(2, "0")}`}
          component={EmphasisCallout}
          defaultProps={callout}
          durationInFrames={90}
          fps={29.97}
          width={1920}
          height={1080}
        />
      ))}
      <Composition
        id="JoshColdCallingProductStory"
        component={ColdCallingProductStory}
        durationInFrames={240}
        fps={29.97}
        width={1920}
        height={1080}
      />
      <Composition
        id="JoshPixelConditioningEngine"
        component={PixelConditioningEngine}
        durationInFrames={450}
        fps={29.97}
        width={1920}
        height={1080}
      />
      <Composition
        id="JoshCashOfferDecisionEngine"
        component={CashOfferDecisionEngine}
        durationInFrames={450}
        fps={29.97}
        width={1920}
        height={1080}
      />
      <Composition
        id="JoshFourFulfillmentPaths"
        component={FourFulfillmentPaths}
        durationInFrames={510}
        fps={29.97}
        width={1920}
        height={1080}
      />
      <Composition
        id="JoshCampaignEconomics"
        component={CampaignEconomics}
        durationInFrames={390}
        fps={29.97}
        width={1920}
        height={1080}
      />
      <Composition
        id="JoshSystemDeployment"
        component={SystemDeployment}
        durationInFrames={510}
        fps={29.97}
        width={1920}
        height={1080}
      />
      <Composition
        id="ClinicalSetup1944"
        component={ClinicalSetup1944}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="StarvationGridLayer"
        component={StarvationGridLayer}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      {[1, 2, 3, 4, 5, 6].map((month) => (
        <Composition
          key={month}
          id={`CalendarMonth${month}`}
          component={CalendarMonthTexture}
          defaultProps={{ month }}
          durationInFrames={1}
          fps={30}
          width={900}
          height={540}
        />
      ))}
      <Composition
        id="FoodManiaTextLayer"
        component={FoodManiaTextLayer}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      {(["hoarded", "hid", "recipes"] as const).map((label) => (
        <Composition
          key={label}
          id={`FoodManiaLabel-${label}`}
          component={FoodManiaLabelTexture}
          defaultProps={{ label }}
          durationInFrames={1}
          fps={30}
          width={640}
          height={220}
        />
      ))}
    </>
  );
};
