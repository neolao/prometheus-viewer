---
status: todo
depends_on: [001]
---
# Afficher Type Et Description Métrique

## Description
Au clic sur une métrique dans la liste, l'utilisateur doit pouvoir consulter son type Prometheus (`counter`, `gauge`, `histogram`, `summary`, …) et son texte d'aide (`HELP`), récupérés via `GET {baseUrl}/api/v1/metadata`.

## Acceptance Criteria
- [ ] Cliquer sur une métrique de la liste affiche son type et sa description (HELP)
- [ ] Si la métadonnée n'est pas disponible pour la métrique sélectionnée, un message clair est affiché plutôt qu'une section vide
- [ ] Si l'appel à `/api/v1/metadata` échoue (erreur réseau, réponse non-2xx, payload invalide), un message d'erreur clair est affiché

## Notes
Endpoint Prometheus : `GET {baseUrl}/api/v1/metadata`. Cet endpoint avait été écarté pour la v1 dans la décision `.vibe/decisions/001-prometheus-metric-list-endpoint.md` ("peut être adopté plus tard si les métadonnées deviennent un besoin") — c'est maintenant le cas.
