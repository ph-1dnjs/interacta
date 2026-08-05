import { useEffect, useState } from "react";
import { ThreeScene } from "../../../widgets/three-scene";

function formatDateTime(date: Date) {
  const time = date.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const day = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((value, index) => (index === 0 ? String(value) : String(value).padStart(2, "0")))
    .join("-");

  return { time, day };
}

export function HomePage() {
  const [now, setNow] = useState(() => new Date());
  const { time, day } = formatDateTime(now);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);

    return () => window.clearInterval(timer);
  }, []);

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
          <time dateTime={`${day}T${now.toTimeString().slice(0, 5)}`}>
            <span>{time}</span>
            <span>{day}</span>
          </time>
        </div>
      </nav>
    </main>
  );
}
