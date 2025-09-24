import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Activity, 
  Target, 
  TrendingUp, 
  Calendar, 
  Plus, 
  Crown,
  Zap,
  Heart,
  Scale,
  BrainCircuit,
  BarChart3,
  Loader2,
  X,
  Footprints,
  Flame,
  Link2,
  Repeat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const Dashboard = () => {
  const { user } = useAuth();
  const { subscription, hasFeature } = useSubscription();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [todayMeals, setTodayMeals] = useState([]);
  const [stats, setStats] = useState({
    bmi: 0,
    bmr: 0,
    tdee: 0,
    caloriesConsumed: 0,
    caloriesRemaining: 0
  });
  const [healthData, setHealthData] = useState(null);
  const [isHealthSyncing, setIsHealthSyncing] = useState(false);
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [coachContent, setCoachContent] = useState(null);
  const [isCoachLoading, setIsCoachLoading] = useState(false);

  const fetchHealthData = useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_health_metrics')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();
    
    if (data) {
      setHealthData(data);
    } else {
      // If no data for today, fetch the latest weight from any previous day
      const { data: lastWeightData, error: lastWeightError } = await supabase
        .from('daily_health_metrics')
        .select('weight_kg')
        .eq('user_id', user.id)
        .not('weight_kg', 'is', null)
        .order('date', { ascending: false })
        .limit(1)
        .single();
      
      setHealthData({
        steps: 0,
        calories_active: 0,
        weight_kg: lastWeightData?.weight_kg || null,
        date: today,
        is_connected: false,
      });
    }

    if (error && error.code !== 'PGRST116') { // Ignore 'no rows found'
      console.error('Error fetching health data:', error);
    }
  }, [user]);

  useEffect(() => {
    const savedProfile = localStorage.getItem('nutritrack_profile');
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      setProfile(profileData);
    }

    const savedMeals = localStorage.getItem('nutritrack_meals');
    if (savedMeals) {
      const meals = JSON.parse(savedMeals);
      const today = new Date().toDateString();
      const todaysMeals = meals.filter(meal => 
        new Date(meal.date).toDateString() === today
      );
      setTodayMeals(todaysMeals);
    }
    
    if (hasFeature('health_sync')) {
      fetchHealthData();
    }
  }, [user, hasFeature, fetchHealthData]);

  useEffect(() => {
    if (profile) {
      calculateStats(profile);
    }
  }, [profile, todayMeals, subscription]);

  const handleHealthConnect = async () => {
    if (!user) return;
    setIsHealthSyncing(true);
    
    const today = new Date().toISOString().split('T')[0];

    // Simulate fetching data from a health service
    const mockHealthData = {
      weight_kg: profile?.weight || 70,
      steps: Math.floor(Math.random() * 10000) + 1000,
      calories_active: Math.floor(Math.random() * 500) + 100,
    };

    const { data, error } = await supabase
      .from('daily_health_metrics')
      .upsert({ 
        user_id: user.id, 
        date: today,
        ...mockHealthData,
      }, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) {
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser les données de santé.",
        variant: "destructive",
      });
    } else {
      setHealthData({...data, is_connected: true});
      toast({
        title: "Données de santé connectées !",
        description: "Vos données simulées ont été synchronisées.",
      });
    }
    setIsHealthSyncing(false);
  };

  const calculateStats = (profileData) => {
    const { weight, height, age, gender, activityLevel } = profileData;
    
    const heightInM = height / 100;
    const bmi = weight / (heightInM * heightInM);

    let bmr = 0;
    let tdee = 0;

    if (hasFeature('bmr_calculation')) {
      const weightFactor = Math.pow(weight, 0.48);
      const heightFactor = Math.pow(heightInM, 0.50);
      const ageFactor = Math.pow(age, -0.13);
      
      let bmrInMj;
      if (gender === 'male') {
        bmrInMj = 1.083 * weightFactor * heightFactor * ageFactor;
      } else {
        bmrInMj = 0.963 * weightFactor * heightFactor * ageFactor;
      }
      bmr = bmrInMj * 239.006;

      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
      };
      
      tdee = bmr * (activityMultipliers[activityLevel] || 1.55);
    }

    const caloriesConsumed = todayMeals.reduce((total, meal) => total + (meal.calories || 0), 0);
    const caloriesRemaining = Math.max(0, tdee - caloriesConsumed);

    setStats({
      bmi: Math.round(bmi * 10) / 10,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      caloriesConsumed,
      caloriesRemaining: Math.round(caloriesRemaining)
    });
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: t('bmi.underweight'), color: 'text-blue-400' };
    if (bmi < 25) return { category: t('bmi.normal'), color: 'text-green-400' };
    if (bmi < 30) return { category: t('bmi.overweight'), color: 'text-yellow-400' };
    return { category: t('bmi.obese'), color: 'text-red-400' };
  };

  const getRecommendation = () => {
    if (!profile) return '';
    
    const { goal } = profile;
    const { tdee, caloriesConsumed } = stats;
    
    if (goal === 'lose_weight') {
      const deficit = tdee - 500;
      if (caloriesConsumed > deficit) {
        return 'Pensez à réduire les portions ou à choisir des options moins caloriques.';
      }
      return 'Excellent travail pour maintenir votre déficit calorique pour la perte de poids !';
    } else if (goal === 'gain_weight') {
      const surplus = tdee + 300;
      if (caloriesConsumed < surplus) {
        return 'Ajoutez des aliments sains et denses en calories pour atteindre vos objectifs de prise de poids.';
      }
      return 'Excellent ! Vous atteignez votre surplus calorique pour une prise de poids saine.';
    } else {
      if (Math.abs(caloriesConsumed - tdee) < 100) {
        return 'Équilibre parfait ! Vous maintenez efficacement votre poids actuel.';
      }
      return 'Visez à correspondre à vos besoins caloriques quotidiens pour le maintien du poids.';
    }
  };

  const handlePremiumFeatureClick = async (e, feature) => {
    e.preventDefault();
    if (feature === 'ai_coach') {
      setIsCoachLoading(true);
      setIsCoachModalOpen(true);
      setCoachContent(null);
      try {
        const { data, error } = await supabase.functions.invoke('openai-coach', {
          body: { userProfile: profile },
        });
        if (error) throw error;
        if (data.error) throw new Error(data.error);
        setCoachContent(data);
      } catch (err) {
        console.error("Error fetching AI coach data:", err);
        toast({
          title: "Erreur du Coach IA",
          description: "Impossible de récupérer les conseils du coach. Veuillez réessayer.",
          variant: "destructive",
        });
        setIsCoachModalOpen(false);
      } finally {
        setIsCoachLoading(false);
      }
    } else {
      toast({
        title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
      });
    }
  };

  const quickActions = [
    {
      title: t('dashboard.logMeal'),
      description: t('dashboard.logMeal.desc'),
      icon: <Plus className="w-6 h-6" />,
      link: '/journal',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: t('dashboard.viewRecipes'),
      description: t('dashboard.viewRecipes.desc'),
      icon: <Heart className="w-6 h-6" />,
      link: '/recipes',
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: t('dashboard.planMeals'),
      description: t('dashboard.planMeals.desc'),
      icon: <Calendar className="w-6 h-6" />,
      link: '/planner',
      color: 'from-blue-500 to-cyan-500',
      premium: !hasFeature('meal_planner')
    },
    {
      title: t('dashboard.upgradePlan'),
      description: t('dashboard.upgradePlan.desc'),
      icon: <Crown className="w-6 h-6" />,
      link: '/subscriptions',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const premiumTools = [
    {
      title: t('dashboard.premium.aiCoach'),
      description: t('dashboard.premium.aiCoach.desc'),
      icon: <BrainCircuit className="w-8 h-8 text-white" />,
      color: 'from-purple-500 to-indigo-600',
      feature: 'ai_coach'
    },
    {
      title: t('dashboard.premium.advancedAnalytics'),
      description: t('dashboard.premium.advancedAnalytics.desc'),
      icon: <BarChart3 className="w-8 h-8 text-white" />,
      color: 'from-rose-500 to-pink-600',
      feature: 'advanced_analytics'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please sign in to access your dashboard</h1>
          <Link to="/onboarding">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Complete your profile to get started</h1>
          <Link to="/onboarding">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
              Complete Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const bmiInfo = getBMICategory(stats.bmi);

  return (
    <>
      <Helmet>
        <title>Tableau de bord - YapS</title>
        <meta name="description" content="Suivez vos progrès nutritionnels quotidiens, consultez votre IMC et obtenez des recommandations personnalisées sur votre tableau de bord YapS." />
      </Helmet>

      <div className="min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {t('dashboard.welcome', { name: user.user_metadata?.full_name || user.email.split('@')[0] })}
            </h1>
            <p className="text-gray-300">
              {t('dashboard.overview')}
            </p>
          </motion.div>

          {hasFeature('health_sync') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">{t('dashboard.premium.healthSync')}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center mb-2">
                    <Scale className="w-5 h-5 text-blue-400 mr-2" />
                    <h3 className="font-semibold text-white">Poids</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{healthData?.weight_kg || 'N/A'} kg</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center mb-2">
                    <Footprints className="w-5 h-5 text-green-400 mr-2" />
                    <h3 className="font-semibold text-white">Pas du jour</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{healthData?.steps || 0}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center mb-2">
                    <Flame className="w-5 h-5 text-orange-400 mr-2" />
                    <h3 className="font-semibold text-white">Calories Actives</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{healthData?.calories_active || 0}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                {healthData?.is_connected ? (
                  <>
                    <p className="text-sm text-green-400">Connecté</p>
                    <Button onClick={handleHealthConnect} disabled={isHealthSyncing} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      {isHealthSyncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Repeat className="w-4 h-4 mr-2" />}
                      Resynchroniser
                    </Button>
                    <p className="text-xs text-gray-500">Dernière synchro: {healthData.updated_at ? new Date(healthData.updated_at).toLocaleTimeString() : 'N/A'}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-yellow-400">Non connecté</p>
                    <Button onClick={handleHealthConnect} disabled={isHealthSyncing} className="bg-gradient-to-r from-teal-500 to-cyan-500">
                      {isHealthSyncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
                      Connecter Données Santé
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Scale className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-medium ${bmiInfo.color}`}>
                  {bmiInfo.category}
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stats.bmi}</div>
              <div className="text-gray-400 text-sm">{t('dashboard.bmi')}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stats.caloriesConsumed}</div>
              <div className="text-gray-400 text-sm">{t('dashboard.caloriesConsumed')}</div>
            </motion.div>

            {hasFeature('bmr_calculation') ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stats.bmr}</div>
                <div className="text-gray-400 text-sm">{t('dashboard.bmr')}</div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <Crown className="w-8 h-8 text-yellow-400" />
                    <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                      PRO
                    </span>
                  </div>
                  <div className="text-lg font-bold text-white mb-1">{t('dashboard.bmr')}</div>
                  <div className="text-gray-400 text-sm">{t('dashboard.upgrade')}</div>
                </div>
              </motion.div>
            )}

            {hasFeature('tdee_calculation') ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stats.tdee}</div>
                <div className="text-gray-400 text-sm">{t('dashboard.tdee')}</div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <Crown className="w-8 h-8 text-yellow-400" />
                    <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                      PRO
                    </span>
                  </div>
                  <div className="text-lg font-bold text-white mb-1">{t('dashboard.tdee')}</div>
                  <div className="text-gray-400 text-sm">{t('dashboard.upgrade')}</div>
                </div>
              </motion.div>
            )}
          </div>

          {hasFeature('tdee_calculation') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 mb-8"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('dashboard.recommendation')}</h3>
                  <p className="text-gray-300">{getRecommendation()}</p>
                </div>
              </div>
            </motion.div>
          )}

          {subscription === 'premium' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">{t('dashboard.premium.title')}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {premiumTools.map((tool, index) => (
                  <a href="#" key={index} onClick={(e) => handlePremiumFeatureClick(e, tool.feature)} className="group">
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300 group-hover:scale-105 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-16 h-16 bg-gradient-to-r ${tool.color} rounded-2xl flex items-center justify-center`}>
                          {tool.icon}
                        </div>
                        <Crown className="w-6 h-6 text-yellow-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{tool.title}</h3>
                      <p className="text-gray-400 text-sm flex-grow">{tool.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">{t('dashboard.quickActions')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="group"
                  onClick={(e) => {
                    if (action.premium) {
                      e.preventDefault();
                      toast({
                        title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
                      });
                    }
                  }}
                >
                  <div className={`bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300 group-hover:scale-105 ${action.premium ? 'relative overflow-hidden' : ''}`}>
                    {action.premium && (
                      <div className="absolute top-2 right-2">
                        <Crown className="w-5 h-5 text-yellow-400" />
                      </div>
                    )}
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                      {action.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                    <p className="text-gray-400 text-sm">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{t('dashboard.todayMeals')}</h2>
              <Link to="/journal">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  {t('dashboard.viewAll')}
                </Button>
              </Link>
            </div>

            {todayMeals.length > 0 ? (
              <div className="space-y-4">
                {todayMeals.slice(0, 3).map((meal, index) => (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white">{meal.name}</h3>
                        <p className="text-sm text-gray-400">{meal.type}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-white">{meal.calories} cal</div>
                        <div className="text-sm text-gray-400">
                          {new Date(meal.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{t('dashboard.noMeals')}</h3>
                <p className="text-gray-400 mb-4">{t('dashboard.noMeals.desc')}</p>
                <Link to="/journal">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    {t('dashboard.logFirstMeal')}
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isCoachModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setIsCoachModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-2xl w-full max-w-3xl border border-white/10 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{t('dashboard.premium.aiCoach')}</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsCoachModalOpen(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </Button>
              </div>
              <div className="p-6 overflow-y-auto">
                {isCoachLoading ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
                    <p className="text-gray-300">Votre coach personnel prépare vos conseils...</p>
                  </div>
                ) : coachContent ? (
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-lg font-semibold text-purple-400 mb-3">Astuce Nutritionnelle du Jour</h4>
                      <p className="text-gray-300 bg-white/5 p-4 rounded-lg border border-white/10">{coachContent.nutritionTip}</p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-purple-400 mb-3">{coachContent.fitnessSession.title} ({coachContent.fitnessSession.totalDuration})</h4>
                      <div className="space-y-4">
                        {coachContent.fitnessSession.sections.map((section, index) => (
                          <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h5 className="font-semibold text-white">{section.title} <span className="text-sm text-gray-400">({section.duration})</span></h5>
                            <p className="text-sm text-gray-400 mb-3">{section.description}</p>
                            <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                              {section.exercises.map((exercise, exIndex) => (
                                <li key={exIndex}>{exercise}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center h-64 flex items-center justify-center">
                    <p className="text-gray-400">Aucun contenu à afficher.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Dashboard;