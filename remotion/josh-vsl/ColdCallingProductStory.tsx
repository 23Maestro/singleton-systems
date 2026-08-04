import {
  BadgeCheck,
  Clock3,
  PhoneCall,
  PhoneOff,
  Target,
  Voicemail,
} from "lucide-react";
import {spring, useCurrentFrame, useVideoConfig} from "remotion";
import {
  COLORS,
  Eyebrow,
  MONO,
  Panel,
  ProductShell,
  clamp,
  enter,
} from "./ProductStorySystem";

const callRows = [
  {time: "8:04 AM", outcome: "No answer", Icon: PhoneOff},
  {time: "8:08 AM", outcome: "Voicemail left", Icon: Voicemail},
  {time: "8:12 AM", outcome: "Follow-up needed", Icon: Clock3},
  {time: "8:19 AM", outcome: "No answer", Icon: PhoneOff},
  {time: "8:25 AM", outcome: "Voicemail left", Icon: Voicemail},
] as const;

export const ColdCallingProductStory = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const hours = Math.round(clamp(frame, [28, 132], [0, 67]));
  const progress = clamp(frame, [28, 132], [0, 1]);
  const route = clamp(frame, [118, 167], [0, 1]);
  const outcomeIn = spring({
    frame: frame - 145,
    fps,
    config: {damping: 16, stiffness: 130, mass: 0.72},
    durationInFrames: 38,
  });
  const pulse = 1 + Math.sin(frame / 9) * 0.035;

  return (
    <ProductShell
      path="Cold Calling"
      status={frame < 145 ? "Working through call activity" : "Listing secured"}
      footerLeft="COLD CALLING"
      footerRight="67 hours of dialing produced one listing"
    >
      <div
        style={{
          height: "100%",
          padding: "30px 34px",
          display: "grid",
          gridTemplateColumns: "660px 1fr",
          gap: 28,
          boxSizing: "border-box",
        }}
      >
        <Panel style={{padding: 24, position: "relative", overflow: "hidden"}}>
          <div
            style={{
              position: "absolute",
              width: 300,
              height: 300,
              left: -120,
              top: -120,
              borderRadius: "50%",
              background: "rgba(224,31,38,.10)",
              filter: "blur(48px)",
              transform: `scale(${pulse})`,
            }}
          />
          <div style={{position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <div>
              <Eyebrow>CALL ACTIVITY</Eyebrow>
              <div style={{marginTop: 10, fontSize: 29, fontWeight: 750, letterSpacing: "-.025em"}}>
                Repeated outreach, one call at a time
              </div>
            </div>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 17,
                display: "grid",
                placeItems: "center",
                color: COLORS.red,
                background: "rgba(224,31,38,.11)",
                border: "1px solid rgba(224,31,38,.38)",
              }}
            >
              <PhoneCall size={30} strokeWidth={2.1}/>
            </div>
          </div>

          <div style={{position: "relative", marginTop: 22, border: `1px solid ${COLORS.line}`, borderRadius: 16, overflow: "hidden", background: "rgba(0,0,0,.24)"}}>
            <div style={{height: 48, padding: "0 18px", display: "grid", gridTemplateColumns: "120px 1fr 185px", alignItems: "center", borderBottom: `1px solid ${COLORS.line}`, color: COLORS.dim, fontFamily: MONO, fontSize: 16, fontWeight: 600}}>
              <span>Time</span><span>Activity</span><span>Result</span>
            </div>
            {callRows.map(({time, outcome, Icon}, index) => {
              const rowIn = enter(frame, fps, 20 + index * 13);
              return (
                <div
                  key={`${time}-${outcome}`}
                  style={{
                    height: 66,
                    padding: "0 18px",
                    display: "grid",
                    gridTemplateColumns: "120px 1fr 185px",
                    alignItems: "center",
                    borderBottom: index === callRows.length - 1 ? "none" : `1px solid ${COLORS.line}`,
                    opacity: rowIn,
                    transform: `translateX(${clamp(rowIn, [0, 1], [-22, 0])}px)`,
                    fontSize: 18,
                  }}
                >
                  <span style={{fontFamily: MONO, color: COLORS.body}}>{time}</span>
                  <span style={{display: "flex", alignItems: "center", gap: 11, fontWeight: 650}}>
                    <span style={{width: 9, height: 9, borderRadius: 20, background: COLORS.red, boxShadow: "0 0 12px rgba(224,31,38,.48)"}}/>
                    Outbound call
                  </span>
                  <span style={{display: "flex", alignItems: "center", gap: 9, color: COLORS.body}}>
                    <Icon size={19} color={COLORS.dim} strokeWidth={2}/>{outcome}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{position: "relative", marginTop: 20, display: "flex", alignItems: "center", gap: 12, color: COLORS.body, fontSize: 18}}>
            <Clock3 size={21} color={COLORS.red}/>
            Activity continues until the right seller answers.
          </div>
        </Panel>

        <div style={{display: "grid", gridTemplateRows: "290px 1fr", gap: 24}}>
          <Panel style={{padding: "28px 30px", position: "relative", overflow: "hidden"}}>
            <div style={{position: "absolute", inset: 0, background: "radial-gradient(circle at 82% 15%, rgba(224,31,38,.17), transparent 39%)"}}/>
            <div style={{position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
              <div>
                <Eyebrow tone="dim">TIME INVESTED</Eyebrow>
                <div style={{marginTop: 12, display: "flex", alignItems: "baseline", gap: 16}}>
                  <span style={{fontFamily: MONO, fontSize: 112, lineHeight: .9, fontWeight: 750, letterSpacing: "-.075em"}}>
                    {hours}
                  </span>
                  <span style={{fontSize: 30, fontWeight: 700, color: COLORS.body}}>hours</span>
                </div>
              </div>
              <div style={{width: 58, height: 58, borderRadius: 18, display: "grid", placeItems: "center", color: COLORS.red, background: "rgba(224,31,38,.11)", border: "1px solid rgba(224,31,38,.34)"}}>
                <Clock3 size={31} strokeWidth={2}/>
              </div>
            </div>
            <div style={{position: "relative", marginTop: 27, height: 14, borderRadius: 30, overflow: "hidden", background: "rgba(255,255,255,.09)", border: `1px solid ${COLORS.line}`}}>
              <div style={{width: `${progress * 100}%`, height: "100%", borderRadius: 30, background: COLORS.red, boxShadow: "0 0 24px rgba(224,31,38,.55)"}}/>
            </div>
            <div style={{position: "relative", marginTop: 13, display: "flex", justifyContent: "space-between", color: COLORS.body, fontFamily: MONO, fontSize: 17}}>
              <span>First call</span><span>67 hours accumulated</span>
            </div>
          </Panel>

          <Panel style={{position: "relative", overflow: "hidden", padding: "25px 28px"}}>
            <div style={{position: "absolute", right: -70, bottom: -115, width: 390, height: 390, borderRadius: "50%", background: "rgba(34,197,94,.10)", filter: "blur(52px)", transform: `scale(${pulse})`}}/>
            <div style={{position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between"}}>
              <Eyebrow>OBJECTIVE PATH</Eyebrow>
              <span style={{fontFamily: MONO, fontSize: 16, color: COLORS.body}}>EFFORT → OUTCOME</span>
            </div>

            <div style={{position: "relative", height: 214, marginTop: 18, display: "grid", gridTemplateColumns: "230px 1fr 270px", alignItems: "center", gap: 18}}>
              <div style={{padding: "22px 20px", borderRadius: 20, border: "1px solid rgba(224,31,38,.38)", background: "rgba(224,31,38,.10)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.05)"}}>
                <PhoneCall size={31} color={COLORS.red} strokeWidth={2.1}/>
                <div style={{marginTop: 14, fontSize: 25, fontWeight: 780}}>Cold calling</div>
                <div style={{marginTop: 7, fontSize: 17, color: COLORS.body}}>Consistent seller outreach</div>
              </div>

              <div style={{position: "relative", height: 104}}>
                <svg width="100%" height="104" viewBox="0 0 320 104" preserveAspectRatio="none" style={{overflow: "visible"}}>
                  <path d="M4 52 C88 52 88 20 160 20 C232 20 232 52 316 52" fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="3"/>
                  <path d="M4 52 C88 52 88 20 160 20 C232 20 232 52 316 52" fill="none" stroke={COLORS.red} strokeWidth="4" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - route}/>
                  <circle cx={4 + 312 * route} cy={52 - Math.sin(route * Math.PI) * 32} r="7" fill={route > .76 ? COLORS.green : COLORS.red} style={{filter: `drop-shadow(0 0 8px ${route > .76 ? COLORS.green : COLORS.red})`}}/>
                </svg>
                <div style={{position: "absolute", left: "50%", top: 55, transform: "translateX(-50%)", whiteSpace: "nowrap", padding: "7px 12px", borderRadius: 20, border: `1px solid ${COLORS.lineStrong}`, background: COLORS.panelRaised, fontFamily: MONO, fontSize: 16, color: COLORS.body}}>
                  67 hours of effort
                </div>
              </div>

              <div style={{position: "relative", padding: "24px 22px", borderRadius: 22, border: "1px solid rgba(34,197,94,.48)", background: "rgba(34,197,94,.11)", boxShadow: "0 0 44px rgba(34,197,94,.12), inset 0 1px 0 rgba(255,255,255,.07)", opacity: outcomeIn, transform: `translateX(${clamp(outcomeIn, [0, 1], [28, 0])}px) scale(${clamp(outcomeIn, [0, 1], [.91, 1])})`}}>
                <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                  <Target size={34} color={COLORS.green} strokeWidth={2.1}/>
                  <BadgeCheck size={28} color={COLORS.green} strokeWidth={2.2}/>
                </div>
                <div style={{marginTop: 15, fontSize: 37, lineHeight: 1, fontWeight: 850, letterSpacing: "-.035em"}}>1 signed listing</div>
                <div style={{marginTop: 9, fontSize: 18, color: COLORS.green, fontWeight: 700}}>Successful outcome</div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </ProductShell>
  );
};
