import fs from 'node:fs';
import https from 'node:https';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const caPath = process.env.WC_CA_CERT;

export const wc = new WooCommerceRestApi({
  url: process.env.WC_URL,
  consumerKey: process.env.WC_CONSUMER_KEY,
  consumerSecret: process.env.WC_CONSUMER_SECRET,
  version: 'wc/v3',
  axiosConfig: caPath
    ? { httpsAgent: new https.Agent({ ca: fs.readFileSync(caPath) }) }
    : {},
});

// src/lib/woocommerce-crud.js
//
// Fonctions pour ajouter / modifier / supprimer / lire des produits et des clients
// via l'API WooCommerce.
//
// IMPORTANT : ce fichier utilise les clés secrètes WooCommerce.
// Il ne doit être importé QUE côté serveur (routes API, Server Components),
// jamais dans un composant 'use client'.
//
// Prérequis : src/lib/woocommerce.js exporte déjà le client `wc`.

import { wc } from '@/lib/woocommerce';

// ---------------------------------------------------------------------------
// Utilitaire : renvoie une erreur lisible quand WooCommerce refuse la requête
// ---------------------------------------------------------------------------
async function run(requete) {
  try {
    const { data } = await requete();
    return data;
  } catch (e) {
    const status = e.response?.status;
    const message = e.response?.data?.message || e.message;
    const erreur = new Error(`WooCommerce ${status ?? ''} : ${message}`);
    erreur.status = status;
    throw erreur;
  }
}

// ===========================================================================
// PRODUITS
// ===========================================================================

// Lire la liste des produits (page = numéro de page, parPage = nombre par page)
export function listerProduits({ page = 1, parPage = 20, recherche, categorie } = {}) {
  const params = { page, per_page: parPage };
  if (recherche) params.search = recherche;
  if (categorie) params.category = categorie; // ID de la catégorie
  return run(() => wc.get('products', params));
}

// Lire un produit par son ID
export function lireProduit(id) {
  return run(() => wc.get(`products/${id}`));
}

// Ajouter un produit
// Exemple : creerProduit({ nom: 'Bâton de feu', prix: 49.99, modele3d: 'baton-feu.glb' })
export function creerProduit({
  nom,
  prix,
  description = '',
  stock,
  modele3d,
  couleurHex,
  publie = true,
}) {
  const produit = {
    name: nom,
    type: 'simple',
    regular_price: String(prix), // WooCommerce attend une chaîne
    description,
    status: publie ? 'publish' : 'draft',
    meta_data: [],
  };

  if (stock !== undefined) {
    produit.manage_stock = true;
    produit.stock_quantity = stock;
  }
  if (modele3d) produit.meta_data.push({ key: 'model_3d', value: modele3d });
  if (couleurHex) produit.meta_data.push({ key: 'couleur_hex', value: couleurHex });

  return run(() => wc.post('products', produit));
}

// Modifier un produit : ne passez que les champs à changer
// Exemple : modifierProduit(16, { prix: 59.99, stock: 10 })
export function modifierProduit(id, { nom, prix, description, stock, modele3d, couleurHex, publie }) {
  const changements = {};

  if (nom !== undefined) changements.name = nom;
  if (prix !== undefined) changements.regular_price = String(prix);
  if (description !== undefined) changements.description = description;
  if (publie !== undefined) changements.status = publie ? 'publish' : 'draft';
  if (stock !== undefined) {
    changements.manage_stock = true;
    changements.stock_quantity = stock;
  }

  const meta = [];
  if (modele3d !== undefined) meta.push({ key: 'model_3d', value: modele3d });
  if (couleurHex !== undefined) meta.push({ key: 'couleur_hex', value: couleurHex });
  if (meta.length) changements.meta_data = meta;

  return run(() => wc.put(`products/${id}`, changements));
}

// Supprimer un produit
// definitif = false : mis à la corbeille (récupérable dans l'admin WordPress)
// definitif = true  : supprimé pour toujours
export function supprimerProduit(id, { definitif = false } = {}) {
  return run(() => wc.delete(`products/${id}`, { force: definitif }));
}

// Récupérer le nom du fichier 3D d'un produit (pour le configurateur)
export function lireModele3d(produit) {
  return produit.meta_data?.find((m) => m.key === 'model_3d')?.value ?? null;
}

// ===========================================================================
// CLIENTS (utilisateurs de la boutique)
// ===========================================================================

// Lire la liste des clients
export function listerClients({ page = 1, parPage = 20, recherche } = {}) {
  const params = { page, per_page: parPage };
  if (recherche) params.search = recherche;
  return run(() => wc.get('customers', params));
}

// Lire un client par son ID
export function lireClient(id) {
  return run(() => wc.get(`customers/${id}`));
}

// Ajouter un client
// Exemple : creerClient({ email: 'a@b.fr', motDePasse: '...', prenom: 'Léa', nom: 'Martin' })
export function creerClient({ email, motDePasse, prenom, nom, identifiant }) {
  const client = {
    email,
    first_name: prenom,
    last_name: nom,
    password: motDePasse,
  };
  // Si aucun identifiant n'est donné, WooCommerce en génère un à partir de l'email
  if (identifiant) client.username = identifiant;

  return run(() => wc.post('customers', client));
}

// Modifier un client : ne passez que les champs à changer
// Exemple : modifierClient(5, { prenom: 'Léa', motDePasse: 'nouveau' })
export function modifierClient(id, { email, motDePasse, prenom, nom }) {
  const changements = {};

  if (email !== undefined) changements.email = email;
  if (motDePasse !== undefined) changements.password = motDePasse;
  if (prenom !== undefined) changements.first_name = prenom;
  if (nom !== undefined) changements.last_name = nom;

  return run(() => wc.put(`customers/${id}`, changements));
}

// Supprimer un client
// Pour les clients, WooCommerce exige force: true (pas de corbeille).
// Ses anciennes commandes sont conservées, rattachées à un invité.
export function supprimerClient(id) {
  return run(() => wc.delete(`customers/${id}`, { force: true }));
}
