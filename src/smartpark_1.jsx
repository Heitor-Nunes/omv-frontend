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
  createReservation: (spotId,str,d,p,m) => request("/reservations", { method:"POST", body:JSON.stringify({ spotId, startTimeStr:str, startDate:d, placa:p, modelo:m }) }),
  payReservation:    (id)               => request(`/reservations/${id}/pay`,    { method:"POST" }),
  cancelReservation: (id)               => request(`/reservations/${id}/cancel`, { method:"POST" }),
  adminUsers:        ()                 => request("/admin/users"),
  adminLogs:         ()                 => request("/admin/logs"),
  adminReservations: ()                 => request("/admin/reservations"),
  adminDashboard:    ()                 => request("/admin/dashboard"),
  toggleUser:        (id)               => request(`/admin/users/${id}/toggle`,        { method:"PATCH" }),
  adminCancelRes:    (id)               => request(`/admin/reservations/${id}/cancel`,  { method:"POST" }),
};

// ─────────────────────────────────────────
// FONTES E CSS GLOBAL
// ─────────────────────────────────────────
const GF = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&display=swap');`;

const CSS = `
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
html, body { width:100%; min-height:100vh; overflow-x:hidden; font-synthesis:none; -webkit-font-smoothing:antialiased; }
#root { width:100%; min-height:100vh; }
body { background:#F2EDE5; }

@keyframes spin    { to { transform:rotate(360deg); } }
@keyframes fadeIn  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
.fade-in  { animation:fadeIn .2s ease both; }
.slide-up { animation:slideUp .25s ease both; }
.skeleton { background:linear-gradient(90deg,#EDE8E0 25%,#F5F0EB 50%,#EDE8E0 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; border-radius:8px; }

::-webkit-scrollbar { width:4px; }
::-webkit-scrollbar-thumb { background:#C9BAA5; border-radius:10px; }

/* ── WIDESCREEN: sem bordas pretas ── */
html, body, #root { margin:0 !important; padding:0 !important; }

/* ── MOBILE NAV: só aparece no mobile ── */
.mobile-nav-bar { display:none; }

@media (max-width:768px) {
  .mobile-nav-bar { display:flex !important; }
  .desktop-header { display:none !important; }
  .main-content   { padding:20px 14px 86px !important; }
  .page-title     { font-size:18px !important; margin-bottom:14px !important; }
  .dash-grid      { grid-template-columns:repeat(2,1fr) !important; gap:8px !important; }
  .form-row       { flex-direction:column !important; }
  .pay-wrap       { width:100% !important; flex:none !important; }
  .pay-layout     { flex-direction:column !important; }
  .profile-grid2  { grid-template-columns:1fr !important; }
  .profile-stats  { grid-template-columns:repeat(2,1fr) !important; }
  .spot-row-wrap  { gap:5px !important; }
  .spot-card-item { min-width:0 !important; flex:1 1 0 !important; }
  .park-section   { flex-direction:column !important; gap:6px !important; }
  .park-via       { width:100% !important; height:16px !important; min-height:0 !important; }
  .park-via-txt   { writing-mode:horizontal-tb !important; }
  .model-btns     { grid-template-columns:repeat(3,1fr) !important; }
  .timer-num      { font-size:36px !important; }
  .pix-card       { flex-direction:column !important; }
}
@media (max-width:420px) {
  .page-title  { font-size:15px !important; }
  .timer-num   { font-size:28px !important; }
  .model-btns  { grid-template-columns:repeat(3,1fr) !important; }
  .dash-grid   { grid-template-columns:1fr 1fr !important; }
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
  shMd:"0 4px 18px rgba(61,43,26,0.09)",
};

const SM = {
  available:    { bg:C.greenBg,  bd:C.green,  car:C.green,  tx:C.greenDark,  lb:"LIVRE"     },
  occupied:     { bg:C.redBg,    bd:C.red,    car:C.red,    tx:C.red,        lb:"OCUPADA"   },
  preferential: { bg:C.amberBg,  bd:C.amber,  car:C.amber,  tx:C.amberDark,  lb:"PREFER."   },
  reserved:     { bg:C.purpleBg, bd:C.purple, car:C.purple, tx:C.purpleDark, lb:"RESERVADA" },
};

const PPH = 80;
const F   = { head:"'Fraunces',serif", body:"'Plus Jakarta Sans',sans-serif" };

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
  <div style={{ width:size, height:size, border:`2px solid ${C.border}`, borderTop:`2px solid ${color}`,
    borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block", flexShrink:0 }}/>
);

const Card = ({ children, style={}, className="" }) => (
  <div className={className} style={{ background:C.bgCard, borderRadius:20, padding:22,
    boxShadow:C.shLg, border:`1px solid ${C.border}`, ...style }}>
    {children}
  </div>
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
  const s = vs[v] || vs.primary;
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

const Inp = ({ value, onChange, placeholder, type="text", onKeyDown, maxLength, readOnly=false }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    onKeyDown={onKeyDown} maxLength={maxLength} readOnly={readOnly}
    style={{ width:"100%", padding:"11px 14px", borderRadius:10,
      border:`1.5px solid ${readOnly?C.bgDark:C.border}`,
      fontSize:14, fontFamily:F.body, background:readOnly?C.bgDark:C.bgSoft,
      outline:"none", color:C.text }}/>
);

const Err = ({ msg }) => msg ? (
  <div style={{ background:C.redBg, border:`1px solid ${C.red}30`, borderRadius:10,
    padding:"10px 14px", marginBottom:14, fontSize:13, color:C.red,
    fontWeight:500, lineHeight:1.5, fontFamily:F.body }}>⚠ {msg}</div>
) : null;

const Bdg = ({ children, color, bg }) => (
  <span style={{ fontSize:11, background:bg, color, borderRadius:20, padding:"3px 11px",
    fontWeight:600, fontFamily:F.body, whiteSpace:"nowrap" }}>{children}</span>
);

const Tag = ({ children, color, bg }) => (
  <span style={{ fontSize:10, background:bg, color, borderRadius:6, padding:"2px 8px",
    fontWeight:700, fontFamily:F.body, whiteSpace:"nowrap", letterSpacing:.3 }}>{children}</span>
);

const Divider = ({ label="" }) => (
  <div style={{ display:"flex", alignItems:"center", gap:12, margin:"16px 0" }}>
    <div style={{ flex:1, height:1, background:C.border }}/>
    {label&&<span style={{ fontSize:10, color:C.textLight, fontFamily:F.body, letterSpacing:.8, textTransform:"uppercase", whiteSpace:"nowrap" }}>{label}</span>}
    <div style={{ flex:1, height:1, background:C.border }}/>
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
  const m   = SM[spot.status] || SM.available;
  const can = clickable && (spot.status==="available"||spot.status==="preferential");
  return (
    <div className="spot-card-item" onClick={can?()=>onClick(spot):undefined} style={{
      background:isSel?m.bd:m.bg, border:`2px solid ${m.bd}`, borderRadius:14,
      padding:"10px 6px 8px", display:"flex", flexDirection:"column",
      alignItems:"center", gap:3, cursor:can?"pointer":"default",
      transition:"all .18s", boxShadow:isSel?`0 6px 20px ${m.bd}55`:C.sh,
      transform:isSel?"scale(1.08)":"scale(1)", flex:"1 1 0",
      minWidth:64, userSelect:"none",
    }}>
      <span style={{ fontSize:9, fontWeight:700, color:isSel?"#fff":m.tx, letterSpacing:.8, fontFamily:F.body }}>
        {spot.row}{spot.spotNumber}
      </span>
      <CarIcon size={26} color={isSel?"#fff":m.car}/>
      <span style={{ fontSize:8, fontWeight:700, color:isSel?"rgba(255,255,255,.85)":m.tx,
        letterSpacing:.4, textTransform:"uppercase", fontFamily:F.body }}>{m.lb}</span>
    </div>
  );
};

// ─────────────────────────────────────────
// PARKING GRID — 12 VAGAS RESPONSIVO
// ─────────────────────────────────────────
const ParkingGrid = ({ spots, selId, onSpotClick, clickable=false }) => {
  const RoadH = ({ label }) => (
    <div style={{ height:22, background:C.bgDark, borderRadius:6, display:"flex",
      alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", width:"100%" }}>
      <div style={{ position:"absolute", top:"50%", left:0, right:0, height:2,
        background:`repeating-linear-gradient(to right,${C.bgSoft} 0,${C.bgSoft} 12px,transparent 12px,transparent 24px)`,
        transform:"translateY(-50%)"}}/>
      <span style={{ fontSize:8, fontWeight:700, color:C.textLight, letterSpacing:2,
        textTransform:"uppercase", position:"relative", fontFamily:F.body }}>{label}</span>
    </div>
  );

  const RowSpots = ({ row }) => (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
        <span style={{ fontSize:9, fontWeight:700, color:C.borderMid, fontFamily:F.body }}>{row}</span>
        <div style={{ flex:1, height:1, background:C.border }}/>
      </div>
      <div className="spot-row-wrap" style={{ display:"flex", gap:6 }}>
        {spots.filter(s=>s.row===row).map(s=>(
          <SpotCard key={s._id} spot={s} isSel={selId===s._id} onClick={onSpotClick} clickable={clickable}/>
        ))}
      </div>
    </div>
  );

  // Via central vertical
  const Via = () => (
    <div className="park-via" style={{ width:28, background:C.bgDark, borderRadius:6,
      display:"flex", alignItems:"center", justifyContent:"center",
      position:"relative", flexShrink:0, minHeight:80 }}>
      <div style={{ position:"absolute", left:"50%", top:0, bottom:0, width:2,
        background:`repeating-linear-gradient(to bottom,${C.bgSoft} 0,${C.bgSoft} 10px,transparent 10px,transparent 20px)`,
        transform:"translateX(-50%)"}}/>
      <span className="park-via-txt" style={{ fontSize:7, fontWeight:700, color:C.textLight,
        textTransform:"uppercase", fontFamily:F.body, writingMode:"vertical-rl", position:"relative" }}>Via</span>
    </div>
  );

  const Block = ({ l, r, ll, rl }) => (
    <div className="park-section" style={{ display:"flex", gap:0, alignItems:"stretch", width:"100%" }}>
      <div style={{ flex:1, background:C.bgSoft, borderRadius:12, padding:"10px 8px", border:`1px solid ${C.border}`, minWidth:0 }}>
        <div style={{ fontSize:8, fontWeight:700, color:C.amberDark, letterSpacing:1,
          textTransform:"uppercase", fontFamily:F.body, marginBottom:7, textAlign:"center" }}>{ll}</div>
        <RowSpots row={l}/>
      </div>
      <Via/>
      <div style={{ flex:1, background:C.bgSoft, borderRadius:12, padding:"10px 8px", border:`1px solid ${C.border}`, minWidth:0 }}>
        <div style={{ fontSize:8, fontWeight:700, color:C.navyMid, letterSpacing:1,
          textTransform:"uppercase", fontFamily:F.body, marginBottom:7, textAlign:"center" }}>{rl}</div>
        <RowSpots row={r}/>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, width:"100%" }}>
      {/* Legenda */}
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
// LOGIN
// ─────────────────────────────────────────
const LoginScreen = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ nomeCompleto:"", username:"", cpf:"", endereco:"", telefone:"", email:"", password:"" });
  const [err, setErr]   = useState("");
  const [load, setLoad] = useState(false);

  const set = k => e => {
    let v = e.target.value;
    if (k==="cpf")      v = fmtCPF(v);
    if (k==="telefone") v = fmtTel(v);
    setForm(p=>({...p,[k]:v})); setErr("");
  };

  const submit = async () => {
    setLoad(true); setErr("");
    try {
      let token, user;
      if (mode==="login") {
        ({ token, user } = await api.login(form.email.trim(), form.password));
      } else {
        if (!form.nomeCompleto||!form.username||!form.cpf||!form.endereco||!form.email||!form.password) {
          setErr("Preencha todos os campos obrigatórios."); setLoad(false); return;
        }
        ({ token, user } = await api.register({ ...form, email:form.email.trim(), username:form.username.trim() }));
      }
      localStorage.setItem("omv_token", token);
      onLogin(user);
    } catch(e) { setErr(e.message); }
    finally { setLoad(false); }
  };

  return (
    <div style={{ minHeight:"100vh", width:"100%", background:C.bg,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      fontFamily:F.body, padding:"24px 16px" }}>
      <style>{GF+CSS}</style>
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ fontFamily:F.head, fontSize:26, fontWeight:700, color:C.navy, marginBottom:4 }}>◈ Estacionamento OMV</div>
        <p style={{ fontSize:13, color:C.textLight }}>Sistema Inteligente de Estacionamento</p>
      </div>
      <div className="slide-up" style={{ background:C.bgCard, borderRadius:24, padding:"34px 30px",
        boxShadow:C.shLg, border:`1px solid ${C.border}`, width:"100%", maxWidth:440 }}>
        <h1 style={{ fontFamily:F.head, fontSize:22, fontWeight:700, color:C.navy, marginBottom:4 }}>
          {mode==="login"?"Bem-vindo de volta":"Criar conta"}
        </h1>
        <p style={{ color:C.textLight, fontSize:13, marginBottom:22 }}>
          {mode==="login"?"Acesse para reservar sua vaga.":"Preencha seus dados para se cadastrar."}
        </p>
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
        <Btn onClick={submit} disabled={load} full style={{ padding:"13px", fontSize:15, marginTop:2 }}>
          {load?<Spin color="#FBF5EE"/>:(mode==="login"?"Entrar":"Criar conta")}
        </Btn>
        <p style={{ textAlign:"center", marginTop:16, fontSize:13, color:C.textLight }}>
          {mode==="login"?"Ainda não tem conta? ":"Já tem conta? "}
          <span onClick={()=>{setMode(mode==="login"?"register":"login");setErr("");}}
            style={{ color:C.navy, fontWeight:600, cursor:"pointer", textDecoration:"underline", textUnderlineOffset:2 }}>
            {mode==="login"?"Cadastre-se":"Entrar"}
          </span>
        </p>
        {mode==="login"&&(
          <div style={{ marginTop:18, background:C.navyLight, borderRadius:12, padding:"12px 14px" }}>
            <p style={{ fontSize:11, color:C.navyMid, fontWeight:700, marginBottom:3, letterSpacing:.8, textTransform:"uppercase" }}>Acesso Admin</p>
            <p style={{ fontSize:12, color:C.textMid, lineHeight:1.8 }}>
              <strong style={{ color:C.navy }}>admin@omv.com</strong> / <strong style={{ color:C.navy }}>admin123</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// TAB: VISÃO GERAL
// ─────────────────────────────────────────
const OverviewTab = ({ spots }) => {
  const avail = spots.filter(s=>s.status==="available").length;
  const occ   = spots.filter(s=>s.status==="occupied"||s.status==="reserved").length;
  const pref  = spots.filter(s=>s.status==="preferential").length;
  const pct   = spots.length ? Math.round((occ/spots.length)*100) : 0;

  return (
    <div>
      {/* Estatísticas */}
      <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
        {[
          { label:"Livres",        value:avail,        color:C.green,   bg:C.greenBg   },
          { label:"Ocupadas",      value:occ,          color:C.red,     bg:C.redBg     },
          { label:"Preferenciais", value:pref,         color:C.amber,   bg:C.amberBg   },
          { label:"Total",         value:spots.length, color:C.navyMid, bg:C.navyLight },
        ].map(p=>(
          <div key={p.label} style={{ background:p.bg, borderRadius:14, padding:"13px 16px",
            border:`1px solid ${p.color}30`, flex:"1 1 0", minWidth:70 }}>
            <div style={{ fontSize:24, fontFamily:F.head, fontWeight:700, color:p.color, lineHeight:1 }}>{p.value}</div>
            <div style={{ fontSize:10, color:p.color, fontWeight:600, marginTop:3, letterSpacing:.5, textTransform:"uppercase", fontFamily:F.body }}>{p.label}</div>
          </div>
        ))}
      </div>

      {/* Barra de ocupação — MELHORIA 1 */}
      <div style={{ background:C.bgCard, borderRadius:14, padding:"14px 18px", marginBottom:18, border:`1px solid ${C.border}`, boxShadow:C.sh }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:12, fontWeight:600, color:C.textMid, fontFamily:F.body }}>Taxa de ocupação</span>
          <span style={{ fontSize:12, fontWeight:700, color:pct>70?C.red:pct>40?C.amber:C.green, fontFamily:F.body }}>{pct}%</span>
        </div>
        <div style={{ height:8, background:C.bgDark, borderRadius:20, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, borderRadius:20, transition:"width .6s ease",
            background:pct>70?C.red:pct>40?C.amber:C.green }}/>
        </div>
        <p style={{ fontSize:11, color:C.textLight, marginTop:6, fontFamily:F.body }}>
          {pct>70?"Estacionamento quase cheio":pct>40?"Ocupação moderada":"Boa disponibilidade de vagas"}
        </p>
      </div>

      <ParkingGrid spots={spots} selId={null} onSpotClick={()=>{}} clickable={false}/>
    </div>
  );
};

// ─────────────────────────────────────────
// TAB: RESERVAS
// ─────────────────────────────────────────
const ReserveTab = ({ spots, activeRes, onReserved, setTab }) => {
  const [sel, setSel]       = useState(null);
  const [date, setDate]     = useState(todayStr());
  const [time, setTime]     = useState(nowTime());
  const [placa, setPlaca]   = useState("");
  const [modelo, setModelo] = useState("");
  const [err, setErr]       = useState("");
  const [load, setLoad]     = useState(false);
  const [step, setStep]     = useState(1);

  const MODELOS = ["HB20","Onix","Gol","Argo","Mobi","Kwid","Creta","T-Cross","Compass","Tracker","Outros"];

  const handleConfirm = async () => {
    if (!time||!date) { setErr("Selecione data e horário."); return; }
    const [y,mo,d] = date.split("-").map(Number);
    const [h,m]    = time.split(":").map(Number);
    let start = new Date(y,mo-1,d,h,m,0,0);
    if (start < new Date()) start = new Date();
    const tStr = `${String(start.getHours()).padStart(2,"0")}:${String(start.getMinutes()).padStart(2,"0")}`;
    const dStr = start.toISOString().split("T")[0];
    setLoad(true); setErr("");
    try {
      await api.createReservation(sel._id, tStr, dStr, placa, modelo);
      onReserved(); setTab("payment");
    } catch(e) { setErr(e.message); }
    finally { setLoad(false); }
  };

  if (activeRes) return (
    <div style={{ maxWidth:460, margin:"0 auto" }}>
      <Card style={{ borderLeft:`4px solid ${C.purple}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
          <div style={{ width:46, height:46, borderRadius:"50%", background:C.purpleBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <CarIcon color={C.purple} size={24}/>
          </div>
          <div>
            <p style={{ fontFamily:F.head, fontWeight:600, fontSize:17, color:C.purpleDark, margin:0 }}>Reserva Ativa</p>
            <p style={{ fontSize:13, color:C.purple, margin:0, fontFamily:F.body }}>Vaga {activeRes.spotNumber} — às {activeRes.startTimeStr}</p>
          </div>
        </div>
        {activeRes.placa&&<p style={{ fontSize:13, color:C.textMid, marginBottom:14, fontFamily:F.body }}>🚗 {activeRes.placa}{activeRes.modelo&&` • ${activeRes.modelo}`}</p>}
        <Btn v="outline" full onClick={()=>setTab("payment")} style={{ borderColor:C.purple, color:C.purpleDark }}>Ir para Pagamento →</Btn>
      </Card>
    </div>
  );

  return (
    <div>
      {step===1 ? (
        <div style={{ display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:1, minWidth:0, maxWidth:"100%" }}>
            <p style={{ fontSize:13, color:C.textLight, marginBottom:12, lineHeight:1.6, fontFamily:F.body }}>
              Toque em uma vaga <span style={{ color:C.green, fontWeight:600 }}>verde</span> ou <span style={{ color:C.amber, fontWeight:600 }}>amarela</span> para selecionar.
            </p>
            <ParkingGrid spots={spots} selId={sel?._id}
              onSpotClick={s=>{setSel(p=>p?._id===s._id?null:s);setErr("");}}
              clickable={true}/>
          </div>
          {sel&&(
            <div className="slide-up" style={{ width:240, flexShrink:0 }}>
              <Card>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, paddingBottom:12, borderBottom:`1px solid ${C.border}` }}>
                  <CarIcon color={C.navy} size={28}/>
                  <div>
                    <p style={{ fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:.8, margin:0, fontFamily:F.body }}>Selecionada</p>
                    <p style={{ fontSize:18, fontFamily:F.head, fontWeight:700, color:C.navy, margin:0 }}>
                      {sel.row}{sel.spotNumber}
                      {sel.status==="preferential"&&<span style={{ fontSize:9, color:C.amberDark, marginLeft:7, background:C.amberBg, padding:"2px 6px", borderRadius:4, fontFamily:F.body }}>PREFER.</span>}
                    </p>
                  </div>
                </div>
                <p style={{ fontSize:12, color:C.textLight, marginBottom:12, fontFamily:F.body }}>R$ {PPH},00 / hora</p>
                <Btn full onClick={()=>setStep(2)} style={{ marginBottom:8 }}>Continuar →</Btn>
                <Btn v="ghost" full onClick={()=>setSel(null)}>Cancelar</Btn>
              </Card>
            </div>
          )}
        </div>
      ) : (
        <div style={{ maxWidth:440, margin:"0 auto" }} className="slide-up">
          <button onClick={()=>setStep(1)} style={{ background:"none", border:"none", cursor:"pointer", color:C.textLight, fontSize:13, fontFamily:F.body, marginBottom:14, display:"flex", alignItems:"center", gap:4 }}>
            ← Voltar ao mapa
          </button>
          <Card>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18, background:C.bg, borderRadius:12, padding:"12px 14px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <CarIcon color={C.navy} size={26}/>
                <div>
                  <p style={{ fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:.8, margin:0, fontFamily:F.body }}>Vaga</p>
                  <p style={{ fontSize:18, fontFamily:F.head, fontWeight:700, color:C.navy, margin:0 }}>{sel?.row}{sel?.spotNumber}</p>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontSize:10, color:C.textLight, margin:0, fontFamily:F.body }}>Valor/hora</p>
                <p style={{ fontSize:16, fontWeight:700, color:C.green, fontFamily:F.head, margin:0 }}>{fmtMoney(PPH)}</p>
              </div>
            </div>

            <Divider label="Quando vai usar?"/>
            <div className="form-row" style={{ display:"flex", gap:10 }}>
              <div style={{ flex:1 }}>
                <Fld label="Data" req>
                  <input type="date" value={date} min={todayStr()} onChange={e=>setDate(e.target.value)}
                    style={{ width:"100%", padding:"11px 12px", borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:F.body, background:C.bgSoft, color:C.text, outline:"none" }}/>
                </Fld>
              </div>
              <div style={{ flex:1 }}>
                <Fld label="Horário" req hint="início">
                  <input type="time" value={time} onChange={e=>setTime(e.target.value)}
                    style={{ width:"100%", padding:"11px 12px", borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:F.body, background:C.bgSoft, color:C.text, outline:"none" }}/>
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
                  <button key={mod} onClick={()=>setModelo(m=>m===mod?"":mod)} style={{
                    padding:"8px 4px", borderRadius:10, textAlign:"center",
                    border:`1.5px solid ${modelo===mod?C.navy:C.border}`,
                    background:modelo===mod?C.navy:"transparent",
                    color:modelo===mod?"#FBF5EE":C.textMid,
                    fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:F.body, transition:"all .15s",
                  }}>{mod}</button>
                ))}
              </div>
            </Fld>

            <Err msg={err}/>
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              <Btn onClick={handleConfirm} disabled={load} full>
                {load?<Spin color="#FBF5EE"/>:"Confirmar Reserva"}
              </Btn>
              <Btn v="ghost" onClick={()=>setStep(1)}>Voltar</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────
// MODAL DE PAGAMENTO SIMULADO — MELHORIA 2
// ─────────────────────────────────────────
const PaymentModal = ({ price, onConfirm, onClose }) => {
  const [method, setMethod] = useState(""); // "pix" | "card" | "demo"
  const [step, setStep]     = useState(1);  // 1=escolha, 2=simulação, 3=processando
  const [card, setCard]     = useState({ num:"", nome:"", val:"", cvv:"" });
  const pixCode = "00020126580014BR.GOV.BCB.PIX0136omv-estacionamento@pix.com520400005303986540" + price.replace(",",".") + "5802BR5920Estacionamento OMV6009SAO PAULO62070503***6304";

  const handlePay = () => {
    setStep(3);
    setTimeout(()=>{ onConfirm(); }, 2200);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(42,31,20,.6)", zIndex:400,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
      <div className="slide-up" style={{ background:C.bgCard, borderRadius:24, padding:28,
        maxWidth:420, width:"100%", boxShadow:C.shLg }} onClick={e=>e.stopPropagation()}>

        {step===3 ? (
          <div style={{ textAlign:"center", padding:"16px 0" }}>
            <Spin size={40} color={C.green}/>
            <p style={{ fontFamily:F.head, fontSize:18, fontWeight:600, color:C.navy, marginTop:16 }}>Processando pagamento...</p>
          </div>
        ) : (
          <>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
              <h2 style={{ fontFamily:F.head, fontSize:18, fontWeight:700, color:C.navy }}>Confirmar Pagamento</h2>
              <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:C.textLight }}>✕</button>
            </div>

            <div style={{ background:C.greenBg, borderRadius:12, padding:"12px 16px", marginBottom:18, textAlign:"center" }}>
              <p style={{ fontSize:11, color:C.greenDark, textTransform:"uppercase", letterSpacing:.8, fontFamily:F.body, margin:0 }}>Total a pagar</p>
              <p style={{ fontSize:28, fontFamily:F.head, fontWeight:700, color:C.green, margin:0 }}>R$ {price}</p>
            </div>

            {step===1 && (
              <>
                <p style={{ fontSize:13, color:C.textMid, marginBottom:14, fontFamily:F.body }}>Escolha a forma de pagamento:</p>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {/* PIX */}
                  <button onClick={()=>{setMethod("pix");setStep(2);}} style={{
                    display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
                    borderRadius:14, border:`2px solid ${C.border}`, background:C.bgSoft,
                    cursor:"pointer", textAlign:"left", transition:"all .15s",
                  }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:C.tealBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:20 }}>⚡</span>
                    </div>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:C.navy, margin:0, fontFamily:F.body }}>PIX</p>
                      <p style={{ fontSize:11, color:C.textLight, margin:0, fontFamily:F.body }}>Aprovação instantânea</p>
                    </div>
                  </button>

                  {/* Cartão */}
                  <button onClick={()=>{setMethod("card");setStep(2);}} style={{
                    display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
                    borderRadius:14, border:`2px solid ${C.border}`, background:C.bgSoft,
                    cursor:"pointer", textAlign:"left", transition:"all .15s",
                  }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:C.purpleBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:20 }}>💳</span>
                    </div>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:C.navy, margin:0, fontFamily:F.body }}>Cartão</p>
                      <p style={{ fontSize:11, color:C.textLight, margin:0, fontFamily:F.body }}>Crédito ou débito</p>
                    </div>
                  </button>

                  {/* DEMO — para apresentação do TCC */}
                  <button onClick={()=>{setMethod("demo");handlePay();}} style={{
                    display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
                    borderRadius:14, border:`2px dashed ${C.amber}`, background:C.amberBg,
                    cursor:"pointer", textAlign:"left", transition:"all .15s",
                  }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:"rgba(160,112,10,.15)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:20 }}>🎓</span>
                    </div>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:C.amberDark, margin:0, fontFamily:F.body }}>Modo Demonstração</p>
                      <p style={{ fontSize:11, color:C.amber, margin:0, fontFamily:F.body }}>Confirma sem pagamento real (TCC)</p>
                    </div>
                  </button>
                </div>
              </>
            )}

            {step===2 && method==="pix" && (
              <div>
                <div style={{ background:C.bgSoft, borderRadius:14, padding:16, marginBottom:16, textAlign:"center" }}>
                  {/* QR Code simulado */}
                  <div style={{ width:140, height:140, margin:"0 auto 12px", background:C.navy, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, padding:8 }}>
                      {Array.from({length:49}).map((_,i)=>(
                        <div key={i} style={{ width:12, height:12, background:Math.random()>.45?"#FBF5EE":"transparent", borderRadius:1 }}/>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize:11, color:C.textLight, fontFamily:F.body, marginBottom:8 }}>QR Code simulado para demonstração</p>
                  <div style={{ background:C.bgCard, borderRadius:8, padding:"8px 12px", fontSize:9, color:C.textLight, fontFamily:"monospace", wordBreak:"break-all", textAlign:"left" }}>
                    {pixCode.slice(0,60)}...
                  </div>
                </div>
                <Btn v="teal" full onClick={handlePay}>✓ Simular Pagamento PIX</Btn>
                <button onClick={()=>setStep(1)} style={{ marginTop:10, background:"none", border:"none", cursor:"pointer", color:C.textLight, fontSize:13, fontFamily:F.body, width:"100%" }}>← Voltar</button>
              </div>
            )}

            {step===2 && method==="card" && (
              <div>
                <Fld label="Número do Cartão">
                  <Inp value={card.num} onChange={e=>setCard(p=>({...p,num:e.target.value.replace(/\D/g,"").slice(0,16).replace(/(\d{4})/g,"$1 ").trim()}))} placeholder="0000 0000 0000 0000" maxLength={19}/>
                </Fld>
                <Fld label="Nome no Cartão">
                  <Inp value={card.nome} onChange={e=>setCard(p=>({...p,nome:e.target.value.toUpperCase()}))} placeholder="JOÃO DA SILVA"/>
                </Fld>
                <div style={{ display:"flex", gap:10 }}>
                  <div style={{ flex:1 }}><Fld label="Validade"><Inp value={card.val} onChange={e=>setCard(p=>({...p,val:e.target.value.replace(/\D/g,"").slice(0,4).replace(/(\d{2})(\d)/,"$1/$2")}))} placeholder="MM/AA" maxLength={5}/></Fld></div>
                  <div style={{ flex:1 }}><Fld label="CVV"><Inp value={card.cvv} onChange={e=>setCard(p=>({...p,cvv:e.target.value.replace(/\D/g,"").slice(0,3)}))} placeholder="000" maxLength={3}/></Fld></div>
                </div>
                <div style={{ background:C.amberBg, borderRadius:10, padding:"8px 12px", marginBottom:14, border:`1px solid ${C.amber}30` }}>
                  <p style={{ fontSize:11, color:C.amberDark, fontFamily:F.body, margin:0 }}>🎓 Modo demonstração — nenhuma cobrança real será feita.</p>
                </div>
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
// TAB: PAGAMENTO
// ─────────────────────────────────────────
const PaymentTab = ({ activeRes, onPaid }) => {
  const [secs, setSecs]         = useState(0);
  const [running, setRunning]   = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paid, setPaid]         = useState(false);
  const [fp, setFp]             = useState(null);
  const [ft, setFt]             = useState(null);
  const [load, setLoad]         = useState(false);
  const iv = useRef(null);

  useEffect(()=>{
    if (!activeRes) return;
    const elapsed = Math.max(0, Math.floor((new Date()-new Date(activeRes.startTime))/1000));
    setSecs(elapsed);
    if (new Date()>=new Date(activeRes.startTime)) setRunning(true);
  },[activeRes?._id]);

  useEffect(()=>{
    clearInterval(iv.current);
    if (running) iv.current=setInterval(()=>setSecs(s=>s+1),1000);
    return ()=>clearInterval(iv.current);
  },[running]);

  const price = ((secs/3600)*PPH).toFixed(2);

  const handlePayConfirm = async () => {
    setLoad(true);
    try {
      const { totalPrice } = await api.payReservation(activeRes._id);
      clearInterval(iv.current);
      setRunning(false); setPaid(true); setShowPayModal(false);
      setFp(totalPrice.toFixed(2)); setFt(fmtTime(secs));
      setTimeout(()=>{ setPaid(false);setFp(null);setFt(null);setSecs(0);onPaid(); },5000);
    } catch(e){ alert(e.message); }
    finally { setLoad(false); }
  };

  if (paid) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:320, textAlign:"center", gap:16 }}>
      <div style={{ width:72, height:72, borderRadius:"50%", background:C.greenBg, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <p style={{ fontFamily:F.head, fontSize:24, fontWeight:700, color:C.green, margin:0 }}>Pagamento Confirmado!</p>
      <p style={{ fontSize:22, fontWeight:700, color:C.greenDark, fontFamily:F.head }}>{fmtMoney(fp)}</p>
      <p style={{ color:C.textLight, fontSize:13, fontFamily:F.body }}>Duração: {ft} — Obrigado!</p>
    </div>
  );

  return (
    <div className="pay-layout" style={{ display:"flex", gap:28, flexWrap:"wrap", alignItems:"flex-start" }}>
      {showPayModal && (
        <PaymentModal
          price={price.replace(".",",")}
          onConfirm={handlePayConfirm}
          onClose={()=>setShowPayModal(false)}
        />
      )}

      <div className="pay-wrap" style={{ flex:"0 0 380px", display:"flex", flexDirection:"column", gap:14 }}>
        {!activeRes ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:260, textAlign:"center", gap:12, padding:20 }}>
            <div style={{ width:60, height:60, borderRadius:"50%", background:C.bgDark, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <CarIcon color={C.borderMid} size={30}/>
            </div>
            <p style={{ fontFamily:F.head, fontSize:18, fontWeight:600, color:C.textLight }}>Nenhuma reserva ativa</p>
            <p style={{ fontSize:13, color:C.textLight, maxWidth:260, lineHeight:1.7, fontFamily:F.body }}>
              Reserve uma vaga na aba <strong style={{ color:C.textMid }}>Reservas</strong> para acompanhar aqui.
            </p>
          </div>
        ) : (
          <>
            {/* Info da vaga */}
            <div style={{ display:"flex", alignItems:"center", gap:14, background:C.purpleBg, borderRadius:16, padding:"14px 18px", border:`1.5px solid ${C.purple}` }}>
              <CarIcon color={C.purple} size={34}/>
              <div>
                <p style={{ fontSize:10, fontWeight:600, color:C.purple, letterSpacing:1.2, textTransform:"uppercase", margin:0, fontFamily:F.body }}>Sua Vaga</p>
                <p style={{ fontFamily:F.head, fontSize:22, fontWeight:700, color:C.purpleDark, margin:0, lineHeight:1.1 }}>
                  {activeRes.spot?.row}{activeRes.spotNumber}
                </p>
                <p style={{ fontSize:12, color:C.purple, margin:0, fontFamily:F.body }}>
                  {activeRes.startTimeStr}{activeRes.placa&&` • ${activeRes.placa}`}{activeRes.modelo&&` • ${activeRes.modelo}`}
                </p>
              </div>
            </div>

            {/* Cronômetro */}
            <div style={{ background:C.navy, borderRadius:18, padding:"20px 24px", textAlign:"center" }}>
              <p style={{ color:"#A89880", fontSize:10, fontWeight:600, letterSpacing:2, textTransform:"uppercase", marginBottom:8, fontFamily:F.body }}>
                {running?"Tempo Decorrido":"Aguardando Horário"}
              </p>
              <p className="timer-num" style={{ fontFamily:F.head, fontSize:44, fontWeight:700, color:"#FBF5EE", letterSpacing:2, lineHeight:1, margin:0 }}>
                {fmtTime(secs)}
              </p>
              {running && (
                <p style={{ color:"#C4AA8A", fontSize:16, fontWeight:600, marginTop:10, fontFamily:F.head }}>
                  {fmtMoney(price)}
                </p>
              )}
              {!running&&<p style={{ color:"#A89880", fontSize:11, marginTop:8, fontFamily:F.body }}>O cronômetro inicia no horário reservado.</p>}
            </div>

            {/* Botão pagar */}
            {running && (
              <Btn v="amber" onClick={()=>setShowPayModal(true)} full style={{ padding:"13px" }}>
                Pagar Reserva — {fmtMoney(price)}
              </Btn>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// TAB: MINHA CONTA — MELHORIA 3
// ─────────────────────────────────────────
const ProfileTab = ({ user, onLogout }) => {
  const [history, setHistory] = useState([]);
  const [load, setLoad]       = useState(true);
  const [activeRes, setActiveRes] = useState(null);
  const cpfFmt = user.cpf ? user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4") : "—";

  useEffect(()=>{
    Promise.all([api.myHistory(), api.myReservation()])
      .then(([h,r])=>{ setHistory(h); setActiveRes(r); })
      .catch(()=>{})
      .finally(()=>setLoad(false));
  },[]);

  const totalGasto = history.reduce((a,r)=>a+(r.totalPrice||0),0);
  const totalSecs  = history.reduce((a,r)=>a+(r.totalSeconds||0),0);

  return (
    <div style={{ maxWidth:680, margin:"0 auto" }}>
      {/* Avatar + info */}
      <div style={{ display:"flex", alignItems:"center", gap:18, marginBottom:20, background:C.bgCard, borderRadius:20, padding:"18px 22px", boxShadow:C.sh, border:`1px solid ${C.border}` }}>
        <div style={{ width:58, height:58, borderRadius:"50%", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:700, color:"#FBF5EE", fontFamily:F.head, flexShrink:0 }}>
          {(user.nomeCompleto?.[0]||user.email[0]).toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontFamily:F.head, fontSize:18, fontWeight:700, color:C.navy, margin:0 }}>{user.nomeCompleto||"—"}</p>
          <p style={{ fontSize:12, color:C.textLight, margin:0, fontFamily:F.body }}>@{user.username||"—"} • {user.email}</p>
        </div>
        <Btn v="ghost" sm onClick={onLogout} style={{ flexShrink:0 }}>Sair</Btn>
      </div>

      {/* Reserva ativa — MELHORIA 4 */}
      {activeRes && (
        <div style={{ background:C.purpleBg, borderRadius:16, padding:"14px 18px", marginBottom:16, border:`1.5px solid ${C.purple}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ animation:"pulse 2s infinite" }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:C.purple }}/>
            </div>
            <p style={{ fontFamily:F.body, fontSize:13, fontWeight:600, color:C.purpleDark, margin:0 }}>
              Reserva ativa — Vaga {activeRes.spotNumber} às {activeRes.startTimeStr}
              {activeRes.placa&&` • ${activeRes.placa}`}
            </p>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="profile-stats" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
        {[
          { label:"Reservas",    value:history.length,       color:C.purple, bg:C.purpleBg },
          { label:"Total gasto", value:fmtMoney(totalGasto), color:C.green,  bg:C.greenBg  },
          { label:"Tempo total", value:fmtTime(totalSecs),   color:C.amber,  bg:C.amberBg  },
        ].map(p=>(
          <div key={p.label} style={{ background:p.bg, borderRadius:14, padding:"12px 14px", border:`1px solid ${p.color}30` }}>
            <div style={{ fontSize:16, fontFamily:F.head, fontWeight:700, color:p.color, lineHeight:1.2, wordBreak:"break-all" }}>{p.value}</div>
            <div style={{ fontSize:10, color:p.color, fontWeight:600, marginTop:4, letterSpacing:.5, textTransform:"uppercase", fontFamily:F.body }}>{p.label}</div>
          </div>
        ))}
      </div>

      {/* Dados pessoais */}
      <Card style={{ marginBottom:14 }}>
        <h3 style={{ fontFamily:F.head, fontSize:15, fontWeight:700, color:C.navy, marginBottom:14 }}>Dados Pessoais</h3>
        <div className="profile-grid2" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
          {[
            ["Nome",      user.nomeCompleto||"—"],
            ["Usuário",   `@${user.username||"—"}`],
            ["Email",     user.email],
            ["CPF",       cpfFmt],
            ["Telefone",  user.telefone||"—"],
            ["Endereço",  user.endereco||"—"],
          ].map(([k,v])=>(
            <div key={k}>
              <p style={{ fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:.8, margin:"0 0 3px", fontFamily:F.body }}>{k}</p>
              <p style={{ fontSize:13, color:C.navy, fontWeight:500, margin:0, fontFamily:F.body, wordBreak:"break-all" }}>{v}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Histórico */}
      <Card>
        <h3 style={{ fontFamily:F.head, fontSize:15, fontWeight:700, color:C.navy, marginBottom:14 }}>Histórico de Pagamentos</h3>
        {load&&<div style={{ display:"flex", justifyContent:"center", padding:"20px 0" }}><Spin/></div>}
        {!load&&history.length===0&&<p style={{ fontSize:13, color:C.textLight, fontFamily:F.body }}>Nenhum pagamento ainda.</p>}
        {!load&&history.map((r,i)=>(
          <div key={r._id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"11px 0", borderBottom:i<history.length-1?`1px solid ${C.border}`:"none", gap:10, flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:C.navyLight, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <CarIcon color={C.navyMid} size={16}/>
              </div>
              <div>
                <p style={{ fontFamily:F.body, fontSize:13, fontWeight:600, color:C.navy, margin:0 }}>Vaga {r.spotNumber}{r.placa&&` • ${r.placa}`}</p>
                <p style={{ fontSize:11, color:C.textLight, margin:0, fontFamily:F.body }}>{fmtDate(r.createdAt)} • {fmtTime(r.totalSeconds||0)}</p>
              </div>
            </div>
            <Bdg color={C.greenDark} bg={C.greenBg}>{fmtMoney(r.totalPrice)}</Bdg>
          </div>
        ))}
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────
// MODAL USUÁRIO (ADMIN)
// ─────────────────────────────────────────
const UserModal = ({ user, onClose, onToggle }) => {
  if (!user) return null;
  const cpf = user.cpf?user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4"):"—";
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(42,31,20,.55)", zIndex:300,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
      <div className="fade-in" style={{ background:C.bgCard, borderRadius:22, padding:26,
        maxWidth:400, width:"100%", boxShadow:C.shLg }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
          <div style={{ width:44, height:44, borderRadius:"50%", background:C.navy, display:"flex",
            alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700,
            color:"#FBF5EE", fontFamily:F.head, flexShrink:0 }}>
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
// TAB: ADMIN
// ─────────────────────────────────────────
const AdminTab = ({ spots }) => {
  const [view, setView]     = useState("dashboard");
  const [dash, setDash]     = useState(null);
  const [logs, setLogs]     = useState([]);
  const [res, setRes]       = useState([]);
  const [users, setUsers]   = useState([]);
  const [load, setLoad]     = useState(false);
  const [selU, setSelU]     = useState(null);
  const [search, setSearch] = useState("");

  const loadView = async v => {
    setLoad(true);
    try {
      if (v==="dashboard")    setDash(await api.adminDashboard());
      if (v==="logs")         setLogs(await api.adminLogs());
      if (v==="reservations") setRes(await api.adminReservations());
      if (v==="users")        setUsers(await api.adminUsers());
    } catch {}
    setLoad(false);
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

  const row = { background:C.bgCard, borderRadius:14, padding:"12px 16px",
    display:"flex", justifyContent:"space-between", alignItems:"center",
    flexWrap:"wrap", gap:7, boxShadow:C.sh, border:`1px solid ${C.border}` };

  const fU = users.filter(u=>!search||(u.email+u.nomeCompleto+u.username).toLowerCase().includes(search.toLowerCase()));
  const fR = res.filter(r=>!search||(r.user?.email+r.user?.nomeCompleto+r.spotNumber).toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <UserModal user={selU} onClose={()=>setSelU(null)} onToggle={toggle}/>

      <div style={{ display:"flex", gap:6, marginBottom:18, flexWrap:"wrap" }}>
        {[["dashboard","Dashboard"],["reservations","Reservas"],["users","Usuários"],["logs","Logs"]].map(([v,l])=>(
          <button key={v} onClick={()=>{setView(v);setSearch("");}} style={{
            padding:"8px 20px", borderRadius:20, background:view===v?C.navy:C.border,
            color:view===v?"#FBF5EE":C.textMid, border:"none", fontSize:13, fontWeight:600,
            cursor:"pointer", fontFamily:F.body, transition:"all .15s",
          }}>{l}</button>
        ))}
      </div>

      {(view==="users"||view==="reservations")&&(
        <div style={{ marginBottom:14 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..."
            style={{ width:"100%", maxWidth:300, padding:"9px 16px", borderRadius:20,
              border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:F.body,
              background:C.bgSoft, color:C.text, outline:"none" }}/>
        </div>
      )}

      {load&&<div style={{ display:"flex", justifyContent:"center", padding:"30px 0" }}><Spin/></div>}

      {/* DASHBOARD */}
      {!load&&view==="dashboard"&&dash&&(
        <div>
          <div className="dash-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
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

          {/* Mapa em tempo real no admin — MELHORIA 5 */}
          <Card style={{ marginBottom:16, padding:18 }}>
            <h3 style={{ fontFamily:F.head, fontSize:14, fontWeight:700, color:C.navy, marginBottom:14 }}>Mapa em Tempo Real</h3>
            <ParkingGrid spots={spots} selId={null} onSpotClick={()=>{}} clickable={false}/>
          </Card>

          {dash.revenueWeek?.length>0&&(
            <Card style={{ padding:18 }}>
              <h3 style={{ fontFamily:F.head, fontSize:14, fontWeight:700, color:C.navy, marginBottom:14 }}>Receita — Últimos 7 dias</h3>
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

      {/* RESERVAS */}
      {!load&&view==="reservations"&&(
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {fR.length===0&&<p style={{ color:C.textLight, fontSize:13, fontFamily:F.body }}>Nenhuma reserva encontrada.</p>}
          {fR.map(r=>(
            <div key={r._id} style={row}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <button onClick={()=>setSelU(r.user)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, fontWeight:600, color:C.navy, fontFamily:F.body, textDecoration:"underline", textUnderlineOffset:2 }}>
                  {r.user?.nomeCompleto||r.user?.email}
                </button>
                <Bdg color={C.purple} bg={C.purpleBg}>Vaga {r.spotNumber}</Bdg>
                <span style={{ fontSize:12, color:C.textMid, fontFamily:F.body }}>às {r.startTimeStr}</span>
                {r.placa&&<Bdg color={C.navyMid} bg={C.navyLight}>{r.placa}</Bdg>}
                {r.status==="paid"
                  ? <Bdg color={C.greenDark} bg={C.greenBg}>Pago {fmtMoney(r.totalPrice)}</Bdg>
                  : r.status==="cancelled"
                    ? <Bdg color={C.red} bg={C.redBg}>Cancelada</Bdg>
                    : <Bdg color={C.amberDark} bg={C.amberBg}>Em uso</Bdg>}
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
                <div style={{ width:36, height:36, borderRadius:"50%",
                  background:u.isAdmin?C.navy:u.ativo?C.border:C.redBg,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:13, fontWeight:700, color:u.isAdmin?"#FBF5EE":u.ativo?C.textMid:C.red,
                  fontFamily:F.head, flexShrink:0 }}>
                  {(u.nomeCompleto?.[0]||u.email[0]).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:C.navy, margin:0, fontFamily:F.body }}>
                    {u.nomeCompleto||u.email}
                    {u.username&&<span style={{ fontSize:11, color:C.textLight, marginLeft:6 }}>@{u.username}</span>}
                  </p>
                  <p style={{ fontSize:11, color:C.textLight, margin:0, fontFamily:F.body }}>{u.email}</p>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                {u.isAdmin&&<Tag color={C.navyMid} bg={C.navyLight}>Admin</Tag>}
                {!u.ativo&&<Tag color={C.red} bg={C.redBg}>Inativo</Tag>}
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
                <div style={{ width:30, height:30, borderRadius:"50%", background:C.navyLight,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11, fontWeight:700, color:C.navy, fontFamily:F.head, flexShrink:0 }}>
                  {log.email[0].toUpperCase()}
                </div>
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
// NAV MOBILE — só aparece no mobile via CSS
// ─────────────────────────────────────────
const MobileNav = ({ tab, setTab, isAdmin }) => {
  const tabs = [
    { id:"overview", icon:"🅿", label:"Vagas"    },
    { id:"reserve",  icon:"＋", label:"Reservar"  },
    { id:"payment",  icon:"⏱", label:"Pagar"     },
    { id:"profile",  icon:"👤", label:"Conta"     },
    ...(isAdmin?[{ id:"admin", icon:"⚙", label:"Admin" }]:[]),
  ];
  return (
    <div className="mobile-nav-bar" style={{
      position:"fixed", bottom:0, left:0, right:0, zIndex:200,
      background:C.bgCard, borderTop:`1px solid ${C.border}`,
      alignItems:"stretch", boxShadow:"0 -4px 20px rgba(61,43,26,0.10)",
    }}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)} style={{
          flex:1, padding:"10px 4px 8px", border:"none",
          background:tab===t.id?C.navyLight:"transparent",
          color:tab===t.id?C.navy:C.textLight,
          cursor:"pointer", display:"flex", flexDirection:"column",
          alignItems:"center", gap:2, transition:"all .15s",
          borderTop:tab===t.id?`2px solid ${C.navy}`:"2px solid transparent",
          fontFamily:F.body,
        }}>
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
  const [user, setUser]           = useState(null);
  const [spots, setSpots]         = useState([]);
  const [activeRes, setActiveRes] = useState(null);
  const [tab, setTab]             = useState("overview");
  const [booting, setBoot]        = useState(true);

  useEffect(()=>{
    const t = localStorage.getItem("omv_token");
    if (!t){ setBoot(false); return; }
    api.me().then(({user})=>setUser(user)).catch(()=>localStorage.removeItem("omv_token")).finally(()=>setBoot(false));
  },[]);

  useEffect(()=>{
    if (!user) return;
    loadSpots(); loadRes();
    const iv = setInterval(loadSpots, 5000);
    return ()=>clearInterval(iv);
  },[user]);

  const loadSpots = async()=>{ try{ setSpots(await api.spots()); }catch{} };
  const loadRes   = async()=>{ try{ setActiveRes(await api.myReservation()); }catch{} };
  const logout    = ()=>{ localStorage.removeItem("omv_token"); setUser(null); setSpots([]); setActiveRes(null); setTab("overview"); };

  if (booting) return (
    <div style={{ minHeight:"100vh", width:"100%", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{GF+CSS}</style>
      <div style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
        <Spin size={26}/>
        <p style={{ fontFamily:F.head, fontSize:14, color:C.textLight, marginTop:4 }}>Carregando...</p>
      </div>
    </div>
  );

  if (!user) return <LoginScreen onLogin={u=>setUser(u)}/>;

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

      {/* HEADER DESKTOP — some no mobile via CSS */}
      <header className="desktop-header" style={{ background:C.bgCard, borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:100, width:"100%" }}>
        <div style={{ width:"100%", padding:"0 48px", height:62, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <div style={{ fontFamily:F.head, fontSize:20, fontWeight:700, color:C.navy, whiteSpace:"nowrap" }}>
            ◈ Estacionamento OMV
          </div>
          <nav style={{ display:"flex", gap:4 }}>
            {desktopTabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                padding:"8px 18px", borderRadius:20, border:"none",
                background:tab===t.id?C.navy:"transparent",
                color:tab===t.id?"#FBF5EE":C.textMid,
                fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:F.body, transition:"all .15s", whiteSpace:"nowrap",
              }}>{t.label}</button>
            ))}
          </nav>
          <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:12, fontWeight:600, color:C.navy, margin:0, fontFamily:F.body }}>{user.nomeCompleto||user.email}</p>
              <p style={{ fontSize:10, color:C.textLight, margin:0, fontFamily:F.body }}>{user.isAdmin?"Administrador":user.email}</p>
            </div>
            <button onClick={logout} style={{ padding:"6px 14px", borderRadius:20, background:C.bgDark, color:C.textMid, border:`1px solid ${C.border}`, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:F.body }}>Sair</button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="main-content" style={{ width:"100%", padding:"30px 48px" }}>
        <h1 className="page-title" style={{ fontFamily:F.head, fontSize:24, fontWeight:700, color:C.navy, marginBottom:20 }}>
          {titles[tab]}
        </h1>
        {tab==="overview" && <OverviewTab spots={spots}/>}
        {tab==="reserve"  && <ReserveTab spots={spots} activeRes={activeRes} onReserved={()=>{loadSpots();loadRes();}} setTab={setTab}/>}
        {tab==="payment"  && <PaymentTab activeRes={activeRes} onPaid={()=>{loadSpots();setActiveRes(null);}}/>}
        {tab==="profile"  && <ProfileTab user={user} onLogout={logout}/>}
        {tab==="admin"&&user.isAdmin&&<AdminTab spots={spots}/>}
      </main>

      {/* NAV MOBILE — controlada por CSS, não por JS */}
      <MobileNav tab={tab} setTab={setTab} isAdmin={user.isAdmin}/>
    </div>
  );
}
