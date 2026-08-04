import { ThreeScene } from '../../../widgets/three-scene'

export function HomePage() {
  return (
    <main>
      <section>
        <p>React · TypeScript · Vite</p>
        <h1>Interacta</h1>
        <span>Three.js 환경이 준비되었습니다.</span>
      </section>
      <ThreeScene />
    </main>
  )
}
