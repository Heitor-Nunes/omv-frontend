import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────
// API
// ─────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const getToken = () => localStorage.getItem("omv_token");

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erro na requisição");
  return data;
}

const api = {
  register:          (body)             => request("/auth/register", { method:"POST", body:JSON.stringify(body) }),
  login:             (email, pass)      => request("/auth/login",    { method:"POST", body:JSON.stringify({ email, password:pass }) }),
  me:                ()                 => request("/auth/me"),
  spots:             ()                 => request("/spots"),
  myReservation:     ()                 => request("/reservations/mine"),
  myHistory:         ()                 => request("/reservations/history"),
  resConfig:         ()                 => request("/reservations/config"),
  createReservation: (spotId,str,d,p,m) => request("/reservations", { method:"POST", body:JSON.stringify({ spotId, startTimeStr:str, startDate:d, placa:p, modelo:m }) }),
  payReservation:    (id)               => request(`/reservations/${id}/pay`,    { method:"POST" }),
  cancelReservation: (id)               => request(`/reservations/${id}/cancel`, { method:"POST" }),
  adminUsers:        ()                 => request("/admin/users"),
  adminLogs:         ()                 => request("/admin/logs"),
  adminReservations: ()                 => request("/admin/reservations"),
  adminDashboard:    ()                 => request("/admin/dashboard"),
  toggleUser:        (id)               => request(`/admin/users/${id}/toggle`,  { method:"PATCH" }),
  deleteUser:        (id)               => request(`/admin/users/${id}`,         { method:"DELETE" }),
  adminCancelRes:    (id)               => request(`/admin/reservations/${id}/cancel`, { method:"POST" }),
  clearLogs:         ()                 => request("/admin/logs",                { method:"DELETE" }),
  sensorUpdate:      (spotNumber, occ)  => request("/spots/sensor", { method:"POST", body:JSON.stringify({ spotNumber, occupied:occ }) }),
  resetSpots:        (occupied)         => request("/spots/reset",  { method:"POST", body:JSON.stringify({ occupied }) }),
  health:            ()                 => fetch(`${BASE}/health`).then(r=>r.json()).catch(()=>({ status:"error" })),
};

// ─────────────────────────────────────────
// FONTES E ESTILOS GLOBAIS
// ─────────────────────────────────────────
const GF = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&display=swap');`;

const CSS = `
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
html, body { width:100%; min-height:100vh; overflow-x:hidden; font-synthesis:none; -webkit-font-smoothing:antialiased; }
#root { width:100%; min-height:100vh; }
body { background:#F0EBE3; }
html, body, #root { margin:0 !important; padding:0 !important; }

@keyframes spin    { to { transform:rotate(360deg); } }
@keyframes fadeIn  { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:none; } }
@keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
@keyframes slideIn { from { opacity:0; transform:translateX(32px); } to { opacity:1; transform:none; } }
@keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.3} }
@keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.15} }

.fade-in  { animation:fadeIn  .18s ease both; }
.slide-up { animation:slideUp .22s ease both; }
.slide-in { animation:slideIn .26s ease both; }

::-webkit-scrollbar { width:3px; }
::-webkit-scrollbar-thumb { background:#C8B8A8; border-radius:8px; }

.mobile-nav { display:none; }

@media (min-width:769px) {
  .mobile-nav { display:none !important; }
}

@media (max-width:768px) {
  .mobile-nav       { display:flex !important; }
  .desk-header      { display:none !important; }
  .main-pad         { padding:14px 12px 82px !important; }
  .pg-title         { font-size:16px !important; margin-bottom:10px !important; }
  .dash-grid        { grid-template-columns:repeat(2,1fr) !important; gap:7px !important; }
  .form-row         { flex-direction:column !important; gap:0 !important; }
  .pay-wrap         { width:100% !important; flex:none !important; }
  .pay-layout       { flex-direction:column !important; }
  .prof-grid2       { grid-template-columns:1fr !important; }
  .prof-stats       { grid-template-columns:repeat(2,1fr) !important; }
  .spot-row         { gap:3px !important; }
  .spot-item        { flex:1 1 0 !important; padding:6px 3px 5px !important; min-width:0 !important; }
  .park-block       { flex-direction:column !important; gap:4px !important; }
  .park-via         { width:100% !important; height:12px !important; min-height:0 !important; }
  .via-txt          { writing-mode:horizontal-tb !important; font-size:0 !important; }
  .model-grid       { grid-template-columns:repeat(3,1fr) !important; }
  .timer-big        { font-size:30px !important; }
  .fee-row          { flex-wrap:wrap !important; }
  .res-panel        { width:100% !important; }
  .res-layout       { flex-direction:column !important; }
  .notif-area       { right:8px !important; top:56px !important; max-width:calc(100vw - 16px) !important; }
  .comp-grid        { grid-template-columns:1fr !important; }
  .hero-wrap        { padding:36px 16px 28px !important; }
  .hero-h1          { font-size:22px !important; line-height:1.25 !important; }
  .hero-sub         { font-size:13px !important; }
  .hero-cards       { grid-template-columns:1fr !important; gap:8px !important; }
  .about-grid       { grid-template-columns:1fr !important; gap:8px !important; }
  .about-wrap       { padding:36px 16px !important; }
  .land-hdr         { padding:0 14px !important; }
  .land-ftr         { padding:14px !important; flex-direction:column !important; gap:5px !important; text-align:center !important; }
  .sec-cards        { grid-template-columns:1fr !important; }
  .cancel-row       { flex-direction:column !important; gap:8px !important; }
  .admin-tabs       { gap:4px !important; }
  .admin-tab-btn    { padding:6px 12px !important; font-size:12px !important; }
}
@media (max-width:420px) {
  .pg-title   { font-size:14px !important; }
  .timer-big  { font-size:24px !important; }
  .dash-grid  { grid-template-columns:1fr 1fr !important; }
  .hero-h1    { font-size:19px !important; }
  .prof-stats { grid-template-columns:1fr 1fr !important; }
}
`;

const C = {
  bg:"#F0EBE3", card:"#FAF7F3", soft:"#F5F0E8", dark:"#E5DDD0",
  border:"#DDD0BF", borderM:"#C8B8A8",
  text:"#231A10", textM:"#6A5340", textL:"#A08570",
  navy:"#2C1F0E", navyL:"#EDE4D8", navyM:"#5C3D20",
  green:"#3D7A4F", greenL:"#E4F0E8", greenD:"#245C34",
  red:"#A84030", redL:"#F2E8E6", redD:"#7A2820",
  amber:"#8C6008", amberL:"#F0E8D0", amberD:"#6A4806",
  purple:"#6A4C88", purpleL:"#EAE0F5", purpleD:"#40286A",
  teal:"#246868", tealL:"#E0F0F0",
  sh:"0 1px 8px rgba(44,31,14,0.06)",
  shM:"0 4px 20px rgba(44,31,14,0.09)",
};

const SM = {
  available:    { bg:C.greenL,  bd:C.green,  car:C.green,  tx:C.greenD,  lb:"LIVRE"    },
  occupied:     { bg:C.redL,    bd:C.red,    car:C.red,    tx:C.red,     lb:"OCUPADA"  },
  preferential: { bg:C.amberL,  bd:C.amber,  car:C.amber,  tx:C.amberD,  lb:"PREFER."  },
  reserved:     { bg:C.purpleL, bd:C.purple, car:C.purple, tx:C.purpleD, lb:"RESERVADA"},
};

const F = { head:"'Fraunces',serif", body:"'Plus Jakarta Sans',sans-serif" };
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

function buildStartTime(dateStr, timeStr) {
  const now = new Date();
  if (!dateStr || !timeStr) return now;
  const [y,mo,d] = dateStr.split("-").map(Number);
  const [h,m]    = timeStr.split(":").map(Number);
  const chosen   = new Date(y, mo-1, d, h, m, 0, 0);
  if (chosen.getTime() <= now.getTime() + 60000) return now;
  return chosen;
}

// ─────────────────────────────────────────
// UI BASE
// ─────────────────────────────────────────
const Spin = ({ size=18, color=C.navy }) => (
  <div style={{ width:size, height:size, border:`2px solid ${C.border}`, borderTop:`2px solid ${color}`, borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block", flexShrink:0 }}/>
);

const Card = ({ children, style={} }) => (
  <div style={{ background:C.card, borderRadius:16, padding:20, boxShadow:C.shM, border:`1px solid ${C.border}`, ...style }}>{children}</div>
);

const Btn = ({ children, onClick, v="primary", disabled=false, sm=false, full=false, style={} }) => {
  const vs = {
    primary: { bg:C.navy,   color:"#FAF5EE", border:"none" },
    success: { bg:C.green,  color:"#fff",    border:"none" },
    ghost:   { bg:C.dark,   color:C.textM,   border:"none" },
    amber:   { bg:C.amber,  color:"#fff",    border:"none" },
    danger:  { bg:C.red,    color:"#fff",    border:"none" },
    outline: { bg:"transparent", color:C.navy, border:`1.5px solid ${C.navy}` },
    teal:    { bg:C.teal,   color:"#fff",    border:"none" },
    purple:  { bg:C.purple, color:"#fff",    border:"none" },
    muted:   { bg:"transparent", color:C.textL, border:`1px solid ${C.border}` },
  };
  const s = vs[v]||vs.primary;
  return (
    <button onClick={!disabled?onClick:undefined} style={{
      background:s.bg, color:s.color, border:s.border,
      padding:sm?"7px 14px":"11px 20px", borderRadius:10,
      fontSize:sm?12:13.5, fontWeight:600, fontFamily:F.body,
      cursor:disabled?"not-allowed":"pointer", opacity:disabled?.45:1,
      transition:"opacity .12s", display:"inline-flex", alignItems:"center",
      justifyContent:"center", gap:6, width:full?"100%":"auto", flexShrink:0, ...style,
    }}>{children}</button>
  );
};

const Fld = ({ label, req=false, hint="", children }) => (
  <div style={{ marginBottom:12 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
      <label style={{ fontSize:10.5, fontWeight:700, color:C.textM, letterSpacing:.9, textTransform:"uppercase", fontFamily:F.body }}>
        {label}{req&&<span style={{ color:C.red, marginLeft:2 }}>*</span>}
      </label>
      {hint&&<span style={{ fontSize:10, color:C.textL, fontFamily:F.body }}>{hint}</span>}
    </div>
    {children}
  </div>
);

const Inp = ({ value, onChange, placeholder, type="text", onKeyDown, maxLength }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    onKeyDown={onKeyDown} maxLength={maxLength}
    style={{ width:"100%", padding:"10px 13px", borderRadius:9, border:`1.5px solid ${C.border}`,
      fontSize:13.5, fontFamily:F.body, background:C.soft, outline:"none", color:C.text,
      transition:"border-color .12s" }}/>
);

const Err = ({ msg }) => msg ? (
  <div style={{ background:C.redL, border:`1px solid ${C.red}25`, borderRadius:9,
    padding:"9px 13px", marginBottom:12, fontSize:13, color:C.red, fontWeight:500, lineHeight:1.5 }}>
    {msg}
  </div>
) : null;

const Bdg = ({ children, color, bg }) => (
  <span style={{ fontSize:11, background:bg, color, borderRadius:20, padding:"3px 10px", fontWeight:600, fontFamily:F.body, whiteSpace:"nowrap" }}>{children}</span>
);

const InfoBox = ({ color, bg, children, style={} }) => (
  <div style={{ background:bg, border:`1px solid ${color}22`, borderRadius:10, padding:"10px 13px", ...style }}>
    <p style={{ fontSize:12.5, color, lineHeight:1.65, margin:0, fontFamily:F.body }}>{children}</p>
  </div>
);

const Divider = ({ label="" }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, margin:"13px 0" }}>
    <div style={{ flex:1, height:1, background:C.border }}/>
    {label&&<span style={{ fontSize:10, color:C.textL, fontFamily:F.body, letterSpacing:.9, textTransform:"uppercase", whiteSpace:"nowrap" }}>{label}</span>}
    <div style={{ flex:1, height:1, background:C.border }}/>
  </div>
);

const Dot = ({ on }) => (
  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
    <div style={{ width:7, height:7, borderRadius:"50%", background:on?C.green:C.red, animation:on?"none":"blink 1.5s infinite", flexShrink:0 }}/>
    <span style={{ fontSize:11, color:on?C.green:C.red, fontWeight:600, fontFamily:F.body }}>{on?"Online":"Offline"}</span>
  </div>
);

// ─────────────────────────────────────────
// NOTIFICAÇÕES
// ─────────────────────────────────────────
const Notifs = ({ items }) => {
  if (!items.length) return null;
  return (
    <div className="notif-area" style={{ position:"fixed", top:66, right:14, zIndex:500, display:"flex", flexDirection:"column", gap:7, maxWidth:290 }}>
      {items.map(n=>(
        <div key={n.id} className="slide-in" style={{
          background:n.type==="occupied"?C.redL:C.greenL,
          border:`1px solid ${n.type==="occupied"?C.red:C.green}`,
          borderRadius:10, padding:"9px 13px", boxShadow:C.shM,
          display:"flex", alignItems:"center", gap:9,
        }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:n.type==="occupied"?C.red:C.green, flexShrink:0 }}/>
          <p style={{ fontSize:12.5, color:C.text, margin:0, fontFamily:F.body, lineHeight:1.4 }}>{n.msg}</p>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────
// CAR SVG
// ─────────────────────────────────────────
const Car = ({ color="currentColor", size=30 }) => (
  <svg width={size} height={size*1.35} viewBox="0 0 40 54" fill="none">
    <rect x="10" y="8"  width="20" height="36" rx="5" fill={color}/>
    <rect x="12" y="6"  width="16" height="6"  rx="3" fill={color}/>
    <rect x="12" y="43" width="16" height="6"  rx="3" fill={color}/>
    <rect x="3"  y="13" width="7"  height="9"  rx="2" fill={color} opacity=".65"/>
    <rect x="30" y="13" width="7"  height="9"  rx="2" fill={color} opacity=".65"/>
    <rect x="3"  y="28" width="7"  height="9"  rx="2" fill={color} opacity=".65"/>
    <rect x="30" y="28" width="7"  height="9"  rx="2" fill={color} opacity=".65"/>
    <rect x="14" y="18" width="12" height="7"  rx="2" fill="white" opacity=".22"/>
  </svg>
);

// ─────────────────────────────────────────
// SPOT CARD
// ─────────────────────────────────────────
const SpotCard = ({ spot, isSel, onClick, clickable }) => {
  const m   = SM[spot.status]||SM.available;
  const can = clickable&&(spot.status==="available"||spot.status==="preferential");
  return (
    <div className="spot-item" onClick={can?()=>onClick(spot):undefined} style={{
      background:isSel?m.bd:m.bg, border:`1.5px solid ${m.bd}`, borderRadius:11,
      padding:"8px 5px 6px", display:"flex", flexDirection:"column",
      alignItems:"center", gap:3, cursor:can?"pointer":"default",
      transition:"transform .15s, box-shadow .15s",
      boxShadow:isSel?`0 4px 16px ${m.bd}44`:C.sh,
      transform:isSel?"scale(1.07)":"scale(1)", flex:"1 1 0", minWidth:58, userSelect:"none",
    }}>
      <span style={{ fontSize:8.5, fontWeight:700, color:isSel?"#fff":m.tx, letterSpacing:.7, fontFamily:F.body }}>{spot.row}{spot.spotNumber}</span>
      <Car size={22} color={isSel?"#fff":m.car}/>
      <span style={{ fontSize:7.5, fontWeight:700, color:isSel?"rgba(255,255,255,.8)":m.tx, letterSpacing:.4, textTransform:"uppercase", fontFamily:F.body }}>{m.lb}</span>
    </div>
  );
};

// ─────────────────────────────────────────
// PARKING GRID
// ─────────────────────────────────────────
const ParkGrid = ({ spots, selId, onSpotClick, clickable=false }) => {
  const Road = ({ label }) => (
    <div style={{ height:20, background:C.dark, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"50%", left:0, right:0, height:2, background:`repeating-linear-gradient(to right,${C.soft} 0,${C.soft} 10px,transparent 10px,transparent 22px)`, transform:"translateY(-50%)"}}/>
      <span style={{ fontSize:8, fontWeight:700, color:C.textL, letterSpacing:2, textTransform:"uppercase", position:"relative", fontFamily:F.body }}>{label}</span>
    </div>
  );
  const RowSpots = ({ row }) => (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:4 }}>
        <span style={{ fontSize:8.5, fontWeight:700, color:C.borderM, fontFamily:F.body }}>{row}</span>
        <div style={{ flex:1, height:1, background:C.border }}/>
      </div>
      <div className="spot-row" style={{ display:"flex", gap:4 }}>
        {spots.filter(s=>s.row===row).map(s=><SpotCard key={s._id} spot={s} isSel={selId===s._id} onClick={onSpotClick} clickable={clickable}/>)}
      </div>
    </div>
  );
  const Via = () => (
    <div className="park-via" style={{ width:24, background:C.dark, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", flexShrink:0, minHeight:60 }}>
      <div style={{ position:"absolute", left:"50%", top:0, bottom:0, width:1.5, background:`repeating-linear-gradient(to bottom,${C.soft} 0,${C.soft} 8px,transparent 8px,transparent 18px)`, transform:"translateX(-50%)"}}/>
      <span className="via-txt" style={{ fontSize:6.5, fontWeight:700, color:C.textL, textTransform:"uppercase", fontFamily:F.body, writingMode:"vertical-rl", position:"relative" }}>Via</span>
    </div>
  );
  const Block = ({ l, r, ll, rl }) => (
    <div className="park-block" style={{ display:"flex", gap:0, alignItems:"stretch" }}>
      <div style={{ flex:1, background:C.soft, borderRadius:10, padding:"8px 6px", border:`1px solid ${C.border}`, minWidth:0 }}>
        <div style={{ fontSize:7.5, fontWeight:700, color:C.amberD, letterSpacing:.9, textTransform:"uppercase", fontFamily:F.body, marginBottom:5, textAlign:"center" }}>{ll}</div>
        <RowSpots row={l}/>
      </div>
      <Via/>
      <div style={{ flex:1, background:C.soft, borderRadius:10, padding:"8px 6px", border:`1px solid ${C.border}`, minWidth:0 }}>
        <div style={{ fontSize:7.5, fontWeight:700, color:C.navyM, letterSpacing:.9, textTransform:"uppercase", fontFamily:F.body, marginBottom:5, textAlign:"center" }}>{rl}</div>
        <RowSpots row={r}/>
      </div>
    </div>
  );
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <div style={{ display:"flex", gap:10, marginBottom:5, flexWrap:"wrap" }}>
        {Object.entries(SM).map(([k,m])=>(
          <div key={k} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <div style={{ width:7, height:7, borderRadius:2, background:m.bd }}/>
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
    <header className="land-hdr" style={{ background:C.card, borderBottom:`1px solid ${C.border}`, padding:"0 44px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
      <span style={{ fontFamily:F.head, fontSize:17, fontWeight:700, color:C.navy }}>Estacionamento OMV</span>
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <button onClick={()=>document.getElementById("sobre").scrollIntoView({behavior:"smooth"})} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:C.textM, fontFamily:F.body, fontWeight:500 }}>Sobre</button>
        <Btn onClick={onEnter} sm>Acessar o sistema</Btn>
      </div>
    </header>

    <div className="hero-wrap" style={{ maxWidth:820, margin:"0 auto", padding:"60px 24px 40px", textAlign:"center" }}>
      <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:C.greenL, border:`1px solid ${C.green}28`, borderRadius:20, padding:"5px 14px", marginBottom:20 }}>
        <div style={{ width:7, height:7, borderRadius:"50%", background:C.green, animation:"pulse 2s infinite" }}/>
        <span style={{ fontSize:11.5, color:C.greenD, fontWeight:600, fontFamily:F.body }}>Sistema em operação</span>
      </div>
      <h1 className="hero-h1" style={{ fontFamily:F.head, fontSize:38, fontWeight:700, color:C.navy, lineHeight:1.2, marginBottom:16 }}>
        Projeto OMV — Otimização e<br/>Monitoramento de Vagas
      </h1>
      <p className="hero-sub" style={{ fontSize:15.5, color:C.textL, maxWidth:500, margin:"0 auto 28px", lineHeight:1.75, fontFamily:F.body }}>
        Sistema inteligente de gestão de estacionamentos que integra sensores físicos, servidor em nuvem e plataforma web para otimizar o fluxo de veículos em tempo real.
      </p>
      <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
        <Btn onClick={onEnter} style={{ padding:"11px 28px", fontSize:14 }}>Entrar no sistema</Btn>
        <Btn v="muted" onClick={()=>document.getElementById("sobre").scrollIntoView({behavior:"smooth"})} style={{ padding:"11px 28px", fontSize:14 }}>Saiba mais</Btn>
      </div>
    </div>

    <div style={{ maxWidth:860, margin:"0 auto", padding:"0 24px 44px" }}>
      <div className="hero-cards" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        {[
          { title:"Camada Física", desc:"Maquete 3D com 12 vagas, sensores HC-SR04 em cada vaga e ESP32 enviando dados via Wi-Fi em tempo real." },
          { title:"Servidor Backend", desc:"Node.js com MongoDB Atlas hospedado no Render. Gerencia reservas, usuários, pagamentos e regras automáticas." },
          { title:"Plataforma Web", desc:"Site responsivo em React com mapa ao vivo, reservas antecipadas, cronômetro de uso e painel administrativo." },
        ].map(c=>(
          <div key={c.title} style={{ background:C.card, borderRadius:14, padding:"18px 16px", border:`1px solid ${C.border}`, boxShadow:C.sh }}>
            <h3 style={{ fontFamily:F.head, fontSize:14.5, fontWeight:600, color:C.navy, marginBottom:7 }}>{c.title}</h3>
            <p style={{ fontSize:12.5, color:C.textL, lineHeight:1.7, margin:0, fontFamily:F.body }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>

    <div id="sobre" className="about-wrap" style={{ background:C.card, borderTop:`1px solid ${C.border}`, padding:"54px 24px" }}>
      <div style={{ maxWidth:820, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:34 }}>
          <h2 style={{ fontFamily:F.head, fontSize:26, fontWeight:700, color:C.navy, marginBottom:10 }}>Sobre o Projeto</h2>
          <p style={{ fontSize:13.5, color:C.textM, lineHeight:1.85, maxWidth:640, margin:"0 auto", fontFamily:F.body }}>
            O <strong>OMV</strong> é um projeto de conclusão do Curso Técnico em Eletrônica. O sistema aplica em prática conceitos de IoT, sistemas embarcados e desenvolvimento web para resolver um problema real: a ausência de controle eficiente em estacionamentos privados, que gera congestionamento, perda de tempo e prejuízo para clientes e operadores.
          </p>
        </div>

        <div style={{ background:C.soft, borderRadius:14, padding:"20px 22px", marginBottom:18, border:`1px solid ${C.border}` }}>
          <h3 style={{ fontFamily:F.head, fontSize:15, fontWeight:700, color:C.navy, marginBottom:9 }}>Contexto e Motivação</h3>
          <p style={{ fontSize:13, color:C.textM, lineHeight:1.85, margin:0, fontFamily:F.body }}>
            Estacionamentos que negligenciam a organização de seus espaços geram congestionamentos internos e sobrecarga dos operadores. A aplicação de microcontroladores, sensores de presença e plataformas em nuvem permite desenvolver soluções acessíveis e aplicáveis em contextos reais, integrando o ambiente físico ao digital por meio da Internet das Coisas.
          </p>
        </div>

        <div className="about-grid" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12, marginBottom:20 }}>
          {[
            { title:"Maquete Física", desc:"Impressa em PLA via impressora 3D, representa um estacionamento com 12 vagas em 4 avenidas. Cada vaga tem um sensor HC-SR04 embutido. Dois ESP32 coletam as leituras e enviam ao servidor via Wi-Fi. Displays LCD nas entradas de cada avenida exibem vagas disponíveis em tempo real." },
            { title:"Backend e Banco de Dados", desc:"Servidor Node.js com Express hospedado no Render.com. MongoDB Atlas armazena usuários, reservas e logs. Processa dados dos sensores, gerencia reservas, aplica taxa fixa, monitora comparecimento com tolerância de 5 minutos e registra multas por no-show." },
            { title:"Plataforma Web", desc:"Site responsivo em React e Vite hospedado no Vercel. Para clientes: mapa ao vivo, reservas antecipadas, cronômetro de uso e pagamento digital. Para operadores: dashboard com métricas, mapa ao vivo, gestão de reservas e usuários, logs e ferramentas de controle." },
            { title:"Identificação por RFID", desc:"Tags RFID nos carrinhos da maquete substituem placas de veículos. Um leitor RC522 na entrada de cada vaga lê a tag e o ESP32 envia o ID ao backend, que verifica se corresponde ao veículo registrado na reserva — reproduzindo em escala reduzida o reconhecimento óptico de placas." },
          ].map(i=>(
            <div key={i.title} style={{ background:C.soft, borderRadius:12, padding:"16px 15px", border:`1px solid ${C.border}` }}>
              <h4 style={{ fontFamily:F.head, fontSize:13.5, fontWeight:700, color:C.navy, marginBottom:7 }}>{i.title}</h4>
              <p style={{ fontSize:12.5, color:C.textL, lineHeight:1.75, margin:0, fontFamily:F.body }}>{i.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ background:C.navyL, borderRadius:14, padding:"18px 20px", marginBottom:16, border:`1px solid ${C.navy}18` }}>
          <h3 style={{ fontFamily:F.head, fontSize:15, fontWeight:700, color:C.navy, marginBottom:12 }}>Segurança e Regras Automatizadas</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:9 }}>
            {[
              { title:"Taxa de reserva", desc:`R$ ${CFG.reservationFee||10},00 cobrados na confirmação, garantindo intenção real de uso.` },
              { title:"Tolerância de chegada", desc:`${CFG.toleranceMinutes||5} minutos após o horário reservado para o sensor detectar o veículo.` },
              { title:"No-show automático", desc:"Sem detecção no prazo, a vaga é liberada e uma multa é aplicada automaticamente." },
              { title:"Cancelamento inteligente", desc:"Cancelamento com mais de 15 min de antecedência reembolsa a taxa. Tardio retém o valor." },
            ].map(s=>(
              <div key={s.title} style={{ background:"rgba(255,255,255,.55)", borderRadius:9, padding:"11px 13px" }}>
                <p style={{ fontSize:12.5, fontWeight:700, color:C.navy, margin:"0 0 4px", fontFamily:F.body }}>{s.title}</p>
                <p style={{ fontSize:12, color:C.textM, margin:0, lineHeight:1.6, fontFamily:F.body }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign:"center", marginTop:28 }}>
          <Btn onClick={onEnter} style={{ padding:"11px 32px", fontSize:14 }}>Acessar o sistema</Btn>
        </div>
      </div>
    </div>

    <footer className="land-ftr" style={{ background:C.dark, borderTop:`1px solid ${C.border}`, padding:"16px 44px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
      <span style={{ fontFamily:F.head, fontSize:13, fontWeight:600, color:C.navy }}>Estacionamento OMV</span>
      <span style={{ fontSize:11.5, color:C.textL, fontFamily:F.body }}>Projeto de TCC — Curso Técnico em Eletrônica</span>
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
  const set = k => e => { let v=e.target.value; if(k==="cpf") v=fmtCPF(v); if(k==="telefone") v=fmtTel(v); setForm(p=>({...p,[k]:v})); setErr(""); };
  const submit = async () => {
    setLoad(true); setErr("");
    try {
      let token, user;
      if (mode==="login") { ({ token, user } = await api.login(form.email.trim(), form.password)); }
      else {
        if (!form.nomeCompleto||!form.username||!form.cpf||!form.endereco||!form.email||!form.password) { setErr("Preencha todos os campos obrigatórios."); setLoad(false); return; }
        ({ token, user } = await api.register({ ...form, email:form.email.trim(), username:form.username.trim() }));
      }
      localStorage.setItem("omv_token", token); onLogin(user);
    } catch(e) { setErr(e.message); } finally { setLoad(false); }
  };
  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:F.body, padding:"24px 16px" }}>
      <style>{GF+CSS}</style>
      <button onClick={onBack} style={{ position:"fixed", top:18, left:18, background:"none", border:"none", cursor:"pointer", color:C.textL, fontSize:13, fontFamily:F.body, display:"flex", alignItems:"center", gap:3 }}>← Voltar</button>
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ fontFamily:F.head, fontSize:22, fontWeight:700, color:C.navy, marginBottom:3 }}>Estacionamento OMV</div>
        <p style={{ fontSize:12.5, color:C.textL }}>Sistema Inteligente de Estacionamento</p>
      </div>
      <div className="slide-up" style={{ background:C.card, borderRadius:18, padding:"28px 26px", boxShadow:C.shM, border:`1px solid ${C.border}`, width:"100%", maxWidth:420 }}>
        <h1 style={{ fontFamily:F.head, fontSize:20, fontWeight:700, color:C.navy, marginBottom:3 }}>{mode==="login"?"Bem-vindo de volta":"Criar conta"}</h1>
        <p style={{ color:C.textL, fontSize:13, marginBottom:18 }}>{mode==="login"?"Acesse para reservar sua vaga.":"Preencha seus dados para se cadastrar."}</p>
        {mode==="register"&&<>
          <Fld label="Nome Completo" req><Inp value={form.nomeCompleto} onChange={set("nomeCompleto")} placeholder="João da Silva"/></Fld>
          <div className="form-row" style={{ display:"flex", gap:9 }}>
            <div style={{ flex:1 }}><Fld label="Usuário" req><Inp value={form.username} onChange={set("username")} placeholder="joaosilva"/></Fld></div>
            <div style={{ flex:1 }}><Fld label="Telefone"><Inp value={form.telefone} onChange={set("telefone")} placeholder="(11) 99999-0000"/></Fld></div>
          </div>
          <div className="form-row" style={{ display:"flex", gap:9 }}>
            <div style={{ flex:1 }}><Fld label="CPF" req><Inp value={form.cpf} onChange={set("cpf")} placeholder="000.000.000-00"/></Fld></div>
            <div style={{ flex:1 }}><Fld label="Endereço" req><Inp value={form.endereco} onChange={set("endereco")} placeholder="Rua, nº — Cidade"/></Fld></div>
          </div>
        </>}
        <Fld label="Email" req><Inp value={form.email} onChange={set("email")} placeholder="seu@email.com" onKeyDown={e=>e.key==="Enter"&&submit()}/></Fld>
        <Fld label="Senha" req><Inp type="password" value={form.password} onChange={set("password")} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()}/></Fld>
        <Err msg={err}/>
        <Btn onClick={submit} disabled={load} full style={{ padding:"12px", fontSize:14, marginTop:2 }}>{load?<Spin color="#FAF5EE"/>:(mode==="login"?"Entrar":"Criar conta")}</Btn>
        <p style={{ textAlign:"center", marginTop:14, fontSize:13, color:C.textL }}>
          {mode==="login"?"Ainda não tem conta? ":"Já tem conta? "}
          <span onClick={()=>{setMode(mode==="login"?"register":"login");setErr("");}} style={{ color:C.navy, fontWeight:600, cursor:"pointer", textDecoration:"underline", textUnderlineOffset:2 }}>
            {mode==="login"?"Cadastre-se":"Entrar"}
          </span>
        </p>
        {mode==="login"&&(
          <div style={{ marginTop:16, background:C.navyL, borderRadius:10, padding:"11px 13px" }}>
            <p style={{ fontSize:10.5, color:C.navyM, fontWeight:700, marginBottom:2, letterSpacing:.8, textTransform:"uppercase" }}>Acesso Admin</p>
            <p style={{ fontSize:12, color:C.textM, lineHeight:1.8 }}><strong style={{ color:C.navy }}>admin@omv.com</strong> / <strong style={{ color:C.navy }}>admin123</strong></p>
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
      <div className="prof-stats" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:9, marginBottom:13 }}>
        {[
          { label:"Livres",        value:avail,        color:C.green,  bg:C.greenL  },
          { label:"Ocupadas",      value:occ,          color:C.red,    bg:C.redL    },
          { label:"Preferenciais", value:pref,         color:C.amber,  bg:C.amberL  },
          { label:"Total",         value:spots.length, color:C.navyM,  bg:C.navyL   },
        ].map(p=>(
          <div key={p.label} style={{ background:p.bg, borderRadius:11, padding:"11px 13px", border:`1px solid ${p.color}28` }}>
            <div style={{ fontSize:22, fontFamily:F.head, fontWeight:700, color:p.color, lineHeight:1 }}>{p.value}</div>
            <div style={{ fontSize:9.5, color:p.color, fontWeight:600, marginTop:2, letterSpacing:.5, textTransform:"uppercase", fontFamily:F.body }}>{p.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background:C.card, borderRadius:12, padding:"11px 14px", marginBottom:13, border:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
          <span style={{ fontSize:12, fontWeight:600, color:C.textM, fontFamily:F.body }}>Taxa de ocupação</span>
          <span style={{ fontSize:12, fontWeight:700, color:pct>70?C.red:pct>40?C.amber:C.green, fontFamily:F.body }}>{pct}%</span>
        </div>
        <div style={{ height:6, background:C.dark, borderRadius:20, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, borderRadius:20, transition:"width .6s ease", background:pct>70?C.red:pct>40?C.amber:C.green }}/>
        </div>
        <p style={{ fontSize:11, color:C.textL, marginTop:4, fontFamily:F.body }}>
          {pct>70?"Estacionamento quase cheio":pct>40?"Ocupação moderada":"Boa disponibilidade de vagas"}
        </p>
      </div>
      <ParkGrid spots={spots} selId={null} onSpotClick={()=>{}} clickable={false}/>
    </div>
  );
};

// ─────────────────────────────────────────
// RESERVAS
// ─────────────────────────────────────────
const ReserveTab = ({ spots, activeRes, onReserved, setTab, cfg }) => {
  const [sel, setSel]       = useState(null);
  const [date, setDate]     = useState(todayStr());
  const [time, setTime]     = useState(nowTime());
  const [placa, setPlaca]   = useState("");
  const [modelo, setModelo] = useState("");
  const [err, setErr]       = useState("");
  const [load, setLoad]     = useState(false);
  const [step, setStep]     = useState(1);
  const [cancelLoad, setCancelLoad]     = useState(false);
  const [cancelResult, setCancelResult] = useState(null);
  const MODELOS = ["HB20","Onix","Gol","Argo","Mobi","Kwid","Creta","T-Cross","Compass","Tracker","Outros"];

  const handleConfirm = async () => {
    if (!time||!date) { setErr("Selecione data e horário."); return; }
    const start = buildStartTime(date, time);
    const tStr  = `${String(start.getHours()).padStart(2,"0")}:${String(start.getMinutes()).padStart(2,"0")}`;
    const dStr  = start.toISOString().split("T")[0];
    setLoad(true); setErr("");
    try { await api.createReservation(sel._id, tStr, dStr, placa, modelo); onReserved(); setTab("payment"); }
    catch(e) { setErr(e.message); } finally { setLoad(false); }
  };

  const handleCancel = async () => {
    if (!window.confirm("Deseja cancelar sua reserva?")) return;
    setCancelLoad(true);
    try { const r = await api.cancelReservation(activeRes._id); setCancelResult(r); onReserved(); }
    catch(e) { alert(e.message); } finally { setCancelLoad(false); }
  };

  if (cancelResult) return (
    <div style={{ maxWidth:420, margin:"0 auto" }}>
      <Card>
        <div style={{ textAlign:"center", padding:"10px 0 13px" }}>
          <div style={{ fontSize:36, marginBottom:10 }}>{cancelResult.feeRefunded?"✓":"—"}</div>
          <p style={{ fontFamily:F.head, fontSize:17, fontWeight:700, color:C.navy, marginBottom:6 }}>Reserva cancelada</p>
          {cancelResult.feeRefunded
            ? <p style={{ fontSize:13, color:C.green, fontFamily:F.body }}>Taxa de reserva reembolsada — cancelamento com mais de 15 min de antecedência.</p>
            : <p style={{ fontSize:13, color:C.red, fontFamily:F.body }}>Taxa de reserva de <strong>{fmtMoney(cfg.reservationFee)}</strong> retida por cancelamento tardio.</p>
          }
        </div>
        <Btn full onClick={()=>{setCancelResult(null);setStep(1);}} v="ghost">Fechar</Btn>
      </Card>
    </div>
  );

  if (activeRes) return (
    <div style={{ maxWidth:440, margin:"0 auto" }}>
      <Card style={{ borderLeft:`3px solid ${activeRes.status==="no_show"?C.red:C.purple}` }}>
        {activeRes.status==="no_show"?(
          <>
            <InfoBox color={C.red} bg={C.redL} style={{ marginBottom:13 }}>
              <strong>No-show detectado.</strong> Você não compareceu no horário reservado. Multa de <strong>{fmtMoney(cfg.noShowFine)}</strong> aplicada.
            </InfoBox>
            <Btn v="danger" full onClick={()=>setTab("payment")}>Pagar multa — {fmtMoney(cfg.noShowFine)}</Btn>
          </>
        ):(
          <>
            <div style={{ marginBottom:13 }}>
              <p style={{ fontFamily:F.head, fontWeight:600, fontSize:16, color:C.purpleD, margin:"0 0 3px" }}>Reserva ativa</p>
              <p style={{ fontSize:13, color:C.purple, margin:0, fontFamily:F.body }}>Vaga {activeRes.spotNumber} — às {activeRes.startTimeStr}</p>
              {activeRes.placa&&<p style={{ fontSize:12, color:C.purple, margin:"2px 0 0", fontFamily:F.body }}>{activeRes.placa}{activeRes.modelo&&` — ${activeRes.modelo}`}</p>}
            </div>
            <InfoBox color={C.amberD} bg={C.amberL} style={{ marginBottom:13 }}>
              Tolerância de <strong>{cfg.toleranceMinutes} min</strong> para chegada. Sem detecção no prazo, a vaga é liberada e uma multa de <strong>{fmtMoney(cfg.noShowFine)}</strong> é aplicada.
            </InfoBox>
            <div className="cancel-row" style={{ display:"flex", gap:8 }}>
              <Btn v="outline" full onClick={()=>setTab("payment")} style={{ borderColor:C.purple, color:C.purpleD }}>Ir para pagamento</Btn>
              <Btn v="muted" onClick={handleCancel} disabled={cancelLoad} style={{ flexShrink:0 }}>{cancelLoad?<Spin/>:"Cancelar reserva"}</Btn>
            </div>
          </>
        )}
      </Card>
    </div>
  );

  return (
    <div>
      {step===1?(
        <div className="res-layout" style={{ display:"flex", gap:18, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:13, color:C.textL, marginBottom:10, lineHeight:1.6, fontFamily:F.body }}>
              Selecione uma vaga <span style={{ color:C.green, fontWeight:600 }}>livre</span> ou <span style={{ color:C.amber, fontWeight:600 }}>preferencial</span> no mapa.
            </p>
            <ParkGrid spots={spots} selId={sel?._id} onSpotClick={s=>{setSel(p=>p?._id===s._id?null:s);setErr("");}} clickable={true}/>
          </div>
          {sel&&(
            <div className="res-panel slide-up" style={{ width:220, flexShrink:0 }}>
              <Card>
                <div style={{ paddingBottom:11, marginBottom:11, borderBottom:`1px solid ${C.border}` }}>
                  <p style={{ fontSize:10, color:C.textL, textTransform:"uppercase", letterSpacing:.8, margin:"0 0 2px", fontFamily:F.body }}>Vaga selecionada</p>
                  <p style={{ fontSize:22, fontFamily:F.head, fontWeight:700, color:C.navy, margin:0 }}>{sel.row}{sel.spotNumber}</p>
                </div>
                <p style={{ fontSize:11, color:C.textL, fontFamily:F.body, marginBottom:2 }}>Taxa de reserva</p>
                <p style={{ fontSize:18, fontFamily:F.head, fontWeight:700, color:C.navy, marginBottom:1 }}>{fmtMoney(cfg.reservationFee)}</p>
                <p style={{ fontSize:10.5, color:C.textL, fontFamily:F.body, marginBottom:12 }}>+ {fmtMoney(cfg.pricePerHour)}/hora de uso</p>
                <Btn full onClick={()=>setStep(2)} style={{ marginBottom:6 }}>Continuar</Btn>
                <Btn v="ghost" full onClick={()=>setSel(null)}>Cancelar</Btn>
              </Card>
            </div>
          )}
        </div>
      ):(
        <div style={{ maxWidth:400, margin:"0 auto" }} className="slide-up">
          <button onClick={()=>setStep(1)} style={{ background:"none", border:"none", cursor:"pointer", color:C.textL, fontSize:13, fontFamily:F.body, marginBottom:12, display:"flex", alignItems:"center", gap:3 }}>← Voltar ao mapa</button>
          <Card>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:13, background:C.soft, borderRadius:9, padding:"10px 12px" }}>
              <div>
                <p style={{ fontSize:10, color:C.textL, textTransform:"uppercase", letterSpacing:.8, margin:0, fontFamily:F.body }}>Vaga</p>
                <p style={{ fontSize:18, fontFamily:F.head, fontWeight:700, color:C.navy, margin:0 }}>{sel?.row}{sel?.spotNumber}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontSize:10, color:C.textL, margin:0, fontFamily:F.body }}>Taxa + Uso</p>
                <p style={{ fontSize:13, fontWeight:700, color:C.navy, fontFamily:F.head, margin:0 }}>{fmtMoney(cfg.reservationFee)} + {fmtMoney(cfg.pricePerHour)}/h</p>
              </div>
            </div>
            <InfoBox color={C.amberD} bg={C.amberL} style={{ marginBottom:12 }}>
              Taxa de <strong>{fmtMoney(cfg.reservationFee)}</strong> cobrada ao confirmar. Tolerância de <strong>{cfg.toleranceMinutes} min</strong>. Cancelamento com +15 min reembolsa a taxa.
            </InfoBox>
            <Divider label="Quando vai usar?"/>
            <div className="form-row" style={{ display:"flex", gap:9 }}>
              <div style={{ flex:1 }}>
                <Fld label="Data" req>
                  <input type="date" value={date} min={todayStr()} onChange={e=>setDate(e.target.value)} style={{ width:"100%", padding:"9px 11px", borderRadius:9, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:F.body, background:C.soft, color:C.text, outline:"none" }}/>
                </Fld>
              </div>
              <div style={{ flex:1 }}>
                <Fld label="Horário" req hint="início">
                  <input type="time" value={time} onChange={e=>setTime(e.target.value)} style={{ width:"100%", padding:"9px 11px", borderRadius:9, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:F.body, background:C.soft, color:C.text, outline:"none" }}/>
                </Fld>
              </div>
            </div>
            <Divider label="Veículo (opcional)"/>
            <Fld label="Placa" hint="Ex: ABC1234">
              <Inp value={placa} onChange={e=>setPlaca(fmtPlaca(e.target.value))} placeholder="ABC1234" maxLength={7}/>
            </Fld>
            <Fld label="Modelo">
              <div className="model-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:5 }}>
                {MODELOS.map(mod=>(
                  <button key={mod} onClick={()=>setModelo(m=>m===mod?"":mod)} style={{ padding:"6px 3px", borderRadius:8, textAlign:"center", border:`1.5px solid ${modelo===mod?C.navy:C.border}`, background:modelo===mod?C.navy:"transparent", color:modelo===mod?"#FAF5EE":C.textM, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:F.body, transition:"all .12s" }}>{mod}</button>
                ))}
              </div>
            </Fld>
            <Err msg={err}/>
            <div style={{ display:"flex", gap:7, marginTop:8 }}>
              <Btn onClick={handleConfirm} disabled={load} full>{load?<Spin color="#FAF5EE"/>:`Confirmar — ${fmtMoney(cfg.reservationFee)}`}</Btn>
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
  const handlePay = () => { setStep(3); setTimeout(onConfirm, 2200); };
  const inpStyle  = { width:"100%", padding:"9px 11px", borderRadius:8, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:F.body, background:C.soft, color:C.text, outline:"none" };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(35,26,16,.55)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
      <div className="slide-up" style={{ background:C.card, borderRadius:18, padding:24, maxWidth:380, width:"100%", boxShadow:C.shM }} onClick={e=>e.stopPropagation()}>
        {step===3?(
          <div style={{ textAlign:"center", padding:"14px 0" }}>
            <Spin size={36} color={C.green}/>
            <p style={{ fontFamily:F.head, fontSize:16, fontWeight:600, color:C.navy, marginTop:14 }}>Processando pagamento...</p>
          </div>
        ):(
          <>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:13 }}>
              <h2 style={{ fontFamily:F.head, fontSize:16, fontWeight:700, color:C.navy }}>{label||"Confirmar Pagamento"}</h2>
              <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, color:C.textL, lineHeight:1 }}>✕</button>
            </div>
            <div style={{ background:C.greenL, borderRadius:10, padding:"10px 14px", marginBottom:13, textAlign:"center" }}>
              <p style={{ fontSize:10, color:C.greenD, textTransform:"uppercase", letterSpacing:.8, fontFamily:F.body, margin:0 }}>Total a pagar</p>
              <p style={{ fontSize:26, fontFamily:F.head, fontWeight:700, color:C.green, margin:0 }}>R$ {price}</p>
            </div>
            {step===1&&(
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  { key:"pix",  title:"PIX",          sub:"Aprovação instantânea",  border:C.border,  bg:C.soft   },
                  { key:"card", title:"Cartão",        sub:"Crédito ou débito",      border:C.border,  bg:C.soft   },
                  { key:"demo", title:"Modo Demo",     sub:"Para fins de demonstração", border:C.amber, bg:C.amberL },
                ].map(opt=>(
                  <button key={opt.key} onClick={()=>{if(opt.key==="demo"){handlePay();}else{setMethod(opt.key);setStep(2);}}} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 13px", borderRadius:11, border:`1.5px solid ${opt.border}`, background:opt.bg, cursor:"pointer", textAlign:"left" }}>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:C.navy, margin:0, fontFamily:F.body }}>{opt.title}</p>
                      <p style={{ fontSize:11, color:C.textL, margin:0, fontFamily:F.body }}>{opt.sub}</p>
                    </div>
                    <span style={{ color:C.textL, fontSize:14 }}>›</span>
                  </button>
                ))}
              </div>
            )}
            {step===2&&method==="pix"&&(
              <div>
                <div style={{ background:C.soft, borderRadius:11, padding:13, marginBottom:12, textAlign:"center" }}>
                  <div style={{ width:112, height:112, margin:"0 auto 8px", background:C.navy, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, padding:7 }}>
                      {Array.from({length:49}).map((_,i)=><div key={i} style={{ width:9, height:9, background:Math.random()>.45?"#FAF5EE":"transparent", borderRadius:1 }}/>)}
                    </div>
                  </div>
                  <p style={{ fontSize:11, color:C.textL, fontFamily:F.body }}>QR Code simulado para demonstração</p>
                </div>
                <Btn v="teal" full onClick={handlePay}>Confirmar pagamento PIX</Btn>
                <button onClick={()=>setStep(1)} style={{ marginTop:8, background:"none", border:"none", cursor:"pointer", color:C.textL, fontSize:13, fontFamily:F.body, width:"100%" }}>← Voltar</button>
              </div>
            )}
            {step===2&&method==="card"&&(
              <div>
                <Fld label="Número do cartão"><input value={card.num} onChange={e=>setCard(p=>({...p,num:e.target.value.replace(/\D/g,"").slice(0,16).replace(/(\d{4})/g,"$1 ").trim()}))} placeholder="0000 0000 0000 0000" maxLength={19} style={inpStyle}/></Fld>
                <Fld label="Nome no cartão"><input value={card.nome} onChange={e=>setCard(p=>({...p,nome:e.target.value.toUpperCase()}))} placeholder="NOME SOBRENOME" style={inpStyle}/></Fld>
                <div style={{ display:"flex", gap:9 }}>
                  <div style={{ flex:1 }}><Fld label="Validade"><input value={card.val} onChange={e=>setCard(p=>({...p,val:e.target.value.replace(/\D/g,"").slice(0,4).replace(/(\d{2})(\d)/,"$1/$2")}))} placeholder="MM/AA" maxLength={5} style={inpStyle}/></Fld></div>
                  <div style={{ flex:1 }}><Fld label="CVV"><input value={card.cvv} onChange={e=>setCard(p=>({...p,cvv:e.target.value.replace(/\D/g,"").slice(0,3)}))} placeholder="000" maxLength={3} style={inpStyle}/></Fld></div>
                </div>
                <InfoBox color={C.amberD} bg={C.amberL} style={{ marginBottom:12 }}>Modo demonstração — nenhuma cobrança real será efetuada.</InfoBox>
                <Btn v="purple" full onClick={handlePay}>Confirmar pagamento</Btn>
                <button onClick={()=>setStep(1)} style={{ marginTop:8, background:"none", border:"none", cursor:"pointer", color:C.textL, fontSize:13, fontFamily:F.body, width:"100%" }}>← Voltar</button>
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
  const [secs, setSecs]       = useState(0);
  const [running, setRunning] = useState(false);
  const [modal, setModal]     = useState(false);
  const [paid, setPaid]       = useState(false);
  const [fp, setFp]           = useState(null);
  const [ft, setFt]           = useState(null);
  const iv = useRef(null);

  useEffect(()=>{
    if (!activeRes||activeRes.status==="no_show") return;
    const elapsed = Math.max(0,Math.floor((new Date()-new Date(activeRes.startTime))/1000));
    setSecs(elapsed);
    if (new Date()>=new Date(activeRes.startTime)) setRunning(true);
  },[activeRes?._id]);

  useEffect(()=>{
    clearInterval(iv.current);
    if (running) iv.current=setInterval(()=>setSecs(s=>s+1),1000);
    return ()=>clearInterval(iv.current);
  },[running]);

  const usagePrice = ((secs/3600)*cfg.pricePerHour).toFixed(2);
  const totalPrice = (parseFloat(usagePrice)+cfg.reservationFee).toFixed(2);

  const handlePayConfirm = async () => {
    try {
      const { totalPrice:tp } = await api.payReservation(activeRes._id);
      clearInterval(iv.current); setRunning(false); setPaid(true); setModal(false);
      setFp(tp.toFixed(2)); setFt(fmtTime(secs));
      setTimeout(()=>{ setPaid(false);setFp(null);setFt(null);setSecs(0);onPaid(); },5000);
    } catch(e){ alert(e.message); }
  };

  if (paid) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:260, textAlign:"center", gap:12 }}>
      <div style={{ width:56, height:56, borderRadius:"50%", background:C.greenL, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <p style={{ fontFamily:F.head, fontSize:22, fontWeight:700, color:C.green, margin:0 }}>Pagamento confirmado</p>
      <p style={{ fontSize:20, fontWeight:700, color:C.greenD, fontFamily:F.head }}>{fmtMoney(fp)}</p>
      <p style={{ color:C.textL, fontSize:13, fontFamily:F.body }}>Duração: {ft} — Obrigado pela visita.</p>
    </div>
  );

  return (
    <div className="pay-layout" style={{ display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-start" }}>
      {modal&&<PayModal price={activeRes?.status==="no_show"?cfg.noShowFine.toFixed(2):totalPrice} label={activeRes?.status==="no_show"?"Pagar Multa":"Confirmar Pagamento"} onConfirm={handlePayConfirm} onClose={()=>setModal(false)}/>}
      <div className="pay-wrap" style={{ flex:"0 0 340px", display:"flex", flexDirection:"column", gap:12 }}>
        {!activeRes?(
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:200, textAlign:"center", gap:10, padding:16 }}>
            <Car color={C.borderM} size={32}/>
            <p style={{ fontFamily:F.head, fontSize:16, fontWeight:600, color:C.textL }}>Nenhuma reserva ativa</p>
            <p style={{ fontSize:13, color:C.textL, maxWidth:230, lineHeight:1.7, fontFamily:F.body }}>Reserve uma vaga na aba <strong style={{ color:C.textM }}>Reservas</strong> para iniciar.</p>
          </div>
        ):activeRes.status==="no_show"?(
          <>
            <InfoBox color={C.red} bg={C.redL}>
              <strong>No-show detectado.</strong> Multa de <strong>{fmtMoney(cfg.noShowFine)}</strong> aplicada por não comparecimento no horário reservado.
            </InfoBox>
            <Btn v="danger" full onClick={()=>setModal(true)} style={{ padding:"11px" }}>Pagar multa — {fmtMoney(cfg.noShowFine)}</Btn>
          </>
        ):(
          <>
            <div style={{ background:C.purpleL, borderRadius:13, padding:"13px 16px", border:`1px solid ${C.purple}28` }}>
              <p style={{ fontSize:10, fontWeight:600, color:C.purple, letterSpacing:1.1, textTransform:"uppercase", margin:"0 0 2px", fontFamily:F.body }}>Sua Vaga</p>
              <p style={{ fontFamily:F.head, fontSize:22, fontWeight:700, color:C.purpleD, margin:0 }}>{activeRes.spot?.row}{activeRes.spotNumber}</p>
              <p style={{ fontSize:12, color:C.purple, margin:0, fontFamily:F.body }}>{activeRes.startTimeStr}{activeRes.placa&&` — ${activeRes.placa}`}</p>
            </div>
            <div style={{ background:C.navy, borderRadius:14, padding:"16px 18px", textAlign:"center" }}>
              <p style={{ color:"#A89080", fontSize:10, fontWeight:600, letterSpacing:2, textTransform:"uppercase", marginBottom:6, fontFamily:F.body }}>{running?"Tempo decorrido":"Aguardando horário"}</p>
              <p className="timer-big" style={{ fontFamily:F.head, fontSize:40, fontWeight:700, color:"#FAF5EE", letterSpacing:2, lineHeight:1, margin:0 }}>{fmtTime(secs)}</p>
              {!running&&<p style={{ color:"#A89080", fontSize:11, marginTop:6, fontFamily:F.body }}>O cronômetro inicia no horário reservado.</p>}
            </div>
            {running&&(
              <div style={{ background:C.card, borderRadius:11, padding:"11px 14px", border:`1px solid ${C.border}` }}>
                {[["Taxa de reserva",fmtMoney(cfg.reservationFee)],[`Uso (${fmtTime(secs)})`,fmtMoney(usagePrice)]].map(([k,v])=>(
                  <div key={k} className="fee-row" style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:12, color:C.textM, fontFamily:F.body }}>{k}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:C.navy, fontFamily:F.body }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", paddingTop:7, borderTop:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:13, fontWeight:700, color:C.navy, fontFamily:F.body }}>Total</span>
                  <span style={{ fontSize:17, fontWeight:700, color:C.green, fontFamily:F.head }}>{fmtMoney(totalPrice)}</span>
                </div>
              </div>
            )}
            {running&&<Btn v="amber" onClick={()=>setModal(true)} full style={{ padding:"11px" }}>Pagar reserva — {fmtMoney(totalPrice)}</Btn>}
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// MINHA CONTA
// ─────────────────────────────────────────
const ProfileTab = ({ user, onLogout }) => {
  const [history, setHistory] = useState([]);
  const [activeRes, setRes]   = useState(null);
  const [load, setLoad]       = useState(true);
  const cpfFmt = user.cpf?user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4"):"—";

  useEffect(()=>{
    Promise.all([api.myHistory(), api.myReservation()])
      .then(([h,r])=>{ setHistory(h); setRes(r); })
      .catch(()=>{}).finally(()=>setLoad(false));
  },[]);

  const totalGasto = history.reduce((a,r)=>a+(r.totalPrice||0),0);
  const totalSecs  = history.reduce((a,r)=>a+(r.totalSeconds||0),0);
  const statusBdg  = s=>{
    if (s==="paid")      return <Bdg color={C.greenD} bg={C.greenL}>Pago</Bdg>;
    if (s==="cancelled") return <Bdg color={C.textM}  bg={C.dark}>Cancelado</Bdg>;
    if (s==="no_show")   return <Bdg color={C.red}    bg={C.redL}>No-show</Bdg>;
    return null;
  };

  return (
    <div style={{ maxWidth:620, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"center", gap:13, marginBottom:14, background:C.card, borderRadius:16, padding:"14px 16px", boxShadow:C.sh, border:`1px solid ${C.border}` }}>
        <div style={{ width:46, height:46, borderRadius:"50%", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, color:"#FAF5EE", fontFamily:F.head, flexShrink:0 }}>
          {(user.nomeCompleto?.[0]||user.email[0]).toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontFamily:F.head, fontSize:15, fontWeight:700, color:C.navy, margin:0 }}>{user.nomeCompleto||"—"}</p>
          <p style={{ fontSize:12, color:C.textL, margin:0, fontFamily:F.body }}>@{user.username||"—"} · {user.email}</p>
        </div>
        <Btn v="muted" sm onClick={onLogout}>Sair</Btn>
      </div>

      {activeRes&&(
        <div style={{ background:activeRes.status==="no_show"?C.redL:C.purpleL, borderRadius:11, padding:"10px 14px", marginBottom:12, border:`1px solid ${activeRes.status==="no_show"?C.red:C.purple}28` }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:activeRes.status==="no_show"?C.red:C.purple, animation:"pulse 2s infinite", flexShrink:0 }}/>
            <p style={{ fontSize:12.5, fontWeight:600, color:activeRes.status==="no_show"?C.redD:C.purpleD, margin:0, fontFamily:F.body }}>
              {activeRes.status==="no_show"?"Multa pendente por no-show":`Reserva ativa — Vaga ${activeRes.spotNumber} às ${activeRes.startTimeStr}`}
            </p>
          </div>
        </div>
      )}

      <div className="prof-stats" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:12 }}>
        {[
          { label:"Reservas",    value:history.length,       color:C.purple, bg:C.purpleL },
          { label:"Total gasto", value:fmtMoney(totalGasto), color:C.green,  bg:C.greenL  },
          { label:"Tempo total", value:fmtTime(totalSecs),   color:C.amber,  bg:C.amberL  },
        ].map(p=>(
          <div key={p.label} style={{ background:p.bg, borderRadius:11, padding:"10px 12px", border:`1px solid ${p.color}22` }}>
            <div style={{ fontSize:14, fontFamily:F.head, fontWeight:700, color:p.color, lineHeight:1.2, wordBreak:"break-all" }}>{p.value}</div>
            <div style={{ fontSize:9.5, color:p.color, fontWeight:600, marginTop:2, letterSpacing:.5, textTransform:"uppercase", fontFamily:F.body }}>{p.label}</div>
          </div>
        ))}
      </div>

      <Card style={{ marginBottom:12 }}>
        <h3 style={{ fontFamily:F.head, fontSize:13.5, fontWeight:700, color:C.navy, marginBottom:12 }}>Dados Pessoais</h3>
        <div className="prof-grid2" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
          {[["Nome",user.nomeCompleto||"—"],["Usuário",`@${user.username||"—"}`],["Email",user.email],["CPF",cpfFmt],["Telefone",user.telefone||"—"],["Endereço",user.endereco||"—"]].map(([k,v])=>(
            <div key={k}>
              <p style={{ fontSize:10, color:C.textL, textTransform:"uppercase", letterSpacing:.8, margin:"0 0 2px", fontFamily:F.body }}>{k}</p>
              <p style={{ fontSize:13, color:C.navy, fontWeight:500, margin:0, fontFamily:F.body, wordBreak:"break-all" }}>{v}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 style={{ fontFamily:F.head, fontSize:13.5, fontWeight:700, color:C.navy, marginBottom:12 }}>Histórico de reservas</h3>
        {load&&<div style={{ display:"flex", justifyContent:"center", padding:"14px 0" }}><Spin/></div>}
        {!load&&history.length===0&&<p style={{ fontSize:13, color:C.textL, fontFamily:F.body }}>Nenhum pagamento registrado ainda.</p>}
        {!load&&history.map((r,i)=>(
          <div key={r._id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderBottom:i<history.length-1?`1px solid ${C.border}`:"none", gap:9, flexWrap:"wrap" }}>
            <div>
              <p style={{ fontFamily:F.body, fontSize:13, fontWeight:600, color:C.navy, margin:0 }}>Vaga {r.spotNumber}{r.placa&&` · ${r.placa}`}</p>
              <p style={{ fontSize:11, color:C.textL, margin:0, fontFamily:F.body }}>{fmtDate(r.createdAt)}{r.totalSeconds?` · ${fmtTime(r.totalSeconds)}`:""}</p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              {statusBdg(r.status)}
              <Bdg color={C.greenD} bg={C.greenL}>{fmtMoney(r.totalPrice)}</Bdg>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────
// MODAL USUÁRIO ADMIN
// ─────────────────────────────────────────
const UserModal = ({ user, onClose, onToggle, onDelete }) => {
  if (!user) return null;
  const cpf = user.cpf?user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4"):"—";
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(35,26,16,.5)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
      <div className="fade-in" style={{ background:C.card, borderRadius:16, padding:22, maxWidth:360, width:"100%", boxShadow:C.shM }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
          <div style={{ width:40, height:40, borderRadius:"50%", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#FAF5EE", fontFamily:F.head, flexShrink:0 }}>
            {(user.nomeCompleto?.[0]||user.email[0]).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:700, color:C.navy, margin:0, fontFamily:F.head }}>{user.nomeCompleto||"—"}</p>
            <p style={{ fontSize:11, color:C.textL, margin:0, fontFamily:F.body }}>@{user.username||"—"}</p>
          </div>
        </div>
        {[["Email",user.email],["CPF",cpf],["Endereço",user.endereco||"—"],["Telefone",user.telefone||"—"],["Reservas",user.totalReservas||0],["Total Gasto",fmtMoney(user.totalGasto||0)],["Status",user.ativo?"Ativo":"Desativado"]].map(([k,v])=>(
          <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${C.border}` }}>
            <span style={{ fontSize:12, color:C.textL, fontFamily:F.body }}>{k}</span>
            <span style={{ fontSize:12.5, fontWeight:600, color:k==="Status"?(user.ativo?C.green:C.red):C.navy, textAlign:"right", maxWidth:"55%", fontFamily:F.body, wordBreak:"break-all" }}>{String(v)}</span>
          </div>
        ))}
        <div style={{ display:"flex", gap:7, marginTop:14, flexWrap:"wrap" }}>
          {!user.isAdmin&&onToggle&&<Btn v={user.ativo?"ghost":"success"} sm onClick={()=>onToggle(user._id)} style={{ flex:1 }}>{user.ativo?"Desativar":"Reativar"}</Btn>}
          {!user.isAdmin&&onDelete&&<Btn v="danger" sm onClick={()=>onDelete(user._id)} style={{ flex:1 }}>Excluir conta</Btn>}
          <Btn v="muted" onClick={onClose} style={{ flex:1, minWidth:80 }}>Fechar</Btn>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────
const AdminTab = ({ spots, onSpotsUpdate }) => {
  const [view, setView]       = useState("dashboard");
  const [dash, setDash]       = useState(null);
  const [logs, setLogs]       = useState([]);
  const [res, setRes]         = useState([]);
  const [users, setUsers]     = useState([]);
  const [load, setLoad]       = useState(false);
  const [selU, setSelU]       = useState(null);
  const [search, setSearch]   = useState("");
  const [demoLoad, setDemoLoad] = useState(false);
  const [demoMsg, setDemoMsg]   = useState("");

  const loadView = async v => {
    setLoad(true);
    try {
      if (v==="dashboard")    setDash(await api.adminDashboard());
      if (v==="logs")         setLogs(await api.adminLogs());
      if (v==="reservations") setRes(await api.adminReservations());
      if (v==="users")        setUsers(await api.adminUsers());
    } catch {} setLoad(false);
  };
  useEffect(()=>{ loadView(view); },[view]);

  const toggle = async uid => {
    await api.toggleUser(uid);
    const updated = await api.adminUsers(); setUsers(updated);
    if (selU) setSelU(updated.find(u=>u._id===selU._id)||null);
  };

  const deleteUser = async uid => {
    if (!window.confirm("Tem certeza que deseja excluir esta conta permanentemente? Esta ação não pode ser desfeita.")) return;
    try {
      await api.deleteUser(uid);
      setSelU(null);
      const updated = await api.adminUsers(); setUsers(updated);
    } catch(e) { alert("Erro ao excluir: "+e.message); }
  };

  const clearLogs = async () => {
    if (!window.confirm("Apagar todos os logs do sistema? Esta ação não pode ser desfeita.")) return;
    try { await api.clearLogs(); setLogs([]); }
    catch(e) { alert("Erro ao limpar logs: "+e.message); }
  };

  const cancelRes = async rid => {
    if (!window.confirm("Cancelar esta reserva?")) return;
    await api.adminCancelRes(rid); loadView("reservations");
  };

  const runDemo = async () => {
    setDemoLoad(true); setDemoMsg("");
    const available = spots.filter(s=>s.status==="available");
    if (!available.length) { setDemoMsg("Sem vagas livres para demonstrar."); setDemoLoad(false); return; }
    const spot = available[Math.floor(Math.random()*available.length)];
    setDemoMsg(`Vaga ${spot.row}${spot.spotNumber} sendo ocupada...`);
    await api.sensorUpdate(spot.spotNumber, true); onSpotsUpdate();
    setTimeout(async()=>{
      setDemoMsg(`Vaga ${spot.row}${spot.spotNumber} liberada.`);
      await api.sensorUpdate(spot.spotNumber, false); onSpotsUpdate();
      setTimeout(()=>{ setDemoMsg("Demonstração concluída."); setDemoLoad(false); },1500);
    },3000);
  };

  const noShows = res.filter(r=>r.status==="no_show").length;
  const rowStyle = { background:C.card, borderRadius:11, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:6, boxShadow:C.sh, border:`1px solid ${C.border}` };
  const fU = users.filter(u=>!search||(u.email+u.nomeCompleto+u.username).toLowerCase().includes(search.toLowerCase()));
  const fR = res.filter(r=>!search||(r.user?.email+r.user?.nomeCompleto+String(r.spotNumber)).toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <UserModal user={selU} onClose={()=>setSelU(null)} onToggle={toggle} onDelete={deleteUser}/>

      <div className="admin-tabs" style={{ display:"flex", gap:5, marginBottom:14, flexWrap:"wrap" }}>
        {[["dashboard","Dashboard"],["reservations","Reservas"],["users","Usuários"],["logs","Logs"],["system","Sistema"]].map(([v,l])=>(
          <button key={v} className="admin-tab-btn" onClick={()=>{setView(v);setSearch("");}} style={{ padding:"7px 16px", borderRadius:20, background:view===v?C.navy:C.dark, color:view===v?"#FAF5EE":C.textM, border:"none", fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:F.body, transition:"all .12s" }}>
            {l}{v==="reservations"&&noShows>0&&<span style={{ marginLeft:5, background:C.red, color:"#fff", borderRadius:20, padding:"1px 6px", fontSize:10 }}>{noShows}</span>}
          </button>
        ))}
      </div>

      {(view==="users"||view==="reservations")&&(
        <div style={{ marginBottom:12 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." style={{ width:"100%", maxWidth:260, padding:"8px 14px", borderRadius:20, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:F.body, background:C.soft, color:C.text, outline:"none" }}/>
        </div>
      )}

      {load&&<div style={{ display:"flex", justifyContent:"center", padding:"26px 0" }}><Spin/></div>}

      {/* DASHBOARD */}
      {!load&&view==="dashboard"&&dash&&(
        <div>
          {noShows>0&&(
            <InfoBox color={C.redD} bg={C.redL} style={{ marginBottom:13 }}>
              <strong>{noShows} no-show(s) pendente(s)</strong> — clientes com multa em aberto.
            </InfoBox>
          )}

          <div style={{ background:C.amberL, borderRadius:13, padding:"13px 16px", marginBottom:14, border:`1px solid ${C.amber}28`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
            <div>
              <p style={{ fontFamily:F.head, fontSize:13, fontWeight:700, color:C.amberD, margin:0 }}>Modo Demonstração</p>
              <p style={{ fontSize:12, color:C.amber, margin:0, fontFamily:F.body }}>Simula entrada e saída de veículo em uma vaga aleatória</p>
              {demoMsg&&<p style={{ fontSize:12, color:C.amberD, margin:"4px 0 0", fontWeight:600, fontFamily:F.body }}>{demoMsg}</p>}
            </div>
            <Btn v="amber" onClick={runDemo} disabled={demoLoad} sm>{demoLoad?<Spin color="#fff"/>:"Iniciar demonstração"}</Btn>
          </div>

          <div className="dash-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:14 }}>
            {[
              { label:"Usuários",      value:dash.totalUsers,            color:C.navy,   bg:C.navyL   },
              { label:"Reservas",      value:dash.totalReservations,     color:C.purple, bg:C.purpleL },
              { label:"Pagas",         value:dash.paidReservations,      color:C.green,  bg:C.greenL  },
              { label:"Receita",       value:fmtMoney(dash.totalRevenue),color:C.green,  bg:C.greenL  },
              { label:"Livres",        value:dash.spotsAvailable,        color:C.green,  bg:C.greenL  },
              { label:"Ocupadas",      value:dash.spotsOccupied,         color:C.red,    bg:C.redL    },
              { label:"Preferenciais", value:dash.spotsPreferential,     color:C.amber,  bg:C.amberL  },
              { label:"Ativas",        value:dash.activeReservations,    color:C.purple, bg:C.purpleL },
            ].map(p=>(
              <div key={p.label} style={{ background:p.bg, borderRadius:11, padding:"10px 12px", border:`1px solid ${p.color}22` }}>
                <div style={{ fontSize:16, fontFamily:F.head, fontWeight:700, color:p.color }}>{p.value}</div>
                <div style={{ fontSize:9, color:p.color, fontWeight:700, marginTop:2, letterSpacing:.5, textTransform:"uppercase", fontFamily:F.body }}>{p.label}</div>
              </div>
            ))}
          </div>

          <Card style={{ marginBottom:12, padding:16 }}>
            <h3 style={{ fontFamily:F.head, fontSize:13, fontWeight:700, color:C.navy, marginBottom:10 }}>Mapa em tempo real</h3>
            <ParkGrid spots={spots} selId={null} onSpotClick={()=>{}} clickable={false}/>
          </Card>

          {dash.revenueWeek?.length>0&&(
            <Card style={{ padding:16 }}>
              <h3 style={{ fontFamily:F.head, fontSize:13, fontWeight:700, color:C.navy, marginBottom:10 }}>Receita — últimos 7 dias</h3>
              {dash.revenueWeek.map(d=>(
                <div key={d._id} style={{ display:"flex", alignItems:"center", gap:9, marginBottom:6 }}>
                  <span style={{ fontSize:11, color:C.textM, minWidth:32, fontFamily:F.body }}>{d._id}</span>
                  <div style={{ flex:1, height:5, background:C.border, borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", background:C.green, borderRadius:4, width:`${Math.min(100,(d.total/500)*100)}%` }}/>
                  </div>
                  <span style={{ fontSize:11.5, fontWeight:600, color:C.green, minWidth:56, textAlign:"right", fontFamily:F.body }}>{fmtMoney(d.total)}</span>
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
            <h3 style={{ fontFamily:F.head, fontSize:13.5, fontWeight:700, color:C.navy, marginBottom:14 }}>Controle geral de vagas</h3>
            <p style={{ fontSize:13, color:C.textL, fontFamily:F.body, marginBottom:14, lineHeight:1.6 }}>Libera ou ocupa todas as vagas de uma vez. Útil para testes e demonstrações.</p>
            <div style={{ display:"flex", gap:9, flexWrap:"wrap" }}>
              <Btn v="success" onClick={async()=>{
                if (!window.confirm("Liberar todas as 12 vagas?")) return;
                try { await api.resetSpots(false); onSpotsUpdate(); }
                catch(e){ alert("Erro: "+e.message); }
              }}>Liberar todas as vagas</Btn>
              <Btn v="danger" onClick={async()=>{
                if (!window.confirm("Ocupar todas as 12 vagas?")) return;
                try { await api.resetSpots(true); onSpotsUpdate(); }
                catch(e){ alert("Erro: "+e.message); }
              }}>Ocupar todas as vagas</Btn>
            </div>
          </Card>

          <Card>
            <h3 style={{ fontFamily:F.head, fontSize:13.5, fontWeight:700, color:C.navy, marginBottom:7 }}>Demonstração ao vivo</h3>
            <p style={{ fontSize:13, color:C.textL, fontFamily:F.body, marginBottom:12, lineHeight:1.6 }}>Simula entrada e saída de veículo sem o ESP32 conectado.</p>
            {demoMsg&&<InfoBox color={C.amberD} bg={C.amberL} style={{ marginBottom:10 }}>{demoMsg}</InfoBox>}
            <Btn v="amber" onClick={runDemo} disabled={demoLoad}>{demoLoad?<Spin color="#fff"/>:"Iniciar demonstração"}</Btn>
          </Card>

          <Card>
            <h3 style={{ fontFamily:F.head, fontSize:13.5, fontWeight:700, color:C.navy, marginBottom:13 }}>Status do sistema</h3>
            {[
              { label:"Backend API",    value:"Online",                       color:C.green,  bg:C.greenL  },
              { label:"Banco de Dados", value:"MongoDB Atlas — conectado",    color:C.green,  bg:C.greenL  },
              { label:"Frontend",       value:"Vercel — em operação",         color:C.green,  bg:C.greenL  },
              { label:"Sensores ESP32", value:`${spots.length} vagas`,        color:C.purple, bg:C.purpleL },
              { label:"Atualização",    value:"A cada 5 segundos",            color:C.amber,  bg:C.amberL  },
            ].map(item=>(
              <div key={item.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}`, flexWrap:"wrap", gap:5 }}>
                <span style={{ fontSize:13, color:C.textM, fontFamily:F.body }}>{item.label}</span>
                <span style={{ fontSize:11, fontWeight:600, color:item.color, background:item.bg, padding:"2px 9px", borderRadius:20, fontFamily:F.body }}>{item.value}</span>
              </div>
            ))}
          </Card>

          <Card>
            <h3 style={{ fontFamily:F.head, fontSize:13.5, fontWeight:700, color:C.navy, marginBottom:13 }}>Estado das vagas</h3>
            {spots.map(s=>{
              const m = SM[s.status]||SM.available;
              return (
                <div key={s._id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${C.border}`, flexWrap:"wrap", gap:5 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:6, height:6, borderRadius:2, background:m.bd }}/>
                    <span style={{ fontSize:13, color:C.navy, fontFamily:F.body, fontWeight:600 }}>Vaga {s.row}{s.spotNumber}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:10, color:C.textL, fontFamily:F.body }}>Sensor: {s.sensorOccupied?"ocupado":"livre"}</span>
                    <Bdg color={m.tx} bg={m.bg}>{m.lb}</Bdg>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* RESERVAS */}
      {!load&&view==="reservations"&&(
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {fR.length===0&&<p style={{ color:C.textL, fontSize:13, fontFamily:F.body }}>Nenhuma reserva encontrada.</p>}
          {fR.map(r=>(
            <div key={r._id} style={rowStyle}>
              <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
                <button onClick={()=>setSelU(r.user)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, fontWeight:600, color:C.navy, fontFamily:F.body, textDecoration:"underline", textUnderlineOffset:2 }}>{r.user?.nomeCompleto||r.user?.email}</button>
                <Bdg color={C.purple} bg={C.purpleL}>Vaga {r.spotNumber}</Bdg>
                <span style={{ fontSize:12, color:C.textM, fontFamily:F.body }}>às {r.startTimeStr}</span>
                {r.placa&&<Bdg color={C.navyM} bg={C.navyL}>{r.placa}</Bdg>}
                {r.status==="paid"      && <Bdg color={C.greenD} bg={C.greenL}>Pago {fmtMoney(r.totalPrice)}</Bdg>}
                {r.status==="cancelled" && <Bdg color={C.textM}  bg={C.dark}>Cancelado</Bdg>}
                {r.status==="no_show"   && <Bdg color={C.red}    bg={C.redL}>No-show</Bdg>}
                {r.status==="active"    && <Bdg color={C.amberD} bg={C.amberL}>Em uso</Bdg>}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
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
            <div key={u._id} style={{ ...rowStyle, cursor:"pointer" }} onClick={()=>setSelU(u)}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:u.isAdmin?C.navy:u.ativo?C.dark:C.redL, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:u.isAdmin?"#FAF5EE":u.ativo?C.textM:C.red, fontFamily:F.head, flexShrink:0 }}>
                  {(u.nomeCompleto?.[0]||u.email[0]).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:C.navy, margin:0, fontFamily:F.body }}>{u.nomeCompleto||u.email}{u.username&&<span style={{ fontSize:11, color:C.textL, marginLeft:5 }}>@{u.username}</span>}</p>
                  <p style={{ fontSize:11, color:C.textL, margin:0, fontFamily:F.body }}>{u.email}</p>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                {u.isAdmin&&<Bdg color={C.navyM} bg={C.navyL}>Admin</Bdg>}
                {!u.ativo&&<Bdg color={C.red} bg={C.redL}>Inativo</Bdg>}
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
            {logs.map(log=>(
              <div key={log._id} style={rowStyle}>
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", background:C.navyL, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10.5, fontWeight:700, color:C.navy, fontFamily:F.head, flexShrink:0 }}>{log.email[0].toUpperCase()}</div>
                  <div>
                    <p style={{ fontSize:12.5, fontWeight:600, color:C.navy, margin:0, fontFamily:F.body }}>{log.email}</p>
                    <p style={{ fontSize:11.5, color:C.textM, margin:0, fontFamily:F.body }}>{log.action}</p>
                  </div>
                </div>
                <span style={{ fontSize:11, color:C.textL, fontFamily:F.body }}>{fmtDate(log.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────
// NAV MOBILE
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
    <div className="mobile-nav" style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:200, background:C.card, borderTop:`1px solid ${C.border}`, alignItems:"stretch", boxShadow:"0 -3px 16px rgba(44,31,14,0.09)" }}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, padding:"8px 4px 6px", border:"none", background:tab===t.id?C.navyL:"transparent", color:tab===t.id?C.navy:C.textL, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, transition:"all .12s", borderTop:tab===t.id?`2px solid ${C.navy}`:"2px solid transparent", fontFamily:F.body }}>
          <span style={{ fontSize:12, fontWeight:700, lineHeight:1, color:"inherit" }}>{t.icon}</span>
          <span style={{ fontSize:9, fontWeight:600, letterSpacing:.3 }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────
export default function App() {
  const [screen, setScreen]    = useState("landing");
  const [user, setUser]        = useState(null);
  const [spots, setSpots]      = useState([]);
  const [activeRes, setRes]    = useState(null);
  const [tab, setTab]          = useState("overview");
  const [booting, setBoot]     = useState(true);
  const [cfg, setCfg]          = useState(CFG);
  const [online, setOnline]    = useState(true);
  const [notifs, setNotifs]    = useState([]);
  const prevRef = useRef([]);

  const addNotif = (msg, type) => {
    const id = Date.now();
    setNotifs(p=>[...p,{ id, msg, type }]);
    setTimeout(()=>setNotifs(p=>p.filter(n=>n.id!==id)),4000);
  };

  useEffect(()=>{
    api.resConfig().then(c=>{ CFG=c; setCfg(c); }).catch(()=>{});
    const t = localStorage.getItem("omv_token");
    if (!t){ setBoot(false); return; }
    api.me().then(({user})=>{ setUser(user); setScreen("app"); }).catch(()=>localStorage.removeItem("omv_token")).finally(()=>setBoot(false));
  },[]);

  useEffect(()=>{
    const check = async()=>{ const h=await api.health(); setOnline(h.status==="ok"); };
    check(); const iv=setInterval(check,30000); return ()=>clearInterval(iv);
  },[]);

  useEffect(()=>{
    if (!user) return;
    loadSpots(); loadRes();
    const iv=setInterval(loadSpots,5000); return ()=>clearInterval(iv);
  },[user]);

  const loadSpots = async()=>{
    try {
      const ns = await api.spots();
      if (prevRef.current.length) {
        ns.forEach(s=>{
          const old = prevRef.current.find(o=>o._id===s._id);
          if (old&&old.status!==s.status) {
            if (s.status==="occupied"||s.status==="reserved") addNotif(`Vaga ${s.row}${s.spotNumber} ficou ocupada`,"occupied");
            else if (s.status==="available"||s.status==="preferential") addNotif(`Vaga ${s.row}${s.spotNumber} ficou disponível`,"available");
          }
        });
      }
      prevRef.current = ns;
      setSpots(ns);
    } catch {}
  };

  const loadRes = async()=>{ try{ setRes(await api.myReservation()); }catch{} };
  const logout  = ()=>{ localStorage.removeItem("omv_token"); setUser(null); setSpots([]); setRes(null); setTab("overview"); setScreen("landing"); };

  if (booting) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{GF+CSS}</style>
      <div style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
        <Spin size={22}/><p style={{ fontFamily:F.head, fontSize:13, color:C.textL, marginTop:4 }}>Carregando...</p>
      </div>
    </div>
  );

  if (screen==="landing") return <Landing onEnter={()=>setScreen("login")}/>;
  if (screen==="login")   return <Login onLogin={u=>{ setUser(u); setScreen("app"); }} onBack={()=>setScreen("landing")}/>;

  const deskTabs = [
    { id:"overview", label:"Visão Geral" },
    { id:"reserve",  label:"Reservas"    },
    { id:"payment",  label:"Pagamento"   },
    { id:"profile",  label:"Minha Conta" },
    ...(user.isAdmin?[{ id:"admin", label:"Admin" }]:[]),
  ];
  const titles = { overview:"Visão Geral", reserve:"Reservar Vaga", payment:"Pagamento", profile:"Minha Conta", admin:"Painel Admin" };

  return (
    <div style={{ width:"100%", minHeight:"100vh", background:C.bg, fontFamily:F.body }}>
      <style>{GF+CSS}</style>
      <Notifs items={notifs}/>

      <header className="desk-header" style={{ background:C.card, borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:100 }}>
        <div style={{ padding:"0 44px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <span style={{ fontFamily:F.head, fontSize:17, fontWeight:700, color:C.navy, whiteSpace:"nowrap" }}>Estacionamento OMV</span>
          <nav style={{ display:"flex", gap:2 }}>
            {deskTabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"6px 15px", borderRadius:20, border:"none", background:tab===t.id?C.navy:"transparent", color:tab===t.id?"#FAF5EE":C.textM, fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:F.body, transition:"all .12s", whiteSpace:"nowrap" }}>{t.label}</button>
            ))}
          </nav>
          <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
            <Dot on={online}/>
            <div style={{ width:1, height:16, background:C.border }}/>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:12, fontWeight:600, color:C.navy, margin:0, fontFamily:F.body }}>{user.nomeCompleto||user.email}</p>
              <p style={{ fontSize:10, color:C.textL, margin:0, fontFamily:F.body }}>{user.isAdmin?"Administrador":user.email}</p>
            </div>
            <button onClick={logout} style={{ padding:"5px 12px", borderRadius:20, background:C.dark, color:C.textM, border:`1px solid ${C.border}`, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:F.body }}>Sair</button>
          </div>
        </div>
      </header>

      <main className="main-pad" style={{ padding:"24px 44px" }}>
        <h1 className="pg-title" style={{ fontFamily:F.head, fontSize:21, fontWeight:700, color:C.navy, marginBottom:16 }}>{titles[tab]}</h1>
        {tab==="overview" && <OverviewTab spots={spots}/>}
        {tab==="reserve"  && <ReserveTab spots={spots} activeRes={activeRes} onReserved={()=>{loadSpots();loadRes();}} setTab={setTab} cfg={cfg}/>}
        {tab==="payment"  && <PaymentTab activeRes={activeRes} onPaid={()=>{loadSpots();setRes(null);}} cfg={cfg}/>}
        {tab==="profile"  && <ProfileTab user={user} onLogout={logout}/>}
        {tab==="admin"&&user.isAdmin&&<AdminTab spots={spots} onSpotsUpdate={loadSpots}/>}
      </main>

      <MobileNav tab={tab} setTab={setTab} isAdmin={user.isAdmin}/>
    </div>
  );
}
