import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────
// API
// ─────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const tok  = () => localStorage.getItem("omv_token");

async function apiFetch(path, opts = {}) {
  const t = tok();
  const r = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}), ...(opts.headers || {}) },
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.message || "Erro na requisição");
  return d;
}

const api = {
  register:     b         => apiFetch("/auth/register",              { method:"POST", body:JSON.stringify(b) }),
  login:        (e,p)     => apiFetch("/auth/login",                 { method:"POST", body:JSON.stringify({ email:e, password:p }) }),
  me:           ()        => apiFetch("/auth/me"),
  spots:        ()        => apiFetch("/spots"),
  myRes:        ()        => apiFetch("/reservations/mine"),
  myHistory:    ()        => apiFetch("/reservations/history"),
  resCfg:       ()        => apiFetch("/reservations/config"),
  createRes:    (s,t,d,p,m) => apiFetch("/reservations",            { method:"POST", body:JSON.stringify({ spotId:s, startTimeStr:t, startDate:d, placa:p, modelo:m }) }),
  payRes:       id        => apiFetch(`/reservations/${id}/pay`,     { method:"POST" }),
  cancelRes:    id        => apiFetch(`/reservations/${id}/cancel`,  { method:"POST" }),
  adminUsers:   ()        => apiFetch("/admin/users"),
  adminLogs:    ()        => apiFetch("/admin/logs"),
  adminRes:     ()        => apiFetch("/admin/reservations"),
  adminDash:    ()        => apiFetch("/admin/dashboard"),
  toggleUser:   id        => apiFetch(`/admin/users/${id}/toggle`,   { method:"PATCH" }),
  deleteUser:   id        => apiFetch(`/admin/users/${id}`,          { method:"DELETE" }),
  cancelAdmRes: id        => apiFetch(`/admin/reservations/${id}/cancel`, { method:"POST" }),
  clearLogs:    ()        => apiFetch("/admin/logs",                 { method:"DELETE" }),
  sensor:       (n,o)     => apiFetch("/spots/sensor",               { method:"POST", body:JSON.stringify({ spotNumber:n, occupied:o }) }),
  resetSpots:   o         => apiFetch("/spots/reset",                { method:"POST", body:JSON.stringify({ occupied:o }) }),
  health:       ()        => fetch(`${BASE}/health`).then(r => r.json()).catch(() => ({ status:"error" })),
};

// ─────────────────────────────────────────
// FONTES E ESTILOS
// ─────────────────────────────────────────
const GF = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@500;600;700&display=swap');`;

const CSS = `
*,*::before,*::after { box-sizing:border-box; margin:0; padding:0 }
html,body { width:100%; min-height:100vh; overflow-x:hidden; -webkit-font-smoothing:antialiased }
#root { width:100%; min-height:100vh }
body { background:#F5F6F8 }
html,body,#root { margin:0!important; padding:0!important }

@keyframes spin  { to { transform:rotate(360deg) } }
@keyframes up    { from { opacity:0;transform:translateY(10px) } to { opacity:1;transform:none } }
@keyframes fadein { from { opacity:0 } to { opacity:1 } }
@keyframes slide { from { opacity:0;transform:translateX(24px) } to { opacity:1;transform:none } }
@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.3 } }
@keyframes blink { 0%,100% { opacity:1 } 50% { opacity:.15 } }

.aup    { animation:up     .22s ease both }
.afadin { animation:fadein .18s ease both }
.aslide { animation:slide  .24s ease both }

::-webkit-scrollbar { width:4px }
::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:4px }

input,button,select { font-family:inherit }
input:focus { border-color:#1A56DB!important; outline:none }

.mob-nav { display:none }

@media (max-width:768px) {
  .mob-nav    { display:flex!important }
  .desk-hdr   { display:none!important }
  .pg-wrap    { padding:16px 14px 82px!important }
  .pg-title   { font-size:18px!important; margin-bottom:14px!important }
  .dg         { grid-template-columns:repeat(2,1fr)!important; gap:8px!important }
  .form-row   { flex-direction:column!important; gap:0!important }
  .pay-lay    { flex-direction:column!important }
  .pay-side   { width:100%!important; flex:none!important }
  .pg2        { grid-template-columns:1fr!important }
  .pst        { grid-template-columns:repeat(2,1fr)!important }
  .srow       { gap:3px!important }
  .sc         { flex:1 1 0!important; padding:6px 3px 5px!important; min-width:0!important }
  .pblk       { flex-direction:column!important; gap:5px!important }
  .pvia       { width:100%!important; height:10px!important; min-height:0!important }
  .pviat      { font-size:0!important }
  .mgrid      { grid-template-columns:repeat(3,1fr)!important }
  .tbig       { font-size:30px!important }
  .rpan       { width:100%!important }
  .rlay       { flex-direction:column!important }
  .nw         { right:8px!important; top:10px!important; max-width:calc(100vw - 16px)!important }
  .hw         { padding:40px 16px 32px!important }
  .hh1        { font-size:26px!important; line-height:1.2!important }
  .hsub       { font-size:13.5px!important }
  .hcds       { grid-template-columns:1fr!important; gap:10px!important }
  .agrd       { grid-template-columns:1fr!important; gap:10px!important }
  .abouts     { padding:48px 16px!important }
  .lhdr       { padding:0 16px!important }
  .lftr       { padding:16px!important; flex-direction:column!important; gap:6px!important; text-align:center!important }
  .atabs      { overflow-x:auto!important; gap:4px!important; padding-bottom:2px!important }
  .atab       { font-size:12px!important; padding:6px 12px!important; white-space:nowrap!important }
  .act-row    { flex-direction:column!important; gap:9px!important }
  .res-info   { flex-direction:column!important; gap:10px!important }
}
@media (max-width:420px) {
  .pg-title { font-size:16px!important }
  .tbig     { font-size:24px!important }
  .dg       { grid-template-columns:1fr 1fr!important }
  .hh1      { font-size:22px!important }
  .pst      { grid-template-columns:1fr 1fr!important }
}
`;

// ─────────────────────────────────────────
// TOKENS
// ─────────────────────────────────────────
const C = {
  bg:      "#F5F6F8",
  card:    "#FFFFFF",
  soft:    "#F8F9FB",
  dim:     "#EEF0F4",
  border:  "#E2E6EC",
  borderS: "#CDD3DC",

  text:    "#0F1929",
  textM:   "#4A5568",
  textL:   "#8A96A8",

  navy:    "#1B3A6B",
  navyM:   "#2A5298",
  navyL:   "#EBF0FA",
  navyT:   "#DDEAFF",

  blue:    "#1A56DB",
  blueL:   "#EBF0FF",
  blueT:   "#DBEAFE",

  green:   "#057A55",
  greenL:  "#DEF7EC",
  greenD:  "#03543F",

  red:     "#C81E1E",
  redL:    "#FDE8E8",
  redD:    "#9B1C1C",

  amber:   "#B45309",
  amberL:  "#FEF3C7",
  amberD:  "#78350F",

  purple:  "#6929C4",
  purpleL: "#F0E6FF",
  purpleD: "#4A1D96",

  sh:  "0 1px 3px rgba(15,25,41,.06), 0 1px 2px rgba(15,25,41,.04)",
  shM: "0 4px 16px rgba(15,25,41,.08), 0 2px 6px rgba(15,25,41,.05)",
  shL: "0 12px 40px rgba(15,25,41,.12), 0 4px 12px rgba(15,25,41,.06)",
};

const SM = {
  available:    { bg:"#F0FDF4", bd:"#16A34A", tx:"#15803D", lb:"LIVRE"    },
  occupied:     { bg:"#FEF2F2", bd:"#DC2626", tx:"#B91C1C", lb:"OCUPADA"  },
  preferential: { bg:"#FFFBEB", bd:"#D97706", tx:"#92400E", lb:"PREFER."  },
  reserved:     { bg:"#F5F3FF", bd:"#7C3AED", tx:"#5B21B6", lb:"RESERVADA"},
};

const F = { head:"'Playfair Display', Georgia, serif", body:"'DM Sans', system-ui, sans-serif" };
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
const nowTime  = () => { const n = new Date(); return `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`; };

function buildStart(dateStr, timeStr) {
  const now = new Date();
  if (!dateStr || !timeStr) return now;
  const [y,mo,d] = dateStr.split("-").map(Number);
  const [h,m]    = timeStr.split(":").map(Number);
  const chosen   = new Date(y, mo - 1, d, h, m, 0, 0);
  return chosen.getTime() <= now.getTime() + 60000 ? now : chosen;
}

// ─────────────────────────────────────────
// ÁTOMOS DE UI
// ─────────────────────────────────────────
const Spin = ({ sz = 18, c = C.navy }) => (
  <span style={{ width:sz, height:sz, border:`2.5px solid ${C.dim}`, borderTop:`2.5px solid ${c}`, borderRadius:"50%", animation:"spin .65s linear infinite", display:"inline-block", flexShrink:0 }}/>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:24, boxShadow:C.shM, ...style }}>
    {children}
  </div>
);

const Btn = ({ children, onClick, v = "primary", disabled = false, sm = false, full = false, style = {} }) => {
  const variants = {
    primary: { bg:C.navy,   color:"#fff",   border:"none",                        hover:"#163066" },
    blue:    { bg:C.blue,   color:"#fff",   border:"none"                                        },
    success: { bg:C.green,  color:"#fff",   border:"none"                                        },
    danger:  { bg:C.red,    color:"#fff",   border:"none"                                        },
    amber:   { bg:C.amber,  color:"#fff",   border:"none"                                        },
    purple:  { bg:C.purple, color:"#fff",   border:"none"                                        },
    ghost:   { bg:C.soft,   color:C.textM,  border:`1px solid ${C.border}`                       },
    outline: { bg:"transparent", color:C.navy, border:`1.5px solid ${C.navy}`                    },
    subtle:  { bg:"transparent", color:C.textL, border:`1px solid ${C.border}`                   },
  };
  const s = variants[v] || variants.primary;
  return (
    <button onClick={!disabled ? onClick : undefined} disabled={disabled} style={{
      background:s.bg, color:s.color, border:s.border || "none",
      padding: sm ? "7px 16px" : "11px 22px",
      borderRadius:9, fontSize: sm ? 12.5 : 14, fontWeight:600,
      fontFamily:F.body, cursor:disabled ? "not-allowed" : "pointer",
      opacity:disabled ? .45 : 1, transition:"opacity .12s, background .12s",
      display:"inline-flex", alignItems:"center", justifyContent:"center",
      gap:7, width:full ? "100%" : "auto", flexShrink:0, letterSpacing:.1, ...style,
    }}>{children}</button>
  );
};

const Field = ({ label, required = false, hint = "", children }) => (
  <div style={{ marginBottom:15 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
      <label style={{ fontSize:12, fontWeight:600, color:C.textM, letterSpacing:.5, textTransform:"uppercase", fontFamily:F.body }}>
        {label}{required && <span style={{ color:C.red, marginLeft:2 }}>*</span>}
      </label>
      {hint && <span style={{ fontSize:11, color:C.textL, fontFamily:F.body }}>{hint}</span>}
    </div>
    {children}
  </div>
);

const Inp = ({ value, onChange, placeholder, type = "text", onKeyDown, maxLength }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    onKeyDown={onKeyDown} maxLength={maxLength}
    style={{ width:"100%", padding:"11px 14px", borderRadius:9, border:`1.5px solid ${C.border}`,
      fontSize:14, fontFamily:F.body, background:C.soft, color:C.text, outline:"none",
      transition:"border-color .15s" }}
  />
);

const ErrBox = ({ msg }) => msg ? (
  <div style={{ background:C.redL, border:`1px solid ${C.red}30`, borderRadius:9, padding:"10px 14px", marginBottom:14, fontSize:13.5, color:C.red, lineHeight:1.55, fontFamily:F.body }}>
    {msg}
  </div>
) : null;

const Badge = ({ children, color = C.navy, bg = C.navyL }) => (
  <span style={{ fontSize:11.5, background:bg, color, borderRadius:6, padding:"3px 10px", fontWeight:600, fontFamily:F.body, whiteSpace:"nowrap", letterSpacing:.2 }}>{children}</span>
);

const Pill = ({ label, color, bg }) => (
  <span style={{ display:"inline-block", fontSize:10.5, fontWeight:700, letterSpacing:.7, textTransform:"uppercase", color, background:bg, borderRadius:6, padding:"3px 9px", fontFamily:F.body }}>{label}</span>
);

const Notice = ({ children, v = "info", style = {} }) => {
  const t = { info:{bg:C.blueL,c:C.navyM}, warn:{bg:C.amberL,c:C.amberD}, danger:{bg:C.redL,c:C.redD}, ok:{bg:C.greenL,c:C.greenD} };
  const s = t[v] || t.info;
  return (
    <div style={{ background:s.bg, borderRadius:9, padding:"11px 14px", ...style }}>
      <p style={{ fontSize:13.5, color:s.c, lineHeight:1.65, margin:0, fontFamily:F.body }}>{children}</p>
    </div>
  );
};

const Divider = ({ label = "" }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, margin:"16px 0" }}>
    <div style={{ flex:1, height:1, background:C.border }}/>
    {label && <span style={{ fontSize:11, color:C.textL, fontFamily:F.body, letterSpacing:.7, textTransform:"uppercase", whiteSpace:"nowrap" }}>{label}</span>}
    <div style={{ flex:1, height:1, background:C.border }}/>
  </div>
);

const ConnDot = ({ on }) => (
  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
    <div style={{ width:7, height:7, borderRadius:"50%", background:on ? C.green : C.red, animation:on ? "none" : "blink 1.5s infinite" }}/>
    <span style={{ fontSize:12, color:on ? C.green : C.red, fontWeight:600, fontFamily:F.body }}>{on ? "Online" : "Offline"}</span>
  </div>
);

// ─────────────────────────────────────────
// NOTIFICAÇÕES
// ─────────────────────────────────────────
const Notifs = ({ items }) => {
  if (!items.length) return null;
  return (
    <div className="nw" style={{ position:"fixed", top:76, right:16, zIndex:600, display:"flex", flexDirection:"column", gap:8, maxWidth:300 }}>
      {items.map(n => (
        <div key={n.id} className="aslide" style={{ background:C.card, border:`1px solid ${n.t === "occ" ? C.red : C.green}40`, borderLeft:`3px solid ${n.t === "occ" ? C.red : C.green}`, borderRadius:10, padding:"11px 15px", boxShadow:C.shM, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:n.t === "occ" ? C.red : C.green, flexShrink:0 }}/>
          <p style={{ fontSize:13, color:C.text, margin:0, fontFamily:F.body, lineHeight:1.4 }}>{n.msg}</p>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────
// CAR ICON
// ─────────────────────────────────────────
const CarIcon = ({ color = "#1B3A6B", size = 30 }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 40 56" fill="none">
    <rect x="11" y="9"  width="18" height="36" rx="5" fill={color}/>
    <rect x="13" y="7"  width="14" height="6"  rx="3" fill={color}/>
    <rect x="13" y="44" width="14" height="6"  rx="3" fill={color}/>
    <rect x="3"  y="15" width="8"  height="9"  rx="2" fill={color} opacity=".5"/>
    <rect x="29" y="15" width="8"  height="9"  rx="2" fill={color} opacity=".5"/>
    <rect x="3"  y="29" width="8"  height="9"  rx="2" fill={color} opacity=".5"/>
    <rect x="29" y="29" width="8"  height="9"  rx="2" fill={color} opacity=".5"/>
    <rect x="15" y="19" width="10" height="6"  rx="2" fill="white" opacity=".25"/>
  </svg>
);

// ─────────────────────────────────────────
// SPOT CARD
// ─────────────────────────────────────────
const SpotCard = ({ spot, isSel, onClick, clickable }) => {
  const m   = SM[spot.status] || SM.available;
  const can = clickable && (spot.status === "available" || spot.status === "preferential");
  return (
    <div className="sc" onClick={can ? () => onClick(spot) : undefined} style={{
      background: isSel ? m.bd : m.bg,
      border: `1.5px solid ${isSel ? m.bd : m.bd + "55"}`,
      borderRadius:11, padding:"8px 5px 7px",
      display:"flex", flexDirection:"column", alignItems:"center", gap:3,
      cursor: can ? "pointer" : "default",
      transition:"all .16s",
      boxShadow: isSel ? `0 4px 16px ${m.bd}35` : C.sh,
      transform: isSel ? "scale(1.07)" : "scale(1)",
      flex:"1 1 0", minWidth:58, userSelect:"none",
    }}>
      <span style={{ fontSize:9, fontWeight:700, color:isSel ? "#fff" : m.tx, letterSpacing:.6, fontFamily:F.body }}>{spot.row}{spot.spotNumber}</span>
      <CarIcon size={22} color={isSel ? "#fff" : m.tx}/>
      <span style={{ fontSize:7.5, fontWeight:700, color:isSel ? "rgba(255,255,255,.85)" : m.tx, letterSpacing:.4, textTransform:"uppercase", fontFamily:F.body }}>{m.lb}</span>
    </div>
  );
};

// ─────────────────────────────────────────
// MAPA DE VAGAS
// ─────────────────────────────────────────
const ParkMap = ({ spots, selId, onSpotClick, clickable = false }) => {
  const Road = ({ label }) => (
    <div style={{ height:22, background:C.dim, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"50%", left:0, right:0, height:1.5, background:`repeating-linear-gradient(to right,${C.borderS} 0,${C.borderS} 10px,transparent 10px,transparent 22px)`, transform:"translateY(-50%)" }}/>
      <span style={{ fontSize:8, fontWeight:700, color:C.textL, letterSpacing:2, textTransform:"uppercase", position:"relative", fontFamily:F.body }}>{label}</span>
    </div>
  );
  const Row = ({ row }) => (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
        <span style={{ fontSize:9, fontWeight:600, color:C.textL, fontFamily:F.body }}>{row}</span>
        <div style={{ flex:1, height:1, background:C.border }}/>
      </div>
      <div className="srow" style={{ display:"flex", gap:4 }}>
        {spots.filter(s => s.row === row).map(s => (
          <SpotCard key={s._id} spot={s} isSel={selId === s._id} onClick={onSpotClick} clickable={clickable}/>
        ))}
      </div>
    </div>
  );
  const Via = () => (
    <div className="pvia" style={{ width:24, background:C.dim, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", flexShrink:0, minHeight:60 }}>
      <div style={{ position:"absolute", left:"50%", top:0, bottom:0, width:1.5, background:`repeating-linear-gradient(to bottom,${C.borderS} 0,${C.borderS} 8px,transparent 8px,transparent 18px)`, transform:"translateX(-50%)" }}/>
      <span className="pviat" style={{ fontSize:7, fontWeight:600, color:C.textL, textTransform:"uppercase", fontFamily:F.body, writingMode:"vertical-rl", position:"relative" }}>Via</span>
    </div>
  );
  const Block = ({ l, r, ll, rl }) => (
    <div className="pblk" style={{ display:"flex", gap:0, alignItems:"stretch" }}>
      <div style={{ flex:1, background:C.soft, borderRadius:11, padding:"9px 7px", border:`1px solid ${C.border}`, minWidth:0 }}>
        <div style={{ fontSize:8, fontWeight:700, color:C.textL, letterSpacing:.8, textTransform:"uppercase", fontFamily:F.body, marginBottom:6, textAlign:"center" }}>{ll}</div>
        <Row row={l}/>
      </div>
      <Via/>
      <div style={{ flex:1, background:C.soft, borderRadius:11, padding:"9px 7px", border:`1px solid ${C.border}`, minWidth:0 }}>
        <div style={{ fontSize:8, fontWeight:700, color:C.textL, letterSpacing:.8, textTransform:"uppercase", fontFamily:F.body, marginBottom:6, textAlign:"center" }}>{rl}</div>
        <Row row={r}/>
      </div>
    </div>
  );
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <div style={{ display:"flex", gap:14, marginBottom:6, flexWrap:"wrap" }}>
        {Object.entries(SM).map(([k, m]) => (
          <div key={k} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:m.bd }}/>
            <span style={{ fontSize:12, color:C.textM, fontWeight:500, fontFamily:F.body }}>
              {k === "available" ? "Livre" : k === "occupied" ? "Ocupada" : k === "preferential" ? "Preferencial" : "Reservada"}
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
  <div style={{ minHeight:"100vh", background:"#fff", fontFamily:F.body }}>
    <style>{GF + CSS}</style>

    {/* Header */}
    <header className="lhdr" style={{ background:"#fff", borderBottom:`1px solid ${C.border}`, padding:"0 52px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:C.sh }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:32, height:32, background:C.navy, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <CarIcon size={16} color="#fff"/>
        </div>
        <span style={{ fontFamily:F.head, fontSize:18, fontWeight:700, color:C.navy, letterSpacing:-.3 }}>OMV</span>
      </div>
      <div style={{ display:"flex", gap:14, alignItems:"center" }}>
        <button onClick={() => document.getElementById("sobre").scrollIntoView({ behavior:"smooth" })} style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, color:C.textM, fontFamily:F.body, fontWeight:500 }}>Sobre</button>
        <Btn onClick={onEnter} sm>Acessar o sistema</Btn>
      </div>
    </header>

    {/* Hero */}
    <div className="hw" style={{ maxWidth:880, margin:"0 auto", padding:"80px 28px 64px", textAlign:"center" }}>
      <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:C.greenL, border:`1px solid ${C.green}30`, borderRadius:20, padding:"5px 14px", marginBottom:24 }}>
        <div style={{ width:7, height:7, borderRadius:"50%", background:C.green, animation:"pulse 2s infinite" }}/>
        <span style={{ fontSize:12, color:C.greenD, fontWeight:600, fontFamily:F.body }}>Sistema em operação</span>
      </div>
      <h1 className="hh1" style={{ fontFamily:F.head, fontSize:52, fontWeight:700, color:C.navy, lineHeight:1.12, marginBottom:20, letterSpacing:-.5 }}>
        Projeto OMV — Otimização<br/>e Monitoramento de Vagas
      </h1>
      <p className="hsub" style={{ fontSize:17, color:C.textM, maxWidth:540, margin:"0 auto 36px", lineHeight:1.8, fontFamily:F.body, fontWeight:400 }}>
        Sistema inteligente de gestão de estacionamentos que integra sensores físicos, servidor em nuvem e plataforma web para controlar suas vagas em tempo real.
      </p>
      <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
        <Btn onClick={onEnter} style={{ padding:"13px 32px", fontSize:15 }}>Entrar no sistema</Btn>
        <Btn v="ghost" onClick={() => document.getElementById("sobre").scrollIntoView({ behavior:"smooth" })} style={{ padding:"13px 32px", fontSize:15 }}>Ver o projeto</Btn>
      </div>
    </div>

    {/* Cards de camadas */}
    <div style={{ maxWidth:900, margin:"0 auto", padding:"0 28px 64px" }}>
      <div className="hcds" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        {[
          { n:"01", title:"Camada Física",  desc:"Maquete 3D com 12 vagas, sensores HC-SR04 embutidos por vaga e ESP32 transmitindo leituras ao servidor via Wi-Fi em tempo real." },
          { n:"02", title:"Servidor",       desc:"Node.js com MongoDB Atlas hospedado no Render. Gerencia reservas, usuários, pagamentos e todas as regras de negócio automatizadas." },
          { n:"03", title:"Plataforma Web", desc:"React e Vite com mapa ao vivo, reservas antecipadas, cronômetro de uso, pagamento simulado e painel administrativo completo." },
        ].map(c => (
          <div key={c.n} style={{ background:C.card, borderRadius:14, padding:"24px 22px", border:`1px solid ${C.border}`, boxShadow:C.sh }}>
            <span style={{ fontSize:12, fontWeight:700, color:C.blue, fontFamily:F.body, letterSpacing:.6 }}>{c.n}</span>
            <h3 style={{ fontFamily:F.head, fontSize:17, fontWeight:600, color:C.navy, margin:"10px 0 9px" }}>{c.title}</h3>
            <p style={{ fontSize:13.5, color:C.textM, lineHeight:1.75, margin:0, fontFamily:F.body }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Sobre */}
    <div id="sobre" className="abouts" style={{ background:C.soft, borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:"64px 28px" }}>
      <div style={{ maxWidth:860, margin:"0 auto" }}>
        <div style={{ marginBottom:40 }}>
          <span style={{ fontSize:12, fontWeight:700, color:C.blue, letterSpacing:.7, textTransform:"uppercase", fontFamily:F.body }}>Sobre o Projeto</span>
          <h2 style={{ fontFamily:F.head, fontSize:36, fontWeight:700, color:C.navy, marginTop:10, marginBottom:14, letterSpacing:-.4 }}>
            TCC — Curso Técnico<br/>em Eletrônica
          </h2>
          <p style={{ fontSize:15, color:C.textM, lineHeight:1.85, maxWidth:640, fontFamily:F.body }}>
            O OMV foi desenvolvido para resolver um problema real: estacionamentos privados sem controle eficiente geram congestionamento e prejuízo. Integrando IoT, sistemas embarcados e desenvolvimento web, o projeto propõe uma solução completa e acessível.
          </p>
        </div>

        <div className="agrd" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14, marginBottom:28 }}>
          {[
            { title:"Maquete Física",      desc:"Impressa em PLA, representa um estacionamento com 12 vagas em 4 avenidas. Cada vaga tem um sensor HC-SR04 embutido. Dois ESP32 coletam leituras e enviam ao servidor via Wi-Fi. Displays LCD nas entradas exibem vagas disponíveis em tempo real." },
            { title:"Backend e Banco",     desc:"Servidor Node.js com Express hospedado no Render.com. MongoDB Atlas armazena usuários, reservas e logs. Gerencia reservas com taxa fixa, tolerância de 5 min, no-show automático com multa e cancelamento com reembolso inteligente." },
            { title:"Plataforma Web",      desc:"Site responsivo em React e Vite hospedado no Vercel. Para clientes: mapa ao vivo, reservas, cronômetro e pagamento. Para operadores: dashboard com métricas, gestão de vagas, reservas, usuários e logs de acesso." },
            { title:"Identificação RFID",  desc:"Tags RFID nos carrinhos substituem placas de veículos. O leitor RC522 lê a tag na entrada da vaga e o ESP32 envia o ID ao backend, que verifica se corresponde à reserva — equivalente ao reconhecimento óptico de placas em escala real." },
          ].map(i => (
            <div key={i.title} style={{ background:C.card, borderRadius:12, padding:"20px 18px", border:`1px solid ${C.border}`, boxShadow:C.sh }}>
              <h4 style={{ fontFamily:F.head, fontSize:15, fontWeight:600, color:C.navy, marginBottom:9 }}>{i.title}</h4>
              <p style={{ fontSize:13.5, color:C.textM, lineHeight:1.78, margin:0, fontFamily:F.body }}>{i.desc}</p>
            </div>
          ))}
        </div>

        {/* Regras */}
        <div style={{ background:C.card, borderRadius:14, padding:"22px 24px", marginBottom:36, border:`1px solid ${C.border}`, boxShadow:C.sh }}>
          <h3 style={{ fontFamily:F.head, fontSize:17, fontWeight:600, color:C.navy, marginBottom:16 }}>Regras Automatizadas</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:12 }}>
            {[
              { title:"Taxa de reserva",       desc:`R$ ${CFG.reservationFee || 10},00 cobrados ao confirmar, garantindo intenção real de uso.` },
              { title:"Tolerância de chegada", desc:`${CFG.toleranceMinutes || 5} minutos após o horário para o sensor detectar o veículo.` },
              { title:"No-show automático",    desc:"Sem detecção no prazo, a vaga é liberada e multa aplicada automaticamente." },
              { title:"Cancelamento",          desc:"Com +15 min de antecedência a taxa é reembolsada. Cancelamento tardio retém o valor." },
            ].map(s => (
              <div key={s.title} style={{ background:C.soft, borderRadius:9, padding:"13px 14px", border:`1px solid ${C.border}` }}>
                <p style={{ fontSize:13.5, fontWeight:600, color:C.navy, margin:"0 0 5px", fontFamily:F.body }}>{s.title}</p>
                <p style={{ fontSize:13, color:C.textM, margin:0, lineHeight:1.65, fontFamily:F.body }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign:"center" }}>
          <Btn onClick={onEnter} style={{ padding:"13px 36px", fontSize:15 }}>Acessar o sistema</Btn>
        </div>
      </div>
    </div>

    <footer className="lftr" style={{ background:C.navy, padding:"22px 52px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:28, height:28, background:"rgba(255,255,255,.15)", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <CarIcon size={14} color="#fff"/>
        </div>
        <span style={{ fontFamily:F.head, fontSize:14, fontWeight:600, color:"#fff" }}>OMV</span>
      </div>
      <span style={{ fontSize:12.5, color:"rgba(255,255,255,.55)", fontFamily:F.body }}>Projeto TCC — Curso Técnico em Eletrônica</span>
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
    if (k === "cpf") v = fmtCPF(v);
    if (k === "telefone") v = fmtTel(v);
    setForm(p => ({ ...p, [k]:v })); setErr("");
  };

  const submit = async () => {
    setLoad(true); setErr("");
    try {
      let token, user;
      if (mode === "login") {
        ({ token, user } = await api.login(form.email.trim(), form.password));
      } else {
        if (!form.nomeCompleto || !form.username || !form.cpf || !form.endereco || !form.email || !form.password)
          { setErr("Preencha todos os campos obrigatórios."); setLoad(false); return; }
        ({ token, user } = await api.register({ ...form, email:form.email.trim(), username:form.username.trim() }));
      }
      localStorage.setItem("omv_token", token); onLogin(user);
    } catch (e) { setErr(e.message); } finally { setLoad(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:F.body, padding:"24px 16px" }}>
      <style>{GF + CSS}</style>
      <button onClick={onBack} style={{ position:"fixed", top:20, left:20, background:"none", border:"none", cursor:"pointer", color:C.textL, fontSize:13.5, fontFamily:F.body, display:"flex", alignItems:"center", gap:4 }}>← Voltar</button>
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:6 }}>
          <div style={{ width:36, height:36, background:C.navy, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <CarIcon size={18} color="#fff"/>
          </div>
          <span style={{ fontFamily:F.head, fontSize:22, fontWeight:700, color:C.navy }}>OMV</span>
        </div>
        <p style={{ fontSize:13, color:C.textL }}>Sistema Inteligente de Estacionamento</p>
      </div>
      <div className="aup" style={{ background:C.card, borderRadius:16, padding:"30px 28px", boxShadow:C.shL, border:`1px solid ${C.border}`, width:"100%", maxWidth:430 }}>
        <h1 style={{ fontFamily:F.head, fontSize:22, fontWeight:600, color:C.navy, marginBottom:4 }}>{mode === "login" ? "Bem-vindo de volta" : "Criar conta"}</h1>
        <p style={{ color:C.textL, fontSize:13.5, marginBottom:22 }}>{mode === "login" ? "Acesse para reservar sua vaga." : "Preencha seus dados abaixo."}</p>

        {mode === "register" && <>
          <Field label="Nome Completo" required><Inp value={form.nomeCompleto} onChange={set("nomeCompleto")} placeholder="João da Silva"/></Field>
          <div className="form-row" style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}><Field label="Usuário" required><Inp value={form.username} onChange={set("username")} placeholder="joaosilva"/></Field></div>
            <div style={{ flex:1 }}><Field label="Telefone"><Inp value={form.telefone} onChange={set("telefone")} placeholder="(11) 99999-0000"/></Field></div>
          </div>
          <div className="form-row" style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}><Field label="CPF" required><Inp value={form.cpf} onChange={set("cpf")} placeholder="000.000.000-00"/></Field></div>
            <div style={{ flex:1 }}><Field label="Endereço" required><Inp value={form.endereco} onChange={set("endereco")} placeholder="Rua, nº — Cidade"/></Field></div>
          </div>
        </>}
        <Field label="Email" required><Inp value={form.email} onChange={set("email")} placeholder="seu@email.com" onKeyDown={e => e.key === "Enter" && submit()}/></Field>
        <Field label="Senha" required><Inp type="password" value={form.password} onChange={set("password")} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()}/></Field>
        <ErrBox msg={err}/>
        <Btn onClick={submit} disabled={load} full style={{ padding:"12px", fontSize:15, marginTop:4 }}>
          {load ? <Spin c="#fff"/> : (mode === "login" ? "Entrar" : "Criar conta")}
        </Btn>
        <p style={{ textAlign:"center", marginTop:16, fontSize:13.5, color:C.textL }}>
          {mode === "login" ? "Não tem conta? " : "Já tem conta? "}
          <span onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr(""); }} style={{ color:C.blue, fontWeight:600, cursor:"pointer" }}>
            {mode === "login" ? "Cadastre-se" : "Entrar"}
          </span>
        </p>
        {mode === "login" && (
          <div style={{ marginTop:18, background:C.navyL, borderRadius:10, padding:"12px 14px", border:`1px solid ${C.navyT}` }}>
            <p style={{ fontSize:11, color:C.navyM, fontWeight:700, marginBottom:4, letterSpacing:.7, textTransform:"uppercase" }}>Acesso Admin</p>
            <p style={{ fontSize:13, color:C.textM, lineHeight:1.8 }}><strong style={{ color:C.navy }}>admin@omv.com</strong> / <strong style={{ color:C.navy }}>admin123</strong></p>
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
  const avail = spots.filter(s => s.status === "available").length;
  const occ   = spots.filter(s => s.status === "occupied" || s.status === "reserved").length;
  const pref  = spots.filter(s => s.status === "preferential").length;
  const pct   = spots.length ? Math.round((occ / spots.length) * 100) : 0;
  return (
    <div>
      <div className="dg" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 }}>
        {[
          { label:"Livres",        value:avail,        c:C.green,  bg:C.greenL },
          { label:"Ocupadas",      value:occ,          c:C.red,    bg:C.redL   },
          { label:"Preferenciais", value:pref,         c:C.amber,  bg:C.amberL },
          { label:"Total",         value:spots.length, c:C.navy,   bg:C.navyL  },
        ].map(p => (
          <div key={p.label} style={{ background:p.bg, borderRadius:12, padding:"16px 16px 14px", border:`1px solid ${p.c}25` }}>
            <div style={{ fontSize:30, fontFamily:F.head, fontWeight:700, color:p.c, lineHeight:1 }}>{p.value}</div>
            <div style={{ fontSize:10, color:p.c, fontWeight:700, marginTop:4, letterSpacing:.6, textTransform:"uppercase", fontFamily:F.body }}>{p.label}</div>
          </div>
        ))}
      </div>
      <Card style={{ marginBottom:16, padding:"16px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <span style={{ fontSize:13, fontWeight:600, color:C.textM, fontFamily:F.body }}>Taxa de ocupação</span>
          <span style={{ fontSize:13, fontWeight:700, color:pct > 70 ? C.red : pct > 40 ? C.amber : C.green, fontFamily:F.body }}>{pct}%</span>
        </div>
        <div style={{ height:6, background:C.dim, borderRadius:20, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, borderRadius:20, transition:"width .6s ease", background:pct > 70 ? C.red : pct > 40 ? C.amber : C.green }}/>
        </div>
        <p style={{ fontSize:12.5, color:C.textL, marginTop:7, fontFamily:F.body }}>
          {pct > 70 ? "Estacionamento quase cheio." : pct > 40 ? "Ocupação moderada." : "Boa disponibilidade de vagas."}
        </p>
      </Card>
      <ParkMap spots={spots} selId={null} onSpotClick={() => {}} clickable={false}/>
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
    if (!time || !date) { setErr("Selecione data e horário."); return; }
    const start = buildStart(date, time);
    const tStr  = `${String(start.getHours()).padStart(2,"0")}:${String(start.getMinutes()).padStart(2,"0")}`;
    const dStr  = start.toISOString().split("T")[0];
    setLoad(true); setErr("");
    try { await api.createRes(sel._id, tStr, dStr, placa, modelo); onReserved(); setTab("payment"); }
    catch (e) { setErr(e.message); } finally { setLoad(false); }
  };

  const cancel = async () => {
    if (!window.confirm("Cancelar reserva?")) return;
    setCLoad(true);
    try { const r = await api.cancelRes(activeRes._id); setCR(r); onReserved(); }
    catch (e) { alert(e.message); } finally { setCLoad(false); }
  };

  if (cResult) return (
    <div style={{ maxWidth:420, margin:"0 auto" }}>
      <Card>
        <div style={{ textAlign:"center", padding:"10px 0 14px" }}>
          <p style={{ fontFamily:F.head, fontSize:19, fontWeight:600, color:C.navy, marginBottom:8 }}>Reserva cancelada</p>
          {cResult.feeRefunded
            ? <p style={{ fontSize:14, color:C.green, fontFamily:F.body }}>Taxa de reserva reembolsada — cancelamento antecipado.</p>
            : <p style={{ fontSize:14, color:C.red, fontFamily:F.body }}>Taxa de <strong>{fmtMoney(cfg.reservationFee)}</strong> retida — cancelamento tardio.</p>
          }
        </div>
        <Btn full onClick={() => { setCR(null); setStep(1); }} v="ghost">Fechar</Btn>
      </Card>
    </div>
  );

  if (activeRes) return (
    <div style={{ maxWidth:480, margin:"0 auto" }}>
      <Card>
        {activeRes.status === "no_show" ? (
          <div>
            <Pill label="No-show" color={C.redD} bg={C.redL}/>
            <h3 style={{ fontFamily:F.head, fontSize:18, fontWeight:600, color:C.navy, margin:"12px 0 6px" }}>Multa pendente</h3>
            <p style={{ fontSize:14, color:C.textM, fontFamily:F.body, marginBottom:16 }}>Você não compareceu no horário. Multa de <strong style={{ color:C.red }}>{fmtMoney(cfg.noShowFine)}</strong>.</p>
            <Btn v="danger" full onClick={() => setTab("payment")}>Pagar multa — {fmtMoney(cfg.noShowFine)}</Btn>
          </div>
        ) : (
          <div>
            {/* Informações da reserva */}
            <div className="res-info" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18 }}>
              <div>
                <Pill label="Ativa" color={C.greenD} bg={C.greenL}/>
                <h3 style={{ fontFamily:F.head, fontSize:20, fontWeight:700, color:C.navy, margin:"10px 0 4px" }}>Vaga {activeRes.spotNumber}</h3>
                <p style={{ fontSize:13.5, color:C.textM, margin:0, fontFamily:F.body }}>Horário: {activeRes.startTimeStr}</p>
                {activeRes.placa && <p style={{ fontSize:13, color:C.textM, margin:"3px 0 0", fontFamily:F.body }}>{activeRes.placa}{activeRes.modelo && ` — ${activeRes.modelo}`}</p>}
              </div>
              <CarIcon color={C.navy} size={40}/>
            </div>
            <Notice v="warn" style={{ marginBottom:18 }}>
              Tolerância de <strong>{cfg.toleranceMinutes} min</strong> para chegada. Sem detecção no prazo, a vaga é liberada e uma multa de <strong>{fmtMoney(cfg.noShowFine)}</strong> é aplicada.
            </Notice>
            {/* BOTÕES DENTRO DO CARD */}
            <div className="act-row" style={{ display:"flex", gap:9 }}>
              <Btn full onClick={() => setTab("payment")} v="outline">Ir para pagamento</Btn>
              <Btn v="ghost" onClick={cancel} disabled={cLoad} style={{ flexShrink:0 }}>
                {cLoad ? <Spin/> : "Cancelar reserva"}
              </Btn>
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <div>
      {step === 1 ? (
        <div className="rlay" style={{ display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:14, color:C.textM, marginBottom:12, lineHeight:1.65, fontFamily:F.body }}>
              Selecione uma vaga <span style={{ color:C.green, fontWeight:600 }}>livre</span> ou <span style={{ color:C.amber, fontWeight:600 }}>preferencial</span> no mapa abaixo.
            </p>
            <ParkMap spots={spots} selId={sel?._id} onSpotClick={s => { setSel(p => p?._id === s._id ? null : s); setErr(""); }} clickable={true}/>
          </div>
          {sel && (
            <div className="rpan aup" style={{ width:230, flexShrink:0 }}>
              <Card>
                <div style={{ paddingBottom:14, marginBottom:14, borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:11, fontWeight:600, color:C.textL, letterSpacing:.6, textTransform:"uppercase", fontFamily:F.body }}>Selecionada</span>
                  <p style={{ fontSize:30, fontFamily:F.head, fontWeight:700, color:C.navy, margin:"5px 0 0" }}>{sel.row}{sel.spotNumber}</p>
                </div>
                <p style={{ fontSize:12, color:C.textL, marginBottom:2, fontFamily:F.body }}>Taxa de reserva</p>
                <p style={{ fontSize:22, fontFamily:F.head, fontWeight:700, color:C.navy, marginBottom:2 }}>{fmtMoney(cfg.reservationFee)}</p>
                <p style={{ fontSize:12, color:C.textL, marginBottom:16, fontFamily:F.body }}>+ {fmtMoney(cfg.pricePerHour)}/hora de uso</p>
                <Btn full onClick={() => setStep(2)} style={{ marginBottom:8 }}>Continuar</Btn>
                <Btn v="ghost" full onClick={() => setSel(null)}>Cancelar</Btn>
              </Card>
            </div>
          )}
        </div>
      ) : (
        <div style={{ maxWidth:420, margin:"0 auto" }} className="aup">
          <button onClick={() => setStep(1)} style={{ background:"none", border:"none", cursor:"pointer", color:C.textL, fontSize:13.5, fontFamily:F.body, marginBottom:16, display:"flex", alignItems:"center", gap:4 }}>← Voltar ao mapa</button>
          <Card>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, background:C.soft, borderRadius:10, padding:"13px 15px", border:`1px solid ${C.border}` }}>
              <div>
                <span style={{ fontSize:11, color:C.textL, textTransform:"uppercase", letterSpacing:.6, fontFamily:F.body }}>Vaga</span>
                <p style={{ fontSize:26, fontFamily:F.head, fontWeight:700, color:C.navy, margin:0 }}>{sel?.row}{sel?.spotNumber}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <span style={{ fontSize:11, color:C.textL, fontFamily:F.body }}>Taxa + uso</span>
                <p style={{ fontSize:14, fontFamily:F.head, fontWeight:700, color:C.navy, margin:0 }}>{fmtMoney(cfg.reservationFee)} + {fmtMoney(cfg.pricePerHour)}/h</p>
              </div>
            </div>
            <Notice v="warn" style={{ marginBottom:16 }}>
              Taxa de <strong>{fmtMoney(cfg.reservationFee)}</strong> cobrada ao confirmar. Tolerância de <strong>{cfg.toleranceMinutes} min</strong>. Cancelamento com +15 min reembolsa a taxa.
            </Notice>
            <Divider label="Quando vai usar?"/>
            <div className="form-row" style={{ display:"flex", gap:10 }}>
              <div style={{ flex:1 }}>
                <Field label="Data" required>
                  <input type="date" value={date} min={todayStr()} onChange={e => setDate(e.target.value)} style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${C.border}`, fontSize:14, fontFamily:F.body, background:C.soft, color:C.text, outline:"none" }}/>
                </Field>
              </div>
              <div style={{ flex:1 }}>
                <Field label="Horário" required hint="início">
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${C.border}`, fontSize:14, fontFamily:F.body, background:C.soft, color:C.text, outline:"none" }}/>
                </Field>
              </div>
            </div>
            <Divider label="Veículo (opcional)"/>
            <Field label="Placa">
              <Inp value={placa} onChange={e => setPlaca(fmtPlaca(e.target.value))} placeholder="ABC1234" maxLength={7}/>
            </Field>
            <Field label="Modelo">
              <div className="mgrid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
                {MODELOS.map(mod => (
                  <button key={mod} onClick={() => setMod(m => m === mod ? "" : mod)} style={{ padding:"7px 4px", borderRadius:8, border:`1.5px solid ${modelo === mod ? C.navy : C.border}`, background:modelo === mod ? C.navy : "transparent", color:modelo === mod ? "#fff" : C.textM, fontSize:11.5, fontWeight:600, cursor:"pointer", fontFamily:F.body, transition:"all .12s" }}>{mod}</button>
                ))}
              </div>
            </Field>
            <ErrBox msg={err}/>
            <div style={{ display:"flex", gap:9, marginTop:10 }}>
              <Btn onClick={confirm} disabled={load} full>{load ? <Spin c="#fff"/> : `Confirmar — ${fmtMoney(cfg.reservationFee)}`}</Btn>
              <Btn v="ghost" onClick={() => setStep(1)} style={{ flexShrink:0 }}>Voltar</Btn>
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
  const is = { width:"100%", padding:"10px 13px", borderRadius:9, border:`1.5px solid ${C.border}`, fontSize:14, fontFamily:F.body, background:C.soft, color:C.text, outline:"none" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,25,41,.5)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
      <div className="aup" style={{ background:C.card, borderRadius:16, padding:26, maxWidth:400, width:"100%", boxShadow:C.shL, border:`1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
        {step === 3 ? (
          <div style={{ textAlign:"center", padding:"16px 0" }}>
            <Spin sz={38} c={C.green}/>
            <p style={{ fontFamily:F.head, fontSize:17, fontWeight:600, color:C.navy, marginTop:16 }}>Processando pagamento...</p>
          </div>
        ) : (
          <>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <h2 style={{ fontFamily:F.head, fontSize:18, fontWeight:600, color:C.navy }}>{label || "Confirmar Pagamento"}</h2>
              <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:C.textL, lineHeight:1, padding:4 }}>✕</button>
            </div>
            <div style={{ background:C.greenL, borderRadius:11, padding:"14px 18px", marginBottom:18, textAlign:"center" }}>
              <p style={{ fontSize:11, color:C.greenD, textTransform:"uppercase", letterSpacing:.7, fontFamily:F.body, margin:0, marginBottom:2 }}>Total a pagar</p>
              <p style={{ fontSize:30, fontFamily:F.head, fontWeight:700, color:C.green, margin:0 }}>R$ {price}</p>
            </div>
            {step === 1 && (
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {[
                  { key:"pix",  title:"PIX",       sub:"Aprovação instantânea" },
                  { key:"card", title:"Cartão",     sub:"Crédito ou débito" },
                  { key:"demo", title:"Modo Demo",  sub:"Para fins de demonstração do TCC" },
                ].map(o => (
                  <button key={o.key} onClick={() => o.key === "demo" ? pay() : (setMethod(o.key), setStep(2))} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 15px", borderRadius:11, border:`1.5px solid ${C.border}`, background:C.soft, cursor:"pointer", transition:"border-color .12s" }}>
                    <div>
                      <p style={{ fontSize:14, fontWeight:600, color:C.navy, margin:0, fontFamily:F.body }}>{o.title}</p>
                      <p style={{ fontSize:12, color:C.textL, margin:0, fontFamily:F.body }}>{o.sub}</p>
                    </div>
                    <span style={{ color:C.textL, fontSize:16 }}>›</span>
                  </button>
                ))}
              </div>
            )}
            {step === 2 && method === "pix" && (
              <div>
                <div style={{ background:C.soft, borderRadius:11, padding:16, marginBottom:14, textAlign:"center", border:`1px solid ${C.border}` }}>
                  <div style={{ width:112, height:112, margin:"0 auto 10px", background:C.navy, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, padding:8 }}>
                      {Array.from({ length:49 }).map((_, i) => <div key={i} style={{ width:10, height:10, background:Math.random() > .45 ? "#fff" : "transparent", borderRadius:1 }}/>)}
                    </div>
                  </div>
                  <p style={{ fontSize:12, color:C.textL, fontFamily:F.body }}>QR Code simulado para demonstração</p>
                </div>
                <Btn full onClick={pay} v="success">Confirmar pagamento PIX</Btn>
                <button onClick={() => setStep(1)} style={{ marginTop:10, background:"none", border:"none", cursor:"pointer", color:C.textL, fontSize:13.5, fontFamily:F.body, width:"100%" }}>← Voltar</button>
              </div>
            )}
            {step === 2 && method === "card" && (
              <div>
                <Field label="Número do cartão"><input value={card.num} onChange={e => setCard(p => ({ ...p, num:e.target.value.replace(/\D/g,"").slice(0,16).replace(/(\d{4})/g,"$1 ").trim() }))} placeholder="0000 0000 0000 0000" maxLength={19} style={is}/></Field>
                <Field label="Nome no cartão"><input value={card.nome} onChange={e => setCard(p => ({ ...p, nome:e.target.value.toUpperCase() }))} placeholder="NOME SOBRENOME" style={is}/></Field>
                <div style={{ display:"flex", gap:10 }}>
                  <div style={{ flex:1 }}><Field label="Validade"><input value={card.val} onChange={e => setCard(p => ({ ...p, val:e.target.value.replace(/\D/g,"").slice(0,4).replace(/(\d{2})(\d)/,"$1/$2") }))} placeholder="MM/AA" maxLength={5} style={is}/></Field></div>
                  <div style={{ flex:1 }}><Field label="CVV"><input value={card.cvv} onChange={e => setCard(p => ({ ...p, cvv:e.target.value.replace(/\D/g,"").slice(0,3) }))} placeholder="000" maxLength={3} style={is}/></Field></div>
                </div>
                <Notice v="info" style={{ marginBottom:14 }}>Modo demonstração — nenhuma cobrança real será efetuada.</Notice>
                <Btn full onClick={pay} v="blue">Confirmar pagamento</Btn>
                <button onClick={() => setStep(1)} style={{ marginTop:10, background:"none", border:"none", cursor:"pointer", color:C.textL, fontSize:13.5, fontFamily:F.body, width:"100%" }}>← Voltar</button>
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
  const [secs, setSecs]   = useState(0);
  const [run, setRun]     = useState(false);
  const [modal, setModal] = useState(false);
  const [paid, setPaid]   = useState(false);
  const [fp, setFp]       = useState(null);
  const [ft, setFt]       = useState(null);
  const iv = useRef(null);

  useEffect(() => {
    if (!activeRes || activeRes.status === "no_show") return;
    const el = Math.max(0, Math.floor((new Date() - new Date(activeRes.startTime)) / 1000));
    setSecs(el);
    if (new Date() >= new Date(activeRes.startTime)) setRun(true);
  }, [activeRes?._id]);

  useEffect(() => {
    clearInterval(iv.current);
    if (run) iv.current = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(iv.current);
  }, [run]);

  const usage = ((secs / 3600) * cfg.pricePerHour).toFixed(2);
  const total = (parseFloat(usage) + cfg.reservationFee).toFixed(2);

  const payConfirm = async () => {
    try {
      const { totalPrice:tp } = await api.payRes(activeRes._id);
      clearInterval(iv.current); setRun(false); setPaid(true); setModal(false);
      setFp(tp.toFixed(2)); setFt(fmtTime(secs));
      setTimeout(() => { setPaid(false); setFp(null); setFt(null); setSecs(0); onPaid(); }, 5000);
    } catch (e) { alert(e.message); }
  };

  if (paid) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:280, gap:16, textAlign:"center" }}>
      <div style={{ width:60, height:60, borderRadius:"50%", background:C.greenL, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <p style={{ fontFamily:F.head, fontSize:26, fontWeight:700, color:C.green, margin:0 }}>Pagamento confirmado</p>
      <p style={{ fontSize:22, fontWeight:700, color:C.navy, fontFamily:F.head }}>{fmtMoney(fp)}</p>
      <p style={{ color:C.textL, fontSize:14, fontFamily:F.body }}>Duração: {ft} — Obrigado pela visita.</p>
    </div>
  );

  return (
    <div className="pay-lay" style={{ display:"flex", gap:22, flexWrap:"wrap", alignItems:"flex-start" }}>
      {modal && <PayModal price={activeRes?.status === "no_show" ? cfg.noShowFine.toFixed(2) : total} label={activeRes?.status === "no_show" ? "Pagar Multa" : "Confirmar Pagamento"} onConfirm={payConfirm} onClose={() => setModal(false)}/>}
      <div className="pay-side" style={{ flex:"0 0 360px", display:"flex", flexDirection:"column", gap:14 }}>
        {!activeRes ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:220, gap:12, textAlign:"center", padding:20 }}>
            <CarIcon color={C.borderS} size={40}/>
            <p style={{ fontFamily:F.head, fontSize:17, fontWeight:600, color:C.textL }}>Nenhuma reserva ativa</p>
            <p style={{ fontSize:13.5, color:C.textL, maxWidth:240, lineHeight:1.7, fontFamily:F.body }}>Faça uma reserva na aba <strong style={{ color:C.textM }}>Reservas</strong> para iniciar.</p>
          </div>
        ) : activeRes.status === "no_show" ? (
          <Card>
            <Notice v="danger" style={{ marginBottom:16 }}>
              <strong>No-show detectado.</strong> Multa de <strong>{fmtMoney(cfg.noShowFine)}</strong> aplicada por não comparecimento.
            </Notice>
            <Btn v="danger" full onClick={() => setModal(true)} style={{ padding:"12px" }}>Pagar multa — {fmtMoney(cfg.noShowFine)}</Btn>
          </Card>
        ) : (
          <Card>
            <div style={{ display:"flex", alignItems:"center", gap:16, paddingBottom:16, marginBottom:16, borderBottom:`1px solid ${C.border}` }}>
              <div style={{ width:48, height:48, borderRadius:12, background:C.purpleL, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <CarIcon color={C.purple} size={24}/>
              </div>
              <div>
                <span style={{ fontSize:11, color:C.textL, fontWeight:600, letterSpacing:.6, textTransform:"uppercase", fontFamily:F.body }}>Reserva ativa</span>
                <p style={{ fontFamily:F.head, fontSize:22, fontWeight:700, color:C.navy, margin:0 }}>Vaga {activeRes.spot?.row}{activeRes.spotNumber}</p>
                <p style={{ fontSize:13, color:C.textM, margin:0, fontFamily:F.body }}>{activeRes.startTimeStr}{activeRes.placa && ` — ${activeRes.placa}`}</p>
              </div>
            </div>
            <div style={{ background:C.navy, borderRadius:12, padding:"18px 22px", textAlign:"center", marginBottom:14 }}>
              <p style={{ color:"rgba(255,255,255,.5)", fontSize:11, fontWeight:600, letterSpacing:2, textTransform:"uppercase", marginBottom:8, fontFamily:F.body }}>{run ? "Tempo decorrido" : "Aguardando horário"}</p>
              <p className="tbig" style={{ fontFamily:F.head, fontSize:44, fontWeight:700, color:"#fff", letterSpacing:1, lineHeight:1, margin:0 }}>{fmtTime(secs)}</p>
              {!run && <p style={{ color:"rgba(255,255,255,.4)", fontSize:12, marginTop:8, fontFamily:F.body }}>O cronômetro inicia no horário reservado.</p>}
            </div>
            {run && (
              <div style={{ marginBottom:14 }}>
                {[["Taxa de reserva", fmtMoney(cfg.reservationFee)], [`Uso (${fmtTime(secs)})`, fmtMoney(usage)]].map(([k, v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                    <span style={{ fontSize:13.5, color:C.textM, fontFamily:F.body }}>{k}</span>
                    <span style={{ fontSize:13.5, fontWeight:600, color:C.text, fontFamily:F.body }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", paddingTop:10, borderTop:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:F.body }}>Total</span>
                  <span style={{ fontSize:20, fontWeight:700, color:C.green, fontFamily:F.head }}>{fmtMoney(total)}</span>
                </div>
              </div>
            )}
            {run && <Btn v="success" onClick={() => setModal(true)} full style={{ padding:"12px" }}>Finalizar e pagar — {fmtMoney(total)}</Btn>}
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
  const [hist, setHist]  = useState([]);
  const [active, setAct] = useState(null);
  const [load, setLoad]  = useState(true);
  const cpfFmt = user.cpf ? user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : "—";

  useEffect(() => {
    Promise.all([api.myHistory(), api.myRes()])
      .then(([h, r]) => { setHist(h); setAct(r); })
      .catch(() => {}).finally(() => setLoad(false));
  }, []);

  const totalG = hist.reduce((a, r) => a + (r.totalPrice || 0), 0);
  const totalS = hist.reduce((a, r) => a + (r.totalSeconds || 0), 0);
  const sBdg   = s => {
    if (s === "paid")      return <Badge color={C.greenD} bg={C.greenL}>Pago</Badge>;
    if (s === "cancelled") return <Badge color={C.textM}  bg={C.dim}>Cancelado</Badge>;
    if (s === "no_show")   return <Badge color={C.redD}   bg={C.redL}>No-show</Badge>;
    return null;
  };

  return (
    <div style={{ maxWidth:640, margin:"0 auto" }}>
      <Card style={{ marginBottom:14, display:"flex", alignItems:"center", gap:16 }}>
        <div style={{ width:48, height:48, borderRadius:12, background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, fontWeight:700, color:"#fff", fontFamily:F.head, flexShrink:0 }}>
          {(user.nomeCompleto?.[0] || user.email[0]).toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontFamily:F.head, fontSize:16, fontWeight:600, color:C.navy, margin:0 }}>{user.nomeCompleto || "—"}</p>
          <p style={{ fontSize:13, color:C.textL, margin:0, fontFamily:F.body }}>@{user.username || "—"} · {user.email}</p>
        </div>
        <Btn v="ghost" sm onClick={onLogout}>Sair</Btn>
      </Card>

      {active && (
        <div style={{ background:active.status === "no_show" ? C.redL : C.purpleL, borderRadius:10, padding:"11px 15px", marginBottom:14, border:`1px solid ${active.status === "no_show" ? C.red : C.purple}25` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:active.status === "no_show" ? C.red : C.purple, animation:"pulse 2s infinite" }}/>
            <p style={{ fontSize:13, fontWeight:600, color:active.status === "no_show" ? C.redD : C.purpleD, margin:0, fontFamily:F.body }}>
              {active.status === "no_show" ? "Multa pendente por no-show" : `Reserva ativa — Vaga ${active.spotNumber} às ${active.startTimeStr}`}
            </p>
          </div>
        </div>
      )}

      <div className="pst" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
        {[
          { label:"Reservas",    value:hist.length,      c:C.purple, bg:C.purpleL },
          { label:"Total gasto", value:fmtMoney(totalG), c:C.green,  bg:C.greenL  },
          { label:"Tempo total", value:fmtTime(totalS),  c:C.amber,  bg:C.amberL  },
        ].map(p => (
          <div key={p.label} style={{ background:p.bg, borderRadius:11, padding:"13px 14px", border:`1px solid ${p.c}25` }}>
            <div style={{ fontSize:15, fontFamily:F.head, fontWeight:700, color:p.c, lineHeight:1.2, wordBreak:"break-all" }}>{p.value}</div>
            <div style={{ fontSize:10, color:p.c, fontWeight:700, marginTop:3, letterSpacing:.5, textTransform:"uppercase", fontFamily:F.body }}>{p.label}</div>
          </div>
        ))}
      </div>

      <Card style={{ marginBottom:14 }}>
        <h3 style={{ fontFamily:F.head, fontSize:15, fontWeight:600, color:C.navy, marginBottom:16 }}>Dados pessoais</h3>
        <div className="pg2" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
          {[["Nome", user.nomeCompleto || "—"], ["Usuário", `@${user.username || "—"}`], ["Email", user.email], ["CPF", cpfFmt], ["Telefone", user.telefone || "—"], ["Endereço", user.endereco || "—"]].map(([k, v]) => (
            <div key={k}>
              <p style={{ fontSize:11, color:C.textL, textTransform:"uppercase", letterSpacing:.6, margin:"0 0 4px", fontFamily:F.body }}>{k}</p>
              <p style={{ fontSize:14, color:C.text, fontWeight:500, margin:0, fontFamily:F.body, wordBreak:"break-all" }}>{v}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 style={{ fontFamily:F.head, fontSize:15, fontWeight:600, color:C.navy, marginBottom:16 }}>Histórico de reservas</h3>
        {load && <div style={{ display:"flex", justifyContent:"center", padding:"14px 0" }}><Spin/></div>}
        {!load && hist.length === 0 && <p style={{ fontSize:14, color:C.textL, fontFamily:F.body }}>Nenhum pagamento registrado ainda.</p>}
        {!load && hist.map((r, i) => (
          <div key={r._id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 0", borderBottom:i < hist.length - 1 ? `1px solid ${C.border}` : "none", gap:10, flexWrap:"wrap" }}>
            <div>
              <p style={{ fontSize:14, fontWeight:600, color:C.text, margin:0, fontFamily:F.body }}>Vaga {r.spotNumber}{r.placa && ` · ${r.placa}`}</p>
              <p style={{ fontSize:12, color:C.textL, margin:0, fontFamily:F.body }}>{fmtDate(r.createdAt)}{r.totalSeconds ? ` · ${fmtTime(r.totalSeconds)}` : ""}</p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              {sBdg(r.status)}
              <Badge color={C.greenD} bg={C.greenL}>{fmtMoney(r.totalPrice)}</Badge>
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
  const cpf = user.cpf ? user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : "—";
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,25,41,.45)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
      <div className="aup" style={{ background:C.card, borderRadius:16, padding:24, maxWidth:380, width:"100%", boxShadow:C.shL, border:`1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
          <div style={{ width:44, height:44, borderRadius:11, background:C.navyL, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700, color:C.navy, fontFamily:F.head, flexShrink:0 }}>
            {(user.nomeCompleto?.[0] || user.email[0]).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize:15, fontWeight:700, color:C.navy, margin:0, fontFamily:F.head }}>{user.nomeCompleto || "—"}</p>
            <p style={{ fontSize:12, color:C.textL, margin:0, fontFamily:F.body }}>@{user.username || "—"}</p>
          </div>
        </div>
        {[["Email", user.email], ["CPF", cpf], ["Endereço", user.endereco || "—"], ["Reservas", user.totalReservas || 0], ["Gasto total", fmtMoney(user.totalGasto || 0)], ["Status", user.ativo ? "Ativo" : "Desativado"]].map(([k, v]) => (
          <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
            <span style={{ fontSize:13, color:C.textL, fontFamily:F.body }}>{k}</span>
            <span style={{ fontSize:13.5, fontWeight:600, color:k === "Status" ? (user.ativo ? C.green : C.red) : C.text, textAlign:"right", maxWidth:"55%", fontFamily:F.body, wordBreak:"break-all" }}>{String(v)}</span>
          </div>
        ))}
        <div style={{ display:"flex", gap:8, marginTop:16, flexWrap:"wrap" }}>
          {!user.isAdmin && onToggle && <Btn v={user.ativo ? "ghost" : "success"} sm onClick={() => onToggle(user._id)} style={{ flex:1 }}>{user.ativo ? "Desativar" : "Reativar"}</Btn>}
          {!user.isAdmin && onDelete && <Btn v="danger" sm onClick={() => onDelete(user._id)} style={{ flex:1 }}>Excluir conta</Btn>}
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
      if (v === "dashboard") setDash(await api.adminDash());
      if (v === "logs")      setLogs(await api.adminLogs());
      if (v === "res")       setRes(await api.adminRes());
      if (v === "users")     setUsers(await api.adminUsers());
    } catch {} setLoad(false);
  };
  useEffect(() => { loadView(view); }, [view]);

  const toggle = async uid => {
    await api.toggleUser(uid);
    const u = await api.adminUsers(); setUsers(u);
    if (selU) setSelU(u.find(x => x._id === selU._id) || null);
  };
  const deleteUser = async uid => {
    if (!window.confirm("Excluir conta permanentemente? Esta ação não pode ser desfeita.")) return;
    try { await api.deleteUser(uid); setSelU(null); const u = await api.adminUsers(); setUsers(u); }
    catch (e) { alert(e.message); }
  };
  const cancelRes = async rid => {
    if (!window.confirm("Cancelar esta reserva?")) return;
    await api.cancelAdmRes(rid); loadView("res");
  };
  const clearLogs = async () => {
    if (!window.confirm("Apagar todos os logs? Esta ação não pode ser desfeita.")) return;
    try { await api.clearLogs(); setLogs([]); } catch (e) { alert(e.message); }
  };
  const runDemo = async () => {
    setDLoad(true); setDMsg("");
    const av = spots.filter(s => s.status === "available");
    if (!av.length) { setDMsg("Sem vagas livres para demonstrar."); setDLoad(false); return; }
    const sp = av[Math.floor(Math.random() * av.length)];
    setDMsg(`Vaga ${sp.row}${sp.spotNumber} sendo ocupada...`);
    await api.sensor(sp.spotNumber, true); onSpotsUpdate();
    setTimeout(async () => {
      setDMsg(`Vaga ${sp.row}${sp.spotNumber} liberada.`);
      await api.sensor(sp.spotNumber, false); onSpotsUpdate();
      setTimeout(() => { setDMsg("Demonstração concluída."); setDLoad(false); }, 1500);
    }, 3000);
  };

  const noShows = res.filter(r => r.status === "no_show").length;
  const rowS = { background:C.card, borderRadius:11, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:7, border:`1px solid ${C.border}`, boxShadow:C.sh };
  const fU = users.filter(u => !search || (u.email + u.nomeCompleto + u.username).toLowerCase().includes(search.toLowerCase()));
  const fR = res.filter(r => !search || (r.user?.email + r.user?.nomeCompleto + String(r.spotNumber)).toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <UserModal user={selU} onClose={() => setSelU(null)} onToggle={toggle} onDelete={deleteUser}/>

      <div className="atabs" style={{ display:"flex", gap:6, marginBottom:18, flexWrap:"wrap" }}>
        {[["dashboard","Dashboard"], ["res","Reservas"], ["users","Usuários"], ["logs","Logs"], ["system","Sistema"]].map(([v, l]) => (
          <button key={v} className="atab" onClick={() => { setView(v); setSearch(""); }} style={{
            padding:"8px 18px", borderRadius:9, fontSize:13.5, fontWeight:600, cursor:"pointer", fontFamily:F.body, transition:"all .12s",
            background:view === v ? C.navy : C.card,
            color:view === v ? "#fff" : C.textM,
            border:`1.5px solid ${view === v ? C.navy : C.border}`,
            boxShadow:view === v ? C.sh : "none",
          }}>
            {l}
            {v === "res" && noShows > 0 && <span style={{ marginLeft:6, background:C.red, color:"#fff", borderRadius:6, padding:"1px 7px", fontSize:11 }}>{noShows}</span>}
          </button>
        ))}
      </div>

      {(view === "users" || view === "res") && (
        <div style={{ marginBottom:14 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." style={{ width:"100%", maxWidth:280, padding:"9px 15px", borderRadius:9, border:`1.5px solid ${C.border}`, fontSize:13.5, fontFamily:F.body, background:C.card, color:C.text, outline:"none", boxShadow:C.sh }}/>
        </div>
      )}

      {load && <div style={{ display:"flex", justifyContent:"center", padding:"30px 0" }}><Spin sz={28}/></div>}

      {/* DASHBOARD */}
      {!load && view === "dashboard" && dash && (
        <div>
          {noShows > 0 && <Notice v="danger" style={{ marginBottom:16 }}><strong>{noShows} no-show(s) pendente(s)</strong> — multas aguardando pagamento.</Notice>}

          <Card style={{ marginBottom:16, padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <div>
              <p style={{ fontFamily:F.head, fontSize:15, fontWeight:600, color:C.navy, margin:"0 0 2px" }}>Modo Demonstração</p>
              <p style={{ fontSize:13, color:C.textM, margin:0, fontFamily:F.body }}>Simula entrada e saída em vaga aleatória sem o ESP32 conectado</p>
              {dMsg && <p style={{ fontSize:13, color:C.amber, margin:"6px 0 0", fontWeight:600, fontFamily:F.body }}>{dMsg}</p>}
            </div>
            <Btn v="amber" sm onClick={runDemo} disabled={dLoad}>{dLoad ? <Spin c="#fff"/> : "Iniciar demonstração"}</Btn>
          </Card>

          <div className="dg" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16 }}>
            {[
              { l:"Usuários",      v:dash.totalUsers,             c:C.navy,   bg:C.navyL  },
              { l:"Reservas",      v:dash.totalReservations,      c:C.purple, bg:C.purpleL},
              { l:"Pagas",         v:dash.paidReservations,       c:C.green,  bg:C.greenL },
              { l:"Receita",       v:fmtMoney(dash.totalRevenue), c:C.green,  bg:C.greenL },
              { l:"Livres",        v:dash.spotsAvailable,         c:C.green,  bg:C.greenL },
              { l:"Ocupadas",      v:dash.spotsOccupied,          c:C.red,    bg:C.redL   },
              { l:"Preferenciais", v:dash.spotsPreferential,      c:C.amber,  bg:C.amberL },
              { l:"Ativas",        v:dash.activeReservations,     c:C.purple, bg:C.purpleL},
            ].map(p => (
              <div key={p.l} style={{ background:p.bg, borderRadius:11, padding:"13px 14px", border:`1px solid ${p.c}22` }}>
                <div style={{ fontSize:22, fontFamily:F.head, fontWeight:700, color:p.c, lineHeight:1 }}>{p.v}</div>
                <div style={{ fontSize:9.5, color:p.c, fontWeight:700, marginTop:3, letterSpacing:.5, textTransform:"uppercase", fontFamily:F.body }}>{p.l}</div>
              </div>
            ))}
          </div>

          <Card style={{ marginBottom:14, padding:18 }}>
            <h3 style={{ fontFamily:F.head, fontSize:15, fontWeight:600, color:C.navy, marginBottom:14 }}>Mapa em tempo real</h3>
            <ParkMap spots={spots} selId={null} onSpotClick={() => {}} clickable={false}/>
          </Card>

          {dash.revenueWeek?.length > 0 && (
            <Card style={{ padding:18 }}>
              <h3 style={{ fontFamily:F.head, fontSize:15, fontWeight:600, color:C.navy, marginBottom:14 }}>Receita — últimos 7 dias</h3>
              {dash.revenueWeek.map(d => (
                <div key={d._id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <span style={{ fontSize:12, color:C.textM, minWidth:32, fontFamily:F.body }}>{d._id}</span>
                  <div style={{ flex:1, height:5, background:C.dim, borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", background:C.green, borderRadius:4, width:`${Math.min(100, (d.total / 500) * 100)}%` }}/>
                  </div>
                  <span style={{ fontSize:13, fontWeight:600, color:C.green, minWidth:64, textAlign:"right", fontFamily:F.body }}>{fmtMoney(d.total)}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* SISTEMA */}
      {!load && view === "system" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card>
            <h3 style={{ fontFamily:F.head, fontSize:16, fontWeight:600, color:C.navy, marginBottom:8 }}>Controle de vagas</h3>
            <p style={{ fontSize:14, color:C.textM, fontFamily:F.body, marginBottom:16, lineHeight:1.65 }}>Libera ou ocupa todas as vagas de uma vez. Útil para testes e demonstrações.</p>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <Btn v="success" sm onClick={async () => { if (!window.confirm("Liberar todas as 12 vagas?")) return; try { await api.resetSpots(false); onSpotsUpdate(); } catch (e) { alert(e.message); } }}>Liberar todas</Btn>
              <Btn v="danger"  sm onClick={async () => { if (!window.confirm("Ocupar todas as 12 vagas?"))  return; try { await api.resetSpots(true);  onSpotsUpdate(); } catch (e) { alert(e.message); } }}>Ocupar todas</Btn>
            </div>
          </Card>
          <Card>
            <h3 style={{ fontFamily:F.head, fontSize:16, fontWeight:600, color:C.navy, marginBottom:7 }}>Demonstração ao vivo</h3>
            <p style={{ fontSize:14, color:C.textM, fontFamily:F.body, marginBottom:14 }}>Simula entrada e saída sem o ESP32 conectado.</p>
            {dMsg && <Notice v="warn" style={{ marginBottom:12 }}>{dMsg}</Notice>}
            <Btn v="amber" sm onClick={runDemo} disabled={dLoad}>{dLoad ? <Spin c="#fff"/> : "Iniciar"}</Btn>
          </Card>
          <Card>
            <h3 style={{ fontFamily:F.head, fontSize:16, fontWeight:600, color:C.navy, marginBottom:16 }}>Status do sistema</h3>
            {[
              { l:"Backend API",    v:"Online",                    c:C.green  },
              { l:"Banco de Dados", v:"MongoDB Atlas — conectado", c:C.green  },
              { l:"Frontend",       v:"Vercel — em operação",      c:C.green  },
              { l:"Sensores ESP32", v:`${spots.length} vagas`,     c:C.purple },
              { l:"Polling",        v:"A cada 5 segundos",         c:C.amber  },
            ].map(item => (
              <div key={item.l} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${C.border}`, flexWrap:"wrap", gap:6 }}>
                <span style={{ fontSize:14, color:C.textM, fontFamily:F.body }}>{item.l}</span>
                <Pill label={item.v} color={item.c} bg={item.c === C.green ? C.greenL : item.c === C.purple ? C.purpleL : C.amberL}/>
              </div>
            ))}
          </Card>
          <Card>
            <h3 style={{ fontFamily:F.head, fontSize:16, fontWeight:600, color:C.navy, marginBottom:16 }}>Estado das vagas</h3>
            {spots.map(s => {
              const m = SM[s.status] || SM.available;
              return (
                <div key={s._id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}`, flexWrap:"wrap", gap:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <div style={{ width:7, height:7, borderRadius:2, background:m.bd }}/>
                    <span style={{ fontSize:13.5, color:C.text, fontFamily:F.body, fontWeight:500 }}>Vaga {s.row}{s.spotNumber}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:11.5, color:C.textL, fontFamily:F.body }}>sensor: {s.sensorOccupied ? "ocupado" : "livre"}</span>
                    <Pill label={m.lb} color={m.tx} bg={m.bg}/>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* RESERVAS */}
      {!load && view === "res" && (
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {fR.length === 0 && <p style={{ color:C.textL, fontSize:14, fontFamily:F.body }}>Nenhuma reserva encontrada.</p>}
          {fR.map(r => (
            <div key={r._id} style={rowS}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <button onClick={() => setSelU(r.user)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13.5, fontWeight:600, color:C.blue, fontFamily:F.body }}>{r.user?.nomeCompleto || r.user?.email}</button>
                <Badge color={C.purpleD} bg={C.purpleL}>Vaga {r.spotNumber}</Badge>
                <span style={{ fontSize:12.5, color:C.textM, fontFamily:F.body }}>às {r.startTimeStr}</span>
                {r.placa && <Badge color={C.textM} bg={C.dim}>{r.placa}</Badge>}
                {r.status === "paid"      && <Badge color={C.greenD}  bg={C.greenL}>Pago {fmtMoney(r.totalPrice)}</Badge>}
                {r.status === "cancelled" && <Badge color={C.textL}   bg={C.dim}>Cancelado</Badge>}
                {r.status === "no_show"   && <Badge color={C.redD}    bg={C.redL}>No-show</Badge>}
                {r.status === "active"    && <Badge color={C.amberD}  bg={C.amberL}>Em uso</Badge>}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:12, color:C.textL, fontFamily:F.body }}>{fmtDate(r.createdAt)}</span>
                {r.status === "active" && <Btn v="danger" sm onClick={() => cancelRes(r._id)}>Cancelar</Btn>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* USUÁRIOS */}
      {!load && view === "users" && (
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {fU.map(u => (
            <div key={u._id} style={{ ...rowS, cursor:"pointer" }} onClick={() => setSelU(u)}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:9, background:u.isAdmin ? C.navy : u.ativo ? C.soft : C.redL, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:u.isAdmin ? "#fff" : u.ativo ? C.textM : C.red, fontFamily:F.head, flexShrink:0, border:`1px solid ${C.border}` }}>
                  {(u.nomeCompleto?.[0] || u.email[0]).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize:14, fontWeight:600, color:C.text, margin:0, fontFamily:F.body }}>{u.nomeCompleto || u.email}{u.username && <span style={{ fontSize:12, color:C.textL, marginLeft:6 }}>@{u.username}</span>}</p>
                  <p style={{ fontSize:12, color:C.textL, margin:0, fontFamily:F.body }}>{u.email}</p>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                {u.isAdmin  && <Badge color={C.navyM} bg={C.navyL}>Admin</Badge>}
                {!u.ativo   && <Badge color={C.redD}  bg={C.redL}>Inativo</Badge>}
                <span style={{ fontSize:12, color:C.textL, fontFamily:F.body }}>{new Date(u.createdAt).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LOGS */}
      {!load && view === "logs" && (
        <div>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
            <Btn v="danger" sm onClick={clearLogs}>Apagar todos os logs</Btn>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {logs.length === 0 && <p style={{ color:C.textL, fontSize:14, fontFamily:F.body }}>Nenhum log registrado.</p>}
            {logs.map(l => (
              <div key={l._id} style={rowS}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:C.navyL, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:C.navy, fontFamily:F.head, flexShrink:0 }}>{l.email[0].toUpperCase()}</div>
                  <div>
                    <p style={{ fontSize:13.5, fontWeight:600, color:C.text, margin:0, fontFamily:F.body }}>{l.email}</p>
                    <p style={{ fontSize:12.5, color:C.textM, margin:0, fontFamily:F.body }}>{l.action}</p>
                  </div>
                </div>
                <span style={{ fontSize:12, color:C.textL, fontFamily:F.body }}>{fmtDate(l.createdAt)}</span>
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
    { id:"overview", label:"Vagas",    icon:"◈" },
    { id:"reserve",  label:"Reservar", icon:"+" },
    { id:"payment",  label:"Pagar",    icon:"$" },
    { id:"profile",  label:"Conta",    icon:"U" },
    ...(isAdmin ? [{ id:"admin", label:"Admin", icon:"A" }] : []),
  ];
  return (
    <div className="mob-nav" style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:200, background:C.card, borderTop:`1px solid ${C.border}`, alignItems:"stretch", boxShadow:"0 -4px 20px rgba(15,25,41,.08)" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:"10px 4px 8px", border:"none", background:tab === t.id ? C.navyL : "transparent", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, transition:"all .12s", borderTop:tab === t.id ? `2px solid ${C.navy}` : "2px solid transparent", fontFamily:F.body }}>
          <span style={{ fontSize:14, fontWeight:700, color:tab === t.id ? C.navy : C.textL, lineHeight:1 }}>{t.icon}</span>
          <span style={{ fontSize:9.5, fontWeight:600, letterSpacing:.3, color:tab === t.id ? C.navy : C.textL }}>{t.label}</span>
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
    setNtfs(p => [...p, { id, msg, t }]);
    setTimeout(() => setNtfs(p => p.filter(n => n.id !== id)), 4000);
  };

  useEffect(() => {
    api.resCfg().then(c => { CFG = c; setCfg(c); }).catch(() => {});
    const t = localStorage.getItem("omv_token");
    if (!t) { setBoot(false); return; }
    api.me().then(({ user }) => { setUser(user); setScreen("app"); }).catch(() => localStorage.removeItem("omv_token")).finally(() => setBoot(false));
  }, []);

  useEffect(() => {
    const check = async () => { const h = await api.health(); setOnline(h.status === "ok"); };
    check(); const iv = setInterval(check, 30000); return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!user) return;
    loadSpots(); loadRes();
    const iv = setInterval(loadSpots, 5000); return () => clearInterval(iv);
  }, [user]);

  const loadSpots = async () => {
    try {
      const ns = await api.spots();
      if (prev.current.length) {
        ns.forEach(s => {
          const o = prev.current.find(x => x._id === s._id);
          if (o && o.status !== s.status) {
            if (s.status === "occupied" || s.status === "reserved") addN(`Vaga ${s.row}${s.spotNumber} ficou ocupada`, "occ");
            else if (s.status === "available" || s.status === "preferential") addN(`Vaga ${s.row}${s.spotNumber} ficou disponível`, "free");
          }
        });
      }
      prev.current = ns; setSpots(ns);
    } catch {}
  };
  const loadRes = async () => { try { setActive(await api.myRes()); } catch {} };
  const logout  = () => { localStorage.removeItem("omv_token"); setUser(null); setSpots([]); setActive(null); setTab("overview"); setScreen("landing"); };

  if (boot) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{GF + CSS}</style>
      <div style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
        <Spin sz={24}/><p style={{ fontFamily:F.head, fontSize:14, color:C.textL, marginTop:6 }}>Carregando...</p>
      </div>
    </div>
  );

  if (screen === "landing") return <Landing onEnter={() => setScreen("login")}/>;
  if (screen === "login")   return <Login onLogin={u => { setUser(u); setScreen("app"); }} onBack={() => setScreen("landing")}/>;

  const dTabs = [
    { id:"overview", label:"Visão Geral" },
    { id:"reserve",  label:"Reservas"    },
    { id:"payment",  label:"Pagamento"   },
    { id:"profile",  label:"Minha Conta" },
    ...(user.isAdmin ? [{ id:"admin", label:"Admin" }] : []),
  ];
  const titles = { overview:"Visão Geral", reserve:"Reservar Vaga", payment:"Pagamento", profile:"Minha Conta", admin:"Painel Admin" };

  return (
    <div style={{ width:"100%", minHeight:"100vh", background:C.bg, fontFamily:F.body }}>
      <style>{GF + CSS}</style>
      <Notifs items={notifs}/>

      {/* HEADER DESKTOP */}
      <header className="desk-hdr" style={{ background:C.card, borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:100, boxShadow:C.sh }}>
        <div style={{ padding:"0 48px", height:62, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:30, height:30, background:C.navy, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <CarIcon size={15} color="#fff"/>
            </div>
            <span style={{ fontFamily:F.head, fontSize:17, fontWeight:700, color:C.navy }}>OMV</span>
          </div>
          <nav style={{ display:"flex", gap:2 }}>
            {dTabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:"7px 16px", borderRadius:8, border:"none", background:tab === t.id ? C.navyL : "transparent", color:tab === t.id ? C.navy : C.textM, fontSize:13.5, fontWeight:600, cursor:"pointer", fontFamily:F.body, transition:"all .12s", whiteSpace:"nowrap" }}>{t.label}</button>
            ))}
          </nav>
          <div style={{ display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
            <ConnDot on={online}/>
            <div style={{ width:1, height:18, background:C.border }}/>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:13, fontWeight:600, color:C.text, margin:0, fontFamily:F.body }}>{user.nomeCompleto || user.email}</p>
              <p style={{ fontSize:11, color:C.textL, margin:0, fontFamily:F.body }}>{user.isAdmin ? "Administrador" : user.email}</p>
            </div>
            <button onClick={logout} style={{ padding:"6px 14px", borderRadius:8, background:C.soft, color:C.textM, border:`1px solid ${C.border}`, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:F.body }}>Sair</button>
          </div>
        </div>
      </header>

      <main className="pg-wrap" style={{ padding:"28px 48px" }}>
        <h1 className="pg-title" style={{ fontFamily:F.head, fontSize:24, fontWeight:700, color:C.navy, marginBottom:20, letterSpacing:-.3 }}>{titles[tab]}</h1>
        {tab === "overview" && <OverviewTab spots={spots}/>}
        {tab === "reserve"  && <ReserveTab spots={spots} activeRes={active} onReserved={() => { loadSpots(); loadRes(); }} setTab={setTab} cfg={cfg}/>}
        {tab === "payment"  && <PaymentTab activeRes={active} onPaid={() => { loadSpots(); setActive(null); }} cfg={cfg}/>}
        {tab === "profile"  && <ProfileTab user={user} onLogout={logout}/>}
        {tab === "admin" && user.isAdmin && <AdminTab spots={spots} onSpotsUpdate={loadSpots}/>}
      </main>

      <MobileNav tab={tab} setTab={setTab} isAdmin={user.isAdmin}/>
    </div>
  );
}
