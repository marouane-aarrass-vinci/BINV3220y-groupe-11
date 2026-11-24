# Semaine 5 — Tests E2E, traces et bilan

## Scénarios

Les scénarios détaillés sont dans
[`e2e/recherche-offres/scenarios.md`](../e2e/recherche-offres/scenarios.md).

Le scénario 1 vérifie le cas positif : l’étudiant Lucas Dupont recherche `tableau`
et obtient exactement l’offre publiée **Tableau de bord de qualité des données**.
Le scénario 2 vérifie le cas négatif : une recherche `introuvable` ne retourne
aucune offre et affiche le message d’absence de résultat. Ces deux cas couvrent
un résultat unique et un résultat vide; ils vérifient aussi le filtrage des offres
visibles par un étudiant.

## MCP Playwright

**Scénario exécuté : 1 — Recherche avec résultat.** Dans l’application locale
(`http://localhost:5173`), j’ai ouvert la connexion, sélectionné Lucas Dupont,
ouvert **Offres** et saisi `tableau`. Le résultat observé était `1 offre` :
**Tableau de bord de qualité des données**, société **Lumen Data**, statut
**Publiée**.

Appels MCP réels observés dans la conversation :

| Outil | Requête envoyée | Résultat renvoyé |
| --- | --- | --- |
| `playwright-browser_navigate` | `{"url":"http://localhost:5173"}` | Navigation vers `/`; titre `Gesta`, écran de connexion de démonstration. |
| `playwright-browser_click` | Clic sur le bouton `Lucas Dupont` (référence `e33` du snapshot) | Clic par `getByRole('button', { name: 'Lucas Dupont' })`; URL toujours `/`. Le snapshot suivant a montré Lucas connecté et la navigation principale. |
| `playwright-browser_fill_form` | Champ `Recherche par titre`, valeur `tableau` | Remplissage par `getByRole('searchbox', { name: 'Recherche par titre' }).fill('tableau')`. |
| `playwright-browser_snapshot` | Lecture de la page après le filtrage | Compteur `1 offre`; ligne `Tableau de bord de qualité des données`, `Lumen Data`, `Publiée`. |

## Playwright Test

Le fichier de test est
[`e2e/recherche-offres/recherche-offres.spec.ts`](../e2e/recherche-offres/recherche-offres.spec.ts).
Il contient deux tests nommés avec le numéro de scénario et utilise l’interface
utilisateur avec des sélecteurs accessibles. Le scénario 1 vérifie le titre exact,
le compteur `1 offre`, deux lignes au total dans le tableau (en-tête et unique
résultat) et l’absence d’une autre offre. Le scénario 2 vérifie le message exact
**Aucune offre ne correspond à votre recherche.** et l’absence de tableau.

`@playwright/test` était déjà installé en version 1.65.1; il n’a pas été réinstallé.
La configuration
[`playwright.config.ts`](../playwright.config.ts) utilise `testDir: "./e2e"` et
`http://localhost:5173`. Les tests sont en lecture seule et utilisent les données
seed de Lucas; les deux tests se connectent indépendamment. Dans cette exécution,
`npm run setup` n’a pas été relancé, car les données seed requises étaient déjà
disponibles.

| Commande | Résultat |
| --- | --- |
| `npx playwright test` — 1re exécution | Réussie : **2 tests passés**. |
| `npx playwright test` — 2e exécution consécutive | Réussie : **2 tests passés**. |
| `npm run check` | Réussie : lint, typecheck, **147 tests backend**, **60 tests frontend** et builds backend/frontend. |

## Vérification par mutation

Pour vérifier que les tests détectent une régression, j’ai temporairement remplacé
le filtrage par titre dans `backend/src/services/offers.service.ts` par un retour de
toutes les offres. Les deux tests ont échoué sur leurs assertions attendues, pas
sur la configuration : le scénario 1 ne trouvait plus le compteur `1 offre`, et le
scénario 2 ne trouvait plus le message de recherche sans résultat. J’ai restauré
immédiatement le filtrage original; `npx playwright test` a ensuite réussi avec
**2 tests passés**. La mutation n’est pas conservée.

## Comparaison

1. **Que permet MCP Playwright ?** Il permet à l’agent de piloter le navigateur
   pendant une exploration interactive et d’observer les réponses de l’interface.
   Les appels réels ci-dessus en donnent les traces.
2. **Que permet Playwright Test ?** Il versionne des parcours et assertions
   réexécutables automatiquement, indépendamment d’une conversation Copilot.
3. **Quand utiliser l’un ou l’autre ?** MCP convient à l’exploration et au
   diagnostic guidés; Playwright Test convient aux régressions répétables et à la
   CI. Ils sont complémentaires.

## Export de la conversation

L’export VS Code via **Chat: Export Chat...** a produit une session native
`chat.json` dans [`docs/conversations/`](./conversations/). Le dialogue proposait
uniquement le type **Chat Session**; son contenu a donc été rendu en Markdown dans
[`chat-export.md`](./conversations/chat-export.md), avec les messages et les traces
d’outils de la session exportée.
