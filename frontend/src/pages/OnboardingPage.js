import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Progress } from '../components/ui/progress';
import ConnectClubLogo from '../components/ConnectClubLogo';
import { 
  ChevronRight, ChevronLeft, Check, Loader2,
  MapPin, Phone, Mail, MessageSquare,
  Building2, Briefcase, TrendingUp, Clock
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const INDUSTRIES = [
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'hospitality', label: 'Hospitality', icon: '🏨' },
  { id: 'retail', label: 'Retail', icon: '🛍️' },
  { id: 'legal', label: 'Legal', icon: '⚖️' },
  { id: 'construction', label: 'Construction', icon: '🏗️' },
  { id: 'e-commerce', label: 'E-commerce', icon: '🛒' },
  { id: 'food-beverage', label: 'Food & Beverage', icon: '🍽️' },
  { id: 'real-estate', label: 'Real Estate', icon: '🏠' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'education', label: 'Education', icon: '📚' },
];

const RELATIONSHIP_DEPTHS = [
  { value: 'acquaintance', label: 'Acquaintance', description: 'We know each other' },
  { value: 'working', label: 'Working Relationship', description: 'We\'ve worked together' },
  { value: 'close', label: 'Close Contact', description: 'We know each other well' },
  { value: 'decision-maker', label: 'Decision Maker Access', description: 'I know decision makers' },
];

const INCOME_GOALS = [
  { value: '500-1k', label: '$500 - $1,000', description: 'Side income' },
  { value: '1k-3k', label: '$1,000 - $3,000', description: 'Supplemental income' },
  { value: '3k-10k', label: '$3,000 - $10,000', description: 'Significant income' },
  { value: '10k+', label: '$10,000+', description: 'Primary income' },
];

const CAREER_TRACKS = [
  { value: 'hospitality', label: 'Hospitality Professional', description: 'Experience in restaurants, hotels, events', icon: Building2 },
  { value: 'young-professional', label: 'Young Professional', description: 'Early career, building your network', icon: Briefcase },
  { value: 'career-professional', label: 'Career Professional', description: 'Established career, senior connections', icon: TrendingUp },
];

const AVAILABILITY_OPTIONS = [
  { value: 'passive', label: 'Passive', description: 'I\'ll make introductions when convenient' },
  { value: 'part-time', label: 'Part-time', description: 'A few hours per week' },
  { value: 'active', label: 'Active', description: 'I\'m ready to hustle' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, refreshAuth } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [showMatches, setShowMatches] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    location: '',
    contact_preference: 'email',
    industries: [],
    industry_relationships: {},
    income_goal: '1k-3k',
    career_track: 'young-professional',
    availability: 'part-time',
  });

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleIndustry = (industryId) => {
    setFormData(prev => {
      const industries = prev.industries.includes(industryId)
        ? prev.industries.filter(id => id !== industryId)
        : [...prev.industries, industryId];
      
      // Update relationships object
      const industry_relationships = { ...prev.industry_relationships };
      if (!industries.includes(industryId)) {
        delete industry_relationships[industryId];
      }
      
      return { ...prev, industries, industry_relationships };
    });
  };

  const setIndustryRelationship = (industryId, depth) => {
    setFormData(prev => ({
      ...prev,
      industry_relationships: {
        ...prev.industry_relationships,
        [industryId]: depth
      }
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.location;
      case 2:
        return formData.industries.length > 0;
      case 3:
        return formData.industries.every(ind => formData.industry_relationships[ind]);
      case 4:
        return formData.income_goal;
      case 5:
        return formData.career_track && formData.availability;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/onboarding/complete`,
        formData,
        { withCredentials: true }
      );
      setMatches(response.data.top_matches || []);
      setShowMatches(true);
      await refreshAuth();
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToDashboard = () => {
    navigate('/dashboard');
  };

  if (showMatches) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <ConnectClubLogo className="h-24" />
            </div>
            <h1 className="text-4xl font-medium tracking-tight mb-2">Here's where you start</h1>
            <p className="text-muted-foreground">Based on your network, these opportunities are your best match</p>
          </div>

          <div className="space-y-4 stagger-enter">
            {matches.map((match, index) => (
              <div
                key={match.id || index}
                className="dashboard-card"
                data-testid={`match-card-${index}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`tier-badge ${match.type === 'bundle' ? 'tier-badge-bundled' : 'tier-badge-gig'}`}>
                        {match.type}
                      </span>
                      <div className="match-score">
                        <div className="match-score-bar">
                          <div 
                            className="match-score-fill bg-primary"
                            style={{ width: `${match.match_score}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{match.match_score}% match</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-medium">{match.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{match.description}</p>
                  </div>
                  {match.type === 'bundle' && (
                    <div className="text-right ml-4">
                      <div className="commission-amount text-lg text-primary">${match.commission_at_close}</div>
                      <div className="text-xs text-muted-foreground">at close</div>
                      {match.monthly_residual > 0 && (
                        <>
                          <div className="commission-amount text-sm text-primary mt-1">${match.monthly_residual}/mo</div>
                          <div className="text-xs text-muted-foreground">residual</div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              size="lg"
              onClick={handleContinueToDashboard}
              className="px-8"
              data-testid="continue-to-dashboard"
            >
              Go to Dashboard
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-card border-b border-border z-50">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <ConnectClubLogo className="h-16" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Step {step} of 5</span>
            <Progress value={(step / 5) * 100} className="w-24 h-2" />
          </div>
        </div>
      </header>

      {/* Content - with extra bottom padding for fixed footer */}
      <main className="pt-28 pb-32 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-8" data-testid="onboarding-step-1">
              <div>
                <h1 className="text-4xl font-medium tracking-tight mb-2">Let's get to know you</h1>
                <p className="text-muted-foreground">We'll use this to personalize your experience</p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="John Doe"
                    className="mt-2"
                    data-testid="onboarding-name"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => updateFormData('location', e.target.value)}
                      placeholder="City, State"
                      className="pl-10"
                      data-testid="onboarding-location"
                    />
                  </div>
                </div>

                <div>
                  <Label>Preferred contact method</Label>
                  <RadioGroup
                    value={formData.contact_preference}
                    onValueChange={(value) => updateFormData('contact_preference', value)}
                    className="mt-3 grid grid-cols-3 gap-3"
                  >
                    {[
                      { value: 'email', label: 'Email', icon: Mail },
                      { value: 'phone', label: 'Phone', icon: Phone },
                      { value: 'text', label: 'Text', icon: MessageSquare },
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <Label
                          key={option.value}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-colors ${
                            formData.contact_preference === option.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value={option.value} className="sr-only" />
                          <Icon className="w-5 h-5" />
                          <span className="text-sm">{option.label}</span>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Industries */}
          {step === 2 && (
            <div className="space-y-8" data-testid="onboarding-step-2">
              <div>
                <h1 className="text-4xl font-medium tracking-tight mb-2">Who do you know?</h1>
                <p className="text-muted-foreground">Select industries where you have connections</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {INDUSTRIES.map((industry) => {
                  const isSelected = formData.industries.includes(industry.id);
                  return (
                    <button
                      key={industry.id}
                      type="button"
                      onClick={() => toggleIndustry(industry.id)}
                      className={`flex items-center gap-3 p-4 rounded-lg border text-left transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      data-testid={`industry-${industry.id}`}
                    >
                      <span className="text-xl">{industry.icon}</span>
                      <span className="text-sm font-medium">{industry.label}</span>
                      {isSelected && <Check className="w-4 h-4 ml-auto text-primary" />}
                    </button>
                  );
                })}
              </div>

              <p className="text-sm text-muted-foreground">
                Selected: {formData.industries.length} {formData.industries.length === 1 ? 'industry' : 'industries'}
              </p>
            </div>
          )}

          {/* Step 3: Relationship Depth */}
          {step === 3 && (
            <div className="space-y-8" data-testid="onboarding-step-3">
              <div>
                <h1 className="text-4xl font-medium tracking-tight mb-2">How well do you know them?</h1>
                <p className="text-muted-foreground">Tell us about your relationship depth in each industry</p>
              </div>

              <div className="space-y-6">
                {formData.industries.map((industryId) => {
                  const industry = INDUSTRIES.find(i => i.id === industryId);
                  return (
                    <div key={industryId} className="p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">{industry?.icon}</span>
                        <span className="font-medium">{industry?.label}</span>
                      </div>
                      <RadioGroup
                        value={formData.industry_relationships[industryId] || ''}
                        onValueChange={(value) => setIndustryRelationship(industryId, value)}
                        className="space-y-2"
                      >
                        {RELATIONSHIP_DEPTHS.map((depth) => (
                          <Label
                            key={depth.value}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              formData.industry_relationships[industryId] === depth.value
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <RadioGroupItem value={depth.value} />
                            <div>
                              <span className="text-sm font-medium">{depth.label}</span>
                              <span className="text-xs text-muted-foreground ml-2">— {depth.description}</span>
                            </div>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Income Goal */}
          {step === 4 && (
            <div className="space-y-8" data-testid="onboarding-step-4">
              <div>
                <h1 className="text-4xl font-medium tracking-tight mb-2">What's your income goal?</h1>
                <p className="text-muted-foreground">Monthly target from ConnectClub opportunities</p>
              </div>

              <RadioGroup
                value={formData.income_goal}
                onValueChange={(value) => updateFormData('income_goal', value)}
                className="space-y-3"
              >
                {INCOME_GOALS.map((goal) => (
                  <Label
                    key={goal.value}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                      formData.income_goal === goal.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={goal.value} />
                      <div>
                        <span className="font-medium">{goal.label}</span>
                        <span className="text-sm text-muted-foreground ml-2">— {goal.description}</span>
                      </div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 5: Career Track & Availability */}
          {step === 5 && (
            <div className="space-y-8" data-testid="onboarding-step-5">
              <div>
                <h1 className="text-4xl font-medium tracking-tight mb-2">Almost there!</h1>
                <p className="text-muted-foreground">Help us match you with the right opportunities</p>
              </div>

              <div>
                <Label className="text-base font-medium mb-4 block">Your career track</Label>
                <RadioGroup
                  value={formData.career_track}
                  onValueChange={(value) => updateFormData('career_track', value)}
                  className="space-y-3"
                >
                  {CAREER_TRACKS.map((track) => {
                    const Icon = track.icon;
                    return (
                      <Label
                        key={track.value}
                        className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                          formData.career_track === track.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value={track.value} />
                        <Icon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <span className="font-medium">{track.label}</span>
                          <p className="text-sm text-muted-foreground">{track.description}</p>
                        </div>
                      </Label>
                    );
                  })}
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium mb-4 block">Your availability</Label>
                <RadioGroup
                  value={formData.availability}
                  onValueChange={(value) => updateFormData('availability', value)}
                  className="grid grid-cols-3 gap-3"
                >
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer text-center transition-colors ${
                        formData.availability === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value={option.value} className="sr-only" />
                      <Clock className="w-5 h-5" />
                      <span className="text-sm font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          {step > 1 ? (
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              data-testid="onboarding-back"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          ) : (
            <div />
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            data-testid="onboarding-next"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {step === 5 ? 'Find My Matches' : 'Continue'}
            {step < 5 && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </footer>
    </div>
  );
}
