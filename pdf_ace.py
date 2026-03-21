import io
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm

def _draw_page_decorations(canv, doc):
    canv.saveState()
    W, H = landscape(A4)
    canv.setFont("Helvetica-Bold", 14)
    canv.setFillColor(colors.black)
    canv.drawCentredString(W / 2, H - 1.5 * cm, doc.cal_titulo)
    canv.setFont("Helvetica", 9)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawRightString(W - 1.5 * cm, 1 * cm, doc.cal_pie)
    canv.restoreState()

def generar_pdf_ace(info_modulo, df_ace):
    buffer = io.BytesIO()
    W, H = landscape(A4)
    margin = 1.0 * cm
    top_margin = 2.0 * cm
    bottom_margin = 1.5 * cm

    doc = BaseDocTemplate(
        buffer, pagesize=landscape(A4),
        rightMargin=margin, leftMargin=margin,
        topMargin=top_margin, bottomMargin=bottom_margin,
    )

    doc.cal_titulo = "Actividades Complementarias y Extraescolares (ACE)"
    doc.cal_pie = f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})"

    frame = Frame(margin, bottom_margin, W - 2*margin, H - top_margin - bottom_margin, id='main')
    template = PageTemplate(id='pag', frames=[frame], onPage=_draw_page_decorations)
    doc.addPageTemplates([template])

    elements = []
    style_normal_center = ParagraphStyle('Normal_Center', alignment=1, fontName='Helvetica', fontSize=9, leading=11)
    style_normal_left = ParagraphStyle('Normal_Left', alignment=0, fontName='Helvetica', fontSize=9, leading=11)

    # Cols: "ID"(1.2) "Tipo"(2.8) "RA_Vinculados"(2.5) "Actividad"(9.0) "Trimestre"(1.5) "Entidad"(4.0) "Evaluacion"(6.0)
    colWidths = [1.2*cm, 2.8*cm, 2.5*cm, 9.0*cm, 1.5*cm, 4.0*cm, 6.0*cm]
    t_data = [["ID", "Tipo", "RA Vinc.", "Actividad y Descripción", "Tri.", "Entidad", "Evaluación"]]

    if getattr(df_ace, 'empty', True):
        t_data.append(["", "", "", "No hay actividades registradas", "", "", ""])
    else:
        for _, row in df_ace.iterrows():
            t_data.append([
                Paragraph(str(row.get("ID", "")).replace("nan", ""), style_normal_center),
                Paragraph(str(row.get("Tipo", "")).replace("nan", ""), style_normal_center),
                Paragraph(str(row.get("RA_Vinculados", "")).replace("nan", ""), style_normal_center),
                Paragraph(str(row.get("Actividad", "")).replace("nan", ""), style_normal_left),
                Paragraph(str(row.get("Trimestre", "")).replace("nan", ""), style_normal_center),
                Paragraph(str(row.get("Entidad", "")).replace("nan", ""), style_normal_left),
                Paragraph(str(row.get("Evaluacion", "")).replace("nan", ""), style_normal_left)
            ])

    t = Table(t_data, colWidths=colWidths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#262730")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOX', (0,0), (-1,-1), 1.0, colors.black),
        ('GRID', (0,0), (-1,-1), 0.5, colors.black),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    
    elements.append(t)
    doc.build(elements)
    buffer.seek(0)
    return buffer
