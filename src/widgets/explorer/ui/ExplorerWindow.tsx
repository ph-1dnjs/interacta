import { useEffect, useRef, useState } from "react";
import explorerIcon from "../../../shared/assets/internet-explorer.ico";
import "./ExplorerWindow.css";
import { Portfolio } from "./portfolio/Portfolio";

type ExplorerWindowProps = {
  isFocused: boolean;
  onClose: () => void;
  onFocus: () => void;
  onOpenProject: (projectId: string) => void;
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

export function ExplorerWindow({ isFocused, onClose, onFocus, onOpenProject }: ExplorerWindowProps) {
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
        <span className="explorer-title"><img src={explorerIcon} alt="" />https://portfolio.local/ - Windows Internet Explorer</span>
        <div className="explorer-controls">
          <button type="button" aria-label="최소화">−</button>
          <button type="button" aria-label="창모드 전환" onPointerDown={(event) => event.stopPropagation()} onClick={() => setIsMaximized((value) => !value)}>{isMaximized ? "▣" : "□"}</button>
          <button type="button" aria-label="닫기" onPointerDown={(event) => event.stopPropagation()} onClick={onClose}>×</button>
        </div>
      </header>
      <div className="explorer-addressbar">
        <div className="address-nav">
          <button type="button" aria-label="뒤로">‹</button>
          <button type="button" aria-label="앞으로" disabled>›</button>
        </div>
        <label><input readOnly value="https://portfolio.local/" aria-label="주소" /></label>
        <button type="button" className="explorer-refresh" aria-label="새로 고침">↻</button>
        <label className="explorer-search"><input readOnly value="Live Search" aria-label="검색" /><b>⌕</b></label>
      </div>
      <nav className="explorer-menu" aria-label="브라우저 메뉴"><span>File</span><span>Edit</span><span>View</span><span>Favorites</span><span>Tools</span><span>Help</span></nav>
      <div className="explorer-commandbar" aria-label="브라우저 도구 모음">
        <button type="button" aria-label="즐겨찾기에 추가"><b>★</b><span>Favorites</span></button>
        <i aria-hidden="true" />
        <button type="button" aria-label="홈"><b>⌂</b><span>Home</span></button>
        <button type="button" aria-label="RSS"><b>◔</b><span>Feeds</span></button>
        <button type="button" aria-label="인쇄"><b>▣</b><span>Print</span></button>
        <button type="button" aria-label="페이지 메뉴"><b>▤</b><span>Page</span></button>
        <button type="button" aria-label="도구 메뉴"><b>⚙</b><span>Tools</span></button>
      </div>
      <div className="explorer-tabs"><button type="button" className="is-selected"><img src={explorerIcon} alt="" />Una's portfolio</button><button type="button" aria-label="새 탭">+</button></div>
      <Portfolio onOpenProject={onOpenProject} />
      <footer className="explorer-status"><span>Done</span><span><i aria-hidden="true" />Internet</span><span>100%</span></footer>
    </section>
  );
}
