<<<<<<<< HEAD:src/app/api/test-crud/route.js

========
>>>>>>>> elias:src/app/api/test-crud/test-crud-route.js
// src/app/api/test-crud/route.js
//
// Route de TEST : exécute les fonctions de woocommerce-crud.js à la demande
// de la page /test-api.
//
// Sécurité : la route est désactivée tant que la variable d'environnement
// ENABLE_TEST_PAGE n'est pas égale à "true". Ne jamais l'activer en production.
 
import * as crud from '@/lib/woocommerce-crud';
 
// Liste blanche : seules ces actions peuvent être appelées
const ACTIONS = {
  // Produits
  listerProduits: (p) => crud.listerProduits(p),
  lireProduit: ({ id }) => crud.lireProduit(id),
  creerProduit: (p) => crud.creerProduit(p),
  modifierProduit: ({ id, ...champs }) => crud.modifierProduit(id, champs),
  supprimerProduit: ({ id, definitif }) => crud.supprimerProduit(id, { definitif }),
 
  // Clients
  listerClients: (p) => crud.listerClients(p),
  lireClient: ({ id }) => crud.lireClient(id),
  creerClient: (p) => crud.creerClient(p),
  modifierClient: ({ id, ...champs }) => crud.modifierClient(id, champs),
  supprimerClient: ({ id }) => crud.supprimerClient(id),
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