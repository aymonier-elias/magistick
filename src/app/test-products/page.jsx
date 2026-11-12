
"use client";

import useProducts from "@/hooks/useProducts";
import { useState } from "react";

import ProduitCard from "@/components/catalogue/produitCard";
export default function Boutique() {
    // Ce que l'utilisateur écrit dans le champ
    const [search, setSearch] = useState("");

    // La recherche réellement envoyée à WooCommerce
    const [recherche, setRecherche] = useState("");

    const {
        products,
        loading,
        error,
        actualiser,
    } = useProducts({
        page:0,
        parPage: 1,
        recherche: recherche,
    });

    // Valider la recherche
    function rechercher(e) {
        e.preventDefault();
        setRecherche(search.trim());
    }

    // Réinitialiser la recherche
    function reinitialiser() {
        setSearch("");
        setRecherche("");
    }

    return (
        <main>
            <h1>Notre boutique</h1>

            {/* Barre de recherche */}
            <form onSubmit={rechercher}>
                <input
                    type="search"
                    placeholder="Rechercher un produit..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <button type="submit">
                    Rechercher
                </button>

                <button type="button" onClick={reinitialiser}>
                    Réinitialiser
                </button>
            </form>

            {/* Chargement */}
            {loading && <p>Chargement des produits...</p>}

            {/* Erreur */}
            {error && (
                <div>
                    <p>Erreur : {error}</p>
                    <button onClick={actualiser}>
                        Réessayer
                    </button>
                </div>
            )}

            {/* Produits */}
            {!loading && !error && (
                <>
                    <p>
                        {products.length} produit(s) trouvé(s)
                    </p>

                    {products.length === 0 ? (
                        <p>Aucun produit disponible.</p>
                    ) : (
                        <div className="produits">
                            {products.map((produit) => (
                                <ProduitCard produit={produit}/>
                            ))}
                        </div>
                    )}
                </>
            )}
        </main>
    );
}
