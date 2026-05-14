import { useState, useRef, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// JSONBin.io — base de datos gratuita, no necesita configuración extra
// Crea una cuenta en jsonbin.io, crea un bin con {} y pega el BIN_ID y API_KEY
// ─────────────────────────────────────────────────────────────────────────────  { name: "Bautista Mijailov, Jose Dmitri",        ibo: "2308327919" },
  { name: "Quintero Correa, Jose Luis",            ibo: "7025301416" },
  { name: "Hernandez Garcia, Diego Alejandro",     ibo: "7025467376" },
  { name: "Ramirez Galeano, Wilson Yovany",        ibo: "7027078710" },
  { name: "Tapie Paguay, Alba Nelly",              ibo: "7027109680" },
  { name: "Valenzuela Ortiz, Juliana Marcela",     ibo: "1907261347" },
  { name: "Enriquez Arcos, Silvio Arley",          ibo: "1907268617" },
  { name: "Vasquez Barcelot, Yadira Josefina",     ibo: "1907268363" },
  { name: "Velazco Montaño, Maritza",              ibo: "7027313325" },
  { name: "Galeano Lopez, Adriana Janneth",        ibo: "7027149564" },
  { name: "Ramirez Agudelo, Jose David",           ibo: "7027447140" },
  { name: "Rodriguez Hernandez, Maria Rubiela",    ibo: "7026963322" },
  { name: "Clavijo Rodriguez, Juliana Andrea",     ibo: "7026963514" },
  { name: "Lame Guerrero, Yeny Fernanda",          ibo: "1907263200" },
  { name: "Cordoba, Jennifer",                     ibo: "7027296305" },
  { name: "Montaño Santana, Elsy Maria",           ibo: "7027176730" },
  { name: "Perea Angulo, Denys Evette",            ibo: "7026290790" },
  { name: "Jaramillo Ossa, Jhon Jarvi",            ibo: "7026372503" },
  { name: "Gamboa Sinisterra, Luis Felipe",        ibo: "7026843489" },
  { name: "Amu Grueso, Angelica Maria",            ibo: "7027048767" },
  { name: "Moscoso Moscoso, Claudia Viviana",      ibo: "7027168163" },
  { name: "Hernandez Garcia, Alba Lucy",           ibo: "7027331792" },
  { name: "Silva Orozco, Jose Jersey",             ibo: "7027511393" },
  { name: "Salamanca Burgos, Valentina",           ibo: "7025816354" },
  { name: "Castillo Gutierrez, Sandra Milena",     ibo: "1907266273" },
  { name: "Prieto Charry, Anabela",                ibo: "1907266304" },
  { name: "Zuluaga Perdomo, Freddy Augusto",       ibo: "1907266778" },
  { name: "Chicangana Papamija, Maria Isabel",     ibo: "1907268564" },
  { name: "Garcia Rengifo, Carmen Elisa",          ibo: "70259444078" },
  { name: "Mora Sandoval, Carlos Eduardo",         ibo: "1907261327" },
  { name: "Fernandez Toro, Diela",                 ibo: "7027410644" },
  { name: "Llanten Camilo, Neya Albadis",          ibo: "7027529946" },
  { name: "Moreno Angulo, Alvaro Javier",          ibo: "1907261630" },
  { name: "Castillo Garcia, Julian Alberto",       ibo: "1907264088" },
  { name: "Ruiz Bechara, Maria del Carmen",        ibo: "1907265056" },
  { name: "Castro Quiñonez, Cleydi Maryori",       ibo: "1907265203" },
  { name: "Rubio Campuzano, Andrea Estefania",     ibo: "1907265203" },
  { name: "Arellano Cardenas, Maria Celeste",      ibo: "1907266583" },
  { name: "Caicedo Velandia, Veronica",            ibo: "1907268560" },
  { name: "Troches Gonzalez, Ivonne Catherine",    ibo: "1907268681" },
  { name: "Lasso Ibarbo, Daniela",                 ibo: "7026990151" },
  { name: "Vega Aragon, Emilsen",                  ibo: "1907265643" },
  { name: "Jimenez Calvo, Eliana",                 ibo: "7926318614" },
  { name: "Lopez Caceres, Brayan David",           ibo: "7027313912" },
];

const C = {
  bg: "#f5f3ef", surface: "#ffffff", border: "#ddd8cf",
  accent: "#1a4480", accentL: "#2563b0",
  green: "#15803d", greenBg: "#f0fdf4",
  red: "#b91c1c", text: "#1a1a1a", sub: "#6b7280",
  ink: "#1a3a6b", gold: "#b45309",
};

// ── Google Sheets helpers ────────────────────────────────────────────────────
const GSCRIPT_URL = "https://script.google.com/macros/s/AKfycbxgOUCqt1BNzyB54KqRz60p5GZIsWzcZtPn-l7Agt499sU0u1qNcl31fbau3lUGpC4/exec";

async function loadSigs() {
  try {
    const r = await fetch(GSCRIPT_URL + "?action=load");
    const data = await r.json();
    return data || {};
  } catch { return {}; }
}

async function saveSig(idx, sigData, allSigs) {
  try {
    await fetch(GSCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "save", index: String(idx), nombre: sigData.nombre, ibo: sigData.ibo, fecha: sigData.date })
    });
    return { ...allSigs, [String(idx)]: { date: sigData.date, signed: true } };
  } catch (e) { console.error(e); return allSigs; }
}

async function clearAllSigs() {
  try {
    await fetch(GSCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "clear" }) });
  } catch (e) { console.error(e); alert("Error al borrar."); }
}

// ── Signature Canvas ──────────────────────────────────────────────────────────
function SignatureCanvas({ name, onSave, onCancel }) {
  const ref = useRef(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const [hasStroke, setHasStroke] = useState(false);

  const pt = (e, c) => {
    const r = c.getBoundingClientRect();
    const s = e.touches ? e.touches[0] : e;
    return { x: (s.clientX - r.left) * (c.width / r.width), y: (s.clientY - r.top) * (c.height / r.height) };
  };
  const down = e => { e.preventDefault(); drawing.current = true; last.current = pt(e, ref.current); };
  const move = e => {
    e.preventDefault();
    if (!drawing.current) return;
    const c = ref.current, ctx = c.getContext("2d"), p = pt(e, c);
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.stroke();
    last.current = p; setHasStroke(true);
  };
  const up = () => { drawing.current = false; };
  const clear = () => {
    ref.current.getContext("2d").clearRect(0, 0, ref.current.width, ref.current.height);
    setHasStroke(false);
  };

  useEffect(() => {
    const c = ref.current;
    c.width = c.parentElement.clientWidth - 32;
    c.height = 130;
  }, []);

  return (
    <div style={{ background: "#fff", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
      <p style={{ margin: "0 0 8px", fontSize: 13, color: C.sub }}>
        Dibuja tu firma, <strong style={{ color: C.text }}>{name}</strong>:
      </p>
      <div style={{ border: `1.5px dashed ${C.border}`, borderRadius: 8, background: "#fafeff", cursor: "crosshair", overflow: "hidden" }}>
        <canvas ref={ref} style={{ display: "block", touchAction: "none", width: "100%" }}
          onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}
          onTouchStart={down} onTouchMove={move} onTouchEnd={up} />
      </div>
      <p style={{ margin: "5px 0 10px", fontSize: 11, color: C.sub, textAlign: "center" }}>
        ✏️ Usa el dedo (celular) o el mouse
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={clear} style={btn("#f3f4f6", C.sub)}>Limpiar</button>
        <button onClick={onCancel} style={btn("#fff0f0", C.red)}>Cancelar</button>
        <button onClick={() => {
          if (!hasStroke) return alert("Por favor traza tu firma.");
          onSave(ref.current.toDataURL("image/png"));
        }} style={{ ...btn(C.accent, "#fff"), flex: 1, fontWeight: 700 }}>
          ✓ Confirmar firma
        </button>
      </div>
    </div>
  );
}

// ── Letter ────────────────────────────────────────────────────────────────────
function Letter({ signedCount, total }) {
  return (
    <div style={{
      background: "#fffef7", border: `1px solid #e0d8c0`,
      borderLeft: `4px solid ${C.gold}`, borderRadius: 10,
      padding: "20px 22px", marginBottom: 24,
      fontFamily: "Georgia, serif", fontSize: 14, color: "#3a3228", lineHeight: 1.85,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>
        Carta de Autorización
      </div>
      <p style={{ margin: "0 0 10px", fontSize: 12, color: C.sub, fontFamily: "system-ui" }}>12 Mayo 2026</p>
      <p style={{ margin: "0 0 12px", fontWeight: 700 }}>Amway Latam,</p>
      <p style={{ margin: "0 0 12px" }}>
        Por medio de la presente, los abajo firmantes deseamos solicitar el mantener la integridad de nuestra línea de auspicio.
      </p>
      <p style={{ margin: "0 0 12px" }}>
        Actualmente, por un error, nos encontramos registrados bajo el código <strong>(IBO #2308327919 Bautista, José Dmitri)</strong>. Sin embargo, para mantener la continuidad y estructura correcta de la línea de auspicio correspondiente en Estados Unidos, solicitamos que nuestra organización permanezca alineada bajo la línea que inicia con <strong>Paz Rosa Nohemi (IBO #7026401301)</strong>.
      </p>
      <p style={{ margin: "0 0 12px" }}>
        Nuestro interés es preservar la continuidad, estabilidad y correcta organización de la red, respetando la línea de patrocinio originalmente establecida.
      </p>
      <p style={{ margin: "0 0 16px" }}>
        Agradecemos de antemano su atención y apoyo para corregir esta situación.
      </p>
      <p style={{ margin: "0 0 4px", fontStyle: "italic" }}>Atentamente,</p>
      <div style={{
        marginTop: 12, padding: "10px 14px",
        background: "#f0f4ff", border: `1px solid #c7d7f5`,
        borderRadius: 8, fontSize: 13, color: C.accent, fontFamily: "system-ui"
      }}>
        🖊️ Esta carta cuenta con <strong>{signedCount} de {total} firmantes</strong> que han agregado su firma.
      </div>
    </div>
  );
}

// ── Sign View ─────────────────────────────────────────────────────────────────
function SignView({ sigs, setSigs }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const signedCount = Object.keys(sigs).length;
  const total = SIGNERS.length;

  const matches = query.trim().length >= 2
    ? SIGNERS.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) || s.ibo.includes(query.trim())
      )
    : [];

  if (done && selected !== null) {
    const s = SIGNERS[selected];
    return (
      <div style={{ textAlign: "center", padding: "50px 20px" }}>
        <div style={{ fontSize: 60, marginBottom: 14 }}>✅</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.green, marginBottom: 8 }}>¡Firma registrada!</div>
        <div style={{ color: C.sub, fontSize: 14 }}>{s.name}</div>
        <div style={{ color: C.sub, fontSize: 12, marginTop: 4 }}>IBO #{s.ibo}</div>
        <div style={{ marginTop: 24, padding: "14px 18px", background: C.greenBg, borderRadius: 10, border: `1px solid #bbf7d0`, fontSize: 13, color: C.green, lineHeight: 1.6 }}>
          Tu firma ha sido guardada exitosamente.<br />Puedes cerrar esta ventana.
        </div>
      </div>
    );
  }

  if (selected !== null) {
    const s = SIGNERS[selected];
    const alreadySigned = !!sigs[selected];
    return (
      <div>
        <button onClick={() => setSelected(null)} style={{ ...btn("#f3f4f6", C.sub), marginBottom: 16, fontSize: 12 }}>
          ← Volver
        </button>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: C.sub, marginBottom: 2, fontFamily: "system-ui" }}>Firmante seleccionado</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</div>
          <div style={{ fontSize: 12, color: C.sub, fontFamily: "system-ui" }}>IBO #{s.ibo}</div>
        </div>
        {alreadySigned ? (
          <div style={{ background: C.greenBg, border: `1px solid #bbf7d0`, borderRadius: 10, padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <div style={{ fontWeight: 700, color: C.green }}>Ya firmaste este documento</div>
            <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>Tu firma fue registrada el {sigs[selected].date}.</div>
          </div>
        ) : saving ? (
          <div style={{ textAlign: "center", padding: 30, color: C.sub, fontFamily: "system-ui" }}>
            Guardando firma... ⏳
          </div>
        ) : (
          <SignatureCanvas
            name={s.name.split(",")[0]}
            onSave={async img => {
              setSaving(true);
              const date = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
              const updated = await saveSig(selected, { img, date, nombre: SIGNERS[selected].name, ibo: SIGNERS[selected].ibo }, sigs);
              setSigs(updated);
              setSaving(false);
              setDone(true);
            }}
            onCancel={() => setSelected(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <Letter signedCount={signedCount} total={total} />
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 20px 24px" }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>¿Estás en la lista de firmantes?</div>
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 14 }}>
          Escribe tu nombre o número IBO para encontrarte y firmar.
        </div>
        <input
          placeholder="Escribe tu nombre, apellido o número IBO"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
          style={{
            width: "100%", boxSizing: "border-box",
            background: "#f9fafb", border: `1.5px solid ${C.border}`,
            borderRadius: 8, padding: "11px 14px",
            fontFamily: "system-ui", fontSize: 14, color: C.text, outline: "none",
          }}
        />
        {query.trim().length >= 2 && (
          <div style={{ marginTop: 10 }}>
            {matches.length === 0 ? (
              <div style={{ color: C.red, fontSize: 13, padding: "8px 0" }}>
                No se encontró ningún firmante. Verifica el nombre o IBO.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {matches.map(s => {
                  const i = SIGNERS.indexOf(s);
                  const signed = !!sigs[i];
                  return (
                    <button key={i} onClick={() => { setSelected(i); setDone(false); }} style={{
                      background: signed ? C.greenBg : "#f8faff",
                      border: `1.5px solid ${signed ? "#bbf7d0" : C.accentL}`,
                      borderRadius: 8, padding: "11px 14px",
                      cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <span style={{ fontSize: 20 }}>{signed ? "✅" : "✍️"}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: C.sub, fontFamily: "system-ui" }}>
                          IBO #{s.ibo} · {signed ? "Ya firmaste" : "Pendiente de firma"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Admin View ────────────────────────────────────────────────────────────────
function AdminView({ sigs, setSigs }) {
  const [pass, setPass] = useState("");
  const [auth, setAuth] = useState(false);

  if (!auth) return (
    <div style={{ padding: "50px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Acceso restringido</div>
      <div style={{ fontSize: 13, color: C.sub, marginBottom: 20 }}>Solo el administrador puede ver el panel.</div>
      <input type="password" placeholder="Contraseña" value={pass} onChange={e => setPass(e.target.value)}
        onKeyDown={e => e.key === "Enter" && (pass === ADMIN_PASS ? setAuth(true) : alert("Contraseña incorrecta."))}
        style={{ border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", width: 200, textAlign: "center", display: "block", margin: "0 auto 10px" }} />
      <button onClick={() => pass === ADMIN_PASS ? setAuth(true) : alert("Contraseña incorrecta.")}
        style={{ ...btn(C.accent, "#fff"), fontWeight: 700 }}>Entrar</button>
    </div>
  );

  const signed = Object.keys(sigs).length;
  const total = SIGNERS.length;
  const pct = Math.round((signed / total) * 100);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Total", val: total, color: C.accent },
          { label: "Firmaron", val: signed, color: C.green },
          { label: "Pendientes", val: total - signed, color: C.gold },
        ].map(s => (
          <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: "system-ui" }}>{s.val}</div>
            <div style={{ fontSize: 11, color: C.sub, fontFamily: "system-ui" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 7, background: "#e5e7eb", borderRadius: 99, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ height: "100%", borderRadius: 99, width: `${pct}%`, background: `linear-gradient(90deg,${C.accent},${C.accentL})` }} />
      </div>

      <button onClick={() => {
        const rows = [["#", "Nombre", "IBO", "Fecha"]];
        SIGNERS.forEach((s, i) => rows.push([i + 1, s.name, s.ibo, sigs[i] ? sigs[i].date : "Pendiente"]));
        const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = "firmas_amway_latam.csv"; a.click();
      }} style={{ ...btn(C.accent, "#fff"), width: "100%", fontWeight: 700, marginBottom: 10 }}>
        ⬇️ Exportar lista (CSV)
      </button>

      <button onClick={() => {
        const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"/>
<title>Carta Amway LATAM - Firmas</title>
<style>
  body{font-family:Georgia,serif;max-width:750px;margin:40px auto;padding:0 30px;color:#1a1a1a}
  h2{color:#1a4480;font-size:18px;margin-bottom:4px}
  .sub{font-size:11px;color:#6b7280;letter-spacing:.1em;text-transform:uppercase;margin-bottom:20px}
  .carta{border-left:4px solid #b45309;padding:16px 20px;background:#fffef7;margin-bottom:30px;font-size:14px;line-height:1.8}
  .ftit{font-size:13px;font-weight:bold;color:#1a4480;margin:30px 0 16px;border-bottom:1px solid #ddd;padding-bottom:6px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .box{border:1px solid #ddd;border-radius:8px;padding:12px}
  .nom{font-weight:bold;font-size:13px}
  .ibo{font-size:11px;color:#6b7280;font-family:system-ui;margin-bottom:8px}
  .img{width:100%;max-height:60px;object-fit:contain;background:#fff;border:1px dashed #ccc;border-radius:4px;padding:4px;box-sizing:border-box}
  .fec{font-size:10px;color:#6b7280;font-family:system-ui;margin-top:4px}
  .pen{color:#9ca3af;font-style:italic;font-size:12px}
  @media print{body{margin:20px}}
</style></head><body>
<h2>Carta de Autorización · Amway LATAM</h2>
<div class="sub">Integridad de Línea de Auspicio · ${new Date().toLocaleDateString("es-MX",{day:"2-digit",month:"long",year:"numeric"})}</div>
<div class="carta">
  <p style="font-size:12px;color:#6b7280;margin:0 0 10px">12 Mayo 2026</p>
  <p><strong>Amway Latam,</strong></p>
  <p>Por medio de la presente, los abajo firmantes deseamos solicitar el mantener la integridad de nuestra línea de auspicio.</p>
  <p>Actualmente, por un error, nos encontramos registrados bajo el código <strong>(IBO #2308327919 Bautista, José Dmitri)</strong>. Sin embargo, para mantener la continuidad y estructura correcta, solicitamos permanecer bajo la línea de <strong>Paz Rosa Nohemi (IBO #7026401301)</strong>.</p>
  <p>Nuestro interés es preservar la continuidad, estabilidad y correcta organización de la red, respetando la línea de patrocinio originalmente establecida.</p>
  <p>Agradecemos de antemano su atención y apoyo para corregir esta situación.</p>
  <p><em>Atentamente,</em></p>
</div>
<div class="ftit">✍️ Firmas recolectadas (${Object.keys(sigs).length} de ${SIGNERS.length})</div>
<div class="grid">
${SIGNERS.map((s,i)=>{const d=sigs[i];return`<div class="box"><div class="nom">${s.name}</div><div class="ibo">IBO #${s.ibo}</div>${d&&d.img?`<img class="img" src="${d.img}"/><div class="fec">Firmado: ${d.date}</div>`:`<div class="pen">— Pendiente —</div>`}</div>`;}).join("")}
</div></body></html>`;
        const w = window.open("","_blank");
        w.document.write(html);
        w.document.close();
        setTimeout(()=>w.print(),800);
      }} style={{ ...btn("#15803d", "#fff"), width: "100%", fontWeight: 700, marginBottom: 10 }}>
        📄 Exportar PDF con todas las firmas
      </button>

      <button onClick={async () => {
        if (!window.confirm("¿Borrar TODAS las firmas?")) return;
        await clearAllSigs(); setSigs({});
      }} style={{ ...btn("#fff0f0", C.red), width: "100%", marginBottom: 20 }}>
        🗑️ Borrar todas las firmas
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {SIGNERS.map((s, i) => {
          const d = sigs[i];
          return (
            <div key={i} style={{
              background: d ? C.greenBg : C.surface,
              border: `1px solid ${d ? "#bbf7d0" : C.border}`,
              borderRadius: 8, padding: "9px 14px",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ color: d ? C.green : "#d1d5db", fontSize: 15 }}>{d ? "✓" : "○"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{s.name}</div>
                <div style={{ fontSize: 11, color: C.sub, fontFamily: "system-ui" }}>
                  IBO #{s.ibo}{d ? ` · ${d.date}` : ""}
                </div>
              </div>
              {d && d.img && <img src={d.img} alt="firma" style={{ height: 30, border: `1px solid #d1d5db`, borderRadius: 4, background: "#fff", padding: "1px 6px", flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [sigs, setSigs] = useState(null);
  const [tab, setTab] = useState("sign");

  useEffect(() => { loadSigs().then(setSigs); }, []);

  if (!sigs) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ color: C.sub, fontSize: 16 }}>Cargando…</div>
    </div>
  );

  const signed = Object.keys(sigs).length;
  const total = SIGNERS.length;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div style={{ background: C.accent, color: "#fff" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "18px 20px 14px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ fontSize: 30 }}>📋</div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.65, marginBottom: 3 }}>
                Carta de Autorización · Amway LATAM
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Integridad de Línea de Auspicio</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 3 }}>
                {signed}/{total} firmantes · {Math.round(signed / total * 100)}% completado
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 60px" }}>
        <div style={{ display: "flex", border: `1px solid ${C.border}`, borderTop: "none", borderRadius: "0 0 10px 10px", overflow: "hidden", marginBottom: 22, background: C.surface }}>
          {[{ id: "sign", label: "✍️  Firmar" }, { id: "admin", label: "🔒  Admin" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "10px 8px", border: "none", cursor: "pointer",
              background: tab === t.id ? C.accent : "transparent",
              color: tab === t.id ? "#fff" : C.sub,
              fontFamily: "system-ui", fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
            }}>{t.label}</button>
          ))}
        </div>
        {tab === "sign" && <SignView sigs={sigs} setSigs={setSigs} />}
        {tab === "admin" && <AdminView sigs={sigs} setSigs={setSigs} />}
      </div>
    </div>
  );
}

function btn(bg, color) {
  return {
    background: bg, color, border: `1px solid rgba(0,0,0,.08)`,
    borderRadius: 8, padding: "9px 16px", cursor: "pointer",
    fontFamily: "system-ui", fontSize: 13,
  };
}
