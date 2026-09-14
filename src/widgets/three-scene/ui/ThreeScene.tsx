import { Billboard, OrbitControls, Text3D, useGLTF } from '@react-three/drei'
import { DragControls } from '@react-three/drei/web'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
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

function FitTextCamera({ target }: { target: { current: THREE.Group | null } }) {
  const { camera, size } = useThree()

  useLayoutEffect(() => {
    if (!target.current) return

    const perspectiveCamera = camera as THREE.PerspectiveCamera
    const bounds = new THREE.Box3().setFromObject(target.current)
    if (bounds.isEmpty()) return

    const center = bounds.getCenter(new THREE.Vector3())
    const textSize = bounds.getSize(new THREE.Vector3())
    const halfFov = THREE.MathUtils.degToRad(perspectiveCamera.fov) / 2
    const padding = 1.12
    const distanceForHeight = (textSize.y * padding) / (2 * Math.tan(halfFov))
    const distanceForWidth = (textSize.x * padding) / (2 * Math.tan(halfFov) * perspectiveCamera.aspect)
    const distance = Math.max(distanceForHeight, distanceForWidth, 0.1)

    perspectiveCamera.position.set(center.x, center.y, center.z + distance)
    perspectiveCamera.lookAt(center)
    perspectiveCamera.near = Math.max(distance / 100, 0.01)
    perspectiveCamera.far = distance * 100
    perspectiveCamera.updateProjectionMatrix()
  }, [camera, size, target])

  return null
}

function GlassHelloWorld() {
  const textRef = useRef<THREE.Group>(null)

  return (
    <>
      <Billboard ref={textRef} follow>
        <Text3D
          font="/fonts/pacifico-regular.typeface.json"
          size={1.58}
          height={0.32}
          curveSegments={28}
          letterSpacing={0.11}
          bevelEnabled
          bevelThickness={0.09}
          bevelSize={0.065}
          bevelSegments={7}
        >
          hello world
          <meshPhysicalMaterial
            color="#8ed1ff"
            metalness={0.14}
            roughness={0.025}
            transmission={0.68}
            thickness={1.1}
            ior={1.5}
            transparent
            opacity={0.98}
            clearcoat={1}
            clearcoatRoughness={0.02}
            emissive="#58b8ff"
            emissiveIntensity={0.08}
          />
        </Text3D>
      </Billboard>
      <FitTextCamera target={textRef} />
    </>
  )
}

const movementKeys = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])
const groundHeight = -1.65

function BunnyAvatar() {
  const { scene } = useGLTF('/models/bunny-avatar.glb')
  const avatar = useMemo(() => scene.clone(true), [scene])

  useLayoutEffect(() => {
    avatar.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return
      node.castShadow = true
      node.receiveShadow = true
    })
  }, [avatar])

  return <primitive object={avatar} position={[0, -1.5, 0]} scale={3.3} />
}

function BunnyPlayer() {
  const player = useRef<THREE.Group>(null)
  const pressedKeys = useRef(new Set<string>())
  const jumpVelocity = useRef(0)

  useEffect(() => {
    const isTyping = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTyping(event.target)) return

      if (event.code === 'Space') {
        event.preventDefault()
        if (!event.repeat && jumpVelocity.current === 0) jumpVelocity.current = 5.6
        return
      }

      if (!movementKeys.has(event.key)) return
      pressedKeys.current.add(event.key)
      event.preventDefault()
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (!movementKeys.has(event.key)) return
      pressedKeys.current.delete(event.key)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useFrame((_, delta) => {
    if (!player.current) return

    const direction = new THREE.Vector3(
      Number(pressedKeys.current.has('ArrowRight')) - Number(pressedKeys.current.has('ArrowLeft')),
      0,
      Number(pressedKeys.current.has('ArrowDown')) - Number(pressedKeys.current.has('ArrowUp')),
    )
    const isMoving = direction.lengthSq() > 0
    if (isMoving) {
      direction.normalize()
      player.current.position.x = THREE.MathUtils.clamp(player.current.position.x + direction.x * delta * 3.2, -4.2, 4.2)
      player.current.position.z = THREE.MathUtils.clamp(player.current.position.z + direction.z * delta * 3.2, -2.3, 2.3)
      player.current.rotation.y = Math.atan2(direction.x, direction.z)
    }

    if (jumpVelocity.current !== 0 || player.current.position.y > groundHeight) {
      jumpVelocity.current -= 15 * delta
      player.current.position.y += jumpVelocity.current * delta
      if (player.current.position.y <= groundHeight) {
        player.current.position.y = groundHeight
        jumpVelocity.current = 0
      }
      return
    }

    player.current.position.y = groundHeight + (isMoving ? Math.sin(performance.now() * 0.018) * 0.035 : 0)
  })

  return (
    <group ref={player} position={[0, groundHeight, 0]}>
      <BunnyAvatar />
    </group>
  )
}

export function ThreeScene({
  showBunny = false,
  showHelloWorld = false,
}: {
  showBunny?: boolean
  showHelloWorld?: boolean
}) {
  return (
    <Canvas
      className="three-canvas"
      camera={{ position: [0, 0.2, 10.2], fov: 36 }}
      gl={{ alpha: true, preserveDrawingBuffer: true }}
    >
      <ambientLight intensity={1.55} />
      <directionalLight position={[-4, 5, 5]} color="#d9f6ff" intensity={4.8} />
      <pointLight position={[3, -1, 3]} color="#3b9cff" intensity={16} distance={13} />
      <pointLight position={[-3, 2, 2]} color="#ffffff" intensity={8} distance={10} />
      {showBunny && (
        <Suspense fallback={null}>
          <BunnyPlayer />
        </Suspense>
      )}
      {showHelloWorld && (
        <Suspense fallback={null}>
          <GlassHelloWorld />
        </Suspense>
      )}
    </Canvas>
  )
}

export function UmbrellaScene() {
  return (
    <Canvas
      className="three-canvas"
      camera={{ position: [0, 0.2, 10.2], fov: 36 }}
      gl={{ alpha: true, preserveDrawingBuffer: true }}
    >
      <ambientLight intensity={1.6} />
      <directionalLight position={[3, 4, 3]} intensity={2.2} />
      <DraggableUmbrella />
      <OrbitControls makeDefault enablePan={false} enableZoom={false} />
    </Canvas>
  )
}

function HelperDogModel() {
  const dog = useRef<THREE.Group>(null)
  const pupils = useRef<THREE.Group>(null)
  const pointer = useRef(new THREE.Vector2(0, 0))

  useEffect(() => {
    const followPointer = (event: PointerEvent) => {
      pointer.current.set(
        (event.clientX / window.innerWidth - 0.5) * 2,
        -(event.clientY / window.innerHeight - 0.5) * 2,
      )
    }

    window.addEventListener('pointermove', followPointer, { passive: true })
    return () => window.removeEventListener('pointermove', followPointer)
  }, [])

  useFrame((_, delta) => {
    if (!dog.current || !pupils.current) return
    const gazeX = THREE.MathUtils.clamp(pointer.current.x * 0.13, -0.13, 0.13)
    const gazeY = THREE.MathUtils.clamp(pointer.current.y * 0.09, -0.08, 0.08)

    dog.current.rotation.y = THREE.MathUtils.damp(dog.current.rotation.y, -0.42 + pointer.current.x * 0.12, 7, delta)
    pupils.current.position.x = THREE.MathUtils.damp(pupils.current.position.x, gazeX, 12, delta)
    pupils.current.position.y = THREE.MathUtils.damp(pupils.current.position.y, gazeY, 12, delta)
  })

  return (
    <group ref={dog} position={[0, -0.22, 0]} rotation={[0, -0.42, 0]} scale={0.92}>
      <mesh position={[0.05, -0.38, 0]} scale={[0.75, 0.84, 0.48]} castShadow>
        <sphereGeometry args={[1, 32, 24]} />
        <meshStandardMaterial color="#d99527" roughness={0.68} />
      </mesh>
      <mesh position={[0, 0.55, 0.03]} scale={[0.84, 0.76, 0.6]} castShadow>
        <sphereGeometry args={[1, 32, 24]} />
        <meshStandardMaterial color="#e7a634" roughness={0.63} />
      </mesh>
      <mesh position={[-0.7, 0.56, -0.02]} rotation={[0.08, -0.2, 0.34]} scale={[0.27, 0.66, 0.22]} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#b96920" roughness={0.75} />
      </mesh>
      <mesh position={[0.7, 0.56, -0.02]} rotation={[0.08, 0.2, -0.34]} scale={[0.27, 0.66, 0.22]} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#b96920" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.2, 0.58]} scale={[0.47, 0.3, 0.12]}>
        <sphereGeometry args={[1, 28, 18]} />
        <meshStandardMaterial color="#f6ca75" roughness={0.72} />
      </mesh>
      <group ref={pupils}>
        {[-0.29, 0.29].map((x) => (
          <group key={x} position={[x, 0.66, 0.56]}>
            <mesh scale={[0.2, 0.24, 0.09]}>
              <sphereGeometry args={[1, 24, 16]} />
              <meshStandardMaterial color="#fffdf6" roughness={0.25} />
            </mesh>
            <mesh position={[0, 0, 0.075]} scale={[0.095, 0.13, 0.055]}>
              <sphereGeometry args={[1, 20, 14]} />
              <meshStandardMaterial color="#25170f" roughness={0.25} />
            </mesh>
            <mesh position={[-0.026, 0.04, 0.12]} scale={[0.027, 0.036, 0.014]}>
              <sphereGeometry args={[1, 12, 10]} />
              <meshBasicMaterial color="#fff" />
            </mesh>
          </group>
        ))}
      </group>
      <mesh position={[0, 0.25, 0.72]} scale={[0.16, 0.1, 0.08]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#241714" roughness={0.28} />
      </mesh>
      {[-0.47, 0.47].map((x, index) => (
        <group key={x} position={[x, -0.88, index === 0 ? 0.06 : -0.08]}>
          <mesh scale={[0.25, 0.54, 0.28]} castShadow>
            <sphereGeometry args={[1, 24, 16]} />
            <meshStandardMaterial color="#df9a29" roughness={0.68} />
          </mesh>
          <mesh position={[0.05, -0.38, 0.19]} scale={[0.34, 0.16, 0.36]} castShadow>
            <sphereGeometry args={[1, 24, 16]} />
            <meshStandardMaterial color="#e7a634" roughness={0.68} />
          </mesh>
        </group>
      ))}
      <group position={[0.63, -1.02, -0.08]} rotation={[0.22, 0, -0.82]} scale={0.68}>
        <mesh position={[0, 0.2, 0]} scale={[0.16, 0.42, 0.16]} castShadow>
          <sphereGeometry args={[1, 20, 14]} />
          <meshStandardMaterial color="#c87821" roughness={0.7} />
        </mesh>
        <mesh position={[0.05, 0.55, 0]} rotation={[0, 0, 0.28]} scale={[0.14, 0.22, 0.14]} castShadow>
          <sphereGeometry args={[1, 20, 14]} />
          <meshStandardMaterial color="#c87821" roughness={0.7} />
        </mesh>
      </group>
      <mesh position={[-0.48, -1.2, 0.29]} scale={[0.32, 0.2, 0.42]} castShadow>
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color="#e7a634" roughness={0.68} />
      </mesh>
    </group>
  )
}

export function HelperDogScene() {
  return (
    <Canvas className="three-canvas" camera={{ position: [0, 0, 6.6], fov: 33 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={2.2} />
      <directionalLight position={[-3, 4, 5]} intensity={3.2} />
      <pointLight position={[2.5, 1, 3]} color="#d6efff" intensity={3} />
      <HelperDogModel />
    </Canvas>
  )
}

function DraggableUmbrella() {
  return (
    <group position={[3.45, -1.2, 0]} scale={0.52}>
      <DragControls axisLock="z">
        <Umbrella />
      </DragControls>
    </group>
  )
}
