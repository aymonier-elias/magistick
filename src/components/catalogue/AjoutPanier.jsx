"use client";

// Sélecteur de quantité (- / +) et bouton « Ajouter au panier » d'une fiche produit.

import { useActionState, useState } from 'react';
import { ajouterAuPanier } from '@/bdd/actions-panier';

const QUANTITE_MAX = 99; // même limite que la Server Action

export default function AjoutPanier({ idProduit, indisponible = false }) {
    const [quantite, setQuantite] = useState(1);

    // useActionState appelle (etatPrecedent, formData) : on transmet l'id
    // du produit et le formulaire à ajouterAuPanier(id, formData).
    const [etat, action, enCours] = useActionState(
        (_etatPrecedent, formData) => ajouterAuPanier(idProduit, formData),
        null
    );

    return (
        <form action={action}>
            <div>
                <button
                    type="button"
                    onClick={() => setQuantite((q) => Math.max(1, q - 1))}
                    disabled={quantite <= 1}
                    aria-label="Diminuer la quantité"
                >
                    -
                </button>
                <output aria-live="polite"> {quantite} </output>
                <button
                    type="button"
                    onClick={() => setQuantite((q) => Math.min(QUANTITE_MAX, q + 1))}
                    disabled={quantite >= QUANTITE_MAX}
                    aria-label="Augmenter la quantité"
                >
                    +
                </button>
            </div>

            {/* Valeur envoyée à la Server Action */}
            <input type="hidden" name="quantite" value={quantite} />

            <button type="submit" disabled={indisponible || enCours}>
                {indisponible ? 'Indisponible' : enCours ? 'Ajout...' : 'Ajouter au panier'}
            </button>

            {etat?.erreur ? <p role="alert">{etat.erreur}</p> : null}
            {etat?.panier ? <p role="status">Ajouté au panier !</p> : null}
        </form>
    );
}
