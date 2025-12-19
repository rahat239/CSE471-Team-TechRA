import React, { useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import PcBuilder from "../../store/PcBuilderStore";

export default function DraggablePart({ id, type, Model, initialPosition, snapThreshold = 0.1 }) {
    const { camera, gl } = useThree();
    const [pos, setPos] = useState(initialPosition);
    const [dragging, setDragging] = useState(false);
    const [snapped, setSnapped] = useState(false);

    const planeRef = useRef();
    const objRef = useRef();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const slots = PcBuilder.getState();
    const slot = type === "gpu" ? slots.gpuSlot
        : type === "fan" ? slots.fanSlots.find(s => s.id === id)
            : type === "ram" ? slots.ramSlots.find(s => s.id === id)
                : null;

    const toggle = type === "gpu" ? PcBuilder.getState().toggleGPU
        : type === "fan" ? () => PcBuilder.getState().toggleFan(id)
            : type === "ram" ? () => PcBuilder.getState().toggleRAM(id)
                : null;

    const handlePointerDown = (e) => {
        e.stopPropagation();
        if (snapped) return;
        setDragging(true);
    };

    const handlePointerMove = (e) => {
        if (!dragging || snapped) return;
        e.stopPropagation();

        const rect = gl.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(planeRef.current);
        if (intersects.length > 0) {
            const point = intersects[0].point;
            setPos([point.x, point.y, point.z]);
        }
    };

    const handlePointerUp = () => {
        if (!dragging) return;
        setDragging(false);

        if (!slot) return;

        const distance = new THREE.Vector3(...pos).distanceTo(new THREE.Vector3(...slot.pos));
        if (distance < snapThreshold) {
            setPos(slot.pos);
            setSnapped(true);
            toggle(); // mark as installed
        }
    };

    return (
        <>
            {/* Invisible plane in front of case */}
            <mesh ref={planeRef} position={[0, 0, 0.3]} visible={false}>
                <planeGeometry args={[3, 3]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            <group
                ref={objRef}
                position={pos}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            >
                <Model />
                <mesh>
                    <boxGeometry args={[0.15, 0.05, 0.35]} />
                    <meshBasicMaterial transparent opacity={0} />
                </mesh>
            </group>
        </>
    );
}