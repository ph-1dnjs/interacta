import type { ReactNode } from "react";
import "./GalleryWindow.css";

type GalleryWindowProps = {
  ariaLabel: string;
  children: ReactNode;
  onClose: () => void;
  title: string;
};

export function GalleryWindow({
  ariaLabel,
  children,
  onClose,
  title,
}: GalleryWindowProps) {
  return (
    <section className="gallery-window" aria-label={ariaLabel}>
      <header className="gallery-titlebar">
        <span>{title}</span>
        <button type="button" onClick={onClose} aria-label={`${ariaLabel} 닫기`}>
          ×
        </button>
      </header>
      <div className="gallery-toolbar" aria-hidden="true">
        <span>파일</span>
        <span>편집</span>
        <span>보기</span>
        <span>즐겨찾기</span>
        <span>도구</span>
        <span>도움말</span>
      </div>
      {children}
    </section>
  );
}
