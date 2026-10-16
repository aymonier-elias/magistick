'use client';

// src/app/test-api/page.jsx
//
// Page de TEST pour essayer les fonctions produits / clients.
// À supprimer avant la mise en production.

import { useState } from 'react';

const styles = {
  page: { maxWidth: 900, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif' },
  alerte: { background: '#4a2c00', border: '1px solid #ff8906', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1.5rem' },
  grille: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1rem' },
  carte: { border: '1px solid #2e2c3b', borderRadius: 8, padding: '1rem' },
  champ: { display: 'flex', flexDirection: 'column', marginBottom: '0.5rem', fontSize: 13 },
  input: { padding: '0.4rem', borderRadius: 4, border: '1px solid #555', background: '#1a1926', color: 'inherit' },
  bouton: { padding: '0.5rem 1rem', borderRadius: 6, border: 'none', background: '#ff8906', color: '#0f0e17', fontWeight: 'bold', cursor: 'pointer' },
  resultat: { background: '#000', padding: '1rem', borderRadius: 8, maxHeight: 400, overflow: 'auto', fontSize: 12 },
};

function Formulaire({ titre, action, champs, envoyer, occupe }) {
  const [valeurs, setValeurs] = useState({});

  function changer(nom, valeur) {
    setValeurs((v) => ({ ...v, [nom]: valeur }));
  }

  function soumettre(e) {
    e.preventDefault();
    const payload = {};
    for (const c of champs) {
      const v = valeurs[c.name];
      if (c.type === 'checkbox') {
        if (v !== undefined) payload[c.name] = v;
        continue;
      }
      if (v === undefined || v === '') continue; // champ vide = non envoyé
      payload[c.name] = c.type === 'number' ? Number(v) : v;
    }
    envoyer(action, payload);
  }

  return (
    <form onSubmit={soumettre} style={styles.carte}>
      <h3 style={{ marginBottom: '0.75rem' }}>{titre}</h3>

      {champs.map((c) => (
        <label key={c.name} style={c.type === 'checkbox' ? { ...styles.champ, flexDirection: 'row', gap: 8 } : styles.champ}>
          {c.label}
          {c.type === 'checkbox' ? (
            <input type="checkbox" onChange={(e) => changer(c.name, e.target.checked)} />
          ) : (
            <input
              style={styles.input}
              type={c.type || 'text'}
              step={c.type === 'number' ? 'any' : undefined}
              required={c.required}
              value={valeurs[c.name] ?? ''}
              onChange={(e) => changer(c.name, e.target.value)}
            />
          )}
        </label>
      ))}

      <button style={styles.bouton} type="submit" disabled={occupe}>
        {occupe ? '...' : 'Envoyer'}
      </button>
    </form>
  );
}

export default function TestApiPage() {
  const [resultat, setResultat] = useState(null);
  const [occupe, setOccupe] = useState(false);

  async function envoyer(action, payload) {
    setOccupe(true);
    setResultat(null);
    try {
      const res = await fetch('../api/test-crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      const data = await res.json();
      setResultat({ ok: res.ok, status: res.status, action, data });
    } catch (e) {
      setResultat({ ok: false, status: 0, action, data: { error: e.message } });
    } finally {
      setOccupe(false);
    }
  }

  const id = { name: 'id', label: 'ID', type: 'number', required: true };

  return (
    <div style={styles.page}>
      <h1>Test API WooCommerce</h1>

      <div style={styles.alerte}>
        Page de test. Elle agit réellement sur la base WooCommerce de cet environnement.
        Utilisez des données fictives et supprimez cette page avant la mise en production.
      </div>

      <h2 style={{ margin: '1rem 0' }}>Résultat</h2>
      <pre style={styles.resultat}>
        {occupe
          ? 'Requête en cours...'
          : resultat
          ? `${resultat.action} : ${resultat.ok ? 'OK' : 'ERREUR'} (HTTP ${resultat.status})\n\n${JSON.stringify(resultat.data, null, 2)}`
          : 'Aucune requête envoyée pour le moment.'}
      </pre>

      <h2 style={{ margin: '2rem 0 1rem' }}>Produits</h2>
      <div style={styles.grille}>
        <Formulaire
          titre="Lister les produits" action="listerProduits" envoyer={envoyer} occupe={occupe}
          champs={[
            { name: 'recherche', label: 'Recherche (optionnel)' },
            { name: 'parPage', label: 'Nombre par page', type: 'number' },
          ]}
        />
        <Formulaire
          titre="Lire un produit" action="lireProduit" envoyer={envoyer} occupe={occupe}
          champs={[id]}
        />
        <Formulaire
          titre="Créer un produit" action="creerProduit" envoyer={envoyer} occupe={occupe}
          champs={[
            { name: 'nom', label: 'Nom', required: true },
            { name: 'prix', label: 'Prix', type: 'number', required: true },
            { name: 'description', label: 'Description' },
            { name: 'stock', label: 'Stock', type: 'number' },
            { name: 'modele3d', label: 'Modèle 3D (ex: baton-feu.glb)' },
            { name: 'couleurHex', label: 'Couleur (ex: #5c3a21)' },
            { name: 'publie', label: 'Publié', type: 'checkbox' },
          ]}
        />
        <Formulaire
          titre="Modifier un produit" action="modifierProduit" envoyer={envoyer} occupe={occupe}
          champs={[
            id,
            { name: 'nom', label: 'Nouveau nom' },
            { name: 'prix', label: 'Nouveau prix', type: 'number' },
            { name: 'description', label: 'Nouvelle description' },
            { name: 'stock', label: 'Nouveau stock', type: 'number' },
            { name: 'modele3d', label: 'Nouveau modèle 3D' },
            { name: 'couleurHex', label: 'Nouvelle couleur' },
            { name: 'publie', label: 'Publié', type: 'checkbox' },
          ]}
        />
        <Formulaire
          titre="Supprimer un produit" action="supprimerProduit" envoyer={envoyer} occupe={occupe}
          champs={[id, { name: 'definitif', label: 'Suppression définitive (sinon corbeille)', type: 'checkbox' }]}
        />
      </div>

      <h2 style={{ margin: '2rem 0 1rem' }}>Clients</h2>
      <div style={styles.grille}>
        <Formulaire
          titre="Lister les clients" action="listerClients" envoyer={envoyer} occupe={occupe}
          champs={[
            { name: 'recherche', label: 'Recherche (optionnel)' },
            { name: 'parPage', label: 'Nombre par page', type: 'number' },
          ]}
        />
        <Formulaire
          titre="Lire un client" action="lireClient" envoyer={envoyer} occupe={occupe}
          champs={[id]}
        />
        <Formulaire
          titre="Créer un client" action="creerClient" envoyer={envoyer} occupe={occupe}
          champs={[
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'motDePasse', label: 'Mot de passe', type: 'password', required: true },
            { name: 'prenom', label: 'Prénom' },
            { name: 'nom', label: 'Nom' },
          ]}
        />
        <Formulaire
          titre="Modifier un client" action="modifierClient" envoyer={envoyer} occupe={occupe}
          champs={[
            id,
            { name: 'email', label: 'Nouvel email', type: 'email' },
            { name: 'motDePasse', label: 'Nouveau mot de passe', type: 'password' },
            { name: 'prenom', label: 'Nouveau prénom' },
            { name: 'nom', label: 'Nouveau nom' },
          ]}
        />
        <Formulaire
          titre="Supprimer un client (définitif)" action="supprimerClient" envoyer={envoyer} occupe={occupe}
          champs={[id]}
        />
      </div>
    </div>
  );
}
