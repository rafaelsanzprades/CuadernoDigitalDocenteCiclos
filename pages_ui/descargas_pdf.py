import streamlit as st
import pandas as pd
from pdf_calendario_academico import generar_pdf_calendario
from pdf_seguimiento_diario import generar_pdf_seguimiento
from pdf_boletin_grupal import generar_pdf_boletin_grupal, generar_pdf_boletin_grupal_final
from pdf_boletin_individual import generar_pdf_boletin_individual

def render_descargas_pdf(ro_pd, ro_curso, ro_global):
    st.markdown("## 📥 Centro de Descargas PDF")
    st.markdown("Genera y descarga los documentos oficiales de tu cuaderno digital.")
    st.divider()

    st.markdown("### 📅 Documentos de Planificación")
    
    with st.container(border=True):
        c1, c2 = st.columns([3, 1], vertical_alignment="center")
        with c1:
            st.markdown("#### 📆 Calendario Académico")
            st.markdown("<span style='color:#a3a8b8; font-size: 0.9em;'>Vista global del curso con fechas, sesiones y eventos.</span>", unsafe_allow_html=True)
        with c2:
            if st.button("Generar PDF Calendario", use_container_width=True):
                pdf_buffer_cal = generar_pdf_calendario(
                    st.session_state.info_modulo,
                    st.session_state.info_fechas,
                    st.session_state.planning_ledger,
                    st.session_state.calendar_notes
                )
                st.download_button(
                    label="📥 Descargar Calendario",
                    data=pdf_buffer_cal,
                    file_name=f"Calendario_{st.session_state.info_modulo.get('modulo', 'Gestor')}.pdf",
                    mime="application/pdf",
                    type="primary",
                    use_container_width=True
                )

    with st.container(border=True):
        c1, c2 = st.columns([3, 1], vertical_alignment="center")
        with c1:
            st.markdown("#### 📝 Seguimiento Diario")
            st.markdown("<span style='color:#a3a8b8; font-size: 0.9em;'>Registro detallado de la planificación del día a día.</span>", unsafe_allow_html=True)
        with c2:
            if st.button("Generar Seguimiento Diario", use_container_width=True):
                pdf_buffer_seg = generar_pdf_seguimiento(
                    st.session_state.info_modulo,
                    st.session_state.info_fechas,
                    st.session_state.horario,
                    st.session_state.planning_ledger,
                    st.session_state.calendar_notes,
                    st.session_state.df_sesiones if "df_sesiones" in st.session_state else None
                )
                st.download_button(
                    label="📥 Descargar Seguimiento",
                    data=pdf_buffer_seg,
                    file_name=f"Seguimiento_diario_{st.session_state.info_modulo.get('modulo', 'Gestor')}.pdf",
                    mime="application/pdf",
                    type="primary",
                    use_container_width=True
                )

    st.write("")
    st.markdown("### 📊 Boletines de Calificaciones Grupales")
    _mod_name = st.session_state.info_modulo.get('modulo', 'Grupo')

    with st.container(border=True):
        c1, c2 = st.columns([3, 1], vertical_alignment="center")
        with c1:
            st.markdown("#### 👥 1er Trimestre")
            st.markdown("<span style='color:#a3a8b8; font-size: 0.9em;'>Boletín de evaluación grupal para el primer trimestre.</span>", unsafe_allow_html=True)
        with c2:
            if st.button("Generar 1T", use_container_width=True):
                pdf_1t = generar_pdf_boletin_grupal("1T", st.session_state.info_modulo, st.session_state.df_al, st.session_state.df_eval, st.session_state.df_act)
                st.download_button("📥 Descargar 1T", pdf_1t, f"Boletin_Grupal_1T_{_mod_name}.pdf", "application/pdf", type="primary", use_container_width=True)

    with st.container(border=True):
        c1, c2 = st.columns([3, 1], vertical_alignment="center")
        with c1:
            st.markdown("#### 👥 2º Trimestre")
            st.markdown("<span style='color:#a3a8b8; font-size: 0.9em;'>Boletín de evaluación grupal para el segundo trimestre.</span>", unsafe_allow_html=True)
        with c2:
            if st.button("Generar 2T", use_container_width=True):
                pdf_2t = generar_pdf_boletin_grupal("2T", st.session_state.info_modulo, st.session_state.df_al, st.session_state.df_eval, st.session_state.df_act)
                st.download_button("📥 Descargar 2T", pdf_2t, f"Boletin_Grupal_2T_{_mod_name}.pdf", "application/pdf", type="primary", use_container_width=True)

    with st.container(border=True):
        c1, c2 = st.columns([3, 1], vertical_alignment="center")
        with c1:
            st.markdown("#### 👥 3er Trimestre")
            st.markdown("<span style='color:#a3a8b8; font-size: 0.9em;'>Boletín de evaluación grupal para el tercer trimestre.</span>", unsafe_allow_html=True)
        with c2:
            if st.button("Generar 3T", use_container_width=True):
                pdf_3t = generar_pdf_boletin_grupal("3T", st.session_state.info_modulo, st.session_state.df_al, st.session_state.df_eval, st.session_state.df_act)
                st.download_button("📥 Descargar 3T", pdf_3t, f"Boletin_Grupal_3T_{_mod_name}.pdf", "application/pdf", type="primary", use_container_width=True)

    with st.container(border=True):
        c1, c2 = st.columns([3, 1], vertical_alignment="center")
        with c1:
            st.markdown("#### 🎓 Evaluación Final")
            st.markdown("<span style='color:#a3a8b8; font-size: 0.9em;'>Boletín de evaluación grupal final ordinaria.</span>", unsafe_allow_html=True)
        with c2:
            if st.button("Generar Final", use_container_width=True):
                pdf_fin = generar_pdf_boletin_grupal_final(st.session_state.info_modulo, st.session_state.df_al, st.session_state.df_eval, st.session_state.df_act)
                st.download_button("📥 Descargar Final", pdf_fin, f"Boletin_Grupal_FINAL_{_mod_name}.pdf", "application/pdf", type="primary", use_container_width=True)

    st.write("")
    st.markdown("### 👤 Boletines Individuales")
    
    with st.container(border=True):
        if "df_al" in st.session_state and not st.session_state.df_al.empty:
            df_al_act = st.session_state.df_al[st.session_state.df_al.get("Estado", "") != "Baja"].copy() if "Estado" in st.session_state.df_al.columns else st.session_state.df_al.copy()
            df_al_sorted = df_al_act.sort_values("Apellidos").reset_index(drop=True)
            alum_list = df_al_sorted.apply(lambda row: f"{row.get('Apellidos', '')}, {row.get('Nombre', '')} ({row.get('ID', '')})", axis=1).tolist()
            
            c1, c2 = st.columns([3, 1], vertical_alignment="center")
            with c1:
                st.markdown("#### 📄 Informe de Estudiante")
                st.markdown("<span style='color:#a3a8b8; font-size: 0.9em;'>Genera un informe detallado de un estudiante.</span>", unsafe_allow_html=True)
                alum_sel = st.selectbox("Seleccionar Alumnado", alum_list, label_visibility="collapsed")
            with c2:
                if alum_sel:
                    if st.button("Generar Informe Individual", use_container_width=True):
                        import re
                        match = re.search(r'\(([^)]+)\)$', alum_sel)
                        if match:
                            al_id = match.group(1)
                            pdf_buffer_indiv = generar_pdf_boletin_individual(
                                info_modulo=st.session_state.info_modulo,
                                al_id=al_id,
                                df_al=st.session_state.df_al,
                                df_eval=st.session_state.df_eval,
                                df_act=st.session_state.df_act,
                                df_ce=st.session_state.df_ce,
                                df_ra=st.session_state.df_ra,
                                df_feoe=st.session_state.get("df_feoe", pd.DataFrame()),
                                info_fechas=st.session_state.get("info_fechas", {}),
                                planning_ledger=st.session_state.get("planning_ledger", {}),
                                df_ud=st.session_state.get("df_ud", pd.DataFrame()),
                                df_pr=st.session_state.get("df_pr", pd.DataFrame())
                            )
                            st.download_button(
                                label="📥 Confirmar descarga",
                                data=pdf_buffer_indiv,
                                file_name=f"Informe_Individual_{al_id}_{_mod_name}.pdf",
                                mime="application/pdf",
                                type="primary",
                                use_container_width=True
                            )
        else:
            st.info("Sin estudiantes activos para generar informes individuales.")
