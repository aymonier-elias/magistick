"use client"

import { useState } from 'react';
import { ajouterAuPanier } from '@/bdd/actions-panier';

export default function Quantité({ idProduit }){
    const [quantite, setQuantite] = useState(1);

    return(
        <form action={ajouterAuPanier.bind(null, {idProduit})}>
            <div>
                <span onClick={() => quantite > 1 && setQuantite(quantite - 1)}>-</span>
                <span> { quantite } </span>
                <span onClick={() => setQuantite(quantite + 1)}>+</span>
            </div>
            <input type="number" name="quantite" value="1"/>
            <button type='submit'>Ajouter au panier</button>
        </form>
    );
}