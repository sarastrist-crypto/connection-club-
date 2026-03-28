# ConnectClub - Product Requirements Document

## Original Problem Statement
Build ConnectClub — a professional opportunity platform that operates at the intersection of curated gig and freelance income, self-employment tax management, and a network that pays the people who build it. It runs on a "Meal Kit" model for bundled opportunities through HLS (Hire Live Support).

## Architecture
- **Frontend**: React with Tailwind CSS, Shadcn UI components
- **Backend**: FastAPI with MongoDB (Motor async driver)
- **Authentication**: JWT-based auth + Emergent Google OAuth + Password Reset
- **Design System**: Forest green primary (#0F3D22), Gold accents (#D4A017)
- **Logo**: Custom SVG shield with gold dollar sign, forest green body, "ConnectClub" serif wordmark, and "YOUR NETWORK. YOUR INCOME." tagline

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

## What's Been Implemented

### March 28, 2026 - Logo & Font Update
- [x] Updated logo to premium SVG with gold shield, serif wordmark, and tagline
- [x] Increased all logo sizes globally (sidebar h-20, auth pages h-24, headers h-16)
- [x] Increased base body font to 17px, h1 to text-4xl, h2 to text-xl, hero text to text-5xl
- [x] Bumped sidebar nav, tier badges, overline text sizes

### March 28, 2026 - MVP Complete
- [x] JWT + Google OAuth authentication
- [x] Password reset flow (forgot password + reset with token)
- [x] 5-step onboarding with match reveal
- [x] Dashboard with earnings summary, top matches, activity tracker
- [x] Opportunity Marketplace with 14 gig platforms, 7 HLS bundles
- [x] Introduction Flow (4-step) with editable message templates
- [x] Tax Center with income/deduction tracking, quarterly estimates
- [x] Network Credits dashboard with referral system
- [x] Commission Tracker with pipeline visualization
- [x] Education Hub with contextual content
- [x] Admin Panel with user/submission management
- [x] User Submission Form for platform suggestions
- [x] Custom ConnectClub logo (shield with dollar sign)

### Database Seeding
- 14 gig platforms across Hospitality, Entry-Level, Career Professional tracks
- 7 HLS Meal Kit bundles
- 5 education content items
- Admin user pre-created

## Prioritized Backlog

### P0 (Critical)
- None currently

### P1 (High Priority)
- High-Value Accounts tier (Tier 3) - dedicated concierge flow
- Email integration for password reset (currently logged only)
- Email notifications for introduction status changes

### P2 (Medium Priority)
- Network map visualization (node graph)
- Leaderboard for top earners
- Profile editing
- Bulk CSV import for admin

### P3 (Nice to Have)
- Dark mode
- Mobile app
- Advanced analytics dashboard

## Next Action Items
1. Integrate email service (SendGrid/Resend) for password reset and notifications
2. Add High-Value Accounts tier with concierge support
3. Add network visualization with D3.js
4. Implement profile editing
