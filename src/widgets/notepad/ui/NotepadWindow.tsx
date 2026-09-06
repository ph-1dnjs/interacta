import { useRef, useState } from "react";
import "./NotepadWindow.css";

type NotepadWindowProps = { onClose: () => void; onFocus: () => void; isFocused: boolean };
type Position = { x: number; y: number };

const commandNotes = `명령어 커맨드

npm run hello
npm run hello:close

npm run bunny
npm run bunny:close

npm run rain
npm run rain:stop

npm run umbrella
npm run umbrella:close`;

export function NotepadWindow({ onClose, onFocus, isFocused }: NotepadWindowProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 240, y: 130 });
  const [notes, setNotes] = useState(commandNotes);
  const dragOffset = useRef<Position | null>(null);

  return (
    <section
      className={`notepad-window${isMaximized ? " is-maximized" : ""}${isFocused ? " is-focused" : ""}`}
      aria-label="명령어 메모장"
      style={isMaximized ? undefined : { left: position.x, top: position.y }}
      onPointerDownCapture={onFocus}
    >
      <header
        className="notepad-titlebar"
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
        <span className="notepad-title"><i aria-hidden="true" />Untitled - Notepad</span>
        <div className="notepad-controls">
          <button type="button" aria-label="창모드 전환" onPointerDown={(event) => event.stopPropagation()} onClick={() => setIsMaximized((value) => !value)}>{isMaximized ? "▣" : "□"}</button>
          <button type="button" aria-label="닫기" onPointerDown={(event) => event.stopPropagation()} onClick={onClose}>×</button>
        </div>
      </header>
      <nav className="notepad-menu" aria-label="메모장 메뉴"><span>File</span><span>Edit</span><span>Format</span><span>View</span><span>Help</span></nav>
      <textarea aria-label="명령어 메모" value={notes} onChange={(event) => setNotes(event.target.value)} spellCheck="false" />
    </section>
  );
}
