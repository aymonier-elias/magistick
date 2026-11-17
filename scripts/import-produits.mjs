// Import des produits Magistick dans WooCommerce depuis un CSV.
//
// Colonnes attendues : produit_id,nom,type_magie,prix,puissance,pouvoirs
//   - puissance  -> catégorie (Apprenti, Adepte, Maître, Archimage)
//   - type_magie -> attribut global « Type de magie » (filtrable)
//   - pouvoirs   -> description du produit
//   - nom        -> SKU (référence) ; le nom affiché est rendu lisible
//
// Le script est rejouable : catégories, attributs, termes et produits sont
// retrouvés par slug / SKU et mis à jour au lieu d'être dupliqués.
//
// Utilisation (lit WC_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET) :
//   node --env-file=.env.local scripts/import-produits.mjs chemin/vers/fichier.csv             (simulation)
//   node --env-file=.env.local scripts/import-produits.mjs chemin/vers/fichier.csv --appliquer (écrit dans WooCommerce)

import fs from 'node:fs';
import WooCommerceRestApiModule from '@woocommerce/woocommerce-rest-api';

const WooCommerceRestApi = WooCommerceRestApiModule.default ?? WooCommerceRestApiModule;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const CATEGORIES = {
  apprenti: 'Apprenti',
  adepte: 'Adepte',
  maitre: 'Maître',
  archimage: 'Archimage',
};

const ATTRIBUT = { slug: 'type_magie', nom: 'Type de magie' };

const TYPES_MAGIE = {
  eau: 'Eau',
  feu: 'Feu',
  celeste: 'Céleste',
  sanctuaire: 'Sanctuaire',
  blanche: 'Blanche',
  noire: 'Noire',
  prestige: 'Prestige',
  custom: 'Sur mesure',
};

// Mots du nom technique -> forme affichée (accents)
const MOTS = {
  sur: 'sur',
  purete: 'pureté',
  celeste: 'céleste',
  desolation: 'désolation',
  ecarlate: 'écarlate',
  eclipse: 'éclipse',
  emeraude: 'émeraude',
  avance: 'avancé',
};

// Corrections de fautes repérées dans le CSV
const CORRECTIONS = [
  [/légérs/g, 'légers'],
  [/absorbtion/g, 'absorption'],
  [/ {2,}/g, ' '],
];

// ---------------------------------------------------------------------------
// Lecture du CSV
// ---------------------------------------------------------------------------

function lireCsv(chemin) {
  const texte = fs.readFileSync(chemin, 'utf8').replace(/^﻿/, '');
  const lignes = [];
  let champ = '';
  let ligne = [];
  let guillemets = false;

  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (guillemets) {
      if (c === '"' && texte[i + 1] === '"') { champ += '"'; i++; }
      else if (c === '"') guillemets = false;
      else champ += c;
    } else if (c === '"') guillemets = true;
    else if (c === ',') { ligne.push(champ); champ = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texte[i + 1] === '\n') i++;
      ligne.push(champ); champ = '';
      if (ligne.some((v) => v !== '')) lignes.push(ligne);
      ligne = [];
    } else champ += c;
  }
  ligne.push(champ);
  if (ligne.some((v) => v !== '')) lignes.push(ligne);

  const [entetes, ...donnees] = lignes;
  return donnees.map((valeurs) =>
    Object.fromEntries(entetes.map((e, i) => [e.trim(), (valeurs[i] ?? '').trim()]))
  );
}

const nomLisible = (nomTechnique) => {
  const mots = nomTechnique.split('_').map((m) => MOTS[m] ?? m);
  const phrase = mots.join(' ');
  return phrase.charAt(0).toUpperCase() + phrase.slice(1);
};

const description = (pouvoirs) => {
  let texte = CORRECTIONS.reduce((t, [motif, remplacement]) => t.replace(motif, remplacement), pouvoirs);
  texte = texte.charAt(0).toUpperCase() + texte.slice(1);
  return /[.!?]$/.test(texte) ? texte : `${texte}.`;
};

// "1.599" (séparateur de milliers) -> "1599" ; "99" -> "99" ; "12,50" -> "12.50"
const prix = (valeur) => {
  const v = valeur.replace(/\s/g, '');
  if (/^\d{1,3}(\.\d{3})+$/.test(v)) return v.replace(/\./g, '');
  return v.replace(',', '.');
};

function convertirLigne(ligne) {
  const erreurs = [];
  if (!CATEGORIES[ligne.puissance]) erreurs.push(`puissance inconnue « ${ligne.puissance} »`);
  if (!TYPES_MAGIE[ligne.type_magie]) erreurs.push(`type_magie inconnu « ${ligne.type_magie} »`);
  const p = prix(ligne.prix);
  if (!/^\d+(\.\d+)?$/.test(p)) erreurs.push(`prix invalide « ${ligne.prix} »`);
  if (erreurs.length) throw new Error(`Ligne ${ligne.produit_id} (${ligne.nom}) : ${erreurs.join(', ')}`);

  const texte = description(ligne.pouvoirs);
  return {
    sku: ligne.nom,
    nom: nomLisible(ligne.nom),
    prix: p,
    categorie: ligne.puissance,
    typeMagie: ligne.type_magie,
    description: texte,
  };
}

// ---------------------------------------------------------------------------
// WooCommerce
// ---------------------------------------------------------------------------

function connexion() {
  const { WC_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET } = process.env;
  if (!WC_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
    throw new Error('WC_URL, WC_CONSUMER_KEY et WC_CONSUMER_SECRET doivent être définis (--env-file=.env.local).');
  }
  return new WooCommerceRestApi({
    url: WC_URL,
    consumerKey: WC_CONSUMER_KEY,
    consumerSecret: WC_CONSUMER_SECRET,
    version: 'wc/v3',
  });
}

async function appel(promesse) {
  try {
    return (await promesse).data;
  } catch (e) {
    const d = e.response?.data;
    throw new Error(`WooCommerce ${e.response?.status ?? ''} : ${d?.message || e.message}`);
  }
}

async function main() {
  const [chemin, ...options] = process.argv.slice(2);
  const appliquer = options.includes('--appliquer');

  if (!chemin) {
    console.error('Usage : node --env-file=.env.local scripts/import-produits.mjs fichier.csv [--appliquer]');
    process.exit(1);
  }

  const produits = lireCsv(chemin).map(convertirLigne);
  console.log(`${produits.length} produits lus dans le CSV.`);
  console.log(appliquer ? 'Mode : ÉCRITURE dans WooCommerce\n' : 'Mode : simulation (ajoutez --appliquer pour écrire)\n');

  const api = connexion();
  const ecrire = async (libelle, fn) => {
    console.log(`  ${appliquer ? '' : '[simulation] '}${libelle}`);
    return appliquer ? fn() : { id: `(nouveau)` };
  };

  // 1. Catégories
  console.log('Catégories');
  const categoriesExistantes = await appel(api.get('products/categories', { per_page: 100 }));
  const idsCategories = {};
  for (const [slug, nom] of Object.entries(CATEGORIES)) {
    const existante = categoriesExistantes.find((c) => c.slug === slug);
    idsCategories[slug] = existante
      ? (console.log(`  existe déjà : ${nom}`), existante.id)
      : (await ecrire(`création : ${nom}`, () => appel(api.post('products/categories', { name: nom, slug })))).id;
  }

  // 2. Attribut global + termes
  console.log('\nAttribut');
  const attributs = await appel(api.get('products/attributes'));
  let attribut = attributs.find((a) => a.slug === `pa_${ATTRIBUT.slug}`);
  if (attribut) console.log(`  existe déjà : ${ATTRIBUT.nom}`);
  else {
    attribut = await ecrire(`création : ${ATTRIBUT.nom}`, () =>
      appel(api.post('products/attributes', {
        name: ATTRIBUT.nom,
        slug: ATTRIBUT.slug,
        type: 'select',
        order_by: 'name',
        has_archives: false,
      }))
    );
  }

  const termesExistants = typeof attribut.id === 'number'
    ? await appel(api.get(`products/attributes/${attribut.id}/terms`, { per_page: 100 }))
    : [];
  for (const [slug, nom] of Object.entries(TYPES_MAGIE)) {
    if (termesExistants.some((t) => t.slug === slug)) console.log(`  terme existe déjà : ${nom}`);
    else await ecrire(`terme : ${nom}`, () =>
      appel(api.post(`products/attributes/${attribut.id}/terms`, { name: nom, slug }))
    );
  }

  // 3. Produits (retrouvés par SKU)
  console.log('\nProduits');
  const existants = await appel(api.get('products', { per_page: 100, status: 'any' }));
  const parSku = new Map(existants.filter((p) => p.sku).map((p) => [p.sku, p]));

  let crees = 0;
  let modifies = 0;
  for (const p of produits) {
    const donnees = {
      name: p.nom,
      sku: p.sku,
      type: 'simple',
      status: 'publish',
      regular_price: p.prix,
      description: p.description,
      short_description: p.description,
      categories: [{ id: idsCategories[p.categorie] }],
      attributes: [{
        id: attribut.id,
        visible: true,
        variation: false,
        options: [TYPES_MAGIE[p.typeMagie]],
      }],
    };

    const existant = parSku.get(p.sku);
    const resume = `${p.nom} — ${p.prix} € — ${CATEGORIES[p.categorie]} — ${TYPES_MAGIE[p.typeMagie]}`;
    if (existant) {
      await ecrire(`mise à jour : ${resume}`, () => appel(api.put(`products/${existant.id}`, donnees)));
      modifies++;
    } else {
      await ecrire(`création : ${resume}`, () => appel(api.post('products', donnees)));
      crees++;
    }
  }

  console.log(`\nTerminé : ${crees} créé(s), ${modifies} mis à jour${appliquer ? '' : ' (simulation, rien n\'a été écrit)'}.`);
}

main().catch((e) => {
  console.error(`\nErreur : ${e.message}`);
  process.exit(1);
});
