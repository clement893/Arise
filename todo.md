
## Refactorisation Tailwind CSS - Système de Design Centralisé
- [x] Analyser la version de Tailwind et la configuration actuelle (Tailwind v4)
- [x] Créer le fichier de design tokens (tokens.css - couleurs, typographie, spacing, shadows)
- [x] Créer les fichiers CSS modulaires (cards.css, headers.css, buttons.css, forms.css, badges.css, tables.css, modals.css, utilities.css)
- [x] Mettre à jour les composants UI pour utiliser les tokens (Button, Card, Badge, Input, StatCard)
- [x] Remplacer les couleurs hardcodées par les tokens dans toutes les pages (30 fichiers, 0 couleurs hardcodées restantes)
- [x] Supprimer les styles inline et réduire la duplication de classes
- [x] Pousser sur GitHub (commit 8f8438c)

## Refactorisation Composants Réutilisables
- [x] Installer clsx et class-variance-authority (cva)
- [x] Créer utilitaire cn() pour fusionner les classes
- [x] Créer Button avec variantes (primary, secondary, outline, ghost, danger, loading)
- [x] Créer Card avec variantes et sous-composants (CardHeader, CardContent, CardFooter)
- [x] Créer Input, Textarea, Checkbox, PasswordInput avec accessibilité ARIA
- [x] Créer Select et RadioGroup
- [x] Créer Modal/Dialog avec accessibilité
- [x] Créer Alert/Toast pour les notifications
- [x] Créer Loader, Spinner, Skeleton
- [x] Créer Navbar et Sidebar réutilisables
- [x] Créer composants de liste (ListItem, Avatar, Badge)
- [x] Pousser sur GitHub (commit 95ae7e7)

## Application des composants UI sur toutes les pages
- [ ] Refactoriser src/app/page.tsx (landing page)
- [ ] Refactoriser src/app/admin/page.tsx
- [ ] Refactoriser src/app/admin/assessments/page.tsx
- [ ] Refactoriser src/app/dashboard/360-evaluators/page.tsx
- [ ] Refactoriser src/app/dashboard/360-self/page.tsx
- [ ] Refactoriser src/app/dashboard/development/page.tsx
- [ ] Refactoriser src/app/dashboard/profile/page.tsx
- [ ] Refactoriser src/app/dashboard/results/page.tsx
- [ ] Refactoriser src/app/dashboard/results/wellness-board/page.tsx
- [ ] Refactoriser src/app/dashboard/settings/page.tsx
- [ ] Refactoriser src/app/dashboard/wellness/page.tsx
- [ ] Refactoriser src/app/dashboard/wellness/results/page.tsx
- [ ] Refactoriser src/app/feedback/[token]/page.tsx
- [ ] Refactoriser src/app/pricing/cancel/page.tsx
- [ ] Refactoriser src/app/pricing/success/page.tsx
- [ ] Refactoriser src/app/signup/choose-plan/page.tsx
- [ ] Refactoriser src/app/signup/create-account/page.tsx
- [ ] Refactoriser src/app/signup/plans/page.tsx
- [ ] Refactoriser src/app/signup/profile/page.tsx
- [ ] Refactoriser src/app/signup/review/page.tsx
- [ ] Refactoriser src/app/signup/welcome/page.tsx
- [ ] Refactoriser src/app/about/page.tsx
- [ ] Refactoriser src/app/privacy/page.tsx
- [ ] Refactoriser src/app/terms/page.tsx
