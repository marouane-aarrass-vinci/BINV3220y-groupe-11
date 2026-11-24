# Bilan global du projet Gesta

## Ce que j'ai appris

J'ai appris à suivre le parcours complet d'une fonctionnalité web, de l'interface
jusqu'à la base de données. Le frontend utilise React et TypeScript selon une
organisation proche du MVVM : pages, hooks, services et composants. Le backend
Express sépare les contrôleurs, les services métier, les repositories SQL, les
modèles et les mappers. Cette séparation rend plus clair l'endroit où placer la
validation HTTP, les règles métier et les requêtes à la base.

Le projet m'a aussi permis de mieux comprendre SQLite et les migrations SQL :
les contraintes comme l'unicité peuvent protéger les données, tandis que les
services appliquent les règles métier et les permissions. J'ai vu comment une
requête traverse les couches du backend, comment les droits sont vérifiés côté
serveur et comment le frontend valide les réponses de l'API avant de les utiliser.
Le mode de connexion de démonstration facilite les essais locaux, mais ne remplace
pas une authentification réelle.

Sur le plan du développement, j'ai appris à examiner l'architecture existante
avant de modifier une fonctionnalité, à écrire des tests ciblés et à vérifier
qu'ils échouent pour la raison attendue avant l'implémentation. Les tests backend
avec Vitest et Supertest utilisent SQLite en mémoire; les tests frontend utilisent
Vitest et Testing Library. `npm run check` rassemble lint, vérification TypeScript,
tests et builds. J'ai également vu la différence entre explorer une interface
avec Playwright MCP et conserver des parcours répétables avec Playwright Test.

Enfin, les travaux sur les candidatures m'ont appris à traduire des règles métier
en validations et contraintes : seul l'étudiant concerné peut consulter ses
candidatures, une candidature est liée à une offre et à son étudiant, et une
contrainte empêche les doublons. Les exercices sur la recherche d'offres m'ont
fait pratiquer les filtres, les assertions sur les résultats visibles et la
vérification d'une régression par mutation temporaire.

## Ce que je n'ai pas appris et que j'aurais aimé approfondir

Le projet utilise volontairement une authentification de démonstration. J'aurais
aimé implémenter et tester un vrai parcours de connexion par lien à usage unique
envoyé par e-mail, puis étudier plus en détail la gestion des sessions et la
sécurisation d'un déploiement en production.

Plusieurs parcours métier restent hors du périmètre implémenté : créer, modifier
et publier des offres; retirer une candidature; sélectionner un candidat et
créer un stage; gérer les entreprises, les contacts et les doublons; produire
des conventions ou des exports. J'aurais aimé réaliser au moins un parcours
complet de gestion de stage, de sa création à sa validation, avec ses rôles,
transitions de statut, migrations et tests.

J'aurais aussi aimé approfondir le déploiement et l'automatisation continue :
exécuter les vérifications dans une CI, déployer l'application et observer son
fonctionnement hors de l'environnement local. Ces sujets permettraient de relier
les bonnes pratiques de développement et de test à l'exploitation réelle d'une
application.

## Documents de référence

- [Architecture de Gesta](./architecture.md)
- [Cahier des charges](./cdc_gesta_developpement.md)
- [Données de démonstration](./seed.md)
- [Bilan de la semaine 5](./semaine-5.md)
