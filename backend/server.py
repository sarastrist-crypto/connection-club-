from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
import bcrypt
import jwt
import secrets
from datetime import datetime, timezone, timedelta
from bson import ObjectId

ROOT_DIR = Path(__file__).parent

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="ConnectClub API")
api_router = APIRouter(prefix="/api")

# JWT Configuration
JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ===================== PYDANTIC MODELS =====================

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    onboarding_completed: bool = False
    created_at: datetime

class OnboardingStep1(BaseModel):
    name: str
    location: str
    contact_preference: str  # email, phone, text

class OnboardingStep2(BaseModel):
    industries: List[str]  # healthcare, hospitality, retail, etc.

class OnboardingStep3(BaseModel):
    industry_relationships: Dict[str, str]  # {industry: depth}

class OnboardingStep4(BaseModel):
    income_goal: str  # 500-1k, 1k-3k, 3k-10k, 10k+

class OnboardingStep5(BaseModel):
    career_track: str  # hospitality, young-professional, career-professional
    availability: str  # passive, part-time, active

class OnboardingComplete(BaseModel):
    name: str
    location: str
    contact_preference: str
    industries: List[str]
    industry_relationships: Dict[str, str]
    income_goal: str
    career_track: str
    availability: str

class PlatformCreate(BaseModel):
    name: str
    url: str
    short_description: str
    full_description: Optional[str] = ""
    tracks: List[str]
    category: str
    barrier_to_entry: str  # low, medium, high
    barrier_notes: Optional[str] = ""
    income_type: str  # active, semi-passive, passive
    pay_structure: Optional[str] = ""
    estimated_earnings: Optional[str] = ""
    time_to_first_dollar: Optional[str] = ""
    geographic_availability: Optional[str] = "Nationwide"
    mobile_friendly: bool = True
    requires_certification: bool = False
    certification_notes: Optional[str] = ""
    estimated_tax_impact: str = "medium"
    is_1099_likely: bool = True
    status: str = "active"

class PlatformResponse(BaseModel):
    id: str
    name: str
    url: str
    short_description: str
    full_description: str
    tracks: List[str]
    category: str
    barrier_to_entry: str
    barrier_notes: str
    income_type: str
    pay_structure: str
    estimated_earnings: str
    time_to_first_dollar: str
    geographic_availability: str
    mobile_friendly: bool
    requires_certification: bool
    certification_notes: str
    estimated_tax_impact: str
    is_1099_likely: bool
    status: str
    last_verified: str
    user_submitted: bool
    date_added: str

class BundleResponse(BaseModel):
    id: str
    name: str
    target_client: str
    ideal_client_profile: str
    services: List[str]
    conversation_starter: str
    commission_at_close: int
    monthly_residual: int
    twelve_month_value: int
    tier: str

class IntroductionCreate(BaseModel):
    opportunity_id: str
    opportunity_type: str  # gig, bundle, high-value
    contact_name: str
    business_type: str
    relationship: str
    approach_method: str  # text, email, linkedin
    message: str

class IntroductionResponse(BaseModel):
    id: str
    opportunity_id: str
    opportunity_type: str
    opportunity_name: str
    contact_name: str
    business_type: str
    relationship: str
    approach_method: str
    message: str
    status: str  # introduced, in-review, closed, earned
    commission_at_close: int
    monthly_residual: int
    created_at: datetime
    updated_at: datetime

class TaxEntry(BaseModel):
    amount: float
    description: str
    date: str
    category: str  # income, deduction

class TaxSummary(BaseModel):
    gross_income: float
    total_deductions: float
    net_taxable_income: float
    estimated_se_tax: float
    quarterly_set_aside: float
    next_due_date: str
    entries: List[Dict[str, Any]]

class NetworkCredits(BaseModel):
    credits_lifetime: int
    credits_available: int
    activity_log: List[Dict[str, Any]]
    redemptions: List[Dict[str, Any]]

class UserSubmission(BaseModel):
    platform_name: str
    website_url: str
    tracks: List[str]
    category: str
    description: str
    recommendation_reason: Optional[str] = ""
    submitter_name: Optional[str] = ""
    submitter_email: Optional[str] = ""

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# ===================== AUTH ROUTES =====================

@api_router.post("/auth/register")
async def register(data: UserRegister, response: Response):
    email = data.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = hash_password(data.password)
    user_doc = {
        "email": email,
        "password_hash": hashed,
        "name": data.name,
        "role": "member",
        "onboarding_completed": False,
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Initialize network credits
    await db.network_credits.insert_one({
        "user_id": user_id,
        "credits_lifetime": 0,
        "credits_available": 0,
        "activity_log": [],
        "redemptions": [],
        "referral_code": secrets.token_urlsafe(8)
    })
    
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {
        "id": user_id,
        "email": email,
        "name": data.name,
        "role": "member",
        "onboarding_completed": False,
        "created_at": user_doc["created_at"].isoformat()
    }

@api_router.post("/auth/login")
async def login(data: UserLogin, request: Request, response: Response):
    email = data.email.lower()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    
    # Check brute force
    attempts = await db.login_attempts.find_one({"identifier": identifier})
    if attempts and attempts.get("count", 0) >= 5:
        lockout_until = attempts.get("lockout_until")
        if lockout_until and datetime.now(timezone.utc) < lockout_until:
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
    
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        # Increment failed attempts
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {
                "$inc": {"count": 1},
                "$set": {"lockout_until": datetime.now(timezone.utc) + timedelta(minutes=15)}
            },
            upsert=True
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Clear failed attempts on success
    await db.login_attempts.delete_one({"identifier": identifier})
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {
        "id": user_id,
        "email": user["email"],
        "name": user["name"],
        "role": user.get("role", "member"),
        "onboarding_completed": user.get("onboarding_completed", False),
        "created_at": user["created_at"].isoformat() if isinstance(user["created_at"], datetime) else user["created_at"]
    }

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {
        "id": user["_id"],
        "email": user["email"],
        "name": user["name"],
        "role": user.get("role", "member"),
        "onboarding_completed": user.get("onboarding_completed", False),
        "profile": user.get("profile", {}),
        "created_at": user["created_at"].isoformat() if isinstance(user["created_at"], datetime) else user["created_at"]
    }

@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        user_id = str(user["_id"])
        access_token = create_access_token(user_id, user["email"])
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
        return {"message": "Token refreshed"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# Google OAuth session endpoint
@api_router.post("/auth/session")
async def handle_google_session(request: Request, response: Response):
    import httpx
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id")
    
    async with httpx.AsyncClient() as client_http:
        resp = await client_http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        data = resp.json()
    
    email = data["email"].lower()
    user = await db.users.find_one({"email": email})
    
    if not user:
        user_doc = {
            "email": email,
            "password_hash": "",
            "name": data.get("name", email.split("@")[0]),
            "picture": data.get("picture", ""),
            "role": "member",
            "onboarding_completed": False,
            "created_at": datetime.now(timezone.utc),
            "auth_provider": "google"
        }
        result = await db.users.insert_one(user_doc)
        user_id = str(result.inserted_id)
        
        # Initialize network credits
        await db.network_credits.insert_one({
            "user_id": user_id,
            "credits_lifetime": 0,
            "credits_available": 0,
            "activity_log": [],
            "redemptions": [],
            "referral_code": secrets.token_urlsafe(8)
        })
        
        user = user_doc
        user["_id"] = result.inserted_id
    else:
        user_id = str(user["_id"])
    
    session_token = data.get("session_token", secrets.token_urlsafe(32))
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.update_one(
        {"user_id": user_id},
        {"$set": {"session_token": session_token, "expires_at": expires_at}},
        upsert=True
    )
    
    access_token = create_access_token(user_id, email)
    refresh_token_val = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token_val, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    response.set_cookie(key="session_token", value=session_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {
        "id": user_id,
        "email": email,
        "name": user.get("name", ""),
        "picture": user.get("picture", ""),
        "role": user.get("role", "member"),
        "onboarding_completed": user.get("onboarding_completed", False)
    }

# Password reset endpoints
@api_router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    
    # Always return success to prevent email enumeration
    if not user:
        return {"message": "If an account exists with that email, a reset link has been sent."}
    
    # Check if user is Google OAuth user (no password)
    if user.get("auth_provider") == "google":
        return {"message": "This account uses Google sign-in. Please use the Google login button."}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # Store token
    await db.password_reset_tokens.insert_one({
        "token": reset_token,
        "user_id": str(user["_id"]),
        "email": email,
        "expires_at": expires_at,
        "used": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    # In production, send email here
    # For now, log the reset link
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"
    logging.info(f"Password reset link for {email}: {reset_link}")
    
    return {"message": "If an account exists with that email, a reset link has been sent."}

@api_router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordRequest):
    # Find the token
    token_doc = await db.password_reset_tokens.find_one({
        "token": data.token,
        "used": False
    })
    
    if not token_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Check expiration - handle timezone properly
    expires_at = token_doc["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    # Validate password
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Update user password
    new_hash = hash_password(data.new_password)
    await db.users.update_one(
        {"_id": ObjectId(token_doc["user_id"])},
        {"$set": {"password_hash": new_hash}}
    )
    
    # Mark token as used
    await db.password_reset_tokens.update_one(
        {"token": data.token},
        {"$set": {"used": True, "used_at": datetime.now(timezone.utc)}}
    )
    
    return {"message": "Password has been reset successfully"}

@api_router.get("/auth/verify-reset-token")
async def verify_reset_token(token: str):
    token_doc = await db.password_reset_tokens.find_one({
        "token": token,
        "used": False
    })
    
    if not token_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Handle timezone comparison properly
    expires_at = token_doc["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    return {"valid": True, "email": token_doc["email"]}

# ===================== ONBOARDING ROUTES =====================

@api_router.post("/onboarding/complete")
async def complete_onboarding(data: OnboardingComplete, user: dict = Depends(get_current_user)):
    user_id = user["_id"]
    
    # Calculate match scores based on profile
    profile = {
        "name": data.name,
        "location": data.location,
        "contact_preference": data.contact_preference,
        "industries": data.industries,
        "industry_relationships": data.industry_relationships,
        "income_goal": data.income_goal,
        "career_track": data.career_track,
        "availability": data.availability
    }
    
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "profile": profile,
                "onboarding_completed": True,
                "onboarding_completed_at": datetime.now(timezone.utc)
            }
        }
    )
    
    # Calculate and return top matches
    matches = await calculate_matches(profile)
    return {"profile": profile, "top_matches": matches[:3]}

async def calculate_matches(profile: dict) -> List[dict]:
    """Calculate opportunity matches based on user profile"""
    bundles = await db.bundles.find({}, {"_id": 0}).to_list(100)
    platforms = await db.platforms.find({"status": "active"}, {"_id": 0}).to_list(100)
    
    matches = []
    career_track = profile.get("career_track", "")
    industries = profile.get("industries", [])
    
    # Score bundles
    for bundle in bundles:
        score = 50  # Base score
        # Industry matching
        for ind in industries:
            if ind.lower() in bundle.get("target_client", "").lower():
                score += 20
        matches.append({
            "type": "bundle",
            "id": bundle.get("id"),
            "name": bundle.get("name"),
            "description": bundle.get("ideal_client_profile"),
            "commission_at_close": bundle.get("commission_at_close", 50),
            "monthly_residual": bundle.get("monthly_residual", 10),
            "match_score": min(score, 100)
        })
    
    # Score platforms
    track_map = {
        "hospitality": ["hospitality"],
        "young-professional": ["entry-level"],
        "career-professional": ["career-professional"]
    }
    target_tracks = track_map.get(career_track, [])
    
    for platform in platforms:
        score = 40
        platform_tracks = platform.get("tracks", [])
        for t in target_tracks:
            if t in platform_tracks:
                score += 30
        matches.append({
            "type": "gig",
            "id": platform.get("id"),
            "name": platform.get("name"),
            "description": platform.get("short_description"),
            "income_type": platform.get("income_type"),
            "match_score": min(score, 100)
        })
    
    # Sort by score
    matches.sort(key=lambda x: x.get("match_score", 0), reverse=True)
    return matches

@api_router.get("/onboarding/matches")
async def get_matches(user: dict = Depends(get_current_user)):
    profile = user.get("profile", {})
    if not profile:
        return {"matches": []}
    matches = await calculate_matches(profile)
    return {"matches": matches}

# ===================== PLATFORM ROUTES =====================

@api_router.get("/platforms")
async def get_platforms(
    track: Optional[str] = None,
    category: Optional[str] = None,
    barrier: Optional[str] = None,
    income_type: Optional[str] = None,
    status: Optional[str] = "active"
):
    query = {}
    if track:
        query["tracks"] = track
    if category:
        query["category"] = category
    if barrier:
        query["barrier_to_entry"] = barrier
    if income_type:
        query["income_type"] = income_type
    if status:
        query["status"] = status
    
    platforms = await db.platforms.find(query, {"_id": 0}).to_list(1000)
    return {"platforms": platforms}

@api_router.get("/platforms/{platform_id}")
async def get_platform(platform_id: str):
    platform = await db.platforms.find_one({"id": platform_id}, {"_id": 0})
    if not platform:
        raise HTTPException(status_code=404, detail="Platform not found")
    return platform

@api_router.post("/platforms", dependencies=[Depends(get_current_user)])
async def create_platform(data: PlatformCreate, user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    platform_doc = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "last_verified": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "user_submitted": False,
        "date_added": datetime.now(timezone.utc).strftime("%Y-%m-%d")
    }
    await db.platforms.insert_one(platform_doc)
    return {"id": platform_doc["id"], "message": "Platform created"}

# ===================== BUNDLE ROUTES =====================

@api_router.get("/bundles")
async def get_bundles(tier: Optional[str] = None):
    query = {}
    if tier:
        query["tier"] = tier
    bundles = await db.bundles.find(query, {"_id": 0}).to_list(100)
    return {"bundles": bundles}

@api_router.get("/bundles/{bundle_id}")
async def get_bundle(bundle_id: str):
    bundle = await db.bundles.find_one({"id": bundle_id}, {"_id": 0})
    if not bundle:
        raise HTTPException(status_code=404, detail="Bundle not found")
    return bundle

# ===================== INTRODUCTION ROUTES =====================

@api_router.post("/introductions")
async def create_introduction(data: IntroductionCreate, user: dict = Depends(get_current_user)):
    user_id = user["_id"]
    
    # Get opportunity details
    opp_name = ""
    commission = 50
    residual = 10
    
    if data.opportunity_type == "bundle":
        bundle = await db.bundles.find_one({"id": data.opportunity_id})
        if bundle:
            opp_name = bundle.get("name", "")
            commission = bundle.get("commission_at_close", 50)
            residual = bundle.get("monthly_residual", 10)
    else:
        platform = await db.platforms.find_one({"id": data.opportunity_id})
        if platform:
            opp_name = platform.get("name", "")
    
    intro_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "opportunity_id": data.opportunity_id,
        "opportunity_type": data.opportunity_type,
        "opportunity_name": opp_name,
        "contact_name": data.contact_name,
        "business_type": data.business_type,
        "relationship": data.relationship,
        "approach_method": data.approach_method,
        "message": data.message,
        "status": "introduced",
        "commission_at_close": commission,
        "monthly_residual": residual,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    await db.introductions.insert_one(intro_doc)
    return {"id": intro_doc["id"], "message": "Introduction logged"}

@api_router.get("/introductions")
async def get_introductions(user: dict = Depends(get_current_user)):
    user_id = user["_id"]
    intros = await db.introductions.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"introductions": intros}

@api_router.patch("/introductions/{intro_id}/status")
async def update_introduction_status(intro_id: str, status: str, user: dict = Depends(get_current_user)):
    valid_statuses = ["introduced", "in-review", "closed", "earned"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.introductions.update_one(
        {"id": intro_id, "user_id": user["_id"]},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Introduction not found")
    
    # If status is earned, add to commission tracker
    if status == "earned":
        intro = await db.introductions.find_one({"id": intro_id})
        if intro:
            await db.commissions.insert_one({
                "id": str(uuid.uuid4()),
                "user_id": user["_id"],
                "introduction_id": intro_id,
                "opportunity_name": intro.get("opportunity_name"),
                "commission_earned": intro.get("commission_at_close", 0),
                "monthly_residual": intro.get("monthly_residual", 0),
                "earned_at": datetime.now(timezone.utc)
            })
    
    return {"message": "Status updated"}

# ===================== TAX CENTER ROUTES =====================

@api_router.get("/tax/summary")
async def get_tax_summary(user: dict = Depends(get_current_user)):
    user_id = user["_id"]
    entries = await db.tax_entries.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    gross_income = sum(e["amount"] for e in entries if e["category"] == "income")
    total_deductions = sum(e["amount"] for e in entries if e["category"] == "deduction")
    net_taxable = max(0, gross_income - total_deductions)
    se_tax = net_taxable * 0.153  # 15.3% self-employment tax
    quarterly = se_tax / 4
    
    # Determine next due date
    now = datetime.now(timezone.utc)
    due_dates = [
        (4, 15), (6, 15), (9, 15), (1, 15)
    ]
    next_due = ""
    for month, day in due_dates:
        due = datetime(now.year if month > now.month or (month == now.month and day >= now.day) else now.year + 1, month, day, tzinfo=timezone.utc)
        if due > now:
            next_due = due.strftime("%B %d, %Y")
            break
    if not next_due:
        next_due = f"January 15, {now.year + 1}"
    
    return {
        "gross_income": gross_income,
        "total_deductions": total_deductions,
        "net_taxable_income": net_taxable,
        "estimated_se_tax": round(se_tax, 2),
        "quarterly_set_aside": round(quarterly, 2),
        "weekly_set_aside": round(quarterly / 13, 2),
        "next_due_date": next_due,
        "entries": entries
    }

@api_router.post("/tax/entry")
async def add_tax_entry(data: TaxEntry, user: dict = Depends(get_current_user)):
    entry = {
        "id": str(uuid.uuid4()),
        "user_id": user["_id"],
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc)
    }
    await db.tax_entries.insert_one(entry)
    return {"id": entry["id"], "message": "Entry added"}

@api_router.delete("/tax/entry/{entry_id}")
async def delete_tax_entry(entry_id: str, user: dict = Depends(get_current_user)):
    result = await db.tax_entries.delete_one({"id": entry_id, "user_id": user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Entry deleted"}

# ===================== NETWORK CREDITS ROUTES =====================

@api_router.get("/network/credits")
async def get_network_credits(user: dict = Depends(get_current_user)):
    user_id = user["_id"]
    credits = await db.network_credits.find_one({"user_id": user_id}, {"_id": 0})
    if not credits:
        credits = {
            "user_id": user_id,
            "credits_lifetime": 0,
            "credits_available": 0,
            "activity_log": [],
            "redemptions": [],
            "referral_code": secrets.token_urlsafe(8)
        }
        await db.network_credits.insert_one(credits)
    return credits

@api_router.post("/network/invite")
async def send_invite(emails: List[str], user: dict = Depends(get_current_user)):
    user_id = user["_id"]
    credits = await db.network_credits.find_one({"user_id": user_id})
    referral_code = credits.get("referral_code") if credits else secrets.token_urlsafe(8)
    
    # In production, send actual emails
    # For now, just log the invites
    for email in emails:
        await db.invites.insert_one({
            "id": str(uuid.uuid4()),
            "inviter_id": user_id,
            "invitee_email": email,
            "referral_code": referral_code,
            "status": "sent",
            "created_at": datetime.now(timezone.utc)
        })
    
    return {"message": f"Invites sent to {len(emails)} people", "referral_code": referral_code}

@api_router.post("/network/redeem")
async def redeem_credits(amount: int, method: str, user: dict = Depends(get_current_user)):
    user_id = user["_id"]
    credits = await db.network_credits.find_one({"user_id": user_id})
    
    if not credits or credits.get("credits_available", 0) < amount:
        raise HTTPException(status_code=400, detail="Insufficient credits")
    
    valid_methods = ["direct_deposit", "paypal", "membership", "donation"]
    if method not in valid_methods:
        raise HTTPException(status_code=400, detail="Invalid redemption method")
    
    redemption = {
        "amount": amount,
        "method": method,
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "status": "pending"
    }
    
    await db.network_credits.update_one(
        {"user_id": user_id},
        {
            "$inc": {"credits_available": -amount},
            "$push": {"redemptions": redemption}
        }
    )
    
    return {"message": "Redemption request submitted"}

# ===================== COMMISSION TRACKER ROUTES =====================

@api_router.get("/commissions")
async def get_commissions(user: dict = Depends(get_current_user)):
    user_id = user["_id"]
    
    # Get all introductions
    intros = await db.introductions.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    # Calculate stats
    earned = [i for i in intros if i.get("status") == "earned"]
    pending = [i for i in intros if i.get("status") in ["introduced", "in-review", "closed"]]
    
    total_earned = sum(i.get("commission_at_close", 0) for i in earned)
    active_residual = sum(i.get("monthly_residual", 0) for i in earned)
    pending_value = sum(i.get("commission_at_close", 0) for i in pending)
    
    return {
        "total_earned": total_earned,
        "active_residual": active_residual,
        "pending_commissions": pending_value,
        "introductions": intros,
        "earned_count": len(earned),
        "pending_count": len(pending)
    }

# ===================== EDUCATION HUB ROUTES =====================

@api_router.get("/education/content")
async def get_education_content(user: dict = Depends(get_current_user)):
    profile = user.get("profile", {})
    career_track = profile.get("career_track", "")
    industries = profile.get("industries", [])
    
    # Get relevant content based on profile
    content = await db.education_content.find({}, {"_id": 0}).to_list(100)
    
    # Filter and score content
    scored = []
    for item in content:
        score = 0
        item_tracks = item.get("tracks", [])
        item_industries = item.get("industries", [])
        
        if career_track in item_tracks:
            score += 10
        for ind in industries:
            if ind in item_industries:
                score += 5
        
        scored.append({**item, "relevance_score": score})
    
    scored.sort(key=lambda x: x["relevance_score"], reverse=True)
    return {"content": scored[:10]}

# ===================== USER SUBMISSION ROUTES =====================

@api_router.post("/submissions")
async def submit_platform(data: UserSubmission):
    submission = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc)
    }
    await db.submissions.insert_one(submission)
    return {"message": "Thanks for the suggestion. We review every submission and update the database regularly."}

# ===================== ADMIN ROUTES =====================

@api_router.get("/admin/submissions")
async def get_submissions(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    submissions = await db.submissions.find({}, {"_id": 0}).to_list(1000)
    return {"submissions": submissions}

@api_router.patch("/admin/submissions/{submission_id}")
async def review_submission(submission_id: str, action: str, user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    if action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    await db.submissions.update_one(
        {"id": submission_id},
        {"$set": {"status": action + "d", "reviewed_at": datetime.now(timezone.utc)}}
    )
    return {"message": f"Submission {action}d"}

@api_router.get("/admin/users")
async def get_all_users(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return {"users": users}

@api_router.get("/admin/stats")
async def get_admin_stats(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    total_users = await db.users.count_documents({})
    total_platforms = await db.platforms.count_documents({})
    total_bundles = await db.bundles.count_documents({})
    total_introductions = await db.introductions.count_documents({})
    pending_submissions = await db.submissions.count_documents({"status": "pending"})
    
    return {
        "total_users": total_users,
        "total_platforms": total_platforms,
        "total_bundles": total_bundles,
        "total_introductions": total_introductions,
        "pending_submissions": pending_submissions
    }

# ===================== DASHBOARD DATA =====================

@api_router.get("/dashboard")
async def get_dashboard_data(user: dict = Depends(get_current_user)):
    user_id = user["_id"]
    profile = user.get("profile", {})
    
    # Get commission stats
    intros = await db.introductions.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    earned = [i for i in intros if i.get("status") == "earned"]
    total_earned = sum(i.get("commission_at_close", 0) for i in earned)
    active_residual = sum(i.get("monthly_residual", 0) for i in earned)
    pending = sum(i.get("commission_at_close", 0) for i in intros if i.get("status") in ["introduced", "in-review", "closed"])
    
    # Get top matches
    matches = await calculate_matches(profile) if profile else []
    
    # Get network credits
    credits = await db.network_credits.find_one({"user_id": user_id}, {"_id": 0})
    
    # Income goal progress
    income_goal_map = {
        "500-1k": 750,
        "1k-3k": 2000,
        "3k-10k": 6500,
        "10k+": 15000
    }
    goal = income_goal_map.get(profile.get("income_goal", "1k-3k"), 2000)
    monthly_income = active_residual + (total_earned / 12 if total_earned else 0)
    progress = min(100, (monthly_income / goal) * 100) if goal else 0
    
    return {
        "earnings": {
            "total_earned": total_earned,
            "active_residual": active_residual,
            "pending": pending,
            "monthly_goal": goal,
            "progress": round(progress, 1)
        },
        "top_matches": matches[:3],
        "recent_introductions": intros[:5],
        "network_credits": {
            "available": credits.get("credits_available", 0) if credits else 0,
            "this_month": sum(
                a.get("credit_value", 0) for a in (credits.get("activity_log", []) if credits else [])
                if a.get("date", "").startswith(datetime.now().strftime("%Y-%m"))
            )
        }
    }

# ===================== SEED DATA =====================

async def seed_admin(db_instance):
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@connectclub.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db_instance.users.find_one({"email": admin_email})
    
    if existing is None:
        hashed = hash_password(admin_password)
        await db_instance.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Admin",
            "role": "admin",
            "onboarding_completed": True,
            "created_at": datetime.now(timezone.utc)
        })
        logging.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db_instance.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logging.info("Admin password updated")

async def seed_platforms(db_instance):
    """Seed gig platforms organized by track"""
    existing = await db_instance.platforms.count_documents({})
    if existing > 0:
        return
    
    platforms = [
        # Hospitality Track
        {"id": str(uuid.uuid4()), "name": "Instawork", "url": "https://instawork.com", "short_description": "On-demand staffing for hospitality and warehouse jobs", "full_description": "Connect with flexible shifts at restaurants, hotels, and warehouses in your area.", "tracks": ["hospitality"], "category": "Staffing", "barrier_to_entry": "low", "barrier_notes": "Quick onboarding", "income_type": "active", "pay_structure": "Hourly", "estimated_earnings": "$15-25/hr", "time_to_first_dollar": "Same week", "geographic_availability": "Major US cities", "mobile_friendly": True, "requires_certification": False, "certification_notes": "", "estimated_tax_impact": "medium", "is_1099_likely": True, "status": "active", "last_verified": "2024-01-15", "user_submitted": False, "date_added": "2024-01-01"},
        {"id": str(uuid.uuid4()), "name": "Qwick", "url": "https://qwick.com", "short_description": "Flexible hospitality shifts for experienced professionals", "full_description": "Work premium events and establishments with competitive pay.", "tracks": ["hospitality"], "category": "Staffing", "barrier_to_entry": "medium", "barrier_notes": "Experience required", "income_type": "active", "pay_structure": "Hourly", "estimated_earnings": "$18-35/hr", "time_to_first_dollar": "1-2 weeks", "geographic_availability": "Major US cities", "mobile_friendly": True, "requires_certification": False, "certification_notes": "", "estimated_tax_impact": "medium", "is_1099_likely": True, "status": "active", "last_verified": "2024-01-15", "user_submitted": False, "date_added": "2024-01-01"},
        {"id": str(uuid.uuid4()), "name": "Cozymeal", "url": "https://cozymeal.com", "short_description": "Host cooking classes and culinary experiences", "full_description": "Share your culinary skills by hosting cooking classes and food experiences.", "tracks": ["hospitality"], "category": "Experiences", "barrier_to_entry": "medium", "barrier_notes": "Culinary skills required", "income_type": "semi-passive", "pay_structure": "Per class", "estimated_earnings": "$50-200/class", "time_to_first_dollar": "2-4 weeks", "geographic_availability": "Nationwide", "mobile_friendly": True, "requires_certification": False, "certification_notes": "", "estimated_tax_impact": "medium", "is_1099_likely": True, "status": "active", "last_verified": "2024-01-15", "user_submitted": False, "date_added": "2024-01-01"},
        {"id": str(uuid.uuid4()), "name": "GigSmart", "url": "https://gigsmart.com", "short_description": "Local gigs across multiple industries", "full_description": "Find flexible work in hospitality, events, retail, and more.", "tracks": ["hospitality", "entry-level"], "category": "Staffing", "barrier_to_entry": "low", "barrier_notes": "", "income_type": "active", "pay_structure": "Hourly", "estimated_earnings": "$12-22/hr", "time_to_first_dollar": "Same week", "geographic_availability": "Nationwide", "mobile_friendly": True, "requires_certification": False, "certification_notes": "", "estimated_tax_impact": "medium", "is_1099_likely": True, "status": "active", "last_verified": "2024-01-15", "user_submitted": False, "date_added": "2024-01-01"},
        # Entry-Level Track
        {"id": str(uuid.uuid4()), "name": "TaskRabbit", "url": "https://taskrabbit.com", "short_description": "Help with everyday tasks and errands", "full_description": "Get paid to help people with moving, furniture assembly, cleaning, and more.", "tracks": ["entry-level"], "category": "Tasks", "barrier_to_entry": "low", "barrier_notes": "", "income_type": "active", "pay_structure": "Hourly", "estimated_earnings": "$20-50/hr", "time_to_first_dollar": "1 week", "geographic_availability": "Major cities", "mobile_friendly": True, "requires_certification": False, "certification_notes": "", "estimated_tax_impact": "medium", "is_1099_likely": True, "status": "active", "last_verified": "2024-01-15", "user_submitted": False, "date_added": "2024-01-01"},
        {"id": str(uuid.uuid4()), "name": "DoorDash", "url": "https://doordash.com/dasher", "short_description": "Deliver food and earn on your schedule", "full_description": "Be your own boss as a Dasher. Deliver when you want, earn what you need.", "tracks": ["entry-level"], "category": "Delivery", "barrier_to_entry": "low", "barrier_notes": "Vehicle required", "income_type": "active", "pay_structure": "Per delivery + tips", "estimated_earnings": "$15-25/hr", "time_to_first_dollar": "Same week", "geographic_availability": "Nationwide", "mobile_friendly": True, "requires_certification": False, "certification_notes": "", "estimated_tax_impact": "medium", "is_1099_likely": True, "status": "active", "last_verified": "2024-01-15", "user_submitted": False, "date_added": "2024-01-01"},
        {"id": str(uuid.uuid4()), "name": "Instacart", "url": "https://shoppers.instacart.com", "short_description": "Shop and deliver groceries for customers", "full_description": "Earn money shopping for and delivering groceries in your area.", "tracks": ["entry-level"], "category": "Delivery", "barrier_to_entry": "low", "barrier_notes": "Vehicle required", "income_type": "active", "pay_structure": "Per batch + tips", "estimated_earnings": "$15-25/hr", "time_to_first_dollar": "Same week", "geographic_availability": "Nationwide", "mobile_friendly": True, "requires_certification": False, "certification_notes": "", "estimated_tax_impact": "medium", "is_1099_likely": True, "status": "active", "last_verified": "2024-01-15", "user_submitted": False, "date_added": "2024-01-01"},
        {"id": str(uuid.uuid4()), "name": "Fiverr", "url": "https://fiverr.com", "short_description": "Offer freelance services starting at $5", "full_description": "Create gigs for writing, design, video, programming, and more.", "tracks": ["entry-level", "career-professional"], "category": "Freelance", "barrier_to_entry": "low", "barrier_notes": "", "income_type": "active", "pay_structure": "Per gig", "estimated_earnings": "$5-500+/gig", "time_to_first_dollar": "1-2 weeks", "geographic_availability": "Worldwide", "mobile_friendly": True, "requires_certification": False, "certification_notes": "", "estimated_tax_impact": "medium", "is_1099_likely": True, "status": "active", "last_verified": "2024-01-15", "user_submitted": False, "date_added": "2024-01-01"},
        {"id": str(uuid.uuid4()), "name": "Wyzant", "url": "https://wyzant.com", "short_description": "Online tutoring across all subjects", "full_description": "Set your own rates and teach students in subjects you know.", "tracks": ["entry-level", "career-professional"], "category": "Tutoring", "barrier_to_entry": "medium", "barrier_notes": "Subject expertise required", "income_type": "active", "pay_structure": "Hourly", "estimated_earnings": "$25-80/hr", "time_to_first_dollar": "1-2 weeks", "geographic_availability": "Online", "mobile_friendly": True, "requires_certification": False, "certification_notes": "", "estimated_tax_impact": "medium", "is_1099_likely": True, "status": "active", "last_verified": "2024-01-15", "user_submitted": False, "date_added": "2024-01-01"},
        # Career Professional Track
        {"id": str(uuid.uuid4()), "name": "Catalant", "url": "https://catalant.com", "short_description": "High-level consulting for Fortune 500 companies", "full_description": "Connect with enterprise clients for strategic consulting projects.", "tracks": ["career-professional"], "category": "Consulting", "barrier_to_entry": "high", "barrier_notes": "Senior experience required", "income_type": "active", "pay_structure": "Project-based", "estimated_earnings": "$150-400/hr", "time_to_first_dollar": "2-4 weeks", "geographic_availability": "Worldwide", "mobile_friendly": False, "requires_certification": False, "certification_notes": "", "estimated_tax_impact": "high", "is_1099_likely": True, "status": "active", "last_verified": "2024-01-15", "user_submitted": False, "date_added": "2024-01-01"},
        {"id": str(uuid.uuid4()), "name": "Expert360", "url": "https://expert360.com", "short_description": "Premium consulting marketplace", "full_description": "Access high-value consulting engagements with top organizations.", "tracks": ["career-professional"], "category": "Consulting", "barrier_to_entry": "high", "barrier_notes": "Senior experience required", "income_type": "active", "pay_structure": "Project-based", "estimated_earnings": "$100-300/hr", "time_to_first_dollar": "2-4 weeks", "geographic_availability": "Worldwide", "mobile_friendly": False, "requires_certification": False, "certification_notes": "", "estimated_tax_impact": "high", "is_1099_likely": True, "status": "active", "last_verified": "2024-01-15", "user_submitted": False, "date_added": "2024-01-01"},
        {"id": str(uuid.uuid4()), "name": "Clarity.fm", "url": "https://clarity.fm", "short_description": "Get paid for phone consultations", "full_description": "Share your expertise through paid phone calls with entrepreneurs.", "tracks": ["career-professional"], "category": "Consulting", "barrier_to_entry": "medium", "barrier_notes": "Expertise in a field required", "income_type": "semi-passive", "pay_structure": "Per minute", "estimated_earnings": "$1-10/min", "time_to_first_dollar": "1-2 weeks", "geographic_availability": "Worldwide", "mobile_friendly": True, "requires_certification": False, "certification_notes": "", "estimated_tax_impact": "medium", "is_1099_likely": True, "status": "active", "last_verified": "2024-01-15", "user_submitted": False, "date_added": "2024-01-01"},
        {"id": str(uuid.uuid4()), "name": "Toptal", "url": "https://toptal.com", "short_description": "Top 3% of freelance talent network", "full_description": "Join an elite network of developers, designers, and finance experts.", "tracks": ["career-professional"], "category": "Freelance", "barrier_to_entry": "high", "barrier_notes": "Rigorous screening process", "income_type": "active", "pay_structure": "Hourly/Project", "estimated_earnings": "$60-200/hr", "time_to_first_dollar": "2-4 weeks", "geographic_availability": "Worldwide", "mobile_friendly": False, "requires_certification": False, "certification_notes": "", "estimated_tax_impact": "high", "is_1099_likely": True, "status": "active", "last_verified": "2024-01-15", "user_submitted": False, "date_added": "2024-01-01"},
        {"id": str(uuid.uuid4()), "name": "Upwork", "url": "https://upwork.com", "short_description": "World's largest freelance marketplace", "full_description": "Find remote work across development, design, writing, and more.", "tracks": ["entry-level", "career-professional"], "category": "Freelance", "barrier_to_entry": "low", "barrier_notes": "", "income_type": "active", "pay_structure": "Hourly/Project", "estimated_earnings": "$15-150/hr", "time_to_first_dollar": "1-2 weeks", "geographic_availability": "Worldwide", "mobile_friendly": True, "requires_certification": False, "certification_notes": "", "estimated_tax_impact": "medium", "is_1099_likely": True, "status": "active", "last_verified": "2024-01-15", "user_submitted": False, "date_added": "2024-01-01"},
    ]
    
    await db_instance.platforms.insert_many(platforms)
    logging.info(f"Seeded {len(platforms)} platforms")

async def seed_bundles(db_instance):
    """Seed HLS service bundles"""
    existing = await db_instance.bundles.count_documents({})
    if existing > 0:
        return
    
    bundles = [
        {
            "id": str(uuid.uuid4()),
            "name": "The Always-Open",
            "target_client": "Local service businesses (HVAC, plumbing, contractors)",
            "ideal_client_profile": "Service businesses that miss calls after hours or during busy periods. They need someone answering phones 24/7 without hiring full-time staff.",
            "services": ["Phone Support", "Live Chat", "Basic SEO"],
            "conversation_starter": "Do you ever miss calls when you're on a job? What if someone answered every call, 24/7, for less than a part-time hire?",
            "commission_at_close": 150,
            "monthly_residual": 25,
            "twelve_month_value": 450,
            "tier": "bundled"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "The Digital Storefront",
            "target_client": "E-commerce / Shopify sellers",
            "ideal_client_profile": "Online sellers drowning in customer messages and order issues. They need help managing customer inquiries without losing sales.",
            "services": ["Live Chat", "Email Support", "Order Processing", "Content Writing"],
            "conversation_starter": "How much time do you spend answering 'where's my order?' emails? What if that was handled for you?",
            "commission_at_close": 200,
            "monthly_residual": 35,
            "twelve_month_value": 620,
            "tier": "bundled"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "The Practice Builder",
            "target_client": "Dentists, law firms, real estate offices",
            "ideal_client_profile": "Professional practices that need a polished front desk presence without the overhead. Looking to reduce no-shows and improve client experience.",
            "services": ["Phone Support", "Virtual Assistant", "Bookkeeping", "Content Writing"],
            "conversation_starter": "How many appointments do you lose to no-shows or missed calls? What would it mean to have a dedicated team handling that?",
            "commission_at_close": 250,
            "monthly_residual": 40,
            "twelve_month_value": 730,
            "tier": "bundled"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "The Launch Pad",
            "target_client": "New businesses / startups",
            "ideal_client_profile": "New business owners who need professional presence from day one. They want to look established without enterprise costs.",
            "services": ["Website Design", "Logo & Graphics", "SEO", "Social Media", "Live Chat"],
            "conversation_starter": "Starting a business is hard enough. What if you could launch with a professional website, logo, and online presence—all handled for you?",
            "commission_at_close": 300,
            "monthly_residual": 50,
            "twelve_month_value": 900,
            "tier": "bundled"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "The Back Office",
            "target_client": "Established SMBs needing admin relief",
            "ideal_client_profile": "Growing businesses where the owner is still doing bookkeeping, data entry, and admin tasks. They need to delegate to grow.",
            "services": ["Virtual Assistant", "Data Entry", "Accounting", "Email Support"],
            "conversation_starter": "How many hours a week do you spend on admin work that isn't growing your business? What if you got those hours back?",
            "commission_at_close": 175,
            "monthly_residual": 30,
            "twelve_month_value": 535,
            "tier": "bundled"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "The Visibility Engine",
            "target_client": "Businesses with no digital presence",
            "ideal_client_profile": "Established businesses that rely on word-of-mouth but are invisible online. They're losing customers to competitors who show up in search.",
            "services": ["SEO", "Social Media", "Content Writing", "Video Animation"],
            "conversation_starter": "When someone searches for what you do, do they find you or your competitor? What would it mean to show up first?",
            "commission_at_close": 225,
            "monthly_residual": 45,
            "twelve_month_value": 765,
            "tier": "bundled"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "The Client Experience",
            "target_client": "Service businesses focused on retention",
            "ideal_client_profile": "Businesses where customer experience is everything. They want to wow clients from first contact through ongoing support.",
            "services": ["Live Chat", "Phone Support", "Email Support", "CRM Assistance"],
            "conversation_starter": "What's the first impression customers get when they reach out? What if every interaction felt premium?",
            "commission_at_close": 175,
            "monthly_residual": 30,
            "twelve_month_value": 535,
            "tier": "bundled"
        }
    ]
    
    await db_instance.bundles.insert_many(bundles)
    logging.info(f"Seeded {len(bundles)} bundles")

async def seed_education_content(db_instance):
    """Seed education hub content"""
    existing = await db_instance.education_content.count_documents({})
    if existing > 0:
        return
    
    content = [
        {"id": str(uuid.uuid4()), "title": "What to say when a restaurant owner complains about missed calls", "type": "article", "duration": "2 min read", "category": "Conversation Starters", "tracks": ["hospitality"], "industries": ["food-beverage", "hospitality"], "content": "Start with empathy, then pivot to solution..."},
        {"id": str(uuid.uuid4()), "title": "How to introduce back-office support to a growing business", "type": "article", "duration": "3 min read", "category": "Conversation Starters", "tracks": ["career-professional"], "industries": ["retail", "e-commerce"], "content": "Focus on the hours they'll get back..."},
        {"id": str(uuid.uuid4()), "title": "Understanding your 1099 tax obligations", "type": "article", "duration": "3 min read", "category": "Tax Basics", "tracks": ["hospitality", "entry-level", "career-professional"], "industries": [], "content": "As an independent contractor, you're responsible for..."},
        {"id": str(uuid.uuid4()), "title": "The 'I already have a guy' objection", "type": "video", "duration": "90 sec", "category": "Objection Responses", "tracks": ["hospitality", "career-professional"], "industries": [], "content": "When they say they're covered, here's how to respond..."},
        {"id": str(uuid.uuid4()), "title": "Commission structures explained", "type": "article", "duration": "2 min read", "category": "Commission Explained", "tracks": ["hospitality", "entry-level", "career-professional"], "industries": [], "content": "At Close vs Monthly Residual - here's how it works..."},
    ]
    
    await db_instance.education_content.insert_many(content)
    logging.info(f"Seeded {len(content)} education content items")

async def write_test_credentials():
    """Write test credentials to file"""
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@connectclub.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    
    credentials = f"""# ConnectClub Test Credentials

## Admin Account
- Email: {admin_email}
- Password: {admin_password}
- Role: admin

## Auth Endpoints
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login
- POST /api/auth/logout - Logout
- GET /api/auth/me - Get current user
- POST /api/auth/refresh - Refresh token
- POST /api/auth/session - Google OAuth session

## Test User (create during testing)
- Email: test@example.com
- Password: test123
- Role: member
"""
    
    Path("/app/memory").mkdir(exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write(credentials)

# ===================== APP SETUP =====================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.platforms.create_index("tracks")
    await db.platforms.create_index("status")
    await db.introductions.create_index("user_id")
    await db.tax_entries.create_index("user_id")
    await db.network_credits.create_index("user_id")
    await db.password_reset_tokens.create_index("token")
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    
    # Seed data
    await seed_admin(db)
    await seed_platforms(db)
    await seed_bundles(db)
    await seed_education_content(db)
    await write_test_credentials()
    
    logger.info("ConnectClub API started successfully")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
