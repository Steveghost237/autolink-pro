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
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
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

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Client | client@autolink.com | pass123 |
| Propriétaire | owner@autolink.com | pass123 |
| Chauffeur | driver@autolink.com | pass123 |
| Admin | admin@autolink.com | pass123 |
| Contrôleur | controller@autolink.com | pass123 |

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
| **Client** | Louer | Recherche, réservation, paiement, historique, notation |
| **Propriétaire** | Gérer ses voitures | Ajout véhicule, modes (confié/domicile), revenus, documents |
| **Chauffeur** | Conduire | Statut en ligne, courses, véhicule assigné, statistiques |
| **Admin** | Gérer la plateforme | Utilisateurs, recrutement chauffeurs, finance, commissions |
| **Contrôleur** | Inspecter | Fiches entrée/sortie, photos, score d'état, litiges |

---

## API Endpoints principaux

```
POST   /api/auth/token/              → Login (JWT)
POST   /api/auth/token/refresh/      → Refresh token
POST   /api/users/register/          → Inscription
GET    /api/users/me/                → Profil utilisateur

GET    /api/vehicles/                → Liste véhicules disponibles
POST   /api/vehicles/                → Ajouter un véhicule (OWNER)
GET    /api/vehicles/{id}/           → Détail véhicule

POST   /api/bookings/                → Créer une réservation (CLIENT)
GET    /api/bookings/                → Mes réservations

POST   /api/payments/payments/       → Initier un paiement
GET    /api/payments/payouts/        → Mes versements

GET    /api/drivers/applications/    → Candidatures chauffeurs
POST   /api/drivers/applications/    → Soumettre une candidature

GET    /api/inspections/             → Fiches d'inspection
POST   /api/inspections/             → Créer une fiche (CONTROLLER/ADMIN)
```

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
