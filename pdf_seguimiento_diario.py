import io
import streamlit as st
from datetime import timedelta
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, portrait
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Table, TableStyle, Paragraph, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm

NOMBRE_MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

def _draw_page_decorations(canv, doc):
    canv.saveState()
    W, H = portrait(A4)
    # The title inside the page is now omitted because the Month is in the table itself.
    # But we can keep a general document header or leave it blank. 
    # Let's keep a tiny top-header with the Document Name
    canv.setFont("Helvetica-Bold", 10)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawCentredString(W / 2, H - 1.5 * cm, doc.cal_titulo)
    
    canv.setFont("Helvetica", 9)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawRightString(W - 1 * cm, 1 * cm, doc.cal_pie)
    canv.restoreState()

@st.cache_data
def generar_pdf_seguimiento(info_modulo, info_fechas, horario, planning_ledger, calendar_notes, df_sesiones=None):
    buffer = io.BytesIO()
    W, H = portrait(A4)
    left_margin = 2.0 * cm
    right_margin = 1.0 * cm
    top_margin = 2.0 * cm
    bottom_margin = 1.5 * cm

    doc = BaseDocTemplate(
        buffer, pagesize=portrait(A4),
        rightMargin=right_margin, leftMargin=left_margin,
        topMargin=top_margin, bottomMargin=bottom_margin,
    )

    doc.cal_titulo = f"Seguimiento diario. {info_modulo.get('modulo', 'Módulo')}"
    doc.cal_pie = f"{info_modulo.get('centro', 'IES Andalán')} ({info_modulo.get('profesorado', 'Rafael Sanz Prades')})"

    frame = Frame(left_margin, bottom_margin, W - left_margin - right_margin, H - top_margin - bottom_margin, id='main')
    template = PageTemplate(id='seg', frames=[frame], onPage=_draw_page_decorations)
    doc.addPageTemplates([template])

    dias_semana_list = ["Lun", "Mar", "Mié", "Jue", "Vie"]
    lectivos_por_mes = {}
    
    feoe_ini = info_fechas.get("ini_feoe")
    feoe_fin = info_fechas.get("fin_feoe")
    
    dias_validos = []
    for tri in ["1t", "2t", "3t"]:
        ini_t = info_fechas.get(f"ini_{tri}")
        fin_t = info_fechas.get(f"fin_{tri}")
        if ini_t and fin_t:
            curr = ini_t
            while curr <= fin_t:
                # Se incluyen todos los días de L-V que tengan configuradas horas de clase, incluso festivos
                if curr.weekday() < 5:
                    h_dia = horario.get(dias_semana_list[curr.weekday()], 0)
                    if h_dia > 0:
                        dias_validos.append(curr)
                curr += timedelta(days=1)
                
    dias_validos = sorted(list(set(dias_validos)))
    
    import pandas as pd
    ud_session_tracker = {}
    if df_sesiones is not None and not df_sesiones.empty:
        if "Num_Orden" not in df_sesiones.columns and "Num_Sesion" in df_sesiones.columns:
            df_sesiones = df_sesiones.rename(columns={"Num_Sesion": "Num_Orden"})
        for ud_id, g in df_sesiones.groupby("id_ud"):
            ses_list = []
            if "Num_Orden" in df_sesiones.columns:
                g = g.sort_values("Num_Orden")
            for _, r in g.iterrows():
                h = int(pd.to_numeric(r.get("Horas", 1), errors="coerce")) if pd.notna(r.get("Horas", 1)) else 1
                if h < 1: h = 1
                ses_list.append({
                    "h_rem": h,
                    "cont": str(r.get("Contenidos", "")).strip(),
                    "rec": str(r.get("Recursos", "")).strip()
                })
            ud_session_tracker[str(ud_id)] = ses_list
    
    for d in dias_validos:
        m_key = (d.year, d.month)
        if m_key not in lectivos_por_mes:
            lectivos_por_mes[m_key] = []
        lectivos_por_mes[m_key].append(d)

    elements = []
    style_normal = ParagraphStyle('Normal_Center', alignment=1, fontName='Helvetica', fontSize=9)
    style_normal_left = ParagraphStyle('Normal_Left', alignment=0, fontName='Helvetica', fontSize=9)
    style_normal_bold = ParagraphStyle('Normal_Bold', alignment=1, fontName='Helvetica-Bold', fontSize=10)
    # Festivo: alineación izquierda (0) con margen
    style_festivo = ParagraphStyle('Festivo', alignment=0, fontName='Helvetica-Oblique', fontSize=10, textColor=colors.HexColor("#7a3535"))
    style_header_left = ParagraphStyle('Header_Left', alignment=0, fontName='Helvetica-Bold', fontSize=10)

    # Ancho 18 cm
    colWidths = [1.0*cm, 1.5*cm, 1.0*cm, 1.0*cm, 2.0*cm, 9.0*cm, 2.5*cm]
    meses_keys = sorted(lectivos_por_mes.keys())
    
    for idx, (year, month) in enumerate(meses_keys):
        dias_mes = lectivos_por_mes[(year, month)]
        
        # Row 0: Mes
        t_data = [[f"{NOMBRE_MESES[month-1]} {year}", "", "", "", "", "", ""]]
        # Row 1: Cabeceras
        t_data.append(["Sem.", "Fecha", "Día", "H.", "UD/FEOE", Paragraph("Programación (y seguimiento). <i>Recursos</i>", style_header_left), "Relevantes"])
        row_heights = [1.2*cm, 0.8*cm]
        
        festivos_count = sum(1 for d in dias_mes if calendar_notes.get(f"f_{d.strftime('%d/%m/%Y')}", "").strip())
        normal_count = len(dias_mes) - festivos_count
        
        # A4 portrait yields approx 24.5cm table height (29.7 - 2(top) - 1.5(bot) - ~1.5(headers leeway)).
        # we pre-assign 2cm for headers
        holiday_h = 0.6 * cm
        if normal_count > 0:
            row_h = min(1.4 * cm, max(0.8 * cm, (23.5 * cm - festivos_count * holiday_h) / normal_count))
        else:
            row_h = 1.0 * cm
            
        current_week = None
        week_start_row = 2
        span_styles = []
        line_styles = []
        bg_styles = []

        row_idx = 2
        for d in dias_mes:
            d_str = d.strftime("%d/%m/%Y")
            week_num = d.isocalendar()[1]
            
            if current_week is None:
                current_week = week_num
                week_start_row = row_idx
            elif current_week != week_num:
                span_styles.append(('SPAN', (0, week_start_row), (0, row_idx - 1)))
                line_styles.append(('LINEBELOW', (0, row_idx - 1), (-1, row_idx - 1), 1.5, colors.HexColor("#222222")))
                
                current_week = week_num
                week_start_row = row_idx
                
            dia_texto = dias_semana_list[d.weekday()]
            horas = str(int(horario.get(dia_texto, 0)))
            festivo = calendar_notes.get(f"f_{d_str}", "").strip()
            relevante = calendar_notes.get(f"r_{d_str}", "").strip()
            uds = planning_ledger.get(d_str, [])
            
            es_feoe = (feoe_ini and feoe_fin and feoe_ini <= d <= feoe_fin)
            
            # UD/FEOE logic
            ud_feoe_hitos = []
            if uds: ud_feoe_hitos.extend(uds)
            if es_feoe: ud_feoe_hitos.append("FEOE")
            ud_feoe_texto = " / ".join(ud_feoe_hitos)
            
            if festivo:
                seg_widget = Paragraph(f"<b>Festivo: {festivo.upper()}</b>", style_festivo)
                ud_feoe_texto = "-" 
                horas = "-"
                relevante = "-"
                row_heights.append(holiday_h)
                bg_styles.append(('BACKGROUND', (0, row_idx), (-1, row_idx), colors.HexColor("#fceaea")))
                bg_styles.append(('VALIGN', (5, row_idx), (5, row_idx), 'MIDDLE')) # Centrado en altura para el festivo
            else:
                horas_dia = int(horario.get(dia_texto, 0))
                seg_widget = ""
                if uds and uds[0] in ud_session_tracker and ud_session_tracker[uds[0]] and horas_dia > 0:
                    ud_act = uds[0]
                    ses = ud_session_tracker[ud_act][0]
                    cont = ses["cont"]
                    rec = ses["rec"]
                    
                    h_a_consumir = horas_dia
                    while h_a_consumir > 0 and ud_session_tracker[ud_act]:
                        s = ud_session_tracker[ud_act][0]
                        if s["h_rem"] > h_a_consumir:
                            s["h_rem"] -= h_a_consumir
                            h_a_consumir = 0
                        else:
                            h_a_consumir -= s["h_rem"]
                            ud_session_tracker[ud_act].pop(0)

                    p_cont = Paragraph(cont, style_normal_left) if cont else Paragraph("-", style_normal_left)
                    if rec:
                        style_rec = ParagraphStyle('Recurso', alignment=2, fontName='Helvetica-Oblique', fontSize=8, textColor=colors.HexColor("#444444"), leading=10)
                        seg_widget = [p_cont, Paragraph(rec, style_rec)]
                    else:
                        seg_widget = p_cont

                row_heights.append(row_h)
                
            sem_texto = str(week_num) if row_idx == week_start_row else ""
            
            t_data.append([
                Paragraph(sem_texto, style_normal_bold),
                Paragraph(f"{d.day:02d}/{d.month:02d}", style_normal),
                Paragraph(dia_texto, style_normal),
                Paragraph(horas, style_normal),
                Paragraph(ud_feoe_texto, style_normal),
                seg_widget,
                Paragraph(relevante, style_normal)
            ])
            row_idx += 1
            
        if dias_mes:
            span_styles.append(('SPAN', (0, week_start_row), (0, row_idx - 1)))
            line_styles.append(('LINEBELOW', (0, row_idx - 1), (-1, row_idx - 1), 1.5, colors.HexColor("#222222")))

        t = Table(t_data, colWidths=colWidths, rowHeights=row_heights)
        
        base_style = [
            # Cabecera dinámica Mes (Fila 0)
            ('SPAN', (0,0), (-1,0)),
            ('BACKGROUND', (0,0), (-1,0), colors.white),
            ('TEXTCOLOR', (0,0), (-1,0), colors.black),
            ('ALIGN', (0,0), (-1,0), 'CENTER'),
            ('VALIGN', (0,0), (-1,0), 'MIDDLE'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 16),
            ('LINEBELOW', (0,0), (-1,0), 1.5, colors.HexColor("#222222")),
            
            # Cabecera de columnas (Fila 1)
            ('BACKGROUND', (0,1), (-1,1), colors.white),
            ('TEXTCOLOR', (0,1), (-1,1), colors.black),
            ('ALIGN', (0,1), (-1,1), 'CENTER'),
            ('VALIGN', (0,1), (-1,1), 'MIDDLE'),
            ('FONTNAME', (0,1), (-1,1), 'Helvetica-Bold'),
            ('FONTSIZE', (0,1), (-1,1), 10),
            
            # Estructura general de filas de datos
            ('ALIGN', (0,2), (-1,-1), 'CENTER'),
            ('VALIGN', (0,2), (-1,-1), 'MIDDLE'),
            ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#222222")),
            ('GRID', (0,1), (-1,-1), 0.5, colors.HexColor("#bbbbbb")),
            
            # Columna 'Semana'
            ('BACKGROUND', (0,2), (0,-1), colors.HexColor("#f0f0f0")),
            ('VALIGN', (0,2), (0,-1), 'MIDDLE'),

            # Columna Seguimiento. Justificada a la izquierda
            ('ALIGN', (5,1), (5,-1), 'LEFT'), # Cabecera y contenido
            ('VALIGN', (5,2), (5,-1), 'TOP'), # Contenido arriba por defecto para escritura manual
            ('LEFTPADDING', (5,1), (5,-1), 5),
            ('TOPPADDING', (5,2), (5,-1), 5),
            ('BOTTOMPADDING', (5,2), (5,-1), 5),
        ]
        
        t.setStyle(TableStyle(base_style + span_styles + line_styles + bg_styles))
        
        elements.append(t)
        if idx < len(meses_keys) - 1:
            elements.append(PageBreak())
            
    doc.build(elements)
    buffer.seek(0)
    return buffer
