import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import {
  ChevronLeft, ChevronRight, Check, Loader2,
  MessageSquare, Mail, Linkedin, Send, Copy
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const MESSAGE_TEMPLATES = {
  bundle: "Hey [Name], I've been working with a group that helps businesses like yours handle [SERVICES] without adding headcount. Thought of you. Want me to connect you?",
  gig: "Hey [Name], I came across a platform called [PLATFORM] that I thought might be useful for you. It's for [DESCRIPTION]. Worth checking out?"
};

export default function IntroductionFlowPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [opportunity, setOpportunity] = useState(null);
  const [fetchingOpp, setFetchingOpp] = useState(true);

  const opportunityId = searchParams.get('opportunity');
  const opportunityType = searchParams.get('type') || 'bundle';

  const [formData, setFormData] = useState({
    contact_name: '',
    business_type: '',
    relationship: 'working',
    approach_method: 'text',
    message: ''
  });

  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!opportunityId) {
        setFetchingOpp(false);
        return;
      }

      try {
        const endpoint = opportunityType === 'bundle' ? 'bundles' : 'platforms';
        const response = await axios.get(`${API_URL}/api/${endpoint}/${opportunityId}`, {
          withCredentials: true
        });
        setOpportunity(response.data);

        // Set default message based on type
        let template = MESSAGE_TEMPLATES[opportunityType] || MESSAGE_TEMPLATES.bundle;
        if (opportunityType === 'bundle' && response.data.services) {
          template = template.replace('[SERVICES]', response.data.services.slice(0, 2).join(' and ').toLowerCase());
        } else if (opportunityType === 'gig') {
          template = template.replace('[PLATFORM]', response.data.name || 'this platform');
          template = template.replace('[DESCRIPTION]', response.data.short_description || 'flexible work');
        }
        setFormData(prev => ({ ...prev, message: template }));
      } catch (error) {
        console.error('Fetch opportunity error:', error);
      } finally {
        setFetchingOpp(false);
      }
    };
    fetchOpportunity();
  }, [opportunityId, opportunityType]);

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return opportunity || !opportunityId;
      case 2:
        return formData.contact_name && formData.business_type;
      case 3:
        return formData.approach_method;
      case 4:
        return formData.message.length > 10;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/introductions`, {
        opportunity_id: opportunityId || 'direct',
        opportunity_type: opportunityType,
        ...formData
      }, { withCredentials: true });

      toast.success('Introduction logged. We\'ll keep you posted.');
      navigate('/introductions');
    } catch (error) {
      toast.error('Failed to log introduction');
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = () => {
    const finalMessage = formData.message.replace('[Name]', formData.contact_name || '[Name]');
    navigator.clipboard.writeText(finalMessage);
    toast.success('Message copied to clipboard');
  };

  if (fetchingOpp) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto" data-testid="introduction-flow">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-medium tracking-tight">Start an Introduction</h1>
          <p className="text-muted-foreground mt-1">Walk through making a warm introduction</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s < step ? 'bg-primary text-primary-foreground' :
                s === step ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 4 && <div className={`flex-1 h-1 rounded ${s < step ? 'bg-primary' : 'bg-muted'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Opportunity */}
        {step === 1 && (
          <div className="space-y-6" data-testid="intro-step-1">
            <h2 className="text-xl font-medium">Selected Opportunity</h2>
            
            {opportunity ? (
              <div className="dashboard-card">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`tier-badge ${opportunityType === 'bundle' ? 'tier-badge-bundled' : 'tier-badge-gig'}`}>
                      {opportunityType}
                    </span>
                    <h3 className="text-lg font-medium mt-2">{opportunity.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {opportunity.target_client || opportunity.short_description}
                    </p>
                  </div>
                  {opportunityType === 'bundle' && (
                    <div className="text-right">
                      <div className="commission-amount text-lg text-primary">${opportunity.commission_at_close}</div>
                      <div className="text-xs text-muted-foreground">at close</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="dashboard-card text-center py-8">
                <p className="text-muted-foreground">Select an opportunity from the marketplace first</p>
                <Button variant="outline" onClick={() => navigate('/marketplace')} className="mt-4">
                  Browse Opportunities
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Contact Info */}
        {step === 2 && (
          <div className="space-y-6" data-testid="intro-step-2">
            <h2 className="text-xl font-medium">Who are you introducing?</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => updateFormData('contact_name', e.target.value)}
                  placeholder="John Smith"
                  className="mt-2"
                  data-testid="intro-contact-name"
                />
              </div>

              <div>
                <Label htmlFor="business_type">Business Type</Label>
                <Input
                  id="business_type"
                  value={formData.business_type}
                  onChange={(e) => updateFormData('business_type', e.target.value)}
                  placeholder="e.g., HVAC contractor, Restaurant owner"
                  className="mt-2"
                  data-testid="intro-business-type"
                />
              </div>

              <div>
                <Label>Your Relationship</Label>
                <Select value={formData.relationship} onValueChange={(v) => updateFormData('relationship', v)}>
                  <SelectTrigger className="mt-2" data-testid="intro-relationship">
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
          </div>
        )}

        {/* Step 3: Approach Method */}
        {step === 3 && (
          <div className="space-y-6" data-testid="intro-step-3">
            <h2 className="text-xl font-medium">How will you reach out?</h2>
            
            <RadioGroup
              value={formData.approach_method}
              onValueChange={(v) => updateFormData('approach_method', v)}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { value: 'text', label: 'Text', icon: MessageSquare },
                { value: 'email', label: 'Email', icon: Mail },
                { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <Label
                    key={option.value}
                    className={`flex flex-col items-center gap-3 p-6 rounded-lg border cursor-pointer transition-colors ${
                      formData.approach_method === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value={option.value} className="sr-only" />
                    <Icon className="w-8 h-8" />
                    <span className="font-medium">{option.label}</span>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>
        )}

        {/* Step 4: Message */}
        {step === 4 && (
          <div className="space-y-6" data-testid="intro-step-4">
            <h2 className="text-xl font-medium">Customize your message</h2>
            <p className="text-muted-foreground">
              Edit this template to sound like you. Send it outside the app, then confirm below.
            </p>
            
            <div className="space-y-4">
              <Textarea
                value={formData.message}
                onChange={(e) => updateFormData('message', e.target.value)}
                rows={6}
                className="text-base"
                data-testid="intro-message"
              />

              <Button variant="outline" onClick={copyMessage} className="gap-2">
                <Copy className="w-4 h-4" /> Copy Message
              </Button>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  <strong>Preview for {formData.contact_name || '[Name]'}:</strong>
                </p>
                <p className="text-sm mt-2">
                  {formData.message.replace('[Name]', formData.contact_name || '[Name]')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          ) : (
            <div />
          )}
          
          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Continue <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed() || loading} data-testid="intro-submit">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Log Introduction
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
