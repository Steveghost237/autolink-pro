# -*- coding: utf-8 -*-
"""
AutoLink Pro — Générateur des 3 documents Word
  1. Cahier de Charges (CDC)
  2. Cahier Fonctionnel (CF)
  3. Cahier Technique (CT)
Basé sur : transcription réunion fondateur + ancien CDC + code source projet
Contexte : Cameroun — Douala & Yaoundé — Africa/Douala (UTC+1) — XAF
"""
from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import datetime

TODAY = datetime.date.today().strftime('%d %B %Y')
OUT   = r'c:\Users\Albert WIB\CascadeProjects\autolink'

C_NAV  = RGBColor(0x0F, 0x17, 0x2A)
C_SKY  = RGBColor(0x0E, 0xA5, 0xE9)
C_ORA  = RGBColor(0xF9, 0x73, 0x16)
C_GRN  = RGBColor(0x10, 0xB9, 0x81)
C_DARK = RGBColor(0x1E, 0x29, 0x3B)
C_GREY = RGBColor(0x64, 0x74, 0x8B)
C_WHT  = RGBColor(0xFF, 0xFF, 0xFF)

# ── helpers ──────────────────────────────────────────────────────────────────
def new_doc():
    doc = Document()
    s = doc.sections[0]
    s.page_width = Cm(21); s.page_height = Cm(29.7)
    s.left_margin = Cm(2.5); s.right_margin = Cm(2.5)
    s.top_margin  = Cm(2.5); s.bottom_margin = Cm(2.5)
    return doc

def shd(cell, hex6):
    tc = cell._tc; pr = tc.get_or_add_tcPr()
    e = OxmlElement('w:shd')
    e.set(qn('w:val'),'clear'); e.set(qn('w:color'),'auto'); e.set(qn('w:fill'), hex6)
    pr.append(e)

def cover(doc, doc_type, subtitle):
    p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(72)
    r = p.add_run('AutoLink Pro'); r.bold=True; r.font.size=Pt(44); r.font.color.rgb=C_SKY
    p2 = doc.add_paragraph(); p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r2 = p2.add_run(doc_type); r2.bold=True; r2.font.size=Pt(24); r2.font.color.rgb=C_ORA
    doc.add_paragraph()
    p3 = doc.add_paragraph(); p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r3 = p3.add_run(subtitle); r3.font.size=Pt(14); r3.font.color.rgb=C_GREY
    doc.add_paragraph(); doc.add_paragraph()
    p4 = doc.add_paragraph(); p4.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r4 = p4.add_run(f'Version 1.1  ·  {TODAY}  ·  CONFIDENTIEL')
    r4.italic=True; r4.font.size=Pt(11); r4.font.color.rgb=C_GREY
    p5 = doc.add_paragraph(); p5.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r5 = p5.add_run('"Votre mobilité, notre mission — Douala & Yaoundé, Cameroun"')
    r5.italic=True; r5.font.size=Pt(13); r5.font.color.rgb=C_DARK

def h1(doc, txt):
    p = doc.add_paragraph()
    p.paragraph_format.space_before=Pt(22); p.paragraph_format.space_after=Pt(8)
    r = p.add_run(txt); r.bold=True; r.font.size=Pt(16); r.font.color.rgb=C_SKY
    pPr = p._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr'); bot = OxmlElement('w:bottom')
    bot.set(qn('w:val'),'single'); bot.set(qn('w:sz'),'8')
    bot.set(qn('w:space'),'4'); bot.set(qn('w:color'),'0EA5E9')
    pBdr.append(bot); pPr.append(pBdr)

def h2(doc, txt):
    p = doc.add_paragraph()
    p.paragraph_format.space_before=Pt(12); p.paragraph_format.space_after=Pt(4)
    r = p.add_run(txt); r.bold=True; r.font.size=Pt(13); r.font.color.rgb=C_ORA

def h3(doc, txt):
    p = doc.add_paragraph()
    p.paragraph_format.space_before=Pt(8); p.paragraph_format.space_after=Pt(2)
    r = p.add_run(txt); r.bold=True; r.font.size=Pt(11); r.font.color.rgb=C_GRN

def body(doc, txt):
    p = doc.add_paragraph(); p.paragraph_format.space_after=Pt(6)
    r = p.add_run(txt); r.font.size=Pt(10.5); r.font.color.rgb=C_DARK

def bul(doc, txt, lvl=0):
    p = doc.add_paragraph(style='List Bullet' if lvl==0 else 'List Bullet 2')
    p.paragraph_format.space_after=Pt(3)
    r = p.add_run(txt); r.font.size=Pt(10.5); r.font.color.rgb=C_DARK

def tbl(doc, headers, rows, widths=None):
    t = doc.add_table(rows=1+len(rows), cols=len(headers))
    t.style='Table Grid'; t.alignment=WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(headers):
        c = t.rows[0].cells[i]; shd(c,'0F172A')
        rn = c.paragraphs[0].add_run(h)
        rn.bold=True; rn.font.size=Pt(10); rn.font.color.rgb=C_WHT
        c.paragraphs[0].alignment=WD_ALIGN_PARAGRAPH.CENTER
    for ri, row in enumerate(rows):
        tr = t.rows[ri+1]; bg='F0F9FF' if ri%2==0 else 'FFFFFF'
        for ci, val in enumerate(row):
            c=tr.cells[ci]; shd(c,bg)
            rn=c.paragraphs[0].add_run(str(val))
            rn.font.size=Pt(10); rn.font.color.rgb=C_DARK
    if widths:
        for row in t.rows:
            for ci,w in enumerate(widths):
                if ci < len(widths): row.cells[ci].width=Cm(w)
    doc.add_paragraph()

def info(doc, txt, bg='DBEAFE'):
    t = doc.add_table(rows=1, cols=1); t.style='Table Grid'
    c = t.rows[0].cells[0]; shd(c,bg)
    rn = c.paragraphs[0].add_run(txt)
    rn.font.size=Pt(10.5); rn.font.color.rgb=C_DARK; rn.italic=True
    doc.add_paragraph()

def pb(doc): doc.add_page_break()

# ══════════════════════════════════════════════════════════════════════════════
#  DOCUMENT 1 — CAHIER DE CHARGES
# ══════════════════════════════════════════════════════════════════════════════
def make_cdc():
    doc = new_doc()
    cover(doc,'CAHIER DE CHARGES','Exigences générales, périmètre & modèle économique — v1.1')
    pb(doc)

    h1(doc,'Table des matières')
    for x in ['1. Présentation & Contexte','2. Opportunité de Marché — Cameroun',
              '3. Vision & Objectifs Stratégiques','4. Acteurs & Rôles',
              '5. Périmètre Fonctionnel — MVP','6. Types de Location',
              '7. Modèle Économique & Système Agent','8. Contraintes & Exigences','9. Roadmap']:
        bul(doc, x)
    pb(doc)

    # 1
    h1(doc,'1. Présentation & Contexte')
    body(doc,'AutoLink Pro est une plateforme de transport urbain, interurbain et même nationale. '
         'Cette plateforme numérique met en relation les propriétaires ou gestionnaires de véhicules avec les clients '
         'désireux de louer un véhicule de qualité, récent, pour leurs déplacements dans des zones urbaines ou rurales.')
    body(doc,'Le projet est conçu pour le marché camerounais — fuseau horaire Africa/Douala (UTC+1), '
         'devise XAF (FCFA BEAC), paiement mobile via Orange Money et MTN MoMo.')
    h2(doc,'Contexte & Genèse')
    bul(doc,'Marché cible : Cameroun')
    bul(doc,"Constat : aucune plateforme digitale de location de véhicules n'existe au Cameroun")
    bul(doc,"Positionnement : first mover sur un marché vierge et porteur")
    bul(doc,"AutoLink Pro n'est PAS une application de courses (≠ Yango) — c'est de la location à la durée (heures / jours)")
    bul(doc,'Devise : Franc CFA BEAC (XAF) — indicatif téléphonique +237')
    pb(doc)

    # 2
    h1(doc,'2. Opportunité de Marché — Cameroun')
    info(doc,'💡 "C\'est un modèle qui n\'existe pas encore au Cameroun. Et il faut être premier là-dessus."  — Fondateur (transcription réunion)')
    tbl(doc,['Critère','Situation actuelle','Opportunité AutoLink Pro'],
        [['Location courte durée','Agences physiques peu accessibles, pas de digital','Plateforme 100 % digitale, réservation en < 3 min'],
         ['Location avec chauffeur','Réseau informel, aucune garantie, paiement cash','Chauffeurs certifiés, traçabilité, paiement mobile'],
         ['Paiement digital','Espèces dominantes dans le secteur','Orange Money & MTN MoMo nativement intégrés'],
         ['Durées courtes (3h–8h)','Inexistant — Yango fait des courses, pas de location','Créneau libre : 3h, 4h, 8h non couvert par Yango'],
         ['Interurbain / Longue ligne','Agences seulement, pas de digital','Location Douala↔Yaoundé, Douala↔Bafoussam sur plateforme']],
        [5,5.5,6])
    h2(doc,'2.2 Segments de clientèle visés')
    bul(doc,'Voyageurs d\'affaires : véhicule avec chauffeur pour la journée ou quelques heures')
    bul(doc,'Touristes & visiteurs : déplacements interurbains ou découverte de la ville')
    bul(doc,'Particuliers : évènements (mariage, baptême, cérémonie), sorties, transfert aéroport')
    bul(doc,'Entreprises : flotte externalisée pour déplacements de collaborateurs')
    pb(doc)

    # 3
    h1(doc,'3. Vision & Objectifs Stratégiques')
    h2(doc,'3.1 Vision')
    body(doc,'Devenir la référence incontournable de la location de véhicules avec chauffeur en Afrique Centrale, '
         'en commençant par le Cameroun, grâce à une plateforme simple, fiable et ancrée dans le contexte local.')
    h2(doc,'3.2 Objectifs')
    bul(doc,'Simplifier la mise en relation entre gestionnaires de véhicules et clients via le digital')
    bul(doc,'Offrir 3 types de location adaptés au contexte camerounais : urbain, interurbain, longue ligne')
    bul(doc,'Assurer la sécurité des transactions via des paiements mobiles intégrés')
    bul(doc,'Certifier les chauffeurs et inspecter les véhicules (contrôle qualité systématique)')
    bul(doc,'Générer des revenus durables via une commission sur chaque transaction (20–25 %)')
    bul(doc,'Fournir un tableau de bord de pilotage complet à l\'opérateur AutoLink')
    pb(doc)

    # 4
    h1(doc,'4. Acteurs & Rôles')
    info(doc,'📌 "Il y a la plateforme que nous gérons, le client d\'un côté, et la voiture de l\'autre côté. '
         'Ce n\'est pas forcément un propriétaire — c\'est un gestionnaire."  — Fondateur')
    tbl(doc,['Acteur','Rôle système','Description'],
        [['La Plateforme','ADMIN / OPERATOR','AutoLink Pro — opère la plateforme, valide véhicules & chauffeurs, perçoit la commission, gère les agents'],
         ['Gestionnaire de véhicule','GESTIONNAIRE','Inscrit et gère un ou plusieurs véhicules. Peut être le propriétaire lui-même ou un mandataire. Fixe le tarif et le forfait km.'],
         ['Chauffeur','DRIVER','Professionnel certifié par AutoLink. Conduit le véhicule pour le client. Rattaché à un gestionnaire.'],
         ['Client','CLIENT','Réserve un véhicule via la plateforme (avec chauffeur par défaut). Paie en ligne.'],
         ['Contrôleur','CONTROLLER','Agent AutoLink qui réalise les inspections entrée/sortie des véhicules.']],
        [4,3.5,9])
    h2(doc,'4.1 Clarification : Gestionnaire vs Propriétaire')
    body(doc,'Le terme "propriétaire" est insuffisant pour le contexte camerounais. Un propriétaire peut confier son véhicule à un tiers qui le gère au quotidien. On distingue :')
    bul(doc,'Gestionnaire-propriétaire : le propriétaire gère lui-même son véhicule sur la plateforme')
    bul(doc,'Gestionnaire-mandataire : une personne de confiance (ex : Marcel) gère le véhicule pour le compte du propriétaire')
    body(doc,'Dans les deux cas, le gestionnaire est l\'unique interlocuteur de la plateforme AutoLink.')
    pb(doc)

    # 5
    h1(doc,'5. Périmètre Fonctionnel — MVP')
    tbl(doc,['Module','Inclus MVP','Phase ultérieure'],
        [['Inscription & Auth JWT','Tous les rôles, vérification KYC documents','SSO Google, Face ID biométrique'],
         ['Véhicules','Ajout, photos, tarif, approbation, statuts, forfait km','GPS temps réel, géolocalisation carte'],
         ['Réservations','Création, statuts, annulation, notation, km supplémentaires','Calendrier interactif avancé'],
         ['Types de location','Urbain (3h/4h/8h/24h), Interurbain, Longue ligne','Abonnements mensuels entreprises'],
         ['Forfait kilométrique','Km inclus + surcharge calculée automatiquement','Calcul automatique via GPS tracker'],
         ['Paiements','Orange Money, MTN MoMo, dépôt bancaire','Carte bancaire, paiement fractionné'],
         ['Système Agent','Code affilié, suivi commissions','Dashboard agent dédié, QR codes'],
         ['Inspections','Fiche entrée/sortie, score, photos, calcul km parcourus','IA détection dommages photos'],
         ['Administration','Dashboard KPIs, gestion users, finance, agents','Analytics BI avancé (Metabase)'],
         ['Mobile','Application Android (Expo EAS Build)','iOS (App Store)']],
        [4,6,6.5])
    pb(doc)

    # 6
    h1(doc,'6. Types de Location')
    info(doc,'📌 "Il faut faire l\'allocation en urbain, en interurbain et en longue ligne."  — Fondateur')
    h2(doc,'6.1 Location Urbaine (court terme, en ville)')
    bul(doc,'Durées : 3 heures · 4 heures · 8 heures · 12 heures · 24 heures')
    bul(doc,'Usage : déplacements en ville, courses, rendez-vous pro, aéroport, évènements')
    bul(doc,'Chauffeur : obligatoire (recommandé pour le contexte sécuritaire camerounais)')
    bul(doc,'Forfait km : inclus selon la durée, surcharge au-delà (voir tableau 6.4)')
    h2(doc,'6.2 Location Interurbaine')
    bul(doc,'Trajet entre deux villes : Douala → Yaoundé, Douala → Bafoussam, Yaoundé → Kribi, etc.')
    bul(doc,'Durée minimale : 1 journée — option aller simple ou aller-retour')
    bul(doc,'Forfait km plus étendu, adapté aux longues distances')
    h2(doc,'6.3 Location Longue Durée (plusieurs jours)')
    bul(doc,'Location sur 2 jours, 3 jours, 1 semaine et plus')
    bul(doc,'Forfait kilométrique journalier × nombre de jours')
    bul(doc,'Dépôt de garantie obligatoire pour locations > 3 jours')
    h2(doc,'6.4 Forfait Kilométrique — Référentiel tarifaire')
    tbl(doc,['Type de location','Km inclus','Tarif km supplémentaire','Exemple de calcul'],
        [['Urbain 3h','100 km','150 XAF/km','150 km → 50 km × 150 = 7 500 XAF supp.'],
         ['Urbain 8h','200 km','150 XAF/km','320 km → 120 km × 150 = 18 000 XAF supp.'],
         ['Journée (24h)','300 km','120 XAF/km','500 km → 200 km × 120 = 24 000 XAF supp.'],
         ['Interurbain','500 km','100 XAF/km','650 km → 150 km × 100 = 15 000 XAF supp.'],
         ['Longue durée','500 km/jour','100 XAF/km','Calculé à la fin de la location']],
        [3.5,2.5,4,6.5])
    pb(doc)

    # 7
    h1(doc,'7. Modèle Économique & Système Agent')
    h2(doc,'7.1 Répartition des revenus')
    tbl(doc,['Acteur','Part','Détail'],
        [['AutoLink Pro (plateforme)','20 % à 25 %','Commission prélevée automatiquement sur chaque réservation confirmée'],
         ['Gestionnaire de véhicule','75 % à 80 %','Versement au gestionnaire après déduction de la commission (Orange Money / MTN)'],
         ['Agent affilié','Variable (ex: 5 %)','Prélevé sur la part AutoLink uniquement — non répercuté sur le gestionnaire']],
        [5,3,8.5])
    h2(doc,'7.2 Système Agent Affilié')
    info(doc,'💡 "Une partie agent qui apporte la vie [...] ce n\'est pas un rôle — c\'est quelqu\'un qu\'on a reconnu comme tel. '
         'Comme les influenceurs font avec Onexbet — dès qu\'un client met le code de l\'agent, on sait qu\'on va le rémunérer."  — Fondateur')
    bul(doc,"L'agent n'est PAS un compte utilisateur dans le système — c'est un programme d'affiliation géré par l'admin")
    bul(doc,'Chaque agent reçoit un code unique (ex : AGT-DBL-001) communiqué par AutoLink')
    bul(doc,'Le client entre le code agent lors de sa réservation (champ optionnel)')
    bul(doc,'Le système identifie automatiquement l\'agent et enregistre la conversion')
    bul(doc,'L\'agent perçoit un pourcentage de la commission AutoLink (configurable par l\'admin)')
    bul(doc,'Types d\'agents : influenceurs réseaux sociaux, commerciaux terrain, chauffeurs partenaires, hôtels')
    bul(doc,'Reversement : via Orange Money ou MTN MoMo, selon fréquence définie (hebdo / mensuel)')
    h2(doc,'7.3 Méthodes de paiement acceptées')
    bul(doc,'Orange Money Cameroun (+237) — paiement mobile instantané')
    bul(doc,'MTN Mobile Money (+237) — paiement mobile instantané')
    bul(doc,'Dépôt bancaire direct — pour entreprises et grandes réservations')
    bul(doc,'Carte Visa / Mastercard — Phase 2')
    pb(doc)

    # 8
    h1(doc,'8. Contraintes & Exigences')
    h2(doc,'8.1 Exigences fonctionnelles')
    bul(doc,'Interface 100 % en français, contextualisée pour le Cameroun (montants en XAF, villes locales)')
    bul(doc,"Toujours proposer l'option 'avec chauffeur' en premier (sécurité, contexte camerounais)")
    bul(doc,'Réservation complète réalisable en moins de 3 minutes')
    bul(doc,'Prise en charge du mode offline partiel sur mobile (données en cache)')
    h2(doc,'8.2 Exigences non fonctionnelles')
    tbl(doc,['Critère','Exigence'],
        [['Disponibilité','≥ 99,5 % (< 4h d\'indisponibilité/mois)'],
         ['Performance','Chargement page < 3 s sur réseau 3G'],
         ['Sécurité','HTTPS/TLS 1.3, tokens JWT, données sensibles chiffrées'],
         ['Scalabilité','Architecture supportant 10 000 utilisateurs simultanés (phase 3)'],
         ['Compatibilité mobile','Android 8.0 et supérieur'],
         ['Internationalisation','Français (langue principale) — anglais en phase 2']],
        [4,12.5])
    pb(doc)

    # 9
    h1(doc,'9. Roadmap')
    tbl(doc,['Phase','Contenu','Échéance cible'],
        [['Phase 1 — MVP','Plateforme web + API + App Android. Tous les rôles. Location urbaine/interurbaine. Orange Money & MTN. Système agent basique.','T1 2025'],
         ['Phase 2 — Croissance','Carte interactive (GPS), notifications push, chat client-gestionnaire, calendrier avancé, PostgreSQL, MTN MoMo amélioré.','T2–T3 2025'],
         ['Phase 3 — Expansion','iOS App Store, analytics BI (Metabase), programme fidélité, assurance intégrée, expansion Bafoussam / Kribi / Garoua.','T4 2025'],
         ['Phase 4 — IA & Automatisation','Analyse IA photos inspection, tarification dynamique, détection fraude, chatbot support, score de confiance automatique.','2026']],
        [3,10.5,3])

    doc.save(f'{OUT}\\AutoLink_Cahier_de_Charges.docx')
    print('✅  AutoLink_Cahier_de_Charges.docx généré')

# ══════════════════════════════════════════════════════════════════════════════
#  DOCUMENT 2 — CAHIER FONCTIONNEL
# ══════════════════════════════════════════════════════════════════════════════
def make_cf():
    doc = new_doc()
    cover(doc,'CAHIER FONCTIONNEL','Spécifications fonctionnelles détaillées — Parcours, règles de gestion & cas d\'utilisation — v1.1')
    pb(doc)

    h1(doc,'Table des matières')
    for x in ['1. Processus métier global','2. Parcours Client','3. Parcours Gestionnaire de véhicule',
              '4. Parcours Chauffeur','5. Parcours Administrateur','6. Parcours Contrôleur',
              '7. Règles de gestion','8. Système Agent Affilié — Règles détaillées',
              '9. Gestion des paiements','10. Notifications & Communications']:
        bul(doc, x)
    pb(doc)

    # 1
    h1(doc,'1. Processus Métier Global')
    body(doc,'AutoLink Pro orchestre le cycle complet d\'une location de véhicule avec chauffeur en 10 étapes :')
    tbl(doc,['Étape','Acteur(s)','Action','Résultat attendu'],
        [['1','Gestionnaire','Inscription + ajout véhicule + définition tarif & forfait km','Véhicule en attente de validation'],
         ['2','Admin / Contrôleur','Inspection du véhicule + approbation','Véhicule approuvé, visible sur la plateforme'],
         ['3','Client','Recherche + sélection + réservation (avec code agent éventuel)','Réservation créée — statut : en attente'],
         ['4','Client','Paiement Orange Money ou MTN MoMo','Paiement validé — réservation confirmée'],
         ['5','Admin / Système','Affectation du chauffeur certifié','Chauffeur notifié, réservation active'],
         ['6','Contrôleur','Inspection ENTRÉE (avant départ)','Fiche état enregistrée — km départ notés'],
         ['7','Chauffeur / Client','Déroulement de la location','Location en cours'],
         ['8','Contrôleur','Inspection SORTIE (après retour)','Km parcourus calculés — surcharge éventuelle déclenchée'],
         ['9','Système','Calcul km supplémentaires + commission agent','Facture finale générée'],
         ['10','Admin / Système','Versement gestionnaire (Orange Money / MTN)','Transaction finalisée — client peut noter']],
        [1.5,3.5,6,5.5])
    pb(doc)

    # 2
    h1(doc,'2. Parcours Client')
    h2(doc,'2.1 Inscription & Connexion')
    bul(doc,'Inscription : email, mot de passe (≥ 8 caractères), numéro +237, photo de profil (optionnel)')
    bul(doc,'Vérification : code à 6 chiffres envoyé par SMS au numéro camerounais')
    bul(doc,'Connexion : email + mot de passe → JWT stocké localement (AsyncStorage mobile, contexte React web)')
    h2(doc,'2.2 Recherche & Sélection de véhicule')
    bul(doc,'Filtres disponibles : type de location, durée, catégorie (Berline / SUV / Pickup / Minibus / Luxe), budget max XAF')
    bul(doc,'Résultats : liste avec photo, tarif calculé (XAF), note moyenne, disponibilité immédiate')
    bul(doc,'Fiche détaillée : photos, caractéristiques, forfait km inclus, tarif km supp., score qualité, avis clients')
    h2(doc,'2.3 Réservation')
    bul(doc,'Choix du type : Urbain (durée) · Interurbain (trajet) · Longue durée (jours)')
    bul(doc,'Saisie : date et heure de départ, adresse de prise en charge, destination / adresse de retour')
    bul(doc,'Option chauffeur : avec chauffeur (recommandé & par défaut) ou sans chauffeur (dépôt de garantie requis)')
    bul(doc,'Code agent : champ optionnel — le client entre le code de l\'agent qui lui a recommandé la plateforme')
    bul(doc,'Récapitulatif : tarif de base + forfait km + options → montant total avant paiement')
    h2(doc,'2.4 Paiement')
    bul(doc,'Client choisit : Orange Money ou MTN Mobile Money')
    bul(doc,'Notification push envoyée sur son téléphone par l\'opérateur mobile')
    bul(doc,'Confirmation de paiement en temps réel → statut réservation passe à "confirmée"')
    bul(doc,'Reçu PDF téléchargeable + SMS de confirmation envoyé au +237')
    h2(doc,'2.5 Statuts de réservation')
    tbl(doc,['Statut','Signification','Actions disponibles pour le client'],
        [['En attente (pending)','Réservation créée, paiement non encore validé','Payer / Annuler gratuitement'],
         ['Confirmée (confirmed)','Paiement OK, chauffeur affecté','Voir coordonnées chauffeur / Annuler (20 % si < 24h)'],
         ['Active (active)','Location en cours, véhicule sorti','Contacter chauffeur / Signaler problème'],
         ['Terminée (completed)','Retour effectué, inspection sortie faite','Télécharger reçu final / Noter chauffeur & véhicule'],
         ['Annulée (cancelled)','Annulation avant départ','Voir politique remboursement'],
         ['Litige (disputed)','Problème signalé après la location','Contacter support AutoLink Pro']],
        [4,5.5,7])
    pb(doc)

    # 3
    h1(doc,'3. Parcours Gestionnaire de Véhicule')
    h2(doc,'3.1 Inscription & Validation KYC')
    bul(doc,'Informations : nom complet, numéro +237, adresse (quartier / ville : Douala ou Yaoundé)')
    bul(doc,'Documents KYC : CNI ou Passeport camerounais + Carte grise du ou des véhicules')
    bul(doc,'Validation par admin AutoLink sous 24–48h ouvrables')
    h2(doc,'3.2 Ajout d\'un Véhicule')
    bul(doc,'Informations : marque, modèle, année, immatriculation (format camerounais : LT-xxxx-x, CE-xxxx-x)')
    bul(doc,'Photos : minimum 4 (avant · arrière · intérieur · tableau de bord)')
    bul(doc,'Tarif : définition du tarif journalier de base en XAF')
    bul(doc,'Forfait km : km inclus par jour + tarif par km supplémentaire (configurable par le gestionnaire)')
    bul(doc,'Mode de mise à disposition : Confié à AutoLink (plateforme affecte un chauffeur) ou À la demande (le gestionnaire organise)')
    bul(doc,'Statut initial : en attente d\'approbation admin')
    h2(doc,'3.3 Tableau de Bord & Suivi')
    bul(doc,'KPIs : revenus bruts, commission AutoLink déduite, montant net perçu')
    bul(doc,'Détail par réservation : client, dates, km parcourus, km supplémentaires facturés')
    bul(doc,'Historique des versements avec référence de transaction Orange Money / MTN')
    bul(doc,'Score moyen de ses véhicules issu des inspections et notations clients')
    pb(doc)

    # 4
    h1(doc,'4. Parcours Chauffeur')
    h2(doc,'4.1 Candidature & Certification')
    bul(doc,'Dossier requis : permis de conduire valide, casier judiciaire (< 3 mois), certificat médical, visite technique véhicule')
    bul(doc,'Test de conduite organisé par AutoLink')
    bul(doc,'Formation obligatoire : accueil client, sécurité, protocole inspection, propreté')
    bul(doc,'Score de conformité calculé automatiquement (0–100) — seuil minimum 70 pour validation')
    h2(doc,'4.2 Activité quotidienne')
    bul(doc,'Statut en ligne / hors ligne (Toggle switch dans l\'app)')
    bul(doc,'Véhicule assigné : modèle, immatriculation, niveau carburant, kilométrage')
    bul(doc,'Courses du jour : liste avec adresses de prise en charge, horaires, nom du client')
    bul(doc,'Historique de toutes les courses avec notes reçues et revenus indicatifs')
    h2(doc,'4.3 Performance')
    bul(doc,'Taux d\'acceptation, ponctualité, note moyenne clients (affichés dans le profil)')
    bul(doc,'Seuil d\'alerte : taux acceptation < 85 % ou note < 3.5 → avertissement admin')
    pb(doc)

    # 5
    h1(doc,'5. Parcours Administrateur (AutoLink Opérateur)')
    h2(doc,'5.1 Tableau de bord global')
    bul(doc,'KPIs temps réel : revenus totaux, commissions collectées, réservations actives, utilisateurs inscrits')
    bul(doc,'Alertes : candidatures chauffeurs en attente · véhicules à approuver · litiges ouverts · versements en retard')
    bul(doc,'Graphiques : revenus par mois, répartition paiements (Orange / MTN / dépôt), performance par zone géographique')
    h2(doc,'5.2 Gestion des Utilisateurs')
    bul(doc,'Recherche et filtrage par rôle, statut, ville, date d\'inscription')
    bul(doc,'Actions : activer, suspendre, supprimer un compte, envoyer un message')
    bul(doc,'Validation KYC : visualiser et valider les documents d\'identité uploadés')
    h2(doc,'5.3 Gestion des Véhicules & Chauffeurs')
    bul(doc,'Liste des véhicules à approuver avec détail complet')
    bul(doc,'Déclencher une inspection avant approbation')
    bul(doc,'Candidatures chauffeurs : voir score de conformité, approuver / rejeter / demander complément')
    h2(doc,'5.4 Finance & Versements')
    bul(doc,'Vue globale : montant total facturé · commissions AutoLink · montants dus aux gestionnaires · commissions agents dues')
    bul(doc,'Déclencher les versements gestionnaires via Orange Money / MTN MoMo')
    bul(doc,'Déclencher les versements agents affiliés')
    h2(doc,'5.5 Gestion des Agents Affiliés')
    bul(doc,'Créer / modifier / désactiver des codes agents')
    bul(doc,'Paramétrer le taux de commission par code (ex : 5 %)')
    bul(doc,'Voir toutes les conversions par code avec montants dus')
    bul(doc,'Historique des reversements effectués à chaque agent')
    pb(doc)

    # 6
    h1(doc,'6. Parcours Contrôleur')
    bul(doc,'Liste des inspections à réaliser du jour (entrée avant départ · sortie après retour)')
    bul(doc,'Saisie fiche inspection : kilométrage, niveau carburant (%), score état (0–100)')
    bul(doc,'Checklist des points de contrôle : carrosserie, vitres, pneus, intérieur, moteur, documents de bord')
    bul(doc,'Signalement de dommages : description textuelle + photos géolocalisées')
    bul(doc,'Calcul automatique : km parcourus = km sortie − km entrée')
    bul(doc,'Si km parcourus > km inclus dans le forfait → génération automatique de la surcharge pour le client')
    bul(doc,'Historique de toutes les inspections réalisées avec score et photos')
    pb(doc)

    # 7
    h1(doc,'7. Règles de Gestion')
    h2(doc,'7.1 Tarification & Calcul')
    tbl(doc,['Règle','Description'],
        [['RG-01','Tarif affiché = tarif_base + Δ_ancienneté + Δ_assurance + Δ_état'],
         ['RG-02','Δ ancienneté : +5 000 XAF/j si véhicule ≤ 2 ans · +2 000 XAF/j si ≤ 5 ans · 0 si > 5 ans'],
         ['RG-03','Δ assurance : +2 000 XAF/j si assurance Premium ou Tous Risques'],
         ['RG-04','Δ état : arrondi(condition_score / 100 × 5 000) XAF/j'],
         ['RG-05','Km supplémentaires = max(0, km_parcourus − km_inclus) × tarif_km_supp'],
         ['RG-06','Commission AutoLink = taux_commission × (tarif_total + km_supp_charges)'],
         ['RG-07','Commission agent = taux_agent × montant_total (prélevé sur la part AutoLink)'],
         ['RG-08','Montant net gestionnaire = montant_total − commission_AutoLink']],
        [2.5,14])
    h2(doc,'7.2 Réservation')
    tbl(doc,['Règle','Description'],
        [['RG-10','Un véhicule ne peut être réservé que si son statut est "approuvé" et disponible aux dates demandées'],
         ['RG-11','Un client ne peut avoir qu\'une seule réservation "active" simultanément'],
         ['RG-12','Annulation gratuite si effectuée > 24h avant l\'heure de départ'],
         ['RG-13','Annulation < 24h avant départ : 20 % du montant total facturés au client'],
         ['RG-14','En cas de litige ouvert, le versement au gestionnaire est bloqué jusqu\'à résolution'],
         ['RG-15','Location sans chauffeur : dépôt de garantie obligatoire (montant défini par l\'admin)']],
        [2.5,14])
    pb(doc)

    # 8
    h1(doc,'8. Système Agent Affilié — Règles Détaillées')
    info(doc,'⚠️  L\'agent n\'est PAS un compte utilisateur dans le système. C\'est un programme d\'affiliation géré uniquement par l\'administrateur AutoLink.')
    tbl(doc,['Élément','Détail'],
        [['Création','L\'admin AutoLink crée un code unique dans le back-office (ex : AGT-DBL-001, AGT-YDE-002)'],
         ['Attribution','Code communiqué à l\'agent par message WhatsApp / email / réunion physique'],
         ['Utilisation','Client entre le code lors de la réservation (champ "Code partenaire" — optionnel)'],
         ['Traçabilité','Chaque réservation avec code agent est enregistrée avec la source du code'],
         ['Taux commission','Configurable par code : ex. 5 % du montant total de la réservation (prélevé sur part AutoLink)'],
         ['Plafond','Commission maximale configurable par code (contrôle budgétaire campagne)'],
         ['Reversement','Orange Money ou MTN MoMo · fréquence : hebdomadaire ou mensuelle selon accord'],
         ['Désactivation','L\'admin désactive un code à tout moment sans impact sur l\'historique']],
        [3.5,13])
    pb(doc)

    # 9
    h1(doc,'9. Gestion des Paiements')
    tbl(doc,['Méthode','Type','Disponibilité','Frais estimés','Phase'],
        [['Orange Money +237','Mobile Money','Immédiat','≈ 1–2 % (opérateur)','MVP'],
         ['MTN Mobile Money +237','Mobile Money','Immédiat','≈ 1–2 % (opérateur)','MVP'],
         ['Dépôt bancaire direct','Virement','24–48h','Gratuit','MVP'],
         ['Carte Visa / Mastercard','En ligne','Immédiat','≈ 2–3 % (Stripe)','Phase 2']],
        [4.5,3,3,3.5,2])
    body(doc,'Flux financier : Client → Orange Money / MTN → Compte opérateur AutoLink → '
         'Versement gestionnaire (75–80 %) + Commission AutoLink (20–25 %) + Commission agent (si applicable).')
    pb(doc)

    # 10
    h1(doc,'10. Notifications & Communications')
    tbl(doc,['Événement déclencheur','Client','Gestionnaire','Chauffeur','Admin'],
        [['Réservation créée','SMS + App','SMS + App','—','App'],
         ['Paiement validé','SMS + App','SMS','App (course assignée)','—'],
         ['Chauffeur affecté','App','App','App','—'],
         ['Inspection entrée effectuée','App','App','App','—'],
         ['Location terminée','SMS + App','App','App','—'],
         ['Km supplémentaires facturés','SMS + App','App','—','—'],
         ['Versement gestionnaire effectué','—','SMS + App','—','—'],
         ['Versement agent effectué','—','—','—','App (log)'],
         ['Litige ouvert','App','App','—','App (alerte)'],
         ['Document KYC validé','App','App','App','—']],
        [5.5,2.5,3,3,2.5])

    doc.save(f'{OUT}\\AutoLink_Cahier_Fonctionnel.docx')
    print('✅  AutoLink_Cahier_Fonctionnel.docx généré')

# ══════════════════════════════════════════════════════════════════════════════
#  DOCUMENT 3 — CAHIER TECHNIQUE
# ══════════════════════════════════════════════════════════════════════════════
def make_ct():
    doc = new_doc()
    cover(doc,'CAHIER TECHNIQUE','Spécifications d\'architecture, stack, modèle de données & API — v1.1')
    pb(doc)

    h1(doc,'Table des matières')
    for x in ['1. Architecture générale','2. Stack technologique','3. Structure du projet',
              '4. Modèle de données','5. API REST — Endpoints complets',
              '6. Authentification & Sécurité','7. Intégration paiement mobile (Orange / MTN)',
              '8. Application mobile Android','9. Hébergement & Infrastructure','10. Qualité & Tests']:
        bul(doc, x)
    pb(doc)

    # 1
    h1(doc,'1. Architecture Générale')
    body(doc,'AutoLink Pro adopte une architecture 3-tiers avec séparation stricte des responsabilités et une API REST centrale :')
    bul(doc,'Tier 1 — Présentation : React SPA (web) + Expo React Native (Android mobile)')
    bul(doc,'Tier 2 — Logique métier : Django REST Framework (API JSON) — centralise toutes les règles de gestion')
    bul(doc,'Tier 3 — Données : SQLite (dev/MVP) → PostgreSQL 15 (production)')
    tbl(doc,['Composant','Protocole','Port / URL','Détail'],
        [['React Frontend','HTTPS','3000 (dev) / CDN (prod)','Axios → API Django avec intercepteurs JWT'],
         ['Expo Mobile App','HTTPS','—','fetch() → API Django — token en AsyncStorage'],
         ['Django API','HTTPS','8000 (dev) / 443 (prod)','Django REST Framework · JWT · CORS'],
         ['Base de données','TCP interne','5432 (PostgreSQL)','ORM Django · migrations versionnées'],
         ['Fichiers médias','HTTPS','—','Stockage local dev → Cloudinary ou AWS S3 prod'],
         ['Orange Money','HTTPS REST','443','API Orange Money Cameroun + Webhook callback'],
         ['MTN MoMo','HTTPS REST','443','MTN MoMo API + Webhook callback']],
        [3.5,3,4.5,5.5])
    pb(doc)

    # 2
    h1(doc,'2. Stack Technologique')
    h2(doc,'2.1 Frontend Web (React)')
    tbl(doc,['Technologie','Version','Usage'],
        [['React','18.2','Framework SPA — composants, state, context'],
         ['React Router DOM','6.20','Routage SPA · routes protégées par rôle (ProtectedRoute)'],
         ['TailwindCSS','3.3','Framework CSS utilitaire — design system unifié'],
         ['Axios','1.6','Client HTTP — appels API avec intercepteurs (refresh token automatique)'],
         ['Recharts','2.10','Graphiques dashboards (barres, lignes, camembert)'],
         ['Lucide React','0.294','Bibliothèque d\'icônes SVG cohérente']],
        [4.5,2.5,9.5])
    h2(doc,'2.2 Backend API (Django)')
    tbl(doc,['Technologie','Version','Usage'],
        [['Python','3.11+','Langage backend'],
         ['Django','4.2','Framework web — ORM, admin, migrations, validations'],
         ['Django REST Framework','3.14','Sérialiseurs, ViewSets, permissions, pagination'],
         ['djangorestframework-simplejwt','5.5','Auth JWT — Access Token 24h / Refresh Token 30j · blacklist'],
         ['django-cors-headers','4.3','Gestion CORS pour le frontend React et mobile'],
         ['django-filter','23.3','Filtrage querysets via paramètres URL'],
         ['Whitenoise','6.6','Service fichiers statiques sans Nginx (production légère)'],
         ['Pillow','10.1','Traitement et validation des images uploadées'],
         ['python-decouple','3.8','Gestion variables d\'environnement via fichier .env']],
        [4.5,2.5,9.5])
    h2(doc,'2.3 Application Mobile')
    tbl(doc,['Technologie','Usage'],
        [['Expo SDK / React Native','Framework mobile cross-platform — cible Android (APK)'],
         ['expo-linear-gradient','Dégradés visuels — design premium Full HD'],
         ['@expo/vector-icons (Ionicons)','Icônes natives haute résolution'],
         ['@react-native-async-storage/async-storage','Persistance locale : token JWT, données utilisateur'],
         ['EAS Build (Expo Application Services)','Compilation APK Android en cloud (sans Android Studio local)']],
        [5.5,11])
    pb(doc)

    # 3
    h1(doc,'3. Structure du Projet')
    tbl(doc,['Répertoire / Fichier','Contenu & Responsabilité'],
        [['autolink/','Racine du projet monorepo'],
         ['autolink/frontend/','Application React SPA'],
         ['autolink/frontend/src/App.jsx','Routage principal · ProtectedRoute · Providers (Auth, Theme)'],
         ['autolink/frontend/src/pages/','Pages par rôle : ClientDashboard, OwnerDashboard, AdminDashboard, etc.'],
         ['autolink/backend/','Projet Django complet'],
         ['autolink/backend/config/settings.py','Paramètres Django : BDD, JWT, CORS, TIME_ZONE=Africa/Douala'],
         ['autolink/backend/apps/users/','Modèle User (AbstractUser) · rôles · KYC'],
         ['autolink/backend/apps/vehicles/','Modèle Vehicle · photos · disponibilité · tarification auto'],
         ['autolink/backend/apps/bookings/','Modèle Booking · cycle de vie · calcul km supp. · commission'],
         ['autolink/backend/apps/payments/','Modèles Payment & Payout · intégration Orange Money / MTN'],
         ['autolink/backend/apps/drivers/','DriverApplication · DriverProfile · score conformité'],
         ['autolink/backend/apps/inspections/','VehicleInspection · InspectionPhoto · calcul km parcourus'],
         ['autolink/mobile/App.js','App React Native unique · navigation · dashboards par rôle · design Full HD'],
         ['autolink/backend/.env','Variables sensibles (SECRET_KEY, API keys paiement) — NON versionné']],
        [5.5,11])
    pb(doc)

    # 4
    h1(doc,'4. Modèle de Données')
    h2(doc,'4.1 Utilisateur (User — AbstractUser)')
    tbl(doc,['Champ','Type Django','Description'],
        [['id','BigAutoField','Clé primaire auto'],
         ['email','EmailField(unique=True)','Identifiant de connexion — adresse e-mail'],
         ['role','CharField(choices)','CLIENT · GESTIONNAIRE · DRIVER · ADMIN · CONTROLLER'],
         ['phone','CharField','Numéro camerounais (+237)'],
         ['avatar','ImageField(nullable)','Photo de profil'],
         ['is_verified','BooleanField','Compte vérifié par l\'admin'],
         ['id_document','ImageField(nullable)','CNI / Passeport (KYC)'],
         ['id_document_verified','BooleanField','Document KYC validé manuellement par admin'],
         ['address','TextField(nullable)','Adresse physique (quartier, ville Cameroun)']],
        [4,4,8.5])
    h2(doc,'4.2 Véhicule (Vehicle)')
    tbl(doc,['Champ','Type Django','Description'],
        [['owner','FK(User)','Gestionnaire du véhicule'],
         ['brand / model','CharField','Marque et modèle'],
         ['year','IntegerField','Année de fabrication (validation: 2000–2030)'],
         ['plate','CharField(unique)','Immatriculation camerounaise (ex: LT-1234-A, CE-5678-B)'],
         ['category','CharField','Berline · SUV · Pickup · Minibus · Luxe'],
         ['fuel','CharField','essence · diesel · hybrid · electric'],
         ['mode','CharField','platform (confié AutoLink) · home (à la demande)'],
         ['status','CharField','pending · approved · rented · maintenance · suspended'],
         ['daily_rate','DecimalField','Tarif base/jour (XAF) défini par le gestionnaire'],
         ['computed_rate','DecimalField','Tarif final calculé automatiquement (base + majorations)'],
         ['km_included','IntegerField','Km inclus dans le forfait journalier'],
         ['km_extra_rate','DecimalField','Prix par km supplémentaire (XAF)'],
         ['insurance_type','CharField','standard · premium · all_risk'],
         ['condition_score','IntegerField','Score état 0–100 (mis à jour après chaque inspection)']],
        [4,4,8.5])
    h2(doc,'4.3 Réservation (Booking)')
    tbl(doc,['Champ','Type Django','Description'],
        [['client','FK(User)','Client locataire'],
         ['vehicle','FK(Vehicle)','Véhicule loué'],
         ['driver','FK(User, nullable)','Chauffeur affecté'],
         ['booking_type','CharField','urban_3h · urban_8h · urban_day · intercity · long_haul'],
         ['status','CharField','pending · confirmed · active · completed · cancelled · disputed'],
         ['start_date / end_date','DateTimeField','Début et fin de la location (date + heure)'],
         ['km_allowance','IntegerField','Km inclus pour cette réservation (hérité du véhicule)'],
         ['km_actual','IntegerField(nullable)','Km réellement parcourus (renseigné à l\'inspection sortie)'],
         ['km_extra_charges','DecimalField','Surcharge km calculée automatiquement (0 si dans forfait)'],
         ['subtotal','DecimalField','Montant base (tarif × durée)'],
         ['commission_rate','DecimalField','Taux commission appliqué (ex: 0.25)'],
         ['commission_amount','DecimalField','Montant commission AutoLink'],
         ['agent_code','CharField(nullable)','Code agent affilié utilisé lors de la réservation'],
         ['agent_commission','DecimalField','Commission agent calculée (prélevée sur part AutoLink)'],
         ['owner_amount','DecimalField','Montant net versé au gestionnaire'],
         ['pickup_address / return_address','TextField','Adresses de prise en charge et de retour'],
         ['client_rating','IntegerField(nullable)','Note client (1–5) après la location']],
        [4,4,8.5])
    pb(doc)

    # 5
    h1(doc,'5. API REST — Endpoints Complets')
    h2(doc,'5.1 Authentification (/api/auth/)')
    tbl(doc,['Méthode','Endpoint','Description','Auth requise'],
        [['POST','/api/auth/register/','Inscription nouvel utilisateur','Public'],
         ['POST','/api/auth/login/','Connexion → retourne access_token + refresh_token','Public'],
         ['POST','/api/auth/refresh/','Renouveler l\'access token via refresh token','Refresh token'],
         ['POST','/api/auth/logout/','Blacklister le refresh token (déconnexion)','JWT']],
        [2,5,6.5,3])
    h2(doc,'5.2 Véhicules (/api/vehicles/)')
    tbl(doc,['Méthode','Endpoint','Description','Rôle requis'],
        [['GET','/api/vehicles/','Liste véhicules disponibles (filtres: type, catégorie, ville)','JWT'],
         ['POST','/api/vehicles/','Ajouter un véhicule','GESTIONNAIRE'],
         ['GET','/api/vehicles/{id}/','Détail d\'un véhicule','JWT'],
         ['PATCH','/api/vehicles/{id}/','Modifier un véhicule','GESTIONNAIRE (propriétaire)'],
         ['POST','/api/vehicles/{id}/approve/','Approuver un véhicule','ADMIN'],
         ['GET','/api/vehicles/my/','Mes véhicules (gestionnaire connecté)','GESTIONNAIRE']],
        [2,5,6,3.5])
    h2(doc,'5.3 Réservations (/api/bookings/)')
    tbl(doc,['Méthode','Endpoint','Description','Rôle requis'],
        [['GET','/api/bookings/','Mes réservations (filtrées par rôle automatiquement)','JWT'],
         ['POST','/api/bookings/','Créer une réservation (avec agent_code optionnel)','CLIENT'],
         ['GET','/api/bookings/{id}/','Détail d\'une réservation','JWT'],
         ['PATCH','/api/bookings/{id}/','Modifier statut / affecter chauffeur','ADMIN'],
         ['POST','/api/bookings/{id}/cancel/','Annuler une réservation (règle RG-12/13 appliquée)','CLIENT'],
         ['POST','/api/bookings/{id}/rate/','Noter après location (1–5)','CLIENT']],
        [2,5,6,3.5])
    h2(doc,'5.4 Paiements & Versements (/api/payments/)')
    tbl(doc,['Méthode','Endpoint','Description','Rôle requis'],
        [['POST','/api/payments/','Initier paiement Orange Money ou MTN MoMo','CLIENT'],
         ['GET','/api/payments/','Historique paiements (filtré par rôle)','JWT'],
         ['POST','/api/payments/webhook/','Callback opérateur mobile (signature vérifiée)','Système'],
         ['POST','/api/payments/payouts/','Déclencher versement gestionnaire','ADMIN'],
         ['GET','/api/payments/agents/','Commissions agents dues','ADMIN'],
         ['POST','/api/payments/agents/payout/','Verser commission à un agent','ADMIN']],
        [2,5,6,3.5])
    h2(doc,'5.5 Inspections (/api/inspections/)')
    tbl(doc,['Méthode','Endpoint','Description','Rôle requis'],
        [['GET','/api/inspections/','Liste inspections (filtres: date, véhicule, type)','CONTROLLER · ADMIN'],
         ['POST','/api/inspections/','Créer fiche inspection (entrée ou sortie)','CONTROLLER'],
         ['GET','/api/inspections/{id}/','Détail inspection + photos','JWT'],
         ['PATCH','/api/inspections/{id}/','Compléter fiche sortie (km final, photos)','CONTROLLER']],
        [2,5,6,3.5])
    pb(doc)

    # 6
    h1(doc,'6. Authentification & Sécurité')
    h2(doc,'6.1 JWT — JSON Web Tokens')
    bul(doc,'Access Token : durée 24h — transmis dans l\'en-tête HTTP : Authorization: Bearer <token>')
    bul(doc,'Refresh Token : durée 30 jours — utilisé pour renouveler l\'access token sans reconnexion')
    bul(doc,'Blacklist : le refresh token est blacklisté à la déconnexion (via SimpleJWT)')
    h2(doc,'6.2 Matrice des permissions par rôle')
    tbl(doc,['Rôle','Lecture','Écriture / Actions spéciales'],
        [['CLIENT','Véhicules disponibles, ses réservations, son profil','Créer réservation, payer, noter, annuler la sienne'],
         ['GESTIONNAIRE','Ses véhicules, ses réservations, ses revenus','CRUD ses véhicules, définir tarif & forfait km'],
         ['DRIVER','Ses courses assignées, son profil, son véhicule assigné','Toggle statut en ligne/hors ligne'],
         ['CONTROLLER','Toutes les inspections','CRUD inspections, upload photos'],
         ['ADMIN','Tout','Tout — gestion users, approbations, finance, agents, config']],
        [3.5,5,8])
    h2(doc,'6.3 Bonnes pratiques de sécurité')
    bul(doc,'SECRET_KEY Django et clés API paiement stockées dans .env (jamais dans Git)')
    bul(doc,'CORS configuré pour autoriser uniquement les origines déclarées (frontend + mobile)')
    bul(doc,'Toutes les communications en production chiffrées via HTTPS / TLS 1.3')
    bul(doc,'Validation côté serveur de toutes les entrées (sérialiseurs DRF — jamais faire confiance au client)')
    bul(doc,'Rate limiting à implémenter en production (django-ratelimit ou Nginx)')
    bul(doc,'Webhooks paiement vérifiés via signature HMAC de l\'opérateur')
    pb(doc)

    # 7
    h1(doc,'7. Intégration Paiement Mobile')
    h2(doc,'7.1 Orange Money Cameroun')
    bul(doc,'API : Orange Money Developer API (developer.orange.com/cameroon)')
    bul(doc,'Flow : Client initie → Notification push sur son téléphone Orange → Confirmation PIN → Webhook → AutoLink valide réservation')
    bul(doc,'Clés de configuration : ORANGE_CLIENT_ID, ORANGE_CLIENT_SECRET (dans .env)')
    bul(doc,'Environnement : sandbox disponible pour tests — production après certification')
    h2(doc,'7.2 MTN Mobile Money')
    bul(doc,'API : MTN MoMo API (momodeveloper.mtn.com) — Collection API')
    bul(doc,'Flow identique à Orange Money')
    bul(doc,'Clés : MTN_SUBSCRIPTION_KEY, MTN_API_USER, MTN_API_KEY (dans .env)')
    h2(doc,'7.3 Sécurité des transactions')
    bul(doc,'Chaque transaction enregistrée avec sa référence opérateur unique')
    bul(doc,'Idempotence : un paiement ne peut être déclenché deux fois pour la même réservation')
    bul(doc,'Webhooks signés — la signature est vérifiée côté Django avant traitement')
    pb(doc)

    # 8
    h1(doc,'8. Application Mobile Android (Expo / React Native)')
    h2(doc,'8.1 Architecture App.js')
    bul(doc,'Fichier unique App.js — navigation programmatique par phase et par rôle')
    bul(doc,'Phases : Splash (animé) → Onboarding (3 slides, premier lancement) → Login → Dashboard rôle')
    bul(doc,'Dashboards : ClientApp · DriverApp · OwnerApp (Gestionnaire) · AdminApp · ControllerApp')
    bul(doc,'Chaque dashboard : TabBar + écrans dédiés (Accueil, Réservations, Revenus, Profil)')
    bul(doc,'Design system : constantes C (couleurs) et G (gradients) — design Full HD premium')
    h2(doc,'8.2 Processus de Build APK via EAS')
    tbl(doc,['Étape','Commande / Action','Détail'],
        [['1. Configuration','eas.json','Profile "preview" → android.buildType: "apk"'],
         ['2. Authentification','eas login','Compte Expo requis (expo.dev)'],
         ['3. Lancement build','eas build --platform android --profile preview','Build cloud Expo — pas besoin d\'Android Studio'],
         ['4. Téléchargement','Lien fourni par EAS','APK téléchargeable depuis expo.dev/accounts/…/builds'],
         ['5. Installation','adb install autolink.apk OU QR code','Sur appareil Android 8.0+ ou émulateur']],
        [3.5,5,8])
    h2(doc,'8.3 Permissions Android requises (AndroidManifest)')
    bul(doc,'INTERNET — appels API Django')
    bul(doc,'CAMERA — prise de photos pour les inspections véhicules')
    bul(doc,'READ_EXTERNAL_STORAGE · WRITE_EXTERNAL_STORAGE — gestion des fichiers photos')
    bul(doc,'VIBRATE — notifications locales')
    bul(doc,'ACCESS_FINE_LOCATION · ACCESS_COARSE_LOCATION — géolocalisation inspections (Phase 2)')
    pb(doc)

    # 9
    h1(doc,'9. Hébergement & Infrastructure (Production)')
    tbl(doc,['Composant','Solution recommandée','Specs minimales recommandées'],
        [['API Django','VPS Ubuntu 22.04 (OVH / DigitalOcean / Render)','2 vCPU · 4 GB RAM · 40 GB SSD'],
         ['Base de données','PostgreSQL 15 (même VPS ou PostgreSQL géré)','10 GB initial · sauvegardes quotidiennes'],
         ['Fichiers médias (photos)','Cloudinary (gratuit jusqu\'à 25 GB) ou AWS S3','50 GB initial'],
         ['Frontend React','Vercel ou Netlify (CDN mondial)','Gratuit pour le MVP'],
         ['Reverse proxy HTTPS','Nginx + Certbot (Let\'s Encrypt)','Inclus dans VPS'],
         ['Process manager','Gunicorn (WSGI) + Supervisor','4 workers Django'],
         ['Monitoring erreurs','Sentry (plan gratuit)','Alertes temps réel'],
         ['Monitoring uptime','UptimeRobot (plan gratuit)','Vérification toutes les 5 min']],
        [4,5.5,7])
    h2(doc,'9.1 Variables d\'environnement requises (.env)')
    tbl(doc,['Variable','Description'],
        [['SECRET_KEY','Clé secrète Django — générer via : python -c "import secrets; print(secrets.token_hex(50))"'],
         ['DEBUG','False en production'],
         ['ALLOWED_HOSTS','Domaines autorisés : api.autolink.cm,www.autolink.cm'],
         ['CORS_ALLOWED_ORIGINS','https://www.autolink.cm,https://app.autolink.cm'],
         ['DATABASE_URL','URL PostgreSQL production'],
         ['COMMISSION_RATE','0.25 (25 %) — ajustable'],
         ['ORANGE_CLIENT_ID / ORANGE_CLIENT_SECRET','Clés API Orange Money Cameroun'],
         ['MTN_SUBSCRIPTION_KEY / MTN_API_KEY','Clés API MTN MoMo'],
         ['CLOUDINARY_URL','URL Cloudinary pour stockage médias (optionnel)']],
        [5.5,11])
    pb(doc)

    # 10
    h1(doc,'10. Qualité & Tests')
    h2(doc,'10.1 Tests Backend (Django)')
    bul(doc,'Tests unitaires : chaque modèle (save(), méthodes calculées) et chaque viewset (CRUD + permissions)')
    bul(doc,'Tests d\'intégration API : scénarios complets (réservation → paiement → inspection → versement)')
    bul(doc,'Couverture cible : ≥ 80 % du code métier (mesurée avec coverage.py)')
    bul(doc,'Commande : python manage.py test -- ou pytest avec pytest-django')
    h2(doc,'10.2 Tests Frontend (React)')
    bul(doc,'Tests composants : Jest + React Testing Library')
    bul(doc,'Tests E2E : Playwright — parcours critiques (réservation complète, paiement, connexion par rôle)')
    h2(doc,'10.3 Standards de code')
    tbl(doc,['Couche','Outil','Standard'],
        [['Backend Python','flake8 + black','PEP 8 · max 100 chars par ligne'],
         ['Frontend JS/React','ESLint + Prettier','Airbnb style guide'],
         ['Commits Git','Conventional Commits','feat: · fix: · docs: · refactor: · test:'],
         ['Revues de code','Pull Requests obligatoires','Minimum 1 reviewer avant merge sur main']],
        [4,4,8.5])

    doc.save(f'{OUT}\\AutoLink_Cahier_Technique.docx')
    print('✅  AutoLink_Cahier_Technique.docx généré')

# ── Génération des 3 documents ────────────────────────────────────────────────
if __name__ == '__main__':
    make_cdc()
    make_cf()
    make_ct()
    print('\n🎉  3 documents Word générés avec succès dans :')
    print(f'   {OUT}\\')
    print('   • AutoLink_Cahier_de_Charges.docx')
    print('   • AutoLink_Cahier_Fonctionnel.docx')
    print('   • AutoLink_Cahier_Technique.docx')
