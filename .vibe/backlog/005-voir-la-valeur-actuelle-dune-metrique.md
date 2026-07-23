---
status: todo
depends_on: [001]
---
# Voir La Valeur Actuelle D'Une Métrique

## Description
Au clic sur une métrique, l'utilisateur doit pouvoir voir sa valeur actuelle pour la machine sélectionnée (item 001), via une requête instantanée `GET {baseUrl}/api/v1/query` filtrée sur cette machine.

## Acceptance Criteria
- [ ] Cliquer sur une métrique déclenche une requête instantanée filtrée sur la machine sélectionnée et affiche sa valeur courante
- [ ] Si la métrique retourne plusieurs séries (labels différents au sein de la même machine), chaque série et sa valeur sont affichées distinctement
- [ ] Si la métrique n'a pas de valeur actuelle pour la machine sélectionnée, un message clair est affiché plutôt qu'un écran vide
- [ ] Si l'appel à `/api/v1/query` échoue (erreur réseau, réponse non-2xx, payload invalide), un message d'erreur clair est affiché

## Notes
Endpoint Prometheus : `GET {baseUrl}/api/v1/query` avec une expression PromQL construite à partir du nom de métrique et du label `instance`.
