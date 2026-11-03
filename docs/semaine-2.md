# Semaine 7 — Première fonctionnalité avec GitHub Copilot

## 1. Planification avec GitHub Copilot

Nous avons utilisé GitHub Copilot en mode **Plan** afin d'analyser le projet existant avant de commencer le développement.

Nous lui avons demandé d'examiner :
- L'architecture générale du projet.
- Le frontend React/TypeScript et le backend Express/TypeScript.
- Le système d'authentification et les rôles.
- La base de données SQLite et les modèles existants.
- Les routes API, les services et les composants.
- Les tests et les conventions du projet.

L'analyse a montré que la table `applications` ainsi que les quatre statuts nécessaires existaient déjà dans la base de données. Cependant, les parcours API et frontend permettant de gérer les candidatures n'étaient pas encore implémentés.

## 2. Fonctionnalités à développer

Le développement est organisé en trois étapes :

### Étape 1 — EF-32 : Postuler à une offre
- Permettre à un étudiant de postuler à une offre publiée.
- Permettre l'ajout d'un message facultatif.
- Vérifier que seul un étudiant peut effectuer cette action.
- Empêcher les candidatures multiples pour une même offre.

### Étape 2 — EF-33 : Consulter ses candidatures
- Afficher les candidatures de l'étudiant connecté.
- Afficher les informations de chaque candidature.
- Présenter les quatre statuts : En cours, Retenue, Non retenue et Retirée.

### Étape 3 — Retirer une candidature
- Permettre à l'étudiant de retirer sa propre candidature.
- Autoriser le retrait uniquement lorsque la candidature est encore en cours de traitement.
- Conserver la candidature dans la base de données avec le statut `WITHDRAWN`.

## 3. Décisions techniques et métier

L'analyse de Copilot a identifié les éléments suivants :

- Réutiliser la table `applications` et les statuts déjà présents.
- Respecter l'architecture existante en couches entre le frontend et le backend.
- Vérifier les droits et le propriétaire de chaque candidature côté serveur.
- Limiter le retrait aux candidatures ayant le statut `IN_PROGRESS`.
- Conserver un seul dossier par étudiant et par offre, même après un retrait. Copilot propose une contrainte d'unicité pour garantir cette règle.

## 4. Résultat de la phase de planification

Copilot a proposé un plan détaillé en trois étapes, avec les fichiers concernés, les changements prévus dans le frontend et le backend, ainsi que les tests à réaliser.

Aucun fichier du projet n'a été modifié durant cette phase. Aucun test n'a encore été exécuté.

## 5. Implémentation et validation

- Fonctionnalités implémentées : un étudiant connecté peut postuler à une offre publiée
  avec un message facultatif. Le backend ignore tout identifiant d'étudiant fourni par le
  client, refuse les profils non étudiants, les offres non publiées et les secondes
  candidatures. Les candidatures sont créées au statut `IN_PROGRESS`.
- Base de données : nouvelle migration ajoutant l'unicité `(offer_id, student_id)`, qui
  interdit aussi une nouvelle candidature après retrait. Le schéma initial n'a pas été
  modifié.
- Interface : formulaire de candidature dans la liste des offres, uniquement pour les
  étudiants et les offres publiées ; états de chargement, succès, erreur et session expirée.
- Tests fonctionnels : 19 tests API couvrant droits, messages, offre inexistante/non
  publiée, identifiants et corps invalides, tentative de doublon après retrait ; tests de
  contrainte et migration ; tests d'interface couvrant formulaire, message facultatif,
  permissions visuelles, conflit et session expirée.
- Vérification complète : `npm run check` passe (lint, typecheck, 133 tests backend,
  52 tests frontend, build backend et frontend). Le build backend inclut les deux migrations.
- Difficulté rencontrée et solution : le script de copie des migrations utilisait `fs.cpSync`
  récursivement, qui provoquait un arrêt Windows sans diagnostic dans cet environnement
  OneDrive. Il copie maintenant les fichiers SQL un par un.
- Hors périmètre : EF-33 et le retrait d'une candidature ne sont pas implémentés.
