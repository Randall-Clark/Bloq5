# BLOQ5 — Gestion Immobilière

  > Plateforme de gestion locative immobilière en français, destinée au marché canadien.

  [![Déployé sur](https://img.shields.io/badge/Déployé_sur-DigitalOcean-0080FF?logo=digitalocean)](https://www.bloq5.com)
  [![Stack](https://img.shields.io/badge/Stack-React_+_Express_5_+_PostgreSQL-blue)](#stack)

  ---

  ## Table des matières

  1. [Vue d'ensemble](#vue-densemble)
  2. [Stack technique](#stack-technique)
  3. [Architecture](#architecture)
  4. [Structure du dépôt](#structure-du-dépôt)
  5. [Fonctionnalités](#fonctionnalités)
  6. [Base de données](#base-de-données)
  7. [API REST](#api-rest)
  8. [Authentification](#authentification)
  9. [Espace admin](#espace-admin)
  10. [Déploiement](#déploiement)
  11. [Développement local](#développement-local)
  12. [Variables d'environnement](#variables-denvironnement)
  13. [Notes importantes](#notes-importantes)

  ---

  ## Vue d'ensemble

  BLOQ5 est une plateforme SaaS de gestion immobilière locative ciblant le marché canadien (Montréal, Toronto, Québec, Vancouver). Elle permet aux propriétaires de publier et gérer leurs annonces, aux candidats de soumettre des demandes de location, et aux administrateurs de superviser l'ensemble de la plateforme depuis un tableau de bord centralisé.

  **URL de production :** [www.bloq5.com](https://www.bloq5.com)  
  **Auto-déploiement :** push sur la branche `main` → DigitalOcean App Platform

  ---

  ## Stack technique

  | Couche | Technologie |
  |---|---|
  | **Monorepo** | pnpm workspaces |
  | **Node.js** | v24 |
  | **Frontend** | React 18 + Vite 7 + TypeScript |
  | **Routing (client)** | Wouter |
  | **State / Data fetching** | TanStack Query v5 |
  | **Styling** | Tailwind CSS |
  | **Cartes** | Leaflet + React-Leaflet |
  | **Backend** | Express 5 + TypeScript |
  | **Base de données** | PostgreSQL (Supabase) |
  | **ORM** | Drizzle ORM |
  | **Validation** | Zod v4 + drizzle-zod |
  | **Authentification** | better-auth (email/password + OAuth Google & GitHub) |
  | **API codegen** | Orval (OpenAPI → React Query hooks + Zod schemas) |
  | **Build serveur** | esbuild (bundle CJS) |
  | **Email** | Resend |
  | **Paiements** | Stripe (intégration partielle) |

  ---

  ## Architecture

  ```
                          ┌─────────────────────────┐
                          │  Utilisateur / Navigateur │
                          └────────────┬────────────┘
                                       │ HTTPS
                          ┌────────────▼────────────┐
                          │  DigitalOcean App Platform │
                          │  Reverse Proxy (path-based)│
                          └─────┬──────────┬─────────┘
                                │          │
                 path: /        │          │  path: /api
       ┌──────────────────────┐ │          │ ┌─────────────────────┐
       │  Frontend React/Vite  │◄┘          └►│  API Server Express 5│
       │  (artifact: bloq5)    │             │  (artifact: api-server│
       │  Port: $PORT          │             │   Port: 8080)         │
       └──────────────────────┘             └──────────┬────────────┘
                                                        │
                                            ┌───────────▼───────────┐
                                            │  PostgreSQL (Supabase) │
                                            │  SUPABASE_DATABASE_URL │
                                            └───────────────────────┘
  ```

  ### Routage critique

  - Le proxy partage le trafic par chemin : `/` → frontend, `/api` → backend.
  - **IMPORTANT :** `app.ts` utilise `app.use(router)` (NON `app.use("/api", router)`). Chaque handler de route inclut le préfixe `/api/` directement dans son path. Ne pas modifier ce comportement.

  ---

  ## Structure du dépôt

  ```
  bloq5/
  ├── artifacts/
  │   ├── bloq5/                  # Frontend React + Vite
  │   │   └── src/
  │   │       ├── pages/          # Pages publiques + admin
  │   │       │   ├── admin/      # Tableau de bord admin
  │   │       │   └── ...         # Home, Properties, About, etc.
  │   │       ├── components/     # Composants réutilisables
  │   │       │   ├── layout/     # AdminLayout, SiteFooter, Navbar
  │   │       │   └── ...
  │   │       └── App.tsx         # Routing principal (wouter)
  │   │
  │   └── api-server/             # Backend Express 5
  │       └── src/
  │           ├── routes/         # Handlers REST (propriétés, admin, auth…)
  │           ├── middlewares/    # requireAdmin, CORS, session…
  │           ├── lib/            # migrate.ts, stripeClient, logger
  │           └── index.ts        # Point d'entrée serveur
  │
  ├── lib/
  │   ├── db/                     # Drizzle ORM — schémas + migrations
  │   │   └── src/schema/         # propertiesTable, profilesTable, etc.
  │   ├── api-spec/               # openapi.yaml (contrat API)
  │   ├── api-client-react/       # Hooks React Query générés (Orval)
  │   └── api-zod/                # Schémas Zod générés (Orval)
  │
  ├── scripts/                    # Utilitaires (seed, etc.)
  ├── pnpm-workspace.yaml         # Catalog + overrides
  ├── tsconfig.base.json          # Config TypeScript partagée
  └── replit.md                   # Préférences et notes du projet
  ```

  ---

  ## Fonctionnalités

  ### Site public

  | Page | URL | Description |
  |---|---|---|
  | Accueil | `/` | Hero, recherche, propriétés vedettes |
  | Annonces | `/properties` | Listing avec filtres, vue carte (Leaflet), vue grille |
  | Détail annonce | `/properties/:id` | Photos, infos DPE, co-living, visite virtuelle, candidature |
  | Candidature | `/apply/:id` | Formulaire multi-étapes (informations, pièces jointes, visite) |
  | À propos | `/about` | Présentation de BLOQ5 |
  | Articles | `/articles` | Blog / actualités |
  | Contact | `/contact` | Formulaire de contact |
  | Connexion | `/sign-in` | Email/password + OAuth Google & GitHub |
  | Inscription | `/sign-up` | Création de compte |

  ### Propriétés

  - Filtres : ville, type, prix min/max, superficie, chambres, statut
  - Vue carte avec slider de rayon (1–50 km) et cercle de proximité
  - Types : appartement, maison, studio, co-living (colocation avec chambres individuelles)
  - Champs avancés : numéro d'appartement, étages du bâtiment, DPE (A–G + coût annuel), aides au logement, pièces jointes, plan du bâtiment
  - Badges : DPE, aide au logement, co-living

  ### Co-living

  - Propriétés avec tableau de chambres (numéro, prix, statut, disponibilité)
  - Sélection chambre ou appartement entier à la candidature
  - 5 propriétés co-living seed (IDs 25–29 : Mile End, Plateau, CDN, Toronto, Québec)

  ---

  ## Base de données

  Deux connexions PostgreSQL :
  - **`SUPABASE_DATABASE_URL`** — données applicatives (Drizzle ORM)
  - **`DATABASE_URL`** — base locale Replit (outil executeSql uniquement)

  ### Schémas principaux

  ```
  user                 — Comptes (better-auth)
  profiles             — Rôles (admin, owner, tenant, manager) + clerk_id
  properties           — Annonces immobilières (+ rooms JSON, DPE, attachments)
  rental_requests      — Demandes de location (pending / approved / rejected)
  messages             — Messages liés aux demandes
  subscriptions        — Abonnements propriétaires (Stripe)
  site_settings        — Configuration dynamique du site
  admin_cities         — Villes actives dans l'admin
  ```

  ### Migrations

  Les migrations Drizzle sont appliquées via `pnpm --filter @workspace/db run push` (développement uniquement).

  Une migration de démarrage (`artifacts/api-server/src/lib/migrate.ts`) s'exécute à chaque lancement du serveur pour appliquer les changements qui ne passent pas par `db push` (ajout de colonnes, seed co-living, etc.).

  ### Données de démo

  - **43 propriétés** seed (Montréal, Toronto, Québec, Vancouver) — owner ID : `seed_owner_bloq5`
  - Anciennes démos : owner IDs `demo_owner_1`/`demo_owner_2` (6 propriétés Paris/France)

  ---

  ## API REST

  Toutes les routes sont préfixées `/api/` directement dans le handler.

  ### Propriétés publiques

  ```
  GET  /api/properties              Liste paginée { data, total, page, limit, totalPages }
  GET  /api/properties/featured     Propriétés vedettes []
  GET  /api/properties/:id          Détail d'une propriété
  POST /api/rental-requests         Soumettre une candidature
  ```

  ### Authentification (better-auth)

  ```
  POST /api/auth/sign-in/email
  POST /api/auth/sign-up/email
  POST /api/auth/sign-out
  GET  /api/auth/session
  POST /api/auth/sign-in/social     (Google / GitHub)
  ```

  ### Admin (requiert rôle `admin`)

  ```
  GET    /api/admin/me
  GET    /api/admin/stats                    KPIs globaux
  GET    /api/admin/stats/timeline           Évolution 30j
  GET    /api/admin/users                    Liste utilisateurs (paginée)
  PATCH  /api/admin/users/:id/role           Modifier le rôle
  GET    /api/admin/properties               Liste annonces (paginée, filtrable)
  PATCH  /api/admin/properties/:id           Modifier statut / vedette
  DELETE /api/admin/properties/:id           Supprimer
  GET    /api/admin/requests                 Demandes de location (paginée, filtrable par statut)
  GET    /api/admin/subscriptions            Abonnements
  PATCH  /api/admin/subscriptions/:id        Modifier plan / statut
  GET    /api/admin/conversations            Conversations (messages groupés)
  DELETE /api/admin/conversations/:requestId Supprimer une conversation
  GET    /api/admin/settings                 Paramètres du site
  PUT    /api/admin/settings/:key            Mettre à jour un paramètre
  GET    /api/admin/cities                   Villes actives
  PATCH  /api/admin/cities                   Activer/désactiver une ville
  ```

  ---

  ## Authentification

  Gérée par **better-auth** avec sessions côté serveur (cookies HttpOnly).

  - Email + mot de passe
  - OAuth : Google (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`) et GitHub (`GITHUB_TOKEN`)
  - Les profils admin sont identifiés par `role = 'admin'` dans la table `profiles`

  **Accès admin :** modifier le champ `role` de l'utilisateur dans Supabase → table `profiles`, colonne `role` = `admin`.

  ---

  ## Espace admin

  Accessible à `/admin/*` — protégé par `requireAdmin()` côté API et par un guard React côté frontend.

  ### Pages disponibles

  | Section | URL |
  |---|---|
  | Tableau de bord | `/admin/dashboard` |
  | Tous les contacts | `/admin/users` |
  | Services Providers | `/admin/contacts/providers` |
  | Groups | `/admin/contacts/groups` |
  | Company Leads | `/admin/contacts/company-leads` |
  | Leads Provider | `/admin/contacts/leads-provider` |
  | Import/Export | `/admin/contacts/import-export` |
  | Playbook | `/admin/contacts/playbook` |
  | Messages | `/admin/messages` |
  | Propriétés | `/admin/properties` |
  | Villes actives | `/admin/cities` |
  | Transactions | `/admin/requests` |
  | Abonnements | `/admin/subscriptions` |
  | Statistiques | `/admin/stats` |
  | Paramètres | `/admin/settings` |

  ### Layout admin

  - **Sidebar blanche** avec icônes colorées et accents bleus (`#1d4ed8`)
  - Navigation sans rechargement de page (composant `AdminSection` persistant dans `App.tsx`)
  - **Barre d'outils contextuelle** en bas de la sidebar (7 actions par section, 3 en mode réduit)
  - **Header principal** : titre + icônes (grille, graphiques, notifications, aide, avatar)
  - **Barre de filtres** : Rechercher | Statut | Rating | Group | Assign to | Période (sélecteur de dates) + icônes d'actions

  ### Tableau de bord (données réelles)

  | Widget | Source |
  |---|---|
  | Résumé | `/api/admin/stats` |
  | Activité récente | `/api/admin/requests` + `/api/admin/users` |
  | Demandes en attente | `/api/admin/requests?status=pending` |
  | Statistiques rapides | `/api/admin/stats` |
  | Calendrier | Grille locale (pas d'API calendrier) |

  ---

  ## Déploiement

  ### Production

  Le déploiement est entièrement automatisé via **DigitalOcean App Platform**.

  1. Push sur la branche `main` → déclenchement automatique du build
  2. Build frontend : `vite build`
  3. Build backend : `esbuild` → `dist/index.mjs`
  4. Les migrations de démarrage s'exécutent automatiquement au lancement du serveur

  **Variables d'environnement nécessaires en production :**
  - `DATABASE_URL` / `SUPABASE_DATABASE_URL`
  - `SESSION_SECRET`
  - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
  - `GITHUB_TOKEN`
  - `RESEND_API_KEY`
  - `DO_API_TOKEN`

  ---

  ## Développement local

  ### Prérequis

  - Node.js 24
  - pnpm 10+
  - PostgreSQL (ou accès Supabase)

  ### Installation

  ```bash
  # Cloner le dépôt
  git clone https://github.com/Randall-Clark/Bloq5.git
  cd Bloq5

  # Installer les dépendances
  pnpm install

  # Copier les variables d'environnement
  cp .env.example .env
  # → Remplir les valeurs dans .env
  ```

  ### Démarrage

  ```bash
  # Terminal 1 — API Server (port 8080)
  pnpm --filter @workspace/api-server run dev

  # Terminal 2 — Frontend (port depuis $PORT)
  pnpm --filter @workspace/bloq5 run dev
  ```

  ### Commandes utiles

  ```bash
  # Vérification TypeScript complète
  pnpm run typecheck

  # Build complet
  pnpm run build

  # Régénérer les hooks et schémas Zod depuis l'OpenAPI
  pnpm --filter @workspace/api-spec run codegen

  # Pousser les changements de schéma DB (dev uniquement)
  pnpm --filter @workspace/db run push
  ```

  ---

  ## Variables d'environnement

  | Variable | Description | Requis |
  |---|---|---|
  | `SUPABASE_DATABASE_URL` | URL PostgreSQL Supabase (données app) | ✅ |
  | `DATABASE_URL` | URL PostgreSQL locale (outil admin) | ✅ |
  | `SESSION_SECRET` | Secret pour les sessions better-auth | ✅ |
  | `GOOGLE_CLIENT_ID` | OAuth Google — Client ID | OAuth |
  | `GOOGLE_CLIENT_SECRET` | OAuth Google — Secret | OAuth |
  | `GITHUB_TOKEN` | OAuth GitHub | OAuth |
  | `RESEND_API_KEY` | Clé API Resend (emails) | Email |
  | `DO_API_TOKEN` | Token DigitalOcean (déploiement) | Prod |

  ---

  ## Notes importantes

  ### Génération de code API

  Après toute modification de `lib/api-spec/openapi.yaml` :

  ```bash
  pnpm --filter @workspace/api-spec run codegen
  # Puis vérifier lib/api-zod/src/index.ts
  # → supprimer l'export api.schemas s'il a été ajouté
  ```

  ### Emails propriétaires

  Lors d'une nouvelle candidature (`POST /api/rental-requests`), le serveur logue un bloc `[EMAIL → PROPRIÉTAIRE]` avec tous les détails. L'envoi réel via Resend peut être activé dans `artifacts/api-server/src/routes/rental-requests.ts`.

  ### Co-living

  Les propriétés co-living ont un champ JSON `rooms` sur `propertiesTable`. La saisie d'une propriété co-living nécessite au moins 2 chambres.

  ### Logs

  Ne jamais utiliser `console.log` dans le code serveur. Utiliser `req.log` dans les routes et `logger` en dehors des handlers.

  ---

  ## Licence

  Projet privé — © 2025 BLOQ5. Tous droits réservés.
  