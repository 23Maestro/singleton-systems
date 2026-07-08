import { Composition } from "remotion";
import { ClinicalSetup1944 } from "./scenes/ClinicalSetup1944";
import { FoodManiaTextLayer } from "./scenes/FoodManiaAssets";
import { CalendarMonthTexture, StarvationGridLayer } from "./scenes/StarvationPhaseAssets";

export const RemotionRoot = () => {
  return (
    <>
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
    </>
  );
};
