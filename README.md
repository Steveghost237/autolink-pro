# AutoLink Pro 🚗

> **Votre mobilité, notre mission** — Plateforme de mise en relation entre propriétaires de véhicules, chauffeurs et clients.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend Web | React 18 + TailwindCSS + Recharts |
| Backend API | Django 4.2 + Django REST Framework |
| Base de données | SQLite (intégrée Django) |
| Auth | JWT (SimpleJWT) |
| Mobile | Expo (React Native) |
| APK Build | EAS Build (Expo) |

## Lancer le projet

### Frontend (React)
```bash
cd frontend
npm install
npm start
# → http://localhost:3000
```

### Backend (Django)
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo    # crée le super admin + la flotte de 85 véhicules
python manage.py runserver
# → http://localhost:8000
# Admin Django → http://localhost:8000/admin
```

### Mobile (Expo)
```bash
cd mobile
npm install
npx expo start
# Scanner le QR code avec l'app Expo Go
```

### Build APK Android
```bash
cd mobile
npm install -g eas-cli
eas login
eas build -p android --profile preview
# L'APK sera disponible en téléchargement
```

---

## Comptes utilisateurs

En production, chaque utilisateur s'inscrit réellement via le site ou l'application (email + mot de passe, Google, ou code de vérification par email). Seul le **super admin** est créé automatiquement au démarrage via `ADMIN_USERNAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

### Comptes de démonstration (opt-in)

Pour les recettes et présentations, une commande séparée crée les 4 rôles :

```bash
python manage.py seed_demo_users
```

| Rôle | Email | Accès |
|------|-------|-------|
| Admin | `demo.admin@autolink.com` | Panel admin complet |
| Propriétaire | `demo.owner@autolink.com` | Véhicule démo + service chauffeur |
| Client | `demo.client@autolink.com` | Recherche, réservation, wallet |
| Intermédiaire | `demo.inter@autolink.com` | Code parrain auto-généré + commissions |

Mot de passe commun : `Demo2026!` (configurable via `DEMO_PASSWORD`).
**Ne jamais exécuter en production** — ces comptes sont publics.

---

## Modèle économique

- **Commission AutoLink : 25%** de chaque location
- **Propriétaire reçoit : 75%** de chaque location
- Paiements acceptés : MTN Money, Orange Money, PayPal, Stripe

### Calcul automatique du tarif
Le tarif est calculé selon :
- Tarif de base défini par le propriétaire
- **Ancienneté** : +5 000 F/jour si ≤ 2 ans, +2 000 F si ≤ 5 ans
- **Assurance** : +2 000 F si Premium ou Tous risques
- **État** : bonus jusqu'à +5 000 F selon le score d'inspection

---

## Interfaces

| Interface | Rôle | Fonctionnalités |
|-----------|------|-----------------|
| **Client** | Louer | Recherche, réservation, paiement, code intermédiaire, historique, notation |
| **Propriétaire** | Gérer ses voitures | Ajout véhicule, revenus, **service recrutement chauffeur** (payant) |
| **Intermédiaire** | Apporter des affaires | Code parrain unique, commissions, réservation pour le compte d'un client |
| **Admin** | Gérer la plateforme | Tous droits : utilisateurs, véhicules, chauffeurs, intermédiaires, finance, litiges |
| **Contrôleur** | Inspecter | Fiches entrée/sortie, photos, score d'état, litiges |

> Le rôle **chauffeur** a été retiré de l'interface publique : les données
> (profils, candidatures, courses) restent en base pour l'administration, et
> l'option « chauffeur » reste disponible à la réservation (AutoLink ou
> propriétaire).

---

## API Endpoints principaux

```
GET    /api/health/                  → Healthcheck
POST   /api/auth/token/              → Login JWT (email + password)
POST   /api/auth/token/refresh/      → Refresh token
POST   /api/users/login/             → Login → { user, access, refresh }
POST   /api/users/google/            → Connexion/inscription Google (Gmail)
POST   /api/users/register/          → Inscription (client/propriétaire/intermédiaire, + referral_code optionnel)
POST   /api/users/                   → Créer un compte (ADMIN, ex. intermédiaire)
GET    /api/users/me/                → Profil utilisateur
GET    /api/users/                   → Tous les comptes (ADMIN)
PATCH  /api/users/{id}/              → Activer/suspendre/changer rôle (ADMIN)

GET    /api/vehicles/                → Liste véhicules (+ ?tier=basic|standard|premium|gold)
POST   /api/vehicles/                → Ajouter un véhicule (OWNER)
PATCH  /api/vehicles/{id}/           → Approuver/suspendre (ADMIN)

POST   /api/bookings/                → Créer une réservation (CLIENT ; + agent_code, + on_behalf_email pour INTERMEDIARY)
GET    /api/bookings/                → Réservations (filtrées par rôle)
PATCH  /api/bookings/{id}/           → Statut (admin: tout · client: annuler · chauffeur: active/completed)
GET    /api/bookings/stats/          → Statistiques globales (ADMIN/CONTROLLER)

GET    /api/payments/wallet/         → Solde + transactions
POST   /api/payments/wallet/topup/   → Recharger (mtn, orange, senbid, paybid, paypal, stripe)
POST   /api/payments/payments/       → Initier un paiement
GET    /api/payments/payouts/        → Mes versements

GET    /api/drivers/applications/    → Candidatures chauffeurs (archives + admin)
POST   /api/drivers/service-requests/ → Demande de recrutement chauffeur (OWNER)
GET    /api/drivers/service-requests/ → Demandes : ses propres (OWNER) / toutes (ADMIN)
GET    /api/inspections/             → Fiches d'inspection
```

## Gammes de véhicules

| Gamme | Tarif/jour | Exemples |
|-------|-----------|----------|
| **Basic** | < 25 000 F | Yaris, Picanto, Logan, Swift |
| **Standard** | 25–55 000 F | RAV4, Tucson, Hilux, Sportage |
| **Premium** | 55–90 000 F | Prado, Classe E, X5, RX 350 |
| **Gold** | > 90 000 F | Classe S, G63, Range Rover, X7 |

Un véhicule dont la location se termine (`completed`/`cancelled`) redevient
**immédiatement disponible** (`approved`) — il peut être reloué sans intervention.

## Déploiement Dokploy (2 services)

### Service 1 — Frontend web
| Champ | Valeur |
|-------|--------|
| Provider | GitHub → `Steveghost237/autolink-pro` |
| Branch | `master` |
| Build type | Dockerfile |
| Dockerfile | `Dockerfile` |
| Context | `.` |
| Build arg | `REACT_APP_API_URL=https://<domaine-api>/api` |
| Domain | `autolink-pro.worldwide-international.business` |
| Container port | `80` |

### Service 2 — Backend API
| Champ | Valeur |
|-------|--------|
| Provider | GitHub → `Steveghost237/autolink-pro` |
| Branch | `master` |
| Build type | Dockerfile |
| Dockerfile | `backend/Dockerfile` |
| Context | `backend` |
| Domain | `api-autolink-pro.worldwide-international.business` |
| Container port | `8000` |

**Variables d'environnement du backend (Dokploy → Environment) :**
```env
DEBUG=False
SECRET_KEY=<chaine-aleatoire-longue>
ALLOWED_HOSTS=api-autolink-pro.worldwide-international.business
CORS_ALLOWED_ORIGINS=https://autolink-pro.worldwide-international.business
COMMISSION_RATE=0.50
DATABASE_URL=sqlite:////app/data/db.sqlite3
FRONTEND_URL=https://autolink-pro.worldwide-international.business
FCFA_PER_USD=600

# Paiements live (secrets — Dokploy Environment uniquement)
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=live
PAYPAL_PAYOUTS_ENABLED=false

# Super admin créé/maj automatiquement au démarrage (seed_demo)
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@autolink.com
ADMIN_PASSWORD=<mot-de-passe-fort-unique>

# Envoi d'emails — code de connexion OTP (login sans mot de passe)
# Gmail : EMAIL_HOST_USER=votre@gmail.com + mot de passe d'application
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=AutoLink Pro <no-reply@autolink-pro.worldwide-international.business>
```
`ADMIN_USERNAME`/`ADMIN_EMAIL`/`ADMIN_PASSWORD` définissent le compte
super admin. Si le compte existe déjà, le seed ré-applique les droits
(`is_staff`, `is_superuser`) et met à jour le mot de passe quand
`ADMIN_PASSWORD` est défini. Si `ADMIN_USERNAME` n'est pas `admin`,
l'ancien compte `admin` par défaut est désactivé automatiquement.

Montez un volume persistant sur `/app/data` pour conserver SQLite,
ou utilisez `DATABASE_URL=postgres://user:pass@host:5432/autolink` pour PostgreSQL.

Le container migre la base, crée/répare le super admin, seed la flotte de véhicules et lance gunicorn au démarrage. Les anciens comptes démo (client/owner/driver*/controller) sont supprimés automatiquement s'ils existent encore.

---

## Structure du projet

```
autolink/
├── frontend/          # React App
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── auth/          (Login, Register)
│   │   │   ├── client/        (Dashboard, Search, Bookings)
│   │   │   ├── owner/         (Dashboard, Vehicles, AddVehicle)
│   │   │   ├── driver/        (Dashboard)
│   │   │   ├── admin/         (Dashboard, Users, Drivers, Finance, Inspections)
│   │   │   └── controller/    (Dashboard)
│   │   ├── components/        (DashboardLayout)
│   │   └── contexts/          (AuthContext)
│   └── package.json
│
├── backend/           # Django REST API
│   ├── apps/
│   │   ├── users/
│   │   ├── vehicles/
│   │   ├── bookings/
│   │   ├── payments/
│   │   ├── drivers/
│   │   └── inspections/
│   ├── config/        (settings, urls, wsgi)
│   └── manage.py
│
└── mobile/            # Expo React Native
    ├── App.js
    ├── app.json
    └── package.json
```
