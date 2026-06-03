from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import (
    ModuleDocument, DidacticUnit, SessionModel, CourseStudent, StudentEvaluation,
    LearningOutcomeItem, EvaluationCriterionItem, ActivityItem, InstrumentItem,
    TaskItem, AceItem, DuaItem, ContingencyItem, FeoeItem, SgmtItem, CalendarNoteItem,
    ConfigDates, ScheduleItem, ModuleInfo, PlanningLedgerItem
)

def get_module_data(module_id: str, db: Session):
    doc = db.query(ModuleDocument).filter(ModuleDocument.id == module_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Module not found")
        
    base_data = dict(doc.data)
    
    # Determine PD ID and Curso ID
    pd_id = module_id
    if getattr(doc, "doc_type", "pd") == "curso" and getattr(doc, "parent_id", None):
        pd_id = doc.parent_id
        
        # Merge PD base data with Curso base data
        pd_doc = db.query(ModuleDocument).filter(ModuleDocument.id == pd_id).first()
        if pd_doc:
            merged_data = dict(pd_doc.data)
            merged_data.update(base_data)
            base_data = merged_data
            
    # Merge DidacticUnits (from pd_id)
    uds = db.query(DidacticUnit).filter_by(module_document_id=pd_id).all()
    if uds:
        ud_list = []
        for ud in uds:
            d = {"id_ud": ud.id_ud, "desc_ud": ud.desc_ud, "horas_ud": ud.horas_ud}
            if ud.ra_mappings:
                d.update(ud.ra_mappings)
            ud_list.append(d)
        base_data["df_ud"] = ud_list
        
    # Merge Sessions (from pd_id)
    sessions = db.query(SessionModel).filter_by(module_document_id=pd_id).all()
    if sessions:
        ses_list = []
        for ses in sessions:
            ses_list.append({
                "ID": ses.session_id,
                "id_ud": ses.id_ud,
                "Num_Orden": ses.num_orden,
                "Horas": ses.horas,
                "Tipo_Actividad": ses.tipo_actividad,
                "RA_CE": ses.ra_ce,
                "Contenidos": ses.contenidos,
                "Aspectos_Clave": ses.aspectos_clave,
                "Recursos": ses.recursos
            })
        base_data["df_sesiones"] = ses_list
        
    # Merge Students (from module_id / curso_id)
    students = db.query(CourseStudent).filter_by(module_document_id=module_id).all()
    if students:
        al_list = []
        for al in students:
            al_list.append({
                "ID": al.student_id,
                "Estado": al.estado,
                "Apellidos": al.apellidos,
                "Nombre": al.nombre,
                "Edad": al.edad,
                "Nacimiento": al.nacimiento,
                "Repite": al.repite,
                "Matricula": al.matricula,
                "Comentarios": al.comentarios,
                "email": al.email,
                "Movil": al.movil
            })
        base_data["df_al"] = al_list
        
    # Merge Evaluations (from module_id)
    evals = db.query(StudentEvaluation).filter_by(module_document_id=module_id).all()
    if evals:
        ev_list = []
        for ev in evals:
            d = {"ID": ev.student_id}
            if ev.eval_data:
                d.update(ev.eval_data)
            ev_list.append(d)
        base_data["df_eval"] = ev_list
        
    # Merge Phase 2 Models
    models_map = [
        (LearningOutcomeItem, "df_ra", ["id_ra", "desc_ra", "peso_ra", "is_dual"]),
        (EvaluationCriterionItem, "df_ce", ["id_ce", "id_ra", "id_ud", "desc_ce", "peso_ce"]),
        (ActivityItem, "df_act", ["id_act", "desc_act", "tipo", "tri_act", "peso_act", "is_active"]),
        (InstrumentItem, "df_pr", ["item_id", "practica"]),
        (TaskItem, "df_tareas", ["item_id", "nombre_tarea", "reto", "ra_asociados", "instrumento"]),
        (AceItem, "df_ace", ["item_id", "tipo"]),
        (DuaItem, "df_dua", ["item_id", "barrera"]),
        (ContingencyItem, "df_contingencia", ["item_id", "escenario"])
    ]
    
    for ModelClass, df_key, field_names in models_map:
        items = db.query(ModelClass).filter_by(module_document_id=pd_id).all()
        if items:
            item_list = []
            for item in items:
                d = {}
                # map fields back to JSON keys
                if df_key == "df_pr": d["ID"] = item.item_id; d["Práctica"] = item.practica
                elif df_key == "df_tareas": d["ID"] = item.item_id; d["Nombre_Tarea"] = item.nombre_tarea; d["Reto"] = item.reto; d["RA_Asociados"] = item.ra_asociados; d["Instrumento"] = item.instrumento
                elif df_key == "df_ace": d["ID"] = item.item_id; d["Tipo"] = item.tipo
                elif df_key == "df_dua": d["ID"] = item.item_id; d["Barrera"] = item.barrera
                elif df_key == "df_contingencia": d["ID"] = item.item_id; d["Escenario"] = item.escenario
                elif df_key == "df_act": d["id_act"] = item.id_act; d["desc_act"] = item.desc_act; d["Tipo"] = item.tipo; d["tri_act"] = item.tri_act; d["peso_act"] = item.peso_act; d["is_active"] = item.is_active
                else:
                    for f in field_names:
                        d[f] = getattr(item, f)
                        
                if item.data:
                    d.update(item.data)
                item_list.append(d)
            base_data[df_key] = item_list
            
    # Practical data from module_id
    feoe_items = db.query(FeoeItem).filter_by(module_document_id=module_id).all()
    if feoe_items:
        feoe_list = []
        for item in feoe_items:
            d = {"ID": item.item_id}
            if item.data: d.update(item.data)
            feoe_list.append(d)
        base_data["df_feoe"] = feoe_list
        
    sgmt_items = db.query(SgmtItem).filter_by(module_document_id=module_id).all()
    if sgmt_items:
        sgmt_list = []
        for item in sgmt_items:
            d = {"id_ud": item.id_ud}
            if item.data: d.update(item.data)
            sgmt_list.append(d)
        base_data["df_sgmt"] = sgmt_list
            
    # Merge Calendar Notes (from pd_id)
    cal_notes = db.query(CalendarNoteItem).filter_by(module_document_id=pd_id).all()
    if cal_notes:
        notes_dict = {}
        for note in cal_notes:
            notes_dict[note.note_key] = note.note_text
        base_data["calendar_notes"] = notes_dict
        
    # Phase 3 (from pd_id)
    conf_dates = db.query(ConfigDates).filter_by(module_document_id=pd_id).first()
    if conf_dates and conf_dates.data:
        base_data["info_fechas"] = conf_dates.data

    mod_info = db.query(ModuleInfo).filter_by(module_document_id=pd_id).first()
    if mod_info and mod_info.data:
        base_data["info_modulo"] = mod_info.data

    sched = db.query(ScheduleItem).filter_by(module_document_id=pd_id).all()
    if sched:
        h = {}
        for s in sched:
            h[s.day_of_week] = s.hours
        base_data["horario"] = h

    ledger = db.query(PlanningLedgerItem).filter_by(module_document_id=pd_id).all()
    if ledger:
        pl = {}
        for item in ledger:
            if item.date_str not in pl:
                pl[item.date_str] = []
            pl[item.date_str].append(item.id_ud)
        base_data["planning_ledger"] = pl
        
    return base_data

def update_module_data(module_id: str, body: dict, db: Session):
    # 1. Extract and delete normalized lists from JSON body to save space
    df_ud = body.pop("df_ud", [])
    df_sesiones = body.pop("df_sesiones", [])
    df_al = body.pop("df_al", [])
    df_eval = body.pop("df_eval", [])
    
    # Phase 2 lists
    df_ra = body.pop("df_ra", [])
    df_ce = body.pop("df_ce", [])
    df_act = body.pop("df_act", [])
    df_pr = body.pop("df_pr", [])
    df_tareas = body.pop("df_tareas", [])
    df_ace = body.pop("df_ace", [])
    df_dua = body.pop("df_dua", [])
    df_contingencia = body.pop("df_contingencia", [])
    df_feoe = body.pop("df_feoe", [])
    df_sgmt = body.pop("df_sgmt", [])
    calendar_notes = body.pop("calendar_notes", {})
    
    # Phase 3 dicts
    info_fechas = body.pop("info_fechas", {})
    horario = body.pop("horario", {})
    info_modulo = body.pop("info_modulo", {})
    planning_ledger = body.pop("planning_ledger", {})
    
    # Determine PD ID vs Curso ID
    doc = db.query(ModuleDocument).filter(ModuleDocument.id == module_id).first()
    pd_id = module_id
    if doc and getattr(doc, "doc_type", "pd") == "curso" and getattr(doc, "parent_id", None):
        pd_id = doc.parent_id
        
    # Optimistic Locking Check
    incoming_version = body.pop("__version__", None)
    
    # 2. Update JSON Blob (always save base to active module)
    if doc:
        current_data = doc.data if isinstance(doc.data, dict) else {}
        current_version = current_data.get("__version__", 0)
        
        if incoming_version is not None and incoming_version < current_version:
            raise HTTPException(status_code=409, detail=f"Conflict: Data is stale. Server version is {current_version}, but client sent {incoming_version}.")
            
        body["__version__"] = current_version + 1
        doc.data = body
    else:
        body["__version__"] = 1
        is_curso = "-curso-" in module_id
        new_doc_type = "curso" if is_curso else "pd"
        new_parent_id = None
        if is_curso:
            parts = module_id.split("-curso-")
            if len(parts) == 2:
                new_parent_id = f"{parts[0]}-pd"
        new_doc = ModuleDocument(id=module_id, doc_type=new_doc_type, parent_id=new_parent_id, data=body)
        db.add(new_doc)
        
    # 3. Upsert DidacticUnits (to pd_id)
    db.query(DidacticUnit).filter_by(module_document_id=pd_id).delete()
    if isinstance(df_ud, list):
        for ud in df_ud:
            ra_mappings = {k: v for k, v in ud.items() if k not in ['id_ud', 'desc_ud', 'horas_ud']}
            new_ud = DidacticUnit(
                module_document_id=module_id,
                id_ud=str(ud.get("id_ud", "")),
                desc_ud=str(ud.get("desc_ud", "")),
                horas_ud=int(ud.get("horas_ud", 0) or 0),
                ra_mappings=ra_mappings
            )
            db.add(new_ud)
            
    # 4. Upsert Sessions (to pd_id)
    db.query(SessionModel).filter_by(module_document_id=pd_id).delete()
    if isinstance(df_sesiones, list):
        for ses in df_sesiones:
            new_ses = SessionModel(
                module_document_id=pd_id,
                session_id=str(ses.get("ID", "")),
                id_ud=str(ses.get("id_ud", "")),
                num_orden=int(ses.get("Num_Orden", 0) or 0),
                horas=int(ses.get("Horas", 0) or 0),
                tipo_actividad=str(ses.get("Tipo_Actividad", "")),
                ra_ce=str(ses.get("RA_CE", "")),
                contenidos=str(ses.get("Contenidos", "")),
                aspectos_clave=str(ses.get("Aspectos_Clave", "")),
                recursos=str(ses.get("Recursos", ""))
            )
            db.add(new_ses)
            
    # 5. Upsert Students
    db.query(CourseStudent).filter_by(module_document_id=module_id).delete()
    if isinstance(df_al, list):
        for al in df_al:
            new_al = CourseStudent(
                module_document_id=module_id,
                student_id=str(al.get("ID", "")),
                estado=str(al.get("Estado", "")),
                apellidos=str(al.get("Apellidos", "")),
                nombre=str(al.get("Nombre", "")),
                edad=str(al.get("Edad", "")),
                nacimiento=str(al.get("Nacimiento", "")),
                repite=str(al.get("Repite", "")),
                matricula=str(al.get("Matricula", "")),
                comentarios=str(al.get("Comentarios", "")),
                email=str(al.get("email", "")),
                movil=str(al.get("Movil", ""))
            )
            db.add(new_al)
            
    # 6. Upsert Evaluations
    db.query(StudentEvaluation).filter_by(module_document_id=module_id).delete()
    if isinstance(df_eval, list):
        for ev in df_eval:
            student_id = str(ev.get("ID", ""))
            eval_data = {k: v for k, v in ev.items() if k != "ID"}
            new_ev = StudentEvaluation(
                module_document_id=module_id,
                student_id=student_id,
                eval_data=eval_data
            )
            db.add(new_ev)
            
    # 7. Upsert Phase 2 Lists (Theoretical to pd_id)
    def safe_str(val):
        return str(val) if val is not None else ""
        
    db.query(LearningOutcomeItem).filter_by(module_document_id=pd_id).delete()
    if isinstance(df_ra, list):
        for row in df_ra:
            d = {k: v for k, v in row.items() if k not in ["id_ra", "desc_ra", "peso_ra", "is_dual"]}
            db.add(LearningOutcomeItem(module_document_id=pd_id, id_ra=safe_str(row.get("id_ra")), desc_ra=safe_str(row.get("desc_ra")), peso_ra=safe_str(row.get("peso_ra")), is_dual=safe_str(row.get("is_dual")), data=d))

    db.query(EvaluationCriterionItem).filter_by(module_document_id=pd_id).delete()
    if isinstance(df_ce, list):
        for row in df_ce:
            d = {k: v for k, v in row.items() if k not in ["id_ce", "id_ra", "id_ud", "desc_ce", "peso_ce"]}
            db.add(EvaluationCriterionItem(module_document_id=pd_id, id_ce=safe_str(row.get("id_ce")), id_ra=safe_str(row.get("id_ra")), id_ud=safe_str(row.get("id_ud")), desc_ce=safe_str(row.get("desc_ce")), peso_ce=safe_str(row.get("peso_ce")), data=d))

    db.query(ActivityItem).filter_by(module_document_id=pd_id).delete()
    if isinstance(df_act, list):
        for row in df_act:
            d = {k: v for k, v in row.items() if k not in ["id_act", "desc_act", "Tipo", "tri_act", "peso_act", "is_active"]}
            db.add(ActivityItem(module_document_id=pd_id, id_act=safe_str(row.get("id_act")), desc_act=safe_str(row.get("desc_act")), tipo=safe_str(row.get("Tipo")), tri_act=safe_str(row.get("tri_act")), peso_act=safe_str(row.get("peso_act")), is_active=safe_str(row.get("is_active")), data=d))

    db.query(InstrumentItem).filter_by(module_document_id=pd_id).delete()
    if isinstance(df_pr, list):
        for row in df_pr:
            d = {k: v for k, v in row.items() if k not in ["ID", "Práctica"]}
            db.add(InstrumentItem(module_document_id=pd_id, item_id=safe_str(row.get("ID")), practica=safe_str(row.get("Práctica")), data=d))

    db.query(TaskItem).filter_by(module_document_id=pd_id).delete()
    if isinstance(df_tareas, list):
        for row in df_tareas:
            d = {k: v for k, v in row.items() if k not in ["ID", "Nombre_Tarea", "Reto", "RA_Asociados", "Instrumento"]}
            db.add(TaskItem(module_document_id=pd_id, item_id=safe_str(row.get("ID")), nombre_tarea=safe_str(row.get("Nombre_Tarea")), reto=safe_str(row.get("Reto")), ra_asociados=safe_str(row.get("RA_Asociados")), instrumento=safe_str(row.get("Instrumento")), data=d))

    db.query(AceItem).filter_by(module_document_id=pd_id).delete()
    if isinstance(df_ace, list):
        for row in df_ace:
            d = {k: v for k, v in row.items() if k not in ["ID", "Tipo"]}
            db.add(AceItem(module_document_id=pd_id, item_id=safe_str(row.get("ID")), tipo=safe_str(row.get("Tipo")), data=d))

    db.query(DuaItem).filter_by(module_document_id=pd_id).delete()
    if isinstance(df_dua, list):
        for row in df_dua:
            d = {k: v for k, v in row.items() if k not in ["ID", "Barrera"]}
            db.add(DuaItem(module_document_id=pd_id, item_id=safe_str(row.get("ID")), barrera=safe_str(row.get("Barrera")), data=d))

    db.query(ContingencyItem).filter_by(module_document_id=pd_id).delete()
    if isinstance(df_contingencia, list):
        for row in df_contingencia:
            d = {k: v for k, v in row.items() if k not in ["ID", "Escenario"]}
            db.add(ContingencyItem(module_document_id=pd_id, item_id=safe_str(row.get("ID")), escenario=safe_str(row.get("Escenario")), data=d))

    # Practical updates to module_id
    db.query(FeoeItem).filter_by(module_document_id=module_id).delete()
    if isinstance(df_feoe, list):
        for row in df_feoe:
            d = {k: v for k, v in row.items() if k not in ["ID"]}
            db.add(FeoeItem(module_document_id=module_id, item_id=safe_str(row.get("ID")), data=d))

    db.query(SgmtItem).filter_by(module_document_id=module_id).delete()
    if isinstance(df_sgmt, list):
        for row in df_sgmt:
            d = {k: v for k, v in row.items() if k not in ["id_ud"]}
            db.add(SgmtItem(module_document_id=module_id, id_ud=safe_str(row.get("id_ud")), data=d))
            
    # Theoretical to pd_id
    db.query(CalendarNoteItem).filter_by(module_document_id=pd_id).delete()
    if isinstance(calendar_notes, dict):
        for key, val in calendar_notes.items():
            db.add(CalendarNoteItem(module_document_id=pd_id, note_key=safe_str(key), note_text=safe_str(val)))
            
    # Phase 3 updates to pd_id
    db.query(ConfigDates).filter_by(module_document_id=pd_id).delete()
    if info_fechas and isinstance(info_fechas, dict):
        db.add(ConfigDates(module_document_id=pd_id, data=info_fechas))

    db.query(ModuleInfo).filter_by(module_document_id=pd_id).delete()
    if info_modulo and isinstance(info_modulo, dict):
        db.add(ModuleInfo(module_document_id=pd_id, data=info_modulo))

    db.query(ScheduleItem).filter_by(module_document_id=pd_id).delete()
    if horario and isinstance(horario, dict):
        for k, v in horario.items():
            db.add(ScheduleItem(module_document_id=pd_id, day_of_week=safe_str(k), hours=int(v) if str(v).isdigit() else 0))

    db.query(PlanningLedgerItem).filter_by(module_document_id=pd_id).delete()
    if planning_ledger and isinstance(planning_ledger, dict):
        for k, v in planning_ledger.items():
            if isinstance(v, list):
                for ud in v:
                    db.add(PlanningLedgerItem(module_document_id=pd_id, date_str=safe_str(k), id_ud=safe_str(ud)))
            else:
                db.add(PlanningLedgerItem(module_document_id=pd_id, date_str=safe_str(k), id_ud=safe_str(v)))
    
    db.commit()
