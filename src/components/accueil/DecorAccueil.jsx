"use client";

// three.js, react-three-fiber et GSAP sont lourds : on les sort du bundle
// principal et on ne les charge que dans le navigateur (pas de rendu serveur
// possible pour un canvas WebGL).
import dynamic from "next/dynamic";

const Sceptre3D = dynamic(() => import("./Sceptre3D"), { ssr: false });

export default function DecorAccueil() {
  return <Sceptre3D />;
}
