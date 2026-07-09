#!/usr/bin/env python3
"""
ConnectClub — 5-Year Runway Model
=================================

A month-by-month (60-month) model of the ConnectClub business, built on the
unit economics the product itself markets (see backend/server.py PROMOTIONS
and frontend/src/pages/CommissionsPage.js):

  - Members are the closers. They earn ~25% of net residual profit plus a
    ~$150-$500 upfront "proc" commission on each Credit Card Processing (CCP)
    introduction, and ~15% residual + ~$50-$100 upfront on Virtual Assistant
    (VA) introductions.
  - ConnectClub is the ISO/super-agent channel: it retains an override on the
    residual portfolio its members generate, and a share of each upfront.
  - The member base grows two ways: PAID acquisition (a fixed budget / CAC)
    and the REFERRAL loop (each member gets a referral_code, invites contacts,
    and referred people who onboard become active members — rewarded in
    network credits).

The referral loop is ConnectClub's cheapest growth. This model quantifies what
happens to the bottom line and the cash runway if that referral loop DROPS OFF.

Everything below is an explicit, tunable planning assumption. All figures are
deliberately conservative (low end of the app's marketed ranges). Stdlib only;
run:  python3 connectclub_runway.py
Outputs: prints summary tables, writes runway.csv and runway.json alongside.
"""

import csv
import json
import os
from dataclasses import dataclass, field, asdict

HORIZON = 60  # months (5 years)


# --------------------------------------------------------------------------- #
# Assumptions                                                                 #
# --------------------------------------------------------------------------- #
@dataclass
class Assumptions:
    # --- Starting state (month 0) ---
    start_cash: float = 1_000_000.0        # seed capital on hand
    start_members: int = 200               # active members at month 0
    start_merchants: int = 250             # active residual accounts at month 0

    # --- Member acquisition ---
    paid_adds_per_month: float = 100.0     # members from paid channels / mo
    cac: float = 120.0                     # blended cost per paid member acquired
    referral_coeff: float = 0.05           # NEW active members / active member / mo (the loop)
    member_churn: float = 0.05             # monthly member attrition
    referral_reward: float = 45.0          # network-credit cost per referred active member

    # --- Production (what an active member generates) ---
    closes_per_member: float = 0.35        # closed merchant introductions / active member / mo
    merchant_runoff: float = 0.015         # monthly residual-portfolio attrition

    # --- ConnectClub retained economics (net, after member payout & partner cut) ---
    cc_upfront_per_close: float = 150.0    # one-time net to ConnectClub per closed merchant
    cc_residual_per_merchant: float = 55.0 # recurring net to ConnectClub / active merchant / mo

    # --- Member-facing economics (for tie-back to the app; not company P&L) ---
    member_upfront_per_close: float = 300.0
    member_residual_per_merchant: float = 95.0

    # --- Operating expense ---
    fixed_opex_start: float = 185_000.0    # team + infra + compliance / mo at month 0
    fixed_opex_growth: float = 0.02        # monthly step-up in fixed opex (hiring/scale)

    # --- Referral drop-off scenario ---
    dropoff_start: int = 12                # month the referral loop begins to fade
    dropoff_floor: float = 0.005           # residual referral coeff after collapse (~90% gone)
    dropoff_halflife: float = 4.0          # months for the loop to halve toward the floor


def referral_coeff_at(a: Assumptions, month: int, dropoff: bool) -> float:
    """Referral coefficient for a given month, with optional decay."""
    if not dropoff or month < a.dropoff_start:
        return a.referral_coeff
    # exponential decay from base toward the floor after dropoff_start
    t = month - a.dropoff_start
    decay = 0.5 ** (t / a.dropoff_halflife)
    return a.dropoff_floor + (a.referral_coeff - a.dropoff_floor) * decay


# --------------------------------------------------------------------------- #
# Simulation                                                                  #
# --------------------------------------------------------------------------- #
def simulate(a: Assumptions, dropoff: bool):
    members = float(a.start_members)
    merchants = float(a.start_merchants)
    cash = a.start_cash
    rows = []

    for m in range(1, HORIZON + 1):
        g_ref = referral_coeff_at(a, m, dropoff)

        # --- growth ---
        referred = members * g_ref
        paid = a.paid_adds_per_month
        churned_members = members * a.member_churn
        members = members + referred + paid - churned_members
        members = max(members, 0.0)

        # --- production: new merchants onto the recurring portfolio ---
        new_merchants = members * a.closes_per_member
        churned_merchants = merchants * a.merchant_runoff
        merchants = merchants + new_merchants - churned_merchants
        merchants = max(merchants, 0.0)

        # --- ConnectClub revenue ---
        residual_rev = merchants * a.cc_residual_per_merchant      # recurring (MRR)
        upfront_rev = new_merchants * a.cc_upfront_per_close        # one-time
        revenue = residual_rev + upfront_rev

        # --- costs ---
        paid_cac_cost = paid * a.cac
        referral_cost = referred * a.referral_reward
        fixed_opex = a.fixed_opex_start * ((1 + a.fixed_opex_growth) ** (m - 1))
        opex = paid_cac_cost + referral_cost + fixed_opex

        net_income = revenue - opex
        cash += net_income

        rows.append({
            "month": m,
            "referral_coeff": round(g_ref, 5),
            "members": round(members, 1),
            "referred_adds": round(referred, 1),
            "merchants": round(merchants, 1),
            "new_merchants": round(new_merchants, 1),
            "mrr_residual": round(residual_rev, 0),
            "upfront_rev": round(upfront_rev, 0),
            "revenue": round(revenue, 0),
            "cac_cost": round(paid_cac_cost, 0),
            "referral_cost": round(referral_cost, 0),
            "fixed_opex": round(fixed_opex, 0),
            "opex": round(opex, 0),
            "net_income": round(net_income, 0),
            "cash": round(cash, 0),
        })
    return rows


def find_runway(rows):
    """First month cash goes <= 0, else None (survives the horizon)."""
    for r in rows:
        if r["cash"] <= 0:
            return r["month"]
    return None


def find_breakeven(rows):
    """First month net_income >= 0 sustainably."""
    for r in rows:
        if r["net_income"] >= 0:
            return r["month"]
    return None


def cumulative(rows, key):
    return sum(r[key] for r in rows)


# --------------------------------------------------------------------------- #
# Reporting                                                                   #
# --------------------------------------------------------------------------- #
def yr_slices(rows):
    """Return end-of-year rows (months 12,24,36,48,60)."""
    return {y: rows[y * 12 - 1] for y in range(1, 6)}


def main():
    a = Assumptions()
    base = simulate(a, dropoff=False)
    drop = simulate(a, dropoff=True)

    here = os.path.dirname(os.path.abspath(__file__))

    # ---- CSV (both scenarios side by side) ----
    with open(os.path.join(here, "runway.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["month",
                    "base_members", "base_merchants", "base_revenue", "base_mrr",
                    "base_net_income", "base_cash",
                    "drop_members", "drop_merchants", "drop_revenue", "drop_mrr",
                    "drop_net_income", "drop_cash",
                    "revenue_gap", "cash_gap"])
        for b, d in zip(base, drop):
            w.writerow([b["month"],
                        b["members"], b["merchants"], b["revenue"], b["mrr_residual"],
                        b["net_income"], b["cash"],
                        d["members"], d["merchants"], d["revenue"], d["mrr_residual"],
                        d["net_income"], d["cash"],
                        round(b["revenue"] - d["revenue"], 0),
                        round(b["cash"] - d["cash"], 0)])

    # ---- JSON (full series + headline metrics, for the report) ----
    summary = {
        "assumptions": asdict(a),
        "horizon_months": HORIZON,
        "base": base,
        "dropoff": drop,
        "headline": {
            "base_runway_month": find_runway(base),
            "dropoff_runway_month": find_runway(drop),
            "base_breakeven_month": find_breakeven(base),
            "dropoff_breakeven_month": find_breakeven(drop),
            "base_cumulative_revenue": cumulative(base, "revenue"),
            "dropoff_cumulative_revenue": cumulative(drop, "revenue"),
            "base_ending_mrr": base[-1]["mrr_residual"],
            "dropoff_ending_mrr": drop[-1]["mrr_residual"],
            "base_ending_members": base[-1]["members"],
            "dropoff_ending_members": drop[-1]["members"],
            "base_ending_merchants": base[-1]["merchants"],
            "dropoff_ending_merchants": drop[-1]["merchants"],
            "base_ending_cash": base[-1]["cash"],
            "dropoff_ending_cash": drop[-1]["cash"],
        },
    }
    with open(os.path.join(here, "runway.json"), "w") as f:
        json.dump(summary, f, indent=2)

    # ---- report_data.json: compact, self-contained feed for the HTML report ----
    a_early = Assumptions()
    a_early.dropoff_start = 6
    early = simulate(a_early, dropoff=True)

    a_zero = Assumptions()
    a_zero.referral_coeff = 0.0
    zero = simulate(a_zero, dropoff=False)

    def slim(rows):
        return [{"m": r["month"], "cash": r["cash"], "rev": r["revenue"],
                 "mrr": r["mrr_residual"], "mem": r["members"],
                 "mer": r["merchants"], "net": r["net_income"]} for r in rows]

    sens = []
    for g in [0.0, 0.02, 0.035, 0.05, 0.065, 0.08]:
        aa = Assumptions()
        aa.referral_coeff = g
        r = simulate(aa, dropoff=False)
        sens.append({
            "coeff": g,
            "yr5_members": r[-1]["members"],
            "yr5_merchants": r[-1]["merchants"],
            "yr5_mrr": r[-1]["mrr_residual"],
            "cum_rev": cumulative(r, "revenue"),
            "yr5_cash": r[-1]["cash"],
            "min_cash": min(x["cash"] for x in r),
        })

    report = {
        "assumptions": asdict(a),
        "scenarios": {
            "base": slim(base),
            "dropoff": slim(drop),
            "early": slim(early),
            "zero": slim(zero),
        },
        "min_cash": {
            "base": min(x["cash"] for x in base),
            "dropoff": min(x["cash"] for x in drop),
            "early": min(x["cash"] for x in early),
            "zero": min(x["cash"] for x in zero),
        },
        "sensitivity": sens,
        "headline": summary["headline"],
    }
    with open(os.path.join(here, "report_data.json"), "w") as f:
        json.dump(report, f, indent=2)

    # ---- console report ----
    def money(x):
        return f"${x:,.0f}"

    print("=" * 78)
    print("ConnectClub — 5-Year Runway Model")
    print("=" * 78)
    print(f"Seed cash: {money(a.start_cash)} | Start members: {a.start_members} | "
          f"Start merchants: {a.start_merchants}")
    print(f"Referral coeff (base): {a.referral_coeff}/active member/mo | "
          f"Drop-off from month {a.dropoff_start} → floor {a.dropoff_floor}")
    print()

    hb, hd = summary["headline"], summary["headline"]
    print("END-OF-YEAR — BASELINE (referral loop intact)")
    print(f"{'Yr':>3} {'Members':>9} {'Merchants':>10} {'MRR':>12} "
          f"{'Revenue/mo':>12} {'Net/mo':>12} {'Cash':>14}")
    for y, r in yr_slices(base).items():
        print(f"{y:>3} {r['members']:>9,.0f} {r['merchants']:>10,.0f} "
              f"{money(r['mrr_residual']):>12} {money(r['revenue']):>12} "
              f"{money(r['net_income']):>12} {money(r['cash']):>14}")
    print()
    print("END-OF-YEAR — REFERRAL DROP-OFF")
    print(f"{'Yr':>3} {'Members':>9} {'Merchants':>10} {'MRR':>12} "
          f"{'Revenue/mo':>12} {'Net/mo':>12} {'Cash':>14}")
    for y, r in yr_slices(drop).items():
        print(f"{y:>3} {r['members']:>9,.0f} {r['merchants']:>10,.0f} "
              f"{money(r['mrr_residual']):>12} {money(r['revenue']):>12} "
              f"{money(r['net_income']):>12} {money(r['cash']):>14}")
    print()
    print("-" * 78)
    print("HEADLINE IMPACT OF THE REFERRAL DROP-OFF")
    print("-" * 78)
    h = summary["headline"]
    print(f"Cumulative 5-yr revenue:  base {money(h['base_cumulative_revenue'])}  "
          f"vs drop {money(h['dropoff_cumulative_revenue'])}  "
          f"(gap {money(h['base_cumulative_revenue'] - h['dropoff_cumulative_revenue'])})")
    print(f"Ending MRR (month 60):    base {money(h['base_ending_mrr'])}  "
          f"vs drop {money(h['dropoff_ending_mrr'])}  "
          f"(gap {money(h['base_ending_mrr'] - h['dropoff_ending_mrr'])})")
    print(f"Ending members:           base {h['base_ending_members']:,.0f}  "
          f"vs drop {h['dropoff_ending_members']:,.0f}")
    print(f"Ending merchants:         base {h['base_ending_merchants']:,.0f}  "
          f"vs drop {h['dropoff_ending_merchants']:,.0f}")
    print(f"Ending cash:              base {money(h['base_ending_cash'])}  "
          f"vs drop {money(h['dropoff_ending_cash'])}")
    print(f"Breakeven month:          base {h['base_breakeven_month']}  "
          f"vs drop {h['dropoff_breakeven_month']}")
    br = h['base_runway_month'] or '>60 (survives)'
    dr = h['dropoff_runway_month'] or '>60 (survives)'
    print(f"Cash runway (mo to $0):   base {br}  vs drop {dr}")
    print("=" * 78)
    print("Wrote runway.csv and runway.json")


if __name__ == "__main__":
    main()
