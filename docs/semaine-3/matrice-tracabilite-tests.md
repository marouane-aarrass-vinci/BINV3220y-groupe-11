# Matrice — Traçabilité des cas de test EF-32 et EF-33

Source des exigences : [cahier des charges, § 7.4](../cdc_gesta_developpement.md#L199).
Un cas est « couvert » lorsque des assertions vérifient son résultat attendu.

## EF-32 — Candidater et retirer sa candidature

| Cas à vérifier | Test existant (fichier et nom) | Assertions utiles | Couverture |
|---|---|---|---|
| L'étudiant candidate à une offre publiée, avec un message facultatif. | [`backend/tests/applications.test.ts`](../../backend/tests/applications.test.ts) — « crée une candidature pour l'étudiant connecté avec son message facultatif » | Statut `201`, corps correspondant (`offerId`, message nettoyé, `IN_PROGRESS`), types de `id`/date, absence du `studentId` et ligne vérifiée en base. | Couvert |
| Le message peut être omis ou vide. | Même fichier — « accepte un message omis ou vide » | `201` et message retourné `null`. | Couvert |
| Une session est obligatoire et seuls les étudiants peuvent candidater. | Même fichier — « refuse une requête sans session (401) » et « refuse un administrateur/contact déposant (403) » | `401` sans session ; `403` et `FORBIDDEN` pour les rôles testés. | Couvert |
| L'offre inexistante est refusée. | Même fichier — « refuse une offre inexistante » | `404` et code `OFFER_NOT_FOUND`. | Couvert |
| Une offre non publiée ne peut pas recevoir de candidature. | Même fichier — « refuse une offre au statut %s » | Pour chacun des statuts `SUBMITTED`, `PENDING`, `ASSIGNED`, `ARCHIVED`, vérifie `409` et `OFFER_NOT_PUBLISHED`. | Couvert |
| Les paramètres invalides sont refusés. | Même fichier — « rejette un identifiant invalide (%s) » | Plusieurs valeurs invalides donnent `400` et `INVALID_PARAM`. | Couvert |
| Les corps invalides, notamment un `studentId` client, sont refusés. | Même fichier — « rejette un corps invalide (%s) » | `400` et `INVALID_BODY` pour message non textuel et champ `studentId` inattendu. | Couvert |
| Le doublon étudiant/offre est refusé, y compris si la candidature antérieure est retirée. | Même fichier — « empêche une candidature %s pour le même étudiant et la même offre » | `409`, `APPLICATION_ALREADY_EXISTS`, compteur SQL égal à `1` ; inclut les cas seedés en cours et retiré. | Couvert |
| L'étudiant peut retirer sa propre candidature qui n'a pas été traitée. | Aucun endpoint/test de retrait ; le [README](../../README.md#L103) indique que cette fonctionnalité n'est pas implémentée. | Aucun résultat API attendu ne peut être testé avant l'implémentation. | Absent |
| Le retrait est refusé après traitement/sélection/rejet. | Aucun endpoint/test de retrait. | Le cas ne peut pas être exercé dans l'API présente. | Absent |

## EF-33 — Consulter ses candidatures et leur statut

| Cas à vérifier | Test existant (fichier et nom) | Assertions utiles | Couverture |
|---|---|---|---|
| Une session est obligatoire et les profils non étudiants n'accèdent pas à la liste personnelle. | [`backend/tests/myApplications.test.ts`](../../backend/tests/myApplications.test.ts) — tests de « GET /applications : accès » | `401` sans session ; `403` et `FORBIDDEN` pour administrateur et contacts testés. | Couvert |
| L'étudiant voit seulement ses candidatures ; un identifiant transmis par un client ne détourne pas le filtre. | Même fichier — « retourne uniquement les candidatures de l'étudiant authentifié et les informations utiles » et « ignore un studentId fourni par le client et filtre selon la session » (**ajouté pour cette séance**) | Comparaison au résultat attendu de Lucas ; nouvelle requête avec le `studentId` d'Inès vérifie `200`, liste ne contenant que l'ID de Lucas et absence de l'ID d'Inès. | Couvert |
| Les quatre statuts du cahier des charges sont présents pour les étudiants concernés. | Même fichier — « expose les quatre statuts du domaine dans la liste des étudiants concernés » | Compare explicitement `SELECTED`, `REJECTED`, `IN_PROGRESS` et `WITHDRAWN`. | Couvert |
| Les informations de la candidature et de l'offre sont retournées. | Même fichier — « retourne uniquement les candidatures de l'étudiant authentifié et les informations utiles » | Comparaison exacte de l'objet, dont offre, entreprise, année, période, message, statut et date ; le `studentId` n'est pas exposé. | Couvert |
| Un étudiant sans candidature obtient une liste vide. | Même fichier — « retourne une liste vide pour un étudiant sans candidature » | `200` et réponse `[]`. | Couvert |

### Limites

- Le titre « inclut les statuts en cours et retiré sans permettre de modifier une candidature »
  n'est pas une preuve d'absence de route de mutation : ses assertions portent sur la lecture.
- Les tests frontend utilisent des réponses API simulées ; ils ne prouvent pas l'isolation serveur.
- Le retrait exigé par EF-32 demeure absent ; cette séance l'a relevé sans l'implémenter.
- Détails des vérifications et résultat global : [bilan](./semaine-3.md#3-modification-et-vérification).
