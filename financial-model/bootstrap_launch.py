#!/usr/bin/env python3
"""
ConnectClub — Zero-Capital Bootstrap Launch Model
===================================================

A different question than connectclub_runway.py. That model asked "what do we
lose if referrals fade on an already-funded plan." This one asks: what happens
if the broader portfolio (Cobbled Works) adds ConnectClub as a new vertical,
launched from ZERO dollars — product already built, a founding sales force
already in place, no paid-acquisition budget — and lets the member/referral
engine do all the growing?

Two pools are tracked explicitly, because they answer two different portfolio
questions:

  1. DISTRIBUTED TO MEMBERS — the commissions (upfront + residual override)
     that flow to the field. This is the "energy": what participating pays,
     which is what recruits and retains the sales force that drives the whole
     flywheel. It is not a company cash outflow — it is the ISO's payout to
     the closer, parallel to (not subtracted from) the company's own take.

  2. RETAINED BY THE COMPANY — ConnectClub's own override, out of which it
     pays referral rewards (network credits) and lean bootstrap opex. This is
     the pool that determines whether, and when, the vertical becomes a net
     cash contributor back to the portfolio.

Because there is no seed, month-1 cash is $0 and the model tracks the ACTUAL
funding gap during ramp — the deepest point the portfolio would need to
backstop — and the month the vertical crosses into being self-sustaining and
then a net contributor.

Same unit economics as connectclub_runway.py (CCP/VA commission model from
the app), just re-run from a zero-capital, sales-force-led starting position.
Stdlib only. Run: python3 bootstrap_launch.py
"""

import csv
import json
import os
from dataclasses import dataclass, asdict

HORIZON = 60  # months (5 years)


@dataclass
class BootstrapAssumptions:
    # --- Starting state: zero capital, product built, sales force in place ---
    start_cash: float = 0.0
    founding_sales_force: int = 60     # reps on day one — product is built, they start selling
    start_merchants: int = 0           # greenfield portfolio

    # --- Growth: no paid channel (zero dollars) — the field IS the GTM engine.
    # Recruiting the next rep is part of the job (an ISO agent-network norm, not a
    # passive courtesy referral), so this coefficient is materially higher than the
    # "nice-to-have" referral loop modeled in the funded plan (connectclub_runway.py). ---
    paid_adds_per_month: float = 0.0
    cac: float = 0.0
    referral_coeff: float = 0.11       # new active reps / active rep / mo — the sole growth lever
    member_churn: float = 0.05         # monthly rep attrition
    referral_reward: float = 45.0      # network-credit cost per referred active rep (paid from company take)

    # --- Production ---
    closes_per_member: float = 0.35    # closed merchant intros / active rep / mo
    merchant_runoff: float = 0.015     # monthly residual-portfolio attrition

    # --- Company (ConnectClub / portfolio) retained economics ---
    cc_upfront_per_close: float = 150.0
    cc_residual_per_merchant: float = 55.0

    # --- Member (sales force) distributed economics — the "energy" ---
    member_upfront_per_close: float = 300.0
    member_residual_per_merchant: float = 95.0

    # --- Lean bootstrap opex: no salaried acquisition team, product already built ---
    fixed_opex_start: float = 15_000.0   # compliance, support, light maintenance
    fixed_opex_growth: float = 0.012     # step-up as the field + portfolio scale


def simulate(a: BootstrapAssumptions):
    members = float(a.founding_sales_force)
    merchants = float(a.start_merchants)
    cash = a.start_cash
    cum_distributed = 0.0
    cum_retained = 0.0
    rows = []

    for m in range(1, HORIZON + 1):
        referred = members * a.referral_coeff
        churned_members = members * a.member_churn
        members = max(0.0, members + referred - churned_members)

        new_merchants = members * a.closes_per_member
        churned_merchants = merchants * a.merchant_runoff
        merchants = max(0.0, merchants + new_merchants - churned_merchants)

        # Company (retained) side
        company_residual = merchants * a.cc_residual_per_merchant
        company_upfront = new_merchants * a.cc_upfront_per_close
        company_revenue = company_residual + company_upfront

        referral_cost = referred * a.referral_reward
        fixed_opex = a.fixed_opex_start * ((1 + a.fixed_opex_growth) ** (m - 1))
        company_net = company_revenue - referral_cost - fixed_opex
        cash += company_net
        cum_retained += company_revenue

        # Member (distributed) side — parallel pool, not a company cash outflow
        member_residual = merchants * a.member_residual_per_merchant
        member_upfront = new_merchants * a.member_upfront_per_close
        member_distributed = member_residual + member_upfront
        cum_distributed += member_distributed

        rows.append({
            "month": m,
            "members": round(members, 1),
            "referred_adds": round(referred, 1),
            "merchants": round(merchants, 1),
            "new_merchants": round(new_merchants, 1),
            "company_residual": round(company_residual, 0),
            "company_upfront": round(company_upfront, 0),
            "company_revenue": round(company_revenue, 0),
            "referral_cost": round(referral_cost, 0),
            "fixed_opex": round(fixed_opex, 0),
            "company_net": round(company_net, 0),
            "cash": round(cash, 0),
            "cum_retained": round(cum_retained, 0),
            "member_residual": round(member_residual, 0),
            "member_upfront": round(member_upfront, 0),
            "member_distributed": round(member_distributed, 0),
            "cum_distributed": round(cum_distributed, 0),
        })
    return rows


def first_operating_breakeven(rows):
    for r in rows:
        if r["company_net"] >= 0:
            return r["month"]
    return None


def deepest_gap(rows):
    worst = min(rows, key=lambda r: r["cash"])
    return worst["month"], worst["cash"]


def cash_positive_and_holds(rows):
    """First month cash >= 0 and stays >= 0 for every subsequent month."""
    for i, r in enumerate(rows):
        if r["cash"] >= 0 and all(x["cash"] >= 0 for x in rows[i:]):
            return r["month"]
    return None


def yr_slices(rows):
    return {y: rows[y * 12 - 1] for y in range(1, 6)}


def main():
    a = BootstrapAssumptions()
    rows = simulate(a)
    here = os.path.dirname(os.path.abspath(__file__))

    with open(os.path.join(here, "bootstrap.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(list(rows[0].keys()))
        for r in rows:
            w.writerow(list(r.values()))

    opbe = first_operating_breakeven(rows)
    gap_month, gap_cash = deepest_gap(rows)
    durable = cash_positive_and_holds(rows)

    headline = {
        "operating_breakeven_month": opbe,
        "deepest_funding_gap_month": gap_month,
        "deepest_funding_gap_cash": gap_cash,
        "durable_cash_positive_month": durable,
        "total_distributed_5yr": rows[-1]["cum_distributed"],
        "total_retained_5yr": rows[-1]["cum_retained"],
        "total_value_created_5yr": rows[-1]["cum_distributed"] + rows[-1]["cum_retained"],
        "ending_members": rows[-1]["members"],
        "ending_merchants": rows[-1]["merchants"],
        "ending_cash": rows[-1]["cash"],
        "ending_company_mrr": rows[-1]["company_residual"],
        "ending_member_mrr": rows[-1]["member_residual"],
    }

    # Sensitivity: how hard does the field need to recruit? (this replaces the
    # "referral drop-off" question from connectclub_runway.py — here the
    # portfolio-relevant lever is recruiting INTENSITY, since there's no paid
    # channel to fall back on.)
    sens = []
    for coeff in [0.07, 0.09, 0.11, 0.13, 0.15, 0.18]:
        aa = BootstrapAssumptions()
        aa.referral_coeff = coeff
        r = simulate(aa)
        gm, gc = deepest_gap(r)
        sens.append({
            "coeff": coeff,
            "funding_gap": gc,
            "gap_month": gm,
            "breakeven_month": first_operating_breakeven(r),
            "durable_month": cash_positive_and_holds(r),
            "ending_reps": r[-1]["members"],
            "dist5": r[-1]["cum_distributed"],
            "retain5": r[-1]["cum_retained"],
            "total5": r[-1]["cum_distributed"] + r[-1]["cum_retained"],
        })

    report = {"assumptions": asdict(a), "series": rows, "headline": headline, "sensitivity": sens}
    with open(os.path.join(here, "bootstrap_data.json"), "w") as f:
        json.dump(report, f, indent=2)

    def money(x):
        return f"${x:,.0f}"

    print("=" * 78)
    print("ConnectClub — Zero-Capital Bootstrap Launch Model")
    print("=" * 78)
    print(f"Start cash: $0 | Founding sales force: {a.founding_sales_force} reps | "
          f"Start merchants: {a.start_merchants}")
    print(f"No paid acquisition — referral coeff {a.referral_coeff}/rep/mo is the entire GTM engine")
    print()
    print("END-OF-YEAR")
    print(f"{'Yr':>3} {'Reps':>7} {'Merch':>8} {'Co MRR':>10} {'Rep MRR':>10} "
          f"{'Co net/mo':>11} {'Cash':>13} {'Cum dist.':>13} {'Cum retain':>13}")
    for y, r in yr_slices(rows).items():
        print(f"{y:>3} {r['members']:>7,.0f} {r['merchants']:>8,.0f} "
              f"{money(r['company_residual']):>10} {money(r['member_residual']):>10} "
              f"{money(r['company_net']):>11} {money(r['cash']):>13} "
              f"{money(r['cum_distributed']):>13} {money(r['cum_retained']):>13}")
    print()
    print("-" * 78)
    print("HEADLINE — LAUNCHING FROM ZERO")
    print("-" * 78)
    print(f"Deepest funding gap:      {money(gap_cash)} at month {gap_month} "
          f"(what the portfolio needs to backstop during ramp)")
    print(f"Operating breakeven:      month {opbe} (company revenue clears referral cost + opex)")
    print(f"Durable cash-positive:    month {durable} (never dips negative again)")
    print(f"5-yr distributed to reps: {money(headline['total_distributed_5yr'])}")
    print(f"5-yr retained by company: {money(headline['total_retained_5yr'])}")
    print(f"5-yr total value created: {money(headline['total_value_created_5yr'])}")
    print(f"Ending sales force:       {headline['ending_members']:,.0f} reps")
    print(f"Ending merchant book:     {headline['ending_merchants']:,.0f} accounts")
    print("=" * 78)
    print("Wrote bootstrap.csv and bootstrap_data.json")


if __name__ == "__main__":
    main()
