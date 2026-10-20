import { Link } from 'react-router-dom';

const principles = [
  { number: '01', title: 'Find your focus', text: 'Bring the important things into one clear, calm place.' },
  { number: '02', title: 'Make steady progress', text: 'Turn big intentions into small, satisfying next steps.' },
  { number: '03', title: 'Keep your balance', text: 'Build a rhythm that makes room for your best work.' },
];

export default function HomePage() {
  return (
    <>
      <section className="hero-wrap">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> YOUR WORK, IN A BETTER RHYTHM</p>
          <h1>Make room<br />for <span>good work.</span></h1>
          <p className="hero-description">A thoughtful home for your ideas, priorities, and progress. Less noise around your work means more space to do it well.</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/go?mode=signup" className="button button-dark">Find your flow <span aria-hidden="true">↗</span></Link>
            <a href="#how-it-works" className="inline-flex items-center gap-2 text-sm font-semibold text-ink/65 transition hover:text-forest"><span className="play-icon">▶</span> Take a look around</a>
          </div>
          <div className="hero-note"><div className="avatar-stack"><span>J</span><span>M</span><span>A</span><span>+</span></div><p>For the work that matters<br /><strong>and the people behind it.</strong></p></div>
        </div>
        <div className="hero-art" aria-label="An illustration of a calm workspace dashboard">
          <div className="sun-disc" />
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="art-label label-top"><span className="status-pulse" /> A LITTLE MORE CLARITY</div>
          <div className="dashboard-card">
            <div className="card-topline"><span className="mini-mark">n.</span><span className="card-date">MONDAY, OCT 20</span><span className="card-menu">•••</span></div>
            <p className="card-greeting">Good morning, Alex <span>✳</span></p>
            <p className="card-subtitle">A fresh week. A clear direction.</p>
            <div className="focus-panel"><div><span className="focus-overline">TODAY'S FOCUS</span><span className="focus-title">Make it meaningful</span></div><div className="focus-ring"><span>68%</span></div></div>
            <div className="task-heading"><span>ON YOUR MIND</span><span>3 things</span></div>
            <div className="task-row"><span className="task-check task-done">✓</span><span className="task-copy task-strike">Sketch out the first idea</span><span className="task-tag tag-green">DONE</span></div>
            <div className="task-row"><span className="task-check" /><span className="task-copy">Share the early draft</span><span className="task-tag tag-peach">11:30</span></div>
            <div className="task-row"><span className="task-check" /><span className="task-copy">Make time for a walk</span><span className="task-tag tag-blue">LATER</span></div>
            <div className="card-bottom"><span>YOUR WEEK, AT A GLANCE</span><div className="week-bars"><i /><i /><i /><i /><i /><i /><i /></div></div>
          </div>
          <div className="art-sticker"><span>✳</span><small>GOOD THINGS<br />TAKE FOCUS</small></div>
          <div className="art-label label-bottom">A CALMER WAY TO GET THERE <span>↗</span></div>
        </div>
      </section>
      <section className="trust-strip"><span>MADE FOR THE WAY YOU THINK</span><div><span>Independent minds</span><i /> <span>Small teams</span><i /> <span>Big intentions</span><i /> <span>Quiet achievers</span></div></section>
      <section className="principles-section" id="how-it-works">
        <div className="section-heading"><p className="eyebrow"><span className="eyebrow-line" /> A BETTER KIND OF PRODUCTIVITY</p><h2>Work with intention.<br /><span>Feel good doing it.</span></h2><p>Northstar isn't about doing more. It's about finding a more human way to do what matters.</p></div>
        <div className="principle-grid">{principles.map((item) => <article className="principle-card" key={item.number}><span>{item.number}</span><div className="principle-icon">✳</div><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      </section>
      <section className="closing-cta"><div><p className="eyebrow"><span className="eyebrow-line" /> YOUR NEXT CHAPTER STARTS HERE</p><h2>Ready to find<br />your <em>north star?</em></h2></div><Link to="/go?mode=signup" className="button button-light">Create your space <span aria-hidden="true">↗</span></Link><span className="closing-spark">✳</span></section>
    </>
  );
}
