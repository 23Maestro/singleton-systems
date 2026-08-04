import {Building2, Handshake, KeyRound, PackageCheck, Route, UserRoundCheck} from "lucide-react";
import {useCurrentFrame, useVideoConfig} from "remotion";
import {Check, clamp, COLORS, enter, Eyebrow, MONO, Panel, ProductShell} from "./ProductStorySystem";
import {JointFlowLayer, type FlowLayout} from "./JointFlowLayer";

const paths = [
  {title: "WHOLESALE", body: "Assign the contract to a local investor", ready: "Investor assignment ready", Icon: PackageCheck},
  {title: "INVESTOR PARTNER", body: "Partner, renovate, and list it again", ready: "Partner route ready", Icon: Handshake},
  {title: "iBUYER PLATFORM", body: "Request an offer through a platform", ready: "Platform offer ready", Icon: Building2},
  {title: "BUY IT YOURSELF", body: "Use it as a flip or rental", ready: "Purchase route ready", Icon: KeyRound},
] as const;

const fulfillmentFlowLayout = (width: number, height: number): FlowLayout => {
  const targetStart = 170;
  const cardGap = 18;
  const cardWidth = (width - targetStart - cardGap) / 2;
  const cardHeight = 220;
  const rowGap = 18;
  const top = (height - cardHeight * 2 - rowGap) / 2;
  const secondColumn = targetStart + cardWidth + cardGap;
  const hubRight = 116;
  const center = height / 2;
  const topCenter = top + cardHeight / 2;
  const bottomCenter = top + cardHeight + rowGap + cardHeight / 2;
  const firstLane = targetStart - 24;
  const secondLane = secondColumn - 24;

  return {
    nodes: [
      {id: "seller-entry", x: -2, y: height / 2 - 2, width: 4, height: 4},
      {id: "route-hub", x: 68, y: height / 2 - 24, width: 48, height: 48},
      {id: "wholesale", x: targetStart, y: top, width: cardWidth, height: cardHeight},
      {id: "investor-partner", x: secondColumn, y: top, width: cardWidth, height: cardHeight},
      {id: "ibuyer-platform", x: targetStart, y: top + cardHeight + rowGap, width: cardWidth, height: cardHeight},
      {id: "buy-it-yourself", x: secondColumn, y: top + cardHeight + rowGap, width: cardWidth, height: cardHeight},
    ],
    edges: [
      {id: "entry-to-hub", source: "seller-entry", target: "route-hub"},
      {id: "hub-to-wholesale", source: "route-hub", target: "wholesale", vertices: [{x: firstLane, y: center}, {x: firstLane, y: topCenter}]},
      {id: "hub-to-investor", source: "route-hub", target: "investor-partner", vertices: [{x: hubRight + 18, y: center}, {x: secondLane, y: center}, {x: secondLane, y: topCenter}]},
      {id: "hub-to-ibuyer", source: "route-hub", target: "ibuyer-platform", vertices: [{x: firstLane, y: center}, {x: firstLane, y: bottomCenter}]},
      {id: "hub-to-purchase", source: "route-hub", target: "buy-it-yourself", vertices: [{x: hubRight + 18, y: center}, {x: secondLane, y: center}, {x: secondLane, y: bottomCenter}]},
    ],
  };
};

export const FourFulfillmentPaths = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const input = enter(frame, fps, 12);
  const routeDraw = clamp(frame, [85, 230], [0, 1]);
  const claim = enter(frame, fps, 360);
  const routeColor = frame > 330 ? "rgba(34,197,94,.70)" : "rgba(224,31,38,.76)";

  return <ProductShell path="seller fulfillment" status={frame < 350 ? "Reviewing service paths" : "Four ways to help this seller"} footerLeft="FOUR FULFILLMENT PATHS" footerRight="One seller · four ways to serve them">
    <div style={{height: "100%", padding: "32px 34px 28px", display: "grid", gridTemplateRows: "1fr 118px", gap: 22}}>
      <div style={{display: "grid", gridTemplateColumns: ".58fr 1.42fr", alignItems: "center"}}>
        <Panel style={{padding: "28px", borderColor: "rgba(224,31,38,.34)", opacity: input, transform: `translateX(${clamp(input,[0,1],[-30,0])}px)`}}>
          <div style={{width: 58, height: 58, display: "grid", placeItems: "center", borderRadius: 16, background: "rgba(224,31,38,.09)", border: "1px solid rgba(224,31,38,.28)"}}><UserRoundCheck size={33} strokeWidth={1.8} color={COLORS.red}/></div>
          <Eyebrow>SELLER REQUEST</Eyebrow><div style={{fontSize: 34, fontWeight: 820, marginTop: 18}}>CASH-OFFER SELLER</div><div style={{color: COLORS.body, marginTop: 12, fontSize: 17}}>Ready to review service paths</div>
          <div style={{height: 1, background: COLORS.line, margin: "26px 0"}}/><div style={{display: "flex", justifyContent: "space-between", fontSize: 17}}><span style={{color: COLORS.body}}>Seller needs</span><span style={{fontWeight: 700}}>SPEED + CERTAINTY</span></div><div style={{display: "flex", justifyContent: "space-between", fontSize: 17, marginTop: 14}}><span style={{color: COLORS.body}}>Agent funds</span><span style={{color: COLORS.red, fontWeight: 750}}>$0 REQUIRED</span></div>
        </Panel>

        <div style={{position: "relative", height: 520, display: "grid", gridTemplateColumns: "170px 1fr", alignItems: "center"}}>
          <JointFlowLayer layout={fulfillmentFlowLayout} progress={routeDraw} stroke={routeColor} canvasWidth={1224} canvasHeight={520}/>
          <div style={{position: "relative", zIndex: 2, width: 48, height: 48, marginLeft: 68, borderRadius: 14, display: "grid", placeItems: "center", background: COLORS.panelRaised, border: `1px solid ${routeColor}`, color: COLORS.red}}><Route size={28} strokeWidth={1.9}/></div>
          <div style={{position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18}}>
            {paths.map((path,index) => {const card = enter(frame,fps,130+index*42); const valid = enter(frame,fps,255+index*26); const Icon = path.Icon; return <Panel key={path.title} style={{minHeight: 220, padding: "24px", position: "relative", opacity: card, transform: `translateX(${clamp(card,[0,1],[28,0])}px)`, borderColor: valid > .8 ? "rgba(34,197,94,.34)" : COLORS.lineStrong}}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}><span style={{fontSize: 16, color: COLORS.body}}>Option {index+1}</span><span style={{opacity: valid}}><Check size={30}/></span></div>
              <div style={{display: "flex", alignItems: "center", gap: 13, marginTop: 22}}><Icon size={31} strokeWidth={1.8} color={valid > .8 ? COLORS.green : COLORS.white}/><div style={{fontSize: 25, fontWeight: 820}}>{path.title}</div></div><div style={{fontSize: 18, color: COLORS.body, marginTop: 13}}>{path.body}</div><div style={{position: "absolute", left: 24, bottom: 22, fontSize: 16, fontWeight: 650, color: valid > .8 ? COLORS.green : COLORS.body}}>{valid > .8 ? path.ready : "Reviewing this option…"}</div>
            </Panel>;})}
          </div>
        </div>
      </div>
      <Panel style={{display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 26px", background: "rgba(34,197,94,.075)", borderColor: "rgba(34,197,94,.34)", opacity: claim, transform: `translateY(${clamp(claim,[0,1],[18,0])}px)`}}>
        <div style={{display: "flex", alignItems: "center", gap: 16}}><Check size={46}/><div><Eyebrow tone="green">ALL FOUR OPTIONS ARE READY</Eyebrow><div style={{fontSize: 19, color: COLORS.body, marginTop: 8}}>Each route gives the seller a valid way forward.</div></div></div>
        <div style={{fontFamily: MONO, fontSize: 38, fontWeight: 700, color: COLORS.green, letterSpacing: "-.045em"}}>NONE REQUIRE YOU TO HAVE THE MONEY</div>
      </Panel>
    </div>
  </ProductShell>;
};
