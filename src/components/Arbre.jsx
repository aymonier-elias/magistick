"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Précharge le modèle dès l'import du fichier — change le chemin selon ton arborescence
useGLTF.preload("/object3D/arbre+sceptre/sceptre_lunaire_metallique.glb");

function Modele({ height }) {
  const groupRef = useRef(null);
  const { scene } = useGLTF("/object3D/Sceptre_Royal_Cyan_Dore/sceptre_royal_cyan_dore.glb");

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
    <div style={{ position: "fixed", inset: 0}}>
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Modele />
      </Canvas>
    </div>
  );
}