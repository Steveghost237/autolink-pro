"""Récupère une vraie photo par modèle via l'API REST Wikipedia/Wikimedia.

Produit backend/apps/vehicles/data/vehicle_images.json : { "Brand|Model": "url-640px" }
Les vignettes Wikimedia à 640px pèsent ~40-90 Ko : légères et nettes.
"""
import json
import os
import time
import urllib.request

# Titre de l'article Wikipedia anglais par modèle seedé
WIKI_TITLES = {
    'Audi|A6': 'Audi A6', 'Audi|Q5': 'Audi Q5', 'Audi|Q7': 'Audi Q7', 'Audi|Q8': 'Audi Q8',
    'BMW|Serie 5': 'BMW 5 Series', 'BMW|Serie 7': 'BMW 7 Series',
    'BMW|X3': 'BMW X3', 'BMW|X5': 'BMW X5', 'BMW|X7': 'BMW X7',
    'Bentley|Bentayga': 'Bentley Bentayga',
    'Dacia|Duster': 'Dacia Duster', 'Dacia|Logan': 'Dacia Logan',
    'Ford|Everest': 'Ford Everest', 'Ford|Fiesta': 'Ford Fiesta', 'Ford|Ranger': 'Ford Ranger',
    'Honda|Accord': 'Honda Accord', 'Honda|CR-V': 'Honda CR-V', 'Honda|Civic': 'Honda Civic',
    'Hyundai|Accent': 'Hyundai Accent', 'Hyundai|Elantra': 'Hyundai Elantra',
    'Hyundai|H-1': 'Hyundai Starex', 'Hyundai|Santa Fe': 'Hyundai Santa Fe',
    'Hyundai|Tucson': 'Hyundai Tucson',
    'Isuzu|D-Max': 'Isuzu D-Max',
    'Kia|Cerato': 'Kia Cerato', 'Kia|Picanto': 'Kia Picanto', 'Kia|Rio': 'Kia Rio',
    'Kia|Sorento': 'Kia Sorento', 'Kia|Sportage': 'Kia Sportage',
    'Lexus|GX 460': 'Lexus GX', 'Lexus|LX 570': 'Lexus LX', 'Lexus|RX 350': 'Lexus RX',
    'Maserati|Levante': 'Maserati Levante',
    'Mazda|3': 'Mazda3', 'Mazda|CX-5': 'Mazda CX-5',
    'Mercedes|Classe C 300': 'Mercedes-Benz C-Class', 'Mercedes|Classe E 350': 'Mercedes-Benz E-Class',
    'Mercedes|Classe G 63': 'Mercedes-Benz G-Class', 'Mercedes|Classe S 500': 'Mercedes-Benz S-Class',
    'Mercedes|GLC 300': 'Mercedes-Benz GLC', 'Mercedes|GLE 350': 'Mercedes-Benz GLE',
    'Mercedes|GLS 450': 'Mercedes-Benz GLS', 'Mercedes|Sprinter': 'Mercedes-Benz Sprinter',
    'Mitsubishi|L200': 'Mitsubishi Triton', 'Mitsubishi|Outlander': 'Mitsubishi Outlander',
    'Mitsubishi|Pajero': 'Mitsubishi Pajero',
    'Nissan|Almera': 'Nissan Almera', 'Nissan|Micra': 'Nissan Micra', 'Nissan|Navara': 'Nissan Navara',
    'Nissan|Patrol': 'Nissan Patrol', 'Nissan|Qashqai': 'Nissan Qashqai', 'Nissan|X-Trail': 'Nissan X-Trail',
    'Peugeot|208': 'Peugeot 208', 'Peugeot|3008': 'Peugeot 3008',
    'Peugeot|301': 'Peugeot 301', 'Peugeot|508': 'Peugeot 508',
    'Porsche|Cayenne': 'Porsche Cayenne', 'Porsche|Panamera': 'Porsche Panamera',
    'Range Rover|Evoque': 'Range Rover Evoque', 'Range Rover|Sport': 'Range Rover Sport',
    'Range Rover|Velar': 'Range Rover Velar',
    'Renault|Clio': 'Renault Clio', 'Renault|Logan': 'Dacia Logan',
    'Suzuki|Swift': 'Suzuki Swift', 'Suzuki|Vitara': 'Suzuki Vitara',
    'Toyota|Avensis': 'Toyota Avensis', 'Toyota|Camry': 'Toyota Camry',
    'Toyota|Corolla': 'Toyota Corolla', 'Toyota|Fortuner': 'Toyota Fortuner',
    'Toyota|Hiace': 'Toyota HiAce', 'Toyota|Highlander': 'Toyota Highlander',
    'Toyota|Hilux': 'Toyota Hilux', 'Toyota|Land Cruiser': 'Toyota Land Cruiser',
    'Toyota|Land Cruiser Prado': 'Toyota Land Cruiser Prado',
    'Toyota|Land Cruiser V8 VXR': 'Toyota Land Cruiser',
    'Toyota|RAV4': 'Toyota RAV4', 'Toyota|Sienna': 'Toyota Sienna',
    'Toyota|Starlet': 'Toyota Starlet', 'Toyota|Yaris': 'Toyota Yaris',
    'Volkswagen|Golf 7': 'Volkswagen Golf Mk7', 'Volkswagen|Polo': 'Volkswagen Polo',
    'Volkswagen|Tiguan': 'Volkswagen Tiguan', 'Volkswagen|Touareg': 'Volkswagen Touareg',
    'Volkswagen|Passat': 'Volkswagen Passat',
}

UA = {'User-Agent': 'AutoLinkPro/1.0 (catalogue vehicules; contact@autolink.cm)'}


def get_json(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode())


def clean_url(thumb_url):
    """Wikimedia ne sert que la taille exacte de la vignette : on la garde
    telle quelle (~30-60 Ko, idéal mobile) en retirant les paramètres de tracking."""
    return thumb_url.split('?')[0]


def main():
    out = {}
    misses = []
    for key, title in WIKI_TITLES.items():
        slug = title.replace(' ', '_')
        url = f'https://en.wikipedia.org/api/rest_v1/page/summary/{slug}'
        try:
            data = get_json(url)
            thumb = (data.get('thumbnail') or {}).get('source')
            if thumb:
                out[key] = clean_url(thumb)
                print(f'OK   {key}  <-  {title}')
            else:
                misses.append(key)
                print(f'NONE {key}  (pas d image sur {title})')
        except Exception as e:
            misses.append(key)
            print(f'FAIL {key}  ({e})')
        time.sleep(0.25)

    os.makedirs('apps/vehicles/data', exist_ok=True)
    path = 'apps/vehicles/data/vehicle_images.json'
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1, sort_keys=True)
    print(f'\n{len(out)} images -> {path} ; {len(misses)} manquantes : {misses}')


if __name__ == '__main__':
    main()
