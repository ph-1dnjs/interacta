import { useEffect, useMemo, useRef, useState } from "react";
import galleryIcon from "../../../shared/assets/305.ico";
import consoleIcon from "../../../shared/assets/1044.ico";
import explorerIcon from "../../../shared/assets/internet-explorer.ico";
import loginAvatar from "../../../shared/assets/login-avatar.jpg";
import notepadIcon from "../../../shared/assets/514.ico";
import folderIcon from "../../../shared/assets/no-click-folder.png";
import { ConsoleWindow } from "../../../widgets/console";
import { ExplorerWindow } from "../../../widgets/explorer";
import { NotepadWindow } from "../../../widgets/notepad";
import { GalleryOneWindow } from "../../../widgets/gallery-one/ui/GalleryOneWindow";
import { GalleryTwoWindow } from "../../../widgets/gallery-two/ui/GalleryTwoWindow";
import { RainOverlay } from "../../../widgets/rain";
import { HelperDogScene, ThreeScene, UmbrellaScene } from "../../../widgets/three-scene";
import { ProjectFolderWindow } from "../../../widgets/projects/ui/ProjectFolderWindow";

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
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [focusedWindow, setFocusedWindow] = useState<"console" | "notepad" | "explorer">("console");
  const [isBunnyVisible, setIsBunnyVisible] = useState(false);
  const [isHelloWorldVisible, setIsHelloWorldVisible] = useState(false);
  const [isUmbrellaVisible, setIsUmbrellaVisible] = useState(false);
  const [isHelperOpen, setIsHelperOpen] = useState(true);
  const threeSceneRef = useRef<HTMLDivElement>(null);
  const taskbarRef = useRef<HTMLElement>(null);
  const startMenuRef = useRef<HTMLElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const rainObstacles = useMemo(
    () => [
      { ref: threeSceneRef, shape: "canvas" as const },
      { ref: taskbarRef, shape: "box" as const },
    ],
    [],
  );
  const { time, day } = formatDateTime(now);
  const openProjectFolder = (projectId?: string) => { setSelectedProjectId(projectId); setFocusedWindow("explorer"); setIsProjectsOpen(true); };

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isStartMenuOpen) return;

    const closeOnOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (startMenuRef.current?.contains(target) || startButtonRef.current?.contains(target)) return;
      setIsStartMenuOpen(false);
    };

    window.addEventListener("pointerdown", closeOnOutsidePointerDown);
    return () => window.removeEventListener("pointerdown", closeOnOutsidePointerDown);
  }, [isStartMenuOpen]);

  return (
    <main className={isRaining ? "is-raining" : undefined}>
      <button
        className="desktop-icon projects-icon"
        type="button"
        onDoubleClick={() => openProjectFolder()}
        aria-label="프로젝트 폴더 열기"
      >
        <img src={folderIcon} alt="" width="75" height="75" />
        <span>PROJECTS</span>
      </button>
      <button
        className="desktop-icon explorer-icon"
        type="button"
        onClick={() => {
          setFocusedWindow("explorer");
          setIsExplorerOpen(true);
        }}
        aria-label="Internet Explorer 열기"
      >
        <img src={explorerIcon} alt="" width="75" height="75" />
        <span>Internet Explorer</span>
      </button>
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
          <ThreeScene showBunny={isBunnyVisible} showHelloWorld={isHelloWorldVisible} />
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
          onOpenBunny={() => setIsBunnyVisible(true)}
          onCloseBunny={() => setIsBunnyVisible(false)}
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
      {isExplorerOpen && (
        <ExplorerWindow
          onClose={() => setIsExplorerOpen(false)}
          onFocus={() => setFocusedWindow("explorer")}
          isFocused={focusedWindow === "explorer"}
          onOpenProject={openProjectFolder}
        />
      )}
      {isProjectsOpen && <ProjectFolderWindow initialProjectId={selectedProjectId} onClose={() => setIsProjectsOpen(false)} onFocus={() => setFocusedWindow("explorer")} isFocused={focusedWindow === "explorer"} />}
      <section className={isHelperOpen ? "desktop-helper is-open" : "desktop-helper"} aria-label="데스크톱 도우미">
        {isHelperOpen && (
          <div className="desktop-helper-message" role="status">
            <button className="desktop-helper-close" type="button" onClick={() => setIsHelperOpen(false)} aria-label="도움말 닫기">×</button>
            <strong>무엇을 도와드릴까요?</strong>
            <div className="desktop-helper-shortcuts">
              <button type="button" onClick={() => { setFocusedWindow("explorer"); setIsExplorerOpen(true); setIsHelperOpen(false); }}>
                Internet Explorer 열기
              </button>
              <button type="button" onClick={() => { openProjectFolder(); setIsHelperOpen(false); }}>
                프로젝트 보기
              </button>
            </div>
          </div>
        )}
        <button className="desktop-helper-dog" type="button" onClick={() => setIsHelperOpen((value) => !value)} aria-expanded={isHelperOpen} aria-label="도움말 도우미 열기 또는 닫기">
          <HelperDogScene />
        </button>
      </section>
      {isStartMenuOpen && (
        <aside ref={startMenuRef} id="start-menu" className="start-menu" aria-label="시작 메뉴">
          <header className="start-menu-header">
            <img src={loginAvatar} alt="" />
            <span><strong>Una</strong><small>Production Engineer</small></span>
          </header>
          <div className="start-menu-items" role="menu">
            <button type="button" role="menuitem" onClick={() => { setFocusedWindow("explorer"); setIsExplorerOpen(true); setIsStartMenuOpen(false); }}>
              <img src={explorerIcon} alt="" /><strong>Internet Explorer</strong>
            </button>
            <button type="button" role="menuitem" onClick={() => { setFocusedWindow("console"); setIsConsoleOpen(true); setIsStartMenuOpen(false); }}>
              <img src={consoleIcon} alt="" /><span>Command Prompt</span>
            </button>
            <button type="button" role="menuitem" onClick={() => { setFocusedWindow("notepad"); setIsNotepadOpen(true); setIsStartMenuOpen(false); }}>
              <img src={notepadIcon} alt="" /><span>명령어</span>
            </button>
            <i aria-hidden="true" />
            <button type="button" role="menuitem" onClick={() => { setIsGalleryTwoOpen(false); setIsGalleryOpen(true); setIsStartMenuOpen(false); }}>
              <img src={galleryIcon} alt="" /><span>갤러리 1</span>
            </button>
            <button type="button" role="menuitem" onClick={() => { setIsGalleryOpen(false); setIsGalleryTwoOpen(true); setIsStartMenuOpen(false); }}>
              <img src={galleryIcon} alt="" /><span>갤러리 2</span>
            </button>
          </div>
          <footer className="start-menu-footer">
            <button type="button" onClick={() => { setIsExplorerOpen(false); setIsProjectsOpen(false); setIsConsoleOpen(false); setIsNotepadOpen(false); setIsGalleryOpen(false); setIsGalleryTwoOpen(false); setIsStartMenuOpen(false); }}><i aria-hidden="true" />모두 닫기</button>
          </footer>
        </aside>
      )}
      <nav ref={taskbarRef} className="taskbar" aria-label="작업 표시줄">
        <button ref={startButtonRef} className={isStartMenuOpen ? "start-button is-open" : "start-button"} type="button" onClick={() => setIsStartMenuOpen((value) => !value)} aria-expanded={isStartMenuOpen} aria-controls="start-menu">
          <span className="start-mark" aria-hidden="true"><i /><i /><i /><i /></span>
          시작
        </button>
        <div className="quick-launch" aria-label="빠른 실행">
          <img src={explorerIcon} alt="" />
        </div>
        <i className="taskbar-divider" aria-hidden="true" />
        <div className="task-list" aria-label="실행 중인 프로그램">
          {isExplorerOpen && (
            <button
              className={focusedWindow === "explorer" ? "task-button is-active" : "task-button"}
              type="button"
              onClick={() => setFocusedWindow("explorer")}
              aria-label="Internet Explorer 활성화"
            >
              <img src={explorerIcon} alt="" />
              <span>Una&apos;s portfolio - Internet Explorer</span>
            </button>
          )}
        </div>
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
