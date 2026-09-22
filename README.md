# VPS — WordPress + WooCommerce + Next.js

Architecture headless avec **WordPress/WooCommerce comme backend** et **Next.js comme frontend**, déployée sur Debian.

> ⚠️ Ce README décrit l'architecture et les étapes de mise en place.
> Les mots de passe, clés SSH, clés WooCommerce et autres secrets ne doivent jamais être commités dans Git.

---

## Architecture

### Architecture finale

```text
                           GitHub
                             │
                  ┌──────────┴──────────┐
                  │                     │
               develop                 main
                  │                     │
                  ▼                     ▼
              VPS DEV               VPS PROD
                  │                     │
           ┌──────┴──────┐       ┌──────┴──────┐
           │             │       │             │
       WordPress      Next.js WordPress      Next.js
           │             │       │             │
        MariaDB        :3000   MariaDB        :3000
                                             │
                                             ▼
                                          Apache
                                         :80/:443
                                             │
                                             ▼
                                          Internet
```

### Rôles

| Élément        | Rôle                         |
| -------------- | ---------------------------- |
| WordPress      | CMS / backend                |
| WooCommerce    | Catalogue, panier, commandes |
| MariaDB        | Base de données WordPress    |
| Next.js        | Frontend                     |
| Apache         | Serveur web + reverse proxy  |
| GitHub         | Versionnement du code        |
| GitHub Actions | Tests, build et déploiement  |
| VPS DEV        | Développement et tests       |
| VPS PROD       | Site réel                    |

Les environnements DEV et PROD possèdent leurs **propres WordPress et bases MariaDB**.

---

# 1. Préparer Debian

Le serveur de test utilise Debian 13 (Trixie).

Vérifier le système :

```bash
cat /etc/os-release
```

Mettre le système à jour :

```bash
sudo apt update
sudo apt upgrade -y
```

Vérifier l'utilisateur :

```bash
whoami
sudo -v
```

Le travail quotidien doit être effectué avec un utilisateur normal disposant de `sudo`, et non avec `root`.

---

# 2. Installer Apache

```bash
sudo apt install -y apache2
```

Vérifier :

```bash
sudo /usr/sbin/apache2ctl -v
sudo systemctl status apache2
```

---

# 3. Modules Apache

Activer les modules nécessaires à WordPress :

```bash
sudo a2enmod rewrite
```

Activer les modules nécessaires au reverse proxy Next.js :

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
```

Redémarrer Apache :

```bash
sudo systemctl restart apache2
```

---

# 4. Installer PHP

```bash
sudo apt install -y \
  php \
  libapache2-mod-php \
  php-mysql \
  php-curl \
  php-gd \
  php-mbstring \
  php-xml \
  php-zip \
  php-intl
```

Vérifier :

```bash
php -v
```

Vérifier que PHP est chargé par Apache :

```bash
sudo /usr/sbin/apache2ctl -M | grep php
```

---

# 5. Installer MariaDB

```bash
sudo apt install -y mariadb-server
```

Activer MariaDB :

```bash
sudo systemctl enable --now mariadb
```

Sécuriser l'installation :

```bash
sudo mariadb-secure-installation
```

---

# 6. Créer la base WordPress

Ouvrir MariaDB :

```bash
sudo mariadb
```

Créer la base :

```sql
CREATE DATABASE wordpress;
```

Créer l'utilisateur :

```sql
CREATE USER 'wp_user'@'localhost'
IDENTIFIED BY 'MOT_DE_PASSE_FORT';
```

Donner les permissions :

```sql
GRANT ALL PRIVILEGES ON wordpress.*
TO 'wp_user'@'localhost';

FLUSH PRIVILEGES;
```

Quitter :

```sql
EXIT;
```

---

# 7. Installer WordPress

WordPress est installé dans :

```text
/srv/wordpress
```

Créer le dossier :

```bash
sudo mkdir -p /srv/wordpress
```

Installer WordPress dans ce répertoire puis configurer `wp-config.php`.

Informations utilisées :

```text
DB_NAME     = wordpress
DB_USER     = wp_user
DB_PASSWORD = ********
DB_HOST     = localhost
```

Donner les permissions :

```bash
sudo chown -R elias:elias /srv/wordpress
```

---

# 8. Configurer Apache pour WordPress

Créer :

```bash
sudo nano /etc/apache2/sites-available/wordpress.conf
```

Configuration de base :

```apache
<VirtualHost *:80>

    ServerName example.com

    DocumentRoot /srv/wordpress

    <Directory /srv/wordpress>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/wordpress_error.log
    CustomLog ${APACHE_LOG_DIR}/wordpress_access.log combined

</VirtualHost>
```

Désactiver le site par défaut :

```bash
sudo a2dissite 000-default.conf
```

Activer le site WordPress :

```bash
sudo a2ensite wordpress.conf
```

Tester la configuration :

```bash
sudo /usr/sbin/apache2ctl configtest
```

Résultat attendu :

```text
Syntax OK
```

Recharger Apache :

```bash
sudo systemctl reload apache2
```

---

# 9. Installer WooCommerce

Dans l'administration WordPress :

```text
Extensions
→ Ajouter
→ WooCommerce
→ Installer
→ Activer
```

Créer ensuite un produit de test.

---

# 10. Vérifier l'API WordPress

Tester l'API REST :

```bash
curl -I http://localhost/wp-json/
```

Résultat attendu :

```text
HTTP/1.1 200 OK
```

Tester les articles :

```bash
curl -s http://localhost/wp-json/wp/v2/posts | head -c 1000
```

---

# 11. Vérifier l'API WooCommerce

L'API publique utilisée pour récupérer le catalogue :

```text
/wp-json/wc/store/v1/products
```

Tester :

```bash
curl -s \
  http://localhost/wp-json/wc/store/v1/products \
  | head -c 1000
```

Cette API permet au frontend Next.js de récupérer les produits publics.

Les clés privées WooCommerce ne sont pas nécessaires pour cette API publique.

---

# 12. Installer Node.js et Next.js

Créer le projet :

```bash
npx create-next-app@latest mon-projet \
  --js \
  --eslint \
  --no-tailwind \
  --src-dir \
  --app \
  --import-alias "@/*"
```

Entrer dans le projet :

```bash
cd ~/mon-projet
```

Installer les dépendances :

```bash
npm install
```

---

# 13. Swap pour les petits VPS

Si le VPS possède peu de RAM, ajouter du swap peut éviter que `npm install` ou `npm run build` soit tué par manque de mémoire.

Exemple avec 2 Go :

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo /usr/sbin/swapon /swapfile
```

Vérifier :

```bash
free -h
```

Rendre le swap permanent :

```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

# 14. Tester Next.js en développement

```bash
cd ~/mon-projet
npm run dev
```

Next.js démarre généralement sur :

```text
http://localhost:3000
```

Tester depuis un autre terminal :

```bash
curl -I http://localhost:3000
```

Résultat attendu :

```text
HTTP/1.1 200 OK
```

---

# 15. Récupérer les produits WooCommerce

Exemple simple dans :

```text
src/app/page.js
```

```javascript
async function getProducts() {
  const response = await fetch(
    "http://127.0.0.1/wp-json/wc/store/v1/products",
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Impossible de récupérer les produits");
  }

  return response.json();
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main>
      <h1>Mes produits</h1>

      <div>
        {products.map((product) => (
          <article key={product.id}>
            <img
              src={product.images[0]?.src}
              alt={product.images[0]?.alt || product.name}
              width="300"
            />

            <h2>{product.name}</h2>

            <p
              dangerouslySetInnerHTML={{
                __html: product.price_html,
              }}
            />

            <p>{product.short_description}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
```

Architecture :

```text
Next.js
   │
   ▼
Apache
   │
   ▼
WordPress REST API
   │
   ▼
WooCommerce
   │
   ▼
Produits
```

---

# 16. Build Next.js

Pour créer le build de production :

```bash
npm run build
```

Si le build se termine correctement :

```bash
npm start
```

Tester :

```bash
curl -I http://localhost:3000
```

Résultat attendu :

```text
HTTP/1.1 200 OK
```

---

# 17. Dev vs Production

### Développement

```bash
npm run dev
```

Utilisé pendant le développement.

### Build

```bash
npm run build
```

Compile l'application.

### Production

```bash
npm start
```

Lance le build créé précédemment.

Important :

```text
npm run build
```

ne redémarre pas automatiquement un processus `npm start` déjà lancé.

Sans automatisation :

```bash
npm run build
sudo systemctl restart mon-projet
```

---

# 18. Reverse Proxy Apache → Next.js

Apache est utilisé comme point d'entrée public.

```text
Internet
   │
   ▼
Apache :80 / :443
   │
   ├── WordPress
   │
   └── Next.js :3000
```

Configuration :

```apache
<VirtualHost *:80>

    ServerName example.com

    DocumentRoot /srv/wordpress

    <Directory /srv/wordpress>
        AllowOverride All
        Require all granted
    </Directory>

    # Ne pas envoyer ces routes vers Next.js
    ProxyPass /wp-admin !
    ProxyPass /wp-content !
    ProxyPass /wp-includes !
    ProxyPass /wp-json !
    ProxyPass /wp-login.php !
    ProxyPass /wp-cron.php !
    ProxyPass /wp-comments-post.php !
    ProxyPass /xmlrpc.php !
    ProxyPass /index.php !

    # Next.js
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/

    ErrorLog ${APACHE_LOG_DIR}/wordpress_error.log
    CustomLog ${APACHE_LOG_DIR}/wordpress_access.log combined

</VirtualHost>
```

Tester :

```bash
sudo /usr/sbin/apache2ctl configtest
```

Puis :

```bash
sudo systemctl reload apache2
```

---

# 19. systemd pour Next.js

L'objectif est que Next.js fonctionne comme un service Linux.

Créer :

```bash
sudo nano /etc/systemd/system/mon-projet.service
```

Contenu :

```ini
[Unit]
Description=Next.js mon-projet
After=network.target

[Service]
Type=simple
User=elias
WorkingDirectory=/home/elias/mon-projet
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Recharger systemd :

```bash
sudo systemctl daemon-reload
```

Activer le démarrage automatique :

```bash
sudo systemctl enable mon-projet
```

Démarrer :

```bash
sudo systemctl start mon-projet
```

Vérifier :

```bash
sudo systemctl status mon-projet
```

---

## Commandes systemd

Arrêter :

```bash
sudo systemctl stop mon-projet
```

Démarrer :

```bash
sudo systemctl start mon-projet
```

Redémarrer :

```bash
sudo systemctl restart mon-projet
```

Voir le statut :

```bash
sudo systemctl status mon-projet
```

Désactiver le démarrage automatique :

```bash
sudo systemctl disable mon-projet
```

---

# 20. Mise à jour manuelle

Avant GitHub Actions, une mise à jour ressemble à :

```bash
git pull
npm ci
npm run build
sudo systemctl restart mon-projet
```

Le `restart` permet au processus Next.js d'utiliser le nouveau build.

---

# 21. Git

Initialiser le repository :

```bash
cd ~/mon-projet

git init
git add .
git commit -m "Initialisation du projet"
```

Ajouter le repository GitHub :

```bash
git remote add origin <URL_DU_REPO>
```

Créer `main` :

```bash
git branch -M main
git push -u origin main
```

Créer la branche de développement :

```bash
git checkout -b develop
git push -u origin develop
```

---

# 22. Workflow Git

Développement :

```text
develop
   │
   ▼
Modifications
   │
   ▼
git push
   │
   ▼
GitHub
   │
   ▼
VPS DEV
```

Production :

```text
develop
   │
   ▼
Pull Request
   │
   ▼
main
   │
   ▼
GitHub Actions
   │
   ▼
VPS PROD
```

---

# 23. GitHub Actions — CI

Créer :

```text
.github/
└── workflows/
    └── ci.yml
```

Exemple :

```yaml
name: CI

on:
  push:
    branches:
      - develop
      - main

  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
```

Cette action vérifie automatiquement :

```text
npm ci
   ↓
npm run lint
   ↓
npm run build
```

avant de considérer le code comme valide.

---

# 24. Déploiement automatique prévu

Architecture :

```text
git push
    │
    ▼
  GitHub
    │
    ▼
GitHub Actions
    │
    ├── npm ci
    ├── npm run lint
    └── npm run build
            │
            ▼
       Build réussi
            │
            ▼
       Déploiement
            │
            ▼
         VPS
            │
            ▼
systemctl restart mon-projet
```

À terme :

```text
develop → VPS DEV
main    → VPS PROD
```

L'objectif est de ne plus devoir se connecter manuellement au VPS pour chaque mise à jour.

---

# 25. Secrets

Les informations sensibles doivent être stockées dans les secrets GitHub.

Exemples :

```text
PROD_HOST
PROD_USER
PROD_SSH_KEY
```

Dans GitHub :

```text
Repository
→ Settings
→ Secrets and variables
→ Actions
```

Ne jamais mettre de mot de passe ou clé privée directement dans le code.

---

# 26. WordPress / WooCommerce et Git

GitHub contient le code Next.js.

GitHub ne doit pas contenir :

```text
❌ Base MariaDB
❌ Commandes WooCommerce
❌ Clients
❌ Mots de passe
❌ Clés API privées
❌ Données de production
```

DEV :

```text
WordPress DEV
      │
      ▼
MariaDB DEV
      │
      ▼
Données de test
```

PROD :

```text
WordPress PROD
      │
      ▼
MariaDB PROD
      │
      ▼
Données réelles
```

---

# 27. Checklist nouvelle installation

```text
[ ] Debian 13
[ ] Utilisateur + sudo
[ ] SSH
[ ] Mise à jour Debian
[ ] Apache
[ ] Apache rewrite
[ ] Apache proxy
[ ] Apache proxy_http
[ ] PHP
[ ] MariaDB
[ ] Base WordPress
[ ] WordPress
[ ] VirtualHost Apache
[ ] WooCommerce
[ ] Produit de test
[ ] REST API WordPress
[ ] REST API WooCommerce
[ ] Node.js
[ ] Next.js
[ ] Swap si nécessaire
[ ] npm run dev
[ ] Connexion Next.js → WooCommerce
[ ] npm run build
[ ] npm start
[ ] Reverse proxy Apache
[ ] systemd
[ ] Git
[ ] GitHub
[ ] Branche develop
[ ] GitHub Actions CI
[ ] VPS PROD
[ ] Déploiement automatique
[ ] HTTPS
[ ] Sauvegardes
```

---

# 28. Architecture finale

```text
                              GITHUB
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                 develop                     main
                    │                         │
                    ▼                         ▼
                VPS DEV                  VPS PROD
                    │                         │
             ┌──────┴──────┐           ┌──────┴──────┐
             │             │           │             │
         WordPress      Next.js    WordPress      Next.js
             │             │           │             │
          MariaDB        :3000      MariaDB        :3000
                                                   │
                                                   ▼
                                                Apache
                                               :80/:443
                                                   │
                                                   ▼
                                                Internet
```

## Cycle de travail final

```text
1. Je développe
       ↓
2. git add / commit / push
       ↓
3. GitHub
       ↓
4. GitHub Actions
       ↓
5. Tests + Lint + Build
       ↓
6. VPS DEV
       ↓
7. Je vérifie
       ↓
8. Pull Request
       ↓
9. main
       ↓
10. GitHub Actions
       ↓
11. VPS PROD
       ↓
12. Site mis à jour
```

---

## Commandes essentielles

### Développement

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

### Mise à jour manuelle

```bash
git pull
npm ci
npm run build
sudo systemctl restart mon-projet
```

### Service Next.js

```bash
sudo systemctl status mon-projet
sudo systemctl restart mon-projet
sudo systemctl stop mon-projet
```

### Apache

```bash
sudo /usr/sbin/apache2ctl configtest
sudo systemctl reload apache2
```

### API WooCommerce

```bash
curl -s http://localhost/wp-json/wc/store/v1/products
```

### Vérifier Next.js

```bash
curl -I http://localhost:3000
```

---

## Objectif

Le but final est d'avoir une infrastructure où :

* **WordPress/WooCommerce** gère les données et le commerce.
* **Next.js** gère toute l'interface utilisateur.
* **Apache** sert de point d'entrée et de reverse proxy.
* **GitHub** garde le code source.
* **GitHub Actions** vérifie et construit automatiquement le projet.
* **VPS DEV** permet de tester sans risque.
* **VPS PROD** contient uniquement l'environnement réel.
* Les données DEV et PROD restent totalement séparées.
* Les déploiements peuvent être automatisés.

> **Principe clé :** on développe sur DEV, on versionne avec Git, on valide avec GitHub Actions, puis on déploie vers PROD.

