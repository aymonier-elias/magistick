import { Suspense } from "react";
import Link from "next/link";
import Form from "next/form";
import { getCatalogue, getFiltresDisponibles, DISPONIBILITES } from "@/bdd/produits";
import ProduitCard from "@/components/catalogue/produitCard";
import FormulaireFiltres, { CurseurPrix } from "@/components/catalogue/FormulaireFiltres";

import '@/css/catalogue/catalogue.css';

const PAR_PAGE = 12;
const NOMS_FILTRES = ["recherche", "categorie", "prixMin", "prixMax", "disponibilite"];

// Disposition : filtres à gauche, résultats en grille à droite, pagination en bas.
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
        <div className="catalogue">
            <h1>Le catalogue des baguettes</h1>

            <div className="catalogue-corps">
                {/* Colonne de gauche : filtres */}
                <aside className="catalogue-filtres">
                    {/* Pas de key : l'ancien formulaire reste affiché pendant le calcul du nouveau */}
                    <Suspense fallback={<div className="filtres"><p>Filtres</p></div>}>
                        <FiltresProduits filtres={filtres} filtresCatalogue={filtresCatalogue} cle={cleFiltres} />
                    </Suspense>
                </aside>

                {/* Colonne de droite : recherche, nombre de résultats, grille, pagination */}
                <section className="zone-resultats">
                    <Form action="/catalogue" key={cleFiltres} className="catalogue-recherche">
                        {champsCaches(filtres, Object.keys(filtres).filter((nom) => nom !== "recherche"))}
                        <label>
                            <input className="barreRecherche" type="search" name="recherche" defaultValue={filtres.recherche} />
                        </label>
                        <button type="submit">
                            Rechercher
                        </button>
                    </Form>

                    {/* key : la zone produits affiche « Chargement » à chaque changement */}
                    <Suspense
                        key={`${cleFiltres}#${page}`}
                        fallback={<p className="catalogue-compte">Chargement des produits...</p>}
                    >
                        <ResultatsProduits filtres={filtres} filtresCatalogue={filtresCatalogue} page={page} />
                    </Suspense>
                </section>
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

// Un groupe de filtres : titre + liste de choix avec leur nombre de produits.
// Un seul choix par groupe (boutons radio) ; le premier choix (« Toutes ») retire le filtre.
function GroupeFiltre({ titre, nom, choix, valeurChoisie, libelleTous }) {
    if (choix.length === 0) return null;

    return (
        <fieldset className="groupe-filtre">
            <legend>{titre}</legend>
            <ul>
                <li>
                    <label>
                        <input type="radio" name={nom} value="" defaultChecked={!valeurChoisie} />
                        <span className="groupe-filtre-libelle">{libelleTous}</span>
                    </label>
                </li>
                {choix.map((c) => (
                    <li key={c.valeur}>
                        <label>
                            <input
                                type="radio"
                                name={nom}
                                value={c.valeur}
                                defaultChecked={String(c.valeur) === valeurChoisie}
                            />
                            <span className="groupe-filtre-libelle">{c.libelle}</span>
                            {c.nombre !== undefined && <span className="groupe-filtre-nombre">{c.nombre}</span>}
                        </label>
                    </li>
                ))}
            </ul>
        </fieldset>
    );
}

// Colonne de filtres ; les choix proposés dépendent des autres filtres choisis
async function FiltresProduits({ filtres, filtresCatalogue, cle }) {
    const { categories, attributs, prixMaximum } = await getFiltresDisponibles(filtresCatalogue);

    // « Réinitialiser » garde la recherche en cours
    const lienReinitialiser = { pathname: "/catalogue", query: filtres.recherche ? { recherche: filtres.recherche } : {} };

    return (
        <FormulaireFiltres className="filtres" key={cle}>
            {champsCaches(filtres, ["recherche", "prixMin"])}

            <GroupeFiltre
                titre="Puissance"
                nom="categorie"
                libelleTous="Toutes"
                valeurChoisie={filtres.categorie}
                choix={categories.map((c) => ({ valeur: c.id, libelle: c.nom, nombre: c.nombre }))}
            />

            {prixMaximum > 0 && (
                <fieldset className="groupe-filtre">
                    <legend>Prix max</legend>
                    <CurseurPrix
                        nom="prixMax"
                        max={prixMaximum}
                        valeurInitiale={Math.min(Number(filtres.prixMax) || prixMaximum, prixMaximum)}
                    />
                </fieldset>
            )}

            {/* Un groupe par attribut WooCommerce (ex. Type de magie) */}
            {attributs.map((a) => (
                <GroupeFiltre
                    key={a.slug}
                    titre={a.nom}
                    nom={a.slug}
                    libelleTous="Tous"
                    valeurChoisie={filtres[a.slug]}
                    choix={a.termes.map((t) => ({ valeur: t.id, libelle: t.nom, nombre: t.nombre }))}
                />
            ))}

            <GroupeFiltre
                titre="Disponibilité"
                nom="disponibilite"
                libelleTous="Toutes"
                valeurChoisie={filtres.disponibilite}
                choix={Object.entries(DISPONIBILITES).map(([valeur, libelle]) => ({ valeur, libelle }))}
            />

            <Link href={lienReinitialiser} className="bouton-reinitialiser">
                Réinitialiser les filtres
            </Link>
        </FormulaireFiltres>
    );
}

// Nombre de résultats, grille de cartes et pagination
async function ResultatsProduits({ filtres, filtresCatalogue, page }) {
    const { produits, total, totalPages, erreur } = await getCatalogue({ page, parPage: PAR_PAGE, ...filtresCatalogue });

    // Lien vers une autre page en gardant la recherche et les filtres
    const lienPage = (n) => ({ pathname: "/catalogue", query: { ...filtres, page: n } });

    if (erreur) {
        return (
            <div>
                <p>Erreur : {erreur}</p>
                <Link href={lienPage(page)}>Réessayer</Link>
            </div>
        );
    }

    return (
        <>
            <p className="catalogue-compte">
                {total} produit{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}
            </p>

            {produits.length === 0 ? (
                <p>Aucun produit ne correspond.</p>
            ) : (
                <div id="resultatCatalogue">
                    {produits.map((produit) => (
                        <ProduitCard key={produit.id} produit={produit} />
                    ))}
                </div>
            )}

            <Pagination page={page} totalPages={totalPages} lienPage={lienPage} />
        </>
    );
}

// Pages numérotées (avec « … » s'il y en a beaucoup) et flèches précédent / suivant
function Pagination({ page, totalPages, lienPage }) {
    if (totalPages <= 1) return null;

    // 1 … 4 5 [6] 7 8 … 20
    const numeros = [];
    for (let n = 1; n <= totalPages; n++) {
        if (n === 1 || n === totalPages || Math.abs(n - page) <= 2) numeros.push(n);
        else if (numeros.at(-1) !== "…") numeros.push("…");
    }

    return (
        <nav className="pagination" aria-label="Pagination">
            {page > 1 && (
                <Link href={lienPage(page - 1)} aria-label="Page précédente">←</Link>
            )}
            {numeros.map((n, i) =>
                n === "…" ? (
                    <span key={`ellipse-${i}`}>…</span>
                ) : n === page ? (
                    <span key={n} aria-current="page" className="pagination-actuelle">{n}</span>
                ) : (
                    <Link key={n} href={lienPage(n)}>{n}</Link>
                )
            )}
            {page < totalPages && (
                <Link href={lienPage(page + 1)} aria-label="Page suivante">→</Link>
            )}
        </nav>
    );
}
