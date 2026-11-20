# Pal Web

Application React/Vite organisée par pages, composants et services API.

```text
Pal-web/
├── src/
│   ├── app/                 # emplacement pour le routeur et les providers
│   ├── components/          # composants réutilisables
│   ├── pages/               # WelcomePage et ChatPage
│   ├── services/            # client API et streaming
│   ├── styles/              # styles globaux Pal
│   ├── App.jsx              # orchestration de session et d'espace
│   └── main.jsx             # point d'entrée React
├── public/                  # PWA, icônes et service worker
└── migration-reference/     # ancienne interface conservée hors du runtime
```

Configurer `VITE_API_URL` avec l'origine du backend Pal. À défaut, l'application utilise l'URL historique du backend.
