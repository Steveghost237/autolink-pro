# AutoLink Pro — Guides par rôle & comptes démo

## Comptes de démonstration

Créés via `python manage.py seed_demo_users` (commande **opt-in** — jamais exécutée en production automatiquement).

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | `demo.admin@autolink.com` | `Demo2026!` |
| Propriétaire | `demo.owner@autolink.com` | `Demo2026!` |
| Client | `demo.client@autolink.com` | `Demo2026!` |
| Intermédiaire | `demo.inter@autolink.com` | `Demo2026!` |

Données pré-remplies : 1 véhicule (Toyota Corolla `DEMO-001`), 1 réservation `BK-0001` attribuée à l'intermédiaire avec commission calculée.

## Guide — Client (bleu)

1. **Chercher un véhicule** : filtres dates, ville, catégorie, prix.
2. **Réserver** : choisir dates, option chauffeur, saisir un **code intermédiaire** si un parrain vous a recommandé.
3. **Mes réservations** : suivi des statuts, paiement, évaluation.
4. **Messages** : écrire au propriétaire de vos locations ou au **support AutoLink**.

## Guide — Propriétaire (émeraude)

1. **Mes véhicules / Ajouter** : publier une annonce (photos, tarif, ville).
2. **Service chauffeur** : bouton dédié → demande de recrutement/formation (forfait par chauffeur, configurable par l'admin). Pipeline suivi : recrutement → formation → transmission. Le chauffeur livré est **géré exclusivement par vous**.
3. **Maintenance** : tickets de réparation par véhicule, priorité, suivi admin.
4. **Messages** : clients de vos locations + support.
5. Tableau de bord : véhicules, réservations, revenus.

## Guide — Intermédiaire (violet — volontairement restreint)

1. **Code parrain unique** (`AL-XXXXXX`) affiché en haut — à copier/partager.
   - Lien d'inscription : `/register?ref=AL-XXXXXX`
   - Ou saisi dans « Code intermédiaire » lors d'une réservation.
2. **Réserver pour un client** : « Réserver pour un client » → choix véhicule + email du client → la réservation est créée à son nom (il est notifié et paie) ; la commission vous est attribuée.
3. **Commissions** : X % du montant de location, prélevés **sur la part AutoLink** (le propriétaire n'est pas impacté), versées au solde à la fin de la location.
4. **Messages** : support + clients apportés.
5. Version **mobile** : écran dédié dans l'app (code, partage, commissions).

## Guide — Admin (slate/or)

Modules : Utilisateurs (créer, suspendre, vérifier, rôles), Véhicules/Inspections, Chauffeurs (candidatures + **demandes propriétaires**), Finance, Intermédiaires (création, taux), **Maintenance**, **Messages** (boîte support), **Paramètres** (commission AutoLink, taux intermédiaire par défaut, prix service chauffeur, contacts support), Django admin `/admin/` pour la suppression.

## Transition du rôle chauffeur

Le rôle `DRIVER` est retiré de l'inscription et de la navigation. **Aucune donnée supprimée** : `DriverApplication`, `DriverProfile`, `Booking.driver`, évaluations, documents — tout reste accessible via `/admin/` et l'API admin. Pour restaurer le rôle : remettre `DRIVER` dans `PUBLIC_ROLES` (`RegisterSerializer`) et dans les routes/nav du frontend.
