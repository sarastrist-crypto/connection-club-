import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Skeleton } from '../components/ui/skeleton';
import {
  DollarSign, TrendingUp, Clock, Award,
  Zap, Calendar, CreditCard, Microscope,
  CheckCircle2, ArrowRight, Users, Building2
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function CommissionsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/commissions`, {
          withCredentials: true
        });
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
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
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
          <p className="text-muted-foreground mt-1">Track your earnings and explore commissionable services</p>
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
              <span className="text-sm text-muted-foreground">Active Residual</span>
            </div>
            <div className="commission-amount text-3xl text-emerald-600">${monthlyProjection.toLocaleString()}/mo</div>
            <p className="text-xs text-muted-foreground mt-1">${yearlyProjection.toLocaleString()}/year projected</p>
          </div>

          <div className="dashboard-card" data-testid="pending-value">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm text-muted-foreground">Pending Value</span>
            </div>
            <div className="commission-amount text-3xl text-amber-600">${(data?.pending_commissions || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{data?.pending_count || 0} introductions in progress</p>
          </div>
        </div>

        {/* ═══════ COMMISSIONABLE SERVICES ═══════ */}
        <div>
          <h2 className="text-xl font-medium mb-1">Commissionable Services</h2>
          <p className="text-sm text-muted-foreground mb-5">Detailed breakdown of partner programs you can earn from</p>
        </div>

        {/* MENIO GLOBAL — Credit Card Processing */}
        <div className="dashboard-card border-2 border-blue-200 overflow-hidden" data-testid="menio-global-card">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Menio Global Credit Processing</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Merchant payment processing with ConnectClub-exclusive rates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Commission Model</p>
              <p className="text-2xl font-bold text-blue-900">25%</p>
              <p className="text-sm text-blue-700">of Net Residual Profit</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Approx. Closing Payout</p>
              <p className="text-2xl font-bold text-blue-900">~$150 - $300</p>
              <p className="text-sm text-blue-700">Upfront equipment commission</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Est. Monthly Residual</p>
              <p className="text-2xl font-bold text-emerald-700">~$100 - $1,000+</p>
              <p className="text-sm text-blue-700">Based on merchant volume</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" /> Service Details
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Reduce merchant processing fees by up to 30% vs. current provider</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Zero setup fees for ConnectClub partner merchants</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>POS terminal, mobile reader, and virtual terminal solutions</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Next-day funding for qualifying businesses</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Chargeback protection and PCI compliance included</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> Ideal Client
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Restaurants, cafes, and food service businesses</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Retail stores and e-commerce merchants</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Professional services (salons, spas, gyms)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Any business processing $5K+/month in card transactions</span>
                </li>
              </ul>
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs font-semibold text-amber-800">Conversation Starter</p>
                <p className="text-sm text-amber-900 mt-1 italic">"When was the last time you compared your credit card processing rates? Most merchants are overpaying by 20-30% and don't even know it."</p>
              </div>
            </div>
          </div>
        </div>

        {/* IMAGO IMAGING */}
        <div className="dashboard-card border-2 border-violet-200 overflow-hidden" data-testid="imago-imaging-card">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
              <Microscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Imago Imaging</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Diagnostic AI software for medical and dental practices</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="p-4 rounded-lg bg-violet-50 border border-violet-100">
              <p className="text-xs text-violet-600 font-semibold uppercase tracking-wider mb-1">Commission Model</p>
              <p className="text-2xl font-bold text-violet-900">10%</p>
              <p className="text-sm text-violet-700">Enterprise License Fee</p>
            </div>
            <div className="p-4 rounded-lg bg-violet-50 border border-violet-100">
              <p className="text-xs text-violet-600 font-semibold uppercase tracking-wider mb-1">Approx. Closing Payout</p>
              <p className="text-2xl font-bold text-violet-900">~$1,000 - $2,500</p>
              <p className="text-sm text-violet-700">High-ticket software sale</p>
            </div>
            <div className="p-4 rounded-lg bg-violet-50 border border-violet-100">
              <p className="text-xs text-violet-600 font-semibold uppercase tracking-wider mb-1">Est. Per-Scan Residual</p>
              <p className="text-2xl font-bold text-emerald-700">~$5 - $10</p>
              <p className="text-sm text-violet-700">Per "Scan-as-a-Service" transaction</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Microscope className="w-4 h-4 text-violet-600" /> Service Details
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                  <span>AI-powered diagnostic overlays for X-rays, CT, and MRI imaging</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                  <span>High-definition image enhancement for superior diagnostic accuracy</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                  <span>HIPAA-compliant cloud platform with secure data handling</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                  <span>Integrates with existing PACS systems and EHR workflows</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                  <span>Scan-as-a-Service model: no large upfront hardware investment</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-600" /> Ideal Client
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                  <span>Multi-physician practices and medical groups</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                  <span>Dental offices and orthodontic practices</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                  <span>Specialty clinics (orthopedics, radiology, dermatology)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                  <span>Veterinary clinics with imaging equipment</span>
                </li>
              </ul>
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs font-semibold text-amber-800">Conversation Starter</p>
                <p className="text-sm text-amber-900 mt-1 italic">"How confident are your providers in their diagnostic reads? Imago's AI overlay catches findings that human eyes can miss — and it pays for itself in malpractice risk reduction alone."</p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ PIPELINE TRACKER ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Earned */}
          <div className="dashboard-card" data-testid="earned-list">
            <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" /> Earned Commissions
            </h2>
            {earned.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No commissions earned yet</p>
                <p className="text-sm text-muted-foreground mt-1">Start introducing businesses to Menio Global or Imago to earn.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {earned.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
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

          {/* Pending */}
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
                        item.status === 'in-review' ? 'bg-amber-100 text-amber-700' :
                        item.status === 'closed' ? 'bg-blue-100 text-blue-700' :
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
