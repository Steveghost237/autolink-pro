# AutoLink Pro — Architecture fonctionnelle (v2)

## Organigramme des rôles

```
                    ┌─────────────────────────────────────┐
                    │               ADMIN                  │
                    │  Tous droits : lecture, écriture,    │
                    │  modification, suppression           │
                    └──────┬───────┬───────┬───────┬───────┘
                           │       │       │       │
        ┌──────────────────┘       │       │       └──────────────────┐
        ▼                          ▼       ▼                          ▼
┌───────────────┐        ┌──────────────────┐  ┌────────────┐  ┌────────────────┐
│    CLIENT     │        │  PROPRIÉTAIRE    │  │ CONTRÔLEUR │  │ INTERMÉDIAIRE  │
│ Loue des      │        │ Publie et gère   │  │ Valide les │  │ Apporteur      │
│ véhicules     │        │ ses véhicules    │  │ véhicules  │  │ d'affaires     │
└───────────────┘        └──────────────────┘  └────────────┘  └────────────────┘

DRIVER : rôle retiré de l'interface publique — données conservées en base.
```

## Matrice des permissions

| Capacité | Client | Propriétaire | Intermédiaire | Contrôleur | Admin |
|---|---|---|---|---|---|
| S'inscrire publiquement | ✅ | ✅ | ✅ | ❌ (admin crée) | ❌ (admin crée) |
| Chercher / voir les véhicules | ✅ | ✅ | ✅ | ✅ | ✅ |
| Réserver pour soi | ✅ | ✅ | — | — | ✅ |
| Réserver pour un tiers | — | — | ✅ (`on_behalf_email`) | — | ✅ |
| Code parrain + commissions | — | — | ✅ | — | ✅ (pilote) |
| Publier / gérer véhicules | — | ✅ | — | — | ✅ |
| Demander le service chauffeur | — | ✅ | — | — | traite |
| Tickets maintenance | — | ✅ | — | — | traite |
| Messagerie (contacts + support) | ✅ | ✅ | ✅ | ✅ | ✅ (inbox support) |
| Valider les véhicules | — | — | — | ✅ | ✅ |
| Gérer utilisateurs / rôles | — | — | — | — | ✅ |
| Finance, litiges, paramètres | — | — | — | — | ✅ |

## Flux principaux

**Réservation**
`Client → choix véhicule → dates → chauffeur (option) → code intermédiaire (option) → paiement séquestre → confirmée → active → terminée → libération : part propriétaire + part AutoLink + commission intermédiaire (sur part AutoLink)`

**Intermédiaire**
`Code AL-XXXXXX → partagé (inscription ?ref= ou code à la réservation) → réservation attribuée → commission versée au solde à la libération du séquestre`

**Service chauffeur**
`Propriétaire → demande (nb chauffeurs, ville, critères) → admin : recrutement → vérification → formation → transmission → chauffeur géré exclusivement par le propriétaire`

**Maintenance**
`Propriétaire → ticket (véhicule, titre, priorité) → admin : en cours → résolue (notes visibles du propriétaire)`

**Messagerie**
`Utilisateur → message (destinataire = contact métier ou vide = support) → admins répondent depuis la boîte support`

## Modèles ajoutés (v2)

| Modèle | App | Rôle |
|---|---|---|
| `User.referral_code / commission_rate / referred_by` | users | Parrainage intermédiaire |
| `Booking.intermediary / intermediary_commission` | bookings | Traçabilité + commission |
| `DriverServiceRequest` | drivers | Service payant recrutement/formation |
| `MaintenanceRequest` | vehicles | Tickets maintenance propriétaire |
| `Message` | users | Messagerie interne + support |
| `PlatformSettings` | users | Singleton de config (commissions, tarifs, support) |
