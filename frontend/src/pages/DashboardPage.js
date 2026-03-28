import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Skeleton } from '../components/ui/skeleton';
import {
  DollarSign, TrendingUp, Clock, ChevronRight,
  Briefcase, AlertTriangle, Users, ExternalLink
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/dashboard`, {
          withCredentials: true
        });
        setData(response.data);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const earnings = data?.earnings || { total_earned: 0, active_residual: 0, pending: 0, monthly_goal: 2000, progress: 0 };
  const topMatches = data?.top_matches || [];
  const recentIntros = data?.recent_introductions || [];
  const networkCredits = data?.network_credits || { available: 0, this_month: 0 };

  return (
    <Layout>
      <div className="space-y-8" data-testid="dashboard">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-medium tracking-tight">Dashboard</h1>
          <p className="text-base text-muted-foreground mt-1">Your command center for opportunities and earnings</p>
        </div>

        {/* Earnings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-enter">
          <div className="dashboard-card" data-testid="total-earned-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Total Earned</span>
            </div>
            <div className="commission-amount text-2xl">${earnings.total_earned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </div>

          <div className="dashboard-card" data-testid="residual-income-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm text-muted-foreground">Active Residual</span>
            </div>
            <div className="commission-amount text-2xl text-emerald-600">${earnings.active_residual.toLocaleString()}/mo</div>
            <p className="text-xs text-muted-foreground mt-1">Monthly floor</p>
          </div>

          <div className="dashboard-card" data-testid="pending-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <div className="commission-amount text-2xl text-amber-600">${earnings.pending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">In pipeline</p>
          </div>

          <div className="dashboard-card" data-testid="goal-progress-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Monthly Goal</span>
              <span className="text-sm font-medium">{Math.round(earnings.progress)}%</span>
            </div>
            <Progress value={earnings.progress} className="h-3 mb-2" />
            <p className="text-xs text-muted-foreground">
              ${Math.round(earnings.active_residual).toLocaleString()} of ${earnings.monthly_goal.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Matches */}
          <div className="lg:col-span-2 dashboard-card" data-testid="top-matches-panel">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium">Top Matches</h2>
              <Link to="/marketplace">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {topMatches.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Complete your profile to see matched opportunities</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topMatches.map((match, index) => (
                  <div
                    key={match.id || index}
                    className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                    data-testid={`match-${index}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`tier-badge ${match.type === 'bundle' ? 'tier-badge-bundled' : 'tier-badge-gig'}`}>
                            {match.type}
                          </span>
                          <span className="text-xs text-muted-foreground">{match.match_score}% match</span>
                        </div>
                        <h3 className="font-medium">{match.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{match.description}</p>
                      </div>
                      {match.type === 'bundle' && (
                        <div className="text-right ml-4 flex-shrink-0">
                          <div className="commission-amount text-primary">${match.commission_at_close}</div>
                          <div className="text-xs text-muted-foreground">at close</div>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Link to={`/introductions/new?opportunity=${match.id}&type=${match.type}`}>
                        <Button size="sm">Start Introduction</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Network Credits */}
            <div className="dashboard-card" data-testid="network-credits-card">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-medium">Network Credits</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Available</span>
                  <span className="commission-amount">{networkCredits.available}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="commission-amount text-emerald-600">+{networkCredits.this_month}</span>
                </div>
              </div>
              <Link to="/network" className="block mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  View Network
                </Button>
              </Link>
            </div>

            {/* Tax Center Alert */}
            <div className="tax-callout tax-callout-warning" data-testid="tax-alert">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Quarterly Tax Reminder</p>
                  <p className="text-sm mt-1">
                    Set aside approximately 25-30% of every payment for self-employment taxes.
                  </p>
                  <Link to="/tax-center">
                    <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-amber-900">
                      Open Tax Center <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Tracker */}
        <div className="dashboard-card" data-testid="activity-tracker">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">Recent Activity</h2>
            <Link to="/introductions">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {recentIntros.length === 0 ? (
            <div className="text-center py-8">
              <ChevronRight className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No introductions logged yet. Your first one is usually the easiest.</p>
              <Link to="/marketplace" className="inline-block mt-4">
                <Button>Browse Opportunities</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">Contact</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">Opportunity</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {recentIntros.map((intro, index) => (
                    <tr key={intro.id || index} className="border-b border-border last:border-0">
                      <td className="py-3">
                        <div className="font-medium">{intro.contact_name}</div>
                        <div className="text-xs text-muted-foreground">{intro.business_type}</div>
                      </td>
                      <td className="py-3 text-sm">{intro.opportunity_name}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          intro.status === 'earned' ? 'text-emerald-600' :
                          intro.status === 'closed' ? 'text-blue-600' :
                          intro.status === 'in-review' ? 'text-amber-600' :
                          'text-muted-foreground'
                        }`}>
                          <span className={`status-dot ${
                            intro.status === 'earned' ? 'status-active' :
                            intro.status === 'closed' || intro.status === 'in-review' ? 'status-pending' :
                            'bg-muted-foreground'
                          }`} />
                          {intro.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="commission-amount">${intro.commission_at_close}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
