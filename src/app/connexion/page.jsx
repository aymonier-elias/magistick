
"use client";

import '../../css/connexion/connexion.css';

import CercleMagique from '../../components/svg/Cercle-magique';
import Input from '../../components/form/input';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Connexion() {
    const [connexion, setConnexion] = useState(true);
    const [erreur, setErreur] = useState('');
    const [message, setMessage] = useState('');
    const [chargement, setChargement] = useState(false);
    const router = useRouter();


    async function soumettre(e) {
        e.preventDefault();

        setErreur('');
        setMessage('');
        setChargement(true);

        const formData = new FormData(e.currentTarget);

        // Données communes
        const email = formData.get('email');
        const mdp = formData.get('mdp');

        // Données selon le formulaire
        const payload = connexion
            ? { email, mdp }
            : {
                prenom: formData.get('prenom'),
                nom: formData.get('nom'),
                email,
                mdp,
            };

        // Choix de la route API
        const endpoint = connexion
            ? '/api/auth/login'
            : '/api/auth/register';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Une erreur est survenue.');
            }

            setMessage(data.message);
            if (connexion) {
                router.push('/');
            }
        } catch (error) {
            setErreur(error.message);
        } finally {
            setChargement(false);
        }
    }

    return (
        <>
            <div className="conteneur">

                <div className="gauche">
                    <div className="cercle">
                        <CercleMagique />
                    </div>

                    <div className="texte">
                        <h1>
                            Votre sceptre <span>vous attend.</span>
                        </h1>
                    </div>
                </div>

                <div className="droite">

                    <a href="/" className="retour">
                        Retour à la boutique
                    </a>

                    <div className="boite">

                        {/* Boutons Connexion / Inscription */}
                        <div className="boutons">

                            <span
                                className="onglets"
                                style={
                                    connexion
                                        ? { left: "4px" }
                                        : { right: "4px" }
                                }
                            ></span>

                            <button
                                type="button"
                                className={connexion ? "connexion actif" : "connexion"}
                                onClick={() => {
                                    setConnexion(true);
                                    setErreur('');
                                    setMessage('');
                                }}
                            >
                                CONNEXION
                            </button>

                            <button
                                type="button"
                                className={connexion ? "inscription" : "inscription actif"}
                                onClick={() => {
                                    setConnexion(false);
                                    setErreur('');
                                    setMessage('');
                                }}
                            >
                                INSCRIPTION
                            </button>

                        </div>

                        {connexion ? (

                            /* FORMULAIRE CONNEXION */
                            <form
                                className="partieconnexion"
                                onSubmit={soumettre}
                            >

                                <div className="entete">
                                    <h2>Ravis de vous revoir</h2>

                                    <p>
                                        Connectez-vous pour retrouver vos favoris et vos commandes.
                                    </p>
                                </div>

                                <Input
                                    label="E-Mail"
                                    name="email"
                                    type="email"
                                    required={true}
                                />

                                <Input
                                    label="Mot de passe"
                                    name="mdp"
                                    type="password"
                                    required={true}
                                />

                                {erreur && (
                                    <p className="erreur">
                                        {erreur}
                                    </p>
                                )}

                                {message && (
                                    <p className="succes">
                                        {message}
                                    </p>
                                )}

                                <Input
                                    type="submit"
                                    label={chargement ? "Connexion..." : "Se connecter"}
                                />

                                <p className="bascule">
                                    Pas encore de compte ?

                                    <button
                                        type="button"
                                        className="lien-btn"
                                        onClick={() => {
                                            setConnexion(false);
                                            setErreur('');
                                            setMessage('');
                                        }}
                                    >
                                        Créer un compte
                                    </button>
                                </p>

                            </form>

                        ) : (

                            /* FORMULAIRE INSCRIPTION */
                            <form
                                className="partieinscription"
                                onSubmit={soumettre}
                            >

                                <div className="entete">
                                    <h2>Rejoignez le cercle</h2>

                                    <p>
                                        Créez votre compte en moins d'une minute.
                                    </p>
                                </div>

                                <div className="grille">

                                    <Input
                                        label="Prénom"
                                        name="prenom"
                                        required={true}
                                    />

                                    <Input
                                        label="Nom"
                                        name="nom"
                                        required={true}
                                    />

                                </div>

                                <Input
                                    label="E-Mail"
                                    name="email"
                                    type="email"
                                    required={true}
                                />

                                <Input
                                    label="Mot de passe"
                                    name="mdp"
                                    type="password"
                                    required={true}
                                />

                                <label className="accepter">
                                    <p>
                                        <input
                                            type="checkbox"
                                            name="cgu"
                                            id="cgu"
                                            required
                                        />

                                        J'accepte les{' '}
                                        <a href="#">conditions générales</a>
                                        {' '}et la{' '}
                                        <a href="#">politique de confidentialité</a>.
                                    </p>
                                </label>

                                {erreur && (
                                    <p className="erreur">
                                        {erreur}
                                    </p>
                                )}

                                {message && (
                                    <p className="succes">
                                        {message}
                                    </p>
                                )}

                                <Input
                                    type="submit"
                                    label={chargement ? "Création..." : "Créer mon compte"}
                                />

                                <p className="bascule">
                                    Déjà membre ?

                                    <button
                                        type="button"
                                        className="lien-btn"
                                        onClick={() => {
                                            setConnexion(true);
                                            setErreur('');
                                            setMessage('');
                                        }}
                                    >
                                        Se connecter
                                    </button>
                                </p>

                            </form>

                        )}

                    </div>
                </div>
            </div>
        </>
    );
}
