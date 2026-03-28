# ConnectClub - Product Requirements Document

## Original Problem Statement
Build ConnectClub — a professional opportunity platform that operates at the intersection of curated gig and freelance income, self-employment tax management, and a network that pays the people who build it. It runs on a "Meal Kit" model for bundled opportunities through HLS (Hire Live Support).

## Architecture
- **Frontend**: React with Tailwind CSS, Shadcn UI components
- **Backend**: FastAPI with MongoDB (Motor async driver)
- **Authentication**: JWT-based auth + Emergent Google OAuth
- **Design System**: Organic & Earthy theme with forest green primary (#1A362D)

## User Personas
1. **Hospitality Professional**: Experience in restaurants, hotels, events
2. **Young Professional**: Early career, building network
3. **Career Professional**: Established career, senior connections
4. **Admin**: Platform management

## Core Requirements (Static)
1. 5-step Network Profiler onboarding
2. Member Dashboard with earnings, matches, activity
3. 3-Tier Opportunity Marketplace (Gig/Bundled/High-Value)
4. Introduction Flow with message templates
5. Tax Center for 1099 workers
6. Network Credits system
7. Commission Tracker
8. Education Hub
9. Admin Panel
10. User Submission Form

## What's Been Implemented (March 28, 2026)
### MVP Complete
- [x] JWT + Google OAuth authentication
- [x] 5-step onboarding with match reveal
- [x] Dashboard with earnings summary, top matches, activity tracker
- [x] Opportunity Marketplace with 14 gig platforms, 7 HLS bundles
- [x] Introduction Flow with editable message templates
- [x] Tax Center with income/deduction tracking, quarterly estimates
- [x] Network Credits dashboard with referral system
- [x] Commission Tracker with pipeline visualization
- [x] Education Hub with contextual content
- [x] Admin Panel with user/submission management
- [x] User Submission Form for platform suggestions

### Database Seeding
- 14 gig platforms across Hospitality, Entry-Level, Career Professional tracks
- 7 HLS Meal Kit bundles (The Always-Open, Digital Storefront, Practice Builder, Launch Pad, Back Office, Visibility Engine, Client Experience)
- 5 education content items
- Admin user pre-created

## Prioritized Backlog

### P0 (Critical)
- None currently

### P1 (High Priority)
- High-Value Accounts tier (Tier 3) - dedicated concierge flow
- Email notifications for introduction status changes
- Real invitation emails (currently logged only)

### P2 (Medium Priority)
- Network map visualization (node graph)
- Leaderboard for top earners
- Password reset flow
- Profile editing

### P3 (Nice to Have)
- Dark mode
- Mobile app
- Advanced analytics dashboard
- Bulk CSV import for admin

## Next Action Items
1. Add High-Value Accounts tier with concierge support
2. Implement email notifications via SendGrid
3. Add network visualization with D3.js or similar
4. Add forgot password/reset flow
