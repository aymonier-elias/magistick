
import { NextResponse } from "next/server";
import { listerProduits } from "@/lib/woocommerce-crud";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const produits = await listerProduits({
      page: Number(searchParams.get("page")) || 1,
      parPage: Number(searchParams.get("parPage")) || 20,
      recherche: searchParams.get("recherche") || undefined,
      categorie: searchParams.get("categorie") || undefined,
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
