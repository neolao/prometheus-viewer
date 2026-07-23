---
status: todo
depends_on: [005]
---
# Visualiser L'Évolution D'Une Métrique

## Description
Pour la métrique et la machine sélectionnées, l'utilisateur doit pouvoir visualiser l'évolution de la valeur dans le temps sous forme de graphique, via une requête de plage `GET {baseUrl}/api/v1/query_range`, avec un sélecteur de plage temporelle (dernière heure / 6h / 24h / 7 jours, ou bornes personnalisées) pilotant les paramètres `start`/`end`/`step`.

## Acceptance Criteria
- [ ] Un graphique affiche l'évolution de la métrique sélectionnée dans le temps, pour la machine sélectionnée
- [ ] L'utilisateur peut choisir une plage temporelle prédéfinie (dernière heure / 6h / 24h / 7 jours) qui recharge le graphique en conséquence
- [ ] L'utilisateur peut définir des bornes de temps personnalisées (start/end) pour le graphique
- [ ] Si l'appel à `/api/v1/query_range` échoue (erreur réseau, réponse non-2xx, payload invalide) ou ne retourne aucune donnée sur la plage choisie, un message clair est affiché plutôt qu'un graphique vide non expliqué

## Notes
Endpoint Prometheus : `GET {baseUrl}/api/v1/query_range`, paramètres `start`, `end`, `step`. S'appuie sur la fonctionnalité de valeur instantanée (item 005) pour la sélection de métrique/machine.
