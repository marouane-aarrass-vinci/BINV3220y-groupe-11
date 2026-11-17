# Semaine 9 — Skills, tests et hooks

## Audit des tests EF-32 et EF-33

| Cas à vérifier | Test et assertion utiles | Constat |
|---|---|---|
| Candidater à une offre non publiée | `backend/tests/applications.test.ts` — refuse `SUBMITTED`, `PENDING`, `ASSIGNED` et `ARCHIVED`; vérifie `409` et `OFFER_NOT_PUBLISHED`. | Couvert. |
| Repostuler après une candidature déjà retirée | Même fichier — le cas « déjà retirée » vérifie `409`, `APPLICATION_ALREADY_EXISTS` et qu’une seule ligne reste en base. | La règle anti-doublon est couverte; cela ne teste pas l’action de retrait. |
| Retirer une candidature en cours ou refuser le retrait après traitement | Aucun endpoint de retrait n’existe. | Non testable dans l’API actuelle; le retrait EF-32 reste absent. |
| Empêcher l’accès aux candidatures d’un autre étudiant | `backend/tests/myApplications.test.ts` — un `studentId` d’Inès fourni par Lucas est ignoré; seule la candidature de Lucas est retournée. | Couvert côté API. |
| Exposer les statuts et les candidatures propres à l’étudiant | Même fichier — compare les quatre statuts, le contenu de la réponse, et vérifie `[]` sans candidature. | Couvert. |

Aucun test supplémentaire de candidature n’a été nécessaire : les règles exercées ont déjà
des assertions utiles; le retrait est une fonctionnalité absente, pas une lacune testable
isolément. Les décisions déjà consignées se trouvent dans
[`docs/semaine-2/semaine-2.md`](./semaine-2/semaine-2.md) et
[`docs/semaine-3/matrice-tracabilite-tests.md`](./semaine-3/matrice-tracabilite-tests.md).

## Skills et TDD

Le skill Superpowers `test-driven-development` et sa référence `writing-good-tests.md` sont
installés dans `.github/skills/test-driven-development/`, avec le fichier `LICENSE` MIT
(source : [obra/superpowers](https://github.com/obra/superpowers)). La consigne de pause avant
implémentation est ajoutée au skill et à `.github/copilot-instructions.md`. Le front matter ne
contient pas `disable-model-invocation: true`.

Les tests ont été exécutés avant tout changement applicatif. Résultat rouge attendu :

- API offres : 4 tests échouaient parce que `search` n’était pas appliqué; 16 passaient.
- Interface offres : 2 tests échouaient parce que le champ de recherche n’existait pas; 10
  passaient.

Après l’implémentation, les tests ciblés passent : 21 tests API et 12 tests frontend. Le test
sur `QUALITÉ` vérifie également la casse des lettres accentuées, sans ajouter de recherche
insensible aux accents. L’avis sur ce lot : les attentes sont fondées sur les résultats visibles
par l’API et l’interface, couvrent les filtres et la visibilité, et les échecs initiaux
correspondaient bien à l’absence de la fonctionnalité.

Le dossier `test-gap-audit` n’était pas fourni dans le projet et je n’ai pas accès au paquet
Moodle : ce skill et ses scripts ne sont donc pas installés. `/skills reload`, le test de
déclenchement automatique dans un nouveau chat et l’export Markdown de conversations restent
à faire dans VS Code.

## Recherche d’offres

La recherche porte sur une expression contenue dans le titre, après suppression des espaces
externes et sans distinguer les majuscules/minuscules. Une valeur vide ne filtre pas; plusieurs
mots doivent apparaître dans le même ordre et à la suite. Elle se combine à la période et
respecte les règles de visibilité du rôle. Une recherche sans résultat affiche
« Aucune offre ne correspond à votre recherche. »

Essais réalisés : expression partielle et casse (`TABLEAU DE BORD`), casse accentuée
(`QUALITÉ`), expression à plusieurs mots, recherche vide et absence de correspondance; combinaison
avec `P2`; offre non publiée invisible à l’étudiant et visible à l’administrateur. Dans le
navigateur, connecté comme Lucas, `tableau` et `QUALITÉ` affichent chacun une offre,
`introuvable` affiche le message dédié, et la liste initiale contient les quatre offres
publiées.

`npm run check` réussit : lint, typecheck, 147 tests backend, 60 tests frontend et builds
backend/frontend. La recherche approximative et la normalisation des accents restent hors
périmètre.

## Hook Tool Guardian (optionnel)

Les fichiers `tool-guardian.json` et `guard-tool.cjs` n’étaient pas fournis; l’événement,
la commande de lancement et `permissionDecision: "deny"` n’ont donc pas pu être vérifiés.
Je n’ai pas créé `demo-protected.txt` et n’ai pas prétendu observer un refus de hook. Les deux
essais, leurs traces et la vérification du fichier restent à faire après réception du paquet.