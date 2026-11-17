"use client";

// Aperçu 3D d'un produit dans une carte du catalogue.
//
// Chaque carte a son propre <Canvas>, qui défile avec la carte (pas de décalage
// pendant le scroll, contrairement à un canvas fixe partagé). Optimisations :
// - Le fichier .glb est préchargé dès le HTML (<link rel="preload">), en même
//   temps que le reste de la page, avant même que React démarre.
// - Le canvas n'est créé que quand la carte approche de l'écran.
// - Le rendu est mis en pause dès que la carte sort de l'écran.
// - Le modèle n'est téléchargé et décodé qu'une fois (cache de useGLTF),
//   même s'il apparaît dans plusieurs cartes.

import { Suspense, useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { Clone, Stage, useGLTF } from "@react-three/drei";

function Modele({ url }) {
    const { scene } = useGLTF(url);
    const groupe = useRef(null);

    // Rotation lente sur lui-même
    useFrame((_, delta) => {
        if (groupe.current) groupe.current.rotation.y += delta * 0.6;
    });

    // Clone : la même scène ne peut pas être affichée dans deux canvas à la fois
    return (
        <group ref={groupe}>
            <Clone object={scene} />
        </group>
    );
}

export default function Apercu3D({ url, nom }) {
    // Même mode que le chargeur de three.js (fetch same-origin), pour que le
    // navigateur réutilise le fichier préchargé au lieu de le retélécharger
    preload(url, { as: "fetch", crossOrigin: "anonymous" });

    const conteneur = useRef(null);
    const [dejaVu, setDejaVu] = useState(false);   // le canvas a été créé
    const [visible, setVisible] = useState(false); // la carte est (presque) à l'écran

    useEffect(() => {
        const observateur = new IntersectionObserver(
            ([entree]) => {
                setVisible(entree.isIntersecting);
                if (entree.isIntersecting) setDejaVu(true);
            },
            { rootMargin: "300px 0px" } // démarre un peu avant d'arriver à l'écran
        );
        observateur.observe(conteneur.current);
        return () => observateur.disconnect();
    }, []);

    return (
        <div ref={conteneur} className="apercu3d" role="img" aria-label={`Modèle 3D : ${nom}`}>
            {dejaVu && (
                <Canvas
                    frameloop={visible ? "always" : "never"}
                    dpr={[1, 1.5]}
                    camera={{ fov: 40, position: [0, 0, 4] }}
                    gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                >
                    <Suspense fallback={null}>
                        <Stage environment={null} intensity={1} adjustCamera={1.2} shadows={false}>
                            <Modele url={url} />
                        </Stage>
                        <ambientLight intensity={0.6} />
                        <directionalLight position={[5, 5, 5]} intensity={1.5} />
                    </Suspense>
                </Canvas>
            )}
        </div>
    );
}
