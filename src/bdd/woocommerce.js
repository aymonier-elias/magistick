// Connexion à l'API WooCommerce (clés secrètes) — serveur uniquement.
import 'server-only';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

let client;

function getWooCommerce() {
  if (client) return client;

  const { WC_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET } = process.env;

  if (!WC_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
    throw new Error(
      'Configuration WooCommerce manquante : vérifie WC_URL, WC_CONSUMER_KEY et WC_CONSUMER_SECRET.'
    );
  }

  client = new WooCommerceRestApi({
    url: WC_URL,
    consumerKey: WC_CONSUMER_KEY,
    consumerSecret: WC_CONSUMER_SECRET,
    version: 'wc/v3',
  });

  return client;
}

// Exécute une requête WooCommerce et renvoie ses données.
// En cas de refus, lance une erreur avec .status et .code.
// Exemple : wc((api) => api.get('products', { per_page: 10 }))
export async function wc(requete) {
  try {
    const { data } = await requete(getWooCommerce());
    return data;
  } catch (e) {
    const status = e.response?.status;
    const erreur = new Error(
      `WooCommerce ${status ?? ''} : ${e.response?.data?.message || e.message}`
    );
    erreur.status = status;
    erreur.code = e.response?.data?.code;
    throw erreur;
  }
}
