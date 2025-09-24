import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Calendar, Plus, Crown, ChefHat, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const MealPlanner = () => {
  const { user } = useAuth();
  const { hasFeature } = useSubscription();
  const { t, language } = useLanguage();
  const [selectedWeek, setSelectedWeek] = useState(getWeekDates());
  const [mealPlan, setMealPlan] = useState({});
  const [mealSuggestions, setMealSuggestions] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [profile, setProfile] = useState(null);
  const [tdee, setTdee] = useState(0);

  function getWeekDates() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(new Date().setDate(diff));
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      week.push(date);
    }
    return week;
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  const fetchMealSuggestions = useCallback(async () => {
    setLoadingSuggestions(true);
    try {
      const suggestions = {};
      for (const type of mealTypes) {
        if (type === 'snack') continue;
        const { data, error } = await supabase.functions.invoke('fetch-spoonacular', {
          body: {
            endpoint: '/recipes/random',
            params: { number: 3, tags: type },
          },
        });
        if (error) throw error;
        if (data.error) throw new Error(data.error);
        suggestions[type] = data.recipes.map(r => ({
          id: r.id,
          name: r.title,
          calories: r.nutrition?.nutrients.find(n => n.name === 'Calories')?.amount || 0,
          time: r.readyInMinutes,
        }));
      }
      setMealSuggestions(suggestions);
    } catch (err) {
      console.error("Error fetching meal suggestions:", err);
      toast({
        title: "Error",
        description: "Failed to fetch meal suggestions.",
        variant: "destructive",
      });
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    const savedProfile = localStorage.getItem('nutritrack_profile');
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      setProfile(profileData);
      
      const { weight, height, age, gender, activityLevel } = profileData;
      const heightInM = height / 100;
      const weightFactor = Math.pow(weight, 0.48);
      const heightFactor = Math.pow(heightInM, 0.50);
      const ageFactor = Math.pow(age, -0.13);
      let bmrInMj;
      if (gender === 'male') {
        bmrInMj = 1.083 * weightFactor * heightFactor * ageFactor;
      } else {
        bmrInMj = 0.963 * weightFactor * heightFactor * ageFactor;
      }
      const bmr = bmrInMj * 239.006;
      const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
      setTdee(bmr * (activityMultipliers[activityLevel] || 1.55));
    }

    if (hasFeature('meal_planner')) {
      loadMealPlan();
      fetchMealSuggestions();
    }
  }, [hasFeature, fetchMealSuggestions]);

  const loadMealPlan = () => {
    const saved = localStorage.getItem('yaps_meal_plan');
    if (saved) {
      setMealPlan(JSON.parse(saved));
    }
  };

  const saveMealPlan = (plan) => {
    localStorage.setItem('yaps_meal_plan', JSON.stringify(plan));
    setMealPlan(plan);
  };

  const addMealToPlan = (dayIndex, mealType, meal) => {
    if (!hasFeature('meal_planner')) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to Pro to access the meal planner!",
        variant: "destructive"
      });
      return;
    }

    const dateKey = selectedWeek[dayIndex].toISOString().split('T')[0];
    const newPlan = { ...mealPlan };
    
    if (!newPlan[dateKey]) newPlan[dateKey] = {};
    if (!newPlan[dateKey][mealType]) newPlan[dateKey][mealType] = [];
    
    newPlan[dateKey][mealType].push({ ...meal, id: `${meal.id}-${Date.now()}` });
    
    saveMealPlan(newPlan);
    toast({
      title: "Meal Added!",
      description: `${meal.name} added to your ${mealType} plan.`
    });
  };

  const removeMealFromPlan = (dayIndex, mealType, mealId) => {
    const dateKey = selectedWeek[dayIndex].toISOString().split('T')[0];
    const newPlan = { ...mealPlan };
    
    if (newPlan[dateKey] && newPlan[dateKey][mealType]) {
      newPlan[dateKey][mealType] = newPlan[dateKey][mealType].filter(meal => meal.id !== mealId);
    }
    
    saveMealPlan(newPlan);
    toast({
      title: "Meal Removed",
      description: "Meal removed from your plan."
    });
  };

  const generateWeeklyPlan = async () => {
    setIsGenerating(true);
    toast({
      title: "Génération en cours...",
      description: "Votre plan de repas personnalisé est en cours de création. Cela peut prendre un moment."
    });

    try {
      const { data, error } = await supabase.functions.invoke('generate-weekly-plan', {
        body: { userProfile: profile, tdee },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const newPlan = {};
      selectedWeek.forEach((date, dayIndex) => {
        const dateKey = date.toISOString().split('T')[0];
        const dayData = data[dayIndex];
        if (dayData) {
          newPlan[dateKey] = {
            breakfast: dayData.breakfast ? [dayData.breakfast] : [],
            lunch: dayData.lunch ? [dayData.lunch] : [],
            dinner: dayData.dinner ? [dayData.dinner] : [],
          };
        }
      });

      saveMealPlan(newPlan);
      toast({
        title: "Plan de repas généré !",
        description: "Votre plan de repas pour la semaine a été créé avec succès."
      });

    } catch (err) {
      console.error("Error generating weekly plan:", err);
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer le plan de repas. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please sign in to access meal planner</h1>
        </div>
      </div>
    );
  }

  if (!hasFeature('meal_planner')) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full text-center"
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-3xl p-12 border border-purple-500/30">
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">{t('planner.locked.title')}</h1>
            <p className="text-gray-300 mb-8">{t('planner.locked.subtitle')}</p>
            <div className="bg-white/5 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">{t('planner.locked.featuresTitle')}</h3>
              <ul className="text-left text-gray-300 space-y-2">
                <li>{t('planner.locked.feature1')}</li>
                <li>{t('planner.locked.feature2')}</li>
                <li>{t('planner.locked.feature3')}</li>
                <li>{t('planner.locked.feature4')}</li>
                <li>{t('planner.locked.feature5')}</li>
              </ul>
            </div>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-4">
              {t('planner.locked.upgrade')}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Meal Planner - YapS</title>
        <meta name="description" content="Plan your weekly meals with personalized recommendations and track your nutrition goals effectively." />
      </Helmet>

      <div className="min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('planner.title')}</h1>
              <p className="text-gray-300">{t('planner.subtitle')}</p>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Button
                onClick={generateWeeklyPlan}
                disabled={isGenerating}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ChefHat className="w-4 h-4 mr-2" />
                )}
                {isGenerating ? t('planner.generating') : t('planner.generate')}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {t('planner.weekOf', { start: selectedWeek[0].toLocaleDateString(language), end: selectedWeek[6].toLocaleDateString(language) })}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedWeek(selectedWeek.map(d => new Date(d.setDate(d.getDate() - 7))))} className="border-white/20 text-white hover:bg-white/10">{t('planner.previous')}</Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedWeek(getWeekDates())} className="border-white/20 text-white hover:bg-white/10">{t('planner.thisWeek')}</Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedWeek(selectedWeek.map(d => new Date(d.setDate(d.getDate() + 7))))} className="border-white/20 text-white hover:bg-white/10">{t('planner.next')}</Button>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-7 gap-4">
            {selectedWeek.map((date, dayIndex) => {
              const dateKey = date.toISOString().split('T')[0];
              const dayPlan = mealPlan[dateKey] || {};
              
              return (
                <motion.div
                  key={dayIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + dayIndex * 0.1 }}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10"
                >
                  <div className="text-center mb-4">
                    <h3 className="font-semibold text-white">{daysOfWeek[dayIndex]}</h3>
                    <p className="text-sm text-gray-400">{date.getDate()}</p>
                  </div>
                  <div className="space-y-4">
                    {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                      <div key={mealType} className="border border-white/10 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-gray-300 mb-2 capitalize">{t(`journal.${mealType}`)}</h4>
                        {dayPlan[mealType] && dayPlan[mealType].length > 0 ? (
                          <div className="space-y-2">
                            {dayPlan[mealType].map((meal) => (
                              <div key={meal.id} className="bg-white/5 rounded p-2 text-xs">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-white font-medium">{meal.name}</p>
                                    <p className="text-gray-400">{Math.round(meal.calories)} cal</p>
                                  </div>
                                  <button onClick={() => removeMealFromPlan(dayIndex, mealType, meal.id)} className="text-red-400 hover:text-red-300">×</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-2">
                            <button onClick={() => {
                                const suggestions = mealSuggestions[mealType];
                                if (suggestions && suggestions.length > 0) {
                                  const randomMeal = suggestions[Math.floor(Math.random() * suggestions.length)];
                                  addMealToPlan(dayIndex, mealType, randomMeal);
                                }
                              }} className="text-purple-400 hover:text-purple-300 text-xs flex items-center justify-center w-full">
                              <Plus className="w-3 h-3 mr-1" />
                              {t('planner.addMeal')}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {dayPlan && Object.keys(dayPlan).length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">{t('planner.dailyTotal')}</p>
                        <p className="text-sm font-semibold text-white">{Object.values(dayPlan).flat().reduce((total, meal) => total + Math.round(meal.calories), 0)} cal</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">{t('planner.suggestions')}</h2>
            {loadingSuggestions ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(mealSuggestions).map(([type, meals]) => (
                  <div key={type} className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 capitalize">{t(`journal.${type}`)}</h3>
                    <div className="space-y-3">
                      {meals && meals.map((meal, index) => (
                        <div
                          key={index}
                          className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer"
                          onClick={() => {
                            const todayIndex = selectedWeek.findIndex(d => d.toDateString() === new Date().toDateString());
                            if (todayIndex !== -1) addMealToPlan(todayIndex, type, meal);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-white text-sm font-medium">{meal.name}</p>
                              <div className="flex items-center space-x-2 text-xs text-gray-400">
                                <span>{Math.round(meal.calories)} cal</span>
                                {meal.time > 0 && (
                                  <>
                                    <span>•</span>
                                    <div className="flex items-center"><Clock className="w-3 h-3 mr-1" />{meal.time}m</div>
                                  </>
                                )}
                              </div>
                            </div>
                            <Plus className="w-4 h-4 text-purple-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default MealPlanner;