import { useEffect, useRef, useState } from "react";
import "./ExplorerWindow.css";

type ExplorerWindowProps = {
  isFocused: boolean;
  onClose: () => void;
  onFocus: () => void;
};

type Position = { x: number; y: number };

const referenceViewport = { width: 1920, height: 1080 };
const referenceWindow = { width: 1728, height: 972 };

function getWindowSize() {
  const scale = Math.min(
    window.innerWidth / referenceViewport.width,
    window.innerHeight / referenceViewport.height,
  );

  return {
    height: referenceWindow.height * scale,
    width: referenceWindow.width * scale,
  };
}

export function ExplorerWindow({ isFocused, onClose, onFocus }: ExplorerWindowProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState(getWindowSize);
  const dragOffset = useRef<Position | null>(null);

  useEffect(() => {
    const updateWindowSize = () => setWindowSize(getWindowSize());
    window.addEventListener("resize", updateWindowSize);
    return () => window.removeEventListener("resize", updateWindowSize);
  }, []);

  return (
    <section
      className={`explorer-window${isMaximized ? " is-maximized" : ""}${isFocused ? " is-focused" : ""}`}
      aria-label="Internet Explorer"
      style={isMaximized ? undefined : { left: position.x, top: position.y, ...windowSize }}
      onPointerDownCapture={onFocus}
    >
      <header
        className="explorer-titlebar"
        onPointerDown={(event) => {
          if (isMaximized || event.button !== 0) return;
          dragOffset.current = { x: event.clientX - position.x, y: event.clientY - position.y };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragOffset.current) return;
          setPosition({
            x: Math.max(0, event.clientX - dragOffset.current.x),
            y: Math.max(0, event.clientY - dragOffset.current.y),
          });
        }}
        onPointerUp={() => { dragOffset.current = null; }}
        onPointerCancel={() => { dragOffset.current = null; }}
      >
        <span className="explorer-title"><i aria-hidden="true" />https://portfolio.local/ - Windows Internet Explorer</span>
        <div className="explorer-controls">
          <button type="button" aria-label="최소화">−</button>
          <button type="button" aria-label="창모드 전환" onPointerDown={(event) => event.stopPropagation()} onClick={() => setIsMaximized((value) => !value)}>{isMaximized ? "▣" : "□"}</button>
          <button type="button" aria-label="닫기" onPointerDown={(event) => event.stopPropagation()} onClick={onClose}>×</button>
        </div>
      </header>
      <nav className="explorer-menu" aria-label="브라우저 메뉴"><span>File</span><span>Edit</span><span>View</span><span>Favorites</span><span>Tools</span><span>Help</span></nav>
      <div className="explorer-commandbar" aria-label="브라우저 도구 모음">
        <button type="button" aria-label="뒤로"><b>◀</b><span>Back</span></button>
        <button type="button" aria-label="앞으로" disabled><b>▶</b><span>Forward</span></button>
        <i aria-hidden="true" />
        <button type="button" aria-label="중지"><b>×</b><span>Stop</span></button>
        <button type="button" aria-label="새로 고침"><b>↻</b><span>Refresh</span></button>
        <button type="button" aria-label="홈"><b>⌂</b><span>Home</span></button>
        <i aria-hidden="true" />
        <button type="button" aria-label="검색"><b>⌕</b><span>Search</span></button>
        <button type="button" aria-label="즐겨찾기"><b>★</b><span>Favorites</span></button>
        <button type="button" aria-label="기록"><b>◷</b><span>History</span></button>
      </div>
      <div className="explorer-addressbar">
        <button type="button"><span>★</span>Favorites</button>
        <label><span>Address</span><i aria-hidden="true" /><input readOnly value="https://portfolio.local/" aria-label="주소" /><b>⌄</b></label>
        <button type="button" className="explorer-go" aria-label="이동">Go</button>
      </div>
      <div className="explorer-linkbar" aria-hidden="true"><span>Links</span><i /><span>Portfolio</span><span>Projects</span><span>Contact</span></div>
      <article className="portfolio-page">
        <div className="portfolio-placeholder">
          <h1>Portfolio is coming soon.</h1>
          <p>작업과 이야기가 곧 이곳에 채워집니다.</p>
          <a href="#portfolio">View temporary portfolio</a>
        </div>
      </article>
      <footer className="explorer-status"><span>Done</span><span><i aria-hidden="true" />Internet</span><span>100%</span></footer>
    </section>
  );
}
