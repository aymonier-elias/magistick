"use client";

import { BoutonPrincipal, Champ } from "@/components/form/Champ";
import { passerCommande } from "@/bdd/actions-panier";
import { useActionState } from "react";

function Messages({ etat }) {
    return (
        <>
            {etat?.erreur ? <p>{etat.erreur}</p> : null}
            {etat?.message ? <p>{etat.message}</p> : null}
        </>
    );
}

export default function FormulaireCommande() {
    const [etatCommande, actionPasserCommande, passageCommandeEnCours] = useActionState(passerCommande, null)


    return (
        <form action={actionPasserCommande}>
            <Messages etat={etatCommande}/>

            <Champ label="E-Mail" name="email" type="email" required />

            <h3>Adresse</h3>
            <Champ label="Nom" name="nom" required />
            <Champ label="Prénom" name="prenom" required />
            <Champ label="Adresse" name="adresse" required />
            <Champ label="Complement" name="complement"/>
            <Champ label="Code Postal" name="codePostal" required />
            <Champ label="Ville" name="ville" required />
            <Champ label="Pays" name="pays" required />
            <Champ label="Téléphone" name="téléphone" required />

            <BoutonPrincipal disabled={passageCommandeEnCours}>
                {passageCommandeEnCours ? "Passage de la commande..." : "Passer commande"}
            </BoutonPrincipal>
        </form>
    );
}