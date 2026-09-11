from docx import Document
from docx.shared import Pt, RGBColor, Cm, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import datetime

doc = Document()

# ── Page margins ──────────────────────────────────────────────────────────────
section = doc.sections[0]
section.page_width  = Cm(21)
section.page_height = Cm(29.7)
section.left_margin   = Cm(2.5)
section.right_margin  = Cm(2.5)
section.top_margin    = Cm(2.5)
section.bottom_margin = Cm(2.5)

# ── Helpers ───────────────────────────────────────────────────────────────────
PRIMARY   = RGBColor(0x1E, 0x40, 0xAF)   # blue-800
SECONDARY = RGBColor(0x06, 0xB6, 0xD4)   # cyan-500
DARK      = RGBColor(0x1F, 0x29, 0x37)   # gray-800
LIGHT_BG  = RGBColor(0xEF, 0xF6, 0xFF)   # blue-50

def set_cell_bg(cell, hex_color: str):
    tc   = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd  = OxmlElement('w:shd')
    shd.set(qn('w:val'),   'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'),  hex_color)
    tcPr.append(shd)

def heading1(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after  = Pt(6)
    run = p.add_run(text)
    run.bold      = True
    run.font.size = Pt(16)
    run.font.color.rgb = PRIMARY
    # bottom border
    pPr  = p._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    bot  = OxmlElement('w:bottom')
    bot.set(qn('w:val'),   'single')
    bot.set(qn('w:sz'),    '6')
    bot.set(qn('w:space'), '4')
    bot.set(qn('w:color'), '1E40AF')
    pBdr.append(bot)
    pPr.append(pBdr)
    return p

def heading2(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after  = Pt(4)
    run = p.add_run(text)
    run.bold      = True
    run.font.size = Pt(13)
    run.font.color.rgb = SECONDARY
    return p

def heading3(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after  = Pt(2)
    run = p.add_run(text)
    run.bold      = True
    run.font.size = Pt(11)
    run.font.color.rgb = DARK
    return p

def body(text, bold_parts=None):
    p   = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(4)
    run = p.add_run(text)
    run.font.size = Pt(10.5)
    run.font.color.rgb = DARK
    return p

def bullet(text):
    p   = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run(text)
    run.font.size = Pt(10.5)
    run.font.color.rgb = DARK
    return p

def add_table(headers, rows, col_widths=None):
    t = doc.add_table(rows=1 + len(rows), cols=len(headers))
    t.style = 'Table Grid'
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    # Header row
    hdr = t.rows[0]
    for i, h in enumerate(headers):
        cell = hdr.cells[i]
        set_cell_bg(cell, '1E40AF')
        run = cell.paragraphs[0].add_run(h)
        run.bold = True
        run.font.size = Pt(10)
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    # Data rows
    for ri, row in enumerate(rows):
        tr = t.rows[ri + 1]
        bg = 'EFF6FF' if ri % 2 == 0 else 'FFFFFF'
        for ci, val in enumerate(row):
            cell = tr.cells[ci]
            set_cell_bg(cell, bg)
            run = cell.paragraphs[0].add_run(str(val))
            run.font.size = Pt(10)
            run.font.color.rgb = DARK
    if col_widths:
        for ri, row in enumerate(t.rows):
            for ci, width in enumerate(col_widths):
                row.cells[ci].width = Cm(width)
    doc.add_paragraph()
    return t

def page_break():
    doc.add_page_break()

# ══════════════════════════════════════════════════════════════════════════════
#  PAGE DE GARDE
# ══════════════════════════════════════════════════════════════════════════════
cover = doc.add_paragraph()
cover.alignment = WD_ALIGN_PARAGRAPH.CENTER
cover.paragraph_format.space_before = Pt(60)
r = cover.add_run("AutoLink Pro")
r.bold = True; r.font.size = Pt(36); r.font.color.rgb = PRIMARY

sub = doc.add_paragraph()
sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
r2 = sub.add_run("Cahier de Charges Fonctionnel & Technique")
r2.font.size = Pt(18); r2.font.color.rgb = SECONDARY

doc.add_paragraph()
version_p = doc.add_paragraph()
version_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
rv = version_p.add_run(f"Version 1.0  —  {datetime.date.today().strftime('%d %B %Y')}")
rv.font.size = Pt(12); rv.italic = True; rv.font.color.rgb = DARK

doc.add_paragraph()
tagline = doc.add_paragraph()
tagline.alignment = WD_ALIGN_PARAGRAPH.CENTER
rt = tagline.add_run('"Votre mobilité, notre mission"')
rt.italic = True; rt.font.size = Pt(13); rt.font.color.rgb = DARK

page_break()

# ══════════════════════════════════════════════════════════════════════════════
#  SOMMAIRE
# ══════════════════════════════════════════════════════════════════════════════
heading1("Table des matières")
toc_items = [
    "1. Présentation du projet",
    "2. Objectifs & périmètre",
    "3. Acteurs & rôles",
    "4. Fonctionnalités par rôle",
    "5. Architecture technique",
    "6. Modèle de données",
    "7. API REST — Endpoints",
    "8. Modèle économique",
    "9. Interfaces utilisateur",
    "10. Sécurité & authentification",
    "11. Contraintes & exigences non fonctionnelles",
    "12. Roadmap & évolutions futures",
    "13. Glossaire",
]
for item in toc_items:
    bullet(item)

page_break()

# ══════════════════════════════════════════════════════════════════════════════
#  1. PRÉSENTATION
# ══════════════════════════════════════════════════════════════════════════════
heading1("1. Présentation du projet")
body(
    "AutoLink Pro est une plateforme numérique de mise en relation entre trois types d'acteurs : "
    "les propriétaires de véhicules, les clients souhaitant louer un véhicule, et les chauffeurs "
    "professionnels. La plateforme est déclinée en trois supports : une interface web (React), "
    "une API REST (Django) et une application mobile (Expo / React Native)."
)
body(
    "Le projet est développé dans le contexte du marché africain (fuseau horaire Africa/Douala, "
    "devise FCFA XAF, intégration Mobile Money MTN Cameroun et Orange Cameroun) tout en restant "
    "compatible avec les moyens de paiement internationaux (PayPal, Stripe)."
)

heading2("Contexte")
bullet("Marché cible : Afrique Centrale, initialement Cameroun (Douala & Yaoundé)")
bullet("Devise principale : Franc CFA (FCFA)")
bullet("Langues : Français (interface principale)")
bullet("Accès : Web (ordinateur & mobile) + Application native Android")

page_break()

# ══════════════════════════════════════════════════════════════════════════════
#  2. OBJECTIFS
# ══════════════════════════════════════════════════════════════════════════════
heading1("2. Objectifs & périmètre")

heading2("2.1 Objectifs principaux")
bullet("Permettre aux propriétaires de véhicules de les mettre en location de manière sécurisée")
bullet("Offrir aux clients une expérience de réservation simple, rapide et fiable")
bullet("Gérer un pool de chauffeurs certifiés assignables aux réservations")
bullet("Automatiser la gestion financière et la répartition des revenus")
bullet("Assurer la qualité des véhicules via des inspections systématiques")
bullet("Fournir un tableau de bord administratif complet pour piloter la plateforme")

heading2("2.2 Périmètre du MVP")
add_table(
    ["Module", "Inclus", "Hors périmètre initial"],
    [
        ["Authentification", "JWT, rôles, KYC documents", "SSO Google/Facebook"],
        ["Véhicules", "CRUD, photos, tarification auto", "GPS temps réel"],
        ["Réservations", "Création, statuts, notation", "Calendrier interactif avancé"],
        ["Paiements", "MTN, Orange, PayPal, Stripe", "Paiement fractionné"],
        ["Chauffeurs", "Candidature, profil, affectation", "Application chauffeur dédiée"],
        ["Inspections", "Fiche entrée/sortie, photos", "IA analyse photos"],
        ["Mobile", "App Android (Expo)", "iOS (App Store)"],
    ],
    [6, 5, 5]
)

page_break()

# ══════════════════════════════════════════════════════════════════════════════
#  3. ACTEURS
# ══════════════════════════════════════════════════════════════════════════════
heading1("3. Acteurs & rôles")
body("La plateforme distingue cinq rôles utilisateur, chacun disposant d'une interface et de droits spécifiques.")

add_table(
    ["Rôle", "Identifiant", "Description"],
    [
        ["Client",       "CLIENT",     "Loue des véhicules, effectue des paiements, note ses expériences"],
        ["Propriétaire", "OWNER",      "Met ses véhicules en location, suit ses revenus et son parc"],
        ["Chauffeur",    "DRIVER",     "Conduit les véhicules pour le compte des clients, gère ses courses"],
        ["Administrateur","ADMIN",    "Gère la plateforme, les utilisateurs, les finances et le recrutement"],
        ["Contrôleur",   "CONTROLLER","Réalise les inspections véhicules avant/après location"],
    ],
    [4, 3.5, 9]
)

page_break()

# ══════════════════════════════════════════════════════════════════════════════
#  4. FONCTIONNALITÉS PAR RÔLE
# ══════════════════════════════════════════════════════════════════════════════
heading1("4. Fonctionnalités par rôle")

# CLIENT
heading2("4.1 Client")
heading3("Page d'accueil / Landing")
bullet("Présentation de la plateforme, statistiques clés, témoignages")
bullet("Appel à l'action : inscription / connexion / recherche véhicule")

heading3("Recherche de véhicules")
bullet("Filtres : dates, catégorie, budget, carburant, mode de livraison")
bullet("Affichage des véhicules disponibles avec tarif calculé automatiquement")
bullet("Carte détaillée : photos, caractéristiques, note moyenne")

heading3("Réservation")
bullet("Sélection des dates de début / fin")
bullet("Choix de l'adresse de prise en charge et de retour")
bullet("Calcul automatique du montant total (tarif × jours)")
bullet("Sélection du mode de paiement")

heading3("Espace personnel Client")
bullet("Tableau de bord : réservations récentes, dépenses, état des courses")
bullet("Historique des réservations avec statuts (en attente, confirmé, en cours, terminé, litige)")
bullet("Notation du véhicule et du chauffeur après la course")

# PROPRIÉTAIRE
heading2("4.2 Propriétaire")
heading3("Gestion du parc")
bullet("Ajout d'un véhicule : marque, modèle, année, immatriculation, catégorie, carburant, places, couleur")
bullet("Upload de photos du véhicule")
bullet("Définition du tarif journalier de base")
bullet("Choix du mode : Confié à AutoLink (platform) ou À la demande chez le propriétaire (home)")
bullet("Suivi du statut : en attente, approuvé, en location, maintenance, suspendu")

heading3("Tarification automatique")
bullet("Le tarif calculé intègre : ancienneté du véhicule, type d'assurance, score d'état d'inspection")
bullet("Majoration ancienneté : +5 000 F/j si ≤ 2 ans, +2 000 F/j si ≤ 5 ans")
bullet("Majoration assurance : +2 000 F/j si Premium ou Tous risques")
bullet("Bonus état : jusqu'à +5 000 F selon le score (0–100)")

heading3("Tableau de bord financier")
bullet("Revenus totaux, nombre de locations, note moyenne")
bullet("Détail par véhicule : kilomètres parcourus, revenus, réservations")
bullet("Versements reçus avec statut et référence de transaction")

# CHAUFFEUR
heading2("4.3 Chauffeur")
bullet("Statut en ligne / hors ligne")
bullet("Visualisation du véhicule assigné")
bullet("Liste des courses actives et historique")
bullet("Statistiques : taux d'acceptation, ponctualité, notation clients, total de courses")
bullet("Revenus cumulés")

# ADMINISTRATEUR
heading2("4.4 Administrateur")
heading3("Tableau de bord global")
bullet("KPIs plateforme : revenus totaux, commissions, nombre de réservations, utilisateurs actifs")
bullet("Graphiques : revenus par mois, répartition des paiements par méthode")

heading3("Gestion des utilisateurs")
bullet("Liste paginée et filtrée des utilisateurs par rôle")
bullet("Vérification KYC : validation de l'identité et des documents")
bullet("Activation / suspension / suppression de comptes")

heading3("Recrutement chauffeurs")
bullet("Liste des candidatures avec score de conformité calculé automatiquement")
bullet("Critères de conformité : permis valide, casier judiciaire, certificat médical, test de conduite, formation")
bullet("Actions : approuver / rejeter la candidature, ajouter des notes de révision")

heading3("Finance")
bullet("Vue globale des paiements : montant total, commissions collectées, versements propriétaires")
bullet("Filtrage par période, méthode de paiement, statut")
bullet("Gestion des versements (payouts) aux propriétaires")

heading3("Catalogue")
bullet("Gestion des catégories de véhicules disponibles sur la plateforme")

# CONTRÔLEUR
heading2("4.5 Contrôleur")
bullet("Création de fiches d'inspection : entrée (avant location) et sortie (après location)")
bullet("Saisie : kilométrage, niveau de carburant, score d'état (0–100)")
bullet("Checklist des points de contrôle (format JSON configurable)")
bullet("Signalement de problèmes / dommages")
bullet("Upload de photos géolocalisées")
bullet("Historique de toutes les inspections réalisées")

page_break()

# ══════════════════════════════════════════════════════════════════════════════
#  5. ARCHITECTURE TECHNIQUE
# ══════════════════════════════════════════════════════════════════════════════
heading1("5. Architecture technique")

heading2("5.1 Stack technologique")
add_table(
    ["Couche", "Technologie", "Version", "Rôle"],
    [
        ["Frontend Web",  "React",                   "18.2",  "Interface utilisateur SPA"],
        ["Frontend Web",  "TailwindCSS",             "3.3",   "Framework CSS utilitaire"],
        ["Frontend Web",  "React Router DOM",        "6.20",  "Routage côté client"],
        ["Frontend Web",  "Recharts",                "2.10",  "Graphiques & visualisations"],
        ["Frontend Web",  "Axios",                   "1.6",   "Appels HTTP vers l'API"],
        ["Frontend Web",  "Lucide React",            "0.294", "Icônes"],
        ["Backend API",   "Django",                  "4.2",   "Framework web Python"],
        ["Backend API",   "Django REST Framework",   "3.14",  "Construction de l'API REST"],
        ["Backend API",   "SimpleJWT",               "5.5",   "Authentification JWT"],
        ["Backend API",   "CORS Headers",            "4.3",   "Gestion du CORS"],
        ["Backend API",   "Django Filter",           "23.3",  "Filtrage des querysets"],
        ["Backend API",   "Whitenoise",              "6.6",   "Fichiers statiques en prod"],
        ["Backend API",   "Pillow",                  "10.1",  "Traitement d'images"],
        ["Base de données","SQLite",                 "—",     "BDD embarquée (dev/prod léger)"],
        ["Mobile",        "Expo (React Native)",     "—",     "Application Android"],
        ["Build Mobile",  "EAS Build",               "—",     "Génération APK Android"],
    ],
    [3.5, 4, 2.5, 5.5]
)

heading2("5.2 Structure du projet")
body("Le projet est organisé en trois répertoires indépendants :")
bullet("frontend/  — Application React (SPA)")
bullet("backend/   — API Django REST avec les apps métier")
bullet("mobile/    — Application Expo React Native")

heading2("5.3 Organisation du backend")
add_table(
    ["App Django", "Modèles principaux", "Responsabilité"],
    [
        ["users",       "User",                         "Gestion des comptes, rôles, KYC"],
        ["vehicles",    "Vehicle, VehiclePhoto, VehicleAvailability", "Parc véhicule, tarification"],
        ["bookings",    "Booking",                      "Cycle de vie des réservations"],
        ["payments",    "Payment, Payout",              "Transactions & versements"],
        ["drivers",     "DriverApplication, DriverProfile", "Recrutement & profils chauffeurs"],
        ["inspections", "VehicleInspection, InspectionPhoto", "Fiches d'inspection"],
    ],
    [3, 7, 6.5]
)

heading2("5.4 Flux de communication")
bullet("Le frontend React communique avec le backend Django via des requêtes HTTP/JSON")
bullet("L'authentification utilise des tokens JWT (Access Token 24h, Refresh Token 30 jours)")
bullet("Le token est stocké dans le contexte React (AuthContext) et envoyé dans l'en-tête Authorization")
bullet("CORS configuré pour autoriser uniquement l'origine http://localhost:3000 (dev)")

page_break()

# ══════════════════════════════════════════════════════════════════════════════
#  6. MODÈLE DE DONNÉES
# ══════════════════════════════════════════════════════════════════════════════
heading1("6. Modèle de données")

heading2("6.1 Utilisateur (User)")
add_table(
    ["Champ", "Type", "Description"],
    [
        ["id",                  "BigAutoField",  "Clé primaire"],
        ["username",            "CharField",     "Nom d'utilisateur unique"],
        ["email",               "EmailField",    "Adresse e-mail"],
        ["role",                "CharField",     "CLIENT / OWNER / DRIVER / ADMIN / CONTROLLER"],
        ["phone",               "CharField",     "Numéro de téléphone"],
        ["avatar",              "ImageField",    "Photo de profil"],
        ["is_verified",         "BooleanField",  "Compte vérifié"],
        ["id_document",         "ImageField",    "Document d'identité (KYC)"],
        ["id_document_verified","BooleanField",  "Document KYC validé par un admin"],
        ["date_of_birth",       "DateField",     "Date de naissance"],
        ["address",             "TextField",     "Adresse physique"],
    ],
    [4.5, 3.5, 8.5]
)

heading2("6.2 Véhicule (Vehicle)")
add_table(
    ["Champ", "Type", "Description"],
    [
        ["owner",         "ForeignKey(User)", "Propriétaire du véhicule"],
        ["brand / model", "CharField",         "Marque et modèle"],
        ["year",          "IntegerField",      "Année (2000–2030)"],
        ["plate",         "CharField",         "Immatriculation (unique)"],
        ["category",      "CharField",         "Catégorie (Berline, SUV, etc.)"],
        ["fuel",          "CharField",         "essence / diesel / hybrid / electric"],
        ["mode",          "CharField",         "platform (confié) / home (à la demande)"],
        ["status",        "CharField",         "pending / approved / rented / maintenance / suspended"],
        ["daily_rate",    "DecimalField",       "Tarif journalier défini par le propriétaire"],
        ["computed_rate", "DecimalField",       "Tarif final calculé automatiquement"],
        ["insurance_type","CharField",         "standard / premium / all_risk"],
        ["condition_score","IntegerField",     "Score d'état (0–100) issu des inspections"],
    ],
    [4.5, 3.5, 8.5]
)

heading2("6.3 Réservation (Booking)")
add_table(
    ["Champ", "Type", "Description"],
    [
        ["client",            "ForeignKey(User)",    "Client qui loue"],
        ["vehicle",           "ForeignKey(Vehicle)", "Véhicule loué"],
        ["driver",            "ForeignKey(User)",    "Chauffeur assigné (optionnel)"],
        ["status",            "CharField",           "pending / confirmed / active / completed / cancelled / disputed"],
        ["start_date/end_date","DateField",          "Période de location"],
        ["daily_rate",        "DecimalField",        "Tarif appliqué au moment de la réservation"],
        ["days",              "IntegerField",         "Nombre de jours calculé automatiquement"],
        ["subtotal",          "DecimalField",        "Montant total (daily_rate × days)"],
        ["commission_amount", "DecimalField",        "Commission AutoLink (25%)"],
        ["owner_amount",      "DecimalField",        "Part reversée au propriétaire (75%)"],
        ["client_rating",     "IntegerField",        "Note client (1–5)"],
    ],
    [4.5, 3.5, 8.5]
)

heading2("6.4 Paiement (Payment) & Versement (Payout)")
add_table(
    ["Champ", "Type", "Description"],
    [
        ["booking",       "OneToOneField(Booking)", "Réservation associée"],
        ["method",        "CharField",              "mtn / orange / paypal / stripe"],
        ["status",        "CharField",              "pending / completed / failed / refunded"],
        ["amount",        "DecimalField",           "Montant total payé"],
        ["commission",    "DecimalField",           "Part AutoLink"],
        ["owner_payout",  "DecimalField",           "Part propriétaire"],
        ["payout_done",   "BooleanField",           "Versement effectué"],
        ["transaction_ref","CharField",             "Référence transaction externe"],
    ],
    [4.5, 3.5, 8.5]
)

page_break()

# ══════════════════════════════════════════════════════════════════════════════
#  7. API REST
# ══════════════════════════════════════════════════════════════════════════════
heading1("7. API REST — Endpoints")

heading2("7.1 Authentification")
add_table(
    ["Méthode", "URL", "Description", "Auth"],
    [
        ["POST", "/api/auth/token/",         "Connexion — obtenir Access & Refresh token", "Non"],
        ["POST", "/api/auth/token/refresh/", "Renouveler le token d'accès",               "Non"],
        ["POST", "/api/users/register/",     "Créer un compte utilisateur",               "Non"],
        ["GET",  "/api/users/me/",           "Profil de l'utilisateur connecté",          "Oui"],
        ["PUT",  "/api/users/me/",           "Modifier son profil",                       "Oui"],
    ],
    [2, 5, 6, 2]
)

heading2("7.2 Véhicules")
add_table(
    ["Méthode", "URL", "Description", "Rôle requis"],
    [
        ["GET",    "/api/vehicles/",      "Liste des véhicules disponibles (filtrés)", "Tous"],
        ["POST",   "/api/vehicles/",      "Ajouter un véhicule",                      "OWNER"],
        ["GET",    "/api/vehicles/{id}/", "Détail d'un véhicule",                     "Tous"],
        ["PUT",    "/api/vehicles/{id}/", "Modifier un véhicule",                     "OWNER"],
        ["DELETE", "/api/vehicles/{id}/", "Supprimer un véhicule",                    "OWNER/ADMIN"],
    ],
    [2, 5, 5, 3]
)

heading2("7.3 Réservations")
add_table(
    ["Méthode", "URL", "Description", "Rôle requis"],
    [
        ["POST", "/api/bookings/",      "Créer une réservation",                  "CLIENT"],
        ["GET",  "/api/bookings/",      "Mes réservations",                       "Tous"],
        ["GET",  "/api/bookings/{id}/", "Détail d'une réservation",               "Tous"],
        ["PUT",  "/api/bookings/{id}/", "Modifier le statut ou noter",            "Tous"],
    ],
    [2, 5, 5, 3]
)

heading2("7.4 Paiements & Versements")
add_table(
    ["Méthode", "URL", "Description", "Rôle requis"],
    [
        ["POST", "/api/payments/payments/", "Initier un paiement",      "CLIENT"],
        ["GET",  "/api/payments/payments/", "Historique des paiements", "ADMIN/OWNER"],
        ["GET",  "/api/payments/payouts/",  "Mes versements",           "OWNER"],
    ],
    [2, 5.5, 5, 3]
)

heading2("7.5 Chauffeurs & Inspections")
add_table(
    ["Méthode", "URL", "Description", "Rôle requis"],
    [
        ["GET",  "/api/drivers/applications/", "Liste des candidatures",    "ADMIN"],
        ["POST", "/api/drivers/applications/", "Soumettre une candidature", "Tous"],
        ["PUT",  "/api/drivers/applications/{id}/", "Mettre à jour statut", "ADMIN"],
        ["GET",  "/api/inspections/",          "Liste des inspections",     "ADMIN/CONTROLLER"],
        ["POST", "/api/inspections/",          "Créer une fiche d'inspection", "CONTROLLER/ADMIN"],
    ],
    [2, 5.5, 5, 3]
)

page_break()

# ══════════════════════════════════════════════════════════════════════════════
#  8. MODÈLE ÉCONOMIQUE
# ══════════════════════════════════════════════════════════════════════════════
heading1("8. Modèle économique")

heading2("8.1 Répartition des revenus")
add_table(
    ["Acteur", "Part", "Exemple (100 000 FCFA)"],
    [
        ["AutoLink Pro (commission)", "25%", "25 000 FCFA"],
        ["Propriétaire du véhicule",  "75%", "75 000 FCFA"],
    ],
    [6, 3, 6.5]
)
body(
    "La commission est calculée et stockée automatiquement à chaque création de réservation "
    "via la méthode save() du modèle Booking."
)

heading2("8.2 Calcul automatique du tarif")
body("Le tarif affiché au client est calculé selon la formule suivante :")
bullet("Tarif de base : défini par le propriétaire (daily_rate)")
bullet("+ Ancienneté : +5 000 F/j si le véhicule a ≤ 2 ans, +2 000 F/j si ≤ 5 ans")
bullet("+ Assurance : +2 000 F/j si assurance Premium ou Tous risques")
bullet("+ Bonus état : arrondi((condition_score / 100) × 5 000) F/j")

heading2("8.3 Méthodes de paiement acceptées")
add_table(
    ["Méthode", "Identifiant", "Contexte"],
    [
        ["MTN Mobile Money", "mtn",    "Paiement mobile local — Afrique de l'Ouest"],
        ["Orange Money",     "orange", "Paiement mobile local — Afrique de l'Ouest"],
        ["PayPal",           "paypal", "Paiement international en ligne"],
        ["Stripe (Carte)",   "stripe", "Carte bancaire internationale"],
    ],
    [5, 3.5, 7]
)

page_break()

# ══════════════════════════════════════════════════════════════════════════════
#  9. INTERFACES UTILISATEUR
# ══════════════════════════════════════════════════════════════════════════════
heading1("9. Interfaces utilisateur")

heading2("9.1 Pages web (React)")
add_table(
    ["Route", "Page / Composant", "Rôle"],
    [
        ["/",                         "Landing",             "Tous"],
        ["/login",                    "Login",               "Tous"],
        ["/register",                 "Register",            "Tous"],
        ["/client/dashboard",         "ClientDashboard",     "CLIENT"],
        ["/client/search",            "SearchVehicles",      "CLIENT"],
        ["/client/bookings",          "MyBookings",          "CLIENT"],
        ["/owner/dashboard",          "OwnerDashboard",      "OWNER"],
        ["/owner/vehicles",           "MyVehicles",          "OWNER"],
        ["/owner/add-vehicle",        "AddVehicle",          "OWNER"],
        ["/driver/dashboard",         "DriverDashboard",     "DRIVER"],
        ["/admin/dashboard",          "AdminDashboard",      "ADMIN"],
        ["/admin/drivers",            "DriverRecruitment",   "ADMIN"],
        ["/admin/finance",            "Finance",             "ADMIN"],
        ["/admin/inspections",        "VehicleInspection",   "ADMIN/CONTROLLER"],
        ["/admin/users",              "ManageUsers",         "ADMIN"],
        ["/admin/catalog",            "CatalogManager",      "ADMIN"],
        ["/controller/dashboard",     "ControllerDashboard", "ADMIN/CONTROLLER"],
    ],
    [5, 4.5, 3.5]
)

heading2("9.2 Application mobile (Expo)")
bullet("Application React Native compilée via Expo EAS Build")
bullet("Cible initiale : Android (APK)")
bullet("Contenu : App.js unique — navigation, authentification, réservations, profil chauffeur")
bullet("QR code de test : compatible avec l'app Expo Go")

heading2("9.3 Design system")
bullet("Framework CSS : TailwindCSS 3.3 avec configuration personnalisée (couleurs primary/secondary)")
bullet("Thème clair / sombre : géré via ThemeContext")
bullet("Icônes : Lucide React")
bullet("Graphiques : Recharts (barres, lignes, camembert)")
bullet("Composant de layout partagé : DashboardLayout")

page_break()

# ══════════════════════════════════════════════════════════════════════════════
#  10. SÉCURITÉ
# ══════════════════════════════════════════════════════════════════════════════
heading1("10. Sécurité & authentification")

heading2("10.1 Authentification JWT")
bullet("Access Token : durée de vie 24 heures")
bullet("Refresh Token : durée de vie 30 jours")
bullet("Tous les endpoints (sauf /api/auth/ et /api/users/register/) nécessitent un token valide")
bullet("Gestion via rest_framework_simplejwt")

heading2("10.2 Autorisation par rôle")
bullet("Chaque route React est protégée par un composant Guard vérifiant le rôle de l'utilisateur")
bullet("Côté API, les permissions sont vérifiées dans chaque vue DRF")
bullet("Séparation stricte des données : un CLIENT ne peut voir que ses propres réservations")

heading2("10.3 Données sensibles")
bullet("Clé secrète Django (SECRET_KEY) stockée dans un fichier .env (non versionné)")
bullet("Fichier .env.example fourni comme modèle")
bullet("CORS configuré pour n'autoriser que les origines déclarées")
bullet("Validation des tokens JWT à chaque requête authentifiée")

heading2("10.4 KYC (Know Your Customer)")
bullet("Upload de documents d'identité pour les utilisateurs (id_document)")
bullet("Validation manuelle par l'administrateur (id_document_verified)")
bullet("Statut is_verified sur le compte utilisateur")

page_break()

# ══════════════════════════════════════════════════════════════════════════════
#  11. EXIGENCES NON FONCTIONNELLES
# ══════════════════════════════════════════════════════════════════════════════
heading1("11. Contraintes & exigences non fonctionnelles")

add_table(
    ["Catégorie", "Exigence"],
    [
        ["Performance",   "Le frontend doit s'afficher en moins de 3 secondes sur connexion 3G"],
        ["Disponibilité", "Le backend doit viser une disponibilité de 99,5% en production"],
        ["Pagination",    "Toutes les listes API sont paginées (20 éléments par page par défaut)"],
        ["Scalabilité",   "Architecture prête pour migration vers PostgreSQL en production"],
        ["Localisation",  "Fuseau horaire Africa/Abidjan, langue fr-FR, devise FCFA"],
        ["Accessibilité", "Interface responsive : ordinateur, tablette, mobile"],
        ["Médias",        "Images compressées via Pillow, servies par Whitenoise en production"],
        ["Conformité",    "Chaque véhicule doit avoir une assurance valide avant d'être approuvé"],
        ["Audit",         "Tous les modèles incluent les champs created_at / updated_at"],
    ],
    [4, 12.5]
)

page_break()

# ══════════════════════════════════════════════════════════════════════════════
#  12. ROADMAP
# ══════════════════════════════════════════════════════════════════════════════
heading1("12. Roadmap & évolutions futures")

heading2("Phase 1 — MVP (actuelle)")
bullet("Toutes les fonctionnalités décrites dans ce cahier de charges")
bullet("Interface web complète pour les 5 rôles")
bullet("API REST complète avec authentification JWT")
bullet("Application mobile Android de base")

heading2("Phase 2 — Amélioration UX")
bullet("Intégration d'une carte interactive (Google Maps / Leaflet) pour la localisation des véhicules")
bullet("Calendrier de disponibilité avancé")
bullet("Notifications push (email + mobile)")
bullet("Chat intégré entre client et propriétaire")
bullet("Migration base de données vers PostgreSQL")

heading2("Phase 3 — Croissance")
bullet("Application iOS (App Store)")
bullet("Tableau de bord analytics avancé (Power BI / Metabase)")
bullet("API webhooks pour les partenaires")
bullet("Programme de fidélité client")
bullet("Assurance intégrée (partenariat avec assureur)")
bullet("Expansion géographique (Sénégal, Cameroun, Mali)")

heading2("Phase 4 — IA & Automatisation")
bullet("Analyse IA des photos d'inspection pour détecter les dommages")
bullet("Tarification dynamique basée sur la demande")
bullet("Score de confiance automatique pour les nouveaux utilisateurs")
bullet("Détection de fraude sur les paiements")

page_break()

# ══════════════════════════════════════════════════════════════════════════════
#  13. GLOSSAIRE
# ══════════════════════════════════════════════════════════════════════════════
heading1("13. Glossaire")

add_table(
    ["Terme", "Définition"],
    [
        ["SPA",         "Single Page Application — application web dont le rechargement de page est géré côté client"],
        ["JWT",         "JSON Web Token — standard d'authentification sans session côté serveur"],
        ["DRF",         "Django REST Framework — bibliothèque Python pour construire des API REST"],
        ["KYC",         "Know Your Customer — processus de vérification d'identité des utilisateurs"],
        ["FCFA",        "Franc CFA — devise officielle de plusieurs pays d'Afrique de l'Ouest"],
        ["MTN Money",   "Service de paiement mobile de l'opérateur MTN"],
        ["Orange Money","Service de paiement mobile de l'opérateur Orange"],
        ["APK",         "Android Package — format d'installation d'application Android"],
        ["EAS Build",   "Expo Application Services Build — service de compilation Expo pour générer des APK"],
        ["CORS",        "Cross-Origin Resource Sharing — mécanisme permettant à un serveur d'autoriser des requêtes depuis une autre origine"],
        ["CRUD",        "Create, Read, Update, Delete — opérations de base sur les données"],
        ["Commission",  "25% du montant total de chaque réservation prélevé par AutoLink Pro"],
        ["Payout",      "Versement de la part propriétaire (75%) après confirmation du paiement"],
        ["Mode Platform","Le propriétaire confie son véhicule à AutoLink pour gestion complète"],
        ["Mode Home",   "Le propriétaire garde son véhicule et le met à disposition à la demande"],
    ],
    [4, 12.5]
)

# ── Pied de page ──────────────────────────────────────────────────────────────
doc.add_paragraph()
footer_p = doc.add_paragraph()
footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
rf = footer_p.add_run(
    f"AutoLink Pro — Cahier de Charges v1.0 — Confidentiel — {datetime.date.today().strftime('%d/%m/%Y')}"
)
rf.italic = True
rf.font.size = Pt(9)
rf.font.color.rgb = RGBColor(0x6B, 0x72, 0x80)

# ── Sauvegarde ────────────────────────────────────────────────────────────────
output_path = r"c:\Users\Albert WIB\CascadeProjects\autolink\AutoLink_Pro_Cahier_de_Charges.docx"
doc.save(output_path)
print(f"Document généré : {output_path}")
