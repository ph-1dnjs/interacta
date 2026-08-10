import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

export function ThreeScene() {
  return (
    <Canvas
      className="three-canvas"
      camera={{ position: [0, 0, 4], fov: 50 }}
      gl={{ alpha: true, preserveDrawingBuffer: true }}
    >
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
