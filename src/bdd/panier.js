// Panier et commandes WooCommerce — serveur uniquement.
//
// Le panier est géré par WooCommerce via la Store API (/wp-json/wc/store/v1),
// l'API publique « côté client » de WooCommerce : prix, stock, coupons,
// livraison et création de la commande sont calculés par WooCommerce.
//
// Le panier est identifié par un jeton (en-tête Cart-Token), gardé dans un
// cookie httpOnly sur notre site et renvoyé à chaque appel.
//
// Lecture : getPanier() / getCommande() depuis un Server Component.
// Modifications : uniquement via les Server Actions de actions-panier.js
// (Next ne permet d'écrire le cookie que là).
import 'server-only';
import { cookies } from 'next/headers';
import { wc } from './woocommerce';

const COOKIE = 'panier_token';
const DUREE_COOKIE = 60 * 60 * 24 * 2; // 48 h, comme la session WooCommerce

const urlStoreApi = () => `${(process.env.WC_URL || '').replace(/\/+$/, '')}/wp-json/wc/store/v1`;

// ---------------------------------------------------------------------------
// Appel à la Store API
// ---------------------------------------------------------------------------

// Appelle la Store API avec le jeton du panier.
// Renvoie { data, nouveauToken } ; en cas de refus, lance une erreur avec .code
// (ex. woocommerce_rest_product_out_of_stock) et .status.
async function storeApi(route, { method = 'GET', body } = {}) {
  const token = (await cookies()).get(COOKIE)?.value;

  const reponse = await fetch(`${urlStoreApi()}/${route}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Cart-Token': token }),
    },
    body: body && JSON.stringify(body),
    cache: 'no-store',
  });

  const data = await reponse.json().catch(() => ({}));
  if (!reponse.ok) {
    const erreur = new Error(data.message || `Store API ${reponse.status}`);
    erreur.code = data.code;
    erreur.status = reponse.status;
    throw erreur;
  }

  return { data, nouveauToken: reponse.headers.get('Cart-Token') };
}

// Garde le jeton du panier dans le cookie (Server Actions uniquement)
async function enregistrerToken(token) {
  if (!token) return;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: DUREE_COOKIE,
  });
}

// ---------------------------------------------------------------------------
// Lecture (Server Components)
// ---------------------------------------------------------------------------

// Panier actuel, ou null s'il n'y en a pas encore (rien ajouté) ou en cas d'erreur.
// Champs utiles : items_count, items[{ key, id, name, quantity, sku, prices, totals }],
// totals{ total_items, total_shipping, total_tax, total_price, currency_minor_unit },
// coupons, shipping_rates, errors. Les montants sont en centimes (voir enEuros).
export async function getPanier() {
  // Pas de jeton = rien ajouté : inutile d'appeler WooCommerce, qui créerait
  // un nouveau panier vide (et une session) à chaque visite.
  if (!(await cookies()).get(COOKIE)?.value) return null;

  try {
    return (await storeApi('cart')).data;
  } catch (e) {
    console.error('Erreur lecture panier :', e);
    return null;
  }
}

// Nombre d'articles dans le panier (pour le compteur du Header), 0 si erreur ou vide.
export async function getNombreArticles() {
  return (await getPanier())?.items_count ?? 0;
}

// Montant de la Store API (chaîne en centimes) -> nombre en euros.
// Exemple : enEuros("55500", 2) -> 555
export function enEuros(montant, unite = 2) {
  return Number(montant || 0) / 10 ** unite;
}

// Commande passée, pour la page de confirmation, ou null.
// La clé de commande (order_key, renvoyée au checkout) est obligatoire :
// sans elle, impossible de lire la commande de quelqu'un d'autre en changeant l'ID.
export async function getCommande(id, cle) {
  const idCommande = Number(id);
  if (!Number.isInteger(idCommande) || idCommande <= 0 || typeof cle !== 'string' || !cle) return null;

  try {
    const commande = await wc((api) => api.get(`orders/${idCommande}`));
    if (commande.order_key !== cle) return null;
    return {
      id: commande.id,
      numero: commande.number,
      statut: commande.status,
      date: commande.date_created,
      total: commande.total,
      devise: commande.currency,
      livraison: commande.shipping_total,
      paiement: commande.payment_method_title,
      facturation: commande.billing,
      adresseLivraison: commande.shipping,
      lignes: commande.line_items.map((l) => ({
        id: l.product_id,
        nom: l.name,
        quantite: l.quantity,
        total: l.total,
        sku: l.sku,
      })),
    };
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Modifications (à appeler depuis actions-panier.js uniquement)
// ---------------------------------------------------------------------------

// POST sur une route de la Store API, puis garde le jeton (nouveau panier ou
// panier expiré remplacé). Renvoie le panier à jour, ou la réponse du checkout.
export async function modifierPanier(route, body) {
  const { data, nouveauToken } = await storeApi(route, { method: 'POST', body });
  await enregistrerToken(nouveauToken);
  return data;
}

// Après une commande : oublie le jeton (WooCommerce a vidé ce panier)
export async function oublierPanier() {
  (await cookies()).delete(COOKIE);
}
