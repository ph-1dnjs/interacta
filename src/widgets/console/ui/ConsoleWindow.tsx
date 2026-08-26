import { useRef, useState } from "react";
import "./ConsoleWindow.css";

type ConsoleWindowProps = {
  onClose: () => void;
  onOpenHello: () => void;
  onCloseHello: () => void;
  onStartRain: () => void;
  onStopRain: () => void;
  onOpenUmbrella: () => void;
  onCloseUmbrella: () => void;
  onFocus: () => void;
  isFocused: boolean;
};

type Position = { x: number; y: number };

const initialLines = [
  "Microsoft Windows XP [Version 5.1.2600]",
  "(C) Copyright 1985-2001 Microsoft Corp.",
  "",
];

const availableCommands = [
  ["npm run hello", "Display the Hello World message."],
  ["npm run hello:close", "Hide the Hello World message."],
  ["npm run rain", "Start the rain effect."],
  ["npm run rain:stop", "Stop the rain effect."],
  ["npm run umbrella", "Show the umbrella scene."],
  ["npm run umbrella:close", "Hide the umbrella scene."],
];

export function ConsoleWindow({
  onClose,
  onOpenHello,
  onCloseHello,
  onStartRain,
  onStopRain,
  onOpenUmbrella,
  onCloseUmbrella,
  onFocus,
  isFocused,
}: ConsoleWindowProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 160, y: 110 });
  const [lines, setLines] = useState(initialLines);
  const [command, setCommand] = useState("");
  const dragOffset = useRef<Position | null>(null);

  const submitCommand = () => {
    const enteredCommand = command.trim();
    if (!enteredCommand) return;

    const normalizedCommand = enteredCommand.toLowerCase();
    if (normalizedCommand === "cls") {
      setLines([]);
      setCommand("");
      return;
    }

    if (normalizedCommand === "help") {
      setLines((current) => [
        ...current,
        `C:\\Documents and Settings\\Administrator>${enteredCommand}`,
        "Available commands:",
        ...availableCommands.map(
          ([name, description]) => `${name.padEnd(24)}${description}`,
        ),
        "",
      ]);
      setCommand("");
      return;
    }

    const commands: Record<string, () => void> = {
      "npm run hello": onOpenHello,
      "npm run hello:close": onCloseHello,
      "npm run rain": onStartRain,
      "npm run rain:stop": onStopRain,
      "npm run umbrella": onOpenUmbrella,
      "npm run umbrella:close": onCloseUmbrella,
    };

    if (commands[normalizedCommand]) {
      commands[normalizedCommand]();
      setLines((current) => [
        ...current,
        `C:\\Documents and Settings\\Administrator>${enteredCommand}`,
        "",
      ]);
      setCommand("");
      return;
    }

    const response = [
      "'" +
        enteredCommand +
        "' is not recognized as an internal or external command.",
    ];
    setLines((current) => [
      ...current,
      `C:\\Documents and Settings\\Administrator>${enteredCommand}`,
      ...response,
      "",
    ]);
    setCommand("");
  };

  return (
    <section
      className={`console-window${isMaximized ? " is-maximized" : ""}${isFocused ? " is-focused" : ""}`}
      aria-label="명령 프롬프트"
      style={isMaximized ? undefined : { left: position.x, top: position.y }}
      onPointerDownCapture={onFocus}
    >
      <header
        className="console-titlebar"
        onPointerDown={(event) => {
          if (isMaximized || event.button !== 0) return;
          dragOffset.current = {
            x: event.clientX - position.x,
            y: event.clientY - position.y,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragOffset.current) return;
          setPosition({
            x: Math.max(0, event.clientX - dragOffset.current.x),
            y: Math.max(0, event.clientY - dragOffset.current.y),
          });
        }}
        onPointerUp={() => {
          dragOffset.current = null;
        }}
        onPointerCancel={() => {
          dragOffset.current = null;
        }}
      >
        <span className="console-title">
          <i aria-hidden="true">C:\\</i> Command Prompt
        </span>
        <div className="console-controls">
          <button
            type="button"
            aria-label="창모드 전환"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => setIsMaximized((value) => !value)}
          >
            {isMaximized ? "▣" : "□"}
          </button>
          <button
            type="button"
            aria-label="닫기"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </header>
      <div
        className="console-body"
        onPointerDown={(event) => event.stopPropagation()}
      >
        {lines.map((line, index) => (
          <div key={`${line}-${index}`}>{line || " "}</div>
        ))}
        <form
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            submitCommand();
          }}
        >
          <label htmlFor="console-input">
            C:\\Documents and Settings\\Administrator&gt;
          </label>
          <input
            id="console-input"
            autoComplete="off"
            autoFocus
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            spellCheck="false"
          />
        </form>
      </div>
    </section>
  );
}
