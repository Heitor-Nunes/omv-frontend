import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────
// API
// ─────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const tok = () => localStorage.getItem("omv_token");

async function req(path, opts = {}) {
  const t = tok();
  const r = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { "Content-Type":"application/json", ...(t?{Authorization:`Bearer ${t}`}:{}), ...(opts.headers||{}) },
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.message || "Erro na requisição");
  return d;
}

const api = {
  register:     b       => req("/auth/register",              { method:"POST", body:JSON.stringify(b) }),
  login:        (e,p)   => req("/auth/login",                 { method:"POST", body:JSON.stringify({email:e,password:p}) }),
  me:           ()      => req("/auth/me"),
  spots:        ()      => req("/spots"),
  myRes:        ()      => req("/reservations/mine"),
  myHistory:    ()      => req("/reservations/history"),
  resCfg:       ()      => req("/reservations/config"),
  createRes:    (s,t,d,p,m) => req("/reservations",          { method:"POST", body:JSON.stringify({spotId:s,startTimeStr:t,startDate:d,placa:p,modelo:m}) }),
  payRes:       id      => req(`/reservations/${id}/pay`,     { method:"POST" }),
  cancelRes:    id      => req(`/reservations/${id}/cancel`,  { method:"POST" }),
  adminUsers:   ()      => req("/admin/users"),
  adminLogs:    ()      => req("/admin/logs"),
  adminRes:     ()      => req("/admin/reservations"),
  adminDash:    ()      => req("/admin/dashboard"),
  toggleUser:   id      => req(`/admin/users/${id}/toggle`,   { method:"PATCH" }),
  deleteUser:   id      => req(`/admin/users/${id}`,          { method:"DELETE" }),
  cancelAdmRes: id      => req(`/admin/reservations/${id}/cancel`, { method:"POST" }),
  clearLogs:    ()      => req("/admin/logs",                 { method:"DELETE" }),
  sensor:       (n,o)   => req("/spots/sensor",               { method:"POST", body:JSON.stringify({spotNumber:n,occupied:o}) }),
  resetSpots:   o       => req("/spots/reset",                { method:"POST", body:JSON.stringify({occupied:o}) }),
  health:       ()      => fetch(`${BASE}/health`).then(r=>r.json()).catch(()=>({status:"error"})),
};

// ─────────────────────────────────────────
// DESIGN SYSTEM
// ─────────────────────────────────────────
const GF = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Syne:wght@600;700;800&display=swap');`;

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
#root{width:100%;min-height:100vh}
body{background:#0F1117}
html,body,#root{margin:0!important;padding:0!important}

@keyframes spin    {to{transform:rotate(360deg)}}
@keyframes up      {from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes in      {from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
@keyframes pulse   {0%,100%{opacity:1}50%{opacity:.25}}
@keyframes blink   {0%,100%{opacity:1}50%{opacity:.1}}
@keyframes shimmer {0%{background-position:-200% 0}100%{background-position:200% 0}}

.u{animation:up .2s ease both}
.i{animation:in .22s ease both}

input,button{font-family:inherit}
input:focus{outline:none;border-color:#2563EB!important}

::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-thumb{background:#2A2D35;border-radius:4px}

/* NAV MOBILE — sempre visível em telas pequenas */
.mob-nav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:300;
  background:#1A1D27;border-top:1px solid #2A2D35;
  box-shadow:0 -8px 32px rgba(0,0,0,.5)}

@media(max-width:768px){
  .mob-nav        {display:flex!important}
  .desk-hdr       {display:none!important}
  .page-wrap      {padding:16px 14px 78px!important}
  .page-title     {font-size:18px!important;margin-bottom:14px!important}
  .dash-g         {grid-template-columns:repeat(2,1fr)!important;gap:8px!important}
  .form-r         {flex-direction:column!important;gap:0!important}
  .pay-w          {width:100%!important;flex:none!important}
  .pay-lay        {flex-direction:column!important}
  .pg2            {grid-template-columns:1fr!important}
  .pstats         {grid-template-columns:repeat(2,1fr)!important}
  .spot-r         {gap:3px!important}
  .spot-c         {flex:1 1 0!important;padding:6px 3px 5px!important;min-width:0!important}
  .blk            {flex-direction:column!important;gap:4px!important}
  .via            {width:100%!important;height:10px!important;min-height:0!important}
  .via-t          {font-size:0!important;writing-mode:horizontal-tb!important}
  .mbtns          {grid-template-columns:repeat(3,1fr)!important}
  .t-big          {font-size:28px!important}
  .res-pan        {width:100%!important}
  .res-lay        {flex-direction:column!important}
  .notif-w        {right:8px!important;top:12px!important;max-width:calc(100vw - 16px)!important}
  .hero-w         {padding:40px 16px 28px!important}
  .hero-h         {font-size:24px!important;line-height:1.2!important}
  .hero-sub       {font-size:13px!important}
  .hcards         {grid-template-columns:1fr!important;gap:8px!important}
  .agrid          {grid-template-columns:1fr!important;gap:8px!important}
  .about-s        {padding:40px 16px!important}
  .lhdr           {padding:0 16px!important}
  .lftr           {padding:14px 16px!important;flex-direction:column!important;gap:5px!important;text-align:center!important}
  .atabs          {gap:4px!important;overflow-x:auto!important;padding-bottom:2px!important}
  .atab           {padding:6px 12px!important;font-size:11px!important;white-space:nowrap!important}
  .act-card       {flex-direction:column!important;gap:10px!important}
  .act-btns       {flex-direction:column!important;gap:8px!important;width:100%!important}
}
@media(max-width:420px){
  .page-title {font-size:16px!important}
  .t-big      {font-size:22px!important}
  .dash-g     {grid-template-columns:1fr 1fr!important}
  .hero-h     {font-size:20px!important}
  .pstats     {grid-template-columns:1fr 1fr!important}
}
`;

// Paleta — dark slate profissional
const C = {
  bg:     "#0F1117",
  bg2:    "#1A1D27",
  bg3:    "#21242F",
  bg4:    "#2A2D3A",
  border: "#2A2D3A",
  borderL:"#363945",
  text:   "#F1F3F9",
  textM:  "#9CA3AF",
  textL:  "#6B7280",

  blue:   "#2563EB",
  blueL:  "#1E3A5F",
  blueT:  "#EFF6FF",

  green:  "#16A34A",
  greenL: "#14532D",
  greenT: "#DCFCE7",

  red:    "#DC2626",
  redL:   "#450A0A",
  redT:   "#FEF2F2",

  amber:  "#D97706",
  amberL: "#451A03",
  amberT: "#FFFBEB",

  purple: "#7C3AED",
  purpleL:"#2E1065",
  purpleT:"#F5F3FF",

  sh:     "0 1px 3px rgba(0,0,0,.4)",
  shM:    "0 4px 24px rgba(0,0,0,.5)",
  shL:    "0 8px 40px rgba(0,0,0,.6)",
};

const SM = {
  available:    { bg:"#14532D22", bd:"#16A34A", tx:"#4ADE80", lb:"LIVRE"    },
  occupied:     { bg:"#450A0A22", bd:"#DC2626", tx:"#F87171", lb:"OCUPADA"  },
  preferential: { bg:"#451A0322", bd:"#D97706", tx:"#FCD34D", lb:"PREFER."  },
  reserved:     { bg:"#2E106522", bd:"#7C3AED", tx:"#A78BFA", lb:"RESERVADA"},
};

const F = { head:"'Syne',sans-serif", body:"'Inter',sans-serif" };
let CFG = { pricePerHour:80, reservationFee:10, toleranceMinutes:5, noShowFine:20 };

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
const fmtCPF   = v => v.replace(/\D/g,"").slice(0,11).replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2");
const fmtTel   = v => v.replace(/\D/g,"").slice(0,11).replace(/(\d{2})(\d)/,"($1) $2").replace(/(\d{5})(\d)/,"$1-$2");
const fmtPlaca = v => v.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,7);
const fmtTime  = s => `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const fmtMoney = v => `R$ ${Number(v).toFixed(2).replace(".",",")}`;
const fmtDate  = d => new Date(d).toLocaleString("pt-BR");
const todayStr = () => new Date().toISOString().split("T")[0];
const nowTime  = () => { const n=new Date(); return `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`; };

function buildStart(dateStr, timeStr) {
  const now = new Date();
  if (!dateStr||!timeStr) return now;
  const [y,mo,d] = dateStr.split("-").map(Number);
  const [h,m]    = timeStr.split(":").map(Number);
  const chosen   = new Date(y,mo-1,d,h,m,0,0);
  return chosen.getTime() <= now.getTime()+60000 ? now : chosen;
}

// ─────────────────────────────────────────
// UI ATOMS
// ─────────────────────────────────────────
const Spin = ({ sz=16, c=C.blue }) => (
  <span style={{width:sz,height:sz,border:`2px solid ${C.border}`,borderTop:`2px solid ${c}`,borderRadius:"50%",animation:"spin .6s linear infinite",display:"inline-block",flexShrink:0}}/>
);

const Btn = ({ children, onClick, v="primary", disabled=false, sm=false, full=false, style={} }) => {
  const vs = {
    primary: { bg:C.blue,     color:"#fff", border:"none" },
    success: { bg:C.green,    color:"#fff", border:"none" },
    danger:  { bg:C.red,      color:"#fff", border:"none" },
    amber:   { bg:C.amber,    color:"#fff", border:"none" },
    purple:  { bg:C.purple,   color:"#fff", border:"none" },
    ghost:   { bg:C.bg3,      color:C.textM, border:`1px solid ${C.border}` },
    outline: { bg:"transparent", color:C.blue, border:`1px solid ${C.blue}` },
    subtle:  { bg:"transparent", color:C.textL, border:`1px solid ${C.border}` },
  };
  const s = vs[v]||vs.primary;
  return (
    <button onClick={!disabled?onClick:undefined} disabled={disabled} style={{
      background:s.bg, color:s.color, border:s.border,
      padding:sm?"6px 14px":"10px 20px", borderRadius:8,
      fontSize:sm?12:13.5, fontWeight:600, fontFamily:F.body,
      cursor:disabled?"not-allowed":"pointer", opacity:disabled?.4:1,
      transition:"opacity .1s", display:"inline-flex", alignItems:"center",
      justifyContent:"center", gap:6, width:full?"100%":"auto", flexShrink:0,
      letterSpacing:.2, ...style,
    }}>{children}</button>
  );
};

const Card = ({ children, style={} }) => (
  <div style={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:12, padding:20, ...style }}>
    {children}
  </div>
);

const Fld = ({ label, req=false, hint="", children }) => (
  <div style={{ marginBottom:14 }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
      <label style={{ fontSize:11, fontWeight:600, color:C.textL, letterSpacing:.8, textTransform:"uppercase", fontFamily:F.body }}>
        {label}{req&&<span style={{color:C.red,marginLeft:2}}>*</span>}
      </label>
      {hint&&<span style={{fontSize:10,color:C.textL,fontFamily:F.body}}>{hint}</span>}
    </div>
    {children}
  </div>
);

const Inp = ({ value, onChange, placeholder, type="text", onKeyDown, maxLength }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    onKeyDown={onKeyDown} maxLength={maxLength}
    style={{ width:"100%", padding:"10px 13px", borderRadius:8, border:`1px solid ${C.border}`,
      fontSize:14, fontFamily:F.body, background:C.bg3, color:C.text,
      outline:"none", transition:"border-color .15s" }}/>
);

const Err = ({ msg }) => msg ? (
  <div style={{ background:C.redL, border:`1px solid ${C.red}40`, borderRadius:8, padding:"9px 13px", marginBottom:12, fontSize:13, color:"#F87171", lineHeight:1.5 }}>
    {msg}
  </div>
) : null;

const Badge = ({ children, color=C.blue, bg=C.blueL }) => (
  <span style={{ fontSize:11, background:bg, color, borderRadius:6, padding:"3px 9px", fontWeight:600, fontFamily:F.body, whiteSpace:"nowrap", letterSpacing:.3 }}>{children}</span>
);

const Tag = ({ label, color, bg }) => (
  <span style={{ display:"inline-block", fontSize:10.5, fontWeight:700, letterSpacing:.8, textTransform:"uppercase", color, background:bg, borderRadius:4, padding:"2px 8px", fontFamily:F.body }}>{label}</span>
);

const Divider = ({ label="" }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, margin:"16px 0" }}>
    <div style={{ flex:1, height:1, background:C.border }}/>
    {label&&<span style={{ fontSize:10, color:C.textL, fontFamily:F.body, letterSpacing:.8, textTransform:"uppercase", whiteSpace:"nowrap" }}>{label}</span>}
    <div style={{ flex:1, height:1, background:C.border }}/>
  </div>
);

const Notice = ({ children, v="info", style={} }) => {
  const vs = { info:{bg:C.blueL,c:"#93C5FD"}, warn:{bg:C.amberL,c:"#FCD34D"}, danger:{bg:C.redL,c:"#F87171"}, success:{bg:C.greenL,c:"#4ADE80"} };
  const s = vs[v]||vs.info;
  return (
    <div style={{ background:s.bg, borderRadius:8, padding:"10px 14px", ...style }}>
      <p style={{ fontSize:13, color:s.c, lineHeight:1.6, margin:0, fontFamily:F.body }}>{children}</p>
    </div>
  );
};

const StatusDot = ({ on }) => (
  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
    <div style={{ width:7, height:7, borderRadius:"50%", background:on?C.green:C.red, animation:on?"none":"blink 1.5s infinite" }}/>
    <span style={{ fontSize:11.5, color:on?C.green:C.red, fontWeight:600, fontFamily:F.body }}>{on?"Online":"Offline"}</span>
  </div>
);

// ─────────────────────────────────────────
// NOTIFICAÇÕES
// ─────────────────────────────────────────
const Notifs = ({ items }) => {
  if (!items.length) return null;
  return (
    <div className="notif-w" style={{ position:"fixed", top:72, right:16, zIndex:500, display:"flex", flexDirection:"column", gap:7, maxWidth:300 }}>
      {items.map(n=>(
        <div key={n.id} className="i" style={{ background:C.bg3, border:`1px solid ${n.t==="occ"?C.red:C.green}`, borderRadius:10, padding:"10px 14px", boxShadow:C.shM, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:n.t==="occ"?C.red:C.green, flexShrink:0 }}/>
          <p style={{ fontSize:12.5, color:C.text, margin:0, fontFamily:F.body, lineHeight:1.4 }}>{n.msg}</p>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────
// CAR ICON
// ─────────────────────────────────────────
const CarIcon = ({ color="#fff", size=28 }) => (
  <svg width={size} height={size*1.4} viewBox="0 0 40 56" fill="none">
    <rect x="11" y="9"  width="18" height="36" rx="5" fill={color}/>
    <rect x="13" y="7"  width="14" height="6"  rx="3" fill={color}/>
    <rect x="13" y="44" width="14" height="6"  rx="3" fill={color}/>
    <rect x="3"  y="15" width="8"  height="9"  rx="2" fill={color} opacity=".55"/>
    <rect x="29" y="15" width="8"  height="9"  rx="2" fill={color} opacity=".55"/>
    <rect x="3"  y="29" width="8"  height="9"  rx="2" fill={color} opacity=".55"/>
    <rect x="29" y="29" width="8"  height="9"  rx="2" fill={color} opacity=".55"/>
    <rect x="15" y="19" width="10" height="6"  rx="2" fill="black" opacity=".2"/>
  </svg>
);

// ─────────────────────────────────────────
// SPOT CARD
// ─────────────────────────────────────────
const SpotCard = ({ spot, isSel, onClick, clickable }) => {
  const m   = SM[spot.status]||SM.available;
  const can = clickable&&(spot.status==="available"||spot.status==="preferential");
  return (
    <div className="spot-c" onClick={can?()=>onClick(spot):undefined} style={{
      background:isSel?m.bd:m.bg,
      border:`1px solid ${isSel?m.bd:m.bd+"55"}`,
      borderRadius:10, padding:"8px 5px 7px",
      display:"flex", flexDirection:"column", alignItems:"center", gap:3,
      cursor:can?"pointer":"default", transition:"all .15s",
      boxShadow:isSel?`0 0 20px ${m.bd}44`:"none",
      transform:isSel?"scale(1.06)":"scale(1)",
      flex:"1 1 0", minWidth:56, userSelect:"none",
    }}>
      <span style={{ fontSize:8.5, fontWeight:700, color:isSel?"#fff":m.tx, letterSpacing:.6, fontFamily:F.body }}>{spot.row}{spot.spotNumber}</span>
      <CarIcon size={20} color={isSel?"#fff":m.tx}/>
      <span style={{ fontSize:7.5, fontWeight:700, color:isSel?"rgba(255,255,255,.8)":m.tx, letterSpacing:.4, textTransform:"uppercase", fontFamily:F.body }}>{m.lb}</span>
    </div>
  );
};

// ─────────────────────────────────────────
// PARKING MAP
// ─────────────────────────────────────────
const ParkMap = ({ spots, selId, onSpotClick, clickable=false }) => {
  const Road = ({ label }) => (
    <div style={{ height:22, background:C.bg4, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"50%", left:0, right:0, height:1.5, background:`repeating-linear-gradient(to right,${C.borderL} 0,${C.borderL} 10px,transparent 10px,transparent 22px)`, transform:"translateY(-50%)" }}/>
      <span style={{ fontSize:8, fontWeight:600, color:C.textL, letterSpacing:2, textTransform:"uppercase", position:"relative", fontFamily:F.body }}>{label}</span>
    </div>
  );
  const Row = ({ row }) => (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
        <span style={{ fontSize:8.5, fontWeight:600, color:C.textL, fontFamily:F.body }}>{row}</span>
        <div style={{ flex:1, height:1, background:C.border }}/>
      </div>
      <div className="spot-r" style={{ display:"flex", gap:4 }}>
        {spots.filter(s=>s.row===row).map(s=>(
          <SpotCard key={s._id} spot={s} isSel={selId===s._id} onClick={onSpotClick} clickable={clickable}/>
        ))}
      </div>
    </div>
  );
  const Via = () => (
    <div className="via" style={{ width:22, background:C.bg4, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", flexShrink:0, minHeight:60 }}>
      <div style={{ position:"absolute", left:"50%", top:0, bottom:0, width:1.5, background:`repeating-linear-gradient(to bottom,${C.borderL} 0,${C.borderL} 8px,transparent 8px,transparent 18px)`, transform:"translateX(-50%)" }}/>
      <span className="via-t" style={{ fontSize:7, fontWeight:600, color:C.textL, textTransform:"uppercase", fontFamily:F.body, writingMode:"vertical-rl", position:"relative" }}>Via</span>
    </div>
  );
  const Block = ({ l, r, ll, rl }) => (
    <div className="blk" style={{ display:"flex", gap:0, alignItems:"stretch" }}>
      <div style={{ flex:1, background:C.bg3, borderRadius:10, padding:"8px 7px", border:`1px solid ${C.border}`, minWidth:0 }}>
        <div style={{ fontSize:7.5, fontWeight:600, color:C.textL, letterSpacing:.8, textTransform:"uppercase", fontFamily:F.body, marginBottom:6, textAlign:"center" }}>{ll}</div>
        <Row row={l}/>
      </div>
      <Via/>
      <div style={{ flex:1, background:C.bg3, borderRadius:10, padding:"8px 7px", border:`1px solid ${C.border}`, minWidth:0 }}>
        <div style={{ fontSize:7.5, fontWeight:600, color:C.textL, letterSpacing:.8, textTransform:"uppercase", fontFamily:F.body, marginBottom:6, textAlign:"center" }}>{rl}</div>
        <Row row={r}/>
      </div>
    </div>
  );
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <div style={{ display:"flex", gap:12, marginBottom:6, flexWrap:"wrap" }}>
        {Object.entries(SM).map(([k,m])=>(
          <div key={k} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:m.bd }}/>
            <span style={{ fontSize:11, color:C.textM, fontWeight:500, fontFamily:F.body }}>
              {k==="available"?"Livre":k==="occupied"?"Ocupada":k==="preferential"?"Preferencial":"Reservada"}
            </span>
          </div>
        ))}
      </div>
      <Road label="Entrada"/>
      <Block l="A" r="C" ll="← Av. A" rl="Av. C →"/>
      <Road label="Rua Separadora"/>
      <Block l="B" r="D" ll="← Av. B" rl="Av. D →"/>
      <Road label="Saída"/>
    </div>
  );
};

// ─────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────
const Landing = ({ onEnter }) => (
  <div style={{ minHeight:"100vh", background:C.bg, fontFamily:F.body }}>
    <style>{GF+CSS}</style>

    <header className="lhdr" style={{ background:"#0A0D14", borderBottom:`1px solid ${C.border}`, padding:"0 48px", height:62, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:C.blue, boxShadow:`0 0 12px ${C.blue}` }}/>
        <span style={{ fontFamily:F.head, fontSize:17, fontWeight:700, color:C.text, letterSpacing:.5 }}>OMV</span>
      </div>
      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
        <button onClick={()=>document.getElementById("sobre").scrollIntoView({behavior:"smooth"})} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:C.textM, fontFamily:F.body, fontWeight:500 }}>Sobre</button>
        <Btn onClick={onEnter} sm>Acessar o sistema</Btn>
      </div>
    </header>

    {/* Hero */}
    <div className="hero-w" style={{ maxWidth:860, margin:"0 auto", padding:"80px 24px 60px", textAlign:"center" }}>
      <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:C.blueL, borderRadius:20, padding:"5px 14px", marginBottom:24 }}>
        <div style={{ width:6, height:6, borderRadius:"50%", background:C.blue, animation:"pulse 2s infinite" }}/>
        <span style={{ fontSize:11.5, color:"#93C5FD", fontWeight:600, fontFamily:F.body, letterSpacing:.4 }}>Sistema em operação</span>
      </div>
      <h1 className="hero-h" style={{ fontFamily:F.head, fontSize:52, fontWeight:800, color:C.text, lineHeight:1.1, marginBottom:20, letterSpacing:-.5 }}>
        Otimização e Monitoramento<br/>
        <span style={{ color:C.blue }}>de Vagas</span>
      </h1>
      <p className="hero-sub" style={{ fontSize:16, color:C.textM, maxWidth:520, margin:"0 auto 36px", lineHeight:1.8, fontFamily:F.body }}>
        Sistema inteligente que integra sensores físicos, servidor em nuvem e plataforma web para gerenciar seu estacionamento em tempo real.
      </p>
      <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
        <Btn onClick={onEnter} style={{ padding:"12px 32px", fontSize:14 }}>Entrar no sistema</Btn>
        <Btn v="ghost" onClick={()=>document.getElementById("sobre").scrollIntoView({behavior:"smooth"})} style={{ padding:"12px 32px", fontSize:14 }}>Ver o projeto</Btn>
      </div>
    </div>

    {/* Camadas */}
    <div style={{ maxWidth:900, margin:"0 auto", padding:"0 24px 64px" }}>
      <div className="hcards" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        {[
          { num:"01", title:"Camada Física", desc:"Maquete 3D com 12 vagas, sensores HC-SR04 embutidos e ESP32 enviando leituras via Wi-Fi em tempo real." },
          { num:"02", title:"Backend",       desc:"Node.js + MongoDB Atlas no Render. Gerencia usuários, reservas, pagamentos e regras automatizadas de negócio." },
          { num:"03", title:"Plataforma Web",desc:"React + Vite com mapa ao vivo, reservas antecipadas, cronômetro de uso e painel administrativo completo." },
        ].map(c=>(
          <div key={c.num} style={{ background:C.bg2, borderRadius:12, padding:"22px 20px", border:`1px solid ${C.border}` }}>
            <span style={{ fontSize:11, fontWeight:700, color:C.blue, fontFamily:F.body, letterSpacing:.8 }}>{c.num}</span>
            <h3 style={{ fontFamily:F.head, fontSize:15, fontWeight:700, color:C.text, margin:"8px 0 8px", letterSpacing:.2 }}>{c.title}</h3>
            <p style={{ fontSize:12.5, color:C.textM, lineHeight:1.75, margin:0, fontFamily:F.body }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Sobre */}
    <div id="sobre" className="about-s" style={{ background:C.bg2, borderTop:`1px solid ${C.border}`, padding:"64px 24px" }}>
      <div style={{ maxWidth:820, margin:"0 auto" }}>
        <div style={{ marginBottom:36 }}>
          <span style={{ fontSize:11, fontWeight:700, color:C.blue, letterSpacing:.8, textTransform:"uppercase", fontFamily:F.body }}>Sobre o Projeto</span>
          <h2 style={{ fontFamily:F.head, fontSize:32, fontWeight:800, color:C.text, marginTop:8, marginBottom:14, letterSpacing:-.3 }}>
            TCC — Curso Técnico em Eletrônica
          </h2>
          <p style={{ fontSize:14, color:C.textM, lineHeight:1.85, maxWidth:620, fontFamily:F.body }}>
            O OMV resolve um problema real: estacionamentos privados sem controle eficiente geram congestionamento e prejuízo. Integrando IoT, sistemas embarcados e desenvolvimento web, o projeto propõe uma solução completa e acessível.
          </p>
        </div>

        <div className="agrid" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12, marginBottom:24 }}>
          {[
            { title:"Maquete Física",       desc:"Impressa em PLA via impressora 3D, com 12 vagas em 4 avenidas (A, B, C e D). Cada vaga tem um sensor HC-SR04 embutido no chão. Dois ESP32 coletam as leituras e enviam ao servidor via Wi-Fi. Displays LCD nas entradas exibem vagas disponíveis por avenida." },
            { title:"Backend e Banco",      desc:"Servidor Node.js com Express hospedado no Render.com. MongoDB Atlas armazena tudo. Gerencia reservas com taxa fixa, tolerância de 5 min, no-show automático com multa, cancelamento com reembolso e log completo de ações." },
            { title:"Plataforma Web",       desc:"Site responsivo em React e Vite hospedado no Vercel. Para clientes: mapa ao vivo, reservas, cronômetro e pagamento simulado. Para operadores: dashboard com métricas, gestão de vagas, reservas, usuários e logs." },
            { title:"Identificação RFID",   desc:"Tags RFID nos carrinhos da maquete substituem placas. O leitor RC522 na entrada de cada vaga lê a tag, o ESP32 envia o ID ao backend, que verifica se corresponde ao veículo da reserva — equivalente ao OCR de placas em escala real." },
          ].map(i=>(
            <div key={i.title} style={{ background:C.bg3, borderRadius:10, padding:"16px 16px", border:`1px solid ${C.border}` }}>
              <h4 style={{ fontFamily:F.head, fontSize:13.5, fontWeight:700, color:C.text, marginBottom:7, letterSpacing:.2 }}>{i.title}</h4>
              <p style={{ fontSize:12.5, color:C.textM, lineHeight:1.75, margin:0, fontFamily:F.body }}>{i.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ background:C.bg3, borderRadius:12, padding:"20px 22px", marginBottom:16, border:`1px solid ${C.border}` }}>
          <h3 style={{ fontFamily:F.head, fontSize:14, fontWeight:700, color:C.text, marginBottom:14, letterSpacing:.2 }}>Regras Automatizadas</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:10 }}>
            {[
              { title:"Taxa de reserva",       desc:`R$ ${CFG.reservationFee||10},00 ao confirmar, garantindo intenção real de uso.` },
              { title:"Tolerância de chegada", desc:`${CFG.toleranceMinutes||5} minutos para o sensor detectar o veículo após o horário.` },
              { title:"No-show automático",    desc:"Sem detecção no prazo, a vaga é liberada e multa aplicada automaticamente." },
              { title:"Cancelamento",          desc:"Com mais de 15 min de antecedência, a taxa é reembolsada. Tardio retém o valor." },
            ].map(s=>(
              <div key={s.title} style={{ background:C.bg4, borderRadius:8, padding:"12px 13px" }}>
                <p style={{ fontSize:12.5, fontWeight:600, color:C.text, margin:"0 0 4px", fontFamily:F.body }}>{s.title}</p>
                <p style={{ fontSize:12, color:C.textM, margin:0, lineHeight:1.6, fontFamily:F.body }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign:"center", marginTop:32 }}>
          <Btn onClick={onEnter} style={{ padding:"12px 36px", fontSize:14 }}>Entrar no sistema</Btn>
        </div>
      </div>
    </div>

    <footer className="lftr" style={{ background:"#0A0D14", borderTop:`1px solid ${C.border}`, padding:"18px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:6, height:6, borderRadius:"50%", background:C.blue }}/>
        <span style={{ fontFamily:F.head, fontSize:13, fontWeight:700, color:C.text }}>OMV</span>
      </div>
      <span style={{ fontSize:11.5, color:C.textL, fontFamily:F.body }}>Projeto TCC — Curso Técnico em Eletrônica</span>
    </footer>
  </div>
);

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
const Login = ({ onLogin, onBack }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ nomeCompleto:"", username:"", cpf:"", endereco:"", telefone:"", email:"", password:"" });
  const [err, setErr]   = useState("");
  const [load, setLoad] = useState(false);
  const set = k => e => {
    let v = e.target.value;
    if (k==="cpf") v=fmtCPF(v); if (k==="telefone") v=fmtTel(v);
    setForm(p=>({...p,[k]:v})); setErr("");
  };
  const submit = async () => {
    setLoad(true); setErr("");
    try {
      let token, user;
      if (mode==="login") { ({token,user} = await api.login(form.email.trim(), form.password)); }
      else {
        if (!form.nomeCompleto||!form.username||!form.cpf||!form.endereco||!form.email||!form.password)
          { setErr("Preencha todos os campos obrigatórios."); setLoad(false); return; }
        ({token,user} = await api.register({...form,email:form.email.trim(),username:form.username.trim()}));
      }
      localStorage.setItem("omv_token", token); onLogin(user);
    } catch(e) { setErr(e.message); } finally { setLoad(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:F.body, padding:"24px 16px" }}>
      <style>{GF+CSS}</style>
      <button onClick={onBack} style={{ position:"fixed", top:18, left:18, background:"none", border:"none", cursor:"pointer", color:C.textL, fontSize:13, fontFamily:F.body, display:"flex", alignItems:"center", gap:4 }}>← Voltar</button>
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:4 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:C.blue, boxShadow:`0 0 12px ${C.blue}` }}/>
          <span style={{ fontFamily:F.head, fontSize:20, fontWeight:800, color:C.text, letterSpacing:.3 }}>OMV</span>
        </div>
        <p style={{ fontSize:12.5, color:C.textL }}>Sistema Inteligente de Estacionamento</p>
      </div>
      <div className="u" style={{ background:C.bg2, borderRadius:14, padding:"28px 26px", boxShadow:C.shL, border:`1px solid ${C.border}`, width:"100%", maxWidth:420 }}>
        <h1 style={{ fontFamily:F.head, fontSize:20, fontWeight:800, color:C.text, marginBottom:3, letterSpacing:.2 }}>
          {mode==="login"?"Bem-vindo de volta":"Criar conta"}
        </h1>
        <p style={{ color:C.textL, fontSize:13, marginBottom:20 }}>{mode==="login"?"Acesse para reservar sua vaga.":"Preencha seus dados abaixo."}</p>

        {mode==="register"&&<>
          <Fld label="Nome Completo" req><Inp value={form.nomeCompleto} onChange={set("nomeCompleto")} placeholder="João da Silva"/></Fld>
          <div className="form-r" style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}><Fld label="Usuário" req><Inp value={form.username} onChange={set("username")} placeholder="joaosilva"/></Fld></div>
            <div style={{ flex:1 }}><Fld label="Telefone"><Inp value={form.telefone} onChange={set("telefone")} placeholder="(11) 99999-0000"/></Fld></div>
          </div>
          <div className="form-r" style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}><Fld label="CPF" req><Inp value={form.cpf} onChange={set("cpf")} placeholder="000.000.000-00"/></Fld></div>
            <div style={{ flex:1 }}><Fld label="Endereço" req><Inp value={form.endereco} onChange={set("endereco")} placeholder="Rua, nº — Cidade"/></Fld></div>
          </div>
        </>}
        <Fld label="Email" req><Inp value={form.email} onChange={set("email")} placeholder="seu@email.com" onKeyDown={e=>e.key==="Enter"&&submit()}/></Fld>
        <Fld label="Senha" req><Inp type="password" value={form.password} onChange={set("password")} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()}/></Fld>
        <Err msg={err}/>
        <Btn onClick={submit} disabled={load} full style={{ padding:"11px", fontSize:14, marginTop:2 }}>
          {load?<Spin/>:(mode==="login"?"Entrar":"Criar conta")}
        </Btn>
        <p style={{ textAlign:"center", marginTop:14, fontSize:13, color:C.textL }}>
          {mode==="login"?"Não tem conta? ":"Já tem conta? "}
          <span onClick={()=>{setMode(mode==="login"?"register":"login");setErr("");}} style={{ color:C.blue, fontWeight:600, cursor:"pointer" }}>
            {mode==="login"?"Cadastre-se":"Entrar"}
          </span>
        </p>
        {mode==="login"&&(
          <div style={{ marginTop:16, background:C.bg3, borderRadius:8, padding:"11px 13px", border:`1px solid ${C.border}` }}>
            <p style={{ fontSize:10, color:C.textL, fontWeight:700, marginBottom:3, letterSpacing:.8, textTransform:"uppercase" }}>Acesso Admin</p>
            <p style={{ fontSize:12, color:C.textM, lineHeight:1.8 }}>
              <strong style={{ color:C.text }}>admin@omv.com</strong> / <strong style={{ color:C.text }}>admin123</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// VISÃO GERAL
// ─────────────────────────────────────────
const OverviewTab = ({ spots }) => {
  const avail = spots.filter(s=>s.status==="available").length;
  const occ   = spots.filter(s=>s.status==="occupied"||s.status==="reserved").length;
  const pref  = spots.filter(s=>s.status==="preferential").length;
  const pct   = spots.length?Math.round((occ/spots.length)*100):0;
  return (
    <div>
      <div className="dash-g" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:14 }}>
        {[
          { label:"Livres",        value:avail,        c:C.green,  bg:C.greenL  },
          { label:"Ocupadas",      value:occ,          c:C.red,    bg:C.redL    },
          { label:"Preferenciais", value:pref,         c:C.amber,  bg:C.amberL  },
          { label:"Total",         value:spots.length, c:C.blue,   bg:C.blueL   },
        ].map(p=>(
          <div key={p.label} style={{ background:p.bg, borderRadius:10, padding:"13px 14px", border:`1px solid ${p.c}33` }}>
            <div style={{ fontSize:26, fontFamily:F.head, fontWeight:800, color:p.c, lineHeight:1 }}>{p.value}</div>
            <div style={{ fontSize:9.5, color:p.c, fontWeight:600, marginTop:3, letterSpacing:.6, textTransform:"uppercase", fontFamily:F.body }}>{p.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background:C.bg2, borderRadius:10, padding:"13px 15px", marginBottom:14, border:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontSize:12, fontWeight:600, color:C.textM, fontFamily:F.body }}>Taxa de ocupação</span>
          <span style={{ fontSize:12, fontWeight:700, color:pct>70?C.red:pct>40?C.amber:C.green, fontFamily:F.body }}>{pct}%</span>
        </div>
        <div style={{ height:5, background:C.bg4, borderRadius:20, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, borderRadius:20, transition:"width .6s ease", background:pct>70?C.red:pct>40?C.amber:C.green }}/>
        </div>
        <p style={{ fontSize:11, color:C.textL, marginTop:5, fontFamily:F.body }}>
          {pct>70?"Estacionamento quase cheio.":pct>40?"Ocupação moderada.":"Boa disponibilidade de vagas."}
        </p>
      </div>
      <ParkMap spots={spots} selId={null} onSpotClick={()=>{}} clickable={false}/>
    </div>
  );
};

// ─────────────────────────────────────────
// RESERVAS
// ─────────────────────────────────────────
const ReserveTab = ({ spots, activeRes, onReserved, setTab, cfg }) => {
  const [sel, setSel]     = useState(null);
  const [date, setDate]   = useState(todayStr());
  const [time, setTime]   = useState(nowTime());
  const [placa, setPlaca] = useState("");
  const [modelo, setMod]  = useState("");
  const [err, setErr]     = useState("");
  const [load, setLoad]   = useState(false);
  const [step, setStep]   = useState(1);
  const [cLoad, setCLoad] = useState(false);
  const [cResult, setCR]  = useState(null);
  const MODELOS = ["HB20","Onix","Gol","Argo","Mobi","Kwid","Creta","T-Cross","Compass","Tracker","Outros"];

  const confirm = async () => {
    if (!time||!date) { setErr("Selecione data e horário."); return; }
    const start = buildStart(date, time);
    const tStr  = `${String(start.getHours()).padStart(2,"0")}:${String(start.getMinutes()).padStart(2,"0")}`;
    const dStr  = start.toISOString().split("T")[0];
    setLoad(true); setErr("");
    try { await api.createRes(sel._id, tStr, dStr, placa, modelo); onReserved(); setTab("payment"); }
    catch(e) { setErr(e.message); } finally { setLoad(false); }
  };

  const cancel = async () => {
    if (!window.confirm("Cancelar reserva?")) return;
    setCLoad(true);
    try { const r = await api.cancelRes(activeRes._id); setCR(r); onReserved(); }
    catch(e) { alert(e.message); } finally { setCLoad(false); }
  };

  if (cResult) return (
    <div style={{ maxWidth:420, margin:"0 auto" }}>
      <Card>
        <div style={{ textAlign:"center", padding:"8px 0 12px" }}>
          <p style={{ fontFamily:F.head, fontSize:18, fontWeight:700, color:C.text, marginBottom:8 }}>Reserva cancelada</p>
          {cResult.feeRefunded
            ? <p style={{ fontSize:13, color:"#4ADE80", fontFamily:F.body }}>Taxa de reserva reembolsada — cancelamento antecipado.</p>
            : <p style={{ fontSize:13, color:"#F87171", fontFamily:F.body }}>Taxa de <strong>{fmtMoney(cfg.reservationFee)}</strong> retida — cancelamento tardio.</p>
          }
        </div>
        <Btn full onClick={()=>{setCR(null);setStep(1);}} v="ghost">Fechar</Btn>
      </Card>
    </div>
  );

  // Reserva ativa
  if (activeRes) return (
    <div style={{ maxWidth:480, margin:"0 auto" }}>
      <Card>
        {activeRes.status==="no_show"?(
          <div>
            <div style={{ marginBottom:14 }}>
              <Tag label="No-show" color="#F87171" bg={C.redL}/>
              <h3 style={{ fontFamily:F.head, fontSize:17, fontWeight:700, color:C.text, marginTop:10, marginBottom:4 }}>Multa pendente</h3>
              <p style={{ fontSize:13, color:C.textM, fontFamily:F.body }}>Você não compareceu no horário reservado. Multa de <strong style={{color:"#F87171"}}>{fmtMoney(cfg.noShowFine)}</strong>.</p>
            </div>
            <Btn v="danger" full onClick={()=>setTab("payment")}>Pagar multa — {fmtMoney(cfg.noShowFine)}</Btn>
          </div>
        ):(
          <div>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
              <div>
                <Tag label="Ativa" color="#4ADE80" bg={C.greenL}/>
                <h3 style={{ fontFamily:F.head, fontSize:18, fontWeight:700, color:C.text, marginTop:8, marginBottom:3 }}>Vaga {activeRes.spotNumber}</h3>
                <p style={{ fontSize:13, color:C.textM, margin:0, fontFamily:F.body }}>Horário: {activeRes.startTimeStr}</p>
                {activeRes.placa&&<p style={{ fontSize:12.5, color:C.textM, margin:"2px 0 0", fontFamily:F.body }}>{activeRes.placa}{activeRes.modelo&&` — ${activeRes.modelo}`}</p>}
              </div>
              <CarIcon color={C.blue} size={36}/>
            </div>
            <Notice v="warn" style={{ marginBottom:16 }}>
              Tolerância de <strong>{cfg.toleranceMinutes} min</strong> para chegada. Sem detecção, a vaga é liberada e uma multa de <strong>{fmtMoney(cfg.noShowFine)}</strong> é aplicada.
            </Notice>
            {/* BOTÕES DENTRO DO CARD */}
            <div style={{ display:"flex", gap:8 }}>
              <Btn full onClick={()=>setTab("payment")} v="outline">Ir para pagamento</Btn>
              <Btn v="ghost" onClick={cancel} disabled={cLoad} style={{ flexShrink:0 }}>
                {cLoad?<Spin/>:"Cancelar"}
              </Btn>
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <div>
      {step===1?(
        <div className="res-lay" style={{ display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:13, color:C.textM, marginBottom:12, lineHeight:1.6, fontFamily:F.body }}>
              Selecione uma vaga <span style={{ color:"#4ADE80", fontWeight:600 }}>livre</span> ou <span style={{ color:"#FCD34D", fontWeight:600 }}>preferencial</span>.
            </p>
            <ParkMap spots={spots} selId={sel?._id} onSpotClick={s=>{setSel(p=>p?._id===s._id?null:s);setErr("");}} clickable={true}/>
          </div>
          {sel&&(
            <div className="res-pan u" style={{ width:220, flexShrink:0 }}>
              <Card>
                <div style={{ paddingBottom:12, marginBottom:12, borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:10, fontWeight:600, color:C.textL, letterSpacing:.8, textTransform:"uppercase" }}>Selecionada</span>
                  <p style={{ fontSize:28, fontFamily:F.head, fontWeight:800, color:C.text, margin:"4px 0 0" }}>{sel.row}{sel.spotNumber}</p>
                </div>
                <p style={{ fontSize:11, color:C.textL, marginBottom:2, fontFamily:F.body }}>Taxa de reserva</p>
                <p style={{ fontSize:20, fontFamily:F.head, fontWeight:700, color:C.blue, marginBottom:1 }}>{fmtMoney(cfg.reservationFee)}</p>
                <p style={{ fontSize:11, color:C.textL, marginBottom:14, fontFamily:F.body }}>+ {fmtMoney(cfg.pricePerHour)}/hora</p>
                <Btn full onClick={()=>setStep(2)} style={{ marginBottom:7 }}>Continuar</Btn>
                <Btn v="ghost" full onClick={()=>setSel(null)}>Cancelar</Btn>
              </Card>
            </div>
          )}
        </div>
      ):(
        <div style={{ maxWidth:400, margin:"0 auto" }} className="u">
          <button onClick={()=>setStep(1)} style={{ background:"none", border:"none", cursor:"pointer", color:C.textL, fontSize:13, fontFamily:F.body, marginBottom:14, display:"flex", alignItems:"center", gap:4 }}>← Voltar ao mapa</button>
          <Card>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, background:C.bg3, borderRadius:8, padding:"12px 14px" }}>
              <div>
                <span style={{ fontSize:10, color:C.textL, textTransform:"uppercase", letterSpacing:.8, fontFamily:F.body }}>Vaga</span>
                <p style={{ fontSize:22, fontFamily:F.head, fontWeight:800, color:C.text, margin:0 }}>{sel?.row}{sel?.spotNumber}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <span style={{ fontSize:10, color:C.textL, fontFamily:F.body }}>Taxa + uso</span>
                <p style={{ fontSize:13, fontFamily:F.head, fontWeight:700, color:C.text, margin:0 }}>{fmtMoney(cfg.reservationFee)} + {fmtMoney(cfg.pricePerHour)}/h</p>
              </div>
            </div>
            <Notice v="warn" style={{ marginBottom:14 }}>
              Taxa de <strong>{fmtMoney(cfg.reservationFee)}</strong> cobrada ao confirmar. Tolerância de <strong>{cfg.toleranceMinutes} min</strong>. Cancelamento antecipado reembolsa a taxa.
            </Notice>
            <Divider label="Horário"/>
            <div className="form-r" style={{ display:"flex", gap:10 }}>
              <div style={{ flex:1 }}>
                <Fld label="Data" req>
                  <input type="date" value={date} min={todayStr()} onChange={e=>setDate(e.target.value)} style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${C.border}`, fontSize:13, fontFamily:F.body, background:C.bg3, color:C.text, outline:"none" }}/>
                </Fld>
              </div>
              <div style={{ flex:1 }}>
                <Fld label="Horário" req hint="início">
                  <input type="time" value={time} onChange={e=>setTime(e.target.value)} style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${C.border}`, fontSize:13, fontFamily:F.body, background:C.bg3, color:C.text, outline:"none" }}/>
                </Fld>
              </div>
            </div>
            <Divider label="Veículo (opcional)"/>
            <Fld label="Placa">
              <Inp value={placa} onChange={e=>setPlaca(fmtPlaca(e.target.value))} placeholder="ABC1234" maxLength={7}/>
            </Fld>
            <Fld label="Modelo">
              <div className="mbtns" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:5 }}>
                {MODELOS.map(mod=>(
                  <button key={mod} onClick={()=>setMod(m=>m===mod?"":mod)} style={{ padding:"6px 3px", borderRadius:7, border:`1px solid ${modelo===mod?C.blue:C.border}`, background:modelo===mod?C.blueL:"transparent", color:modelo===mod?"#93C5FD":C.textM, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:F.body, transition:"all .12s" }}>{mod}</button>
                ))}
              </div>
            </Fld>
            <Err msg={err}/>
            <div style={{ display:"flex", gap:8, marginTop:10 }}>
              <Btn onClick={confirm} disabled={load} full>{load?<Spin/>:`Confirmar — ${fmtMoney(cfg.reservationFee)}`}</Btn>
              <Btn v="ghost" onClick={()=>setStep(1)} style={{ flexShrink:0 }}>Voltar</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────
// MODAL PAGAMENTO
// ─────────────────────────────────────────
const PayModal = ({ price, label, onConfirm, onClose }) => {
  const [method, setMethod] = useState("");
  const [step, setStep]     = useState(1);
  const [card, setCard]     = useState({ num:"", nome:"", val:"", cvv:"" });
  const pay = () => { setStep(3); setTimeout(onConfirm, 2200); };
  const inS = { width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${C.border}`, fontSize:13, fontFamily:F.body, background:C.bg3, color:C.text, outline:"none" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
      <div className="u" style={{ background:C.bg2, borderRadius:14, padding:24, maxWidth:380, width:"100%", boxShadow:C.shL, border:`1px solid ${C.border}` }} onClick={e=>e.stopPropagation()}>
        {step===3?(
          <div style={{ textAlign:"center", padding:"14px 0" }}>
            <Spin sz={36} c={C.green}/>
            <p style={{ fontFamily:F.head, fontSize:16, fontWeight:700, color:C.text, marginTop:14 }}>Processando...</p>
          </div>
        ):(
          <>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <h2 style={{ fontFamily:F.head, fontSize:16, fontWeight:800, color:C.text }}>{label||"Confirmar pagamento"}</h2>
              <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.textL, fontSize:18, lineHeight:1 }}>✕</button>
            </div>
            <div style={{ background:C.greenL, borderRadius:10, padding:"12px 16px", marginBottom:14, textAlign:"center" }}>
              <p style={{ fontSize:10, color:"#4ADE80", textTransform:"uppercase", letterSpacing:.8, fontFamily:F.body, margin:0 }}>Total a pagar</p>
              <p style={{ fontSize:28, fontFamily:F.head, fontWeight:800, color:"#4ADE80", margin:0 }}>R$ {price}</p>
            </div>
            {step===1&&(
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {[
                  { key:"pix",  title:"PIX",        sub:"Aprovação instantânea" },
                  { key:"card", title:"Cartão",      sub:"Crédito ou débito" },
                  { key:"demo", title:"Modo Demo",   sub:"Para fins de demonstração" },
                ].map(o=>(
                  <button key={o.key} onClick={()=>o.key==="demo"?pay():(setMethod(o.key),setStep(2))} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", borderRadius:10, border:`1px solid ${C.border}`, background:C.bg3, cursor:"pointer" }}>
                    <div style={{ textAlign:"left" }}>
                      <p style={{ fontSize:13, fontWeight:600, color:C.text, margin:0, fontFamily:F.body }}>{o.title}</p>
                      <p style={{ fontSize:11, color:C.textL, margin:0, fontFamily:F.body }}>{o.sub}</p>
                    </div>
                    <span style={{ color:C.textL }}>›</span>
                  </button>
                ))}
              </div>
            )}
            {step===2&&method==="pix"&&(
              <div>
                <div style={{ background:C.bg3, borderRadius:10, padding:14, marginBottom:12, textAlign:"center" }}>
                  <div style={{ width:108, height:108, margin:"0 auto 8px", background:C.bg4, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, padding:6 }}>
                      {Array.from({length:49}).map((_,i)=><div key={i} style={{ width:9, height:9, background:Math.random()>.45?C.text:"transparent", borderRadius:1 }}/>)}
                    </div>
                  </div>
                  <p style={{ fontSize:11, color:C.textL, fontFamily:F.body }}>QR Code simulado para demonstração</p>
                </div>
                <Btn full onClick={pay}>Confirmar pagamento PIX</Btn>
                <button onClick={()=>setStep(1)} style={{ marginTop:9, background:"none", border:"none", cursor:"pointer", color:C.textL, fontSize:13, fontFamily:F.body, width:"100%" }}>← Voltar</button>
              </div>
            )}
            {step===2&&method==="card"&&(
              <div>
                <Fld label="Número"><input value={card.num} onChange={e=>setCard(p=>({...p,num:e.target.value.replace(/\D/g,"").slice(0,16).replace(/(\d{4})/g,"$1 ").trim()}))} placeholder="0000 0000 0000 0000" maxLength={19} style={inS}/></Fld>
                <Fld label="Nome no cartão"><input value={card.nome} onChange={e=>setCard(p=>({...p,nome:e.target.value.toUpperCase()}))} placeholder="NOME SOBRENOME" style={inS}/></Fld>
                <div style={{ display:"flex", gap:9 }}>
                  <div style={{ flex:1 }}><Fld label="Validade"><input value={card.val} onChange={e=>setCard(p=>({...p,val:e.target.value.replace(/\D/g,"").slice(0,4).replace(/(\d{2})(\d)/,"$1/$2")}))} placeholder="MM/AA" maxLength={5} style={inS}/></Fld></div>
                  <div style={{ flex:1 }}><Fld label="CVV"><input value={card.cvv} onChange={e=>setCard(p=>({...p,cvv:e.target.value.replace(/\D/g,"").slice(0,3)}))} placeholder="000" maxLength={3} style={inS}/></Fld></div>
                </div>
                <Notice v="warn" style={{ marginBottom:12 }}>Modo demonstração — nenhuma cobrança real.</Notice>
                <Btn full onClick={pay}>Confirmar pagamento</Btn>
                <button onClick={()=>setStep(1)} style={{ marginTop:9, background:"none", border:"none", cursor:"pointer", color:C.textL, fontSize:13, fontFamily:F.body, width:"100%" }}>← Voltar</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// PAGAMENTO
// ─────────────────────────────────────────
const PaymentTab = ({ activeRes, onPaid, cfg }) => {
  const [secs, setSecs]     = useState(0);
  const [run, setRun]       = useState(false);
  const [modal, setModal]   = useState(false);
  const [paid, setPaid]     = useState(false);
  const [fp, setFp]         = useState(null);
  const [ft, setFt]         = useState(null);
  const iv = useRef(null);

  useEffect(()=>{
    if (!activeRes||activeRes.status==="no_show") return;
    const el = Math.max(0,Math.floor((new Date()-new Date(activeRes.startTime))/1000));
    setSecs(el);
    if (new Date()>=new Date(activeRes.startTime)) setRun(true);
  },[activeRes?._id]);

  useEffect(()=>{
    clearInterval(iv.current);
    if (run) iv.current=setInterval(()=>setSecs(s=>s+1),1000);
    return ()=>clearInterval(iv.current);
  },[run]);

  const usage = ((secs/3600)*cfg.pricePerHour).toFixed(2);
  const total = (parseFloat(usage)+cfg.reservationFee).toFixed(2);

  const payConfirm = async () => {
    try {
      const { totalPrice:tp } = await api.payRes(activeRes._id);
      clearInterval(iv.current); setRun(false); setPaid(true); setModal(false);
      setFp(tp.toFixed(2)); setFt(fmtTime(secs));
      setTimeout(()=>{ setPaid(false);setFp(null);setFt(null);setSecs(0);onPaid(); },5000);
    } catch(e){ alert(e.message); }
  };

  if (paid) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:260, gap:14, textAlign:"center" }}>
      <div style={{ width:56, height:56, borderRadius:"50%", background:C.greenL, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <p style={{ fontFamily:F.head, fontSize:24, fontWeight:800, color:"#4ADE80", margin:0 }}>Pagamento confirmado</p>
      <p style={{ fontSize:20, fontWeight:700, color:C.text, fontFamily:F.head }}>{fmtMoney(fp)}</p>
      <p style={{ color:C.textM, fontSize:13, fontFamily:F.body }}>Duração: {ft}</p>
    </div>
  );

  return (
    <div className="pay-lay" style={{ display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-start" }}>
      {modal&&<PayModal price={activeRes?.status==="no_show"?cfg.noShowFine.toFixed(2):total} label={activeRes?.status==="no_show"?"Pagar multa":"Confirmar pagamento"} onConfirm={payConfirm} onClose={()=>setModal(false)}/>}
      <div className="pay-w" style={{ flex:"0 0 340px", display:"flex", flexDirection:"column", gap:12 }}>
        {!activeRes?(
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:200, gap:10, textAlign:"center", padding:16 }}>
            <CarIcon color={C.textL} size={36}/>
            <p style={{ fontFamily:F.head, fontSize:16, fontWeight:700, color:C.textL }}>Nenhuma reserva ativa</p>
            <p style={{ fontSize:13, color:C.textL, maxWidth:220, lineHeight:1.7, fontFamily:F.body }}>Faça uma reserva na aba <strong style={{color:C.textM}}>Reservas</strong> para iniciar.</p>
          </div>
        ):activeRes.status==="no_show"?(
          <Card>
            <Notice v="danger" style={{ marginBottom:14 }}>
              <strong>No-show detectado.</strong> Multa de <strong>{fmtMoney(cfg.noShowFine)}</strong> aplicada.
            </Notice>
            <Btn v="danger" full onClick={()=>setModal(true)} style={{ padding:"11px" }}>Pagar multa — {fmtMoney(cfg.noShowFine)}</Btn>
          </Card>
        ):(
          <Card>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14, paddingBottom:14, borderBottom:`1px solid ${C.border}` }}>
              <div style={{ width:44, height:44, borderRadius:10, background:C.purpleL, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <CarIcon color="#A78BFA" size={22}/>
              </div>
              <div>
                <span style={{ fontSize:10, color:C.textL, fontWeight:600, letterSpacing:.8, textTransform:"uppercase", fontFamily:F.body }}>Reserva ativa</span>
                <p style={{ fontFamily:F.head, fontSize:22, fontWeight:800, color:C.text, margin:0 }}>Vaga {activeRes.spot?.row}{activeRes.spotNumber}</p>
                <p style={{ fontSize:12, color:C.textM, margin:0, fontFamily:F.body }}>{activeRes.startTimeStr}{activeRes.placa&&` — ${activeRes.placa}`}</p>
              </div>
            </div>
            <div style={{ background:C.bg, borderRadius:10, padding:"16px 18px", textAlign:"center", marginBottom:12 }}>
              <p style={{ color:C.textL, fontSize:10, fontWeight:600, letterSpacing:2, textTransform:"uppercase", marginBottom:6, fontFamily:F.body }}>{run?"Tempo decorrido":"Aguardando horário"}</p>
              <p className="t-big" style={{ fontFamily:F.head, fontSize:42, fontWeight:800, color:C.text, letterSpacing:1, lineHeight:1, margin:0 }}>{fmtTime(secs)}</p>
              {!run&&<p style={{ color:C.textL, fontSize:11, marginTop:6, fontFamily:F.body }}>O cronômetro inicia no horário reservado.</p>}
            </div>
            {run&&(
              <div style={{ marginBottom:12 }}>
                {[["Taxa de reserva",fmtMoney(cfg.reservationFee)],[`Uso (${fmtTime(secs)})`,fmtMoney(usage)]].map(([k,v])=>(
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:12.5, color:C.textM, fontFamily:F.body }}>{k}</span>
                    <span style={{ fontSize:12.5, fontWeight:600, color:C.text, fontFamily:F.body }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", paddingTop:8, borderTop:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:F.body }}>Total</span>
                  <span style={{ fontSize:18, fontWeight:800, color:"#4ADE80", fontFamily:F.head }}>{fmtMoney(total)}</span>
                </div>
              </div>
            )}
            {run&&<Btn v="success" onClick={()=>setModal(true)} full style={{ padding:"11px" }}>Finalizar e pagar — {fmtMoney(total)}</Btn>}
          </Card>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// MINHA CONTA
// ─────────────────────────────────────────
const ProfileTab = ({ user, onLogout }) => {
  const [hist, setHist]   = useState([]);
  const [active, setAct]  = useState(null);
  const [load, setLoad]   = useState(true);
  const cpfFmt = user.cpf?user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4"):"—";

  useEffect(()=>{
    Promise.all([api.myHistory(), api.myRes()])
      .then(([h,r])=>{ setHist(h); setAct(r); })
      .catch(()=>{}).finally(()=>setLoad(false));
  },[]);

  const totalG = hist.reduce((a,r)=>a+(r.totalPrice||0),0);
  const totalS = hist.reduce((a,r)=>a+(r.totalSeconds||0),0);
  const sBdg   = s=>{
    if (s==="paid")      return <Badge color="#4ADE80" bg={C.greenL}>Pago</Badge>;
    if (s==="cancelled") return <Badge color={C.textM}  bg={C.bg4}>Cancelado</Badge>;
    if (s==="no_show")   return <Badge color="#F87171" bg={C.redL}>No-show</Badge>;
    return null;
  };

  return (
    <div style={{ maxWidth:620, margin:"0 auto" }}>
      <Card style={{ marginBottom:12, display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ width:46, height:46, borderRadius:10, background:C.blueL, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, color:"#93C5FD", fontFamily:F.head, flexShrink:0 }}>
          {(user.nomeCompleto?.[0]||user.email[0]).toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontFamily:F.head, fontSize:15, fontWeight:700, color:C.text, margin:0 }}>{user.nomeCompleto||"—"}</p>
          <p style={{ fontSize:12, color:C.textL, margin:0, fontFamily:F.body }}>@{user.username||"—"} · {user.email}</p>
        </div>
        <Btn v="ghost" sm onClick={onLogout}>Sair</Btn>
      </Card>

      {active&&(
        <div style={{ background:active.status==="no_show"?C.redL:C.purpleL, borderRadius:10, padding:"10px 14px", marginBottom:12, border:`1px solid ${active.status==="no_show"?C.red:C.purple}44` }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:active.status==="no_show"?C.red:C.purple, animation:"pulse 2s infinite" }}/>
            <p style={{ fontSize:12.5, fontWeight:600, color:active.status==="no_show"?"#F87171":"#A78BFA", margin:0, fontFamily:F.body }}>
              {active.status==="no_show"?"Multa pendente por no-show":`Reserva ativa — Vaga ${active.spotNumber} às ${active.startTimeStr}`}
            </p>
          </div>
        </div>
      )}

      <div className="pstats" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9, marginBottom:12 }}>
        {[
          { label:"Reservas",    value:hist.length,      c:C.purple, bg:C.purpleL },
          { label:"Total gasto", value:fmtMoney(totalG), c:C.green,  bg:C.greenL  },
          { label:"Tempo total", value:fmtTime(totalS),  c:C.amber,  bg:C.amberL  },
        ].map(p=>(
          <div key={p.label} style={{ background:p.bg, borderRadius:10, padding:"11px 12px", border:`1px solid ${p.c}33` }}>
            <div style={{ fontSize:14, fontFamily:F.head, fontWeight:800, color:p.c, lineHeight:1.2, wordBreak:"break-all" }}>{p.value}</div>
            <div style={{ fontSize:9.5, color:p.c, fontWeight:600, marginTop:2, letterSpacing:.5, textTransform:"uppercase", fontFamily:F.body }}>{p.label}</div>
          </div>
        ))}
      </div>

      <Card style={{ marginBottom:12 }}>
        <h3 style={{ fontFamily:F.head, fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>Dados pessoais</h3>
        <div className="pg2" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
          {[["Nome",user.nomeCompleto||"—"],["Usuário",`@${user.username||"—"}`],["Email",user.email],["CPF",cpfFmt],["Telefone",user.telefone||"—"],["Endereço",user.endereco||"—"]].map(([k,v])=>(
            <div key={k}>
              <p style={{ fontSize:10, color:C.textL, textTransform:"uppercase", letterSpacing:.8, margin:"0 0 3px", fontFamily:F.body }}>{k}</p>
              <p style={{ fontSize:13, color:C.text, fontWeight:500, margin:0, fontFamily:F.body, wordBreak:"break-all" }}>{v}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 style={{ fontFamily:F.head, fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>Histórico</h3>
        {load&&<div style={{ display:"flex", justifyContent:"center", padding:"14px 0" }}><Spin/></div>}
        {!load&&hist.length===0&&<p style={{ fontSize:13, color:C.textL, fontFamily:F.body }}>Nenhum pagamento ainda.</p>}
        {!load&&hist.map((r,i)=>(
          <div key={r._id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderBottom:i<hist.length-1?`1px solid ${C.border}`:"none", gap:9, flexWrap:"wrap" }}>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:C.text, margin:0, fontFamily:F.body }}>Vaga {r.spotNumber}{r.placa&&` · ${r.placa}`}</p>
              <p style={{ fontSize:11, color:C.textL, margin:0, fontFamily:F.body }}>{fmtDate(r.createdAt)}{r.totalSeconds?` · ${fmtTime(r.totalSeconds)}`:""}</p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              {sBdg(r.status)}
              <Badge color="#4ADE80" bg={C.greenL}>{fmtMoney(r.totalPrice)}</Badge>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────
// USER MODAL
// ─────────────────────────────────────────
const UserModal = ({ user, onClose, onToggle, onDelete }) => {
  if (!user) return null;
  const cpf = user.cpf?user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4"):"—";
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
      <div className="u" style={{ background:C.bg2, borderRadius:14, padding:22, maxWidth:360, width:"100%", boxShadow:C.shL, border:`1px solid ${C.border}` }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <div style={{ width:40, height:40, borderRadius:9, background:C.blueL, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#93C5FD", fontFamily:F.head, flexShrink:0 }}>
            {(user.nomeCompleto?.[0]||user.email[0]).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:700, color:C.text, margin:0, fontFamily:F.head }}>{user.nomeCompleto||"—"}</p>
            <p style={{ fontSize:11, color:C.textL, margin:0, fontFamily:F.body }}>@{user.username||"—"}</p>
          </div>
        </div>
        {[["Email",user.email],["CPF",cpf],["Endereço",user.endereco||"—"],["Reservas",user.totalReservas||0],["Gasto total",fmtMoney(user.totalGasto||0)],["Status",user.ativo?"Ativo":"Desativado"]].map(([k,v])=>(
          <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${C.border}` }}>
            <span style={{ fontSize:12, color:C.textL, fontFamily:F.body }}>{k}</span>
            <span style={{ fontSize:12.5, fontWeight:600, color:k==="Status"?(user.ativo?C.green:C.red):C.text, textAlign:"right", maxWidth:"55%", fontFamily:F.body, wordBreak:"break-all" }}>{String(v)}</span>
          </div>
        ))}
        <div style={{ display:"flex", gap:7, marginTop:14, flexWrap:"wrap" }}>
          {!user.isAdmin&&onToggle&&<Btn v={user.ativo?"ghost":"success"} sm onClick={()=>onToggle(user._id)} style={{ flex:1 }}>{user.ativo?"Desativar":"Reativar"}</Btn>}
          {!user.isAdmin&&onDelete&&<Btn v="danger" sm onClick={()=>onDelete(user._id)} style={{ flex:1 }}>Excluir</Btn>}
          <Btn v="ghost" onClick={onClose} style={{ flex:1 }}>Fechar</Btn>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────
const AdminTab = ({ spots, onSpotsUpdate }) => {
  const [view, setView]     = useState("dashboard");
  const [dash, setDash]     = useState(null);
  const [logs, setLogs]     = useState([]);
  const [res, setRes]       = useState([]);
  const [users, setUsers]   = useState([]);
  const [load, setLoad]     = useState(false);
  const [selU, setSelU]     = useState(null);
  const [search, setSearch] = useState("");
  const [dLoad, setDLoad]   = useState(false);
  const [dMsg, setDMsg]     = useState("");

  const loadView = async v => {
    setLoad(true);
    try {
      if (v==="dashboard") setDash(await api.adminDash());
      if (v==="logs")      setLogs(await api.adminLogs());
      if (v==="res")       setRes(await api.adminRes());
      if (v==="users")     setUsers(await api.adminUsers());
    } catch {} setLoad(false);
  };
  useEffect(()=>{ loadView(view); },[view]);

  const toggle = async uid => {
    await api.toggleUser(uid);
    const u = await api.adminUsers(); setUsers(u);
    if (selU) setSelU(u.find(x=>x._id===selU._id)||null);
  };
  const deleteUser = async uid => {
    if (!window.confirm("Excluir esta conta permanentemente?")) return;
    try { await api.deleteUser(uid); setSelU(null); const u=await api.adminUsers(); setUsers(u); }
    catch(e){ alert(e.message); }
  };
  const cancelRes = async rid => {
    if (!window.confirm("Cancelar esta reserva?")) return;
    await api.cancelAdmRes(rid); loadView("res");
  };
  const clearLogs = async () => {
    if (!window.confirm("Apagar todos os logs?")) return;
    try { await api.clearLogs(); setLogs([]); } catch(e){ alert(e.message); }
  };
  const runDemo = async () => {
    setDLoad(true); setDMsg("");
    const av = spots.filter(s=>s.status==="available");
    if (!av.length) { setDMsg("Sem vagas livres."); setDLoad(false); return; }
    const sp = av[Math.floor(Math.random()*av.length)];
    setDMsg(`Vaga ${sp.row}${sp.spotNumber} sendo ocupada...`);
    await api.sensor(sp.spotNumber, true); onSpotsUpdate();
    setTimeout(async()=>{
      setDMsg(`Vaga ${sp.row}${sp.spotNumber} liberada.`);
      await api.sensor(sp.spotNumber, false); onSpotsUpdate();
      setTimeout(()=>{ setDMsg("Concluído."); setDLoad(false); },1500);
    },3000);
  };

  const noShows = res.filter(r=>r.status==="no_show").length;
  const row = { background:C.bg2, borderRadius:10, padding:"11px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:7, border:`1px solid ${C.border}` };
  const fU = users.filter(u=>!search||(u.email+u.nomeCompleto+u.username).toLowerCase().includes(search.toLowerCase()));
  const fR = res.filter(r=>!search||(r.user?.email+r.user?.nomeCompleto+String(r.spotNumber)).toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <UserModal user={selU} onClose={()=>setSelU(null)} onToggle={toggle} onDelete={deleteUser}/>

      <div className="atabs" style={{ display:"flex", gap:5, marginBottom:16, flexWrap:"wrap" }}>
        {[["dashboard","Dashboard"],["res","Reservas"],["users","Usuários"],["logs","Logs"],["system","Sistema"]].map(([v,l])=>(
          <button key={v} className="atab" onClick={()=>{setView(v);setSearch("");}} style={{
            padding:"7px 16px", borderRadius:8, fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:F.body,
            background:view===v?C.blue:C.bg3, color:view===v?"#fff":C.textM, border:`1px solid ${view===v?C.blue:C.border}`, transition:"all .12s",
          }}>
            {l}{v==="res"&&noShows>0&&<span style={{ marginLeft:5, background:C.red, color:"#fff", borderRadius:6, padding:"1px 6px", fontSize:10 }}>{noShows}</span>}
          </button>
        ))}
      </div>

      {(view==="users"||view==="res")&&(
        <div style={{ marginBottom:12 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." style={{ width:"100%", maxWidth:260, padding:"8px 14px", borderRadius:8, border:`1px solid ${C.border}`, fontSize:13, fontFamily:F.body, background:C.bg3, color:C.text, outline:"none" }}/>
        </div>
      )}

      {load&&<div style={{ display:"flex", justifyContent:"center", padding:"28px 0" }}><Spin sz={24}/></div>}

      {/* DASHBOARD */}
      {!load&&view==="dashboard"&&dash&&(
        <div>
          {noShows>0&&<Notice v="danger" style={{ marginBottom:14 }}><strong>{noShows} no-show(s) pendente(s)</strong> — multas aguardando pagamento.</Notice>}

          <div style={{ background:C.bg2, borderRadius:12, padding:"14px 18px", marginBottom:14, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <div>
              <p style={{ fontFamily:F.head, fontSize:13, fontWeight:700, color:C.text, margin:0 }}>Modo Demonstração</p>
              <p style={{ fontSize:12, color:C.textM, margin:"2px 0 0", fontFamily:F.body }}>Simula entrada e saída de veículo em vaga aleatória</p>
              {dMsg&&<p style={{ fontSize:12, color:"#FCD34D", margin:"4px 0 0", fontFamily:F.body }}>{dMsg}</p>}
            </div>
            <Btn v="amber" onClick={runDemo} disabled={dLoad} sm>{dLoad?<Spin/>:"Iniciar demo"}</Btn>
          </div>

          <div className="dash-g" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:14 }}>
            {[
              { l:"Usuários",     v:dash.totalUsers,            c:C.blue,   bg:C.blueL   },
              { l:"Reservas",     v:dash.totalReservations,     c:C.purple, bg:C.purpleL },
              { l:"Pagas",        v:dash.paidReservations,      c:C.green,  bg:C.greenL  },
              { l:"Receita",      v:fmtMoney(dash.totalRevenue),c:C.green,  bg:C.greenL  },
              { l:"Livres",       v:dash.spotsAvailable,        c:C.green,  bg:C.greenL  },
              { l:"Ocupadas",     v:dash.spotsOccupied,         c:C.red,    bg:C.redL    },
              { l:"Preferenciais",v:dash.spotsPreferential,     c:C.amber,  bg:C.amberL  },
              { l:"Ativas",       v:dash.activeReservations,    c:C.purple, bg:C.purpleL },
            ].map(p=>(
              <div key={p.l} style={{ background:p.bg, borderRadius:10, padding:"11px 12px", border:`1px solid ${p.c}33` }}>
                <div style={{ fontSize:18, fontFamily:F.head, fontWeight:800, color:p.c }}>{p.v}</div>
                <div style={{ fontSize:9, color:p.c, fontWeight:700, marginTop:2, letterSpacing:.6, textTransform:"uppercase", fontFamily:F.body }}>{p.l}</div>
              </div>
            ))}
          </div>

          <Card style={{ marginBottom:12, padding:16 }}>
            <h3 style={{ fontFamily:F.head, fontSize:13, fontWeight:700, color:C.text, marginBottom:12 }}>Mapa em tempo real</h3>
            <ParkMap spots={spots} selId={null} onSpotClick={()=>{}} clickable={false}/>
          </Card>

          {dash.revenueWeek?.length>0&&(
            <Card style={{ padding:16 }}>
              <h3 style={{ fontFamily:F.head, fontSize:13, fontWeight:700, color:C.text, marginBottom:12 }}>Receita — últimos 7 dias</h3>
              {dash.revenueWeek.map(d=>(
                <div key={d._id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
                  <span style={{ fontSize:11, color:C.textM, minWidth:30, fontFamily:F.body }}>{d._id}</span>
                  <div style={{ flex:1, height:4, background:C.bg4, borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", background:C.green, borderRadius:4, width:`${Math.min(100,(d.total/500)*100)}%` }}/>
                  </div>
                  <span style={{ fontSize:11.5, fontWeight:600, color:"#4ADE80", minWidth:56, textAlign:"right", fontFamily:F.body }}>{fmtMoney(d.total)}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* SISTEMA */}
      {!load&&view==="system"&&(
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Card>
            <h3 style={{ fontFamily:F.head, fontSize:14, fontWeight:700, color:C.text, marginBottom:8 }}>Controle de vagas</h3>
            <p style={{ fontSize:13, color:C.textM, fontFamily:F.body, marginBottom:14, lineHeight:1.6 }}>Libera ou ocupa todas as vagas de uma vez.</p>
            <div style={{ display:"flex", gap:9, flexWrap:"wrap" }}>
              <Btn v="success" sm onClick={async()=>{ if(!window.confirm("Liberar todas?"))return; try{await api.resetSpots(false);onSpotsUpdate();}catch(e){alert(e.message);} }}>Liberar todas</Btn>
              <Btn v="danger" sm onClick={async()=>{ if(!window.confirm("Ocupar todas?"))return; try{await api.resetSpots(true);onSpotsUpdate();}catch(e){alert(e.message);} }}>Ocupar todas</Btn>
            </div>
          </Card>
          <Card>
            <h3 style={{ fontFamily:F.head, fontSize:14, fontWeight:700, color:C.text, marginBottom:7 }}>Demonstração ao vivo</h3>
            <p style={{ fontSize:13, color:C.textM, fontFamily:F.body, marginBottom:12 }}>Simula entrada e saída sem o ESP32 conectado.</p>
            {dMsg&&<Notice v="warn" style={{ marginBottom:10 }}>{dMsg}</Notice>}
            <Btn v="amber" sm onClick={runDemo} disabled={dLoad}>{dLoad?<Spin/>:"Iniciar"}</Btn>
          </Card>
          <Card>
            <h3 style={{ fontFamily:F.head, fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>Status do sistema</h3>
            {[
              { l:"Backend API",    v:"Online",                    c:C.green  },
              { l:"Banco de Dados", v:"MongoDB Atlas — conectado", c:C.green  },
              { l:"Frontend",       v:"Vercel — em operação",      c:C.green  },
              { l:"Sensores ESP32", v:`${spots.length} vagas`,     c:C.purple },
              { l:"Polling",        v:"A cada 5 segundos",         c:C.amber  },
            ].map(item=>(
              <div key={item.l} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}`, flexWrap:"wrap", gap:5 }}>
                <span style={{ fontSize:13, color:C.textM, fontFamily:F.body }}>{item.l}</span>
                <Tag label={item.v} color={item.c} bg={item.c===C.green?C.greenL:item.c===C.purple?C.purpleL:C.amberL}/>
              </div>
            ))}
          </Card>
          <Card>
            <h3 style={{ fontFamily:F.head, fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>Estado das vagas</h3>
            {spots.map(s=>{
              const m = SM[s.status]||SM.available;
              return (
                <div key={s._id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${C.border}`, flexWrap:"wrap", gap:5 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:6, height:6, borderRadius:2, background:m.bd }}/>
                    <span style={{ fontSize:13, color:C.text, fontFamily:F.body, fontWeight:500 }}>Vaga {s.row}{s.spotNumber}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ fontSize:10.5, color:C.textL, fontFamily:F.body }}>sensor: {s.sensorOccupied?"ocupado":"livre"}</span>
                    <Tag label={m.lb} color={m.tx} bg={m.bg}/>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* RESERVAS */}
      {!load&&view==="res"&&(
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {fR.length===0&&<p style={{ color:C.textL, fontSize:13, fontFamily:F.body }}>Nenhuma reserva encontrada.</p>}
          {fR.map(r=>(
            <div key={r._id} style={row}>
              <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
                <button onClick={()=>setSelU(r.user)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, fontWeight:600, color:C.blue, fontFamily:F.body }}>{r.user?.nomeCompleto||r.user?.email}</button>
                <Badge color="#A78BFA" bg={C.purpleL}>Vaga {r.spotNumber}</Badge>
                <span style={{ fontSize:12, color:C.textM, fontFamily:F.body }}>às {r.startTimeStr}</span>
                {r.placa&&<Badge color={C.textM} bg={C.bg4}>{r.placa}</Badge>}
                {r.status==="paid"      && <Badge color="#4ADE80" bg={C.greenL}>Pago {fmtMoney(r.totalPrice)}</Badge>}
                {r.status==="cancelled" && <Badge color={C.textL}  bg={C.bg4}>Cancelado</Badge>}
                {r.status==="no_show"   && <Badge color="#F87171" bg={C.redL}>No-show</Badge>}
                {r.status==="active"    && <Badge color="#FCD34D" bg={C.amberL}>Em uso</Badge>}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, color:C.textL, fontFamily:F.body }}>{fmtDate(r.createdAt)}</span>
                {r.status==="active"&&<Btn v="danger" sm onClick={()=>cancelRes(r._id)}>Cancelar</Btn>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* USUÁRIOS */}
      {!load&&view==="users"&&(
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {fU.map(u=>(
            <div key={u._id} style={{ ...row, cursor:"pointer" }} onClick={()=>setSelU(u)}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:u.isAdmin?C.blueL:u.ativo?C.bg4:C.redL, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:u.isAdmin?"#93C5FD":u.ativo?C.textM:"#F87171", fontFamily:F.head, flexShrink:0 }}>
                  {(u.nomeCompleto?.[0]||u.email[0]).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:C.text, margin:0, fontFamily:F.body }}>{u.nomeCompleto||u.email}{u.username&&<span style={{ fontSize:11, color:C.textL, marginLeft:5 }}>@{u.username}</span>}</p>
                  <p style={{ fontSize:11, color:C.textL, margin:0, fontFamily:F.body }}>{u.email}</p>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                {u.isAdmin&&<Badge color="#93C5FD" bg={C.blueL}>Admin</Badge>}
                {!u.ativo&&<Badge color="#F87171" bg={C.redL}>Inativo</Badge>}
                <span style={{ fontSize:11, color:C.textL, fontFamily:F.body }}>{new Date(u.createdAt).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LOGS */}
      {!load&&view==="logs"&&(
        <div>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
            <Btn v="danger" sm onClick={clearLogs}>Apagar todos os logs</Btn>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            {logs.length===0&&<p style={{ color:C.textL, fontSize:13, fontFamily:F.body }}>Nenhum log registrado.</p>}
            {logs.map(l=>(
              <div key={l._id} style={row}>
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <div style={{ width:26, height:26, borderRadius:7, background:C.bg3, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:C.textM, fontFamily:F.head, flexShrink:0 }}>{l.email[0].toUpperCase()}</div>
                  <div>
                    <p style={{ fontSize:12.5, fontWeight:600, color:C.text, margin:0, fontFamily:F.body }}>{l.email}</p>
                    <p style={{ fontSize:11.5, color:C.textM, margin:0, fontFamily:F.body }}>{l.action}</p>
                  </div>
                </div>
                <span style={{ fontSize:11, color:C.textL, fontFamily:F.body }}>{fmtDate(l.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────
// NAV MOBILE — CORRIGIDA
// Sempre visível em telas menores que 768px
// ─────────────────────────────────────────
const MobileNav = ({ tab, setTab, isAdmin }) => {
  const tabs = [
    { id:"overview", label:"Vagas",   icon:"P" },
    { id:"reserve",  label:"Reservar",icon:"+" },
    { id:"payment",  label:"Pagar",   icon:"$" },
    { id:"profile",  label:"Conta",   icon:"U" },
    ...(isAdmin?[{ id:"admin", label:"Admin", icon:"A" }]:[]),
  ];
  return (
    <div className="mob-nav">
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, padding:"9px 4px 7px", border:"none", background:tab===t.id?"#2A2D3A":"transparent", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, transition:"all .12s", borderTop:tab===t.id?`2px solid ${C.blue}`:"2px solid transparent", fontFamily:F.body }}>
          <span style={{ fontSize:13, fontWeight:800, color:tab===t.id?C.blue:C.textL, lineHeight:1, fontFamily:F.head }}>{t.icon}</span>
          <span style={{ fontSize:9, fontWeight:600, letterSpacing:.3, color:tab===t.id?C.blue:C.textL }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [user, setUser]     = useState(null);
  const [spots, setSpots]   = useState([]);
  const [active, setActive] = useState(null);
  const [tab, setTab]       = useState("overview");
  const [boot, setBoot]     = useState(true);
  const [cfg, setCfg]       = useState(CFG);
  const [online, setOnline] = useState(true);
  const [notifs, setNtfs]   = useState([]);
  const prev = useRef([]);

  const addN = (msg, t) => {
    const id = Date.now();
    setNtfs(p=>[...p,{id,msg,t}]);
    setTimeout(()=>setNtfs(p=>p.filter(n=>n.id!==id)),4000);
  };

  useEffect(()=>{
    api.resCfg().then(c=>{CFG=c;setCfg(c);}).catch(()=>{});
    const t = localStorage.getItem("omv_token");
    if (!t){setBoot(false);return;}
    api.me().then(({user})=>{setUser(user);setScreen("app");}).catch(()=>localStorage.removeItem("omv_token")).finally(()=>setBoot(false));
  },[]);

  useEffect(()=>{
    const check=async()=>{const h=await api.health();setOnline(h.status==="ok");};
    check(); const iv=setInterval(check,30000); return()=>clearInterval(iv);
  },[]);

  useEffect(()=>{
    if(!user)return;
    loadSpots(); loadRes();
    const iv=setInterval(loadSpots,5000); return()=>clearInterval(iv);
  },[user]);

  const loadSpots=async()=>{
    try{
      const ns=await api.spots();
      if(prev.current.length){
        ns.forEach(s=>{
          const o=prev.current.find(x=>x._id===s._id);
          if(o&&o.status!==s.status){
            if(s.status==="occupied"||s.status==="reserved") addN(`Vaga ${s.row}${s.spotNumber} ficou ocupada`,"occ");
            else if(s.status==="available"||s.status==="preferential") addN(`Vaga ${s.row}${s.spotNumber} ficou disponível`,"avail");
          }
        });
      }
      prev.current=ns; setSpots(ns);
    }catch{}
  };
  const loadRes=async()=>{try{setActive(await api.myRes());}catch{}};
  const logout=()=>{localStorage.removeItem("omv_token");setUser(null);setSpots([]);setActive(null);setTab("overview");setScreen("landing");};

  if (boot) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{GF+CSS}</style>
      <div style={{textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
        <Spin sz={22}/><p style={{fontFamily:F.head,fontSize:13,color:C.textL,marginTop:4}}>Carregando...</p>
      </div>
    </div>
  );

  if (screen==="landing") return <Landing onEnter={()=>setScreen("login")}/>;
  if (screen==="login")   return <Login onLogin={u=>{setUser(u);setScreen("app");}} onBack={()=>setScreen("landing")}/>;

  const dTabs = [
    {id:"overview",label:"Visão Geral"},
    {id:"reserve", label:"Reservas"},
    {id:"payment", label:"Pagamento"},
    {id:"profile", label:"Minha Conta"},
    ...(user.isAdmin?[{id:"admin",label:"Admin"}]:[]),
  ];
  const titles={overview:"Visão Geral",reserve:"Reservar Vaga",payment:"Pagamento",profile:"Minha Conta",admin:"Painel Admin"};

  return (
    <div style={{width:"100%",minHeight:"100vh",background:C.bg,fontFamily:F.body}}>
      <style>{GF+CSS}</style>
      <Notifs items={notifs}/>

      {/* HEADER DESKTOP */}
      <header className="desk-hdr" style={{background:"#0A0D14",borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:100}}>
        <div style={{padding:"0 44px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:C.blue,boxShadow:`0 0 10px ${C.blue}`}}/>
            <span style={{fontFamily:F.head,fontSize:16,fontWeight:800,color:C.text,letterSpacing:.3}}>OMV</span>
          </div>
          <nav style={{display:"flex",gap:2}}>
            {dTabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                padding:"7px 16px",borderRadius:8,border:"none",
                background:tab===t.id?C.blue:"transparent",
                color:tab===t.id?"#fff":C.textM,
                fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F.body,transition:"all .12s",whiteSpace:"nowrap",
              }}>{t.label}</button>
            ))}
          </nav>
          <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
            <StatusDot on={online}/>
            <div style={{width:1,height:16,background:C.border}}/>
            <div style={{textAlign:"right"}}>
              <p style={{fontSize:12,fontWeight:600,color:C.text,margin:0,fontFamily:F.body}}>{user.nomeCompleto||user.email}</p>
              <p style={{fontSize:10,color:C.textL,margin:0,fontFamily:F.body}}>{user.isAdmin?"Administrador":user.email}</p>
            </div>
            <button onClick={logout} style={{padding:"5px 12px",borderRadius:8,background:C.bg3,color:C.textM,border:`1px solid ${C.border}`,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>Sair</button>
          </div>
        </div>
      </header>

      <main className="page-wrap" style={{padding:"24px 44px"}}>
        <h1 className="page-title" style={{fontFamily:F.head,fontSize:22,fontWeight:800,color:C.text,marginBottom:18,letterSpacing:-.2}}>{titles[tab]}</h1>
        {tab==="overview"&&<OverviewTab spots={spots}/>}
        {tab==="reserve" &&<ReserveTab spots={spots} activeRes={active} onReserved={()=>{loadSpots();loadRes();}} setTab={setTab} cfg={cfg}/>}
        {tab==="payment" &&<PaymentTab activeRes={active} onPaid={()=>{loadSpots();setActive(null);}} cfg={cfg}/>}
        {tab==="profile" &&<ProfileTab user={user} onLogout={logout}/>}
        {tab==="admin"&&user.isAdmin&&<AdminTab spots={spots} onSpotsUpdate={loadSpots}/>}
      </main>

      <MobileNav tab={tab} setTab={setTab} isAdmin={user.isAdmin}/>
    </div>
  );
}
