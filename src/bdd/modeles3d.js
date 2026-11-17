// Modèles 3D des produits — serveur uniquement.
//
// Où le modèle d'un produit est cherché, dans l'ordre :
//
// 1. WooCommerce : champ personnalisé « modele_3d » du produit, contenant l'URL
//    du fichier .glb (ex. téléversé dans la médiathèque WordPress).
//    → Ajout / changement de modèle depuis l'admin, sans redéployer le site.
//    Côté WordPress, il faut : autoriser l'envoi des .glb (upload_mimes) et
//    servir les .glb avec l'en-tête Access-Control-Allow-Origin (CORS).
//
// 2. En secours, le site : public/object3D/<sku>/<sku>.glb
//    où <sku> est le SKU WooCommerce du produit (ex. sceptre_lune).
//
// Dans les deux cas, optimiser le modèle avant de l'ajouter :
//   npx @gltf-transform/cli@4.5.1 optimize entree.glb sortie.glb \
//     --compress meshopt --texture-compress webp --texture-size 1024 \
//     --simplify-ratio 0.1 --simplify-error 0.001
import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

// Clé du champ personnalisé WooCommerce (model_3d : ancienne clé, encore acceptée)
const CLES_CHAMP = ['modele_3d', 'model_3d'];

const DOSSIER = path.join(process.cwd(), 'public', 'object3D');

// URL du modèle 3D d'un produit WooCommerce, ou null s'il n'en a pas.
export function urlModele3d(produit) {
  return urlDepuisWooCommerce(produit) ?? urlDepuisPublic(produit?.sku);
}

// 1. Champ personnalisé du produit (URL http/https vers un .glb)
function urlDepuisWooCommerce(produit) {
  const valeur = produit?.meta_data?.find((m) => CLES_CHAMP.includes(m.key))?.value;
  if (typeof valeur !== 'string' || !valeur.trim()) return null;

  try {
    const url = new URL(valeur.trim());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (!url.pathname.toLowerCase().endsWith('.glb')) return null;
    return url.href;
  } catch {
    return null; // valeur qui n'est pas une URL
  }
}

// 2. Fichier dans public/. L'URL contient une version (?v=...) qui change dès
// que le fichier change : le navigateur peut donc garder le modèle en cache
// longtemps sans risque d'afficher une ancienne version (voir next.config.mjs).
function urlDepuisPublic(sku) {
  if (!sku || !/^[a-z0-9_-]+$/i.test(sku)) return null;

  const fichier = path.join(DOSSIER, sku, `${sku}.glb`);
  let infos;
  try {
    infos = fs.statSync(fichier);
  } catch {
    return null; // pas de modèle pour ce produit
  }

  const version = `${Math.round(infos.mtimeMs).toString(36)}${infos.size.toString(36)}`;
  return `/object3D/${sku}/${sku}.glb?v=${version}`;
}
