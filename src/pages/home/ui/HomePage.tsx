import { useEffect, useMemo, useRef, useState } from "react";
import galleryIcon from "../../../shared/assets/305.ico";
import consoleIcon from "../../../shared/assets/1044.ico";
import notepadIcon from "../../../shared/assets/514.ico";
import { ConsoleWindow } from "../../../widgets/console";
import { NotepadWindow } from "../../../widgets/notepad";
import { GalleryOneWindow } from "../../../widgets/gallery-one/ui/GalleryOneWindow";
import { GalleryTwoWindow } from "../../../widgets/gallery-two/ui/GalleryTwoWindow";
import { RainOverlay } from "../../../widgets/rain";
import { ThreeScene, UmbrellaScene } from "../../../widgets/three-scene";

function formatDateTime(date: Date) {
  const time = date.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const day = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((value, index) =>
      index === 0 ? String(value) : String(value).padStart(2, "0"),
    )
    .join("-");

  return { time, day };
}

export function HomePage() {
  const [now, setNow] = useState(() => new Date());
  const [isRaining, setIsRaining] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isGalleryTwoOpen, setIsGalleryTwoOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const [focusedWindow, setFocusedWindow] = useState<"console" | "notepad">("console");
  const [isHelloWorldVisible, setIsHelloWorldVisible] = useState(false);
  const [isUmbrellaVisible, setIsUmbrellaVisible] = useState(false);
  const threeSceneRef = useRef<HTMLDivElement>(null);
  const taskbarRef = useRef<HTMLElement>(null);
  const rainObstacles = useMemo(
    () => [
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
        className="desktop-icon notepad-icon"
        type="button"
        onDoubleClick={() => {
          setFocusedWindow("notepad");
          setIsNotepadOpen(true);
        }}
        aria-label="명령어 메모장 열기"
      >
        <img src={notepadIcon} alt="" width="75" height="75" />
        <span>명령어</span>
      </button>
      <button
        className="desktop-icon console-icon"
        type="button"
        onDoubleClick={() => {
          setFocusedWindow("console");
          setIsConsoleOpen(true);
        }}
        aria-label="명령 프롬프트 열기"
      >
        <img src={consoleIcon} alt="" width="75" height="75" />
        <span>Command Prompt</span>
      </button>
      <button
        className="desktop-icon gallery-icon"
        type="button"
        onClick={() => {
          setIsGalleryTwoOpen(false);
          setIsGalleryOpen(true);
        }}
        aria-label="갤러리 1 열기"
      >
        <img src={galleryIcon} alt="" width="75" height="75" />
        <span>갤러리 1</span>
      </button>
      <button
        className="desktop-icon gallery-two-icon"
        type="button"
        onClick={() => {
          setIsGalleryOpen(false);
          setIsGalleryTwoOpen(true);
        }}
        aria-label="갤러리 2 열기"
      >
        <img src={galleryIcon} alt="" width="75" height="75" />
        <span>갤러리 2</span>
      </button>
      <div
        ref={threeSceneRef}
        className={isUmbrellaVisible ? "three-scene-obstacle is-interactive" : "three-scene-obstacle"}
      >
        <div className="three-title-scene">
          <ThreeScene showHelloWorld={isHelloWorldVisible} />
        </div>
        {isUmbrellaVisible && (
          <div className="three-umbrella-scene">
            <UmbrellaScene />
          </div>
        )}
      </div>
      <RainOverlay active={isRaining} obstacles={rainObstacles} />
      {isRaining && <div className="rain-blur" aria-hidden="true" />}
      {isGalleryOpen && <GalleryOneWindow onClose={() => setIsGalleryOpen(false)} />}
      {isGalleryTwoOpen && <GalleryTwoWindow onClose={() => setIsGalleryTwoOpen(false)} />}
      {isConsoleOpen && (
        <ConsoleWindow
          onClose={() => setIsConsoleOpen(false)}
          onOpenHello={() => setIsHelloWorldVisible(true)}
          onCloseHello={() => setIsHelloWorldVisible(false)}
          onStartRain={() => setIsRaining(true)}
          onStopRain={() => setIsRaining(false)}
          onOpenUmbrella={() => setIsUmbrellaVisible(true)}
          onCloseUmbrella={() => setIsUmbrellaVisible(false)}
          onFocus={() => setFocusedWindow("console")}
          isFocused={focusedWindow === "console"}
        />
      )}
      {isNotepadOpen && (
        <NotepadWindow
          onClose={() => setIsNotepadOpen(false)}
          onFocus={() => setFocusedWindow("notepad")}
          isFocused={focusedWindow === "notepad"}
        />
      )}
      <nav ref={taskbarRef} className="taskbar" aria-label="작업 표시줄">
        <button className="start-button" type="button">
          <span className="start-mark" aria-hidden="true"><i /><i /><i /><i /></span>
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
