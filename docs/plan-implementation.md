# AutoLink Pro — Plan d'implémentation v2

## Réalisé

| Étape | Contenu | État |
|---|---|---|
| 1 | Retrait rôle DRIVER de l'interface publique (données conservées) | ✅ |
| 2 | `DriverServiceRequest` + page propriétaire + pipeline admin | ✅ |
| 3 | Rôle `INTERMEDIARY` : code parrain, `referred_by`, commissions | ✅ |
| 4 | `Booking.intermediary` + versement à la libération du séquestre | ✅ |
| 5 | Thèmes par rôle + section « Rejoignez » sur la landing | ✅ |
| 6 | Admin : ManageUsers / AgentsManager sur API réelle, création de comptes | ✅ |
| 7 | Messagerie interne (`Message`, threads, boîte support admin) | ✅ |
| 8 | Tickets maintenance (`MaintenanceRequest`) owner ↔ admin | ✅ |
| 9 | `PlatformSettings` singleton : commissions, tarif service, support | ✅ |
| 10 | `seed_demo_users` : 4 comptes démo opt-in + données | ✅ |
| 11 | Mobile : écran intermédiaire (code + commissions) | ✅ |
| 12 | Docs : architecture, design, guides | ✅ |

## Vérifications

- `python manage.py test` → 50 tests OK
- `python manage.py migrate` → users.0006, vehicles.0006 appliquées
- `npm run build` → compilé (warnings lint préexistants seulement)

## Nouveaux endpoints

| Endpoint | Accès | Usage |
|---|---|---|
| `GET/POST /api/users/messages/` | auth | Conversation (`?peer=<id|support>`) + envoi |
| `GET /api/users/messages/threads/` | auth | Liste des conversations + non lus |
| `GET /api/users/messages/contacts/` | auth | Contacts autorisés |
| `POST /api/users/messages/read/` | auth | Marquer lu (`?peer=`) |
| `GET/PATCH /api/users/settings/` | admin | Paramètres plateforme |
| `GET /api/users/public-config/` | public | Tarif service chauffeur, support |
| `GET/POST/PATCH /api/vehicles/maintenance/` | owner/admin | Tickets maintenance |

## Optimisation crédits

- Réutilisation des patterns existants (viewsets, serializers, `DashboardLayout`).
- Aucune nouvelle dépendance frontend ni backend.
- Pages mutualisées : `Messages.jsx` unique pour les 5 rôles.

## Restes possibles (hors périmètre initial)

- Notifications push/email temps réel (WebSocket)
- Signature électronique des contrats de location
- Export comptable (CSV/PDF) de la finance
- Statut `whatsapp` deep-link dans les messages
