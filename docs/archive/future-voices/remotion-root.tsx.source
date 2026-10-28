import { Composition } from "remotion";
import { ClinicalSetup1944 } from "./scenes/ClinicalSetup1944";
import { FoodManiaLabelTexture, FoodManiaTextLayer } from "./scenes/FoodManiaAssets";
import { CalendarMonthTexture, StarvationGridLayer } from "./scenes/StarvationPhaseAssets";
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
