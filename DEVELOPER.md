# BLOQ5 — Documentation Développeur

> Plateforme de gestion immobilière locative (Canada) — résidentiel et commercial.  
> Ce document permet de travailler sur le projet sans assistance d'un agent IA.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture](#2-architecture)
3. [Structure du monorepo](#3-structure-du-monorepo)
4. [Stack technique](#4-stack-technique)
5. [Variables d'environnement](#5-variables-denvironnement)
6. [Installation et démarrage](#6-installation-et-démarrage)
7. [Base de données](#7-base-de-données)
8. [API — Routes backend](#8-api--routes-backend)
9. [Frontend — Pages et routes](#9-frontend--pages-et-routes)
10. [Système de design](#10-système-de-design)
11. [Authentification](#11-authentification)
12. [Abonnements et paiements](#12-abonnements-et-paiements)
13. [Workflow de codegen](#13-workflow-de-codegen)
14. [Migrations au démarrage](#14-migrations-au-démarrage)
15. [Conventions importantes](#15-conventions-importantes)
16. [Roadmap sécurité](#16-roadmap-sécurité)
17. [Commandes utiles](#17-commandes-utiles)

---

## 1. Vue d'ensemble

BLOQ5 est une plateforme SaaS PropTech ciblant le marché canadien. Elle permet :

- **Locataires** : rechercher des biens, déposer un dossier, signer en ligne, suivre leurs demandes
- **Propriétaires (Pro)** : publier des annonces, gérer les demandes, suivre les paiements, gérer une équipe

### Types de biens gérés

| Code | Label |
|------|-------|
| `apartment` | Appartement |
| `house` | Maison |
| `co-living` | Colocation |
| `commercial` | Local commercial |
| `office` | Bureau |

> **Note** : le type `industrial` a été retiré de la plateforme (session mai 2026).

---

## 2. Architecture

```
┌─────────────────────────────────┐
│  Frontend React + Vite          │
│  Route : /  (port $PORT)        │
│  Artifact : bloq5               │
└────────────┬────────────────────┘
             │ appels /api/* via proxy Replit
┌────────────▼────────────────────┐
│  API Express 5                  │
│  Route : /api  (port 8080)      │
│  Artifact : api-server          │
└────────────┬────────────────────┘
             │ Drizzle ORM
┌────────────▼────────────────────┐
│  PostgreSQL Supabase            │
│  SUPABASE_DATABASE_URL          │
└─────────────────────────────────┘
```

### Proxy Replit

Le proxy global route le trafic par chemin :
- `/api/*` → serveur Express (port 8080)
- `/*` → frontend Vite (port `$PORT`)

**Ne jamais appeler les ports directement.** Toujours passer par `localhost:80` en développement.

### Deux bases de données

| Variable | Usage |
|----------|-------|
| `SUPABASE_DATABASE_URL` | Données applicatives — utilisée par Drizzle ORM |
| `DATABASE_URL` | Base locale Replit — uniquement pour l'outil `executeSql` de l'agent IA |

---

## 3. Structure du monorepo

```
/
├── artifacts/
│   ├── api-server/          # Backend Express 5
│   │   ├── src/
│   │   │   ├── app.ts       # Express app (middlewares, router)
│   │   │   ├── index.ts     # Point d'entrée (port, migrations, démarrage)
│   │   │   ├── routes/      # Handlers API
│   │   │   ├── middlewares/ # requireAuth, etc.
│   │   │   └── lib/
│   │   │       ├── migrate.ts      # Migrations au démarrage
│   │   │       ├── logger.ts       # Pino logger
│   │   │       └── stripeClient.ts # Init Stripe (non-bloquant si absent)
│   │   ├── build.mjs        # Build esbuild → dist/
│   │   └── package.json
│   │
│   └── bloq5/               # Frontend React + Vite
│       ├── src/
│       │   ├── App.tsx      # Router wouter + providers
│       │   ├── pages/       # Pages (une par route)
│       │   ├── components/  # Composants réutilisables
│       │   │   ├── layout/  # SiteFooter, PublicNavbar
│       │   │   └── ui/      # shadcn/ui components
│       │   ├── context/     # LocationContext, etc.
│       │   ├── data/        # Données statiques (pays, villes)
│       │   └── lib/         # auth-client, utils
│       └── package.json
│
├── lib/
│   ├── db/                  # Schéma Drizzle + connexion PG
│   │   └── src/schema/      # Tables : properties, auth, profiles, etc.
│   ├── api-spec/            # Spécification OpenAPI (openapi.yaml)
│   │   └── orval.config.ts  # Config génération de code
│   ├── api-client-react/    # Hooks React Query générés par Orval
│   └── api-zod/             # Schémas Zod générés par Orval
│
├── scripts/                 # Scripts utilitaires
├── pnpm-workspace.yaml      # Config monorepo + catalog de versions
├── tsconfig.base.json       # Config TypeScript partagée
├── tsconfig.json            # Solution file (libs composites uniquement)
└── replit.md                # Notes projet pour l'agent IA
```

---

## 4. Stack technique

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Runtime | Node.js | 24 |
| Package manager | pnpm | workspace |
| TypeScript | — | 5.9 |
| Frontend framework | React | 19 |
| Build frontend | Vite | 7 |
| Router frontend | Wouter | 3 |
| Data fetching | TanStack Query | 5 |
| Backend framework | Express | 5 |
| ORM | Drizzle ORM | 0.45 |
| Validation | Zod v4 | 3 |
| Base de données | PostgreSQL (Supabase) | — |
| Authentification | better-auth | — |
| OAuth | Google, GitHub | — |
| Paiements | Stripe (optionnel) | — |
| CSS | Tailwind CSS | 4 |
| Composants UI | shadcn/ui | — |
| Icônes | Lucide React | — |
| Logger | Pino | — |
| Codegen API | Orval | — |
| Build backend | esbuild | — |
| Carte | Leaflet (react-leaflet) | — |

---

## 5. Variables d'environnement

Ces secrets sont requis et gérés via Replit Secrets :

| Variable | Requis | Description |
|----------|--------|-------------|
| `SUPABASE_DATABASE_URL` | ✅ | URL de connexion PostgreSQL Supabase |
| `SESSION_SECRET` | ✅ | Secret pour les sessions better-auth |
| `GOOGLE_CLIENT_ID` | ✅ | OAuth Google (login) |
| `GOOGLE_CLIENT_SECRET` | ✅ | OAuth Google (login) |
| `GITHUB_TOKEN` | ✅ | Token GitHub (push code) |
| `DATABASE_URL` | Replit uniquement | Base locale Replit (pas pour l'app) |

Stripe n'est **pas encore configuré**. Le serveur démarre même si Stripe échoue (non-bloquant).

### Hors de Replit (développement local)

Créer un fichier `.env` à la racine avec ces variables, puis utiliser `dotenv` ou `pnpm exec tsx` avec `--env-file=.env`.

---

## 6. Installation et démarrage

### Prérequis

- Node.js 24+
- pnpm 9+
- Accès à une base PostgreSQL (Supabase ou locale)

### Installation

```bash
pnpm install
```

### Démarrer le backend

```bash
pnpm --filter @workspace/api-server run dev
```

Le serveur écoute sur le port défini par `$PORT` (8080 par défaut via Replit).

### Démarrer le frontend

```bash
pnpm --filter @workspace/bloq5 run dev
```

Le frontend écoute sur le port défini par `$PORT`.

### En production (Replit)

Les deux services sont gérés par des **workflows Replit** configurés dans `.replit-artifact/artifact.toml`. Ils démarrent automatiquement.

---

## 7. Base de données

### Connexion

```typescript
// lib/db/src/index.ts
import { db, pool } from "@workspace/db";
```

### Schéma — tables principales

#### `properties` (biens immobiliers)

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | serial PK | Identifiant |
| `title` | text | Titre de l'annonce |
| `description` | text | Description |
| `type` | enum | `house`, `apartment`, `co-living`, `commercial`, `office` |
| `address` | text | Adresse complète |
| `city` | text | Ville |
| `country` | text | Pays (défaut : `Canada`) |
| `price` | numeric | Loyer mensuel |
| `bedrooms` | integer | Chambres |
| `bathrooms` | integer | Salles de bain |
| `area` | numeric | Superficie (m²) |
| `images` | jsonb `string[]` | URLs des photos |
| `virtual_tour_url` | text | URL visite virtuelle |
| `status` | enum | `available`, `rented`, `unavailable` |
| `is_featured` | boolean | Mis en avant sur la home |
| `views` | integer | Nombre de vues |
| `amenities` | jsonb `string[]` | Équipements |
| `available_dates` | jsonb `string[]` | Dates disponibles |
| `rooms` | jsonb | Chambres co-living `{number, price, status, availableFrom}[]` |
| `floor` | integer | Étage (-1 = sous-sol, 0 = RDC) |
| `floor_plan` | text | URL plan d'étage |
| `nearby_places` | jsonb `string[]` | Points d'intérêt proches |
| `apartment_number` | text | Numéro d'appartement |
| `building_floors` | integer | Nombre total d'étages |
| `housing_aid_eligible` | boolean | Éligible aux aides au logement |
| `dpe_class` | text | Classe DPE (A-G) |
| `dpe_annual_cost_min` | integer | Coût énergie annuel min (€) |
| `dpe_annual_cost_max` | integer | Coût énergie annuel max (€) |
| `attachments` | jsonb | Pièces jointes `{name, url}[]` |
| `owner_id` | text | ID du propriétaire (better-auth user.id) |
| `created_at` | timestamp | Date de création |
| `updated_at` | timestamp | Date de modification |

#### Tables d'authentification (better-auth)

- `user` — comptes utilisateurs (id, email, name, emailVerified, image)
- `session` — sessions actives
- `account` — comptes OAuth liés (Google, GitHub)
- `verification` — tokens de vérification email

#### Autres tables

- `subscriptions` — abonnements Pro (free, starter, pro, enterprise)
- `profiles` — profils étendus (legacy Clerk, colonnes `clerk_id`, `pro_email`, etc.)
- `rental_requests` — demandes de location
- `favorites` — biens favoris par utilisateur
- `visits` — visites planifiées
- `messages` — messagerie entre locataire et propriétaire
- `managers` — gestionnaires Pro (équipe)
- `pro_otp` — codes OTP pour authentification Pro

### Push du schéma (développement)

```bash
pnpm --filter @workspace/db run push
```

> **Attention** : utiliser uniquement en développement. En production, les changements de schéma passent par les migrations au démarrage (`migrate.ts`).

---

## 8. API — Routes backend

### Note critique sur le routage

```typescript
// app.ts
app.use(router);  // PAS app.use("/api", router) !
```

Chaque handler inclut le préfixe `/api/` lui-même. Ne jamais changer en `app.use("/api", router)` — cela casserait toutes les routes.

### Endpoints disponibles

#### Propriétés

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/properties` | — | Liste paginée avec filtres |
| GET | `/api/properties/featured` | — | Biens mis en avant (home) |
| GET | `/api/properties/:id` | — | Détail d'un bien (incrémente views) |
| GET | `/api/properties/:id/available-dates` | — | Dates disponibles |
| GET | `/api/properties/:id/rental-requests` | Auth Pro | Demandes pour ce bien |
| POST | `/api/properties` | Auth Pro | Créer un bien |
| PUT | `/api/properties/:id` | Auth Pro | Modifier un bien |
| DELETE | `/api/properties/:id` | Auth Pro | Supprimer un bien |

**Filtres GET /api/properties** :

```
?page=1&limit=12&type=apartment&city=Montréal&minPrice=1000&maxPrice=3000&bedrooms=2
```

La recherche par `city` est élargie aux champs `city`, `address` et `title` via `ilike`.

**Réponse** :
```json
{
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 12,
  "totalPages": 4
}
```

#### Demandes de location

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/rental-requests` | Auth | Soumettre une demande |
| GET | `/api/rental-requests` | Auth | Demandes de l'utilisateur |
| GET | `/api/rental-requests/:id` | Auth | Détail d'une demande |
| PATCH | `/api/rental-requests/:id/status` | Auth Pro | Accepter/Refuser |

#### Dashboard Pro

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/dashboard/stats` | Auth Pro | Statistiques globales |
| GET | `/api/dashboard/properties` | Auth Pro | Biens du propriétaire |

#### Abonnements

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/subscriptions/current` | Auth | Abonnement actuel |
| GET | `/api/subscriptions/plans` | — | Plans disponibles |
| POST | `/api/subscriptions/checkout` | Auth | Créer session Stripe |
| POST | `/api/subscriptions/verify-checkout` | Auth | Confirmer paiement |
| POST | `/api/subscriptions/cancel` | Auth | Annuler abonnement |
| GET | `/api/subscriptions/payment-methods` | Auth | Méthodes de paiement |
| POST | `/api/subscriptions/portal` | Auth | Portail Stripe |

#### Autres

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/healthz` | Health check |
| GET/POST | `/api/profile` | Profil utilisateur |
| GET/POST/DELETE | `/api/favorites` | Favoris |
| GET/POST | `/api/visits` | Visites planifiées |
| GET/POST | `/api/messages` | Messagerie |
| GET/POST/DELETE | `/api/managers` | Équipe Pro |
| POST | `/api/pro/auth/send-otp` | OTP Pro |
| POST | `/api/pro/auth/verify-otp` | Vérification OTP |

---

## 9. Frontend — Pages et routes

### Routes publiques

| Route | Fichier | Description |
|-------|---------|-------------|
| `/` | `home.tsx` | Page d'accueil |
| `/about` | `about.tsx` | À propos |
| `/articles` | `articles.tsx` | Blog / Articles |
| `/contact` | `contact.tsx` | Contact |
| `/properties` | `properties.tsx` | Liste des biens avec filtres |
| `/properties/:id` | `property-detail.tsx` | Détail d'un bien |
| `/cities` | `cities.tsx` | Biens par ville |

### Routes locataire (auth requise)

| Route | Fichier | Description |
|-------|---------|-------------|
| `/properties/:id/apply` | `property-application.tsx` | Dossier de candidature |
| `/properties/:id/dossier` | `property-dossier.tsx` | Dossier locataire |
| `/profile` | `profile.tsx` | Profil utilisateur |
| `/profile/requests` | `profile-requests.tsx` | Mes demandes |
| `/profile/requests/:id` | `profile-request-detail.tsx` | Détail demande |
| `/profile/favorites` | `profile-favorites.tsx` | Mes favoris |
| `/profile/visits` | `profile-visits.tsx` | Mes visites |

### Routes Pro (propriétaires)

| Route | Fichier | Description |
|-------|---------|-------------|
| `/pro/dashboard` | `pro-dashboard.tsx` | Tableau de bord |
| `/pro/properties` | `pro-properties.tsx` | Mes biens |
| `/pro/properties/new` | `pro-property-new.tsx` | Publier un bien |
| `/pro/properties/:id/edit` | `pro-property-edit.tsx` | Modifier un bien |
| `/pro/requests` | `pro-requests.tsx` | Demandes reçues |
| `/pro/requests/:id` | `pro-request-detail.tsx` | Détail demande |
| `/pro/managers` | `pro-managers.tsx` | Gestion équipe |
| `/pro/subscription` | `pro-subscription.tsx` | Abonnement Pro |
| `/pro/profile` | `pro-profile.tsx` | Profil Pro |
| `/pro/pricing` | `pro-pricing.tsx` | Tarifs |

### Composants partagés

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `PublicNavbar` | `components/public-navbar.tsx` | Navbar publique |
| `SiteFooter` | `components/layout/site-footer.tsx` | Footer (toutes pages publiques) |
| `LocationPopup` | `components/location-popup.tsx` | Sélecteur de localisation |
| `PropertiesMapView` | `components/properties-map-view.tsx` | Carte Leaflet |
| `AddressInput` | `components/address-input.tsx` | Input adresse avec validation Nominatim |

---

## 10. Système de design

### Palette de couleurs

| Rôle | Valeur |
|------|--------|
| Jaune principal | `#F5A623` |
| Jaune survol/sombre | `#d4901f` |
| Texte foncé principal | `#1A1A1A` |
| Texte secondaire | `#555555` |
| Fond gris léger | `#F5F5F5` |
| Bordures | `#E8E8E8` / `border-gray-200` |

### Conventions de style

- **Arrondis** : `rounded-xl` (cards), `rounded-2xl` (modals), `rounded-lg` (inputs), `rounded-full` (badges/pills)
- **Ombres** : `shadow-sm` (repos), `hover:shadow-md` (survol)
- **Boutons jaunes** : fond `#F5A623` + texte `text-[#1A1A1A]` (jamais blanc sur jaune)
- **Boutons foncés** : fond `#1A1A1A` + texte `text-white`
- **Z-index modals** : toujours `z-[9999]` pour passer au-dessus de Leaflet

### Variable CSS à utiliser

```typescript
const YELLOW = "#F5A623";
```

---

## 11. Authentification

Gérée par **better-auth** avec :

- Email + mot de passe
- OAuth Google (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)
- OAuth GitHub

### Client frontend

```typescript
import { authClient } from "@/lib/auth-client";

// Session courante
const { data: session } = authClient.useSession();
const user = session?.user;
const isSignedIn = !!session;
```

### Middleware backend

```typescript
import { requireAuth, getAuthUser } from "../middlewares/requireAuth";

router.get("/api/ma-route", requireAuth, async (req, res) => {
  const user = await getAuthUser(req);
  // user.id, user.email, user.name
});
```

### Utilisateur de démo

- Email : `demo@bloq5.ca`
- ID : `V4YNEh3EpD247Tb6gkbXJ0nm3KNuALXd`
- Abonnement : Free (id: 2)

---

## 12. Abonnements et paiements

### Plans disponibles

| Plan | ID | Biens | Prix |
|------|----|-------|------|
| Free | `free` | 1 bien | 0 $/mois |
| Starter | `starter` | 3 biens | 29 $/mois |
| Pro | `pro` | 10 biens | 79 $/mois |
| Enterprise | `enterprise` | illimité | 199 $/mois |

### Stripe

Stripe est **optionnel** pour le moment. Si les variables Stripe ne sont pas configurées, le serveur démarre quand même (erreur non-bloquante au démarrage). Les fonctionnalités de paiement sont désactivées silencieusement.

Pour activer Stripe, configurer :
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

---

## 13. Workflow de codegen

Le client API (hooks React Query + types Zod) est **généré automatiquement** depuis `lib/api-spec/openapi.yaml`.

### Quand relancer le codegen

Après toute modification de `openapi.yaml`.

### Commande

```bash
pnpm --filter @workspace/api-spec run codegen
```

### Fichiers générés

| Package | Fichier | Contenu |
|---------|---------|---------|
| `lib/api-client-react` | `src/generated/api.ts` | Hooks React Query |
| `lib/api-client-react` | `src/generated/api.schemas.ts` | Types TypeScript |
| `lib/api-zod` | `src/generated/api.ts` | Schémas Zod |

### Attention après codegen

Le fichier `lib/api-zod/src/index.ts` doit exporter **uniquement** `./generated/api` :

```typescript
// lib/api-zod/src/index.ts — NE PAS ajouter api.schemas ici
export * from "./generated/api";
```

Le générateur Zod ne produit **pas** de fichier `api.schemas.ts` (contrairement au générateur React Query).

### Après codegen, redémarrer les deux workflows

```
artifacts/api-server: API Server
artifacts/bloq5: web
```

---

## 14. Migrations au démarrage

Le fichier `artifacts/api-server/src/lib/migrate.ts` s'exécute **automatiquement au démarrage du serveur** (avant que Express commence à écouter).

Il gère :

1. Création de la table `pro_otp`
2. Ajout des colonnes Stripe à `subscriptions`
3. Ajout des colonnes Pro à `profiles`
4. Ajout des colonnes Phase 1.1 à `properties` (`apartment_number`, `dpe_class`, `attachments`, etc.)
5. Suppression de la valeur `industrial` de l'enum `property_type`
6. Seed des chambres co-living pour les propriétés IDs 25–29 (si elles existent)

### Ajouter une migration

```typescript
// Dans runMigrations(), avant le bloc co-living :
await addColumnIfMissing(client, "ma_colonne", "text");
```

Pour les opérations plus complexes (enums, tables entières) :

```typescript
const exists = await client.query(`SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'ma_table' AND column_name = 'ma_colonne'`);
if (!exists.rowCount) {
  await client.query(`ALTER TABLE ma_table ADD COLUMN ma_colonne text`);
}
```

---

## 15. Conventions importantes

### Logging

**Ne jamais utiliser `console.log` dans le code serveur.**

```typescript
// Dans les route handlers :
req.log.info("message");
req.log.error({ err }, "erreur");

// Hors handlers (modules, init) :
import { logger } from "./lib/logger";
logger.info("démarrage");
```

### Imports cross-packages

Les `artifacts/*` ne doivent pas s'importer entre eux. Pour partager du code, créer un package dans `lib/`.

### Types de propriétés dans le frontend

Les validations Zod dans les formulaires Pro doivent rester synchronisées avec l'enum DB :

```typescript
type: z.enum(["house", "apartment", "co-living", "commercial", "office"]),
```

### Recherche de propriétés

La recherche par `city` côté API fait un `OR` sur trois colonnes :

```typescript
or(
  ilike(propertiesTable.city, `%${city}%`),
  ilike(propertiesTable.address, `%${city}%`),
  ilike(propertiesTable.title, `%${city}%`),
)
```

### Validation d'adresse

Le composant `AddressInput` appelle l'API Nominatim (OpenStreetMap) avec :
- Debounce 600 ms
- Minimum 10 caractères
- `countrycodes=ca` (Canada uniquement)

---

## 16. Roadmap sécurité

Ces éléments sont **prévus mais non encore implémentés** :

### Haute priorité

- [ ] **RLS Supabase** — activer Row Level Security sur toutes les tables. Chaque table doit avoir des politiques définissant qui peut lire/écrire quoi (ex. : un propriétaire ne voit que ses propres biens).
- [ ] **Chiffrement données utilisateurs** — chiffrer les PII au repos (email, téléphone, adresse résidentielle, pièces jointes) avec une clé de chiffrement applicative (ex. : AES-256-GCM).
- [ ] **Headers de sécurité** — ajouter Helmet.js ou équivalent : `HSTS`, `CSP`, `X-Frame-Options`, `X-Content-Type-Options`.

### Moyenne priorité

- [ ] **Chiffrement base de données** — activer le chiffrement transparent (TDE) côté Supabase (disponible sur les plans Supabase Pro+).
- [ ] **Audit log** — journaliser les actions sensibles (connexions, modifications de bail, changements de statut).
- [ ] **Rate limiting** — protéger les routes d'auth et les endpoints publics contre les attaques par force brute.
- [ ] **Validation de fichiers** — les pièces jointes sont actuellement stockées en base64 dans la DB. Migrer vers un stockage objet (Supabase Storage ou S3) avec scan antivirus.

### Basse priorité

- [ ] **RGPD / Loi 25 (Québec)** — politique de confidentialité, droit à l'effacement, export des données.
- [ ] **Pénétration testing** — audit de sécurité avant mise en production publique.

---

## 17. Commandes utiles

```bash
# Vérification TypeScript complète
pnpm run typecheck

# Build complet
pnpm run build

# Codegen API depuis OpenAPI
pnpm --filter @workspace/api-spec run codegen

# Push schéma DB (dev uniquement)
pnpm --filter @workspace/db run push

# Démarrer le backend
pnpm --filter @workspace/api-server run dev

# Démarrer le frontend
pnpm --filter @workspace/bloq5 run dev

# Requête directe à l'API (via proxy)
curl http://localhost:80/api/properties
curl http://localhost:80/healthz

# Requête Supabase directe (shell)
psql "$SUPABASE_DATABASE_URL" -c "SELECT COUNT(*) FROM properties;"

# Lister les tables
psql "$SUPABASE_DATABASE_URL" -c "\dt"

# Vérifier les valeurs d'un enum PostgreSQL
psql "$SUPABASE_DATABASE_URL" -c "SELECT enumlabel FROM pg_enum WHERE enumtypid = 'property_type'::regtype;"
```

---

## Notes de session (mai 2026)

- La DB Supabase a été nettoyée : seul l'utilisateur `demo@bloq5.ca` existe avec un abonnement Free.
- Les 43 propriétés de démo ont été supprimées — la DB est vide.
- Le type `industrial` a été retiré de l'enum PostgreSQL via migration au démarrage.
- La recherche de biens couvre désormais `city`, `address` et `title`.
- Les pages publiques (`/about`, `/articles`, `/contact`) utilisent `SiteFooter` partagé.

---

*Document généré le 7 mai 2026. Maintenir à jour lors de chaque session de développement importante.*
