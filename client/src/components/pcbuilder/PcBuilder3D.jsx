import React, { Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bounds, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import PcBuilder from "../../store/PcBuilderStore";

// Model paths
const CASE_PATH = new URL('../../assets/models/pc-case/scene.gltf', import.meta.url).href;
const FAN_PATH  = new URL('../../assets/models/pc-fan/scene.gltf', import.meta.url).href;
const GPU_PATH  = new URL('../../assets/models/pc-gpu/scene.gltf', import.meta.url).href;
const RAM_PATH  = new URL('../../assets/models/pc-ram/scene.gltf', import.meta.url).href;

/* ------------ Generic 3D Model Loader ------------ */
function Model({ path, scale = 1, position = [0, 0, 0] }) {
    const { scene } = useGLTF(path);
    const inst = useMemo(() => scene.clone(true), [scene]);
    return <primitive object={inst} scale={scale} position={position} />;
}

/* ------------ Orbiting & Floating Model ------------ */
function OrbitingModel({ path, scale, radius = 10, height = 4, speed = 0.01, phase = 0, spin = false }) {
    const { scene } = useGLTF(path);
    const inst = useMemo(() => scene.clone(true), [scene]);
    const meshRef = React.useRef();

    useFrame(({ clock }) => {
        if (!meshRef.current) return;
        const t = clock.getElapsedTime();

        // Orbiting position
        const x = radius * Math.cos(speed * t + phase);
        const z = radius * Math.sin(speed * t + phase);
        const y = height + Math.sin(speed * t * 1.5 + phase) * 0.5; // floating
        meshRef.current.position.set(x, y, z);

        // Self rotation
        meshRef.current.rotation.y = t * 0.5; // general spin
        if (spin) meshRef.current.rotation.z += 0.2; // fan blade spin
    });

    return <primitive ref={meshRef} object={inst} scale={scale} />;
}

/* ------------ 3D Scene ------------ */
function Scene() {
    const fanSlots = PcBuilder((s) => s.fanSlots.filter(f => f.occupied));
    const ramSlots = PcBuilder((s) => s.ramSlots.filter(r => r.occupied));
    const gpuSlot  = PcBuilder((s) => s.gpuSlot.occupied);

    return (
        <Bounds fit clip observe margin={4}>
            <group>
                {/* PC Case */}
                <Model path={CASE_PATH} scale={2.5} position={[0, 0, 0]} />

                {/* Fans orbiting and spinning */}
                {fanSlots.map((f, idx) => (
                    <OrbitingModel
                        key={f.id}
                        path={FAN_PATH}
                        scale={2}
                        radius={10 + idx}
                        height={3.5 + idx * 0.2}
                        speed={0.5 + idx * 0.1}
                        phase={idx * 1.5}
                        spin={true} // spinning blades
                    />
                ))}

                {/* RAM orbiting */}
                {ramSlots.map((r, idx) => (
                    <OrbitingModel
                        key={r.id}
                        path={RAM_PATH}
                        scale={2}
                        radius={12 + idx}
                        height={5 + idx * 0.3}
                        speed={0.4 + idx * 0.1}
                        phase={idx * 1.2}
                    />
                ))}

                {/* GPU orbiting */}
                {gpuSlot && (
                    <OrbitingModel
                        path={GPU_PATH}
                        scale={2.5}
                        radius={14}
                        height={4.5}
                        speed={0.3}
                        phase={0}
                    />
                )}
            </group>
        </Bounds>
    );
}

/* ------------ Canvas Wrapper ------------ */
export default function PCBuilder3D() {
    return (
        <Canvas camera={{ position: [30, 20, 30], fov: 50 }}>
            <Suspense fallback={null}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[20, 25, 20]} intensity={1.2} castShadow />
                <directionalLight position={[-20, 10, -15]} intensity={0.6} />
                <Environment preset="city" />
                <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
                <Scene />
            </Suspense>
        </Canvas>
    );
}

// Preload models
useGLTF.preload(CASE_PATH);
useGLTF.preload(FAN_PATH);
useGLTF.preload(GPU_PATH);
useGLTF.preload(RAM_PATH);