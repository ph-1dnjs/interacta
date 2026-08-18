import { useEffect, useRef, useState } from "react";
import { GalleryTitle } from "../../gallery/ui/GalleryTitle";
import { GalleryWindow } from "../../gallery/ui/GalleryWindow";
import "./GalleryOneWindow.css";

const titles = [
  "초원의 아침",
  "보랏빛 들판",
  "푸른 하늘",
  "붉은 수평선",
  "맑은 초원",
  "황금빛 들판",
  "저녁의 초원",
  "밤의 초원",
];

type GalleryOneWindowProps = { onClose: () => void };

export function GalleryOneWindow({ onClose }: GalleryOneWindowProps) {
  const panelWidth = 480;
  const panelHeight = 300;
  const angleStep = 360 / titles.length;
  const radius = Math.round(panelWidth / 2 / Math.tan(Math.PI / titles.length));
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [rotationDirection, setRotationDirection] = useState(1);
  const isDraggingRef = useRef(false);
  const autoDirectionRef = useRef(1);
  const velocityRef = useRef(0);
  const lastPointRef = useRef({ time: 0, x: 0 });
  const momentumFrameRef = useRef<number | null>(null);

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
    <GalleryWindow ariaLabel="갤러리 1" onClose={onClose} title="갤러리 1 - Interacta">
      <div
        className={`gallery-carousel${isDragging ? " is-grabbing" : ""}`}
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
          className="gallery-ring"
          style={{
            height: panelHeight,
            transform: `translate(-50%, -50%) rotateY(${angle}deg)`,
            width: panelWidth,
          }}
        >
          {titles.map((title, index) => (
            <div
              className={`gallery-tile gallery-tile-${(index % 4) + 1}`}
              key={title}
              style={{
                transform: `rotateY(${index * angleStep}deg) translateZ(${radius}px)`,
              }}
            />
          ))}
        </div>
        <p className="gallery-drag-hint">drag / swipe</p>
        <div className="gallery-progress">
          {titles.map((title, index) => (
            <i className={index === activeIndex ? "is-active" : undefined} key={title} />
          ))}
        </div>
      </div>
    </GalleryWindow>
  );
}
