import Link from "next/link";
import { formatPrix } from "@/utils/format";
import Apercu3D from "./Apercu3D";
import BoutonPanier from "./BoutonPanier";

// Note sur 5 en étoiles pleines / vides (ex. 3,6 -> ★★★★☆)
function Etoiles({ note, nombreAvis }) {
    const pleines = Math.round(Number(note) || 0);
    return (
        <span className="carte-etoiles" title={nombreAvis ? `${note} / 5 (${nombreAvis} avis)` : "Pas encore d'avis"}>
            {"★".repeat(pleines)}{"☆".repeat(5 - pleines)}
        </span>
    );
}

// Carte produit du catalogue :
// badge de puissance, aperçu 3D (ou placeholder), nom, prix, note, boutons.
// connecte : affiche « Ajouter au panier » (réservé aux utilisateurs connectés).
export default function ProduitCard({ produit, connecte = false }) {
    const lien = `/catalogue/${produit.id}`;
    const puissance = produit.categories?.[0]?.name;
    const indisponible = produit.stock_status === "outofstock";

    return (
        <article className="carte-produit">
            {puissance && <span className="carte-badge">{puissance}</span>}

            {/* Présentation : modèle 3D du produit, sinon placeholder */}
            {produit.modele3d ? (
                <Apercu3D url={produit.modele3d} nom={produit.name} />
            ) : (
                <div className="apercu3d apercu3d-vide">
                    <span>Aperçu 3D bientôt disponible</span>
                </div>
            )}

            <h2 className="carte-nom">
                <Link href={lien}>{produit.name}</Link>
            </h2>

            <div className="carte-ligne">
                <span className="carte-prix">
                    {formatPrix(produit.price) ?? "Prix non renseigné"}
                </span>
                <Etoiles note={produit.average_rating} nombreAvis={produit.rating_count} />
            </div>

            {indisponible ? <p className="carte-indisponible">Indisponible</p> : null}

            <Link href={lien} className="carte-bouton">Voir le produit</Link>

            {connecte ? <BoutonPanier idProduit={produit.id} indisponible={indisponible} /> : null}
        </article>
    );
}
