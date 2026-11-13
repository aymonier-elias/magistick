"use client";

import useProducts from "@/hooks/useProducts";
import { useState } from "react";

import '@/css/produits/produits.css';

import ProduitCard from "@/components/catalogue/produitCard";

export default function Produits() {
    // Recherche utilisateur
    const [search, setSearch] = useState("")

    // Recherche envoyé
    const [recherche, setRecherche] = useState("");

    // Page demandé
    const [page, setPage] = useState(1);

    const {
        products,
        loading,
        error,
        actualiser,
    } = useProducts({
        page: page,
        parPage: 10,
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
        <div>

            <div>
                <h1>Le catalogue des baguettes</h1>
            </div>


            <div>
                <form onSubmit={rechercher}>

                    {/* Barre de recherche */}
                    <label>Tout les produits
                        <input className="barreRecherche" type="search" value={search} onChange={(e) => { setSearch(e.target.value) }} />
                    </label>
                    <button type="submit">
                        Rechercher
                    </button>
                    <button onClick={reinitialiser}>
                        Réinitialiser
                    </button>

                    {/* Affiche la recherche en dessous de la barre de recherche */}
                    <div>{recherche ? (<p>Recherche : {recherche}</p>) : ("")}</div>
                </form>

                {/* Bloc filtres + produits */}
                <div className="filtres-catalogue">

                    {/* Bloc filtres */}
                    <form className="filtres" onSubmit={rechercher}>
                        <p>Filtres</p>
                    </form>

                    {/* Bloc produits */}
                    {/* Chargement */}
                    {loading && <p>Chargement des produits...</p>}

                    <div id="resultatCatalogue">
                        {/* Erreur */}
                        {error && (
                            <div>
                                <p>Erreur : {error}</p>
                                <button onClick={actualiser}>
                                    Réessayer
                                </button>
                            </div>
                        )}

                        {!loading && !error && (
                            <>
                                {products.length === 0 ? (
                                    <p>Aucun produit disponible.</p>
                                ) : products.map((produit) => (
                                    <ProduitCard key={produit.id} produit={produit} />
                                ))}
                            </>
                        )}
                    </div>
                </div>
                <div>
                    <p onClick={() => { setPage(page > 1 ? page - 1 : page) }}>-</p>
                    <p>{page}</p>
                    <p onClick={() => { setPage(page + 1) }}>+</p>
                </div>
            </div>
        </div>
    );
}