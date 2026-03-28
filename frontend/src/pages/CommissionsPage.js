import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Skeleton } from '../components/ui/skeleton';
import { Progress } from '../components/ui/progress';
import {
  DollarSign, TrendingUp, Clock, Award,
  Zap, Target, Calendar
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

  // Calculate monthly projection
  const monthlyProjection = data?.active_residual || 0;
  const yearlyProjection = monthlyProjection * 12;

  return (
    <Layout>
      <div className="space-y-6" data-testid="commissions-page">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-medium tracking-tight">Commission Tracker</h1>
          <p className="text-muted-foreground mt-1">Track your earnings and residual income</p>
        </div>

        {/* Main Stats */}
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

        {/* Progress to Goals */}
        <div className="dashboard-card">
          <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" /> Income Goals
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>$1,000/month floor</span>
                <span className="text-muted-foreground">{Math.min(100, Math.round((monthlyProjection / 1000) * 100))}%</span>
              </div>
              <Progress value={Math.min(100, (monthlyProjection / 1000) * 100)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>$3,000/month floor</span>
                <span className="text-muted-foreground">{Math.min(100, Math.round((monthlyProjection / 3000) * 100))}%</span>
              </div>
              <Progress value={Math.min(100, (monthlyProjection / 3000) * 100)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>$10,000/month floor</span>
                <span className="text-muted-foreground">{Math.min(100, Math.round((monthlyProjection / 10000) * 100))}%</span>
              </div>
              <Progress value={Math.min(100, (monthlyProjection / 10000) * 100)} className="h-2" />
            </div>
          </div>
        </div>

        {/* Pipeline */}
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
                      <div className="commission-amount text-emerald-600">${item.commission_at_close}</div>
                      {item.monthly_residual > 0 && (
                        <div className="text-xs text-emerald-600">+${item.monthly_residual}/mo</div>
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
                      <div className="commission-amount">${item.commission_at_close}</div>
                      <div className="text-xs text-muted-foreground">potential</div>
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
