# Scénarios E2E — Recherche d’offres

Les deux scénarios utilisent le mode d’authentification de démonstration et les
données seed du projet. L’utilisateur choisi est Lucas Dupont, de rôle `STUDENT`.
Pour cet utilisateur, seules les offres publiées sont visibles.

## Scénario 1 — Recherche avec résultat

- **État initial :** l’application est accessible sur le frontend local; Lucas Dupont
  n’est pas encore connecté. Les données seed contiennent notamment l’offre publiée
  **Tableau de bord de qualité des données**. Les autres offres non publiées restent
  invisibles à un étudiant.
- **Actions dans l’interface :**
  1. Ouvrir la page de connexion.
  2. Sélectionner l’utilisateur de démonstration **Lucas Dupont**.
  3. Ouvrir la page **Offres**.
  4. Saisir `tableau` dans **Recherche par titre**.
- **Résultat observable attendu :** une seule offre est affichée dans le tableau :
  **Tableau de bord de qualité des données**. Le compteur affiche `1 offre` et aucune
  offre non publiée n’apparaît.

## Scénario 2 — Recherche sans résultat

- **État initial :** même application et même utilisateur Lucas Dupont; la page
  **Offres** est ouverte et les offres visibles sont chargées.
- **Actions dans l’interface :**
  1. Saisir `introuvable` dans **Recherche par titre**.
- **Résultat observable attendu :** le tableau d’offres disparaît et le message
  **Aucune offre ne correspond à votre recherche.** est visible.
