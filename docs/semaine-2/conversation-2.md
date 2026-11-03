# Conversation — EF-33

## Demande

**Utilisateur :** Implémente EF-33 pour permettre à l'étudiant connecté de consulter ses
candidatures. Afficher les informations utiles et les statuts « En cours », « Retenue »,
« Non retenue » et « Retirée ». Les candidatures doivent être filtrées par étudiant et
les autorisations contrôlées côté backend. Respecter l'architecture existante, ajouter
les tests et ne pas développer le retrait.

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