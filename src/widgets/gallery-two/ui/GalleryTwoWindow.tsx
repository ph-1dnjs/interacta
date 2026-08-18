import { useEffect, useRef, useState } from "react";
import { GalleryTitle } from "../../gallery/ui/GalleryTitle";
import { GalleryWindow } from "../../gallery/ui/GalleryWindow";
import "./GalleryTwoWindow.css";

const titles = [
  "초원의 아침", "보랏빛 들판", "푸른 하늘", "붉은 수평선",
  "맑은 초원", "황금빛 들판", "저녁의 초원", "밤의 초원",
];
const panelGap = 40;
const panelHeight = 360;
const getPanelWidth = () => Math.min(620, Math.max(520, window.innerWidth * 0.4));

type GalleryTwoWindowProps = { onClose: () => void };

export function GalleryTwoWindow({ onClose }: GalleryTwoWindowProps) {
  const [panelWidth, setPanelWidth] = useState(getPanelWidth);
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [rotationDirection, setRotationDirection] = useState(1);
  const isDraggingRef = useRef(false);
  const autoDirectionRef = useRef(1);
  const velocityRef = useRef(0);
  const lastPointRef = useRef({ time: 0, x: 0 });
  const momentumFrameRef = useRef<number | null>(null);
  const angleStep = 360 / titles.length;
  const radius = Math.round(
    (panelWidth + panelGap) / 2 / Math.tan(Math.PI / titles.length),
  );

  useEffect(() => {
    let frameId = 0;
    const autoSpin = () => {
      if (!isDraggingRef.current)
        setAngle((current) => current + 0.06 * autoDirectionRef.current);
      frameId = window.requestAnimationFrame(autoSpin);
    };

    frameId = window.requestAnimationFrame(autoSpin);
    return () => {
      window.cancelAnimationFrame(frameId);
      if (momentumFrameRef.current)
        window.cancelAnimationFrame(momentumFrameRef.current);
    };
  }, []);

  useEffect(() => {
    const resizePanels = () => setPanelWidth(getPanelWidth);
    window.addEventListener("resize", resizePanels);
    return () => window.removeEventListener("resize", resizePanels);
  }, []);

  const stopMomentum = () => {
    if (momentumFrameRef.current)
      window.cancelAnimationFrame(momentumFrameRef.current);
    momentumFrameRef.current = null;
  };

  const startMomentum = () => {
    const move = () => {
      if (Math.abs(velocityRef.current) < 0.02) {
        velocityRef.current = 0;
        momentumFrameRef.current = null;
        return;
      }
      setAngle((current) => current + velocityRef.current);
      velocityRef.current *= 0.95;
      momentumFrameRef.current = window.requestAnimationFrame(move);
    };

    momentumFrameRef.current = window.requestAnimationFrame(move);
  };

  const beginDrag = (x: number) => {
    isDraggingRef.current = true;
    stopMomentum();
    velocityRef.current = 0;
    lastPointRef.current = { time: performance.now(), x };
    setIsDragging(true);
  };

  const moveDrag = (x: number) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const delta = x - lastPointRef.current.x;
    const elapsed = Math.max(now - lastPointRef.current.time, 1);
    const rotation = delta * 0.35;

    setAngle((current) => current + rotation);
    velocityRef.current = rotation * (16 / elapsed);
    if (rotation !== 0) {
      const direction = Math.sign(rotation);
      autoDirectionRef.current = direction;
      setRotationDirection(direction);
    }
    lastPointRef.current = { time: now, x };
  };

  const endDrag = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    if (Math.abs(velocityRef.current) > 0.02) startMomentum();
  };

  const normalizedAngle = ((-angle % 360) + 360) % 360;
  const activeIndex = Math.round(normalizedAngle / angleStep) % titles.length;

  return (
    <GalleryWindow ariaLabel="갤러리 2" onClose={onClose} title="갤러리 2 - Interacta">
      <div
        className={`gallery-two-stage${isDragging ? " is-grabbing" : ""}`}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          beginDrag(event.clientX);
        }}
        onPointerMove={(event) => moveDrag(event.clientX)}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <GalleryTitle title={titles[activeIndex]} direction={rotationDirection} />
        <div
          className="gallery-two-cylinder"
          style={{ height: panelHeight, transform: `rotateY(${angle}deg)`, width: panelWidth }}
        >
          {titles.map((title, index) => (
            <div
              className={`gallery-two-panel gallery-two-panel-${(index % 4) + 1}`}
              key={title}
              style={{
                height: panelHeight,
                transform: `rotateY(${index * angleStep}deg) translateZ(${-radius}px)`,
                width: panelWidth,
              }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
            </div>
          ))}
        </div>
        <p className="gallery-two-hint">‹&nbsp; drag / swipe &nbsp;›</p>
        <div className="gallery-two-progress" aria-label={`${activeIndex + 1}번째 패널`}>
          {titles.map((title, index) => (
            <i className={index === activeIndex ? "is-active" : undefined} key={title} />
          ))}
        </div>
      </div>
    </GalleryWindow>
  );
}
