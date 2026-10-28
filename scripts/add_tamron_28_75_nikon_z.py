import json, urllib.parse, urllib.request
from pathlib import Path
repo=Path(r"C:\Users\HELIOS NEO 16\Documents\website\softstore---professional-lighting (2)")
env={}
for line in (repo/'.env.local').read_text(encoding='utf-8').splitlines():
    if '=' in line and not line.lstrip().startswith('#'):
        k,v=line.split('=',1); env[k.strip()]=v.strip().strip('"').strip("'")
base=env['VITE_SUPABASE_URL'].rstrip('/')+'/rest/v1/products%20gearshop'
headers={'apikey':env['VITE_SUPABASE_ANON_KEY'],'Authorization':'Bearer '+env['VITE_SUPABASE_ANON_KEY'],'Content-Type':'application/json','Prefer':'return=representation'}
product_id=6040
check=urllib.request.Request(base+'?'+urllib.parse.urlencode({'id':f'eq.{product_id}','select':'id'}),headers=headers)
with urllib.request.urlopen(check,timeout=30) as r: existing=json.load(r)
if existing:
    raise SystemExit(f'Product ID {product_id} is already used')
image='/images/products/tamron-28-75mm-f-2-8-di-iii-vxd-g2-nikon-z.webp'
row={
 'id':product_id,
 'name':'Tamron 28-75mm f/2.8 Di III VXD G2 Nikon Z (A063)',
 'price':11500,
 'oldPrice':None,
 'rentPrice':0,
 'category':'Objectif',
 'image':image,
 'gallery':[image],
 'video':'',
 'desc':'''<h2>Tamron 28-75mm f/2.8 Di III VXD G2 pour Nikon Z au Maroc</h2>
<p>Le Tamron A063 est un zoom standard lumineux f/2.8 constant conçu pour les hybrides Nikon Z plein format. Il couvre les scènes du quotidien, le reportage, le portrait et la vidéo avec un autofocus VXD rapide et silencieux.</p>
<h3>Points clés</h3>
<ul>
<li>Monture Nikon Z pour boîtiers plein format Nikon Z</li>
<li>Focale 28-75 mm et ouverture constante f/2.8</li>
<li>Autofocus linéaire VXD rapide et silencieux</li>
<li>Mise au point minimale 0,18 m à 28 mm</li>
<li>Construction résistante à l’humidité et traitement fluoré</li>
</ul>
<h3>Disponibilité au Maroc</h3>
<p>Produit proposé sur commande. Contactez GearShop pour confirmer le délai, la disponibilité fournisseur et la monture avant paiement.</p>''',
 'stars':0,
 'seo_title':'Tamron 28-75mm f/2.8 G2 Nikon Z au Maroc | 11 500 DH',
 'meta_description':'Tamron 28-75mm f/2.8 G2 Nikon Z au Maroc chez GearShop : 11 500 DH. Zoom plein format, autofocus VXD et disponibilité fournisseur à confirmer avant commande.',
 'specs':[
  'Marque : Tamron',
  'Modèle : A063',
  'Monture : Nikon Z plein format',
  'Focale : 28-75 mm',
  'Ouverture maximale : f/2.8 constante',
  'Formule optique : 17 éléments en 15 groupes',
  'Autofocus : VXD (Voice-coil eXtreme-torque Drive)',
  'Mise au point minimale : 0,18 m (28 mm) / 0,38 m (75 mm)',
  'Rapport de reproduction maximal : 1:2,7 (28 mm) / 1:4,1 (75 mm)',
  'Diamètre de filtre : 67 mm',
  'Dimensions : 75,8 mm x 119,8 mm',
  'Poids : 550 g',
  'Diaphragme : 9 lamelles circulaires',
  'Statut : Sur commande - délai à confirmer'
 ],
 'inStock':False,
 'promoEligible':'False'
}
request=urllib.request.Request(base,data=json.dumps(row,ensure_ascii=False).encode('utf-8'),headers=headers,method='POST')
try:
    with urllib.request.urlopen(request,timeout=30) as r: created=json.load(r)
except urllib.error.HTTPError as e:
    print(e.read().decode('utf-8','ignore')); raise
print(json.dumps(created,ensure_ascii=False,indent=2))
