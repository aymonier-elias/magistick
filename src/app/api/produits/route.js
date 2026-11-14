
import { NextResponse } from "next/server";
import { listerProduits } from "@/lib/woocommerce-crud";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const produits = await listerProduits({
      page: Math.max(1, Number(searchParams.get("page")) || 1),
      parPage: Math.min(100, Math.max(1, Number(searchParams.get("parPage")) || 20)),
      recherche: searchParams.get("recherche") || undefined,
      categorie: searchParams.get("categorie") || undefined,
      // Catalogue public : uniquement les produits publiés
      statut: "publish",
    });

    return NextResponse.json({
      products: produits,
    });

  } catch (error) {
    console.error("Erreur API produits :", error);

    return NextResponse.json(
      {
        message: error.message || "Impossible de récupérer les produits.",
      },
      {
        status: error.status || 500,
      }
    );
  }
}
