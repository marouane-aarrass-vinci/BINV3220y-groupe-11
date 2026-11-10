# Conversation 1 — Semaine 3

> Synthèse des échanges de travail, et non export brut de la conversation.

## Demande initiale

**Utilisateur :** Réaliser le travail de la séance « Semaine 8 — Harnais agentique :
guider et vérifier » : inventorier les guides et senseurs, examiner la couverture des tests
EF-32/EF-33, combler un manque important, auditer les guides par rapport à Web 2, rédiger
le bilan dans `docs/` et lancer `npm run check`.

**Assistant :** J'ai examiné le cahier des charges, les guides Copilot, l'architecture,
l'API et les tests. J'ai constaté que le retrait d'une candidature n'est pas implémenté.
Les supports de cours Web 2 n'étant pas présents, j'ai signalé cette limite plutôt que
d'attribuer des règles non vérifiées au cours.

## Test et bilan

**Assistant :** J'ai ajouté un test API vérifiant qu'un `studentId` fourni par un client ne
permet pas de consulter les candidatures d'un autre étudiant. La suite ciblée a passé sous
Node 24.22.2 ; `npm run check` a également réussi (142 tests backend et 58 frontend, lint,
typecheck et builds).

**Utilisateur :** A demandé de déplacer le bilan dans un dossier `docs/semaine-3/`, comme
les semaines précédentes.

**Assistant :** J'ai déplacé le bilan, corrigé et vérifié ses liens relatifs.

## Organisation finale des livrables

**Utilisateur :** A demandé deux matrices distinctes, le bilan, les conversations et
l'information sur les crédits d'IA.

**Assistant :** J'ai ajouté les matrices séparées de classification/audit Web 2 et de
traçabilité EF-32/EF-33. À la demande suivante, j'ai allégé `semaine-3.md` pour qu'il
résume les résultats et renvoie aux matrices, et créé ce `bilan.md` séparé. Les crédits
indiqués sont de 4 % pour chaque membre, sur la base de l'information fournie par l'utilisateur.
