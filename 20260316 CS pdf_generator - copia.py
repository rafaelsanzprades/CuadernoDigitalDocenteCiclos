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
    canv.setFont("Helvetica-Bold", 13)
    canv.setFillColor(colors.HexColor("#2f2f2f"))
    canv.drawCentredString(W / 2, H - 0.65 * cm, doc.cal_titulo)

    # ---- PIE: Referencia abajo a la derecha ----
    canv.setFont("Helvetica", 8)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawRightString(W - 1 * cm, 0.4 * cm, doc.cal_pie)

    canv.restoreState()


# ------------------------------------------------------------------ #
#  Función principal                                                  #
# ------------------------------------------------------------------ #
def generar_pdf_calendario(info_modulo, info_fechas, planning_ledger, calendar_notes):
    buffer = io.BytesIO()

    W, H = landscape(A4)
    margin = 1 * cm
    # Espacio extra arriba (cabecera) y abajo (pie) para no solapar
    top_margin    = 1.6 * cm
    bottom_margin = 0.9 * cm

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
    doc.cal_titulo = f"Calendario Académico {ini.year} – {fin.year}"
    doc.cal_pie    = f"{info_modulo.get('codigo', 'FPM-it-1-0237')} {info_modulo.get('centro', 'IES Andalán')} ({info_modulo.get('profesorado', 'Rafa Sanz')})"

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
    def get_cell_text(year, month, day):
        if day == 0:
            return ("", "", False)
        d_str = f"{day:02d}/{month:02d}/{year}"
        fecha_obj = date(year, month, day)
        es_festivo = fecha_obj.weekday() >= 5

        texto_plan = ""
        if calendar_notes.get(f"f_{d_str}"):
            texto_plan = calendar_notes.get(d_str, "F")[:18]
            es_festivo = True
        else:
            uds = planning_ledger.get(d_str, [])
            if uds:
                texto_plan = ", ".join(uds)[:20]

        return (f"{day:02d}", texto_plan, es_festivo)

    def get_month_grid(year, month):
        cal = calendar.monthcalendar(year, month)
        g_dias, g_plan, g_fest = [], [], []
        for week in cal:
            valid_day = next(d for d in week if d != 0)
            week_num  = date(year, month, valid_day).isocalendar()[1]
            fila_dias = [str(week_num)]
            fila_plan = [""]
            fila_fest = [False]
            for d in week:
                td, tp, ef = get_cell_text(year, month, d)
                fila_dias.append(td)
                fila_plan.append(tp)
                fila_fest.append(ef)
            g_dias.append(fila_dias)
            g_plan.append(fila_plan)
            g_fest.append(fila_fest)
        return g_dias, g_plan, g_fest

    # ---- Alturas fijas de fila ----
    ROW_MES   = 1.8 * cm   # Fila del nombre del mes  (≈ 3× la normal)
    ROW_HEAD  = 0.55 * cm  # Fila de Lun/Mar/Mié…
    ROW_DIAS  = 0.55 * cm  # Fila de números de día
    ROW_UD    = 1.0 * cm   # Fila de UD (≈ 2× la normal)

    # ---- Anchos de columnas ----
    colWidths = [1.4 * cm] + [3.75 * cm] * 7

    # ---- Construir tabla por mes ----
    for mes_idx, (year, month) in enumerate(meses_curso):
        g_dias, g_plan, g_fest = get_month_grid(year, month)
        num_weeks = len(g_dias)

        t_data = []

        # Fila 0 – nombre del mes
        t_data.append([f"{NOMBRE_MESES[month-1]}  {year}", "", "", "", "", "", "", ""])

        # Fila 1 – cabecera días
        t_data.append(["Sem", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"])

        # Filas de datos
        bg_colors = {}
        row_counter = 2
        for w in range(num_weeks):
            t_data.append(g_dias[w])
            for c in range(1, 8):
                if g_fest[w][c]:
                    bg_colors[(c, row_counter)] = colors.HexColor("#fdecea")
            row_counter += 1

            t_data.append(g_plan[w])
            for c in range(1, 8):
                if g_fest[w][c]:
                    bg_colors[(c, row_counter)] = colors.HexColor("#fdecea")
            row_counter += 1

        # Alturas: [mes, head, (dias, ud) × num_weeks]
        row_heights = [ROW_MES, ROW_HEAD]
        for _ in range(num_weeks):
            row_heights.append(ROW_DIAS)
            row_heights.append(ROW_UD)

        t = Table(t_data, colWidths=colWidths, rowHeights=row_heights)

        style_list = [
            # ---- Fila del mes ----
            ('SPAN',       (0, 0), (7, 0)),
            ('ALIGN',      (0, 0), (7, 0), 'CENTER'),
            ('VALIGN',     (0, 0), (7, 0), 'MIDDLE'),
            ('FONTNAME',   (0, 0), (7, 0), 'Helvetica-Bold'),
            ('FONTSIZE',   (0, 0), (7, 0), 22),          # 2× cabecera
            ('BACKGROUND', (0, 0), (7, 0), colors.HexColor("#2f2f2f")),
            ('TEXTCOLOR',  (0, 0), (7, 0), colors.white),

            # ---- Fila cabecera días ----
            ('ALIGN',      (0, 1), (-1, 1), 'CENTER'),
            ('VALIGN',     (0, 1), (-1, 1), 'MIDDLE'),
            ('FONTNAME',   (0, 1), (-1, 1), 'Helvetica-Bold'),
            ('FONTSIZE',   (0, 1), (-1, 1), 10),
            ('BACKGROUND', (0, 1), (7, 1), colors.HexColor("#e0e0e0")),

            # ---- Cuadrícula general ----
            ('GRID',       (0, 0), (-1, -1), 0.5, colors.HexColor("#bbbbbb")),

            # ---- Columna "Sem" ----
            ('BACKGROUND', (0, 2), (0, -1), colors.HexColor("#f5f5f5")),
            ('TEXTCOLOR',  (0, 2), (0, -1), colors.HexColor("#888888")),
            ('ALIGN',      (0, 2), (0, -1), 'CENTER'),
            ('VALIGN',     (0, 2), (0, -1), 'MIDDLE'),
            ('FONTSIZE',   (0, 2), (0, -1), 8),
        ]

        # ---- Estilos por fila de datos ----
        for r_idx in range(2, len(t_data)):
            if (r_idx - 2) % 2 == 0:
                # Fila de números de día
                style_list += [
                    ('FONTNAME', (1, r_idx), (-1, r_idx), 'Helvetica-Bold'),
                    ('FONTSIZE', (1, r_idx), (-1, r_idx), 11),
                    ('ALIGN',    (1, r_idx), (-1, r_idx), 'CENTER'),
                    ('VALIGN',   (1, r_idx), (-1, r_idx), 'MIDDLE'),
                    # Fusionar columna Sem verticalmente con la fila UD
                    ('SPAN',     (0, r_idx), (0, r_idx + 1)),
                ]
            else:
                # Fila de UD / planificación
                style_list += [
                    ('FONTNAME',  (1, r_idx), (-1, r_idx), 'Helvetica'),
                    ('FONTSIZE',  (1, r_idx), (-1, r_idx), 9),
                    ('TEXTCOLOR', (1, r_idx), (-1, r_idx), colors.HexColor("#0f4c75")),
                    ('ALIGN',     (1, r_idx), (-1, r_idx), 'CENTER'),
                    ('VALIGN',    (1, r_idx), (-1, r_idx), 'MIDDLE'),
                ]

        # ---- Colores de festivos ----
        for (col, row), color in bg_colors.items():
            style_list.append(('BACKGROUND', (col, row), (col, row), color))

        t.setStyle(TableStyle(style_list))
        elements.append(t)

        if mes_idx < len(meses_curso) - 1:
            elements.append(PageBreak())

    doc.build(elements)
    buffer.seek(0)
    return buffer
