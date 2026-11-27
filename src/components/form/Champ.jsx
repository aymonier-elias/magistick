"use client";

// Champs de formulaire réutilisables.

import { useState } from "react";
import styles from "@/css/form/champs.module.css";

// Champ texte / email / etc. avec son libellé
export function Champ({ label, name, type = "text", autoComplete = name, required = false }) {
    return (
        <label className={styles.champ}>
            {label} {required && '*'}
            <input type={type} name={name} autoComplete={autoComplete} required={required} />
        </label>
    );
}

// Mot de passe avec bouton Afficher / Masquer.
// autoComplete : "current-password" (connexion) ou "new-password" (inscription).
export function ChampMotDePasse({ label, name, autoComplete = "current-password", required = false }) {
    const [affiche, setAffiche] = useState(false);

    return (
        <label className={styles.champ}>
            {label}
            <span className={styles.motDePasse}>
                <input
                    type={affiche ? "text" : "password"}
                    name={name}
                    autoComplete={autoComplete}
                    required={required}
                />
                <button
                    type="button"
                    className={styles.afficher}
                    onClick={() => setAffiche((actuel) => !actuel)}
                    aria-pressed={affiche}
                >
                    {affiche ? "Masquer" : "Afficher"}
                </button>
            </span>
        </label>
    );
}

// Bouton d'envoi principal
export function BoutonPrincipal({ children, disabled = false }) {
    return (
        <button type="submit" className={styles.boutonPrincipal} disabled={disabled}>
            {children}
        </button>
    );
}
