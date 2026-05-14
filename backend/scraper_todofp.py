import sys
sys.stdout.reconfigure(encoding='utf-8')

import requests
from bs4 import BeautifulSoup
import json
import os

url = "https://www.todofp.es/que-estudiar/grados-d/grado-superior.html"
headers = {'User-Agent': 'Mozilla/5.0'}
response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.content, 'html.parser')

data = []

table = soup.find('table')
if table:
    current_family = "Desconocida"
    rows = table.find('tbody').find_all('tr', class_='fpgs')
    for row in rows:
        # La familia suele estar en un <th> con rowspan
        th = row.find('th')
        if th:
            img = th.find('img')
            if img and img.has_attr('alt'):
                current_family = img['alt'].replace("Logotipo ", "").strip()
        
        td_title = row.find('td', headers=lambda x: x and 'titulacion' in x)
        if not td_title:
            continue
            
        a_tag = td_title.find('a')
        if not a_tag:
            continue
            
        title = a_tag.text.strip()
        link = "https://www.todofp.es" + a_tag['href'] if a_tag['href'].startswith('/') else a_tag['href']
        
        # Enlaces BOE
        boe_links = []
        td_boe = row.find('td', headers=lambda x: x and 'real-decreto' in x)
        if td_boe:
            for a in td_boe.find_all('a'):
                boe_links.append(a['href'])
                
        # Enlaces Currículo
        curr_links = []
        td_curr = row.find('td', headers=lambda x: x and 'curriculo-mecd' in x)
        if td_curr:
            for a in td_curr.find_all('a'):
                href = a['href']
                href = "https://www.todofp.es" + href if href.startswith('/') else href
                curr_links.append(href)

        data.append({
            "familia": current_family,
            "ciclo": title,
            "url_ministerio": link,
            "boe_urls": boe_links,
            "curriculo_mecd_urls": curr_links
        })

output_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ciclos_superiores_todofp.json')
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✅ Se han extraído {len(data)} ciclos formativos.")
print(f"💾 Guardados en {output_file}")
