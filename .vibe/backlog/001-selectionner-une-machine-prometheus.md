---
status: todo
---
# Sélectionner Une Machine Prometheus

## Description
Avant d'afficher la liste des métriques, l'utilisateur doit pouvoir choisir la machine (instance Prometheus) sur laquelle il veut travailler. Les valeurs possibles sont récupérées via `GET {baseUrl}/api/v1/label/instance/values`, et le choix de l'utilisateur devient le contexte pour tout le reste du parcours (filtrage des métriques, valeurs, graphiques).

## Acceptance Criteria
- [ ] L'utilisateur voit la liste des machines disponibles, dérivée des valeurs du label `instance` du serveur Prometheus connecté
- [ ] L'utilisateur peut sélectionner une machine dans cette liste
- [ ] La machine sélectionnée reste visible/accessible pendant la suite de la navigation
- [ ] Si aucune machine n'est disponible (liste vide) ou si l'appel échoue, un message clair est affiché plutôt qu'un écran vide ou une erreur non gérée

## Notes
Endpoint Prometheus : `GET {baseUrl}/api/v1/label/instance/values`. Cette étape précède et conditionne l'affichage de la liste des métriques (voir item 002).
