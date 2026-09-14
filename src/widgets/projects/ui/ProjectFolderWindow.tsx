import { useEffect, useMemo, useState } from "react";
import folderIcon from "../../../shared/assets/no-click-folder.png";
import "./ProjectFolderWindow.css";

type Project = {
  id: string;
  name: string;
  type: string;
  period: string;
  overview: string;
  work: string[];
  history: string[];
};

const projects: Project[] = [
  { id: "pharmaresearch", name: "PHARMARESEARCH", type: "B2B MALL PLATFORM", period: "2025.08.04 ~ 진행 중", overview: "파마리서치 B2B 몰 플랫폼 구축 프로젝트입니다. 프로젝트 리드와 프론트엔드 개발을 맡아 진행하고 있습니다.", work: ["프로젝트 리드 및 개발 일정 관리", "B2B 몰 화면 및 사용자 흐름 구현", "프론트엔드 개발 환경과 컴포넌트 구조 설계"], history: ["2025.08 — 프로젝트 킥오프", "진행 중 — 화면 개발 및 기능 고도화"] },
  { id: "interacta", name: "INTERACTA", type: "INTERACTIVE WEB EXPERIENCE", period: "2026", overview: "익숙한 데스크톱을 새로운 놀이터로 바꾸는 인터랙티브 웹 실험입니다.", work: ["Windows XP 기반의 데스크톱 인터페이스 구현", "Three.js 오브젝트와 브라우저 창 인터랙션", "React와 TypeScript로 상태와 창 경험 구성"], history: ["2026 — 인터랙티브 포트폴리오 제작 시작", "현재 — 프로젝트 아카이브 구조 추가"] },
  { id: "neural-02", name: "NEURAL / 02", type: "GENERATIVE INTERFACE · CONCEPT", period: "CONCEPT", overview: "데이터의 연결을 시각적 언어로 표현하는 인터페이스 콘셉트입니다.", work: ["데이터 시각화 인터랙션 탐색", "생성형 인터페이스의 화면 언어 연구"], history: ["아카이브 준비 중"] },
  { id: "system-03", name: "SYSTEM / 03", type: "DIGITAL PRODUCT · CONCEPT", period: "CONCEPT", overview: "복잡한 정보를 단순한 경험으로 만드는 디지털 제품 콘셉트입니다.", work: ["정보 구조와 사용자 흐름 설계", "디자인 시스템 기반의 화면 구성"], history: ["아카이브 준비 중"] },
];

export function ProjectFolderWindow({ initialProjectId, onClose, onFocus, isFocused }: { initialProjectId?: string; onClose: () => void; onFocus: () => void; isFocused: boolean }) {
  const initialProject = useMemo(() => projects.find((project) => project.id === initialProjectId) ?? projects[0], [initialProjectId]);
  const [selectedId, setSelectedId] = useState(initialProject.id);
  useEffect(() => setSelectedId(initialProject.id), [initialProject]);
  const project = projects.find((item) => item.id === selectedId) ?? projects[0];

  return <section className={`project-folder-window${isFocused ? " is-focused" : ""}`} aria-label="프로젝트 폴더" onPointerDownCapture={onFocus}>
    <header><span><img src={folderIcon} alt="" />PROJECTS</span><button type="button" onClick={onClose} aria-label="프로젝트 폴더 닫기">×</button></header>
    <div className="project-folder-path">C:\Users\Una\Desktop\PROJECTS\{project.name}</div>
    <div className="project-folder-content">
      <aside aria-label="프로젝트 목록"><p>PROJECTS</p>{projects.map((item) => <button key={item.id} type="button" className={item.id === selectedId ? "is-selected" : ""} onClick={() => setSelectedId(item.id)}>{item.name}</button>)}</aside>
      <div className="project-folder-main"><p className="project-folder-type">{project.type} · {project.period}</p><h2>{project.name}</h2><section><h3>README / 프로젝트 소개</h3><p>{project.overview}</p></section><section><h3>WORK LOG / 작업 내용</h3><ul>{project.work.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h3>HISTORY / 히스토리</h3><ul>{project.history.map((item) => <li key={item}>{item}</li>)}</ul></section><a className="project-folder-artifact" href="#project-artifact" onClick={(event) => event.preventDefault()}>산출물 링크는 프로젝트별로 등록 예정 <span>↗</span></a></div>
    </div>
  </section>;
}
