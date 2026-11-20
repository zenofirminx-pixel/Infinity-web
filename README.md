# Pal Web

Application React/Vite. Configurer `VITE_API_URL` avec l'origine du backend Pal.

Le frontend ne sauvegarde pas les données métier dans `localStorage` ou `sessionStorage`. L'authentification, la session invitée, les conversations, la recherche, les paramètres, les fichiers et les ressources de l'espace de travail sont gérés par les API du serveur.

Les anciennes ressources sont conservées dans `migration-reference/legacy/` comme référence de migration, mais elles ne sont pas chargées par l'application active.
