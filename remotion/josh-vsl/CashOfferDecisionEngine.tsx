import {useCurrentFrame, useVideoConfig} from "remotion";
import {Banknote, House, ListChecks} from "lucide-react";
import {Check, clamp, COLORS, enter, Eyebrow, MONO, Panel, ProductShell} from "./ProductStorySystem";

export const CashOfferDecisionEngine = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const summaryIn = enter(frame, fps, 10);
  const cashIn = enter(frame, fps, 76);
  const listingIn = enter(frame, fps, 118);
  const gapIn = enter(frame, fps, 185);
  const route = clamp(frame, [245, 330], [0, 1]);
  const result = enter(frame, fps, 330);

  return <ProductShell path="offer decision" status={frame < 245 ? "Comparing seller options" : "Recommending the best outcome"} footerLeft="CASH OFFER QUESTION" footerRight="The cash offer opens the door · the math converts">
    <div style={{height: "100%", padding: "30px 34px 28px", display: "grid", gridTemplateRows: "112px 1fr 112px", gap: 22}}>
      <Panel style={{padding: "20px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", opacity: summaryIn, transform: `translateY(${clamp(summaryIn, [0, 1], [-18, 0])}px)`}}>
        <div style={{display: "flex", alignItems: "center", gap: 16}}><div style={{width: 54, height: 54, borderRadius: 15, display: "grid", placeItems: "center", background: "rgba(224,31,38,.09)", border: "1px solid rgba(224,31,38,.28)"}}><House size={30} strokeWidth={1.8} color={COLORS.red}/></div><div><Eyebrow>SELLER PROPERTY</Eyebrow><div style={{fontSize: 23, fontWeight: 760, marginTop: 10}}>Motivated seller requesting a cash offer</div></div></div>
        <div style={{display: "flex", alignItems: "center", gap: 42}}>
          <div><div style={{fontSize: 17, color: COLORS.body}}>Market value</div><div style={{fontFamily: MONO, fontSize: 24, fontWeight: 700, marginTop: 7}}>$400,000</div></div>
          <div><div style={{fontSize: 17, color: COLORS.body}}>Request</div><div style={{fontFamily: MONO, fontSize: 23, fontWeight: 700, marginTop: 7}}>Cash offer</div></div>
          <div style={{padding: "13px 18px", borderRadius: 13, border: "1px solid rgba(224,31,38,.32)", background: "rgba(224,31,38,.08)", color: COLORS.red, fontWeight: 800}}>COMPARE BOTH OPTIONS</div>
        </div>
      </Panel>

      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24}}>
        <Panel style={{padding: "28px 30px", display: "flex", flexDirection: "column", borderColor: "rgba(224,31,38,.34)", background: "linear-gradient(145deg, rgba(224,31,38,.10), rgba(0,0,0,.28))", opacity: cashIn, transform: `translateX(${clamp(cashIn, [0, 1], [-26, 0])}px)`}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}><Eyebrow>OPTION 01</Eyebrow><span style={{fontFamily: MONO, fontSize: 16, color: COLORS.body}}>70–75% OF MARKET</span></div>
          <div style={{fontSize: 31, fontWeight: 820, marginTop: 24, display: "flex", alignItems: "center", gap: 13}}><Banknote size={34} strokeWidth={1.8} color={COLORS.red}/>CASH OFFER</div>
          <div style={{fontFamily: MONO, fontSize: 72, lineHeight: 1, fontWeight: 700, marginTop: 22, letterSpacing: "-.06em"}}>$280K–$300K</div>
          <div style={{fontSize: 20, color: COLORS.body, marginTop: 18}}>Speed and certainty at a discounted price.</div>
          <div style={{height: 9, borderRadius: 99, marginTop: 28, background: "rgba(255,255,255,.12)", overflow: "hidden"}}><div style={{width: "73%", height: "100%", background: COLORS.red}}/></div>
          <div style={{marginTop: "auto", padding: "18px 20px", borderRadius: 15, border: "1px solid rgba(224,31,38,.34)", background: "rgba(224,31,38,.08)", display: "flex", alignItems: "center", justifyContent: "space-between", opacity: gapIn}}><span style={{fontSize: 18, fontWeight: 700, color: COLORS.body}}>Difference from full market</span><span style={{fontFamily: MONO, fontSize: 34, fontWeight: 700, color: COLORS.red}}>$100K+ GAP</span></div>
        </Panel>

        <Panel style={{padding: "28px 30px", display: "flex", flexDirection: "column", borderColor: route > .7 ? "rgba(34,197,94,.48)" : COLORS.lineStrong, background: route > .7 ? "linear-gradient(145deg, rgba(34,197,94,.11), rgba(0,0,0,.28))" : "rgba(0,0,0,.28)", opacity: listingIn, transform: `translateX(${clamp(listingIn, [0, 1], [26, 0])}px)`}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}><Eyebrow tone={route > .7 ? "green" : "dim"}>OPTION 02</Eyebrow><span style={{fontFamily: MONO, fontSize: 16, color: COLORS.body}}>FULL MARKET VALUE</span></div>
          <div style={{fontSize: 31, fontWeight: 820, marginTop: 24, display: "flex", alignItems: "center", gap: 13}}><ListChecks size={34} strokeWidth={1.8} color={route > .7 ? COLORS.green : COLORS.white}/>TRADITIONAL LISTING</div>
          <div style={{fontFamily: MONO, fontSize: 72, lineHeight: 1, fontWeight: 700, marginTop: 22, letterSpacing: "-.06em"}}>$400K</div>
          <div style={{fontSize: 20, color: COLORS.body, marginTop: 18}}>Full value with the listing plan behind it.</div>
          <div style={{height: 9, borderRadius: 99, marginTop: 28, background: "rgba(255,255,255,.12)", overflow: "hidden"}}><div style={{width: "100%", height: "100%", background: route > .7 ? COLORS.green : COLORS.white}}/></div>
          <div style={{marginTop: "auto", padding: "18px 20px", borderRadius: 15, border: `1px solid ${route > .7 ? "rgba(34,197,94,.38)" : COLORS.lineStrong}`, background: route > .7 ? "rgba(34,197,94,.08)" : "rgba(255,255,255,.035)", display: "flex", alignItems: "center", justifyContent: "space-between"}}><span style={{fontSize: 18, fontWeight: 700, color: COLORS.body}}>Seller’s strongest financial outcome</span><span style={{opacity: route}}><Check size={36}/></span></div>
        </Panel>
      </div>

      <Panel style={{padding: "18px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", borderColor: "rgba(34,197,94,.38)", background: "rgba(34,197,94,.075)", opacity: result, transform: `translateY(${clamp(result, [0, 1], [18, 0])}px)`}}>
        <div style={{display: "flex", alignItems: "center", gap: 15}}><Check size={44}/><div><Eyebrow tone="green">SELLER ROUTED TO LISTING</Eyebrow><div style={{fontSize: 19, color: COLORS.body, marginTop: 8}}>Both options made the decision clear.</div></div></div>
        <div style={{display: "flex", alignItems: "baseline", gap: 16}}><span style={{fontFamily: MONO, fontSize: 43, fontWeight: 700, color: COLORS.green}}>9 OUT OF 10</span><span style={{fontSize: 22, fontWeight: 820}}>CHOOSE TO LIST</span></div>
      </Panel>
    </div>
  </ProductShell>;
};
