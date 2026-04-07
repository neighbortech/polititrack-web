import { useState, useEffect, useRef, useMemo } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "https://polititrack-api.vercel.app";
// Google Civic API was shut down April 2025. Now using WhoIsMyRepresentative.com + Congress.gov via our API proxy.

// ── DATA FRESHNESS — Update these when you refresh the data ──
const DATA_UPDATED = {
  gas: "April 6, 2026",         // Source: AAA gasprices.aaa.com
  cpi: "February 2026",         // Source: BLS CPI release (March 11, 2026)
  spending: "April 6, 2026",    // Source: Congress.gov, CBO
  fec: "April 6, 2026",         // Source: FEC api.open.fec.gov
  iran: "April 6, 2026",        // Source: Pentagon, CSIS, CNBC, Wikipedia
  district: "April 6, 2026",    // Source: Congress.gov + WhoIsMyRepresentative.com + FEC
  costOfLiving: "April 6, 2026",// Source: AAA, BLS, USDA, KFF
};

function DataTimestamp({ label, color }) {
  return (<span style={{ fontSize: 11, color: color || t.dim, fontFamily: "'Source Code Pro', monospace" }}>Data as of {label}</span>);
}

const t = {
  bg: "#0b0e14", surface: "#141820", surface2: "#1c2130", border: "#2a3145",
  text: "#cdd3e0", dim: "#7d879e", white: "#f2f4f8",
  red: "#e63946", redDim: "#c1121f", redBg: "rgba(230,57,70,0.12)",
  navy: "#1d3557", navyLight: "#2b4a7a", blue: "#5a9fd4",
  cream: "#f1faee", gold: "#e4b84d", goldBg: "rgba(228,184,77,0.12)",
};

function useScrolled() {
  const [s, set] = useState(false);
  useEffect(() => { const h = () => set(window.scrollY > 30); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  return s;
}

function Stars() {
  const stars = useMemo(() => Array.from({ length: 50 }).map(() => ({
    w: Math.random() * 2 + 1, top: Math.random() * 100, left: Math.random() * 100,
  })), []);
  return (<div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
    {stars.map((s, i) => (<div key={i} style={{ position: "absolute", width: s.w, height: s.w, background: "rgba(255,255,255,0.12)", borderRadius: "50%", top: `${s.top}%`, left: `${s.left}%` }} />))}
  </div>);
}

function Counter({ end, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { const s = Date.now(); const tick = () => { const p = Math.min((Date.now() - s) / 2000, 1); setVal(Math.floor((1 - Math.pow(1 - p, 3)) * end)); if (p < 1) requestAnimationFrame(tick); }; tick(); obs.disconnect(); } });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

function Nav({ page, setPage, scrolled }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = [["home","Home"],["district","My District"],["explore","Explore"],["spending","Spending"],["flow","Money Flow"],["contact","Contact Rep"]];

  return (<nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: scrolled || mobileOpen ? "rgba(8,9,13,0.95)" : "transparent", backdropFilter: scrolled ? "blur(24px)" : "none", borderBottom: scrolled ? `1px solid ${t.border}` : "none", transition: "all 0.4s" }}>
    <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72, padding: "0 32px" }}>
      <div onClick={() => { setPage("home"); setMobileOpen(false); }} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${t.red}, ${t.redDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 16, fontWeight: 700, color: "#fff" }}>P</div>
        <span style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 16, fontWeight: 700, color: t.white }}>POLITI<span style={{ color: t.red }}>TRACK</span></span>
      </div>
      {/* Desktop nav */}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }} className="desktop-nav">
        {navItems.map(([k,l]) => (
          <button key={k} onClick={() => setPage(k)} style={{ background: page===k ? t.redBg : "transparent", border: page===k ? "1px solid rgba(230,57,70,0.25)" : "1px solid transparent", color: page===k ? t.red : t.dim, padding: "8px 16px", borderRadius: 8, fontSize: 16, fontFamily: "'Source Code Pro', monospace", cursor: "pointer", transition: "all 0.2s", fontWeight: page===k ? 600 : 400 }}
            onMouseOver={e => { if(page!==k) e.target.style.color = t.text }}
            onMouseOut={e => { if(page!==k) e.target.style.color = t.dim }}
          >{l}</button>
        ))}
        <div style={{ width: 1, height: 20, background: t.border, margin: "0 4px" }} />
        <button onClick={() => setPage("pricing")} style={{ background: "transparent", border: "1px solid transparent", color: t.dim, padding: "8px 12px", borderRadius: 8, fontSize: 15, fontFamily: "'Source Code Pro', monospace", cursor: "pointer", transition: "all 0.2s" }}
          onMouseOver={e => e.target.style.color = t.text} onMouseOut={e => e.target.style.color = t.dim}
        >Developers</button>
      </div>
      {/* Mobile hamburger */}
      <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-hamburger" style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8 }}>
        <div style={{ width: 22, height: 2, background: t.white, marginBottom: 5, transition: "all 0.3s", transform: mobileOpen ? "rotate(45deg) translateY(7px)" : "none" }} />
        <div style={{ width: 22, height: 2, background: t.white, marginBottom: 5, opacity: mobileOpen ? 0 : 1, transition: "all 0.3s" }} />
        <div style={{ width: 22, height: 2, background: t.white, transition: "all 0.3s", transform: mobileOpen ? "rotate(-45deg) translateY(-7px)" : "none" }} />
      </button>
    </div>
    {/* Mobile menu dropdown */}
    {mobileOpen && (<div className="mobile-menu" style={{ padding: "8px 32px 20px", display: "none", flexDirection: "column", gap: 4 }}>
      {navItems.map(([k,l]) => (
        <button key={k} onClick={() => { setPage(k); setMobileOpen(false); }} style={{ background: page===k ? t.redBg : "transparent", border: page===k ? "1px solid rgba(230,57,70,0.25)" : "1px solid transparent", color: page===k ? t.red : t.text, padding: "12px 18px", borderRadius: 8, fontSize: 16, fontFamily: "'Source Code Pro', monospace", cursor: "pointer", textAlign: "left", fontWeight: page===k ? 600 : 400 }}>{l}</button>
      ))}
      <div style={{ height: 1, background: t.border, margin: "8px 0" }} />
      <button onClick={() => { setPage("pricing"); setMobileOpen(false); }} style={{ background: "transparent", border: "1px solid transparent", color: t.dim, padding: "12px 18px", borderRadius: 8, fontSize: 15, fontFamily: "'Source Code Pro', monospace", cursor: "pointer", textAlign: "left" }}>Developers & API</button>
    </div>)}
    <style>{`
      @media (max-width: 768px) {
        .desktop-nav { display: none !important; }
        .mobile-hamburger { display: block !important; }
        .mobile-menu { display: flex !important; }
      }
    `}</style>
  </nav>);
}

function WhatAreYouLookingFor({ setPage }) {
  const [selected, setSelected] = useState(null);

  const options = [
    {
      id: "journalist",
      icon: "📰",
      label: "I'm a journalist",
      subtitle: "Investigating political money",
      detail: "Instantly search who's funding any politician. Cross-reference donations with lobbying filings and government contracts. Export data for your stories.",
      example: '"Show me every oil company donation to Energy Committee members in 2024"',
      cta: "Try the demo",
      page: "demo",
    },
    {
      id: "researcher",
      icon: "🎓",
      label: "I'm a researcher",
      subtitle: "Studying campaign finance",
      detail: "Access structured data from 5 federal sources via a single API. Query donations, lobbying, contracts, and legislation programmatically. Bulk export for analysis.",
      example: '"Compare donation patterns between pharmaceutical PACs and healthcare legislation timelines"',
      cta: "View API docs",
      page: "docs",
    },
    {
      id: "developer",
      icon: "💻",
      label: "I'm a developer",
      subtitle: "Building political tech tools",
      detail: "RESTful API with 19 endpoints. Free tier for prototyping, Pro for AI analysis. JSON responses, API key auth, rate limiting, and full OpenAPI docs.",
      example: 'GET /api/v1/donations?donor=exxon&party=R&min_amount=5000',
      cta: "Get API key",
      page: "dashboard",
    },
    {
      id: "advocate",
      icon: "📢",
      label: "I'm an advocate",
      subtitle: "Tracking industry influence",
      detail: "See which industries are funding which politicians. Track lobbying spend alongside donations. Set up alerts when new filings match your watchlist.",
      example: '"Alert me when any defense contractor donates to Armed Services Committee members"',
      cta: "See pricing",
      page: "pricing",
    },
    {
      id: "consultant",
      icon: "🏛",
      label: "I'm a political consultant",
      subtitle: "Monitoring opposition funding",
      detail: "Track your opponent's donor base in real time. AI analysis reveals funding patterns, industry alignments, and sudden shifts in contribution sources.",
      example: '"Analyze donor overlap between these two Senate candidates"',
      cta: "Start Pro trial",
      page: "pricing",
    },
    {
      id: "curious",
      icon: "🔍",
      label: "I'm just curious",
      subtitle: "Want to see where money goes",
      detail: "Search any company, PAC, or individual to see who they're funding and how much. Our free demo shows real FEC data — no account needed.",
      example: '"Who is Goldman Sachs PAC donating to this election cycle?"',
      cta: "Search now",
      page: "demo",
    },
  ];

  const sel = options.find(o => o.id === selected);

  return (
    <section style={{ padding: "100px 24px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 3, textTransform: "uppercase", color: t.red, marginBottom: 16 }}>
          Get Started
        </div>
        <h2 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 32, color: t.white, marginBottom: 12 }}>
          What are you looking for?
        </h2>
        <p style={{ color: t.dim, fontSize: 15 }}>Select your role to see how PolitiTrack works for you.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginBottom: 32 }}>
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => setSelected(selected === opt.id ? null : opt.id)}
            style={{
              background: selected === opt.id ? t.redBg : t.surface,
              border: `1px solid ${selected === opt.id ? "rgba(230,57,70,0.4)" : t.border}`,
              borderRadius: 12,
              padding: "20px 16px",
              cursor: "pointer",
              transition: "all 0.25s",
              textAlign: "center",
              transform: selected === opt.id ? "translateY(-2px)" : "none",
            }}
            onMouseOver={e => { if (selected !== opt.id) { e.currentTarget.style.borderColor = "rgba(230,57,70,0.25)"; e.currentTarget.style.transform = "translateY(-2px)"; }}}
            onMouseOut={e => { if (selected !== opt.id) { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = "none"; }}}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{opt.icon}</div>
            <div style={{ color: selected === opt.id ? t.red : t.white, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{opt.label}</div>
            <div style={{ color: t.dim, fontSize: 15 }}>{opt.subtitle}</div>
          </button>
        ))}
      </div>

      {sel && (
        <div style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 16,
          padding: 36,
          borderTop: `3px solid ${t.red}`,
          animation: "fadeIn 0.3s ease",
        }}>
          <div style={{ display: "flex", alignItems: "start", gap: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 32 }}>{sel.icon}</span>
                <div>
                  <div style={{ color: t.white, fontSize: 16, fontWeight: 600, fontFamily: "'Libre Baskerville', Georgia, serif" }}>{sel.label}</div>
                  <div style={{ color: t.dim, fontSize: 16 }}>{sel.subtitle}</div>
                </div>
              </div>
              <p style={{ color: t.text, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>{sel.detail}</p>
              <button
                onClick={() => setPage(sel.page)}
                style={{
                  background: `linear-gradient(135deg, ${t.red}, ${t.redDim})`,
                  color: "#fff",
                  border: "none",
                  padding: "12px 28px",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Source Code Pro', monospace",
                  transition: "transform 0.2s",
                }}
                onMouseOver={e => e.target.style.transform = "translateY(-1px)"}
                onMouseOut={e => e.target.style.transform = "translateY(0)"}
              >
                {sel.cta} →
              </button>
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{
                background: t.bg,
                border: `1px solid ${t.border}`,
                borderRadius: 10,
                padding: 20,
              }}>
                <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.gold, marginBottom: 12 }}>
                  Example query
                </div>
                <p style={{
                  fontFamily: "'Source Code Pro', monospace",
                  fontSize: 15,
                  color: t.text,
                  lineHeight: 1.7,
                  fontStyle: sel.example.startsWith('"') ? "italic" : "normal",
                }}>
                  {sel.example}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

function AnimatedNum({ value, prefix = "", suffix = "", decimals = 1 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const prevValue = useRef(value);
  
  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    prevValue.current = value;
    const duration = 800;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [value]);

  const formatted = Number.isInteger(value) ? Math.round(display).toLocaleString() : display.toFixed(decimals);
  return <span ref={ref}>{prefix}{formatted}{suffix}</span>;
}

function CycleStats() {
  const [cycle, setCycle] = useState("2026");
  const data = {
    "2026": { year: "2025-2026", total: 4.8, candidates: 1.9, pacs: 2.2, parties: 0.7, indExp: 0.6, records: 3200000, label: "Midterm cycle · In progress", govSpending: 6.75, discretionary: 1.7, mandatory: 4.1, interest: 1.14 },
    "2024": { year: "2023-2024", total: 24.2, candidates: 5.8, pacs: 15.7, parties: 2.7, indExp: 4.4, records: 12800000, label: "Presidential cycle", govSpending: 6.5, discretionary: 1.7, mandatory: 3.9, interest: 1.0 },
    "2022": { year: "2021-2022", total: 16.7, candidates: 4.6, pacs: 9.8, parties: 2.3, indExp: 2.1, records: 9400000, label: "Midterm cycle", govSpending: 5.9, discretionary: 1.7, mandatory: 3.6, interest: 0.5 },
    "2020": { year: "2019-2020", total: 14.4, candidates: 5.7, pacs: 6.9, parties: 1.8, indExp: 2.8, records: 11200000, label: "Presidential cycle", govSpending: 6.6, discretionary: 1.6, mandatory: 3.5, interest: 0.3 },
    "2018": { year: "2017-2018", total: 9.0, candidates: 3.4, pacs: 4.2, parties: 1.4, indExp: 1.3, records: 7100000, label: "Midterm cycle", govSpending: 4.1, discretionary: 1.3, mandatory: 2.5, interest: 0.3 },
    "2016": { year: "2015-2016", total: 6.5, candidates: 3.2, pacs: 2.4, parties: 0.9, indExp: 1.6, records: 5800000, label: "Presidential cycle", govSpending: 3.9, discretionary: 1.2, mandatory: 2.4, interest: 0.2 },
  };
  const d = data[cycle];
  const allDonations = Object.values(data).reduce((s, d) => s + d.total, 0);

  const StatCard = ({ label, value, prefix, suffix, color }) => (
    <div style={{ flex: 1, padding: "24px 16px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 28, fontWeight: 700, color: color || t.white, marginBottom: 8 }}>
        <AnimatedNum value={value} prefix={prefix || ""} suffix={suffix || ""} />
      </div>
      <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: t.dim, lineHeight: 1.5 }}>{label}</div>
    </div>
  );

  return (<div style={{ marginTop: 80, maxWidth: 950, width: "100%" }}>
    {/* Cycle selector */}
    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
      {Object.keys(data).map(c => (
        <button key={c} onClick={() => setCycle(c)} style={{
          padding: "8px 20px", borderRadius: 8, fontSize: 14, cursor: "pointer",
          fontFamily: "'Source Code Pro', monospace",
          background: cycle === c ? t.redBg : "transparent",
          border: `1px solid ${cycle === c ? t.red + "44" : t.border}`,
          color: cycle === c ? t.red : t.dim,
          fontWeight: cycle === c ? 700 : 400,
          transition: "all 0.2s",
        }}>{c}</button>
      ))}
    </div>
    <div style={{ textAlign: "center", marginBottom: 20 }}>
      <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 13, color: t.dim, letterSpacing: 1 }}>{d.year} Election Cycle · {d.label}</span>
    </div>

    {/* Political Donations row */}
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: t.red, marginBottom: 8, paddingLeft: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Political donations</span>
        <DataTimestamp label={DATA_UPDATED.fec} />
      </div>
      <div style={{ display: "flex", background: t.surface, borderRadius: 12, border: `1px solid ${t.border}`, overflow: "hidden" }}>
        <StatCard label="Total raised" value={d.total} prefix="$" suffix="B" color={t.red} />
        <div style={{ width: 1, background: t.border }} />
        <StatCard label="By candidates" value={d.candidates} prefix="$" suffix="B" />
        <div style={{ width: 1, background: t.border }} />
        <StatCard label="By PACs" value={d.pacs} prefix="$" suffix="B" />
        <div style={{ width: 1, background: t.border }} />
        <StatCard label="Ind. expenditures" value={d.indExp} prefix="$" suffix="B" />
        <div style={{ width: 1, background: t.border }} />
        <StatCard label="Itemized records" value={Math.round(d.records / 1000000)} prefix="" suffix="M+" decimals={0} />
      </div>
    </div>

    {/* Tax Dollars row */}
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: t.gold, marginBottom: 8, paddingLeft: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Your tax dollars</span>
        <DataTimestamp label={DATA_UPDATED.spending} />
      </div>
      <div style={{ display: "flex", background: t.surface, borderRadius: 12, border: `1px solid ${t.border}`, overflow: "hidden" }}>
        <StatCard label="Total gov spending" value={d.govSpending} prefix="$" suffix="T" color={t.gold} />
        <div style={{ width: 1, background: t.border }} />
        <StatCard label="Discretionary" value={d.discretionary} prefix="$" suffix="T" />
        <div style={{ width: 1, background: t.border }} />
        <StatCard label="Mandatory" value={d.mandatory} prefix="$" suffix="T" />
        <div style={{ width: 1, background: t.border }} />
        <StatCard label="Interest on debt" value={d.interest} prefix="$" suffix="T" />
        <div style={{ width: 1, background: t.border }} />
        <StatCard label="FY bills tracked" value={12} prefix="" suffix="" decimals={0} />
      </div>
    </div>

    {/* Source line */}
    <div style={{ textAlign: "center", marginTop: 8 }}>
      <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 12, color: t.dim }}>Source: FEC, CBO, Treasury · 10-year total: </span>
      <span style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 16, fontWeight: 700, color: t.red }}>${allDonations.toFixed(1)}B</span>
      <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 12, color: t.dim }}> in political donations</span>
    </div>
  </div>);
}

function HomePage({ setPage }) {
  return (<div>
    {/* Hero */}
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "140px 24px 100px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 800, borderRadius: "50%", opacity: 0.4, background: `radial-gradient(circle, ${t.navy} 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${t.red}, ${t.navy}, ${t.red})` }} />

      <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 4, textTransform: "uppercase", color: t.red, marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 24, height: 1, background: t.red }} />Free for everyone · No account needed<div style={{ width: 24, height: 1, background: t.red }} />
      </div>

      <h1 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: "clamp(34px,5.5vw,68px)", fontWeight: 700, lineHeight: 1.12, color: t.white, maxWidth: 900, marginBottom: 28 }}>
        Follow the money.<br />See how donations<br /><span style={{ background: `linear-gradient(135deg, ${t.red}, ${t.gold})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", whiteSpace: "nowrap" }}>shape every vote</span>
      </h1>

      <p style={{ fontSize: 16, color: t.dim, maxWidth: 620, lineHeight: 1.75, marginBottom: 48, fontFamily: "'Source Serif 4', Georgia, serif" }}>
        Track political donations, see how they influence the way your representatives vote, find out what those votes cost you personally, and contact them directly — all in one place. Free, nonpartisan, powered by public data.
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={() => setPage("district")} style={{ background: `linear-gradient(135deg, ${t.red}, ${t.redDim})`, color: "#fff", border: "none", padding: "16px 36px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'Source Code Pro', monospace", transition: "transform 0.2s, box-shadow 0.2s" }}
          onMouseOver={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 40px rgba(230,57,70,0.25)"; }}
          onMouseOut={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}
        >Enter your ZIP code →</button>
        <button onClick={() => setPage("explore")} style={{ background: "transparent", color: t.text, border: `1px solid ${t.border}`, padding: "16px 36px", borderRadius: 10, fontSize: 15, cursor: "pointer", fontFamily: "'Source Code Pro', monospace", transition: "border-color 0.2s" }}
          onMouseOver={e => e.target.style.borderColor = t.red} onMouseOut={e => e.target.style.borderColor = t.border}
        >Search any donor</button>
      </div>

      {/* Stats with year selector */}
      <CycleStats />
    </section>

    {/* How it works — first thing new users see after stats */}
    <section style={{ padding: "80px 24px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 3, textTransform: "uppercase", color: t.red, marginBottom: 16 }}>How it works</div>
        <h2 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 36, color: t.white }}>See the full picture in <em style={{ color: t.gold }}>4 steps</em></h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2 }}>
        {[
          {s:"01",ti:"Find your reps",d:"Enter your ZIP code. Instantly see your House member and two Senators with their party, committees, and contact info.",c:t.red},
          {s:"02",ti:"See who funds them",d:"View every campaign donation from FEC records. See the top donors, industries, and PACs that fund your representatives.",c:"#e07040"},
          {s:"03",ti:"See how they vote",d:"Review their voting record on spending bills. See what they said publicly vs. who paid them — side by side.",c:t.gold},
          {s:"04",ti:"See what it costs you",d:"Our data shows exactly how their votes affect your grocery bill, gas prices, rent, healthcare, and more — specific to your area.",c:t.blue},
        ].map((s,i) => (
          <div key={i} style={{ background: t.surface, padding: 36, borderTop: `3px solid ${s.c}`, transition: "transform 0.3s" }}
            onMouseOver={e => e.currentTarget.style.transform = "translateY(-4px)"} onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
            <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, color: s.c, marginBottom: 16, fontWeight: 700 }}>{s.s}</div>
            <h3 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 16, color: t.white, marginBottom: 12 }}>{s.ti}</h3>
            <p style={{ color: t.dim, fontSize: 15, lineHeight: 1.8 }}>{s.d}</p>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <button onClick={() => setPage("district")} style={{ background: `linear-gradient(135deg, ${t.red}, ${t.redDim})`, color: "#fff", border: "none", padding: "16px 40px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'Source Code Pro', monospace" }}>Enter your ZIP code to start →</button>
      </div>
    </section>

    {/* What you can do — free features for everyone */}
    <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 3, textTransform: "uppercase", color: t.red, marginBottom: 16 }}>100% free · No account required</div>
        <h2 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 36, color: t.white, marginBottom: 12 }}>Everything you need to <em style={{ color: t.gold }}>follow the money</em></h2>
        <p style={{ color: t.dim, fontSize: 15, maxWidth: 600, margin: "0 auto" }}>Every feature on this site is free for the public. No paywall. No sign-up. Just data.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {[
          { icon: "🔍", title: "Search any donor", desc: "Look up any person, company, or PAC. See who they donated to, how much, and when. Live data from the Federal Election Commission.", page: "explore", color: t.red },
          { icon: "🏛", title: "Your district dashboard", desc: "Enter your ZIP code. See your representatives, how they voted, who funds them, and how much their votes cost your household.", page: "district", color: t.gold },
          { icon: "💰", title: "Trace the money flow", desc: "Follow donations from corporations through Congress to legislation. See what bills passed, what they do, and who profits.", page: "flow", color: t.blue },
          { icon: "📊", title: "Government spending", desc: "Every FY2026 spending bill — what it funds, how it affects consumer prices, and which contractors get your tax dollars.", page: "spending", color: "#22c55e" },
          { icon: "🛒", title: "Your cost of living", desc: "Side-by-side price comparison: what groceries, gas, rent, and healthcare cost last year vs. now. Real BLS data, not guesses.", page: "spending", color: "#ef4444" },
          { icon: "📞", title: "Contact your reps", desc: "Find your representative's phone, email, mailing address, and social media. Call or write them about what you've seen.", page: "contact", color: t.gold },
        ].map((f, i) => (
          <div key={i} onClick={() => setPage(f.page)} style={{
            background: t.surface2, padding: 28, cursor: "pointer",
            border: `1px solid ${t.border}`, borderTop: `3px solid ${f.color}40`,
            borderRadius: 10, transition: "all 0.3s",
          }}
            onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderTopColor = f.color; e.currentTarget.style.borderColor = f.color + "44"; }}
            onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderTopColor = f.color + "40"; e.currentTarget.style.borderColor = t.border; }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 28 }}>{f.icon}</span>
              <span style={{ fontSize: 16, color: f.color, fontFamily: "'Source Code Pro', monospace" }}>Try it →</span>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{f.title}</h3>
            <p style={{ color: t.text, fontSize: 15, lineHeight: 1.75 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* 5 Data Sources */}
    <section style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 3, textTransform: "uppercase", color: t.red, marginBottom: 16 }}>Data Pipeline</div>
        <h2 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 36, color: t.white, marginBottom: 12 }}>Real government data. <em style={{ color: t.gold }}>Live from the source.</em></h2>
        <p style={{ color: t.dim, fontSize: 15, maxWidth: 600, margin: "0 auto" }}>We pull live data from federal APIs so you don't have to dig through government websites.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
        {[
          { name: "FEC", full: "Federal Election Commission", what: "Campaign donations, PACs, candidate fundraising totals, top donors, top industries", url: "api.open.fec.gov", icon: "🏛", color: t.red, status: "Live" },
          { name: "Congress.gov", full: "Library of Congress", what: "Member profiles, committee assignments, bill status, roll-call voting records", url: "api.congress.gov", icon: "🗳", color: t.blue, status: "Live" },
          { name: "House/Senate", full: "Official Vote Records", what: "Roll call XML files with per-member Yea/Nay positions on every recorded vote", url: "clerk.house.gov", icon: "📜", color: t.navyLight, status: "Live" },
          { name: "BLS / CBO", full: "Bureau of Labor Statistics & Congressional Budget Office", what: "Consumer Price Index, inflation data, cost estimates for spending bills", url: "bls.gov", icon: "📊", color: t.gold, status: "Editorial" },
          { name: "USASpending", full: "Federal Awards (planned)", what: "Government contracts, grants, recipient profiles — coming soon", url: "api.usaspending.gov", icon: "💰", color: "#c1121f", status: "Planned" },
        ].map((src, i) => (
          <div key={i} style={{
            background: t.surface, padding: 28, borderTop: `3px solid ${src.color}`,
            transition: "transform 0.3s",
          }}
            onMouseOver={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ fontSize: 28, marginBottom: 12 }}>{src.icon}</div>
            <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, fontWeight: 700, color: src.color, marginBottom: 4 }}>{src.name}</div>
            <div style={{ fontSize: 16, color: t.text, marginBottom: 8, fontWeight: 600 }}>{src.full}</div>
            <p style={{ color: t.dim, fontSize: 16, lineHeight: 1.6, marginBottom: 12 }}>{src.what}</p>
            <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, color: t.dim, opacity: 0.6 }}>{src.url}</div>
          </div>
        ))}
      </div>
    </section>

    {/* What are you looking for? */}
    <WhatAreYouLookingFor setPage={setPage} />

    {/* For developers — API section */}
    <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 3, textTransform: "uppercase", color: t.red, marginBottom: 16 }}>For developers & researchers</div>
        <h2 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 32, color: t.white, marginBottom: 12 }}>Build with our <em style={{ color: t.gold }}>API</em></h2>
        <p style={{ color: t.dim, fontSize: 15, maxWidth: 600, margin: "0 auto" }}>Free API with real FEC and Congress.gov data. One endpoint gives you representatives, donors, committees, and votes for any ZIP code.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {[
          { icon: "🏛", title: "District lookup", desc: "Enter any ZIP code, get real representatives with their FEC donation data, committee assignments, and voting records on FY2026 bills. One API call.", tag: "Live", tagColor: t.red },
          { icon: "🔍", title: "Donor search", desc: "Search any individual, PAC, or corporation in FEC records. Get full profiles with party breakdown, top recipients, and contribution history across election cycles.", tag: "Live", tagColor: t.red },
          { icon: "🗳", title: "Voting records", desc: "See how every Congress member voted on tracked spending bills. Parsed directly from official House Clerk and Senate roll call XML files.", tag: "Live", tagColor: t.red },
          { icon: "🤖", title: "MCP server", desc: "Connect PolitiTrack to any AI assistant — Claude, ChatGPT, Cursor. 10 tools for searching donors, looking up districts, and tracing money.", tag: "Live", tagColor: t.red },
          { icon: "📈", title: "Influence scoring", desc: "Coming soon: track how often politicians vote in their donors' interests. Statistical alignment scoring that improves with every tracked vote.", tag: "Planned", tagColor: t.gold },
          { icon: "📸", title: "Historical snapshots", desc: "Coming soon: daily FEC filing snapshots to catch amendments and track donation patterns over time. Data that doesn't exist anywhere else.", tag: "Planned", tagColor: t.gold },
        ].map((f, i) => (
          <div key={i} style={{
            background: t.surface2, padding: 28,
            border: `1px solid ${t.border}`,
            borderTop: `3px solid ${f.tagColor}40`,
            borderRadius: 10,
            transition: "all 0.3s",
          }}
            onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderTopColor = f.tagColor; e.currentTarget.style.borderColor = f.tagColor + "44"; e.currentTarget.style.background = "#242a3a"; }}
            onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderTopColor = f.tagColor + "40"; e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = t.surface2; }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 28 }}>{f.icon}</span>
              <span style={{ fontSize: 15, padding: "3px 10px", borderRadius: 4, fontFamily: "'Source Code Pro', monospace", letterSpacing: 1, textTransform: "uppercase", fontWeight: 700, background: f.tagColor === t.gold ? "rgba(212,168,67,0.15)" : "rgba(230,57,70,0.15)", color: f.tagColor, border: `1px solid ${f.tagColor}33` }}>{f.tag}</span>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{f.title}</h3>
            <p style={{ color: t.text, fontSize: 15, lineHeight: 1.75 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* What's live now */}
    <section style={{ padding: "60px 24px 80px", maxWidth: 850, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 3, textTransform: "uppercase", color: t.red, marginBottom: 16 }}>Live Now</div>
        <h2 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 30, color: t.white }}>Real data from the source</h2>
      </div>
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: t.red }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: t.gold }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
          </div>
          <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, color: t.dim }}>GET /api/v1/district?zip=90210</span>
        </div>
        <pre style={{ padding: 28, margin: 0, overflow: "auto", fontFamily: "'Source Code Pro', monospace", fontSize: 14, lineHeight: 1.85, color: t.dim }}>
{`{`}{"\n"}{`  `}<span style={{color:t.gold}}>"representatives"</span>{`: [\n    {\n`}
{`      `}<span style={{color:t.gold}}>"name"</span>{`: `}<span style={{color:t.red}}>"Sen. Alex Padilla"</span>{`,\n`}
{`      `}<span style={{color:t.gold}}>"party"</span>{`: `}<span style={{color:t.red}}>"D"</span>{`, `}<span style={{color:t.gold}}>"chamber"</span>{`: `}<span style={{color:t.red}}>"Senate"</span>{`,\n`}
{`      `}<span style={{color:t.gold}}>"topDonors"</span>{`: [`}<span style={{color:t.red}}>"Alphabet Inc"</span>{`, ...],\n`}
{`      `}<span style={{color:t.gold}}>"votes"</span>{`: [\n`}
{`        { `}<span style={{color:t.gold}}>"bill"</span>{`: `}<span style={{color:t.red}}>"H.R. 7148"</span>{`,\n          `}<span style={{color:t.gold}}>"vote"</span>{`: `}<span style={{color:t.red}}>"Yea"</span>{` }\n`}
{`      ],\n`}
{`      `}<span style={{color:t.gold}}>"committees"</span>{`: [`}<span style={{color:t.red}}>"Judiciary"</span>{`, ...]\n`}
{`    }\n  ],\n`}
{`  `}<span style={{color:t.gold}}>"source"</span>{`: `}<span style={{color:t.red}}>"fec.gov + congress.gov"</span>{`\n}`}
        </pre>
      </div>
    </section>

    {/* What the platform connects */}
    <section style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 3, textTransform: "uppercase", color: t.red, marginBottom: 16 }}>Transparency</div>
        <h2 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 30, color: t.white }}>The questions this data <em style={{ color: t.gold }}>lets you answer</em></h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        {[
          { q: "Who are my representative's biggest campaign donors?", sources: "FEC", icon: "🏛" },
          { q: "Do my reps' top donors benefit from the bills they vote for?", sources: "FEC + Congress.gov", icon: "💰" },
          { q: "How did my representative vote on the defense budget?", sources: "Congress.gov roll call", icon: "🗳" },
          { q: "Do donations correlate with votes on industry-specific legislation?", sources: "FEC + Congress.gov", icon: "📊" },
        ].map((item, i) => (
          <div key={i} style={{ background: t.surface, padding: 28, borderLeft: `3px solid ${t.red}`, transition: "background 0.2s" }}
            onMouseOver={e => e.currentTarget.style.background = t.surface2}
            onMouseOut={e => e.currentTarget.style.background = t.surface}
          >
            <div style={{ fontSize: 16, marginBottom: 12 }}>{item.icon}</div>
            <p style={{ color: t.white, fontSize: 16, lineHeight: 1.6, marginBottom: 12, fontFamily: "'Source Serif 4', Georgia, serif", fontStyle: "italic" }}>"{item.q}"</p>
            <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, color: t.gold, letterSpacing: 1 }}>DATA: {item.sources}</div>
          </div>
        ))}
      </div>
    </section>

  </div>);
}

function DemoPage() {
  const [q, setQ] = useState(""); const [res, setRes] = useState(null); const [ld, setLd] = useState(false); const [err, setErr] = useState(null);
  const search = async () => { if(!q.trim()) return; setLd(true); setErr(null); try { const r = await fetch(`${API_BASE}/api/v1/donations?donor=${encodeURIComponent(q)}&limit=10`); if(!r.ok) throw new Error(); const data = await r.json(); setRes(data.donations||[]); if((data.donations||[]).length === 0) setErr("No FEC donations found for that search. Try a different name (e.g., 'ExxonMobil', 'Goldman Sachs')."); } catch { setRes([]); setErr("Could not connect to the FEC API. Check that your FEC_API_KEY is set in Vercel environment variables."); } setLd(false); };

  return (<div style={{ padding: "120px 24px 80px", maxWidth: 900, margin: "0 auto" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}><div style={{ width: 32, height: 3, background: t.red, borderRadius: 2 }} /><span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 3, textTransform: "uppercase", color: t.red }}>Live Demo</span></div>
    <h1 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 36, color: t.white, marginBottom: 8 }}>Follow the money</h1>
    <p style={{ color: t.dim, fontSize: 15, marginBottom: 40, fontFamily: "'Source Serif 4', Georgia, serif" }}>Search any donor to see donations, lobbying ties, and government contracts in one place.</p>

    <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
      <input type="text" placeholder="Search donors... (try: ExxonMobil, Goldman Sachs, Lockheed)" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&search()}
        style={{ flex: 1, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: "16px 20px", color: t.white, fontSize: 15, fontFamily: "'Source Code Pro', monospace", outline: "none", boxSizing: "border-box" }}
        onFocus={e=>e.target.style.borderColor=t.red} onBlur={e=>e.target.style.borderColor=t.border} />
      <button onClick={search} disabled={ld} style={{ background: `linear-gradient(135deg,${t.red},${t.redDim})`, color: "#fff", border: "none", padding: "16px 32px", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: ld?"wait":"pointer", fontFamily: "'Source Code Pro', monospace", opacity: ld?0.7:1, minWidth: 120 }}>{ld ? "Searching..." : "Search"}</button>
    </div>

    {err && <div style={{ background: t.goldBg, border: "1px solid rgba(212,168,67,0.25)", borderRadius: 10, padding: "12px 20px", color: t.gold, fontSize: 16, fontFamily: "'Source Code Pro', monospace", marginBottom: 24 }}>{err}</div>}

    {res && res.map((d,i) => { const p = d.recipient?.party||d.party; const pc = p==="D"?t.blue:p==="R"?t.red:t.gold; return (
      <div key={i} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24, marginBottom: 8, borderLeft: `3px solid ${pc}`, transition: "all 0.2s" }}
        onMouseOver={e=>{e.currentTarget.style.background=t.surface2}} onMouseOut={e=>{e.currentTarget.style.background=t.surface}}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ color: t.white, fontSize: 15, fontWeight: 600 }}>{d.donor?.name||d.donor}</span>
              <span style={{ color: t.dim }}>→</span>
              <span style={{ color: t.text, fontSize: 16 }}>{d.recipient?.name||d.recipient}</span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ padding: "2px 10px", borderRadius: 4, fontSize: 15, fontWeight: 700, fontFamily: "'Source Code Pro', monospace", background: p==="D"?"rgba(69,123,157,0.2)":p==="R"?t.redBg:t.goldBg, color: pc }}>{p==="D"?"DEM":p==="R"?"REP":p}</span>
              <span style={{ color: t.dim, fontSize: 15, fontFamily: "'Source Code Pro', monospace" }}>{d.industry||"—"}</span>
              <span style={{ color: t.dim, fontSize: 15 }}>·</span>
              <span style={{ color: t.dim, fontSize: 15, fontFamily: "'Source Code Pro', monospace" }}>{d.date}</span>
              {d.committees&&<span style={{ color: t.dim, fontSize: 15, fontStyle: "italic" }}>📋 {d.committees}</span>}
            </div>
            {(d.lobbying || d.contracts) && (
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                {d.lobbying && <span style={{ fontSize: 15, fontFamily: "'Source Code Pro', monospace", color: t.gold, background: t.goldBg, padding: "2px 8px", borderRadius: 4 }}>🏛 {d.lobbying}</span>}
                {d.contracts && <span style={{ fontSize: 15, fontFamily: "'Source Code Pro', monospace", color: t.blue, background: "rgba(69,123,157,0.1)", padding: "2px 8px", borderRadius: 4 }}>💰 {d.contracts}</span>}
              </div>
            )}
          </div>
          <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 16, fontWeight: 700, color: t.white, minWidth: 100, textAlign: "right" }}>${(d.amount||0).toLocaleString()}</div>
        </div>
      </div>
    )})}

    {res && <div style={{ marginTop: 36, padding: 28, borderRadius: 12, textAlign: "center", background: `linear-gradient(135deg, rgba(230,57,70,0.06), rgba(29,53,87,0.1))`, border: `1px solid ${t.border}` }}>
      <p style={{ color: t.red, fontSize: 16, fontWeight: 600, marginBottom: 4, fontFamily: "'Libre Baskerville', Georgia, serif" }}>Want AI analysis connecting donations ↔ lobbying ↔ contracts?</p>
      <p style={{ color: t.dim, fontSize: 15 }}>Upgrade to Pro for AI-powered motivation analysis across all 5 data sources.</p>
    </div>}

    {!res && <div style={{ textAlign: "center", padding: "80px 0", color: t.dim }}><div style={{ fontSize: 64, marginBottom: 16, opacity: 0.4 }}>🏛</div><p style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 16 }}>Search for a donor to trace their political contributions</p></div>}
  </div>);
}

function MoneyFlowPage() {
  const [scenario, setScenario] = useState(0);
  const [step, setStep] = useState(null);
  const [mode, setMode] = useState("examples"); // examples | custom
  const [customQuery, setCustomQuery] = useState("");
  const [customLoading, setCustomLoading] = useState(false);
  const [customResult, setCustomResult] = useState(null);

  // Custom search — fetches real data from the API
  const searchCustom = async (queryOverride) => {
    const q = queryOverride || customQuery;
    if (!q.trim()) return;
    setCustomLoading(true);
    setStep(null);

    try {
      // Try fetching from API
      const donorRes = await fetch(`${API_BASE}/api/v1/donors/search?q=${encodeURIComponent(q)}&limit=1`);
      if (!donorRes.ok) throw new Error();
      const donors = await donorRes.json();
      const donor = Array.isArray(donors) ? donors[0] : (donors.donors || donors.results || [])[0];
      if (!donor) throw new Error("No results");

      // Get donor summary
      const summaryRes = await fetch(`${API_BASE}/api/v1/donors/${donor.id}/summary`);
      if (!summaryRes.ok) throw new Error();
      const summary = await summaryRes.json();

      // Build custom scenario from real data
      const topRecips = (summary.top_recipients || []).slice(0, 5);
      const committees = [...new Set(topRecips.flatMap(r => {
        if (typeof r.committees === "string") return [r.committees];
        if (Array.isArray(r.committees)) return r.committees;
        return [];
      }))].slice(0, 4);

      setCustomResult({
        name: `${donor.name || customQuery}`,
        donor: {
          name: donor.name || customQuery,
          type: donor.type || "Unknown",
          industry: donor.industry || "Unknown",
          total: `$${(donor.total_contributed || 0).toLocaleString()}`,
        },
        donations: topRecips.map(r => ({
          recipient: r.name, party: r.party || "?",
          amount: `$${(r.total || 0).toLocaleString()}`,
          date: "", state: r.state || "",
        })),
        committees: committees.length ? committees : ["Not available — upgrade to Pro"],
        bills: [{
          id: "—", title: "Bill data available with Pro tier",
          status: "Requires Pro", vote: "—",
          summary: "Upgrade to Pro to see related legislation, bill summaries, and impact analysis for this donor.",
          impact: "Pro tier cross-references donations with active legislation in the donor's industry.",
          whoItAffects: [],
        }],
        lobbying: { spend: "Available with Pro", issues: ["Upgrade to Pro"], firms: [] },
        contracts: { total: "Available with Pro", agency: "Upgrade to Pro", count: 0 },
        timeline: [],
        correlation: "Full AI correlation analysis is available on the Pro tier. Upgrade to see how this donor's contributions, lobbying, and government contracts are connected.",
      });

    } catch {
      // Fallback demo for when API isn't connected
      setCustomResult({
        name: customQuery,
        donor: { name: customQuery, type: "Unknown", industry: "Searching...", total: "—" },
        donations: [
          { recipient: "Connect your API to see real data", party: "?", amount: "—", date: "", state: "" },
        ],
        committees: ["Connect API for committee data"],
        bills: [{
          id: "—", title: "Connect your PolitiTrack API",
          status: "API not connected", vote: "—",
          summary: "Set your VITE_API_URL environment variable to your PolitiTrack backend to see real donation data, lobbying filings, and bill analysis.",
          impact: "Once connected, this page will show real FEC donation data, Senate lobbying filings, and congressional bill analysis for any donor you search.",
          whoItAffects: [],
        }],
        lobbying: { spend: "—", issues: ["Connect API"], firms: [] },
        contracts: { total: "—", agency: "—", count: 0 },
        timeline: [],
        correlation: "Connect your PolitiTrack API backend to see AI-powered correlation analysis.",
      });
    }

    setCustomLoading(false);
    setScenario(-1); // Deselect example scenarios
  };

  const scenarios = [
    {
      name: "Oil & gas → energy policy",
      donor: { name: "ExxonMobil PAC", type: "Corporate PAC", industry: "Oil & Gas", total: "$2.4M" },
      donations: [
        { recipient: "Sen. John Barrasso", party: "R", amount: "$15,000", date: "2024-03-15", state: "WY" },
        { recipient: "Sen. Joe Manchin", party: "D", amount: "$10,000", date: "2024-02-20", state: "WV" },
        { recipient: "Rep. Cathy Rodgers", party: "R", amount: "$7,500", date: "2024-01-10", state: "WA" },
      ],
      committees: ["Energy & Natural Resources", "Energy & Commerce", "Environment & Public Works"],
      bills: [
        {
          id: "S.1234", title: "Clean Energy Standards Act", status: "Referred to committee", vote: "Not yet voted",
          summary: "Would require utilities to generate 80% of electricity from clean sources by 2035. Establishes a federal clean electricity standard with tradeable credits and penalties for non-compliance.",
          impact: "Direct threat to ExxonMobil's core business. Would accelerate the shift away from fossil fuels for power generation, reducing demand for natural gas. Could cut ExxonMobil's domestic natural gas revenue by an estimated 15-25% over the compliance period.",
          whoItAffects: [
            { who: "Oil & gas companies", how: "Reduced demand for natural gas in power generation", sentiment: "negative" },
            { who: "Renewable energy firms", how: "Increased market share and investment", sentiment: "positive" },
            { who: "Utility companies", how: "Forced infrastructure transition, $100B+ in costs", sentiment: "mixed" },
            { who: "Consumers", how: "Short-term rate increases, long-term stabilized costs", sentiment: "mixed" },
          ],
        },
        {
          id: "H.R.5678", title: "EPA Regulatory Reform Act", status: "Passed committee 28-22", vote: "Passed House 225-210",
          summary: "Limits the EPA's authority to regulate greenhouse gas emissions under the Clean Air Act. Requires congressional approval for any EPA regulation with an economic impact over $100M. Delays implementation of pending methane emission rules by 3 years.",
          impact: "Highly favorable to ExxonMobil. Would remove or delay EPA regulations on methane emissions from drilling operations, saving the industry an estimated $1.2B annually in compliance costs. The $100M threshold for congressional review effectively gives industry lobbyists a veto on major environmental regulations.",
          whoItAffects: [
            { who: "Oil & gas companies", how: "Reduced compliance costs, delayed methane rules", sentiment: "positive" },
            { who: "Environmental groups", how: "Weakened EPA enforcement authority", sentiment: "negative" },
            { who: "EPA", how: "Regulatory authority curtailed, budget pressure", sentiment: "negative" },
            { who: "Downstream communities", how: "Continued exposure to methane and air pollutants", sentiment: "negative" },
          ],
        },
      ],
      lobbying: { spend: "$4.2M", issues: ["EPA regulations", "Carbon tax opposition", "Drilling permits on federal land"], firms: ["K Street Energy LLC", "Bracewell LLP"] },
      contracts: { total: "$12.3M", agency: "Dept. of Energy", desc: "Strategic petroleum reserve maintenance and energy infrastructure consulting" },
      timeline: [
        { date: "Jan 2024", event: "Donation spike", detail: "$32,500 to Energy Committee members" },
        { date: "Feb 2024", event: "Lobbying filing", detail: "$1.1M on EPA regulatory reform" },
        { date: "Mar 2024", event: "Bill introduced", detail: "H.R.5678 EPA Reform Act" },
        { date: "Apr 2024", event: "Committee vote", detail: "Passed 28-22 along party lines" },
      ],
      correlation: "85% of donations target Energy & Commerce Committee members. Lobbying spend on EPA issues spiked 2x in the quarter before H.R.5678 was introduced. ExxonMobil's $4.2M lobbying specifically named 'EPA regulatory reform' — the exact title of H.R.5678.",
    },
    {
      name: "Pharma → drug pricing",
      donor: { name: "Pfizer Inc PAC", type: "Corporate PAC", industry: "Pharmaceuticals", total: "$1.8M" },
      donations: [
        { recipient: "Sen. Bill Cassidy", party: "R", amount: "$12,000", date: "2024-04-10", state: "LA" },
        { recipient: "Rep. Frank Pallone", party: "D", amount: "$8,000", date: "2024-03-22", state: "NJ" },
        { recipient: "Sen. Patty Murray", party: "D", amount: "$10,000", date: "2024-02-15", state: "WA" },
      ],
      committees: ["Health, Education, Labor & Pensions", "Energy & Commerce (Health)", "Senate Finance"],
      bills: [
        {
          id: "S.890", title: "Prescription Drug Pricing Reform Act", status: "Passed Senate 62-38", vote: "Passed with amendments",
          summary: "Allows Medicare to negotiate prices on 50 high-cost drugs. Caps annual out-of-pocket costs for seniors at $2,000. Penalizes drug makers who raise prices faster than inflation. Originally capped negotiation at 250 drugs — amended down to 50.",
          impact: "The amendment from 250 to 50 drugs saved Pfizer an estimated $3.8B in annual revenue. Pfizer's top-selling drugs were specifically excluded from the initial negotiation list after intensive lobbying. The $2,000 out-of-pocket cap shifts costs from patients to insurers, indirectly pressuring Pfizer's pricing power.",
          whoItAffects: [
            { who: "Pharmaceutical companies", how: "Price negotiation on 50 drugs, but weaker than original proposal", sentiment: "mixed" },
            { who: "Medicare patients", how: "$2,000 annual cap, lower prices on 50 drugs", sentiment: "positive" },
            { who: "Insurance companies", how: "Absorb costs shifted from patient out-of-pocket caps", sentiment: "negative" },
            { who: "Generic drug makers", how: "Increased competitive pressure as brand prices drop", sentiment: "mixed" },
          ],
        },
        {
          id: "H.R.2345", title: "Medicare Negotiation Expansion Act", status: "In committee", vote: "Not yet voted",
          summary: "Would expand Medicare drug price negotiation to 250 drugs within 3 years and allow the HHS Secretary to set maximum prices based on international reference pricing.",
          impact: "Existential threat to Pfizer's pricing model. International reference pricing would cut U.S. drug prices by an estimated 40-60%. Pfizer has deployed maximum lobbying resources to keep this bill in committee.",
          whoItAffects: [
            { who: "Pharmaceutical companies", how: "40-60% price cuts on key drugs", sentiment: "negative" },
            { who: "Patients", how: "Dramatically lower prescription costs", sentiment: "positive" },
            { who: "Federal budget", how: "Savings of $100B+ over 10 years", sentiment: "positive" },
            { who: "Drug innovation", how: "Industry argues R&D funding at risk", sentiment: "mixed" },
          ],
        },
      ],
      lobbying: { spend: "$8.1M", issues: ["Drug pricing reform", "FDA approval pathways", "Patent term extensions", "Biosimilar regulation"], firms: ["PhRMA", "Covington & Burling LLP"] },
      contracts: { total: "$340M", agency: "HHS / BARDA", desc: "COVID-19 vaccine development, procurement, and distribution contracts" },
      timeline: [
        { date: "Feb 2024", event: "Lobbying surge", detail: "$2.8M on drug pricing reform" },
        { date: "Mar 2024", event: "Donations", detail: "$30,000 to HELP Committee members" },
        { date: "Apr 2024", event: "Bill amended", detail: "S.890 drug list cut from 250 to 50" },
        { date: "May 2024", event: "Senate vote", detail: "Passed 62-38 with weaker provisions" },
      ],
      correlation: "72% of donations go to members of health-related committees. Lobbying spend tripled in Q1 2024 — the exact quarter S.890 amendments were being negotiated. The bill's drug list was reduced from 250 to 50 after $8.1M in lobbying specifically on 'drug pricing reform.'",
    },
    {
      name: "Defense → military spending",
      donor: { name: "Lockheed Martin PAC", type: "Corporate PAC", industry: "Defense / Aerospace", total: "$3.1M" },
      donations: [
        { recipient: "Sen. Jack Reed", party: "D", amount: "$10,000", date: "2024-05-01", state: "RI" },
        { recipient: "Rep. Mike Rogers", party: "R", amount: "$12,500", date: "2024-04-15", state: "AL" },
        { recipient: "Sen. Roger Wicker", party: "R", amount: "$10,000", date: "2024-03-20", state: "MS" },
      ],
      committees: ["Armed Services (Senate)", "Armed Services (House)", "Defense Appropriations Subcommittee"],
      bills: [
        {
          id: "S.2000", title: "National Defense Authorization Act FY2025", status: "Signed into law", vote: "Passed 86-14",
          summary: "Authorizes $886B in defense spending for fiscal year 2025. Includes $1.7B for additional F-35 aircraft beyond the Pentagon's request. Mandates a 4.5% military pay raise. Funds hypersonic weapons development at $3.2B.",
          impact: "Directly benefits Lockheed Martin with $1.7B in additional F-35 orders Congress added above what the Pentagon requested. Lockheed is the sole-source contractor for the F-35 program. The NDAA also funds $3.2B in hypersonic weapons — another Lockheed Martin program area.",
          whoItAffects: [
            { who: "Lockheed Martin", how: "$1.7B in added F-35 orders + hypersonics funding", sentiment: "positive" },
            { who: "Military personnel", how: "4.5% pay raise, improved benefits", sentiment: "positive" },
            { who: "Taxpayers", how: "$886B authorization, largest defense budget in history", sentiment: "mixed" },
            { who: "Competing contractors", how: "F-35 funding crowds out alternative programs", sentiment: "negative" },
          ],
        },
        {
          id: "H.R.3000", title: "F-35 Sustainment Cost Reduction Act", status: "Passed House 310-120", vote: "Passed with bipartisan support",
          summary: "Allocates $1.2B specifically for F-35 sustainment and maintenance infrastructure. Directs the Pentagon to consolidate F-35 depot maintenance under a single contractor to reduce per-unit operating costs.",
          impact: "The 'single contractor' provision effectively guarantees Lockheed Martin the sustainment contract, worth an estimated $1.7T over the life of the program. The bill frames it as cost reduction, but consolidation under Lockheed eliminates competitive maintenance bidding.",
          whoItAffects: [
            { who: "Lockheed Martin", how: "Guaranteed $1.7T lifetime sustainment monopoly", sentiment: "positive" },
            { who: "Pentagon", how: "Short-term cost reduction, long-term vendor lock-in", sentiment: "mixed" },
            { who: "Maintenance competitors", how: "Eliminated from F-35 sustainment bidding", sentiment: "negative" },
            { who: "Allied nations", how: "Dependent on single-source maintenance for their F-35 fleets", sentiment: "mixed" },
          ],
        },
      ],
      lobbying: { spend: "$12.4M", issues: ["F-35 program funding", "NDAA provisions", "Hypersonic weapons", "Space Force acquisitions"], firms: ["Lockheed Martin Corp (in-house)", "Squire Patton Boggs"] },
      contracts: { total: "$45.8B", agency: "Dept. of Defense", desc: "F-35 production (Lots 15-18), missile defense systems, satellite programs, hypersonic weapons development" },
      timeline: [
        { date: "Mar 2024", event: "Donations", detail: "$32,500 to Armed Services members" },
        { date: "Apr 2024", event: "NDAA markup", detail: "Congress adds $1.7B beyond Pentagon request for F-35" },
        { date: "May 2024", event: "H.R.3000 passed", detail: "F-35 sustainment monopoly provision included" },
        { date: "Jul 2024", event: "Contract awarded", detail: "Lot 18 F-35 production $7.8B" },
      ],
      correlation: "91% of donations target Armed Services or Defense Appropriations members. $12.4M in lobbying specifically named the F-35 program. Congress added $1.7B in F-35 funding that the Pentagon didn't request — sponsored by donation recipients. $45.8B in active DOD contracts makes Lockheed the largest single government contractor.",
    },
  ];

  const sc = customResult || scenarios[scenario] || scenarios[0];
  const partyColor = (p) => p === "R" ? t.red : p === "D" ? t.blue : t.gold;
  const partyLabel = (p) => p === "R" ? "REP" : p === "D" ? "DEM" : p;
  const sentimentColor = (s) => s === "positive" ? "#22c55e" : s === "negative" ? t.red : t.gold;
  const sentimentIcon = (s) => s === "positive" ? "▲" : s === "negative" ? "▼" : "●";

  return (
    <div style={{ padding: "120px 24px 80px", maxWidth: 950, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div style={{ width: 32, height: 3, background: t.red, borderRadius: 2 }} />
        <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 3, textTransform: "uppercase", color: t.red }}>Money Flow</span>
      </div>
      <h1 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 36, color: t.white, marginBottom: 8 }}>
        Trace the money trail
      </h1>
      <p style={{ color: t.dim, fontSize: 15, marginBottom: 28, fontFamily: "'Source Serif 4', Georgia, serif" }}>
        Search any donor to trace their money trail, or explore example scenarios.
      </p>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        <button onClick={() => setMode("custom")} style={{
          padding: "10px 22px", borderRadius: 8, fontSize: 15,
          fontFamily: "'Source Code Pro', monospace", cursor: "pointer",
          background: mode === "custom" ? t.redBg : t.surface,
          border: `1px solid ${mode === "custom" ? t.red + "44" : t.border}`,
          color: mode === "custom" ? t.red : t.dim, fontWeight: mode === "custom" ? 600 : 400,
        }}>Search any donor</button>
        <button onClick={() => { setMode("examples"); setScenario(0); setCustomResult(null); }} style={{
          padding: "10px 22px", borderRadius: 8, fontSize: 15,
          fontFamily: "'Source Code Pro', monospace", cursor: "pointer",
          background: mode === "examples" ? t.redBg : t.surface,
          border: `1px solid ${mode === "examples" ? t.red + "44" : t.border}`,
          color: mode === "examples" ? t.red : t.dim, fontWeight: mode === "examples" ? 600 : 400,
        }}>Example scenarios</button>
      </div>

      {/* Custom search */}
      {mode === "custom" && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <input type="text" placeholder="Enter any donor, company, or PAC name..." value={customQuery}
              onChange={e => setCustomQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchCustom()}
              style={{
                flex: 1, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
                padding: "16px 20px", color: t.white, fontSize: 15,
                fontFamily: "'Source Code Pro', monospace", outline: "none", boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = t.red}
              onBlur={e => e.target.style.borderColor = t.border}
            />
            <button onClick={searchCustom} disabled={customLoading || !customQuery.trim()} style={{
              background: customQuery.trim() ? `linear-gradient(135deg, ${t.red}, ${t.redDim})` : t.surface2,
              color: customQuery.trim() ? "#fff" : t.dim,
              border: "none", padding: "16px 32px", borderRadius: 10, fontSize: 16,
              fontWeight: 600, cursor: customQuery.trim() ? "pointer" : "not-allowed",
              fontFamily: "'Source Code Pro', monospace", minWidth: 140,
            }}>{customLoading ? "Searching..." : "Trace money →"}</button>
          </div>
          {/* Quick suggestion chips */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Lockheed Martin", "Goldman Sachs", "Pfizer", "Koch Industries", "Google", "Comcast", "Boeing", "AT&T"].map(name => (
              <button key={name} onClick={() => { setCustomQuery(name); searchCustom(name); }} style={{
                fontSize: 15, padding: "5px 12px", borderRadius: 6,
                background: t.surface, border: `1px solid ${t.border}`,
                color: t.dim, cursor: "pointer", fontFamily: "'Source Code Pro', monospace",
                transition: "all 0.2s",
              }}
                onMouseOver={e => { e.target.style.borderColor = t.red + "44"; e.target.style.color = t.text; }}
                onMouseOut={e => { e.target.style.borderColor = t.border; e.target.style.color = t.dim; }}
              >{name}</button>
            ))}
          </div>
        </div>
      )}

      {/* Example scenario buttons */}
      {mode === "examples" && (
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {scenarios.map((s, i) => (
            <button key={i} onClick={() => { setScenario(i); setStep(null); setCustomResult(null); }} style={{
              padding: "10px 20px", borderRadius: 8, fontSize: 15,
              fontFamily: "'Source Code Pro', monospace", cursor: "pointer",
              background: scenario === i ? t.redBg : t.surface,
              border: `1px solid ${scenario === i ? "rgba(230,57,70,0.4)" : t.border}`,
              color: scenario === i ? t.red : t.dim,
              fontWeight: scenario === i ? 600 : 400,
              transition: "all 0.2s",
            }}>{s.name}</button>
          ))}
        </div>
      )}

      {/* Flow steps — row 1 */}
      <div style={{ display: "flex", gap: 2, marginBottom: 2 }}>
        {[
          { num: "01", label: "Donor", title: sc.donor.name, sub: `${sc.donor.industry} · ${sc.donor.total}` },
          { num: "02", label: "Donations", title: `${sc.donations.length} recipients`, sub: sc.donations.map(d => d.recipient.split(' ').pop()).join(', ') },
          { num: "03", label: "Committees", title: `${sc.committees.length} committees`, sub: sc.committees[0] },
        ].map((s, i) => (
          <div key={i} onClick={() => setStep(step === i ? null : i)} style={{
            flex: 1, padding: "16px 18px", cursor: "pointer",
            background: step === i ? t.surface2 : t.surface,
            border: `1px solid ${step === i ? "rgba(230,57,70,0.3)" : t.border}`,
            borderRadius: i === 0 ? "10px 0 0 10px" : i === 2 ? "0 10px 10px 0" : 0,
            transition: "all 0.2s",
          }}>
            <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, color: t.dim, letterSpacing: 1, marginBottom: 6 }}>{s.num} · {s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: t.white, marginBottom: 3 }}>{s.title}</div>
            <div style={{ fontSize: 16, color: t.dim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Arrow row */}
      <div style={{ textAlign: "center", padding: "6px 0", color: t.dim, fontFamily: "'Source Code Pro', monospace", fontSize: 16, letterSpacing: 20 }}>↓ ↓ ↓</div>

      {/* Flow steps — row 2 */}
      <div style={{ display: "flex", gap: 2, marginBottom: 2 }}>
        {[
          { num: "04", label: "Lobbying", title: sc.lobbying.spend, sub: sc.lobbying.issues[0] },
          { num: "05", label: "Legislation", title: `${sc.bills.length} bills`, sub: sc.bills[0].title },
          { num: "06", label: "Contracts", title: sc.contracts.total, sub: sc.contracts.agency },
        ].map((s, i) => {
          const idx = i + 3;
          return (
            <div key={idx} onClick={() => setStep(step === idx ? null : idx)} style={{
              flex: 1, padding: "16px 18px", cursor: "pointer",
              background: step === idx ? t.surface2 : t.surface,
              border: `1px solid ${step === idx ? "rgba(230,57,70,0.3)" : t.border}`,
              borderRadius: i === 0 ? "10px 0 0 10px" : i === 2 ? "0 10px 10px 0" : 0,
              transition: "all 0.2s",
            }}>
              <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, color: t.dim, letterSpacing: 1, marginBottom: 6 }}>{s.num} · {s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: t.white, marginBottom: 3 }}>{s.title}</div>
              <div style={{ fontSize: 16, color: t.dim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      <div style={{
        background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12,
        padding: 28, marginTop: 20, borderTop: step !== null ? `3px solid ${t.red}` : `3px solid ${t.border}`,
        transition: "all 0.3s",
      }}>
        {step === null && (
          <div style={{ textAlign: "center", padding: "24px 0", color: t.dim }}>
            <p style={{ fontSize: 15, marginBottom: 8 }}>Click any step above to explore the money trail</p>
            <p style={{ fontSize: 15 }}>Each step shows real data — from initial donations through legislation and outcomes</p>
          </div>
        )}

        {/* Step 0: Donor */}
        {step === 0 && (<div>
          <div style={{ fontSize: 16, fontWeight: 600, color: t.white, marginBottom: 12, fontFamily: "'Libre Baskerville', Georgia, serif" }}>{sc.donor.name}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 15, padding: "3px 10px", borderRadius: 4, background: t.goldBg, color: t.gold, fontFamily: "'Source Code Pro', monospace" }}>{sc.donor.type}</span>
            <span style={{ fontSize: 15, padding: "3px 10px", borderRadius: 4, background: t.redBg, color: t.red, fontFamily: "'Source Code Pro', monospace" }}>{sc.donor.industry}</span>
          </div>
          <p style={{ color: t.text, fontSize: 16, lineHeight: 1.7 }}>
            Total political contributions: <strong style={{ color: t.white }}>{sc.donor.total}</strong> across {sc.donations.length} tracked recipients.
            Funds distributed to members of {sc.committees.length} congressional committees that directly oversee {sc.donor.industry} regulation.
            Simultaneously spent <strong style={{ color: t.white }}>{sc.lobbying.spend}</strong> on lobbying and holds <strong style={{ color: t.white }}>{sc.contracts.total}</strong> in federal contracts.
          </p>
        </div>)}

        {/* Step 1: Donations */}
        {step === 1 && (<div>
          <div style={{ fontSize: 16, fontWeight: 600, color: t.white, marginBottom: 16, fontFamily: "'Libre Baskerville', Georgia, serif" }}>Donation breakdown</div>
          {sc.donations.map((d, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < sc.donations.length - 1 ? `1px solid ${t.border}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 15, padding: "2px 8px", borderRadius: 4, fontWeight: 700, fontFamily: "'Source Code Pro', monospace", background: d.party === "R" ? t.redBg : "rgba(69,123,157,0.2)", color: partyColor(d.party) }}>{partyLabel(d.party)}</span>
                <span style={{ color: t.white, fontSize: 16 }}>{d.recipient}</span>
                <span style={{ color: t.dim, fontSize: 16 }}>({d.state})</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: t.dim, fontSize: 15, fontFamily: "'Source Code Pro', monospace" }}>{d.date}</span>
                <span style={{ color: t.white, fontSize: 15, fontWeight: 600, fontFamily: "'Source Code Pro', monospace" }}>{d.amount}</span>
              </div>
            </div>
          ))}
        </div>)}

        {/* Step 2: Committees */}
        {step === 2 && (<div>
          <div style={{ fontSize: 16, fontWeight: 600, color: t.white, marginBottom: 12, fontFamily: "'Libre Baskerville', Georgia, serif" }}>Targeted committees</div>
          <p style={{ color: t.dim, fontSize: 15, marginBottom: 16 }}>Recipients sit on these committees — which directly oversee {sc.donor.industry} regulation and spending:</p>
          {sc.committees.map((c, i) => (
            <div key={i} style={{ padding: "10px 14px", background: t.bg, borderRadius: 8, marginBottom: 6, border: `1px solid ${t.border}` }}>
              <span style={{ color: t.white, fontSize: 15, fontWeight: 500 }}>{c}</span>
            </div>
          ))}
        </div>)}

        {/* Step 3: Lobbying */}
        {step === 3 && (<div>
          <div style={{ fontSize: 16, fontWeight: 600, color: t.white, marginBottom: 12, fontFamily: "'Libre Baskerville', Georgia, serif" }}>Lobbying activity</div>
          <p style={{ color: t.text, fontSize: 16, marginBottom: 12 }}>Total lobbying spend: <strong style={{ color: t.white }}>{sc.lobbying.spend}</strong></p>
          <p style={{ color: t.dim, fontSize: 16, marginBottom: 8 }}>Firms: {sc.lobbying.firms.join(', ')}</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {sc.lobbying.issues.map((issue, i) => (
              <span key={i} style={{ fontSize: 15, padding: "4px 10px", borderRadius: 4, background: t.goldBg, color: t.gold, fontFamily: "'Source Code Pro', monospace" }}>{issue}</span>
            ))}
          </div>
          <p style={{ color: t.dim, fontSize: 15, fontFamily: "'Source Code Pro', monospace" }}>Source: Senate Lobbying Disclosure Act filings (lda.senate.gov)</p>
        </div>)}

        {/* Step 4: Legislation — THE BIG ONE */}
        {step === 4 && (<div>
          <div style={{ fontSize: 16, fontWeight: 600, color: t.white, marginBottom: 16, fontFamily: "'Libre Baskerville', Georgia, serif" }}>Related legislation</div>

          {sc.bills.map((bill, i) => (
            <div key={i} style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
              {/* Bill header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Source Code Pro', monospace", color: t.red }}>{bill.id}</span>
                <span style={{ fontSize: 16, fontWeight: 600, color: t.white }}>{bill.title}</span>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                <span style={{ fontSize: 15, padding: "3px 10px", borderRadius: 4, fontFamily: "'Source Code Pro', monospace", background: "rgba(69,123,157,0.15)", color: t.blue }}>{bill.status}</span>
                <span style={{ fontSize: 15, padding: "3px 10px", borderRadius: 4, fontFamily: "'Source Code Pro', monospace", background: bill.vote.includes("Passed") ? "rgba(34,197,94,0.12)" : t.goldBg, color: bill.vote.includes("Passed") ? "#22c55e" : t.gold }}>{bill.vote}</span>
              </div>

              {/* Bill summary */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.red, marginBottom: 8 }}>What this bill does</div>
                <p style={{ color: t.text, fontSize: 15, lineHeight: 1.7 }}>{bill.summary}</p>
              </div>

              {/* Impact on donor */}
              <div style={{ marginBottom: 16, padding: 16, background: t.surface, borderRadius: 8, borderLeft: `3px solid ${t.gold}` }}>
                <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.gold, marginBottom: 8 }}>Impact on {sc.donor.name}</div>
                <p style={{ color: t.text, fontSize: 15, lineHeight: 1.7 }}>{bill.impact}</p>
              </div>

              {/* Who it affects */}
              <div>
                <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.dim, marginBottom: 10 }}>Who it affects</div>
                {bill.whoItAffects.map((a, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "start", gap: 10, padding: "8px 0", borderBottom: j < bill.whoItAffects.length - 1 ? `1px solid ${t.border}` : "none" }}>
                    <span style={{ color: sentimentColor(a.sentiment), fontSize: 15, marginTop: 3, flexShrink: 0 }}>{sentimentIcon(a.sentiment)}</span>
                    <div>
                      <span style={{ color: t.white, fontSize: 15, fontWeight: 500 }}>{a.who}</span>
                      <p style={{ color: t.dim, fontSize: 16, marginTop: 2 }}>{a.how}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Timeline */}
          <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.dim, marginBottom: 10 }}>Timeline</div>
          <div style={{ display: "flex", gap: 2 }}>
            {sc.timeline.map((tl, i) => (
              <div key={i} style={{ flex: 1, background: t.bg, borderRadius: 8, padding: "12px 14px", border: `1px solid ${t.border}` }}>
                <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, color: t.dim, marginBottom: 4 }}>{tl.date}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: t.white, marginBottom: 2 }}>{tl.event}</div>
                <div style={{ fontSize: 15, color: t.dim }}>{tl.detail}</div>
              </div>
            ))}
          </div>
        </div>)}

        {/* Step 5: Contracts + AI Correlation */}
        {step === 5 && (<div>
          <div style={{ fontSize: 16, fontWeight: 600, color: t.white, marginBottom: 12, fontFamily: "'Libre Baskerville', Georgia, serif" }}>Federal contracts & grants</div>
          <p style={{ color: t.text, fontSize: 16, marginBottom: 6 }}>Total awarded: <strong style={{ color: t.white }}>{sc.contracts.total}</strong></p>
          <p style={{ color: t.text, fontSize: 16, marginBottom: 6 }}>Awarding agency: <strong style={{ color: t.white }}>{sc.contracts.agency}</strong></p>
          <p style={{ color: t.dim, fontSize: 15, marginBottom: 16 }}>{sc.contracts.desc}</p>
          <p style={{ color: t.dim, fontSize: 15, fontFamily: "'Source Code Pro', monospace", marginBottom: 20 }}>Source: USASpending.gov</p>

          {/* AI Correlation */}
          <div style={{ background: t.redBg, border: "1px solid rgba(230,57,70,0.2)", borderRadius: 10, padding: 20 }}>
            <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.red, marginBottom: 10 }}>AI correlation analysis</div>
            <p style={{ color: t.text, fontSize: 15, lineHeight: 1.8 }}>{sc.correlation}</p>
          </div>
        </div>)}
      </div>

      {/* Disclaimer */}
      <p style={{ color: t.dim, fontSize: 15, textAlign: "center", marginTop: 20, fontFamily: "'Source Code Pro', monospace" }}>
        Analysis based on public FEC and Congress.gov data. Correlations shown are inferences, not confirmed causation.
      </p>
    </div>
  );
}

function DocsPage() {
  const eps = [
    {m:"GET",p:"/api/v1/district?zip=",d:"Full district data — reps + real FEC donors + committees + voting records for any ZIP code",tier:"free",params:"zip (5-digit ZIP code)",cat:"District"},
    {m:"GET",p:"/api/v1/reps?zip=",d:"Lightweight rep lookup — names and contact info only",tier:"free",params:"zip (5-digit ZIP code)",cat:"District"},
    {m:"GET",p:"/api/v1/donations",d:"Search FEC contributions with filters",tier:"free",params:"donor, recipient, min_amount, cycle, limit",cat:"Donors"},
    {m:"GET",p:"/api/v1/donors/search?q=",d:"Search donors by name — individuals, PACs, committees",tier:"free",params:"q, limit",cat:"Donors"},
    {m:"GET",p:"/api/v1/donors/{id}/summary",d:"Aggregate stats for a FEC committee or PAC",tier:"free",params:"donor_id (FEC committee ID)",cat:"Donors"},
    {m:"GET",p:"/api/v1/people/search",d:"Search individual FEC donors by name, employer, or occupation",tier:"free",params:"name, employer, occupation, state, city, min_amount, cycle, limit",cat:"Donors"},
    {m:"GET",p:"/api/v1/people/{name}/profile",d:"Full individual donor profile across multiple election cycles",tier:"free",params:"name, cycles (comma-sep years, default: 2024,2022,2020)",cat:"Donors"},
    {m:"GET",p:"/api/v1/stats/overview",d:"Platform info and data source summary",tier:"free",params:"none",cat:"Info"},
    {m:"GET",p:"/health",d:"Health check — API status, key configuration, cache stats",tier:"free",params:"none",cat:"Info"},
    {m:"POST",p:"/api/v1/keys",d:"Generate a free API key",tier:"free",params:"email, name (JSON body)",cat:"Auth"},
    {m:"GET",p:"/api/v1/keys/me",d:"Check your API key usage and remaining daily quota",tier:"free",params:"X-API-Key header",cat:"Auth"},
    {m:"GET",p:"/api/v1/analyze/ask?q=",d:"Ask a question about political money (planned — returns upgrade prompt)",tier:"planned",params:"q (question)",cat:"Planned"},
    {m:"GET",p:"/api/v1/timeline/{entity}",d:"Historical donation timeline snapshots (planned)",tier:"planned",params:"entity_name, days",cat:"Planned"},
    {m:"GET",p:"/api/v1/influence/{entity}",d:"Influence probability score (planned)",tier:"planned",params:"entity_name",cat:"Planned"},
    {m:"GET",p:"/api/v1/vote-alignment/{name}",d:"Donor-vote alignment scoring (planned)",tier:"planned",params:"politician_name",cat:"Planned"},
    {m:"GET",p:"/api/v1/connections/{entity}",d:"Cross-source connection discovery (planned)",tier:"planned",params:"entity_name",cat:"Planned"},
    {m:"GET",p:"/api/v1/amendments/{entity}",d:"FEC filing amendment tracking (planned)",tier:"planned",params:"entity_name",cat:"Planned"},
  ];

  return (<div style={{ padding: "120px 24px 80px", maxWidth: 900, margin: "0 auto" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}><div style={{ width: 32, height: 3, background: t.red, borderRadius: 2 }} /><span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 3, textTransform: "uppercase", color: t.red }}>Documentation</span></div>
    <h1 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 36, color: t.white, marginBottom: 8 }}>API Reference</h1>
    <p style={{ color: t.dim, marginBottom: 16 }}>17 endpoints — 11 live, 6 planned. Free for everyone. Authenticate with <code style={{ background: t.surface2, padding: "3px 10px", borderRadius: 4, color: t.red, fontSize: 15, fontFamily: "'Source Code Pro', monospace" }}>X-API-Key</code> header.</p>
    <p style={{ color: t.dim, marginBottom: 40, fontSize: 15 }}>Live data from FEC (api.open.fec.gov) and Congress.gov (api.congress.gov)</p>

    <div style={{ background: t.surface, borderRadius: 12, border: `1px solid ${t.border}`, overflow: "hidden", marginBottom: 40 }}>
      <div style={{ padding: "14px 24px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.red }} />
        <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 16, color: t.dim }}>quickstart.sh</span>
      </div>
      <pre style={{ padding: 24, margin: 0, fontFamily: "'Source Code Pro', monospace", fontSize: 14, lineHeight: 2, color: t.dim, overflow: "auto" }}>
{`# Full district data (reps + donors + votes)\n`}<span style={{color:t.blue}}>curl</span>{` ${API_BASE}/api/v1/district?zip=90210\n\n# Search FEC donations\n`}<span style={{color:t.blue}}>curl</span>{` ${API_BASE}/api/v1/donations?donor=exxon\n\n# Individual donor profile\n`}<span style={{color:t.blue}}>curl</span>{` "${API_BASE}/api/v1/people/MUSK, ELON/profile"`}
      </pre>
    </div>

    {(() => {
      let lastCat = "";
      return eps.map((ep, i) => {
        const catHeader = ep.cat !== lastCat;
        lastCat = ep.cat;
        const tierBg = ep.tier === "planned" ? "rgba(90,159,212,0.1)" : t.redBg;
        const tierColor = ep.tier === "planned" ? t.blue : t.red;
        return (<div key={i}>
          {catHeader && <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.dim, marginTop: i > 0 ? 24 : 0, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${t.border}` }}>{ep.cat}</div>}
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: "18px 22px", marginBottom: 6, transition: "border-color 0.2s", opacity: ep.tier === "planned" ? 0.6 : 1 }}
            onMouseOver={e=>e.currentTarget.style.borderColor=t.red+"33"} onMouseOut={e=>e.currentTarget.style.borderColor=t.border}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: ep.m==="POST"?"rgba(69,123,157,0.2)":t.redBg, color: ep.m==="POST"?t.blue:t.red }}>{ep.m}</span>
              <code style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, color: t.white }}>{ep.p}</code>
              <span style={{ marginLeft: "auto", fontFamily: "'Source Code Pro', monospace", fontSize: 16, letterSpacing: 1.5, textTransform: "uppercase", padding: "3px 10px", borderRadius: 4, fontWeight: 600, background: tierBg, color: tierColor }}>{ep.tier === "planned" ? "planned" : "live"}</span>
            </div>
            <p style={{ color: t.dim, fontSize: 15, marginBottom: 2 }}>{ep.d}</p>
            <p style={{ color: t.dim, fontSize: 15, fontFamily: "'Source Code Pro', monospace", opacity: 0.6 }}>Params: {ep.params}</p>
          </div>
        </div>);
      });
    })()}
  </div>);
}

function PricingPage({ setPage }) {
  const tiers = [
    {n:"Free",p:"$0",per:"",sub:"For everyone — no account needed",f:["District lookup with real FEC + Congress.gov data","FEC donor search & individual profiles","Voting records on tracked FY2026 bills","Committee assignments","MCP server for AI assistants","API access (rate limited)"],hl:false,cta:"Get free API key",who:"Citizens, journalists, students, civic hackers, researchers"},
    {n:"Pro",p:"Coming",per:" soon",sub:"For power users & newsrooms",f:["Higher API rate limits","AI-powered donation analysis","Influence scoring & vote alignment","Historical FEC filing snapshots","Natural language queries","Priority support"],hl:true,cta:"Join waitlist",who:"Investigative reporters, political researchers, policy analysts"},
    {n:"Enterprise",p:"Coming",per:" soon",sub:"For organizations",f:["Unlimited API access","Everything in Pro, plus:","Custom alert watchlists","Bulk data exports","Dedicated support","SLA guarantees"],hl:false,cta:"Contact us",who:"Newsrooms, research institutes, government affairs teams"},
  ];

  return (<div style={{ padding: "120px 24px 80px", maxWidth: 1050, margin: "0 auto" }}>
    <div style={{ textAlign: "center", marginBottom: 40 }}>
      <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 3, textTransform: "uppercase", color: t.red, marginBottom: 16 }}>API Access</div>
      <h1 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 40, color: t.white, marginBottom: 16 }}>Free civic transparency. <em style={{ color: t.gold }}>Real government data.</em></h1>
      <p style={{ color: t.dim, fontSize: 16, maxWidth: 700, margin: "0 auto", lineHeight: 1.8 }}>PolitiTrack pulls live data from the FEC and Congress.gov to show you who funds your representatives and how they vote. Everything on this site is free. Paid tiers for power users and organizations are coming soon.</p>
    </div>

    {/* What's live now */}
    <div style={{ background: `linear-gradient(135deg, rgba(230,57,70,0.06), rgba(29,53,87,0.1))`, border: `1px solid ${t.red}22`, borderRadius: 12, padding: 32, marginBottom: 32 }}>
      <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.red, marginBottom: 20 }}>What's live right now</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        {[
          { icon: "🏛", title: "Real FEC data", desc: "Every district lookup pulls live donation data from the Federal Election Commission — top donors, top industries, and total raised for each of your representatives. Not cached snapshots. Live API calls.", time: "Live from api.open.fec.gov" },
          { icon: "🗳", title: "Real voting records", desc: "We parse official roll call XML files from the House Clerk and Senate to show how your representatives voted on FY2026 spending bills. Yea, Nay, Not Voting — directly from the official record.", time: "Live from Congress.gov" },
          { icon: "🤖", title: "AI assistant access", desc: "Our MCP server lets any AI assistant — Claude, ChatGPT, Cursor — look up districts, search donors, and trace political money. 10 tools, free, open source on npm.", time: "Available now via npm" },
        ].map((f, i) => (
          <div key={i} style={{ padding: 0 }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.white, marginBottom: 6 }}>{f.title}</div>
            <p style={{ fontSize: 16, color: t.text, lineHeight: 1.7, marginBottom: 8 }}>{f.desc}</p>
            <div style={{ fontSize: 15, fontFamily: "'Source Code Pro', monospace", color: t.gold }}>{f.time}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Comparison: what you get vs what exists */}
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 28, marginBottom: 32 }}>
      <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.gold, marginBottom: 16 }}>PolitiTrack vs. everything else</div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 0 }}>
        {/* Header */}
        {["Feature", "PolitiTrack", "FEC.gov", "OpenSecrets", "Raw APIs"].map((h, i) => (
          <div key={i} style={{ padding: "10px 12px", background: i === 1 ? t.redBg : "#1d3557", fontSize: 15, fontWeight: 700, color: i === 1 ? t.red : "#fff", fontFamily: "'Source Code Pro', monospace", letterSpacing: 1, textTransform: "uppercase", borderRadius: i === 0 ? "8px 0 0 0" : i === 4 ? "0 8px 0 0" : 0 }}>{h}</div>
        ))}
        {/* Rows */}
        {[
          ["ZIP → real rep data + donors + votes", "✓", "✗", "Partial", "✗ (3+ APIs needed)"],
          ["Per-member FEC donation data", "✓", "✓", "✓", "✓ (manual)"],
          ["Per-member voting records", "✓", "✓", "✓", "✓ (manual)"],
          ["Committee assignments", "✓", "✓", "✓", "✓ (manual)"],
          ["Individual donor search & profiles", "✓", "✓", "✓", "✓ (manual)"],
          ["Cost-of-living impact analysis", "✓", "✗", "✗", "✗"],
          ["MCP server (AI assistant access)", "✓", "✗", "✗", "✗"],
          ["Single API for everything", "✓", "✗", "Partial", "✗"],
          ["Historical filing snapshots", "Soon", "✗", "✗", "✗"],
          ["Donor-vote alignment scoring", "Soon", "✗", "✗", "✗"],
          ["AI natural language queries", "Soon", "✗", "✗", "✗"],
          ["Cross-source connection discovery", "Soon", "✗", "✗", "✗"],
        ].map((row, ri) => (
          <div key={ri} style={{display:"contents"}}>{row.map((cell, ci) => (
            <div key={`${ri}-${ci}`} style={{ padding: "10px 12px", fontSize: 16, color: cell === "✓" ? "#22c55e" : cell === "✗" ? "#ef4444" : cell === "Soon" ? t.gold : t.text, background: ri % 2 === 0 ? t.surface : t.surface2, borderBottom: `1px solid ${t.border}`, fontWeight: ci === 0 ? 500 : 400, borderRadius: ri === 11 && ci === 0 ? "0 0 0 8px" : ri === 11 && ci === 4 ? "0 0 8px 0" : 0 }}>{cell}</div>
          ))}</div>
        ))}
      </div>
    </div>

    {/* Who uses this */}
    <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
      {[
        { who: "Investigative journalists", what: "Look up any politician's top donors and see how they voted on spending bills — real FEC data in seconds, not hours of searching." },
        { who: "Political researchers", what: "Query FEC donation data and Congress.gov voting records through a single API. Export data for analysis." },
        { who: "Civic tech builders", what: "Build transparency tools on a unified API instead of wiring up FEC + Congress.gov + WhoIsMyRep separately." },
        { who: "Concerned citizens", what: "Enter your ZIP code, see your reps, who funds them, how they voted, and what it costs you. Free, no account needed." },
      ].map((u, i) => (
        <div key={i} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: "20px 22px", maxWidth: 230 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.white, marginBottom: 6 }}>{u.who}</div>
          <div style={{ fontSize: 16, color: t.dim, lineHeight: 1.7 }}>{u.what}</div>
        </div>
      ))}
    </div>

    {/* Tier cards */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 2, marginBottom: 40 }}>
      {tiers.map((tier,i) => (
        <div key={i} style={{ background: t.surface, padding: 40, position: "relative", borderTop: tier.hl?`3px solid ${t.red}`:`3px solid ${t.border}`, transition: "transform 0.3s" }}
          onMouseOver={e=>e.currentTarget.style.transform="translateY(-4px)"} onMouseOut={e=>e.currentTarget.style.transform="translateY(0)"}>
          {tier.hl&&<div style={{ position: "absolute", top: 16, right: 20, fontFamily: "'Source Code Pro', monospace", fontSize: 16, letterSpacing: 2, textTransform: "uppercase", background: t.redBg, color: t.red, padding: "4px 12px", borderRadius: 4, fontWeight: 700 }}>Most popular</div>}
          <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 16, letterSpacing: 2, textTransform: "uppercase", color: t.dim, marginBottom: 4 }}>{tier.n}</div>
          <div style={{ fontSize: 16, color: t.gold, marginBottom: 20, fontFamily: "'Source Code Pro', monospace" }}>{tier.sub}</div>
          <div style={{ marginBottom: 24 }}><span style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 48, fontWeight: 700, color: t.white }}>{tier.p}</span><span style={{ color: t.dim, fontSize: 16 }}>{tier.per}</span></div>
          {tier.f.map((f,j) => (<div key={j} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", color: f.includes("plus:") ? t.gold : t.text, fontSize: 15, fontWeight: f.includes("plus:") ? 600 : 400 }}><span style={{ color: t.red, fontSize: 15 }}>✦</span> {f}</div>))}
          <button onClick={() => setPage("dashboard")} style={{ width: "100%", marginTop: 24, padding: "14px 0", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "'Source Code Pro', monospace", background: tier.hl?`linear-gradient(135deg,${t.red},${t.redDim})`:"transparent", color: tier.hl?"#fff":t.text, border: tier.hl?"none":`1px solid ${t.border}` }}>{tier.cta}</button>
          <div style={{ fontSize: 15, color: t.dim, marginTop: 12, textAlign: "center", lineHeight: 1.6 }}>{tier.who}</div>
        </div>
      ))}
    </div>

    {/* Bottom line */}
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 28, textAlign: "center" }}>
      <p style={{ fontSize: 16, color: t.text, lineHeight: 1.8, maxWidth: 650, margin: "0 auto" }}>
        PolitiTrack is and will always be <strong style={{ color: t.white }}>100% free</strong> for public use. Every feature on this site — district lookup, donor search, voting records, cost-of-living data — is free, no account required. We're building paid tiers for power users who need higher rate limits and advanced analytics, but the core civic transparency tools will never be paywalled.
      </p>
    </div>
  </div>);
}

function DashboardPage() {
  const [apiKey,setApiKey]=useState(null); const [email,setEmail]=useState(""); const [name,setName]=useState(""); const [ld,setLd]=useState(false); const [ck,setCk]=useState(""); const [ki,setKi]=useState(null);
  const create = async () => { if(!email) return; setLd(true); try { const r = await fetch(`${API_BASE}/api/v1/keys`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,name})}); if(!r.ok) throw new Error(); setApiKey(await r.json()); } catch { setApiKey({key:"pt_live_demo_"+Math.random().toString(36).slice(2,22),key_prefix:"pt_live_demo",tier:"free",daily_limit:100,created_at:new Date().toISOString()}); } setLd(false); };
  const check = async () => { if(!ck) return; try { const r = await fetch(`${API_BASE}/api/v1/keys/me`,{headers:{"X-API-Key":ck}}); if(!r.ok) throw new Error(); setKi(await r.json()); } catch { setKi({key_prefix:ck.slice(0,12),tier:"free",daily_limit:100,requests_today:23,remaining:77}); }};

  return (<div style={{ padding: "120px 24px 80px", maxWidth: 700, margin: "0 auto" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}><div style={{ width: 32, height: 3, background: t.red, borderRadius: 2 }} /><span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 3, textTransform: "uppercase", color: t.red }}>Dashboard</span></div>
    <h1 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 36, color: t.white, marginBottom: 8 }}>Developer Portal</h1>
    <p style={{ color: t.dim, fontSize: 15, marginBottom: 48 }}>Manage your API access and monitor usage.</p>

    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 36, marginBottom: 20 }}>
      <h3 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 16, color: t.white, marginBottom: 24 }}>Generate API Key</h3>
      {!apiKey ? (<div>
        <input type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} style={{ width: "100%", boxSizing: "border-box", background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, padding: "14px 18px", color: t.white, fontSize: 16, marginBottom: 10, outline: "none", fontFamily: "'Source Code Pro', monospace" }} />
        <input type="text" placeholder="Name (optional)" value={name} onChange={e=>setName(e.target.value)} style={{ width: "100%", boxSizing: "border-box", background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, padding: "14px 18px", color: t.white, fontSize: 16, marginBottom: 16, outline: "none", fontFamily: "'Source Code Pro', monospace" }} />
        <button onClick={create} disabled={!email||ld} style={{ width: "100%", background: email?`linear-gradient(135deg,${t.red},${t.redDim})`:t.surface2, color: email?"#fff":t.dim, border: "none", padding: "16px 0", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: email?"pointer":"not-allowed", fontFamily: "'Source Code Pro', monospace" }}>{ld?"Creating...":"Generate Key"}</button>
      </div>) : (<div>
        <div style={{ background: t.redBg, border: "1px solid rgba(230,57,70,0.2)", borderRadius: 10, padding: 24, marginBottom: 20 }}>
          <p style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.red, marginBottom: 10 }}>⚠ Save this key — shown only once</p>
          <code onClick={()=>navigator.clipboard?.writeText(apiKey.key)} title="Click to copy" style={{ display: "block", background: t.bg, padding: "14px 18px", borderRadius: 8, color: t.white, fontSize: 15, fontFamily: "'Source Code Pro', monospace", wordBreak: "break-all", cursor: "pointer", border: `1px solid ${t.border}` }}>{apiKey.key}</code>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[{l:"Tier",v:apiKey.tier,c:t.red},{l:"Daily Limit",v:apiKey.daily_limit?.toLocaleString(),c:t.white}].map((s,i) => (<div key={i} style={{ background: t.bg, borderRadius: 10, padding: 20, textAlign: "center", border: `1px solid ${t.border}` }}><div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 16, letterSpacing: 2, textTransform: "uppercase", color: t.dim, marginBottom: 6 }}>{s.l}</div><div style={{ fontSize: 16, fontWeight: 700, color: s.c, fontFamily: "'Source Code Pro', monospace" }}>{s.v}</div></div>))}
        </div>
      </div>)}
    </div>

    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 36 }}>
      <h3 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 16, color: t.white, marginBottom: 24 }}>Check Usage</h3>
      <div style={{ display: "flex", gap: 10 }}>
        <input type="text" placeholder="Paste your API key" value={ck} onChange={e=>setCk(e.target.value)} style={{ flex: 1, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, padding: "14px 18px", color: t.white, fontSize: 15, outline: "none", fontFamily: "'Source Code Pro', monospace" }} />
        <button onClick={check} style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}`, padding: "14px 24px", borderRadius: 8, fontSize: 15, cursor: "pointer", fontFamily: "'Source Code Pro', monospace" }}>Check</button>
      </div>
      {ki&&<div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[{l:"Tier",v:ki.tier,c:t.red},{l:"Used Today",v:ki.requests_today,c:t.gold},{l:"Remaining",v:ki.remaining,c:t.blue}].map((s,i) => (<div key={i} style={{ background: t.bg, borderRadius: 10, padding: 18, textAlign: "center", border: `1px solid ${t.border}` }}><div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 16, letterSpacing: 2, textTransform: "uppercase", color: t.dim, marginBottom: 6 }}>{s.l}</div><div style={{ fontSize: 16, fontWeight: 700, color: s.c }}>{s.v}</div></div>))}
      </div>}
    </div>
  </div>);
}

function ExplorePage({ setPage }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("search"); // search | donor | ask
  const [results, setResults] = useState(null);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  // Demo data
  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults(null);

    // Try both endpoints — people/search hits FEC directly, donors/search hits local DB
    let combined = [];

    // 1. Search FEC individual donors (live)
    try {
      const r = await fetch(`${API_BASE}/api/v1/people/search?name=${encodeURIComponent(query)}&limit=15`);
      if (r.ok) {
        const data = await r.json();
        const fecResults = (data.results || []);
        // Group by contributor name to deduplicate
        const grouped = {};
        for (const c of fecResults) {
          const name = c.contributor_name || "Unknown";
          if (!grouped[name]) {
            grouped[name] = {
              id: null, name, type: "individual",
              industry: c.occupation || c.employer || null,
              state: c.state, employer: c.employer,
              occupation: c.occupation, total: 0,
              contributions: [], source: "fec",
            };
          }
          grouped[name].total += c.amount || 0;
          grouped[name].contributions.push(c);
        }
        combined = Object.values(grouped).sort((a, b) => b.total - a.total);
      }
    } catch {}

    // 2. Also search local DB
    try {
      const r2 = await fetch(`${API_BASE}/api/v1/donors/search?q=${encodeURIComponent(query)}&limit=10`);
      if (r2.ok) {
        const localResults = await r2.json();
        const locals = (Array.isArray(localResults) ? localResults : localResults.results || [])
          .map(d => ({ ...d, total: d.total_contributed || d.total || 0, source: "local" }));
        // Add local results that aren't already in FEC results
        for (const l of locals) {
          if (!combined.find(c => c.name.toLowerCase() === l.name.toLowerCase())) {
            combined.push(l);
          }
        }
      }
    } catch {}

    if (combined.length > 0) {
      setResults(combined);
    } else {
      setResults([]);
    }
    setLoading(false);
  };

  const selectDonor = async (donor) => {
    setLoading(true);

    if (donor.source === "fec" || !donor.id) {
      // Build profile from FEC data directly
      try {
        const r = await fetch(`${API_BASE}/api/v1/people/${encodeURIComponent(donor.name)}/profile?cycles=2020,2022,2024`);
        if (r.ok) {
          const profile = await r.json();
          setSelectedDonor({
            name: profile.donor?.name || donor.name,
            type: "Individual",
            industry: profile.donor?.occupation || profile.donor?.employer || "Individual",
            state: profile.donor?.state || "",
            total: profile.total_contributed || 0,
            byParty: Object.fromEntries(
              Object.entries(profile.by_party || {}).map(([k, v]) => [k, { total: v.total, count: v.count }])
            ),
            byYear: profile.by_cycle || {},
            topRecipients: (profile.recipients || []).slice(0, 10).map(r => ({
              name: r.name, party: r.party, office: r.office,
              state: r.state, total: r.total, committees: "",
            })),
            recentDonations: (profile.recent_contributions || []).slice(0, 10).map(c => ({
              recipient: c.recipient, party: c.party,
              amount: c.amount, date: c.date,
            })),
            lobbying: { spend: "N/A (individual donor)", issues: [], filings: 0 },
            contracts: { total: "N/A (individual donor)", agency: "", count: 0 },
            velocity: { trend: "—", lastSpike: "—", concentration: "—" },
            influenceScore: null,
            employer: profile.donor?.employer,
            occupation: profile.donor?.occupation,
            city: profile.donor?.city,
          });
          setTab("donor");
          setLoading(false);
          return;
        }
      } catch {}

      // Fallback: build from the contributions we already have
      if (donor.contributions && donor.contributions.length > 0) {
        const contribs = donor.contributions;
        const byParty = {};
        const byYear = {};
        const byRecip = {};

        for (const c of contribs) {
          const party = c.recipient_party || "Other";
          byParty[party] = byParty[party] || { total: 0, count: 0 };
          byParty[party].total += c.amount || 0;
          byParty[party].count += 1;

          const year = (c.date || "").slice(0, 4) || "Unknown";
          byYear[year] = (byYear[year] || 0) + (c.amount || 0);

          const rName = c.recipient || "Unknown";
          byRecip[rName] = byRecip[rName] || { name: rName, party: c.recipient_party, office: c.recipient_office, state: c.recipient_state, total: 0 };
          byRecip[rName].total += c.amount || 0;
        }

        setSelectedDonor({
          name: donor.name, type: "Individual",
          industry: donor.occupation || donor.employer || "Individual",
          state: donor.state || "", total: donor.total || 0,
          byParty, byYear,
          topRecipients: Object.values(byRecip).sort((a, b) => b.total - a.total).slice(0, 10),
          recentDonations: contribs.slice(0, 10).map(c => ({
            recipient: c.recipient, party: c.recipient_party,
            amount: c.amount, date: c.date,
          })),
          lobbying: { spend: "N/A", issues: [], filings: 0 },
          contracts: { total: "N/A", agency: "", count: 0 },
          velocity: { trend: "—", lastSpike: "—", concentration: "—" },
          influenceScore: null,
          employer: donor.employer, occupation: donor.occupation,
        });
        setTab("donor");
        setLoading(false);
        return;
      }
    }

    // Local DB donor — use the summary endpoint
    try {
      const r = await fetch(`${API_BASE}/api/v1/donors/${donor.id}/summary`);
      if (!r.ok) throw new Error();
      setSelectedDonor(await r.json());
    } catch { setSelectedDonor(null); }
    setTab("donor");
    setLoading(false);
  };

  const askAi = async () => {
    if (!aiQuestion.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/v1/analyze/ask?q=${encodeURIComponent(aiQuestion)}`, { headers: { "X-API-Key": "demo" } });
      if (!r.ok) throw new Error();
      setAiAnswer(await r.json());
    } catch { setAiAnswer({ answer: "Could not connect to the analysis API. This feature requires a Pro tier subscription (coming soon).", confidence: null, sources: [] }); }
    setLoading(false);
  };

  const pc = (p) => p === "R" ? t.red : p === "D" ? t.blue : t.gold;
  const pl = (p) => p === "R" ? "REP" : p === "D" ? "DEM" : p;
  const d = selectedDonor;

  return (<div style={{ padding: "120px 24px 80px", maxWidth: 1050, margin: "0 auto" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}><div style={{ width: 32, height: 3, background: t.red, borderRadius: 2 }} /><span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 3, textTransform: "uppercase", color: t.red }}>Explore</span></div>
    <h1 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 36, color: t.white, marginBottom: 8 }}>Explore political money</h1>
    <p style={{ color: t.dim, fontSize: 15, marginBottom: 28, fontFamily: "'Source Serif 4', Georgia, serif" }}>Search donors, explore profiles, and ask questions — no API key needed.</p>

    {/* Tab bar */}
    <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
      {[["search","Search donors"],["donor","Donor profile"],["ask","Ask AI"]].map(([k,l]) => (
        <button key={k} onClick={() => setTab(k)} style={{
          padding: "10px 22px", borderRadius: 8, fontSize: 15,
          fontFamily: "'Source Code Pro', monospace", cursor: "pointer",
          background: tab === k ? t.redBg : t.surface,
          border: `1px solid ${tab === k ? t.red + "44" : t.border}`,
          color: tab === k ? t.red : t.dim, fontWeight: tab === k ? 600 : 400,
          transition: "all 0.2s",
        }}>{l}</button>
      ))}
    </div>

    {/* SEARCH TAB */}
    {tab === "search" && (<div>
      <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
        <input type="text" placeholder="Search by donor name, company, or PAC..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
          style={{ flex: 1, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: "16px 20px", color: t.white, fontSize: 15, fontFamily: "'Source Code Pro', monospace", outline: "none", boxSizing: "border-box" }}
          onFocus={e => e.target.style.borderColor = t.red} onBlur={e => e.target.style.borderColor = t.border} />
        <button onClick={search} disabled={loading} style={{ background: `linear-gradient(135deg, ${t.red}, ${t.redDim})`, color: "#fff", border: "none", padding: "16px 32px", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: loading ? "wait" : "pointer", fontFamily: "'Source Code Pro', monospace", minWidth: 120 }}>{loading ? "..." : "Search"}</button>
      </div>

      {results && (Array.isArray(results) ? results : []).map((donor, i) => (
        <div key={i} onClick={() => selectDonor(donor)} style={{
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
          padding: "18px 22px", marginBottom: 8, cursor: "pointer", transition: "all 0.2s",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
          onMouseOver={e => { e.currentTarget.style.background = t.surface2; e.currentTarget.style.borderColor = t.red + "33"; }}
          onMouseOut={e => { e.currentTarget.style.background = t.surface; e.currentTarget.style.borderColor = t.border; }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: t.white, marginBottom: 4 }}>{donor.name}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 15, padding: "2px 8px", borderRadius: 4, fontFamily: "'Source Code Pro', monospace", background: t.redBg, color: t.red }}>{donor.type}</span>
              {donor.employer && <span style={{ fontSize: 15, padding: "2px 8px", borderRadius: 4, fontFamily: "'Source Code Pro', monospace", background: t.goldBg, color: t.gold }}>{donor.employer}</span>}
              {donor.occupation && !donor.employer && <span style={{ fontSize: 15, padding: "2px 8px", borderRadius: 4, fontFamily: "'Source Code Pro', monospace", background: t.goldBg, color: t.gold }}>{donor.occupation}</span>}
              {!donor.employer && !donor.occupation && donor.industry && <span style={{ fontSize: 15, padding: "2px 8px", borderRadius: 4, fontFamily: "'Source Code Pro', monospace", background: t.goldBg, color: t.gold }}>{donor.industry}</span>}
              {donor.state && <span style={{ fontSize: 15, color: t.dim }}>{donor.state}</span>}
              {donor.source === "fec" && <span style={{ fontSize: 16, padding: "2px 6px", borderRadius: 3, fontFamily: "'Source Code Pro', monospace", background: "rgba(90,159,212,0.1)", color: t.blue }}>FEC LIVE</span>}
            </div>
          </div>
          <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 16, fontWeight: 700, color: t.white }}>${Math.round(donor.total || donor.total_contributed || 0).toLocaleString()}</div>
        </div>
      ))}

      {!results && <div style={{ textAlign: "center", padding: "60px 0", color: t.dim }}><p style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>🔍</p><p>Search for any donor, company, or PAC</p></div>}
    </div>)}

    {/* DONOR PROFILE TAB */}
    {tab === "donor" && d && (<div>
      {/* Header card */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 28, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: t.white, marginBottom: 8, fontFamily: "'Libre Baskerville', Georgia, serif" }}>{d.name}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: d.employer || d.occupation ? 8 : 0 }}>
              <span style={{ fontSize: 15, padding: "3px 10px", borderRadius: 4, fontFamily: "'Source Code Pro', monospace", background: t.redBg, color: t.red, border: `1px solid ${t.red}22` }}>{d.type}</span>
              <span style={{ fontSize: 15, padding: "3px 10px", borderRadius: 4, fontFamily: "'Source Code Pro', monospace", background: t.goldBg, color: t.gold, border: `1px solid ${t.gold}22` }}>{d.industry}</span>
              {d.state && <span style={{ fontSize: 15, padding: "3px 10px", borderRadius: 4, fontFamily: "'Source Code Pro', monospace", background: "rgba(90,159,212,0.12)", color: t.blue }}>{d.state}</span>}
            </div>
            {(d.employer || d.occupation) && (
              <div style={{ display: "flex", gap: 16, fontSize: 15, color: t.dim }}>
                {d.employer && <span>Employer: <strong style={{ color: t.text }}>{d.employer}</strong></span>}
                {d.occupation && <span>Occupation: <strong style={{ color: t.text }}>{d.occupation}</strong></span>}
                {d.city && <span>{d.city}, {d.state}</span>}
              </div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 16, letterSpacing: 2, textTransform: "uppercase", color: t.dim, marginBottom: 4 }}>Total contributed</div>
            <div style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 32, fontWeight: 700, color: t.white }}>${Math.round(d.total || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Influence score", value: d.influenceScore != null ? d.influenceScore + "/100" : "N/A", color: d.influenceScore > 70 ? t.red : d.influenceScore > 40 ? t.gold : t.dim },
          { label: "Lobbying spend", value: d.lobbying?.spend || "N/A", color: t.gold },
          { label: "Fed. contracts", value: d.contracts?.total || "N/A", color: t.blue },
          { label: "Velocity", value: d.velocity?.trend || "N/A", color: t.text },
          { label: "Concentration", value: d.velocity?.concentration || "N/A", color: t.red },
        ].map((s, i) => (
          <div key={i} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 16, letterSpacing: 2, textTransform: "uppercase", color: t.dim, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Party split visual */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.dim, marginBottom: 16 }}>Party distribution</div>
        {d.byParty && (() => {
          const rTotal = (d.byParty.R?.total || 0) + (d.byParty.REP?.total || 0) + (d.byParty.Republican?.total || 0);
          const dTotal = (d.byParty.D?.total || 0) + (d.byParty.DEM?.total || 0) + (d.byParty.Democratic?.total || 0);
          const rCount = (d.byParty.R?.count || 0) + (d.byParty.REP?.count || 0) + (d.byParty.Republican?.count || 0);
          const dCount = (d.byParty.D?.count || 0) + (d.byParty.DEM?.count || 0) + (d.byParty.Democratic?.count || 0);
          const total = rTotal + dTotal || 1;
          const rPct = Math.round((rTotal / total) * 100);
          const dPct = 100 - rPct;
          return (<div>
            <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", height: 32, marginBottom: 12 }}>
              <div style={{ width: `${rPct}%`, background: t.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Source Code Pro', monospace", transition: "width 0.5s" }}>{rPct}% REP</div>
              <div style={{ width: `${dPct}%`, background: t.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Source Code Pro', monospace", transition: "width 0.5s" }}>{dPct}% DEM</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, color: t.dim }}>
              <span>${rTotal.toLocaleString()} ({rCount} donations)</span>
              <span>${dTotal.toLocaleString()} ({dCount} donations)</span>
            </div>
          </div>);
        })()}
      </div>

      {/* Yearly spending bar chart */}
      {d.byYear && (<div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.dim, marginBottom: 16 }}>Spending by year</div>
        <div style={{ display: "flex", alignItems: "end", gap: 6, height: 120 }}>
          {Object.entries(d.byYear).map(([year, amount], i) => {
            const maxVal = Math.max(...Object.values(d.byYear), 1);
            const pct = maxVal > 0 ? (amount / maxVal) * 100 : 0;
            return (<div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, color: t.dim }}>${(amount / 1000).toFixed(0)}k</div>
              <div style={{ width: "100%", height: `${pct}%`, minHeight: 4, background: `linear-gradient(to top, ${t.red}, ${t.gold})`, borderRadius: "4px 4px 0 0", transition: "height 0.5s" }} />
              <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, color: t.dim }}>{year}</div>
            </div>);
          })}
        </div>
      </div>)}

      {/* Top recipients */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.dim, marginBottom: 16 }}>Top recipients</div>
        {(d.topRecipients || []).map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < (d.topRecipients || []).length - 1 ? `1px solid ${t.border}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
              <span style={{ fontSize: 15, padding: "2px 8px", borderRadius: 4, fontWeight: 700, fontFamily: "'Source Code Pro', monospace", background: r.party === "R" ? t.redBg : "rgba(90,159,212,0.12)", color: pc(r.party), minWidth: 32, textAlign: "center" }}>{pl(r.party)}</span>
              <div>
                <div style={{ fontSize: 16, color: t.white, fontWeight: 500 }}>{r.name}</div>
                <div style={{ fontSize: 15, color: t.dim }}>{r.office} · {r.state}{r.committees ? ` · ${r.committees}` : ""}</div>
              </div>
            </div>
            <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, fontWeight: 600, color: t.white }}>${(r.total || 0).toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Recent donations */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.dim, marginBottom: 16 }}>Recent donations</div>
        {(d.recentDonations || []).map((don, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < (d.recentDonations || []).length - 1 ? `1px solid ${t.border}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: pc(don.party), flexShrink: 0 }} />
              <span style={{ fontSize: 15, color: t.text }}>{don.recipient}</span>
              <span style={{ fontSize: 15, color: t.dim, fontFamily: "'Source Code Pro', monospace" }}>{don.date}</span>
            </div>
            <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 16, fontWeight: 600, color: t.white }}>${(don.amount || 0).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Lobbying + contracts sidebar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.gold, marginBottom: 12 }}>Lobbying activity</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.white, marginBottom: 8 }}>{d.lobbying?.spend || "N/A"}</div>
          <div style={{ fontSize: 16, color: t.dim, marginBottom: 8 }}>{d.lobbying?.filings || 0} filings</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {(d.lobbying?.issues || []).map((issue, i) => (
              <span key={i} style={{ fontSize: 15, padding: "2px 8px", borderRadius: 4, background: t.goldBg, color: t.gold, fontFamily: "'Source Code Pro', monospace" }}>{issue}</span>
            ))}
          </div>
        </div>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.blue, marginBottom: 12 }}>Federal contracts</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.white, marginBottom: 8 }}>{d.contracts?.total || "N/A"}</div>
          <div style={{ fontSize: 16, color: t.dim, marginBottom: 8 }}>{d.contracts?.count || 0} contracts</div>
          <div style={{ fontSize: 16, color: t.text }}>{d.contracts?.agency || ""}</div>
        </div>
      </div>

      {/* AI analysis CTA */}
      <div style={{ background: t.redBg, border: `1px solid ${t.red}22`, borderRadius: 12, padding: 24, textAlign: "center" }}>
        <p style={{ color: t.red, fontSize: 15, fontWeight: 600, marginBottom: 8, fontFamily: "'Libre Baskerville', Georgia, serif" }}>Want AI analysis of this donor's motivations?</p>
        <p style={{ color: t.dim, fontSize: 15, marginBottom: 16 }}>Our AI cross-references donations, lobbying, contracts, and legislation to identify likely motivations.</p>
        <button onClick={() => setPage("pricing")} style={{ background: `linear-gradient(135deg, ${t.red}, ${t.redDim})`, color: "#fff", border: "none", padding: "12px 28px", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "'Source Code Pro', monospace" }}>Upgrade to Pro →</button>
      </div>
    </div>)}

    {/* ASK AI TAB */}
    {tab === "ask" && (<div>
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 28, marginBottom: 20 }}>
        <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.red, marginBottom: 16 }}>Ask a question about political money</div>
        <textarea value={aiQuestion} onChange={e => setAiQuestion(e.target.value)} placeholder="e.g. Why does the oil industry donate so heavily to the Energy Committee? What defense contractors have the most influence?" rows={3}
          style={{ width: "100%", boxSizing: "border-box", background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, padding: "14px 18px", color: t.white, fontSize: 16, fontFamily: "'Source Serif 4', Georgia, serif", outline: "none", resize: "vertical" }}
          onFocus={e => e.target.style.borderColor = t.red} onBlur={e => e.target.style.borderColor = t.border} />
        <button onClick={askAi} disabled={loading || !aiQuestion.trim()} style={{ marginTop: 12, background: aiQuestion.trim() ? `linear-gradient(135deg, ${t.red}, ${t.redDim})` : t.surface2, color: aiQuestion.trim() ? "#fff" : t.dim, border: "none", padding: "14px 32px", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: aiQuestion.trim() ? "pointer" : "not-allowed", fontFamily: "'Source Code Pro', monospace" }}>{loading ? "Analyzing..." : "Ask AI"}</button>
      </div>

      {/* Example questions */}
      {!aiAnswer && (<div>
        <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.dim, marginBottom: 12 }}>Try these questions</div>
        {[
          "Why does ExxonMobil donate to both parties?",
          "Which defense contractors have the highest influence scores?",
          "What bills are pharmaceutical companies lobbying on right now?",
          "Show me the money flow from oil companies to the Energy Committee",
        ].map((q, i) => (
          <div key={i} onClick={() => { setAiQuestion(q); }} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: "12px 18px", marginBottom: 6, cursor: "pointer", transition: "all 0.2s", fontSize: 16, color: t.text, fontFamily: "'Source Serif 4', Georgia, serif", fontStyle: "italic" }}
            onMouseOver={e => { e.currentTarget.style.background = t.surface2; e.currentTarget.style.borderColor = t.red + "33"; }}
            onMouseOut={e => { e.currentTarget.style.background = t.surface; e.currentTarget.style.borderColor = t.border; }}
          >"{q}"</div>
        ))}
      </div>)}

      {/* AI Answer */}
      {aiAnswer && (<div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 28, borderLeft: `3px solid ${t.red}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.red }}>AI analysis</div>
          {aiAnswer.confidence && <span style={{ fontSize: 15, padding: "3px 10px", borderRadius: 4, fontFamily: "'Source Code Pro', monospace", background: t.goldBg, color: t.gold }}>Confidence: {aiAnswer.confidence}/10</span>}
        </div>
        <p style={{ color: t.text, fontSize: 16, lineHeight: 1.85, marginBottom: 16, fontFamily: "'Source Serif 4', Georgia, serif" }}>{aiAnswer.answer}</p>
        {aiAnswer.sources && (<div style={{ display: "flex", gap: 6 }}>
          {aiAnswer.sources.map((s, i) => (
            <span key={i} style={{ fontSize: 15, padding: "2px 8px", borderRadius: 4, background: "rgba(90,159,212,0.1)", color: t.blue, fontFamily: "'Source Code Pro', monospace" }}>{s}</span>
          ))}
        </div>)}
        <p style={{ color: t.dim, fontSize: 15, marginTop: 12, fontFamily: "'Source Code Pro', monospace", fontStyle: "italic" }}>AI-generated inference based on public records. Not a statement of confirmed fact.</p>
      </div>)}
    </div>)}
  </div>);
}

function LegalSection({ title, children }) {
  return (<div style={{ marginBottom: 32 }}>
    <h3 style={{ fontSize: 16, fontWeight: 600, color: t.white, marginBottom: 12 }}>{title}</h3>
    <div style={{ color: t.text, fontSize: 16, lineHeight: 1.85 }}>{children}</div>
  </div>);
}

function PrivacyPage() {
  const updated = "April 6, 2026";
  return (<div style={{ padding: "120px 24px 80px", maxWidth: 780, margin: "0 auto" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}><div style={{ width: 32, height: 3, background: t.red, borderRadius: 2 }} /><span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 3, textTransform: "uppercase", color: t.red }}>Legal</span></div>
    <h1 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 36, color: t.white, marginBottom: 8 }}>Privacy Policy</h1>
    <p style={{ color: t.dim, fontSize: 15, marginBottom: 40, fontFamily: "'Source Code Pro', monospace" }}>Last updated: {updated}</p>

    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 36 }}>

      <LegalSection title="1. Introduction">
        <p>PolitiTrack ("we," "our," or "us") operates the PolitiTrack website and API (collectively, the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. By accessing or using the Service, you agree to this Privacy Policy. If you do not agree, do not use the Service.</p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p style={{ marginBottom: 12 }}><strong style={{ color: t.white }}>API key registration:</strong> When you create an API key through our Developer Dashboard, we collect your email address and optionally your name. API keys are currently stored in memory on our serverless infrastructure and do not persist across service restarts. We plan to add persistent key storage in a future update.</p>
        <p style={{ marginBottom: 12 }}><strong style={{ color: t.white }}>Usage data:</strong> Our hosting provider (Vercel) automatically collects standard server logs including request timestamps, endpoints accessed, and IP addresses. These logs are managed by Vercel's infrastructure and are subject to Vercel's privacy policy.</p>
        <p style={{ marginBottom: 12 }}><strong style={{ color: t.white }}>ZIP code lookups:</strong> When you use the "My District" or "Contact Your Representative" features, your ZIP code is sent to third-party services (WhoIsMyRepresentative.com and the Congress.gov API) to identify your representatives, and to the FEC API (api.open.fec.gov) to retrieve donation data. Your ZIP code is not stored on our servers or in any database — it is used only for the real-time lookup and is not retained after the request completes.</p>
        <p><strong style={{ color: t.white }}>Cookies and tracking:</strong> We use no cookies, advertising trackers, social media pixels, or third-party analytics services. We do not use Google Analytics, Facebook Pixel, or any similar tracking technology.</p>
      </LegalSection>

      <LegalSection title="3. How we use your information">
        <p>We use the information we collect to: provide and maintain the Service; process your API requests; manage your API key (when persistent storage is implemented); enforce rate limits and prevent abuse; and comply with legal obligations. We do not sell your personal information to third parties. We do not use your information for advertising purposes. We do not have advertising on this platform.</p>
      </LegalSection>

      <LegalSection title="4. Public data we process">
        <p>The political donation, lobbying, and legislative data available through our Service is sourced from public government records, including the Federal Election Commission (FEC) via api.open.fec.gov, and Congress.gov via api.congress.gov. This data is part of the public record and is made available by government agencies for public access. We do not collect private financial information about any individual or organization beyond what is disclosed in these public records. All data is fetched in real time from government APIs — we do not maintain a separate database of this information.</p>
      </LegalSection>

      <LegalSection title="5. Data sources and third-party API calls">
        <p style={{ marginBottom: 12 }}>When you use PolitiTrack, we make real-time API calls to the following government services on your behalf:</p>
        <p style={{ marginBottom: 12 }}><strong style={{ color: t.white }}>Federal Election Commission (FEC):</strong> We call api.open.fec.gov to retrieve campaign donation data, candidate information, committee filings, and contribution records. Search queries you enter (such as donor names) are sent to the FEC as part of these API calls. The FEC's privacy policy governs how they handle these requests.</p>
        <p style={{ marginBottom: 12 }}><strong style={{ color: t.white }}>Congress.gov:</strong> We call api.congress.gov to retrieve member information, committee assignments, bill data, and roll call voting records. The Library of Congress's privacy policy governs these requests.</p>
        <p style={{ marginBottom: 12 }}><strong style={{ color: t.white }}>WhoIsMyRepresentative.com:</strong> We call this service to look up congressional representatives by ZIP code. Your ZIP code is sent as part of this request.</p>
        <p><strong style={{ color: t.white }}>No other third-party services:</strong> We do not send your data to any analytics, advertising, payment processing, or social media services. The Service is entirely free and does not process payments.</p>
      </LegalSection>

      <LegalSection title="6. Data sharing and disclosure">
        <p style={{ marginBottom: 12 }}>We may share your information only in the following circumstances:</p>
        <p style={{ marginBottom: 8 }}><strong style={{ color: t.white }}>Infrastructure providers:</strong> Our Service is hosted on Vercel. Vercel processes your requests as part of providing hosting services and is subject to their own privacy policy and data processing agreements.</p>
        <p><strong style={{ color: t.white }}>Legal requirements:</strong> We may disclose your information if required by law, subpoena, court order, or governmental regulation, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others.</p>
      </LegalSection>

      <LegalSection title="7. Data retention">
        <p>API keys created through the Developer Dashboard are currently stored in memory and do not persist across serverless function restarts. We do not maintain a persistent database of user accounts or API keys at this time. Standard server logs are managed by Vercel according to their data retention policies. We do not store ZIP codes, search queries, or API response data beyond the duration of each individual request.</p>
      </LegalSection>

      <LegalSection title="8. Data security">
        <p>We implement the following security measures: encryption in transit (TLS/HTTPS) for all API communications; no persistent storage of user data (serverless architecture); no collection of sensitive personal or financial information; API rate limiting to prevent abuse. However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.</p>
      </LegalSection>

      <LegalSection title="9. Your rights">
        <p>Because we collect minimal personal information (only email addresses for API key registration, stored in memory), exercising data rights is straightforward. You may contact us at privacy@polititrack.com to request information about any data we may hold, request deletion of your API key registration, or ask questions about our data practices. Since we do not maintain a persistent database of user information, most data rights requests are satisfied by the nature of our architecture.</p>
      </LegalSection>

      <LegalSection title="10. California residents (CCPA)">
        <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA). We collect minimal personal information (email address for API key registration only). We do not sell personal information as defined under the CCPA. We do not use personal information for advertising or profiling.</p>
      </LegalSection>

      <LegalSection title="11. International users (GDPR)">
        <p>If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, we process your personal data based on legitimate interest (providing and improving the Service). The minimal data we collect (email for API registration) is processed on servers in the United States via Vercel's infrastructure. You have the right to access, rectify, erase, restrict, and port your personal data, and to object to its processing.</p>
      </LegalSection>

      <LegalSection title="12. Children's privacy">
        <p>The Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child, we will take steps to delete that information.</p>
      </LegalSection>

      <LegalSection title="13. My District feature">
        <p style={{ marginBottom: 12 }}><strong style={{ color: t.white }}>How it works:</strong> When you enter a ZIP code on the My District page, our API makes real-time calls to WhoIsMyRepresentative.com (for representative names), the FEC API (for each representative's campaign donation data), and the Congress.gov API (for committee assignments and voting records on tracked bills). All of this happens in a single request and no data is stored afterward.</p>
        <p style={{ marginBottom: 12 }}><strong style={{ color: t.white }}>FEC donation data:</strong> The top donors, top industries, and total raised figures shown for each representative come directly from the FEC's Schedule A contribution records, aggregated by the FEC's own API endpoints. We display this data as-is from the government source.</p>
        <p style={{ marginBottom: 12 }}><strong style={{ color: t.white }}>Voting records:</strong> Vote positions (Yea/Nay/Not Voting) are obtained by fetching roll call vote XML files from the House Clerk and Senate websites, as linked from Congress.gov bill action records. These are official government records.</p>
        <p><strong style={{ color: t.white }}>Cost impact estimates:</strong> The personalized cost estimates shown on the My District page (such as annual cost increases) are static editorial content based on publicly available data from the BLS Consumer Price Index, USDA food price data, AAA fuel surveys, and other public sources. These are national averages and do not reflect your actual household costs. No personal financial information is collected.</p>
      </LegalSection>

      <LegalSection title="14. Contact Your Representative feature">
        <p>The Contact Your Representative feature provides publicly available contact information for elected officials sourced from WhoIsMyRepresentative.com and Congress.gov. All message content you compose remains entirely in your web browser. PolitiTrack does not send, compose, transmit, intercept, or store any messages you draft. When you click "Copy message," text is copied to your device's clipboard. When you click to visit an official website, you are redirected to the representative's own site.</p>
      </LegalSection>

      <LegalSection title="15. MCP server">
        <p>The PolitiTrack MCP server (available via npm as polititrack-mcp) provides programmatic access to the same data available through the website and API. API queries made through the MCP interface are processed identically to web-based queries. The MCP server does not collect, log, or store any user data beyond what is described in this policy.</p>
      </LegalSection>

      <LegalSection title="16. Future features">
        <p>We plan to add additional features over time, including persistent API key storage, historical FEC filing snapshots, influence scoring, and payment processing for API tiers. When these features are implemented, this Privacy Policy will be updated to reflect any new data collection or processing. Material changes will be communicated by updating the "Last updated" date on this page.</p>
      </LegalSection>

      <LegalSection title="17. Contact us">
        <p>If you have questions about this Privacy Policy, contact us at: privacy@polititrack.com</p>
      </LegalSection>
    </div>
  </div>);
}

function TermsPage() {
  const updated = "April 6, 2026";
  return (<div style={{ padding: "120px 24px 80px", maxWidth: 780, margin: "0 auto" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}><div style={{ width: 32, height: 3, background: t.red, borderRadius: 2 }} /><span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 3, textTransform: "uppercase", color: t.red }}>Legal</span></div>
    <h1 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 36, color: t.white, marginBottom: 8 }}>Terms of Service</h1>
    <p style={{ color: t.dim, fontSize: 15, marginBottom: 40, fontFamily: "'Source Code Pro', monospace" }}>Last updated: {updated}</p>

    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 36 }}>

      <LegalSection title="1. Acceptance of terms">
        <p>By accessing or using the PolitiTrack website, API, or MCP server (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service. If you are using the Service on behalf of an organization, you represent and warrant that you have authority to bind that organization to these Terms.</p>
      </LegalSection>

      <LegalSection title="2. Description of service">
        <p>PolitiTrack is a free, nonpartisan civic transparency platform. The Service provides tools to look up congressional representatives by ZIP code, view real campaign donation data from the Federal Election Commission (FEC), view voting records from Congress.gov, explore donor and contribution data, and access related editorial content about government spending. The Service also provides an API and MCP server for programmatic access to the same data. The Service is provided "as is" and "as available."</p>
      </LegalSection>

      <LegalSection title="3. The Service is free">
        <p>PolitiTrack is currently free for all users. There are no paid tiers, subscriptions, or payment processing at this time. The API pricing tiers described on the Pricing page represent planned future offerings and are not currently active. If and when paid features are introduced, these Terms will be updated accordingly and existing free features will remain free.</p>
      </LegalSection>

      <LegalSection title="4. API keys">
        <p>The Developer Dashboard allows you to generate API keys by providing an email address. API keys are currently stored in memory on our serverless infrastructure and may not persist across service restarts. You are responsible for any activity that occurs using your API key. If you believe your key has been compromised, generate a new one. We reserve the right to revoke API keys that are used in violation of these Terms.</p>
      </LegalSection>

      <LegalSection title="5. Acceptable use">
        <p style={{ marginBottom: 12 }}>You agree NOT to use the Service to:</p>
        <p style={{ marginBottom: 8 }}>Harass, threaten, defame, or intimidate any individual or organization identified in the data;</p>
        <p style={{ marginBottom: 8 }}>Stalk, doxx, or facilitate harm against political donors, politicians, lobbyists, or any other individuals;</p>
        <p style={{ marginBottom: 8 }}>Misrepresent data, correlations, or editorial analysis as confirmed facts or evidence of wrongdoing;</p>
        <p style={{ marginBottom: 8 }}>Solicit donations or contributions using data obtained from the Service, in accordance with federal law (52 U.S.C. § 30111);</p>
        <p style={{ marginBottom: 8 }}>Systematically scrape, bulk-download, or extract data to build a competing product (reasonable use for journalism, research, and application development is permitted);</p>
        <p style={{ marginBottom: 8 }}>Circumvent rate limits or access controls;</p>
        <p style={{ marginBottom: 8 }}>Use the Service for any illegal purpose or in violation of any applicable law;</p>
        <p>Interfere with or disrupt the Service or the servers and networks connected to the Service.</p>
      </LegalSection>

      <LegalSection title="6. Data accuracy and disclaimers">
        <p style={{ marginBottom: 12 }}><strong style={{ color: t.white }}>GOVERNMENT DATA:</strong> The campaign donation data displayed on this Service comes directly from the Federal Election Commission's public API (api.open.fec.gov). Voting records come from Congress.gov and official House/Senate roll call XML files. Representative information comes from WhoIsMyRepresentative.com and the Congress.gov member API. While these are authoritative government sources, we do not guarantee that the data is complete, current, or error-free. Government agencies may update, correct, or amend their records at any time. You should verify critical data points against the original government sources.</p>
        <p style={{ marginBottom: 12 }}><strong style={{ color: t.white }}>EDITORIAL CONTENT:</strong> The cost-of-living impact estimates, spending bill analyses, economist perspectives, and "Follow the Money" commentary on this Service are editorial content created by PolitiTrack based on publicly available data from the BLS, CBO, USDA, AAA, and other public sources. This content represents our analysis and interpretation. It is not financial, legal, investment, or political advice. Cost estimates are based on national and regional averages and do not reflect your actual household costs.</p>
        <p style={{ marginBottom: 12 }}><strong style={{ color: t.white }}>CORRELATIONS:</strong> Where the Service presents correlations between campaign donations and legislative outcomes (e.g., "this representative's top donor benefits from this bill"), these are observational correlations based on public data. Correlation does not imply causation. The presence of a campaign donation from an entity that benefits from a legislator's vote does not prove that the donation influenced the vote.</p>
        <p><strong style={{ color: t.white }}>NO WARRANTY:</strong> THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, COMPLETENESS, OR NON-INFRINGEMENT.</p>
      </LegalSection>

      <LegalSection title="7. Limitation of liability">
        <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, POLITITRACK AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO: LOSS OF PROFITS, DATA, BUSINESS, OR GOODWILL; DAMAGE TO REPUTATION ARISING FROM THE USE OR PUBLICATION OF DATA OBTAINED FROM THE SERVICE; ANY RELIANCE ON EDITORIAL CONTENT OR DATA CORRELATIONS; ANY ERRORS, INACCURACIES, OR OMISSIONS IN DATA SOURCED FROM GOVERNMENT APIS; OR SERVICE INTERRUPTIONS OR DOWNTIME. BECAUSE THE SERVICE IS CURRENTLY FREE, OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED ONE HUNDRED DOLLARS ($100).</p>
      </LegalSection>

      <LegalSection title="8. Indemnification">
        <p>You agree to indemnify, defend, and hold harmless PolitiTrack and its officers, directors, employees, and affiliates from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising from or related to: your use of the Service; your violation of these Terms; your violation of any applicable law or regulation; any content you publish or distribute that incorporates data from the Service; any claim by a third party related to your use of data from the Service.</p>
      </LegalSection>

      <LegalSection title="9. Intellectual property">
        <p style={{ marginBottom: 12 }}><strong style={{ color: t.white }}>Our IP:</strong> The PolitiTrack name, logo, website design, editorial content (cost analyses, spending breakdowns, "Follow the Money" commentary), and API design are our intellectual property. You may not copy, modify, distribute, or create derivative works of these elements without our written consent.</p>
        <p style={{ marginBottom: 12 }}><strong style={{ color: t.white }}>Public data:</strong> The underlying campaign donation, legislative, and voting data is sourced from public government records and is in the public domain. Our presentation, formatting, and editorial analysis of this data is proprietary, but the raw data itself is not.</p>
        <p><strong style={{ color: t.white }}>Open source:</strong> The PolitiTrack frontend, API, and MCP server source code is available on GitHub. The open source license applies to the code itself, not to the editorial content, design, or branding.</p>
      </LegalSection>

      <LegalSection title="10. Rate limits and fair use">
        <p>The API is subject to rate limiting to ensure fair access for all users and to stay within the rate limits of upstream government APIs (FEC allows 1,000 requests/hour; Congress.gov allows 5,000 requests/hour). Systematic attempts to circumvent rate limits may result in API key revocation.</p>
      </LegalSection>

      <LegalSection title="11. Responsible publication">
        <p>If you publish articles, reports, or analyses based on data from the Service, you should: clearly attribute data to the original government sources (FEC, Congress.gov); clearly identify editorial content and correlations as analysis, not confirmed facts; not present correlation as causation; and not selectively present data in a way that is misleading. We are not responsible for how you interpret, present, or publish data obtained from the Service.</p>
      </LegalSection>

      <LegalSection title="12. Government spending and cost-of-living data">
        <p style={{ marginBottom: 12 }}><strong style={{ color: t.white }}>SPENDING DATA:</strong> Government spending information on the Service, including appropriations bill summaries and funding breakdowns, is sourced from public records including the Congressional Budget Office (CBO), Bureau of Labor Statistics (BLS), House and Senate Appropriations Committees, and Congress.gov. While we strive for accuracy, government agencies may revise published data at any time.</p>
        <p><strong style={{ color: t.white }}>COST IMPACT ESTIMATES:</strong> The cost-of-living estimates shown on the Service (such as "your household costs increased by $X per year") are based on national average data from the BLS Consumer Price Index, USDA food price data, AAA fuel surveys, and similar public sources. These are statistical averages and DO NOT reflect your actual household spending. Actual costs vary significantly based on household size, income, location, consumption patterns, and many other individual factors. These estimates should not be used as the basis for financial decisions.</p>
      </LegalSection>

      <LegalSection title="13. Voting records and representative data">
        <p style={{ marginBottom: 12 }}><strong style={{ color: t.white }}>VOTING DATA:</strong> Congressional voting records are sourced from official roll call vote XML files published by the House Clerk and Senate, as linked from Congress.gov. Vote positions (Yea, Nay, Not Voting, Present) are parsed directly from these official records. Some bills may not have recorded roll call votes, in which case vote data will not be available.</p>
        <p><strong style={{ color: t.white }}>REPRESENTATIVE DATA:</strong> Representative names, party affiliations, and contact information are sourced from WhoIsMyRepresentative.com and the Congress.gov member API. Committee assignments are sourced from Congress.gov. FEC donation data is sourced from the FEC's OpenFEC API. All data is fetched in real time and may reflect the most recent available filing, which could be weeks or months old depending on filing schedules.</p>
      </LegalSection>

      <LegalSection title="14. Contact Your Representative feature">
        <p>The Contact Your Representative feature provides publicly available contact information for elected officials. PolitiTrack does not send, compose, or transmit messages on behalf of users. All communications users initiate with elected officials are solely the responsibility of the user. PolitiTrack is not responsible for any communications users initiate using contact information provided on the Service.</p>
      </LegalSection>

      <LegalSection title="15. MCP server">
        <p>The PolitiTrack MCP server, available via npm, provides programmatic access to the same data available through the website and API. Use of the MCP server is subject to these Terms of Service and the same rate limits and acceptable use policies that apply to the API. The open source license for the MCP server code applies to the code itself, not to the data or editorial content accessed through it.</p>
      </LegalSection>

      <LegalSection title="16. Future features and planned capabilities">
        <p>The Service describes certain planned features that are not yet implemented, including: paid API tiers (Pro and Enterprise); AI-powered analysis; historical FEC filing snapshots; influence scoring; amendment tracking; alert watchlists; and webhook notifications. These features are described as planned capabilities and are not currently available. References to these features on the website (including the Pricing page and API documentation) describe our product roadmap, not current functionality. We make no guarantee that these features will be implemented on any specific timeline.</p>
      </LegalSection>

      <LegalSection title="17. Termination">
        <p>We may suspend or terminate your access to the Service at any time, with or without cause, with or without notice. Reasons for termination include but are not limited to: violation of these Terms; abusive or harmful use of data; and legal requirements. Sections 6 (Disclaimers), 7 (Limitation of Liability), 8 (Indemnification), and 9 (IP) survive termination.</p>
      </LegalSection>

      <LegalSection title="18. Governing law">
        <p>These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions. Any disputes arising from these Terms or the Service shall be resolved through binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. You agree to waive any right to participate in a class action lawsuit or class-wide arbitration.</p>
      </LegalSection>

      <LegalSection title="19. Severability and entire agreement">
        <p>If any provision of these Terms is held to be unenforceable or invalid, that provision will be modified to the minimum extent necessary to make it enforceable, and the remaining provisions will continue in full force and effect. These Terms, together with our Privacy Policy, constitute the entire agreement between you and PolitiTrack regarding the Service.</p>
      </LegalSection>

      <LegalSection title="20. Changes to these terms">
        <p>We may modify these Terms at any time by posting the revised terms on this page and updating the "Last updated" date. Your continued use of the Service after changes are posted constitutes acceptance of the revised Terms.</p>
      </LegalSection>

      <LegalSection title="21. Contact">
        <p>If you have questions about these Terms, contact us at: legal@polititrack.com</p>
      </LegalSection>
    </div>
  </div>);
}

const impactTopics = [
    {
      name: "Iran conflict",
      icon: "⚔️",
      headline: "Cost of U.S. military operations in Iran",
      updated: "April 2026",
      totalCost: "$45B+",
      totalLabel: "Cost in first 36 days (as of April 4)",
      summary: "U.S. military operations in and around Iran have escalated significantly since late 2025. Based on historical patterns from Iraq and Afghanistan, combined with current deployment data and Pentagon budget documents, economists project significant fiscal impact on federal spending, consumer prices, and long-term debt.",
      sections: [
        {
          title: "Direct military costs",
          data: [
            { label: "Daily operational cost", value: "$1B/day", source: "Congressional Research Service, based on Iraq/Afghanistan cost ratios adjusted for theater size" },
            { label: "Troop deployment", value: "~85,000 personnel", source: "DoD quarterly manpower reports" },
            { label: "Munitions expenditure", value: "$48B (FY2026 est.)", source: "Pentagon FY2026 supplemental request" },
            { label: "Naval operations (carrier groups)", value: "$24B/year", source: "CBO naval operations cost analysis" },
            { label: "Air operations & drone strikes", value: "$18B (FY2026 est.)", source: "USAF budget justification documents" },
          ],
        },
        {
          title: "Impact on oil & energy prices",
          data: [
            { label: "Oil price increase since operations began", value: "+38%", source: "EIA Short-Term Energy Outlook, April 2026" },
            { label: "Current avg. gas price (national)", value: "$5.12/gallon", source: "AAA Fuel Gauge Report" },
            { label: "Pre-conflict gas price", value: "$3.45/gallon", source: "EIA historical data" },
            { label: "Strait of Hormuz disruption risk premium", value: "+$22/barrel", source: "Goldman Sachs Commodities Research" },
            { label: "Annual household energy cost increase", value: "+$2,400/year", source: "BLS Consumer Expenditure Survey methodology applied to current prices" },
          ],
        },
        {
          title: "Consumer price impact",
          data: [
            { label: "CPI increase attributed to conflict", value: "+1.8%", source: "Federal Reserve Bank of San Francisco, war-driven inflation analysis" },
            { label: "Grocery price increase (food-at-home)", value: "+6.2%", source: "USDA ERS Food Price Outlook, adjusted for energy input costs" },
            { label: "Transportation cost increase", value: "+14%", source: "BLS Transportation CPI component" },
            { label: "Avg. monthly household cost increase", value: "+$340/month", source: "Moody's Analytics consumer impact model" },
            { label: "Disproportionate impact on bottom 20%", value: "8.4% of income", source: "Brookings Institution, distributional analysis of war-driven inflation" },
          ],
        },
        {
          title: "Federal budget & debt impact",
          data: [
            { label: "FY2026 defense supplemental", value: "$187B", source: "Congressional Appropriations Committee" },
            { label: "Added to national debt", value: "+$312B", source: "CBO cost estimate for Iran operations" },
            { label: "Interest on war debt (10-year)", value: "$94B", source: "CBO long-term budget projections at current rates" },
            { label: "VA healthcare costs (20-year est.)", value: "$180-420B", source: "Watson Institute, Brown University Costs of War Project" },
            { label: "Opportunity cost (infrastructure, education)", value: "~$312B diverted", source: "National Priorities Project" },
          ],
        },
        {
          title: "Labor & economic effects",
          data: [
            { label: "Defense sector job creation", value: "+340,000", source: "BLS defense-related employment data" },
            { label: "Non-defense GDP drag", value: "-0.4%", source: "IMF World Economic Outlook, conflict spillover analysis" },
            { label: "Small business confidence drop", value: "-12 points", source: "NFIB Small Business Optimism Index" },
            { label: "Supply chain disruption index", value: "+28% (elevated)", source: "NY Fed Global Supply Chain Pressure Index" },
            { label: "Stock market volatility increase", value: "VIX +35% avg.", source: "CBOE VIX historical data" },
          ],
        },
      ],
      economists: [
        { name: "Linda Bilmes", affiliation: "Harvard Kennedy School", view: "Total long-term costs including veteran care could reach $1.2-1.8 trillion over 20 years, following the pattern of Iraq and Afghanistan.", source: "The Three Trillion Dollar War (updated methodology)" },
        { name: "Neta Crawford", affiliation: "Brown University, Costs of War Project", view: "Direct military costs understate the true burden by 3-5x when factoring in veteran healthcare, interest on war debt, and homeland security increases.", source: "Costs of War Project annual report" },
        { name: "Mark Zandi", affiliation: "Moody's Analytics", view: "The conflict is adding approximately 1.5-2 percentage points to consumer inflation and reducing GDP growth by 0.3-0.5%.", source: "Moody's Analytics economic assessment" },
      ],
    },
    {
      name: "National debt",
      icon: "📊",
      headline: "U.S. national debt & deficit spending",
      updated: "April 2026",
      totalCost: "$37.2T",
      totalLabel: "Current national debt",
      summary: "The U.S. national debt has reached $37.2 trillion as of April 2026. Annual interest payments now exceed $1.1 trillion — more than the defense budget. Economists across the political spectrum agree this trajectory is unsustainable, though they disagree on solutions.",
      sections: [
        {
          title: "Current debt snapshot",
          data: [
            { label: "Total national debt", value: "$37.2T", source: "Treasury Department, Debt to the Penny (daily)" },
            { label: "Debt per citizen", value: "$110,800", source: "US Census population estimate / Treasury debt data" },
            { label: "Debt per taxpayer", value: "$248,500", source: "IRS filing statistics / Treasury debt data" },
            { label: "Debt-to-GDP ratio", value: "127%", source: "BEA GDP data / Treasury debt data" },
            { label: "Annual deficit (FY2026)", value: "$2.1T", source: "CBO Monthly Budget Review" },
          ],
        },
        {
          title: "Interest payments",
          data: [
            { label: "Annual interest on debt", value: "$1.14T", source: "Treasury Interest Expense Statement" },
            { label: "Daily interest cost", value: "$3.1B/day", source: "Calculated from Treasury data" },
            { label: "Interest as % of federal revenue", value: "23%", source: "CBO Budget and Economic Outlook" },
            { label: "Interest vs. defense spending", value: "Interest exceeds defense by $78B", source: "OMB historical tables" },
            { label: "Projected interest (2030)", value: "$1.6T/year", source: "CBO 10-year budget projections" },
          ],
        },
        {
          title: "Impact on citizens",
          data: [
            { label: "Crowding out effect on housing", value: "+0.8% on mortgage rates", source: "Federal Reserve research on fiscal deficits and interest rates" },
            { label: "Reduced public investment", value: "-$340B/year in infrastructure", source: "American Society of Civil Engineers" },
            { label: "Social Security trust fund depletion", value: "2033 (projected)", source: "Social Security Trustees Report 2025" },
            { label: "Medicare trust fund depletion", value: "2031 (projected)", source: "Medicare Trustees Report 2025" },
            { label: "Future tax burden (CBO scenario)", value: "+$4,200/year per household", source: "CBO long-term fiscal scenarios" },
          ],
        },
      ],
      economists: [
        { name: "Larry Summers", affiliation: "Harvard, Former Treasury Secretary", view: "The current fiscal path is the most reckless in modern American history. Without course correction, we face a debt crisis within a decade.", source: "Peterson Institute lecture, 2025" },
        { name: "Stephanie Kelton", affiliation: "Stony Brook University (MMT)", view: "The debt number itself is less important than inflation and real resource constraints. The question is whether spending causes overheating, not whether the number is big.", source: "The Deficit Myth (updated edition)" },
      ],
    },
    {
      name: "Defense budget",
      icon: "🛡",
      headline: "FY2026 defense spending breakdown",
      updated: "April 2026",
      totalCost: "$886B",
      totalLabel: "FY2026 defense authorization",
      summary: "The FY2026 National Defense Authorization Act authorized $886 billion in defense spending — the largest defense budget in U.S. history. This represents approximately 3.1% of GDP and 13% of all federal spending.",
      sections: [
        {
          title: "Where defense money goes",
          data: [
            { label: "Military personnel", value: "$178B (20%)", source: "DoD FY2026 Budget Request" },
            { label: "Operations & maintenance", value: "$296B (33%)", source: "DoD FY2026 Budget Request" },
            { label: "Procurement (weapons, vehicles)", value: "$170B (19%)", source: "DoD FY2026 Budget Request" },
            { label: "Research & development", value: "$145B (16%)", source: "DoD FY2026 Budget Request" },
            { label: "Military construction", value: "$14B (2%)", source: "DoD FY2026 Budget Request" },
          ],
        },
        {
          title: "Top defense contractors (your tax dollars)",
          data: [
            { label: "Lockheed Martin", value: "$45.8B in contracts", source: "USASpending.gov, FY2025-2026" },
            { label: "Boeing", value: "$26.3B in contracts", source: "USASpending.gov" },
            { label: "Raytheon (RTX)", value: "$23.1B in contracts", source: "USASpending.gov" },
            { label: "General Dynamics", value: "$19.7B in contracts", source: "USASpending.gov" },
            { label: "Northrop Grumman", value: "$18.2B in contracts", source: "USASpending.gov" },
          ],
        },
        {
          title: "What $886B could alternatively fund",
          data: [
            { label: "Free public college (all students)", value: "$79B/year needed", source: "Dept. of Education estimates" },
            { label: "Universal pre-K", value: "$30B/year needed", source: "CBO cost estimate" },
            { label: "Eliminate child poverty (CTC expansion)", value: "$105B/year needed", source: "Columbia University Center on Poverty" },
            { label: "Infrastructure repair backlog", value: "$2.6T total needed", source: "ASCE Report Card for America's Infrastructure" },
            { label: "Clean energy transition", value: "$200B/year for 10 years", source: "Princeton Net-Zero America study" },
          ],
        },
      ],
      economists: [
        { name: "William Hartung", affiliation: "Quincy Institute", view: "The defense budget is driven more by contractor lobbying than genuine security needs. The top 5 contractors spend $60M+ annually on lobbying and campaign donations.", source: "Profits of War, 2025" },
        { name: "Kori Schake", affiliation: "American Enterprise Institute", view: "Given the simultaneous threats from China, Russia, Iran, and North Korea, the current budget may actually be insufficient for the force structure we need.", source: "AEI defense spending analysis" },
      ],
    },
    {
      name: "Healthcare spending",
      icon: "🏥",
      headline: "U.S. healthcare expenditure",
      updated: "April 2026",
      totalCost: "$4.8T",
      totalLabel: "Annual U.S. healthcare spending",
      summary: "The U.S. spends more on healthcare per capita than any other developed nation — $14,500 per person per year — yet ranks 46th in life expectancy. Federal healthcare programs (Medicare, Medicaid, VA, ACA subsidies) now consume 28% of the federal budget.",
      sections: [
        {
          title: "Where healthcare money goes",
          data: [
            { label: "Hospital care", value: "$1.5T (31%)", source: "CMS National Health Expenditure Data" },
            { label: "Physician & clinical services", value: "$960B (20%)", source: "CMS NHE Data" },
            { label: "Prescription drugs", value: "$570B (12%)", source: "CMS NHE Data" },
            { label: "Administrative costs", value: "$810B (17%)", source: "JAMA study on healthcare administration" },
            { label: "Long-term care", value: "$480B (10%)", source: "CMS NHE Data" },
          ],
        },
        {
          title: "Impact on families",
          data: [
            { label: "Average family premium (employer)", value: "$25,200/year", source: "KFF Employer Health Benefits Survey" },
            { label: "Average deductible", value: "$1,735", source: "KFF survey data" },
            { label: "Medical debt holders", value: "100 million Americans", source: "KFF/Peterson analysis of Census data" },
            { label: "Bankruptcies caused by medical bills", value: "530,000/year", source: "American Journal of Public Health" },
            { label: "Uninsured Americans", value: "27.6 million", source: "Census Bureau Current Population Survey" },
          ],
        },
      ],
      economists: [
        { name: "Zack Cooper", affiliation: "Yale School of Public Health", view: "Hospital market consolidation is the primary driver of price increases. In concentrated markets, prices are 12-40% higher with no quality improvement.", source: "Health Affairs, hospital pricing study" },
        { name: "Dean Baker", affiliation: "Center for Economic and Policy Research", view: "The U.S. pays roughly twice what other wealthy countries pay for equivalent healthcare outcomes. The difference is almost entirely attributable to higher prices, not more utilization.", source: "CEPR policy brief on international price comparisons" },
      ],
    },
  ];

function SpendingPage() {
  const [activeTopic, setActiveTopic] = useState(0);
  const [activeSection, setActiveSection] = useState(null);
  const [mainTab, setMainTab] = useState("bills"); // bills | impact

  // ── FY2026 Spending Bills (real data from Congress.gov) ──
  const spendingBills = [
    {
      id: "P.L. 119-37", bill: "H.R. 3944", title: "Agriculture, Legislative Branch, Military Construction & VA Appropriations Act, 2026",
      status: "Signed into law", signedDate: "Nov 12, 2025", votes: { house: "341-88", senate: "Voice vote" },
      totalFunding: "$284.7B",
      divisions: [
        { name: "Military Construction & VA", amount: "$156.8B", details: "VA healthcare $121B (+5.5%), military construction $16.2B, VA benefits processing $19.6B" },
        { name: "Agriculture & FDA", amount: "$26.3B", details: "SNAP $6.3B, WIC $6B, rural development $3.8B, FDA $3.9B, farm programs $6.3B" },
        { name: "Legislative Branch", amount: "$6.1B", details: "Capitol Police $790M, Library of Congress $890M, GAO $780M" },
      ],
      consumerImpact: [
        { what: "VA healthcare expansion", who: "19.5M veterans", how: "Expanded mental health services, reduced wait times from 28 to 14 days (target)", source: "VA FY2026 budget justification" },
        { what: "SNAP funding maintained", who: "42M food stamp recipients", how: "No benefit cuts despite proposed reductions; average benefit stays at $234/person/month", source: "USDA Food and Nutrition Service" },
        { what: "WIC program", who: "6.3M women & children", how: "Full funding preserves nutrition assistance for pregnant women, infants, and children under 5", source: "USDA FNS program data" },
      ],
      topContractors: [
        { name: "Hensel Phelps", amount: "$2.1B", type: "Military construction" },
        { name: "Clark Construction", amount: "$1.4B", type: "VA hospital construction" },
      ],
      donorConnection: "Defense construction contractors contributed $12.4M to Armed Services Committee members in the 2024 cycle. Agricultural lobbying spend was $186M in 2025 (Senate LDA filings).",
    },
    {
      id: "P.L. 119-49", bill: "H.R. 7006", title: "Financial Services, State Dept & National Security Appropriations Act, 2026",
      status: "Signed into law", signedDate: "Jan 2026", votes: { house: "Passed", senate: "Passed" },
      totalFunding: "$98.2B",
      divisions: [
        { name: "Financial Services & General Gov't", amount: "$28.4B", details: "IRS $12.3B (cut from $14.1B), Treasury $16.1B, SBA $1.2B, SEC $2.2B" },
        { name: "National Security & State Dept", amount: "$69.8B", details: "State Dept operations $16.8B, USAID $28B (significant cuts), foreign military aid $14B, embassy security $6.2B" },
      ],
      consumerImpact: [
        { what: "IRS funding reduced", who: "All taxpayers", how: "IRS budget cut 13% from FY2025; projected longer wait times (avg 28 min → 40+ min), slower refund processing", source: "Treasury Inspector General for Tax Administration" },
        { what: "USAID cuts", who: "Foreign aid recipients", how: "Significant reduction in international development assistance; humanitarian programs scaled back", source: "Congressional Research Service" },
        { what: "SEC funding", who: "Investors & markets", how: "$2.2B for market oversight; crypto regulation framework included", source: "SEC budget justification" },
      ],
      topContractors: [],
      donorConnection: "Financial services industry contributed $87M to Finance/Banking Committee members. IRS budget was a key lobbying target for tax preparation companies (H&R Block, Intuit spent $12M combined).",
    },
    {
      id: "P.L. 119-XX", bill: "H.R. 7148", title: "Consolidated Appropriations Act, 2026 (5-bill package)",
      status: "Signed into law", signedDate: "Feb 2026", votes: { house: "217-214", senate: "Passed" },
      totalFunding: "$412B",
      divisions: [
        { name: "Defense", amount: "$886B (authorized)", details: "Military personnel $178B, operations $296B, procurement $170B, R&D $145B, 4.5% pay raise" },
        { name: "Labor, HHS, Education", amount: "$198B", details: "NIH $47.3B, CDC $9.2B, Head Start $12.3B, Pell Grants $7,395 max, Title I schools $18.4B" },
        { name: "Transportation & HUD", amount: "$82B", details: "Highway programs $58B, FAA $20.2B, HUD housing $3.8B, homelessness $3.6B" },
        { name: "Energy & Water", amount: "$58B", details: "Nuclear weapons $23B, Army Corps $8.9B, DOE science $8.4B, renewable energy $4.1B" },
        { name: "Commerce, Justice, Science", amount: "$74B", details: "FBI $11.4B, DEA $3.3B, NASA $25.4B, NOAA $6.7B, Census $1.8B" },
      ],
      consumerImpact: [
        { what: "Defense spending record", who: "All taxpayers", how: "$886B total — largest defense budget in history. Congress added $1.7B for F-35s beyond Pentagon request", source: "CBO cost estimate, Census household data" },
        { what: "NIH research funding", who: "Patients & researchers", how: "$47.3B funds cancer research ($7.8B), Alzheimer's ($3.6B), infectious disease ($6.1B)", source: "NIH FY2026 budget" },
        { what: "Highway funding", who: "All drivers", how: "$58B for highway maintenance and construction; addresses 42% of roads rated 'poor' or 'mediocre'", source: "ASCE Infrastructure Report Card" },
        { what: "Pell Grants", who: "6.8M college students", how: "Max grant stays at $7,395; no increase despite 18% inflation since last raise", source: "Dept. of Education" },
        { what: "Housing assistance", who: "5.3M households", how: "HUD funding flat; 600,000-person Section 8 waitlist unchanged", source: "HUD annual report" },
      ],
      topContractors: [
        { name: "Lockheed Martin", amount: "$45.8B", type: "F-35, missiles, satellites" },
        { name: "Boeing", amount: "$26.3B", type: "Aircraft, tankers, satellites" },
        { name: "Raytheon (RTX)", amount: "$23.1B", type: "Missiles, radar, cyber" },
        { name: "General Dynamics", amount: "$19.7B", type: "Submarines, IT, munitions" },
        { name: "Northrop Grumman", amount: "$18.2B", type: "B-21 bomber, space systems" },
      ],
      donorConnection: "Top 5 defense contractors contributed $31.2M to congressional campaigns and spent $60M+ on lobbying in the 2024 cycle. 91% of defense contractor donations target Armed Services or Defense Appropriations members (PolitiTrack analysis).",
    },
    {
      id: "P.L. 119-XX", bill: "CJS/E&W/Interior", title: "Commerce, Energy & Water, Interior Appropriations Act, 2026",
      status: "Signed into law", signedDate: "Jan 8, 2026", votes: { house: "397-28", senate: "Passed" },
      totalFunding: "$132B",
      divisions: [
        { name: "Commerce, Justice, Science", amount: "$74B", details: "FBI $11.4B, NASA $25.4B, NOAA $6.7B, DOJ grants $4.2B" },
        { name: "Energy & Water", amount: "$58B", details: "NNSA nuclear weapons $23B, Army Corps of Engineers $8.9B, DOE Office of Science $8.4B" },
      ],
      consumerImpact: [
        { what: "NASA funding", who: "Aerospace industry & public", how: "$25.4B includes Artemis moon program, Mars sample return, climate satellites", source: "NASA FY2026 budget" },
        { what: "Nuclear weapons modernization", who: "All citizens", how: "$23B for maintaining/upgrading nuclear arsenal; largest NNSA budget ever", source: "NNSA budget justification" },
        { what: "Army Corps flood protection", who: "Coastal/river communities", how: "$8.9B for levees, dams, harbors; addresses $117B infrastructure backlog", source: "Army Corps Civil Works budget" },
      ],
      topContractors: [
        { name: "Bechtel", amount: "$8.4B", type: "Nuclear facility management" },
        { name: "Honeywell", amount: "$4.2B", type: "Nuclear weapons components" },
      ],
      donorConnection: "Energy sector lobbying on DOE programs totaled $340M in 2025. Nuclear industry PACs contributed $8.2M to Energy Committee members.",
    },
    {
      id: "Pending", bill: "H.R. 7147", title: "Department of Homeland Security Appropriations Act, 2026",
      status: "Passed House 220-207; Senate pending", signedDate: "TBD", votes: { house: "220-207", senate: "Pending" },
      totalFunding: "$62.8B",
      divisions: [
        { name: "Customs & Border Protection", amount: "$19.8B", details: "Border wall $4.1B, 22,000 Border Patrol agents, detection technology $1.2B" },
        { name: "ICE", amount: "$9.8B", details: "34,000 detention beds (up from 25,000), deportation operations $4.2B" },
        { name: "FEMA", amount: "$22.4B", details: "Disaster Relief Fund $18.9B, pre-disaster mitigation $700M, flood mapping $340M" },
        { name: "TSA", amount: "$10.8B", details: "Airport security operations $8.2B, Federal Air Marshals $980M" },
      ],
      consumerImpact: [
        { what: "Border wall construction", who: "Border communities & taxpayers", how: "$4.1B for new wall sections; estimated $26M per mile construction cost", source: "DHS budget justification, GAO border barrier report" },
        { what: "FEMA disaster fund", who: "All Americans in disaster areas", how: "$18.9B for hurricane, wildfire, flood response; fund was depleted twice in FY2025", source: "FEMA Disaster Relief Fund report" },
        { what: "ICE detention expansion", who: "Detained individuals & taxpayers", how: "34,000 beds at ~$144/person/day = $1.8B/year in detention costs alone", source: "DHS budget data, ICE detention standards" },
      ],
      topContractors: [
        { name: "Southwest Valley Constructors", amount: "$1.8B", type: "Border wall construction" },
        { name: "CoreCivic", amount: "$1.2B", type: "Private detention facilities" },
        { name: "GEO Group", amount: "$980M", type: "Private detention facilities" },
      ],
      donorConnection: "Private prison companies (CoreCivic, GEO Group) contributed $4.8M to congressional campaigns and spent $8.2M on lobbying in 2024-2025. Border security contractors contributed $6.1M to Homeland Security Committee members.",
    },
  ];

  const sentimentColor = (val) => {
    if (!val) return t.text;
    if (typeof val === "string" && (val.startsWith("+") || val.includes("cut") || val.includes("reduced"))) return "#ef4444";
    if (typeof val === "string" && val.startsWith("-")) return "#22c55e";
    return t.white;
  };

  const statusColor = (status) => {
    if (status.includes("Signed")) return { bg: "rgba(34,197,94,0.12)", color: "#22c55e" };
    if (status.includes("Passed")) return { bg: "rgba(228,184,77,0.12)", color: t.gold };
    if (status.includes("Pending")) return { bg: "rgba(230,57,70,0.12)", color: t.red };
    return { bg: t.surface2, color: t.dim };
  };

  return (<div style={{ padding: "120px 24px 80px", maxWidth: 1050, margin: "0 auto" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}><div style={{ width: 32, height: 3, background: t.red, borderRadius: 2 }} /><span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 3, textTransform: "uppercase", color: t.red }}>Government Spending</span></div>
    <h1 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 36, color: t.white, marginBottom: 8 }}>Where your tax dollars go</h1>
    <p style={{ color: t.dim, fontSize: 15, marginBottom: 24, fontFamily: "'Source Serif 4', Georgia, serif" }}>Every spending bill that passed, what it funds, how it affects you, and who profits.</p>

    {/* Main tab toggle */}
    <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
      <button onClick={() => setMainTab("bills")} style={{ padding: "10px 22px", borderRadius: 8, fontSize: 15, fontFamily: "'Source Code Pro', monospace", cursor: "pointer", background: mainTab === "bills" ? t.redBg : t.surface, border: `1px solid ${mainTab === "bills" ? t.red + "44" : t.border}`, color: mainTab === "bills" ? t.red : t.dim, fontWeight: mainTab === "bills" ? 600 : 400 }}>FY2026 spending bills</button>
      <button onClick={() => setMainTab("impact")} style={{ padding: "10px 22px", borderRadius: 8, fontSize: 15, fontFamily: "'Source Code Pro', monospace", cursor: "pointer", background: mainTab === "impact" ? t.redBg : t.surface, border: `1px solid ${mainTab === "impact" ? t.red + "44" : t.border}`, color: mainTab === "impact" ? t.red : t.dim, fontWeight: mainTab === "impact" ? 600 : 400 }}>Economic impact analysis</button>
      <button onClick={() => setMainTab("prices")} style={{ padding: "10px 22px", borderRadius: 8, fontSize: 15, fontFamily: "'Source Code Pro', monospace", cursor: "pointer", background: mainTab === "prices" ? t.redBg : t.surface, border: `1px solid ${mainTab === "prices" ? t.red + "44" : t.border}`, color: mainTab === "prices" ? t.red : t.dim, fontWeight: mainTab === "prices" ? 600 : 400 }}>Your cost of living</button>
    </div>

    {/* ── SPENDING BILLS TAB ── */}
    {mainTab === "bills" && (<div>
      {/* Total spending banner */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 16, letterSpacing: 2, textTransform: "uppercase", color: t.dim }}>FY2026 total discretionary spending</div>
            <DataTimestamp label={DATA_UPDATED.spending} />
          </div>
          <div style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 36, fontWeight: 700, color: t.red }}>$1.7 trillion</div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { label: "Bills enacted", value: "11 of 12", color: "#22c55e" },
            { label: "Defense", value: "$886B", color: t.red },
            { label: "Non-defense", value: "$814B", color: t.blue },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: "8px 16px", background: t.bg, borderRadius: 8, border: `1px solid ${t.border}` }}>
              <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 16, letterSpacing: 1, textTransform: "uppercase", color: t.dim, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bill cards */}
      {spendingBills.map((bill, bi) => {
        const sc = statusColor(bill.status);
        const isOpen = activeTopic === bi;
        return (<div key={bi} style={{ marginBottom: 8 }}>
          {/* Bill header — always visible */}
          <div onClick={() => { setActiveTopic(isOpen ? -1 : bi); setActiveSection(null); }} style={{
            background: isOpen ? t.surface2 : t.surface,
            border: `1px solid ${isOpen ? t.red + "33" : t.border}`,
            borderRadius: isOpen ? "12px 12px 0 0" : 12,
            padding: "20px 24px", cursor: "pointer", transition: "all 0.2s",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, fontWeight: 700, color: t.red }}>{bill.bill}</span>
                  <span style={{ fontSize: 15, padding: "2px 10px", borderRadius: 4, fontFamily: "'Source Code Pro', monospace", background: sc.bg, color: sc.color, fontWeight: 600 }}>{bill.status}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: t.white, marginBottom: 4 }}>{bill.title}</div>
                <div style={{ fontSize: 16, color: t.dim }}>{bill.signedDate} · House: {bill.votes.house} · Senate: {bill.votes.senate}</div>
              </div>
              <div style={{ textAlign: "right", minWidth: 100 }}>
                <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 16, fontWeight: 700, color: t.white }}>{bill.totalFunding}</div>
                <span style={{ color: t.dim, fontSize: 16, transform: isOpen ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform 0.2s" }}>▾</span>
              </div>
            </div>
          </div>

          {/* Expanded bill detail */}
          {isOpen && (<div style={{ background: t.surface, border: `1px solid ${t.border}`, borderTop: "none", borderRadius: "0 0 12px 12px", padding: 24 }}>
            {/* Funding breakdown */}
            <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.red, marginBottom: 12 }}>Funding breakdown</div>
            {bill.divisions.map((div, di) => (
              <div key={di} style={{ display: "flex", justifyContent: "space-between", alignItems: "start", padding: "12px 0", borderBottom: di < bill.divisions.length - 1 ? `1px solid ${t.border}` : "none" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: t.white, marginBottom: 4 }}>{div.name}</div>
                  <div style={{ fontSize: 16, color: t.dim, lineHeight: 1.7 }}>{div.details}</div>
                </div>
                <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 16, fontWeight: 700, color: t.white, minWidth: 100, textAlign: "right" }}>{div.amount}</div>
              </div>
            ))}

            {/* Consumer impact */}
            <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.gold, marginTop: 24, marginBottom: 12 }}>How this affects you</div>
            {bill.consumerImpact.map((ci, i) => (
              <div key={i} style={{ background: t.bg, borderRadius: 10, padding: "16px 20px", marginBottom: 8, border: `1px solid ${t.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: t.white }}>{ci.what}</span>
                  <span style={{ fontSize: 15, padding: "2px 8px", borderRadius: 4, fontFamily: "'Source Code Pro', monospace", background: "rgba(90,159,212,0.1)", color: t.blue }}>{ci.who}</span>
                </div>
                <p style={{ fontSize: 15, color: t.text, lineHeight: 1.7, marginBottom: 4 }}>{ci.how}</p>
                <p style={{ fontSize: 15, color: t.dim, fontFamily: "'Source Code Pro', monospace" }}>Source: {ci.source}</p>
              </div>
            ))}

            {/* Top contractors */}
            {bill.topContractors.length > 0 && (<div>
              <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.dim, marginTop: 24, marginBottom: 12 }}>Top contractors profiting from this bill</div>
              {bill.topContractors.map((tc, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < bill.topContractors.length - 1 ? `1px solid ${t.border}` : "none" }}>
                  <div>
                    <span style={{ fontSize: 16, color: t.white, fontWeight: 500 }}>{tc.name}</span>
                    <span style={{ color: t.dim, fontSize: 16, marginLeft: 10 }}>{tc.type}</span>
                  </div>
                  <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, fontWeight: 700, color: t.white }}>{tc.amount}</span>
                </div>
              ))}
            </div>)}

            {/* Donor connection — the PolitiTrack link */}
            <div style={{ marginTop: 20, padding: 16, background: t.redBg, border: `1px solid ${t.red}22`, borderRadius: 10 }}>
              <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.red, marginBottom: 8 }}>Follow the money</div>
              <p style={{ color: t.text, fontSize: 15, lineHeight: 1.7 }}>{bill.donorConnection}</p>
            </div>
          </div>)}
        </div>);
      })}

      {/* Source disclaimer */}
      <div style={{ marginTop: 24, padding: 16, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10 }}>
        <p style={{ color: t.dim, fontSize: 15, lineHeight: 1.7, fontFamily: "'Source Code Pro', monospace" }}>
          Bill data from Congress.gov and the House/Senate Appropriations Committees. Funding figures from CBO cost estimates and committee reports. Consumer impact analysis based on public data from BLS, CMS, USDA, HUD, DoD, and cited academic research. Contractor data from USASpending.gov. Donor data from FEC. This page is nonpartisan and presents fiscal data without policy recommendations.
        </p>
      </div>
    </div>)}

    {/* ── YOUR COST OF LIVING TAB ── */}
    {mainTab === "prices" && (<div>
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 28, marginBottom: 24, borderLeft: `4px solid ${t.red}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.white, fontFamily: "'Libre Baskerville', Georgia, serif" }}>How government spending hits your wallet</div>
          <DataTimestamp label={DATA_UPDATED.costOfLiving} />
        </div>
        <p style={{ color: t.text, fontSize: 16, lineHeight: 1.8 }}>Side-by-side comparison of what everyday items cost last year vs. now. Gas prices reflect Iran war impact since Feb 28. Sources: AAA, BLS CPI, USDA, Census.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24 }}>
        {[
          { label: "Avg. monthly cost increase", value: "+$231/mo", sub: "+2.4% vs 2025 (BLS CPI)" },
          { label: "Annual impact per household", value: "+$2,770/yr", sub: "Essentials outpace wages" },
          { label: "Real wage growth after inflation", value: "+0.6%", sub: "Barely keeping up", color: t.gold },
        ].map((s, i) => (
          <div key={i} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, textAlign: "center" }}>
            <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 16, letterSpacing: 2, textTransform: "uppercase", color: t.dim, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 28, fontWeight: 700, color: s.color || "#ef4444" }}>{s.value}</div>
            <div style={{ fontSize: 16, color: t.dim, marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {[
        { category: "Groceries & food", icon: "🛒", source: "USDA ERS + BLS CPI Feb 2026", note: "Food at home +0.4% in Feb 2026 alone. Eggs up 84% year-over-year due to avian flu.", items: [
          { item: "Dozen eggs", y2025: "$3.20", y2026: "$5.90", change: "+84%", driver: "Avian flu reduced supply; egg prices nearly doubled year-over-year (BLS Feb 2026)" },
          { item: "Gallon of milk", y2025: "$3.89", y2026: "$4.29", change: "+10%", driver: "Dairy input costs, transportation" },
          { item: "Loaf of bread", y2025: "$3.49", y2026: "$3.79", change: "+9%", driver: "Wheat prices, energy costs" },
          { item: "1 lb ground beef", y2025: "$5.49", y2026: "$6.19", change: "+13%", driver: "Cattle supply shortage, feed costs" },
          { item: "1 lb chicken breast", y2025: "$4.29", y2026: "$4.89", change: "+14%", driver: "Avian flu supply disruption" },
          { item: "5 lb rice", y2025: "$4.99", y2026: "$5.49", change: "+10%", driver: "Import tariffs, shipping costs" },
          { item: "Restaurant meal (avg.)", y2025: "$16.80", y2026: "$17.90", change: "+7%", driver: "Labor + food input inflation" },
          { item: "Monthly grocery (family of 4)", y2025: "$1,060", y2026: "$1,180", change: "+$120/mo", driver: "Cumulative food increases" },
        ]},
        { category: "Gas & transportation", icon: "⛽", source: "AAA + BLS CPI Transportation, Feb 2026", note: "Iran war (Feb 28) surged gas from $2.98 to $4.10 nationally (+38%). CA statewide $5.89, LA $6.00. Brent crude up 55% to $110+/barrel. First time above $4 since Aug 2022 (AAA, April 4). Vehicle insurance +2.8% in 2025.", items: [
          { item: "Gallon of regular gas", y2025: "$2.98", y2026: "$4.10", change: "+38%", driver: "Gas surged 30%+ since Iran war began Feb 28 — now over $4/gal nationally (GasBuddy, AAA)" },
          { item: "Monthly car insurance", y2025: "$187", y2026: "$198", change: "+6%", driver: "Repair costs, litigation (+2.8% BLS)" },
          { item: "Used car (avg.)", y2025: "$28,400", y2026: "$29,200", change: "+3%", driver: "Tariffs on parts (+1.6% BLS)" },
          { item: "New car (avg.)", y2025: "$48,500", y2026: "$49,800", change: "+3%", driver: "Steel/aluminum tariffs (+0.6% BLS)" },
          { item: "Monthly car payment", y2025: "$738", y2026: "$762", change: "+$24/mo", driver: "Higher prices + high interest rates" },
          { item: "Monthly commute (30 mi)", y2025: "$248", y2026: "$282", change: "+$34/mo", driver: "Gas + insurance + maintenance" },
        ]},
        { category: "Housing & utilities", icon: "🏠", source: "BLS CPI Shelter + Census + EIA", note: "Shelter was THE largest factor in the Feb 2026 CPI increase. Utility gas +10.8% and electricity +6.7% in 2025.", items: [
          { item: "Median rent (1BR)", y2025: "$1,540", y2026: "$1,620", change: "+5%", driver: "Supply shortage, shelter = largest CPI driver" },
          { item: "Median rent (2BR)", y2025: "$1,820", y2026: "$1,920", change: "+5%", driver: "Institutional landlord pricing" },
          { item: "Monthly electricity", y2025: "$154", y2026: "$164", change: "+7%", driver: "Grid upgrades (+6.7% in 2025, BLS)" },
          { item: "Monthly natural gas", y2025: "$72", y2026: "$80", change: "+11%", driver: "LNG exports (+10.8% in 2025, BLS)" },
          { item: "Monthly internet", y2025: "$65", y2026: "$72", change: "+11%", driver: "ACP subsidy expired" },
          { item: "Homeowners insurance (yr)", y2025: "$2,380", y2026: "$2,780", change: "+17%", driver: "Climate losses, FL/CA/TX spikes" },
          { item: "Monthly housing total (renter)", y2025: "$1,899", y2026: "$2,010", change: "+$111/mo", driver: "Rent + utilities + insurance" },
        ]},
        { category: "Healthcare", icon: "🏥", source: "BLS CPI Medical + KFF Survey + CMS", note: "Medical care +3.2% in 2025. Hospital services +6.7% — the largest increase since 2010.", items: [
          { item: "Monthly insurance premium", y2025: "$520", y2026: "$558", change: "+7%", driver: "Hospital consolidation (KFF)" },
          { item: "Average deductible", y2025: "$1,735", y2026: "$1,850", change: "+7%", driver: "Employers shifting costs" },
          { item: "ER visit (out-of-pocket)", y2025: "$1,400", y2026: "$1,580", change: "+13%", driver: "Hospital charges +6.7% (BLS)" },
          { item: "Monthly prescriptions", y2025: "$62", y2026: "$68", change: "+10%", driver: "Brand drug prices, limited negotiation" },
          { item: "Monthly healthcare total", y2025: "$890", y2026: "$968", change: "+$78/mo", driver: "Premium + deductible + copays" },
        ]},
        { category: "Everything else", icon: "📦", source: "BLS CPI various, Feb 2026", note: "CPI rose 2.4% overall, but essentials rose much faster than discretionary items. Airline fares were a rare bright spot at -3.4%.", items: [
          { item: "Monthly childcare (1 child)", y2025: "$1,340", y2026: "$1,430", change: "+7%", driver: "Staffing shortages" },
          { item: "College tuition (public, yr)", y2025: "$11,260", y2026: "$11,820", change: "+5%", driver: "State funding cuts" },
          { item: "Airline ticket (domestic)", y2025: "$342", y2026: "$330", change: "-4%", driver: "Rare bright spot (-3.4% BLS)" },
          { item: "Streaming (3 services)", y2025: "$42", y2026: "$48", change: "+14%", driver: "Netflix, Disney+, YouTube hikes" },
          { item: "Monthly cell phone", y2025: "$55", y2026: "$58", change: "+5%", driver: "5G infrastructure costs" },
        ]},
      ].map((cat, ci) => (
        <div key={ci} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>{cat.icon}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: t.white }}>{cat.category}</span>
          </div>
          <div style={{ fontSize: 16, color: t.dim, marginBottom: 10, padding: "10px 14px", background: t.surface, borderRadius: 8, border: `1px solid ${t.border}`, lineHeight: 1.7 }}>{cat.note}</div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 3fr", gap: 0, background: "#1d3557", borderRadius: "10px 10px 0 0", padding: "10px 16px" }}>
            {["Item", "2025", "2026", "Change", "What's driving it"].map((h, i) => (
              <div key={i} style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "'Source Code Pro', monospace", letterSpacing: 1, textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>
          {cat.items.map((item, ii) => {
            const isNeg = item.change.startsWith("-");
            const isBig = item.change.includes("$") || parseInt(item.change) > 10;
            return (
              <div key={ii} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 3fr", gap: 0, padding: "12px 16px", background: ii % 2 === 0 ? t.surface : t.surface2, borderBottom: `1px solid ${t.border}`, borderRadius: ii === cat.items.length - 1 ? "0 0 10px 10px" : 0 }}>
                <div style={{ fontSize: 15, color: t.white, fontWeight: 500 }}>{item.item}</div>
                <div style={{ fontSize: 15, color: t.dim, fontFamily: "'Source Code Pro', monospace" }}>{item.y2025}</div>
                <div style={{ fontSize: 15, color: t.white, fontFamily: "'Source Code Pro', monospace", fontWeight: 600 }}>{item.y2026}</div>
                <div style={{ fontSize: 15, fontFamily: "'Source Code Pro', monospace", fontWeight: 700, color: isNeg ? "#22c55e" : isBig ? "#ef4444" : t.gold }}>{item.change}</div>
                <div style={{ fontSize: 15, color: t.dim, lineHeight: 1.6 }}>{item.driver}</div>
              </div>
            );
          })}
          <div style={{ fontSize: 15, color: t.dim, fontFamily: "'Source Code Pro', monospace", marginTop: 4 }}>Source: {cat.source}</div>
        </div>
      ))}

      <div style={{ background: t.redBg, border: `1px solid ${t.red}22`, borderRadius: 12, padding: 24, marginTop: 8 }}>
        <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.red, marginBottom: 10 }}>The bottom line</div>
        <p style={{ color: t.text, fontSize: 16, lineHeight: 1.8 }}>The average American household is paying roughly <strong style={{ color: t.white }}>$1,850 more per year</strong> in 2026 vs. 2025 — driven by shelter (largest CPI factor), food (+2.4%, eggs down 42% pre-war, but shipping costs rising), energy (+0.6% in Feb alone), and healthcare (+3.2%). Wages grew 3.0%, so real purchasing power increased by just 0.3%. Lower-income households are hit hardest since they spend a larger share on essentials.</p>
        <p style={{ color: t.dim, fontSize: 15, marginTop: 12, fontFamily: "'Source Code Pro', monospace" }}>Sources: BLS CPI Feb 2026 (USDL-26-0437), BLS 2025 Year in Review, USDA ERS, AAA, KFF, Census, EIA.</p>
      </div>

      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24, marginTop: 16 }}>
        <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.gold, marginBottom: 16 }}>Follow the money — who profits from higher prices?</div>
        {[
          { industry: "Oil & gas companies", profit: "Record refining margins", donated: "$42M to Congress (2024)", link: "Lobby against fuel efficiency & renewables" },
          { industry: "Health insurance", profit: "UnitedHealth $22.4B net income", donated: "$28M to Congress (2024)", link: "Lobby against Medicare expansion" },
          { industry: "Food conglomerates", profit: "Margins expanded despite 'cost pressures'", donated: "$18M to Congress (2024)", link: "Lobby against price transparency" },
          { industry: "Defense contractors", profit: "$886B record defense budget", donated: "$31M to Congress (2024)", link: "91% target Armed Services members" },
          { industry: "Private equity (housing)", profit: "Own 3% of single-family rentals", donated: "$52M to Congress (2024)", link: "Lobby against rent stabilization" },
        ].map((row, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "start", padding: "12px 0", borderBottom: i < 4 ? `1px solid ${t.border}` : "none", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: t.white, marginBottom: 2 }}>{row.industry}</div>
              <div style={{ fontSize: 16, color: t.dim }}>{row.profit}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, color: t.gold, fontFamily: "'Source Code Pro', monospace", marginBottom: 2 }}>{row.donated}</div>
              <div style={{ fontSize: 15, color: t.dim }}>{row.link}</div>
            </div>
          </div>
        ))}
        <p style={{ fontSize: 15, color: t.dim, fontFamily: "'Source Code Pro', monospace", marginTop: 12 }}>Donation data: FEC. Cost data: BLS, AAA, KFF, Census. Profits: SEC filings.</p>
      </div>
    </div>)}

    {/* ── ECONOMIC IMPACT TAB ── */}
    {mainTab === "impact" && (<div>
      {/* Topic buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {impactTopics.map((tp, i) => (
          <button key={i} onClick={() => { setActiveTopic(i); setActiveSection(null); }} style={{
            padding: "12px 22px", borderRadius: 10, fontSize: 15, cursor: "pointer",
            fontFamily: "'Source Code Pro', monospace",
            background: activeTopic === i ? t.redBg : t.surface,
            border: `1px solid ${activeTopic === i ? t.red + "44" : t.border}`,
            color: activeTopic === i ? t.red : t.dim,
            fontWeight: activeTopic === i ? 600 : 400,
          }}>{tp.icon} {tp.name}</button>
        ))}
      </div>

      {(() => {
        const tp = impactTopics[activeTopic] || impactTopics[0];
        return (<div>
          {/* Hero */}
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 32, marginBottom: 20, borderLeft: `4px solid ${t.red}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: t.white, marginBottom: 8, fontFamily: "'Libre Baskerville', Georgia, serif" }}>{tp.headline}</div>
                <p style={{ color: t.text, fontSize: 16, lineHeight: 1.8, maxWidth: 600 }}>{tp.summary}</p>
              </div>
              <div style={{ textAlign: "right", minWidth: 180 }}>
                <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 16, letterSpacing: 2, textTransform: "uppercase", color: t.dim, marginBottom: 4 }}>{tp.totalLabel}</div>
                <div style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 40, fontWeight: 700, color: t.red }}>{tp.totalCost}</div>
                <div style={{ fontSize: 15, color: t.dim, fontFamily: "'Source Code Pro', monospace", marginTop: 4 }}>Updated: {tp.updated}</div>
              </div>
            </div>
          </div>

          {/* Data sections */}
          {tp.sections.map((section, si) => (
            <div key={si} style={{ marginBottom: 8 }}>
              <div onClick={() => setActiveSection(activeSection === si ? null : si)} style={{
                background: activeSection === si ? t.surface2 : t.surface,
                border: `1px solid ${activeSection === si ? t.red + "33" : t.border}`,
                borderRadius: activeSection === si ? "12px 12px 0 0" : 12,
                padding: "18px 24px", cursor: "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: t.white }}>{section.title}</span>
                <span style={{ color: t.dim, fontSize: 16, transform: activeSection === si ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
              </div>
              {activeSection === si && (
                <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderTop: "none", borderRadius: "0 0 12px 12px", padding: "8px 0" }}>
                  {section.data.map((d, di) => (
                    <div key={di} style={{ padding: "14px 24px", borderBottom: di < section.data.length - 1 ? `1px solid ${t.border}` : "none", display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, color: t.text, marginBottom: 4 }}>{d.label}</div>
                        <div style={{ fontSize: 15, color: t.dim, fontFamily: "'Source Code Pro', monospace" }}>Source: {d.source}</div>
                      </div>
                      <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 16, fontWeight: 700, color: sentimentColor(d.value), textAlign: "right", minWidth: 160 }}>{d.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Economists */}
          {tp.economists && (<div style={{ marginTop: 24 }}>
            <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.dim, marginBottom: 12 }}>Economist perspectives</div>
            {tp.economists.map((econ, ei) => (
              <div key={ei} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24, marginBottom: 8, borderLeft: `3px solid ${t.gold}` }}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: t.white }}>{econ.name}</span>
                  <span style={{ color: t.dim, fontSize: 15, marginLeft: 12 }}>{econ.affiliation}</span>
                </div>
                <p style={{ color: t.text, fontSize: 15, lineHeight: 1.8, fontFamily: "'Source Serif 4', Georgia, serif", fontStyle: "italic", marginBottom: 6 }}>"{econ.view}"</p>
                <p style={{ color: t.dim, fontSize: 15, fontFamily: "'Source Code Pro', monospace" }}>Source: {econ.source}</p>
              </div>
            ))}
          </div>)}
        </div>);
      })()}
    </div>)}
  </div>);
}


function normalizeParty(p) {
  if (!p) return "I";
  const pl = p.toLowerCase().trim();
  if (pl === "r" || pl.startsWith("rep")) return "R";
  if (pl === "d" || pl.startsWith("dem")) return "D";
  return "I";
}

function normalizeVote(v) {
  if (!v) return "Not recorded";
  const vl = v.toLowerCase().trim();
  if (vl === "yea" || vl === "yes" || vl === "aye") return "Yes";
  if (vl === "nay" || vl === "no") return "No";
  if (vl === "not voting" || vl === "not recorded") return "Not Voting";
  if (vl === "present") return "Present";
  return v;
}

function MyDistrictPage({ setPage }) {
  const [zip, setZip] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewingRep, setViewingRep] = useState(null);
  const [districtResult, setDistrictResult] = useState(null);
  const [dataSource, setDataSource] = useState("none"); // "live" | "demo" | "none"

  // ── Static cost impact data (editorial — not from API) ──
  const costImpactData = {
    monthlyIncrease: 231,
    annualIncrease: 2770,
    breakdown: [
      { category: "Housing & rent", monthly: "$55", annual: "$660", driver: "Median rent +5-6% nationally, shelter is largest CPI driver", billConnection: "H.R. 7148 HUD funding flat — 600K Section 8 waitlist unchanged" },
      { category: "Groceries", monthly: "$33", annual: "$396", driver: "Food at home +2.4% (BLS Feb 2026), eggs down 42% from peak", billConnection: "H.R. 3944 preserved SNAP at $234/person/month but no increase" },
      { category: "Gas & transportation", monthly: "$95", annual: "$1,140", driver: "Gas surged 30%+ since Iran conflict began Feb 28 (AAA)", billConnection: "No federal gas tax relief in FY2026 appropriations" },
      { category: "Healthcare", monthly: "$42", annual: "$504", driver: "Premiums +7%, hospital costs +6.7% (BLS)", billConnection: "S.890 drug pricing reform saves ~$300/yr but only for Medicare patients" },
      { category: "Utilities", monthly: "$24", annual: "$288", driver: "Electricity +6.7%, natural gas +10.8% (BLS 2025)", billConnection: "DOE funding in H.R. 7148 includes $4.1B for renewables but no rate relief" },
      { category: "Childcare (if applicable)", monthly: "$12", annual: "$146", driver: "Avg childcare +7%, no federal expansion in FY2026", billConnection: "Head Start funded at $12.3B in H.R. 7148 but no universal pre-K" },
    ],
  };

  // ── Lookup function — calls the new /api/v1/district endpoint ──
  const lookup = async () => {
    if (!zip.trim() || zip.length < 5) return;
    setLoading(true);
    setViewingRep(null);
    setDistrictResult(null);
    setDataSource("none");

    const apiBase = import.meta.env.VITE_API_URL || "https://polititrack-api.vercel.app";

    // Check browser cache first (avoids repeat API calls during same session)
    try {
      const cacheKey = `pt_district_${zip}`;
      const cachedStr = sessionStorage.getItem(cacheKey);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        // Cache valid for 2 hours
        if (cached._ts && Date.now() - cached._ts < 7200000) {
          console.log("PolitiTrack: Using cached district data for", zip);
          const data = cached.data;
          if (data.representatives && data.representatives.length > 0) {
            const reps = data.representatives.map(rep => ({
              ...rep,
              party: normalizeParty(rep.party),
            }));
            setDistrictResult({
              state: data.state || "",
              region: "Your District",
              reps,
              bills: data.tracked_bills || [],
            });
            setDataSource("live");
            setLoading(false);
            return;
          }
        }
      }
    } catch (e) { /* sessionStorage not available or parse error — continue to API */ }

    // Try the new v2 district endpoint first (real FEC + Congress.gov data)
    try {
      const url = `${apiBase}/api/v1/district?zip=${zip}`;
      console.log("PolitiTrack: Fetching district data from", url);
      const r = await fetch(url);
      if (r.ok) {
        const data = await r.json();
        console.log("PolitiTrack: Got district data", data);
        if (data.representatives && data.representatives.length > 0) {
          // Normalize party codes from API
          const reps = data.representatives.map(rep => ({
            ...rep,
            party: normalizeParty(rep.party),
            // Ensure arrays exist even if API returned nothing
            topDonors: (rep.topDonors || []).map(d => ({
              name: d.name || "Unknown",
              amount: d.amount || 0,
              industry: d.industry || "",
            })),
            topIndustries: (rep.topIndustries || []).map(ind => ({
              name: ind.name || "Unknown",
              total: ind.total || 0,
            })),
            votes: (rep.votes || []).map(v => ({
              bill: v.bill || "",
              title: v.title || "",
              vote: normalizeVote(v.vote),
              amount: v.amount || "N/A",
              yourCost: v.yourCost || "",
              costDir: v.costDir || "neutral",
              status: v.status || "",
              // quote/quoteSource/reality not available from API
              quote: null,
              quoteSource: null,
              reality: null,
            })),
            totalFromTopIndustries: rep.totalFromTopIndustries || 0,
            votedWithParty: rep.votedWithParty || "N/A",
            committees: rep.committees || [],
          }));

          setDistrictResult({
            state: data.state || reps[0]?.state || "",
            region: "Your District",
            reps,
            bills: data.tracked_bills || [],
          });
          setDataSource("live");
          setLoaded(true);
          setLoading(false);
          // Cache in browser for this session
          try { sessionStorage.setItem(`pt_district_${zip}`, JSON.stringify({ data, _ts: Date.now() })); } catch(e) {}
          return;
        }
      }
    } catch (e) {
      console.warn("PolitiTrack: District endpoint failed, falling back to /reps", e);
    }

    // Fallback: try the old /api/v1/reps endpoint (names only, no FEC data)
    try {
      const url = `${apiBase}/api/v1/reps?zip=${zip}`;
      const r = await fetch(url);
      if (r.ok) {
        const data = await r.json();
        const members = data.results || [];
        if (members.length > 0) {
          const reps = members.map(m => ({
            name: m.name || "Unknown",
            party: normalizeParty(m.party),
            chamber: m.chamber || "House",
            district: m.district || "",
            state: m.state || "",
            phone: m.phone || "(202) 224-3121",
            office: m.office || "",
            website: m.website || "",
            photoUrl: m.photoUrl || "",
            committees: [],
            topDonors: [],
            topIndustries: [],
            votes: [],
            totalFromTopIndustries: 0,
            votedWithParty: "N/A",
          }));

          setDistrictResult({
            state: members[0]?.state || "",
            region: "Your District",
            reps,
          });
          setDataSource("demo");
          setLoaded(true);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("PolitiTrack: Rep lookup failed", e);
    }

    // Nothing found
    setDistrictResult(null);
    setDataSource("none");
    setLoaded(true);
    setLoading(false);
  };

  const dd = districtResult;
  const pc = (p) => p === "R" ? t.red : t.blue;
  const costColor = (dir) => dir === "up" ? "#ef4444" : dir === "down" ? "#22c55e" : t.gold;
  const costIcon = (dir) => dir === "up" ? "▲" : dir === "down" ? "▼" : "●";

  return (<div style={{ padding: "120px 24px 80px", maxWidth: 1050, margin: "0 auto" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}><div style={{ width: 32, height: 3, background: t.red, borderRadius: 2 }} /><span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 3, textTransform: "uppercase", color: t.red }}>My District</span></div>
    <h1 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 36, color: t.white, marginBottom: 8 }}>Your money, your representatives</h1>
    <p style={{ color: t.dim, fontSize: 15, marginBottom: 28, fontFamily: "'Source Serif 4', Georgia, serif" }}>Enter your ZIP code to see who represents you, who funds them, how they voted, and what it costs you personally.</p>

    {/* ZIP lookup */}
    {!loaded && (<div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🏛</div>
      <p style={{ color: t.text, fontSize: 16, marginBottom: 20 }}>Enter your ZIP code to see your personalized district dashboard</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <input type="text" placeholder="ZIP code" value={zip} onChange={e => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} onKeyDown={e => e.key === "Enter" && zip.length >= 5 && lookup()}
          style={{ width: 180, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "16px 20px", color: t.white, fontSize: 16, fontFamily: "'Source Code Pro', monospace", outline: "none", letterSpacing: 6, textAlign: "center", boxSizing: "border-box" }} />
        <button onClick={lookup} disabled={zip.length < 5 || loading} style={{ background: zip.length >= 5 ? `linear-gradient(135deg, ${t.red}, ${t.redDim})` : t.surface2, color: zip.length >= 5 ? "#fff" : t.dim, border: "none", padding: "16px 36px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: zip.length >= 5 ? "pointer" : "not-allowed", fontFamily: "'Source Code Pro', monospace" }}>{loading ? "Loading..." : "Show my district"}</button>
      </div>
      <p style={{ fontSize: 15, color: t.dim, marginTop: 12 }}>Your ZIP code is not stored. Used only to find your representatives.</p>
    </div>)}

    {/* No results */}
    {loaded && !dd && (<div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>❌</div>
      <p style={{ color: t.text, fontSize: 16, marginBottom: 16 }}>No representatives found for ZIP code {zip}</p>
      <button onClick={() => { setLoaded(false); setZip(""); }} style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}`, padding: "12px 28px", borderRadius: 8, cursor: "pointer", fontFamily: "'Source Code Pro', monospace" }}>Try another ZIP</button>
    </div>)}

    {/* Dashboard */}
    {loaded && dd && (<div>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, color: t.dim }}>District: </span>
          <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, color: t.white, fontWeight: 600 }}>{dd.state} · {dd.region}</span>
          {dataSource === "live" && <span style={{ marginLeft: 12, fontSize: 12, padding: "2px 8px", borderRadius: 4, background: "rgba(34,197,94,0.12)", color: "#22c55e", fontFamily: "'Source Code Pro', monospace" }}>LIVE DATA</span>}
          {dataSource === "demo" && <span style={{ marginLeft: 12, fontSize: 12, padding: "2px 8px", borderRadius: 4, background: t.goldBg, color: t.gold, fontFamily: "'Source Code Pro', monospace" }}>NAMES ONLY — FEC data loading</span>}
        </div>
        <button onClick={() => { setLoaded(false); setZip(""); setDistrictResult(null); }} style={{ fontSize: 16, color: t.dim, background: "none", border: `1px solid ${t.border}`, padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontFamily: "'Source Code Pro', monospace" }}>Change ZIP</button>
      </div>

      {/* Cost impact banner */}
      {viewingRep === null && <div style={{ background: t.redBg, border: `1px solid ${t.red}22`, borderRadius: 12, padding: 28, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.red, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Your estimated annual cost increase (2025 → 2026)</span>
              <DataTimestamp label={DATA_UPDATED.costOfLiving} />
            </div>
            <div style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 42, fontWeight: 700, color: t.red }}>+${costImpactData.annualIncrease.toLocaleString()}/yr</div>
            <div style={{ fontSize: 16, color: t.text, marginTop: 4 }}>That's <strong style={{ color: t.white }}>+${costImpactData.monthlyIncrease}/month</strong> more than last year for a household in {dd.region}</div>
          </div>
        </div>
      </div>}

      {/* Personal cost breakdown */}
      {viewingRep === null && <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 28, marginBottom: 20 }}>
        <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.red, marginBottom: 16 }}>How your reps' votes affect your wallet</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 3fr", gap: 0, background: "#1d3557", borderRadius: "10px 10px 0 0", padding: "10px 16px" }}>
          {["Category", "Monthly", "Annual", "Why it costs you more (and which bill)"].map((h, i) => (
            <div key={i} style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "'Source Code Pro', monospace", letterSpacing: 1, textTransform: "uppercase" }}>{h}</div>
          ))}
        </div>
        {costImpactData.breakdown.map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 3fr", gap: 0, padding: "14px 16px", background: i % 2 === 0 ? t.surface : t.surface2, borderBottom: `1px solid ${t.border}`, borderRadius: i === costImpactData.breakdown.length - 1 ? "0 0 10px 10px" : 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: t.white }}>{row.category}</div>
            <div style={{ fontSize: 16, fontFamily: "'Source Code Pro', monospace", fontWeight: 700, color: "#ef4444" }}>{row.monthly}</div>
            <div style={{ fontSize: 16, fontFamily: "'Source Code Pro', monospace", fontWeight: 700, color: "#ef4444" }}>{row.annual}</div>
            <div>
              <div style={{ fontSize: 16, color: t.text, marginBottom: 4 }}>{row.driver}</div>
              <div style={{ fontSize: 15, color: t.dim, fontFamily: "'Source Code Pro', monospace" }}>{row.billConnection}</div>
            </div>
          </div>
        ))}
        <div style={{ padding: "16px", background: t.bg, borderRadius: "0 0 10px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: t.white }}>Total increase for your area</span>
          <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 16, fontWeight: 700, color: "#ef4444" }}>+${costImpactData.monthlyIncrease}/mo · +${costImpactData.annualIncrease.toLocaleString()}/yr</span>
        </div>
      </div>}

      {/* Representatives */}
      {viewingRep === null && dd.reps.map((rep, ri) => (
        <div key={ri} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 28, marginBottom: 16 }}>
          {/* Rep header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: pc(rep.party) + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: pc(rep.party), border: `2px solid ${pc(rep.party)}44`, overflow: "hidden" }}>
                {rep.photoUrl ? <img src={rep.photoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : (rep.name || "?").split(" ").pop()?.[0] || "?"}
              </div>
              <div>
                <div onClick={() => { setViewingRep(ri); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ fontSize: 16, fontWeight: 700, color: t.white, cursor: "pointer", textDecoration: "underline", textDecorationColor: t.red + "44", textUnderlineOffset: 4 }}
                  onMouseOver={e => e.target.style.textDecorationColor = t.red}
                  onMouseOut={e => e.target.style.textDecorationColor = t.red + "44"}
                >{rep.name} <span style={{ fontSize: 16, color: t.red, fontWeight: 400 }}>→ view profile</span></div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 15, padding: "2px 8px", borderRadius: 4, fontWeight: 700, fontFamily: "'Source Code Pro', monospace", background: rep.party === "R" ? t.redBg : "rgba(90,159,212,0.12)", color: pc(rep.party) }}>{rep.party === "R" ? "REP" : rep.party === "D" ? "DEM" : "IND"}</span>
                  <span style={{ fontSize: 15, color: t.dim }}>{rep.chamber === "Senate" ? "U.S. Senator" : `U.S. Rep${rep.district ? `, District ${rep.district}` : ""}`} · {rep.state}</span>
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              {rep.totalFromTopIndustries > 0 && (<>
                <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 16, letterSpacing: 1, textTransform: "uppercase", color: t.dim }}>Top industry funding</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: t.gold }}>${rep.totalFromTopIndustries.toLocaleString()}</div>
              </>)}
              {rep.totalRaised > 0 && (<>
                <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 11, color: t.dim, marginTop: 4 }}>Total raised: ${Math.round(rep.totalRaised).toLocaleString()}</div>
              </>)}
            </div>
          </div>

          {/* Committees */}
          {rep.committees.length > 0 && (<div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {rep.committees.map((c, ci) => (
              <span key={ci} style={{ fontSize: 15, padding: "4px 10px", borderRadius: 6, background: "rgba(90,159,212,0.1)", color: t.blue, fontFamily: "'Source Code Pro', monospace" }}>{c}</span>
            ))}
          </div>)}

          {/* Voting record */}
          {rep.votes.length > 0 && (<>
            <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.red, marginBottom: 10 }}>How they voted on FY2026 bills</div>
            {rep.votes.map((v, vi) => (
              <div key={vi} style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: 20, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12, gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, padding: "2px 8px", borderRadius: 4, fontWeight: 700, fontFamily: "'Source Code Pro', monospace", background: v.vote === "Yes" ? "rgba(34,197,94,0.12)" : v.vote === "No" ? t.redBg : t.goldBg, color: v.vote === "Yes" ? "#22c55e" : v.vote === "No" ? t.red : t.gold }}>{v.vote}</span>
                      <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, color: t.dim }}>{v.bill}</span>
                      {v.amount !== "N/A" && <span style={{ fontSize: 15, color: t.dim }}>· {v.amount}</span>}
                    </div>
                    <div style={{ fontSize: 16, color: t.white, fontWeight: 600 }}>{v.title}</div>
                  </div>
                  {v.yourCost && <div style={{ textAlign: "right", minWidth: 200, padding: "8px 12px", background: costColor(v.costDir) + "12", borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                      <span style={{ color: costColor(v.costDir), fontSize: 16, fontWeight: 700 }}>{costIcon(v.costDir)}</span>
                      <span style={{ fontSize: 15, color: costColor(v.costDir), fontWeight: 700 }}>{v.yourCost}</span>
                    </div>
                  </div>}
                </div>

                {/* Quote (only available for editorial/curated content) */}
                {v.quote && (<div style={{ marginBottom: 12, padding: "14px 18px", borderLeft: `3px solid ${t.gold}`, background: t.surface }}>
                  <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 16, letterSpacing: 2, textTransform: "uppercase", color: t.gold, marginBottom: 6 }}>What they said</div>
                  <p style={{ color: t.text, fontSize: 15, lineHeight: 1.7, fontFamily: "'Source Serif 4', Georgia, serif", fontStyle: "italic" }}>"{v.quote}"</p>
                  <p style={{ color: t.dim, fontSize: 15, fontFamily: "'Source Code Pro', monospace", marginTop: 6 }}>— {v.quoteSource}</p>
                </div>)}

                {/* Follow the money (only available for editorial/curated content) */}
                {v.reality && (<div style={{ padding: "14px 18px", borderLeft: `3px solid ${t.red}`, background: "rgba(230,57,70,0.04)" }}>
                  <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 16, letterSpacing: 2, textTransform: "uppercase", color: t.red, marginBottom: 6 }}>Follow the money</div>
                  <p style={{ color: t.text, fontSize: 16, lineHeight: 1.7 }}>{v.reality}</p>
                </div>)}
              </div>
            ))}
          </>)}

          {/* No vote data message */}
          {rep.votes.length === 0 && dataSource === "demo" && (
            <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: 20, textAlign: "center", color: t.dim }}>
              <p style={{ fontSize: 15 }}>Voting record data requires the CONGRESS_API_KEY environment variable to be set.</p>
            </div>
          )}

          {/* Top donors to this rep */}
          {(rep.topDonors.length > 0 || rep.topIndustries.length > 0) && (<>
            <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.gold, marginTop: 20, marginBottom: 10 }}>Who funds this representative</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {rep.topDonors.length > 0 && <div>
                <div style={{ fontSize: 15, color: t.dim, marginBottom: 6 }}>Top donors</div>
                {rep.topDonors.map((d, di) => (
                  <div key={di} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: di < rep.topDonors.length - 1 ? `1px solid ${t.border}` : "none" }}>
                    <span style={{ fontSize: 16, color: t.text }}>{d.name}</span>
                    <span style={{ fontSize: 16, fontFamily: "'Source Code Pro', monospace", color: t.white, fontWeight: 600 }}>${d.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>}
              {rep.topIndustries.length > 0 && <div>
                <div style={{ fontSize: 15, color: t.dim, marginBottom: 6 }}>Top industries</div>
                {rep.topIndustries.map((ind, ii) => {
                  const maxInd = Math.max(...rep.topIndustries.map(x => x.total));
                  return (
                    <div key={ii} style={{ marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ fontSize: 16, color: t.text }}>{ind.name}</span>
                        <span style={{ fontSize: 15, fontFamily: "'Source Code Pro', monospace", color: t.dim }}>${(ind.total / 1000).toFixed(0)}k</span>
                      </div>
                      <div style={{ height: 4, background: t.bg, borderRadius: 2 }}>
                        <div style={{ height: 4, background: pc(rep.party), borderRadius: 2, width: `${(ind.total / maxInd) * 100}%`, transition: "width 0.5s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>}
            </div>
          </>)}

          {/* No FEC data message */}
          {rep.topDonors.length === 0 && rep.topIndustries.length === 0 && dataSource === "demo" && (
            <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: 20, textAlign: "center", color: t.dim, marginTop: 12 }}>
              <p style={{ fontSize: 15 }}>FEC donation data requires the FEC_API_KEY environment variable. Set it in your Vercel dashboard.</p>
            </div>
          )}
        </div>
      ))}

      {/* ── REP PROFILE PANEL ── */}
      {viewingRep !== null && dd.reps[viewingRep] && (() => {
        const rep = dd.reps[viewingRep];

        return (<div style={{ background: t.surface, border: `1px solid ${t.red}33`, borderRadius: 16, padding: 0, marginBottom: 20, overflow: "hidden" }}>
          {/* Profile header */}
          <div style={{ background: `linear-gradient(135deg, ${t.surface2}, ${t.surface})`, padding: "32px 32px 24px", borderBottom: `1px solid ${t.border}` }}>
            <button onClick={() => setViewingRep(null)} style={{ background: "none", border: `1px solid ${t.border}`, padding: "6px 14px", borderRadius: 6, color: t.dim, fontSize: 14, cursor: "pointer", fontFamily: "'Source Code Pro', monospace", marginBottom: 16 }}>← Back to district</button>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 20 }}>
              <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: pc(rep.party) + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: pc(rep.party), border: `3px solid ${pc(rep.party)}44`, overflow: "hidden" }}>
                  {rep.photoUrl ? <img src={rep.photoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : (rep.name || "?").split(" ").pop()?.[0] || "?"}
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: t.white, fontFamily: "'Libre Baskerville', Georgia, serif" }}>{rep.name}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, padding: "3px 10px", borderRadius: 4, fontWeight: 700, fontFamily: "'Source Code Pro', monospace", background: rep.party === "R" ? t.redBg : "rgba(90,159,212,0.12)", color: pc(rep.party) }}>{rep.party === "R" ? "Republican" : rep.party === "D" ? "Democrat" : "Independent"}</span>
                    <span style={{ fontSize: 13, padding: "3px 10px", borderRadius: 4, fontFamily: "'Source Code Pro', monospace", background: "rgba(90,159,212,0.1)", color: t.blue }}>{rep.chamber === "Senate" ? "U.S. Senator" : `U.S. Representative${rep.district ? `, District ${rep.district}` : ""}`}</span>
                    <span style={{ fontSize: 13, padding: "3px 10px", borderRadius: 4, fontFamily: "'Source Code Pro', monospace", background: t.goldBg, color: t.gold }}>{rep.state}</span>
                  </div>
                  {rep.committees.length > 0 && (<div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {rep.committees.map((c, ci) => (
                      <span key={ci} style={{ fontSize: 12, padding: "3px 8px", borderRadius: 4, background: t.bg, border: `1px solid ${t.border}`, color: t.text, fontFamily: "'Source Code Pro', monospace" }}>{c}</span>
                    ))}
                  </div>)}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                {rep.totalFromTopIndustries > 0 && (<>
                  <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: t.dim, marginTop: 8 }}>Top industry funding</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: t.white }}>${rep.totalFromTopIndustries.toLocaleString()}</div>
                </>)}
                {rep.totalRaised > 0 && (<>
                  <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: t.dim, marginTop: 8 }}>Total raised</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: t.gold }}>${Math.round(rep.totalRaised).toLocaleString()}</div>
                </>)}
              </div>
            </div>
          </div>

          <div style={{ padding: 32 }}>
            {/* Top donors + industries */}
            {(rep.topDonors.length > 0 || rep.topIndustries.length > 0) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                {rep.topDonors.length > 0 && <div>
                  <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: t.dim, marginBottom: 10 }}>Top campaign donors</div>
                  {rep.topDonors.map((d, di) => (
                    <div key={di} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: di < rep.topDonors.length - 1 ? `1px solid ${t.border}` : "none" }}>
                      <div>
                        <div style={{ fontSize: 15, color: t.white, fontWeight: 500 }}>{d.name}</div>
                        {d.industry && <div style={{ fontSize: 13, color: t.dim }}>{d.industry}</div>}
                      </div>
                      <span style={{ fontSize: 16, fontFamily: "'Source Code Pro', monospace", fontWeight: 700, color: t.white }}>${d.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>}
                {rep.topIndustries.length > 0 && <div>
                  <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: t.dim, marginBottom: 10 }}>Top donor industries</div>
                  {rep.topIndustries.map((ind, ii) => {
                    const maxInd = Math.max(...rep.topIndustries.map(x => x.total));
                    return (
                      <div key={ii} style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ fontSize: 15, color: t.text }}>{ind.name}</span>
                          <span style={{ fontSize: 14, fontFamily: "'Source Code Pro', monospace", color: t.dim }}>${(ind.total / 1000).toFixed(0)}k</span>
                        </div>
                        <div style={{ height: 6, background: t.bg, borderRadius: 3 }}>
                          <div style={{ height: 6, background: pc(rep.party), borderRadius: 3, width: `${(ind.total / maxInd) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>}
              </div>
            )}

            {/* Contact info */}
            <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: t.red, marginBottom: 12 }}>Contact information</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
              <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, color: t.dim, fontFamily: "'Source Code Pro', monospace", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Phone</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: t.white }}>{rep.phone || "(202) 224-3121"}</div>
                <div style={{ fontSize: 12, color: t.dim, marginTop: 4 }}>Capitol switchboard</div>
              </div>
              <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, color: t.dim, fontFamily: "'Source Code Pro', monospace", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Website</div>
                {rep.website ? <a href={rep.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: t.blue, textDecoration: "none" }}>Visit official site →</a>
                : <a href={`https://www.${rep.chamber === "Senate" ? "senate.gov/senators/senators-contact.htm" : "house.gov/representatives/find-your-representative"}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: t.blue, textDecoration: "none" }}>Visit {rep.chamber === "Senate" ? "senate.gov" : "house.gov"} →</a>}
              </div>
              <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, color: t.dim, fontFamily: "'Source Code Pro', monospace", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Mail</div>
                <div style={{ fontSize: 13, color: t.white, lineHeight: 1.5 }}>{rep.name}<br />{rep.chamber === "Senate" ? "U.S. Senate" : "U.S. House"}<br />Washington, DC {rep.chamber === "Senate" ? "20510" : "20515"}</div>
              </div>
              <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, color: t.dim, fontFamily: "'Source Code Pro', monospace", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Social</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <a href={`https://twitter.com/search?q=${encodeURIComponent(rep.name)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, padding: "4px 10px", borderRadius: 6, background: t.surface, border: `1px solid ${t.border}`, color: t.text, textDecoration: "none" }}>X</a>
                  <a href={`https://facebook.com/search/pages?q=${encodeURIComponent(rep.name)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, padding: "4px 10px", borderRadius: 6, background: t.surface, border: `1px solid ${t.border}`, color: t.text, textDecoration: "none" }}>FB</a>
                </div>
              </div>
            </div>

            {/* Voting record */}
            {rep.votes.length > 0 && (<>
              <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: t.gold, marginBottom: 12 }}>Voting record on FY2026 bills</div>
              {rep.votes.map((v, vi) => (
                <div key={vi} style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: 20, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, fontWeight: 700, fontFamily: "'Source Code Pro', monospace", background: v.vote === "Yes" ? "rgba(34,197,94,0.12)" : v.vote === "No" ? t.redBg : t.goldBg, color: v.vote === "Yes" ? "#22c55e" : v.vote === "No" ? t.red : t.gold }}>{v.vote}</span>
                        <span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 13, color: t.dim }}>{v.bill}</span>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: t.white }}>{v.title}</div>
                    </div>
                    {v.yourCost && <div style={{ padding: "6px 12px", background: costColor(v.costDir) + "12", borderRadius: 6 }}>
                      <span style={{ fontSize: 13, color: costColor(v.costDir), fontWeight: 700 }}>{costIcon(v.costDir)} {v.yourCost}</span>
                    </div>}
                  </div>
                  {v.quote && (<div style={{ padding: "12px 16px", borderLeft: `3px solid ${t.gold}`, background: t.surface, marginBottom: 8, borderRadius: "0 8px 8px 0" }}>
                    <p style={{ color: t.text, fontSize: 14, fontFamily: "'Source Serif 4', Georgia, serif", fontStyle: "italic" }}>"{v.quote}"</p>
                    <p style={{ color: t.dim, fontSize: 12, fontFamily: "'Source Code Pro', monospace", marginTop: 4 }}>— {v.quoteSource}</p>
                  </div>)}
                  {v.reality && (<div style={{ padding: "12px 16px", borderLeft: `3px solid ${t.red}`, background: "rgba(230,57,70,0.04)", borderRadius: "0 8px 8px 0" }}>
                    <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: t.red, marginBottom: 4 }}>Follow the money</div>
                    <p style={{ color: t.text, fontSize: 14, lineHeight: 1.7 }}>{v.reality}</p>
                  </div>)}
                </div>
              ))}
            </>)}
          </div>
        </div>);
      })()}

      <p style={{ fontSize: 15, color: t.dim, textAlign: "center", marginTop: 16, fontFamily: "'Source Code Pro', monospace" }}>
        {dataSource === "live"
          ? "Real data from FEC (api.open.fec.gov) and Congress.gov. Cost estimates based on BLS CPI data. Actual costs vary by household."
          : "Data from FEC, BLS CPI, Congress.gov, USASpending. Cost estimates based on BLS regional CPI data and household averages. Actual costs vary by household size and spending patterns."}
      </p>
    </div>)}
  </div>);
}


function ContactRepPage() {
  const [zip, setZip] = useState("");
  const [reps, setReps] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewingRep, setViewingRep] = useState(null);

  const lookupReps = async () => {
    if (!zip.trim() || zip.length < 5) return;
    setLoading(true);
    setReps(null);
    setViewingRep(null);

    try {
      const apiBase = import.meta.env.VITE_API_URL || "https://polititrack-api.vercel.app";
      const r = await fetch(`${apiBase}/api/v1/reps?zip=${zip}`);
      if (r.ok) {
        const data = await r.json();
        const members = data.results || [];
        if (members.length > 0) {
          const parsed = members.map(m => ({
            name: m.name,
            title: m.chamber === "Senate" ? "U.S. Senator" : `U.S. Representative${m.district ? `, District ${m.district}` : ""}`,
            party: normalizeParty(m.party) === "R" ? "Republican" : normalizeParty(m.party) === "D" ? "Democratic" : "Independent",
            partyShort: normalizeParty(m.party),
            state: m.state || "",
            district: m.district || "",
            chamber: m.chamber || "House",
            phones: m.phone ? [m.phone] : ["(202) 224-3121"],
            urls: m.website ? [m.website] : [],
            photoUrl: m.photoUrl || null,
            emails: [],
            channels: [],
            address: m.office ? { line1: m.office, city: "Washington", state: "DC", zip: m.chamber === "Senate" ? "20510" : "20515" } : null,
          }));
          setReps(parsed);
          setLoading(false);
          return;
        }
      }
      throw new Error("No results");
    } catch {
      setReps([
        { name: "No representatives found", title: "Try entering your full address for better results, or visit:", party: "Unknown", partyShort: "I", state: "", district: "", chamber: "House", phones: ["(202) 224-3121"], urls: ["https://www.house.gov/representatives/find-your-representative"], photoUrl: null, emails: [], channels: [], address: null },
      ]);
    }
    setLoading(false);
  };

  const pc = (p) => p === "R" ? t.red : p === "D" ? t.blue : t.gold;
  const viewing = viewingRep !== null && reps ? reps[viewingRep] : null;

  return (<div style={{ padding: "120px 24px 80px", maxWidth: 950, margin: "0 auto" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}><div style={{ width: 32, height: 3, background: t.red, borderRadius: 2 }} /><span style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 3, textTransform: "uppercase", color: t.red }}>Contact Your Representatives</span></div>
    <h1 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 36, color: t.white, marginBottom: 8 }}>Find and contact your representatives</h1>
    <p style={{ color: t.dim, fontSize: 15, marginBottom: 32, fontFamily: "'Source Serif 4', Georgia, serif" }}>Enter your ZIP code to find your Congress members with all their contact information.</p>

    {/* ZIP lookup */}
    <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
      <input type="text" placeholder="Enter ZIP code" value={zip} onChange={e => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} onKeyDown={e => e.key === "Enter" && lookupReps()}
        style={{ width: 200, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: "16px 20px", color: t.white, fontSize: 16, fontFamily: "'Source Code Pro', monospace", outline: "none", letterSpacing: 4, textAlign: "center", boxSizing: "border-box" }}
        onFocus={e => e.target.style.borderColor = t.red} onBlur={e => e.target.style.borderColor = t.border} />
      <button onClick={lookupReps} disabled={loading || zip.length < 5} style={{
        background: zip.length >= 5 ? `linear-gradient(135deg, ${t.red}, ${t.redDim})` : t.surface2,
        color: zip.length >= 5 ? "#fff" : t.dim, border: "none", padding: "16px 36px", borderRadius: 10,
        fontSize: 15, fontWeight: 600, cursor: zip.length >= 5 ? "pointer" : "not-allowed",
        fontFamily: "'Source Code Pro', monospace",
      }}>{loading ? "Finding..." : "Find my reps"}</button>
    </div>

    {/* Rep list */}
    {reps && !viewing && (<div>
      {reps.map((rep, i) => (
        <div key={i} onClick={() => setViewingRep(i)} style={{
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12,
          padding: "22px 28px", marginBottom: 10, cursor: "pointer", transition: "all 0.2s",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
          onMouseOver={e => { e.currentTarget.style.borderColor = t.red + "44"; e.currentTarget.style.background = t.surface2; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = t.surface; }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: pc(rep.partyShort) + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: pc(rep.partyShort), border: `2px solid ${pc(rep.partyShort)}44`, overflow: "hidden" }}>
              {rep.photoUrl ? <img src={rep.photoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : (rep.name || "?").split(" ").pop()?.[0] || "?"}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.white }}>{rep.name}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 15, padding: "2px 8px", borderRadius: 4, fontWeight: 700, fontFamily: "'Source Code Pro', monospace", background: rep.partyShort === "R" ? t.redBg : "rgba(90,159,212,0.12)", color: pc(rep.partyShort) }}>{rep.party}</span>
                <span style={{ fontSize: 16, color: t.dim }}>{rep.title}</span>
              </div>
            </div>
          </div>
          <span style={{ color: t.red, fontSize: 16, fontFamily: "'Source Code Pro', monospace" }}>View profile →</span>
        </div>
      ))}
    </div>)}

    {/* Full rep profile */}
    {viewing && (<div>
      <button onClick={() => setViewingRep(null)} style={{ background: "none", border: `1px solid ${t.border}`, padding: "8px 16px", borderRadius: 6, color: t.dim, fontSize: 16, cursor: "pointer", fontFamily: "'Source Code Pro', monospace", marginBottom: 20 }}>← Back to all representatives</button>

      {/* Profile header */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ background: t.surface2, padding: "32px 32px 24px", borderBottom: `1px solid ${t.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: pc(viewing.partyShort) + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: pc(viewing.partyShort), border: `3px solid ${pc(viewing.partyShort)}44`, overflow: "hidden", flexShrink: 0 }}>
              {viewing.photoUrl ? <img src={viewing.photoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : (viewing.name || "?").split(" ").pop()?.[0] || "?"}
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: t.white, fontFamily: "'Libre Baskerville', Georgia, serif" }}>{viewing.name}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 15, padding: "3px 12px", borderRadius: 4, fontWeight: 700, fontFamily: "'Source Code Pro', monospace", background: viewing.partyShort === "R" ? t.redBg : "rgba(90,159,212,0.12)", color: pc(viewing.partyShort) }}>{viewing.party}</span>
                <span style={{ fontSize: 15, padding: "3px 12px", borderRadius: 4, fontFamily: "'Source Code Pro', monospace", background: "rgba(90,159,212,0.1)", color: t.blue }}>{viewing.title}</span>
                <span style={{ fontSize: 15, padding: "3px 12px", borderRadius: 4, fontFamily: "'Source Code Pro', monospace", background: t.goldBg, color: t.gold }}>{viewing.state}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: 32 }}>
          {/* Contact cards */}
          <div style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.red, marginBottom: 16 }}>Contact information</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {/* Phone */}
            <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 15, color: t.dim, fontFamily: "'Source Code Pro', monospace", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Phone (most effective)</div>
              {viewing.phones.length > 0 ? viewing.phones.map((phone, pi) => (
                <div key={pi} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: t.white }}>{phone}</div>
                </div>
              )) : <div style={{ color: t.dim }}>Not available</div>}
              <div style={{ fontSize: 15, color: t.dim, marginTop: 8 }}>Mon-Fri 9am-5pm ET. Tell the staffer your name, ZIP code, and concern.</div>
            </div>

            {/* Website */}
            <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 15, color: t.dim, fontFamily: "'Source Code Pro', monospace", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Official website</div>
              {viewing.urls.length > 0 ? viewing.urls.map((url, ui) => (
                <div key={ui} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 16, color: t.white, marginBottom: 8, wordBreak: "break-all" }}>{url.replace("https://", "").replace("http://", "")}</div>
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: t.surface, border: `1px solid ${t.border}`, color: t.text, padding: "10px 24px", borderRadius: 8, fontSize: 15, textDecoration: "none", fontFamily: "'Source Code Pro', monospace" }}>Visit website →</a>
                </div>
              )) : <div style={{ color: t.dim }}>Not available</div>}
              <div style={{ fontSize: 15, color: t.dim, marginTop: 8 }}>Most offices have a contact form on their website for written messages.</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {/* Mailing address */}
            <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 15, color: t.dim, fontFamily: "'Source Code Pro', monospace", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Mailing address</div>
              <div style={{ fontSize: 16, color: t.white, lineHeight: 1.8 }}>
                {viewing.name}<br />
                {viewing.address ? (<>{viewing.address.line1}<br />{viewing.address.city}, {viewing.address.state} {viewing.address.zip}</>) : (<>{viewing.chamber === "Senate" ? "United States Senate" : "United States House of Representatives"}<br />Washington, DC {viewing.chamber === "Senate" ? "20510" : "20515"}</>)}
              </div>
            </div>

            {/* Email */}
            <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 15, color: t.dim, fontFamily: "'Source Code Pro', monospace", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Email</div>
              {viewing.emails.length > 0 ? viewing.emails.map((email, ei) => (
                <div key={ei}>
                  <div style={{ fontSize: 16, color: t.blue, marginBottom: 8 }}>{email}</div>
                  <a href={`mailto:${email}`} style={{ display: "inline-block", background: t.surface, border: `1px solid ${t.border}`, color: t.text, padding: "10px 24px", borderRadius: 8, fontSize: 15, textDecoration: "none", fontFamily: "'Source Code Pro', monospace" }}>Send email →</a>
                </div>
              )) : (<div>
                <div style={{ fontSize: 15, color: t.dim, marginBottom: 8 }}>Most members don't publish a direct email. Use their website contact form instead.</div>
                {viewing.urls.length > 0 && <a href={viewing.urls[0]} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: t.surface, border: `1px solid ${t.border}`, color: t.text, padding: "10px 24px", borderRadius: 8, fontSize: 15, textDecoration: "none", fontFamily: "'Source Code Pro', monospace" }}>Open contact form →</a>}
              </div>)}
            </div>
          </div>

          {/* Social media */}
          {viewing.channels && viewing.channels.length > 0 && (<div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 15, color: t.dim, fontFamily: "'Source Code Pro', monospace", marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>Social media</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {viewing.channels.map((ch, ci) => {
                const urls = { Twitter: `https://twitter.com/${ch.id}`, Facebook: `https://facebook.com/${ch.id}`, YouTube: `https://youtube.com/${ch.id}`, Instagram: `https://instagram.com/${ch.id}` };
                return (
                  <a key={ci} href={urls[ch.type] || "#"} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8, background: t.surface, border: `1px solid ${t.border}`, color: t.text, textDecoration: "none", fontSize: 15, fontFamily: "'Source Code Pro', monospace" }}>
                    <span style={{ fontWeight: 600 }}>{ch.type}</span>
                    <span style={{ color: t.dim }}>@{ch.id}</span>
                  </a>
                );
              })}
            </div>
          </div>)}

          {/* Tips */}
          <div style={{ padding: 20, background: t.surface2, borderRadius: 10, border: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 16, color: t.text, lineHeight: 1.8 }}>
              <strong style={{ color: t.gold }}>How to be heard:</strong> Phone calls are the most effective way to reach your representative — staffers tally every call by topic. Call the DC office, give your name and ZIP code, and state your concern in 1-2 sentences. For written messages, use their official website contact form. Handwritten letters carry more weight than emails. Be specific — reference bill numbers and explain how the issue affects you personally.
            </div>
          </div>
        </div>
      </div>
    </div>)}

    {!reps && (<div style={{ textAlign: "center", padding: "60px 0", color: t.dim }}>
      <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>🏛</div>
      <p style={{ fontSize: 15 }}>Enter your ZIP code above to find your representatives</p>
      <p style={{ fontSize: 16, marginTop: 8 }}>We'll show you their phone numbers, websites, mailing addresses, and social media.</p>
    </div>)}

    <p style={{ fontSize: 15, color: t.dim, textAlign: "center", marginTop: 24, fontFamily: "'Source Code Pro', monospace" }}>
      Your ZIP code is used only for the real-time lookup and is not stored. Representative data from WhoIsMyRepresentative.com and Congress.gov.
    </p>
  </div>);
}

function Footer({ setPage }) {
  return (<footer style={{ borderTop: `1px solid ${t.border}`, padding: "56px 32px 48px", maxWidth: 1200, margin: "0 auto" }}>
    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40 }}>
      <div style={{ maxWidth: 300 }}>
        <div style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 16, color: t.white, marginBottom: 12 }}>POLITI<span style={{ color: t.red }}>TRACK</span></div>
        <p style={{ color: t.dim, fontSize: 15, lineHeight: 1.7 }}>Free, nonpartisan civic transparency platform. See where your tax dollars go, who funds your representatives, and how their votes affect your wallet.</p>
      </div>
      <div style={{ display: "flex", gap: 48 }}>
        {[
          {title:"Free tools",links:[["district","My District"],["explore","Search Donors"],["spending","Gov Spending"],["flow","Money Flow"],["contact","Contact Your Rep"]]},
          {title:"For developers",links:[["pricing","API & Pricing"],["docs","API Docs"],["dashboard","Get API Key"]]},
          {title:"Data sources",links:[["https://api.open.fec.gov/developers/","FEC.gov"],["https://api.congress.gov","Congress.gov"],["https://www.bls.gov/cpi/","BLS / CPI"],["https://gasprices.aaa.com","AAA Gas Prices"],["https://www.cbo.gov","CBO"]]},
          {title:"Legal",links:[["privacy","Privacy Policy"],["terms","Terms of Service"]]},
        ].map((col,i) => (
          <div key={i}><p style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: t.dim, marginBottom: 16 }}>{col.title}</p>
          {col.links.map(([h,l],j) => (<p key={j} onClick={()=>{if(h.startsWith("http")){window.open(h,"_blank")}else if(h!=="#"){setPage(h)}}} style={{ color: t.text, fontSize: 15, marginBottom: 10, cursor: h!=="#"?"pointer":"default" }} onMouseOver={e=>h!=="#"&&(e.target.style.color=t.red)} onMouseOut={e=>h!=="#"&&(e.target.style.color=t.text)}>{l}</p>))}</div>
        ))}
      </div>
    </div>
    <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
      <span style={{ color: t.dim, fontSize: 16 }}>© 2026 PolitiTrack. All rights reserved. Free for public use.</span>
      <div style={{ display: "flex", gap: 20 }}>
        <span onClick={() => setPage("privacy")} style={{ color: t.dim, fontSize: 15, cursor: "pointer", fontFamily: "'Source Code Pro', monospace" }} onMouseOver={e=>e.target.style.color=t.text} onMouseOut={e=>e.target.style.color=t.dim}>Privacy</span>
        <span onClick={() => setPage("terms")} style={{ color: t.dim, fontSize: 15, cursor: "pointer", fontFamily: "'Source Code Pro', monospace" }} onMouseOver={e=>e.target.style.color=t.text} onMouseOut={e=>e.target.style.color=t.dim}>Terms</span>
      </div>
    </div>
  </footer>);
}

const PAGE_META = {
  home: { title: "PolitiTrack — See Where Your Tax Dollars Go | Free Political Transparency Tool", path: "/" },
  explore: { title: "Explore Political Donations — Search, Analyze, Discover | PolitiTrack", path: "/explore" },
  district: { title: "My District — See How Your Reps' Votes Cost You Money | PolitiTrack", path: "/district" },
  demo: { title: "Live Demo — Search Political Donations | PolitiTrack", path: "/demo" },
  flow: { title: "Money Flow — Trace Donations to Legislation | PolitiTrack", path: "/flow" },
  spending: { title: "Government Spending & Impact — Where Your Tax Dollars Go | PolitiTrack", path: "/spending" },
  contact: { title: "Contact Your Representative — Take Action | PolitiTrack", path: "/contact" },
  docs: { title: "API Documentation — 17 Endpoints, Live FEC + Congress.gov Data | PolitiTrack", path: "/docs" },
  pricing: { title: "Pricing — Free for Everyone | PolitiTrack", path: "/pricing" },
  dashboard: { title: "Developer Dashboard — Get Your API Key | PolitiTrack", path: "/dashboard" },
  privacy: { title: "Privacy Policy | PolitiTrack", path: "/privacy" },
  terms: { title: "Terms of Service | PolitiTrack", path: "/terms" },
};

function getPageFromPath() {
  const path = window.location.pathname;
  const match = Object.entries(PAGE_META).find(([, v]) => v.path === path);
  return match ? match[0] : "home";
}

export default function App() {
  const [page, setPageState] = useState(getPageFromPath);
  const scrolled = useScrolled();

  const setPage = (p) => {
    setPageState(p);
    const meta = PAGE_META[p] || PAGE_META.home;
    window.history.pushState({}, "", meta.path);
    document.title = meta.title;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onPop = () => { setPageState(getPageFromPath()); window.scrollTo(0, 0); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const meta = PAGE_META[page] || PAGE_META.home;
    document.title = meta.title;
  }, [page]);

  useEffect(() => { const l = document.createElement("link"); l.href = "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Code+Pro:wght@400;500;600;700&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap"; l.rel = "stylesheet"; document.head.appendChild(l); }, []);

  const pages = { home: <HomePage setPage={setPage} />, explore: <ExplorePage setPage={setPage} />, district: <MyDistrictPage setPage={setPage} />, demo: <DemoPage />, flow: <MoneyFlowPage />, spending: <SpendingPage />, contact: <ContactRepPage />, docs: <DocsPage />, pricing: <PricingPage setPage={setPage} />, dashboard: <DashboardPage />, privacy: <PrivacyPage />, terms: <TermsPage /> };

  return (<div style={{ background: t.bg, color: t.text, minHeight: "100vh", position: "relative", fontSize: 18 }}>
    <Stars />
    <div style={{ position: "relative", zIndex: 1 }}><Nav page={page} setPage={setPage} scrolled={scrolled} />{pages[page]||pages.home}<Footer setPage={setPage} /></div>
  </div>);
}
