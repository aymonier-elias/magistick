import Link from "next/link";
import Apercu3D from "./Apercu3D";

const formatPrix = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

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
// badge de puissance, aperçu 3D (ou placeholder), nom, prix, note, bouton.
export default function ProduitCard({ produit }) {
    const lien = `/catalogue/${produit.id}`;
    const puissance = produit.categories?.[0]?.name;

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
                    {produit.price ? formatPrix.format(Number(produit.price)) : "Prix non renseigné"}
                </span>
                <Etoiles note={produit.average_rating} nombreAvis={produit.rating_count} />
            </div>

            {produit.stock_status === "outofstock" && <p className="carte-indisponible">Indisponible</p>}

            <Link href={lien} className="carte-bouton">Voir le produit</Link>
        </article>
    );
}
