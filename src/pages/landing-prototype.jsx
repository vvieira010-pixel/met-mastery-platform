const WHATSAPP_URL = 'https://wa.me/5511997801708?text=Hi%20Vin%C3%ADcius%2C%20I%20want%20to%20book%20a%20MET%20diagnostic.';

const features = [
  ['01 / 06', 'Diagnose first', 'See your starting point before you spend time practising what you already know.'],
  ['02 / 06', 'Target the gap', 'Get MET-style tasks matched to the skill and question type that needs attention.'],
  ['03 / 06', 'Build exam rhythm', 'Use timed practice to make good decisions when the clock is running.'],
  ['04 / 06', 'Remember the lesson', 'Save vocabulary and grammar points from each session for deliberate review.'],
  ['05 / 06', 'Read clear feedback', 'Know what worked, what needs attention, and the single best next move.'],
  ['06 / 06', 'Ask your teacher', 'Bring writing and speaking work to a human when nuance matters most.'],
];

const skills = [
  ['Reading', 78],
  ['Listening', 54],
  ['Writing', 66],
  ['Speaking', 71],
];

export default function LandingPrototype({ onMemberSignIn, 'data-testid': testId }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  return (
    <div data-testid={testId} style={{ background: '#F6F4EE', color: '#1A2E35', font: '1rem/1.6 DM Sans, sans-serif' }}>
      <style>{`
        .lp-skip{position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;background:#2D7A8C;color:#fff;padding:10px 16px;border-radius:8px;z-index:9999;font-size:0.875rem;font-weight:700}
        .lp-skip:focus{left:16px;top:16px;width:auto;height:auto;outline:3px solid #E08E45;outline-offset:2px}
        .lp-wrap{width:min(1120px,calc(100% - 48px));margin:auto}
        .lp-eyebrow{color:#2D7A8C;font-size:0.75rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase}
        .lp-topbar{border-bottom:1px solid #E8E5DF;background:rgba(253, 252, 248,.92);position:sticky;top:0;z-index:5}
        @supports (backdrop-filter: blur(8px)){.lp-topbar{backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}}
        .lp-nav{height:76px;display:flex;align-items:center;justify-content:space-between;gap:28px}
        .lp-brand{display:flex;align-items:center;gap:11px;font:700 1.5rem 'Cormorant Garamond',Georgia,serif;white-space:nowrap;text-decoration:none;color:inherit}
        .lp-mark{width:34px;height:34px;display:grid;place-items:center;color:#fff;background:#2D7A8C;border-radius:8px 8px 8px 4px;font:700 1rem 'Space Mono',monospace}
        .lp-links{display:flex;gap:28px;color:#2B454E;font-size:0.875rem}.lp-links a:hover{color:#2D7A8C}
        .lp-actions{display:flex;align-items:center;gap:20px;font-size:0.875rem}
        .lp-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:48px;padding:0 21px;border:1px solid transparent;border-radius:8px;font-size:0.875rem;font-weight:700;text-decoration:none;transition:transform .2s,background .2s,box-shadow .2s;cursor:pointer}
        .lp-btn:hover{transform:translateY(-2px)}
        .lp-primary{color:#fff;background:#2D7A8C;box-shadow:0 1px 4px rgba(26, 46, 53,.04)}.lp-primary:hover{background:#1F5A67}
        .lp-light{color:#1A2E35;background:#fff;box-shadow:0 12px 36px rgba(26, 46, 53,.12)}
        .lp-quiet{color:#fff;padding-inline:0;background:transparent;border:none}
        .lp-hero{color:#fff;background:#1A2E35;position:relative;overflow:hidden}
        .lp-orb{position:absolute;width:700px;height:700px;right:-230px;top:-350px;border:1px solid rgba(226, 240, 243,.18);border-radius:50%;pointer-events:none}
        .lp-hero-grid{min-height:680px;display:grid;grid-template-columns:1.03fr .97fr;align-items:center;gap:72px;padding:92px 0 100px;position:relative}
        .lp-hero .lp-eyebrow{color:#E2F0F3;margin-bottom:22px}
        .lp-h1{margin:0;max-width:650px;font:600 clamp(1.85rem,4vw,3rem)/1.05 'Cormorant Garamond',serif;letter-spacing:-.045em;color:#fff}.lp-h1 em{color:#E08E45;font-style:normal}
        .lp-lede{max-width:510px;margin-top:27px;color:rgba(255,255,255,.72);font-size:1.125rem;line-height:1.65}
        .lp-proof{display:flex;flex-wrap:wrap;gap:18px 25px;margin-top:31px;color:rgba(255,255,255,.72);font-size:0.75rem}.lp-proof span::before{content:'✓';color:#E08E45;margin-right:7px;font-weight:700}
        .lp-card{background:#FFFFFF;border:8px solid rgba(255,255,255,.1);border-radius:16px;box-shadow:0 12px 36px rgba(26, 46, 53,.12);transform:rotate(1deg)}
        .lp-cardInner{padding:25px;border-radius:12px;color:#1A2E35;background:#fff}
        .lp-dashTop{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:22px;border-bottom:1px solid #E8E5DF}
        .lp-dashLabel{color:#2B454E;font:0.75rem 'Space Mono',monospace;letter-spacing:.03em}
        .lp-status{padding:6px 10px;color:#804E1E;background:#FBF0E4;border-radius:99px;font-size:0.75rem;font-weight:700}
        .lp-score{color:#2D7A8C;font:700 2.5rem/.9 'Space Mono',monospace;letter-spacing:-.06em}
        .lp-bar{height:7px;overflow:hidden;border-radius:99px;background:#E2F0F3}.lp-bar i{display:block;height:100%;border-radius:inherit;background:#2D7A8C}
        @media(max-width:850px){.lp-links{display:none}.lp-hero-grid{grid-template-columns:1fr;gap:50px;padding:72px 0 80px}.lp-orb{display:none}.lp-card{max-width:620px;transform:none}}
        @media(max-width:600px){.lp-wrap{width:min(100% - 32px,1120px)}.lp-nav{height:68px}.lp-actions>a:first-child{display:none}.lp-btn{min-height:44px;padding:0 15px}.lp-h1{font-size:2rem}.lp-lede{font-size:1rem}}
        @media (prefers-reduced-motion: reduce){html{scroll-behavior:auto}.lp-btn{transition:none}.lp-btn:hover{transform:none}.lp-topbar{backdrop-filter:none !important}}
      `}</style>
      <a className="lp-skip" href="#lp-main">Skip to content</a>
      <header className="lp-topbar">
        <nav className="lp-wrap lp-nav" aria-label="Primary navigation">
          <a className="lp-brand" href="#top"><span className="lp-mark" aria-hidden="true">M</span> MET Mastery</a>
          <div className="lp-links"><a href="#features">What you get</a><a href="#methodology">How it works</a><a href="#pricing">Plans</a><a href="#success">Stories</a></div>
          <div className="lp-actions"><button type="button" onClick={onMemberSignIn} className="lp-quiet" style={{ fontSize: '0.875rem' }}>Already a member? Sign in</button><a className="lp-btn lp-primary" href={WHATSAPP_URL} target="_blank" rel="noreferrer">Start a diagnostic <span aria-hidden="true">→</span></a></div>
        </nav>
      </header>

      <main id="lp-main">
        <section className="lp-hero" id="top" aria-labelledby="lp-hero-h"><div className="lp-orb" aria-hidden="true" /><div className="lp-wrap lp-hero-grid"><div>
          <p className="lp-eyebrow">Calm, focused MET preparation</p>
          <h1 id="lp-hero-h" className="lp-h1">Know where you are.<br /><em>Practise what matters.</em></h1>
          <p className="lp-lede">MET Mastery turns one diagnostic into a focused plan, with targeted exercises, teacher feedback, and a next step you can actually see.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 25, marginTop: 34, flexWrap: 'wrap' }}>
            <a className="lp-btn lp-light" href={WHATSAPP_URL} target="_blank" rel="noreferrer">Start with a diagnostic <span aria-hidden="true">↗</span></a>
            <button className="lp-quiet" type="button" onClick={() => scrollTo('methodology')}>See the learning loop <span aria-hidden="true">↓</span></button>
          </div>
          <div className="lp-proof" aria-label="Key features"><span>All six MET skills</span><span>MET-style tasks</span><span>Human feedback where it counts</span></div>
        </div><div className="lp-card" role="img" aria-labelledby="lp-snap-h lp-snap-d"><div className="lp-cardInner">
          <div className="lp-dashTop"><div><span className="lp-dashLabel" id="lp-snap-h">YOUR MET SNAPSHOT</span><strong style={{ display: 'block', marginTop: 5, fontSize: '0.875rem' }}>Week 2 · Keep building</strong></div><span className="lp-status" aria-label="Status: In progress">In progress</span></div>
          <div style={{ display: 'flex', alignItems: 'end', gap: 18, padding: '25px 0 21px' }}><div className="lp-score" aria-label="Provisional level B2">B2</div><div style={{ color: '#2B454E', fontSize: '0.75rem', lineHeight: 1.45 }} id="lp-snap-d"><strong style={{ display: 'block', color: '#1A2E35', fontSize: '0.875rem' }}>Provisional level</strong>Based on your latest<br />diagnostic · 12 May</div></div>
          <div role="list" aria-label="Skill breakdown" style={{ display: 'grid', gap: 10 }}>
            {skills.map(([name, val]) => (
              <div key={name} role="progressbar" aria-valuenow={val} aria-valuemin={0} aria-valuemax={100} aria-label={`${name} ${val} percent`} style={{ display: 'grid', gridTemplateColumns: '94px 1fr 45px', alignItems: 'center', gap: 14, padding: '12px 13px', border: '1px solid #E8E5DF', borderRadius: 8, fontSize: '0.875rem' }}>
                <b>{name}</b><div className="lp-bar" aria-hidden="true"><i style={{ width: `${val}%`, background: name === 'Listening' ? '#E08E45' : '#2D7A8C' }} /></div><em aria-hidden="true" style={{ color: '#2B454E', fontStyle: 'normal', textAlign: 'right', font: '0.75rem Space Mono, monospace' }}>{val}%</em>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 18, color: '#2B454E', fontSize: '0.75rem', textAlign: 'center' }}>Next up: Listening · distinguishing main ideas</p>
        </div></div></div></section>

        <div style={{ background: '#E2F0F3', borderBottom: '1px solid #E8E5DF' }}><div className="lp-wrap" style={{ display: 'flex', alignItems: 'center', gap: 25, padding: '24px 0', flexWrap: 'wrap' }}><span className="lp-eyebrow">One workspace</span><p style={{ color: '#2B454E', fontSize: '0.875rem' }}>Built around the skills the MET actually measures.</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} role="list" aria-label="MET skills">{['Reading','Listening','Writing','Speaking','Grammar','Vocabulary'].map(s => <span key={s} role="listitem" style={{ padding: '5px 10px', color: '#2D7A8C', border: '1px solid #E8E5DF', borderRadius: 99, fontSize: '0.75rem' }}>{s}</span>)}</div></div></div>

        <section id="features" aria-labelledby="lp-feat-h" style={{ padding: '105px 0' }}><div className="lp-wrap" style={{ display: 'grid', gridTemplateColumns: '.8fr 1.2fr', gap: 90 }}><div style={{ maxWidth: 600 }}><p className="lp-eyebrow">Less noise. Better practice.</p><h2 id="lp-feat-h" style={{ margin: 0, font: "600 clamp(1.85rem,4vw,3rem)/1.05 'Cormorant Garamond',serif", letterSpacing: '-.03em' }}>A plan that changes as you learn.</h2><p style={{ marginTop: 22, color: '#2B454E', fontSize: '1rem' }}>Good preparation is not a pile of random questions. It is a loop: find the gap, work on it, get useful feedback, and try again.</p></div><div role="list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#E8E5DF', border: '1px solid #E8E5DF' }}>{features.map(([number, title, text]) => <article key={number} role="listitem" style={{ minHeight: 190, padding: 27, background: '#F6F4EE' }}><span aria-hidden="true" style={{ color: '#E08E45', font: "0.875rem 'Space Mono',monospace" }}>{number}</span><h3 style={{ margin: '23px 0 10px', font: "600 1.5rem 'Cormorant Garamond',serif" }}>{title}</h3><p style={{ color: '#2B454E', fontSize: '0.875rem', lineHeight: 1.55 }}>{text}</p></article>)}</div></div></section>

        <section id="methodology" aria-labelledby="lp-method-h" style={{ background: '#1A2E35', color: '#fff', padding: '105px 0' }}><div className="lp-wrap"><div style={{ maxWidth: 600 }}><p className="lp-eyebrow" style={{ color: '#E2F0F3' }}>The learning loop</p><h2 id="lp-method-h" style={{ margin: 0, font: "600 clamp(1.85rem,4vw,3rem)/1.05 'Cormorant Garamond',serif" }}>From “I’m not sure” to “I know what to do.”</h2><p style={{ marginTop: 22, color: 'rgba(255,255,255,.72)' }}>Every part of the workspace points back to a practical next step, so progress feels concrete, not abstract.</p></div><div role="list" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', marginTop: 60, borderTop: '1px solid rgba(226, 240, 243,.18)' }}>{[
          ['01: FIND YOUR START','Take a diagnostic.','Get a useful, provisional picture of your six MET skills and the question types behind it.'],
          ['02: PRACTISE WITH PURPOSE','Follow the signal.','Your practice queue puts the work that matters next in front of you, with timed and untimed options.'],
          ['03: CLOSE THE LOOP','Review, then repeat.','Use feedback and saved review points to make the next attempt a little stronger.'],
        ].map(([no, t, d]) => <article key={no} role="listitem" style={{ padding: '28px 30px 10px 0', borderRight: '1px solid rgba(226, 240, 243,.18)', marginRight: 30 }}><span style={{ color: '#E08E45', font: "0.875rem 'Space Mono',monospace" }}>{no}</span><h3 style={{ margin: '26px 0 12px', color: '#fff', font: "600 1.5rem 'Cormorant Garamond',serif" }}>{t}</h3><p style={{ color: 'rgba(255,255,255,.72)', fontSize: '0.875rem' }}>{d}</p></article>)}</div></div></section>

        <section id="success" aria-labelledby="lp-success-h" style={{ background: '#E2F4EA', padding: '105px 0' }}><div className="lp-wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}><div><p className="lp-eyebrow">Made for real study weeks</p><h2 id="lp-success-h" style={{ margin: 0, font: "600 clamp(1.85rem,4vw,3rem)/1.05 'Cormorant Garamond',serif" }}>Small, visible steps beat last-minute panic.</h2></div><div><blockquote style={{ margin: 0, color: '#1A2E35', font: "600 clamp(1.85rem,4vw,3rem)/1.08 'Cormorant Garamond',serif", letterSpacing: '-.02em' }}><span aria-hidden="true" style={{ display: 'block', color: '#E08E45', fontSize: '2.5rem', lineHeight: .5, marginBottom: 8 }}>“</span><p style={{ margin: 0 }}>I finally knew what to practise between lessons, and why it mattered.</p></blockquote><p style={{ marginTop: 25, color: '#2B454E', fontSize: '0.875rem' }}>Student using MET Mastery · illustrative experience</p></div></div></section>

        <section id="start" aria-labelledby="lp-cta-h" style={{ padding: '90px 0', textAlign: 'center', background: '#FBF0E4' }}><div className="lp-wrap"><p className="lp-eyebrow">Your next step</p><h2 id="lp-cta-h" style={{ margin: '0 auto', maxWidth: 600, font: "600 clamp(1.85rem,4vw,3rem)/1.05 'Cormorant Garamond',serif" }}>Start with a clearer picture.</h2><p style={{ maxWidth: 500, margin: '20px auto 28px', color: '#1A2E35' }}>Take a diagnostic, see your current level, and leave with a practical place to begin.</p><button className="lp-btn lp-primary" type="button" onClick={onMemberSignIn}>Sign in to your workspace <span aria-hidden="true">→</span></button></div></section>

        <section id="pricing" aria-labelledby="lp-pricing-h" style={{ padding: '72px 0', background: '#F6F4EE', borderTop: '1px solid #E8E5DF' }}><div className="lp-wrap" style={{ maxWidth: 720, textAlign: 'center' }}><p className="lp-eyebrow">Plans</p><h2 id="lp-pricing-h" style={{ margin: 0, font: "600 clamp(1.85rem,4vw,3rem)/1.05 'Cormorant Garamond',serif" }}>Practice within your course.</h2><p style={{ marginTop: 16, color: '#1A2E35', fontSize: '0.875rem' }}>MET Mastery is included with your guided course, not a separate subscription. Talk to your teacher about which plan matches your test date.</p></div></section>

        <section id="signin" aria-labelledby="lp-signin-h" style={{ padding: '72px 0', background: '#fff', borderTop: '1px solid #E8E5DF' }}><div className="lp-wrap" style={{ maxWidth: 560, textAlign: 'center' }}><p className="lp-eyebrow">Sign in</p><h2 id="lp-signin-h" style={{ margin: 0, font: "600 clamp(1.85rem,4vw,3rem)/1.05 'Cormorant Garamond',serif" }}>Already a member?</h2><p style={{ marginTop: 12, color: '#1A2E35', fontSize: '0.875rem' }}>Use the sign-in link your teacher shared, or return to your workspace.</p><p style={{ marginTop: 20 }}><button className="lp-btn lp-primary" type="button" onClick={onMemberSignIn}>Go to sign in <span aria-hidden="true">→</span></button></p></div></section>
      </main>
      <footer style={{ padding: '30px 0', color: '#2B454E', background: '#fff', borderTop: '1px solid #E8E5DF', fontSize: '0.75rem' }}><div className="lp-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}><span style={{ font: "700 1.25rem 'Cormorant Garamond',serif" }}>MET Mastery</span><span>© 2026 MET Mastery</span></div></footer>
    </div>
  );
}
