import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

const featurePermissions = {
  'meal_planner': ['pro', 'premium'],
  'export_data': ['pro', 'premium'],
  'bmr_calculation': ['pro', 'premium'],
  'tdee_calculation': ['pro', 'premium'],
  'ai_coach': ['premium'],
  'health_sync': ['premium'],
  'advanced_analytics': ['premium'],
};

const paymentLinks = {
  pro: 'https://buy.stripe.com/00w4gBgkJ5GI19kdzO9k401',
  premium: 'https://buy.stripe.com/eVq3cxfgFb122do2Va9k400',
};

const ADMIN_EMAIL = "info@yaps.blog";

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState({
    plan: 'free',
    startDate: null,
    endDate: null,
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = user?.email === ADMIN_EMAIL;
    setIsAdmin(checkAdmin);

    if (checkAdmin) {
      setSubscription({
        plan: 'premium',
        startDate: new Date().toISOString(),
        endDate: null, // No end date for admin
      });
      setLoading(false);
    } else if (user) {
      const savedSubscription = localStorage.getItem('yaps_subscription_details');
      if (savedSubscription) {
        setSubscription(JSON.parse(savedSubscription));
      } else {
        const newSub = {
          plan: 'free',
          startDate: null,
          endDate: null,
        };
        setSubscription(newSub);
        localStorage.setItem('yaps_subscription_details', JSON.stringify(newSub));
      }
      setLoading(false);
    } else {
      setSubscription({ plan: 'free', startDate: null, endDate: null });
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (subscription.plan !== 'free' && subscription.endDate) {
      const now = new Date();
      const endDate = new Date(subscription.endDate);
      const fiveDaysBefore = new Date(endDate);
      fiveDaysBefore.setDate(endDate.getDate() - 5);

      if (now >= fiveDaysBefore && now < endDate) {
        const notificationSent = localStorage.getItem('yaps_renewal_notification_sent');
        if (notificationSent !== subscription.endDate) {
          console.log("Simulating renewal email notification.");
          toast({
            title: "Rappel d'abonnement",
            description: `Votre abonnement se termine dans moins de 5 jours. N'oubliez pas de le renouveler !`,
          });
          localStorage.setItem('yaps_renewal_notification_sent', subscription.endDate);
        }
      }
    }
  }, [subscription]);

  const upgradeSubscription = (planId) => {
    if (isAdmin) {
      toast({ title: "Accès Admin", description: "Vous avez déjà un accès illimité." });
      return;
    }
    if (!user) {
      throw new Error("User must be logged in to upgrade.");
    }
    const paymentLink = paymentLinks[planId];
    if (paymentLink) {
      window.open(paymentLink, '_blank');
    } else {
      throw new Error('Invalid plan selected.');
    }
  };
  
  const setActiveSubscription = (planId) => {
    if (isAdmin) return;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);

    const newSub = {
      plan: planId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
    setSubscription(newSub);
    localStorage.setItem('yaps_subscription_details', JSON.stringify(newSub));
    localStorage.removeItem('yaps_renewal_notification_sent');
  };

  const cancelSubscription = () => {
    if (isAdmin) {
      toast({ title: "Accès Admin", description: "L'accès administrateur ne peut pas être annulé." });
      return;
    }
    const newSub = {
      plan: 'free',
      startDate: null,
      endDate: null,
    };
    setSubscription(newSub);
    localStorage.setItem('yaps_subscription_details', JSON.stringify(newSub));
    toast({
      title: "Abonnement annulé",
      description: "Vous êtes maintenant sur le plan gratuit.",
    });
  };

  const hasFeature = (feature) => {
    if (isAdmin) return true;
    if (!featurePermissions[feature]) {
      return true; 
    }
    return featurePermissions[feature].includes(subscription.plan);
  };

  const value = {
    subscription: subscription.plan,
    subscriptionDetails: subscription,
    upgradeSubscription,
    cancelSubscription,
    setActiveSubscription,
    hasFeature,
    loading,
    isAdmin,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};