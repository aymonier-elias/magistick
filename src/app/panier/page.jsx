// import { getUtilisateurConnecte } from '@/bdd/auth';
import { getNombreArticles, getPanier } from "@/bdd/panier";

export default async function Panier(){
    const panier = await getNombreArticles();
    const panier2 = await getPanier();
    console.log(panier);

    return(
        <div>
            { panier }
            { panier2 }
        </div>
    );
}