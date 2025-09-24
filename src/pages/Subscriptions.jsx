import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Check, Crown, Star, Zap, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const Subscriptions = () => {
  const { user } = useAuth();
  const { subscription, upgradeSubscription, isAdmin } = useSubscription();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const plans = [
    {
      id: 'free',
      name: t('plan.free'),
      price: '0€',
      period: t('plan.forever'),
      description: t('subs.free.desc'),
      features: [
        t('plan.feature.profile'),
        t('plan.feature.journal'),
        t('plan.feature.bmi'),
        t('plan.feature.recommendations'),
        t('subs.feature.recipes.limited')
      ],
      limitations: [
        t('subs.limit.bmr'),
        t('subs.limit.planner'),
        t('subs.limit.export'),
        t('subs.limit.recipes'),
        t('subs.limit.ai')
      ],
      buttonText: t('subs.cta.current'),
      popular: false,
      color: 'from-gray-500 to-gray-600'
    },
    {
      id: 'pro',
      name: t('plan.pro'),
      price: '9.99€',
      period: t('plan.month'),
      description: t('subs.pro.desc'),
      features: [
        t('plan.feature.pro.all'),
        t('plan.feature.bmr'),
        t('plan.feature.planner'),
        t('plan.feature.export'),
        t('subs.feature.pro.analytics'),
        t('subs.feature.pro.support')
      ],
      limitations: [
        t('subs.limit.pro.recipes'),
        t('subs.limit.pro.ai'),
        t('subs.limit.pro.sync')
      ],
      buttonText: t('subs.cta.upgradePro'),
      popular: true,
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'premium',
      name: t('plan.premium'),
      price: '19.99€',
      period: t('plan.month'),
      description: t('subs.premium.desc'),
      features: [
        t('plan.feature.premium.all'),
        t('subs.feature.premium.plans'),
        t('subs.feature.premium.ai'),
        t('subs.feature.premium.sync'),
        t('subs.feature.premium.custom'),
        t('subs.feature.premium.analytics'),
        t('subs.feature.premium.optimization'),
        t('subs.feature.premium.support')
      ],
      limitations: [],
      buttonText: t('subs.cta.upgradePremium'),
      popular: false,
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const handleUpgrade = (planId) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour changer d'abonnement.",
        variant: "destructive"
      });
      return;
    }

    if (planId === subscription) {
      toast({
        title: "Déjà abonné",
        description: `Vous êtes déjà sur le plan ${planId}.`
      });
      return;
    }

    setLoadingPlan(planId);
    try {
      upgradeSubscription(planId);
      toast({
        title: "Redirection vers le paiement",
        description: "Vous allez être redirigé pour finaliser votre paiement.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de procéder au paiement.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Veuillez vous connecter pour voir les plans d'abonnement</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Abonnements - YapS</title>
        <meta name="description" content="Choisissez le plan de suivi nutritionnel parfait pour votre parcours de santé. Mettez à niveau pour débloquer des fonctionnalités avancées et un coaching personnalisé." />
      </Helmet>

      <div className="min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('subs.title').split(' ').slice(0, -2).join(' ')}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}{t('subs.title').split(' ').slice(-2).join(' ')}
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {t('subs.subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{t('subs.currentPlan')}</h3>
                <p className="text-gray-300">
                  {isAdmin ? "Vous avez un accès administrateur illimité." : t('subs.currentPlan.desc', { plan: t(`plan.${subscription}`) })}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full flex items-center bg-gradient-to-r ${
                isAdmin ? 'from-red-500 to-red-700' :
                subscription === 'premium' ? 'from-yellow-500 to-orange-500' :
                subscription === 'pro' ? 'from-blue-500 to-purple-600' :
                'from-gray-500 to-gray-600'
              } text-white font-medium`}>
                {isAdmin && <ShieldCheck className="w-4 h-4 inline mr-1" />}
                {subscription === 'premium' && !isAdmin && <Crown className="w-4 h-4 inline mr-1" />}
                {subscription === 'pro' && !isAdmin && <Star className="w-4 h-4 inline mr-1" />}
                {subscription === 'free' && !isAdmin && <Zap className="w-4 h-4 inline mr-1" />}
                {isAdmin ? 'Admin' : t(`plan.${subscription}`)}
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`relative bg-white/5 backdrop-blur-lg rounded-3xl p-8 border transition-all duration-300 ${
                  plan.popular 
                    ? 'border-purple-500 lg:scale-105' 
                    : 'border-white/10 hover:border-purple-500/30'
                } ${
                  subscription === plan.id && !isAdmin ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      {t('mostPopular')}
                    </div>
                  </div>
                )}

                {subscription === plan.id && !isAdmin && (
                  <div className="absolute -top-4 right-4">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {t('subs.cta.current')}
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    {plan.id === 'premium' && <Crown className="w-8 h-8 text-white" />}
                    {plan.id === 'pro' && <Star className="w-8 h-8 text-white" />}
                    {plan.id === 'free' && <Zap className="w-8 h-8 text-white" />}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-300 ml-2">/{plan.period}</span>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-white mb-4">{t('subs.included')}</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start text-gray-300">
                        <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.limitations.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-400 mb-4">{t('subs.limitations')}</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, limitIndex) => (
                        <li key={limitIndex} className="flex items-start text-gray-500">
                          <span className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5">×</span>
                          <span className="text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={isAdmin || subscription === plan.id || loadingPlan === plan.id || plan.id === 'free'}
                      className={`w-full ${
                        isAdmin || subscription === plan.id || plan.id === 'free'
                          ? 'bg-gray-600 cursor-not-allowed'
                          : plan.popular 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                            : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {loadingPlan === plan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isAdmin ? (
                        'Accès Admin'
                      ) : subscription === plan.id || plan.id === 'free' ? (
                        t('subs.cta.current')
                      ) : (
                        plan.buttonText
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmer le changement de plan</AlertDialogTitle>
                      <AlertDialogDescription>
                        Vous allez être redirigé vers notre partenaire de paiement Stripe pour finaliser votre abonnement au plan {t(`plan.${plan.id}`)}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleUpgrade(plan.id)} className="bg-gradient-to-r from-purple-500 to-pink-500">
                        Continuer vers le paiement
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">{t('subs.faq.title')}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{t('subs.faq1.q')}</h3>
                <p className="text-gray-300 text-sm">{t('subs.faq1.a')}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{t('subs.faq2.q')}</h3>
                <p className="text-gray-300 text-sm">{t('subs.faq2.a')}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{t('subs.faq3.q')}</h3>
                <p className="text-gray-300 text-sm">{t('subs.faq3.a')}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{t('subs.faq4.q')}</h3>
                <p className="text-gray-300 text-sm">{t('subs.faq4.a')}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <p className="text-gray-400">
              {t('subs.contact')}
              <button 
                onClick={() => toast({
                  title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
                })}
                className="text-purple-400 hover:text-purple-300 ml-1"
              >
                {t('subs.contact.link')}
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Subscriptions;
