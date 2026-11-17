import Link from "next/link";
import { getCatalogue, getCategories, DISPONIBILITES } from "@/bdd/produits";
import ProduitCard from "@/components/catalogue/produitCard";

import '@/css/produits/produits.css';

const PAR_PAGE = 10;
const NOMS_FILTRES = ["recherche", "categorie", "prixMin", "prixMax", "disponibilite"];

export default async function Produits({ searchParams }) {
    const params = await searchParams;

    // Filtres lus dans l'URL (?recherche=...&categorie=...&prixMin=...)
    const filtres = {};
    for (const nom of NOMS_FILTRES) {
        const valeur = typeof params[nom] === "string" ? params[nom].trim() : "";
        if (valeur) filtres[nom] = valeur;
    }
    const page = Math.max(1, Number(params.page) || 1);

    const [{ produits, erreur }, categories] = await Promise.all([
        getCatalogue({ page, parPage: PAR_PAGE, ...filtres }),
        getCategories(),
    ]);

    // Lien vers une autre page en gardant la recherche et les filtres
    const lienPage = (n) => ({ pathname: "/catalogue", query: { ...filtres, page: n } });

    // Champs cachés pour qu'un formulaire conserve les valeurs de l'autre
    const champsCaches = (noms) =>
        noms.filter((nom) => filtres[nom]).map((nom) => (
            <input key={nom} type="hidden" name={nom} value={filtres[nom]} />
        ));

    const filtresActifs = Object.keys(filtres).length > 0;

    return (
        <div>
            <div>
                <h1>Le catalogue des baguettes</h1>
            </div>

            <div>
                {/* Barre de recherche : met à jour l'URL (?recherche=...) */}
                <form action="/catalogue">
                    {champsCaches(["categorie", "prixMin", "prixMax", "disponibilite"])}
                    <label>Tous les produits
                        <input className="barreRecherche" type="search" name="recherche" defaultValue={filtres.recherche} />
                    </label>
                    {filtresActifs && (
                        <p>
                            {filtres.recherche && <>Recherche : {filtres.recherche} — </>}
                            <Link href="/catalogue">Réinitialiser</Link>
                        </p>
                    )}
                </form>

                {/* Bloc filtres + produits */}
                <div className="filtres-catalogue">
                    <form className="filtres" action="/catalogue">
                        {champsCaches(["recherche"])}
                        <p>Filtres</p>

                        <label>Catégorie
                            <select name="categorie" defaultValue={filtres.categorie ?? ""}>
                                <option value="">Toutes</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.nom} ({c.nombre})</option>
                                ))}
                            </select>
                        </label>

                        <fieldset>
                            <legend>Prix (€)</legend>
                            <label>Min
                                <input type="number" name="prixMin" min="0" step="any" defaultValue={filtres.prixMin} />
                            </label>
                            <label>Max
                                <input type="number" name="prixMax" min="0" step="any" defaultValue={filtres.prixMax} />
                            </label>
                        </fieldset>

                        <label>Disponibilité
                            <select name="disponibilite" defaultValue={filtres.disponibilite ?? ""}>
                                <option value="">Toutes</option>
                                {Object.entries(DISPONIBILITES).map(([valeur, libelle]) => (
                                    <option key={valeur} value={valeur}>{libelle}</option>
                                ))}
                            </select>
                        </label>

                        <button type="submit">Appliquer</button>
                    </form>

                    <div id="resultatCatalogue">
                        {erreur ? (
                            <div>
                                <p>Erreur : {erreur}</p>
                                <Link href={lienPage(page)}>Réessayer</Link>
                            </div>
                        ) : produits.length === 0 ? (
                            <p>Aucun produit ne correspond.</p>
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
