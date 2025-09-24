import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setActiveSubscription } = useSubscription();
  const { t } = useLanguage();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const planId = params.get('plan');

    if (planId) {
      setActiveSubscription(planId);
      toast({
        title: "Paiement réussi !",
        description: `Bienvenue dans votre nouvel abonnement ${t(`plan.${planId}`)} !`,
      });
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de vérifier votre nouvel abonnement.",
        variant: "destructive",
      });
      navigate('/subscriptions');
    }
  }, [location, navigate, setActiveSubscription, t]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 text-center max-w-md w-full border border-white/20"
      >
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">Paiement Réussi !</h1>
        <p className="text-gray-300 mb-8">
          Votre abonnement a été activé. Vous pouvez maintenant profiter de toutes les fonctionnalités de votre nouveau plan.
        </p>
        <Button
          onClick={() => navigate('/dashboard')}
          className="bg-gradient-to-r from-purple-500 to-pink-500"
        >
          Aller au tableau de bord
        </Button>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;