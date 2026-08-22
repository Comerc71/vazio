import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import {
  Droplets, Wheat, Zap, Settings2, LayoutGrid, Bell,
  ChevronRight, ChevronDown, RadioTower, CheckCircle2, Clock, MapPin,
  Sun, X, Map as MapIcon, Plus, LocateFixed, Loader2, CloudSun, Navigation,
  User, Building2, Mail, Lock, Eye, EyeOff, Phone, Ruler, Sprout,
  CheckSquare, Square, LogOut, ArrowRight, ArrowLeft, ShieldCheck, RefreshCw, Trash2, Lightbulb,
  HelpCircle, Calendar, Camera,
} from "lucide-react";
import { supabase } from "./lib/supabaseClient";
import { signUp, signIn, signOut, resendConfirmation, fetchProfile, updateProfile, uploadAvatar, authErrorMessage } from "./lib/auth";
import { listDevices, insertDevice, updateDevice, deleteDevice, subscribeToDevices, fetchDeviceReadings, regenerateApiKey } from "./lib/devices";
import { watchBestPosition } from "./lib/geolocation";
import { submitSuggestion } from "./lib/suggestions";

/* ---------------------------------------------------------
   Design tokens — mesma identidade do site Yassena, adaptada
   para contexto de app: cartões, leitura rápida, sinal RF.
--------------------------------------------------------- */
const COLORS = {
  forestDeep: "#0B2A11",
  forest: "#12481D",
  forestMid: "#1E7A2E",
  forestBright: "#2E9A3F",
  gold: "#E7A33C",
  goldDim: "#C98A2E",
  soil: "#6E4A2C",
  paper: "#F6F3EA",
  paperDim: "#EDE8D9",
  ink: "#14210F",
  inkSoft: "#5C6B5D",
  mist: "#DFE8DC",
  alert: "#B8503F",
  alertBg: "#F6E3DE",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

/* ---------------------------------------------------------
   Tipos de dispositivo disponíveis ao cadastrar um novo sensor
--------------------------------------------------------- */
const DEVICE_TYPES = [
  { id: "umidade", label: "Umidade do solo", icon: Droplets },
  { id: "silo", label: "Nível de silo / reservatório", icon: Wheat },
  { id: "cerca", label: "Cerca elétrica", icon: Zap },
  { id: "bomba", label: "Bomba / energia solar", icon: Sun },
  { id: "clima", label: "Estação meteorológica", icon: CloudSun },
  { id: "outro", label: "Outro sensor RF", icon: RadioTower },
];

const CONTACT_TYPES = [
  { id: "sugestao", label: "Sugestão", icon: Lightbulb },
  { id: "duvida", label: "Dúvida", icon: HelpCircle },
  { id: "visita", label: "Visita técnica", icon: Calendar },
];

function iconForType(type) {
  return DEVICE_TYPES.find((t) => t.id === type)?.icon || RadioTower;
}

/* ---------------------------------------------------------
   Cadastro de usuário
--------------------------------------------------------- */
const ACTIVITY_OPTIONS = [
  "Pecuária", "Grãos (soja, milho...)", "Fruticultura", "Hortaliças", "Mista / outra",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function greetingForHour() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function initialsFor(text) {
  if (!text) return "YC";
  const parts = text.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function relativeTime(isoString) {
  if (!isoString) return "sem leituras ainda";
  const diffMs = Date.now() - new Date(isoString).getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "atualizado agora";
  if (min < 60) return `atualizado há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `atualizado há ${h} h`;
  const d = Math.round(h / 24);
  return `atualizado há ${d} d`;
}

function fitMapToPoints(map, points) {
  if (!map || points.length === 0) return;
  if (points.length === 1) {
    map.setView([points[0].lat, points[0].lon], 15);
    return;
  }
  map.fitBounds(points.map((p) => [p.lat, p.lon]), { padding: [36, 36], maxZoom: 16 });
}

function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | ok | error
  const stopRef = useRef(null);

  const request = useCallback(() => {
    if (stopRef.current) stopRef.current();
    setStatus("loading");
    stopRef.current = watchBestPosition({
      onUpdate: (pos) => { setLocation(pos); setStatus("ok"); },
      onError: () => setStatus((s) => (s === "ok" ? s : "error")),
    });
  }, []);

  useEffect(() => () => { if (stopRef.current) stopRef.current(); }, []);

  return { location, status, request };
}

/* ---------------------------------------------------------
   Sub-componentes
--------------------------------------------------------- */
function SignalBars({ level = 3, color = COLORS.forestMid }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 12 }} aria-label={`Sinal RF ${level} de 4`}>
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          style={{
            width: 3,
            height: bar * 3,
            borderRadius: 1,
            background: bar <= level ? color : "rgba(20,33,20,0.15)",
          }}
        />
      ))}
    </div>
  );
}

function Sparkline({ data, color }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 28 - ((v - min) / range) * 24 - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 28" style={{ width: "100%", height: 34 }} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusDot({ status }) {
  const color = status === "ok" ? COLORS.forestBright : status === "atencao" ? COLORS.gold : COLORS.alert;
  return <span style={{ width: 8, height: 8, borderRadius: 999, background: color, display: "inline-block", flexShrink: 0 }} />;
}

/* ---------------------------------------------------------
   Cartão de dispositivo (expansível)
--------------------------------------------------------- */
function DeviceCard({ device }) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState(null);
  const Icon = device.icon || RadioTower;
  const accent =
    device.status === "ok" ? COLORS.forestMid : device.status === "atencao" ? COLORS.goldDim : COLORS.alert;
  const hasHistory = Array.isArray(history) && history.length > 1;

  useEffect(() => {
    if (!open || history !== null) return;
    fetchDeviceReadings(device.id)
      .then((rows) => setHistory(rows.map((r) => r.value)))
      .catch(() => setHistory([]));
  }, [open, history, device.id]);

  return (
    <div className="yc-card" style={{ borderColor: open ? accent : "rgba(20,33,20,0.10)" }}>
      <button className="yc-card-head" onClick={() => setOpen((v) => !v)}>
        <div className="yc-card-icon" style={{ background: `${accent}1A`, color: accent }}>
          <Icon size={18} strokeWidth={1.8} />
        </div>
        <div className="yc-card-info">
          <div className="yc-card-title-row">
            <StatusDot status={device.status} />
            <span className="yc-card-title">{device.name}</span>
          </div>
          <span className="yc-card-loc">
            <MapPin size={11} style={{ marginRight: 3, verticalAlign: -1 }} />
            {device.location}
          </span>
        </div>
        <div className="yc-card-right">
          <span className="yc-card-reading">{device.reading || "—"}</span>
          <SignalBars level={device.signal} color={accent} />
        </div>
        <ChevronDown
          size={16}
          style={{ marginLeft: 6, color: COLORS.inkSoft, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}
        />
      </button>

      {open && (
        <div className="yc-card-body">
          <p className="yc-card-sub">{device.sub || "Sensor cadastrado recentemente — aguardando primeiras leituras."}</p>
          {hasHistory && <Sparkline data={history} color={accent} />}
          <div className="yc-card-meta">
            <span><Clock size={11} style={{ marginRight: 4, verticalAlign: -1 }} />{relativeTime(device.updated_at)}</span>
            <span>RF · {device.signal <= 2 ? "sinal fraco" : "sinal bom"}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   Telas simples
--------------------------------------------------------- */
function PainelScreen({ devices, user }) {
  const firstName = (user?.name || "").trim().split(/\s+/)[0];
  return (
    <>
      {firstName && (
        <p className="yc-greeting">{greetingForHour()}, {firstName} 👋</p>
      )}

      <div className="yc-section-label">Monitoramento</div>
      <div className="yc-card-list yc-device-grid">
        {devices.map((d) => (
          <DeviceCard key={d.id} device={d} />
        ))}
      </div>
    </>
  );
}

function AlertasScreen() {
  const [alerts, setAlerts] = useState([]);
  const [confirmingClear, setConfirmingClear] = useState(false);

  useEffect(() => {
    if (!confirmingClear) return;
    const t = setTimeout(() => setConfirmingClear(false), 4000);
    return () => clearTimeout(t);
  }, [confirmingClear]);

  function handleClearClick() {
    if (!confirmingClear) {
      setConfirmingClear(true);
      return;
    }
    setAlerts([]);
    setConfirmingClear(false);
  }

  if (alerts.length === 0) {
    return <p className="yc-field-hint">Nenhuma notificação por aqui.</p>;
  }

  return (
    <div className="yc-card-list">
      <button className="yc-linklike" style={{ alignSelf: "flex-end", fontSize: 12 }} onClick={handleClearClick}>
        {confirmingClear ? "Toque de novo para confirmar" : "Limpar histórico"}
      </button>
      {alerts.map((a) => {
        const levelColor = { ok: COLORS.forestMid, atencao: COLORS.goldDim, info: COLORS.inkSoft }[a.level];
        return (
          <div className="yc-card yc-alert-item" key={a.id}>
            <div className="yc-card-icon" style={{ background: `${levelColor}1A`, color: levelColor }}>
              {a.level === "ok" ? <CheckCircle2 size={17} strokeWidth={1.8} /> : <Bell size={17} strokeWidth={1.8} />}
            </div>
            <div className="yc-card-info">
              <span className="yc-card-title" style={{ display: "block" }}>{a.title}</span>
              <span className="yc-card-loc">{a.place} · {a.time}</span>
            </div>
            <button
              className="yc-icon-btn"
              onClick={() => setAlerts((prev) => prev.filter((item) => item.id !== a.id))}
              aria-label="Remover notificação"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function AjustesScreen({ devices, user, onLogout, onUpdateProfile, onUploadAvatar }) {
  const [editingDevice, setEditingDevice] = useState(null);
  const [editingFarm, setEditingFarm] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const avatarInputRef = useRef(null);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvatarError(null);
    setUploadingAvatar(true);
    try {
      await onUploadAvatar(file);
    } catch {
      setAvatarError("Não foi possível enviar a foto. Tente uma imagem menor.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <div className="yc-card-list">
      <div className="yc-section-label">Dispositivos conectados</div>
      {devices.length === 0 && (
        <p className="yc-field-hint">Nenhum dispositivo cadastrado ainda — adicione um pelo Mapa.</p>
      )}
      {devices.map((d) => (
        <button className="yc-card yc-alert-item yc-alert-item-btn" key={d.id} onClick={() => setEditingDevice(d)}>
          <div className="yc-card-icon" style={{ background: `${COLORS.forest}1A`, color: COLORS.forest }}>
            <RadioTower size={17} strokeWidth={1.8} />
          </div>
          <div className="yc-card-info">
            <span className="yc-card-title" style={{ display: "block" }}>{d.name}</span>
            <span className="yc-card-loc">{d.location}</span>
          </div>
          <SignalBars level={d.signal} color={COLORS.forestMid} />
          <ChevronRight size={16} style={{ marginLeft: 8, color: COLORS.inkSoft }} />
        </button>
      ))}

      <div className="yc-section-label" style={{ marginTop: 18 }}>Conta</div>
      <div className="yc-card yc-alert-item">
        <button
          type="button"
          className="yc-avatar-btn"
          onClick={() => avatarInputRef.current?.click()}
          disabled={uploadingAvatar}
          aria-label="Alterar foto de perfil"
        >
          {uploadingAvatar ? (
            <Loader2 size={16} className="yc-spin" color={COLORS.goldDim} />
          ) : user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" />
          ) : (
            <User size={17} strokeWidth={1.8} color={COLORS.goldDim} />
          )}
          <span className="yc-avatar-badge"><Camera size={10} strokeWidth={2.4} /></span>
        </button>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleAvatarChange}
        />
        <div className="yc-card-info">
          <span className="yc-card-title" style={{ display: "block" }}>{user?.name || "—"}</span>
          <span className="yc-card-loc">{user?.email}</span>
        </div>
      </div>
      {avatarError && <p className="yc-field-hint" style={{ color: COLORS.alert }}>{avatarError}</p>}
      <button className="yc-card yc-alert-item yc-alert-item-btn" onClick={() => setEditingFarm(true)}>
        <div className="yc-card-icon" style={{ background: `${COLORS.forest}1A`, color: COLORS.forest }}>
          <Building2 size={17} strokeWidth={1.8} />
        </div>
        <div className="yc-card-info">
          <span className="yc-card-title" style={{ display: "block" }}>{user?.farmName || "—"}</span>
          <span className="yc-card-loc">
            {[user?.city, user?.activity].filter(Boolean).join(" · ") || "—"}
            {user?.hectares ? ` · ${user.hectares} ha` : ""}
          </span>
        </div>
        <ChevronRight size={16} style={{ marginLeft: 8, color: COLORS.inkSoft }} />
      </button>

      <button className="yc-logout-btn" onClick={onLogout}>
        <LogOut size={15} />
        Sair da conta
      </button>

      {editingDevice && (
        <EditDeviceSheet
          device={editingDevice}
          onClose={() => setEditingDevice(null)}
          onSaved={() => setEditingDevice(null)}
          onDeleted={() => setEditingDevice(null)}
        />
      )}

      {editingFarm && (
        <EditFarmSheet
          user={user}
          onClose={() => setEditingFarm(false)}
          onSaved={async (patch) => {
            await onUpdateProfile(patch);
            setEditingFarm(false);
          }}
        />
      )}
    </div>
  );
}

function SugestoesScreen({ user }) {
  const [type, setType] = useState("sugestao");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const isVisita = type === "visita";
  const canSend = message.trim().length > 4 && (!isVisita || preferredDate);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSend) return;
    setError(null);
    setSending(true);
    try {
      await submitSuggestion({
        type: CONTACT_TYPES.find((t) => t.id === type).label,
        name,
        email,
        message: message.trim(),
        preferredDate: isVisita ? preferredDate : "",
      });
      setSent(true);
      setMessage("");
      setPreferredDate("");
    } catch {
      setError("Não foi possível enviar agora. Tente de novo em instantes.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="yc-auth-body" style={{ alignItems: "center" }}>
        <div className="yc-verify-icon"><Lightbulb size={22} color={COLORS.gold} /></div>
        <p className="yc-auth-lead" style={{ textAlign: "center" }}>
          {isVisita ? "Pedido de visita enviado! Vamos confirmar a data com você." : "Mensagem enviada, obrigado!"}
        </p>
        <button type="button" className="yc-linklike" onClick={() => setSent(false)}>Enviar outra mensagem</button>
      </div>
    );
  }

  const messageLabel = type === "duvida" ? "Sua dúvida" : type === "visita" ? "O que precisa de suporte" : "Sua sugestão";
  const messagePlaceholder = type === "duvida" ? "Escreva sua dúvida..." : type === "visita" ? "Conte o que precisa verificar na visita..." : "Conte sua ideia...";

  return (
    <form className="yc-auth-body" onSubmit={handleSubmit}>
      <p className="yc-auth-lead">Fale com a gente — sugestões, dúvidas ou agendamento de visita técnica chegam direto pra equipe.</p>

      <div className="yc-type-grid">
        {CONTACT_TYPES.map((t) => {
          const TIcon = t.icon;
          const active = type === t.id;
          return (
            <button
              key={t.id}
              type="button"
              className={`yc-type-btn ${active ? "active" : ""}`}
              onClick={() => setType(t.id)}
            >
              <TIcon size={16} strokeWidth={1.9} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <label className="yc-field-label" style={{ marginTop: 12 }}>Seu nome (opcional)</label>
      <FieldInput icon={User} placeholder="Como podemos te chamar" value={name} onChange={(e) => setName(e.target.value)} />

      <label className="yc-field-label" style={{ marginTop: 12 }}>Seu e-mail (opcional, pra responder)</label>
      <FieldInput icon={Mail} type="email" placeholder="voce@fazenda.com.br" value={email} onChange={(e) => setEmail(e.target.value)} />

      {isVisita && (
        <>
          <label className="yc-field-label" style={{ marginTop: 12 }}>Data preferida</label>
          <FieldInput icon={Calendar} type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} />
        </>
      )}

      <label className="yc-field-label" style={{ marginTop: 12 }}>{messageLabel}</label>
      <textarea
        className="yc-input"
        style={{ minHeight: 110, resize: "vertical" }}
        placeholder={messagePlaceholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {error && <p className="yc-field-hint" style={{ color: COLORS.alert }}>{error}</p>}

      <button className="yc-save-btn" type="submit" disabled={!canSend || sending} style={{ marginTop: 16 }}>
        {sending ? <Loader2 size={16} className="yc-spin" /> : <>Enviar <ArrowRight size={15} /></>}
      </button>
    </form>
  );
}

/* ---------------------------------------------------------
   Pino de mapa
--------------------------------------------------------- */
function buildPinIcon({ point, selected, kind }) {
  const isMe = kind === "me";
  const color = isMe
    ? COLORS.forestBright
    : point.status === "atencao"
    ? COLORS.goldDim
    : COLORS.forestMid;
  const Icon = isMe ? Navigation : point.icon || RadioTower;
  const size = isMe ? 28 : 26;
  const iconMarkup = renderToStaticMarkup(
    <Icon size={13} color={isMe ? "#fff" : color} strokeWidth={2.2} />
  );

  const html = `
    <span style="position:relative;display:inline-block;">
      <span class="yc-map-pin-dot ${selected ? "sel" : ""}" style="background:${isMe ? COLORS.forestBright : "#fff"};border:2px solid ${isMe ? "#fff" : color};width:${size}px;height:${size}px;">
        ${iconMarkup}
      </span>
      ${isMe ? `<span class="yc-map-pin-pulse" style="border-color:${COLORS.forestBright};"></span>` : ""}
    </span>
  `;

  return L.divIcon({
    html,
    className: "yc-leaflet-pin",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapPinMarker({ point, selected, onClick, kind }) {
  const icon = useMemo(
    () => buildPinIcon({ point, selected, kind }),
    [point.status, point.icon, selected, kind]
  );
  return (
    <Marker
      position={[point.lat, point.lon]}
      icon={icon}
      eventHandlers={{ click: onClick }}
      zIndexOffset={selected ? 600 : kind === "me" ? 500 : 200}
    />
  );
}

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => { fitMapToPoints(map, points); }, [map, points]);
  return null;
}

function MapReadyBridge({ onReady }) {
  const map = useMap();
  useEffect(() => { onReady(map); }, [map, onReady]);
  return null;
}

/* ---------------------------------------------------------
   Formulário — adicionar novo dispositivo
--------------------------------------------------------- */
function AddDeviceSheet({ onClose, onSave, myLocation, locStatus, requestLocation }) {
  const [name, setName] = useState("");
  const [typeId, setTypeId] = useState(DEVICE_TYPES[0].id);
  const [note, setNote] = useState("");

  const canSave = name.trim().length > 1 && !!myLocation;

  function handleSave() {
    if (!canSave) return;
    const type = DEVICE_TYPES.find((t) => t.id === typeId);
    onSave({
      name: name.trim(),
      location: note.trim() || type.label,
      type: typeId,
      lat: myLocation.lat,
      lon: myLocation.lon,
    });
  }

  return (
    <div className="yc-sheet-backdrop" onClick={onClose}>
      <div className="yc-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="yc-sheet-handle" />
        <div className="yc-sheet-head">
          <span className="yc-sheet-title">Novo dispositivo</span>
          <button className="yc-icon-btn" onClick={onClose} aria-label="Fechar"><X size={16} /></button>
        </div>

        <label className="yc-field-label">Nome</label>
        <input
          className="yc-input"
          placeholder="Ex: Sensor bebedouro 3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="yc-field-label" style={{ marginTop: 12 }}>Tipo de sensor</label>
        <div className="yc-type-grid">
          {DEVICE_TYPES.map((t) => {
            const TIcon = t.icon;
            const active = typeId === t.id;
            return (
              <button
                key={t.id}
                className={`yc-type-btn ${active ? "active" : ""}`}
                onClick={() => setTypeId(t.id)}
                type="button"
              >
                <TIcon size={16} strokeWidth={1.9} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <label className="yc-field-label" style={{ marginTop: 12 }}>Observação (opcional)</label>
        <input
          className="yc-input"
          placeholder="Ex: Talhão 5, próximo à cerca"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <label className="yc-field-label" style={{ marginTop: 12 }}>Localização</label>
        <button className="yc-locate-btn" onClick={requestLocation} type="button" disabled={locStatus === "loading"}>
          {locStatus === "loading" ? (
            <><Loader2 size={15} className="yc-spin" />Obtendo localização…</>
          ) : myLocation ? (
            <><CheckCircle2 size={15} color={COLORS.forestMid} />Localização capturada · {myLocation.lat.toFixed(5)}, {myLocation.lon.toFixed(5)}</>
          ) : (
            <><LocateFixed size={15} />Usar minha localização atual</>
          )}
        </button>
        {locStatus === "error" && (
          <p className="yc-field-hint" style={{ color: COLORS.alert }}>
            Não foi possível obter sua localização. Verifique a permissão de GPS do navegador e tente de novo.
          </p>
        )}
        {!myLocation && locStatus !== "error" && (
          <p className="yc-field-hint">Fique perto do dispositivo instalado e capture a localização antes de salvar.</p>
        )}

        <button className="yc-save-btn" onClick={handleSave} disabled={!canSave}>
          Salvar dispositivo
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Formulário — editar / realocar / excluir um dispositivo
--------------------------------------------------------- */
function EditDeviceSheet({ device, onClose, onSaved, onDeleted }) {
  const [name, setName] = useState(device.name);
  const [typeId, setTypeId] = useState(device.type);
  const [note, setNote] = useState(device.location || "");
  const [coords, setCoords] = useState({ lat: device.lat, lon: device.lon });
  const { location: myLocation, status: locStatus, request: requestLocation } = useGeolocation();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState(device.api_key);
  const [regenerating, setRegenerating] = useState(false);
  const [confirmingRegen, setConfirmingRegen] = useState(false);

  useEffect(() => {
    if (myLocation) setCoords({ lat: myLocation.lat, lon: myLocation.lon });
  }, [myLocation]);

  useEffect(() => {
    if (!confirmingDelete) return;
    const t = setTimeout(() => setConfirmingDelete(false), 4000);
    return () => clearTimeout(t);
  }, [confirmingDelete]);

  useEffect(() => {
    if (!confirmingRegen) return;
    const t = setTimeout(() => setConfirmingRegen(false), 4000);
    return () => clearTimeout(t);
  }, [confirmingRegen]);

  async function handleRegenerateKey() {
    if (!confirmingRegen) {
      setConfirmingRegen(true);
      return;
    }
    setRegenerating(true);
    try {
      const newKey = await regenerateApiKey(device.id);
      setApiKey(newKey);
      setConfirmingRegen(false);
    } catch {
      setError("Não foi possível gerar uma nova chave. Tente novamente.");
    } finally {
      setRegenerating(false);
    }
  }

  const canSave = name.trim().length > 1;

  async function handleSave() {
    if (!canSave) return;
    setError(null);
    setSaving(true);
    try {
      const type = DEVICE_TYPES.find((t) => t.id === typeId);
      await updateDevice(device.id, {
        name: name.trim(),
        location: note.trim() || type.label,
        type: typeId,
        lat: coords.lat,
        lon: coords.lon,
      });
      onSaved();
    } catch {
      setError("Não foi possível salvar as alterações. Tente novamente.");
      setSaving(false);
    }
  }

  async function handleDeleteClick() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setError(null);
    setDeleting(true);
    try {
      await deleteDevice(device.id);
      onDeleted();
    } catch {
      setError("Não foi possível excluir. Tente novamente.");
      setDeleting(false);
    }
  }

  return (
    <div className="yc-sheet-backdrop" onClick={onClose}>
      <div className="yc-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="yc-sheet-handle" />
        <div className="yc-sheet-head">
          <span className="yc-sheet-title">Editar dispositivo</span>
          <button className="yc-icon-btn" onClick={onClose} aria-label="Fechar"><X size={16} /></button>
        </div>

        <label className="yc-field-label">Nome</label>
        <input className="yc-input" value={name} onChange={(e) => setName(e.target.value)} />

        <label className="yc-field-label" style={{ marginTop: 12 }}>Tipo de sensor</label>
        <div className="yc-type-grid">
          {DEVICE_TYPES.map((t) => {
            const TIcon = t.icon;
            const active = typeId === t.id;
            return (
              <button
                key={t.id}
                className={`yc-type-btn ${active ? "active" : ""}`}
                onClick={() => setTypeId(t.id)}
                type="button"
              >
                <TIcon size={16} strokeWidth={1.9} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <label className="yc-field-label" style={{ marginTop: 12 }}>Observação (opcional)</label>
        <input className="yc-input" value={note} onChange={(e) => setNote(e.target.value)} />

        <label className="yc-field-label" style={{ marginTop: 12 }}>Localização</label>
        <button className="yc-locate-btn" onClick={requestLocation} type="button" disabled={locStatus === "loading"}>
          {locStatus === "loading" ? (
            <><Loader2 size={15} className="yc-spin" />Capturando nova localização…</>
          ) : myLocation ? (
            <><CheckCircle2 size={15} color={COLORS.forestMid} />Atualizada · {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}</>
          ) : (
            <><LocateFixed size={15} />{coords.lat.toFixed(5)}, {coords.lon.toFixed(5)} · toque para realocar</>
          )}
        </button>
        {locStatus === "error" && (
          <p className="yc-field-hint" style={{ color: COLORS.alert }}>
            Não foi possível obter sua localização. Fique perto do dispositivo e tente de novo.
          </p>
        )}

        <label className="yc-field-label" style={{ marginTop: 12 }}>Integração RF (gateway → nuvem)</label>
        <p className="yc-field-hint" style={{ marginTop: 0, marginBottom: 8 }}>
          Programe o gateway/nó pra enviar leituras deste sensor com um POST pra esse endereço, usando o ID e a chave abaixo.
        </p>
        <code className="yc-code-block">{`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ingest-reading`}</code>
        <div className="yc-integration-row">
          <div>
            <span className="yc-field-label" style={{ marginTop: 8 }}>device_id</span>
            <code className="yc-code-block">{device.id}</code>
          </div>
          <div>
            <span className="yc-field-label" style={{ marginTop: 8 }}>api_key</span>
            <code className="yc-code-block">{apiKey}</code>
          </div>
        </div>
        <code className="yc-code-block" style={{ whiteSpace: "pre" }}>
{`{
  "device_id": "${device.id}",
  "api_key": "${apiKey}",
  "value": 24.5,
  "reading": "24%"
}`}
        </code>
        <button
          type="button"
          className="yc-linklike"
          style={{ marginTop: 8, fontSize: 12 }}
          onClick={handleRegenerateKey}
          disabled={regenerating}
        >
          {regenerating ? "Gerando…" : confirmingRegen ? "Toque de novo pra confirmar (invalida a chave atual)" : "Gerar nova chave"}
        </button>

        {error && <p className="yc-field-hint" style={{ color: COLORS.alert }}>{error}</p>}

        <button className="yc-save-btn" onClick={handleSave} disabled={!canSave || saving}>
          {saving ? <Loader2 size={16} className="yc-spin" /> : "Salvar alterações"}
        </button>

        <button className="yc-logout-btn" onClick={handleDeleteClick} disabled={deleting} style={{ marginTop: 10 }}>
          {deleting ? (
            <Loader2 size={15} className="yc-spin" />
          ) : (
            <>
              <Trash2 size={15} />
              {confirmingDelete ? "Toque de novo para confirmar" : "Excluir dispositivo"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Formulário — editar nome e área da propriedade
--------------------------------------------------------- */
function EditFarmSheet({ user, onClose, onSaved }) {
  const [farmName, setFarmName] = useState(user?.farmName || "");
  const [hectares, setHectares] = useState(user?.hectares || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const canSave = farmName.trim().length > 1;

  async function handleSave() {
    if (!canSave) return;
    setError(null);
    setSaving(true);
    try {
      await onSaved({ farmName: farmName.trim(), hectares });
    } catch {
      setError("Não foi possível salvar as alterações. Tente novamente.");
      setSaving(false);
    }
  }

  return (
    <div className="yc-sheet-backdrop" onClick={onClose}>
      <div className="yc-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="yc-sheet-handle" />
        <div className="yc-sheet-head">
          <span className="yc-sheet-title">Editar propriedade</span>
          <button className="yc-icon-btn" onClick={onClose} aria-label="Fechar"><X size={16} /></button>
        </div>

        <label className="yc-field-label">Nome da fazenda</label>
        <input className="yc-input" value={farmName} onChange={(e) => setFarmName(e.target.value)} />

        <label className="yc-field-label" style={{ marginTop: 12 }}>Área (ha)</label>
        <input
          className="yc-input"
          type="number"
          min="0"
          placeholder="Opcional"
          value={hectares}
          onChange={(e) => setHectares(e.target.value)}
        />

        {error && <p className="yc-field-hint" style={{ color: COLORS.alert }}>{error}</p>}

        <button className="yc-save-btn" onClick={handleSave} disabled={!canSave || saving}>
          {saving ? <Loader2 size={16} className="yc-spin" /> : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Campos reutilizáveis de formulário (login / cadastro)
--------------------------------------------------------- */
function FieldInput({ icon: Icon, error, right, ...props }) {
  return (
    <div>
      <div className="yc-auth-field">
        {Icon && <Icon size={15} className="yc-auth-field-icon" />}
        <input className="yc-auth-input" {...props} />
        {right}
      </div>
      {error && <p className="yc-field-hint" style={{ color: COLORS.alert }}>{error}</p>}
    </div>
  );
}

function CheckboxRow({ checked, onChange, children }) {
  return (
    <button type="button" className="yc-checkbox-row" onClick={() => onChange(!checked)}>
      {checked ? (
        <CheckSquare size={17} color={COLORS.forestMid} strokeWidth={2} />
      ) : (
        <Square size={17} color={COLORS.inkSoft} strokeWidth={1.8} />
      )}
      <span>{children}</span>
    </button>
  );
}

/* ---------------------------------------------------------
   Tela de login
--------------------------------------------------------- */
function LoginScreen({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const emailError = touched && !EMAIL_RE.test(email) ? "Digite um e-mail válido." : null;
  const passError = touched && password.length < 6 ? "A senha deve ter pelo menos 6 caracteres." : null;
  const canSubmit = EMAIL_RE.test(email) && password.length >= 6;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    setFormError(null);
    if (!canSubmit) return;
    setLoading(true);
    try {
      await signIn({ email, password });
      // sucesso: o estado de sessão é atualizado pelo listener no componente principal
    } catch (err) {
      setFormError(authErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <form className="yc-auth-body" onSubmit={handleSubmit}>
      <p className="yc-auth-lead">Entre para acompanhar seus sensores e controlar sua fazenda remotamente.</p>

      <label className="yc-field-label">E-mail</label>
      <FieldInput
        icon={Mail}
        type="email"
        placeholder="voce@fazenda.com.br"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={emailError}
      />

      <label className="yc-field-label" style={{ marginTop: 12 }}>Senha</label>
      <FieldInput
        icon={Lock}
        type={showPass ? "text" : "password"}
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={passError}
        right={
          <button type="button" className="yc-eye-btn" onClick={() => setShowPass((v) => !v)} aria-label="Mostrar senha">
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        }
      />

      <button type="button" className="yc-linklike" style={{ marginTop: 10, fontSize: 12 }}>Esqueci minha senha</button>

      {formError && <p className="yc-field-hint" style={{ color: COLORS.alert, textAlign: "center", marginTop: 12 }}>{formError}</p>}

      <button className="yc-save-btn" type="submit" disabled={loading} style={{ marginTop: 20 }}>
        {loading ? <Loader2 size={16} className="yc-spin" /> : <>Entrar <ArrowRight size={15} /></>}
      </button>

      <p className="yc-auth-switch">
        Ainda não tem conta?{" "}
        <button type="button" className="yc-linklike" onClick={onSwitch}>Criar conta</button>
      </p>
    </form>
  );
}

/* ---------------------------------------------------------
   Tela de cadastro
--------------------------------------------------------- */
function SignupScreen({ onSwitch, onSuccess }) {
  const [form, setForm] = useState({
    name: "", farmName: "", city: "", hectares: "", phone: "",
    activity: ACTIVITY_OPTIONS[0], email: "", password: "", confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [agree, setAgree] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const errors = {
    name: touched && form.name.trim().length < 2 ? "Informe seu nome." : null,
    farmName: touched && form.farmName.trim().length < 2 ? "Informe o nome da fazenda." : null,
    email: touched && !EMAIL_RE.test(form.email) ? "Digite um e-mail válido." : null,
    password: touched && form.password.length < 6 ? "Mínimo de 6 caracteres." : null,
    confirm: touched && form.confirm !== form.password ? "As senhas não coincidem." : null,
  };
  const canSubmit =
    form.name.trim().length > 1 &&
    form.farmName.trim().length > 1 &&
    EMAIL_RE.test(form.email) &&
    form.password.length >= 6 &&
    form.confirm === form.password &&
    agree;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    setFormError(null);
    if (!canSubmit) return;
    setLoading(true);
    try {
      await signUp({
        email: form.email,
        password: form.password,
        name: form.name.trim(),
        farmName: form.farmName.trim(),
        city: form.city.trim(),
        hectares: form.hectares,
        phone: form.phone,
        activity: form.activity,
      });
      onSuccess(form.email);
    } catch (err) {
      setFormError(authErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <form className="yc-auth-body" onSubmit={handleSubmit}>
      <p className="yc-auth-lead">Crie sua conta para monitorar a fazenda e receber alertas em tempo real.</p>

      <label className="yc-field-label">Nome completo</label>
      <FieldInput icon={User} placeholder="Seu nome" value={form.name} onChange={set("name")} error={errors.name} />

      <label className="yc-field-label" style={{ marginTop: 12 }}>Nome da fazenda</label>
      <FieldInput icon={Building2} placeholder="Ex: Fazenda Boa Vista" value={form.farmName} onChange={set("farmName")} error={errors.farmName} />

      <div className="yc-auth-row2">
        <div>
          <label className="yc-field-label" style={{ marginTop: 12 }}>Cidade / região</label>
          <FieldInput icon={MapPin} placeholder="Paragominas, PA" value={form.city} onChange={set("city")} />
        </div>
        <div>
          <label className="yc-field-label" style={{ marginTop: 12 }}>Área (ha)</label>
          <FieldInput icon={Ruler} type="number" min="0" placeholder="Opcional" value={form.hectares} onChange={set("hectares")} />
        </div>
      </div>

      <label className="yc-field-label" style={{ marginTop: 12 }}>Telefone / WhatsApp</label>
      <FieldInput icon={Phone} placeholder="(91) 90000-0000 · opcional" value={form.phone} onChange={set("phone")} />

      <label className="yc-field-label" style={{ marginTop: 12 }}>Principal atividade</label>
      <div className="yc-auth-field">
        <Sprout size={15} className="yc-auth-field-icon" />
        <select className="yc-auth-input yc-auth-select" value={form.activity} onChange={set("activity")}>
          {ACTIVITY_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <label className="yc-field-label" style={{ marginTop: 12 }}>E-mail</label>
      <FieldInput icon={Mail} type="email" placeholder="voce@fazenda.com.br" value={form.email} onChange={set("email")} error={errors.email} />

      <label className="yc-field-label" style={{ marginTop: 12 }}>Senha</label>
      <FieldInput
        icon={Lock}
        type={showPass ? "text" : "password"}
        placeholder="mínimo 6 caracteres"
        value={form.password}
        onChange={set("password")}
        error={errors.password}
        right={
          <button type="button" className="yc-eye-btn" onClick={() => setShowPass((v) => !v)} aria-label="Mostrar senha">
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        }
      />

      <label className="yc-field-label" style={{ marginTop: 12 }}>Confirmar senha</label>
      <FieldInput
        icon={Lock}
        type={showPass ? "text" : "password"}
        placeholder="repita a senha"
        value={form.confirm}
        onChange={set("confirm")}
        error={errors.confirm}
      />

      <div style={{ marginTop: 14 }}>
        <CheckboxRow checked={agree} onChange={setAgree}>
          Li e aceito os termos de uso e a política de privacidade.
        </CheckboxRow>
        {touched && !agree && <p className="yc-field-hint" style={{ color: COLORS.alert }}>É preciso aceitar os termos para continuar.</p>}
      </div>

      {formError && <p className="yc-field-hint" style={{ color: COLORS.alert, textAlign: "center", marginTop: 12 }}>{formError}</p>}

      <button className="yc-save-btn" type="submit" disabled={loading} style={{ marginTop: 16 }}>
        {loading ? <Loader2 size={16} className="yc-spin" /> : <>Criar conta <ArrowRight size={15} /></>}
      </button>

      <p className="yc-auth-switch">
        Já tem conta?{" "}
        <button type="button" className="yc-linklike" onClick={onSwitch}>Entrar</button>
      </p>
    </form>
  );
}

/* ---------------------------------------------------------
   Verificação de e-mail (link de confirmação enviado pelo Supabase)
--------------------------------------------------------- */
function VerifyEmailScreen({ email, onBack, onGoToLogin }) {
  const [error, setError] = useState(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleResend() {
    setError(null);
    setResending(true);
    try {
      await resendConfirmation(email);
      setResent(true);
      setCooldown(30);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="yc-auth-body">
      <button type="button" className="yc-linklike yc-back-link" onClick={onBack}>
        <ArrowLeft size={13} /> Voltar
      </button>

      <div className="yc-verify-icon"><Mail size={22} color={COLORS.gold} /></div>

      <p className="yc-auth-lead" style={{ textAlign: "center" }}>
        Enviamos um link de confirmação para <strong>{email}</strong>. Abra sua caixa de entrada (e o spam) e clique nele para ativar sua conta.
      </p>

      {error && <p className="yc-field-hint" style={{ color: COLORS.alert, textAlign: "center" }}>{error}</p>}
      {resent && !error && <p className="yc-field-hint" style={{ color: COLORS.forestMid, textAlign: "center" }}>E-mail reenviado.</p>}

      <div className="yc-demo-hint">
        <ShieldCheck size={13} />
        Já clicou no link? Esta tela atualiza sozinha assim que a conta é confirmada.
      </div>

      <button className="yc-save-btn" onClick={onGoToLogin} style={{ marginTop: 16 }}>
        Já confirmei, entrar <ArrowRight size={15} />
      </button>

      <p className="yc-auth-switch">
        Não recebeu o e-mail?{" "}
        {cooldown > 0 ? (
          <span>reenviar em {cooldown}s</span>
        ) : (
          <button type="button" className="yc-linklike" onClick={handleResend} disabled={resending}>
            <RefreshCw size={12} style={{ marginRight: 4, verticalAlign: -2 }} />
            {resending ? "Reenviando…" : "Reenviar e-mail"}
          </button>
        )}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------
   Mapa real — OpenStreetMap + localização GPS do celular
--------------------------------------------------------- */
function MapaScreen({ devices, onAddDevice }) {
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const { location: myLocation, status: locStatus, request: requestLocation } = useGeolocation();
  const mapRef = useRef(null);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const allPoints = useMemo(() => {
    return myLocation ? [...devices, { lat: myLocation.lat, lon: myLocation.lon }] : devices;
  }, [devices, myLocation]);

  const active =
    selected === "me" ? { name: "Você está aqui", location: myLocation ? `precisão ~${Math.round(myLocation.accuracy)} m` : "" } :
    devices.find((p) => p.id === selected);

  return (
    <div className="yc-map-wrap">
      <div className="yc-section-label">Mapa da propriedade</div>

      <div className="yc-map">
        <MapContainer
          className="yc-map-leaflet"
          center={[-14.235, -51.9253]}
          zoom={4}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
          <FitBounds points={allPoints} />
          <MapReadyBridge onReady={(map) => { mapRef.current = map; }} />

          {devices.map((d) => (
            <MapPinMarker key={d.id} point={d} selected={selected === d.id} onClick={() => setSelected(selected === d.id ? null : d.id)} />
          ))}
          {myLocation && (
            <MapPinMarker point={myLocation} kind="me" selected={selected === "me"} onClick={() => setSelected(selected === "me" ? null : "me")} />
          )}
        </MapContainer>

        <button
          className="yc-recenter-fab"
          onClick={() => fitMapToPoints(mapRef.current, allPoints)}
          aria-label="Centralizar mapa"
        >
          <LocateFixed size={17} strokeWidth={2.2} />
        </button>

        <button className="yc-fab" onClick={() => setShowAdd(true)} aria-label="Adicionar dispositivo">
          <Plus size={20} strokeWidth={2.4} />
        </button>
      </div>

      {devices.length === 0 && (
        <p className="yc-map-hint">Nenhum sensor cadastrado ainda — toque em "+" pra adicionar um.</p>
      )}
      {locStatus === "loading" && (
        <p className="yc-map-hint"><Loader2 size={12} className="yc-spin" style={{ marginRight: 5, verticalAlign: -2 }} />Melhorando a precisão do GPS…</p>
      )}
      {locStatus === "ok" && myLocation && myLocation.accuracy > 30 && (
        <p className="yc-map-hint">
          Precisão atual ~{Math.round(myLocation.accuracy)} m — depende do GPS do aparelho. Em notebook/desktop a localização vem do Wi-Fi e fica bem menos precisa; num celular, ao ar livre, costuma ficar entre 3–10 m.
        </p>
      )}
      {locStatus === "error" && (
        <p className="yc-map-hint" style={{ color: COLORS.alert }}>
          Não foi possível acessar sua localização.{" "}
          <button className="yc-linklike" onClick={requestLocation}>Tentar novamente</button>
        </p>
      )}

      <div className="yc-map-legend">
        <span><i style={{ background: COLORS.forestMid }} />Normal</span>
        <span><i style={{ background: COLORS.goldDim }} />Atenção</span>
        <span><i style={{ background: COLORS.forestBright, border: "1px solid #fff" }} />Você</span>
      </div>

      {active && (
        <div className="yc-map-popup">
          <div className="yc-card-icon" style={{ background: `${COLORS.forest}1A`, color: COLORS.forest }}>
            {active.icon ? <active.icon size={17} strokeWidth={1.9} /> : <RadioTower size={17} strokeWidth={1.9} />}
          </div>
          <div className="yc-card-info">
            <span className="yc-card-title" style={{ display: "block" }}>{active.name}</span>
            <span className="yc-card-loc">
              <MapPin size={11} style={{ marginRight: 3, verticalAlign: -1 }} />
              {active.location}
            </span>
          </div>
          {active.signal && <SignalBars level={active.signal} color={COLORS.forestMid} />}
          <button className="yc-map-popup-close" onClick={() => setSelected(null)} aria-label="Fechar">
            <X size={14} />
          </button>
        </div>
      )}
      {!active && <p className="yc-map-hint">Toque em um ponto no mapa para ver os detalhes.</p>}

      {showAdd && (
        <AddDeviceSheet
          onClose={() => setShowAdd(false)}
          myLocation={myLocation}
          locStatus={locStatus}
          requestLocation={requestLocation}
          onSave={(device) => {
            onAddDevice(device);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   App principal
--------------------------------------------------------- */
export default function YassenaCampoApp() {
  const [tab, setTab] = useState("painel");
  const [devices, setDevices] = useState([]);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState(null);
  const [authScreen, setAuthScreen] = useState("login"); // login | signup | verify

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        setAuthScreen("login");
        setPendingEmail(null);
      }
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    fetchProfile(session.user.id)
      .then((data) => { if (!cancelled) setProfile(data); })
      .catch(() => { if (!cancelled) setProfile(null); });
    return () => { cancelled = true; };
  }, [session]);

  useEffect(() => {
    if (!session) {
      setDevices([]);
      return;
    }
    let cancelled = false;
    listDevices()
      .then((rows) => { if (!cancelled) setDevices(rows.map((r) => ({ ...r, icon: iconForType(r.type) }))); })
      .catch(() => { if (!cancelled) setDevices([]); });
    const unsubscribe = subscribeToDevices(session.user.id, ({ eventType, new: newRow, old: oldRow }) => {
      setDevices((prev) => {
        if (eventType === "DELETE") return prev.filter((d) => d.id !== oldRow.id);
        const mapped = { ...newRow, icon: iconForType(newRow.type) };
        const exists = prev.some((d) => d.id === mapped.id);
        return exists ? prev.map((d) => (d.id === mapped.id ? mapped : d)) : [...prev, mapped];
      });
    });
    return () => { cancelled = true; unsubscribe(); };
  }, [session]);

  const user = session
    ? {
        email: session.user.email,
        name: profile?.name || "",
        farmName: profile?.farm_name || "",
        city: profile?.city || "",
        hectares: profile?.hectares || "",
        activity: profile?.activity || "",
        avatarUrl: profile?.avatar_url || null,
      }
    : null;

  const addDevice = (device) => { insertDevice(device).catch((err) => console.error(err)); };
  const handleLogout = () => { signOut(); setTab("painel"); setAuthScreen("login"); };
  const handleSignupSubmitted = (email) => { setPendingEmail(email); setAuthScreen("verify"); };
  const handleUpdateProfile = async ({ farmName, hectares }) => {
    await updateProfile(session.user.id, { farm_name: farmName, hectares: hectares || null });
    setProfile((p) => ({ ...p, farm_name: farmName, hectares: hectares || null }));
  };
  const handleUploadAvatar = async (file) => {
    const avatarUrl = await uploadAvatar(session.user.id, file);
    setProfile((p) => ({ ...p, avatar_url: avatarUrl }));
  };

  const TABS = [
    { id: "painel", label: "Painel", icon: LayoutGrid },
    { id: "mapa", label: "Mapa", icon: MapIcon },
    { id: "alertas", label: "Alertas", icon: Bell },
    { id: "sugestoes", label: "Sugestões", icon: Lightbulb },
    { id: "ajustes", label: "Ajustes", icon: Settings2 },
  ];

  return (
    <div className="yc-wrap">
      <style>{`
        ${FONTS}
        .yc-wrap{
          display:flex; justify-content:center;
          min-height: 100vh; min-height: 100dvh;
          background: ${COLORS.paper};
          font-family: 'IBM Plex Sans', sans-serif;
        }
        .yc-phone{
          width: 100%; max-width: 480px;
          min-height: 100vh; min-height: 100dvh;
          background: ${COLORS.paper};
          display:flex; flex-direction:column;
          position: relative;
          box-shadow: 0 0 40px rgba(11,42,17,0.08);
        }
        .yc-main{ display:flex; flex-direction:column; flex:1; min-width:0; }
        .yc-header{
          padding: calc(14px + env(safe-area-inset-top)) 20px 16px;
          display:flex; align-items:center; justify-content:space-between;
        }
        .yc-header-eyebrow{
          font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.12em; text-transform:uppercase;
          color:${COLORS.forestMid}; font-weight:600; display:flex; align-items:center; gap:6px;
        }
        .yc-header-title{
          font-family:'Space Grotesk',sans-serif; font-size:19px; font-weight:700; color:${COLORS.ink}; margin-top:2px;
        }
        .yc-header-badge{
          width:38px; height:38px; border-radius:10px; background:${COLORS.forestDeep};
          display:flex; align-items:center; justify-content:center; color:${COLORS.gold};
          font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:14px;
          overflow:hidden; flex-shrink:0;
        }
        .yc-header-badge img{ width:100%; height:100%; object-fit:cover; }
        .yc-screen{
          flex:1; overflow-y:auto; padding: 4px 16px 20px;
          scrollbar-width: none; position:relative;
        }
        .yc-screen::-webkit-scrollbar{ display:none; }

        .yc-section-label{
          font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:0.1em; text-transform:uppercase;
          color:${COLORS.inkSoft}; font-weight:600; margin-bottom:10px;
        }

        .yc-card-list{ display:flex; flex-direction:column; gap:10px; }

        .yc-card{
          background:#fff; border:1px solid rgba(20,33,20,0.10); border-radius:14px;
          transition: border-color .15s ease;
        }
        .yc-card-head{
          width:100%; display:flex; align-items:center; gap:11px; padding:12px 13px;
          background:none; border:none; cursor:pointer; text-align:left; font-family:inherit;
        }
        .yc-card-icon{
          width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }
        .yc-avatar-btn{
          position:relative; width:36px; height:36px; border-radius:999px; flex-shrink:0;
          background:${COLORS.gold}22; border:none; cursor:pointer; overflow:visible;
          display:flex; align-items:center; justify-content:center;
        }
        .yc-avatar-btn img{ width:100%; height:100%; border-radius:999px; object-fit:cover; }
        .yc-avatar-badge{
          position:absolute; right:-2px; bottom:-2px; width:16px; height:16px; border-radius:999px;
          background:${COLORS.forestDeep}; color:${COLORS.gold}; border:2px solid ${COLORS.paper};
          display:flex; align-items:center; justify-content:center;
        }
        .yc-card-info{ flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
        .yc-card-title-row{ display:flex; align-items:center; gap:6px; }
        .yc-card-title{ font-size:13.5px; font-weight:600; color:${COLORS.ink}; }
        .yc-card-loc{ font-size:11.5px; color:${COLORS.inkSoft}; }
        .yc-card-right{ display:flex; flex-direction:column; align-items:flex-end; gap:5px; }
        .yc-card-reading{ font-family:'IBM Plex Mono',monospace; font-size:13px; font-weight:600; color:${COLORS.ink}; }

        .yc-card-body{ padding: 0 15px 14px; }
        .yc-card-sub{ font-size:12px; color:${COLORS.inkSoft}; margin: 0 0 8px; }
        .yc-card-meta{
          display:flex; justify-content:space-between; margin-top:6px;
          font-family:'IBM Plex Mono',monospace; font-size:10px; color:${COLORS.inkSoft};
        }

        .yc-alert-item{ display:flex; align-items:center; gap:11px; padding:12px 13px; }
        .yc-alert-item-btn{
          width:100%; text-align:left; font:inherit; color:inherit; cursor:pointer;
        }

        .yc-tabbar{
          flex-shrink:0;
          display:flex; background:${COLORS.paper};
          border-top:1px solid rgba(20,33,20,0.08);
          padding: 10px 10px calc(52px + env(safe-area-inset-bottom));
        }
        .yc-tab{
          flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;
          background:none; border:none; cursor:pointer; padding:4px 0;
          color:${COLORS.inkSoft}; font-family:'IBM Plex Sans',sans-serif; font-size:10.5px; font-weight:500;
        }
        .yc-tab.active{ color:${COLORS.forestMid}; }
        .yc-tab-dot{
          width:4px; height:4px; border-radius:999px; background:${COLORS.forestMid};
          opacity:0; margin-top:-2px;
        }
        .yc-tab.active .yc-tab-dot{ opacity:1; }

        /* ===== Sidebar (site em telas largas) ===== */
        .yc-sidebar{ display:none; }
        .yc-sidebar-logo{
          display:flex; align-items:center; gap:10px; padding:4px 10px 22px;
          font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:14px; color:${COLORS.ink};
        }
        .yc-sidebar-logo img{ width:30px; height:30px; border-radius:8px; object-fit:cover; }
        .yc-sidebar-nav{ display:flex; flex-direction:column; gap:2px; }
        .yc-sidebar .yc-tab{
          flex-direction:row; justify-content:flex-start; gap:10px;
          padding:9px 12px; border-radius:10px; font-size:13px; font-weight:500;
        }
        .yc-sidebar .yc-tab.active{ background:${COLORS.forestMid}14; color:${COLORS.forestMid}; }
        .yc-sidebar .yc-tab-dot{ display:none; }

        @media (min-width: 900px){
          .yc-wrap{ background:${COLORS.paperDim}; }
          .yc-phone.yc-shell{
            max-width:1180px; flex-direction:row; box-shadow:0 0 0 1px rgba(20,33,20,0.06);
          }
          .yc-sidebar{
            display:flex; flex-direction:column; width:220px; flex-shrink:0;
            padding:22px 12px; border-right:1px solid rgba(20,33,20,0.08);
          }
          .yc-main{ flex:1; min-width:0; display:flex; flex-direction:column; }
          .yc-header{ padding:24px 36px 18px; }
          .yc-screen{ padding:8px 36px 40px; }
          .yc-tabbar{ display:none; }
          .yc-device-grid{
            display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:12px;
          }
        }

        /* ===== Mapa ===== */
        .yc-map-wrap{ display:flex; flex-direction:column; }
        .yc-map{
          position:relative; width:100%; aspect-ratio: 1 / 1.08;
          border-radius:16px; overflow:hidden; border:1px solid rgba(20,33,20,0.14);
          background:${COLORS.mist};
        }
        .yc-map-leaflet{ position:absolute; inset:0; width:100%; height:100%; background:${COLORS.mist}; }
        .yc-map-leaflet .leaflet-tile-pane{ filter:saturate(0.9); }
        .yc-map-leaflet .leaflet-control-attribution{
          font-size:9px; background:rgba(246,243,234,0.8);
        }
        .yc-leaflet-pin{ cursor:pointer; background:none; border:none; }
        .yc-map-pin-dot{
          border-radius:999px; display:flex; align-items:center; justify-content:center;
          box-shadow:0 2px 6px rgba(11,42,17,0.35);
          transition: transform .15s ease;
        }
        .yc-map-pin-dot.sel{ transform:scale(1.18); }
        .yc-map-pin-pulse{
          position:absolute; inset:-8px; border-radius:999px; border:1.5px solid;
          opacity:0.5; animation: mapPulse 2.4s ease-out infinite;
        }
        @keyframes mapPulse{
          0%{ transform:scale(0.7); opacity:0.55; }
          100%{ transform:scale(1.9); opacity:0; }
        }

        .yc-fab{
          position:absolute; right:12px; bottom:12px; width:42px; height:42px; border-radius:999px;
          background:${COLORS.gold}; color:${COLORS.forestDeep}; border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 8px 18px -6px rgba(0,0,0,0.4); z-index:1200;
        }
        .yc-recenter-fab{
          position:absolute; right:12px; bottom:62px; width:36px; height:36px; border-radius:999px;
          background:#fff; color:${COLORS.forest}; border:1px solid rgba(20,33,20,0.14); cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 6px 14px -6px rgba(0,0,0,0.35); z-index:1200;
        }

        .yc-map-legend{
          display:flex; gap:12px; margin-top:12px; flex-wrap:wrap;
          font-size:10.5px; color:${COLORS.inkSoft};
        }
        .yc-map-legend span{ display:flex; align-items:center; gap:5px; }
        .yc-map-legend i{ width:8px; height:8px; border-radius:999px; display:inline-block; }

        .yc-map-popup{
          margin-top:12px; display:flex; align-items:center; gap:11px;
          background:#fff; border:1px solid rgba(20,33,20,0.10); border-radius:14px;
          padding:12px 13px; position:relative;
        }
        .yc-map-popup-close{
          position:absolute; top:8px; right:8px; background:none; border:none; cursor:pointer;
          color:${COLORS.inkSoft}; padding:4px;
        }
        .yc-map-hint{
          margin-top:12px; font-size:11.5px; color:${COLORS.inkSoft}; text-align:center;
        }
        .yc-linklike{
          background:none; border:none; padding:0; color:${COLORS.forest}; text-decoration:underline;
          font-size:inherit; cursor:pointer; font-family:inherit;
        }
        .yc-spin{ animation: spin 1s linear infinite; }
        @keyframes spin{ to{ transform:rotate(360deg); } }

        /* ===== Sheet: adicionar dispositivo ===== */
        .yc-sheet-backdrop{
          position:absolute; inset:0; background:rgba(11,42,17,0.45);
          display:flex; align-items:flex-end; z-index:2000;
        }
        .yc-sheet{
          width:100%; background:${COLORS.paper}; border-radius:20px 20px 0 0;
          padding:10px 18px 20px; max-height:88%; overflow-y:auto;
        }
        .yc-sheet-handle{ width:36px; height:4px; border-radius:999px; background:rgba(20,33,20,0.18); margin:2px auto 12px; }
        .yc-sheet-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
        .yc-sheet-title{ font-family:'Space Grotesk',sans-serif; font-size:16.5px; font-weight:700; color:${COLORS.ink}; }
        .yc-icon-btn{ background:rgba(20,33,20,0.06); border:none; border-radius:8px; padding:6px; cursor:pointer; color:${COLORS.inkSoft}; }

        .yc-field-label{
          display:block; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase;
          color:${COLORS.inkSoft}; font-weight:600; margin-bottom:6px;
        }
        .yc-input{
          width:100%; border:1px solid rgba(20,33,20,0.15); border-radius:10px; padding:10px 12px;
          font-family:'IBM Plex Sans',sans-serif; font-size:13.5px; color:${COLORS.ink}; background:#fff;
        }
        .yc-input:focus{ outline:2px solid ${COLORS.forestMid}; outline-offset:1px; }

        .yc-type-grid{ display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .yc-type-btn{
          display:flex; align-items:center; gap:8px; text-align:left;
          border:1px solid rgba(20,33,20,0.15); background:#fff; border-radius:10px; padding:9px 10px;
          font-size:11.5px; color:${COLORS.ink}; cursor:pointer;
        }
        .yc-type-btn.active{ border-color:${COLORS.forestMid}; background:${COLORS.forestMid}12; color:${COLORS.forest}; font-weight:600; }

        .yc-locate-btn{
          width:100%; display:flex; align-items:center; gap:8px; justify-content:center;
          border:1px dashed ${COLORS.forestMid}; background:${COLORS.forestMid}0F; color:${COLORS.forest};
          border-radius:10px; padding:11px; font-size:12.5px; font-weight:600; cursor:pointer;
        }
        .yc-locate-btn:disabled{ opacity:0.7; cursor:default; }
        .yc-field-hint{ font-size:11px; color:${COLORS.inkSoft}; margin-top:6px; }
        .yc-code-block{
          display:block; width:100%; box-sizing:border-box; margin-top:4px;
          background:${COLORS.ink}; color:${COLORS.forestBright};
          font-family:'IBM Plex Mono',monospace; font-size:10.5px; line-height:1.5;
          padding:9px 11px; border-radius:8px; overflow-x:auto;
          -webkit-user-select:all; user-select:all;
        }
        .yc-integration-row{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:4px; }

        .yc-save-btn{
          width:100%; margin-top:18px; background:${COLORS.gold}; color:${COLORS.forestDeep};
          border:none; border-radius:12px; padding:13px; font-weight:700; font-size:14px; cursor:pointer;
          font-family:'Space Grotesk',sans-serif;
        }
        .yc-save-btn:disabled{ opacity:0.4; cursor:not-allowed; }

        /* ===== Autenticação ===== */
        .yc-auth-header{
          text-align:center; padding: calc(30px + env(safe-area-inset-top)) 24px 26px;
          background: radial-gradient(ellipse 140% 100% at 50% 0%, ${COLORS.forest} 0%, ${COLORS.forestDeep} 100%);
        }
        .yc-auth-logo{
          width:72px; height:72px; border-radius:18px; overflow:hidden;
          margin:0 auto 14px; box-shadow:0 12px 26px -8px rgba(0,0,0,0.55);
        }
        .yc-auth-logo img{ width:100%; height:100%; object-fit:cover; display:block; }
        .yc-auth-hero-sub{
          font-size:12px; color:rgba(246,243,234,0.72); margin-top:8px; line-height:1.5;
          max-width:260px; margin-left:auto; margin-right:auto;
        }
        .yc-auth-header .yc-header-eyebrow{ color:${COLORS.gold}; }
        .yc-auth-header .yc-header-title{ color:#fff; }
        .yc-auth-body{ display:flex; flex-direction:column; padding-bottom:20px; }
        .yc-auth-lead{ font-size:12.5px; color:${COLORS.inkSoft}; margin-bottom:16px; line-height:1.5; }
        .yc-auth-row2{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }

        .yc-auth-field{
          display:flex; align-items:center; gap:8px;
          border:1px solid rgba(20,33,20,0.15); border-radius:10px; padding:0 12px;
          background:#fff;
        }
        .yc-auth-field:focus-within{ outline:2px solid ${COLORS.forestMid}; outline-offset:1px; }
        .yc-auth-field-icon{ color:${COLORS.inkSoft}; flex-shrink:0; }
        .yc-auth-input{
          flex:1; min-width:0; border:none; outline:none; padding:10px 0;
          font-family:'IBM Plex Sans',sans-serif; font-size:13.5px; color:${COLORS.ink}; background:transparent;
        }
        .yc-auth-select{ appearance:none; -webkit-appearance:none; cursor:pointer; }
        .yc-eye-btn{ background:none; border:none; cursor:pointer; color:${COLORS.inkSoft}; padding:4px; flex-shrink:0; }

        .yc-checkbox-row{
          display:flex; align-items:flex-start; gap:9px; background:none; border:none; cursor:pointer;
          text-align:left; padding:0; font-size:12px; color:${COLORS.inkSoft}; line-height:1.4;
        }

        .yc-auth-switch{ text-align:center; font-size:12.5px; color:${COLORS.inkSoft}; margin-top:16px; }

        .yc-greeting{
          font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:600; color:${COLORS.ink};
          margin: 6px 0 2px;
        }

        .yc-logout-btn{
          width:100%; margin-top:22px; display:flex; align-items:center; justify-content:center; gap:8px;
          background:none; border:1px solid rgba(184,80,63,0.35); color:${COLORS.alert};
          border-radius:12px; padding:12px; font-size:13px; font-weight:600; cursor:pointer;
          font-family:'IBM Plex Sans',sans-serif;
        }

        .yc-back-link{
          display:flex; align-items:center; gap:5px; margin-bottom:16px; font-size:12.5px;
        }
        .yc-verify-icon{
          width:52px; height:52px; border-radius:999px; background:${COLORS.forestDeep};
          display:flex; align-items:center; justify-content:center; margin:0 auto 16px;
        }
        .yc-demo-hint{
          display:flex; align-items:center; gap:7px; justify-content:center; text-align:center;
          background:${COLORS.gold}17; border:1px solid ${COLORS.gold}55; color:${COLORS.goldDim};
          font-size:11.5px; font-weight:600; padding:9px 12px; border-radius:10px; margin-top:14px;
        }
      `}</style>

      <div className={`yc-phone${!authLoading && user ? " yc-shell" : ""}`}>
        {authLoading ? (
          <div className="yc-screen" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Loader2 size={22} className="yc-spin" color={COLORS.forestMid} />
          </div>
        ) : !user ? (
          <>
            <div className="yc-auth-header">
              <div className="yc-auth-logo">
                <img src="/logo.png" alt="Yassena" />
              </div>
              <div className="yc-header-eyebrow" style={{ justifyContent: "center" }}><ShieldCheck size={11} />Acesso seguro</div>
              <div className="yc-header-title" style={{ fontSize: 21 }}>
                {authScreen === "login" ? "Bem-vindo de volta" : authScreen === "verify" ? "Confirme seu e-mail" : "Criar conta Yassena"}
              </div>
              {authScreen !== "verify" && (
                <p className="yc-auth-hero-sub">
                  Monitore sensores, controle sua fazenda remotamente e acompanhe tudo em tempo real, de onde você estiver.
                </p>
              )}
            </div>
            <div className="yc-screen">
              {authScreen === "login" && (
                <LoginScreen onSwitch={() => setAuthScreen("signup")} />
              )}
              {authScreen === "signup" && (
                <SignupScreen onSwitch={() => setAuthScreen("login")} onSuccess={handleSignupSubmitted} />
              )}
              {authScreen === "verify" && (
                <VerifyEmailScreen
                  email={pendingEmail}
                  onBack={() => setAuthScreen("signup")}
                  onGoToLogin={() => setAuthScreen("login")}
                />
              )}
            </div>
          </>
        ) : (
          <>
            <div className="yc-sidebar">
              <div className="yc-sidebar-logo">
                <img src="/logo.png" alt="" />
                <span>Yassena Campo</span>
              </div>
              <nav className="yc-sidebar-nav">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.id;
                  return (
                    <button key={t.id} className={`yc-tab ${active ? "active" : ""}`} onClick={() => setTab(t.id)}>
                      <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                      {t.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="yc-main">
              <div className="yc-header">
                <div>
                  <div className="yc-header-eyebrow"><RadioTower size={11} />Yassena Campo</div>
                  <div className="yc-header-title">{user.farmName || "Minha Fazenda"}</div>
                </div>
                <div className="yc-header-badge">
                  {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initialsFor(user.farmName || user.name)}
                </div>
              </div>

              <div className="yc-screen">
                {tab === "painel" && <PainelScreen devices={devices} user={user} />}
                {tab === "mapa" && <MapaScreen devices={devices} onAddDevice={addDevice} />}
                {tab === "alertas" && <AlertasScreen />}
                {tab === "sugestoes" && <SugestoesScreen user={user} />}
                {tab === "ajustes" && (
                  <AjustesScreen
                    devices={devices}
                    user={user}
                    onLogout={handleLogout}
                    onUpdateProfile={handleUpdateProfile}
                    onUploadAvatar={handleUploadAvatar}
                  />
                )}
              </div>
            </div>

            <div className="yc-tabbar">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button key={t.id} className={`yc-tab ${active ? "active" : ""}`} onClick={() => setTab(t.id)}>
                    <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
                    {t.label}
                    <span className="yc-tab-dot" />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
