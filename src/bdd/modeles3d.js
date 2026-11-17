// Modèles 3D des produits — serveur uniquement.
//
// Convention : le modèle d'un produit est rangé dans
//   public/object3D/<sku>/<sku>.glb
// où <sku> est le SKU WooCommerce du produit (ex. sceptre_lune).
//
// Optimiser chaque modèle avant de l'ajouter (simplification + compression) :
//   npx @gltf-transform/cli@4.5.1 optimize entree.glb public/object3D/<sku>/<sku>.glb \
//     --compress meshopt --texture-compress webp --texture-size 1024 \
//     --simplify-ratio 0.1 --simplify-error 0.001
import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

const DOSSIER = path.join(process.cwd(), 'public', 'object3D');

// URL publique du modèle 3D d'un produit, ou null s'il n'en a pas.
// L'URL contient une version (?v=...) qui change dès que le fichier change :
// le navigateur peut donc garder le modèle en cache longtemps sans risque
// d'afficher une ancienne version (voir next.config.mjs).
export function urlModele3d(sku) {
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
