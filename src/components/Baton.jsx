"use client";

import { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OrbitControls } from "@react-three/drei";

gsap.registerPlugin(ScrollTrigger);

function Cylinder() {
    const meshRef = useRef(null);

    useEffect(() => {
        if (!meshRef.current) return;

        const rotat = gsap.to(meshRef.current.rotation, {
            z: Math.PI * 1,
            ease: "sine",
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
            },
        });

        const move = gsap.to(meshRef.current.position, {
            y: -3, // ajuste selon la distance de déplacement voulue
            ease: "none",
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
            },
        });

        return () => {
            rotat.kill();
            move.kill();
            ScrollTrigger.getAll().forEach((st) => st.kill());
        };
    }, []);

    return (
        <mesh ref={meshRef} position={[0, 2, 0]}>
            <cylinderGeometry args={[1, 1, 3, 32]} />
            <meshStandardMaterial color="blue" />
        </mesh>
    );
}

export default function Baton() {
    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: -10}}>
            <Canvas camera={{ position: [0, 0, 6] }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <Cylinder />

            </Canvas>
        </div>
    );
}