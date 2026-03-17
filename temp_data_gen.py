import json
import random
import unicodedata
from datetime import datetime, timedelta

def remove_accents(input_str):
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    return u"".join([c for c in nfkd_form if not unicodedata.combining(c)])

def random_date(start, end):
    return start + timedelta(
        seconds=random.randint(0, int((end - start).total_seconds())),
    )

with open('0237-ictve.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Ponderaciones
pto_teo = data['info_modulo'].get('criterio_conocimiento', 30) / 100.0
pto_inf = data['info_modulo'].get('criterio_procedimiento_ejercicios', 20) / 100.0
pto_pra = data['info_modulo'].get('criterio_procedimiento_practicas', 20) / 100.0
pto_cua = data['info_modulo'].get('criterio_tareas', 30) / 100.0

df_al = data.get('df_al', [])
df_eval = data.get('df_eval', [])

# Hacer copia dict para búsquedas
eval_dict = {al['ID']: al for al in df_eval}

# Asignar a grupos el nº de alumnos
total = len(df_al)
n_bajos = int(total * 0.65) # suspensos
n_medios = int(total * 0.25) # bien/notable bajo
n_altos = total - n_bajos - n_medios # sobresaliente

grupos_notas = ['bajo'] * n_bajos + ['medio'] * n_medios + ['alto'] * n_altos
random.shuffle(grupos_notas)

n_16_17 = int(total * 0.70)
n_18_19 = int(total * 0.20)
n_mas = total - n_16_17 - n_18_19

grupos_edades = ['16-17'] * n_16_17 + ['18-19'] * n_18_19 + ['mas'] * n_mas
random.shuffle(grupos_edades)

for idx, al in enumerate(df_al):
    # Generar email inventado
    nombre = remove_accents(al.get('Nombre', '').lower().replace(' ', ''))
    apellidos = remove_accents(al.get('Apellidos', '').lower().split(' ')[0])
    num = random.randint(10, 99)
    email = f"{nombre[0]}{apellidos}{num}@gmail.com"
    al['email'] = email
    
    # Generar movil
    movil = f"6{random.randint(10000000, 99999999)}"
    al['Móvil'] = f"{movil[:3]} {movil[3:6]} {movil[6:]}"
    
    # Repite
    al['Repite'] = "No"
    
    # Edad y nacimiento
    ed = grupos_edades[idx]
    if ed == '16-17':
        d = random_date(datetime(2008, 1, 1), datetime(2009, 12, 31))
    elif ed == '18-19':
        d = random_date(datetime(2006, 1, 1), datetime(2007, 12, 31))
    else:
        d = random_date(datetime(2001, 1, 1), datetime(2005, 12, 31))
        
    al['Nacimiento'] = d.strftime("%d/%m/%Y")
    al['Edad'] = 2026 - d.year # Edad apróx en 2026

    # Evaluacion
    al_id = al['ID']
    if al_id not in eval_dict:
        eval_dict[al_id] = {"ID": al_id}
    
    ev = eval_dict[al_id]
    grupo_nota = grupos_notas[idx]
    
    def generar_notas():
        if grupo_nota == 'bajo':
            teo = round(random.uniform(1.0, 3.5), 1)
            pra = round(random.uniform(2.0, 4.5), 1)
            inf = round(random.uniform(2.0, 5.0), 1)
            cua = round(random.uniform(3.0, 5.5), 1)
        elif grupo_nota == 'medio':
            teo = round(random.uniform(4.0, 6.0), 1)
            pra = round(random.uniform(5.5, 7.5), 1)
            inf = round(random.uniform(6.0, 8.0), 1)
            cua = round(random.uniform(6.5, 8.5), 1)
        else: # alto
            teo = round(random.uniform(6.0, 7.5), 1) # fallan un poco en examenes
            pra = round(random.uniform(6.5, 8.0), 1)
            inf = round(random.uniform(9.0, 10.0), 1)
            cua = round(random.uniform(9.5, 10.0), 1)
        
        nota_tri = round(teo*pto_teo + pra*pto_pra + inf*pto_inf + cua*pto_cua, 2)
        return teo, pra, inf, cua, nota_tri

    t1_t, t1_p, t1_i, t1_c, t1_n = generar_notas()
    ev['1T_Teoria'] = float(t1_t)
    ev['1T_Practica'] = float(t1_p)
    ev['1T_Informes'] = float(t1_i)
    ev['1T_Cuaderno'] = float(t1_c)
    ev['1T_Nota'] = float(t1_n)
    
    t2_t, t2_p, t2_i, t2_c, t2_n = generar_notas()
    # A veces mejoran un poco en el 2do trimestre
    if random.random() > 0.5:
        # Mejora de medio punto en todo
        t2_t, t2_p, t2_i, t2_c = min(10.0, t2_t+0.5), min(10.0, t2_p+0.5), min(10.0, t2_i+0.5), min(10.0, t2_c+0.5)
        t2_n = round(t2_t*pto_teo + t2_p*pto_pra + t2_i*pto_inf + t2_c*pto_cua, 2)
        
    ev['2T_Teoria'] = float(t2_t)
    ev['2T_Practica'] = float(t2_p)
    ev['2T_Informes'] = float(t2_i)
    ev['2T_Cuaderno'] = float(t2_c)
    ev['2T_Nota'] = float(t2_n)

data['df_al'] = df_al
data['df_eval'] = list(eval_dict.values())

with open('0237-ictve.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print("Datos generados correctamente")
