import { useState, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════
// APPLE DESIGN SYSTEM
// ═══════════════════════════════════════════

const C = {
  bg: "#000000",
  surface: "#0d0d0d",
  surface2: "#161616",
  surface3: "#1c1c1e",
  card: "#1c1c1e",
  border: "rgba(255,255,255,0.08)",
  borderLight: "rgba(255,255,255,0.12)",
  text: "#f5f5f7",
  textSecondary: "#86868b",
  textTertiary: "#48484a",
  accent: "#0a84ff",
  green: "#30d158",
  red: "#ff453a",
  orange: "#ff9f0a",
  purple: "#bf5af2",
  teal: "#64d2ff",
  yellow: "#ffd60a",
  pink: "#ff375f",
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: C.purple },
  { value: "briefing", label: "Briefing Sent", color: C.teal },
  { value: "filming", label: "Filming", color: C.orange },
  { value: "shipped", label: "Shipped", color: C.accent },
  { value: "in_transit", label: "In Transit", color: C.yellow },
  { value: "delivered", label: "Delivered", color: C.green },
  { value: "editing", label: "Editing", color: C.pink },
  { value: "completed", label: "Completed", color: C.green },
  { value: "issue", label: "Issue", color: C.red },
];

const globalCSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: ${C.bg}; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif; -webkit-font-smoothing: antialiased; }
  ::selection { background: ${C.accent}40; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.textTertiary}; border-radius: 3px; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  .fade-in { animation: fadeIn 0.4s ease-out forwards; }
`;

const genId = () => Math.random().toString(36).substring(2, 10);
const genToken = () => Math.random().toString(36).substring(2, 14);

function getStatusInfo(val) {
  return STATUS_OPTIONS.find(s => s.value === val) || STATUS_OPTIONS[0];
}

function extract17TrackUrl(link) {
  if (!link) return null;
  const num = link.replace(/.*nums=/, "").replace(/[&?#].*/, "").trim();
  if (num && num.length > 5) return `https://t.17track.net/en#nums=${num}`;
  if (/^[A-Za-z0-9]{8,}$/.test(link.trim())) return `https://t.17track.net/en#nums=${link.trim()}`;
  if (link.includes("17track")) return link;
  return null;
}

// ═══════════════════════════════════════════
// API HELPERS
// ═══════════════════════════════════════════

async function loadData() {
  try {
    const res = await fetch("/api/data");
    if (!res.ok) throw new Error("Load failed");
    return await res.json();
  } catch (e) {
    console.error("Load error:", e);
    return { clients: [], concepts: [] };
  }
}

async function saveData(newData) {
  try {
    const res = await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Save failed"); }
    return true;
  } catch (e) { console.error("Save error:", e); return false; }
}

// ═══════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════

function Badge({ status }) {
  const info = getStatusInfo(status);
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, color: info.color,
      background: info.color + "15", padding: "4px 12px", borderRadius: 20,
      border: `1px solid ${info.color}30`, letterSpacing: "-0.01em", whiteSpace: "nowrap",
    }}>{info.label}</span>
  );
}

function Button({ children, onClick, variant = "secondary", size = "md", disabled, fullWidth }) {
  const variants = {
    primary: { background: C.accent, color: "#fff", border: "none" },
    secondary: { background: C.surface3, color: C.text, border: `1px solid ${C.border}` },
    ghost: { background: "transparent", color: C.textSecondary, border: "none" },
    danger: { background: C.red + "18", color: C.red, border: `1px solid ${C.red}30` },
  };
  const sizes = {
    sm: { padding: "6px 14px", fontSize: 12 },
    md: { padding: "10px 20px", fontSize: 14 },
    lg: { padding: "14px 28px", fontSize: 15 },
  };
  const v = variants[variant]; const s = sizes[size];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...s, fontFamily: "inherit", fontWeight: 500, borderRadius: 10,
      cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.35 : 1,
      transition: "all 0.2s ease", width: fullWidth ? "100%" : "auto",
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      background: v.background, color: v.color, border: v.border || "none",
      letterSpacing: "-0.01em",
    }}>{children}</button>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", textarea }) {
  const shared = {
    width: "100%", fontFamily: "inherit", fontSize: 14, color: C.text,
    background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10,
    padding: "12px 16px", outline: "none", transition: "border-color 0.2s ease",
  };
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.textSecondary, marginBottom: 6 }}>{label}</label>}
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
          style={{ ...shared, resize: "vertical" }}
          onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={shared}
          onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border} />
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.textSecondary, marginBottom: 6 }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{
          fontFamily: "inherit", fontSize: 14, color: C.text, background: C.surface2,
          border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px",
          width: "100%", outline: "none", cursor: "pointer",
        }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function StatusPill({ status, active, onClick }) {
  const info = getStatusInfo(status);
  return (
    <button onClick={onClick} style={{
      fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 16,
      cursor: "pointer", transition: "all 0.15s ease", fontFamily: "inherit",
      background: active ? info.color + "18" : "transparent",
      color: active ? info.color : C.textTertiary,
      border: `1px solid ${active ? info.color + "40" : C.border}`,
    }}>{info.label}</button>
  );
}

function Modal({ children, onClose, title }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(8px)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} className="fade-in" style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20,
        width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{
          padding: "20px 24px", borderBottom: `1px solid ${C.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: C.text, letterSpacing: "-0.02em" }}>{title}</div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 14, background: C.surface3,
            border: "none", color: C.textSecondary, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: C.card, borderRadius: 14, padding: "16px 18px", flex: 1, minWidth: 100,
      border: `1px solid ${C.border}`,
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || C.text, letterSpacing: "-0.03em" }}>{value}</div>
      <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function ProgressBar({ current, total }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div style={{ height: 4, background: C.surface3, borderRadius: 2, width: "100%", overflow: "hidden" }}>
      <div style={{ height: "100%", background: C.accent, borderRadius: 2, width: `${pct}%`, transition: "width 0.4s ease" }} />
    </div>
  );
}

// ═══════════════════════════════════════════
// CLIENT VIEW (read-only share link)
// ═══════════════════════════════════════════

function ClientView({ client, concepts }) {
  const completed = concepts.filter(c => c.status === "completed").length;
  const total = concepts.length;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <style>{globalCSS}</style>
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(0,0,0,0.72)", backdropFilter: "blur(20px) saturate(180%)",
        borderBottom: `1px solid ${C.border}`, padding: "0 28px",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", height: 52, display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em" }}>UGC Tracker</span>
          <span style={{ fontSize: 12, color: C.textTertiary, marginLeft: 10 }}>D-DOUBLEU MEDIA</span>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 28px" }} className="fade-in">
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 4 }}>{client.name}</h1>
        <p style={{ fontSize: 15, color: C.textSecondary, marginBottom: 20 }}>
          {completed} of {total} concepts completed · {client.totalConcepts} total ordered
        </p>
        <ProgressBar current={completed} total={total} />

        <div style={{ marginTop: 28 }}>
          {concepts.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: C.textTertiary, fontSize: 14 }}>No concepts added yet</div>
          ) : concepts.map(concept => (
            <div key={concept.id} style={{
              background: C.card, borderRadius: 16, border: `1px solid ${C.border}`,
              marginBottom: 10, padding: "18px 22px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                <Badge status={concept.status} />
                <div style={{ fontSize: 16, fontWeight: 600, flex: 1 }}>{concept.creatorName || "Unnamed Creator"}</div>
                <div style={{ fontSize: 12, color: C.textTertiary }}>Batch {concept.batchNumber || "—"}</div>
              </div>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, marginBottom: 2 }}>Concepts</div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{concept.conceptCount || "—"}</div>
                </div>
                {concept.trackingLink && (
                  <div>
                    <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, marginBottom: 2 }}>Tracking</div>
                    <a href={extract17TrackUrl(concept.trackingLink) || concept.trackingLink} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: C.accent, textDecoration: "none", fontWeight: 500 }}>
                      Track Package
                    </a>
                  </div>
                )}
              </div>
              {concept.brief && (
                <div style={{ padding: "12px 14px", background: C.surface2, borderRadius: 10, marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, marginBottom: 4 }}>Brief</div>
                  <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{concept.brief}</div>
                </div>
              )}
              {concept.notes && (
                <div style={{ marginTop: 8, fontSize: 13, color: C.textTertiary, fontStyle: "italic" }}>{concept.notes}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <footer style={{ padding: "24px 28px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: C.textTertiary }}>Managed by D-DOUBLEU MEDIA</p>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════

export default function UGCTracker() {
  const [data, setData] = useState({ clients: [], concepts: [] });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("clients");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewConcept, setShowNewConcept] = useState(false);
  const [editConcept, setEditConcept] = useState(null);
  const [shareModal, setShareModal] = useState(null);
  const [copied, setCopied] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientConceptsCount, setClientConceptsCount] = useState("");
  const [cCreator, setCCreator] = useState("");
  const [cCount, setCCount] = useState("");
  const [cBrief, setCBrief] = useState("");
  const [cBatch, setCBatch] = useState("");
  const [cTracking, setCTracking] = useState("");
  const [cStatus, setCStatus] = useState("pending");
  const [cNotes, setCNotes] = useState("");
  const [shareView, setShareView] = useState(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#share/")) setShareView(hash.replace("#share/", ""));
    const onHash = () => {
      const h = window.location.hash;
      if (h.startsWith("#share/")) setShareView(h.replace("#share/", "")); else setShareView(null);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    loadData().then(d => { setData(d); setLoaded(true); });
  }, []);

  // Auto-refresh for share views
  useEffect(() => {
    if (!shareView) return;
    const interval = setInterval(() => { loadData().then(d => setData(d)); }, 30000);
    return () => clearInterval(interval);
  }, [shareView]);

  const save = useCallback(async (newData) => {
    setData(newData); setSaving(true);
    await saveData(newData);
    setSaving(false);
  }, []);

  const addClient = () => {
    if (!clientName.trim()) return;
    const nc = { id: genId(), name: clientName.trim(), totalConcepts: parseInt(clientConceptsCount) || 0, shareToken: genToken(), createdAt: new Date().toISOString() };
    save({ ...data, clients: [...data.clients, nc] });
    setClientName(""); setClientConceptsCount(""); setShowNewClient(false);
  };
  const deleteClient = (id) => {
    if (!confirm("Delete this client and all concepts?")) return;
    save({ clients: data.clients.filter(c => c.id !== id), concepts: data.concepts.filter(c => c.clientId !== id) });
    if (selectedClient?.id === id) { setSelectedClient(null); setView("clients"); }
  };
  const resetForm = () => { setCCreator(""); setCCount(""); setCBrief(""); setCBatch(""); setCTracking(""); setCStatus("pending"); setCNotes(""); };
  const addConcept = () => {
    if (!cCreator.trim()) return;
    const nc = { id: genId(), clientId: selectedClient.id, creatorName: cCreator.trim(), conceptCount: parseInt(cCount) || 1, brief: cBrief, batchNumber: cBatch, trackingLink: cTracking, status: cStatus, notes: cNotes, createdAt: new Date().toISOString() };
    save({ ...data, concepts: [...data.concepts, nc] });
    resetForm(); setShowNewConcept(false);
  };
  const updateConcept = () => {
    if (!editConcept) return;
    const updated = data.concepts.map(c => c.id === editConcept.id ? { ...c, creatorName: cCreator, conceptCount: parseInt(cCount) || 1, brief: cBrief, batchNumber: cBatch, trackingLink: cTracking, status: cStatus, notes: cNotes } : c);
    save({ ...data, concepts: updated });
    resetForm(); setEditConcept(null);
  };
  const deleteConcept = (id) => { save({ ...data, concepts: data.concepts.filter(c => c.id !== id) }); };
  const openEdit = (concept) => {
    setCCreator(concept.creatorName); setCCount(String(concept.conceptCount || ""));
    setCBrief(concept.brief || ""); setCBatch(concept.batchNumber || "");
    setCTracking(concept.trackingLink || ""); setCStatus(concept.status || "pending");
    setCNotes(concept.notes || ""); setEditConcept(concept);
  };
  const quickStatus = (cid, s) => {
    const updated = data.concepts.map(c => c.id === cid ? { ...c, status: s } : c);
    save({ ...data, concepts: updated });
  };
  const getShareUrl = (client) => `${window.location.origin}${window.location.pathname}#share/${client.shareToken}`;
  const copyShareLink = (client) => { navigator.clipboard.writeText(getShareUrl(client)); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  // SHARE VIEW
  if (shareView) {
    if (!loaded) return <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><style>{globalCSS}</style><div style={{ fontSize: 14, color: C.textTertiary }}>Loading...</div></div>;
    const client = data.clients.find(c => c.shareToken === shareView);
    if (!client) return <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><style>{globalCSS}</style><div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 8 }}>Link not found</div><div style={{ fontSize: 14, color: C.textTertiary }}>This share link may have expired.</div></div></div>;
    const concepts = data.concepts.filter(c => c.clientId === client.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return <ClientView client={client} concepts={concepts} />;
  }

  if (!loaded) return <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><style>{globalCSS}</style><div style={{ fontSize: 14, color: C.textTertiary }}>Loading...</div></div>;

  const clientConcepts = selectedClient ? data.concepts.filter(c => c.clientId === selectedClient.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <style>{globalCSS}</style>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(0,0,0,0.72)", backdropFilter: "blur(20px) saturate(180%)",
        borderBottom: `1px solid ${C.border}`, padding: "0 28px",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em" }}>UGC Tracker</span>
            {saving && <span style={{ fontSize: 12, color: C.accent, animation: "pulse 1s infinite" }}>Saving</span>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {view === "client_detail" && selectedClient && (
              <>
                <Button variant="ghost" size="sm" onClick={() => { setView("clients"); setSelectedClient(null); }}>Back</Button>
                <Button variant="secondary" size="sm" onClick={() => setShareModal(selectedClient)}>Share</Button>
                <Button variant="primary" size="sm" onClick={() => { resetForm(); setShowNewConcept(true); }}>Add Concept</Button>
              </>
            )}
            {view === "clients" && <Button variant="primary" size="sm" onClick={() => setShowNewClient(true)}>New Client</Button>}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 28px" }}>

        {/* CLIENTS LIST */}
        {view === "clients" && (
          <div className="fade-in">
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 24 }}>Clients</h1>
            {data.clients.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.textSecondary, marginBottom: 8 }}>No clients yet</div>
                <div style={{ fontSize: 14, color: C.textTertiary, marginBottom: 24 }}>Add your first client to start tracking</div>
                <Button variant="primary" size="lg" onClick={() => setShowNewClient(true)}>New Client</Button>
              </div>
            ) : data.clients.map(client => {
              const concepts = data.concepts.filter(c => c.clientId === client.id);
              const completed = concepts.filter(c => c.status === "completed").length;
              const inTransit = concepts.filter(c => ["shipped", "in_transit"].includes(c.status)).length;
              const issues = concepts.filter(c => c.status === "issue").length;
              return (
                <div key={client.id}
                  onClick={() => { setSelectedClient(client); setView("client_detail"); }}
                  style={{
                    background: C.card, borderRadius: 16, border: `1px solid ${C.border}`,
                    marginBottom: 8, padding: "20px 24px", cursor: "pointer",
                    transition: "border-color 0.15s ease, transform 0.15s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderLight; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 4 }}>{client.name}</div>
                      <div style={{ fontSize: 13, color: C.textTertiary }}>
                        {concepts.length} concepts · {client.totalConcepts} ordered
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      {completed > 0 && <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: C.green }}>{completed}</div><div style={{ fontSize: 10, color: C.textTertiary }}>Done</div></div>}
                      {inTransit > 0 && <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: C.accent }}>{inTransit}</div><div style={{ fontSize: 10, color: C.textTertiary }}>Shipping</div></div>}
                      {issues > 0 && <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: C.red }}>{issues}</div><div style={{ fontSize: 10, color: C.textTertiary }}>Issues</div></div>}
                      <div style={{ width: 80 }}><ProgressBar current={completed} total={concepts.length} /></div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textTertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CLIENT DETAIL */}
        {view === "client_detail" && selectedClient && (
          <div className="fade-in">
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 4 }}>{selectedClient.name}</h1>
                <p style={{ fontSize: 14, color: C.textTertiary }}>
                  {clientConcepts.length} concepts tracked · {selectedClient.totalConcepts} ordered
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={() => deleteClient(selectedClient.id)}>Delete Client</Button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              <StatCard label="Total" value={clientConcepts.length} />
              <StatCard label="Completed" value={clientConcepts.filter(c => c.status === "completed").length} color={C.green} />
              <StatCard label="In Transit" value={clientConcepts.filter(c => ["shipped", "in_transit"].includes(c.status)).length} color={C.accent} />
              <StatCard label="Filming" value={clientConcepts.filter(c => c.status === "filming").length} color={C.orange} />
              <StatCard label="Issues" value={clientConcepts.filter(c => c.status === "issue").length} color={C.red} />
            </div>

            {clientConcepts.length === 0 ? (
              <div style={{ textAlign: "center", padding: 48, background: C.card, borderRadius: 16, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 14, color: C.textTertiary, marginBottom: 16 }}>No concepts yet</div>
                <Button variant="primary" onClick={() => { resetForm(); setShowNewConcept(true); }}>Add First Concept</Button>
              </div>
            ) : clientConcepts.map(concept => (
              <div key={concept.id} style={{
                background: C.card, borderRadius: 16, border: `1px solid ${C.border}`,
                marginBottom: 8, padding: "18px 22px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                  <Badge status={concept.status} />
                  <div style={{ fontSize: 16, fontWeight: 600, flex: 1, minWidth: 150 }}>{concept.creatorName || "Unnamed"}</div>
                  <div style={{ fontSize: 12, color: C.textTertiary }}>Batch {concept.batchNumber || "—"}</div>
                  <div style={{ fontSize: 12, color: C.textTertiary }}>{concept.conceptCount || 1} concepts</div>
                </div>

                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
                  {STATUS_OPTIONS.map(s => (
                    <StatusPill key={s.value} status={s.value} active={concept.status === s.value}
                      onClick={() => quickStatus(concept.id, s.value)} />
                  ))}
                </div>

                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {concept.trackingLink && (
                    <a href={extract17TrackUrl(concept.trackingLink) || concept.trackingLink} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: C.accent, textDecoration: "none", fontWeight: 500 }}>
                      Track on 17track
                    </a>
                  )}
                  {concept.brief && (
                    <div style={{ flex: 1, minWidth: 200, padding: "10px 14px", background: C.surface2, borderRadius: 10, marginTop: 4 }}>
                      <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, marginBottom: 4 }}>Brief</div>
                      <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{concept.brief}</div>
                    </div>
                  )}
                </div>
                {concept.notes && (
                  <div style={{ marginTop: 8, fontSize: 13, color: C.textTertiary, fontStyle: "italic" }}>{concept.notes}</div>
                )}

                <div style={{ display: "flex", gap: 8, marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                  <Button variant="secondary" size="sm" onClick={() => openEdit(concept)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteConcept(concept.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALS */}
      {showNewClient && (
        <Modal title="New Client" onClose={() => setShowNewClient(false)}>
          <Input label="Client Name" value={clientName} onChange={setClientName} placeholder="Brand name" />
          <Input label="Total UGC Concepts Ordered" value={clientConceptsCount} onChange={setClientConceptsCount} placeholder="e.g. 10" type="number" />
          <div style={{ marginTop: 8 }}>
            <Button variant="primary" fullWidth onClick={addClient} disabled={!clientName.trim()}>Create Client</Button>
          </div>
        </Modal>
      )}

      {showNewConcept && (
        <Modal title="Add Concept" onClose={() => { setShowNewConcept(false); resetForm(); }}>
          <Input label="Creator Name" value={cCreator} onChange={setCCreator} placeholder="Creator's name" />
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><Input label="# of Concepts" value={cCount} onChange={setCCount} placeholder="1" type="number" /></div>
            <div style={{ flex: 1 }}><Input label="Batch Number" value={cBatch} onChange={setCBatch} placeholder="e.g. B1" /></div>
          </div>
          <Select label="Status" value={cStatus} onChange={setCStatus} options={STATUS_OPTIONS} />
          <Input label="Tracking Link / Number" value={cTracking} onChange={setCTracking} placeholder="Tracking # or 17track URL" />
          <Input label="Brief" value={cBrief} onChange={setCBrief} placeholder="Brief description" textarea />
          <Input label="Notes" value={cNotes} onChange={setCNotes} placeholder="Internal notes" textarea />
          <Button variant="primary" fullWidth onClick={addConcept} disabled={!cCreator.trim()}>Add Concept</Button>
        </Modal>
      )}

      {editConcept && (
        <Modal title="Edit Concept" onClose={() => { setEditConcept(null); resetForm(); }}>
          <Input label="Creator Name" value={cCreator} onChange={setCCreator} placeholder="Creator's name" />
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><Input label="# of Concepts" value={cCount} onChange={setCCount} placeholder="1" type="number" /></div>
            <div style={{ flex: 1 }}><Input label="Batch Number" value={cBatch} onChange={setCBatch} placeholder="e.g. B1" /></div>
          </div>
          <Select label="Status" value={cStatus} onChange={setCStatus} options={STATUS_OPTIONS} />
          <Input label="Tracking Link / Number" value={cTracking} onChange={setCTracking} placeholder="Tracking # or 17track URL" />
          <Input label="Brief" value={cBrief} onChange={setCBrief} placeholder="Brief description" textarea />
          <Input label="Notes" value={cNotes} onChange={setCNotes} placeholder="Internal notes" textarea />
          <Button variant="primary" fullWidth onClick={updateConcept}>Save Changes</Button>
        </Modal>
      )}

      {shareModal && (
        <Modal title="Share with Client" onClose={() => { setShareModal(null); setCopied(false); }}>
          <p style={{ fontSize: 14, color: C.textSecondary, marginBottom: 16, lineHeight: 1.5 }}>
            Send this link to <strong style={{ color: C.text }}>{shareModal.name}</strong>. They'll see a read-only view of their progress.
          </p>
          <div style={{
            background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: "12px 16px", fontSize: 13, color: C.accent, wordBreak: "break-all", marginBottom: 16,
          }}>
            {getShareUrl(shareModal)}
          </div>
          <Button variant="primary" fullWidth onClick={() => copyShareLink(shareModal)}>
            {copied ? "Copied" : "Copy Link"}
          </Button>
        </Modal>
      )}

      <footer style={{ padding: "24px 28px", textAlign: "center", marginTop: 40 }}>
        <p style={{ fontSize: 12, color: C.textTertiary }}>UGC Tracker · D-DOUBLEU MEDIA</p>
      </footer>
    </div>
  );
}
