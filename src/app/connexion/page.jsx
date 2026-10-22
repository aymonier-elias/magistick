"use client";

import '../../css/connexion.css';

import CercleMagique from '../../components/svg/Cercle-magique';
import Input from '../../components/form/input';
import { useState } from 'react';

export default function connexion() {
    let [connexion, setConnexion] = useState(true);

    return (
        <>
            <div className="conteneur">
                <div className="gauche">
                    <div className="cercle">
                        <CercleMagique />
                    </div>

                    <div className="texte">
                        <h1>Votre sceptre <span>vous attend.</span></h1>
                    </div>
                </div>

                <div className="droite">
                    <a href="/" className="retour">Retour à la boutique</a>

                    <div className="boite">
                        {/* <!-- Boutons Connexion/Inscription --> */}
                        <div className="boutons">
                            <span className="onglets" style={connexion ? {left: "4px"} : {right: "4px"}}></span>
                            <button className={connexion ? "connexion actif" : "connexion"} onClick={() => setConnexion(true)}>CONNEXION</button>
                            <button className={connexion ? "inscription" : "inscription actif"} onClick={() => setConnexion(false)}>INSCRIPTION</button>
                        </div>

                        {connexion ? (
                            <form className="partieconnexion">
                                <div className="entete">
                                    <h2>Ravis de vous revoir</h2>
                                    <p>Connectez-vous pour retrouver vos favoris et vos commandes.</p>
                                </div>

                                <Input label="E-Mail" name="email" type="email" required={true} />

                                <Input label="Mot de passe" name="mdp" type="password" required={true} />

                                <Input type="submit" label="Se connecter" />

                                <p className="bascule">Pas encore de compte ? <button type="button" className="lien-btn" onClick={() => setConnexion(false)}>Créer un
                                    compte</button></p>
                            </form>
                        ) : (
                            <form className="partieinscription">
                                <div className="entete">
                                    <h2>Rejoignez le cercle</h2>
                                    <p>Créez votre compte en moins d'une minute.</p>
                                </div>

                                <div className="grille">
                                    <Input label="Prénom" name="prenom" required={true} />
                                    <Input label="Nom" name="nom" required={true} />
                                </div>

                                <Input label="E-Mail" name="email" type="email" required={true} />

                                <Input label="Mot de passe" name="mdp" type="password" required={true} />

                                <label className="accepter">
                                    <p><input type="checkbox" name="cgu" id="cgu" /> J'accepte les <a href="#">conditions générales</a> et la <a href="#">politique de
                                        confidentialité</a>.</p>
                                </label>

                                <Input type="submit" label="Créer mon compte" />
                                <p className="bascule">Déjà membre ? <button type="button" className="lien-btn js-vers-login" onClick={() => setConnexion(true)}>Se connecter</button></p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}