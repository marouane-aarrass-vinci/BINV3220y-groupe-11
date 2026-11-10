# Semaine 8 — Bilan du harnais agentique

Ce bilan accompagne les deux matrices séparées :
[classification des guides/senseurs et audit Web 2](./matrice-guides-senseurs.md) et
[traçabilité des cas de tests EF-32/EF-33](./matrice-tracabilite-tests.md).

## Inventaire et couverture — résumé

Les guides vérifiés sont les instructions Copilot, les documents d'architecture et d'API du
projet. Les senseurs computationnels présents sont Vitest/Supertest, Oxlint, TypeScript et les
builds, orchestrés par `npm run check`. Les matrices précisent leurs rôles, exemples, preuves
et limites.

Les tests API vérifient la création de candidature, le refus des offres non publiées,
l'isolation des candidatures par étudiant et les statuts. Le retrait exigé par EF-32 n'est pas
implémenté : les tests correspondants sont donc absents. Les cas, noms de tests et assertions
sont détaillés dans la [matrice de traçabilité](./matrice-tracabilite-tests.md).

L'audit des guides ne peut pas établir leur conformité aux pratiques enseignées en Web 2 :
aucun support ou note du cours n'était disponible. Les recommandations et cette limite sont
détaillées dans la [matrice guides/senseurs et Web 2](./matrice-guides-senseurs.md). Les guides
du dépôt n'ont pas été modifiés.

## Modifications et vérifications

Dans [`backend/tests/myApplications.test.ts`](../../backend/tests/myApplications.test.ts), un
test ajouté vérifie qu'un étudiant (Lucas) qui fournit le `studentId` d'Inès dans la query ne
reçoit que sa propre candidature. Il échouerait si le filtrage serveur utilisait l'identifiant
non fiable transmis par le client et divulguait les données d'Inès.

Le retrait n'a pas été implémenté, conformément au périmètre de cette séance ; son absence est
documentée dans la matrice. Aucune vérification manuelle du parcours dans un navigateur ou
contre un serveur lancé n'a été effectuée : les constats reposent sur les fichiers ouverts et
les tests exécutés. Les tests frontend emploient des réponses simulées et ne prouvent pas
l'isolation côté serveur.

La version Node installée par défaut était `22.13.1`, inférieure au minimum `22.14` du projet.
La première tentative ciblée sous cette version s'est arrêtée au setup, avant tout test
(0 test exécuté). Les commandes réussies ci-dessous ont utilisé Node `24.22.2` via le paquet
npm temporaire `node@24`.

| Vérification | Résultat |
|---|---|
| `npm ci` | Réussi ; dépendances restaurées. Avertissement `EBADENGINE` pour Node installé `22.13.1`. |
| `npm run test -w backend -- --run tests/myApplications.test.ts` sous Node `22.13.1` | Échec de prérequis, Node trop ancien ; 0 test exécuté. |
| `npx --yes --package=node@24 --call 'node --version && npm run test -w backend -- --run tests/myApplications.test.ts'` | Réussi sous Node `24.22.2` : 1 fichier, 9 tests passés. |
| `npx --yes --package=node@24 --call 'node --version && npm run check'` | Réussi sous Node `24.22.2` : lint, typecheck, 142 tests backend, 58 tests frontend, builds backend et frontend. |

## Optionnel — Proposition de senseur d'architecture

Règle proposée : les contrôleurs ne doivent pas importer directement les repositories ni la
connexion SQLite ; ils passent par les services, conformément au flux controllers → services
→ repositories décrit dans [l'architecture du projet](../architecture.md).

Le senseur pourrait s'exécuter localement et en CI via `npm run check`, analyser les imports
des fichiers TypeScript sous `backend/src/controllers/`, et échouer en indiquant le fichier et
l'import interdit. Par exemple, un import direct de
`../repositories/applications.repository.ts` dans `applications.controller.ts` déclencherait
un retour. Un contrôle AST serait plus fiable qu'une recherche textuelle, mais devrait traiter
les alias et imports dynamiques ; les exceptions légitimes demanderaient une règle explicite.
Ce contrôle ne démontrerait pas la qualité de la séparation à l'exécution. Il n'a pas été
implémenté ni exécuté pendant la séance.
