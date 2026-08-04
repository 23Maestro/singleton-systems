import {useCurrentFrame, useVideoConfig} from "remotion";
import {FileText, ScanSearch, UserRoundSearch} from "lucide-react";
import {Check, clamp, COLORS, enter, Eyebrow, MetaIcon, MONO, Panel, ProductShell, XMark} from "./ProductStorySystem";

const applicants = ["Application 18", "Application 19", "Application 20", "Application 21"];

export const PixelConditioningEngine = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scan = clamp(frame, [255, 390], [0, 1]);
  const profile = Math.round(clamp(frame, [180, 330], [18, 94]));
  return (
    <ProductShell path="pixel conditioning" status={frame < 250 ? "Learning from seller applications" : "Finding similar sellers"} footerLeft="PIXEL CONDITIONING" footerRight="Completed applications improve the next search">
      <div style={{height: "100%", display: "grid", gridTemplateColumns: "1.08fr .92fr"}}>
        <section style={{padding: "34px 34px 28px", borderRight: `1px solid ${COLORS.line}`}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22}}>
            <div><Eyebrow>APPLICATION PROCESSOR</Eyebrow><div style={{fontSize: 30, fontWeight: 760, marginTop: 8, letterSpacing: "-.025em"}}>One conversion teaches the system.</div></div>
            <div style={{width: 62, height: 62, display: "grid", placeItems: "center", borderRadius: 17, border: "1px solid rgba(22,138,255,.35)", background: "rgba(22,138,255,.09)"}}><MetaIcon size={42}/></div>
          </div>
          <Panel style={{overflow: "hidden"}}>
            <div style={{display: "grid", gridTemplateColumns: "1.2fr .7fr 1fr", height: 46, alignItems: "center", padding: "0 18px", fontFamily: MONO, fontSize: 16, color: COLORS.body, borderBottom: `1px solid ${COLORS.line}`}}><span>APPLICATION</span><span>PROGRESS</span><span>RESULT</span></div>
            {applicants.map((id, index) => {
              const row = enter(frame, fps, 18 + index * 24);
              const resolved = clamp(frame, [70 + index * 35, 84 + index * 35], [0, 1]);
              const success = index === 1 || index === 3;
              return <div key={id} style={{height: 76, display: "grid", gridTemplateColumns: "1.2fr .7fr 1fr", alignItems: "center", padding: "0 18px", fontFamily: MONO, borderBottom: index === applicants.length - 1 ? "none" : `1px solid ${COLORS.line}`, opacity: row, transform: `translateX(${clamp(row, [0, 1], [-22, 0])}px)`}}>
                <span style={{fontSize: 17, display: "flex", alignItems: "center", gap: 10}}><FileText size={20} strokeWidth={1.8} color={COLORS.body}/>{id}</span>
                <span style={{color: COLORS.body, fontSize: 16}}>{success ? "9 of 9" : `${index + 3} of 9`}</span>
                <span style={{display: "flex", alignItems: "center", gap: 10, opacity: resolved, color: success ? COLORS.green : COLORS.red, fontWeight: 700, fontSize: 16}}>{success ? <Check/> : <XMark/>}{success ? "MORE LIKE THIS" : "NOT THIS ONE"}</span>
              </div>;
            })}
          </Panel>
          <div style={{marginTop: 20, display: "grid", gridTemplateColumns: "1fr 72px 1fr", alignItems: "center"}}>
            <Panel style={{padding: "18px 20px", borderColor: "rgba(224,31,38,.30)"}}><div style={{fontWeight: 800, color: COLORS.red}}>UNQUALIFIED</div><div style={{fontFamily: MONO, marginTop: 7, fontSize: 16, color: COLORS.body}}>Not this one</div></Panel>
            <div style={{height: 1, background: COLORS.lineStrong}}/>
            <Panel style={{padding: "18px 20px", borderColor: "rgba(34,197,94,.30)"}}><div style={{fontWeight: 800, color: COLORS.green}}>COMPLETED</div><div style={{fontFamily: MONO, marginTop: 7, fontSize: 16, color: COLORS.body}}>More like this</div></Panel>
          </div>
        </section>
        <section style={{padding: "34px 36px 28px", display: "flex", flexDirection: "column"}}>
          <Eyebrow tone="dim">MOTIVATED-SELLER PROFILE</Eyebrow>
          <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 12}}><span style={{fontFamily: MONO, fontSize: 78, lineHeight: 1, fontWeight: 700, letterSpacing: "-.07em"}}>{profile}%</span><span style={{fontFamily: MONO, color: COLORS.dim}}>CONFIDENCE</span></div>
          <div style={{height: 8, marginTop: 17, background: "rgba(255,255,255,.07)", borderRadius: 99, overflow: "hidden"}}><div style={{width: `${profile}%`, height: "100%", background: `linear-gradient(90deg, ${COLORS.red}, #FFFFFF)`, boxShadow: "0 0 18px rgba(224,31,38,.45)"}}/></div>
          <Panel style={{position: "relative", marginTop: 26, flex: 1, overflow: "hidden", display: "grid", placeItems: "center"}}>
            {[0,1,2,3].map((ring) => <div key={ring} style={{position: "absolute", width: 130 + ring * 82, height: 130 + ring * 82, borderRadius: "50%", border: `1px solid rgba(255,255,255,${.18 - ring * .025})`, transform: `scale(${1 + scan * ring * .035})`, opacity: clamp(frame, [145 + ring * 18, 175 + ring * 18], [0,1])}}/>)}
            <div style={{position: "absolute", width: 110, height: 110, borderRadius: "50%", display: "grid", placeItems: "center", background: "radial-gradient(circle, rgba(224,31,38,.35), rgba(224,31,38,.05) 64%, transparent 66%)", boxShadow: "0 0 46px rgba(224,31,38,.23)"}}><UserRoundSearch size={46} strokeWidth={1.7} color={COLORS.white}/></div>
            {["MOTIVATION", "TIMELINE", "EQUITY", "MARKET"].map((label, i) => {const a = i * Math.PI / 2 + scan * .55; const radius = 170 + i * 10; return <div key={label} style={{position: "absolute", left: `calc(50% + ${Math.cos(a) * radius}px)`, top: `calc(50% + ${Math.sin(a) * radius}px)`, transform: "translate(-50%,-50%)", padding: "8px 11px", borderRadius: 9, border: `1px solid ${COLORS.line}`, background: COLORS.panelRaised, fontFamily: MONO, fontSize: 16, color: COLORS.body}}>{label}</div>;})}
            <div style={{position: "absolute", left: 24, right: 24, bottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontSize: 16}}><span style={{color: scan > .15 ? COLORS.green : COLORS.body, display: "flex", alignItems: "center", gap: 9}}><ScanSearch size={21} strokeWidth={1.8}/>{scan > .15 ? "SEARCH ACTIVE" : "PROFILE IN PROGRESS"}</span><span style={{color: COLORS.body}}>{scan > .15 ? "Finding similar sellers…" : "Learning week over week"}</span></div>
          </Panel>
        </section>
      </div>
    </ProductShell>
  );
};
