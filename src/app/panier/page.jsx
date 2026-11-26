import { getPanier, enEuros } from "@/bdd/panier";
import { formatPrix } from "@/utils/format";

export const metadata = {
    title: "Panier | Magistick",
};

// Page panier (version de test) : liste des articles et total.
export default async function Panier() {
    const panier = await getPanier();

    if (!panier || panier.items_count === 0) {
        return <p>Votre panier est vide.</p>;
    }

    const unite = panier.totals.currency_minor_unit;

    return (
        <div>
            <p>{panier.items_count} article{panier.items_count > 1 ? "s" : ""}</p>
            <ul>
                {panier.items.map((article) => (
                    <li key={article.key}>
                        {article.name} × {article.quantity} :{" "}
                        {formatPrix(enEuros(article.totals.line_total, unite))}
                    </li>
                ))}
            </ul>
            <p>Total : {formatPrix(enEuros(panier.totals.total_price, unite))}</p>
        </div>
    );
}
