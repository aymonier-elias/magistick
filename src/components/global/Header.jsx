import Link from "next/link";
import { getUtilisateurConnecte } from "@/bdd/auth";
import { deconnexion } from "@/bdd/actions-auth";
import styles from "@/css/global/header.module.css";

// Liens de navigation (href "#" : pages pas encore créées)
const LIENS = [
    { href: "/", libelle: "Accueil" },
    { href: "/catalogue", libelle: "Catalogue" },
    { href: "#", libelle: "A Propos" },
    { href: "#", libelle: "Avis" },
    { href: "#", libelle: "Contact" },
];

export default async function Header() {
    const utilisateur = await getUtilisateurConnecte();

    return (
        <header className={styles.header}>
            <Link href="/">MagiStick</Link>

            <nav className={styles.nav} aria-label="Navigation principale">
                {LIENS.map(({ href, libelle }) => (
                    <Link key={libelle} href={href}>{libelle}</Link>
                ))}
            </nav>

            {utilisateur ? (
                <div>
                    <p>{utilisateur.first_name}</p>
                    <form action={deconnexion}>
                        <button type="submit">Déconnexion</button>
                    </form>
                </div>
            ) : (
                <div>
                    <Link href="/connexion">Connexion</Link>
                    <Link href="/connexion?mode=register">Register</Link>
                </div>
            )}
        </header>
    );
}
