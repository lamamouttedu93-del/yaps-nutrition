import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { ArrowRight, Zap, Target, TrendingUp, Crown, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from '@/contexts/LanguageContext';

const Home = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: t('home.feature1.title'),
      description: t('home.feature1.desc')
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t('home.feature2.title'),
      description: t('home.feature2.desc')
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: t('home.feature3.title'),
      description: t('home.feature3.desc')
    }
  ];

  const plans = [
    {
      name: t('plan.free'),
      price: "0€",
      period: t('plan.forever'),
      features: [
        t('plan.feature.profile'),
        t('plan.feature.journal'),
        t('plan.feature.bmi'),
        t('plan.feature.recommendations')
      ],
      cta: t('plan.cta.start'),
      popular: false
    },
    {
      name: t('plan.pro'),
      price: "9.99€",
      period: t('plan.month'),
      features: [
        t('plan.feature.pro.all'),
        t('plan.feature.bmr'),
        t('plan.feature.planner'),
        t('plan.feature.export'),
        t('plan.feature.advancedRec')
      ],
      cta: t('plan.cta.pro'),
      popular: true
    },
    {
      name: t('plan.premium'),
      price: "19.99€",
      period: t('plan.month'),
      features: [
        t('plan.feature.premium.all'),
        t('plan.feature.recipes'),
        t('plan.feature.ai'),
        t('plan.feature.sync'),
        t('plan.feature.customPlans')
      ],
      cta: t('plan.cta.premium'),
      popular: false
    }
  ];

  return (
    <>
      <Helmet>
        <title>YapS - Smart Diet & Nutrition Tracking</title>
        <meta name="description" content="Transform your health journey with intelligent nutrition tracking, personalized meal planning, and AI-powered coaching." />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6">
                {t('home.title').split(' ').slice(0, -2).join(' ')}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {" "}{t('home.title').split(' ').slice(-2).join(' ')}
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                {t('home.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/onboarding">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-4">
                    {t('home.startJourney')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white/20 hover:bg-white/10 text-lg px-8 py-4">
                      {t('home.learnMore')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-purple-500/30 text-white max-w-3xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Bienvenue chez YapS !
                      </DialogTitle>
                      <DialogDescription className="text-gray-400 pt-2">
                        YAPS est ton compagnon nutrition : IMC gratuit, suivi de repas et recettes. Passe en Pro pour le MB (Black et al.), l’ATEJ et des recommandations sur mesure. En Premium, débloque le coach IA, des plans d’entraînements quotidiens et la synchro de tes données santé.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                      <div className="rounded-lg overflow-hidden">
                        <img alt="Une femme en tenue de sport faisant de la fitness" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1628257088449-0f066c6f96a2" />
                      </div>
                      <div className="rounded-lg overflow-hidden">
                        <img alt="Une photo d'un plat joliment présenté" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1701540747558-5513a8812dda" />
                      </div>
                      <div className="rounded-lg overflow-hidden">
                        <img alt="Un graphique montrant une courbe de perte de poids" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1616261167032-b16d2df8333b" />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-16 flex justify-center px-4"
          >
            <img className="w-full max-w-4xl rounded-2xl shadow-2xl" alt="YapS app dashboard showing meal tracking and nutrition analytics" src="https://images.unsplash.com/photo-1694747674615-c381e6b9ce04" />
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t('home.features.title').split(' ').slice(0, -2).join(' ')}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {" "}{t('home.features.title').split(' ').slice(-2).join(' ')}
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                {t('home.features.subtitle')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-purple-500/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-6 text-white">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t('home.pricing.title').split(' ').slice(0, -2).join(' ')}
                <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  {" "}{t('home.pricing.title').split(' ').slice(-2).join(' ')}
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                {t('home.pricing.subtitle')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className={`relative bg-white/5 backdrop-blur-lg rounded-2xl p-8 border transition-all duration-300 ${
                    plan.popular 
                      ? 'border-purple-500 lg:scale-105' 
                      : 'border-white/10 hover:border-purple-500/30'
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

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-300 ml-2">/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-300">
                        <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link to="/onboarding" className="block mt-auto">
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-3xl p-8 sm:p-12 border border-white/10"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t('home.cta.title')}
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                {t('home.cta.subtitle')}
              </p>
              <Link to="/onboarding">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-4">
                  {t('home.cta.button')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
