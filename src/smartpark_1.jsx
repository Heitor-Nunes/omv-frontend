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
  toggleUser:        (id)               => request(`/admin/users/${id}/toggle`,        { method:"PATCH" }),
  adminCancelRes:    (id)               => request(`/admin/reservations/${id}/cancel`,  { method:"POST" }),
  sensorUpdate:      (spotNumber, occ)  => request("/spots/sensor", { method:"POST", body:JSON.stringify({ spotNumber, occupied:occ }) }),
  health:            ()                 => fetch(`${BASE}/health`).then(r=>r.json()).catch(()=>({ status:"error" })),
};

// ─────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────
const GF = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&display=swap');`;

const CSS = `
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
html, body { width:100%; min-height:100vh; overflow-x:hidden; font-synthesis:none; -webkit-font-smoothing:antialiased; }
#root { width:100%; min-height:100vh; }
body { background:#F2EDE5; }
html, body, #root { margin:0 !important; padding:0 !important; }

@keyframes spin     { to { transform:rotate(360deg); } }
@keyframes fadeIn   { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideIn  { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
@keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.35} }
@keyframes blink    { 0%,100%{opacity:1} 50%{opacity:.2} }
.fade-in  { animation:fadeIn .2s ease both; }
.slide-up { animation:slideUp .25s ease both; }
.slide-in { animation:slideIn .3s ease both; }

::-webkit-scrollbar { width:4px; }
::-webkit-scrollbar-thumb { background:#C9BAA5; border-radius:10px; }

.mobile-nav-bar { display:none; }

/* ── DESKTOP ── */
@media (min-width:769px) {
  .mobile-nav-bar { display:none !important; }
}

/* ── TABLET + MOBILE ── */
@media (max-width:768px) {
  .mobile-nav-bar  { display:flex !important; }
  .desktop-header  { display:none !important; }
  .main-content    { padding:16px 12px 88px !important; }
  .page-title      { font-size:17px !important; margin-bottom:12px !important; }
  .dash-grid       { grid-template-columns:repeat(2,1fr) !important; gap:8px !important; }
  .form-row        { flex-direction:column !important; gap:0 !important; }
  .pay-wrap        { width:100% !important; flex:none !important; }
  .pay-layout      { flex-direction:column !important; }
  .profile-grid2   { grid-template-columns:1fr !important; }
  .profile-stats   { grid-template-columns:repeat(2,1fr) !important; }
  .spot-row-wrap   { gap:4px !important; }
  .spot-card-item  { min-width:0 !important; flex:1 1 0 !important; padding:7px 4px 5px !important; }
  .park-section    { flex-direction:column !important; gap:5px !important; }
  .park-via        { width:100% !important; height:14px !important; min-height:0 !important; }
  .park-via-txt    { writing-mode:horizontal-tb !important; font-size:0 !important; }
  .model-btns      { grid-template-columns:repeat(3,1fr) !important; }
  .timer-num       { font-size:32px !important; }
  .fee-row         { flex-wrap:wrap !important; }
  .res-sel-panel   { width:100% !important; }
  .hero-wrap       { padding:40px 16px 32px !important; }
  .hero-title      { font-size:24px !important; }
  .hero-sub        { font-size:14px !important; }
  .hero-cards      { grid-template-columns:1fr !important; gap:10px !important; }
  .about-grid      { grid-template-columns:1fr !important; gap:10px !important; }
  .about-section   { padding:40px 16px !important; }
  .landing-header  { padding:0 16px !important; }
  .landing-footer  { padding:16px !important; flex-direction:column !important; gap:6px !important; text-align:center !important; }
  .notif-wrap      { right:8px !important; top:60px !important; max-width:calc(100vw - 16px) !important; }
  .reserve-layout  { flex-direction:column !important; }
  .comp-grid       { grid-template-columns:1fr !important; }
  .stat-strip      { flex-direction:column !important; }
}
@media (max-width:420px) {
  .page-title  { font-size:15px !important; }
  .timer-num   { font-size:26px !important; }
  .dash-grid   { grid-template-columns:1fr 1fr !important; }
  .model-btns  { grid-template-columns:repeat(3,1fr) !important; }
  .hero-title  { font-size:20px !important; }
  .profile-stats { grid-template-columns:1fr 1fr !important; }
}
`;

const C = {
  bg:"#F2EDE5", bgCard:"#FBF8F4", bgSoft:"#F7F2EB", bgDark:"#E8DFD1",
  border:"#DDD3C3", borderMid:"#C9BAA5",
  text:"#2A1F14", textMid:"#6B5744", textLight:"#A08B76",
  navy:"#3D2B1A", navyLight:"#F0E8DC", navyMid:"#6B4C30",
  green:"#4A8C5C", greenBg:"#E8F3EC", greenDark:"#2D6640",
  red:"#B05040", redBg:"#F5EAE8", redDark:"#8A3328",
  amber:"#A0700A", amberBg:"#F5EDD8", amberDark:"#7A5308",
  purple:"#7A5C9A", purpleBg:"#EDE5F5", purpleDark:"#4E3270",
  teal:"#2A7B7B", tealBg:"#E5F5F5",
  sh:"0 2px 12px rgba(61,43,26,0.07)",
  shLg:"0 8px 36px rgba(61,43,26,0.10)",
};

const SM = {
  available:    { bg:C.greenBg,  bd:C.green,  car:C.green,  tx:C.greenDark,  lb:"LIVRE"     },
  occupied:     { bg:C.redBg,    bd:C.red,    car:C.red,    tx:C.red,        lb:"OCUPADA"   },
  preferential: { bg:C.amberBg,  bd:C.amber,  car:C.amber,  tx:C.amberDark,  lb:"PREFER."   },
  reserved:     { bg:C.purpleBg, bd:C.purple, car:C.purple, tx:C.purpleDark, lb:"RESERVADA" },
};

const F   = { head:"'Fraunces',serif", body:"'Plus Jakarta Sans',sans-serif" };
let   CFG = { pricePerHour:80, reservationFee:10, toleranceMinutes:5, noShowFine:20 };

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

// ─────────────────────────────────────────
// CORREÇÃO DO BUG DE HORÁRIO
// Garante que a reserva imediata sempre use o momento exato atual
// ─────────────────────────────────────────
function buildStartTime(dateStr, timeStr) {
  const now = new Date();

  // Se não tem data/hora, usa agora
  if (!dateStr || !timeStr) return now;

  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, m]     = timeStr.split(":").map(Number);
  const chosen     = new Date(y, mo - 1, d, h, m, 0, 0);

  // Se o horário escolhido já passou (ou é nos próximos 60 segundos), usa agora
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
  <div style={{ background:C.bgCard, borderRadius:20, padding:22, boxShadow:C.shLg, border:`1px solid ${C.border}`, ...style }}>{children}</div>
);

const Btn = ({ children, onClick, v="primary", disabled=false, sm=false, full=false, style={} }) => {
  const vs = {
    primary: { bg:C.navy,        color:"#FBF5EE", border:"none" },
    success: { bg:C.green,       color:"#fff",    border:"none" },
    ghost:   { bg:C.bgDark,      color:C.textMid, border:"none" },
    amber:   { bg:C.amber,       color:"#fff",    border:"none" },
    danger:  { bg:C.red,         color:"#fff",    border:"none" },
    outline: { bg:"transparent", color:C.navy,    border:`1.5px solid ${C.navy}` },
    teal:    { bg:C.teal,        color:"#fff",    border:"none" },
    purple:  { bg:C.purple,      color:"#fff",    border:"none" },
  };
  const s = vs[v]||vs.primary;
  return (
    <button onClick={!disabled?onClick:undefined} style={{
      background:s.bg, color:s.color, border:s.border,
      padding:sm?"8px 16px":"12px 22px", borderRadius:12,
      fontSize:sm?12:14, fontWeight:600, fontFamily:F.body,
      cursor:disabled?"not-allowed":"pointer", opacity:disabled?.5:1,
      transition:"all .15s", display:"inline-flex", alignItems:"center",
      justifyContent:"center", gap:7, width:full?"100%":"auto", flexShrink:0, ...style,
    }}>{children}</button>
  );
};

const Fld = ({ label, req=false, hint="", children }) => (
  <div style={{ marginBottom:13 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
      <label style={{ fontSize:11, fontWeight:700, color:C.textMid, letterSpacing:.8, textTransform:"uppercase", fontFamily:F.body }}>
        {label}{req&&<span style={{ color:C.red, marginLeft:3 }}>*</span>}
      </label>
      {hint&&<span style={{ fontSize:10, color:C.textLight, fontFamily:F.body }}>{hint}</span>}
    </div>
    {children}
  </div>
);

const Inp = ({ value, onChange, placeholder, type="text", onKeyDown, maxLength }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    onKeyDown={onKeyDown} maxLength={maxLength}
    style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${C.border}`,
      fontSize:14, fontFamily:F.body, background:C.bgSoft, outline:"none", color:C.text }}/>
);

const Err = ({ msg }) => msg ? (
  <div style={{ background:C.redBg, border:`1px solid ${C.red}30`, borderRadius:10,
    padding:"10px 14px", marginBottom:13, fontSize:13, color:C.red, fontWeight:500, lineHeight:1.5 }}>⚠ {msg}</div>
) : null;

const Bdg = ({ children, color, bg }) => (
  <span style={{ fontSize:11, background:bg, color, borderRadius:20, padding:"3px 11px", fontWeight:600, fontFamily:F.body, whiteSpace:"nowrap" }}>{children}</span>
);

const InfoBox = ({ color, bg, icon, children, style={} }) => (
  <div style={{ background:bg, border:`1px solid ${color}30`, borderRadius:12, padding:"11px 14px", display:"flex", gap:10, alignItems:"flex-start", ...style }}>
    <span style={{ fontSize:16, flexShrink:0 }}>{icon}</span>
    <p style={{ fontSize:12.5, color, lineHeight:1.6, margin:0, fontFamily:F.body }}>{children}</p>
  </div>
);

const Divider = ({ label="" }) => (
  <div style={{ display:"flex", alignItems:"center", gap:12, margin:"14px 0" }}>
    <div style={{ flex:1, height:1, background:C.border }}/>
    {label&&<span style={{ fontSize:10, color:C.textLight, fontFamily:F.body, letterSpacing:.8, textTransform:"uppercase", whiteSpace:"nowrap" }}>{label}</span>}
    <div style={{ flex:1, height:1, background:C.border }}/>
  </div>
);

const ConnectionDot = ({ online }) => (
  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
    <div style={{ width:8, height:8, borderRadius:"50%", background:online?C.green:C.red, animation:online?"none":"blink 1.5s infinite", flexShrink:0 }}/>
    <span style={{ fontSize:11, color:online?C.green:C.red, fontWeight:600, fontFamily:F.body }}>{online?"Online":"Offline"}</span>
  </div>
);

// ─────────────────────────────────────────
// NOTIFICAÇÕES
// ─────────────────────────────────────────
const NotificationCenter = ({ notifications }) => {
  if (!notifications.length) return null;
  return (
    <div className="notif-wrap" style={{ position:"fixed", top:70, right:16, zIndex:500, display:"flex", flexDirection:"column", gap:8, maxWidth:300 }}>
      {notifications.map(n=>(
        <div key={n.id} className="slide-in" style={{
          background:n.type==="occupied"?C.redBg:n.type==="available"?C.greenBg:C.amberBg,
          border:`1px solid ${n.type==="occupied"?C.red:n.type==="available"?C.green:C.amber}`,
          borderRadius:12, padding:"10px 14px", boxShadow:C.shLg,
          display:"flex", alignItems:"center", gap:10,
        }}>
          <span style={{ fontSize:15 }}>{n.type==="occupied"?"🚗":n.type==="available"?"✅":"⚠"}</span>
          <p style={{ fontSize:12.5, color:C.text, margin:0, fontFamily:F.body, lineHeight:1.4 }}>{n.msg}</p>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────
// CAR ICON
// ─────────────────────────────────────────
const CarIcon = ({ color="currentColor", size=34 }) => (
  <svg width={size} height={size*1.4} viewBox="0 0 40 56" fill="none">
    <rect x="10" y="8"  width="20" height="38" rx="5" fill={color}/>
    <rect x="12" y="6"  width="16" height="7"  rx="3" fill={color}/>
    <rect x="12" y="44" width="16" height="7"  rx="3" fill={color}/>
    <rect x="3"  y="14" width="8"  height="10" rx="2" fill={color} opacity=".72"/>
    <rect x="29" y="14" width="8"  height="10" rx="2" fill={color} opacity=".72"/>
    <rect x="3"  y="30" width="8"  height="10" rx="2" fill={color} opacity=".72"/>
    <rect x="29" y="30" width="8"  height="10" rx="2" fill={color} opacity=".72"/>
    <rect x="14" y="19" width="12" height="8"  rx="2" fill="white" opacity=".28"/>
  </svg>
);

// ─────────────────────────────────────────
// SPOT CARD
// ─────────────────────────────────────────
const SpotCard = ({ spot, isSel, onClick, clickable }) => {
  const m   = SM[spot.status]||SM.available;
  const can = clickable&&(spot.status==="available"||spot.status==="preferential");
  return (
    <div className="spot-card-item" onClick={can?()=>onClick(spot):undefined} style={{
      background:isSel?m.bd:m.bg, border:`2px solid ${m.bd}`, borderRadius:13,
      padding:"9px 6px 7px", display:"flex", flexDirection:"column",
      alignItems:"center", gap:3, cursor:can?"pointer":"default",
      transition:"all .18s", boxShadow:isSel?`0 6px 20px ${m.bd}55`:C.sh,
      transform:isSel?"scale(1.08)":"scale(1)", flex:"1 1 0", minWidth:60, userSelect:"none",
    }}>
      <span style={{ fontSize:9, fontWeight:700, color:isSel?"#fff":m.tx, letterSpacing:.8, fontFamily:F.body }}>{spot.row}{spot.spotNumber}</span>
      <CarIcon size={24} color={isSel?"#fff":m.car}/>
      <span style={{ fontSize:8, fontWeight:700, color:isSel?"rgba(255,255,255,.85)":m.tx, letterSpacing:.4, textTransform:"uppercase", fontFamily:F.body }}>{m.lb}</span>
    </div>
  );
};

// ─────────────────────────────────────────
// PARKING GRID
// ─────────────────────────────────────────
const ParkingGrid = ({ spots, selId, onSpotClick, clickable=false }) => {
  const RoadH = ({ label }) => (
    <div style={{ height:21, background:C.bgDark, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", width:"100%" }}>
      <div style={{ position:"absolute", top:"50%", left:0, right:0, height:2, background:`repeating-linear-gradient(to right,${C.bgSoft} 0,${C.bgSoft} 12px,transparent 12px,transparent 24px)`, transform:"translateY(-50%)"}}/>
      <span style={{ fontSize:8, fontWeight:700, color:C.textLight, letterSpacing:2, textTransform:"uppercase", position:"relative", fontFamily:F.body }}>{label}</span>
    </div>
  );
  const RowSpots = ({ row }) => (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
        <span style={{ fontSize:9, fontWeight:700, color:C.borderMid, fontFamily:F.body }}>{row}</span>
        <div style={{ flex:1, height:1, background:C.border }}/>
      </div>
      <div className="spot-row-wrap" style={{ display:"flex", gap:5 }}>
        {spots.filter(s=>s.row===row).map(s=><SpotCard key={s._id} spot={s} isSel={selId===s._id} onClick={onSpotClick} clickable={clickable}/>)}
      </div>
    </div>
  );
  const Via = () => (
    <div className="park-via" style={{ width:26, background:C.bgDark, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", flexShrink:0, minHeight:65 }}>
      <div style={{ position:"absolute", left:"50%", top:0, bottom:0, width:2, background:`repeating-linear-gradient(to bottom,${C.bgSoft} 0,${C.bgSoft} 10px,transparent 10px,transparent 20px)`, transform:"translateX(-50%)"}}/>
      <span className="park-via-txt" style={{ fontSize:7, fontWeight:700, color:C.textLight, textTransform:"uppercase", fontFamily:F.body, writingMode:"vertical-rl", position:"relative" }}>Via</span>
    </div>
  );
  const Block = ({ l, r, ll, rl }) => (
    <div className="park-section" style={{ display:"flex", gap:0, alignItems:"stretch", width:"100%" }}>
      <div style={{ flex:1, background:C.bgSoft, borderRadius:12, padding:"9px 7px", border:`1px solid ${C.border}`, minWidth:0 }}>
        <div style={{ fontSize:8, fontWeight:700, color:C.amberDark, letterSpacing:1, textTransform:"uppercase", fontFamily:F.body, marginBottom:6, textAlign:"center" }}>{ll}</div>
        <RowSpots row={l}/>
      </div>
      <Via/>
      <div style={{ flex:1, background:C.bgSoft, borderRadius:12, padding:"9px 7px", border:`1px solid ${C.border}`, minWidth:0 }}>
        <div style={{ fontSize:8, fontWeight:700, color:C.navyMid, letterSpacing:1, textTransform:"uppercase", fontFamily:F.body, marginBottom:6, textAlign:"center" }}>{rl}</div>
        <RowSpots row={r}/>
      </div>
    </div>
  );
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, width:"100%" }}>
      <div style={{ display:"flex", gap:10, marginBottom:6, flexWrap:"wrap" }}>
        {Object.entries(SM).map(([k,m])=>(
          <div key={k} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:m.bd, flexShrink:0 }}/>
            <span style={{ fontSize:11, color:C.textMid, fontWeight:500, fontFamily:F.body }}>
              {k==="available"?"Livre":k==="occupied"?"Ocupada":k==="preferential"?"Preferencial":"Reservada"}
            </span>
          </div>
        ))}
      </div>
      <RoadH label="Entrada"/>
      <Block l="A" r="C" ll="← Av. A" rl="Av. C →"/>
      <RoadH label="Rua Separadora"/>
      <Block l="B" r="D" ll="← Av. B" rl="Av. D →"/>
      <RoadH label="Saída"/>
    </div>
  );
};

// ─────────────────────────────────────────
// LANDING PAGE — EXPANDIDA
// ─────────────────────────────────────────
const LandingPage = ({ onEnter }) => (
  <div style={{ minHeight:"100vh", width:"100%", background:C.bg, fontFamily:F.body }}>
    <style>{GF+CSS}</style>

    {/* Header */}
    <header className="landing-header" style={{ background:C.bgCard, borderBottom:`1px solid ${C.border}`, padding:"0 48px", height:62, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
      <div style={{ fontFamily:F.head, fontSize:18, fontWeight:700, color:C.navy }}>◈ OMV</div>
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <button onClick={()=>document.getElementById("sobre").scrollIntoView({behavior:"smooth"})} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:C.textMid, fontFamily:F.body, fontWeight:600 }}>Sobre</button>
        <Btn onClick={onEnter} sm>Acessar o sistema →</Btn>
      </div>
    </header>

    {/* Hero */}
    <div className="hero-wrap" style={{ maxWidth:860, margin:"0 auto", padding:"64px 24px 40px", textAlign:"center" }}>
      <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:C.greenBg, border:`1px solid ${C.green}30`, borderRadius:20, padding:"6px 16px", marginBottom:22 }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:C.green, animation:"pulse 2s infinite" }}/>
        <span style={{ fontSize:12, color:C.greenDark, fontWeight:600, fontFamily:F.body }}>Sistema em operação</span>
      </div>

      <h1 className="hero-title" style={{ fontFamily:F.head, fontSize:40, fontWeight:700, color:C.navy, lineHeight:1.2, marginBottom:18 }}>
        Projeto OMV — Otimização e<br/>Monitoramento de Vagas
      </h1>

      <p className="hero-sub" style={{ fontSize:16, color:C.textLight, maxWidth:540, margin:"0 auto 32px", lineHeight:1.75, fontFamily:F.body }}>
        Um sistema inteligente de gestão de estacionamentos que integra sensores físicos, servidor em nuvem e plataforma web para otimizar o fluxo de veículos em tempo real.
      </p>

      <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
        <Btn onClick={onEnter} style={{ padding:"13px 30px", fontSize:15 }}>Entrar no sistema</Btn>
        <Btn v="outline" onClick={()=>document.getElementById("sobre").scrollIntoView({behavior:"smooth"})} style={{ padding:"13px 30px", fontSize:15 }}>Saiba mais</Btn>
      </div>
    </div>

    {/* Cards de camadas */}
    <div style={{ maxWidth:900, margin:"0 auto", padding:"0 24px 48px" }}>
      <div className="hero-cards" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        {[
          { icon:"🔧", title:"Camada Física", desc:"Maquete 3D impressa em PLA com 12 vagas, sensores HC-SR04 por vaga e ESP32 transmitindo dados em tempo real via Wi-Fi." },
          { icon:"☁️", title:"Camada Backend", desc:"Servidor Node.js + MongoDB Atlas hospedado no Render. Gerencia reservas, usuários, pagamentos e regras de segurança automatizadas." },
          { icon:"💻", title:"Camada Web", desc:"Site responsivo em React + Vite com mapa ao vivo, reservas antecipadas, cronômetro de uso e painel administrativo completo." },
        ].map(c=>(
          <div key={c.title} style={{ background:C.bgCard, borderRadius:18, padding:"20px 18px", border:`1px solid ${C.border}`, boxShadow:C.sh }}>
            <div style={{ fontSize:26, marginBottom:10 }}>{c.icon}</div>
            <h3 style={{ fontFamily:F.head, fontSize:15, fontWeight:600, color:C.navy, marginBottom:7 }}>{c.title}</h3>
            <p style={{ fontSize:13, color:C.textLight, lineHeight:1.7, margin:0, fontFamily:F.body }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* SOBRE O PROJETO — EXPANDIDO */}
    <div id="sobre" className="about-section" style={{ background:C.bgCard, borderTop:`1px solid ${C.border}`, padding:"60px 24px" }}>
      <div style={{ maxWidth:860, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <h2 style={{ fontFamily:F.head, fontSize:30, fontWeight:700, color:C.navy, marginBottom:12 }}>Sobre o Projeto</h2>
          <p style={{ fontSize:14, color:C.textMid, lineHeight:1.85, maxWidth:680, margin:"0 auto", fontFamily:F.body }}>
            O <strong>OMV – Otimização e Monitoramento de Vagas</strong> é um projeto de conclusão de curso do Curso Técnico em Eletrônica. O sistema busca aplicar em prática os conhecimentos adquiridos ao longo do curso, propondo uma solução eficiente para o problema do fluxo de trânsito em estacionamentos privados — como shoppings, hospitais, universidades e empresas — onde a ausência de controle organizado resulta em desperdício de tempo e prejuízo para clientes e operadores.
          </p>
        </div>

        {/* Contexto */}
        <div style={{ background:C.bgSoft, borderRadius:16, padding:"22px 24px", marginBottom:20, border:`1px solid ${C.border}` }}>
          <h3 style={{ fontFamily:F.head, fontSize:16, fontWeight:700, color:C.navy, marginBottom:10 }}>📍 Contexto e Motivação</h3>
          <p style={{ fontSize:13.5, color:C.textMid, lineHeight:1.85, margin:0, fontFamily:F.body }}>
            Estacionamentos que negligenciam a organização de seus espaços geram congestionamentos internos, tempo desperdiçado na busca por vagas e sobrecarga dos operadores. A aplicação de sistemas embarcados — microcontroladores, sensores de presença e plataformas em nuvem — permite desenvolver soluções acessíveis e aplicáveis em contextos reais, integrando o ambiente físico ao digital por meio da Internet das Coisas (IoT).
          </p>
        </div>

        {/* As 3 camadas */}
        <h3 style={{ fontFamily:F.head, fontSize:17, fontWeight:700, color:C.navy, marginBottom:14 }}>Estrutura do Sistema</h3>
        <div className="about-grid" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14, marginBottom:24 }}>
          {[
            {
              icon:"🏗️", title:"Maquete Física (ESP32 + HC-SR04)",
              desc:"A maquete é impressa em PLA via impressora 3D e representa um estacionamento com 12 vagas distribuídas em 4 avenidas (A, B, C e D), com 3 vagas por avenida. Em cada vaga há um sensor ultrassônico HC-SR04 que detecta presença ou ausência de veículos. Dois ESP32 coletam essas leituras e as enviam ao servidor via protocolo HTTP sobre Wi-Fi. Displays instalados nas viradas de avenida exibem em tempo real a quantidade de vagas disponíveis naquele corredor.",
            },
            {
              icon:"☁️", title:"Backend e Banco de Dados (Node.js + MongoDB)",
              desc:"Servidor desenvolvido em Node.js com framework Express, hospedado gratuitamente no Render.com. O banco de dados MongoDB Atlas armazena usuários, reservas e logs de acesso. O servidor processa os dados dos sensores, gerencia o ciclo completo das reservas, aplica a taxa fixa de reserva, monitora o comparecimento com tolerância de 5 minutos, libera vagas automaticamente por ausência de veículo e registra multas por no-show.",
            },
            {
              icon:"💻", title:"Plataforma Web (React + Vite)",
              desc:"Site responsivo acessível em computadores e celulares, desenvolvido com React e Vite, hospedado no Vercel. Oferece ao cliente: mapa ao vivo do estacionamento, reservas antecipadas com data, horário, placa e modelo do veículo, cronômetro de uso em tempo real e pagamento digital simulado via PIX ou cartão. Para o operador: painel administrativo com dashboard de métricas, mapa ao vivo, gestão de reservas e usuários, logs de acesso e modo de demonstração.",
            },
            {
              icon:"📡", title:"Identificação por RFID (Segurança de Vaga)",
              desc:"Para verificar se o veículo estacionado corresponde ao da reserva, cada carrinho da maquete recebe uma tag RFID. Um leitor RC522 na entrada de cada vaga lê a tag e o ESP32 envia o ID ao backend, que compara com o identificador cadastrado na reserva. Essa lógica reproduz em escala reduzida o comportamento de um sistema real de reconhecimento óptico de placas por câmera.",
            },
          ].map(i=>(
            <div key={i.title} style={{ background:C.bgSoft, borderRadius:14, padding:"18px 16px", border:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <span style={{ fontSize:22 }}>{i.icon}</span>
                <h4 style={{ fontFamily:F.head, fontSize:14, fontWeight:700, color:C.navy, margin:0 }}>{i.title}</h4>
              </div>
              <p style={{ fontSize:12.5, color:C.textLight, lineHeight:1.75, margin:0, fontFamily:F.body }}>{i.desc}</p>
            </div>
          ))}
        </div>

        {/* Segurança e Logística */}
        <div style={{ background:C.redBg, borderRadius:16, padding:"20px 22px", marginBottom:20, border:`1px solid ${C.red}20` }}>
          <h3 style={{ fontFamily:F.head, fontSize:16, fontWeight:700, color:C.redDark, marginBottom:12 }}>🔒 Segurança e Logística Automatizada</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10 }}>
            {[
              { icon:"💰", title:"Taxa de reserva", desc:`R$ ${CFG.reservationFee || 10},00 cobrados na confirmação, garantindo intenção real de uso.` },
              { icon:"⏰", title:"Tolerância de chegada", desc:`${CFG.toleranceMinutes || 5} minutos após o horário reservado para o sensor detectar o veículo.` },
              { icon:"🚨", title:"No-show automático", desc:"Se o sensor não detectar o carro no prazo, a vaga é liberada e uma multa é aplicada automaticamente." },
              { icon:"↩️", title:"Cancelamento inteligente", desc:"Cancelamento com mais de 15 min de antecedência reembolsa a taxa. Cancelamento tardio retém o valor." },
            ].map(s=>(
              <div key={s.title} style={{ background:"rgba(255,255,255,.5)", borderRadius:10, padding:"12px 14px" }}>
                <p style={{ fontSize:14, marginBottom:4 }}>{s.icon}</p>
                <p style={{ fontSize:12.5, fontWeight:700, color:C.redDark, margin:"0 0 4px", fontFamily:F.body }}>{s.title}</p>
                <p style={{ fontSize:12, color:C.textMid, margin:0, lineHeight:1.6, fontFamily:F.body }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de componentes */}
        <div style={{ background:C.navyLight, borderRadius:16, padding:"20px 22px", marginBottom:32, border:`1px solid ${C.navy}20` }}>
          <h3 style={{ fontFamily:F.head, fontSize:16, fontWeight:700, color:C.navy, marginBottom:14 }}>🛠️ Lista de Componentes</h3>
          <div className="comp-grid" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8 }}>
            {[
              ["ESP32 38 pinos × 2",          "Microcontroladores principais — gerenciam sensores e enviam dados ao backend via Wi-Fi"],
              ["Sensor HC-SR04 × 12",          "Sensores ultrassônicos — detectam presença de veículo em cada vaga"],
              ["Display OLED 0.96\" I2C × 4", "Exibem vagas disponíveis nas viradas de avenida"],
              ["Módulo RFID RC522 + tags",     "Identificação de veículos na maquete em substituição à câmera de placas"],
              ["Protoboard 830pts × 2",        "Organização dos circuitos de cada ESP32"],
              ["Jumpers + fios flexíveis",     "Ligações entre sensores, displays e microcontroladores"],
              ["Fonte 5V 2A USB × 2",          "Alimentação dos ESP32 e periféricos"],
              ["Filamento PLA 1kg",            "Impressão 3D da maquete do estacionamento via Blender + fatiador"],
            ].map(([nome, desc])=>(
              <div key={nome} style={{ background:"rgba(255,255,255,.6)", borderRadius:10, padding:"10px 12px", display:"flex", flexDirection:"column", gap:3 }}>
                <span style={{ fontSize:13, fontWeight:700, color:C.navy, fontFamily:F.body }}>• {nome}</span>
                <span style={{ fontSize:11.5, color:C.textMid, fontFamily:F.body, lineHeight:1.5 }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Objetivos específicos */}
        <div style={{ background:C.purpleBg, borderRadius:16, padding:"20px 22px", marginBottom:36, border:`1px solid ${C.purple}20` }}>
          <h3 style={{ fontFamily:F.head, fontSize:16, fontWeight:700, color:C.purpleDark, marginBottom:14 }}>🎯 Objetivos Específicos</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { n:"01", title:"Desenvolvimento do site e backend sincronizados", desc:"Criação da interface web via JavaScript e React, do servidor via Node.js e Express, e das hospedagens em nuvem no Vercel (frontend) e Render (backend)." },
              { n:"02", title:"Modelagem e impressão da maquete 3D", desc:"Modelagem via Blender e exportação para fatiador de impressão 3D, transformando o modelo virtual em uma maquete física que simula o estacionamento." },
              { n:"03", title:"Identificação de veículo por RFID", desc:"Desenvolvimento do sistema de identificação por tags RFID, garantindo que o veículo na vaga corresponde ao registrado na reserva — equivalente ao OCR de placas em escala real." },
              { n:"04", title:"Validação da integração entre as camadas", desc:"Testes funcionais na maquete verificando convergência entre sensores, microcontroladores, backend e plataforma web — consistência entre estado físico e informações exibidas no site." },
            ].map(o=>(
              <div key={o.n} style={{ display:"flex", gap:14, background:"rgba(255,255,255,.5)", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:C.purple, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:"#fff", fontFamily:F.body }}>{o.n}</span>
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:C.purpleDark, margin:"0 0 4px", fontFamily:F.body }}>{o.title}</p>
                  <p style={{ fontSize:12.5, color:C.textMid, margin:0, lineHeight:1.6, fontFamily:F.body }}>{o.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign:"center" }}>
          <Btn onClick={onEnter} style={{ padding:"13px 36px", fontSize:15 }}>Acessar o sistema →</Btn>
        </div>
      </div>
    </div>

    <footer className="landing-footer" style={{ background:C.bgDark, borderTop:`1px solid ${C.border}`, padding:"18px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
      <span style={{ fontFamily:F.head, fontSize:14, fontWeight:600, color:C.navy }}>◈ Estacionamento OMV</span>
      <span style={{ fontSize:12, color:C.textLight, fontFamily:F.body }}>Projeto de TCC — Curso Técnico em Eletrônica</span>
    </footer>
  </div>
);

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
const LoginScreen = ({ onLogin, onBack }) => {
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
        if (!form.nomeCompleto||!form.username||!form.cpf||!form.endereco||!form.email||!form.password) { setErr("Preencha todos os campos."); setLoad(false); return; }
        ({ token, user } = await api.register({ ...form, email:form.email.trim(), username:form.username.trim() }));
      }
      localStorage.setItem("omv_token", token); onLogin(user);
    } catch(e) { setErr(e.message); } finally { setLoad(false); }
  };
  return (
    <div style={{ minHeight:"100vh", width:"100%", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:F.body, padding:"24px 16px" }}>
      <style>{GF+CSS}</style>
      <button onClick={onBack} style={{ position:"fixed", top:20, left:20, background:"none", border:"none", cursor:"pointer", color:C.textLight, fontSize:13, fontFamily:F.body, display:"flex", alignItems:"center", gap:4 }}>← Voltar</button>
      <div style={{ textAlign:"center", marginBottom:26 }}>
        <div style={{ fontFamily:F.head, fontSize:24, fontWeight:700, color:C.navy, marginBottom:4 }}>◈ Estacionamento OMV</div>
        <p style={{ fontSize:13, color:C.textLight }}>Sistema Inteligente de Estacionamento</p>
      </div>
      <div className="slide-up" style={{ background:C.bgCard, borderRadius:22, padding:"32px 28px", boxShadow:C.shLg, border:`1px solid ${C.border}`, width:"100%", maxWidth:440 }}>
        <h1 style={{ fontFamily:F.head, fontSize:21, fontWeight:700, color:C.navy, marginBottom:4 }}>{mode==="login"?"Bem-vindo de volta":"Criar conta"}</h1>
        <p style={{ color:C.textLight, fontSize:13, marginBottom:20 }}>{mode==="login"?"Acesse para reservar sua vaga.":"Preencha seus dados para se cadastrar."}</p>
        {mode==="register"&&<>
          <Fld label="Nome Completo" req><Inp value={form.nomeCompleto} onChange={set("nomeCompleto")} placeholder="João da Silva"/></Fld>
          <div className="form-row" style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}><Fld label="Usuário" req><Inp value={form.username} onChange={set("username")} placeholder="joaosilva"/></Fld></div>
            <div style={{ flex:1 }}><Fld label="Telefone"><Inp value={form.telefone} onChange={set("telefone")} placeholder="(11) 99999-0000"/></Fld></div>
          </div>
          <div className="form-row" style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}><Fld label="CPF" req><Inp value={form.cpf} onChange={set("cpf")} placeholder="000.000.000-00"/></Fld></div>
            <div style={{ flex:1 }}><Fld label="Endereço" req><Inp value={form.endereco} onChange={set("endereco")} placeholder="Rua, nº — Cidade"/></Fld></div>
          </div>
        </>}
        <Fld label="Email" req><Inp value={form.email} onChange={set("email")} placeholder="seu@email.com" onKeyDown={e=>e.key==="Enter"&&submit()}/></Fld>
        <Fld label="Senha" req><Inp type="password" value={form.password} onChange={set("password")} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()}/></Fld>
        <Err msg={err}/>
        <Btn onClick={submit} disabled={load} full style={{ padding:"13px", fontSize:15, marginTop:2 }}>{load?<Spin color="#FBF5EE"/>:(mode==="login"?"Entrar":"Criar conta")}</Btn>
        <p style={{ textAlign:"center", marginTop:16, fontSize:13, color:C.textLight }}>
          {mode==="login"?"Ainda não tem conta? ":"Já tem conta? "}
          <span onClick={()=>{setMode(mode==="login"?"register":"login");setErr("");}} style={{ color:C.navy, fontWeight:600, cursor:"pointer", textDecoration:"underline", textUnderlineOffset:2 }}>
            {mode==="login"?"Cadastre-se":"Entrar"}
          </span>
        </p>
        {mode==="login"&&(
          <div style={{ marginTop:18, background:C.navyLight, borderRadius:12, padding:"12px 14px" }}>
            <p style={{ fontSize:11, color:C.navyMid, fontWeight:700, marginBottom:3, letterSpacing:.8, textTransform:"uppercase" }}>Acesso Admin</p>
            <p style={{ fontSize:12, color:C.textMid, lineHeight:1.8 }}><strong style={{ color:C.navy }}>admin@omv.com</strong> / <strong style={{ color:C.navy }}>admin123</strong></p>
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
      <div className="stat-strip" style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
        {[
          { label:"Livres",        value:avail,        color:C.green,   bg:C.greenBg   },
          { label:"Ocupadas",      value:occ,          color:C.red,     bg:C.redBg     },
          { label:"Preferenciais", value:pref,         color:C.amber,   bg:C.amberBg   },
          { label:"Total",         value:spots.length, color:C.navyMid, bg:C.navyLight },
        ].map(p=>(
          <div key={p.label} style={{ background:p.bg, borderRadius:13, padding:"12px 15px", border:`1px solid ${p.color}30`, flex:"1 1 0", minWidth:70 }}>
            <div style={{ fontSize:22, fontFamily:F.head, fontWeight:700, color:p.color, lineHeight:1 }}>{p.value}</div>
            <div style={{ fontSize:10, color:p.color, fontWeight:600, marginTop:3, letterSpacing:.5, textTransform:"uppercase", fontFamily:F.body }}>{p.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background:C.bgCard, borderRadius:13, padding:"12px 15px", marginBottom:14, border:`1px solid ${C.border}`, boxShadow:C.sh }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontSize:12, fontWeight:600, color:C.textMid, fontFamily:F.body }}>Taxa de ocupação</span>
          <span style={{ fontSize:12, fontWeight:700, color:pct>70?C.red:pct>40?C.amber:C.green, fontFamily:F.body }}>{pct}%</span>
        </div>
        <div style={{ height:7, background:C.bgDark, borderRadius:20, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, borderRadius:20, transition:"width .6s ease", background:pct>70?C.red:pct>40?C.amber:C.green }}/>
        </div>
        <p style={{ fontSize:11, color:C.textLight, marginTop:5, fontFamily:F.body }}>
          {pct>70?"⚠ Estacionamento quase cheio":pct>40?"Ocupação moderada":"✓ Boa disponibilidade de vagas"}
        </p>
      </div>
      <ParkingGrid spots={spots} selId={null} onSpotClick={()=>{}} clickable={false}/>
    </div>
  );
};

// ─────────────────────────────────────────
// RESERVAS — BUG CORRIGIDO
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
  const [cancelLoad, setCancelLoad]   = useState(false);
  const [cancelResult, setCancelResult] = useState(null);
  const MODELOS = ["HB20","Onix","Gol","Argo","Mobi","Kwid","Creta","T-Cross","Compass","Tracker","Outros"];

  const handleConfirm = async () => {
    if (!time||!date) { setErr("Selecione data e horário."); return; }

    // ── CORREÇÃO DO BUG ──────────────────────────────────────
    // Usa buildStartTime que detecta reservas imediatas e usa new Date() diretamente
    const start  = buildStartTime(date, time);
    const tStr   = `${String(start.getHours()).padStart(2,"0")}:${String(start.getMinutes()).padStart(2,"0")}`;
    const dStr   = start.toISOString().split("T")[0];
    // ─────────────────────────────────────────────────────────

    setLoad(true); setErr("");
    try {
      await api.createReservation(sel._id, tStr, dStr, placa, modelo);
      onReserved(); setTab("payment");
    } catch(e) { setErr(e.message); } finally { setLoad(false); }
  };

  const handleCancel = async () => {
    if (!window.confirm("Deseja cancelar sua reserva?")) return;
    setCancelLoad(true);
    try { const r = await api.cancelReservation(activeRes._id); setCancelResult(r); onReserved(); }
    catch(e) { alert(e.message); } finally { setCancelLoad(false); }
  };

  if (cancelResult) return (
    <div style={{ maxWidth:440, margin:"0 auto" }}>
      <Card>
        <div style={{ textAlign:"center", padding:"10px 0 14px" }}>
          <div style={{ fontSize:38, marginBottom:10 }}>{cancelResult.feeRefunded?"✅":"💸"}</div>
          <p style={{ fontFamily:F.head, fontSize:17, fontWeight:700, color:C.navy, marginBottom:6 }}>Reserva cancelada</p>
          {cancelResult.feeRefunded
            ? <p style={{ fontSize:13, color:C.green, fontFamily:F.body }}>Taxa de reserva reembolsada — cancelamento com mais de 15 min de antecedência.</p>
            : <p style={{ fontSize:13, color:C.red, fontFamily:F.body }}>A taxa de reserva de <strong>{fmtMoney(cfg.reservationFee)}</strong> foi retida por cancelamento tardio.</p>
          }
        </div>
        <Btn full onClick={()=>{setCancelResult(null);setStep(1);}} v="ghost">Fechar</Btn>
      </Card>
    </div>
  );

  if (activeRes) return (
    <div style={{ maxWidth:460, margin:"0 auto" }}>
      <Card style={{ borderLeft:`4px solid ${activeRes.status==="no_show"?C.red:C.purple}` }}>
        {activeRes.status==="no_show"?(
          <>
            <InfoBox color={C.red} bg={C.redBg} icon="⚠" style={{ marginBottom:14 }}>
              <strong>No-show detectado.</strong> Multa de <strong>{fmtMoney(cfg.noShowFine)}</strong> aplicada por não comparecimento.
            </InfoBox>
            <Btn v="danger" full onClick={()=>setTab("payment")}>Pagar Multa → {fmtMoney(cfg.noShowFine)}</Btn>
          </>
        ):(
          <>
            <div style={{ display:"flex", alignItems:"center", gap:13, marginBottom:13 }}>
              <div style={{ width:42, height:42, borderRadius:"50%", background:C.purpleBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <CarIcon color={C.purple} size={20}/>
              </div>
              <div>
                <p style={{ fontFamily:F.head, fontWeight:600, fontSize:16, color:C.purpleDark, margin:0 }}>Reserva Ativa</p>
                <p style={{ fontSize:13, color:C.purple, margin:0, fontFamily:F.body }}>Vaga {activeRes.spotNumber} — às {activeRes.startTimeStr}</p>
                {activeRes.placa&&<p style={{ fontSize:12, color:C.purple, margin:0, fontFamily:F.body }}>🚗 {activeRes.placa}{activeRes.modelo&&` • ${activeRes.modelo}`}</p>}
              </div>
            </div>
            <InfoBox color={C.amberDark} bg={C.amberBg} icon="⏰" style={{ marginBottom:13 }}>
              Tolerância de <strong>{cfg.toleranceMinutes} min</strong> para chegada. Sem detecção = vaga liberada + multa de <strong>{fmtMoney(cfg.noShowFine)}</strong>.
            </InfoBox>
            <div style={{ display:"flex", gap:8 }}>
              <Btn v="outline" full onClick={()=>setTab("payment")} style={{ borderColor:C.purple, color:C.purpleDark }}>Ir para Pagamento</Btn>
              <Btn v="ghost" onClick={handleCancel} disabled={cancelLoad}>{cancelLoad?<Spin/>:"Cancelar"}</Btn>
            </div>
          </>
        )}
      </Card>
    </div>
  );

  return (
    <div>
      {step===1?(
        <div className="reserve-layout" style={{ display:"flex", gap:18, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:1, minWidth:0, maxWidth:"100%" }}>
            <p style={{ fontSize:13, color:C.textLight, marginBottom:11, lineHeight:1.6, fontFamily:F.body }}>
              Toque em uma vaga <span style={{ color:C.green, fontWeight:600 }}>verde</span> ou <span style={{ color:C.amber, fontWeight:600 }}>amarela</span> para selecionar.
            </p>
            <ParkingGrid spots={spots} selId={sel?._id} onSpotClick={s=>{setSel(p=>p?._id===s._id?null:s);setErr("");}} clickable={true}/>
          </div>
          {sel&&(
            <div className="res-sel-panel slide-up" style={{ width:230, flexShrink:0 }}>
              <Card>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:13, paddingBottom:11, borderBottom:`1px solid ${C.border}` }}>
                  <CarIcon color={C.navy} size={24}/>
                  <div>
                    <p style={{ fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:.8, margin:0, fontFamily:F.body }}>Selecionada</p>
                    <p style={{ fontSize:18, fontFamily:F.head, fontWeight:700, color:C.navy, margin:0 }}>{sel.row}{sel.spotNumber}</p>
                  </div>
                </div>
                <p style={{ fontSize:11, color:C.textLight, fontFamily:F.body, marginBottom:3 }}>Taxa de reserva</p>
                <p style={{ fontSize:16, fontFamily:F.head, fontWeight:700, color:C.navy, marginBottom:2 }}>{fmtMoney(cfg.reservationFee)}</p>
                <p style={{ fontSize:10, color:C.textLight, fontFamily:F.body, marginBottom:13 }}>+ {fmtMoney(cfg.pricePerHour)}/hora de uso</p>
                <Btn full onClick={()=>setStep(2)} style={{ marginBottom:7 }}>Continuar →</Btn>
                <Btn v="ghost" full onClick={()=>setSel(null)}>Cancelar</Btn>
              </Card>
            </div>
          )}
        </div>
      ):(
        <div style={{ maxWidth:420, margin:"0 auto" }} className="slide-up">
          <button onClick={()=>setStep(1)} style={{ background:"none", border:"none", cursor:"pointer", color:C.textLight, fontSize:13, fontFamily:F.body, marginBottom:13, display:"flex", alignItems:"center", gap:4 }}>← Voltar ao mapa</button>
          <Card>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, background:C.bg, borderRadius:11, padding:"11px 13px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                <CarIcon color={C.navy} size={24}/>
                <div>
                  <p style={{ fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:.8, margin:0, fontFamily:F.body }}>Vaga</p>
                  <p style={{ fontSize:17, fontFamily:F.head, fontWeight:700, color:C.navy, margin:0 }}>{sel?.row}{sel?.spotNumber}</p>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontSize:10, color:C.textLight, margin:0, fontFamily:F.body }}>Taxa + Uso</p>
                <p style={{ fontSize:13, fontWeight:700, color:C.navy, fontFamily:F.head, margin:0 }}>{fmtMoney(cfg.reservationFee)} + {fmtMoney(cfg.pricePerHour)}/h</p>
              </div>
            </div>
            <InfoBox color={C.amberDark} bg={C.amberBg} icon="ℹ" style={{ marginBottom:13 }}>
              Taxa de reserva de <strong>{fmtMoney(cfg.reservationFee)}</strong> ao confirmar. Tolerância de <strong>{cfg.toleranceMinutes} min</strong>. Cancelamento com +15 min = taxa reembolsada.
            </InfoBox>
            <Divider label="Quando vai usar?"/>
            <div className="form-row" style={{ display:"flex", gap:10 }}>
              <div style={{ flex:1 }}>
                <Fld label="Data" req>
                  <input type="date" value={date} min={todayStr()} onChange={e=>setDate(e.target.value)} style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:F.body, background:C.bgSoft, color:C.text, outline:"none" }}/>
                </Fld>
              </div>
              <div style={{ flex:1 }}>
                <Fld label="Horário" req hint="início">
                  <input type="time" value={time} onChange={e=>setTime(e.target.value)} style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:F.body, background:C.bgSoft, color:C.text, outline:"none" }}/>
                </Fld>
              </div>
            </div>
            <Divider label="Veículo (opcional)"/>
            <Fld label="Placa" hint="Ex: ABC1234">
              <Inp value={placa} onChange={e=>setPlaca(fmtPlaca(e.target.value))} placeholder="ABC1234" maxLength={7}/>
            </Fld>
            <Fld label="Modelo">
              <div className="model-btns" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:5 }}>
                {MODELOS.map(mod=>(
                  <button key={mod} onClick={()=>setModelo(m=>m===mod?"":mod)} style={{ padding:"7px 3px", borderRadius:9, textAlign:"center", border:`1.5px solid ${modelo===mod?C.navy:C.border}`, background:modelo===mod?C.navy:"transparent", color:modelo===mod?"#FBF5EE":C.textMid, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:F.body, transition:"all .15s" }}>{mod}</button>
                ))}
              </div>
            </Fld>
            <Err msg={err}/>
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              <Btn onClick={handleConfirm} disabled={load} full>{load?<Spin color="#FBF5EE"/>:`Confirmar — pagar ${fmtMoney(cfg.reservationFee)}`}</Btn>
              <Btn v="ghost" onClick={()=>setStep(1)}>Voltar</Btn>
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
const PaymentModal = ({ price, label, onConfirm, onClose }) => {
  const [method, setMethod] = useState("");
  const [step, setStep]     = useState(1);
  const [card, setCard]     = useState({ num:"", nome:"", val:"", cvv:"" });
  const handlePay = () => { setStep(3); setTimeout(onConfirm, 2200); };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(42,31,20,.6)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
      <div className="slide-up" style={{ background:C.bgCard, borderRadius:22, padding:26, maxWidth:400, width:"100%", boxShadow:C.shLg }} onClick={e=>e.stopPropagation()}>
        {step===3?(
          <div style={{ textAlign:"center", padding:"14px 0" }}>
            <Spin size={38} color={C.green}/>
            <p style={{ fontFamily:F.head, fontSize:17, fontWeight:600, color:C.navy, marginTop:14 }}>Processando...</p>
          </div>
        ):(
          <>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <h2 style={{ fontFamily:F.head, fontSize:17, fontWeight:700, color:C.navy }}>{label||"Confirmar Pagamento"}</h2>
              <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:17, color:C.textLight }}>✕</button>
            </div>
            <div style={{ background:C.greenBg, borderRadius:11, padding:"11px 15px", marginBottom:14, textAlign:"center" }}>
              <p style={{ fontSize:10, color:C.greenDark, textTransform:"uppercase", letterSpacing:.8, fontFamily:F.body, margin:0 }}>Total a pagar</p>
              <p style={{ fontSize:26, fontFamily:F.head, fontWeight:700, color:C.green, margin:0 }}>R$ {price}</p>
            </div>
            {step===1&&(
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {[
                  { key:"pix",  icon:"⚡", title:"PIX",            sub:"Aprovação instantânea",  border:C.border, bg:C.bgSoft  },
                  { key:"card", icon:"💳", title:"Cartão",          sub:"Crédito ou débito",      border:C.border, bg:C.bgSoft  },
                  { key:"demo", icon:"🎓", title:"Modo Demo (TCC)", sub:"Sem pagamento real",     border:C.amber,  bg:C.amberBg },
                ].map(opt=>(
                  <button key={opt.key} onClick={()=>{if(opt.key==="demo"){handlePay();}else{setMethod(opt.key);setStep(2);}}} style={{ display:"flex", alignItems:"center", gap:13, padding:"12px 14px", borderRadius:13, border:`2px solid ${opt.border}`, background:opt.bg, cursor:"pointer", textAlign:"left" }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:"rgba(0,0,0,.06)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:17 }}>{opt.icon}</div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:700, color:C.navy, margin:0, fontFamily:F.body }}>{opt.title}</p>
                      <p style={{ fontSize:11, color:C.textLight, margin:0, fontFamily:F.body }}>{opt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {step===2&&method==="pix"&&(
              <div>
                <div style={{ background:C.bgSoft, borderRadius:13, padding:14, marginBottom:13, textAlign:"center" }}>
                  <div style={{ width:120, height:120, margin:"0 auto 9px", background:C.navy, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, padding:7 }}>
                      {Array.from({length:49}).map((_,i)=><div key={i} style={{ width:10, height:10, background:Math.random()>.45?"#FBF5EE":"transparent", borderRadius:1 }}/>)}
                    </div>
                  </div>
                  <p style={{ fontSize:11, color:C.textLight, fontFamily:F.body }}>QR Code simulado para demonstração</p>
                </div>
                <Btn v="teal" full onClick={handlePay}>✓ Simular Pagamento PIX</Btn>
                <button onClick={()=>setStep(1)} style={{ marginTop:9, background:"none", border:"none", cursor:"pointer", color:C.textLight, fontSize:13, fontFamily:F.body, width:"100%" }}>← Voltar</button>
              </div>
            )}
            {step===2&&method==="card"&&(
              <div>
                <Fld label="Número"><Inp value={card.num} onChange={e=>setCard(p=>({...p,num:e.target.value.replace(/\D/g,"").slice(0,16).replace(/(\d{4})/g,"$1 ").trim()}))} placeholder="0000 0000 0000 0000" maxLength={19}/></Fld>
                <Fld label="Nome"><Inp value={card.nome} onChange={e=>setCard(p=>({...p,nome:e.target.value.toUpperCase()}))} placeholder="JOÃO DA SILVA"/></Fld>
                <div style={{ display:"flex", gap:10 }}>
                  <div style={{ flex:1 }}><Fld label="Validade"><Inp value={card.val} onChange={e=>setCard(p=>({...p,val:e.target.value.replace(/\D/g,"").slice(0,4).replace(/(\d{2})(\d)/,"$1/$2")}))} placeholder="MM/AA" maxLength={5}/></Fld></div>
                  <div style={{ flex:1 }}><Fld label="CVV"><Inp value={card.cvv} onChange={e=>setCard(p=>({...p,cvv:e.target.value.replace(/\D/g,"").slice(0,3)}))} placeholder="000" maxLength={3}/></Fld></div>
                </div>
                <InfoBox color={C.amberDark} bg={C.amberBg} icon="🎓" style={{ marginBottom:13 }}>Modo demonstração — nenhuma cobrança real será feita.</InfoBox>
                <Btn v="purple" full onClick={handlePay}>Confirmar Pagamento</Btn>
                <button onClick={()=>setStep(1)} style={{ marginTop:9, background:"none", border:"none", cursor:"pointer", color:C.textLight, fontSize:13, fontFamily:F.body, width:"100%" }}>← Voltar</button>
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
  const [secs, setSecs]           = useState(0);
  const [running, setRunning]     = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [paid, setPaid]           = useState(false);
  const [fp, setFp]               = useState(null);
  const [ft, setFt]               = useState(null);
  const [load, setLoad]           = useState(false);
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
    setLoad(true);
    try {
      const { totalPrice:tp } = await api.payReservation(activeRes._id);
      clearInterval(iv.current); setRunning(false); setPaid(true); setShowModal(false);
      setFp(tp.toFixed(2)); setFt(fmtTime(secs));
      setTimeout(()=>{ setPaid(false);setFp(null);setFt(null);setSecs(0);onPaid(); },5000);
    } catch(e){ alert(e.message); } finally { setLoad(false); }
  };

  if (paid) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:280, textAlign:"center", gap:13 }}>
      <div style={{ width:64, height:64, borderRadius:"50%", background:C.greenBg, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <p style={{ fontFamily:F.head, fontSize:22, fontWeight:700, color:C.green, margin:0 }}>Pagamento Confirmado!</p>
      <p style={{ fontSize:19, fontWeight:700, color:C.greenDark, fontFamily:F.head }}>{fmtMoney(fp)}</p>
      <p style={{ color:C.textLight, fontSize:13, fontFamily:F.body }}>Duração: {ft} — Obrigado!</p>
    </div>
  );

  return (
    <div className="pay-layout" style={{ display:"flex", gap:22, flexWrap:"wrap", alignItems:"flex-start" }}>
      {showModal&&<PaymentModal price={activeRes?.status==="no_show"?cfg.noShowFine.toFixed(2):totalPrice} label={activeRes?.status==="no_show"?"Pagar Multa No-Show":"Confirmar Pagamento"} onConfirm={handlePayConfirm} onClose={()=>setShowModal(false)}/>}
      <div className="pay-wrap" style={{ flex:"0 0 350px", display:"flex", flexDirection:"column", gap:13 }}>
        {!activeRes?(
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:220, textAlign:"center", gap:11, padding:18 }}>
            <div style={{ width:54, height:54, borderRadius:"50%", background:C.bgDark, display:"flex", alignItems:"center", justifyContent:"center" }}><CarIcon color={C.borderMid} size={26}/></div>
            <p style={{ fontFamily:F.head, fontSize:16, fontWeight:600, color:C.textLight }}>Nenhuma reserva ativa</p>
            <p style={{ fontSize:13, color:C.textLight, maxWidth:240, lineHeight:1.7, fontFamily:F.body }}>Reserve uma vaga na aba <strong style={{ color:C.textMid }}>Reservas</strong>.</p>
          </div>
        ):activeRes.status==="no_show"?(
          <>
            <InfoBox color={C.red} bg={C.redBg} icon="⚠">
              <strong>No-show detectado.</strong> Multa de <strong>{fmtMoney(cfg.noShowFine)}</strong> aplicada.
            </InfoBox>
            <Btn v="danger" full onClick={()=>setShowModal(true)} style={{ padding:"12px" }}>Pagar Multa — {fmtMoney(cfg.noShowFine)}</Btn>
          </>
        ):(
          <>
            <div style={{ display:"flex", alignItems:"center", gap:13, background:C.purpleBg, borderRadius:15, padding:"13px 17px", border:`1.5px solid ${C.purple}` }}>
              <CarIcon color={C.purple} size={30}/>
              <div>
                <p style={{ fontSize:10, fontWeight:600, color:C.purple, letterSpacing:1.2, textTransform:"uppercase", margin:0, fontFamily:F.body }}>Sua Vaga</p>
                <p style={{ fontFamily:F.head, fontSize:20, fontWeight:700, color:C.purpleDark, margin:0, lineHeight:1.1 }}>{activeRes.spot?.row}{activeRes.spotNumber}</p>
                <p style={{ fontSize:12, color:C.purple, margin:0, fontFamily:F.body }}>{activeRes.startTimeStr}{activeRes.placa&&` • ${activeRes.placa}`}</p>
              </div>
            </div>
            <div style={{ background:C.navy, borderRadius:17, padding:"17px 20px", textAlign:"center" }}>
              <p style={{ color:"#A89880", fontSize:10, fontWeight:600, letterSpacing:2, textTransform:"uppercase", marginBottom:7, fontFamily:F.body }}>{running?"Tempo Decorrido":"Aguardando Horário"}</p>
              <p className="timer-num" style={{ fontFamily:F.head, fontSize:42, fontWeight:700, color:"#FBF5EE", letterSpacing:2, lineHeight:1, margin:0 }}>{fmtTime(secs)}</p>
              {!running&&<p style={{ color:"#A89880", fontSize:11, marginTop:7, fontFamily:F.body }}>O cronômetro inicia no horário reservado.</p>}
            </div>
            {running&&(
              <div style={{ background:C.bgCard, borderRadius:13, padding:"12px 15px", border:`1px solid ${C.border}` }}>
                {[["Taxa de reserva",fmtMoney(cfg.reservationFee)],["Uso ("+fmtTime(secs)+")",fmtMoney(usagePrice)]].map(([k,v])=>(
                  <div key={k} className="fee-row" style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:12, color:C.textMid, fontFamily:F.body }}>{k}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:C.navy, fontFamily:F.body }}>{v}</span>
                  </div>
                ))}
                <div className="fee-row" style={{ display:"flex", justifyContent:"space-between", paddingTop:7, borderTop:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:13, fontWeight:700, color:C.navy, fontFamily:F.body }}>Total</span>
                  <span style={{ fontSize:17, fontWeight:700, color:C.green, fontFamily:F.head }}>{fmtMoney(totalPrice)}</span>
                </div>
              </div>
            )}
            {running&&<Btn v="amber" onClick={()=>setShowModal(true)} full style={{ padding:"12px" }}>Pagar Reserva — {fmtMoney(totalPrice)}</Btn>}
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
  const [history, setHistory]     = useState([]);
  const [activeRes, setActiveRes] = useState(null);
  const [load, setLoad]           = useState(true);
  const cpfFmt = user.cpf?user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4"):"—";

  useEffect(()=>{
    Promise.all([api.myHistory(), api.myReservation()])
      .then(([h,r])=>{ setHistory(h); setActiveRes(r); })
      .catch(()=>{}).finally(()=>setLoad(false));
  },[]);

  const totalGasto = history.reduce((a,r)=>a+(r.totalPrice||0),0);
  const totalSecs  = history.reduce((a,r)=>a+(r.totalSeconds||0),0);
  const statusBdg  = s=>{
    if (s==="paid")      return <Bdg color={C.greenDark} bg={C.greenBg}>Pago</Bdg>;
    if (s==="cancelled") return <Bdg color={C.textMid}   bg={C.bgDark}>Cancelado</Bdg>;
    if (s==="no_show")   return <Bdg color={C.red}       bg={C.redBg}>No-show</Bdg>;
    return null;
  };

  return (
    <div style={{ maxWidth:640, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16, background:C.bgCard, borderRadius:18, padding:"15px 18px", boxShadow:C.sh, border:`1px solid ${C.border}` }}>
        <div style={{ width:50, height:50, borderRadius:"50%", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, fontWeight:700, color:"#FBF5EE", fontFamily:F.head, flexShrink:0 }}>
          {(user.nomeCompleto?.[0]||user.email[0]).toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontFamily:F.head, fontSize:16, fontWeight:700, color:C.navy, margin:0 }}>{user.nomeCompleto||"—"}</p>
          <p style={{ fontSize:12, color:C.textLight, margin:0, fontFamily:F.body }}>@{user.username||"—"} • {user.email}</p>
        </div>
        <Btn v="ghost" sm onClick={onLogout}>Sair</Btn>
      </div>

      {activeRes&&(
        <div style={{ background:activeRes.status==="no_show"?C.redBg:C.purpleBg, borderRadius:13, padding:"11px 15px", marginBottom:13, border:`1.5px solid ${activeRes.status==="no_show"?C.red:C.purple}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:activeRes.status==="no_show"?C.red:C.purple, animation:"pulse 2s infinite", flexShrink:0 }}/>
            <p style={{ fontSize:12.5, fontWeight:600, color:activeRes.status==="no_show"?C.redDark:C.purpleDark, margin:0, fontFamily:F.body }}>
              {activeRes.status==="no_show"?"⚠ Multa pendente por no-show":`Reserva ativa — Vaga ${activeRes.spotNumber} às ${activeRes.startTimeStr}`}
            </p>
          </div>
        </div>
      )}

      <div className="profile-stats" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9, marginBottom:13 }}>
        {[
          { label:"Reservas",    value:history.length,       color:C.purple, bg:C.purpleBg },
          { label:"Total gasto", value:fmtMoney(totalGasto), color:C.green,  bg:C.greenBg  },
          { label:"Tempo total", value:fmtTime(totalSecs),   color:C.amber,  bg:C.amberBg  },
        ].map(p=>(
          <div key={p.label} style={{ background:p.bg, borderRadius:13, padding:"11px 13px", border:`1px solid ${p.color}30` }}>
            <div style={{ fontSize:14, fontFamily:F.head, fontWeight:700, color:p.color, lineHeight:1.2, wordBreak:"break-all" }}>{p.value}</div>
            <div style={{ fontSize:10, color:p.color, fontWeight:600, marginTop:3, letterSpacing:.5, textTransform:"uppercase", fontFamily:F.body }}>{p.label}</div>
          </div>
        ))}
      </div>

      <Card style={{ marginBottom:13 }}>
        <h3 style={{ fontFamily:F.head, fontSize:14, fontWeight:700, color:C.navy, marginBottom:13 }}>Dados Pessoais</h3>
        <div className="profile-grid2" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:11 }}>
          {[["Nome",user.nomeCompleto||"—"],["Usuário",`@${user.username||"—"}`],["Email",user.email],["CPF",cpfFmt],["Telefone",user.telefone||"—"],["Endereço",user.endereco||"—"]].map(([k,v])=>(
            <div key={k}>
              <p style={{ fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:.8, margin:"0 0 3px", fontFamily:F.body }}>{k}</p>
              <p style={{ fontSize:13, color:C.navy, fontWeight:500, margin:0, fontFamily:F.body, wordBreak:"break-all" }}>{v}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 style={{ fontFamily:F.head, fontSize:14, fontWeight:700, color:C.navy, marginBottom:13 }}>Histórico</h3>
        {load&&<div style={{ display:"flex", justifyContent:"center", padding:"14px 0" }}><Spin/></div>}
        {!load&&history.length===0&&<p style={{ fontSize:13, color:C.textLight, fontFamily:F.body }}>Nenhum pagamento ainda.</p>}
        {!load&&history.map((r,i)=>(
          <div key={r._id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:i<history.length-1?`1px solid ${C.border}`:"none", gap:10, flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:C.navyLight, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <CarIcon color={C.navyMid} size={14}/>
              </div>
              <div>
                <p style={{ fontFamily:F.body, fontSize:13, fontWeight:600, color:C.navy, margin:0 }}>Vaga {r.spotNumber}{r.placa&&` • ${r.placa}`}</p>
                <p style={{ fontSize:11, color:C.textLight, margin:0, fontFamily:F.body }}>{fmtDate(r.createdAt)}{r.totalSeconds?` • ${fmtTime(r.totalSeconds)}`:""}</p>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              {statusBdg(r.status)}
              <Bdg color={C.greenDark} bg={C.greenBg}>{fmtMoney(r.totalPrice)}</Bdg>
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
const UserModal = ({ user, onClose, onToggle }) => {
  if (!user) return null;
  const cpf = user.cpf?user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4"):"—";
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(42,31,20,.55)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
      <div className="fade-in" style={{ background:C.bgCard, borderRadius:20, padding:24, maxWidth:380, width:"100%", boxShadow:C.shLg }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", gap:13, marginBottom:15 }}>
          <div style={{ width:42, height:42, borderRadius:"50%", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:700, color:"#FBF5EE", fontFamily:F.head, flexShrink:0 }}>
            {(user.nomeCompleto?.[0]||user.email[0]).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:700, color:C.navy, margin:0, fontFamily:F.head }}>{user.nomeCompleto||"—"}</p>
            <p style={{ fontSize:11, color:C.textLight, margin:0, fontFamily:F.body }}>@{user.username||"—"}</p>
          </div>
        </div>
        {[["Email",user.email],["CPF",cpf],["Endereço",user.endereco||"—"],["Telefone",user.telefone||"—"],["Reservas",user.totalReservas||0],["Total Gasto",fmtMoney(user.totalGasto||0)],["Status",user.ativo?"Ativo":"Desativado"]].map(([k,v])=>(
          <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${C.border}` }}>
            <span style={{ fontSize:12, color:C.textLight, fontFamily:F.body }}>{k}</span>
            <span style={{ fontSize:12.5, fontWeight:600, color:k==="Status"?(user.ativo?C.green:C.red):C.navy, textAlign:"right", maxWidth:"58%", fontFamily:F.body, wordBreak:"break-all" }}>{String(v)}</span>
          </div>
        ))}
        <div style={{ display:"flex", gap:8, marginTop:14 }}>
          {!user.isAdmin&&onToggle&&<Btn v={user.ativo?"danger":"success"} sm onClick={()=>onToggle(user._id)} style={{ flex:1 }}>{user.ativo?"Desativar":"Reativar"}</Btn>}
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
  const cancelRes = async rid => {
    if (!window.confirm("Cancelar esta reserva?")) return;
    await api.adminCancelRes(rid); loadView("reservations");
  };

  const runDemo = async () => {
    setDemoLoad(true); setDemoMsg("");
    const available = spots.filter(s=>s.status==="available");
    if (!available.length) { setDemoMsg("Sem vagas livres para demonstrar."); setDemoLoad(false); return; }
    const spot = available[Math.floor(Math.random()*available.length)];
    setDemoMsg(`🚗 Carro entrando na vaga ${spot.row}${spot.spotNumber}...`);
    await api.sensorUpdate(spot.spotNumber, true); onSpotsUpdate();
    setTimeout(async()=>{
      setDemoMsg(`✅ Carro saindo da vaga ${spot.row}${spot.spotNumber}...`);
      await api.sensorUpdate(spot.spotNumber, false); onSpotsUpdate();
      setTimeout(()=>{ setDemoMsg("Demo concluída!"); setDemoLoad(false); },1500);
    },3000);
  };

  const noShows = res.filter(r=>r.status==="no_show").length;
  const row = { background:C.bgCard, borderRadius:13, padding:"11px 15px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:6, boxShadow:C.sh, border:`1px solid ${C.border}` };
  const fU = users.filter(u=>!search||(u.email+u.nomeCompleto+u.username).toLowerCase().includes(search.toLowerCase()));
  const fR = res.filter(r=>!search||(r.user?.email+r.user?.nomeCompleto+r.spotNumber).toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <UserModal user={selU} onClose={()=>setSelU(null)} onToggle={toggle}/>
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        {[["dashboard","Dashboard"],["reservations","Reservas"],["users","Usuários"],["logs","Logs"],["system","Sistema"]].map(([v,l])=>(
          <button key={v} onClick={()=>{setView(v);setSearch("");}} style={{ padding:"7px 18px", borderRadius:20, background:view===v?C.navy:C.border, color:view===v?"#FBF5EE":C.textMid, border:"none", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:F.body, transition:"all .15s" }}>
            {l}{v==="reservations"&&noShows>0&&<span style={{ marginLeft:5, background:C.red, color:"#fff", borderRadius:20, padding:"1px 6px", fontSize:10 }}>{noShows}</span>}
          </button>
        ))}
      </div>

      {(view==="users"||view==="reservations")&&(
        <div style={{ marginBottom:13 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." style={{ width:"100%", maxWidth:280, padding:"8px 15px", borderRadius:20, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:F.body, background:C.bgSoft, color:C.text, outline:"none" }}/>
        </div>
      )}

      {load&&<div style={{ display:"flex", justifyContent:"center", padding:"28px 0" }}><Spin/></div>}

      {/* DASHBOARD */}
      {!load&&view==="dashboard"&&dash&&(
        <div>
          {noShows>0&&<InfoBox color={C.redDark} bg={C.redBg} icon="⚠" style={{ marginBottom:14 }}><strong>{noShows} no-show(s) pendente(s)</strong> — clientes precisam pagar a multa.</InfoBox>}
          <div style={{ background:C.amberBg, borderRadius:15, padding:"14px 18px", marginBottom:16, border:`1px solid ${C.amber}30`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
            <div>
              <p style={{ fontFamily:F.head, fontSize:13, fontWeight:700, color:C.amberDark, margin:0 }}>🎓 Modo Demonstração</p>
              <p style={{ fontSize:12, color:C.amber, margin:0, fontFamily:F.body }}>Simula entrada e saída de veículo em uma vaga aleatória</p>
              {demoMsg&&<p style={{ fontSize:12, color:C.amberDark, margin:"5px 0 0", fontWeight:600, fontFamily:F.body }}>{demoMsg}</p>}
            </div>
            <Btn v="amber" onClick={runDemo} disabled={demoLoad} sm>{demoLoad?<Spin color="#fff"/>:"▶ Iniciar Demo"}</Btn>
          </div>
          <div className="dash-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:9, marginBottom:16 }}>
            {[
              { label:"Usuários",     value:dash.totalUsers,            color:C.navy,   bg:C.navyLight },
              { label:"Reservas",     value:dash.totalReservations,     color:C.purple, bg:C.purpleBg  },
              { label:"Pagas",        value:dash.paidReservations,      color:C.green,  bg:C.greenBg   },
              { label:"Receita",      value:fmtMoney(dash.totalRevenue),color:C.green,  bg:C.greenBg   },
              { label:"Livres",       value:dash.spotsAvailable,        color:C.green,  bg:C.greenBg   },
              { label:"Ocupadas",     value:dash.spotsOccupied,         color:C.red,    bg:C.redBg     },
              { label:"Preferenciais",value:dash.spotsPreferential,     color:C.amber,  bg:C.amberBg   },
              { label:"Ativas",       value:dash.activeReservations,    color:C.purple, bg:C.purpleBg  },
            ].map(p=>(
              <div key={p.label} style={{ background:p.bg, borderRadius:13, padding:"11px 13px", border:`1px solid ${p.color}30` }}>
                <div style={{ fontSize:17, fontFamily:F.head, fontWeight:700, color:p.color, lineHeight:1 }}>{p.value}</div>
                <div style={{ fontSize:9, color:p.color, fontWeight:700, marginTop:3, letterSpacing:.5, textTransform:"uppercase", fontFamily:F.body }}>{p.label}</div>
              </div>
            ))}
          </div>
          <Card style={{ marginBottom:13, padding:17 }}>
            <h3 style={{ fontFamily:F.head, fontSize:13, fontWeight:700, color:C.navy, marginBottom:11 }}>Mapa em Tempo Real</h3>
            <ParkingGrid spots={spots} selId={null} onSpotClick={()=>{}} clickable={false}/>
          </Card>
          {dash.revenueWeek?.length>0&&(
            <Card style={{ padding:17 }}>
              <h3 style={{ fontFamily:F.head, fontSize:13, fontWeight:700, color:C.navy, marginBottom:11 }}>Receita — Últimos 7 dias</h3>
              {dash.revenueWeek.map(d=>(
                <div key={d._id} style={{ display:"flex", alignItems:"center", gap:9, marginBottom:6 }}>
                  <span style={{ fontSize:11, color:C.textMid, minWidth:34, fontFamily:F.body }}>{d._id}</span>
                  <div style={{ flex:1, height:6, background:C.border, borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", background:C.green, borderRadius:4, width:`${Math.min(100,(d.total/500)*100)}%` }}/>
                  </div>
                  <span style={{ fontSize:12, fontWeight:600, color:C.green, minWidth:58, textAlign:"right", fontFamily:F.body }}>{fmtMoney(d.total)}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* SISTEMA */}
      {!load&&view==="system"&&(
        <div style={{ display:"flex", flexDirection:"column", gap:13 }}>

    {/* CONTROLE GERAL DE VAGAS */}
    <Card>
      <h3 style={{ fontFamily:F.head, fontSize:14, fontWeight:700, color:C.navy, marginBottom:8 }}>
        Controle Geral de Vagas
      </h3>
      <p style={{ fontSize:13, color:C.textLight, fontFamily:F.body, marginBottom:16, lineHeight:1.6 }}>
        Libera ou ocupa todas as vagas de uma vez. Útil para demonstrações e testes.
      </p>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        <Btn v="success" onClick={async()=>{
          if (!window.confirm("Liberar todas as 12 vagas?")) return;
          try {
            await api.resetSpots(false);
            onSpotsUpdate();
            alert("✅ Todas as vagas foram liberadas!");
          } catch(e){ alert("Erro: "+e.message); }
        }}>
          ✓ Liberar todas as vagas
        </Btn>
        <Btn v="danger" onClick={async()=>{
          if (!window.confirm("Ocupar todas as 12 vagas?")) return;
          try {
            await api.resetSpots(true);
            onSpotsUpdate();
            alert("🚗 Todas as vagas foram ocupadas!");
          } catch(e){ alert("Erro: "+e.message); }
        }}>
          ✕ Ocupar todas as vagas
        </Btn>
      </div>
    </Card>

    {/* MODO DEMO */}
    <Card>
      <h3 style={{ fontFamily:F.head, fontSize:14, fontWeight:700, color:C.navy, marginBottom:7 }}>🎓 Demonstração ao Vivo</h3>
      <p style={{ fontSize:13, color:C.textLight, fontFamily:F.body, marginBottom:13 }}>Simula um carro entrando e saindo de uma vaga em tempo real, sem precisar do ESP32 conectado.</p>
      {demoMsg&&<InfoBox color={C.amberDark} bg={C.amberBg} icon="🚗" style={{ marginBottom:11 }}>{demoMsg}</InfoBox>}
      <Btn v="amber" onClick={runDemo} disabled={demoLoad}>{demoLoad?<Spin color="#fff"/>:"▶ Iniciar Demonstração"}</Btn>
    </Card>

    {/* STATUS */}
    <Card>
      <h3 style={{ fontFamily:F.head, fontSize:14, fontWeight:700, color:C.navy, marginBottom:14 }}>Status do Sistema</h3>
      {[
        { label:"Backend API",     value:"Online", color:C.green, bg:C.greenBg, icon:"✅" },
        { label:"Banco de Dados",  value:"MongoDB Atlas — conectado", color:C.green, bg:C.greenBg, icon:"✅" },
        { label:"Frontend",        value:"Vercel — em operação", color:C.green, bg:C.greenBg, icon:"✅" },
        { label:"Sensores ESP32",  value:`${spots.length} vagas monitoradas`, color:C.purple, bg:C.purpleBg, icon:"📡" },
        { label:"Atualização",     value:"A cada 5 segundos", color:C.amber, bg:C.amberBg, icon:"🔄" },
      ].map(item=>(
        <div key={item.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${C.border}`, flexWrap:"wrap", gap:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <span style={{ fontSize:14 }}>{item.icon}</span>
            <span style={{ fontSize:13, color:C.textMid, fontFamily:F.body }}>{item.label}</span>
          </div>
          <span style={{ fontSize:11, fontWeight:600, color:item.color, background:item.bg, padding:"3px 10px", borderRadius:20, fontFamily:F.body }}>{item.value}</span>
        </div>
      ))}
    </Card>

    {/* ESTADO DAS VAGAS */}
    <Card>
      <h3 style={{ fontFamily:F.head, fontSize:14, fontWeight:700, color:C.navy, marginBottom:14 }}>Estado das Vagas</h3>
      {spots.map(s=>{
        const m = SM[s.status]||SM.available;
        return (
          <div key={s._id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${C.border}`, flexWrap:"wrap", gap:6 }}>
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <div style={{ width:7, height:7, borderRadius:2, background:m.bd, flexShrink:0 }}/>
              <span style={{ fontSize:13, color:C.navy, fontFamily:F.body, fontWeight:600 }}>Vaga {s.row}{s.spotNumber}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <span style={{ fontSize:10, color:C.textLight, fontFamily:F.body }}>Sensor: {s.sensorOccupied?"ocupado":"livre"}</span>
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
          {fR.length===0&&<p style={{ color:C.textLight, fontSize:13, fontFamily:F.body }}>Nenhuma reserva.</p>}
          {fR.map(r=>(
            <div key={r._id} style={row}>
              <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
                <button onClick={()=>setSelU(r.user)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, fontWeight:600, color:C.navy, fontFamily:F.body, textDecoration:"underline", textUnderlineOffset:2 }}>{r.user?.nomeCompleto||r.user?.email}</button>
                <Bdg color={C.purple} bg={C.purpleBg}>Vaga {r.spotNumber}</Bdg>
                <span style={{ fontSize:12, color:C.textMid, fontFamily:F.body }}>às {r.startTimeStr}</span>
                {r.placa&&<Bdg color={C.navyMid} bg={C.navyLight}>{r.placa}</Bdg>}
                {r.status==="paid"      && <Bdg color={C.greenDark} bg={C.greenBg}>Pago {fmtMoney(r.totalPrice)}</Bdg>}
                {r.status==="cancelled" && <Bdg color={C.textMid}   bg={C.bgDark}>Cancelado</Bdg>}
                {r.status==="no_show"   && <Bdg color={C.red}       bg={C.redBg}>No-show ⚠</Bdg>}
                {r.status==="active"    && <Bdg color={C.amberDark} bg={C.amberBg}>Em uso</Bdg>}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <span style={{ fontSize:11, color:C.textLight, fontFamily:F.body }}>{fmtDate(r.createdAt)}</span>
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
                <div style={{ width:34, height:34, borderRadius:"50%", background:u.isAdmin?C.navy:u.ativo?C.border:C.redBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:u.isAdmin?"#FBF5EE":u.ativo?C.textMid:C.red, fontFamily:F.head, flexShrink:0 }}>
                  {(u.nomeCompleto?.[0]||u.email[0]).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:C.navy, margin:0, fontFamily:F.body }}>{u.nomeCompleto||u.email}{u.username&&<span style={{ fontSize:11, color:C.textLight, marginLeft:5 }}>@{u.username}</span>}</p>
                  <p style={{ fontSize:11, color:C.textLight, margin:0, fontFamily:F.body }}>{u.email}</p>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                {u.isAdmin&&<Bdg color={C.navyMid} bg={C.navyLight}>Admin</Bdg>}
                {!u.ativo&&<Bdg color={C.red} bg={C.redBg}>Inativo</Bdg>}
                <span style={{ fontSize:11, color:C.textLight, fontFamily:F.body }}>{new Date(u.createdAt).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LOGS */}
      {!load&&view==="logs"&&(
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          {logs.length===0&&<p style={{ color:C.textLight, fontSize:13, fontFamily:F.body }}>Nenhum log.</p>}
          {logs.map(log=>(
            <div key={log._id} style={row}>
              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:C.navyLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:C.navy, fontFamily:F.head, flexShrink:0 }}>{log.email[0].toUpperCase()}</div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:C.navy, margin:0, fontFamily:F.body }}>{log.email}</p>
                  <p style={{ fontSize:12, color:C.textMid, margin:0, fontFamily:F.body }}>{log.action}</p>
                </div>
              </div>
              <span style={{ fontSize:11, color:C.textLight, fontFamily:F.body }}>{fmtDate(log.createdAt)}</span>
            </div>
          ))}
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
    { id:"overview", icon:"🅿", label:"Vagas"   },
    { id:"reserve",  icon:"＋", label:"Reservar" },
    { id:"payment",  icon:"⏱", label:"Pagar"    },
    { id:"profile",  icon:"👤", label:"Conta"    },
    ...(isAdmin?[{ id:"admin", icon:"⚙", label:"Admin" }]:[]),
  ];
  return (
    <div className="mobile-nav-bar" style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:200, background:C.bgCard, borderTop:`1px solid ${C.border}`, alignItems:"stretch", boxShadow:"0 -4px 20px rgba(61,43,26,0.10)" }}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, padding:"9px 4px 7px", border:"none", background:tab===t.id?C.navyLight:"transparent", color:tab===t.id?C.navy:C.textLight, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, transition:"all .15s", borderTop:tab===t.id?`2px solid ${C.navy}`:"2px solid transparent", fontFamily:F.body }}>
          <span style={{ fontSize:16, lineHeight:1 }}>{t.icon}</span>
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
  const [screen, setScreen]       = useState("landing");
  const [user, setUser]           = useState(null);
  const [spots, setSpots]         = useState([]);
  const [activeRes, setActiveRes] = useState(null);
  const [tab, setTab]             = useState("overview");
  const [booting, setBoot]        = useState(true);
  const [cfg, setCfg]             = useState(CFG);
  const [online, setOnline]       = useState(true);
  const [notifications, setNotifs] = useState([]);
  const prevSpotsRef = useRef([]);

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
      if (prevSpotsRef.current.length) {
        ns.forEach(s=>{
          const old = prevSpotsRef.current.find(o=>o._id===s._id);
          if (old&&old.status!==s.status) {
            if (s.status==="occupied"||s.status==="reserved") addNotif(`Vaga ${s.row}${s.spotNumber} ficou ocupada`,"occupied");
            else if (s.status==="available"||s.status==="preferential") addNotif(`Vaga ${s.row}${s.spotNumber} ficou disponível`,"available");
          }
        });
      }
      prevSpotsRef.current = ns;
      setSpots(ns);
    } catch {}
  };

  const loadRes  = async()=>{ try{ setActiveRes(await api.myReservation()); }catch{} };
  const logout   = ()=>{ localStorage.removeItem("omv_token"); setUser(null); setSpots([]); setActiveRes(null); setTab("overview"); setScreen("landing"); };

  if (booting) return (
    <div style={{ minHeight:"100vh", width:"100%", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{GF+CSS}</style>
      <div style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:11 }}>
        <Spin size={24}/><p style={{ fontFamily:F.head, fontSize:13, color:C.textLight, marginTop:4 }}>Carregando...</p>
      </div>
    </div>
  );

  if (screen==="landing") return <LandingPage onEnter={()=>setScreen("login")}/>;
  if (screen==="login")   return <LoginScreen onLogin={u=>{ setUser(u); setScreen("app"); }} onBack={()=>setScreen("landing")}/>;

  const desktopTabs = [
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
      <NotificationCenter notifications={notifications}/>

      <header className="desktop-header" style={{ background:C.bgCard, borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:100, width:"100%" }}>
        <div style={{ width:"100%", padding:"0 48px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", gap:14 }}>
          <div style={{ fontFamily:F.head, fontSize:19, fontWeight:700, color:C.navy, whiteSpace:"nowrap" }}>◈ Estacionamento OMV</div>
          <nav style={{ display:"flex", gap:3 }}>
            {desktopTabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"7px 17px", borderRadius:20, border:"none", background:tab===t.id?C.navy:"transparent", color:tab===t.id?"#FBF5EE":C.textMid, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:F.body, transition:"all .15s", whiteSpace:"nowrap" }}>{t.label}</button>
            ))}
          </nav>
          <div style={{ display:"flex", alignItems:"center", gap:13, flexShrink:0 }}>
            <ConnectionDot online={online}/>
            <div style={{ width:1, height:18, background:C.border }}/>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:12, fontWeight:600, color:C.navy, margin:0, fontFamily:F.body }}>{user.nomeCompleto||user.email}</p>
              <p style={{ fontSize:10, color:C.textLight, margin:0, fontFamily:F.body }}>{user.isAdmin?"Administrador":user.email}</p>
            </div>
            <button onClick={logout} style={{ padding:"6px 13px", borderRadius:20, background:C.bgDark, color:C.textMid, border:`1px solid ${C.border}`, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:F.body }}>Sair</button>
          </div>
        </div>
      </header>

      <main className="main-content" style={{ width:"100%", padding:"28px 48px" }}>
        <h1 className="page-title" style={{ fontFamily:F.head, fontSize:23, fontWeight:700, color:C.navy, marginBottom:18 }}>{titles[tab]}</h1>
        {tab==="overview" && <OverviewTab spots={spots}/>}
        {tab==="reserve"  && <ReserveTab spots={spots} activeRes={activeRes} onReserved={()=>{loadSpots();loadRes();}} setTab={setTab} cfg={cfg}/>}
        {tab==="payment"  && <PaymentTab activeRes={activeRes} onPaid={()=>{loadSpots();setActiveRes(null);}} cfg={cfg}/>}
        {tab==="profile"  && <ProfileTab user={user} onLogout={logout}/>}
        {tab==="admin"&&user.isAdmin&&<AdminTab spots={spots} onSpotsUpdate={loadSpots}/>}
      </main>

      <MobileNav tab={tab} setTab={setTab} isAdmin={user.isAdmin}/>
    </div>
  );
}