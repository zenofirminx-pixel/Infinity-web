# Infinity AI — React + Vite

## Installation

```bash
npm install
npm run dev
```

Build de production : `npm run build` ; aperçu : `npm run preview`.

## Migration sans perte de logique

L'interface est désormais démarrée par React (`src/main.jsx`, `src/App.jsx`) et servie par Vite. Pour éviter de casser les fonctionnalités existantes, le DOM historique, ses identifiants et son moteur événementiel (`public/legacy.js`) sont conservés et montés dans le composant React. Le nouveau thème bleu néon est une couche CSS séparée (`src/neon.css`). Les conversations restent dans les mêmes clés `localStorage` (`infinity_*`), et les appels backend/authentification restent dans le code d'origine.

**Important :** le ZIP source fourni ne contenait pas `config.js`. Le moteur historique prévoit déjà une configuration de secours. Si votre déploiement utilisait un `config.js` privé/non inclus dans l'archive, ajoutez-le dans `public/` et chargez-le avant `legacy.js`.

Le service worker original est conservé dans `public/SW.js`.
