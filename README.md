# Dicodino

Application de jeu en temps réel (type "Définition / mot") : un joueur donne une définition, les autres tentent de deviner le mot.

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

## Résumé des commandes

| Où       | Commande           | Rôle                          |
|----------|--------------------|--------------------------------|
| `server` | `npm run dev`      | Démarrer l’API + Socket.IO     |
| `server` | `npx prisma migrate dev` | Créer/mettre à jour la BDD |
| `client` | `npm run dev`      | Démarrer l’interface React     |

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

---

## Structure du projet

```
dicodino/
├── client/          # Frontend React (Vite)
│   ├── src/
│   └── package.json
├── server/          # Backend Express + Socket.IO
│   ├── prisma/      # Schéma et migrations BDD
│   ├── controllers/
│   ├── routes/
│   └── package.json
└── README.md
```

---

