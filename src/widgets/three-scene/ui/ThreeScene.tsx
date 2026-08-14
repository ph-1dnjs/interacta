import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'

class CanopyRibCurve extends THREE.Curve<THREE.Vector3> {
  constructor(private readonly angle: number) {
    super()
  }

  getPoint(progress: number, target = new THREE.Vector3()) {
    const canopyRadius = 1.755
    const canopyHeight = 0.936
    const edgeAngle = Math.asin(1.72 / canopyRadius)
    const theta = progress * edgeAngle
    const radius = canopyRadius * Math.sin(theta)

    return target.set(
      Math.cos(this.angle) * radius,
      0.86 + canopyHeight * Math.cos(theta),
      Math.sin(this.angle) * radius,
    )
  }
}

function UmbrellaRib({ angle }: { angle: number }) {
  const geometry = useMemo(() => {
    const curve = new CanopyRibCurve(angle)

    return new THREE.TubeGeometry(curve, 48, 0.012, 6, false)
  }, [angle])

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color="#34363c" />
    </mesh>
  )
}

function UmbrellaSupport({ angle }: { angle: number }) {
  const { length, position, quaternion } = useMemo(() => {
    const start = new THREE.Vector3(0, 1.2, 0)
    const end = new THREE.Vector3(Math.cos(angle) * 1.52, 1.33, Math.sin(angle) * 1.52)
    const direction = end.clone().sub(start)

    return {
      length: direction.length(),
      position: start.add(end).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize(),
      ),
    }
  }, [angle])

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[0.009, 0.009, length, 6]} />
      <meshBasicMaterial color="#4b4d52" />
    </mesh>
  )
}

function UmbrellaHandle() {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -1.55, 0),
      new THREE.Vector3(0, -2.12, 0),
      new THREE.Vector3(0.05, -2.3, 0),
      new THREE.Vector3(0.25, -2.25, 0),
      new THREE.Vector3(0.26, -1.98, 0),
    ])

    return new THREE.TubeGeometry(curve, 32, 0.035, 10, false)
  }, [])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#27292e" metalness={0.45} roughness={0.28} />
    </mesh>
  )
}

function Umbrella() {
  const ribs = Array.from({ length: 8 }, (_, index) => (index / 8) * Math.PI * 2)

  return (
    <group rotation={[0, -0.32, -0.08]} scale={[1.2, 1.1, 1.2]}>
      <mesh position={[0, 0.86, 0]} scale={[1.35, 0.72, 1.35]} renderOrder={0}>
        <sphereGeometry args={[1.3, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#f5f7ff"
          transparent
          opacity={0.18}
          roughness={0.15}
          metalness={0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 3.35, 12]} />
        <meshStandardMaterial color="#34363c" metalness={0.78} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.74, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.36, 12]} />
        <meshStandardMaterial color="#34363c" metalness={0.78} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.22, 12]} />
        <meshStandardMaterial color="#27292e" metalness={0.72} roughness={0.2} />
      </mesh>
      {ribs.map((angle) => (
        <UmbrellaRib key={`rib-${angle}`} angle={angle} />
      ))}
      {ribs.map((angle) => (
        <UmbrellaSupport key={`support-${angle}`} angle={angle} />
      ))}
      <UmbrellaHandle />
    </group>
  )
}

export function ThreeScene() {
  return (
    <Canvas
      className="three-canvas"
      camera={{ position: [3.1, 1.1, 5.2], fov: 43 }}
      gl={{ alpha: true, preserveDrawingBuffer: true }}
    >
      <ambientLight intensity={1.6} />
      <directionalLight position={[3, 4, 3]} intensity={2.2} />
      <Umbrella />
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}
