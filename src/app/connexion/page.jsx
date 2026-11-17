import '@/css/connexion/connexion.css';
import Formulaire from './Formulaire';

// /connexion?mode=register ouvre directement l'onglet inscription
export default async function Connexion({ searchParams }) {
    const { mode } = await searchParams;
    return <Formulaire modeInitial={mode} />;
}
