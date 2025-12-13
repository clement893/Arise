# Créer un profil Coach

Pour créer un profil coach pour `clement@clementroy.work`, vous avez plusieurs options :

## Option 1 : Utiliser le script seed (recommandé)

```bash
pnpm seed:coach
```

Ou avec une variable d'environnement pour le mot de passe :
```bash
COACH_PASSWORD="VotreMotDePasse" pnpm seed:coach
```

## Option 2 : Utiliser l'API Admin

Si vous êtes connecté en tant qu'admin, vous pouvez utiliser l'API POST :

```bash
POST /api/admin/users
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "email": "clement@clementroy.work",
  "password": "Coach123!",
  "firstName": "Clement",
  "lastName": "Coach",
  "role": "coach",
  "userType": "coach",
  "plan": "coach"
}
```

## Option 3 : Utiliser Prisma Studio

1. Lancez Prisma Studio :
```bash
pnpm db:studio
```

2. Créez un nouvel utilisateur avec :
   - email: `clement@clementroy.work`
   - password: (hashé avec bcrypt, 12 rounds)
   - role: `coach`
   - userType: `coach`
   - plan: `coach`
   - isActive: `true`
   - emailVerified: `true`

## Option 4 : Via l'interface Admin

1. Connectez-vous en tant qu'admin
2. Allez dans la section Users
3. Créez un nouvel utilisateur
4. Changez le rôle en "coach"

## Notes

- Le mot de passe par défaut généré sera affiché dans la console lors de l'exécution du script
- Changez le mot de passe après la première connexion
- Le script vérifie si l'utilisateur existe déjà et le met à jour si nécessaire

