import Link from "next/link";
import Apercu3D from "./Apercu3D";

// Texte brut à partir du HTML renvoyé par WooCommerce (balises retirées, entités décodées)
const ENTITES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
function texteBrut(html) {
    return html
        .replace(/<[^>]*>/g, "")
        .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code) =>
            String.fromCodePoint(code[0].toLowerCase() === "x" ? parseInt(code.slice(1), 16) : Number(code)))
        .replace(/&([a-z]+);/gi, (entite, nom) => ENTITES[nom.toLowerCase()] ?? entite)
        .trim();
}

export default function ProduitCard({ produit }) {
    return (
        <article className="produit" >
            {/* Présentation : modèle 3D du produit, sinon placeholder */}
            {produit.modele3d ? (
                <Apercu3D url={produit.modele3d} nom={produit.name} />
            ) : (
                <div className="apercu3d apercu3d-vide">
                    <span>Aperçu 3D bientôt disponible</span>
                </div>
            )}
            <h2><Link href={`/catalogue/${produit.id}`}>{produit.name}</Link></h2>
            <p>
                {produit.short_description
                    ? texteBrut(produit.short_description)
                    : "Aucune description disponible."}
            </p>
            <p>
                {produit.price
                    ? `${produit.price} €`
                    : "Prix non renseigné"}
            </p>
            <p>
                Catégorie : {produit.categories?.map((categorie) => categorie.name).join(", ")}
            </p>
            {/* Attributs visibles, ex. « Type de magie : Céleste » */}
            {produit.attributes
                ?.filter((attribut) => attribut.visible && attribut.options?.length > 0)
                .map((attribut) => (
                    <p key={attribut.id || attribut.name}>
                        {attribut.name} : {attribut.options.join(", ")}
                    </p>
                ))}
            <p>
                Disponibilité :{" "}
                {produit.stock_status === "instock"
                    ? "En stock"
                    : produit.stock_status === "outofstock"
                        ? "Indisponible"
                        : "En attente"}
            </p>
        </article >
    );
}