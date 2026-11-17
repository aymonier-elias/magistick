import Link from "next/link";
import { getUtilisateurConnecte } from "@/bdd/auth";
import { deconnexion } from "@/bdd/actions-auth";

export default async function Header() {
    const user = await getUtilisateurConnecte();

    return (
        <header style={{ display: "flex", justifyContent: "space-around" }}>
            <Link href="/" className="titre">MagiStick</Link>
            <Link href="/">Accueil</Link>
            <Link href="/catalogue">Catalogue</Link>
            <a href="#">A Propos</a>
            <a href="#">Avis</a>
            <a href="#">Contact</a>
            {user ?
                <div className="user">
                    <p>{user.first_name}</p>
                    <form action={deconnexion}>
                        <button type="submit">Déconnexion</button>
                    </form>
                </div> :
                <div className="connexion">
                    <Link href="/connexion">Connexion</Link>
                    <Link href="/connexion?mode=register">Register</Link>
                </div>}
        </header>
    );
}
