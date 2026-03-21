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

def generar_pdf_dua(info_modulo, df_dua):
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

    doc.cal_titulo = "Medidas de Respuesta Educativa para la Inclusión (DUA)"
    doc.cal_pie = f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})"

    frame = Frame(margin, bottom_margin, W - 2*margin, H - top_margin - bottom_margin, id='main')
    template = PageTemplate(id='pag', frames=[frame], onPage=_draw_page_decorations)
    doc.addPageTemplates([template])

    elements = []
    style_nc = ParagraphStyle('Normal_Center', alignment=1, fontName='Helvetica', fontSize=9, leading=11)
    style_nl = ParagraphStyle('Normal_Left', alignment=0, fontName='Helvetica', fontSize=9, leading=11)

    # Columns: "ID"(1.2) "Alumnado_Aula"(3.5) "Barrera"(4.0) "Medida_Metodologica"(7.0) "Medida_Acceso"(6.0) "Medida_Evaluacion"(5.3) Total=27.0
    colWidths = [1.2*cm, 3.5*cm, 4.0*cm, 7.0*cm, 6.0*cm, 5.3*cm]
    t_data = [["ID", "Alumnado / Aula", "Barrera Detectada", "Medidas Metodológicas y de Organización", "Medidas de Acceso", "Ajustes de Evaluación"]]

    if getattr(df_dua, 'empty', True):
        t_data.append(["", "", "No hay adaptaciones registradas", "", "", ""])
    else:
        for _, row in df_dua.iterrows():
            t_data.append([
                Paragraph(str(row.get("ID", "")).replace("nan", ""), style_nc),
                Paragraph(str(row.get("Alumnado_Aula", "")).replace("nan", ""), style_nc),
                Paragraph(str(row.get("Barrera", "")).replace("nan", ""), style_nl),
                Paragraph(str(row.get("Medida_Metodologica", "")).replace("nan", ""), style_nl),
                Paragraph(str(row.get("Medida_Acceso", "")).replace("nan", ""), style_nl),
                Paragraph(str(row.get("Medida_Evaluacion", "")).replace("nan", ""), style_nl)
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
