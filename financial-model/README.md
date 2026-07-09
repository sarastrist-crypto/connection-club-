# ConnectClub — 5-Year Runway Model

A deterministic, month-by-month (60-month) model of the ConnectClub business,
built on the unit economics the product itself markets — and an analysis of what
happens to the bottom line when the member **referral loop drops off**.

## The finding, in one line

Losing the referral engine doesn't sink the company — it **halves it**. Same
seed, same product, same paid spend: if member-to-member referrals fade after
year one, ConnectClub gives up **~$25.8M** in cumulative five-year revenue, ends
with **48% less** recurring monthly revenue, and carries **roughly half** the
merchant portfolio. And the referral coefficient sets the *floor* of the runway —
with no referral at all, the year-one cash trough goes from a survivable **–$28K**
to a fatal **–$238K**.

## Files

| File | What it is |
|---|---|
| `connectclub_runway.py` | The model. Edit the `Assumptions` block and re-run. Prints a summary and writes `runway.csv`, `runway.json`, `report_data.json`. |
| `report_template.html` | The brand-styled report shell (Canvas charts, theme-aware). Has a `/*__DATA__*/` slot. |
| `build_report.py` | Injects `report_data.json` into the template → `connectclub-runway-analysis.html`. |
| `connectclub-runway-analysis.html` | The finished, self-contained report (open in a browser). |
| `runway.csv` / `runway.json` | Full base-vs-drop-off series for a spreadsheet. |

## Run it

```bash
python3 connectclub_runway.py   # runs the model, writes CSV/JSON
python3 build_report.py         # regenerates the HTML report from the data
```

No dependencies — Python 3 standard library only.

## How it's grounded

ConnectClub is an ISO / super-agent channel: members are the closers, ConnectClub
keeps an override on the residual portfolio they build. Every input traces back to
the app's own economics:

- **~25% of net residual** + **~$150–$500** upfront proc commission per Credit-Card-
  Processing close, and **~15%** + **~$50–$100** on Virtual-Assistant intros
  (`backend/server.py` `PROMOTIONS`, `frontend/src/pages/CommissionsPage.js`).
- The **referral loop** — `referral_code` → invites → referred actives → network
  credits (`backend/server.py` network-credits + graph routes).

All figures are taken at the conservative end of the marketed ranges and are a
**planning tool, not a forecast**. They are undiscounted and assume the residual
override compounds with only the modeled ~1.5%/mo runoff; results are sensitive to
close rate, churn, and the override retained per merchant. Per the app's own
disclaimers, all amounts are approximate.
