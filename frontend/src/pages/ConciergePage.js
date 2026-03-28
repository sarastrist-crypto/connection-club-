import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import {
  ChevronLeft, Crown, Loader2, Check, Building2,
  Phone, Mail, Users, DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ConciergePage() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    contact_name: '',
    company_name: '',
    estimated_locations: 1,
    contact_email: '',
    contact_phone: '',
    notes: '',
    relationship: 'working'
  });

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/high-value-accounts/${accountId}`, {
          withCredentials: true
        });
        setAccount(response.data);
      } catch (error) {
        console.error('Fetch account error:', error);
        toast.error('Account not found');
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, [accountId, navigate]);

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.contact_name || !formData.company_name) {
      toast.error('Please fill in required fields');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/concierge-requests`, {
        high_value_account_id: accountId,
        ...formData
      }, { withCredentials: true });

      setSubmitted(true);
    } catch (error) {
      toast.error('Failed to submit request');
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48" />
        </div>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-medium mb-4">Concierge Request Submitted</h1>
          <p className="text-muted-foreground mb-6">
            Our team will contact you within 24 hours to help you navigate this high-value opportunity.
            We'll work together to craft the perfect approach and support you through the close.
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/marketplace')}>
              Browse More Opportunities
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="ml-3">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const minCommission = account?.commission_tiers?.[0]?.commission || 0;
  const maxCommission = account?.commission_tiers?.[account.commission_tiers.length - 1]?.commission || 0;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto" data-testid="concierge-page">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <span className="tier-badge tier-badge-highvalue">
              <Crown className="w-3 h-3 mr-1" /> High-Value
            </span>
          </div>
          <h1 className="text-3xl font-medium tracking-tight">{account?.name}</h1>
          <p className="text-muted-foreground mt-1">Request concierge support for this opportunity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="dashboard-card space-y-6">
              <h2 className="text-lg font-medium">Prospect Information</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_name">Contact Name *</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => updateFormData('contact_name', e.target.value)}
                    placeholder="John Smith"
                    className="mt-2"
                    required
                    data-testid="concierge-contact-name"
                  />
                </div>
                <div>
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => updateFormData('company_name', e.target.value)}
                    placeholder="ABC Franchises"
                    className="mt-2"
                    required
                    data-testid="concierge-company-name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => updateFormData('contact_email', e.target.value)}
                      placeholder="john@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="contact_phone"
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => updateFormData('contact_phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimated_locations">Estimated Scale</Label>
                  <div className="relative mt-2">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="estimated_locations"
                      type="number"
                      min="1"
                      value={formData.estimated_locations}
                      onChange={(e) => updateFormData('estimated_locations', parseInt(e.target.value) || 1)}
                      className="pl-10"
                      data-testid="concierge-locations"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Locations, units, or team size</p>
                </div>
                <div>
                  <Label htmlFor="relationship">Your Relationship</Label>
                  <Select value={formData.relationship} onValueChange={(v) => updateFormData('relationship', v)}>
                    <SelectTrigger className="mt-2" data-testid="concierge-relationship">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acquaintance">Acquaintance</SelectItem>
                      <SelectItem value="working">Working Relationship</SelectItem>
                      <SelectItem value="close">Close Contact</SelectItem>
                      <SelectItem value="decision-maker">Decision Maker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  placeholder="Any context that would help our team approach this opportunity..."
                  className="mt-2"
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={submitting} data-testid="concierge-submit">
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Crown className="w-4 h-4 mr-2" />
                )}
                Request Concierge Support
              </Button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="dashboard-card border-2 border-amber-200">
              <h3 className="font-medium mb-3">Commission Potential</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">At Close</span>
                  <span className="commission-amount text-primary">
                    ${minCommission.toLocaleString()} - ${maxCommission.toLocaleString()}
                  </span>
                </div>
                {account?.commission_tiers && (
                  <div className="space-y-2 pt-3 border-t border-border">
                    {account.commission_tiers.map((tier, index) => {
                      const tierKey = Object.keys(tier).find(k => k !== 'commission' && k !== 'residual');
                      return (
                        <div key={index} className="text-xs flex justify-between">
                          <span className="text-muted-foreground capitalize">{tierKey}: {tier[tierKey]}</span>
                          <span>
                            ${tier.commission.toLocaleString()} + ${tier.residual}/mo
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-card bg-amber-50 border-amber-200">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                What Happens Next
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-xs font-medium flex-shrink-0">1</span>
                  <span>Our team reviews your request within 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-xs font-medium flex-shrink-0">2</span>
                  <span>We craft a custom approach strategy with you</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-xs font-medium flex-shrink-0">3</span>
                  <span>We support you through the introduction and close</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-xs font-medium flex-shrink-0">4</span>
                  <span>You earn your commission when the deal closes</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4 inline-block mr-1" />
              Contract value: ${account?.contract_value_min?.toLocaleString()} - ${account?.contract_value_max?.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
