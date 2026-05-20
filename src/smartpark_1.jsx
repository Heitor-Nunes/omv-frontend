import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────
// API — aponta para o backend
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
  register:         (body)           => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login:            (email, pass)    => request("/auth/login",    { method: "POST", body: JSON.stringify({ email, password: pass }) }),
  me:               ()               => request("/auth/me"),
  spots:            ()               => request("/spots"),
  myReservation:    ()               => request("/reservations/mine"),
  myHistory:        ()               => request("/reservations/history"),
  createReservation:(spotId,str,p,m) => request("/reservations", { method: "POST", body: JSON.stringify({ spotId, startTimeStr: str, placa: p, modelo: m }) }),
  payReservation:   (id)             => request(`/reservations/${id}/pay`,    { method: "POST" }),
  cancelReservation:(id)             => request(`/reservations/${id}/cancel`,  { method: "POST" }),
  adminUsers:       ()               => request("/admin/users"),
  adminLogs:        ()               => request("/admin/logs"),
  adminReservations:()               => request("/admin/reservations"),
  adminDashboard:   ()               => request("/admin/dashboard"),
  toggleUser:       (id)             => request(`/admin/users/${id}/toggle`,          { method: "PATCH" }),
  adminCancelRes:   (id)             => request(`/admin/reservations/${id}/cancel`,    { method: "POST" }),
};

// ─────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────
const GF = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 100%; overflow-x: hidden; font-synthesis: none; -webkit-font-smoothing: antialiased; }
@keyframes spin    { to { transform: rotate(360deg); } }
@keyframes fadeIn  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
.fade-in { animation: fadeIn 0.2s ease; }
@media (max-width: 768px) {
  .main-content   { padding: 20px 14px !important; }
  .header-inner   { padding: 0 14px !important; height: auto !important; flex-wrap: wrap; gap: 8px; padding-top: 10px !important; padding-bottom: 10px !important; }
  .header-logo    { font-size: 13px !important; }
  .header-nav     { flex-wrap: wrap; justify-content: center; gap: 2px !important; }
  .header-nav button { padding: 5px 9px !important; font-size: 11px !important; }
  .header-user    { display: none !important; }
  .res-layout     { flex-direction: column !important; }
  .res-panel      { width: 100% !important; }
  .pay-layout     { flex-direction: column !important; }
  .page-title     { font-size: 19px !important; margin-bottom: 16px !important; }
  .dash-grid      { grid-template-columns: repeat(2,1fr) !important; }
  .spot-card      { min-width: 50px !important; }
  .timer-num      { font-size: 30px !important; }
  .login-box      { padding: 26px 18px !important; }
}
@media (max-width: 480px) {
  .spot-card  { min-width: 44px !important; }
  .page-title { font-size: 16px !important; }
  .timer-num  { font-size: 24px !important; }
}
`;

const C = {
  bg:"#F2EDE5", bgCard:"#FBF8F4", bgSoft:"#F7F2EB", bgDark:"#E8DFD1",
  border:"#DDD3C3", borderMid:"#C9BAA5",
  text:"#2A1F14", textMid:"#6B5744", textLight:"#A08B76",
  navy:"#3D2B1A", navyLight:"#F0E8DC", navyMid:"#6B4C30",
  green:"#4A8C5C", greenBg:"#E8F3EC", greenDark:"#2D6640",
  red:"#B05040", redBg:"#F5EAE8",
  amber:"#A0700A", amberBg:"#F5EDD8", amberDark:"#7A5308",
  purple:"#7A5C9A", purpleBg:"#EDE5F5", purpleDark:"#4E3270",
  sh:"0 2px 12px rgba(61,43,26,0.07)",
  shLg:"0 8px 36px rgba(61,43,26,0.10)",
};

const SM = {
  available:    { bg:C.greenBg,  bd:C.green,  car:C.green,  tx:C.greenDark,  lb:"LIVRE"     },
  occupied:     { bg:C.redBg,    bd:C.red,    car:C.red,    tx:C.red,        lb:"OCUPADA"   },
  preferential: { bg:C.amberBg,  bd:C.amber,  car:C.amber,  tx:C.amberDark,  lb:"PREFER."   },
  reserved:     { bg:C.purpleBg, bd:C.purple, car:C.purple, tx:C.purpleDark, lb:"RESERVADA" },
};

const PPH = 80;

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
const fmtCPF   = v => v.replace(/\D/g,"").slice(0,11).replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2");
const fmtTel   = v => v.replace(/\D/g,"").slice(0,11).replace(/(\d{2})(\d)/,"($1) $2").replace(/(\d{5})(\d)/,"$1-$2");
const fmtTime  = s => `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const fmtMoney = v => `R$ ${Number(v).toFixed(2).replace(".",",")}`;
const fmtDate  = d => new Date(d).toLocaleString("pt-BR");

// ─────────────────────────────────────────
// UI BASE
// ─────────────────────────────────────────
const Spin = ({ size=18, color=C.navy }) => (
  <div style={{ width:size, height:size, border:`2px solid ${C.border}`, borderTop:`2px solid ${color}`, borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block", flexShrink:0 }}/>
);

const Card = ({ children, style={} }) => (
  <div style={{ background:C.bgCard, borderRadius:18, padding:24, boxShadow:C.shLg, border:`1px solid ${C.border}`, ...style }}>{children}</div>
);

const Btn = ({ children, onClick, v="primary", disabled=false, sm=false, style={} }) => {
  const vs = { primary:{ background:C.navy, color:"#FBF5EE" }, success:{ background:C.green, color:"#fff" }, ghost:{ background:C.bgDark, color:C.textMid }, amber:{ background:C.amber, color:"#fff" }, danger:{ background:C.red, color:"#fff" } };
  return <button onClick={!disabled?onClick:undefined} style={{ ...vs[v], border:"none", padding:sm?"7px 14px":"11px 20px", borderRadius:9, fontSize:sm?12:14, fontWeight:600, fontFamily:"DM Sans,sans-serif", cursor:disabled?"not-allowed":"pointer", opacity:disabled?.55:1, display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7, ...style }}>{children}</button>;
};

const Fld = ({ label, req=false, children }) => (
  <div style={{ marginBottom:13 }}>
    <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.textMid, marginBottom:5, letterSpacing:.8, textTransform:"uppercase", fontFamily:"DM Sans,sans-serif" }}>{label}{req&&<span style={{ color:C.red, marginLeft:3 }}>*</span>}</label>
    {children}
  </div>
);

const Inp = ({ value, onChange, placeholder, type="text", onKeyDown }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown}
    style={{ width:"100%", padding:"10px 13px", borderRadius:9, border:`1.5px solid ${C.border}`, fontSize:14, fontFamily:"DM Sans,sans-serif", background:C.bgSoft, outline:"none", color:C.text }}/>
);

const Err = ({ msg }) => msg ? <div style={{ background:C.redBg, border:`1px solid ${C.red}30`, borderRadius:9, padding:"9px 13px", marginBottom:13, fontSize:12.5, color:C.red, fontWeight:500, lineHeight:1.5 }}>{msg}</div> : null;

const Bdg = ({ children, color, bg }) => <span style={{ fontSize:11, background:bg, color, borderRadius:6, padding:"3px 9px", fontWeight:600, fontFamily:"DM Sans,sans-serif", whiteSpace:"nowrap" }}>{children}</span>;

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
    <rect x="14" y="19" width="12" height="8"  rx="2" fill="white"  opacity=".28"/>
  </svg>
);

// ─────────────────────────────────────────
// SPOT CARD
// ─────────────────────────────────────────
const SpotCard = ({ spot, isSel, onClick, clickable }) => {
  const m = SM[spot.status] || SM.available;
  const can = clickable && (spot.status==="available"||spot.status==="preferential");
  return (
    <div className="spot-card" onClick={can?()=>onClick(spot):undefined}
      style={{ background:isSel?m.bd:m.bg, border:`2px solid ${m.bd}`, borderRadius:11, padding:"8px 6px 6px", display:"flex", flexDirection:"column", alignItems:"center", gap:2, cursor:can?"pointer":"default", transition:"all .18s ease", boxShadow:isSel?`0 4px 16px ${m.bd}55`:C.sh, transform:isSel?"scale(1.06)":"scale(1)", minWidth:66, userSelect:"none" }}>
      <span style={{ fontSize:9, fontWeight:700, color:isSel?"#fff":m.tx, letterSpacing:1, fontFamily:"Syne,sans-serif" }}>{spot.row}{spot.spotNumber}</span>
      <CarIcon size={26} color={isSel?"#fff":m.car}/>
      <span style={{ fontSize:8, fontWeight:600, color:isSel?"rgba(255,255,255,.85)":m.tx, letterSpacing:.4, textTransform:"uppercase", fontFamily:"DM Sans,sans-serif" }}>{m.lb}</span>
    </div>
  );
};

// ─────────────────────────────────────────
// PARKING GRID
// ─────────────────────────────────────────
const ParkingGrid = ({ spots, selId, onSpotClick, clickable=false }) => {
  const RoadH = ({ label }) => (
    <div style={{ height:28, background:C.bgDark, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", width:"100%" }}>
      <div style={{ position:"absolute", top:"50%", left:0, right:0, height:2, background:`repeating-linear-gradient(to right,${C.bgSoft} 0,${C.bgSoft} 14px,transparent 14px,transparent 28px)`, transform:"translateY(-50%)"}}/>
      <span style={{ fontSize:9, fontWeight:700, color:C.textLight, letterSpacing:2.5, textTransform:"uppercase", position:"relative", fontFamily:"DM Sans,sans-serif" }}>{label}</span>
    </div>
  );
  const Row = ({ row }) => (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4 }}>
        <span style={{ fontSize:9, fontWeight:700, color:C.borderMid, letterSpacing:1.5, fontFamily:"Syne,sans-serif" }}>{row}</span>
        <div style={{ flex:1, height:1, background:C.border }}/>
      </div>
      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
        {spots.filter(s=>s.row===row).map(s=><SpotCard key={s._id} spot={s} isSel={selId===s._id} onClick={onSpotClick} clickable={clickable}/>)}
      </div>
    </div>
  );
  const Via = () => (
    <div style={{ width:44, background:C.bgDark, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", flexShrink:0 }}>
      <div style={{ position:"absolute", left:"50%", top:0, bottom:0, width:2, background:`repeating-linear-gradient(to bottom,${C.bgSoft} 0,${C.bgSoft} 14px,transparent 14px,transparent 28px)`, transform:"translateX(-50%)"}}/>
      <span style={{ fontSize:8, fontWeight:700, color:C.textLight, letterSpacing:1.5, textTransform:"uppercase", fontFamily:"DM Sans,sans-serif", writingMode:"vertical-rl", position:"relative" }}>Via Central</span>
    </div>
  );
  const Block = ({ left, right, labelL, labelR }) => (
    <div style={{ display:"flex", gap:0, alignItems:"stretch" }}>
      <div style={{ flex:1, background:C.bgSoft, borderRadius:10, padding:10, border:`1px solid ${C.border}` }}>
        <div style={{ fontSize:9, fontWeight:700, color:C.amberDark, letterSpacing:1.5, textTransform:"uppercase", fontFamily:"DM Sans,sans-serif", marginBottom:6, textAlign:"center" }}>{labelL}</div>
        <Row row={left}/>
      </div>
      <Via/>
      <div style={{ flex:1, background:C.bgSoft, borderRadius:10, padding:10, border:`1px solid ${C.border}` }}>
        <div style={{ fontSize:9, fontWeight:700, color:C.navyMid, letterSpacing:1.5, textTransform:"uppercase", fontFamily:"DM Sans,sans-serif", marginBottom:6, textAlign:"center" }}>{labelR}</div>
        <Row row={right}/>
      </div>
    </div>
  );
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <div style={{ display:"flex", gap:14, marginBottom:10, flexWrap:"wrap" }}>
        {Object.entries(SM).map(([k,m])=>(
          <div key={k} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:m.bd }}/>
            <span style={{ fontSize:11, color:C.textMid, fontWeight:500, fontFamily:"DM Sans,sans-serif" }}>
              {k==="available"?"Disponível":k==="occupied"?"Ocupada":k==="preferential"?"Preferencial":"Reservada"}
            </span>
          </div>
        ))}
      </div>
      <RoadH label="Rua Principal — Entrada"/>
      <Block left="A" right="C" labelL="← Avenida A" labelR="Avenida C →"/>
      <RoadH label="Rua Separadora"/>
      <Block left="B" right="D" labelL="← Avenida B" labelR="Avenida D →"/>
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
    <div style={{ minHeight:"100vh", width:"100%", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"DM Sans,sans-serif", padding:"24px 16px" }}>
      <style>{GF+CSS}</style>
      <div style={{ textAlign:"center", marginBottom:26 }}>
        <div style={{ fontFamily:"Syne,sans-serif", fontSize:22, fontWeight:800, color:C.navy, marginBottom:4 }}>◈ Estacionamento OMV</div>
        <p style={{ fontSize:13, color:C.textLight }}>Sistema Inteligente de Estacionamento</p>
      </div>
      <div className="login-box" style={{ background:C.bgCard, borderRadius:20, padding:"34px 30px", boxShadow:C.shLg, border:`1px solid ${C.border}`, width:"100%", maxWidth:440 }}>
        <h1 style={{ fontFamily:"Syne,sans-serif", fontSize:21, fontWeight:700, color:C.navy, marginBottom:4 }}>{mode==="login"?"Bem-vindo de volta":"Criar conta"}</h1>
        <p style={{ color:C.textLight, fontSize:13, marginBottom:22 }}>{mode==="login"?"Acesse para reservar e monitorar sua vaga.":"Preencha seus dados cadastrais."}</p>
        {mode==="register"&&<>
          <Fld label="Nome Completo" req><Inp value={form.nomeCompleto} onChange={set("nomeCompleto")} placeholder="João da Silva"/></Fld>
          <Fld label="Nome de Usuário" req><Inp value={form.username} onChange={set("username")} placeholder="joaosilva"/></Fld>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}><Fld label="CPF" req><Inp value={form.cpf} onChange={set("cpf")} placeholder="000.000.000-00"/></Fld></div>
            <div style={{ flex:1 }}><Fld label="Telefone"><Inp value={form.telefone} onChange={set("telefone")} placeholder="(11) 99999-0000"/></Fld></div>
          </div>
          <Fld label="Endereço" req><Inp value={form.endereco} onChange={set("endereco")} placeholder="Rua das Flores, 123 — SP"/></Fld>
        </>}
        <Fld label="Email" req><Inp value={form.email} onChange={set("email")} placeholder="seu@email.com" onKeyDown={e=>e.key==="Enter"&&submit()}/></Fld>
        <Fld label="Senha" req><Inp type="password" value={form.password} onChange={set("password")} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()}/></Fld>
        <Err msg={err}/>
        <Btn onClick={submit} disabled={load} style={{ width:"100%", padding:"12px", fontSize:15, marginTop:2 }}>
          {load?<Spin color="#FBF5EE"/>:(mode==="login"?"Entrar":"Cadastrar")}
        </Btn>
        <p style={{ textAlign:"center", marginTop:16, fontSize:13, color:C.textLight }}>
          {mode==="login"?"Ainda não tem conta? ":"Já tem conta? "}
          <span onClick={()=>{setMode(mode==="login"?"register":"login");setErr("");}} style={{ color:C.navy, fontWeight:600, cursor:"pointer", textDecoration:"underline", textUnderlineOffset:2 }}>
            {mode==="login"?"Cadastre-se":"Entrar"}
          </span>
        </p>
        {mode==="login"&&(
          <div style={{ marginTop:18, background:C.navyLight, borderRadius:10, padding:"12px 14px" }}>
            <p style={{ fontSize:11, color:C.navyMid, fontWeight:700, marginBottom:3, letterSpacing:.8, textTransform:"uppercase" }}>Acesso Administrador</p>
            <p style={{ fontSize:12, color:C.textMid, lineHeight:1.8 }}>Email: <strong style={{ color:C.navy }}>admin@omv.com</strong><br/>Senha: <strong style={{ color:C.navy }}>admin123</strong></p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// TAB VISÃO GERAL
// ─────────────────────────────────────────
const OverviewTab = ({ spots }) => {
  const avail = spots.filter(s=>s.status==="available").length;
  const occ   = spots.filter(s=>s.status==="occupied"||s.status==="reserved").length;
  const pref  = spots.filter(s=>s.status==="preferential").length;
  const Pill  = ({label,value,color,bg})=>(
    <div style={{ background:bg, borderRadius:12, padding:"13px 18px", border:`1px solid ${color}30` }}>
      <div style={{ fontSize:26, fontFamily:"Syne,sans-serif", fontWeight:700, color, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:10, color, fontWeight:600, marginTop:3, letterSpacing:.5, textTransform:"uppercase" }}>{label}</div>
    </div>
  );
  return (
    <div>
      <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap" }}>
        <Pill label="Livres"        value={avail}        color={C.green}   bg={C.greenBg}/>
        <Pill label="Ocupadas"      value={occ}          color={C.red}     bg={C.redBg}/>
        <Pill label="Preferenciais" value={pref}         color={C.amber}   bg={C.amberBg}/>
        <Pill label="Total"         value={spots.length} color={C.navyMid} bg={C.navyLight}/>
      </div>
      <ParkingGrid spots={spots} selId={null} onSpotClick={()=>{}} clickable={false}/>
    </div>
  );
};

// ─────────────────────────────────────────
// TAB RESERVAS
// ─────────────────────────────────────────
const ReserveTab = ({ spots, activeRes, onReserved, setTab }) => {
  const [sel, setSel]       = useState(null);
  const [time, setTime]     = useState("");
  const [placa, setPlaca]   = useState("");
  const [modelo, setModelo] = useState("");
  const [err, setErr]       = useState("");
  const [load, setLoad]     = useState(false);
  const [flash, setFlash]   = useState(false);

  const confirm = async () => {
    if (!time) { setErr("Selecione um horário."); return; }
    setLoad(true); setErr("");
    try {
      await api.createReservation(sel._id, time, placa.toUpperCase(), modelo);
      setFlash(true);
      setTimeout(()=>{ setFlash(false); onReserved(); setTab("payment"); }, 1400);
    } catch(e) { setErr(e.message); }
    finally { setLoad(false); }
  };

  return (
    <div className="res-layout" style={{ display:"flex", gap:32, alignItems:"flex-start", flexWrap:"wrap" }}>
      <div style={{ flex:1, minWidth:280 }}>
        <ParkingGrid spots={spots} selId={sel?._id}
          onSpotClick={s=>{ if(!activeRes){setSel(p=>p?._id===s._id?null:s);setErr("");} }}
          clickable={!activeRes}/>
      </div>
      <div className="res-panel" style={{ width:285, flexShrink:0 }}>
        {activeRes?(
          <div style={{ background:C.purpleBg, borderRadius:16, padding:22, border:`2px solid ${C.purple}` }}>
            <p style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:18, color:C.purpleDark, marginBottom:10 }}>Reserva Ativa</p>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
              <CarIcon color={C.purple} size={34}/>
              <div>
                <p style={{ fontSize:20, fontFamily:"Syne,sans-serif", fontWeight:700, color:C.purpleDark, margin:0 }}>Vaga {activeRes.spotNumber}</p>
                <p style={{ fontSize:12, color:C.purple, margin:0 }}>Às {activeRes.startTimeStr}</p>
                {activeRes.placa&&<p style={{ fontSize:12, color:C.purple, margin:0 }}>Placa: <strong>{activeRes.placa}</strong></p>}
              </div>
            </div>
            <p style={{ fontSize:12.5, color:C.purple, lineHeight:1.6 }}>Acesse a aba <strong>Pagamento</strong> para monitorar e encerrar.</p>
          </div>
        ):(
          <Card>
            {!sel?(
              <>
                <p style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:20, color:C.navy, marginBottom:10 }}>Reserve sua Vaga</p>
                <p style={{ fontSize:13, color:C.textLight, lineHeight:1.7 }}>Clique em uma vaga <span style={{ color:C.green, fontWeight:600 }}>verde</span> ou <span style={{ color:C.amber, fontWeight:600 }}>amarela</span> no mapa.</p>
                <div style={{ marginTop:14, background:C.bg, borderRadius:9, padding:"11px 13px" }}>
                  <p style={{ fontSize:12, color:C.textLight, lineHeight:1.8 }}><strong style={{ color:C.textMid }}>Valor:</strong> {fmtMoney(PPH)} / hora</p>
                </div>
              </>
            ):(
              <>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                  <CarIcon color={C.navy} size={30}/>
                  <div>
                    <p style={{ fontSize:10, fontWeight:600, color:C.textLight, letterSpacing:.8, textTransform:"uppercase", margin:0 }}>Selecionada</p>
                    <p style={{ fontSize:20, fontFamily:"Syne,sans-serif", fontWeight:700, color:C.navy, margin:0 }}>
                      {sel.row}{sel.spotNumber}
                      {sel.status==="preferential"&&<span style={{ fontSize:9, color:C.amberDark, fontWeight:600, marginLeft:7, background:C.amberBg, padding:"2px 6px", borderRadius:4 }}>PREFERENCIAL</span>}
                    </p>
                  </div>
                </div>
                <p style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:15, color:C.navy, marginBottom:13 }}>Confirmar Reserva?</p>
                <Fld label="Horário *">
                  <input type="time" value={time} onChange={e=>{setTime(e.target.value);setErr("");}}
                    style={{ width:"100%", padding:"10px 13px", borderRadius:9, border:`1.5px solid ${C.border}`, fontSize:14, fontFamily:"DM Sans,sans-serif", background:C.bgSoft, color:C.text, outline:"none" }}/>
                </Fld>
                <div style={{ display:"flex", gap:8 }}>
                  <div style={{ flex:1 }}><Fld label="Placa"><Inp value={placa} onChange={e=>setPlaca(e.target.value)} placeholder="ABC-1234"/></Fld></div>
                  <div style={{ flex:1 }}><Fld label="Modelo"><Inp value={modelo} onChange={e=>setModelo(e.target.value)} placeholder="HB20"/></Fld></div>
                </div>
                <Err msg={err}/>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  <Btn onClick={confirm} disabled={load} style={{ width:"100%" }}>{load?<Spin color="#FBF5EE"/>:"Confirmar"}</Btn>
                  <Btn v="ghost" onClick={()=>{setSel(null);setTime("");setErr("");}} style={{ width:"100%" }}>Cancelar</Btn>
                </div>
              </>
            )}
            {flash&&<div style={{ marginTop:12, background:C.greenBg, borderRadius:8, padding:"9px 13px", fontSize:13, color:C.greenDark, fontWeight:600 }}>✓ Reserva confirmada!</div>}
          </Card>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// TAB PAGAMENTO
// ─────────────────────────────────────────
const PaymentTab = ({ activeRes, onPaid }) => {
  const [secs, setSecs]         = useState(0);
  const [running, setRunning]   = useState(false);
  const [confirm, setConfirm]   = useState(false);
  const [paid, setPaid]         = useState(false);
  const [fp, setFp]             = useState(null);
  const [ft, setFt]             = useState(null);
  const [load, setLoad]         = useState(false);
  const [history, setHistory]   = useState([]);
  const iv = useRef(null);

  useEffect(()=>{
    api.myHistory().then(setHistory).catch(()=>{});
  },[paid]);

  useEffect(()=>{
    if (!activeRes) return;
    const elapsed = Math.max(0, Math.floor((new Date()-new Date(activeRes.startTime))/1000));
    setSecs(elapsed);
    if (new Date()>=new Date(activeRes.startTime)) setRunning(true);
    setConfirm(false);
  },[activeRes?._id]);

  useEffect(()=>{
    clearInterval(iv.current);
    if (running&&!confirm) iv.current=setInterval(()=>setSecs(s=>s+1),1000);
    return ()=>clearInterval(iv.current);
  },[running,confirm]);

  const price = ((secs/3600)*PPH).toFixed(2);

  const reqPay = ()=>{ clearInterval(iv.current); setConfirm(true); };

  const doPay = async ()=>{
    setLoad(true);
    try {
      const { totalPrice } = await api.payReservation(activeRes._id);
      setRunning(false); setPaid(true); setFp(totalPrice.toFixed(2)); setFt(fmtTime(secs));
      setTimeout(()=>{ setPaid(false);setFp(null);setFt(null);setSecs(0);setConfirm(false);onPaid(); },5000);
    } catch(e){ alert(e.message); }
    finally { setLoad(false); }
  };

  if (paid) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:320, textAlign:"center", gap:14 }}>
      <div style={{ width:60, height:60, borderRadius:"50%", background:C.greenBg, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <p style={{ fontFamily:"Syne,sans-serif", fontSize:24, fontWeight:700, color:C.green, margin:0 }}>Pagamento Confirmado!</p>
      <p style={{ fontSize:20, fontWeight:700, color:C.greenDark, fontFamily:"Syne,sans-serif" }}>{fmtMoney(fp)}</p>
      <p style={{ color:C.textLight, fontSize:13 }}>Duração: {ft} — Obrigado por usar o Estacionamento OMV!</p>
    </div>
  );

  return (
    <div style={{ display:"flex", gap:36, flexWrap:"wrap", alignItems:"flex-start" }}>
      <div className="pay-layout" style={{ flex:"0 0 420px", display:"flex", flexDirection:"column", gap:16 }}>
        {!activeRes?(
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:240, textAlign:"center", gap:12 }}>
            <CarIcon color={C.borderMid} size={44}/>
            <p style={{ fontFamily:"Syne,sans-serif", fontSize:18, fontWeight:600, color:C.textLight }}>Reserve uma Vaga e Pague Aqui</p>
            <p style={{ fontSize:13, color:C.textLight, maxWidth:280, lineHeight:1.7 }}>Faça uma reserva na aba <strong style={{ color:C.textMid }}>Reservas</strong> para monitorar e pagar.</p>
          </div>
        ):(
          <>
            <div style={{ display:"flex", alignItems:"center", gap:16, background:C.purpleBg, borderRadius:14, padding:"14px 22px", border:`1.5px solid ${C.purple}` }}>
              <CarIcon color={C.purple} size={38}/>
              <div>
                <p style={{ fontSize:10, fontWeight:600, color:C.purple, letterSpacing:1.2, textTransform:"uppercase", margin:0 }}>Sua Vaga</p>
                <p style={{ fontFamily:"Syne,sans-serif", fontSize:24, fontWeight:700, color:C.purpleDark, margin:0, lineHeight:1.1 }}>{activeRes.spot?.row}{activeRes.spotNumber}</p>
                <p style={{ fontSize:12, color:C.purple, margin:0 }}>Às {activeRes.startTimeStr}{activeRes.placa&&` • ${activeRes.placa}`}{activeRes.modelo&&` • ${activeRes.modelo}`}</p>
              </div>
            </div>
            <div style={{ background:C.navy, borderRadius:16, padding:"18px 24px", textAlign:"center" }}>
              <p style={{ color:"#A89880", fontSize:10, fontWeight:600, letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>
                {running?(confirm?"Tempo da Reserva":"Tempo Decorrido"):"Aguardando Horário"}
              </p>
              <p className="timer-num" style={{ fontFamily:"Syne,sans-serif", fontSize:40, fontWeight:700, color:"#FBF5EE", letterSpacing:2, lineHeight:1, margin:0 }}>{fmtTime(secs)}</p>
              {!running&&<p style={{ color:"#A89880", fontSize:11, marginTop:6 }}>O cronômetro inicia no horário da reserva.</p>}
            </div>
            {running&&!confirm&&<Btn v="amber" onClick={reqPay} style={{ width:"100%", padding:"12px", fontSize:14 }}>Pagar a Reserva</Btn>}
            {confirm&&(
              <Card style={{ padding:"18px 20px" }}>
                <p style={{ fontFamily:"Syne,sans-serif", fontSize:15, fontWeight:700, color:C.navy, marginBottom:12 }}>Resumo da Reserva</p>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:13, color:C.textMid }}>Duração</span>
                  <span style={{ fontSize:13, fontWeight:600, color:C.navy }}>{fmtTime(secs)}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderTop:`1px solid ${C.border}`, marginBottom:14 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:C.navy }}>Total</span>
                  <span style={{ fontSize:18, fontWeight:700, color:C.green, fontFamily:"Syne,sans-serif" }}>{fmtMoney(price)}</span>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <Btn v="success" onClick={doPay} disabled={load} style={{ flex:1 }}>{load?<Spin color="#fff"/>:"Confirmar Pagamento"}</Btn>
                  <Btn v="ghost" onClick={()=>{setConfirm(false);setRunning(true);}} style={{ flex:1 }}>Voltar</Btn>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
      <div style={{ flex:1, minWidth:240 }}>
        <h3 style={{ fontFamily:"Syne,sans-serif", fontSize:15, fontWeight:700, color:C.navy, marginBottom:14 }}>Seu Histórico</h3>
        {history.length===0?<p style={{ fontSize:13, color:C.textLight }}>Nenhuma reserva paga ainda.</p>:(
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {history.map(r=>(
              <div key={r._id} style={{ background:C.bgCard, borderRadius:11, padding:"12px 16px", border:`1px solid ${C.border}`, boxShadow:C.sh }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <span style={{ fontFamily:"Syne,sans-serif", fontSize:15, fontWeight:700, color:C.navy }}>Vaga {r.spotNumber}</span>
                  <Bdg color={C.greenDark} bg={C.greenBg}>{fmtMoney(r.totalPrice)}</Bdg>
                </div>
                <p style={{ fontSize:11, color:C.textLight, margin:0 }}>{fmtDate(r.createdAt)} • {fmtTime(r.totalSeconds||0)}{r.placa&&` • ${r.placa}`}</p>
              </div>
            ))}
            <div style={{ background:C.navyLight, borderRadius:10, padding:"10px 14px", marginTop:4 }}>
              <p style={{ fontSize:12, color:C.navyMid, fontWeight:600 }}>Total gasto: <strong style={{ fontFamily:"Syne,sans-serif" }}>{fmtMoney(history.reduce((a,r)=>a+(r.totalPrice||0),0))}</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// MODAL USUÁRIO
// ─────────────────────────────────────────
const UserModal = ({ user, onClose, onToggle }) => {
  if (!user) return null;
  const cpf = user.cpf ? user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4") : "—";
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(42,31,20,.5)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
      <div className="fade-in" style={{ background:C.bgCard, borderRadius:20, padding:28, maxWidth:400, width:"100%", boxShadow:C.shLg }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
          <div style={{ width:46, height:46, borderRadius:"50%", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, fontWeight:700, color:"#FBF5EE", fontFamily:"Syne,sans-serif", flexShrink:0 }}>
            {(user.nomeCompleto?.[0]||user.email[0]).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize:16, fontWeight:700, color:C.navy, margin:0, fontFamily:"Syne,sans-serif" }}>{user.nomeCompleto||"—"}</p>
            <p style={{ fontSize:12, color:C.textLight, margin:0 }}>@{user.username||"—"} • {user.isAdmin?"Administrador":"Usuário"}</p>
          </div>
        </div>
        {[["Email",user.email],["CPF",cpf],["Endereço",user.endereco||"—"],["Telefone",user.telefone||"—"],["Reservas",user.totalReservas||0],["Total Gasto",fmtMoney(user.totalGasto||0)],["Cadastro",new Date(user.createdAt).toLocaleDateString("pt-BR")],["Status",user.ativo?"Ativo":"Desativado"]].map(([k,v])=>(
          <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
            <span style={{ fontSize:12, color:C.textLight }}>{k}</span>
            <span style={{ fontSize:13, fontWeight:600, color:k==="Status"?(user.ativo?C.green:C.red):C.navy, textAlign:"right", maxWidth:"65%" }}>{String(v)}</span>
          </div>
        ))}
        <div style={{ display:"flex", gap:9, marginTop:18 }}>
          {!user.isAdmin&&onToggle&&<Btn v={user.ativo?"danger":"success"} sm onClick={()=>onToggle(user._id)} style={{ flex:1 }}>{user.ativo?"Desativar":"Reativar"}</Btn>}
          <Btn v="ghost" onClick={onClose} style={{ flex:1 }}>Fechar</Btn>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// TAB ADMIN
// ─────────────────────────────────────────
const AdminTab = () => {
  const [view, setView]     = useState("dashboard");
  const [dash, setDash]     = useState(null);
  const [logs, setLogs]     = useState([]);
  const [res, setRes]       = useState([]);
  const [users, setUsers]   = useState([]);
  const [load, setLoad]     = useState(false);
  const [selU, setSelU]     = useState(null);
  const [search, setSearch] = useState("");

  const load_ = async v => {
    setLoad(true);
    try {
      if (v==="dashboard")    setDash(await api.adminDashboard());
      if (v==="logs")         setLogs(await api.adminLogs());
      if (v==="reservations") setRes(await api.adminReservations());
      if (v==="users")        setUsers(await api.adminUsers());
    } catch {}
    setLoad(false);
  };

  useEffect(()=>{ load_(view); },[view]);

  const toggle = async uid => {
    await api.toggleUser(uid);
    const updated = await api.adminUsers();
    setUsers(updated);
    if (selU) setSelU(updated.find(u=>u._id===selU._id)||null);
  };

  const cancelRes = async rid => {
    if (!window.confirm("Cancelar esta reserva?")) return;
    await api.adminCancelRes(rid);
    load_("reservations");
  };

  const row = { background:C.bgCard, borderRadius:11, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:7, boxShadow:C.sh, border:`1px solid ${C.border}` };
  const fU  = users.filter(u=>!search||(u.email+u.nomeCompleto+u.username).toLowerCase().includes(search.toLowerCase()));
  const fR  = res.filter(r=>!search||(r.user?.email+r.user?.nomeCompleto+r.spotNumber).toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <UserModal user={selU} onClose={()=>setSelU(null)} onToggle={toggle}/>
      <div style={{ display:"flex", gap:7, marginBottom:22, flexWrap:"wrap" }}>
        {[["dashboard","Dashboard"],["reservations","Reservas"],["users","Usuários"],["logs","Logs"]].map(([v,l])=>(
          <button key={v} onClick={()=>{setView(v);setSearch("");}} style={{ padding:"8px 18px", borderRadius:9, background:view===v?C.navy:C.border, color:view===v?"#FBF5EE":C.textMid, border:"none", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"DM Sans,sans-serif" }}>{l}</button>
        ))}
      </div>
      {(view==="users"||view==="reservations")&&(
        <div style={{ marginBottom:16 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." style={{ width:"100%", maxWidth:340, padding:"9px 13px", borderRadius:9, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:"DM Sans,sans-serif", background:C.bgSoft, color:C.text, outline:"none" }}/>
        </div>
      )}
      {load&&<div style={{ display:"flex", justifyContent:"center", padding:"32px 0" }}><Spin/></div>}

      {!load&&view==="dashboard"&&dash&&(
        <div>
          <div className="dash-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:28 }}>
            {[
              { label:"Usuários",       value:dash.totalUsers,           color:C.navy,   bg:C.navyLight },
              { label:"Total Reservas", value:dash.totalReservations,    color:C.purple, bg:C.purpleBg  },
              { label:"Pagas",          value:dash.paidReservations,     color:C.green,  bg:C.greenBg   },
              { label:"Receita Total",  value:fmtMoney(dash.totalRevenue),color:C.green, bg:C.greenBg   },
              { label:"Vagas Livres",   value:dash.spotsAvailable,       color:C.green,  bg:C.greenBg   },
              { label:"Ocupadas",       value:dash.spotsOccupied,        color:C.red,    bg:C.redBg     },
              { label:"Preferenciais",  value:dash.spotsPreferential,    color:C.amber,  bg:C.amberBg   },
              { label:"Ativas",         value:dash.activeReservations,   color:C.purple, bg:C.purpleBg  },
            ].map(p=>(
              <div key={p.label} style={{ background:p.bg, borderRadius:12, padding:"13px 16px", border:`1px solid ${p.color}30` }}>
                <div style={{ fontSize:22, fontFamily:"Syne,sans-serif", fontWeight:700, color:p.color, lineHeight:1 }}>{p.value}</div>
                <div style={{ fontSize:10, color:p.color, fontWeight:600, marginTop:3, letterSpacing:.5, textTransform:"uppercase" }}>{p.label}</div>
              </div>
            ))}
          </div>
          {dash.revenueWeek?.length>0&&(
            <Card style={{ padding:"18px 20px" }}>
              <h3 style={{ fontFamily:"Syne,sans-serif", fontSize:15, fontWeight:700, color:C.navy, marginBottom:14 }}>Receita — Últimos 7 dias</h3>
              {dash.revenueWeek.map(d=>(
                <div key={d._id} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:7 }}>
                  <span style={{ fontSize:12, color:C.textMid, minWidth:42 }}>{d._id}</span>
                  <div style={{ flex:1, height:8, background:C.border, borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", background:C.green, borderRadius:4, width:`${Math.min(100,(d.total/500)*100)}%` }}/>
                  </div>
                  <span style={{ fontSize:12, fontWeight:600, color:C.green, minWidth:70, textAlign:"right" }}>{fmtMoney(d.total)}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {!load&&view==="reservations"&&(
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {fR.length===0&&<p style={{ color:C.textLight, fontSize:13 }}>Nenhuma reserva encontrada.</p>}
          {fR.map(r=>(
            <div key={r._id} style={row}>
              <div style={{ display:"flex", alignItems:"center", gap:9, flexWrap:"wrap" }}>
                <button onClick={()=>setSelU(r.user)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, fontWeight:600, color:C.navy, fontFamily:"DM Sans,sans-serif", textDecoration:"underline", textUnderlineOffset:2 }}>
                  {r.user?.nomeCompleto||r.user?.email}
                </button>
                <Bdg color={C.purple} bg={C.purpleBg}>Vaga {r.spotNumber}</Bdg>
                <span style={{ fontSize:12, color:C.textMid }}>às {r.startTimeStr}</span>
                {r.placa&&<Bdg color={C.navyMid} bg={C.navyLight}>{r.placa}</Bdg>}
                {r.modelo&&<span style={{ fontSize:11, color:C.textLight }}>{r.modelo}</span>}
                {r.status==="paid"?<Bdg color={C.greenDark} bg={C.greenBg}>Pago {fmtMoney(r.totalPrice)}</Bdg>
                  :r.status==="cancelled"?<Bdg color={C.red} bg={C.redBg}>Cancelada</Bdg>
                  :<Bdg color={C.amberDark} bg={C.amberBg}>Em uso</Bdg>}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, color:C.textLight }}>{fmtDate(r.createdAt)}</span>
                {r.status==="active"&&<Btn v="danger" sm onClick={()=>cancelRes(r._id)}>Cancelar</Btn>}
              </div>
            </div>
          ))}
        </div>
      )}

      {!load&&view==="users"&&(
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {fU.map(u=>(
            <div key={u._id} style={{ ...row, cursor:"pointer" }} onClick={()=>setSelU(u)}>
              <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:u.isAdmin?C.navy:u.ativo?C.border:C.redBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:u.isAdmin?"#FBF5EE":u.ativo?C.textMid:C.red, fontFamily:"Syne,sans-serif", flexShrink:0 }}>
                  {(u.nomeCompleto?.[0]||u.email[0]).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:C.navy, margin:0 }}>{u.nomeCompleto||u.email} {u.username&&<span style={{ fontSize:11, color:C.textLight }}>@{u.username}</span>}</p>
                  <p style={{ fontSize:11, color:C.textLight, margin:0 }}>{u.email}</p>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {u.isAdmin&&<Bdg color={C.navyMid} bg={C.navyLight}>Admin</Bdg>}
                {!u.ativo&&<Bdg color={C.red} bg={C.redBg}>Desativado</Bdg>}
                <span style={{ fontSize:11, color:C.textLight }}>{new Date(u.createdAt).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!load&&view==="logs"&&(
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {logs.length===0&&<p style={{ color:C.textLight, fontSize:13 }}>Nenhum log.</p>}
          {logs.map(log=>(
            <div key={log._id} style={row}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:C.navyLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:C.navy, fontFamily:"Syne,sans-serif", flexShrink:0 }}>{log.email[0].toUpperCase()}</div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:C.navy, margin:0 }}>{log.email}</p>
                  <p style={{ fontSize:12, color:C.textMid, margin:0 }}>{log.action}</p>
                </div>
              </div>
              <span style={{ fontSize:11, color:C.textLight }}>{fmtDate(log.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────
export default function App() {
  const [user, setUser]     = useState(null);
  const [spots, setSpots]   = useState([]);
  const [activeRes, setActiveRes] = useState(null);
  const [tab, setTab]       = useState("overview");
  const [booting, setBoot]  = useState(true);

  useEffect(()=>{
    const t = localStorage.getItem("omv_token");
    if (!t) { setBoot(false); return; }
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
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{GF+CSS}</style>
      <div style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
        <Spin size={26}/><p style={{ fontFamily:"Syne,sans-serif", fontSize:14, color:C.textLight }}>Carregando...</p>
      </div>
    </div>
  );

  if (!user) return <LoginScreen onLogin={u=>setUser(u)}/>;

  const tabs = [
    { id:"overview", label:"Visão Geral" },
    { id:"reserve",  label:"Reservas"    },
    { id:"payment",  label:"Pagamento"   },
    ...(user.isAdmin?[{ id:"admin", label:"Admin" }]:[]),
  ];
  const titles = { overview:"Visão Geral do Estacionamento", reserve:"Reservar uma Vaga", payment:"Pagamento e Monitoramento", admin:"Painel Administrativo" };

  return (
    <div style={{ minHeight:"100vh", width:"100%", background:C.bg, fontFamily:"DM Sans,sans-serif" }}>
      <style>{GF+CSS}</style>
      <header style={{ background:C.bgCard, borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:100, width:"100%" }}>
        <div className="header-inner" style={{ width:"100%", padding:"0 48px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <div className="header-logo" style={{ fontFamily:"Syne,sans-serif", fontSize:15, fontWeight:800, color:C.navy, whiteSpace:"nowrap" }}>◈ Estacionamento OMV</div>
          <nav className="header-nav" style={{ display:"flex", gap:3 }}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"7px 15px", borderRadius:8, border:"none", background:tab===t.id?C.navy:"transparent", color:tab===t.id?"#FBF5EE":C.textMid, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"DM Sans,sans-serif", transition:"all .15s", whiteSpace:"nowrap" }}>{t.label}</button>
            ))}
          </nav>
          <div className="header-user" style={{ display:"flex", alignItems:"center", gap:11, flexShrink:0 }}>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:12, fontWeight:600, color:C.navy, margin:0 }}>{user.nomeCompleto||user.email}</p>
              <p style={{ fontSize:10, color:C.textLight, margin:0 }}>{user.isAdmin?"Administrador":user.email}</p>
            </div>
            <button onClick={logout} style={{ padding:"6px 13px", borderRadius:8, background:C.bgDark, color:C.textMid, border:`1px solid ${C.border}`, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"DM Sans,sans-serif" }}>Sair</button>
          </div>
        </div>
      </header>
      <main className="main-content" style={{ width:"100%", padding:"34px 48px" }}>
        <h1 className="page-title" style={{ fontFamily:"Syne,sans-serif", fontSize:26, fontWeight:700, color:C.navy, marginBottom:24 }}>{titles[tab]}</h1>
        {tab==="overview"&&<OverviewTab spots={spots}/>}
        {tab==="reserve" &&<ReserveTab spots={spots} activeRes={activeRes} onReserved={()=>{loadSpots();loadRes();}} setTab={setTab}/>}
        {tab==="payment" &&<PaymentTab activeRes={activeRes} onPaid={()=>{loadSpots();setActiveRes(null);}}/>}
        {tab==="admin"&&user.isAdmin&&<AdminTab/>}
      </main>
    </div>
  );
}
