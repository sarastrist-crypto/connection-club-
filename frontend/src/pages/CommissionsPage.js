import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Skeleton } from '../components/ui/skeleton';
import {
  DollarSign, TrendingUp, Clock, Award,
  Zap, Calendar, CreditCard,
  CheckCircle2, ArrowRight, Users, Building2, ShieldCheck
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function CommissionsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/commissions`, { withCredentials: true });
        setData(response.data);
      } catch (error) {
        console.error('Fetch commissions error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCommissions();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6"><Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
        </div>
      </Layout>
    );
  }

  const earned = data?.introductions?.filter(i => i.status === 'earned') || [];
  const pending = data?.introductions?.filter(i => i.status !== 'earned') || [];
  const monthlyProjection = data?.active_residual || 0;
  const yearlyProjection = monthlyProjection * 12;

  return (
    <Layout>
      <div className="space-y-8" data-testid="commissions-page">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-medium tracking-tight">Commission Tracker</h1>
          <p className="text-muted-foreground mt-1">Track your earnings from Credit Card Processing introductions</p>
        </div>

        {/* My Earnings Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="dashboard-card" data-testid="total-earned">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Total Earned</span>
            </div>
            <div className="commission-amount text-3xl">${(data?.total_earned || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">From {data?.earned_count || 0} closed deals</p>
          </div>

          <div className="dashboard-card commission-pulse" data-testid="active-residual">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm text-muted-foreground">Active Residual (approx.)</span>
            </div>
            <div className="commission-amount text-3xl text-emerald-600">~${monthlyProjection.toLocaleString()}/mo</div>
            <p className="text-xs text-muted-foreground mt-1">~${yearlyProjection.toLocaleString()}/year projected</p>
          </div>

          <div className="dashboard-card" data-testid="pending-value">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm text-muted-foreground">Pending Value (approx.)</span>
            </div>
            <div className="commission-amount text-3xl text-amber-600">~${(data?.pending_commissions || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{data?.pending_count || 0} introductions in progress</p>
          </div>
        </div>

        {/* CCP SERVICE — Full Scope */}
        <div>
          <h2 className="text-xl font-medium mb-1">Credit Card Processing Services</h2>
          <p className="text-sm text-muted-foreground mb-5">Your primary commissionable opportunity through ConnectClub</p>
        </div>

        <div className="dashboard-card border-2 border-blue-200 dark:border-blue-800 overflow-hidden" data-testid="ccp-service-card">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Merchant Account & Payment Gateway Optimization</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Interchange-plus pricing, PCI compliance, POS integration, and residual portfolio building</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mb-1">Commission Model</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">~25%</p>
              <p className="text-sm text-blue-700 dark:text-blue-400">of Net Residual Profit</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mb-1">Approx. Closing</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">~$150 - $500</p>
              <p className="text-sm text-blue-700 dark:text-blue-400">Upfront proc commission</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mb-1">Approx. Monthly Residual</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">~$100 - $1,000+</p>
              <p className="text-sm text-blue-700 dark:text-blue-400">Based on merchant volume</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mb-1">Portfolio Asset</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">Residual</p>
              <p className="text-sm text-blue-700 dark:text-blue-400">Builds recurring income</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" /> Service Scope
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Interchange-Plus Pricing</strong> — transparent markup over true interchange, eliminating hidden rate inflation</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span><strong>PCI Compliance</strong> — full Payment Card Industry compliance support and chargeback protection included</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span><strong>POS Integration</strong> — terminal, mobile reader, virtual terminal, and e-commerce gateway solutions</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Merchant Statement Analysis</strong> — free audit of existing processing to demonstrate savings</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Next-Day Funding</strong> — qualifying businesses receive deposits within 24 hours</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Residual Portfolio</strong> — each merchant you introduce becomes a recurring income asset in your portfolio</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> Ideal Merchant Profile
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Restaurants, cafes, bars, and food service businesses</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Retail storefronts and e-commerce merchants</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Professional services (salons, spas, gyms, auto repair)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Medical and dental practices</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Any business processing $5K+/month in card transactions</span>
                </li>
              </ul>
              <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Conversation Starter</p>
                <p className="text-sm text-amber-900 dark:text-amber-200 mt-1 italic">"When was the last time you compared your credit card processing rates? Most merchants are overpaying by 20-30% and don't even know it."</p>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground italic">
              <strong>Disclaimer:</strong> All closing (proc) amounts and monthly residuals are approximates based on merchant volume and current industry interchange rates. Actual earnings may vary.
            </p>
          </div>
        </div>

        {/* Pipeline Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="dashboard-card" data-testid="earned-list">
            <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" /> Earned Commissions
            </h2>
            {earned.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No commissions earned yet</p>
                <p className="text-sm text-muted-foreground mt-1">Start by importing contacts in My Network and introducing merchants to CCP services.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {earned.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                    <div>
                      <p className="font-medium">{item.contact_name}</p>
                      <p className="text-sm text-muted-foreground">{item.opportunity_name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="commission-amount text-emerald-600">~${item.commission_at_close}</div>
                      {item.monthly_residual > 0 && (
                        <div className="text-xs text-emerald-600">+~${item.monthly_residual}/mo</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-card" data-testid="pending-list">
            <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" /> In Pipeline
            </h2>
            {pending.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No pending introductions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{item.contact_name}</p>
                      <p className="text-sm text-muted-foreground">{item.opportunity_name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        item.status === 'in-review' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                        item.status === 'closed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {item.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="commission-amount">~${item.commission_at_close}</div>
                      <div className="text-xs text-muted-foreground">est. potential</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
