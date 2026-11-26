// Formatage partagé entre serveur et client.

const FORMAT_PRIX = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

// "55.5" -> "55,50 €" ; valeur vide ou invalide -> null
export function formatPrix(prix) {
  if (prix === '' || prix === null || prix === undefined) return null;
  const n = Number(prix);
  return Number.isFinite(n) ? FORMAT_PRIX.format(n) : null;
}
