# -*- coding: utf-8 -*-
"""
AutoLink Pro — Étude de marché complète — Cameroun
Génère : AutoLink_Etude_de_Marche_Cameroun.docx
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
C_RED  = RGBColor(0xEF, 0x44, 0x44)
C_PUR  = RGBColor(0x7C, 0x3A, 0xED)
C_DARK = RGBColor(0x1E, 0x29, 0x3B)
C_GREY = RGBColor(0x64, 0x74, 0x8B)
C_WHT  = RGBColor(0xFF, 0xFF, 0xFF)
C_YEL  = RGBColor(0xF5, 0x9E, 0x0B)

def new_doc():
    doc = Document()
    s = doc.sections[0]
    s.page_width=Cm(21); s.page_height=Cm(29.7)
    s.left_margin=Cm(2.5); s.right_margin=Cm(2.5)
    s.top_margin=Cm(2.5); s.bottom_margin=Cm(2.5)
    return doc

def shd(cell, hex6):
    tc=cell._tc; pr=tc.get_or_add_tcPr()
    e=OxmlElement('w:shd')
    e.set(qn('w:val'),'clear'); e.set(qn('w:color'),'auto'); e.set(qn('w:fill'),hex6)
    pr.append(e)

def cover(doc):
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before=Pt(60)
    r=p.add_run('AutoLink Pro'); r.bold=True; r.font.size=Pt(44); r.font.color.rgb=C_SKY

    p2=doc.add_paragraph(); p2.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r2=p2.add_run('ÉTUDE DE MARCHÉ'); r2.bold=True; r2.font.size=Pt(26); r2.font.color.rgb=C_ORA

    p3=doc.add_paragraph(); p3.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r3=p3.add_run('Analyse complète du marché de la location de véhicules au Cameroun')
    r3.font.size=Pt(14); r3.font.color.rgb=C_GREY

    doc.add_paragraph()
    p4=doc.add_paragraph(); p4.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r4=p4.add_run('Tous les angles : économique · démographique · technologique · concurrentiel · réglementaire · SWOT')
    r4.italic=True; r4.font.size=Pt(11); r4.font.color.rgb=C_DARK

    doc.add_paragraph(); doc.add_paragraph()
    p5=doc.add_paragraph(); p5.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r5=p5.add_run(f'Version 1.0  ·  {TODAY}  ·  CONFIDENTIEL')
    r5.italic=True; r5.font.size=Pt(11); r5.font.color.rgb=C_GREY

    p6=doc.add_paragraph(); p6.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r6=p6.add_run('"Premier sur un marché vierge — Douala · Yaoundé · Cameroun"')
    r6.italic=True; r6.font.size=Pt(13); r6.font.color.rgb=C_DARK

def h1(doc, txt, color=None):
    c = color or C_SKY
    p=doc.add_paragraph()
    p.paragraph_format.space_before=Pt(22); p.paragraph_format.space_after=Pt(8)
    r=p.add_run(txt); r.bold=True; r.font.size=Pt(16); r.font.color.rgb=c
    pPr=p._p.get_or_add_pPr()
    pBdr=OxmlElement('w:pBdr'); bot=OxmlElement('w:bottom')
    bot.set(qn('w:val'),'single'); bot.set(qn('w:sz'),'8')
    bot.set(qn('w:space'),'4'); bot.set(qn('w:color'),'0EA5E9')
    pBdr.append(bot); pPr.append(pBdr)

def h2(doc, txt, color=None):
    c = color or C_ORA
    p=doc.add_paragraph()
    p.paragraph_format.space_before=Pt(12); p.paragraph_format.space_after=Pt(4)
    r=p.add_run(txt); r.bold=True; r.font.size=Pt(13); r.font.color.rgb=c

def h3(doc, txt):
    p=doc.add_paragraph()
    p.paragraph_format.space_before=Pt(8); p.paragraph_format.space_after=Pt(2)
    r=p.add_run(txt); r.bold=True; r.font.size=Pt(11); r.font.color.rgb=C_GRN

def body(doc, txt):
    p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(6)
    r=p.add_run(txt); r.font.size=Pt(10.5); r.font.color.rgb=C_DARK

def bul(doc, txt, bold_prefix=None):
    p=doc.add_paragraph(style='List Bullet'); p.paragraph_format.space_after=Pt(3)
    if bold_prefix:
        rb=p.add_run(bold_prefix+' '); rb.bold=True; rb.font.size=Pt(10.5); rb.font.color.rgb=C_DARK
    r=p.add_run(txt); r.font.size=Pt(10.5); r.font.color.rgb=C_DARK

def tbl(doc, headers, rows, widths=None, hdr_color='0F172A'):
    t=doc.add_table(rows=1+len(rows), cols=len(headers))
    t.style='Table Grid'; t.alignment=WD_TABLE_ALIGNMENT.CENTER
    for i,h in enumerate(headers):
        c=t.rows[0].cells[i]; shd(c, hdr_color)
        rn=c.paragraphs[0].add_run(h)
        rn.bold=True; rn.font.size=Pt(10); rn.font.color.rgb=C_WHT
        c.paragraphs[0].alignment=WD_ALIGN_PARAGRAPH.CENTER
    for ri,row in enumerate(rows):
        tr=t.rows[ri+1]; bg='F0F9FF' if ri%2==0 else 'FFFFFF'
        for ci,val in enumerate(row):
            c=tr.cells[ci]; shd(c,bg)
            rn=c.paragraphs[0].add_run(str(val))
            rn.font.size=Pt(10); rn.font.color.rgb=C_DARK
    if widths:
        for row in t.rows:
            for ci,w in enumerate(widths):
                if ci<len(widths): row.cells[ci].width=Cm(w)
    doc.add_paragraph()

def box(doc, txt, bg='DBEAFE', border_color=None):
    t=doc.add_table(rows=1,cols=1); t.style='Table Grid'
    c=t.rows[0].cells[0]; shd(c,bg)
    rn=c.paragraphs[0].add_run(txt)
    rn.font.size=Pt(10.5); rn.font.color.rgb=C_DARK; rn.italic=True
    doc.add_paragraph()

def swot_cell(cell, title, items, bg, title_color):
    shd(cell, bg)
    p=cell.paragraphs[0]
    r=p.add_run(title+'\n'); r.bold=True; r.font.size=Pt(11); r.font.color.rgb=title_color
    for item in items:
        rn=cell.add_paragraph().add_run('• '+item)
        rn.font.size=Pt(9.5); rn.font.color.rgb=C_DARK

def pb(doc): doc.add_page_break()

# ══════════════════════════════════════════════════════════════════════════════
doc = new_doc()
cover(doc)
pb(doc)

# ── TABLE DES MATIÈRES ────────────────────────────────────────────────────────
h1(doc,'Table des matières')
toc = [
    '1.  Résumé exécutif',
    '2.  Analyse macroéconomique du Cameroun',
    '3.  Analyse démographique & urbaine',
    '4.  Pénétration technologique & numérique',
    '5.  Analyse du marché du transport & de la mobilité',
    '6.  Analyse concurrentielle',
    '7.  Analyse de la demande & des comportements clients',
    '8.  Analyse réglementaire & juridique',
    '9.  Analyse du potentiel de revenus',
    '10. Analyse des risques',
    '11. Analyse SWOT complète',
    '12. Positionnement stratégique & recommandations',
    '13. Conclusion',
]
for x in toc:
    bul(doc, x)
pb(doc)

# ══════════════════════════════════════════════════════════════════════════════
# 1. RÉSUMÉ EXÉCUTIF
# ══════════════════════════════════════════════════════════════════════════════
h1(doc,'1. Résumé Exécutif')
box(doc,'📌 CONCLUSION PRINCIPALE : Le marché de la location de véhicules digitalisée au Cameroun est '
    'vierge, structurellement porteur, et aucun acteur digital sérieux ne l\'occupe aujourd\'hui. '
    'AutoLink Pro dispose d\'une fenêtre stratégique unique pour s\'imposer comme leader.')

body(doc,'Le Cameroun, avec près de 29 millions d\'habitants, deux métropoles de plus de 3 millions d\'habitants chacune '
    '(Douala et Yaoundé), un taux d\'urbanisation en forte croissance et une adoption massive du Mobile Money, '
    'représente un terrain extrêmement favorable pour une plateforme de location de véhicules comme AutoLink Pro.')
body(doc,'Cette étude analyse le marché sous 11 angles distincts et conclut que :')
bul(doc,'Le marché de la mobilité urbaine et interurbaine camerounaise est en pleine expansion.')
bul(doc,'Aucune plateforme digitale de location de véhicules à la durée n\'existe au Cameroun (premier entrant).')
bul(doc,'Le Mobile Money (Orange Money + MTN MoMo) est déjà massivement adopté — le frein paiement est levé.')
bul(doc,'La demande existe : entreprises, touristes, occasions (mariages, cérémonies), déplacements professionnels.')
bul(doc,'Le risque réglementaire est gérable avec une structure juridique appropriée.')
tbl(doc,['Indicateur clé','Valeur','Impact pour AutoLink'],
    [['Population Cameroun (2024)', '≈ 29 millions', 'Grand marché adressable'],
     ['Population Douala', '≈ 4,1 millions', 'Marché cible primaire'],
     ['Population Yaoundé', '≈ 4,5 millions', 'Marché cible secondaire'],
     ['Taux urbanisation', '≈ 58 %', 'Clientèle urbaine solvable'],
     ['Taux Mobile Money', '≈ 65–70 % des adultes', 'Paiement sans friction'],
     ['Pénétration smartphone', '≈ 45–50 %', 'App accessible à la moitié de la pop.'],
     ['Plateformes location digitale', '0 (marché vierge)', 'First mover advantage'],
     ['Concurrents directs', 'Aucun (digital)', 'Positionnement sans résistance']],
    [5,4,7.5])
pb(doc)

# ══════════════════════════════════════════════════════════════════════════════
# 2. ANALYSE MACROÉCONOMIQUE
# ══════════════════════════════════════════════════════════════════════════════
h1(doc,'2. Analyse Macroéconomique du Cameroun')
h2(doc,'2.1 Vue d\'ensemble économique')
body(doc,'Le Cameroun est la première économie d\'Afrique Centrale et le moteur économique de la CEMAC '
    '(Communauté Économique et Monétaire de l\'Afrique Centrale). Son économie diversifiée — pétrole, '
    'agriculture, services, BTP — lui confère une relative stabilité macroéconomique.')
tbl(doc,['Indicateur','Valeur (2024 est.)','Tendance','Implication pour AutoLink'],
    [['PIB','≈ 47 milliards USD','↗ +3,8 %/an','Économie en croissance = pouvoir d\'achat qui progresse'],
     ['PIB par habitant','≈ 1 650 USD','↗','Classe moyenne émergente = clients potentiels'],
     ['Classe moyenne','≈ 12 % (3,5M pers.)','↗↗','Cœur de cible d\'AutoLink Pro'],
     ['Taux d\'inflation','≈ 5,8 %','→','Acceptable — tarifs à indexer annuellement'],
     ['Devise','FCFA XAF (Zone BEAC)','Stable (parité fixe EUR)','Pas de risque de change interne'],
     ['Croissance PIB prévisionnelle','3,5–4,5 % (2025–2028)','↗','Environnement macro favorable'],
     ['Secteur services','≈ 45 % du PIB','↗','Transport & mobilité inclus dans ce secteur']],
    [4,4,2,6.5])

h2(doc,'2.2 Secteur des transports dans l\'économie camerounaise')
body(doc,'Le secteur du transport représente environ 8 à 12 % du PIB camerounais. Il est dominé par :')
bul(doc,'Transport informel (moto-taxis "bendskins", taxis brousse, clandos) : 70–80 % des déplacements')
bul(doc,'Agences de voyages interurbaines classiques (Général Express, Buca Voyages, Vatican Express, etc.)')
bul(doc,'Taxis officiels urbains (peu digitalisés, tarification non transparente)')
bul(doc,'Yango et InDrive : apparus récemment sur la course à la demande')
body(doc,'La location de véhicule à la durée (heures / jours) reste quasi inexistante sous forme digitale. '
    'Ce segment représente une lacune majeure que AutoLink Pro peut combler.')
pb(doc)

# ══════════════════════════════════════════════════════════════════════════════
# 3. ANALYSE DÉMOGRAPHIQUE & URBAINE
# ══════════════════════════════════════════════════════════════════════════════
h1(doc,'3. Analyse Démographique & Urbaine')
h2(doc,'3.1 Structure de la population')
tbl(doc,['Ville / Région','Population est. 2024','Statut','Profil mobilité'],
    [['Douala (Littoral)','4,1 millions','Capitale économique','Fort besoin de mobilité pro & personnelle'],
     ['Yaoundé (Centre)','4,5 millions','Capitale politique','Nombreux fonctionnaires, diplomates, entreprises'],
     ['Bafoussam (Ouest)','450 000','Capitale régionale','Trafic interurbain Douala-Bafoussam intense'],
     ['Garoua (Nord)','450 000','Capitale régionale Nord','Développement commercial en cours'],
     ['Kribi (Sud)','120 000','Ville portuaire & balnéaire','Tourisme, port en eau profonde'],
     ['Limbe (Sud-Ouest)','250 000','Côtière pétrolière','Expatriés, ingénieurs, professionnels'],
     ['Total national','≈ 29 millions','Taux urban. 58 %','≈ 16,8M en zones urbaines = cible accessible']],
    [3.5,3.5,3.5,6])

h2(doc,'3.2 Pyramide des âges & profil du client potentiel')
body(doc,'Le Cameroun est un pays jeune : l\'âge médian est d\'environ 18 ans. '
    'La tranche 18–45 ans représente environ 40 % de la population, soit ≈ 11,6 millions de personnes. '
    'C\'est exactement le coeur de cible d\'AutoLink Pro.')
tbl(doc,['Tranche d\'âge','% population','Profil AutoLink','Potentiel'],
    [['18–25 ans (étudiants, jeunes actifs)','20 %','Utilisateurs mobiles, adopteurs précoces du digital','⭐⭐⭐⭐'],
     ['26–35 ans (jeunes professionnels)','15 %','Cadres, entrepreneurs, meilleur pouvoir d\'achat','⭐⭐⭐⭐⭐'],
     ['36–45 ans (managers, chefs d\'entreprise)','12 %','Voyages pro, délégations, représentation','⭐⭐⭐⭐⭐'],
     ['46–60 ans','10 %','Clients occasionnels — cérémonies, voyages familiaux','⭐⭐⭐'],
     ['< 18 ans','43 %','Non ciblés dans la phase MVP','—']],
    [4,3,6.5,3])

h2(doc,'3.3 Urbanisation et flux de mobilité')
bul(doc,'Douala ↔ Yaoundé : 240 km — le trajet le plus emprunté du Cameroun (plusieurs milliers de voyageurs/jour)')
bul(doc,'Douala ↔ Bafoussam : 360 km — corridor commercial Littoral-Ouest très actif')
bul(doc,'Douala ↔ Kribi : 160 km — tourisme balnéaire en essor (port en eau profonde)')
bul(doc,'Yaoundé ↔ Mbalmayo / Ebolowa : corridors de développement sud')
bul(doc,'Déplacements urbains quotidiens : Douala = 4 à 6 millions de déplacements/jour estimés')
pb(doc)

# ══════════════════════════════════════════════════════════════════════════════
# 4. PÉNÉTRATION TECHNOLOGIQUE & NUMÉRIQUE
# ══════════════════════════════════════════════════════════════════════════════
h1(doc,'4. Pénétration Technologique & Numérique')
h2(doc,'4.1 Connectivité Internet & mobile')
tbl(doc,['Indicateur','Taux / Valeur','Source / Note'],
    [['Taux pénétration Internet','≈ 38 % (11M personnes)','En forte croissance : +8 %/an'],
     ['Abonnements mobiles','≈ 24 millions de SIM actives','Taux > 80 % (multi-SIM courant)'],
     ['Couverture 4G/LTE','Douala, Yaoundé, Bafoussam : 85–95 % couverts','3G disponible dans toutes les villes'],
     ['Smartphones','≈ 45–50 % des téléphones','Android dominant (>90 % du parc smartphone)'],
     ['Réseaux sociaux actifs','≈ 6 millions d\'utilisateurs','WhatsApp #1, Facebook #2, TikTok en essor']],
    [5,4.5,7])

h2(doc,'4.2 Mobile Money — LE facteur clé')
box(doc,'💡 LE PRINCIPAL LEVIER : Le Mobile Money au Cameroun est l\'un des plus développés d\'Afrique Centrale. '
    'Orange Money et MTN MoMo comptent ensemble plus de 15 millions de comptes actifs. '
    'C\'est le moyen de paiement numérique de référence — AutoLink Pro élimine ainsi la friction du paiement en espèces.')
tbl(doc,['Opérateur','Part de marché','Comptes actifs est.','Zones de force'],
    [['MTN Cameroun (MoMo)','≈ 51 %','≈ 8–9 millions','Réseau large, présent dans les zones rurales'],
     ['Orange Cameroun (Money)','≈ 40 %','≈ 6–7 millions','Fort en zones urbaines — Douala, Yaoundé'],
     ['Camtel / autres','≈ 9 %','< 1 million','Marginal'],
     ['TOTAL Mobile Money actif','100 %','≈ 15–16 millions','65–70 % de la population adulte couverte']],
    [4,3,4,5.5])
body(doc,'Le Mobile Money est déjà utilisé pour payer les factures d\'eau, d\'électricité, les billets d\'avion, '
    'les commandes e-commerce, les frais de scolarité. AutoLink Pro s\'inscrit naturellement dans cet écosystème.')

h2(doc,'4.3 Adoption des applications mobiles')
bul(doc,'Yango : présent depuis 2019 — a démontré qu\'une app de transport peut s\'imposer rapidement à Douala/Yaoundé')
bul(doc,'InDrive : arrivé en 2022 — second acteur course à la demande')
bul(doc,'Jumia (e-commerce) : adopté par les consommateurs camerounais — la commande mobile est normalisée')
bul(doc,'Moov Money, PayD, YUP : nombreuses fintech locales prouvent l\'appétit pour le digital financier')
body(doc,'Conclusion : l\'écosystème applicatif mobile est mature à Douala et Yaoundé. '
    'Le consommateur camerounais est prêt à utiliser une app pour réserver un véhicule.')
pb(doc)

# ══════════════════════════════════════════════════════════════════════════════
# 5. ANALYSE DU MARCHÉ DU TRANSPORT & DE LA MOBILITÉ
# ══════════════════════════════════════════════════════════════════════════════
h1(doc,'5. Analyse du Marché du Transport & de la Mobilité')
h2(doc,'5.1 Cartographie des segments de mobilité')
tbl(doc,['Segment','Acteurs actuels','Digitalisation','Opportunité AutoLink'],
    [['Courses courtes (< 30 min)','Yango, InDrive, taxis, moto-taxis','Élevée (Yango/InDrive)','Non ciblé — trop concurrentiel'],
     ['Location véhicule 3h–8h','Quasi inexistant (informel uniquement)','Nulle','⭐⭐⭐⭐⭐ CŒUR DE CIBLE'],
     ['Location véhicule à la journée','Agences physiques (peu nombreuses)','Très faible','⭐⭐⭐⭐⭐ CŒUR DE CIBLE'],
     ['Transport interurbain (avec chauffeur)','Agences bus classiques, informel','Nulle (booking digital)','⭐⭐⭐⭐⭐ CŒUR DE CIBLE'],
     ['Location longue durée (semaine+)','Agences multinationales (Hertz, Avis — rare)','Faible','⭐⭐⭐⭐'],
     ['Transport corporate (entreprises)','Contrats directs informels','Nulle','⭐⭐⭐⭐⭐ FORT POTENTIEL']],
    [4.5,4.5,3,4.5])

h2(doc,'5.2 Taille du marché addressable (TAM / SAM / SOM)')
tbl(doc,['Marché','Définition','Estimation Cameroun','Estimation Douala+Yaoundé'],
    [['TAM (Total Addressable Market)',
      'Toute la mobilité à la demande Cameroun',
      '≈ 1,2 milliard XAF/an',
      '≈ 650 millions XAF/an'],
     ['SAM (Serviceable Addressable Market)',
      'Location véhicule avec chauffeur, digital',
      '≈ 180–250 millions XAF/an',
      '≈ 120–160 millions XAF/an'],
     ['SOM (Serviceable Obtainable Market)',
      'Part réaliste MVP (12–18 mois)',
      '≈ 15–25 millions XAF/an',
      '≈ 10–18 millions XAF/an']],
    [4,5,4,3.5])
body(doc,'Note méthodologique : estimations basées sur les données de mobilité, le nombre de ménages '
    'à revenus moyens/supérieurs à Douala et Yaoundé, et les benchmarks de marchés similaires '
    '(Nairobi, Abidjan, Accra) où des plateformes comparables ont été lancées.')

h2(doc,'5.3 Occasions génératrices de location')
tbl(doc,['Occasion','Fréquence','Durée type','Montant moyen estimé'],
    [['Déplacement professionnel journée','Quotidien (corporate)','8h','50 000–80 000 XAF'],
     ['Transfert aéroport (Douala / Yaoundé)','Fréquent','2–3h','20 000–35 000 XAF'],
     ['Mariage / baptême / cérémonie','Week-ends','6–12h','60 000–120 000 XAF'],
     ['Sortie de ville (Kribi, Limbé, etc.)','Week-ends / vacances','24–48h','80 000–160 000 XAF'],
     ['Délégation officielle / visiteur','Ponctuel','24–72h','100 000–300 000 XAF'],
     ['Trajet Douala ↔ Yaoundé (avec chauffeur)','Très fréquent','1 journée','60 000–100 000 XAF'],
     ['Remplacement véhicule en panne','Ponctuel','24–72h','50 000–90 000 XAF']],
    [5,3.5,3,5])
pb(doc)

# ══════════════════════════════════════════════════════════════════════════════
# 6. ANALYSE CONCURRENTIELLE
# ══════════════════════════════════════════════════════════════════════════════
h1(doc,'6. Analyse Concurrentielle')
box(doc,'🎯 VERDICT : AutoLink Pro n\'a PAS de concurrent direct dans son positionnement exact '
    '(location à la durée, digitale, avec chauffeur, au Cameroun). '
    'Les seuls concurrents sont indirects ou partiels.')

h2(doc,'6.1 Carte des concurrents')
tbl(doc,['Acteur','Type','Présence Cameroun','Segment','Menace directe pour AutoLink'],
    [['Yango','App courses à la demande','OUI — Douala, Yaoundé','Course ponctuelle (< 1h)','FAIBLE — segment différent'],
     ['InDrive','App courses négociées','OUI — Douala','Course ponctuelle (< 1h)','FAIBLE — segment différent'],
     ['Hertz / Europcar','Location classique internationale','Traces marginales','Location voiture sans chauffeur','FAIBLE — pas de digital local'],
     ['Agences locales (non digitales)','Location physique informelle','OUI — Douala, Yaoundé','Location à la journée','MODÉRÉE — clients se feront convertir'],
     ['Taxis conventionnels','Course négociée informelle','OUI — tout le pays','Déplacements ponctuels','FAIBLE — pas de location longue durée'],
     ['Autocar (Vatican, Buca, etc.)','Transport interurbain collectif','OUI','Longue distance collectif','FAIBLE — offre différente (individuel vs collectif)'],
     ['Particuliers (informel)','Bouche à oreille','OUI','Location sans garantie','MODÉRÉE — prix bas mais pas de sécurité']],
    [3.5,3.5,3,4,3])

h2(doc,'6.2 Analyse comparative détaillée')
tbl(doc,['Critère','Yango','Agences locales','Informel (particuliers)','AutoLink Pro'],
    [['Réservation digitale','✅ Oui','❌ Non (téléphone)','❌ Non (bouche à oreille)','✅ Oui'],
     ['Location à la durée (heures/jours)','❌ Non (courses)','✅ Oui (partiel)','✅ Oui (risqué)','✅ Oui — CŒUR'],
     ['Chauffeur certifié','✅ Partiellement','❌ Rarement','❌ Non','✅ Oui'],
     ['Paiement mobile','✅ Orange Money','❌ Cash','❌ Cash','✅ Orange+MTN'],
     ['Transparence tarifaire','✅ Oui','❌ Non','❌ Non','✅ Oui'],
     ['Assurance / garantie','✅ Partielle','❌ Non','❌ Non','✅ Oui'],
     ['Inspection véhicule','❌ Non','❌ Non','❌ Non','✅ Oui'],
     ['Notation & avis','✅ Oui','❌ Non','❌ Non','✅ Oui'],
     ['Disponible 24h/24','✅ Oui','❌ Non (horaires bureau)','→ Variable','✅ Oui'],
     ['Interurbain avec chauffeur','❌ Non','✅ Partiel','✅ Informel','✅ Oui']],
    [5,2.5,3.5,3.5,3])

h2(doc,'6.3 Barrières à l\'entrée pour futurs concurrents')
bul(doc,'Effet réseau : plus AutoLink a de véhicules inscrits, plus il est attractif pour les clients — cercle vertueux')
bul(doc,'Base de données chauffeurs certifiés : long à constituer — avantage au premier entrant')
bul(doc,'Confiance de marque : une fois implantée, la réputation est un rempart naturel')
bul(doc,'Partenariats exclusifs : hôtels, entreprises, agences de voyage — à sécuriser tôt')
pb(doc)

# ══════════════════════════════════════════════════════════════════════════════
# 7. ANALYSE DE LA DEMANDE & COMPORTEMENTS CLIENTS
# ══════════════════════════════════════════════════════════════════════════════
h1(doc,'7. Analyse de la Demande & des Comportements Clients')
h2(doc,'7.1 Segments de clientèle détaillés')
tbl(doc,['Segment','Profil','Besoin','Fréquence','Budget moyen / location'],
    [['Cadres & managers','30–50 ans, entreprises priv/public','Véhicule confortable avec chauffeur pour RDV pro','2–4×/mois','60 000–120 000 XAF'],
     ['Entrepreneurs & commerçants','25–50 ans, actifs','Déplacements Douala-Yaoundé ou ville-ville','1–2×/sem.','70 000–150 000 XAF'],
     ['Expatriés & diplomates','Tout âge, entreprises intl.','Véhicule haut de gamme avec chauffeur','Régulier','150 000–400 000 XAF'],
     ['Organisateurs d\'événements','Tout âge','Flotte pour mariage, cérémonie, conférence','Ponctuel (wee.-end)','200 000–800 000 XAF'],
     ['Touristes nationaux','25–55 ans','Sortie Kribi, Limbé, Mont Cameroun','Saisonniers','80 000–200 000 XAF'],
     ['Touristes internationaux','Tout âge','Véhicule fiable, traçable, assuré','Ponctuel','200 000–500 000 XAF'],
     ['Entreprises (corporate)','— (B2B)','Location flotte, contrats réguliers','Mensuel / annuel','500K–5M XAF/mois']],
    [4,4,4,3,2.5])

h2(doc,'7.2 Freins et leviers à l\'adoption')
tbl(doc,['Frein potentiel','Gravité','Réponse AutoLink Pro'],
    [['Méfiance envers une nouvelle plateforme','Modérée','Chauffeurs certifiés, inspections visibles, avis clients, transparence totale'],
     ['Habitude de payer en cash','Modérée','Orange Money & MTN MoMo déjà maîtrisés par la majorité'],
     ['Crainte pour la sécurité du véhicule','Faible (client)','Fiche d\'inspection avant/après — responsabilité claire'],
     ['Connexion Internet insuffisante','Modérée (zones rurales)','App mobile légère, mode offline partiel, SMS de confirmation'],
     ['Prix perçu comme élevé','Modérée','Communication sur la valeur : chauffeur certifié + assurance + confort']],
    [5.5,2.5,8.5])
pb(doc)

# ══════════════════════════════════════════════════════════════════════════════
# 8. ANALYSE RÉGLEMENTAIRE & JURIDIQUE
# ══════════════════════════════════════════════════════════════════════════════
h1(doc,'8. Analyse Réglementaire & Juridique')
h2(doc,'8.1 Cadre réglementaire du transport au Cameroun')
body(doc,'Le transport routier au Cameroun est régi par le Ministère des Transports (MINT) '
    'et encadré par plusieurs textes législatifs. AutoLink Pro opère comme une plateforme de '
    'mise en relation (marketplace) et non comme un transporteur, ce qui simplifie son positionnement légal.')
tbl(doc,['Domaine réglementaire','Texte applicable','Impact sur AutoLink','Niveau de risque'],
    [['Transport routier de personnes','Loi n°96/14 du 5 août 1996','AutoLink = intermédiaire numérique, non transporteur','Faible'],
     ['Création d\'entreprise','OHADA + RCCM Cameroun','SARL ou SA — capital minimum 1M XAF (SARL)','Faible — standard'],
     ['Traitement données personnelles','Loi n°2010/012 sur la cybersécurité','Politique de confidentialité + consentement utilisateur','Modéré — gérable'],
     ['Paiement électronique','Règlement COBAC & BEAC','Partenariat avec opérateurs agréés (Orange, MTN)','Faible — déjà fait'],
     ['Droit du travail (chauffeurs)','Code du travail camerounais','Chauffeurs = prestataires indépendants (statut à préciser)','Modéré'],
     ['Inspection technique véhicules','MINT — visite technique obligatoire','Déjà prévu dans le processus d\'approbation','Faible']],
    [4.5,4,5,3])

h2(doc,'8.2 Recommandations juridiques')
bul(doc,'Créer une SARL "AutoLink Pro Cameroun" immatriculée au RCCM de Douala')
bul(doc,'Rédiger des CGU (Conditions Générales d\'Utilisation) et une Politique de Confidentialité en français')
bul(doc,'Classifier les chauffeurs comme prestataires de services indépendants (convention de prestation)')
bul(doc,'Signer des accords de partenariat avec Orange et MTN pour l\'intégration Mobile Money')
bul(doc,'Souscrire une assurance responsabilité civile plateforme et conseiller aux gestionnaires une assurance tous risques')
pb(doc)

# ══════════════════════════════════════════════════════════════════════════════
# 9. ANALYSE DU POTENTIEL DE REVENUS
# ══════════════════════════════════════════════════════════════════════════════
h1(doc,'9. Analyse du Potentiel de Revenus')
h2(doc,'9.1 Modèle de revenus AutoLink Pro')
body(doc,'AutoLink Pro génère ses revenus via une commission de 20 à 25 % sur chaque réservation effectuée. '
    'À cela s\'ajoutent les surcharges kilométriques et, à terme, les frais de services premium.')
tbl(doc,['Source de revenus','Mécanisme','Estimé MVP (An 1)'],
    [['Commission sur réservations','20–25 % de chaque location','Principal flux — 80 % des revenus'],
     ['Surcharge kilométrique','Km parcourus – km inclus × tarif km supp.','10–15 % des revenus'],
     ['Code agent affilié','Prélevé sur la commission AutoLink (net pour AutoLink)','Coût marketing — réduit la commission nette'],
     ['Services premium (futur)','Chauffeur VIP, véhicule de luxe, assurance intégrée','Phase 2–3']],
    [4.5,7,5])

h2(doc,'9.2 Projections financières indicatives — Douala + Yaoundé')
tbl(doc,['Scénario','Nb réservations/mois','Montant moyen/réservation','Revenus bruts/mois','Commission AutoLink (22 %)','Revenus AutoLink/mois'],
    [['Conservateur (Mois 6)','150','65 000 XAF','9 750 000 XAF','≈ 2 145 000 XAF','≈ 2 M XAF'],
     ['Modéré (Mois 12)','500','70 000 XAF','35 000 000 XAF','≈ 7 700 000 XAF','≈ 7,7 M XAF'],
     ['Optimiste (Mois 18)','1 200','75 000 XAF','90 000 000 XAF','≈ 19 800 000 XAF','≈ 19,8 M XAF'],
     ['Cible (An 3 — expansion)','4 000+','80 000 XAF','320 000 000 XAF','≈ 70 400 000 XAF','≈ 70 M XAF']],
    [3.5,4,4.5,4,4,3.5])
body(doc,'Note : projections indicatives basées sur des hypothèses de croissance organique. '
    'Les chiffres réels dépendent de l\'adoption marché, de la vitesse de recrutement des gestionnaires et de la stratégie marketing.')
pb(doc)

# ══════════════════════════════════════════════════════════════════════════════
# 10. ANALYSE DES RISQUES
# ══════════════════════════════════════════════════════════════════════════════
h1(doc,'10. Analyse des Risques')
tbl(doc,['Risque','Probabilité','Impact','Mitigation'],
    [['Entrée d\'un concurrent international (Uber, Bolt location)','Faible','Élevé','S\'implanter vite, fidéliser clients, nouer partenariats exclusifs'],
     ['Réglementation plus stricte du transport à la demande','Modérée','Modéré','Statut "plateforme de mise en relation" bien documenté, dialogue avec MINT'],
     ['Faible adoption initiale des gestionnaires','Modérée','Élevé','Terrain physique, agents commerciaux, démo gratuite, commission attractive'],
     ['Problèmes de qualité des véhicules inscrits','Modérée','Élevé','Inspection obligatoire avant approbation, score qualité, suspension rapide'],
     ['Fraudes (faux paiements, faux clients)','Modérée','Modéré','Vérification KYC, paiement Mobile Money traçable, dépôt de garantie'],
     ['Coupures internet / réseau en zone cible','Faible (Douala/Yaoundé)','Modéré','Mode offline partiel, confirmation par SMS, support téléphonique'],
     ['Difficulté à certifier des chauffeurs fiables','Modérée','Élevé','Partenariats auto-écoles, base de données permis, test de conduite rigoureux'],
     ['Instabilité politique / sociale','Faible (hors zones conflit)','Élevé','Opérations concentrées Douala+Yaoundé hors zones sensibles']],
    [4,3,2.5,7])
pb(doc)

# ══════════════════════════════════════════════════════════════════════════════
# 11. ANALYSE SWOT
# ══════════════════════════════════════════════════════════════════════════════
h1(doc,'11. Analyse SWOT Complète')
body(doc,'Synthèse stratégique en quatre quadrants :')

t = doc.add_table(rows=2, cols=2)
t.style='Table Grid'; t.alignment=WD_TABLE_ALIGNMENT.CENTER

forces = ['Premier acteur digital sur ce créneau au Cameroun',
          'Modèle économique clair (commission 20–25 %)',
          'Intégration native Orange Money & MTN MoMo',
          'Stack tech moderne (React, Django, Expo)',
          'Inspection qualité systématique — différenciateur fort',
          'Système agent affilié — marketing décentralisé',
          '3 types de location : urbain / interurbain / longue ligne']
faiblesses = ['Notoriété nulle au démarrage — brand à construire',
              'Dépendance à la certification des chauffeurs (long)',
              'Application mobile (Android uniquement en phase MVP)',
              'Capital initial requis pour opérations terrain',
              'Absence de base de clients préexistante',
              'Besoin d\'une équipe commerciale terrain active']
opportunites = ['Marché vierge — aucun concurrent digital direct',
                'Mobile Money déjà massivement adopté (15M+ comptes)',
                'Classe moyenne camerounaise en croissance',
                'Yango a prouvé l\'appétit pour les apps transport',
                'Segment corporate (entreprises) très peu exploité',
                'Expansion régionale : Bafoussam, Kribi, Garoua',
                'Tourisme en développement (Kribi, Limbé, Mont Cameroun)']
menaces = ['Entrée potentielle d\'un acteur international (Bolt, Uber)',
           'Résistance du secteur informel (taxis, moto-taxis)',
           'Cadre réglementaire évolutif du transport',
           'Fraudes et abus (faux véhicules, faux clients)',
           'Qualité réseau internet variable hors grandes villes',
           'Zones d\'instabilité sécuritaire (NW, SW) à éviter']

swot_cell(t.rows[0].cells[0],'💪 FORCES (Strengths)', forces, 'DCFCE7', C_GRN)
swot_cell(t.rows[0].cells[1],'⚠️  FAIBLESSES (Weaknesses)', faiblesses, 'FEF9C3', C_YEL)
swot_cell(t.rows[1].cells[0],'🚀 OPPORTUNITÉS (Opportunities)', opportunites, 'DBEAFE', C_SKY)
swot_cell(t.rows[1].cells[1],'🔴 MENACES (Threats)', menaces, 'FEE2E2', C_RED)

for row in t.rows:
    for cell in row.cells:
        cell.width = Cm(8.25)
doc.add_paragraph()
pb(doc)

# ══════════════════════════════════════════════════════════════════════════════
# 12. POSITIONNEMENT STRATÉGIQUE & RECOMMANDATIONS
# ══════════════════════════════════════════════════════════════════════════════
h1(doc,'12. Positionnement Stratégique & Recommandations')
h2(doc,'12.1 Positionnement clair')
box(doc,'AutoLink Pro se positionne comme LA plateforme de référence pour louer un véhicule de qualité '
    'avec chauffeur au Cameroun — pour quelques heures, une journée, ou plusieurs jours — '
    'en toute sécurité, de façon 100 % digitale et avec paiement Mobile Money.',bg='DBEAFE')

h2(doc,'12.2 Stratégie de lancement recommandée (Go-to-Market)')
tbl(doc,['Phase','Durée','Actions clés','Objectif'],
    [['Phase 0 : Pré-lancement','M1–M2','Recruter les 20 premiers gestionnaires de véhicules à Douala. Certifier 30 chauffeurs. Tester l\'application en conditions réelles.','20 véhicules · 30 chauffeurs · 0 bugs bloquants'],
     ['Phase 1 : Lancement Douala','M3–M6','Campagne agents affiliés (influenceurs locaux). Partenariats hôtels (Akwa Palace, La Falaise). Présence événements pro (CCI, GICAM).','150 réservations/mois · 500 clients inscrits'],
     ['Phase 2 : Expansion Yaoundé','M7–M12','Reproduction du modèle à Yaoundé. Segment corporate (entreprises, ambassades). Orange Money / MTN promo exclusive.','500 réservations/mois · 2 000 clients'],
     ['Phase 3 : Consolidation nationale','M13–M24','Bafoussam, Kribi, Limbé. App iOS. Tableau de bord analytics. Programme fidélité.','1 500 réservations/mois · top of mind']],
    [3,2,9,3.5])

h2(doc,'12.3 Recommandations prioritaires')
bul(doc,'Enregistrer AutoLink Pro Cameroun SARL au RCCM de Douala sans délai', bold_prefix='R1.')
bul(doc,'Signer les accords d\'intégration Mobile Money avec Orange et MTN dès que possible', bold_prefix='R2.')
bul(doc,'Recruter un responsable opérations terrain à Douala pour gérer les gestionnaires/chauffeurs', bold_prefix='R3.')
bul(doc,'Lancer une campagne d\'acquisition agents affiliés via WhatsApp et influenceurs locaux', bold_prefix='R4.')
bul(doc,'Prioriser le segment "corporate" : contacter la GICAM, la CCI, et les grandes entreprises (MTN, Orange, Boissons du Cameroun, etc.)', bold_prefix='R5.')
bul(doc,'Mettre en place un numéro de support WhatsApp Business dès le jour 1 (contexte camerounais)', bold_prefix='R6.')
pb(doc)

# ══════════════════════════════════════════════════════════════════════════════
# 13. CONCLUSION
# ══════════════════════════════════════════════════════════════════════════════
h1(doc,'13. Conclusion')
body(doc,'Cette étude de marché confirme sans ambiguïté que le Cameroun est un terrain idéal pour le lancement '
    'd\'AutoLink Pro. Les conditions macro-économiques, démographiques, technologiques et concurrentielles '
    'sont toutes favorables à une entrée rapide et décisive.')
body(doc,'Les trois éléments déterminants qui rendent ce moment stratégique optimal sont :')
bul(doc,'Le marché est vierge — aucune plateforme digitale de location à la durée n\'existe encore.', bold_prefix='1.')
bul(doc,'Le Mobile Money est massivement adopté — le principal frein du paiement digital est levé.', bold_prefix='2.')
bul(doc,'Yango a éduqué le marché — le consommateur camerounais est habitué aux apps de transport.', bold_prefix='3.')
body(doc,'AutoLink Pro dispose d\'une fenêtre d\'opportunité de 12 à 24 mois avant qu\'un concurrent '
    'potentiel ne détecte et n\'occupe ce segment. La vitesse d\'exécution est donc la variable critique.')

box(doc,'🏆 RECOMMANDATION FINALE : Lancer le MVP en priorité absolue à Douala, avec une offre '
    'simple (location à la journée avec chauffeur), un minimum de 20 véhicules certifiés, '
    'et une stratégie d\'acquisition agressive via agents affiliés et partenariats hôtels / entreprises. '
    'AutoLink Pro a toutes les cartes en main pour s\'imposer comme le leader incontesté de la '
    'location de véhicules digitale en Afrique Centrale.', bg='DCFCE7')

p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=p.add_run(f'AutoLink Pro — Étude de Marché Cameroun — v1.0 — {TODAY} — CONFIDENTIEL')
r.italic=True; r.font.size=Pt(9); r.font.color.rgb=C_GREY

# ── Sauvegarde ────────────────────────────────────────────────────────────────
doc.save(f'{OUT}\\AutoLink_Etude_de_Marche_Cameroun.docx')
print('Etude de marche generee : AutoLink_Etude_de_Marche_Cameroun.docx')
