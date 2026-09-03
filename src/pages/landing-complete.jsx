import { useState } from 'react';

const skills = [['Reading', '78%'], ['Listening', '54%'], ['Writing', '66%'], ['Speaking', '71%'], ['Grammar', '64%'], ['Vocabulary', '69%']];
const methodSteps = [
  ['01', 'Diagnose first', 'See your starting point before you spend time practising what you already know.'],
  ['02', 'Target the gap', 'Get MET-style tasks matched to the skill and question type that needs attention.'],
  ['03', 'Build exam rhythm', 'Use timed practice to make good decisions when the clock is running.'],
  ['04', 'Remember the lesson', 'Save vocabulary and grammar points from each session for deliberate review.'],
  ['05', 'Read clear feedback', 'Know what worked, what needs attention, and the single best next move.'],
  ['06', 'Ask your teacher', 'Bring writing and speaking work to a human when nuance matters most.'],
];

export function App() {
  const [tourOpen, setTourOpen] = useState(false);
  const [taskStarted, setTaskStarted] = useState(false);
  const [question, setQuestion] = useState(2);
  const [audience, setAudience] = useState('student');
  const [menuOpen, setMenuOpen] = useState(false);
  return <main className="landing-preview">
    <header className="site-header">
      <a className="site-brand" href="#top"><span className="brand-mark">M</span><span>MET Mastery</span></a>
      <button className="menu-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="site-nav">Menu</button>
      <nav id="site-nav" className={menuOpen ? 'open' : ''}><a href="#method" onClick={() => setMenuOpen(false)}>The learning loop</a><a href="#how" onClick={() => setMenuOpen(false)}>How it works</a><a href="#teachers" onClick={() => setMenuOpen(false)}>For teachers</a></nav>
      <a className="signin-link" href="#start">Sign in</a><a className="header-cta" href="#start">Find my starting point <span aria-hidden="true">→</span></a>
    </header>
    <section className="hero" id="top">
      <div className="hero-copy"><p className="eyebrow">CLEAR PRACTICE. BETTER FEEDBACK. REAL PROGRESS.</p><h1>Stop guessing.<br /><span>Start with a plan.</span></h1><p>Take one diagnostic, see which skills need your time, and practise with a teacher-supported plan built around your target score.</p><div className="hero-actions"><a className="hero-primary" href="#start">Find my starting point <span>→</span></a><a className="hero-secondary" href="#how">See how it works <span>↓</span></a></div><ul><li>All six MET skills</li><li>Provisional, honest scoring</li><li>Teacher review when it counts</li></ul></div>
      <div className="hero-dashboard" aria-label="A dashboard preview"><p>YOUR NEXT BEST STEP <span>In progress</span></p><h2>Week 2 · Keep building</h2><div className="hero-level"><strong>B2</strong><div><b>Provisional level</b><small>Based on your latest diagnostic · 12 May</small></div></div>{skills.slice(0, 4).map(([name, score]) => <div className="hero-skill" key={name}><span>{name}</span><i><b style={{width: score}} /></i><em>{score}</em></div>)}<small className="hero-next">Next up: Listening · distinguishing main ideas</small></div>
    </section>
    <section className="audience-picker" aria-label="Choose your pathway"><p className="eyebrow">CHOOSE YOUR NEXT STEP</p><div><button className={audience === 'student' ? 'selected' : ''} type="button" onClick={() => setAudience('student')}><span>I’m preparing for the MET</span><small>Find my level and build a focused practice plan.</small><b>Start as a student →</b></button><button className={audience === 'teacher' ? 'selected' : ''} type="button" onClick={() => setAudience('teacher')}><span>I support MET learners</span><small>Give students a clearer path and useful review context.</small><b>Explore teacher tools →</b></button></div>
    </section>
    <section className="skills-strip"><p className="eyebrow">ONE WORKSPACE</p><span>Built around the six skills the MET actually measures.</span>{skills.map(([skill]) => <i key={skill}>{skill}</i>)}</section>
    <section className="product-proof" aria-labelledby="proof-title">
      <div className="proof-intro">
        <p className="eyebrow">YOUR PLAN. MADE PERSONAL.</p>
        <h1 id="proof-title">A closer look <span>at your study plan.</span></h1>
        <p className="lead">Your plan adapts to your MET diagnostic and focuses your practice where it will make the biggest impact.</p>
        <button className="primary-button" type="button" onClick={() => setTourOpen((open) => !open)} aria-expanded={tourOpen}>{tourOpen ? 'Hide platform tour' : 'Take your diagnostic'} <span aria-hidden="true">→</span></button>
        {tourOpen && <p className="tour-note" role="status">The preview is open. Try the next task and question controls.</p>}
      </div>
      <div className="workspace-frame" aria-label="Interactive student workspace preview">
        <aside className="workspace-nav">
          <div className="brand"><span className="brand-mark">M</span><span>MET Mastery</span></div>
          <nav aria-label="Student workspace"><a className="active" href="#plan">My plan</a><a href="#practice">Practice</a><a href="#review">Review</a><a href="#progress">Progress</a></nav>
          <div className="nav-help">Need help?<br /><span>Message your teacher</span></div><button type="button" className="profile-button">SC <span>S. Carter</span><b>⌄</b></button>
        </aside>
        <div className="workspace-main">
          <section className="plan-pane" id="plan">
            <header className="panel-heading"><div><h2>Welcome back, Sam.</h2><p>You’re on track for your goal.</p></div><button type="button" className="goal-button">B2 Goal <span>⌄</span></button></header>
            <article className="diagnosis-card"><div className="level-block"><span>Your MET diagnosis</span><strong>B2</strong><p>Good work. You’re building the skills you need for the next level.</p><a href="#progress">View full results →</a></div><div className="skill-list">{skills.map(([name, score]) => <div className="skill-row" key={name}><span>{name}</span><i><b style={{ width: score }} /></i><em>{score}</em></div>)}</div></article>
            <h3 className="section-title">Your next best task</h3>
            <article className={`next-task ${taskStarted ? 'started' : ''}`} id="practice"><div className="task-symbol" aria-hidden="true">◉</div><div><span>LISTENING PRACTICE</span><h3>Main idea and details</h3><p>Build the skill of identifying the main idea and key supporting details.</p></div><div className="task-action"><small>Estimated time<br /><b>18 min</b></small><button type="button" onClick={() => setTaskStarted(true)}>{taskStarted ? 'In progress' : 'Start task'}</button></div></article>
            <h3 className="section-title upcoming-title">Upcoming</h3><div className="upcoming-list"><article><span className="writing-dot" aria-hidden="true" /><div><small>WRITING PRACTICE</small><b>Develop a clear argument</b></div><em>20 min</em></article><article><span className="speaking-dot" aria-hidden="true" /><div><small>SPEAKING PRACTICE</small><b>Express and support an opinion</b></div><em>15 min</em></article></div>
          </section>
          <section className="practice-pane" aria-labelledby="practice-title">
            <header className="practice-header"><h2 id="practice-title">Listening practice <span>•</span> Main idea and details</h2><button type="button">Close ×</button></header>
            <div className="question-area"><div className="question-meta"><span>Question {question} of 12</span><b>14:32</b><a href="#timer">Hide timer</a></div><div className="progress-line"><span style={{ width: `${question * 7}%` }} /></div><p className="instruction">Listen to the audio passage. Then answer the question.</p><div className="audio-bar"><button type="button" aria-label="Play audio">▶</button><span>0:00 / 1:42</span><i /><button type="button" aria-label="Audio settings">⋮</button></div><form><fieldset><legend>What is the main idea of the passage?</legend>{['The impact of urban gardens on local communities', 'The history of community gardening in Detroit', 'The benefits of healthy eating in urban areas', 'The challenges of maintaining public parks'].map((answer, index) => <label className={index === 2 ? 'selected-answer' : ''} key={answer}><input type="radio" name="answer" defaultChecked={index === 2} /> <b>{String.fromCharCode(65 + index)}</b> {answer}</label>)}</fieldset></form><div className="question-actions"><button type="button" className="text-button">Clear answer</button><button type="button" className="next-button" onClick={() => setQuestion((value) => Math.min(12, value + 1))}>Next question <span>→</span></button></div></div>
            <article className="feedback-panel" id="review"><p><strong>TEACHER FEEDBACK</strong> <span>Reviewed</span></p><h3>Great job selecting the main idea.</h3><p>The passage focuses on how community gardens improve health and bring people together. The other options are details that support this idea.</p><a href="#review">Keep your response tightly focused on the main idea.</a><small>Reviewed by Ms. Johnson &nbsp; • &nbsp; May 12, 2026</small></article>
          </section>
        </div>
        <div className="callout callout-task"><b>Your next best task</b><span>We surface the task that will help you improve the most right now.</span></div><div className="callout callout-timer"><b>Timed MET practice</b><span>Real MET-style tasks with a timer help you build speed and confidence.</span></div><div className="callout callout-feedback"><b>Teacher-reviewed feedback</b><span>Get clear, actionable feedback so you know exactly what to do next.</span></div>
      </div>
    </section>
    <section className="method-section" id="how"><div className="method-intro"><p className="eyebrow">LESS NOISE. BETTER PRACTICE.</p><h2>A plan that changes as you learn.</h2><p>Good preparation is not a pile of random questions. It is a loop: find the gap, work on it, get useful feedback, and try again.</p></div><div className="method-grid">{methodSteps.map(([number, title, copy]) => <article key={number}><small>{number} / 06</small><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    <section className="learning-loop" id="method"><p className="eyebrow">THE LEARNING LOOP</p><h2>From “I’m not sure” to “I know what to do.”</h2><p className="loop-lead">Every part of the workspace points back to a practical next step, so progress feels concrete, not abstract.</p><div className="loop-steps"><article><small>01 — FIND YOUR START</small><h3>Take a diagnostic.</h3><p>Get a useful, provisional picture of your six MET skills and the question types behind it.</p></article><article><small>02 — PRACTISE WITH PURPOSE</small><h3>Follow the signal.</h3><p>Your practice queue puts the work that matters next in front of you, with timed and untimed options.</p></article><article><small>03 — CLOSE THE LOOP</small><h3>Review, then repeat.</h3><p>Use feedback and saved review points to make the next attempt a little stronger.</p></article></div></section>
    <section className="audience-cards" id="teachers"><article><p className="eyebrow">FOR LEARNERS</p><h2>Make every study session count.</h2><p>See your gaps, practise the right task types, and know what to do next.</p><a href="#start">Start a diagnostic →</a></article><article><p className="eyebrow">FOR TEACHERS</p><h2>Keep the human part visible.</h2><p>Give learners structure while keeping writing and speaking feedback in your hands.</p><a href="#teachers">See the teacher workspace →</a></article></section>
    <section className="final-cta" id="start"><p className="eyebrow">YOUR NEXT STEP</p><h2>{audience === 'teacher' ? 'Give learners a clearer path.' : 'Start with a clearer picture.'}</h2><p>{audience === 'teacher' ? 'Bring your teaching workflow into one focused workspace.' : 'Take a diagnostic, see your current level, and leave with a practical place to begin.'}</p><a href="#top">{audience === 'teacher' ? 'Explore teacher tools' : 'Start a diagnostic'} <span>→</span></a></section>
    <footer><a className="site-brand" href="#top"><span className="brand-mark">M</span><span>MET Mastery</span></a><nav><a href="#how">What you get</a><a href="#method">How it works</a><a href="#start">Contact</a></nav><small>© 2026 MET Mastery</small></footer>
  </main>;
}
