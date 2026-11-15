# Infinity — React + Vite

## Installation
```bash
npm install
npm run dev
```

## Production
```bash
npm run build
npm run preview
```

## Architecture de migration
- `src/main.jsx` : point d'entrée React.
- `src/shell.css` : shell responsive.
- `public/legacy.html` et `public/script.js` : client Infinity existant conservé pour ne perdre aucune fonctionnalité pendant la migration (authentification, conversations, historique, réglages, API en streaming, feedback et PWA).
- `public/style.css` : styles existants avec le nouvel indicateur d'attente.

Le client historique est chargé dans une iframe same-origin depuis React. Cela permet une migration progressive sans réécrire à l'aveugle les nombreux gestionnaires DOM et intégrations backend. Les prochaines étapes peuvent convertir chaque écran en composants React sans changer les API ni le stockage.

L'ancienne icône animée/statique `icon-static.png` a été retirée. Pendant l'attente de la réponse serveur, Infinity affiche un unique point blanc qui grossit puis rétrécit en boucle. Il disparaît dès que la réponse commence à arriver.
