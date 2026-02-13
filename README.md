# Dicodino

Application de jeu en temps réel (type "Définition / mot") : un joueur donne une définition, les autres tentent de deviner le mot.

---

## Sommaire

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Résumé des commandes](#résumé-des-commandes)
- [Variables d'environnement](#variables-denvironnement)
- [Parcours utilisateur](#parcours-utilisateur)
- [Choix techniques](#choix-techniques)
- [Structure du projet](#structure-du-projet)
- [Dépannage](#dépannage)

---

## Prérequis

- **Node.js** (v18 ou plus récent) — [nodejs.org](https://nodejs.org)
- **PostgreSQL** — base de données du projet
- **npm** (fourni avec Node.js)

---

## Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd dicodino
```

### 2. Base de données (PostgreSQL)

Crée une base de données PostgreSQL (ex. `dicodino`) puis note l’URL de connexion :

```
postgresql://UTILISATEUR:MOT_DE_PASSE@localhost:5432/dicodino
```

### 3. Backend (serveur)

```bash
cd server
npm install
```

Créer un fichier **`.env`** à la racine du dossier `server` avec :

```env
DATABASE_URL="postgresql://UTILISATEUR:MOT_DE_PASSE@localhost:5432/dicodino"
```

Générer le client Prisma et appliquer les migrations :

```bash
npx prisma generate
npx prisma migrate dev
```

Lancer le serveur :

```bash
npm run dev
```

Le serveur tourne par défaut sur **http://localhost:8081**.

### 4. Frontend (client)

Dans un **nouveau terminal** :

```bash
cd client
npm install
```

Créer un fichier **`.env`** à la racine du dossier `client` avec :

```env
VITE_DINOCO_API_URL=http://localhost:8081
```

Lancer le client :

```bash
npm run dev
```

L’application est accessible sur **http://localhost:5173**.

---

## Variables d'environnement

| Fichier   | Variable              | Description                          |
|-----------|------------------------|--------------------------------------|
| `server/.env` | `DATABASE_URL`     | URL de connexion PostgreSQL          |
| `server/.env` | `JWT_SECRET` (optionnel) | Clé pour signer les tokens (défaut : `secret-key`) |
| `client/.env` | `VITE_DINOCO_API_URL` | URL de l’API (ex. `http://localhost:8081`) |

---

## Résumé des commandes

| Où       | Commande                  | Rôle                          |
|----------|---------------------------|--------------------------------|
| `server` | `npm run dev`             | Démarrer l’API + Socket.IO    |
| `server` | `npx prisma migrate dev`  | Créer/mettre à jour la BDD    |
| `server` | `npm run lint`            | Linter le code backend        |
| `client` | `npm run dev`             | Démarrer l’interface React     |
| `client` | `npm run build`           | Build de production            |
| `client` | `npm run preview`         | Prévisualiser le build         |
| `client` | `npm run lint`            | Linter le code frontend       |

---

## Parcours utilisateur

1. **Accueil** — Créer une partie ou rejoindre une partie avec un code, quitter la room en cours.
2. **Création de room** — Choix de catégorie (définitions), génération d’un code de salle.
3. **Rejoindre une room** — Saisie du pseudo et du code ; authentification (claim + JWT) puis entrée en lobby.
4. **Lobby** — Liste des joueurs, démarrage de la partie par l’hôte.
5. **Salle de jeu (ChatRoom)** — Définition affichée, chat en temps réel, envoi de réponses ; premier qui trouve gagne la manche.
6. **Scoring** — Après 5 rounds, affichage des scores et du gagnant.

---

## Choix techniques

### Express (backend)

- **Rôle** : serveur HTTP pour les routes REST (création de salle, rejoindre une partie, etc.).
- **Pourquoi** : simple, léger, très utilisé et bien documenté pour une API Node.js.

### Socket.IO

- **Rôle** : communication **temps réel** entre le serveur et les clients (messages du chat, mise à jour des joueurs, début de manche, etc.).
- **Pourquoi** : adapté au jeu multi-joueurs (événements instantanés, reconnexion, salle par partie).

### Prisma (ORM)

- **Rôle** : accès à la base de données (salles, joueurs, manches, messages) avec un schéma typé en TypeScript.
- **Pourquoi** : schéma clair, migrations automatiques, moins d’SQL brut et meilleure maintenabilité.

### React + Vite (frontend)

- **Rôle** : interface utilisateur (pages Lobby, salle de jeu, chat).
- **Pourquoi** : React pour les composants réutilisables et l’état de l’app ; Vite pour un dev rapide et un build moderne.

### PostgreSQL

- **Rôle** : stockage persistant des salles, joueurs, manches et messages.
- **Pourquoi** : base relationnelle fiable et adaptée aux relations (Room → Players, Rounds, Messages).

### JWT (JSON Web Token)

- **Rôle** : authentification des joueurs pour créer/rejoindre une room (endpoints protégés `requireAuth`).
- **Pourquoi** : stateless, simple à intégrer ; le token est stocké côté client et envoyé dans le header `Authorization: Bearer <token>`.

---

## Structure du projet

```
dicodino/
├── client/                    # Frontend React (Vite)
│   ├── src/
│   │   ├── api/               # Hooks d’appel API (joinRoom, createRoom, leaveRoom, etc.)
│   │   ├── components/        # Composants réutilisables (Header, Button, TextArea, etc.)
│   │   ├── context/           # SocketProvider (connexion Socket.IO)
│   │   ├── pages/             # Pages (Home, Lobby, ChatRoom, Scoring, etc.)
│   │   ├── types/             # Types TypeScript
│   │   └── utils/             # Helpers (auth, env)
│   └── package.json
├── server/                    # Backend Express + Socket.IO
│   ├── auth/                  # JWT (sign, verify, requireAuth)
│   ├── controllers/           # Logique métier (room, lobby, chat, round, auth)
│   ├── prisma/                # Schéma et migrations BDD
│   ├── routes/                # Définition des routes (gameRoutes)
│   ├── index.ts               # Point d’entrée + Socket.IO
│   └── package.json
└── README.md
```

---

## Dépannage

- **Le client ne joint pas l’API** — Vérifier que `VITE_DINOCO_API_URL` dans `client/.env` pointe vers l’URL du serveur (ex. `http://localhost:8081`) et que le serveur est lancé.
- **Erreur de connexion à la BDD** — Vérifier que PostgreSQL tourne et que `DATABASE_URL` dans `server/.env` est correct. Lancer `npx prisma migrate dev` si le schéma a changé.
- **Port 8081 ou 5173 déjà utilisé** — Changer le port dans `server/index.ts` ou dans la config Vite du client, et adapter les URLs dans les `.env`.
- **Token invalide ou expiré** — En rejoignant une room, un JWT est émis (validité 1 jour). En cas d’erreur 401, se déconnecter / rafraîchir et rejoindre à nouveau.

---

