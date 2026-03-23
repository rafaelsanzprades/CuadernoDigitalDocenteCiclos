import io
import calendar
from datetime import date
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas as pdfcanvas

NOMBRE_MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

# ------------------------------------------------------------------ #
#  Función que se llama en CADA página para dibujar cabecera y pie   #
# ------------------------------------------------------------------ #
def _draw_page_decorations(canv, doc):
    canv.saveState()
    W, H = landscape(A4)

    # ---- CABECERA: Título centrado ----
    canv.setFont("Helvetica-Bold", 10)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawCentredString(W / 2, H - 1.5 * cm, doc.cal_titulo)

    # ---- PIE: Referencia abajo a la derecha ----
    canv.setFont("Helvetica", 9)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawRightString(W - 1 * cm, 1 * cm, doc.cal_pie)

    canv.restoreState()

# ------------------------------------------------------------------ #
#  Función principal                                                  #
# ------------------------------------------------------------------ #
def generar_pdf_calendario(info_modulo, info_fechas, planning_ledger, calendar_notes):
    buffer = io.BytesIO()

    W, H = landscape(A4)
    margin = 2 * cm
    # Espacio extra arriba (cabecera) y abajo (pie) para no solapar
    top_margin    = 2 * cm
    bottom_margin = 2 * cm

    doc = BaseDocTemplate(
        buffer,
        pagesize=landscape(A4),
        rightMargin=margin, leftMargin=margin,
        topMargin=top_margin, bottomMargin=bottom_margin,
    )

    # Guardamos los textos de cabecera/pie como atributos del doc para
    # que la función de decoración pueda acceder a ellos
    ini = info_fechas.get("ini_1t", date(2025, 9, 1))
    fin = info_fechas.get("fin_3t", date(2026, 6, 30))
    ini_feoe = info_fechas.get("ini_feoe", date(2026, 3, 16))
    fin_feoe = info_fechas.get("fin_feoe", date(2026, 5, 29))
    
    doc.cal_titulo = f"Calendario Académico {ini.year} – {fin.year}. {info_modulo.get('modulo', 'Módulo')}"
    doc.cal_pie    = f"{info_modulo.get('centro', 'IES Andalán')} ({info_modulo.get('profesorado', 'Rafael Sanz Prades')})"

    frame = Frame(margin, bottom_margin, W - 2*margin, H - top_margin - bottom_margin, id='main')
    template = PageTemplate(id='cal', frames=[frame], onPage=_draw_page_decorations)
    doc.addPageTemplates([template])

    elements = []

    # ---- Meses del curso ----
    start_date = ini.replace(day=1)
    meses_curso = []
    curr = start_date
    while curr <= fin:
        meses_curso.append((curr.year, curr.month))
        if curr.month == 12:
            curr = curr.replace(year=curr.year + 1, month=1, day=1)
        else:
            curr = curr.replace(month=curr.month + 1, day=1)

    # ---- Funciones auxiliares ----
    def get_cell_data(year, month, day):
        if day == 0:
            return ("", "", "", "", False, "")
        
        d_str = f"{day:02d}/{month:02d}/{year}"
        fecha_obj = date(year, month, day)
        es_finde = fecha_obj.weekday() >= 5
        
        # Festivos
        desc_festivo = calendar_notes.get(f"f_{d_str}", "").strip()
        es_festivo = es_finde or bool(desc_festivo)
        
        # UD
        uds = planning_ledger.get(d_str, [])
        texto_ud = ", ".join(uds)[:20] if uds else ""
        
        # Relevantes
        desc_rel = calendar_notes.get(f"r_{d_str}", "").strip()[:30]
        
        # FEOE: auto-calculado basado en el rango global, sin fines de semana
        desc_feoe = "FEOE" if (ini_feoe <= fecha_obj <= fin_feoe and not es_finde) else ""
        
        texto_plan_ud = texto_ud
            
        texto_plan_rel = desc_rel
        
        return (f"{day:02d}", texto_plan_ud[:30], texto_plan_rel, desc_festivo[:30], es_festivo, desc_feoe)

    def build_day_cell(td, tfeoe, is_weekend):
        if not td: return ""
        if is_weekend:
            style = ParagraphStyle(name='W', alignment=0, fontSize=16, fontName='Helvetica-Bold', textColor=colors.black)
            return Paragraph(td, style)
            
        inner_t = Table([[td, tfeoe]], colWidths=[2.2*cm, 2.2*cm], rowHeights=[0.7*cm])
        inner_t.setStyle(TableStyle([
            ('ALIGN', (0,0), (0,0), 'LEFT'),
            ('ALIGN', (1,0), (1,0), 'RIGHT'),
            ('VALIGN', (0,0), (1,0), 'MIDDLE'),
            ('FONTNAME', (0,0), (0,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (0,0), 16),
            ('TEXTCOLOR', (0,0), (1,0), colors.black),
            ('FONTNAME', (1,0), (1,0), 'Helvetica'),
            ('FONTSIZE', (1,0), (1,0), 9),
            ('LEFTPADDING', (0,0), (-1,-1), 2),
            ('RIGHTPADDING', (0,0), (-1,-1), 2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
        ]))
        return inner_t

    def get_month_grid(year, month):
        cal = calendar.monthcalendar(year, month)
        g_dias, g_ud, g_rel, g_fest, g_fest_desc = [], [], [], [], []
        for week in cal:
            valid_day = next(d for d in week if d != 0)
            week_num  = date(year, month, valid_day).isocalendar()[1]
            
            fila_dias = [str(week_num)]
            fila_ud   = [""]
            fila_rel  = [""]
            fila_fest = [False]
            fila_fest_desc = [""]
            
            for col_idx, d in enumerate(week):
                td, tud, trel, tfest_desc, ef, tfeoe = get_cell_data(year, month, d)
                is_weekend = (col_idx >= 5)
                fila_dias.append(build_day_cell(td, tfeoe, is_weekend) if td else "")
                fila_ud.append(tud)
                fila_rel.append(trel)
                fila_fest.append(ef)
                fila_fest_desc.append(tfest_desc)
                
            g_dias.append(fila_dias)
            g_ud.append(fila_ud)
            g_rel.append(fila_rel)
            g_fest.append(fila_fest)
            g_fest_desc.append(fila_fest_desc)
            
        return g_dias, g_ud, g_rel, g_fest, g_fest_desc

    # ---- Alturas fijas de fila ----
    ROW_MES   = 2.5 * cm  # Fila del nombre del mes  (≈ 3× la normal)
    ROW_HEAD  = 0.7 * cm  # Fila de Lun/Mar/Mié…
    ROW_DIAS  = 0.7 * cm  # Fila de números de día
    ROW_UD    = 0.7 * cm  # Fila de UD / FEOE
    ROW_REL   = 0.7 * cm  # Fila de Fechas Relevantes

    # ---- Anchos de columnas ----
    colWidths = [1.5 * cm] + [4.75 * cm] * 5 + [1.5 * cm] * 2

    # ---- Construir tabla por mes ----
    for mes_idx, (year, month) in enumerate(meses_curso):
        g_dias, g_ud, g_rel, g_fest, g_fest_desc = get_month_grid(year, month)
        num_weeks = len(g_dias)

        t_data = []

        # Fila 0 – nombre del mes
        t_data.append([f"{NOMBRE_MESES[month-1]}  {year}", "", "", "", "", "", "", ""])

        # Fila 1 – cabecera días
        t_data.append(["Sem.", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sáb.", "Dom."])

        # Filas de datos
        bg_colors = {}
        row_counter = 2
        dynamic_styles = []
        
        for w in range(num_weeks):
            t_data.append(g_dias[w])
            
            ud_row = list(g_ud[w])
            rel_row = list(g_rel[w])
            
            for c in range(1, 8):
                if g_fest[w][c]:
                    bg_colors[(c, row_counter)] = colors.HexColor("#fdecea")
                    bg_colors[(c, row_counter+1)] = colors.HexColor("#fdecea")
                    bg_colors[(c, row_counter+2)] = colors.HexColor("#fdecea")
                    
                    dynamic_styles.append(('SPAN', (c, row_counter+1), (c, row_counter+2)))
                    
                    ud_row[c] = g_fest_desc[w][c]
                    rel_row[c] = ""
                    
                    dynamic_styles.append(('TEXTCOLOR', (c, row_counter+1), (c, row_counter+1), colors.black))
                    dynamic_styles.append(('FONTNAME', (c, row_counter+1), (c, row_counter+1), 'Helvetica-Bold'))
                    dynamic_styles.append(('FONTSIZE', (c, row_counter+1), (c, row_counter+1), 9))
                    
            t_data.append(ud_row)
            t_data.append(rel_row)
            row_counter += 3

        # Alturas: [mes, head, (dias, ud, rel) × num_weeks]
        row_heights = [ROW_MES, ROW_HEAD]
        for _ in range(num_weeks):
            row_heights.extend([ROW_DIAS, ROW_UD, ROW_REL])

        t = Table(t_data, colWidths=colWidths, rowHeights=row_heights)

        style_list = [
            # ---- Fila del mes ----
            ('SPAN',       (0, 0), (7, 0)),
            ('ALIGN',      (0, 0), (7, 0), 'CENTER'),
            ('VALIGN',     (0, 0), (7, 0), 'MIDDLE'),
            ('FONTNAME',   (0, 0), (7, 0), 'Helvetica-Bold'),
            ('FONTSIZE',   (0, 0), (7, 0), 22),          # 2× cabecera
            ('BACKGROUND', (0, 0), (7, 0), colors.white),
            ('TEXTCOLOR',  (0, 0), (7, 0), colors.black),

            # ---- Fila cabecera días ----
            ('ALIGN',      (0, 1), (-1, 1), 'CENTER'),
            ('VALIGN',     (0, 1), (-1, 1), 'MIDDLE'),
            ('FONTNAME',   (0, 1), (-1, 1), 'Helvetica-Bold'),
            ('FONTSIZE',   (0, 1), (-1, 1), 10),
            ('BACKGROUND', (0, 1), (7, 1), colors.HexColor("#e0e0e0")),
            ('TEXTCOLOR',  (0, 1), (-1, 1), colors.black),

            # ---- Cuadrícula general ----
            ('BOX',       (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")),
            ('LINEAFTER', (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")),
            ('LINEBELOW', (0, 0), (-1, 1), 0.5, colors.HexColor("#bbbbbb")),

            # ---- Columna "Sem" ----
            ('BACKGROUND', (0, 2), (0, -1), colors.HexColor("#f5f5f5")),
            ('TEXTCOLOR',  (0, 2), (0, -1), colors.black),
            ('ALIGN',      (0, 2), (0, -1), 'CENTER'),
            ('VALIGN',     (0, 2), (0, -1), 'MIDDLE'),
            ('FONTNAME',   (0, 2), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE',   (0, 2), (0, -1), 16),
        ]

        # ---- Estilos por fila de datos ----
        for r_idx in range(2, len(t_data), 3):
            # Fila de números de día
            style_list += [
                ('ALIGN',    (1, r_idx), (-1, r_idx), 'CENTER'),
                ('VALIGN',   (1, r_idx), (-1, r_idx), 'MIDDLE'),
                # Fusionar columna Sem verticalmente con las dos filas debajo
                ('SPAN',     (0, r_idx), (0, r_idx + 2)),
            ]
            
            # Fila de UD / FEOE
            style_list += [
                ('FONTNAME',  (1, r_idx+1), (-1, r_idx+1), 'Helvetica'),
                ('FONTSIZE',  (1, r_idx+1), (-1, r_idx+1), 9),
                ('TEXTCOLOR', (1, r_idx+1), (-1, r_idx+1), colors.black),
                ('ALIGN',     (1, r_idx+1), (-1, r_idx+1), 'CENTER'),
                ('VALIGN',    (1, r_idx+1), (-1, r_idx+1), 'MIDDLE'),
            ]

            # Fila de Relevante
            style_list += [
                ('FONTNAME',  (1, r_idx+2), (-1, r_idx+2), 'Helvetica-Oblique'),
                ('FONTSIZE',  (1, r_idx+2), (-1, r_idx+2), 8),
                ('TEXTCOLOR', (1, r_idx+2), (-1, r_idx+2), colors.black),
                ('ALIGN',     (1, r_idx+2), (-1, r_idx+2), 'CENTER'),
                ('VALIGN',    (1, r_idx+2), (-1, r_idx+2), 'MIDDLE'),
                # Línea divisoria de semana separando bloques diarios
                ('LINEBELOW', (0, r_idx+2), (-1, r_idx+2), 0.5, colors.HexColor("#bbbbbb")),
            ]

        # ---- Colores de festivos y configuraciones dinámicas ----
        for (col, row), color in bg_colors.items():
            style_list.append(('BACKGROUND', (col, row), (col, row), color))
            
        style_list.extend(dynamic_styles)

        t.setStyle(TableStyle(style_list))
        elements.append(t)

        if mes_idx < len(meses_curso) - 1:
            elements.append(PageBreak())

    doc.build(elements)
    buffer.seek(0)
    return buffer
