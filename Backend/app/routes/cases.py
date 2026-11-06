from typing import List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import init_db
from app.models.case import Case, CaseCreate, CaseStatus, CaseUpdate
from app.models.user import User
from app.routes.notification import create_notification
from app.services.auth_service import get_current_user

router = APIRouter()


async def get_case_or_404(case_id: str) -> Case:
    if not ObjectId.is_valid(case_id):
        raise HTTPException(status_code=400, detail="Invalid case ID")
    case = await Case.get(case_id)
    if case is None:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


def ensure_participant(case: Case, username: str) -> None:
    if username not in (case.client_username, case.lawyer_username):
        raise HTTPException(status_code=403, detail="Access denied")


@router.post("/create_case", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_case(
    case_data: CaseCreate,
    current_user: User = Depends(get_current_user),
):
    await init_db()
    if current_user.role != "client":
        raise HTTPException(status_code=403, detail="Only clients can create cases")

    case = Case(
        **case_data.model_dump(),
        client_username=current_user.username,
        status=CaseStatus.pending,
    )
    await case.insert()

    lawyers = await User.find(User.role == "lawyer").to_list()
    for lawyer in lawyers:
        await create_notification(
            recipient=lawyer.username,
            message=f"New case posted: {case.title}",
            case_id=str(case.id),
            notification_type="new_case",
        )

    return {"message": "Case created successfully", "case": case.to_dict()}


@router.get("/list_cases", response_model=List[dict])
async def list_cases(current_user: User = Depends(get_current_user)):
    await init_db()
    if current_user.role == "client":
        cases = await Case.find(Case.client_username == current_user.username).to_list()
    elif current_user.role == "lawyer":
        cases = await Case.find(Case.status == CaseStatus.pending).to_list()
    else:
        raise HTTPException(status_code=403, detail="Access denied")
    return [case.to_dict() for case in cases]


@router.get("/user_cases/me", response_model=List[dict])
async def my_cases(current_user: User = Depends(get_current_user)):
    if current_user.role == "client":
        cases = await Case.find(Case.client_username == current_user.username).to_list()
    elif current_user.role == "lawyer":
        cases = await Case.find(Case.lawyer_username == current_user.username).to_list()
    else:
        raise HTTPException(status_code=403, detail="Access denied")
    return [case.to_dict() for case in cases]


@router.get("/{case_id}", response_model=dict)
async def get_case(case_id: str, current_user: User = Depends(get_current_user)):
    await init_db()
    case = await get_case_or_404(case_id)
    ensure_participant(case, current_user.username)
    return case.to_dict()


@router.put("/{case_id}/accept", response_model=dict)
async def accept_case(case_id: str, current_user: User = Depends(get_current_user)):
    await init_db()
    if current_user.role != "lawyer":
        raise HTTPException(status_code=403, detail="Only lawyers can accept cases")

    case = await get_case_or_404(case_id)
    if case.status != CaseStatus.pending or case.lawyer_username:
        raise HTTPException(status_code=409, detail="Case is no longer available")

    case.lawyer_username = current_user.username
    case.status = CaseStatus.accepted
    await case.save()
    await create_notification(
        recipient=case.client_username,
        message=f"Your case '{case.title}' has been accepted by {current_user.username}.",
        case_id=str(case.id),
        notification_type="case_accepted",
    )
    return {"message": "Case accepted successfully", "case": case.to_dict()}


@router.put("/{case_id}/status", response_model=dict)
async def update_case_status(
    case_id: str,
    update_data: CaseUpdate,
    current_user: User = Depends(get_current_user),
):
    await init_db()
    case = await get_case_or_404(case_id)
    if case.lawyer_username != current_user.username:
        raise HTTPException(
            status_code=403,
            detail="Only the assigned lawyer can update status",
        )
    if case.status == CaseStatus.closed:
        raise HTTPException(status_code=409, detail="Closed cases cannot be updated")
    allowed_transitions = {
        CaseStatus.accepted: {CaseStatus.in_progress, CaseStatus.completed},
        CaseStatus.in_progress: {CaseStatus.completed},
        CaseStatus.completed: {CaseStatus.closed},
    }
    if update_data.status not in allowed_transitions.get(case.status, set()):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot change status from {case.status.value} to {update_data.status.value}",
        )

    case.status = update_data.status
    await case.save()
    await create_notification(
        recipient=case.client_username,
        message=f"Your case '{case.title}' is now {case.status.value}.",
        case_id=str(case.id),
        notification_type="case_update",
    )
    return {"message": "Case status updated", "case": case.to_dict()}


@router.get("/user_cases/{username}", response_model=List[dict])
async def user_cases(
    username: str,
    current_user: User = Depends(get_current_user),
):
    if username != current_user.username:
        raise HTTPException(status_code=403, detail="Access denied")
    return await my_cases(current_user)
