import { ThreeScene } from "../../../widgets/three-scene";

export function HomePage() {
  return (
    <main>
      <section>
        <p>React · TypeScript · Vite</p>
        <h1>Interacta</h1>
        <span>Three.js 환경이 준비되었습니다.</span>
      </section>
      <ThreeScene />
      <nav className="taskbar" aria-label="작업 표시줄">
        <button className="start-button" type="button">
          <span className="start-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          시작
        </button>
        <div className="notification-area">
          <time dateTime="2001-10-25T15:45">
            <span>오후 3:45</span>
            <span>2001-10-25</span>
          </time>
        </div>
      </nav>
    </main>
  );
}
