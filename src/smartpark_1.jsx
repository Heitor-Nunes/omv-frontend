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

@media (max-width:768px) {
  .mobile-nav-bar  { display:flex !important; }
  .desktop-header  { display:none !important; }
  .main-content    { padding:18px 14px 86px !important; }
  .page-title      { font-size:18px !important; margin-bottom:14px !important; }
  .dash-grid       { grid-template-columns:repeat(2,1fr) !important; gap:8px !important; }
  .form-row        { flex-direction:column !important; }
  .pay-wrap        { width:100% !important; flex:none !important; }
  .pay-layout      { flex-direction:column !important; }
  .profile-grid2   { grid-template-columns:1fr !important; }
  .profile-stats   { grid-template-columns:repeat(2,1fr) !important; }
  .spot-row-wrap   { gap:5px !important; }
  .spot-card-item  { min-width:0 !important; flex:1 1 0 !important; }
  .park-section    { flex-direction:column !important; gap:6px !important; }
  .park-via        { width:100% !important; height:16px !important; min-height:0 !important; }
  .park-via-txt    { writing-mode:horizontal-tb !important; }
  .model-btns      { grid-template-columns:repeat(3,1fr) !important; }
  .timer-num       { font-size:34px !important; }
  .fee-row         { flex-direction:column !important; gap:6px !important; }
  .res-sel-panel   { width:100% !important; }
  .hero-title      { font-size:28px !important; }
  .hero-sub        { font-size:14px !important; }
  .hero-cards      { grid-template-columns:1fr !important; }
  .about-grid      { grid-template-columns:1fr !important; }
}
@media (max-width:420px) {
  .page-title { font-size:15px !important; }
  .timer-num  { font-size:26px !important; }
  .dash-grid  { grid-template-columns:1fr 1fr !important; }
  .model-btns { grid-template-columns:repeat(3,1fr) !important; }
  .hero-title { font-size:22px !important; }
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
  <div style={{ marginBottom:14 }}>
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
    padding:"10px 14px", marginBottom:14, fontSize:13, color:C.red, fontWeight:500, lineHeight:1.5 }}>⚠ {msg}</div>
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
  <div style={{ display:"flex", alignItems:"center", gap:12, margin:"16px 0" }}>
    <div style={{ flex:1, height:1, background:C.border }}/>
    {label&&<span style={{ fontSize:10, color:C.textLight, fontFamily:F.body, letterSpacing:.8, textTransform:"uppercase", whiteSpace:"nowrap" }}>{label}</span>}
    <div style={{ flex:1, height:1, background:C.border }}/>
  </div>
);

// ─────────────────────────────────────────
// NOTIFICAÇÕES EM TEMPO REAL
// ─────────────────────────────────────────
const NotificationCenter = ({ notifications }) => {
  if (!notifications.length) return null;
  return (
    <div style={{ position:"fixed", top:70, right:16, zIndex:500, display:"flex", flexDirection:"column", gap:8, maxWidth:300 }}>
      {notifications.map(n=>(
        <div key={n.id} className="slide-in" style={{
          background:n.type==="occupied"?C.redBg:n.type==="available"?C.greenBg:C.amberBg,
          border:`1px solid ${n.type==="occupied"?C.red:n.type==="available"?C.green:C.amber}`,
          borderRadius:12, padding:"10px 14px", boxShadow:C.shLg,
          display:"flex", alignItems:"center", gap:10,
        }}>
          <span style={{ fontSize:16 }}>{n.type==="occupied"?"🚗":n.type==="available"?"✅":"⚠"}</span>
          <p style={{ fontSize:12.5, color:C.text, margin:0, fontFamily:F.body, lineHeight:1.4 }}>{n.msg}</p>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────
// INDICADOR DE CONEXÃO
// ─────────────────────────────────────────
const ConnectionDot = ({ online }) => (
  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
    <div style={{ width:8, height:8, borderRadius:"50%", background:online?C.green:C.red, animation:online?"none":"blink 1.5s infinite", flexShrink:0 }}/>
    <span style={{ fontSize:11, color:online?C.green:C.red, fontWeight:600, fontFamily:F.body }}>{online?"Online":"Offline"}</span>
  </div>
);

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
      background:isSel?m.bd:m.bg, border:`2px solid ${m.bd}`, borderRadius:14,
      padding:"10px 6px 8px", display:"flex", flexDirection:"column",
      alignItems:"center", gap:3, cursor:can?"pointer":"default",
      transition:"all .18s", boxShadow:isSel?`0 6px 20px ${m.bd}55`:C.sh,
      transform:isSel?"scale(1.08)":"scale(1)", flex:"1 1 0", minWidth:64, userSelect:"none",
    }}>
      <span style={{ fontSize:9, fontWeight:700, color:isSel?"#fff":m.tx, letterSpacing:.8, fontFamily:F.body }}>{spot.row}{spot.spotNumber}</span>
      <CarIcon size={26} color={isSel?"#fff":m.car}/>
      <span style={{ fontSize:8, fontWeight:700, color:isSel?"rgba(255,255,255,.85)":m.tx, letterSpacing:.4, textTransform:"uppercase", fontFamily:F.body }}>{m.lb}</span>
    </div>
  );
};

// ─────────────────────────────────────────
// PARKING GRID
// ─────────────────────────────────────────
const ParkingGrid = ({ spots, selId, onSpotClick, clickable=false }) => {
  const RoadH = ({ label }) => (
    <div style={{ height:22, background:C.bgDark, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", width:"100%" }}>
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
      <div className="spot-row-wrap" style={{ display:"flex", gap:6 }}>
        {spots.filter(s=>s.row===row).map(s=><SpotCard key={s._id} spot={s} isSel={selId===s._id} onClick={onSpotClick} clickable={clickable}/>)}
      </div>
    </div>
  );
  const Via = () => (
    <div className="park-via" style={{ width:28, background:C.bgDark, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", flexShrink:0, minHeight:70 }}>
      <div style={{ position:"absolute", left:"50%", top:0, bottom:0, width:2, background:`repeating-linear-gradient(to bottom,${C.bgSoft} 0,${C.bgSoft} 10px,transparent 10px,transparent 20px)`, transform:"translateX(-50%)"}}/>
      <span className="park-via-txt" style={{ fontSize:7, fontWeight:700, color:C.textLight, textTransform:"uppercase", fontFamily:F.body, writingMode:"vertical-rl", position:"relative" }}>Via</span>
    </div>
  );
  const Block = ({ l, r, ll, rl }) => (
    <div className="park-section" style={{ display:"flex", gap:0, alignItems:"stretch", width:"100%" }}>
      <div style={{ flex:1, background:C.bgSoft, borderRadius:12, padding:"10px 8px", border:`1px solid ${C.border}`, minWidth:0 }}>
        <div style={{ fontSize:8, fontWeight:700, color:C.amberDark, letterSpacing:1, textTransform:"uppercase", fontFamily:F.body, marginBottom:7, textAlign:"center" }}>{ll}</div>
        <RowSpots row={l}/>
      </div>
      <Via/>
      <div style={{ flex:1, background:C.bgSoft, borderRadius:12, padding:"10px 8px", border:`1px solid ${C.border}`, minWidth:0 }}>
        <div style={{ fontSize:8, fontWeight:700, color:C.navyMid, letterSpacing:1, textTransform:"uppercase", fontFamily:F.body, marginBottom:7, textAlign:"center" }}>{rl}</div>
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
// LANDING PAGE — NOVA
// ─────────────────────────────────────────
const LandingPage = ({ onEnter }) => (
  <div style={{ minHeight:"100vh", width:"100%", background:C.bg, fontFamily:F.body }}>
    <style>{GF+CSS}</style>
    {/* Header */}
    <header style={{ background:C.bgCard, borderBottom:`1px solid ${C.border}`, padding:"0 48px", height:62, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div style={{ fontFamily:F.head, fontSize:20, fontWeight:700, color:C.navy }}>◈ Estacionamento OMV</div>
      <Btn onClick={onEnter} sm>Acessar o sistema →</Btn>
    </header>

    {/* Hero */}
    <div style={{ maxWidth:900, margin:"0 auto", padding:"72px 24px 48px", textAlign:"center" }}>
      <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:C.greenBg, border:`1px solid ${C.green}30`, borderRadius:20, padding:"6px 16px", marginBottom:24 }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:C.green, animation:"pulse 2s infinite" }}/>
        <span style={{ fontSize:12, color:C.greenDark, fontWeight:600 }}>Sistema em operação</span>
      </div>
      <h1 className="hero-title" style={{ fontFamily:F.head, fontSize:48, fontWeight:700, color:C.navy, lineHeight:1.15, marginBottom:20 }}>
        Estacionamento inteligente<br/>do jeito que deveria ser
      </h1>
      <p className="hero-sub" style={{ fontSize:17, color:C.textLight, maxWidth:560, margin:"0 auto 36px", lineHeight:1.7 }}>
        O <strong style={{ color:C.navy }}>OMV</strong> monitora suas vagas em tempo real, permite reservas antecipadas e integra sensores físicos à plataforma digital.
      </p>
      <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
        <Btn onClick={onEnter} style={{ padding:"14px 32px", fontSize:16 }}>Entrar no sistema</Btn>
        <Btn v="outline" onClick={()=>document.getElementById("sobre").scrollIntoView({behavior:"smooth"})} style={{ padding:"14px 32px", fontSize:16 }}>Sobre o projeto</Btn>
      </div>
    </div>

    {/* Cards de features */}
    <div className="hero-cards" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, maxWidth:900, margin:"0 auto 64px", padding:"0 24px" }}>
      {[
        { icon:"🅿️", title:"Monitoramento em tempo real", desc:"Visualize todas as vagas do estacionamento ao vivo, com atualização automática via sensores ESP32." },
        { icon:"📅", title:"Reservas antecipadas", desc:"Reserve sua vaga com hora marcada. Taxa fixa de reserva garante segurança para o operador e o cliente." },
        { icon:"📊", title:"Painel administrativo", desc:"Dashboard completo com métricas, histórico de reservas, gestão de usuários e logs de acesso." },
      ].map(c=>(
        <div key={c.title} style={{ background:C.bgCard, borderRadius:18, padding:"22px 20px", border:`1px solid ${C.border}`, boxShadow:C.sh }}>
          <div style={{ fontSize:28, marginBottom:12 }}>{c.icon}</div>
          <h3 style={{ fontFamily:F.head, fontSize:16, fontWeight:600, color:C.navy, marginBottom:8 }}>{c.title}</h3>
          <p style={{ fontSize:13, color:C.textLight, lineHeight:1.7, margin:0 }}>{c.desc}</p>
        </div>
      ))}
    </div>

    {/* Sobre o projeto */}
    <div id="sobre" style={{ background:C.bgCard, borderTop:`1px solid ${C.border}`, padding:"64px 24px" }}>
      <div style={{ maxWidth:820, margin:"0 auto" }}>
        <h2 style={{ fontFamily:F.head, fontSize:28, fontWeight:700, color:C.navy, marginBottom:16, textAlign:"center" }}>Sobre o Projeto</h2>
        <p style={{ fontSize:14, color:C.textMid, lineHeight:1.9, marginBottom:28, textAlign:"center", maxWidth:640, margin:"0 auto 32px" }}>
          O <strong>OMV – Otimização e Monitoramento de Vagas</strong> é um projeto de conclusão de curso do curso Técnico em Eletrônica, desenvolvido com o objetivo de aplicar conceitos de IoT, sistemas embarcados e desenvolvimento web na resolução de um problema real.
        </p>
        <div className="about-grid" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
          {[
            { icon:"🔧", title:"Hardware", desc:"ESP32 + sensores HC-SR04 detectam veículos e enviam dados via Wi-Fi para a nuvem em tempo real." },
            { icon:"☁️", title:"Backend", desc:"Node.js + MongoDB Atlas gerenciam reservas, usuários, pagamentos e regras de negócio." },
            { icon:"💻", title:"Frontend", desc:"React + Vite oferecem interface responsiva para clientes e operadores, acessível em qualquer dispositivo." },
            { icon:"🔒", title:"Segurança", desc:"Taxa de reserva, tolerância de chegada, no-show automático e multas garantem operação confiável." },
          ].map(i=>(
            <div key={i.title} style={{ display:"flex", gap:14, padding:"16px", background:C.bgSoft, borderRadius:14, border:`1px solid ${C.border}` }}>
              <span style={{ fontSize:24, flexShrink:0 }}>{i.icon}</span>
              <div>
                <h4 style={{ fontFamily:F.head, fontSize:14, fontWeight:600, color:C.navy, marginBottom:4 }}>{i.title}</h4>
                <p style={{ fontSize:12.5, color:C.textLight, lineHeight:1.6, margin:0 }}>{i.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:36 }}>
          <Btn onClick={onEnter} style={{ padding:"13px 36px", fontSize:15 }}>Acessar o sistema →</Btn>
        </div>
      </div>
    </div>

    <footer style={{ background:C.bgDark, borderTop:`1px solid ${C.border}`, padding:"20px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
      <span style={{ fontFamily:F.head, fontSize:14, fontWeight:600, color:C.navy }}>◈ Estacionamento OMV</span>
      <span style={{ fontSize:12, color:C.textLight }}>Projeto de TCC — Curso Técnico em Eletrônica</span>
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
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ fontFamily:F.head, fontSize:26, fontWeight:700, color:C.navy, marginBottom:4 }}>◈ Estacionamento OMV</div>
        <p style={{ fontSize:13, color:C.textLight }}>Sistema Inteligente de Estacionamento</p>
      </div>
      <div className="slide-up" style={{ background:C.bgCard, borderRadius:24, padding:"34px 30px", boxShadow:C.shLg, border:`1px solid ${C.border}`, width:"100%", maxWidth:440 }}>
        <h1 style={{ fontFamily:F.head, fontSize:22, fontWeight:700, color:C.navy, marginBottom:4 }}>{mode==="login"?"Bem-vindo de volta":"Criar conta"}</h1>
        <p style={{ color:C.textLight, fontSize:13, marginBottom:22 }}>{mode==="login"?"Acesse para reservar sua vaga.":"Preencha seus dados para se cadastrar."}</p>
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
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        {[
          { label:"Livres",        value:avail,        color:C.green,   bg:C.greenBg   },
          { label:"Ocupadas",      value:occ,          color:C.red,     bg:C.redBg     },
          { label:"Preferenciais", value:pref,         color:C.amber,   bg:C.amberBg   },
          { label:"Total",         value:spots.length, color:C.navyMid, bg:C.navyLight },
        ].map(p=>(
          <div key={p.label} style={{ background:p.bg, borderRadius:14, padding:"13px 16px", border:`1px solid ${p.color}30`, flex:"1 1 0", minWidth:70 }}>
            <div style={{ fontSize:24, fontFamily:F.head, fontWeight:700, color:p.color, lineHeight:1 }}>{p.value}</div>
            <div style={{ fontSize:10, color:p.color, fontWeight:600, marginTop:3, letterSpacing:.5, textTransform:"uppercase", fontFamily:F.body }}>{p.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background:C.bgCard, borderRadius:14, padding:"13px 16px", marginBottom:16, border:`1px solid ${C.border}`, boxShadow:C.sh }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
          <span style={{ fontSize:12, fontWeight:600, color:C.textMid, fontFamily:F.body }}>Taxa de ocupação</span>
          <span style={{ fontSize:12, fontWeight:700, color:pct>70?C.red:pct>40?C.amber:C.green, fontFamily:F.body }}>{pct}%</span>
        </div>
        <div style={{ height:8, background:C.bgDark, borderRadius:20, overflow:"hidden" }}>
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
  const [cancelLoad, setCancelLoad] = useState(false);
  const [cancelResult, setCancelResult] = useState(null);
  const MODELOS = ["HB20","Onix","Gol","Argo","Mobi","Kwid","Creta","T-Cross","Compass","Tracker","Outros"];

  const handleConfirm = async () => {
    if (!time||!date) { setErr("Selecione data e horário."); return; }
    const [y,mo,d] = date.split("-").map(Number);
    const [h,m]    = time.split(":").map(Number);
    let start = new Date(y,mo-1,d,h,m,0,0);
    if (start<new Date()) start = new Date();
    const tStr = `${String(start.getHours()).padStart(2,"0")}:${String(start.getMinutes()).padStart(2,"0")}`;
    const dStr = start.toISOString().split("T")[0];
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
    <div style={{ maxWidth:440, margin:"0 auto" }}>
      <Card>
        <div style={{ textAlign:"center", padding:"10px 0 16px" }}>
          <div style={{ fontSize:40, marginBottom:10 }}>{cancelResult.feeRefunded?"✅":"💸"}</div>
          <p style={{ fontFamily:F.head, fontSize:18, fontWeight:700, color:C.navy, marginBottom:6 }}>Reserva cancelada</p>
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
              <strong>No-show detectado.</strong> Você não compareceu no horário reservado. Multa de <strong>{fmtMoney(cfg.noShowFine)}</strong> aplicada.
            </InfoBox>
            <Btn v="danger" full onClick={()=>setTab("payment")}>Pagar Multa → {fmtMoney(cfg.noShowFine)}</Btn>
          </>
        ):(
          <>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:C.purpleBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <CarIcon color={C.purple} size={22}/>
              </div>
              <div>
                <p style={{ fontFamily:F.head, fontWeight:600, fontSize:17, color:C.purpleDark, margin:0 }}>Reserva Ativa</p>
                <p style={{ fontSize:13, color:C.purple, margin:0, fontFamily:F.body }}>Vaga {activeRes.spotNumber} — às {activeRes.startTimeStr}</p>
                {activeRes.placa&&<p style={{ fontSize:12, color:C.purple, margin:0, fontFamily:F.body }}>🚗 {activeRes.placa}{activeRes.modelo&&` • ${activeRes.modelo}`}</p>}
              </div>
            </div>
            <InfoBox color={C.amberDark} bg={C.amberBg} icon="⏰" style={{ marginBottom:14 }}>
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
        <div style={{ display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:1, minWidth:0, maxWidth:"100%" }}>
            <p style={{ fontSize:13, color:C.textLight, marginBottom:12, lineHeight:1.6, fontFamily:F.body }}>
              Toque em uma vaga <span style={{ color:C.green, fontWeight:600 }}>verde</span> ou <span style={{ color:C.amber, fontWeight:600 }}>amarela</span> para selecionar.
            </p>
            <ParkingGrid spots={spots} selId={sel?._id} onSpotClick={s=>{setSel(p=>p?._id===s._id?null:s);setErr("");}} clickable={true}/>
          </div>
          {sel&&(
            <div className="res-sel-panel slide-up" style={{ width:240, flexShrink:0 }}>
              <Card>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, paddingBottom:12, borderBottom:`1px solid ${C.border}` }}>
                  <CarIcon color={C.navy} size={26}/>
                  <div>
                    <p style={{ fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:.8, margin:0, fontFamily:F.body }}>Selecionada</p>
                    <p style={{ fontSize:18, fontFamily:F.head, fontWeight:700, color:C.navy, margin:0 }}>{sel.row}{sel.spotNumber}</p>
                  </div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <p style={{ fontSize:11, color:C.textLight, fontFamily:F.body, marginBottom:4 }}>Taxa de reserva</p>
                  <p style={{ fontSize:16, fontFamily:F.head, fontWeight:700, color:C.navy }}>{fmtMoney(cfg.reservationFee)}</p>
                  <p style={{ fontSize:10, color:C.textLight, fontFamily:F.body }}>+ {fmtMoney(cfg.pricePerHour)}/hora de uso</p>
                </div>
                <Btn full onClick={()=>setStep(2)} style={{ marginBottom:8 }}>Continuar →</Btn>
                <Btn v="ghost" full onClick={()=>setSel(null)}>Cancelar</Btn>
              </Card>
            </div>
          )}
        </div>
      ):(
        <div style={{ maxWidth:440, margin:"0 auto" }} className="slide-up">
          <button onClick={()=>setStep(1)} style={{ background:"none", border:"none", cursor:"pointer", color:C.textLight, fontSize:13, fontFamily:F.body, marginBottom:14, display:"flex", alignItems:"center", gap:4 }}>← Voltar ao mapa</button>
          <Card>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, background:C.bg, borderRadius:12, padding:"12px 14px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <CarIcon color={C.navy} size={26}/>
                <div>
                  <p style={{ fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:.8, margin:0, fontFamily:F.body }}>Vaga</p>
                  <p style={{ fontSize:18, fontFamily:F.head, fontWeight:700, color:C.navy, margin:0 }}>{sel?.row}{sel?.spotNumber}</p>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontSize:10, color:C.textLight, margin:0, fontFamily:F.body }}>Taxa + Uso</p>
                <p style={{ fontSize:14, fontWeight:700, color:C.navy, fontFamily:F.head, margin:0 }}>{fmtMoney(cfg.reservationFee)} + {fmtMoney(cfg.pricePerHour)}/h</p>
              </div>
            </div>
            <InfoBox color={C.amberDark} bg={C.amberBg} icon="ℹ" style={{ marginBottom:14 }}>
              Taxa de reserva de <strong>{fmtMoney(cfg.reservationFee)}</strong> ao confirmar. Tolerância de <strong>{cfg.toleranceMinutes} min</strong>. Cancelamento com +15 min tem taxa reembolsada.
            </InfoBox>
            <Divider label="Quando vai usar?"/>
            <div className="form-row" style={{ display:"flex", gap:10 }}>
              <div style={{ flex:1 }}>
                <Fld label="Data" req>
                  <input type="date" value={date} min={todayStr()} onChange={e=>setDate(e.target.value)} style={{ width:"100%", padding:"11px 12px", borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:F.body, background:C.bgSoft, color:C.text, outline:"none" }}/>
                </Fld>
              </div>
              <div style={{ flex:1 }}>
                <Fld label="Horário" req hint="início">
                  <input type="time" value={time} onChange={e=>setTime(e.target.value)} style={{ width:"100%", padding:"11px 12px", borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:F.body, background:C.bgSoft, color:C.text, outline:"none" }}/>
                </Fld>
              </div>
            </div>
            <Divider label="Veículo (opcional)"/>
            <Fld label="Placa" hint="Ex: ABC1234">
              <Inp value={placa} onChange={e=>setPlaca(fmtPlaca(e.target.value))} placeholder="ABC1234" maxLength={7}/>
            </Fld>
            <Fld label="Modelo">
              <div className="model-btns" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
                {MODELOS.map(mod=>(
                  <button key={mod} onClick={()=>setModelo(m=>m===mod?"":mod)} style={{ padding:"8px 4px", borderRadius:10, textAlign:"center", border:`1.5px solid ${modelo===mod?C.navy:C.border}`, background:modelo===mod?C.navy:"transparent", color:modelo===mod?"#FBF5EE":C.textMid, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:F.body, transition:"all .15s" }}>{mod}</button>
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
      <div className="slide-up" style={{ background:C.bgCard, borderRadius:24, padding:28, maxWidth:420, width:"100%", boxShadow:C.shLg }} onClick={e=>e.stopPropagation()}>
        {step===3?(
          <div style={{ textAlign:"center", padding:"16px 0" }}>
            <Spin size={40} color={C.green}/>
            <p style={{ fontFamily:F.head, fontSize:18, fontWeight:600, color:C.navy, marginTop:16 }}>Processando...</p>
          </div>
        ):(
          <>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <h2 style={{ fontFamily:F.head, fontSize:18, fontWeight:700, color:C.navy }}>{label||"Confirmar Pagamento"}</h2>
              <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:C.textLight }}>✕</button>
            </div>
            <div style={{ background:C.greenBg, borderRadius:12, padding:"12px 16px", marginBottom:16, textAlign:"center" }}>
              <p style={{ fontSize:11, color:C.greenDark, textTransform:"uppercase", letterSpacing:.8, fontFamily:F.body, margin:0 }}>Total a pagar</p>
              <p style={{ fontSize:28, fontFamily:F.head, fontWeight:700, color:C.green, margin:0 }}>R$ {price}</p>
            </div>
            {step===1&&(
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {[
                  { key:"pix",  icon:"⚡", title:"PIX",            sub:"Aprovação instantânea",  border:C.border, bg:C.bgSoft  },
                  { key:"card", icon:"💳", title:"Cartão",          sub:"Crédito ou débito",      border:C.border, bg:C.bgSoft  },
                  { key:"demo", icon:"🎓", title:"Modo Demo (TCC)", sub:"Sem pagamento real",     border:C.amber,  bg:C.amberBg },
                ].map(opt=>(
                  <button key={opt.key} onClick={()=>{if(opt.key==="demo"){handlePay();}else{setMethod(opt.key);setStep(2);}}} style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 16px", borderRadius:14, border:`2px solid ${opt.border}`, background:opt.bg, cursor:"pointer", textAlign:"left" }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:"rgba(0,0,0,.06)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:18 }}>{opt.icon}</div>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:C.navy, margin:0, fontFamily:F.body }}>{opt.title}</p>
                      <p style={{ fontSize:11, color:C.textLight, margin:0, fontFamily:F.body }}>{opt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {step===2&&method==="pix"&&(
              <div>
                <div style={{ background:C.bgSoft, borderRadius:14, padding:16, marginBottom:14, textAlign:"center" }}>
                  <div style={{ width:130, height:130, margin:"0 auto 10px", background:C.navy, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, padding:8 }}>
                      {Array.from({length:49}).map((_,i)=><div key={i} style={{ width:11, height:11, background:Math.random()>.45?"#FBF5EE":"transparent", borderRadius:1 }}/>)}
                    </div>
                  </div>
                  <p style={{ fontSize:11, color:C.textLight, fontFamily:F.body }}>QR Code simulado para demonstração</p>
                </div>
                <Btn v="teal" full onClick={handlePay}>✓ Simular Pagamento PIX</Btn>
                <button onClick={()=>setStep(1)} style={{ marginTop:10, background:"none", border:"none", cursor:"pointer", color:C.textLight, fontSize:13, fontFamily:F.body, width:"100%" }}>← Voltar</button>
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
                <InfoBox color={C.amberDark} bg={C.amberBg} icon="🎓" style={{ marginBottom:14 }}>Modo demonstração — nenhuma cobrança real será feita.</InfoBox>
                <Btn v="purple" full onClick={handlePay}>Confirmar Pagamento</Btn>
                <button onClick={()=>setStep(1)} style={{ marginTop:10, background:"none", border:"none", cursor:"pointer", color:C.textLight, fontSize:13, fontFamily:F.body, width:"100%" }}>← Voltar</button>
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
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:300, textAlign:"center", gap:14 }}>
      <div style={{ width:68, height:68, borderRadius:"50%", background:C.greenBg, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <p style={{ fontFamily:F.head, fontSize:24, fontWeight:700, color:C.green, margin:0 }}>Pagamento Confirmado!</p>
      <p style={{ fontSize:20, fontWeight:700, color:C.greenDark, fontFamily:F.head }}>{fmtMoney(fp)}</p>
      <p style={{ color:C.textLight, fontSize:13, fontFamily:F.body }}>Duração: {ft} — Obrigado!</p>
    </div>
  );

  return (
    <div className="pay-layout" style={{ display:"flex", gap:24, flexWrap:"wrap", alignItems:"flex-start" }}>
      {showModal&&<PaymentModal price={activeRes?.status==="no_show"?cfg.noShowFine.toFixed(2):totalPrice} label={activeRes?.status==="no_show"?"Pagar Multa No-Show":"Confirmar Pagamento"} onConfirm={handlePayConfirm} onClose={()=>setShowModal(false)}/>}
      <div className="pay-wrap" style={{ flex:"0 0 360px", display:"flex", flexDirection:"column", gap:14 }}>
        {!activeRes?(
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:240, textAlign:"center", gap:12, padding:20 }}>
            <div style={{ width:58, height:58, borderRadius:"50%", background:C.bgDark, display:"flex", alignItems:"center", justifyContent:"center" }}><CarIcon color={C.borderMid} size={28}/></div>
            <p style={{ fontFamily:F.head, fontSize:17, fontWeight:600, color:C.textLight }}>Nenhuma reserva ativa</p>
            <p style={{ fontSize:13, color:C.textLight, maxWidth:250, lineHeight:1.7, fontFamily:F.body }}>Reserve uma vaga na aba <strong style={{ color:C.textMid }}>Reservas</strong>.</p>
          </div>
        ):activeRes.status==="no_show"?(
          <>
            <InfoBox color={C.red} bg={C.redBg} icon="⚠">
              <strong>No-show detectado.</strong> Multa de <strong>{fmtMoney(cfg.noShowFine)}</strong> aplicada por não comparecimento.
            </InfoBox>
            <Btn v="danger" full onClick={()=>setShowModal(true)} style={{ padding:"13px" }}>Pagar Multa — {fmtMoney(cfg.noShowFine)}</Btn>
          </>
        ):(
          <>
            <div style={{ display:"flex", alignItems:"center", gap:14, background:C.purpleBg, borderRadius:16, padding:"13px 18px", border:`1.5px solid ${C.purple}` }}>
              <CarIcon color={C.purple} size={32}/>
              <div>
                <p style={{ fontSize:10, fontWeight:600, color:C.purple, letterSpacing:1.2, textTransform:"uppercase", margin:0, fontFamily:F.body }}>Sua Vaga</p>
                <p style={{ fontFamily:F.head, fontSize:20, fontWeight:700, color:C.purpleDark, margin:0, lineHeight:1.1 }}>{activeRes.spot?.row}{activeRes.spotNumber}</p>
                <p style={{ fontSize:12, color:C.purple, margin:0, fontFamily:F.body }}>{activeRes.startTimeStr}{activeRes.placa&&` • ${activeRes.placa}`}</p>
              </div>
            </div>
            <div style={{ background:C.navy, borderRadius:18, padding:"18px 22px", textAlign:"center" }}>
              <p style={{ color:"#A89880", fontSize:10, fontWeight:600, letterSpacing:2, textTransform:"uppercase", marginBottom:8, fontFamily:F.body }}>{running?"Tempo Decorrido":"Aguardando Horário"}</p>
              <p className="timer-num" style={{ fontFamily:F.head, fontSize:44, fontWeight:700, color:"#FBF5EE", letterSpacing:2, lineHeight:1, margin:0 }}>{fmtTime(secs)}</p>
              {!running&&<p style={{ color:"#A89880", fontSize:11, marginTop:8, fontFamily:F.body }}>O cronômetro inicia no horário reservado.</p>}
            </div>
            {running&&(
              <div style={{ background:C.bgCard, borderRadius:14, padding:"13px 16px", border:`1px solid ${C.border}` }}>
                <div className="fee-row" style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:12, color:C.textMid, fontFamily:F.body }}>Taxa de reserva</span>
                  <span style={{ fontSize:12, fontWeight:600, color:C.navy, fontFamily:F.body }}>{fmtMoney(cfg.reservationFee)}</span>
                </div>
                <div className="fee-row" style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:12, color:C.textMid, fontFamily:F.body }}>Uso ({fmtTime(secs)})</span>
                  <span style={{ fontSize:12, fontWeight:600, color:C.navy, fontFamily:F.body }}>{fmtMoney(usagePrice)}</span>
                </div>
                <div className="fee-row" style={{ display:"flex", justifyContent:"space-between", paddingTop:8, borderTop:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:13, fontWeight:700, color:C.navy, fontFamily:F.body }}>Total</span>
                  <span style={{ fontSize:18, fontWeight:700, color:C.green, fontFamily:F.head }}>{fmtMoney(totalPrice)}</span>
                </div>
              </div>
            )}
            {running&&<Btn v="amber" onClick={()=>setShowModal(true)} full style={{ padding:"13px" }}>Pagar Reserva — {fmtMoney(totalPrice)}</Btn>}
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
  const statusBdg  = s => {
    if (s==="paid")      return <Bdg color={C.greenDark} bg={C.greenBg}>Pago</Bdg>;
    if (s==="cancelled") return <Bdg color={C.textMid}   bg={C.bgDark}>Cancelado</Bdg>;
    if (s==="no_show")   return <Bdg color={C.red}       bg={C.redBg}>No-show</Bdg>;
    return null;
  };

  return (
    <div style={{ maxWidth:660, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:18, background:C.bgCard, borderRadius:20, padding:"16px 20px", boxShadow:C.sh, border:`1px solid ${C.border}` }}>
        <div style={{ width:54, height:54, borderRadius:"50%", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:700, color:"#FBF5EE", fontFamily:F.head, flexShrink:0 }}>
          {(user.nomeCompleto?.[0]||user.email[0]).toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontFamily:F.head, fontSize:17, fontWeight:700, color:C.navy, margin:0 }}>{user.nomeCompleto||"—"}</p>
          <p style={{ fontSize:12, color:C.textLight, margin:0, fontFamily:F.body }}>@{user.username||"—"} • {user.email}</p>
        </div>
        <Btn v="ghost" sm onClick={onLogout}>Sair</Btn>
      </div>

      {activeRes&&(
        <div style={{ background:activeRes.status==="no_show"?C.redBg:C.purpleBg, borderRadius:14, padding:"12px 16px", marginBottom:14, border:`1.5px solid ${activeRes.status==="no_show"?C.red:C.purple}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:activeRes.status==="no_show"?C.red:C.purple, animation:"pulse 2s infinite", flexShrink:0 }}/>
            <p style={{ fontSize:13, fontWeight:600, color:activeRes.status==="no_show"?C.redDark:C.purpleDark, margin:0, fontFamily:F.body }}>
              {activeRes.status==="no_show"?"⚠ Multa pendente por no-show":`Reserva ativa — Vaga ${activeRes.spotNumber} às ${activeRes.startTimeStr}`}
            </p>
          </div>
        </div>
      )}

      <div className="profile-stats" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
        {[
          { label:"Reservas",    value:history.length,       color:C.purple, bg:C.purpleBg },
          { label:"Total gasto", value:fmtMoney(totalGasto), color:C.green,  bg:C.greenBg  },
          { label:"Tempo total", value:fmtTime(totalSecs),   color:C.amber,  bg:C.amberBg  },
        ].map(p=>(
          <div key={p.label} style={{ background:p.bg, borderRadius:14, padding:"12px 14px", border:`1px solid ${p.color}30` }}>
            <div style={{ fontSize:15, fontFamily:F.head, fontWeight:700, color:p.color, lineHeight:1.2, wordBreak:"break-all" }}>{p.value}</div>
            <div style={{ fontSize:10, color:p.color, fontWeight:600, marginTop:4, letterSpacing:.5, textTransform:"uppercase", fontFamily:F.body }}>{p.label}</div>
          </div>
        ))}
      </div>

      <Card style={{ marginBottom:14 }}>
        <h3 style={{ fontFamily:F.head, fontSize:15, fontWeight:700, color:C.navy, marginBottom:14 }}>Dados Pessoais</h3>
        <div className="profile-grid2" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
          {[["Nome",user.nomeCompleto||"—"],["Usuário",`@${user.username||"—"}`],["Email",user.email],["CPF",cpfFmt],["Telefone",user.telefone||"—"],["Endereço",user.endereco||"—"]].map(([k,v])=>(
            <div key={k}>
              <p style={{ fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:.8, margin:"0 0 3px", fontFamily:F.body }}>{k}</p>
              <p style={{ fontSize:13, color:C.navy, fontWeight:500, margin:0, fontFamily:F.body, wordBreak:"break-all" }}>{v}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 style={{ fontFamily:F.head, fontSize:15, fontWeight:700, color:C.navy, marginBottom:14 }}>Histórico</h3>
        {load&&<div style={{ display:"flex", justifyContent:"center", padding:"16px 0" }}><Spin/></div>}
        {!load&&history.length===0&&<p style={{ fontSize:13, color:C.textLight, fontFamily:F.body }}>Nenhum pagamento ainda.</p>}
        {!load&&history.map((r,i)=>(
          <div key={r._id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:i<history.length-1?`1px solid ${C.border}`:"none", gap:10, flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:C.navyLight, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <CarIcon color={C.navyMid} size={15}/>
              </div>
              <div>
                <p style={{ fontFamily:F.body, fontSize:13, fontWeight:600, color:C.navy, margin:0 }}>Vaga {r.spotNumber}{r.placa&&` • ${r.placa}`}</p>
                <p style={{ fontSize:11, color:C.textLight, margin:0, fontFamily:F.body }}>{fmtDate(r.createdAt)}{r.totalSeconds?` • ${fmtTime(r.totalSeconds)}`:""}</p>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
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
      <div className="fade-in" style={{ background:C.bgCard, borderRadius:22, padding:26, maxWidth:400, width:"100%", boxShadow:C.shLg }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
          <div style={{ width:44, height:44, borderRadius:"50%", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700, color:"#FBF5EE", fontFamily:F.head, flexShrink:0 }}>
            {(user.nomeCompleto?.[0]||user.email[0]).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize:15, fontWeight:700, color:C.navy, margin:0, fontFamily:F.head }}>{user.nomeCompleto||"—"}</p>
            <p style={{ fontSize:12, color:C.textLight, margin:0, fontFamily:F.body }}>@{user.username||"—"}</p>
          </div>
        </div>
        {[["Email",user.email],["CPF",cpf],["Endereço",user.endereco||"—"],["Telefone",user.telefone||"—"],["Reservas",user.totalReservas||0],["Total Gasto",fmtMoney(user.totalGasto||0)],["Status",user.ativo?"Ativo":"Desativado"]].map(([k,v])=>(
          <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
            <span style={{ fontSize:12, color:C.textLight, fontFamily:F.body }}>{k}</span>
            <span style={{ fontSize:13, fontWeight:600, color:k==="Status"?(user.ativo?C.green:C.red):C.navy, textAlign:"right", maxWidth:"60%", fontFamily:F.body, wordBreak:"break-all" }}>{String(v)}</span>
          </div>
        ))}
        <div style={{ display:"flex", gap:8, marginTop:16 }}>
          {!user.isAdmin&&onToggle&&<Btn v={user.ativo?"danger":"success"} sm onClick={()=>onToggle(user._id)} style={{ flex:1 }}>{user.ativo?"Desativar":"Reativar"}</Btn>}
          <Btn v="ghost" onClick={onClose} style={{ flex:1 }}>Fechar</Btn>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// ADMIN — com modo demo e status do sistema
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
  const [demoMsg, setDemoMsg]  = useState("");

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

  // MODO DEMO — simula carro entrando/saindo
  const runDemo = async () => {
    setDemoLoad(true); setDemoMsg("");
    const available = spots.filter(s=>s.status==="available");
    if (!available.length) { setDemoMsg("Sem vagas livres para demonstrar."); setDemoLoad(false); return; }
    const spot = available[Math.floor(Math.random()*available.length)];
    setDemoMsg(`🚗 Carro entrando na vaga ${spot.row}${spot.spotNumber}...`);
    await api.sensorUpdate(spot.spotNumber, true);
    onSpotsUpdate();
    setTimeout(async()=>{
      setDemoMsg(`✅ Carro saindo da vaga ${spot.row}${spot.spotNumber}...`);
      await api.sensorUpdate(spot.spotNumber, false);
      onSpotsUpdate();
      setTimeout(()=>{ setDemoMsg("Demo concluída!"); setDemoLoad(false); },1500);
    }, 3000);
  };

  const noShows = res.filter(r=>r.status==="no_show").length;
  const row = { background:C.bgCard, borderRadius:14, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:7, boxShadow:C.sh, border:`1px solid ${C.border}` };
  const fU = users.filter(u=>!search||(u.email+u.nomeCompleto+u.username).toLowerCase().includes(search.toLowerCase()));
  const fR = res.filter(r=>!search||(r.user?.email+r.user?.nomeCompleto+r.spotNumber).toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <UserModal user={selU} onClose={()=>setSelU(null)} onToggle={toggle}/>
      <div style={{ display:"flex", gap:6, marginBottom:18, flexWrap:"wrap" }}>
        {[["dashboard","Dashboard"],["reservations","Reservas"],["users","Usuários"],["logs","Logs"],["system","Sistema"]].map(([v,l])=>(
          <button key={v} onClick={()=>{setView(v);setSearch("");}} style={{ padding:"8px 20px", borderRadius:20, background:view===v?C.navy:C.border, color:view===v?"#FBF5EE":C.textMid, border:"none", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:F.body, transition:"all .15s" }}>
            {l}{v==="reservations"&&noShows>0&&<span style={{ marginLeft:6, background:C.red, color:"#fff", borderRadius:20, padding:"1px 7px", fontSize:10 }}>{noShows}</span>}
          </button>
        ))}
      </div>

      {(view==="users"||view==="reservations")&&(
        <div style={{ marginBottom:14 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." style={{ width:"100%", maxWidth:300, padding:"9px 16px", borderRadius:20, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:F.body, background:C.bgSoft, color:C.text, outline:"none" }}/>
        </div>
      )}

      {load&&<div style={{ display:"flex", justifyContent:"center", padding:"30px 0" }}><Spin/></div>}

      {/* DASHBOARD */}
      {!load&&view==="dashboard"&&dash&&(
        <div>
          {noShows>0&&<InfoBox color={C.redDark} bg={C.redBg} icon="⚠" style={{ marginBottom:16 }}><strong>{noShows} no-show(s) pendente(s)</strong> — clientes precisam pagar a multa.</InfoBox>}

          {/* MODO DEMO */}
          <div style={{ background:C.amberBg, borderRadius:16, padding:"16px 20px", marginBottom:18, border:`1px solid ${C.amber}30`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <div>
              <p style={{ fontFamily:F.head, fontSize:14, fontWeight:700, color:C.amberDark, margin:0 }}>🎓 Modo Demonstração</p>
              <p style={{ fontSize:12, color:C.amber, margin:0, fontFamily:F.body }}>Simula entrada e saída de veículo em uma vaga aleatória</p>
              {demoMsg&&<p style={{ fontSize:12, color:C.amberDark, margin:"6px 0 0", fontWeight:600, fontFamily:F.body }}>{demoMsg}</p>}
            </div>
            <Btn v="amber" onClick={runDemo} disabled={demoLoad} sm>{demoLoad?<Spin color="#fff"/>:"▶ Iniciar Demo"}</Btn>
          </div>

          <div className="dash-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
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
              <div key={p.label} style={{ background:p.bg, borderRadius:14, padding:"12px 14px", border:`1px solid ${p.color}30` }}>
                <div style={{ fontSize:18, fontFamily:F.head, fontWeight:700, color:p.color, lineHeight:1 }}>{p.value}</div>
                <div style={{ fontSize:9, color:p.color, fontWeight:700, marginTop:3, letterSpacing:.5, textTransform:"uppercase", fontFamily:F.body }}>{p.label}</div>
              </div>
            ))}
          </div>

          <Card style={{ marginBottom:14, padding:18 }}>
            <h3 style={{ fontFamily:F.head, fontSize:14, fontWeight:700, color:C.navy, marginBottom:12 }}>Mapa em Tempo Real</h3>
            <ParkingGrid spots={spots} selId={null} onSpotClick={()=>{}} clickable={false}/>
          </Card>

          {dash.revenueWeek?.length>0&&(
            <Card style={{ padding:18 }}>
              <h3 style={{ fontFamily:F.head, fontSize:14, fontWeight:700, color:C.navy, marginBottom:12 }}>Receita — Últimos 7 dias</h3>
              {dash.revenueWeek.map(d=>(
                <div key={d._id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
                  <span style={{ fontSize:11, color:C.textMid, minWidth:36, fontFamily:F.body }}>{d._id}</span>
                  <div style={{ flex:1, height:7, background:C.border, borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", background:C.green, borderRadius:4, width:`${Math.min(100,(d.total/500)*100)}%` }}/>
                  </div>
                  <span style={{ fontSize:12, fontWeight:600, color:C.green, minWidth:60, textAlign:"right", fontFamily:F.body }}>{fmtMoney(d.total)}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* STATUS DO SISTEMA */}
      {!load&&view==="system"&&(
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card>
            <h3 style={{ fontFamily:F.head, fontSize:15, fontWeight:700, color:C.navy, marginBottom:16 }}>Status do Sistema</h3>
            {[
              { label:"Backend API",       value:"Online", color:C.green, bg:C.greenBg, icon:"✅" },
              { label:"Banco de Dados",    value:"MongoDB Atlas — conectado", color:C.green, bg:C.greenBg, icon:"✅" },
              { label:"Frontend",          value:"Vercel — em operação", color:C.green, bg:C.greenBg, icon:"✅" },
              { label:"Sensores ESP32",    value:`${spots.length} vagas monitoradas`, color:C.purple, bg:C.purpleBg, icon:"📡" },
              { label:"Atualização",       value:"A cada 5 segundos", color:C.amber, bg:C.amberBg, icon:"🔄" },
            ].map(item=>(
              <div key={item.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:16 }}>{item.icon}</span>
                  <span style={{ fontSize:13, color:C.textMid, fontFamily:F.body }}>{item.label}</span>
                </div>
                <span style={{ fontSize:12, fontWeight:600, color:item.color, background:item.bg, padding:"3px 10px", borderRadius:20, fontFamily:F.body }}>{item.value}</span>
              </div>
            ))}
          </Card>

          <Card>
            <h3 style={{ fontFamily:F.head, fontSize:15, fontWeight:700, color:C.navy, marginBottom:16 }}>Estado das Vagas</h3>
            {spots.map(s=>{
              const m = SM[s.status]||SM.available;
              return (
                <div key={s._id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:m.bd, flexShrink:0 }}/>
                    <span style={{ fontSize:13, color:C.navy, fontFamily:F.body, fontWeight:600 }}>Vaga {s.row}{s.spotNumber}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:11, color:C.textLight, fontFamily:F.body }}>Sensor: {s.sensorOccupied?"ocupado":"livre"}</span>
                    <Bdg color={m.tx} bg={m.bg}>{m.lb}</Bdg>
                  </div>
                </div>
              );
            })}
          </Card>

          {/* MODO DEMO no sistema */}
          <Card>
            <h3 style={{ fontFamily:F.head, fontSize:15, fontWeight:700, color:C.navy, marginBottom:8 }}>🎓 Demonstração ao Vivo</h3>
            <p style={{ fontSize:13, color:C.textLight, fontFamily:F.body, marginBottom:14 }}>Simula um carro entrando e saindo de uma vaga em tempo real, sem precisar do ESP32 conectado.</p>
            {demoMsg&&<InfoBox color={C.amberDark} bg={C.amberBg} icon="🚗" style={{ marginBottom:12 }}>{demoMsg}</InfoBox>}
            <Btn v="amber" onClick={runDemo} disabled={demoLoad}>{demoLoad?<Spin color="#fff"/>:"▶ Iniciar Demonstração"}</Btn>
          </Card>
        </div>
      )}

      {/* RESERVAS */}
      {!load&&view==="reservations"&&(
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {fR.length===0&&<p style={{ color:C.textLight, fontSize:13, fontFamily:F.body }}>Nenhuma reserva.</p>}
          {fR.map(r=>(
            <div key={r._id} style={row}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <button onClick={()=>setSelU(r.user)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, fontWeight:600, color:C.navy, fontFamily:F.body, textDecoration:"underline", textUnderlineOffset:2 }}>{r.user?.nomeCompleto||r.user?.email}</button>
                <Bdg color={C.purple} bg={C.purpleBg}>Vaga {r.spotNumber}</Bdg>
                <span style={{ fontSize:12, color:C.textMid, fontFamily:F.body }}>às {r.startTimeStr}</span>
                {r.placa&&<Bdg color={C.navyMid} bg={C.navyLight}>{r.placa}</Bdg>}
                {r.status==="paid"      && <Bdg color={C.greenDark} bg={C.greenBg}>Pago {fmtMoney(r.totalPrice)}</Bdg>}
                {r.status==="cancelled" && <Bdg color={C.textMid}   bg={C.bgDark}>Cancelado</Bdg>}
                {r.status==="no_show"   && <Bdg color={C.red}       bg={C.redBg}>No-show ⚠</Bdg>}
                {r.status==="active"    && <Bdg color={C.amberDark} bg={C.amberBg}>Em uso</Bdg>}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, color:C.textLight, fontFamily:F.body }}>{fmtDate(r.createdAt)}</span>
                {r.status==="active"&&<Btn v="danger" sm onClick={()=>cancelRes(r._id)}>Cancelar</Btn>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* USUÁRIOS */}
      {!load&&view==="users"&&(
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {fU.map(u=>(
            <div key={u._id} style={{ ...row, cursor:"pointer" }} onClick={()=>setSelU(u)}>
              <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:u.isAdmin?C.navy:u.ativo?C.border:C.redBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:u.isAdmin?"#FBF5EE":u.ativo?C.textMid:C.red, fontFamily:F.head, flexShrink:0 }}>
                  {(u.nomeCompleto?.[0]||u.email[0]).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:C.navy, margin:0, fontFamily:F.body }}>{u.nomeCompleto||u.email}{u.username&&<span style={{ fontSize:11, color:C.textLight, marginLeft:6 }}>@{u.username}</span>}</p>
                  <p style={{ fontSize:11, color:C.textLight, margin:0, fontFamily:F.body }}>{u.email}</p>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
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
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {logs.length===0&&<p style={{ color:C.textLight, fontSize:13, fontFamily:F.body }}>Nenhum log.</p>}
          {logs.map(log=>(
            <div key={log._id} style={row}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:30, height:30, borderRadius:"50%", background:C.navyLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:C.navy, fontFamily:F.head, flexShrink:0 }}>{log.email[0].toUpperCase()}</div>
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
        <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, padding:"10px 4px 8px", border:"none", background:tab===t.id?C.navyLight:"transparent", color:tab===t.id?C.navy:C.textLight, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, transition:"all .15s", borderTop:tab===t.id?`2px solid ${C.navy}`:"2px solid transparent", fontFamily:F.body }}>
          <span style={{ fontSize:17, lineHeight:1 }}>{t.icon}</span>
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
  const [screen, setScreen]       = useState("landing"); // landing | login | app
  const [user, setUser]           = useState(null);
  const [spots, setSpots]         = useState([]);
  const [activeRes, setActiveRes] = useState(null);
  const [tab, setTab]             = useState("overview");
  const [booting, setBoot]        = useState(true);
  const [cfg, setCfg]             = useState(CFG);
  const [online, setOnline]       = useState(true);
  const [notifications, setNotifications] = useState([]);
  const prevSpotsRef = useRef([]);

  const addNotif = (msg, type) => {
    const id = Date.now();
    setNotifications(p=>[...p, { id, msg, type }]);
    setTimeout(()=>setNotifications(p=>p.filter(n=>n.id!==id)), 4000);
  };

  useEffect(()=>{
    const t = localStorage.getItem("omv_token");
    api.resConfig().then(c=>{ CFG=c; setCfg(c); }).catch(()=>{});
    if (!t){ setBoot(false); return; }
    api.me().then(({user})=>{ setUser(user); setScreen("app"); }).catch(()=>localStorage.removeItem("omv_token")).finally(()=>setBoot(false));
  },[]);

  // Verifica conexão com o backend a cada 30s
  useEffect(()=>{
    const check = async()=>{
      const h = await api.health();
      setOnline(h.status==="ok");
    };
    check();
    const iv = setInterval(check, 30000);
    return ()=>clearInterval(iv);
  },[]);

  useEffect(()=>{
    if (!user) return;
    loadSpots(); loadRes();
    const iv = setInterval(loadSpots, 5000);
    return ()=>clearInterval(iv);
  },[user]);

  const loadSpots = async()=>{
    try {
      const newSpots = await api.spots();
      // Detecta mudanças e dispara notificações
      if (prevSpotsRef.current.length) {
        newSpots.forEach(ns=>{
          const old = prevSpotsRef.current.find(s=>s._id===ns._id);
          if (old && old.status!==ns.status) {
            if (ns.status==="occupied"||ns.status==="reserved")
              addNotif(`Vaga ${ns.row}${ns.spotNumber} ficou ocupada`, "occupied");
            else if (ns.status==="available"||ns.status==="preferential")
              addNotif(`Vaga ${ns.row}${ns.spotNumber} ficou disponível`, "available");
          }
        });
      }
      prevSpotsRef.current = newSpots;
      setSpots(newSpots);
    } catch {}
  };

  const loadRes   = async()=>{ try{ setActiveRes(await api.myReservation()); }catch{} };
  const logout    = ()=>{ localStorage.removeItem("omv_token"); setUser(null); setSpots([]); setActiveRes(null); setTab("overview"); setScreen("landing"); };

  if (booting) return (
    <div style={{ minHeight:"100vh", width:"100%", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{GF+CSS}</style>
      <div style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
        <Spin size={26}/><p style={{ fontFamily:F.head, fontSize:14, color:C.textLight, marginTop:4 }}>Carregando...</p>
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
        <div style={{ width:"100%", padding:"0 48px", height:62, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <div style={{ fontFamily:F.head, fontSize:20, fontWeight:700, color:C.navy, whiteSpace:"nowrap" }}>◈ Estacionamento OMV</div>
          <nav style={{ display:"flex", gap:4 }}>
            {desktopTabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"8px 18px", borderRadius:20, border:"none", background:tab===t.id?C.navy:"transparent", color:tab===t.id?"#FBF5EE":C.textMid, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:F.body, transition:"all .15s", whiteSpace:"nowrap" }}>{t.label}</button>
            ))}
          </nav>
          <div style={{ display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
            <ConnectionDot online={online}/>
            <div style={{ width:1, height:20, background:C.border }}/>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:12, fontWeight:600, color:C.navy, margin:0, fontFamily:F.body }}>{user.nomeCompleto||user.email}</p>
              <p style={{ fontSize:10, color:C.textLight, margin:0, fontFamily:F.body }}>{user.isAdmin?"Administrador":user.email}</p>
            </div>
            <button onClick={logout} style={{ padding:"6px 14px", borderRadius:20, background:C.bgDark, color:C.textMid, border:`1px solid ${C.border}`, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:F.body }}>Sair</button>
          </div>
        </div>
      </header>

      <main className="main-content" style={{ width:"100%", padding:"30px 48px" }}>
        <h1 className="page-title" style={{ fontFamily:F.head, fontSize:24, fontWeight:700, color:C.navy, marginBottom:20 }}>{titles[tab]}</h1>
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
