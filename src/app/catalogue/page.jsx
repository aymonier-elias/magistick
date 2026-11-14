import Link from "next/link";
import { getCatalogue } from "@/bdd/produits";
import ProduitCard from "@/components/catalogue/produitCard";

import '@/css/produits/produits.css';

const PAR_PAGE = 10;

export default async function Produits({ searchParams }) {
    const params = await searchParams;
    const recherche = typeof params.recherche === "string" ? params.recherche.trim() : "";
    const page = Math.max(1, Number(params.page) || 1);

    const { produits, erreur } = await getCatalogue({ page, parPage: PAR_PAGE, recherche });

    // Lien vers une autre page en gardant la recherche
    const lienPage = (n) => ({ pathname: "/catalogue", query: { ...(recherche && { recherche }), page: n } });

    return (
        <div>
            <div>
                <h1>Le catalogue des baguettes</h1>
            </div>

            <div>
                {/* Barre de recherche : met à jour l'URL (?recherche=...) */}
                <form action="/catalogue">
                    <label>Tous les produits
                        <input className="barreRecherche" type="search" name="recherche" defaultValue={recherche} />
                    </label>
                    {recherche && (
                        <p>Recherche : {recherche} — <Link href="/catalogue">Réinitialiser</Link></p>
                    )}
                </form>

                {/* Bloc filtres + produits */}
                <div className="filtres-catalogue">
                    <div className="filtres">
                        <p>Filtres</p>
                    </div>

                    <div id="resultatCatalogue">
                        {erreur ? (
                            <div>
                                <p>Erreur : {erreur}</p>
                                <Link href={lienPage(page)}>Réessayer</Link>
                            </div>
                        ) : produits.length === 0 ? (
                            <p>Aucun produit disponible.</p>
                        ) : (
                            produits.map((produit) => (
                                <ProduitCard key={produit.id} produit={produit} />
                            ))
                        )}
                    </div>
                </div>

                <nav>
                    {page > 1 && <Link href={lienPage(page - 1)}>-</Link>}
                    <p>{page}</p>
                    {produits.length === PAR_PAGE && <Link href={lienPage(page + 1)}>+</Link>}
                </nav>
            </div>
        </div>
    );
}
