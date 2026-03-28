import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { ChevronRight, Clock, Check, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const STATUS_OPTIONS = [
  { value: 'introduced', label: 'Introduced', color: 'text-muted-foreground', bg: 'bg-muted' },
  { value: 'in-review', label: 'In Review', color: 'text-amber-600', bg: 'bg-amber-100' },
  { value: 'closed', label: 'Closed', color: 'text-blue-600', bg: 'bg-blue-100' },
  { value: 'earned', label: 'Earned', color: 'text-emerald-600', bg: 'bg-emerald-100' },
];

export default function IntroductionsPage() {
  const [introductions, setIntroductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchIntroductions();
  }, []);

  const fetchIntroductions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/introductions`, {
        withCredentials: true
      });
      setIntroductions(response.data.introductions || []);
    } catch (error) {
      console.error('Fetch introductions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (introId, newStatus) => {
    try {
      await axios.patch(
        `${API_URL}/api/introductions/${introId}/status?status=${newStatus}`,
        {},
        { withCredentials: true }
      );
      toast.success('Status updated');
      fetchIntroductions();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredIntros = introductions.filter(intro => {
    if (filter === 'all') return true;
    return intro.status === filter;
  });

  const stats = {
    total: introductions.length,
    introduced: introductions.filter(i => i.status === 'introduced').length,
    inReview: introductions.filter(i => i.status === 'in-review').length,
    closed: introductions.filter(i => i.status === 'closed').length,
    earned: introductions.filter(i => i.status === 'earned').length,
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
          </div>
          <Skeleton className="h-64" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" data-testid="introductions-page">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-medium tracking-tight">Introductions</h1>
          <p className="text-muted-foreground mt-1">Track your introduction pipeline</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="dashboard-card" onClick={() => setFilter('introduced')} role="button">
            <div className="flex items-center gap-2 mb-2">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Introduced</span>
            </div>
            <div className="text-2xl font-medium">{stats.introduced}</div>
          </div>
          <div className="dashboard-card" onClick={() => setFilter('in-review')} role="button">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-muted-foreground">In Review</span>
            </div>
            <div className="text-2xl font-medium">{stats.inReview}</div>
          </div>
          <div className="dashboard-card" onClick={() => setFilter('closed')} role="button">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Closed</span>
            </div>
            <div className="text-2xl font-medium">{stats.closed}</div>
          </div>
          <div className="dashboard-card" onClick={() => setFilter('earned')} role="button">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-muted-foreground">Earned</span>
            </div>
            <div className="text-2xl font-medium">{stats.earned}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center justify-between">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]" data-testid="intro-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="introduced">Introduced</SelectItem>
              <SelectItem value="in-review">In Review</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="earned">Earned</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">{filteredIntros.length} introductions</span>
        </div>

        {/* List */}
        {filteredIntros.length === 0 ? (
          <div className="dashboard-card text-center py-12">
            <ChevronRight className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No introductions yet. Your first one is usually the easiest.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIntros.map((intro) => {
              const statusConfig = STATUS_OPTIONS.find(s => s.value === intro.status) || STATUS_OPTIONS[0];
              return (
                <div key={intro.id} className="dashboard-card" data-testid={`intro-${intro.id}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{intro.contact_name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{intro.business_type}</p>
                      <p className="text-sm mt-1">
                        <span className="text-muted-foreground">Opportunity:</span> {intro.opportunity_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(intro.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="commission-amount text-primary">${intro.commission_at_close}</div>
                        {intro.monthly_residual > 0 && (
                          <div className="text-xs text-muted-foreground">+${intro.monthly_residual}/mo</div>
                        )}
                      </div>

                      {intro.status !== 'earned' && (
                        <Select value={intro.status} onValueChange={(v) => updateStatus(intro.id, v)}>
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
