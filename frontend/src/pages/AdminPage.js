import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import {
  Users, Briefcase, Package, FileText,
  Check, X, Download, RefreshCw,
  Settings, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, submissionsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`, { withCredentials: true }),
        axios.get(`${API_URL}/api/admin/users`, { withCredentials: true }),
        axios.get(`${API_URL}/api/admin/submissions`, { withCredentials: true })
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setSubmissions(submissionsRes.data.submissions || []);
    } catch (error) {
      console.error('Admin fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const reviewSubmission = async (submissionId, action) => {
    try {
      await axios.patch(
        `${API_URL}/api/admin/submissions/${submissionId}?action=${action}`,
        {},
        { withCredentials: true }
      );
      toast.success(`Submission ${action}d`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update submission');
    }
  };

  // Redirect non-admins
  if (user && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        </div>
      </Layout>
    );
  }

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');

  return (
    <Layout>
      <div className="space-y-6" data-testid="admin-page">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground mt-1">Manage ConnectClub platform</p>
          </div>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="dashboard-card" data-testid="stat-users">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Users</span>
            </div>
            <div className="text-2xl font-medium">{stats?.total_users || 0}</div>
          </div>
          <div className="dashboard-card" data-testid="stat-platforms">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Platforms</span>
            </div>
            <div className="text-2xl font-medium">{stats?.total_platforms || 0}</div>
          </div>
          <div className="dashboard-card" data-testid="stat-bundles">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Bundles</span>
            </div>
            <div className="text-2xl font-medium">{stats?.total_bundles || 0}</div>
          </div>
          <div className="dashboard-card" data-testid="stat-introductions">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Introductions</span>
            </div>
            <div className="text-2xl font-medium">{stats?.total_introductions || 0}</div>
          </div>
          <div className="dashboard-card" data-testid="stat-pending">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <div className="text-2xl font-medium text-amber-600">{stats?.pending_submissions || 0}</div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="submissions">
              Submissions
              {pendingSubmissions.length > 0 && (
                <Badge variant="destructive" className="ml-2">{pendingSubmissions.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="dashboard-card">
              <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Add Platform</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Package className="w-5 h-5" />
                  <span>Add Bundle</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Download className="w-5 h-5" />
                  <span>Export Data</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Button>
              </div>
            </div>

            <div className="dashboard-card">
              <h2 className="text-lg font-medium mb-4">Recent Users</h2>
              <div className="space-y-2">
                {users.slice(0, 5).map((u, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{u.name || u.email}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                      {u.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users" className="mt-6">
            <div className="dashboard-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">All Users ({users.length})</h2>
                <Input placeholder="Search users..." className="w-64" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">User</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">Role</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">Onboarding</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="py-3">
                          <div className="font-medium">{u.name || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </td>
                        <td className="py-3">
                          <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                            {u.role || 'member'}
                          </Badge>
                        </td>
                        <td className="py-3">
                          {u.onboarding_completed ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground" />
                          )}
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Submissions */}
          <TabsContent value="submissions" className="mt-6">
            <div className="dashboard-card">
              <h2 className="text-lg font-medium mb-4">Platform Submissions</h2>
              {submissions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No submissions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="p-4 rounded-lg border border-border">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{sub.platform_name}</h3>
                            <Badge variant={
                              sub.status === 'pending' ? 'outline' :
                              sub.status === 'approved' ? 'default' : 'destructive'
                            }>
                              {sub.status}
                            </Badge>
                          </div>
                          <a href={sub.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            {sub.website_url}
                          </a>
                          <p className="text-sm text-muted-foreground mt-2">{sub.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {sub.tracks?.map((track) => (
                              <span key={track} className="text-xs px-2 py-0.5 rounded bg-muted">{track}</span>
                            ))}
                          </div>
                          {sub.submitter_name && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Submitted by: {sub.submitter_name} ({sub.submitter_email})
                            </p>
                          )}
                        </div>
                        {sub.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => reviewSubmission(sub.id, 'approve')}>
                              <Check className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => reviewSubmission(sub.id, 'reject')}>
                              <X className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
