# Semaine 8 — Bilan du harnais agentique

## 1. Guides et senseurs repérés

Un guide oriente le travail en amont ; un senseur exécute une vérification et retourne un
résultat. L'inventaire porte sur les consignes Copilot, les documentations de développement,
les scripts et configurations du dépôt. Les emplacements cités ont été ouverts et vérifiés.

| | Guide — feedforward | Senseur — feedback |
|---|---|---|
| **Inférentiel** | **Instructions Copilot** — [`.github/copilot-instructions.md`](../.github/copilot-instructions.md#L66) : décrit les couches backend et frontend, demande de suivre les règles d'accès nommées et de reprendre les parcours de référence. Exemple : les services portent les règles métier et ne reçoivent pas `Request`/`Response` ([lignes 70–76](../.github/copilot-instructions.md#L70)). Présent et consulté pendant la séance ; l'activation par le chargeur Copilot n'est pas observable par un contrôle du dépôt. **Documentation d'architecture** — [`docs/architecture.md`](./architecture.md#L24) : détaille les responsabilités, l'authentification, les tests en mémoire et les parcours. Consultée pendant la séance. **Documentation de l'API** — [`backend/API.md`](../backend/API.md#L179) : précise le contrat, par exemple que l'identité de la candidature provient de la session et que `GET /applications` n'accepte aucun paramètre. Consultée pendant la séance. **README** — [`README.md`](../README.md#L11) : prérequis, commandes et fonctionnalités explicitement non implémentées. Consulté pendant la séance. | **Revue assistée par Copilot pendant cette séance** : comparaison des exigences aux assertions effectivement lues, puis retour documenté dans ce bilan. Elle a notamment mis en évidence l'absence du retrait et motivé le test de résistance à un `studentId` fourni en query. Exécutée pendant la séance ; ce n'est pas une revue automatisée ni un contrôle indépendant reproductible. Aucun outil de revue IA automatique ou workflow de revue n'a été trouvé/configuré dans `.github/`. |
| **Computationnel** | Aucun générateur de code ou autre guide exécutable de ce type n'a été identifié dans le dépôt. | **Vitest/Supertest** : tests backend sur SQLite en mémoire ; **Oxlint** : règles configurées pour TypeScript, entre autres `no-explicit-any` et `eqeqeq` ; **TypeScript** : vérifications de types et compilation ; **Vite** : build frontend. Les scripts sont chaînés dans [`package.json`](../package.json#L16) par `npm run check` (lint, typecheck, tests, build). Ces senseurs ont été exécutés pour cette séance ; détails des résultats ci-dessous. |

Il n'y a pas de workflow GitHub Actions dans le dépôt : les contrôles ci-dessus sont disponibles
localement, mais leur exécution automatique à chaque push n'est pas établie.

## 2. Couverture des exigences EF-32 et EF-33

Références : [EF-32 et EF-33 du cahier des charges](./cdc_gesta_developpement.md#L199).
« Couvert » signifie que les assertions vérifient le résultat attendu, pas seulement que la
route a répondu.

### EF-32 — Candidater et retirer sa candidature

| Cas à vérifier | Test existant (fichier et nom) | Assertions utiles | Couverture |
|---|---|---|---|
| Un étudiant candidate à une offre publiée, avec un message facultatif. | [`backend/tests/applications.test.ts`](../backend/tests/applications.test.ts) — « crée une candidature pour l'étudiant connecté avec son message facultatif » | `201`, champs attendus (`offerId`, message nettoyé, `IN_PROGRESS`), identifiants/date, absence de `studentId` dans la réponse et ligne créée en base. | Couvert |
| Le message peut être omis ou vide. | Même fichier — « accepte un message omis ou vide » | `201` et `message === null`. | Couvert |
| Seul un étudiant connecté peut candidater. | Même fichier — « refuse une requête sans session (401) » et « refuse un administrateur/contact déposant (403) » | Statuts `401`/`403` ; pour le refus par rôle, code `FORBIDDEN`. | Couvert |
| Une offre inexistante est refusée. | Même fichier — « refuse une offre inexistante » | `404` et code `OFFER_NOT_FOUND`. | Couvert |
| Une offre non publiée est refusée. | Même fichier — « refuse une offre au statut %s » | Pour chacun des statuts `SUBMITTED`, `PENDING`, `ASSIGNED`, `ARCHIVED` : `409` et `OFFER_NOT_PUBLISHED`. Ce sont tous les statuts non publiés de [`OFFER_STATUSES`](../backend/src/models/offer.ts). | Couvert |
| Les paramètres et corps invalides sont refusés ; le client ne choisit pas l'étudiant. | Même fichier — « rejette un identifiant invalide (%s) » et « rejette un corps invalide (%s) » | `400`, codes `INVALID_PARAM`/`INVALID_BODY`, notamment lorsque `studentId` est ajouté au corps. | Couvert |
| Une deuxième candidature au même couple étudiant/offre est refusée, même après retrait. | Même fichier — « empêche une candidature %s pour le même étudiant et la même offre » | `409`, code `APPLICATION_ALREADY_EXISTS`, et compteur de lignes restant à `1` ; cas seedé « déjà retirée » inclus. | Couvert |
| L'étudiant peut retirer sa propre candidature tant qu'elle n'est pas traitée. | Aucun endpoint de retrait dans les routes consultées ; le [README](../README.md#L103) le donne explicitement comme non implémenté. | Aucun test API ne peut vérifier le résultat fonctionnel d'une route inexistante. | **Absent** |
| Le retrait est refusé pour une candidature déjà traitée. | Aucun endpoint de retrait ni test correspondant. | Le cas ne peut pas être exercé sans implémenter d'abord la fonctionnalité. | **Absent** |

La création est bien testée pour les statuts non publiés, mais la partie « retirer » de EF-32
n'est pas réalisée. Les deux cas absents ne sont donc pas comptés comme couverts.

### EF-33 — Consulter ses candidatures et leur statut

| Cas à vérifier | Test existant (fichier et nom) | Assertions utiles | Couverture |
|---|---|---|---|
| Une requête sans session est refusée ; un administrateur ou un contact ne peut pas consulter la liste étudiant. | [`backend/tests/myApplications.test.ts`](../backend/tests/myApplications.test.ts) — tests de « GET /applications : accès » | `401` sans session ; `403` et `FORBIDDEN` pour les rôles testés. | Couvert |
| L'étudiant ne voit que ses candidatures, même si le client fournit l'identifiant d'un autre étudiant. | Même fichier — « retourne uniquement les candidatures de l'étudiant authentifié et les informations utiles » et **nouveau** test « ignore un studentId fourni par le client et filtre selon la session » | La première réponse est comparée à la candidature attendue de Lucas ; le seed contient aussi celle d'Inès pour la même offre. Le nouveau test envoie `?studentId=...Inès`, vérifie `200`, ne reçoit que l'identifiant de Lucas et vérifie que l'identifiant de la candidature d'Inès est absent. | Couvert |
| Les statuts « En cours », « Retenue », « Non retenue » et « Retirée » sont retournés. | Même fichier — « expose les quatre statuts du domaine dans la liste des étudiants concernés » | Comparaison effective des statuts `SELECTED`, `REJECTED`, `IN_PROGRESS`, `WITHDRAWN`. | Couvert |
| Les informations affichées et le message/statut correspondent à la candidature. | Même fichier — « retourne uniquement les candidatures de l'étudiant authentifié et les informations utiles » | Comparaison exacte du corps : offre, entreprise, année, période, message, statut et date ; absence de `studentId`. | Couvert |
| Un étudiant sans candidature reçoit une liste vide. | Même fichier — « retourne une liste vide pour un étudiant sans candidature » | `200` et corps égal à `[]`. | Couvert |

Le titre d'un test parle de consulter « sans permettre de modifier une candidature », mais ses
assertions portent sur la réponse de lecture ; il ne prouve pas l'absence d'une mutation API.
L'absence de fonctionnalité de retrait est documentée séparément plutôt que déduite de ce titre.

### Autres comportements testés

Les tests d'authentification, de permissions générales, de liste des offres, de contraintes de
base/migrations/seed et les tests d'interface des offres ou de la page « Mes candidatures »
vérifient aussi des comportements utiles. Ils ne sont pas assimilés automatiquement à une preuve
API d'EF-32/EF-33. Les tests de page frontend vérifient l'affichage à partir de réponses simulées,
pas l'isolation serveur.

## 3. Modification et vérification

### Test ajouté

Dans [`backend/tests/myApplications.test.ts`](../backend/tests/myApplications.test.ts), un
étudiant (Lucas) demande la liste avec le `studentId` d'Inès dans la query. Le test vérifie que
seule la candidature de Lucas est retournée. Il échouerait si une modification de la route ou
du service utilisait cet identifiant fourni par le client pour sélectionner les données et
divulguait la candidature d'Inès. Le résultat a été vérifié avec la suite ciblée et la suite
complète.

Le retrait n'a pas été implémenté : conformément au périmètre d'audit/test, son absence est
consignée et le test ciblé ne simule pas une fonctionnalité inexistante. Aucune vérification
manuelle dans un navigateur ou contre un serveur lancé n'a été faite ; les conclusions viennent
des fichiers ouverts et des tests exécutés.

### Résultats

La version Node installée par défaut était `22.13.1`, inférieure au minimum `22.14` du projet.
La suite ciblée a d'abord échoué dans son fichier de setup avant d'exécuter des tests, avec le
message explicite « Node 22.13.1 est trop ancien ». Les validations réussies ont ensuite été
exécutées avec Node `24.22.2` temporaire via le paquet npm `node@24`.

| Commande / contrôle | Résultat |
|---|---|
| `npm ci` | Réussi ; dépendances restaurées depuis le lockfile. L'avertissement `EBADENGINE` signale que Node par défaut (`22.13.1`) est sous le minimum déclaré. |
| `npm run test -w backend -- --run tests/myApplications.test.ts` sous Node `22.13.1` | Échec de prérequis avant les tests : Node trop ancien, **0 test exécuté**. |
| `npx --yes --package=node@24 --call 'node --version && npm run test -w backend -- --run tests/myApplications.test.ts'` | Réussi sous Node `24.22.2` : 1 fichier, **9 tests passés**. |
| `npx --yes --package=node@24 --call 'node --version && npm run check'` | Réussi sous Node `24.22.2` : lint backend/frontend, typecheck backend/frontend, **142 tests backend + 58 frontend**, build backend et frontend. |

## 4. Audit des guides à la lumière de Web 2

Aucun support, note ou consigne de développement Web 2 n'a été fourni ou retrouvé dans le dépôt.
Le dépôt contient des conventions de projet et `docs/architecture.md` indique que le frontend
suit le « modèle MVVM du cours », mais cela ne constitue pas une source suffisante pour établir
ce qui a effectivement été enseigné. Pour ne pas attribuer au cours des prescriptions non
vérifiées, la correspondance avec Web 2 est donc indiquée comme **non évaluable**.

| Attente ou convention de Web 2 (source) | Guide examiné (fichier et passage) | Correspondance | Écart ou ajout proposé |
|---|---|---|---|
| Architecture en couches : **aucune source Web 2 disponible** pour confirmer cette attente. | [`docs/architecture.md`](./architecture.md#L24) décrit contrôleurs → services → repositories ; [instructions Copilot](../.github/copilot-instructions.md#L70) donnent les responsabilités des couches. | **Non évaluable comme attente de Web 2** ; cohérent avec l'architecture que le projet documente lui-même. | Fournir une source de cours et y rattacher précisément les consignes. Le guide pourrait alors indiquer les dépendances permises/interdites entre couches. |
| Validation des entrées : **aucune source Web 2 disponible**. | Les instructions attribuent validation/réponse aux contrôleurs ([`.github/copilot-instructions.md`](../.github/copilot-instructions.md#L74)) ; [`backend/API.md`](../backend/API.md#L179) précise les champs, erreurs et limites du contrat candidature. | **Non évaluable comme attente de Web 2** ; la validation est décrite au niveau du projet. | Avec une référence de cours, comparer les pratiques attendues aux validateurs réellement documentés ; ne pas ajouter de règle de cours supposée. |
| Sécurité et autorisations : **aucune source Web 2 disponible**. | Les instructions demandent de suivre les règles d'accès nommées ([lignes 109–115](../.github/copilot-instructions.md#L109)) ; l'API précise que l'identité vient de la session ([`backend/API.md`](../backend/API.md#L179)). | **Non évaluable comme attente de Web 2** ; la convention interne est explicite et vérifiée ici par test API. | Ajouter, si le support de cours le confirme, une consigne explicite sur les identifiants/permissions contrôlés côté serveur et des tests associés. |
| Accessibilité : **aucune source Web 2 disponible**. | Aucun critère d'accessibilité explicite dans les guides d'agent examinés (`.github/copilot-instructions.md`, `docs/architecture.md`). | **Non évaluable** ; l'absence d'une consigne dans ces fichiers ne prouve ni contradiction ni absence d'enseignement. | Fournir les critères réellement vus en cours, puis proposer une checklist ciblée (sémantique, clavier, libellés, etc.) uniquement si ces critères en font partie. |

Conclusion : les consignes du dépôt décrivent assez précisément l'architecture, la validation
et certaines conventions de sécurité propres au projet. Faute de source Web 2, aucune ne peut
être déclarée conforme, partielle ou contradictoire avec le cours. L'audit comparatif devra être
complété si les supports deviennent disponibles.

## 5. Optionnel — Proposition de senseur d'architecture

**Règle proposée :** les contrôleurs ne doivent pas importer directement les repositories ni la
connexion SQLite ; ils passent par les services. Cette règle prolonge le flux documenté
controllers → services → repositories et prévient le déplacement des règles métier/SQL dans
les routes.

- **Moment :** contrôle automatique local et en CI, appelé par `npm run check`.
- **Données examinées :** déclarations d'import des fichiers TypeScript sous
  `backend/src/controllers/`.
- **Résultat :** échec non nul indiquant le fichier et l'import interdit ; succès si aucun
  import vers `repositories/` ou `db/` n'est trouvé.
- **Exemple de violation :** `applications.controller.ts` importe directement
  `../repositories/applications.repository.ts` au lieu d'appeler `ApplicationsService`.
- **Limites et coût :** un contrôle AST fondé sur TypeScript serait plus fiable qu'une recherche
  textuelle, mais devrait suivre les alias et imports dynamiques ; les exceptions légitimes
  nécessiteraient une règle explicite. Le contrôle ne prouverait pas la qualité de la séparation
  à l'exécution. Il n'a pas été implémenté ni exécuté pendant cette séance.
