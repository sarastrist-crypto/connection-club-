# ConnectClub - Product Requirements Document

## Original Problem Statement
Build ConnectClub — a professional opportunity platform that operates at the intersection of curated gig and freelance income, self-employment tax management, and a network that pays the people who build it. It features bundled professional solutions to attract and serve business contacts in members' networks.

## Architecture
- **Frontend**: React with Tailwind CSS, Shadcn UI components, react-force-graph-2d
- **Backend**: FastAPI with MongoDB (Motor async driver)
- **Authentication**: JWT-based auth + Emergent Google OAuth + Password Reset
- **Design System**: Forest green primary (#0F3D22), Gold accents (#D4A017)
- **Logo**: Custom SVG shield with gold dollar sign, large serif "ConnectClub" wordmark (108px), dark green tagline

## User Personas
1. **Hospitality Professional**: Experience in restaurants, hotels, events
2. **Young Professional**: Early career, building network
3. **Career Professional**: Established career, senior connections
4. **Admin**: Platform management

## Core Requirements (Static)
1. 5-step Network Profiler onboarding
2. Member Dashboard with earnings, matches, activity, revenue banner
3. 3-Tier Opportunity Marketplace (Gig/Bundled/High-Value)
4. Introduction Flow with message templates
5. Tax Center for 1099 workers
6. Network Credits system
7. Commission Tracker
8. Education Hub
9. Admin Panel
10. User Submission Form
11. Revenue Banner with targeted promotions (ConnectClub VA, Menio Global, Imago Imaging)

## What's Been Implemented

### March 28, 2026 - Revenue Banner + Concierge Flow + Logo Updates
- [x] Revenue banner on Dashboard with 3 targeted promotions (ConnectClub VA, Menio Global, Imago Imaging)
- [x] Full user targeting based on onboarding industry/track data
- [x] Functional click tracking with ref codes (POST /api/promotions/track-click)
- [x] 30s auto-carousel with manual navigation and dismiss
- [x] ConciergePage wired into App.js routing (/concierge/:accountId)
- [x] High-Value Accounts (Tier 3) fully functional with Concierge flow
- [x] Logo updated to premium SVG with 108px serif wordmark, dark green tagline
- [x] Font sizes increased globally (body 17px, h1 text-4xl, h2 text-xl, hero text-5xl)

### March 28, 2026 - MVP Complete
- [x] JWT + Google OAuth authentication
- [x] Password reset flow (forgot password + reset with token)
- [x] 5-step onboarding with match reveal
- [x] Dashboard with earnings summary, top matches, activity tracker
- [x] Opportunity Marketplace with 14 gig platforms, 7 bundled solutions, 5 high-value accounts
- [x] Introduction Flow (4-step) with editable message templates
- [x] Tax Center with income/deduction tracking, quarterly estimates
- [x] Network Credits dashboard with referral system
- [x] Commission Tracker with pipeline visualization
- [x] Education Hub with contextual content
- [x] Admin Panel with user/submission management
- [x] User Submission Form for platform suggestions

### Database Seeding
- 14 gig platforms across Hospitality, Entry-Level, Career Professional tracks
- 7 bundled professional solutions
- 5 high-value accounts (Multi-Location Franchise, Property Mgmt, Regional Retailer, Healthcare Practice, Enterprise Service)
- 5 education content items
- Admin user pre-created

## Prioritized Backlog

### P1 (High Priority)
- Network Graph Visualization (react-force-graph-2d installed, backend endpoint exists)
- Commission Tracker data wiring (real status tracking)
- Education Hub contextual content matching
- My Network Pinpoint Opportunities + Invite Flow logic

### P2 (Medium Priority)
- Email integration (SendGrid) for password reset and notifications (blocked on API key)
- Leaderboard for top earners
- Profile editing
- Bulk CSV import for admin

### P3 (Nice to Have)
- Dark mode
- Mobile app
- Advanced analytics dashboard
- User Submission Form logic completion

## Key API Endpoints
- POST /api/auth/register, /api/auth/login, /api/auth/logout
- POST /api/auth/forgot-password, /api/auth/reset-password
- GET /api/opportunities/platforms, /api/opportunities/bundles
- GET /api/high-value-accounts, GET /api/high-value-accounts/:id
- POST /api/concierge-requests, GET /api/concierge-requests
- GET /api/promotions/targeted, POST /api/promotions/track-click
- GET /api/network/graph, GET /api/network/credits
- GET /api/commissions, GET /api/dashboard

## Next Action Items
1. Build Network Graph visualization component in NetworkPage
2. Wire Commission Tracker with real data statuses
3. Education Hub contextual content cards
4. My Network Pinpoint Opportunities
