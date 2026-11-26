"use client";

// Sceptre 3D en arrière-plan de l'accueil : il tourne et se décale pendant le scroll.
// Chargé uniquement côté client (voir DecorAccueil.jsx).

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MODELE = "/object3D/sceptre_aquatique/sceptre_aquatique.glb";

// Animation liée au scroll de toute la page
const SCROLL = {
  trigger: "body",
  start: "top top",
  end: "bottom bottom",
  scrub: 1,
};

// Précharge le modèle dès l'import du fichier
useGLTF.preload(MODELE);

function Modele() {
  const groupe = useRef(null);
  const { scene } = useGLTF(MODELE);

  // useGSAP annule à la fin uniquement les animations et ScrollTriggers créés ici
  useGSAP(() => {
    gsap.to(groupe.current.rotation, { y: Math.PI, ease: "sine", scrollTrigger: SCROLL });
    gsap.to(groupe.current.position, { x: 20, ease: "none", scrollTrigger: SCROLL });
  });

  return <primitive ref={groupe} object={scene} position={[10, -3, -5]} scale={2} />;
}

export default function Sceptre3D() {
  return (
    <div className="decor-accueil" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Modele />
      </Canvas>
    </div>
  );
}
