import { Suspense } from "react";
import Link from "next/link";
import Form from "next/form";
import { getCatalogue, getFiltresDisponibles, DISPONIBILITES } from "@/bdd/produits";
import ProduitCard from "@/components/catalogue/produitCard";

import '@/css/catalogue/catalogue.css';

const PAR_PAGE = 12;
const NOMS_FILTRES = ["recherche", "categorie", "prixMin", "prixMax", "disponibilite"];

// Les formulaires utilisent <Form> de next/form : la soumission met à jour l'URL
// sans recharger la page. Seules les zones filtres et produits sont recalculées.
export default async function Produits({ searchParams }) {
    const params = await searchParams;

    // Filtres lus dans l'URL (?recherche=...&categorie=...&pa_type_magie=12)
    // Les attributs utilisent leur slug WooCommerce (pa_...) comme nom de paramètre.
    const filtres = {};
    for (const [nom, valeurBrute] of Object.entries(params)) {
        if (!NOMS_FILTRES.includes(nom) && !nom.startsWith("pa_")) continue;
        const valeur = typeof valeurBrute === "string" ? valeurBrute.trim() : "";
        if (valeur) filtres[nom] = valeur;
    }
    const page = Math.max(1, Number(params.page) || 1);

    // WooCommerce ne filtre que sur un attribut à la fois : on prend le premier choisi
    const [slugAttribut] = Object.keys(filtres).filter((nom) => nom.startsWith("pa_"));
    const attribut = slugAttribut ? { slug: slugAttribut, terme: filtres[slugAttribut] } : undefined;

    const filtresCatalogue = {
        recherche: filtres.recherche,
        categorie: filtres.categorie,
        prixMin: filtres.prixMin,
        prixMax: filtres.prixMax,
        disponibilite: filtres.disponibilite,
        attribut,
    };

    // Change dès qu'un filtre change : remet les formulaires à jour (ex. après « Réinitialiser »)
    const cleFiltres = JSON.stringify(filtres);

    return (
        <div>
            <div>
                <h1>Le catalogue des baguettes</h1>
            </div>

            <div>
                {/* Barre de recherche : met à jour l'URL (?recherche=...) */}
                <Form action="/catalogue" key={cleFiltres}>
                    {champsCaches(filtres, Object.keys(filtres).filter((nom) => nom !== "recherche"))}
                    <label>Tous les produits
                        <input className="barreRecherche" type="search" name="recherche" defaultValue={filtres.recherche} />
                    </label>
                    <button type="submit">
                        Rechercher
                    </button>
                    {Object.keys(filtres).length > 0 && (
                        <p>
                            {filtres.recherche && <>Recherche : {filtres.recherche} — </>}
                            <Link href="/catalogue">Réinitialiser</Link>
                        </p>
                    )}
                </Form>

                {/* Bloc filtres + produits */}
                <div className="filtres-catalogue">
                    {/* Pas de key : l'ancien formulaire reste affiché pendant le calcul du nouveau */}
                    <Suspense fallback={<div className="filtres"><p>Filtres</p></div>}>
                        <FiltresProduits filtres={filtres} filtresCatalogue={filtresCatalogue} cle={cleFiltres} />
                    </Suspense>

                    {/* key : la zone produits affiche « Chargement » à chaque changement */}
                    <Suspense
                        key={`${cleFiltres}#${page}`}
                        fallback={<div className="zone-resultats"><p>Chargement des produits...</p></div>}
                    >
                        <ResultatsProduits filtres={filtres} filtresCatalogue={filtresCatalogue} page={page} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

// Champs cachés pour qu'un formulaire conserve les valeurs de l'autre
function champsCaches(filtres, noms) {
    return noms.filter((nom) => filtres[nom]).map((nom) => (
        <input key={nom} type="hidden" name={nom} value={filtres[nom]} />
    ));
}

// Menus de filtres ; leurs options dépendent des autres filtres choisis
async function FiltresProduits({ filtres, filtresCatalogue, cle }) {
    const { categories, attributs } = await getFiltresDisponibles(filtresCatalogue);

    return (
        <Form className="filtres" action="/catalogue" key={cle}>
            {champsCaches(filtres, ["recherche"])}
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

            {/* Un menu par attribut WooCommerce (ex. Type de magie) */}
            {attributs.filter((a) => a.termes.length > 0).map((a) => (
                <label key={a.slug}>{a.nom}
                    <select name={a.slug} defaultValue={filtres[a.slug] ?? ""}>
                        <option value="">Tous</option>
                        {a.termes.map((t) => (
                            <option key={t.id} value={t.id}>{t.nom} ({t.nombre})</option>
                        ))}
                    </select>
                </label>
            ))}

            <button type="submit">Appliquer</button>
        </Form>
    );
}

// Cartes produits + pagination
async function ResultatsProduits({ filtres, filtresCatalogue, page }) {
    const { produits, erreur } = await getCatalogue({ page, parPage: PAR_PAGE, ...filtresCatalogue });

    // Lien vers une autre page en gardant la recherche et les filtres
    const lienPage = (n) => ({ pathname: "/catalogue", query: { ...filtres, page: n } });

    return (
        <div className="zone-resultats">
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

            <nav>
                {page > 1 && <Link href={lienPage(page - 1)}>-</Link>}
                <p>{page}</p>
                {produits.length === PAR_PAGE && <Link href={lienPage(page + 1)}>+</Link>}
            </nav>
        </div>
    );
}
