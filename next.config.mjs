/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Modèles 3D sans version dans l'URL (ex. décor de l'accueil) :
        // 1 jour de cache, puis resservis depuis le cache pendant la revalidation.
        source: '/object3D/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        // Modèles 3D versionnés (?v=..., voir src/bdd/modeles3d.js) : la version
        // change avec le fichier, on peut donc les garder 1 an en cache.
        // Placé après la règle précédente pour la remplacer quand ?v est présent.
        source: '/object3D/:path*',
        has: [{ type: 'query', key: 'v' }],
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
