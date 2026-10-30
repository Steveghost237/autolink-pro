# AutoLink Pro — Spécifications UI/UX

## Palettes par rôle (identité visuelle)

| Rôle | Sidebar | Accent actif | Avatar | Intenté |
|---|---|---|---|---|
| **Admin** | `slate-950` | `amber-600` | dégradé ambre | Premium, autorité, accents dorés |
| **Propriétaire** | `emerald-950` | `emerald-600` | dégradé émeraude | Croissance, revenus, gestion |
| **Client** | `sky-950` | `sky-600` | dégradé sky | Confiance, légèreté, recherche |
| **Intermédiaire** | `violet-950` | `violet-600` | dégradé violet | Distinct, restreint, partenariat |
| **Contrôleur** | `purple-950` | `purple-600` | dégradé purple | Contrôle qualité |

Défini dans `frontend/src/components/DashboardLayout.jsx` (`ROLE_THEME`, `ROLE_COLORS`, `ROLE_LABELS`).

## Principes

- **Hiérarchie claire** : carte (`card`), champ (`input-field`), badge (`badge-*`) — classes utilitaires Tailwind partagées.
- **Une action primaire par écran**, boutons pill `rounded-xl`, état désactivé visible.
- **Temps réel perçu** : notifications poll 30 s, conversations 8 s.
- **Contexte camerounais** : FCFA, villes (Douala, Yaoundé, Bafoussam…), Mobile Money/Orange Money, français.

## Wireframes (structure)

### Landing
```
[ Header : logo · nav · Connexion · S'inscrire ]
[ Hero : accroche + recherche (ville, dates) + CTA ]
[ Véhicules vedettes : cartes photo/prix/ville ]
[ Confiance : assurance · séquestre · inspection ]
[ "Une place pour chacun" : Client / Propriétaire / Intermédiaire ]
[ Paiements : MTN · Orange · Stripe · PayPal ]
[ Footer : contact, villes, légal ]
```

### Panneau (tous rôles)
```
[ Sidebar colorée : identité + nav + déconnexion ]
[ Header : titre · thème · notifications · profil ]
[ Contenu : KPI cartes → modules du rôle ]
```

### Intermédiaire
```
[ Code parrain XL copiable + lien ?ref= ]
[ KPI : filleuls · réservations · commissions ]
[ Réservations attribuées ]
[ CTA "Réserver pour un client" ]
[ Messages (support + clients apportés) ]
```

## Composants réutilisables

- `DashboardLayout` — sidebar thématisée + header + notifications
- `Messages` — deux panneaux (threads / conversation) responsive
- `card`, `input-field`, `badge-*` — classes globales `index.css`
