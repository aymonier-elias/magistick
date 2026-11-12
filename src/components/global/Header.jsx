export default function Header(){
    return(
        <header style={{display: "flex", justifyContent: "space-around"}}>
            <p className="titre">MagiStick</p>
            <a>Accueil</a>
            <a>Catalogue</a>
            <a>A Propos</a>
            <a>Avis</a>
            <a>Contact</a>
        </header>
    );
}