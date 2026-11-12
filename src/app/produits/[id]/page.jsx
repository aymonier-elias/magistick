"use client";

import useProducts from "@/hooks/useProducts";
import { useState } from "react";

import '@/css/produits/produits.css';

export default function Produit() {

    // const { id } = await params;

    // Recherche envoyé
    const [recherche, setRecherche] = useState("");

    const {
        products,
        loading,
        error,
        actualiser,
    } = useProducts({
        page: 0,
        parPage: 6,
        recherche: recherche,
    });

    return (
        <div>
            <h1>Le catalogue des baguettes</h1>
        </div>
    );
}