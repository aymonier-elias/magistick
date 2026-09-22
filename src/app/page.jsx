import Baton from "@/components/Baton";

export default function Home() {
  return (
    <>
      <h1>Magistick</h1>
      <Baton />

      <section style={{ padding: "2rem" }}>
        <h2>À propos</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
          ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
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