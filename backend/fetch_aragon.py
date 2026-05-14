import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    'https://educa.aragon.es/educa-buscador-centro-portlet/api/v1/centros',
    headers={'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'}
)
try:
    response = urllib.request.urlopen(req, context=ctx)
    data = json.loads(response.read().decode('utf-8'))
    print("Found centers:", len(data))
    print(data[0])
except Exception as e:
    print("Error:", e)
