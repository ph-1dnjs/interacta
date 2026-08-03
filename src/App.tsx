import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 3, 3]} intensity={2} />
      <mesh rotation={[0.4, 0.5, 0]}>
        <torusKnotGeometry args={[0.9, 0.28, 160, 24]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.25} metalness={0.45} />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export default function App() {
  return (
    <main>
      <section>
        <p>React · TypeScript · Vite</p>
        <h1>Interacta</h1>
        <span>Three.js 환경이 준비되었습니다.</span>
      </section>
      <Scene />
    </main>
  )
}
