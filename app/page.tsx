import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function RootPage() {
  const session = await auth()
  if (session?.user) redirect('/inbox')
  return <LandingPage />
}

// ─── Feature data ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '💬',
    title: 'AI-Powered Replies',
    desc: 'Generate contextually perfect replies in three tones — professional, casual, or brief — in one click.',
  },
  {
    icon: '📅',
    title: 'Smart Scheduling',
    desc: 'MailMind reads your Google Calendar and suggests meeting times that fit everyone's schedule automatically.',
  },
  {
    icon: '📋',
    title: 'Thread Summarization',
    desc: 'Long email chains distilled into TL;DR, key points, and action items so you never miss what matters.',
  },
  {
    icon: '⚡',
    title: 'Multiple AI Models',
    desc: 'Switch between Claude Sonnet, GPT-4o, and Gemini Pro — use the best model for every task.',
  },
  {
    icon: '🎯',
    title: 'Priority Detection',
    desc: 'AI automatically flags urgent emails, detects sentiment, and surfaces action items across your inbox.',
  },
  {
    icon: '🔒',
    title: 'Private & Secure',
    desc: 'OAuth 2.0 with Google. Your emails are never stored for model training.',
  },
]

const MODELS = [
  {
    name: 'Claude Sonnet',
    by: 'Anthropic',
    badge: 'Default',
    color: '#6366f1',
    desc: 'Best at nuanced writing, context retention, and following complex instructions precisely.',
  },
  {
    name: 'GPT-4o',
    by: 'OpenAI',
    badge: 'Fast',
    color: '#10b981',
    desc: 'Blazing fast responses with strong reasoning for quick replies and short summaries.',
  },
  {
    name: 'Gemini 1.5 Pro',
    by: 'Google',
    badge: 'Long context',
    color: '#f59e0b',
    desc: 'Handles extremely long email threads with its 1M-token context window.',
  },
]

const STEPS = [
  { num: '01', title: 'Sign in with Google', desc: 'One click — no passwords, no API keys needed on your end.' },
  { num: '02', title: 'Your inbox syncs', desc: 'MailMind pulls your last 100 threads and stays in sync automatically.' },
  { num: '03', title: 'Open any thread', desc: 'Click a conversation and activate the AI panel with one button.' },
  { num: '04', title: 'Write less, do more', desc: 'Generate replies, summaries, and meeting suggestions instantly.' },
]

// ─── Landing page ─────────────────────────────────────────────────────────────

function LandingPage() {
  return (
    <div style={{ background: 'var(--background)', color: 'var(--foreground)', fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {['#features', '#models', '#how-it-works'].map((href, i) => (
              <a key={href} href={href} style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none', padding: '6px 12px', borderRadius: 6 }}>
                {['Features', 'Models', 'How it works'][i]}
              </a>
            ))}
            <Link href="/signin" style={{ marginLeft: 8, padding: '8px 18px', background: 'var(--accent)', color: 'white', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '100px 24px 72px' }}>
        <div style={{ position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 28, padding: '5px 14px', borderRadius: 999, border: '1px solid var(--border-2)', background: 'var(--accent-subtle)', fontSize: 12, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.04em' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            Powered by Claude, GPT-4o &amp; Gemini
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.75rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 24 }}>
            Your inbox,{' '}
            <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              intelligently
            </span>{' '}
            managed
          </h1>

          <p style={{ fontSize: 18, color: 'var(--text-2)', lineHeight: 1.65, maxWidth: 560, margin: '0 auto 40px' }}>
            MailMind connects to Gmail and brings AI superpowers to every thread — smart replies, calendar-aware scheduling, and instant summaries.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signin" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 28px', background: 'var(--accent)', color: 'white', fontWeight: 700, fontSize: 15, borderRadius: 10, textDecoration: 'none', boxShadow: '0 0 40px rgba(99,102,241,0.35)' }}>
              <GoogleIcon />
              Sign in with Google
            </Link>
            <a href="#features" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', border: '1px solid var(--border-2)', color: 'var(--text-2)', fontWeight: 600, fontSize: 15, borderRadius: 10, textDecoration: 'none', background: 'var(--surface)' }}>
              See features →
            </a>
          </div>
          <p style={{ marginTop: 18, fontSize: 12, color: 'var(--muted)' }}>Free to use · No credit card · OAuth 2.0 with Google</p>
        </div>

        {/* App preview */}
        <AppPreview />
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionHeader eyebrow="Features" title="Everything your inbox needs" sub="MailMind brings a full AI co-pilot into Gmail without changing your workflow." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 52 }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ padding: 24, borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Models ── */}
      <section id="models" style={{ padding: '80px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionHeader eyebrow="AI Models" title="The best models, your choice" sub="Switch AI models per-thread. Your preference is saved automatically." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 52 }}>
            {MODELS.map((m) => (
              <div key={m.name} style={{ padding: 28, borderRadius: 14, border: `1px solid ${m.color}40`, background: 'var(--surface-2)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: m.color }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)', marginBottom: 2 }}>{m.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>by {m.by}</p>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: `${m.color}20`, color: m.color }}>{m.badge}</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionHeader eyebrow="How it works" title="Up and running in 60 seconds" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, marginTop: 52 }}>
            {STEPS.map((s) => (
              <div key={s.num} style={{ padding: '24px 20px', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 16px', border: '2px solid var(--accent)', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'var(--accent)' }}>
                  {s.num}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', padding: '56px 40px', borderRadius: 20, border: '1px solid var(--border-2)', background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 100%)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 400, height: 300, background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)', pointerEvents: 'none' }} />
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.02em' }}>
            Start managing email smarter
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
            Connect your Gmail account and let AI handle the heavy lifting — replies, scheduling, and summaries instantly.
          </p>
          <Link href="/signin" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', background: 'var(--accent)', color: 'white', fontWeight: 700, fontSize: 16, borderRadius: 10, textDecoration: 'none', boxShadow: '0 0 60px rgba(99,102,241,0.4)' }}>
            <GoogleIcon />
            Get started free with Google
          </Link>
          <p style={{ marginTop: 16, fontSize: 12, color: 'var(--muted)' }}>No credit card · Free forever for personal use</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <Logo />
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>© {new Date().getFullYear()} MailMind · AI-powered email for humans</p>
        </div>
      </footer>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M3 8l9 6 9-6M3 8v10a1 1 0 001 1h16a1 1 0 001-1V8M3 8l9-5 9 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>MailMind</span>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>{eyebrow}</p>
      <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>{title}</h2>
      {sub && <p style={{ marginTop: 14, color: 'var(--text-2)', fontSize: 16, maxWidth: 480, margin: '14px auto 0' }}>{sub}</p>}
    </div>
  )
}

function AppPreview() {
  return (
    <div style={{ maxWidth: 900, margin: '64px auto 0', position: 'relative' }}>
      <div style={{ borderRadius: 16, border: '1px solid var(--border-2)', background: 'var(--surface)', overflow: 'hidden', boxShadow: '0 40px 120px rgba(0,0,0,0.6)' }}>
        {/* Window chrome */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)' }}>
          {['#ef4444', '#f59e0b', '#10b981'].map((c) => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
          ))}
          <div style={{ flex: 1, height: 22, borderRadius: 5, background: 'var(--border)', maxWidth: 200, margin: '0 auto' }} />
        </div>
        {/* 3-pane layout */}
        <div style={{ display: 'flex', height: 380 }}>
          {/* Sidebar */}
          <div style={{ width: 52, borderRight: '1px solid var(--border)', padding: 10, display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--surface-2)' }}>
            {[true, false, false, false].map((active, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: active ? 'rgba(99,102,241,0.2)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 16, height: 16, borderRadius: 3, background: active ? 'var(--accent)' : 'var(--border-2)' }} />
              </div>
            ))}
          </div>
          {/* Thread list */}
          <div style={{ width: 220, borderRight: '1px solid var(--border)' }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ height: 24, borderRadius: 6, background: 'var(--border)' }} />
            </div>
            {[
              { color: '#6366f1', bold: true },
              { color: '#8b5cf6', bold: true },
              { color: '#ec4899', bold: false },
              { color: '#06b6d4', bold: false },
              { color: '#10b981', bold: false },
            ].map((row, i) => (
              <div key={i} style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', background: i === 0 ? 'rgba(99,102,241,0.08)' : 'transparent', borderLeft: i === 0 ? '2px solid var(--accent)' : '2px solid transparent', display: 'flex', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 9, width: '65%', borderRadius: 4, background: row.bold ? 'var(--text)' : 'var(--border-2)', marginBottom: 5, opacity: 0.85 }} />
                  <div style={{ height: 8, width: '90%', borderRadius: 4, background: 'var(--border)', marginBottom: 4 }} />
                  <div style={{ height: 7, width: '70%', borderRadius: 4, background: 'var(--border)', opacity: 0.5 }} />
                </div>
              </div>
            ))}
          </div>
          {/* Thread view */}
          <div style={{ flex: 1, padding: 16, borderRight: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ height: 14, width: '60%', borderRadius: 6, background: 'var(--text)', marginBottom: 16, opacity: 0.7 }} />
            {[1, 0.65, 0.4].map((op, i) => (
              <div key={i} style={{ padding: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', marginBottom: 8, opacity: op }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 9, width: '35%', borderRadius: 4, background: 'var(--text)', marginBottom: 4 }} />
                    <div style={{ height: 7, width: '22%', borderRadius: 4, background: 'var(--border)' }} />
                  </div>
                </div>
                {[1, 0.7, 0.5].map((w, j) => (
                  <div key={j} style={{ height: 7, width: `${w * 100}%`, borderRadius: 4, background: 'var(--border-2)', marginBottom: 4 }} />
                ))}
              </div>
            ))}
          </div>
          {/* AI panel */}
          <div style={{ width: 210, padding: 12, background: 'var(--surface-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--accent)' }} />
              <div style={{ height: 9, width: '55%', borderRadius: 4, background: 'var(--text)', opacity: 0.65 }} />
            </div>
            <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
              {['Reply', 'Summary', 'Schedule'].map((tab, i) => (
                <div key={tab} style={{ flex: 1, height: 22, borderRadius: 6, background: i === 0 ? 'var(--accent)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ height: 6, width: '55%', borderRadius: 3, background: i === 0 ? 'rgba(255,255,255,0.8)' : 'var(--muted)', opacity: 0.7 }} />
                </div>
              ))}
            </div>
            <div style={{ borderRadius: 8, border: '1px solid var(--border)', padding: 10, background: 'var(--surface)', marginBottom: 8 }}>
              {[1, 0.8, 0.6, 0.9, 0.5].map((w, i) => (
                <div key={i} style={{ height: 6, width: `${w * 100}%`, borderRadius: 4, background: 'var(--border-2)', marginBottom: 5 }} />
              ))}
            </div>
            <div style={{ height: 30, borderRadius: 8, background: 'var(--accent)', opacity: 0.85 }} />
          </div>
        </div>
      </div>
      {/* Glow */}
      <div style={{ position: 'absolute', bottom: -50, left: '50%', transform: 'translateX(-50%)', width: '80%', height: 80, background: 'radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
    </div>
  )
}
