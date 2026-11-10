# Bilan de la séance

## Ce que j'ai appris

J'ai appris à distinguer les guides, qui orientent l'agent, des senseurs, qui vérifient le
code ou son comportement. J'ai aussi appris qu'un test ne couvre une exigence que si ses
assertions vérifient réellement le résultat attendu.

## Ce qui a bien marché

La suite de tests API a permis de vérifier l'isolation des candidatures et de renforcer sa
couverture avec un test ciblé. Après avoir utilisé Node 24, `npm run check` a réussi pour
l'ensemble du projet.

## Ce qui a moins bien marché

Node 22.13.1, installé par défaut, était trop ancien pour exécuter les tests backend. De plus,
les supports Web 2 n'étaient pas disponibles, donc leur comparaison avec les guides du projet
reste à compléter. Le retrait de candidature demandé par EF-32 n'est pas encore implémenté.

## Crédits d'IA

- Moi : 4 % des crédits d'IA utilisés (information fournie par le groupe).
- Mon binôme : 4 % des crédits d'IA utilisés (information fournie par le groupe).
