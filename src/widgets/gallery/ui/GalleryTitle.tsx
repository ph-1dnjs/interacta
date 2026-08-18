import { useEffect, useState } from "react";

type GalleryTitleProps = {
  direction: number;
  title: string;
};

export function GalleryTitle({ direction, title }: GalleryTitleProps) {
  const [visibleTitle, setVisibleTitle] = useState(title);
  const [previousTitle, setPreviousTitle] = useState<{
    direction: number;
    text: string;
  } | null>(null);

  useEffect(() => {
    if (title === visibleTitle) return;
    setPreviousTitle({ text: visibleTitle, direction });
    setVisibleTitle(title);
  }, [title, direction, visibleTitle]);

  const directionClass =
    direction > 0 ? "is-clockwise" : "is-counterclockwise";

  return (
    <p className="gallery-focused-title" aria-live="polite">
      {previousTitle && (
        <span
          className={`gallery-title-exit ${previousTitle.direction > 0 ? "is-clockwise" : "is-counterclockwise"}`}
          onAnimationEnd={() => setPreviousTitle(null)}
        >
          {previousTitle.text}
        </span>
      )}
      <span className={`gallery-title-enter ${directionClass}`} key={title}>
        {visibleTitle}
      </span>
    </p>
  );
}
