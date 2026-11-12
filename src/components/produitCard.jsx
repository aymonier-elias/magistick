export default function ProduitCard({ produit }) {
    return (
        <article key={produit.id} className="produit" >
            {
                produit.images?.length > 0 ? (
                    <img
                        src={produit.images[0].src}
                        alt={produit.images[0].alt || produit.name}
                        width="250"
                    />
                ) : (
                    <p>Aucune image disponible</p>
                )
            }
            <h2>{produit.name}</h2 >
            <p>
                {produit.short_description
                    ? produit.short_description.replace(/<[^>]*>/g, "")
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