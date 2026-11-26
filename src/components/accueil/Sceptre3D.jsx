"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MODELE = "/object3D/sceptre_aquatique/sceptre_aquatique.glb";

// Précharge le modèle dès l'import du fichier
useGLTF.preload(MODELE);

function Modele({ height }) {
  const groupRef = useRef(null);
  const { scene } = useGLTF(MODELE);

  useEffect(() => {
    if (!groupRef.current) return;

    const rotat = gsap.to(groupRef.current.rotation, {
      y: Math.PI * 1,
      ease: "sine",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    const move = gsap.to(groupRef.current.position, {
      x: 20,
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
    <primitive
      ref={groupRef}
      object={scene}
      position={[10, -3, -5]}
      scale={[2, 2, 2]}
    />
  );
}

export default function Baton() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: -1}}>
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Modele />
      </Canvas>
    </div>
  );
}