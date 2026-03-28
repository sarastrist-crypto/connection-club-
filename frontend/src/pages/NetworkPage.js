import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import {
  Users, Copy, Send, Gift, DollarSign,
  TrendingUp, Link2, Award, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function NetworkPage() {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmails, setInviteEmails] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/network/credits`, {
        withCredentials: true
      });
      setCredits(response.data);
    } catch (error) {
      console.error('Fetch credits error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${credits?.referral_code || ''}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied');
  };

  const sendInvites = async () => {
    const emails = inviteEmails.split(',').map(e => e.trim()).filter(Boolean);
    if (emails.length === 0) {
      toast.error('Enter at least one email');
      return;
    }

    setSending(true);
    try {
      await axios.post(`${API_URL}/api/network/invite`, emails, {
        withCredentials: true
      });
      toast.success(`Invites sent to ${emails.length} people`);
      setInviteEmails('');
    } catch (error) {
      toast.error('Failed to send invites');
    } finally {
      setSending(false);
    }
  };

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

  const recentActivity = credits?.activity_log?.slice(-10).reverse() || [];

  return (
    <Layout>
      <div className="space-y-6" data-testid="network-page">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-medium tracking-tight">My Network</h1>
          <p className="text-muted-foreground mt-1">Build your network, earn credits, get rewarded</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="dashboard-card" data-testid="credits-lifetime">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Lifetime Credits</span>
            </div>
            <div className="text-3xl font-medium">{credits?.credits_lifetime || 0}</div>
          </div>

          <div className="dashboard-card" data-testid="credits-available">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Gift className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm text-muted-foreground">Available to Redeem</span>
            </div>
            <div className="text-3xl font-medium text-emerald-600">{credits?.credits_available || 0}</div>
          </div>

          <div className="dashboard-card" data-testid="referral-code">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-muted-foreground">Your Referral Code</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-lg font-mono">{credits?.referral_code || '...'}</code>
              <Button variant="ghost" size="icon" onClick={copyReferralLink}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Invite Section */}
        <div className="dashboard-card" data-testid="invite-section">
          <h2 className="text-lg font-medium mb-4">Invite Your Network</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Earn credits when people you invite join and complete their profile. Share your unique link or send email invites.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter emails, separated by commas"
              value={inviteEmails}
              onChange={(e) => setInviteEmails(e.target.value)}
              className="flex-1"
              data-testid="invite-emails"
            />
            <Button onClick={sendInvites} disabled={sending} data-testid="send-invites">
              <Send className="w-4 h-4 mr-2" /> Send Invites
            </Button>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Your referral link:</p>
            <div className="flex items-center gap-2">
              <code className="text-sm flex-1 truncate">
                {window.location.origin}/register?ref={credits?.referral_code || ''}
              </code>
              <Button variant="outline" size="sm" onClick={copyReferralLink}>
                <Copy className="w-3 h-3 mr-1" /> Copy
              </Button>
            </div>
          </div>
        </div>

        {/* How to Earn */}
        <div className="dashboard-card">
          <h2 className="text-lg font-medium mb-4">How to Earn Credits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-medium">Refer a Member</span>
              </div>
              <p className="text-sm text-muted-foreground">+50 credits when they complete profile setup</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">Connect to Opportunity</span>
              </div>
              <p className="text-sm text-muted-foreground">+25 credits per successful introduction</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <ExternalLink className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Share Platform Link</span>
              </div>
              <p className="text-sm text-muted-foreground">+10 credits per verified click-through</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <Gift className="w-5 h-5 text-amber-600" />
                <span className="font-medium">Sponsored Introduction</span>
              </div>
              <p className="text-sm text-muted-foreground">Variable credits for member-to-member intros</p>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="dashboard-card" data-testid="activity-log">
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No activity yet. Start inviting your network!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium capitalize">{activity.event_type?.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                  <span className="commission-amount text-emerald-600">+{activity.credit_value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Redemption Options */}
        <div className="dashboard-card">
          <h2 className="text-lg font-medium mb-4">Redeem Credits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" disabled={credits?.credits_available < 100}>
              <DollarSign className="w-5 h-5" />
              <span>Cash Out</span>
              <span className="text-xs text-muted-foreground">Min. 100 credits</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" disabled={credits?.credits_available < 50}>
              <Gift className="w-5 h-5" />
              <span>Apply to Membership</span>
              <span className="text-xs text-muted-foreground">Min. 50 credits</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" disabled={credits?.credits_available < 25}>
              <Users className="w-5 h-5" />
              <span>Donate</span>
              <span className="text-xs text-muted-foreground">Min. 25 credits</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 opacity-50" disabled>
              <Award className="w-5 h-5" />
              <span>More Options</span>
              <span className="text-xs text-muted-foreground">Coming soon</span>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
