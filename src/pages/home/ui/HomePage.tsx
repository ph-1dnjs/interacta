import { useEffect, useMemo, useRef, useState } from "react";
import folderIcon from "../../../shared/assets/no-click-folder.ico";
import { RainOverlay } from "../../../widgets/rain";
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
  const [isRaining, setIsRaining] = useState(false);
  const folderImageRef = useRef<HTMLImageElement>(null);
  const folderLabelRef = useRef<HTMLSpanElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLSpanElement>(null);
  const threeSceneRef = useRef<HTMLDivElement>(null);
  const taskbarRef = useRef<HTMLElement>(null);
  const rainObstacles = useMemo(
    () => [
      { ref: folderImageRef, shape: "image" as const },
      { ref: folderLabelRef, shape: "text" as const },
      { ref: eyebrowRef, shape: "text" as const },
      { ref: titleRef, shape: "text" as const },
      { ref: descriptionRef, shape: "text" as const },
      { ref: threeSceneRef, shape: "canvas" as const },
      { ref: taskbarRef, shape: "box" as const },
    ],
    [],
  );
  const { time, day } = formatDateTime(now);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className={isRaining ? "is-raining" : undefined}>
      <button
        className="desktop-icon"
        type="button"
        onDoubleClick={() => setIsRaining(true)}
        aria-label="클릭금지 폴더. 더블클릭하면 비가 내립니다."
      >
        <img ref={folderImageRef} src={folderIcon} alt="" width="75" height="75" />
        <span ref={folderLabelRef}>클릭금지</span>
      </button>
      <section>
        <p ref={eyebrowRef}>React · TypeScript · Vite</p>
        <h1 ref={titleRef}>Interacta</h1>
        <span ref={descriptionRef}>Three.js 환경이 준비되었습니다.</span>
      </section>
      <div ref={threeSceneRef} className="three-scene-obstacle">
        <ThreeScene />
      </div>
      <RainOverlay active={isRaining} obstacles={rainObstacles} />
      {isRaining && <div className="rain-blur" aria-hidden="true" />}
      <nav ref={taskbarRef} className="taskbar" aria-label="작업 표시줄">
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
