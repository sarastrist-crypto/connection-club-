import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import {
  Search, ExternalLink, Filter, Check, X,
  Phone, MessageSquare, Mail, Briefcase, Users,
  Globe, Smartphone, Award, DollarSign, Crown, Building2
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SERVICE_ICONS = {
  'Phone Support': Phone,
  'Live Chat': MessageSquare,
  'Email Support': Mail,
  'Virtual Assistant': Users,
  'SEO': Globe,
  'Website Design': Globe,
  'Content Writing': Briefcase,
  'Social Media': Users,
  'Accounting': DollarSign,
  'Bookkeeping': DollarSign,
  'Logo & Graphics': Award,
  'Video Animation': Award,
  'Data Entry': Briefcase,
  'Order Processing': Briefcase,
  'CRM Assistance': Users,
  'Call Center': Phone,
  'Multi-location Support': Building2,
  'Dispatch Center': Phone,
  'Patient Scheduling': Users,
  'Tenant Support Line': Phone,
};

export default function MarketplacePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [platforms, setPlatforms] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [highValueAccounts, setHighValueAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    track: 'all',
    barrier: 'all',
    income_type: 'all',
    category: 'all'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [platformsRes, bundlesRes, highValueRes] = await Promise.all([
          axios.get(`${API_URL}/api/platforms`, { withCredentials: true }),
          axios.get(`${API_URL}/api/bundles`, { withCredentials: true }),
          axios.get(`${API_URL}/api/high-value-accounts`, { withCredentials: true })
        ]);
        setPlatforms(platformsRes.data.platforms || []);
        setBundles(bundlesRes.data.bundles || []);
        setHighValueAccounts(highValueRes.data.accounts || []);
      } catch (error) {
        console.error('Marketplace fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPlatforms = platforms.filter(p => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filters.track && filters.track !== 'all' && !p.tracks?.includes(filters.track)) return false;
    if (filters.barrier && filters.barrier !== 'all' && p.barrier_to_entry !== filters.barrier) return false;
    if (filters.income_type && filters.income_type !== 'all' && p.income_type !== filters.income_type) return false;
    if (filters.category && filters.category !== 'all' && p.category !== filters.category) return false;
    return true;
  });

  const filteredBundles = bundles.filter(b => {
    if (searchQuery && !b.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredHighValue = highValueAccounts.filter(a => {
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const categories = [...new Set(platforms.map(p => p.category).filter(Boolean))];

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" data-testid="marketplace">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-medium tracking-tight">Opportunity Marketplace</h1>
            <p className="text-muted-foreground mt-1">Browse opportunities matched to your network</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="marketplace-search"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
              <TabsTrigger value="gig" data-testid="tab-gig">
                <span className="hidden sm:inline">Gig Platforms</span>
                <span className="sm:hidden">Gigs</span>
              </TabsTrigger>
              <TabsTrigger value="bundled" data-testid="tab-bundled">
                <span className="hidden sm:inline">Bundled Solutions</span>
                <span className="sm:hidden">Bundles</span>
              </TabsTrigger>
              <TabsTrigger value="high-value" data-testid="tab-high-value">
                <span className="hidden sm:inline">High-Value</span>
                <span className="sm:hidden">Premium</span>
              </TabsTrigger>
            </TabsList>

            {/* Filters (show only for gig tab) */}
            {(activeTab === 'all' || activeTab === 'gig') && (
              <div className="flex flex-wrap gap-2">
                <Select value={filters.track} onValueChange={(v) => setFilters({...filters, track: v})}>
                  <SelectTrigger className="w-[140px]" data-testid="filter-track">
                    <SelectValue placeholder="Track" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tracks</SelectItem>
                    <SelectItem value="hospitality">Hospitality</SelectItem>
                    <SelectItem value="entry-level">Entry-Level</SelectItem>
                    <SelectItem value="career-professional">Career Pro</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.barrier} onValueChange={(v) => setFilters({...filters, barrier: v})}>
                  <SelectTrigger className="w-[140px]" data-testid="filter-barrier">
                    <SelectValue placeholder="Barrier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Barriers</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.income_type} onValueChange={(v) => setFilters({...filters, income_type: v})}>
                  <SelectTrigger className="w-[140px]" data-testid="filter-income">
                    <SelectValue placeholder="Income Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="semi-passive">Semi-Passive</SelectItem>
                    <SelectItem value="passive">Passive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* All Tab */}
          <TabsContent value="all" className="space-y-8 mt-6">
            {/* High-Value Accounts Section */}
            {filteredHighValue.length > 0 && (
              <div>
                <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
                  <span className="tier-badge tier-badge-highvalue">Premium</span>
                  High-Value Accounts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredHighValue.slice(0, 2).map((account) => (
                    <HighValueCard key={account.id} account={account} onRequestConcierge={() => navigate(`/concierge/${account.id}`)} />
                  ))}
                </div>
              </div>
            )}

            {/* Bundled Solutions Section */}
            <div>
              <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
                <span className="tier-badge tier-badge-bundled">Bundled</span>
                HLS Meal Kits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBundles.map((bundle) => (
                  <BundleCard key={bundle.id} bundle={bundle} />
                ))}
              </div>
            </div>

            {/* Gig Platforms Section */}
            <div>
              <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
                <span className="tier-badge tier-badge-gig">Gig</span>
                Platforms
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlatforms.map((platform) => (
                  <PlatformCard key={platform.id} platform={platform} />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Gig Tab */}
          <TabsContent value="gig" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlatforms.map((platform) => (
                <PlatformCard key={platform.id} platform={platform} />
              ))}
            </div>
            {filteredPlatforms.length === 0 && (
              <div className="text-center py-12">
                <Filter className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No platforms match your filters</p>
              </div>
            )}
          </TabsContent>

          {/* Bundled Tab */}
          <TabsContent value="bundled" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBundles.map((bundle) => (
                <BundleCard key={bundle.id} bundle={bundle} expanded />
              ))}
            </div>
          </TabsContent>

          {/* High-Value Tab */}
          <TabsContent value="high-value" className="mt-6">
            <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">Concierge Support Available</p>
                  <p className="text-sm text-amber-800 mt-1">
                    High-value accounts come with dedicated ConnectClub support to help you navigate the introduction and close the deal.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredHighValue.map((account) => (
                <HighValueCard key={account.id} account={account} expanded onRequestConcierge={() => navigate(`/concierge/${account.id}`)} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function PlatformCard({ platform }) {
  return (
    <div className="dashboard-card card-lift" data-testid={`platform-${platform.id}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium">{platform.name}</h3>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {platform.tracks?.map((track) => (
              <span key={track} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {track}
              </span>
            ))}
          </div>
        </div>
        <span className={`status-dot ${
          platform.status === 'active' ? 'status-active' :
          platform.status === 'unverified' ? 'status-pending' :
          'status-inactive'
        }`} />
      </div>

      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{platform.short_description}</p>

      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded ${
            platform.barrier_to_entry === 'low' ? 'bg-emerald-100 text-emerald-700' :
            platform.barrier_to_entry === 'medium' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {platform.barrier_to_entry} barrier
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
            {platform.income_type}
          </span>
        </div>
        <div className="flex items-center gap-1.5 col-span-2">
          {platform.mobile_friendly && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Smartphone className="w-3 h-3" /> Mobile
            </span>
          )}
          {platform.is_1099_likely && (
            <span className="flex items-center gap-1 text-amber-600">
              <DollarSign className="w-3 h-3" /> 1099
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <a href={platform.url} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            Visit <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </a>
      </div>
    </div>
  );
}

function BundleCard({ bundle, expanded = false }) {
  return (
    <div className={`dashboard-card card-lift ${expanded ? 'col-span-1' : ''}`} data-testid={`bundle-${bundle.id}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="tier-badge tier-badge-bundled mb-2">Bundled</span>
          <h3 className="font-medium text-lg">{bundle.name}</h3>
        </div>
        <div className="text-right">
          <div className="commission-amount text-lg text-primary">${bundle.commission_at_close}</div>
          <div className="text-xs text-muted-foreground">at close</div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{bundle.target_client}</p>

      {expanded && (
        <p className="text-sm mb-4">{bundle.ideal_client_profile}</p>
      )}

      {/* Services */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {bundle.services?.map((service) => {
          const Icon = SERVICE_ICONS[service] || Briefcase;
          return (
            <span key={service} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
              <Icon className="w-3 h-3" />
              {service}
            </span>
          );
        })}
      </div>

      {expanded && bundle.conversation_starter && (
        <div className="p-3 rounded-lg bg-muted/50 mb-4">
          <p className="text-xs text-muted-foreground mb-1">Conversation starter:</p>
          <p className="text-sm italic">"{bundle.conversation_starter}"</p>
        </div>
      )}

      {/* Commission breakdown */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-border pt-3 mb-4">
        <div>
          <div className="commission-amount text-primary">${bundle.commission_at_close}</div>
          <div className="text-muted-foreground">At Close</div>
        </div>
        <div>
          <div className="commission-amount text-primary">${bundle.monthly_residual}/mo</div>
          <div className="text-muted-foreground">Residual</div>
        </div>
        <div>
          <div className="commission-amount text-emerald-600">${bundle.twelve_month_value}</div>
          <div className="text-muted-foreground">12-Month</div>
        </div>
      </div>

      <Link to={`/introductions/new?opportunity=${bundle.id}&type=bundle`}>
        <Button className="w-full">Start Introduction</Button>
      </Link>
    </div>
  );
}

function HighValueCard({ account, expanded = false, onRequestConcierge }) {
  const minCommission = account.commission_tiers?.[0]?.commission || 0;
  const maxCommission = account.commission_tiers?.[account.commission_tiers.length - 1]?.commission || 0;
  const minResidual = account.commission_tiers?.[0]?.residual || 0;
  const maxResidual = account.commission_tiers?.[account.commission_tiers.length - 1]?.residual || 0;

  return (
    <div className="dashboard-card card-lift border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-transparent" data-testid={`high-value-${account.id}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="tier-badge tier-badge-highvalue mb-2">
            <Crown className="w-3 h-3 mr-1" /> High-Value
          </span>
          <h3 className="font-medium text-lg">{account.name}</h3>
        </div>
        <div className="text-right">
          <div className="commission-amount text-lg text-amber-600">
            ${minCommission.toLocaleString()} - ${maxCommission.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">commission range</div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{account.description}</p>

      {expanded && (
        <>
          <div className="p-3 rounded-lg bg-muted/50 mb-4">
            <p className="text-xs text-muted-foreground mb-1">Target profile:</p>
            <p className="text-sm">{account.target_profile}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 mb-4">
            <p className="text-xs text-muted-foreground mb-1">Ideal client:</p>
            <p className="text-sm">{account.ideal_client}</p>
          </div>
        </>
      )}

      {/* Services */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {account.services?.slice(0, expanded ? undefined : 3).map((service) => {
          const Icon = SERVICE_ICONS[service] || Briefcase;
          return (
            <span key={service} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-amber-100 text-amber-800">
              <Icon className="w-3 h-3" />
              {service}
            </span>
          );
        })}
        {!expanded && account.services?.length > 3 && (
          <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
            +{account.services.length - 3} more
          </span>
        )}
      </div>

      {/* Contract value */}
      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-amber-800">Contract Value Range</span>
          <span className="commission-amount text-amber-900">
            ${account.contract_value_min?.toLocaleString()} - ${account.contract_value_max?.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Commission tiers */}
      {expanded && account.commission_tiers && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Commission Tiers:</p>
          <div className="space-y-2">
            {account.commission_tiers.map((tier, index) => {
              const tierKey = Object.keys(tier).find(k => k !== 'commission' && k !== 'residual');
              return (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm">
                  <span className="capitalize">{tierKey}: {tier[tierKey]}</span>
                  <div className="text-right">
                    <span className="commission-amount text-primary">${tier.commission.toLocaleString()}</span>
                    <span className="text-muted-foreground mx-1">+</span>
                    <span className="commission-amount text-emerald-600">${tier.residual}/mo</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary for non-expanded */}
      {!expanded && (
        <div className="grid grid-cols-2 gap-2 text-center text-xs border-t border-border pt-3 mb-4">
          <div>
            <div className="commission-amount text-primary">${minCommission.toLocaleString()}+</div>
            <div className="text-muted-foreground">At Close</div>
          </div>
          <div>
            <div className="commission-amount text-emerald-600">${minResidual}+/mo</div>
            <div className="text-muted-foreground">Residual</div>
          </div>
        </div>
      )}

      <Button 
        className="w-full bg-amber-600 hover:bg-amber-700" 
        onClick={onRequestConcierge}
        data-testid={`request-concierge-${account.id}`}
      >
        <Crown className="w-4 h-4 mr-2" />
        Request Concierge Support
      </Button>
    </div>
  );
}
