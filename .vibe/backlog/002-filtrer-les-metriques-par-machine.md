---
status: todo
depends_on: [001]
---
# Filtrer Les Métriques Par Machine

## Description
Une fois une machine sélectionnée (item 001), la liste des métriques affichée par `MetricList` ne doit plus montrer que les métriques effectivement exposées par cette machine, plutôt que la liste complète du serveur Prometheus. Cela se fait en passant un filtre `match[]={instance="<machine>"}` à l'endpoint existant `GET {baseUrl}/api/v1/label/__name__/values`.

## Acceptance Criteria
- [ ] Après sélection d'une machine, la liste de métriques affichée ne contient que les métriques exposées par cette machine
- [ ] Le filtrage utilise le paramètre `match[]` de l'endpoint `/api/v1/label/__name__/values` existant, sans introduire de nouvel endpoint
- [ ] Si la machine sélectionnée n'expose aucune métrique, un message clair est affiché plutôt qu'une liste vide non expliquée
- [ ] Changer de machine sélectionnée met à jour la liste de métriques en conséquence

## Notes
S'appuie sur `src/features/metrics/MetricList.tsx` et le client `src/api/prometheus.ts` existants. Étend l'appel réseau déjà utilisé (décision `.vibe/decisions/001-prometheus-metric-list-endpoint.md`) plutôt que de le remplacer.
