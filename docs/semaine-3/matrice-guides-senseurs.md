# Matrice — Guides, senseurs et attentes Web 2

Cette matrice décrit les mécanismes observés dans le dépôt et l'audit réalisé. Les passages
du projet sont vérifiés dans les fichiers liés ci-dessous. Aucun support ou note Web 2 n'a
été fourni ; l'absence de source est indiquée plutôt que de présenter une convention du
projet comme une exigence de cours.

## Inventaire et classification

| Famille | Type | Guide ou senseur (emplacement) | Rôle et exemple concret | Vérification pendant la séance |
|---|---|---|---|---|
| Guide | Feedforward inférentiel | [Instructions Copilot](../../.github/copilot-instructions.md#L66) | Décrit les couches et demande de suivre les permissions nommées ; par exemple, les services portent les règles métier et ne reçoivent pas `Request`/`Response`. | Fichier lu. Le dépôt ne permet pas de confirmer si le chargeur Copilot a injecté ces consignes dans chaque interaction. |
| Guide | Feedforward inférentiel | [Architecture](../architecture.md#L24) | Décrit contrôleurs → services → repositories → SQLite, responsabilités, authentification et tests. | Fichier lu pendant la séance. |
| Guide | Feedforward inférentiel | [Contrat de l'API](../../backend/API.md#L179) | Décrit les contrats candidature ; l'identité est tirée de la session et le client ne fournit pas son `studentId`. | Documentation lue et rapprochée du test API. |
| Guide | Feedforward inférentiel | [README](../../README.md#L11) | Donne prérequis, commandes et fonctionnalités implémentées ou absentes ; le retrait d'une candidature y est cité parmi les fonctionnalités non implémentées. | Fichier lu pendant la séance. |
| Senseur | Feedback inférentiel | Revue assistée par Copilot, pendant la séance | Aide à comparer les exigences aux assertions effectives ; a relevé l'absence du retrait et suggéré de vérifier le filtrage indépendant d'un `studentId` fourni par le client. | Analyse réalisée pendant cette séance, puis constats confirmés par lecture du code et exécution d'un test. Pas un contrôle automatisé ou indépendant reproductible. |
| Senseur | Feedback computationnel | Vitest + Supertest ; `backend/tests/` | Exécute les tests d'API avec une base SQLite en mémoire. Le test ajouté vérifie la liste de Lucas malgré un `studentId` d'Inès dans la query. | Exécuté : test ciblé réussi (9 tests dans `myApplications.test.ts`) sous Node 24.22.2 ; suite backend complète (142 tests) réussie. |
| Senseur | Feedback computationnel | Oxlint ; scripts `lint` des workspaces | Applique les règles configurées, dont `typescript/no-explicit-any` et `eqeqeq`. | `npm run check` réussi. |
| Senseur | Feedback computationnel | TypeScript ; scripts `typecheck` et compilation | Vérifie les types avant les tests et la compilation de production. | `npm run check` réussi pour backend et frontend. |
| Senseur | Feedback computationnel | Build backend TypeScript et build frontend Vite | Vérifie la compilation et génère le bundle de production. | `npm run check` réussi pour backend et frontend. |
| Senseur | Feedback computationnel | [`npm run check`](../../package.json#L16) | Orchestre lint, vérification des types, tests et builds. Aucun workflow GitHub Actions n'a été trouvé/configuré pour l'exécuter automatiquement lors d'un push. | Exécuté avec succès sous Node 24.22.2. |

Aucun générateur de code ou guide computationnel indépendant n'a été identifié. Les cellules
ne sont donc pas remplies artificiellement.

## Comparaison avec les pratiques de Web 2

Les « pratiques Web 2 » ci-dessous sont des thèmes à confronter aux supports du cours, pas des
exigences attribuées au cours. Sans source de cours, la correspondance est non évaluable.

| Attente/pratique Web 2 et source vérifiable | Guide du dépôt (passage) | État de couverture par le guide | Écart / complément à fournir |
|---|---|---|---|
| Architecture en couches — source Web 2 non fournie. | [Architecture du dépôt](../architecture.md#L24) et [instructions Copilot](../../.github/copilot-instructions.md#L70). | La séparation est bien documentée comme convention du projet ; **non évaluable** comme attente enseignée en Web 2. | Fournir le support/les notes de cours ; vérifier alors si les dépendances permises entre couches et les responsabilités concordent. |
| Validation des entrées — source Web 2 non fournie. | Les contrôleurs valident les paramètres/corps ([instructions](../../.github/copilot-instructions.md#L74)) ; le [contrat API](../../backend/API.md#L179) détaille les champs et erreurs candidature. | La validation du contrat est documentée ; **non évaluable** vis-à-vis du cours. | Fournir les consignes Web 2 pertinentes pour comparer les pratiques effectivement demandées. |
| Sécurité et autorisations — source Web 2 non fournie. | Les [instructions Copilot](../../.github/copilot-instructions.md#L109) demandent les règles nommées ; le [contrat API](../../backend/API.md#L179) tire l'identité de la session. | Convention projet documentée et testée ; **non évaluable** comme contenu du cours. | Fournir la source de cours ; ensuite préciser les règles d'autorisation vérifiables qui y sont exigées. |
| Accessibilité — source Web 2 non fournie. | Aucun critère d'accessibilité explicite repéré dans les instructions Copilot ou le guide d'architecture consultés. | **Non évaluable** : cette absence n'établit pas que le sujet est ou n'est pas demandé en Web 2. | Fournir les critères de cours avant de recommander une checklist ou de déclarer une lacune du guide. |

Références détaillées et limites : [bilan de séance](./semaine-3.md#4-audit-des-guides-à-la-lumière-de-web-2).
