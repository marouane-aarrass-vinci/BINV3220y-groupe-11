# API Gesta

Toutes les réponses sont en JSON. En développement, le frontend appelle `/api/...` et le
proxy Vite transmet la requête au backend sans le préfixe `/api`.

Les requêtes d'exemple se trouvent dans `http/` (extension REST Client de VS Code).

## Authentification

Les routes protégées exigent l'en-tête `Authorization` contenant le jeton obtenu à la
connexion (sans préfixe). Le jeton ne contient que l'identité (`kind`, `id`) ; à chaque
requête, le backend relit en base le compte, ses rôles et ses entreprises. Un compte
désactivé, ou un contact sans rôle, ne peut plus accéder à l'API.

> **Mode démo.** La connexion réelle par lien envoyé par e-mail (CdC EF-01) n'est pas
> implémentée. En développement local, `DEMO_AUTH_ENABLED=true` permet de se connecter
> **sans mot de passe** sous un utilisateur fictif. Ce n'est pas une authentification :
> le serveur refuse de démarrer avec ce mode si `NODE_ENV=production`.

## Format des erreurs

Toute erreur a la même forme :

```json
{ "error": { "code": "INVALID_QUERY", "message": "Le paramètre q doit apparaître une seule fois" } }
```

| Statut | Code | Cas |
|---|---|---|
| 400 | `INVALID_QUERY` | Paramètre de requête invalide |
| 400 | `INVALID_BODY` | Corps de requête invalide |
| 400 | `INVALID_PARAM` | Paramètre de chemin invalide |
| 401 | `UNAUTHENTICATED` | Session absente, expirée ou invalide ; compte non autorisé à se connecter |
| 403 | `FORBIDDEN` | Utilisateur connecté, mais sans droit sur la ressource |
| 404 | `OFFER_NOT_FOUND` | Offre inconnue |
| 409 | `OFFER_NOT_PUBLISHED` | L'offre n'est pas publiée |
| 409 | `APPLICATION_ALREADY_EXISTS` | L'étudiant a déjà une candidature pour cette offre |
| 404 | `NOT_FOUND` | Route inconnue |
| 500 | `INTERNAL_ERROR` | Erreur inattendue du serveur |

## GET /health

Indique que l'API répond.

### Réponses

- `200` : `{ "status": "ok" }`

## GET /auth/demo-users

*Mode démo uniquement.* Liste les utilisateurs qui peuvent se connecter : comptes actifs,
et contacts ayant au moins un rôle.

### Réponses

- `200` : tableau d'utilisateurs (même format que `GET /auth/me`)
- `404` : mode démo désactivé

## POST /auth/demo-login

*Mode démo uniquement.* Ouvre une session sous l'identité choisie, sans mot de passe.

### Requête

- Body JSON : `{ "kind": "ADMIN" | "STUDENT" | "CONTACT", "id": 4 }`

### Réponses

- `200` : `{ "token": "…", "user": { … } }`
- `400` `INVALID_BODY` : `kind` inconnu ou `id` qui n'est pas un entier positif
- `401` `UNAUTHENTICATED` : utilisateur inexistant, inactif, à vérifier, ou contact sans rôle
- `404` : mode démo désactivé

## GET /auth/me

Retourne l'utilisateur connecté.

### Requête

- Header `Authorization` obligatoire

### Réponses

- `200` :

```json
{
  "kind": "CONTACT",
  "id": 4,
  "firstName": "Julien",
  "lastName": "Lambert",
  "email": "julien.lambert@lumen.test",
  "roles": ["DEPOSITOR", "PROMOTER", "SIGNATORY"],
  "companies": [
    { "id": 3, "shortName": "Lumen Data" },
    { "id": 2, "shortName": "Lumen Digital" }
  ]
}
```

`roles` et `companies` sont vides pour un administrateur ou un étudiant.

- `401` `UNAUTHENTICATED` : jeton absent, invalide ou expiré, ou compte désactivé

## GET /companies

Liste les entreprises, triées par nom complet. Un administrateur voit toutes les
entreprises ; les autres utilisateurs ne voient que les entreprises actives.

### Requête

- Header `Authorization` obligatoire
- Paramètre facultatif `q` : texte cherché dans le nom complet et le nom abrégé, sans tenir
  compte de la casse. Une valeur vide est ignorée. 100 caractères au maximum.

### Réponses

- `200` : tableau d'entreprises

```json
[
  {
    "id": 2,
    "name": "Lumen Digital SRL",
    "shortName": "Lumen Digital",
    "locality": "Louvain-la-Neuve",
    "status": "ACTIVE"
  }
]
```

`status` vaut `ACTIVE`, `TO_VERIFY` (fiche à vérifier) ou `ARCHIVED`.

- `400` `INVALID_QUERY` : `q` est répété ou dépasse 100 caractères.
- `401` `UNAUTHENTICATED` : session absente ou invalide.

## GET /offers

Liste les offres visibles par l'utilisateur connecté, de l'année académique la plus
récente à la plus ancienne, puis de la plus récente à la plus ancienne.

| Profil | Offres retournées |
|---|---|
| Administrateur | Toutes |
| Étudiant | Les offres publiées |
| Contact déposant | Les offres qu'il a déposées, quel que soit leur statut |
| Contact sans rôle de déposant | Aucun accès (403) |

### Requête

- Header `Authorization` obligatoire
- Paramètre facultatif `period` : `P1`, `P2` ou `OTHER`. Sans ce paramètre, toutes les
  offres normalement visibles par le profil sont retournées.

### Réponses

- `200` : tableau d'offres

```json
[
  {
    "id": 3,
    "title": "API REST de facturation",
    "companyShortName": "Orbis",
    "academicYear": "2026-2027",
    "period": "P2",
    "status": "PUBLISHED"
  }
]
```

`period` vaut `P1`, `P2` ou `OTHER`. `status` vaut `SUBMITTED` (soumise), `PENDING`
(en attente), `PUBLISHED` (publiée), `ASSIGNED` (attribuée) ou `ARCHIVED` (archivée).

- `401` `UNAUTHENTICATED` : session absente ou invalide.
- `403` `FORBIDDEN` : contact seulement promoteur ou signataire.
- `400` `INVALID_QUERY` : paramètre `period` inconnu ou répété.

## POST /offers/:offerId/applications

Permet à l'étudiant connecté de postuler à une offre publiée. Le serveur détermine
l'étudiant depuis la session ; le corps ne peut pas définir l'identité du candidat.
Une seule candidature est autorisée par étudiant et par offre, même si une candidature
antérieure a été retirée.

### Requête

- Header `Authorization` obligatoire
- `offerId` : identifiant entier positif d'une offre
- Body JSON facultatif :

```json
{
  "message": "Le sujet correspond à mon projet professionnel."
}
```

Le champ `message` est facultatif. Une chaîne vide ou composée d'espaces est enregistrée
comme `null`. Aucun autre champ n'est accepté dans le corps.

### Réponses

- `201` : candidature créée

```json
{
  "id": 12,
  "offerId": 5,
  "message": "Le sujet correspond à mon projet professionnel.",
  "status": "IN_PROGRESS",
  "appliedAt": "2026-11-03 14:00:00"
}
```

- `400` `INVALID_PARAM` : identifiant d'offre invalide.
- `400` `INVALID_BODY` : message non textuel ou corps invalide.
- `401` `UNAUTHENTICATED` : session absente ou invalide.
- `403` `FORBIDDEN` : profil non étudiant.
- `404` `OFFER_NOT_FOUND` : offre inexistante.
- `409` `OFFER_NOT_PUBLISHED` : l'offre n'est pas publiée.
- `409` `APPLICATION_ALREADY_EXISTS` : une candidature de cet étudiant existe déjà
  pour cette offre, y compris si elle est au statut `WITHDRAWN`.

## GET /applications

Liste les candidatures de l'étudiant connecté. L'identifiant étudiant provient de la
session et n'est jamais fourni par le client. Les candidatures sont triées de la plus récente
à la plus ancienne.

### Requête

- Header `Authorization` obligatoire
- Aucun paramètre

### Réponse

- `200` : tableau de candidatures. Chaque entrée contient les informations de l'offre,
  le message éventuel, la date et le statut.

```json
[
  {
    "id": 12,
    "offer": {
      "id": 5,
      "title": "Tableau de bord de qualité des données",
      "companyShortName": "Lumen Data",
      "academicYear": "2026-2027",
      "period": "P2"
    },
    "message": "Le sujet correspond à mon projet professionnel.",
    "status": "IN_PROGRESS",
    "appliedAt": "2026-11-03 14:00:00"
  }
]
```

Les statuts sont `IN_PROGRESS`, `SELECTED`, `REJECTED` et `WITHDRAWN`. Une liste vide est
retournée si l'étudiant n'a aucune candidature.

- `401` `UNAUTHENTICATED` : session absente ou invalide.
- `403` `FORBIDDEN` : profil non étudiant.
