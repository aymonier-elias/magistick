import { redirect } from 'next/navigation';
import { getUtilisateurConnecte } from '@/bdd/auth';
import CercleMagique from '@/components/svg/CercleMagique';
import styles from '@/css/connexion/connexion.module.css';
import Formulaire from './Formulaire';

export const metadata = {
    title: 'Connexion | Magistick',
};

// /connexion?mode=register ouvre directement l'onglet inscription.
// La colonne de gauche (SVG décoratif) reste rendue côté serveur : seul le
// formulaire part dans le JavaScript du navigateur.
export default async function Connexion({ searchParams }) {
    const [{ mode }, utilisateur] = await Promise.all([searchParams, getUtilisateurConnecte()]);

    // Déjà connecté : rien à faire ici
    if (utilisateur) redirect('/');

    return (
        <div className={styles.conteneur}>
            <div className={styles.gauche}>
                <div className={styles.cercle}>
                    <CercleMagique />
                </div>

                <div className={styles.texte}>
                    <h1>
                        Votre sceptre <span>vous attend.</span>
                    </h1>
                </div>
            </div>

            <Formulaire modeInitial={mode} />
        </div>
    );
}
