# ARISE

Projet Next.js avec TypeScript et PostgreSQL, configuré pour le déploiement sur Railway.

## Stack Technique

- **Framework**: Next.js 16 (App Router)
- **Langage**: TypeScript
- **Base de données**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Déploiement**: Railway

## Prérequis

- Node.js >= 18.0.0
- pnpm (recommandé) ou npm
- PostgreSQL (local ou distant)

## Installation

1. Cloner le repository :
```bash
git clone https://github.com/VOTRE_USERNAME/ARISE.git
cd ARISE
```

2. Installer les dépendances :
```bash
pnpm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env.local
```
Puis modifiez `.env.local` avec vos valeurs.

4. Appliquer les migrations de base de données :
```bash
pnpm db:push
```

5. Lancer le serveur de développement :
```bash
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Scripts disponibles

| Script | Description |
|--------|-------------|
| `pnpm dev` | Lance le serveur de développement |
| `pnpm build` | Compile l'application pour la production |
| `pnpm start` | Lance le serveur de production |
| `pnpm lint` | Vérifie le code avec ESLint |
| `pnpm db:push` | Synchronise le schéma Prisma avec la base de données |
| `pnpm db:migrate` | Applique les migrations en production |
| `pnpm db:studio` | Ouvre Prisma Studio pour gérer les données |

## Déploiement sur Railway

### 1. Créer un projet Railway

1. Connectez-vous à [Railway](https://railway.app)
2. Créez un nouveau projet
3. Connectez votre repository GitHub

### 2. Ajouter PostgreSQL

1. Dans votre projet Railway, cliquez sur "New"
2. Sélectionnez "Database" → "PostgreSQL"
3. Railway configurera automatiquement `DATABASE_URL`

### 3. Variables d'environnement

Configurez les variables suivantes dans Railway (Settings → Variables) :

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Fournie automatiquement par Railway PostgreSQL |
| `NEXT_PUBLIC_APP_URL` | URL de votre application Railway |

### 4. Déployer

Railway déploiera automatiquement à chaque push sur la branche principale.

## Structure du projet

```
arise/
├── prisma/
│   └── schema.prisma      # Schéma de base de données
├── src/
│   ├── app/               # Routes Next.js (App Router)
│   ├── lib/
│   │   └── prisma.ts      # Client Prisma singleton
│   └── components/        # Composants React
├── .env.example           # Template des variables d'environnement
├── railway.toml           # Configuration Railway
├── nixpacks.toml          # Configuration de build
└── package.json
```

## Licence

MIT
