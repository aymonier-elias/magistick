import Arbre from "@/components/Arbre";

export default function Home() {
  return (
    <>
      <h1>Magistick</h1>
      <Arbre />

      <section style={{ padding: "2rem" }}>
        <h2>Teste des github action</h2>
        <p>
          C'est mieux la ? Avec deux commit
        </p>
      </section>

      <section style={{ padding: "2rem" }}>
        <h2>Fonctionnalités</h2>
        <ul>
          <li>Fonctionnalité 1</li>
          <li>Fonctionnalité 2</li>
          <li>Fonctionnalité 3</li>
          <li>Fonctionnalité 4</li>
        </ul>
      </section>

      <section style={{ padding: "2rem" }}>
        <h2>Comment ça marche</h2>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse
          cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
          cupidatat non proident, sunt in culpa qui officia deserunt mollit
          anim id est laborum.
        </p>
      </section>

      <section style={{ padding: "2rem", minHeight: "50vh" }}>
        <h2>Contact</h2>
        <p>N'hésitez pas à nous contacter pour plus d'informations.</p>
      </section>
    </>
  );
}