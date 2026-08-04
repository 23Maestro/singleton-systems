import {useCurrentFrame, useVideoConfig} from "remotion";
import {BadgeDollarSign, FileCheck2, Megaphone, Percent, UsersRound} from "lucide-react";
import {Check, clamp, COLORS, enter, Eyebrow, MetaIcon, MONO, Panel, ProductShell} from "./ProductStorySystem";

const stages = [
  {value: "$90 / DAY", label: "CAMPAIGN INPUT", delay: 15, tone: "red", Icon: Megaphone},
  {value: "9", label: "QUALIFIED SELLERS", delay: 74, tone: "white", Icon: UsersRound},
  {value: "5", label: "SIGNED LISTINGS", delay: 133, tone: "white", Icon: FileCheck2},
  {value: "$228", label: "PER SIGNED LISTING", delay: 192, tone: "green", Icon: BadgeDollarSign},
] as const;

export const CampaignEconomics = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const flow = clamp(frame, [40, 230], [0, 1]);
  return <ProductShell path="campaign economics" status={frame < 220 ? "Calculating cost per signed listing" : "Campaign results ready"} footerLeft="CAMPAIGN ECONOMICS" footerRight="Cost per signed listing is the number that matters">
    <div style={{height: "100%", padding: "30px 34px 28px", display: "grid", gridTemplateRows: "230px 1fr", gap: 24}}>
      <Panel style={{padding: "24px 26px", position: "relative"}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}><Eyebrow>CAMPAIGN → QUALIFIED SELLERS → SIGNED LISTINGS</Eyebrow><div style={{display: "flex", gap: 10, alignItems: "center", fontSize: 16, fontWeight: 700, color: COLORS.body}}><MetaIcon size={34}/><span>Meta campaign</span></div></div>
        <div style={{display: "grid", gridTemplateColumns: "1fr 90px 1fr 90px 1fr 90px 1fr", alignItems: "center", marginTop: 25}}>
          {stages.flatMap((stage,index) => {
            const item = enter(frame,fps,stage.delay); const tone = stage.tone === "green" ? COLORS.green : stage.tone === "red" ? COLORS.red : COLORS.white;
            const Icon = stage.Icon;
            const card = <div key={stage.label} style={{opacity: item, transform: `translateY(${clamp(item,[0,1],[16,0])}px)`}}><div style={{display: "flex", alignItems: "center", gap: 12}}><Icon size={30} strokeWidth={1.8} color={tone}/><div style={{fontFamily: MONO, color: tone, fontSize: index === 0 ? 42 : 54, lineHeight: 1, fontWeight: 700, letterSpacing: "-.055em"}}>{stage.value}</div></div><div style={{fontSize: 17, fontWeight: 750, marginTop: 12, color: index === 3 ? COLORS.green : COLORS.body}}>{stage.label}</div></div>;
            if(index === stages.length-1) return [card];
            const start = index / 3; const local = clamp(flow,[start,start+.34],[0,1]);
            return [card,<div key={`line-${index}`} style={{height: 2, background: COLORS.line, position: "relative", overflow: "visible"}}><div style={{height: "100%", width: `${local*100}%`, background: index === 2 ? COLORS.green : COLORS.red}}/><div style={{position: "absolute", right: 2, top: -4, width: 9, height: 9, borderTop: `2px solid ${index===2?COLORS.green:COLORS.red}`, borderRight: `2px solid ${index===2?COLORS.green:COLORS.red}`, transform: "rotate(45deg)"}}/></div>];
          })}
        </div>
      </Panel>
      <div style={{display: "grid", gridTemplateColumns: "1.25fr .75fr", gap: 24}}>
        <Panel style={{overflow: "hidden"}}>
          <div style={{height: 48, padding: "0 20px", display: "grid", gridTemplateColumns: "140px 1fr 190px 150px", alignItems: "center", borderBottom: `1px solid ${COLORS.line}`, fontSize: 16, fontWeight: 700, color: COLORS.body}}><span>LISTING</span><span>SELLER</span><span>AGREEMENT</span><span>COMMISSION</span></div>
          {[1,2,3,4,5].map((n,index) => {const row = enter(frame,fps,205+index*22); const premium = index < 4 && frame > 285 + index*16; return <div key={n} style={{height: 72, padding: "0 20px", display: "grid", gridTemplateColumns: "140px 1fr 190px 150px", alignItems: "center", borderBottom: n===5?"none":`1px solid ${COLORS.line}`, fontSize: 17, opacity: row, transform: `translateX(${clamp(row,[0,1],[-20,0])}px)`}}><span style={{color: COLORS.body}}>Listing {n}</span><span>Qualified seller {40+n}</span><span style={{display: "flex", alignItems: "center", gap: 9, color: COLORS.green, fontWeight: 750}}><Check size={25}/>Signed</span><span style={{fontSize: premium?25:18, fontWeight: 750, color: premium?COLORS.green:COLORS.body}}>{premium?"4%":"Standard"}</span></div>;})}
        </Panel>
        <Panel style={{padding: "27px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(145deg, rgba(34,197,94,.10), rgba(0,0,0,.28))", borderColor: "rgba(34,197,94,.34)", opacity: enter(frame,fps,305)}}>
          <div><div style={{display: "flex", alignItems: "center", gap: 12}}><Percent size={30} strokeWidth={1.9} color={COLORS.green}/><Eyebrow tone="green">PREMIUM POSITIONING</Eyebrow></div><div style={{fontFamily: MONO, fontSize: 94, fontWeight: 700, lineHeight: 1, marginTop: 22, color: COLORS.green, letterSpacing: "-.075em"}}>4 OF 5</div><div style={{fontSize: 25, fontWeight: 760, marginTop: 12}}>LISTINGS AT 4%</div></div>
          <div style={{color: COLORS.body, fontSize: 20, lineHeight: 1.5, fontWeight: 600}}>Five signed listings<br/>Four premium-commission outcomes</div>
        </Panel>
      </div>
    </div>
  </ProductShell>;
};
