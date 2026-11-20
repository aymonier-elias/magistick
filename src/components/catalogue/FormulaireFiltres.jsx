"use client";

// Formulaire de filtres qui s'applique tout seul : chaque changement (case
// cochée, curseur relâché) soumet le formulaire, qui met l'URL à jour sans
// recharger la page (<Form> de next/form).
// Sans JavaScript, le bouton « Appliquer » (dans <noscript>) prend le relais.

import { useEffect, useRef, useState } from "react";
import Form from "next/form";

export default function FormulaireFiltres({ children, className }) {
    const formulaire = useRef(null);

    useEffect(() => {
        const element = formulaire.current;
        // Événement natif « change » : pour un curseur, il ne part qu'au relâchement
        // (contrairement au onChange de React, déclenché à chaque mouvement)
        const soumettre = () => element.requestSubmit();
        element.addEventListener("change", soumettre);
        return () => element.removeEventListener("change", soumettre);
    }, []);

    return (
        <Form ref={formulaire} action="/catalogue" className={className}>
            {children}
            <noscript>
                <button type="submit">Appliquer</button>
            </noscript>
        </Form>
    );
}

// Curseur « Prix max » qui affiche sa valeur pendant qu'on le déplace.
// Tout à droite (= prix le plus haut), il n'envoie rien : pas de filtre de prix.
export function CurseurPrix({ nom, max, valeurInitiale }) {
    const [valeur, setValeur] = useState(valeurInitiale);

    return (
        <div className="curseur-prix">
            <div className="curseur-prix-bornes">
                <span>0 €</span>
                <output>{valeur} €</output>
            </div>
            <input
                type="range"
                name={valeur < max ? nom : undefined}
                min="0"
                max={max}
                step="1"
                value={valeur}
                onChange={(e) => setValeur(Number(e.target.value))}
                aria-label="Prix maximum"
            />
        </div>
    );
}
