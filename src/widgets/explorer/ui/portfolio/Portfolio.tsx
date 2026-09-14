import { useEffect, useRef, useState } from "react";
import pharmaLogo from "../../../../shared/assets/pharma.png";
import { MatrixScene } from "./MatrixScene";
import "./Portfolio.css";

const projects = [
  { id: "pharmaresearch", name: "PHARMARESEARCH", type: "B2B MALL PLATFORM", stack: "PL / Frontend Development", description: "파마리서치 B2B 몰 플랫폼 구축 신규 프로젝트입니다. 프로젝트 리드와 프론트엔드 개발을 맡아 진행하고 있습니다.", period: "2025.08.04 ~ 진행중", className: "pharma", symbol: "PR", logo: pharmaLogo },
  { id: "interacta", name: "INTERACTA", type: "INTERACTIVE WEB EXPERIENCE", stack: "React / Three.js / TypeScript", description: "익숙한 데스크톱을 새로운 놀이터로. 창을 열고, 오브젝트를 움직이고, 웹과 상호작용하는 실험.", className: "desktop", symbol: "↗" },
  { id: "neural-02", name: "NEURAL / 02", type: "GENERATIVE INTERFACE · CONCEPT", stack: "Creative coding / Data visualization", description: "데이터의 연결을 시각적 언어로 표현하는 인터페이스 콘셉트입니다. 실제 프로젝트로 교체할 예시입니다.", className: "neural", symbol: "✳" },
  { id: "system-03", name: "SYSTEM / 03", type: "DIGITAL PRODUCT · CONCEPT", stack: "Design system / Frontend", description: "복잡한 정보를 단순한 경험으로 만드는 디지털 제품 콘셉트입니다. 실제 프로젝트로 교체할 예시입니다.", className: "system", symbol: "⌘" },
];

export function Portfolio({ onOpenProject }: { onOpenProject: (projectId: string) => void }) {
  const scroller = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const page = scroller.current;
    if (!page) return;
    const resize = new ResizeObserver(() => page.style.setProperty("--portfolio-height", `${page.clientHeight}px`));
    resize.observe(page);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle("is-visible", entry.isIntersecting));
    }, { root: page, threshold: 0.12 });
    page.querySelectorAll(".matrix-reveal").forEach((element) => observer.observe(element));
    return () => { observer.disconnect(); resize.disconnect(); };
  }, []);
  const go = (id: string) => {
    const page = scroller.current;
    const target = page?.querySelector<HTMLElement>(`#${id}`);
    if (page && target) page.scrollTo({ top: target.getBoundingClientRect().top - page.getBoundingClientRect().top + page.scrollTop - 80, behavior: paused ? "instant" : "smooth" });
    setMenuOpen(false);
  };

  return (
    <article className={`matrix-portfolio${paused ? " motion-paused" : ""}`} ref={scroller} aria-label="Una 포트폴리오" tabIndex={0}
      onScroll={(event) => { const page = event.currentTarget; setProgress(page.scrollTop / Math.max(1, page.scrollHeight - page.clientHeight)); }}
      onKeyDown={(event) => { if (event.key === "Escape") setMenuOpen(false); }}>
      <div className="matrix-stage"><MatrixScene scroller={scroller} paused={paused} /><div className="matrix-vignette" /></div>
      <nav className="matrix-nav" aria-label="포트폴리오 탐색">
        <button className="matrix-brand" onClick={() => go("matrix-top")}>UNA<span>®</span></button>
        <span className="matrix-nav-caption">INDEPENDENT MIND.<br />DIGITAL EXPERIENCES.</span>
        <div className="matrix-nav-actions">
          <button className="matrix-motion" aria-label={paused ? "애니메이션 재생" : "애니메이션 일시정지"} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "▷" : "Ⅱ"}</button>
          <button className="matrix-contact-button" onClick={() => go("matrix-contact")}>LET’S CONNECT <span>↗</span></button>
          <button aria-expanded={menuOpen} aria-controls="matrix-menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "CLOSE ×" : "MENU +"}</button>
        </div>
      </nav>
      {menuOpen && <div id="matrix-menu" className="matrix-menu">{[ ["matrix-about", "01 / About"], ["matrix-work", "02 / Selected work"], ["matrix-contact", "03 / Connect"] ].map(([id, label]) => <button key={id} onClick={() => go(id)}>{label}<span>↗</span></button>)}</div>}
      <div className="matrix-content">
        <section className="matrix-hero" id="matrix-top">
          <div className="matrix-hero-meta"><span><i /> SYSTEM ONLINE</span><span>CREATIVE DEVELOPER<br />SEOUL, KR / 2026</span></div>
          <div className="matrix-crosshairs" aria-hidden="true"><span>+</span><span>+</span><span>+</span><span>+</span></div>
          <div className="matrix-hero-bottom"><p>BETWEEN HUMAN<br />&amp; MACHINE.</p><h1>HELLO<span>_</span><br />WORLD<span className="matrix-period">.</span></h1><div className="matrix-hero-footer"><span>CODE IS MY MEDIUM. EXPERIENCE IS THE ART.</span><button onClick={() => go("matrix-about")}>SCROLL TO EXPLORE <span>↓</span></button></div></div>
        </section>
        <section className="matrix-about matrix-reveal" id="matrix-about"><p className="matrix-label">01 / THE HUMAN BEHIND THE CODE</p><h2>I turn <span>logic</span><br />into something<br />you can <em>feel.</em></h2><div className="matrix-about-copy"><span>コードから、体験へ。<br />코드에서, 경험으로.</span><p>안녕하세요, Una입니다. 기술과 감각이 만나는 곳에서<br />직접 만지고 탐색하고 싶은 웹 경험을 만듭니다.<br />작은 인터랙션부터 하나의 세계까지.</p></div><div className="matrix-skills"><span>FRONTEND DEVELOPMENT</span><span>CREATIVE CODING</span><span>INTERACTIVE EXPERIENCES</span><span>WEBGL / THREE.JS</span></div></section>
        <section className="matrix-work" id="matrix-work"><div className="matrix-work-heading matrix-reveal"><p className="matrix-label">02 / SELECTED EXPLORATIONS</p><h2>Made of code.<br /><span>Built for people.</span></h2><small>02 PROJECTS + 02 CONCEPTS</small></div>
          {projects.map((project, index) => <article key={project.name} className="matrix-project matrix-reveal"><button className={`matrix-project-art art-${project.className}`} onClick={() => onOpenProject(project.id)} aria-label={`${project.name} 프로젝트 폴더 열기`}><span className="matrix-art-index">{project.period ?? `EXPERIMENT / 00${index}`}</span>{project.logo ? <img className="matrix-project-logo" src={project.logo} alt="PharmaResearch 로고" /> : <div className="matrix-art-symbol" aria-hidden="true">{project.symbol}</div>}<span className="matrix-art-code">{project.period ? "PL · FRONTEND DEVELOPMENT_" : index === 1 ? "C:\\UNA> START EXPERIENCE_" : index === 2 ? "CONNECTING THE INVISIBLE_" : "LESS NOISE. MORE SIGNAL_"}</span><span className="matrix-project-open">OPEN PROJECT FILES ↗</span></button><div className="matrix-project-caption"><h3>{project.name}</h3><span>{project.type}</span></div><div className="matrix-project-detail"><p>{project.description}</p><button onClick={() => onOpenProject(project.id)}>프로젝트 파일 보기 <span>↗</span></button><span>{project.stack}</span></div></article>)}
        </section>
        <footer className="matrix-contact matrix-reveal" id="matrix-contact"><p className="matrix-label">03 / WHAT’S NEXT?</p><h2>Let’s make<br /><em>something</em><br />matter<span>↗</span></h2><p className="matrix-contact-note">새로운 연결은, 새로운 가능성이 됩니다.<br /><span>연락처와 소셜 링크는 준비 중입니다.</span></p><div className="matrix-footer"><span>© 2026 UNA</span><span>DESIGNED IN THOUGHT. BUILT IN CODE.</span><button onClick={() => go("matrix-top")}>BACK TO TOP ↑</button></div></footer>
      </div><div className="matrix-progress" aria-hidden="true" style={{ transform: `scaleX(${progress})` }} />
    </article>
  );
}
