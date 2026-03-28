# ConnectClub - Product Requirements Document

## Original Problem Statement
Build ConnectClub — a professional opportunity platform that bridges members' imported social graphs with high-value Merchant Service (Credit Card Processing) opportunities. Members import contacts, opt in individuals for analysis, and ConnectClub's AI identifies CCP candidates. Members earn residual commissions from successful introductions.

## Architecture
- **Frontend**: React with Tailwind CSS, Shadcn UI components, react-force-graph-2d
- **Backend**: FastAPI with MongoDB (Motor async driver)
- **Authentication**: JWT-based auth + Password Reset
- **Design System**: Forest green primary (#0F3D22), Gold accents (#D4A017), Dark mode support
- **Logo**: Custom SVG shield with gold dollar sign, serif "ConnectClub" wordmark (108px, letter-spacing 1.5), dark green tagline

## Core Concept: CCP Opportunity Framework
- **Core Asset**: Credit Card Processing Services (Merchant Account & Payment Gateway Optimization)
- **Standard Verbiage**: Interchange-plus, PCI compliance, Merchant Statement Analysis, POS integration, Residual Portfolio
- **All closing (proc) amounts are approximates. All monthly residuals are approximates based on volume.**
- **Member sovereignty**: ConnectClub is the researcher; the member is the closer. Never initiate contact with a lead directly.

## User Flow
1. Member imports contacts (manual, CSV, LinkedIn/FB/IG)
2. Member opts in specific individuals
3. Member verifies contact identity
4. ConnectClub AI analyzes for CCP opportunity match
5. If flagged: member notified (dashboard, email, push, SMS)
6. Member reviews analysis and initiates introduction

## What's Been Implemented

### March 28, 2026 - CCP Pivot (V2.1)
- [x] Removed: Imago Imaging, Menio Global, Network Credits, "HLS Meal Kits"
- [x] Network Page rebuilt as contact import hub (Manual Entry, CSV Upload, LinkedIn/FB/IG placeholders)
- [x] Opt-In wall + Identity Verification flow
- [x] CCP Opportunity Analysis engine (keyword-based industry matching)
- [x] Dashboard CCP Opportunities card (replaces Network Credits)
- [x] Notification system (in-app dashboard notices for flagged contacts)
- [x] Commissions page: pure CCP focus with full merchant services scope
- [x] Marketplace: "CCP Accounts" tab with blue-themed cards, "Request Merchant Analysis" CTA
- [x] Revenue Banner: CCP + VA promotions only
- [x] All amounts marked as approximates (~$, approx., est.)
- [x] "HLS Meal Kits" renamed to "Bundled Solutions"

### March 28, 2026 - Dark Mode & Logo Updates
- [x] Dark mode toggle with full theme support (CSS variables, localStorage persistence)
- [x] Logo letter-spacing fixed (T not running into C)
- [x] Tagline enlarged and made more legible (26px Georgia serif, dark green)
- [x] Global font size increase (body 17px, h1 text-4xl, hero text-5xl)

### March 28, 2026 - MVP Foundation
- [x] JWT authentication (login/register/logout)
- [x] Password reset flow (forgot + reset with token)
- [x] 5-step onboarding with match reveal
- [x] Dashboard with earnings summary, top matches, activity tracker
- [x] Opportunity Marketplace with 14 gig platforms, 7 bundled solutions, 5 CCP accounts
- [x] Introduction Flow (4-step) with editable message templates
- [x] Tax Center with income/deduction tracking, quarterly estimates
- [x] Commission Tracker with CCP pipeline visualization
- [x] Education Hub with contextual content
- [x] Admin Panel with user/submission management
- [x] User Submission Form for platform suggestions

## Key API Endpoints
- POST /api/auth/register, /api/auth/login, /api/auth/logout
- POST /api/auth/forgot-password, /api/auth/reset-password
- GET /api/opportunities/platforms, /api/opportunities/bundles
- GET /api/high-value-accounts, GET /api/high-value-accounts/:id
- POST /api/concierge-requests, GET /api/concierge-requests
- GET /api/promotions/targeted, POST /api/promotions/track-click
- GET /api/network/contacts, POST /api/network/contacts, POST /api/network/contacts/bulk
- PATCH /api/network/contacts/{id}/opt-in, PATCH /api/network/contacts/{id}/verify
- DELETE /api/network/contacts/{id}
- GET /api/notifications, PATCH /api/notifications/{id}/read
- GET /api/commissions, GET /api/dashboard

## Prioritized Backlog

### P1 (High Priority)
- Notification Suite: Email (SendGrid), SMS (Twilio), Push notifications for CCP flags
- Network Graph Visualization (react-force-graph-2d installed, backend endpoint exists)
- LinkedIn/Facebook/Instagram OAuth import integrations
- AI-powered CCP analysis (upgrade from keyword matching to LLM-based analysis)

### P2 (Medium Priority)
- Education Hub contextual content matching
- Profile editing
- Leaderboard for top earners
- Bulk CSV import improvements (duplicate detection)

### P3 (Nice to Have)
- User Submission Form logic completion
- Mobile app optimization
- Advanced analytics dashboard
