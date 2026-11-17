"use client";

import { useState, useActionState } from 'react';
import Link from 'next/link';

import CercleMagique from '@/components/svg/Cercle-magique';
import Input from '@/components/form/input';
import { connexion, inscription } from '@/bdd/actions-auth';

function Messages({ etat }) {
    return (
        <>
            {etat?.erreur && <p className="erreur">{etat.erreur}</p>}
            {etat?.message && <p className="succes">{etat.message}</p>}
        </>
    );
}

export default function Formulaire({ modeInitial }) {
    const [estConnexion, setEstConnexion] = useState(modeInitial !== 'register');

    // Chaque formulaire appelle directement sa Server Action
    const [etatConnexion, actionConnexion, connexionEnCours] = useActionState(connexion, null);
    const [etatInscription, actionInscription, inscriptionEnCours] = useActionState(inscription, null);

    return (
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

                <Link href="/" className="retour">
                    Retour à la boutique
                </Link>

                <div className="boite">

                    {/* Boutons Connexion / Inscription */}
                    <div className="boutons">

                        <span
                            className="onglets"
                            style={estConnexion ? { left: "4px" } : { right: "4px" }}
                        ></span>

                        <button
                            type="button"
                            className={estConnexion ? "connexion actif" : "connexion"}
                            onClick={() => setEstConnexion(true)}
                        >
                            CONNEXION
                        </button>

                        <button
                            type="button"
                            className={estConnexion ? "inscription" : "inscription actif"}
                            onClick={() => setEstConnexion(false)}
                        >
                            INSCRIPTION
                        </button>

                    </div>

                    {estConnexion ? (

                        /* FORMULAIRE CONNEXION */
                        <form className="partieconnexion" action={actionConnexion}>

                            <div className="entete">
                                <h2>Ravis de vous revoir</h2>
                                <p>Connectez-vous pour retrouver vos favoris et vos commandes.</p>
                            </div>

                            <Input label="E-Mail" name="email" type="email" required={true} />
                            <Input label="Mot de passe" name="mdp" type="password" required={true} />

                            <Messages etat={etatConnexion} />

                            <Input
                                type="submit"
                                label={connexionEnCours ? "Connexion..." : "Se connecter"}
                                disabled={connexionEnCours}
                            />

                            <p className="bascule">
                                Pas encore de compte ?
                                <button type="button" className="lien-btn" onClick={() => setEstConnexion(false)}>
                                    Créer un compte
                                </button>
                            </p>

                        </form>

                    ) : (

                        /* FORMULAIRE INSCRIPTION */
                        <form className="partieinscription" action={actionInscription}>

                            <div className="entete">
                                <h2>Rejoignez le cercle</h2>
                                <p>Créez votre compte en moins d&apos;une minute.</p>
                            </div>

                            <div className="grille">
                                <Input label="Prénom" name="prenom" required={true} />
                                <Input label="Nom" name="nom" required={true} />
                            </div>

                            <Input label="E-Mail" name="email" type="email" required={true} />
                            <Input label="Mot de passe" name="mdp" type="password" required={true} />

                            <label className="accepter">
                                <p>
                                    <input type="checkbox" name="cgu" id="cgu" required />
                                    J&apos;accepte les{' '}
                                    <a href="#">conditions générales</a>
                                    {' '}et la{' '}
                                    <a href="#">politique de confidentialité</a>.
                                </p>
                            </label>

                            <Messages etat={etatInscription} />

                            <Input
                                type="submit"
                                label={inscriptionEnCours ? "Création..." : "Créer mon compte"}
                                disabled={inscriptionEnCours}
                            />

                            <p className="bascule">
                                Déjà membre ?
                                <button type="button" className="lien-btn" onClick={() => setEstConnexion(true)}>
                                    Se connecter
                                </button>
                            </p>

                        </form>

                    )}

                </div>
            </div>
        </div>
    );
}
