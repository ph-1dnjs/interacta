import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import * as THREE from "three";

export function MatrixScene({ scroller, paused }: { scroller: RefObject<HTMLElement | null>; paused: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const pauseRef = useRef(paused);
  useEffect(() => { pauseRef.current = paused; }, [paused]);

  useEffect(() => {
    const container = host.current;
    const page = scroller.current;
    if (!container || !page) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false }); }
    catch { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.z = 10;
    const atlas = document.createElement("canvas");
    atlas.width = 320;
    atlas.height = 32;
    const context = atlas.getContext("2d")!;
    context.font = "24px monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "white";
    Array.from("0123456789").forEach((char, i) => context.fillText(char, i * 32 + 16, 16));
    const texture = new THREE.CanvasTexture(atlas);
    const columns = 96;
    const rows = 64;
    const count = columns * rows;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const column = Math.floor(i / rows);
      positions.set([column / (columns - 1), (i % rows) / rows, column], i * 3);
      seeds[i] = ((i * 127.1) % 997) / 997;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));
    const material = new THREE.ShaderMaterial({
      uniforms: {
        atlas: { value: texture }, time: { value: 0 }, progress: { value: 0 }, mouse: { value: new THREE.Vector2(99, 99) }, mousePower: { value: 0 },
        aspect: { value: 1 }, height: { value: 600 }, pixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float seed;
        uniform float time, progress, aspect, height, pixelRatio, mousePower;
        uniform vec2 mouse;
        varying float vSeed, vLight;
        void main() {
          vSeed = seed;
          float columnSeed = fract(sin(position.z * 127.1) * 43758.5453);
          float rowSeed = fract(sin(floor(position.y * 64.0) * 311.7) * 43758.5453);
          // Hold each direction, then flow smoothly into the next layout.
          float cycle = mod(time, 28.0);
          float horizontal = smoothstep(5.0, 9.0, cycle) * (1.0 - smoothstep(19.0, 23.0, cycle));
          float fall = fract(position.y - time * (0.025 + columnSeed * 0.045) + columnSeed);
          float slide = fract(position.x + time * (0.035 + rowSeed * 0.045) * mix(-1.0, 1.0, step(0.5, rowSeed)) + rowSeed);
          vec2 verticalFlow = vec2(position.x, fall);
          vec2 horizontalFlow = vec2(slide, position.y);
          vec2 flow = mix(verticalFlow, horizontalFlow, horizontal);
          vec3 rain = vec3((flow.x - 0.5) * 2.12 * aspect, (flow.y - 0.5) * 2.3, seed * 0.2);
          float gather = smoothstep(0.015, 0.19, progress) * (1.0 - smoothstep(0.26, 0.48, progress));
          float clusterX = fract(sin(seed * 812.73) * 43758.5453) * 2.0 - 1.0;
          float clusterY = fract(sin(seed * 217.19) * 24634.6345) * 2.0 - 1.0;
          vec3 cluster = vec3(clusterX * aspect * 0.78, clusterY * 0.78, seed * 0.2);
          cluster.xy += vec2(sin(time * 0.65 + seed * 91.0), cos(time * 0.48 + seed * 137.0)) * (0.08 + seed * 0.12);
          vec3 p = mix(rain, cluster, gather);
          vec2 mouseOffset = p.xy - mouse;
          float mouseDistance = length(mouseOffset);
          float mouseRepel = smoothstep(0.58, 0.0, mouseDistance) * smoothstep(0.015, 0.09, mouseDistance) * mousePower;
          p.xy += normalize(mouseOffset + vec2(0.0001, 0.0)) * mouseRepel * 0.48;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = clamp(height / 64.0 * (0.8 + columnSeed * 0.65), 5.0, 18.0) * pixelRatio;
          float verticalTrail = fract(position.y * 2.0 + columnSeed + time * 0.035);
          float horizontalTrail = fract(position.x * 2.0 + rowSeed - time * 0.045);
          float trail = mix(verticalTrail, horizontalTrail, horizontal);
          vLight = 0.32 + pow(trail, 3.0) * 0.65 + step(0.975, trail) * 0.35;
        }`,
      fragmentShader: `
        uniform sampler2D atlas;
        uniform float time;
        varying float vSeed, vLight;
        void main() {
          float glyph = mod(floor(vSeed * 10.0) + floor(time * (0.4 + vSeed)), 10.0);
          float a = texture2D(atlas, vec2((glyph + gl_PointCoord.x) / 10.0, 1.0 - gl_PointCoord.y)).a;
          vec3 color = mix(vec3(0.0, 0.55, 0.035), vec3(0.12, 1.0, 0.015), smoothstep(0.3, 0.95, vLight));
          gl_FragColor = vec4(color, a * min(vLight, 1.0));
        }`,
      transparent: true, depthWrite: false, blending: THREE.NormalBlending,
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);
    const resize = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      const aspect = width / height;
      camera.left = -aspect;
      camera.right = aspect;
      camera.updateProjectionMatrix();
      material.uniforms.aspect.value = aspect;
      material.uniforms.height.value = height;
    });
    resize.observe(container);
    const mouseTarget = new THREE.Vector2(99, 99);
    let mouseImpulse = 0;
    let hasPointerPosition = false;
    const movePointer = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const aspect = rect.width / rect.height;
      const nextPointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width - 0.5) * aspect * 2,
        (0.5 - (event.clientY - rect.top) / rect.height) * 2,
      );
      if (hasPointerPosition) mouseImpulse = Math.min(0.65, mouseImpulse + mouseTarget.distanceTo(nextPointer) * 2);
      mouseTarget.copy(nextPointer);
      hasPointerPosition = true;
    };
    const clearPointer = () => { hasPointerPosition = false; mouseImpulse = 0; };
    page.addEventListener("pointermove", movePointer);
    page.addEventListener("pointerleave", clearPointer);
    let frame = 0;
    let last = performance.now();
    const render = (now: number) => {
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!pauseRef.current && !document.hidden) {
        material.uniforms.time.value += delta;
        const progress = page.scrollTop / Math.max(1, page.scrollHeight - page.clientHeight);
        material.uniforms.progress.value += (progress - material.uniforms.progress.value) * (1 - Math.exp(-delta * 7));
        material.uniforms.mouse.value.copy(mouseTarget);
        mouseImpulse *= Math.exp(-delta * 9);
        material.uniforms.mousePower.value += (mouseImpulse - material.uniforms.mousePower.value) * (1 - Math.exp(-delta * 28));
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      page.removeEventListener("pointermove", movePointer);
      page.removeEventListener("pointerleave", clearPointer);
      geometry.dispose(); material.dispose(); texture.dispose(); renderer.dispose();
      renderer.domElement.remove();
    };
  }, [scroller]);

  return <div className="matrix-scene" ref={host} aria-hidden="true" />;
}
