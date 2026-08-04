import {ContactRound, ListChecks, Megaphone, MessageSquareText, MonitorPlay, PanelsTopLeft, PhoneCall, Upload} from "lucide-react";
import {OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {Check, clamp, COLORS, enter, Eyebrow, MONO, Panel, ProductShell} from "./ProductStorySystem";

const nodes = [
  {label: "AD ACCOUNT", detail: "Campaign in your account", at: 45, Icon: Megaphone},
  {label: "LANDING PAGE", detail: "Seller-focused page", at: 82, Icon: PanelsTopLeft},
  {label: "9-QUESTION APPLICATION", detail: "Qualification questions", at: 119, Icon: ListChecks},
  {label: "PHONE VALIDATION", detail: "Confirmed contact details", at: 156, Icon: PhoneCall},
  {label: "CRM", detail: "Follow-up ready", at: 193, Icon: ContactRound},
  {label: "SLACK", detail: "Lead notifications ready", at: 230, Icon: MessageSquareText},
] as const;

export const SystemDeployment = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const upload = enter(frame,fps,8);
  const claim = enter(frame,fps,398);
  const progress = clamp(frame,[38,270],[0,1]);
  return <ProductShell path="system build" status={frame < 398 ? "Building inside your accounts" : "Ready to review together"} footerLeft="48-HOUR SYSTEM BUILD" footerRight="Built first · reviewed together · then live">
    <div style={{height: "100%", padding: "28px 32px", display: "grid", gridTemplateColumns: ".52fr 1.48fr", gap: 24}}>
      <div style={{display: "flex", flexDirection: "column", minHeight: 0}}>
        <Panel style={{padding: "18px 20px", display: "flex", gap: 14, alignItems: "center", borderColor: "rgba(224,31,38,.32)", opacity: upload, transform: `translateY(${clamp(upload,[0,1],[-14,0])}px)`}}><div style={{width: 52, height: 52, display: "grid", placeItems: "center", borderRadius: 14, background: "rgba(224,31,38,.09)"}}><Upload size={31} strokeWidth={1.9} color={COLORS.red}/></div><div><Eyebrow>VIDEOS RECEIVED</Eyebrow><div style={{fontSize: 22, fontWeight: 800, marginTop: 7}}>SELLER VIDEOS</div></div></Panel>
        <div style={{position: "relative", flex: 1, marginTop: 16, paddingLeft: 23}}>
          <div style={{position: "absolute", left: 27, top: 22, bottom: 22, width: 2, background: COLORS.line}}><div style={{height: `${progress*100}%`, width: "100%", background: `linear-gradient(${COLORS.red}, ${COLORS.green})`, boxShadow: "0 0 14px rgba(224,31,38,.35)"}}/></div>
          <div style={{height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between"}}>{nodes.map((node,index) => {const item=enter(frame,fps,node.at); const done=frame>node.at+30; const Icon=node.Icon; return <div key={node.label} style={{position:"relative", marginLeft: 28, height: 62, padding: "0 16px", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${done?"rgba(34,197,94,.30)":COLORS.lineStrong}`, background: done?"rgba(34,197,94,.055)":"rgba(0,0,0,.25)", opacity:item, transform:`translateX(${clamp(item,[0,1],[16,0])}px)`}}><span style={{position:"absolute", left:-34, width:12, height:12, borderRadius:99, background:done?COLORS.green:COLORS.red, boxShadow:`0 0 12px ${done?"rgba(34,197,94,.5)":"rgba(224,31,38,.45)"}`}}/><div style={{display:"flex",alignItems:"center",gap:12}}><Icon size={25} strokeWidth={1.8} color={done?COLORS.green:COLORS.white}/><div><div style={{fontSize:16,fontWeight:800}}>{node.label}</div><div style={{fontSize:16,color:COLORS.body,marginTop:4}}>{node.detail}</div></div></div><span style={{opacity:done?1:0}}><Check size={25}/></span></div>;})}</div>
        </div>
      </div>
      <Panel style={{position: "relative", overflow: "hidden", background: COLORS.panelRaised}}>
        <div style={{position:"absolute",left:0,right:0,top:0,height:64,padding:"0 22px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${COLORS.lineStrong}`,background:"rgba(255,255,255,.025)"}}><div style={{display:"flex",alignItems:"center",gap:12}}><MonitorPlay size={27} strokeWidth={1.8} color={COLORS.white}/><span style={{fontSize:18,fontWeight:800}}>Live Product Preview</span></div><span style={{fontSize:16,color:COLORS.body}}>{frame < 135 ? "Agent Accelerator · Skool" : "CloserOS · Integrations"}</span></div>
          <div style={{position: "absolute", left:18, right:18, top:82, bottom:68, display: "grid", placeItems: "center", overflow:"hidden", borderRadius:16, border:`1px solid ${COLORS.lineStrong}`, background:"#000"}}>
          <OffthreadVideo src={staticFile("remotion-assets/v3_CloserOS_Slack_conformed.mov")} volume={0} startFrom={0} style={{width: "100%", height: "100%", objectFit: "contain", transform: "scale(1.14)"}}/>
        </div>
        <div style={{position: "absolute", left: 22, right: 22, bottom: 0, height: 58, display: "flex", justifyContent: "space-between", alignItems: "center"}}><div style={{display:"flex",gap:10,alignItems:"center"}}><span style={{width:8,height:8,borderRadius:99,background:COLORS.green,boxShadow:"0 0 12px rgba(34,197,94,.6)"}}/><span style={{fontSize:16,color:COLORS.body}}>Genuine product recording · muted</span></div><span style={{fontSize:16,color:COLORS.body}}>Conformed from 18 fps to 29.97 fps</span></div>
        <div style={{position: "absolute", left:18,right:18,top:82,bottom:68,borderRadius:16,overflow:"hidden", display: "grid", placeItems: "end center", paddingBottom: 34, pointerEvents: "none", background: claim > .1 ? `linear-gradient(transparent 42%, rgba(7,8,9,${claim*.90}) 82%)` : "transparent"}}>
          <div style={{opacity: claim, transform:`translateY(${clamp(claim,[0,1],[18,0])}px)`, padding:"18px 28px", borderRadius:18, background:"rgba(34,197,94,.10)", border:"1px solid rgba(34,197,94,.38)", boxShadow:"0 20px 60px rgba(0,0,0,.55)", fontFamily:MONO,fontSize:35,fontWeight:700,color:COLORS.green}}>EVERYTHING BUILT IN ABOUT 48 HOURS</div>
        </div>
      </Panel>
    </div>
  </ProductShell>;
};
