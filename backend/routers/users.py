from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import timedelta
from database import get_db
from auth.security import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from auth.dependencies import get_current_user, get_optional_user
from models import (
    User, Center, CenterStaff, HeadOfStudies, DepartmentHead,
    DualCoordinator, DualGeneralTutor, GroupTutor, TeachingAssignment
)

router = APIRouter(prefix="/api", tags=["Users"])

class UserCreate(BaseModel):
    name: str
    surname: str
    email: str
    password: str = "password"
    centers: list[int]
    roles: list[str]

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
        
    if not verify_password(req.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
    
    roles_str = "Superadmin" if getattr(user, 'is_superadmin', False) else "Profesorado"
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "id": str(user.id)}, expires_delta=access_token_expires
    )
        
    return {
        "status": "success",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "name": f"{user.name} {user.surname}" if user.surname else user.name,
            "email": user.email,
            "roles": roles_str
        }
    }

@router.get("/users")
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        users = db.query(User).all()
        result = []
        for u in users:
            c_staff = db.query(CenterStaff).filter(CenterStaff.user_id == u.id).all()
            centers = []
            roles = []
            
            for cs in c_staff:
                center_db = db.query(Center).filter(Center.id == cs.center_id).first()
                if center_db:
                    centers.append(center_db.name)
                    if cs.is_center_admin:
                        roles.append({
                            "type": "COFOTAP", 
                            "context": center_db.name, 
                            "colorClass": "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        })
            
            # Check other roles
            if db.query(HeadOfStudies).filter_by(user_id=u.id).first():
                roles.append({"type": "Jefe/a de Estudios", "context": "Centro", "colorClass": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"})
            if db.query(DepartmentHead).filter_by(user_id=u.id).first():
                roles.append({"type": "Jefe/a de Dpto. Didáctico", "context": "Familia", "colorClass": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"})
            if db.query(DualCoordinator).filter_by(user_id=u.id).first():
                roles.append({"type": "Tutor/a Dual Coordinador", "context": "Centro", "colorClass": "bg-amber-500/20 text-amber-400 border-amber-500/30"})
            if db.query(DualGeneralTutor).filter_by(user_id=u.id).first():
                roles.append({"type": "Tutor/a Dual General", "context": "Prospector", "colorClass": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"})
            
            tutor = db.query(GroupTutor).filter_by(user_id=u.id).first()
            if tutor:
                if tutor.is_dual_tutor:
                    roles.append({"type": "Tutor/a Dual", "context": "Seguimiento", "colorClass": "bg-orange-500/20 text-orange-400 border-orange-500/30"})
                else:
                    roles.append({"type": "Tutor/a de Curso/Grupo", "context": "Grupo", "colorClass": "bg-pink-500/20 text-pink-400 border-pink-500/30"})

            if getattr(u, 'is_superadmin', False):
                roles.append({"type": "Superadmin", "context": "Global", "colorClass": "bg-purple-500/20 text-purple-400 border-purple-500/30"})
            
            if not roles or any(r == "Profesorado" for r in u.roles if hasattr(u, "roles")):
                roles.append({"type": "Profesorado", "context": "General", "colorClass": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"})

            result.append({
                "id": u.id,
                "name": f"{u.name} {u.surname}",
                "email": u.email,
                "centers": centers,
                "status": "active",
                "roles": roles
            })
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users")
def create_user(user: UserCreate, db: Session = Depends(get_db), current_user: User | None = Depends(get_optional_user)):
    # Allow user creation without auth only when no users exist yet (bootstrap)
    existing_count = db.query(User).count()
    if existing_count > 0 and current_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    try:
        new_user = User(
            name=user.name, 
            surname=user.surname, 
            email=user.email,
            password=get_password_hash(user.password)
        )
        if "Superadmin" in user.roles:
            new_user.is_superadmin = True
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        for center_id in user.centers:
            is_cofotap = "COFOTAP" in user.roles
            staff = CenterStaff(user_id=new_user.id, center_id=center_id, is_center_admin=is_cofotap)
            db.add(staff)
            
            # Map other roles
            if "Jefe Estudios" in user.roles:
                db.add(HeadOfStudies(user_id=new_user.id, center_id=center_id))
            if "Jefe Departamento" in user.roles:
                db.add(DepartmentHead(user_id=new_user.id, center_id=center_id))
            if "Tutor Dual Coordinador" in user.roles:
                db.add(DualCoordinator(user_id=new_user.id, center_id=center_id))
            if "Tutor Dual General" in user.roles:
                db.add(DualGeneralTutor(user_id=new_user.id, center_id=center_id))
            if "Tutor Grupo" in user.roles:
                db.add(GroupTutor(user_id=new_user.id, is_dual_tutor=False))
            if "Tutor Dual Seguimiento" in user.roles:
                db.add(GroupTutor(user_id=new_user.id, is_dual_tutor=True))

        db.commit()
        return {"status": "success", "message": "User created successfully", "id": new_user.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

class AssignmentUpdate(BaseModel):
    module_ids: list[int]

@router.get("/assignments")
def get_assignments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        assignments = db.query(TeachingAssignment).all()
        result = {}
        for a in assignments:
            if a.user_id not in result:
                result[a.user_id] = []
            result[a.user_id].append(a.module_id)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/assignments/{user_id}")
def update_assignments(user_id: int, req: AssignmentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        db.query(TeachingAssignment).filter(TeachingAssignment.user_id == user_id).delete()
        for mid in req.module_ids:
            db.add(TeachingAssignment(user_id=user_id, module_id=mid))
        db.commit()
        return {"status": "success", "message": "Asignaciones actualizadas"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
