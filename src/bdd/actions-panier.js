'use server';

// Server Actions du panier et de la commande.
//
// ATTENTION : toute fonction exportée ici est appelable par n'importe qui
// (requête POST directe). Ces actions ne touchent qu'au panier du visiteur
// (identifié par son cookie) : c'est voulu. N'y mettez rien d'autre.
//
// Elles ne lancent pas d'erreur vers la page : elles renvoient
// { panier } en cas de succès ou { erreur } (message à afficher).
//
// Exemples d'utilisation :
//   <form action={ajouterAuPanier.bind(null, produit.id)}>
//     <input type="number" name="quantite" defaultValue={1} />   // optionnel
//     <button>Ajouter au panier</button>
//   </form>
//
//   const [etat, action, enCours] = useActionState(passerCommande, null);
//   <form action={action}> ... </form>  // etat?.erreur à afficher

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { modifierPanier, oublierPanier } from './panier';

// Messages lisibles pour les erreurs courantes de la Store API
const MESSAGES = {
  woocommerce_rest_product_out_of_stock: 'Ce produit n’est plus en stock.',
  woocommerce_rest_product_partially_out_of_stock: 'Stock insuffisant pour cette quantité.',
  woocommerce_rest_cart_invalid_product: 'Ce produit n’existe pas ou n’est plus disponible.',
  woocommerce_rest_cart_invalid_key: 'Cet article n’est plus dans le panier.',
  woocommerce_rest_cart_empty: 'Votre panier est vide.',
  woocommerce_rest_cart_coupon_error: 'Ce code promo n’est pas valable.',
  woocommerce_rest_invalid_payment_method: 'Ce moyen de paiement n’est pas disponible.',
  woocommerce_rest_invalid_email_address: 'Adresse email invalide.',
};

const message = (e) => MESSAGES[e.code] ?? e.message ?? 'Une erreur est survenue.';

// Exécute une modification du panier et met à jour les pages (compteur du Header compris)
async function executer(route, body) {
  try {
    const panier = await modifierPanier(route, body);
    revalidatePath('/', 'layout');
    return { panier };
  } catch (e) {
    console.error(`Erreur panier (${route}) :`, e);
    return { erreur: message(e) };
  }
}

// Quantité entre 1 et 99 (ou valeur par défaut)
const quantiteValide = (valeur, defaut = 1) => {
  const n = Number(valeur);
  return Number.isInteger(n) && n >= 1 && n <= 99 ? n : defaut;
};

// ---------------------------------------------------------------------------
// Panier
// ---------------------------------------------------------------------------

// Ajouter un produit. Avec un formulaire : ajouterAuPanier.bind(null, id),
// la quantité est lue dans le champ « quantite » (1 par défaut).
export async function ajouterAuPanier(idProduit, quantiteOuFormData) {
  const id = Number(idProduit);
  if (!Number.isInteger(id) || id <= 0) return { erreur: 'Produit invalide.' };

  const quantite = quantiteOuFormData instanceof FormData
    ? quantiteValide(quantiteOuFormData.get('quantite'))
    : quantiteValide(quantiteOuFormData);

  return executer('cart/add-item', { id, quantity: quantite });
}

// Changer la quantité d'une ligne (cle = items[].key du panier)
export async function changerQuantite(cle, quantite) {
  if (typeof cle !== 'string' || !cle) return { erreur: 'Article invalide.' };
  const n = Number(quantite);
  if (n === 0) return retirerDuPanier(cle);
  return executer('cart/update-item', { key: cle, quantity: quantiteValide(n) });
}

// Retirer une ligne du panier
export async function retirerDuPanier(cle) {
  if (typeof cle !== 'string' || !cle) return { erreur: 'Article invalide.' };
  return executer('cart/remove-item', { key: cle });
}

// Appliquer / retirer un code promo (créé dans WooCommerce > Marketing > Codes promo)
export async function appliquerCoupon(code) {
  const texte = String(code ?? '').trim();
  if (!texte) return { erreur: 'Saisissez un code promo.' };
  return executer('cart/apply-coupon', { code: texte });
}

export async function retirerCoupon(code) {
  return executer('cart/remove-coupon', { code: String(code ?? '') });
}

// ---------------------------------------------------------------------------
// Commande
// ---------------------------------------------------------------------------

const texte = (formData, nom) => String(formData.get(nom) ?? '').trim();

// Passer la commande (à utiliser avec useActionState).
// Champs du formulaire : prenom, nom, email, telephone, adresse, complement,
// codePostal, ville, pays (FR par défaut), note, paiement (cheque par défaut).
// En cas de succès : redirige vers /commande/confirmation?id=...&cle=...
export async function passerCommande(etatPrecedent, formData) {
  const adresse = {
    first_name: texte(formData, 'prenom'),
    last_name: texte(formData, 'nom'),
    address_1: texte(formData, 'adresse'),
    address_2: texte(formData, 'complement'),
    postcode: texte(formData, 'codePostal'),
    city: texte(formData, 'ville'),
    country: texte(formData, 'pays') || 'FR',
    phone: texte(formData, 'telephone'),
  };
  const email = texte(formData, 'email').toLowerCase();

  const manquants = ['first_name', 'last_name', 'address_1', 'postcode', 'city'].filter((c) => !adresse[c]);
  if (manquants.length || !email) return { erreur: 'Merci de remplir tous les champs obligatoires.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { erreur: 'Adresse email invalide.' };

  let commande;
  try {
    commande = await modifierPanier('checkout', {
      billing_address: { ...adresse, email },
      shipping_address: adresse,
      // Moyen de paiement « hors ligne » activé dans WooCommerce (chèque, virement…)
      payment_method: texte(formData, 'paiement') || 'cheque',
      customer_note: texte(formData, 'note'),
    });
  } catch (e) {
    console.error('Erreur commande :', e);
    return { erreur: message(e) };
  }

  // WooCommerce a vidé ce panier : on oublie son jeton
  await oublierPanier();
  revalidatePath('/', 'layout');
  redirect(`/commande/confirmation?id=${commande.order_id}&cle=${encodeURIComponent(commande.order_key)}`);
}
