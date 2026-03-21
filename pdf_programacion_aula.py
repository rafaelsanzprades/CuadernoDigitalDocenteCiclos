import io
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Table, TableStyle, Paragraph, PageBreak, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm

def _draw_page_decorations(canv, doc):
    canv.saveState()
    W, H = landscape(A4)
    # Header Title
    canv.setFont("Helvetica-Bold", 14)
    canv.setFillColor(colors.black)
    canv.drawCentredString(W / 2, H - 1.5 * cm, doc.cal_titulo)
    
    # Footer
    canv.setFont("Helvetica", 9)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawRightString(W - 1.5 * cm, 1 * cm, doc.cal_pie)
    canv.restoreState()

def generar_pdf_programacion_aula(info_modulo, config_aula, df_sesiones):
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

    doc.cal_titulo = "Organización, secuenciación y temporalización"
    doc.cal_pie = f"{info_modulo.get('centro', '')} ({info_modulo.get('profesorado', '')})"

    frame = Frame(margin, bottom_margin, W - 2*margin, H - top_margin - bottom_margin, id='main')
    template = PageTemplate(id='pag', frames=[frame], onPage=_draw_page_decorations)
    doc.addPageTemplates([template])

    elements = []
    
    style_normal = ParagraphStyle('Normal_Center', alignment=1, fontName='Helvetica', fontSize=9, leading=11)
    style_normal_left = ParagraphStyle('Normal_Left', alignment=0, fontName='Helvetica', fontSize=9, leading=11)

    # Ancho 27.7 cm disponible en Landscape A4 (29.7 - 2 cm margins).
    colWidths = [0.8*cm, 0.8*cm, 1.2*cm, 1.7*cm, 1.5*cm, 8.5*cm, 8.0*cm, 4.5*cm]
    
    t_data = [["Tª", "Pª", "IE", "RA/CE", "SESION", "CONTENIDOS", "ASPECTOS CLAVE", "RECURSOS"]]

    if df_sesiones.empty:
        t_data.append(["", "", "", "", "", "No hay sesiones registradas", "", ""])
    else:
        # Sort by Num_Sesion ensuring it handles integer conversion
        df_sorted = df_sesiones.copy()
        df_sorted["Num_Sesion_Int"] = pd.to_numeric(df_sorted["Num_Sesion"], errors='coerce').fillna(999)
        df_sorted = df_sorted.sort_values(by="Num_Sesion_Int")
        
        for _, row in df_sorted.iterrows():
            tipo_act = row.get("Tipo_Actividad", "")
            if not isinstance(tipo_act, str): tipo_act = ""
                
            ta_val = "X" if "Tª" in tipo_act else ""
            pa_val = "X" if "Pª" in tipo_act else ""
            ie_val = "X" if "IE" in tipo_act else ""
            
            ra_ce_val = str(row.get("RA_CE", "")).replace("nan", "")
            sesion_val = str(row.get("Num_Sesion", "")).replace("nan", "")
            contenidos_val = str(row.get("Contenidos", "")).replace("nan", "")
            aspectos_val = str(row.get("Aspectos_Clave", "")).replace("nan", "")
            recursos_val = str(row.get("Recursos", "")).replace("nan", "")

            # Adding spaces for aesthetic padding
            t_data.append([
                Paragraph(ta_val, style_normal),
                Paragraph(pa_val, style_normal),
                Paragraph(ie_val, style_normal),
                Paragraph(ra_ce_val, style_normal),
                Paragraph(sesion_val, style_normal),
                Paragraph(contenidos_val, style_normal_left),
                Paragraph(aspectos_val, style_normal_left),
                Paragraph(recursos_val, style_normal_left)
            ])

    t = Table(t_data, colWidths=colWidths, repeatRows=1)
    
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.white),
        ('TEXTCOLOR', (0,0), (-1,0), colors.black),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 10),
        
        ('ALIGN', (0,1), (4,-1), 'CENTER'),  # Center align for checkboxes, RA/CE and SESION
        ('ALIGN', (5,1), (-1,-1), 'LEFT'),   # Left align for texts
        
        ('BOX', (0,0), (-1,-1), 1.0, colors.black),
        ('GRID', (0,0), (-1,-1), 0.5, colors.black),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    
    elements.append(t)
    doc.build(elements)
    buffer.seek(0)
    return buffer
