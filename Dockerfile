# ─── Stage 1 : Build React ───────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY frontend/package.json frontend/package-lock.json ./

# Installer les dépendances (cache layer séparé)
RUN npm ci --frozen-lockfile

# Copier le code source
COPY frontend/public ./public
COPY frontend/src ./src
COPY frontend/tailwind.config.js frontend/postcss.config.js ./

# Variables d'environnement de build (remplace frontend/.env non versionné)
ARG REACT_APP_API_URL=http://localhost:8000/api
ENV DISABLE_ESLINT_PLUGIN=true
ENV CI=false
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build production
RUN npm run build

# ─── Stage 2 : Nginx ─────────────────────────────────────────────────────────
FROM nginx:alpine AS production

# Copier le build React dans Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Copier la config Nginx SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
