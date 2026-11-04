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