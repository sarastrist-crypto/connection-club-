import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  BookOpen, Play, Clock, ChevronRight,
  MessageSquare, HelpCircle, DollarSign, FileText
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CATEGORY_ICONS = {
  'Conversation Starters': MessageSquare,
  'Objection Responses': HelpCircle,
  'Commission Explained': DollarSign,
  'Tax Basics': FileText,
  'Industry Context': BookOpen,
};

export default function EducationPage() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/education/content`, {
          withCredentials: true
        });
        setContent(response.data.content || []);
      } catch (error) {
        console.error('Fetch education content error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const categories = ['all', ...new Set(content.map(c => c.category))];
  const filteredContent = selectedCategory === 'all'
    ? content
    : content.filter(c => c.category === selectedCategory);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40" />)}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" data-testid="education-page">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-medium tracking-tight">Education Hub</h1>
          <p className="text-muted-foreground mt-1">Practical content to help you succeed</p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              data-testid={`category-${cat}`}
            >
              {cat === 'all' ? 'All Content' : cat}
            </Button>
          ))}
        </div>

        {/* Content Grid */}
        {filteredContent.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No content available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent.map((item) => {
              const CategoryIcon = CATEGORY_ICONS[item.category] || BookOpen;
              return (
                <div
                  key={item.id}
                  className="dashboard-card card-lift cursor-pointer"
                  data-testid={`content-${item.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {item.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {item.type === 'video' ? (
                        <Play className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {item.duration}
                    </div>
                  </div>

                  <h3 className="font-medium mb-2 line-clamp-2">{item.title}</h3>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tracks?.map((track) => (
                      <span key={track} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {track}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground capitalize">{item.type}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Tips */}
        <div className="dashboard-card bg-primary/5 border-primary/20">
          <h2 className="text-lg font-medium mb-4">Quick Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-card">
              <h3 className="font-medium mb-2">Making Warm Introductions</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Start with people you actually know well</li>
                <li>• Focus on their problem, not the solution</li>
                <li>• Keep messages short and personal</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-card">
              <h3 className="font-medium mb-2">Following Up Effectively</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Wait 3-5 days before first follow-up</li>
                <li>• Add value in each message</li>
                <li>• Know when to move on</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
