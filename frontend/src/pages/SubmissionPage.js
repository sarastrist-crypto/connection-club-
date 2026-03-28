import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  ArrowLeft, Send, Loader2, Check
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const LOGO_URL = "https://static.prod-images.emergentagent.com/jobs/55e5192a-5621-4870-b0fb-67b6a7896070/images/bc25463b76696a92f7729053d65f4d88b5b22909c4986c5d19128dd1e1327b75.png";

const TRACKS = [
  { id: 'hospitality', label: 'Hospitality' },
  { id: 'entry-level', label: 'Entry-Level' },
  { id: 'career-professional', label: 'Career Professional' },
];

const CATEGORIES = [
  'Staffing',
  'Delivery',
  'Freelance',
  'Tutoring',
  'Consulting',
  'Tasks',
  'Experiences',
  'Other'
];

export default function SubmissionPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    platform_name: '',
    website_url: '',
    tracks: [],
    category: '',
    description: '',
    recommendation_reason: '',
    submitter_name: '',
    submitter_email: ''
  });

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleTrack = (trackId) => {
    setFormData(prev => ({
      ...prev,
      tracks: prev.tracks.includes(trackId)
        ? prev.tracks.filter(t => t !== trackId)
        : [...prev.tracks, trackId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.platform_name || !formData.website_url || formData.tracks.length === 0 || !formData.category || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/submissions`, formData);
      setSubmitted(true);
    } catch (error) {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-medium mb-2">Thanks for the suggestion!</h1>
          <p className="text-muted-foreground mb-6">
            We review every submission and update the database regularly.
          </p>
          <Link to="/marketplace">
            <Button>Browse Opportunities</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/marketplace">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <img src={LOGO_URL} alt="ConnectClub" className="h-8" />
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-medium tracking-tight">Suggest a Platform</h1>
          <p className="text-muted-foreground mt-1">
            Know a great gig or freelance platform? Let us know and we'll review it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="submission-form">
          <div>
            <Label htmlFor="platform_name">Platform Name *</Label>
            <Input
              id="platform_name"
              value={formData.platform_name}
              onChange={(e) => updateFormData('platform_name', e.target.value)}
              placeholder="e.g., Instawork"
              className="mt-2"
              required
              data-testid="submission-name"
            />
          </div>

          <div>
            <Label htmlFor="website_url">Website URL *</Label>
            <Input
              id="website_url"
              type="url"
              value={formData.website_url}
              onChange={(e) => updateFormData('website_url', e.target.value)}
              placeholder="https://example.com"
              className="mt-2"
              required
              data-testid="submission-url"
            />
          </div>

          <div>
            <Label>Track(s) *</Label>
            <p className="text-sm text-muted-foreground mb-3">Select all that apply</p>
            <div className="grid grid-cols-3 gap-3">
              {TRACKS.map((track) => (
                <label
                  key={track.id}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.tracks.includes(track.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Checkbox
                    checked={formData.tracks.includes(track.id)}
                    onCheckedChange={() => toggleTrack(track.id)}
                  />
                  <span className="text-sm">{track.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(v) => updateFormData('category', v)}>
              <SelectTrigger className="mt-2" data-testid="submission-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Brief Description * (max 200 characters)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value.slice(0, 200))}
              placeholder="What does this platform offer?"
              className="mt-2"
              rows={3}
              required
              data-testid="submission-description"
            />
            <p className="text-xs text-muted-foreground mt-1">{formData.description.length}/200</p>
          </div>

          <div>
            <Label htmlFor="recommendation_reason">Why do you recommend it? (optional, max 300 characters)</Label>
            <Textarea
              id="recommendation_reason"
              value={formData.recommendation_reason}
              onChange={(e) => updateFormData('recommendation_reason', e.target.value.slice(0, 300))}
              placeholder="What makes this platform worth checking out?"
              className="mt-2"
              rows={3}
              data-testid="submission-reason"
            />
            <p className="text-xs text-muted-foreground mt-1">{formData.recommendation_reason.length}/300</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="submitter_name">Your Name (optional)</Label>
              <Input
                id="submitter_name"
                value={formData.submitter_name}
                onChange={(e) => updateFormData('submitter_name', e.target.value)}
                placeholder="John Doe"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="submitter_email">Your Email (optional)</Label>
              <Input
                id="submitter_email"
                type="email"
                value={formData.submitter_email}
                onChange={(e) => updateFormData('submitter_email', e.target.value)}
                placeholder="you@example.com"
                className="mt-2"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading} data-testid="submission-submit">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Submit Suggestion
          </Button>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8">
        <div className="max-w-2xl mx-auto px-6 py-4 text-center text-sm text-muted-foreground">
          <Link to="/marketplace" className="hover:text-foreground">Back to Marketplace</Link>
        </div>
      </footer>
    </div>
  );
}
