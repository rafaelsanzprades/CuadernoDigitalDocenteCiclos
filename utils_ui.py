def badge(diff, valor_real, unidad="", invert=False):
    if diff == 0:
        col, bg, ico = "#000000", "#00ff00", "✓"
        txt = f"{ico} ¡Ok! {valor_real}{unidad}"
    elif diff > 0:  # exceso
        if invert:  # más horas UDs que lectivas → rojo (no caben)
            col, bg, ico = "#ffffff", "#ff0000", "▲"
        else:
            col, bg, ico = "#000000", "#ffff00", "▲"
        txt = f"{ico} +{diff}{unidad}"
    else:           # déficit
        if invert:  # menos horas UDs que lectivas → amarillo (sobra tiempo, pero se puede dar)
            col, bg, ico = "#000000", "#ffff00", "▼"
        else:
            col, bg, ico = "#ffffff", "#ff0000", "▼"
        txt = f"{ico} {diff}{unidad}"
    return (
        f'<div style="background:{bg};color:{col};border:1px solid {col}55;'
        f'border-radius:5px;padding:2px 8px;font-size:1rem;font-weight:700;'
        f'text-align:center;line-height:2.0;margin-top:6px;white-space:nowrap;">'
        f'{txt}</div>'
    )
