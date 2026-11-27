"use client";

// Colonne de droite de /connexion : onglets et formulaires connexion / inscription.

import { useState, useActionState } from 'react';
import Link from 'next/link';

import { Champ, ChampMotDePasse, BoutonPrincipal } from '@/components/form/Champ';
import { connexion, inscription } from '@/bdd/actions-auth';
import styles from '@/css/connexion/connexion.module.css';

function Messages({ etat }) {
    return (
        <>
            {etat?.erreur ? <p className={styles.erreur}>{etat.erreur}</p> : null}
            {etat?.message ? <p className={styles.succes}>{etat.message}</p> : null}
        </>
    );
}

export default function Formulaire({ modeInitial }) {
    const [isConnexion, setIsConnexion] = useState(modeInitial !== 'register');

    // Chaque formulaire appelle directement sa Server Action
    const [etatConnexion, actionConnexion, connexionEnCours] = useActionState(connexion, null);
    const [etatInscription, actionInscription, inscriptionEnCours] = useActionState(inscription, null);

    const classeOnglet = (actif) => (actif ? `${styles.onglet} ${styles.actif}` : styles.onglet);

    return (
        <div className={styles.droite}>

            <Link href="/" className={styles.retour}>
                Retour à la boutique
            </Link>

            <div className={styles.boite}>

                {/* Onglets Connexion / Inscription */}
                <div className={styles.boutons}>
                    <span className={isConnexion ? styles.pastille : `${styles.pastille} ${styles.pastilleDroite}`} />

                    <button type="button" className={classeOnglet(isConnexion)} onClick={() => setIsConnexion(true)}>
                        CONNEXION
                    </button>

                    <button type="button" className={classeOnglet(!isConnexion)} onClick={() => setIsConnexion(false)}>
                        INSCRIPTION
                    </button>
                </div>

                {isConnexion ? (
                    <form className={styles.formConnexion} action={actionConnexion}>

                        <div className={styles.entete}>
                            <h2>Ravis de vous revoir</h2>
                            <p>Connectez-vous pour retrouver vos favoris et vos commandes.</p>
                        </div>

                        <Champ label="E-Mail" name="email" type="email" required />
                        <ChampMotDePasse label="Mot de passe" name="mdp" autoComplete="current-password" required />

                        <div className={styles.mdpOublie}>
                            <a href="#">Mot de passe oublié ?</a>
                        </div>

                        <Messages etat={etatConnexion} />

                        <BoutonPrincipal disabled={connexionEnCours}>
                            {connexionEnCours ? "Connexion..." : "Se connecter"}
                        </BoutonPrincipal>

                        <p className={styles.bascule}>
                            Pas encore de compte ?
                            <button type="button" className={styles.lienBtn} onClick={() => setIsConnexion(false)}>
                                Créer un compte
                            </button>
                        </p>

                    </form>
                ) : (
                    <form className={styles.formInscription} action={actionInscription}>

                        <div className={styles.entete}>
                            <h2>Rejoignez le cercle</h2>
                            <p>Créez votre compte en moins d&apos;une minute.</p>
                        </div>

                        <div className={styles.grille}>
                            <Champ label="Prénom" name="prenom" autoComplete="given-name" required />
                            <Champ label="Nom" name="nom" autoComplete="family-name" required />
                        </div>

                        <Champ label="E-Mail" name="email" type="email" required />
                        <ChampMotDePasse label="Mot de passe" name="mdp" autoComplete="new-password" required />

                        <label className={styles.accepter}>
                            <input type="checkbox" name="cgu" required />
                            <span>
                                J&apos;accepte les{' '}
                                <a href="#">conditions générales</a>
                                {' '}et la{' '}
                                <a href="#">politique de confidentialité</a>.
                            </span>
                        </label>

                        <Messages etat={etatInscription} />

                        <BoutonPrincipal disabled={inscriptionEnCours}>
                            {inscriptionEnCours ? "Création..." : "Créer mon compte"}
                        </BoutonPrincipal>

                        <p className={styles.bascule}>
                            Déjà membre ?
                            <button type="button" className={styles.lienBtn} onClick={() => setIsConnexion(true)}>
                                Se connecter
                            </button>
                        </p>

                    </form>
                )}

            </div>
        </div>
    );
}
