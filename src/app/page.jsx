import DecorAccueil from "@/components/accueil/DecorAccueil";

import "@/css/accueil/accueil.css";

export default function Accueil() {
  return (
    <>
      <h1>Magistick</h1>
      <DecorAccueil />

      <section className="accueil-section">
        <h2>Teste des github action</h2>
        <p>
          C&apos;est mieux la ? Avec deux commit
        </p>
      </section>

      <section className="accueil-section">
        <h2>Fonctionnalités</h2>
        <ul>
          <li>Fonctionnalité 1</li>
          <li>Fonctionnalité 2</li>
          <li>ça me casse les couille le ssh</li>
          <li>Nique ta race le ssh</li>
        </ul>
      </section>

      <section className="accueil-section">
        <h2>Comment ça marche</h2>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse
          cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
          cupidatat non proident, sunt in culpa qui officia deserunt mollit
          anim id est laborum.
        </p>
      </section>

      <section className="accueil-section accueil-contact">
        <h2>Contact</h2>
        <p>N&apos;hésitez pas à nous contacter pour plus d&apos;informations.</p>
      </section>
    </>
  );
}
