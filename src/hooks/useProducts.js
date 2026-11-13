
"use client";

import { useState, useEffect, useCallback } from "react";

export default function useProducts({
  page = 1,
  parPage = 20,
  recherche = "",
  categorie = "", 
} = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupération des produits
  const recupererProduits = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);

      // Construction de l'URL avec les paramètres
      const params = new URLSearchParams({
        page: String(page),
        parPage: String(parPage),
      });

      if (recherche) params.set("recherche", recherche);
      if (categorie) params.set("categorie", categorie);

      const response = await fetch(
        `/api/produits?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
          signal,
        }
      );

      // Vérifier que le serveur renvoie bien du JSON
      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          `Réponse inattendue du serveur (HTTP ${response.status}).`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Impossible de récupérer les produits."
        );
      }

      if (!Array.isArray(data.products)) {
        throw new Error("Le format des produits reçu est invalide.");
      }

      setProducts(data.products);

    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Erreur récupération produits :", err);
        setError(err.message);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [page, parPage, recherche, categorie]);

  // Récupération automatique au chargement
  useEffect(() => {
    const controller = new AbortController();

    recupererProduits(controller.signal);

    return () => controller.abort();
  }, [recupererProduits]);

  // Fonction pour actualiser manuellement
  const actualiser = useCallback(() => {
    recupererProduits();
  }, [recupererProduits]);

  return {
    products,
    loading,
    error,
    actualiser,
  };
}
