import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, X, Zap, CreditCard } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PROMO_ICONS = {
  'connectclub-va': Zap,
  'ccp-merchant-services': CreditCard,
};

const PROMO_ACCENTS = {
  'connectclub-va': { bg: 'from-emerald-900/90 to-emerald-800/80', border: 'border-emerald-500/30', btn: 'bg-emerald-500 hover:bg-emerald-400 text-white' },
  'ccp-merchant-services': { bg: 'from-blue-900/90 to-blue-800/80', border: 'border-blue-500/30', btn: 'bg-blue-500 hover:bg-blue-400 text-white' },
};

export default function RevenueBanner() {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/promotions/targeted`, { withCredentials: true });
        setPromotions(res.data.promotions || []);
      } catch (err) {
        console.error('Failed to fetch promotions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  // Auto-rotate every 30 seconds
  useEffect(() => {
    if (promotions.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % promotions.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [promotions.length]);

  const handleCtaClick = useCallback(async (promo) => {
    try {
      await axios.post(`${API_URL}/api/promotions/track-click`, {
        promotion_id: promo.id,
        promotion_name: promo.name,
      }, { withCredentials: true });
    } catch (err) {
      // Silent fail for tracking
    }

    if (promo.cta_url.startsWith('/')) {
      window.location.href = promo.cta_url;
    } else if (promo.cta_url.startsWith('http')) {
      window.open(promo.cta_url, '_blank');
    }
  }, []);

  const goNext = () => setCurrentIndex(prev => (prev + 1) % promotions.length);
  const goPrev = () => setCurrentIndex(prev => (prev - 1 + promotions.length) % promotions.length);

  if (dismissed || loading || promotions.length === 0) return null;

  const promo = promotions[currentIndex];
  const Icon = PROMO_ICONS[promo.id] || Zap;
  const accent = PROMO_ACCENTS[promo.id] || PROMO_ACCENTS['connectclub-va'];

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${accent.border} mb-6`}
      style={{ backdropFilter: 'blur(16px)' }}
      data-testid="revenue-banner"
    >
      <div className={`bg-gradient-to-r ${accent.bg} p-4 sm:p-5`}>
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 text-white/50 hover:text-white/90 transition-colors"
          data-testid="banner-dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Icon */}
          <div className="hidden sm:flex w-14 h-14 rounded-xl bg-white/10 border border-white/20 items-center justify-center flex-shrink-0">
            <Icon className="w-7 h-7 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-lg leading-tight truncate" data-testid="banner-headline">
              {promo.headline}
            </h3>
            <p className="text-white/70 text-sm mt-0.5 line-clamp-1">
              {promo.subtext}
            </p>
            <div className="flex items-center gap-4 mt-1.5">
              <span className="text-xs text-white/50">
                Approx. Close: <span className="text-amber-300 font-medium">{promo.commission_close}</span>
              </span>
              <span className="text-xs text-white/50">
                Est. Residual: <span className="text-emerald-300 font-medium">{promo.commission_residual}</span>
              </span>
            </div>
          </div>

          {/* CTA + Nav */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              onClick={() => handleCtaClick(promo)}
              className={`${accent.btn} font-semibold px-5 py-2 cta-pulse`}
              data-testid="banner-cta"
            >
              {promo.cta_label}
            </Button>

            {promotions.length > 1 && (
              <div className="hidden md:flex items-center gap-1">
                <button onClick={goPrev} className="p-1.5 rounded-full text-white/40 hover:text-white/90 hover:bg-white/10 transition" data-testid="banner-prev">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-white/40 w-8 text-center">{currentIndex + 1}/{promotions.length}</span>
                <button onClick={goNext} className="p-1.5 rounded-full text-white/40 hover:text-white/90 hover:bg-white/10 transition" data-testid="banner-next">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
