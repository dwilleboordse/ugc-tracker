import { useState, useEffect, useCallback } from "react";

const T = {
  bg: "#09090b", surface: "#131316", surface2: "#1a1a1f", surface3: "#222228",
  border: "#2a2a30", borderLight: "#38383f", text: "#f0f0f2", textSoft: "#a0a0a8",
  textDim: "#606068", accent: "#e8ff47", accentDim: "#a3b832", accentBg: "rgba(232,255,71,0.06)",
  shipped: "#3b82f6", shippedBg: "rgba(59,130,246,0.1)",
  transit: "#f59e0b", transitBg: "rgba(245,158,11,0.1)",
  delivered: "#22c55e", deliveredBg: "rgba(34,197,94,0.1)",
  pending: "#8b5cf6", pendingBg: "rgba(139,92,246,0.1)",
  issue: "#ef4444", issueBg: "rgba(239,68,68,0.1)",
};

const mono = "'JetBrains Mono', 'IBM Plex Mono', monospace";
const sans = "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: T.pending, bg: T.pendingBg },
  { value: "briefing", label: "Briefing Sent", color: T.accent, bg: T.accentBg },
  { value: "filming", label: "Filming", color: T.transit, bg: T.transitBg },
  { value: "shipped", label: "Shipped", color: T.shipped, bg: T.shippedBg },
  { value: "in_transit", label: "In Transit", color: T.transit, bg: T.transitBg },
  { value: "delivered", label: "Delivered", color: T.delivered, bg: T.deliveredBg },
  { value: "editing", label: "Editing", color: T.accent, bg: T.accentBg },
  { value: "completed", label: "Completed", color: T.delivered, bg: T.deliveredBg },
  { value: "issue", label: "Issue", color: T.issue, bg: T.issueBg },
];

const genId = () => Math.random().toString(36).substring(2, 10);
const genToken = () => Math.random().toString(36).substring(2, 14);

function getStatusInfo(val) {
  return STATUS_OPTIONS.find(s => s.value === val) || STATUS_OPTIONS[0];
}

function extract17TrackUrl(link) {
  if (!link) return null;
  const num = link.replace(/.*nums=/, "").replace(/[&?#].*/, "").trim();
  if (num && num.length > 5) return "https://t.17track.net/en#nums=" + num;
  if (/^[A-Za-z0-9]{8,}$/.test(link.trim())) return "https://t.17track.net/en#nums=" + link.trim();
  if (link.includes("17track")) return link;
  return null;
}

function Badge({ status }) {
  const info = getStatusInfo(status);
  return (
    <span style={{
      fontFamily: mono, fontSize: 10, fontWeight: 600, color: info.color,
      background: info.bg, padding: "3px 10px", border: "1px solid " + info.color + "25",
      letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap",
    }}>{info.label}</span>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", mono: isMono, textarea }) {
  const shared = {
    fontFamily: isMono ? mono : sans, fontSize: 13, color: T.text, background: T.surface2,
    border: "1px solid " + T.border, padding: "10px 14px", width: "100%", outline: "none",
    transition: "border-color 0.15s",
  };
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ fontFamily: mono, fontSize: 10, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>{label}</label>}
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
          style={{ ...shared, resize: "vertical" }}
          onFocus={e => e.target.style.borderColor = T.accent}
          onBlur={e => e.target.style.borderColor = T.border} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={shared}
          onFocus={e => e.target.style.borderColor = T.accent}
          onBlur={e => e.target.style.borderColor = T.border} />
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ fontFamily: mono, fontSize: 10, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{
          fontFamily: sans, fontSize: 13, color: T.text, background: T.surface2,
          border: "1px solid " + T.border, padding: "10px 14px", width: "100%", outline: "none",
          cursor: "pointer",
        }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, onClick, accent, small, outline, disabled, fullWidth }) {
  const base = {
    fontFamily: mono, fontSize: small ? 10 : 11, fontWeight: 600, cursor: disabled ? "default" : "pointer",
    letterSpacing: "0.05em", textTransform: "uppercase", border: "none", transition: "all 0.15s",
    padding: small ? "6px 12px" : "10px 20px", opacity: disabled ? 0.4 : 1,
    width: fullWidth ? "100%" : "auto",
  };
  if (outline) return <button onClick={onClick} disabled={disabled} style={{ ...base, color: T.textSoft, background: "none", border: "1px solid " + T.border }}>{children}</button>;
  if (accent) return <button onClick={onClick} disabled={disabled} style={{ ...base, color: T.bg, background: T.accent }}>{children}</button>;
  return <button onClick={onClick} disabled={disabled} style={{ ...base, color: T.text, background: T.surface3 }}>{children}</button>;
}

function Modal({ children, onClose, title }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.surface, border: "1px solid " + T.border, width: "100%",
        maxWidth: 520, maxHeight: "90vh", overflowY: "auto", padding: 0,
      }}>
        <div style={{
          padding: "18px 24px", borderBottom: "1px solid " + T.border,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontFamily: sans, fontSize: 16, fontWeight: 600, color: T.text }}>{title}</div>
          <button onClick={onClose} style={{ fontFamily: mono, fontSize: 18, color: T.textDim, background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>x</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function MiniTag({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontFamily: mono, fontSize: 8, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
    </div>
  );
}

async function fetchData() {
  try {
    const res = await fetch("/api/data");
    if (!res.ok) throw new Error("Load failed");
    return await res.json();
  } catch (e) {
    console.error("Load error:", e);
    return { clients: [], concepts: [] };
  }
}

async function persistData(newData) {
  try {
    const res = await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
    });
    return res.ok;
  } catch (e) {
    console.error("Save error:", e);
    return false;
  }
}

function ClientView({ client, concepts }) {
  const completed = concepts.filter(c => c.status === "completed").length;
  const total = concepts.length;
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: sans }}>
      <div style={{ borderBottom: "1px solid " + T.border, padding: "24px 32px" }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: T.accent, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>D-DOUBLEU MEDIA — UGC Tracker</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: T.text }}>{client.name}</div>
        <div style={{ fontFamily: mono, fontSize: 12, color: T.textDim, marginTop: 6 }}>{completed}/{total} concepts completed — {client.totalConcepts} total ordered</div>
      </div>
      <div style={{ padding: "20px 32px 0" }}>
        <div style={{ height: 4, background: T.surface3, width: "100%", overflow: "hidden" }}>
          <div style={{ height: "100%", background: T.accent, width: (total > 0 ? (completed / total) * 100 : 0) + "%", transition: "width 0.4s" }} />
        </div>
      </div>
      <div style={{ padding: "24px 32px" }}>
        {concepts.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: T.textDim, fontFamily: mono, fontSize: 12 }}>No concepts added yet</div>
        ) : concepts.map(concept => (
          <div key={concept.id} style={{ background: T.surface, border: "1px solid " + T.border, marginBottom: 8, padding: "18px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
              <Badge status={concept.status} />
              <div style={{ fontSize: 15, fontWeight: 600, color: T.text, flex: 1 }}>{concept.creatorName || "Unnamed Creator"}</div>
              <div style={{ fontFamily: mono, fontSize: 11, color: T.textDim }}>Batch {concept.batchNumber || "\u2014"}</div>
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: concept.brief ? 12 : 0 }}>
              <div>
                <div style={{ fontFamily: mono, fontSize: 9, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.1em" }}>Concepts</div>
                <div style={{ fontFamily: mono, fontSize: 14, color: T.text, fontWeight: 600 }}>{concept.conceptCount || "\u2014"}</div>
              </div>
              {concept.trackingLink && (
                <div>
                  <div style={{ fontFamily: mono, fontSize: 9, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.1em" }}>Tracking</div>
                  <a href={extract17TrackUrl(concept.trackingLink) || concept.trackingLink} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: mono, fontSize: 12, color: T.shipped, textDecoration: "none" }}>Track Package →</a>
                </div>
              )}
            </div>
            {concept.brief && (
              <div style={{ padding: "10px 14px", background: T.surface2, border: "1px solid " + T.border, marginTop: 8 }}>
                <div style={{ fontFamily: mono, fontSize: 9, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Brief</div>
                <div style={{ fontFamily: sans, fontSize: 13, color: T.textSoft, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{concept.brief}</div>
              </div>
            )}
            {concept.notes && (
              <div style={{ marginTop: 8, fontFamily: sans, fontSize: 12, color: T.textDim, fontStyle: "italic" }}>{concept.notes}</div>
            )}
          </div>
        ))}
      </div>
      <div style={{ padding: "16px 32px", borderTop: "1px solid " + T.border, fontFamily: mono, fontSize: 10, color: T.textDim, textAlign: "center" }}>Managed by D-DOUBLEU MEDIA</div>
    </div>
  );
}

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
    const onHash = () => { const h = window.location.hash; if (h.startsWith("#share/")) setShareView(h.replace("#share/", "")); else setShareView(null); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    fetchData().then(d => { setData(d); setLoaded(true); });
  }, []);

  useEffect(() => {
    if (!shareView) return;
    const interval = setInterval(() => { fetchData().then(d => setData(d)); }, 30000);
    return () => clearInterval(interval);
  }, [shareView]);

  const save = useCallback(async (newData) => {
    setData(newData); setSaving(true);
    await persistData(newData);
    setSaving(false);
  }, []);

  const addClient = () => {
    if (!clientName.trim()) return;
    const c = { id: genId(), name: clientName.trim(), totalConcepts: parseInt(clientConceptsCount) || 0, shareToken: genToken(), createdAt: new Date().toISOString() };
    save({ ...data, clients: [...data.clients, c] });
    setClientName(""); setClientConceptsCount(""); setShowNewClient(false);
  };
  const deleteClient = (id) => {
    if (!confirm("Delete this client and all their concepts?")) return;
    save({ clients: data.clients.filter(c => c.id !== id), concepts: data.concepts.filter(c => c.clientId !== id) });
    if (selectedClient && selectedClient.id === id) { setSelectedClient(null); setView("clients"); }
  };
  const resetConceptForm = () => { setCCreator(""); setCCount(""); setCBrief(""); setCBatch(""); setCTracking(""); setCStatus("pending"); setCNotes(""); };
  const addConcept = () => {
    if (!cCreator.trim()) return;
    const c = { id: genId(), clientId: selectedClient.id, creatorName: cCreator.trim(), conceptCount: parseInt(cCount) || 1, brief: cBrief, batchNumber: cBatch, trackingLink: cTracking, status: cStatus, notes: cNotes, createdAt: new Date().toISOString() };
    save({ ...data, concepts: [...data.concepts, c] });
    resetConceptForm(); setShowNewConcept(false);
  };
  const updateConcept = () => {
    if (!editConcept) return;
    const updated = data.concepts.map(c => c.id === editConcept.id ? { ...c, creatorName: cCreator, conceptCount: parseInt(cCount) || 1, brief: cBrief, batchNumber: cBatch, trackingLink: cTracking, status: cStatus, notes: cNotes } : c);
    save({ ...data, concepts: updated });
    resetConceptForm(); setEditConcept(null);
  };
  const deleteConcept = (id) => { save({ ...data, concepts: data.concepts.filter(c => c.id !== id) }); };
  const openEditConcept = (concept) => {
    setCCreator(concept.creatorName); setCCount(String(concept.conceptCount || "")); setCBrief(concept.brief || ""); setCBatch(concept.batchNumber || ""); setCTracking(concept.trackingLink || ""); setCStatus(concept.status || "pending"); setCNotes(concept.notes || ""); setEditConcept(concept);
  };
  const quickStatus = (conceptId, newStatus) => { const updated = data.concepts.map(c => c.id === conceptId ? { ...c, status: newStatus } : c); save({ ...data, concepts: updated }); };
  const getShareUrl = (client) => window.location.origin + window.location.pathname + "#share/" + client.shareToken;
  const copyShareLink = (client) => { navigator.clipboard.writeText(getShareUrl(client)); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const fonts = <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />;

  if (!loaded) return <div style={{ background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>{fonts}<div style={{ fontFamily: mono, fontSize: 12, color: T.textDim }}>Loading...</div></div>;

  if (shareView) {
    const client = data.clients.find(c => c.shareToken === shareView);
    if (!client) return <div style={{ background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>{fonts}<div style={{ textAlign: "center" }}><div style={{ fontFamily: sans, fontSize: 18, color: T.text, marginBottom: 8 }}>Link not found</div><div style={{ fontFamily: mono, fontSize: 12, color: T.textDim }}>This share link may have expired.</div></div></div>;
    const concepts = data.concepts.filter(c => c.clientId === client.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return <>{fonts}<ClientView client={client} concepts={concepts} /></>;
  }

  const clientConcepts_ = selectedClient ? data.concepts.filter(c => c.clientId === selectedClient.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: sans }}>
      {fonts}
      <style>{"@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }"}</style>
      <div style={{ borderBottom: "1px solid " + T.border, padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 10, color: T.accent, textTransform: "uppercase", letterSpacing: "0.15em" }}>D-DOUBLEU MEDIA</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>UGC Shipping Tracker</div>
          </div>
          {saving && <div style={{ fontFamily: mono, fontSize: 10, color: T.accent, animation: "pulse 1s infinite" }}>Saving...</div>}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {view === "client_detail" && selectedClient && (
            <>
              <Btn small outline onClick={() => { setView("clients"); setSelectedClient(null); }}>Back</Btn>
              <Btn small outline onClick={() => setShareModal(selectedClient)}>Share Link</Btn>
              <Btn small accent onClick={() => { resetConceptForm(); setShowNewConcept(true); }}>+ Add Concept</Btn>
            </>
          )}
          {view === "clients" && <Btn small accent onClick={() => setShowNewClient(true)}>+ New Client</Btn>}
        </div>
      </div>

      {view === "clients" && (
        <div style={{ padding: "24px 28px", maxWidth: 900, margin: "0 auto" }}>
          {data.clients.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60 }}>
              <div style={{ fontFamily: mono, fontSize: 40, color: T.surface3, marginBottom: 16 }}>[ ]</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: T.textSoft, marginBottom: 8 }}>No clients yet</div>
              <div style={{ fontFamily: mono, fontSize: 12, color: T.textDim, marginBottom: 24 }}>Add your first client to start tracking UGC shipments</div>
              <Btn accent onClick={() => setShowNewClient(true)}>+ New Client</Btn>
            </div>
          ) : data.clients.map(client => {
            const concepts = data.concepts.filter(c => c.clientId === client.id);
            const completed = concepts.filter(c => c.status === "completed").length;
            const inTransit = concepts.filter(c => ["shipped", "in_transit"].includes(c.status)).length;
            const issues = concepts.filter(c => c.status === "issue").length;
            return (
              <div key={client.id} onClick={() => { setSelectedClient(client); setView("client_detail"); }}
                style={{ background: T.surface, border: "1px solid " + T.border, marginBottom: 6, padding: "20px 24px", cursor: "pointer", transition: "border-color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.borderLight} onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 4 }}>{client.name}</div>
                    <div style={{ fontFamily: mono, fontSize: 11, color: T.textDim }}>{concepts.length} concepts — {client.totalConcepts} ordered</div>
                  </div>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    {completed > 0 && <MiniTag label="Done" value={completed} color={T.delivered} />}
                    {inTransit > 0 && <MiniTag label="Shipping" value={inTransit} color={T.shipped} />}
                    {issues > 0 && <MiniTag label="Issues" value={issues} color={T.issue} />}
                    <div style={{ width: 80, height: 4, background: T.surface3, overflow: "hidden" }}><div style={{ height: "100%", background: T.accent, width: (concepts.length > 0 ? (completed / concepts.length) * 100 : 0) + "%" }} /></div>
                    <div style={{ fontFamily: mono, fontSize: 16, color: T.textDim }}>{"\u2192"}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "client_detail" && selectedClient && (
        <div style={{ padding: "24px 28px", maxWidth: 960, margin: "0 auto" }}>
          <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.text }}>{selectedClient.name}</div>
              <div style={{ fontFamily: mono, fontSize: 12, color: T.textDim, marginTop: 4 }}>{clientConcepts_.length} concepts tracked — {selectedClient.totalConcepts} ordered</div>
            </div>
            <Btn small outline onClick={() => deleteClient(selectedClient.id)}>Delete Client</Btn>
          </div>
          <div style={{ display: "flex", gap: 2, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { label: "Total", value: clientConcepts_.length, color: T.text },
              { label: "Completed", value: clientConcepts_.filter(c => c.status === "completed").length, color: T.delivered },
              { label: "In Transit", value: clientConcepts_.filter(c => ["shipped", "in_transit"].includes(c.status)).length, color: T.shipped },
              { label: "Filming", value: clientConcepts_.filter(c => c.status === "filming").length, color: T.transit },
              { label: "Issues", value: clientConcepts_.filter(c => c.status === "issue").length, color: T.issue },
            ].map((s, i) => (
              <div key={i} style={{ background: T.surface, border: "1px solid " + T.border, padding: "14px 18px", flex: 1, minWidth: 100 }}>
                <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontFamily: mono, fontSize: 9, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
              </div>
            ))}
          </div>
          {clientConcepts_.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, background: T.surface, border: "1px solid " + T.border }}>
              <div style={{ fontFamily: mono, fontSize: 12, color: T.textDim, marginBottom: 16 }}>No concepts yet for this client</div>
              <Btn accent onClick={() => { resetConceptForm(); setShowNewConcept(true); }}>+ Add First Concept</Btn>
            </div>
          ) : clientConcepts_.map(concept => (
            <div key={concept.id} style={{ background: T.surface, border: "1px solid " + T.border, marginBottom: 6, padding: "18px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                <Badge status={concept.status} />
                <div style={{ fontSize: 15, fontWeight: 600, color: T.text, flex: 1, minWidth: 150 }}>{concept.creatorName || "Unnamed"}</div>
                <div style={{ fontFamily: mono, fontSize: 11, color: T.textDim }}>Batch {concept.batchNumber || "\u2014"}</div>
                <div style={{ fontFamily: mono, fontSize: 11, color: T.textDim }}>{concept.conceptCount || 1} concepts</div>
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: concept.brief || concept.trackingLink || concept.notes ? 12 : 0 }}>
                {STATUS_OPTIONS.map(s => (
                  <button key={s.value} onClick={() => quickStatus(concept.id, s.value)}
                    style={{ fontFamily: mono, fontSize: 9, color: concept.status === s.value ? s.color : T.textDim, background: concept.status === s.value ? s.bg : "transparent", border: "1px solid " + (concept.status === s.value ? s.color + "30" : T.border), padding: "3px 8px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {concept.trackingLink && (
                  <a href={extract17TrackUrl(concept.trackingLink) || concept.trackingLink} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: mono, fontSize: 11, color: T.shipped, textDecoration: "none" }}>Track on 17track →</a>
                )}
                {concept.brief && (
                  <div style={{ flex: 1, minWidth: 200, padding: "8px 12px", background: T.surface2, border: "1px solid " + T.border, marginTop: 4 }}>
                    <div style={{ fontFamily: mono, fontSize: 9, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Brief</div>
                    <div style={{ fontSize: 12, color: T.textSoft, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{concept.brief}</div>
                  </div>
                )}
              </div>
              {concept.notes && <div style={{ marginTop: 8, fontSize: 12, color: T.textDim, fontStyle: "italic" }}>{concept.notes}</div>}
              <div style={{ display: "flex", gap: 8, marginTop: 12, borderTop: "1px solid " + T.border, paddingTop: 12 }}>
                <Btn small outline onClick={() => openEditConcept(concept)}>Edit</Btn>
                <Btn small outline onClick={() => deleteConcept(concept.id)}>Delete</Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNewClient && (
        <Modal title="New Client" onClose={() => setShowNewClient(false)}>
          <Input label="Client Name" value={clientName} onChange={setClientName} placeholder="Brand name" />
          <Input label="Total UGC Concepts Ordered" value={clientConceptsCount} onChange={setClientConceptsCount} placeholder="e.g. 10" type="number" />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}><Btn accent fullWidth onClick={addClient} disabled={!clientName.trim()}>Create Client</Btn></div>
        </Modal>
      )}
      {showNewConcept && (
        <Modal title="Add Concept" onClose={() => { setShowNewConcept(false); resetConceptForm(); }}>
          <Input label="Creator Name" value={cCreator} onChange={setCCreator} placeholder="Creator name" />
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><Input label="# of Concepts" value={cCount} onChange={setCCount} placeholder="1" type="number" /></div>
            <div style={{ flex: 1 }}><Input label="Batch Number" value={cBatch} onChange={setCBatch} placeholder="e.g. B1" /></div>
          </div>
          <Select label="Status" value={cStatus} onChange={setCStatus} options={STATUS_OPTIONS} />
          <Input label="Tracking Link / Number" value={cTracking} onChange={setCTracking} placeholder="Tracking # or 17track URL" mono />
          <Input label="Brief" value={cBrief} onChange={setCBrief} placeholder="Brief or doc link" textarea />
          <Input label="Notes" value={cNotes} onChange={setCNotes} placeholder="Internal notes" textarea />
          <Btn accent fullWidth onClick={addConcept} disabled={!cCreator.trim()}>Add Concept</Btn>
        </Modal>
      )}
      {editConcept && (
        <Modal title="Edit Concept" onClose={() => { setEditConcept(null); resetConceptForm(); }}>
          <Input label="Creator Name" value={cCreator} onChange={setCCreator} placeholder="Creator name" />
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><Input label="# of Concepts" value={cCount} onChange={setCCount} placeholder="1" type="number" /></div>
            <div style={{ flex: 1 }}><Input label="Batch Number" value={cBatch} onChange={setCBatch} placeholder="e.g. B1" /></div>
          </div>
          <Select label="Status" value={cStatus} onChange={setCStatus} options={STATUS_OPTIONS} />
          <Input label="Tracking Link / Number" value={cTracking} onChange={setCTracking} placeholder="Tracking # or 17track URL" mono />
          <Input label="Brief" value={cBrief} onChange={setCBrief} placeholder="Brief or doc link" textarea />
          <Input label="Notes" value={cNotes} onChange={setCNotes} placeholder="Internal notes" textarea />
          <Btn accent fullWidth onClick={updateConcept}>Save Changes</Btn>
        </Modal>
      )}
      {shareModal && (
        <Modal title="Share with Client" onClose={() => { setShareModal(null); setCopied(false); }}>
          <div style={{ fontFamily: sans, fontSize: 13, color: T.textSoft, marginBottom: 16, lineHeight: 1.5 }}>Send this link to <strong style={{ color: T.text }}>{shareModal.name}</strong>. They see a read-only view. No login needed.</div>
          <div style={{ background: T.surface2, border: "1px solid " + T.border, padding: "12px 16px", fontFamily: mono, fontSize: 12, color: T.accent, wordBreak: "break-all", marginBottom: 16 }}>{getShareUrl(shareModal)}</div>
          <Btn accent fullWidth onClick={() => copyShareLink(shareModal)}>{copied ? "Copied" : "Copy Link"}</Btn>
        </Modal>
      )}
    </div>
  );
}
