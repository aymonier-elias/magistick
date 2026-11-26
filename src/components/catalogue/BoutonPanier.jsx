"use client";

// Bouton « Ajouter au panier » des cartes du catalogue : ajoute 1 exemplaire,
// sans passer par la fiche produit.

import { useActionState } from 'react';
import { ajouterAuPanier } from '@/bdd/actions-panier';

export default function BoutonPanier({ idProduit, indisponible = false }) {
    // useActionState appelle (etatPrecedent, formData) : on ajoute 1 exemplaire
    const [etat, action, enCours] = useActionState(() => ajouterAuPanier(idProduit, 1), null);

    return (
        <form action={action} className="carte-panier">
            <button type="submit" className="carte-bouton-panier" disabled={indisponible || enCours}>
                {indisponible ? 'Indisponible' : enCours ? 'Ajout...' : 'Ajouter au panier'}
            </button>

            {etat?.erreur ? <p role="alert" className="carte-panier-message">{etat.erreur}</p> : null}
            {etat?.panier ? <p role="status" className="carte-panier-message">Ajouté au panier !</p> : null}
        </form>
    );
}
