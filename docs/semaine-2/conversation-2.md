# Conversation — EF-33

## Demande

**Utilisateur :**

> Implémente maintenant EF-33 : permettre à un étudiant de consulter ses propres candidatures.
>
> Objectifs :
> - Créer une interface permettant à l'étudiant connecté de consulter ses candidatures.
> - Afficher les informations utiles de chaque candidature.
> - Afficher les statuts en français : En cours, Retenue, Non retenue et Retirée.
> - Récupérer uniquement les candidatures de l'étudiant connecté.
> - Vérifier les autorisations côté backend.
> - Réutiliser les composants et services existants.
> Respecte l'architecture et les conventions du projet.
>
> Ne développe pas encore la fonctionnalité de retrait.
>
> Ajoute les tests nécessaires.
>
> À la fin, indique les fichiers modifiés, les changements effectués et les tests réalisés.

## Échanges et réalisation

**Assistant :** J'ai vérifié le module EF-32 existant et l'architecture du dépôt. Je vais
ajouter `GET /applications`, filtré avec l'identité étudiant issue de la session, et une
page « Mes candidatures » accessible uniquement aux étudiants.

**Assistant :** L'API et l'écran sont implémentés. La première exécution des tests a révélé
des attentes de données de seed incorrectes et un guard frontend qui exigeait un
`offerId` supérieur non présent dans le DTO de liste. J'ai corrigé les attentes et adapté
le guard au DTO réellement renvoyé.

**Utilisateur :** « depeche toi de finir et complete rapidement le fichier semaine-2.md sur
base de ce qu'on a fait et copie notre conversation dans ke fichier conversation-2 »

**Assistant :** Je termine les vérifications, complète le compte rendu de semaine 2 et
consigne les échanges et résultats dans ce fichier.

## Résultat EF-33

- Endpoint protégé `GET /applications` ; seul un étudiant peut l'appeler.
- Le student ID vient de la session authentifiée ; la requête SQL filtre les candidatures
  sur cet identifiant.
- La liste renvoie titre, entreprise, année, période, message, date et statut, sans exposer
  le student ID.
- La navigation et la page « Mes candidatures » sont réservées au profil étudiant.
- Le retrait n'est pas implémenté.

## Validation

Les 8 tests API et 6 tests d'interface ciblés passent. `npm run check` passe également :
lint, vérification TypeScript, 141 tests backend, 58 tests frontend et builds backend et
frontend.