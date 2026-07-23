---
status: todo
depends_on: [002]
---
# Rechercher Une Métrique Par Texte

## Description
L'utilisateur doit pouvoir filtrer par texte la liste des métriques déjà affichée (elle-même filtrée par machine sélectionnée, voir item 002), pour retrouver rapidement une métrique dans une liste potentiellement longue. Le filtrage se fait côté client, sans nouvel appel réseau.

## Acceptance Criteria
- [ ] Un champ de recherche est disponible au-dessus de la liste des métriques
- [ ] Saisir du texte filtre la liste en direct pour ne montrer que les métriques dont le nom contient le texte saisi
- [ ] Vider le champ de recherche réaffiche la liste complète (filtrée par machine)
- [ ] Si aucune métrique ne correspond au texte saisi, un message clair est affiché plutôt qu'une liste vide non expliquée

## Notes
Filtrage purement côté client sur la liste déjà chargée par `MetricList` — aucun appel réseau supplémentaire.
