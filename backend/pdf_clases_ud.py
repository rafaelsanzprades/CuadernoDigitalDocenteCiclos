import io
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, portrait
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Table, TableStyle, Paragraph, PageBreak, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm

def _draw_page_decorations(canv, doc):
    canv.saveState()
    W, H = portrait(A4)
    
    canv.setFont("Helvetica-Bold", 10)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawCentredString(W / 2, H - 1.5 * cm, doc.cal_titulo)
    
    canv.setFont("Helvetica", 9)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawRightString(W - 1 * cm, 1 * cm, doc.cal_pie)
    canv.restoreState()

def generar_pdf_clases_ud(info_modulo, df_ud, df_sesiones):
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

    doc.cal_titulo = f"Clases por UD. {info_modulo.get('modulo', 'Módulo')}"
    doc.cal_pie = f"{info_modulo.get('centro', 'IES Andalán')} ({info_modulo.get('profesorado', 'Rafael Sanz Prades')})"

    frame = Frame(left_margin, bottom_margin, W - left_margin - right_margin, H - top_margin - bottom_margin, id='main')
    template = PageTemplate(id='clases_ud', frames=[frame], onPage=_draw_page_decorations)
    doc.addPageTemplates([template])

    elements = []
    
    style_normal = ParagraphStyle('Normal_Center', alignment=1, fontName='Helvetica', fontSize=8)
    style_normal_left = ParagraphStyle('Normal_Left', alignment=0, fontName='Helvetica', fontSize=8)
    style_normal_bold = ParagraphStyle('Normal_Bold', alignment=1, fontName='Helvetica-Bold', fontSize=9)
    style_header = ParagraphStyle('Header', alignment=1, fontName='Helvetica-Bold', fontSize=9)
    style_header_left = ParagraphStyle('Header_Left', alignment=0, fontName='Helvetica-Bold', fontSize=9)
    style_rec = ParagraphStyle('Recurso', alignment=2, fontName='Helvetica-Oblique', fontSize=8, textColor=colors.HexColor("#444444"), leading=10)

    # Ancho total: W - 1.5 - 1.0 = 21 - 2.5 = 18.5 cm
    # Cols: Nº, Horas, Tipo, RA/CE, Contenidos+Recursos, Aspectos Clave
    colWidths = [1.0*cm, 1.0*cm, 2.0*cm, 1.0*cm, 9.0*cm, 4.0*cm]

    if df_ud is not None and not df_ud.empty:
        # Sort UDs
        df_ud_sorted = df_ud.sort_values("id_ud") if "id_ud" in df_ud.columns else df_ud
        
        for i, row in df_ud_sorted.iterrows():
            ud_id = str(row.get("id_ud", ""))
            ud_desc = str(row.get("desc_ud", ""))
            
            # Tabla de sesiones
            # Row 0: Título de la UD
            t_data = [
                [f"{ud_id} - {ud_desc}", "", "", "", "", ""]
            ]
            row_heights = [1.2*cm, 0.8*cm]
            
            # Row 1: Cabeceras
            t_data.append([
                Paragraph("Nº", style_header),
                Paragraph("H.", style_header),
                Paragraph("Tipo", style_header),
                Paragraph("RA/CE", style_header),
                Paragraph("Programación (Contenidos). <i>Recursos</i>", style_header_left),
                Paragraph("Aspectos Clave", style_header)
            ])
            
            if df_sesiones is not None and not df_sesiones.empty:
                ud_sesiones = df_sesiones[df_sesiones["id_ud"] == ud_id]
                if "Num_Orden" in ud_sesiones.columns:
                    ud_sesiones = ud_sesiones.sort_values("Num_Orden")
                
                for _, s_row in ud_sesiones.iterrows():
                    num_orden = str(s_row.get("Num_Orden", ""))
                    horas = str(s_row.get("Horas", ""))
                    tipo = str(s_row.get("Tipo_Actividad", ""))
                    ra_ce = str(s_row.get("RA_CE", ""))
                    contenidos = str(s_row.get("Contenidos", ""))
                    aspectos = str(s_row.get("Aspectos_Clave", ""))
                    recursos = str(s_row.get("Recursos", ""))
                    
                    p_cont = Paragraph(contenidos, style_normal_left) if contenidos else Paragraph("-", style_normal_left)
                    if recursos:
                        cont_widget = [p_cont, Paragraph(recursos, style_rec)]
                    else:
                        cont_widget = p_cont
                    
                    t_data.append([
                        Paragraph(num_orden, style_normal_bold),
                        Paragraph(horas, style_normal),
                        Paragraph(tipo, style_normal_left),
                        Paragraph(ra_ce, style_normal_left),
                        cont_widget,
                        Paragraph(aspectos, style_normal_left)
                    ])
                    row_heights.append(None)
            
            if len(t_data) > 2:
                t = Table(t_data, colWidths=colWidths, rowHeights=row_heights, repeatRows=2)
                
                t.setStyle(TableStyle([
                    # Cabecera dinámica UD (Fila 0)
                    ('SPAN', (0,0), (-1,0)),
                    ('BACKGROUND', (0,0), (-1,0), colors.white),
                    ('TEXTCOLOR', (0,0), (-1,0), colors.black),
                    ('ALIGN', (0,0), (-1,0), 'CENTER'),
                    ('VALIGN', (0,0), (-1,0), 'MIDDLE'),
                    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0,0), (-1,0), 14),
                    ('LINEBELOW', (0,0), (-1,0), 1.5, colors.HexColor("#222222")),
                    
                    # Cabecera de columnas (Fila 1)
                    ('BACKGROUND', (0,1), (-1,1), colors.white),
                    ('TEXTCOLOR', (0,1), (-1,1), colors.black),
                    ('ALIGN', (0,1), (-1,1), 'CENTER'),
                    ('VALIGN', (0,1), (-1,1), 'MIDDLE'),
                    ('FONTNAME', (0,1), (-1,1), 'Helvetica-Bold'),
                    
                    # Estructura general de filas de datos
                    ('ALIGN', (0,2), (-1,-1), 'CENTER'),
                    ('VALIGN', (0,2), (-1,-1), 'TOP'),
                    ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#222222")),
                    ('GRID', (0,1), (-1,-1), 0.5, colors.HexColor("#bbbbbb")),
                    
                    # Columna Contenidos y Recursos. Justificada a la izquierda
                    ('ALIGN', (4,1), (4,-1), 'LEFT'),
                    ('LEFTPADDING', (4,1), (4,-1), 5),
                    ('RIGHTPADDING', (4,1), (4,-1), 5),
                    
                    # Columna 'Nº' y 'Horas' centradas y con fondo gris claro similar a 'Sem.' en seguimiento
                    ('BACKGROUND', (0,2), (1,-1), colors.HexColor("#f0f0f0")),
                    ('ALIGN', (0,2), (1,-1), 'CENTER'),
                ]))
                
                elements.append(t)
            else:
                elements.append(Paragraph(f"{ud_id} - {ud_desc}", ParagraphStyle('UD', fontName='Helvetica-Bold', fontSize=14)))
                elements.append(Spacer(1, 0.5 * cm))
                elements.append(Paragraph("No hay sesiones definidas para esta unidad didáctica.", style_normal_left))
            
            # Nueva página por cada UD diferente
            if i < len(df_ud_sorted) - 1:
                elements.append(PageBreak())

    else:
        elements.append(Paragraph("No hay unidades didácticas definidas.", style_normal_left))

    doc.build(elements)
    buffer.seek(0)
    return buffer
