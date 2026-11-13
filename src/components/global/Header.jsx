"use client";

import useAuth from "@/hooks/useAuth";

export default function Header() {
    const {
        user,
        loading,
        isAuthenticated,
        deconnecter,
    } = useAuth();

    return (
        <header style={{ display: "flex", justifyContent: "space-around" }}>
            <a href="/" className="titre">MagiStick</a>
            <a href="/">Accueil</a>
            <a href="/catalogue">Catalogue</a>
            <a href="#">A Propos</a>
            <a href="#">Avis</a>
            <a href="#">Contact</a>
            {isAuthenticated ?
                <div className="user">
                    <p>{user.first_name}</p>
                    <button onClick={deconnecter}>Déconexion</button>
                </div> :
                <div className="connexion">
                    <a href="/connexion">Connexion</a>
                    <a href="/connexion?mode=register">Register</a>
                </div>}
        </header>
    );
}