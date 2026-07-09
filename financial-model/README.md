# ConnectClub — Financial Models

Two deterministic, month-by-month (60-month) models of the ConnectClub
business, both built on the unit economics the product itself markets. They
answer two different portfolio questions:

| Model | Question | Report |
|---|---|---|
| `connectclub_runway.py` | We're already funded. What happens if the member **referral loop drops off**? | `connectclub-runway-analysis.html` |
| `bootstrap_launch.py` | We're **not** funded yet. What does launching ConnectClub from **zero capital** cost and return the portfolio? | `connectclub-bootstrap-launch.html` |

## Model 1 — 5-Year Runway (referral drop-off risk)

Starts from a funded position ($1M seed, 200 members, 250 merchants,
paid-acquisition budget) and asks what happens if member-to-member referrals
fade after year one.

**The finding:** losing the referral engine doesn't sink the company — it
**halves it**. Same seed, same product, same paid spend: the drop-off case
gives up **~$25.8M** in cumulative five-year revenue, ends with **48% less**
recurring monthly revenue, and carries **roughly half** the merchant
portfolio. The referral coefficient sets the *floor* of the runway — with no
referral at all, the year-one cash trough goes from a survivable **–$28K** to
a fatal **–$238K**.

## Model 2 — Zero-Capital Bootstrap Launch (portfolio addition case)

Starts from **$0** — product already built, a founding sales force of 60 reps
already in place, no paid-acquisition budget — and asks what it costs and
returns to add ConnectClub to the portfolio from a standing start.

**The finding:** the capital ask is a **~$46K bridge** (deepest point, month
8), not a war chest. Company revenue clears its own recruiting cost and
overhead by **month 9**; the vertical never needs outside cash again after
**month 15**. By year five: **$18.4M** distributed to participating members
in commissions and **$10.4M** retained by the company — **$28.8M** of total
value created from a standing start. A recruiting-intensity sensitivity table
shows the lever the portfolio actually controls: how aggressively the field
recruits, not how much capital it's given.

## Files

| File | What it is |
|---|---|
| `connectclub_runway.py` | Model 1. Edit the `Assumptions` block and re-run. Writes `runway.csv`, `runway.json`, `report_data.json`. |
| `report_template.html` / `build_report.py` | Model 1's brand-styled report shell + injector → `connectclub-runway-analysis.html`. |
| `bootstrap_launch.py` | Model 2. Edit the `BootstrapAssumptions` block and re-run. Writes `bootstrap.csv`, `bootstrap_data.json`. |
| `bootstrap_report_template.html` / `build_bootstrap_report.py` | Model 2's report shell + injector → `connectclub-bootstrap-launch.html`. |
| `runway.csv` / `runway.json` / `bootstrap.csv` | Full series for a spreadsheet. |

## Run it

```bash
# Model 1 — funded plan, referral drop-off risk
python3 connectclub_runway.py
python3 build_report.py

# Model 2 — zero-capital launch, portfolio addition case
python3 bootstrap_launch.py
python3 build_bootstrap_report.py
```

No dependencies — Python 3 standard library only.

## How both are grounded

ConnectClub is an ISO / super-agent channel: members are the closers, the
company keeps an override on the residual portfolio they build. Every input
traces back to the app's own economics:

- **~25% of net residual** + **~$150–$500** upfront proc commission per
  Credit-Card-Processing close, and **~15%** + **~$50–$100** on
  Virtual-Assistant intros (`backend/server.py` `PROMOTIONS`,
  `frontend/src/pages/CommissionsPage.js`).
- The **referral / recruiting loop** — `referral_code` → invites → referred
  actives → network credits (`backend/server.py` network-credits + graph
  routes). Model 1 treats this as a supplementary growth channel alongside
  paid acquisition; Model 2 treats it as the *entire* go-to-market engine,
  since there's no acquisition budget to fall back on.

In Model 2, member commissions are tracked as a **parallel payout pool** (the
ISO's commission to the closer) — not a company cash outflow, and not
subtracted from company revenue. The two pools are reported side by side
because they answer different questions: what the field earns, and what the
company (and by extension the portfolio) retains.

All figures are taken at the conservative end of the marketed ranges and are
a **planning tool, not a forecast**. They are undiscounted and assume the
residual override compounds with only the modeled ~1.5%/mo runoff; results
are sensitive to close rate, churn, recruiting intensity, and the override
retained per merchant — all exposed as tunable assumptions. Per the app's own
disclaimers, all commission amounts are approximate.
