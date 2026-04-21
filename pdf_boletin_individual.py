import io
from datetime import datetime
import pandas as pd
from reportlab.lib.pagesizes import A4, portrait
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

def _draw_page_decorations(canv, doc):
    """Cabecera y pie — idéntico al Calendario académico."""
    canv.saveState()
    W, H = portrait(A4)
    canv.setFont("Helvetica-Bold", 10)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawCentredString(W / 2, H - 1.5 * cm, doc.cal_titulo)
    canv.setFont("Helvetica", 9)
    canv.drawRightString(W - 1 * cm, 1 * cm, doc.cal_pie)
    canv.restoreState()

def generar_pdf_boletin_individual(
    info_modulo: dict,
    al_id: str,
    df_al: pd.DataFrame,
    df_eval: pd.DataFrame,
    df_act: pd.DataFrame,
    df_ce: pd.DataFrame,
    df_ra: pd.DataFrame,
    df_feoe: pd.DataFrame,
    info_fechas: dict = None,
    planning_ledger: dict = None,
    df_ud: pd.DataFrame = None,
    df_pr: pd.DataFrame = None
):
    if info_fechas is None: info_fechas = {}
    if planning_ledger is None: planning_ledger = {}
    if df_ud is None: df_ud = pd.DataFrame()
    if df_pr is None: df_pr = pd.DataFrame()
    buffer = io.BytesIO()
    W, H = portrait(A4)
    left_m   = 2.0 * cm
    right_m  = 1.0 * cm
    top_m    = 2.0 * cm
    bottom_m = 1.5 * cm

    doc = BaseDocTemplate(
        buffer,
        pagesize=portrait(A4),
        leftMargin=left_m, rightMargin=right_m,
        topMargin=top_m, bottomMargin=bottom_m,
    )

    nombre_modulo = info_modulo.get("modulo", "Módulo")
    doc.cal_titulo = f"Informe Individual de Evaluación  ·  {nombre_modulo}"
    doc.cal_pie = f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})"

    frame = Frame(left_m, bottom_m, W - left_m - right_m, H - top_m - bottom_m, id="main")
    doc.addPageTemplates([PageTemplate(id="port", frames=[frame], onPage=_draw_page_decorations)])

    styles = getSampleStyleSheet()
    h1 = ParagraphStyle("H1", parent=styles["Heading1"], fontSize=18, spaceAfter=6, textColor=colors.black)
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=14, spaceAfter=8, textColor=colors.black, spaceBefore=4)
    h3 = ParagraphStyle("H3", parent=styles["Heading3"], fontSize=11, spaceAfter=4, textColor=colors.black, fontName="Helvetica-Bold")
    norm = ParagraphStyle("Nor", parent=styles["Normal"], fontSize=9, leading=11)
    sml = ParagraphStyle("Sm", parent=styles["Normal"], fontSize=8, leading=10)
    smlB_center = ParagraphStyle("SmB_C", parent=styles["Normal"], fontSize=8, leading=10, fontName="Helvetica-Bold", alignment=TA_CENTER)
    sml_center = ParagraphStyle("Sm_C", parent=styles["Normal"], fontSize=8, leading=10, alignment=TA_CENTER)
    normB_center = ParagraphStyle("NorB_C", parent=styles["Normal"], fontSize=9, leading=11, fontName="Helvetica-Bold", alignment=TA_CENTER)

    elements = []

    # Get student info
    al = df_al[df_al["ID"] == al_id].iloc[0] if not df_al.empty and al_id in df_al["ID"].values else None
    if al is None:
        elements.append(Paragraph("Estudiante no encontrado.", norm))
        doc.build(elements)
        buffer.seek(0)
        return buffer

    apellidos = str(al.get("Apellidos", ""))
    nombre = str(al.get("Nombre", ""))
    _edad = al.get("Edad", "")
    edad = str(int(_edad)) if pd.notna(_edad) and str(_edad) not in ("", "nan") else "-"
    repite = "Sí" if al.get("Repite", False) else "No"
    
    email = str(al.get("Email", "-")) if pd.notna(al.get("Email")) else "-"
    telefono = str(al.get("Teléfono", "-")) if pd.notna(al.get("Teléfono")) else "-"
    estado = str(al.get("Estado", "-")) if pd.notna(al.get("Estado")) else "-"
    obs = str(al.get("Observaciones", "-")) if pd.notna(al.get("Observaciones")) else "-"
    if email.lower() == "nan" or email == "": email = "-"
    if telefono.lower() == "nan" or telefono == "": telefono = "-"
    if estado.lower() == "nan" or estado == "": estado = "-"
    if obs.lower() == "nan" or obs == "": obs = "-"
    
    # Setup index for df_eval
    idx_ev = None
    if not df_eval.empty:
        mask_ev = df_eval["ID"] == al_id
        if mask_ev.any():
            idx_ev = df_eval[mask_ev].index[0]

    # --- 1. FICHA DEL ALUMNO ---
    elements.append(Paragraph("Alumnado", h2))
    
    ficha_data = [
        [Paragraph("<b>Apellidos y Nombre:</b>", sml), Paragraph(f"{apellidos}, {nombre}", sml), Paragraph("<b>NIF / NIE:</b>", sml), Paragraph(al_id, sml)],
        [Paragraph("<b>Email:</b>", sml), Paragraph(email, sml), Paragraph("<b>Teléfono:</b>", sml), Paragraph(telefono, sml)],
        [Paragraph("<b>Edad:</b>", sml), Paragraph(edad, sml), Paragraph("<b>Repite:</b>", sml), Paragraph(repite, sml)],
        [Paragraph("<b>Estado:</b>", sml), Paragraph(estado, sml), Paragraph("<b>Observaciones:</b>", sml), Paragraph(obs, sml)]
    ]
    t_ficha = Table(ficha_data, colWidths=[3.5*cm, 5.5*cm, 3.5*cm, 5.5*cm], hAlign='LEFT')
    t_ficha.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), colors.white),
        ("TEXTCOLOR",     (0, 0), (-1, -1), colors.black),
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("BOX",           (0, 0), (-1, -1), 1.5, colors.HexColor("#222222")),
        ("GRID",          (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")),
        ("TOPPADDING",    (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING",   (0, 0), (-1, -1), 4),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_ficha)
    elements.append(Spacer(1, 10))

    # --- 2. PANEL DE RESULTADOS DE APRENDIZAJE (RA) ---
    elements.append(Paragraph("1. Evaluación continua por Resultados de Aprendizaje", h2))
    
    from reportlab.graphics.shapes import Drawing, Rect, String
    from datetime import timedelta
    
    if not df_ra.empty and not df_eval.empty and idx_ev is not None:
        # 2.1 Calculate Trimesters per RA
        uds_por_tri = {"1T": set(), "2T": set(), "3T": set()}
        for tri, m_key in [("1t", "1T"), ("2t", "2T"), ("3t", "3T")]:
            ini_t = info_fechas.get(f"ini_{tri}")
            fin_t = info_fechas.get(f"fin_{tri}")
            if ini_t and fin_t:
                curr = ini_t
                while curr <= fin_t:
                    d_str = curr.strftime("%d/%m/%Y")
                    for ud in planning_ledger.get(d_str, []):
                        uds_por_tri[m_key].add(ud)
                    curr += timedelta(days=1)
                    
        ra_to_tri = {}
        ra_info = {}
        for _, ra_row in df_ra.iterrows():
            ra_id = str(ra_row["id_ra"])
            ra_info[ra_id] = {
                "pond": float(pd.to_numeric(ra_row["peso_ra"], errors="coerce")) if not pd.isna(ra_row["peso_ra"]) else 0.0,
                "desc": str(ra_row.get("desc_ra", ra_row.get("Descripción", "")))
            }
            tris_found = []
            uds_found = []
            prs_found = []
            if ra_id in df_ud.columns:
                for _, ud_row in df_ud.iterrows():
                    if ud_row.get(ra_id, False):
                        uid = str(ud_row["id_ud"])
                        uds_found.append(uid)
                        for t_key in ["1T", "2T", "3T"]:
                            if uid in uds_por_tri[t_key] and t_key not in tris_found:
                                tris_found.append(t_key)
            if df_pr is not None and not df_pr.empty and ra_id in df_pr.columns:
                for _, pr_row in df_pr.iterrows():
                    if pr_row.get(ra_id, False):
                        prs_found.append(str(pr_row["ID"]))
                        
            if not tris_found:
                tris_found = ["1T", "2T", "3T"]
                
            ra_to_tri[ra_id] = {
                "tris": tris_found,
                "uds": uds_found,
                "prs": prs_found
            }

        n1 = float(df_eval.at[idx_ev, "1T_Nota"]) if not pd.isna(df_eval.at[idx_ev, "1T_Nota"]) else 0.0
        n2 = float(df_eval.at[idx_ev, "2T_Nota"]) if not pd.isna(df_eval.at[idx_ev, "2T_Nota"]) else 0.0
        n3 = float(df_eval.at[idx_ev, "3T_Nota"]) if not pd.isna(df_eval.at[idx_ev, "3T_Nota"]) else 0.0
        notas_student = {"1T": n1, "2T": n2, "3T": n3}
        nota_final = float(df_eval.at[idx_ev, "Nota_Final"]) if not pd.isna(df_eval.at[idx_ev, "Nota_Final"]) else 0.0

        ra_tb_data = [] # [[Desc, Bar, Info]]
        for ra_id in sorted(ra_info.keys()):
            info = ra_info[ra_id]
            tris = ra_to_tri[ra_id]["tris"]
            uds = ra_to_tri[ra_id]["uds"]
            prs = ra_to_tri[ra_id]["prs"]
            
            avg_nota_ra = sum(notas_student[t] for t in tris) / len(tris) if tris else nota_final
            prop = min(100.0, max(0.0, (avg_nota_ra / 5.0) * 100.0) if avg_nota_ra >= 5.0 else (avg_nota_ra/5.0)*100.0)
            
            # Choose correct color (monochrome/greyscale)
            if prop >= 50: bar_color = "#555555"
            else: bar_color = "#cccccc"
            
            # Create graphic Drawing
            bar_w = 4.0 * cm
            bar_h = 12
            d = Drawing(bar_w, bar_h)
            d.add(Rect(0, 0, bar_w, bar_h, fillColor=colors.HexColor("#eeeeee"), strokeColor=colors.HexColor("#222222"), strokeWidth=0.5))
            d.add(Rect(0, 0, (prop/100.0)*bar_w, bar_h, fillColor=colors.HexColor(bar_color), strokeColor=None))
            d.add(String(bar_w/2, 3, f"{prop:.0f}%", fontSize=8, fillColor=colors.black if prop < 50 else colors.white, textAnchor='middle', fontName="Helvetica-Bold"))
            
            desc_text = f"<b>{ra_id} ({info['pond']:.1f}%)</b> — <font size='7' color='#555555'>{info['desc']}</font>"
            desc_p = Paragraph(desc_text, norm)
            
            tris_lbl = ", ".join(tris)
            uds_lbl = ", ".join(uds) if uds else "-"
            prs_lbl = ", ".join(prs) if prs else "-"
            
            info_text = f'''<font size="7" color="#333333">
<b>Evaluado en:</b> {tris_lbl}<br/>
<b>UDs:</b> {uds_lbl}<br/>
<b>Prácticas:</b> {prs_lbl}
</font>'''
            info_p = Paragraph(info_text, sml)
            
            ra_tb_data.append([desc_p, d, info_p])
            
        if ra_tb_data:
            ra_tb_data.insert(0, [
                Paragraph("<b>Resultado de Aprendizaje</b>", smlB_center),
                Paragraph("<b>Grado de adquisición</b>", smlB_center),
                Paragraph("<b>Instrumentos de Evaluación</b>", smlB_center)
            ])
            t_ra = Table(ra_tb_data, colWidths=[8.0*cm, 5.0*cm, 5.0*cm], hAlign='LEFT')
            t_ra.setStyle(TableStyle([
                ("BACKGROUND",    (0, 0), (-1, 0), colors.white),
                ("TEXTCOLOR",     (0, 0), (-1, 0), colors.black),
                ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
                ("LINEBELOW",     (0, 0), (-1, 0), 1.5, colors.HexColor("#222222")),
                ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
                ("BOX",           (0, 0), (-1, -1), 1.5, colors.HexColor("#222222")),
                ("GRID",          (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")),
                ("TOPPADDING",    (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("ALIGN",         (1, 1), (1, -1), "CENTER"),
            ]))
            elements.append(t_ra)
        else:
            elements.append(Paragraph("<i>No hay información de RA evaluada todavía.</i>", sml))
    else:
        elements.append(Paragraph("<i>Datos insuficientes para evaluación competencial.</i>", sml))
        
    elements.append(Spacer(1, 5))


    # --- 3. MATRIZ DE DETALLE TRIMESTRAL ---
    elements.append(Paragraph("2. Resumen de Actividades y su ponderación", h2))
    
    p_teoria   = info_modulo.get("criterio_conocimiento",             30)
    p_practica = info_modulo.get("criterio_procedimiento_practicas",  20)
    p_informes = info_modulo.get("criterio_procedimiento_ejercicios", 20)
    p_cuaderno = info_modulo.get("criterio_tareas",                   30)

    TIPO_MAP = {
        "Teoria":   ("Exámenes teóricos",   p_teoria),
        "Practica": ("Exámenes prácticos", p_practica),
        "Informes": ("Informes de ejercicios",     p_informes),
        "Tareas":   ("Cuaderno de tareas",     p_cuaderno),
    }
    TIPOS_ORDEN = ["Teoria", "Practica", "Informes", "Tareas"]
    
    pond_1t = info_modulo.get("pond_1t", 30)
    pond_2t = info_modulo.get("pond_2t", 30)
    pond_3t = info_modulo.get("pond_3t", 40)
    pond_map = {"1T": pond_1t, "2T": pond_2t, "3T": pond_3t}

    if idx_ev is None:
        elements.append(Paragraph("Sin notas en la plataforma todavía.", sml))
        doc.build(elements)
        buffer.seek(0)
        return buffer

    # Retrieve activities for all trimesters first
    acts_by_tri = {"1T": pd.DataFrame(), "2T": pd.DataFrame(), "3T": pd.DataFrame()}
    for tri in ["1T", "2T", "3T"]:
        tri_col  = ("tri_act" if "tri_act" in df_act.columns else "Trimestre" if "Trimestre" in df_act.columns else None)
        tipo_col = ("Tipo"    if "Tipo"    in df_act.columns else "tipo"      if "tipo"      in df_act.columns else None)
        if tri_col and tipo_col and not df_act.empty:
            mask = ((df_act[tri_col] == tri) & df_act["id_act"].notna() & (df_act["id_act"].astype(str).str.strip() != ""))
            tmp = df_act[mask].copy()
            if tipo_col != "Tipo":
                tmp = tmp.rename(columns={tipo_col: "Tipo"})
            acts_by_tri[tri] = tmp

    tipo_blocks = [[
        Paragraph("<b>Instrumentos de Evaluación</b>", smlB_center),
        Paragraph("<b>%</b>", smlB_center),
        Paragraph(f"<b>1T</b><br/>({pond_1t}%)", smlB_center),
        Paragraph(f"<b>2T</b><br/>({pond_2t}%)", smlB_center),
        Paragraph(f"<b>3T</b><br/>({pond_3t}%)", smlB_center),
        Paragraph("<b>Final</b><br/>(100%)", smlB_center)
    ]]

    nota_media_tri = {"1T": 0.0, "2T": 0.0, "3T": 0.0}
    suma_pesos_usados = {"1T": 0, "2T": 0, "3T": 0}

    for tipo in TIPOS_ORDEN:
        desc_tipo, peso_tipo = TIPO_MAP[tipo]
        
        tipo_cat_avgs = {"1T": "", "2T": "", "3T": ""}
        has_tipo_data = False
        
        ids_act_dict = {"1T": [], "2T": [], "3T": []}
        all_ids = []
        
        for tri in ["1T", "2T", "3T"]:
            ids_act = []
            if not acts_by_tri[tri].empty:
                ids_act = acts_by_tri[tri][acts_by_tri[tri]["Tipo"] == tipo]["id_act"].tolist()
                
            if tipo == "Tareas":
                cuaderno_col = f"{tri}_Cuaderno"
                if not df_eval.empty and cuaderno_col in df_eval.columns:
                    if cuaderno_col not in ids_act:
                        ids_act.append(cuaderno_col)
            
            ids_act_dict[tri] = ids_act
            for a in ids_act:
                if a not in all_ids: all_ids.append(a)
                
        # Calculate averages
        for tri in ["1T", "2T", "3T"]:
            cat_vals = []
            for act_id in ids_act_dict[tri]:
                val = None
                if act_id in df_eval.columns:
                    raw = df_eval.at[idx_ev, act_id]
                    if pd.notna(raw):
                        try: val = float(raw)
                        except: pass
                if val is not None:
                    cat_vals.append(val)
                    has_tipo_data = True
            
            if cat_vals:
                cat_avg = sum(cat_vals) / len(cat_vals)
                tipo_cat_avgs[tri] = f"{cat_avg:.1f}"
                nota_media_tri[tri] += cat_avg * (peso_tipo / 100.0)
                suma_pesos_usados[tri] += peso_tipo
                
        if has_tipo_data:
            # Final calculation for category
            fin_cat_sum = 0.0
            fin_pond_sum = 0.0
            for _tri in ["1T", "2T", "3T"]:
                if tipo_cat_avgs[_tri]:
                    c_val = float(tipo_cat_avgs[_tri])
                    fin_cat_sum += c_val * pond_map[_tri]
                    fin_pond_sum += pond_map[_tri]
            cat_final_str = ""
            if fin_pond_sum > 0:
                cat_final_str = f"{(fin_cat_sum / fin_pond_sum):.1f}"
                
            tipo_header = [
                Paragraph(f"<b>{desc_tipo}</b>", norm),
                Paragraph(f"<b>{peso_tipo}%</b>", normB_center),
                Paragraph(f"<b>{tipo_cat_avgs['1T']}</b>", normB_center) if tipo_cat_avgs['1T'] else "",
                Paragraph(f"<b>{tipo_cat_avgs['2T']}</b>", normB_center) if tipo_cat_avgs['2T'] else "",
                Paragraph(f"<b>{tipo_cat_avgs['3T']}</b>", normB_center) if tipo_cat_avgs['3T'] else "",
                Paragraph(f"<b>{cat_final_str}</b>", normB_center) if cat_final_str else ""
            ]
            tipo_blocks.append(tipo_header)

    # Add media row
    media_row = [Paragraph("<b>Medias trimestrales y final</b>", norm), ""]
    fin_avg_sum = 0.0
    fin_avg_pond_sum = 0.0
    for tri in ["1T", "2T", "3T"]:
        avg = nota_media_tri[tri] * (100.0 / suma_pesos_usados[tri]) if suma_pesos_usados[tri] > 0 else 0.0
        if suma_pesos_usados[tri] > 0:
            media_row.append(Paragraph(f"<b>{avg:.2f}</b>", normB_center))
            fin_avg_sum += avg * pond_map[tri]
            fin_avg_pond_sum += pond_map[tri]
        else:
            media_row.append("")
            
    final_fin_str = ""
    if fin_avg_pond_sum > 0:
        final_fin_str = f"{(fin_avg_sum / fin_avg_pond_sum):.2f}"
    media_row.append(Paragraph(f"<b>{final_fin_str}</b>", normB_center) if final_fin_str else "")
    tipo_blocks.append(media_row)

    t_unified = Table(tipo_blocks, colWidths=[6.0*cm, 1.5*cm, 2.5*cm, 2.5*cm, 2.5*cm, 3.0*cm], hAlign='LEFT')
    t_unified.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), colors.white),
        ("TEXTCOLOR",     (0, 0), (-1, 0), colors.black),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("LINEBELOW",     (0, 0), (-1, 0), 1.5, colors.HexColor("#222222")),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("BOX",           (0, 0), (-1, -1), 1.5, colors.HexColor("#222222")),
        ("GRID",          (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")),
        ("TOPPADDING",    (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("ALIGN",         (1, 0), (-1, -1), "CENTER"), # 1T, 2T, 3T centered
    ]))
    elements.append(t_unified)
    elements.append(Spacer(1, 10))


    doc.build(elements)
    buffer.seek(0)
    return buffer
