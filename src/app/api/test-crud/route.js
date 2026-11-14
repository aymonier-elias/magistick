// src/app/api/test-crud/route.js
//
// Route de TEST : exécute les fonctions de src/bdd/produits.js et src/bdd/clients.js à la demande
// de la page /test-api.
//
// Sécurité : la route est désactivée tant que la variable d'environnement
// ENABLE_TEST_PAGE n'est pas égale à "true". Ne jamais l'activer en production.
 
import * as produits from '@/bdd/produits';
import * as clients from '@/bdd/clients';
 
// Liste blanche : seules ces actions peuvent être appelées
const ACTIONS = {
  // Produits
  listerProduits: (p) => produits.listerProduits(p),
  lireProduit: ({ id }) => produits.lireProduit(id),
  creerProduit: (p) => produits.creerProduit(p),
  modifierProduit: ({ id, ...champs }) => produits.modifierProduit(id, champs),
  supprimerProduit: ({ id, definitif }) => produits.supprimerProduit(id, { definitif }),
 
  // Clients
  listerClients: (p) => clients.listerClients(p),
  lireClient: ({ id }) => clients.lireClient(id),
  creerClient: (p) => clients.creerClient(p),
  modifierClient: ({ id, ...champs }) => clients.modifierClient(id, champs),
  supprimerClient: ({ id }) => clients.supprimerClient(id),
};
 
export async function POST(request) {
  if (process.env.ENABLE_TEST_PAGE !== 'true') {
    return Response.json(
      { error: 'Page de test désactivée (ENABLE_TEST_PAGE n\'est pas "true").' },
      { status: 403 }
    );
  }
 
  let corps;
  try {
    corps = await request.json();
  } catch {
    return Response.json({ error: 'Corps de requête JSON invalide.' }, { status: 400 });
  }
 
  const { action, payload = {} } = corps;
  const fonction = ACTIONS[action];
 
  if (!fonction) {
    return Response.json({ error: `Action inconnue : ${action}` }, { status: 400 });
  }
 
  try {
    const data = await fonction(payload);
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}