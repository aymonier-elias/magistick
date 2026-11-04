
import fs from 'node:fs';
import https from 'node:https';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

let client;

export function getWooCommerce() {
  if (client) return client;

  const {
    WC_URL,
    WC_CONSUMER_KEY,
    WC_CONSUMER_SECRET,
    WC_CA_CERT,
  } = process.env;

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
    axiosConfig: WC_CA_CERT
      ? {
          httpsAgent: new https.Agent({
            ca: fs.readFileSync(WC_CA_CERT),
          }),
        }
      : {},
  });

  return client;
}
