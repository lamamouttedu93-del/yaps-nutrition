import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Plus, Search, Calendar, Trash2, Edit3, Download, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';

const FoodJournal = () => {
  const { user } = useAuth();
  const { hasFeature } = useSubscription();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMeal, setNewMeal] = useState({
    name: '',
    type: 'breakfast',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    notes: ''
  });

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = () => {
    const savedMeals = localStorage.getItem('nutritrack_meals');
    if (savedMeals) {
      setMeals(JSON.parse(savedMeals));
    }
  };

  const saveMeals = (updatedMeals) => {
    localStorage.setItem('nutritrack_meals', JSON.stringify(updatedMeals));
    setMeals(updatedMeals);
  };

  const handleAddMeal = (e) => {
    e.preventDefault();
    
    if (!newMeal.name || !newMeal.calories) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez renseigner le nom du repas et les calories.",
        variant: "destructive"
      });
      return;
    }

    const meal = {
      id: Date.now().toString(),
      ...newMeal,
      calories: parseInt(newMeal.calories),
      protein: parseFloat(newMeal.protein) || 0,
      carbs: parseFloat(newMeal.carbs) || 0,
      fat: parseFloat(newMeal.fat) || 0,
      date: new Date(selectedDate + 'T12:00:00').toISOString(),
      createdAt: new Date().toISOString()
    };

    const updatedMeals = [...meals, meal];
    saveMeals(updatedMeals);
    
    setNewMeal({
      name: '',
      type: 'breakfast',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      notes: ''
    });
    setShowAddMeal(false);
    
    toast({
      title: "Repas ajouté !",
      description: "Votre repas a été enregistré avec succès."
    });
  };

  const handleEditMeal = (meal) => {
    setEditingMeal(meal);
    setNewMeal({
      name: meal.name,
      type: meal.type,
      calories: meal.calories.toString(),
      protein: meal.protein.toString(),
      carbs: meal.carbs.toString(),
      fat: meal.fat.toString(),
      notes: meal.notes || ''
    });
    setShowAddMeal(true);
  };

  const handleUpdateMeal = (e) => {
    e.preventDefault();
    
    const updatedMeal = {
      ...editingMeal,
      ...newMeal,
      calories: parseInt(newMeal.calories),
      protein: parseFloat(newMeal.protein) || 0,
      carbs: parseFloat(newMeal.carbs) || 0,
      fat: parseFloat(newMeal.fat) || 0,
      updatedAt: new Date().toISOString()
    };

    const updatedMeals = meals.map(meal => 
      meal.id === editingMeal.id ? updatedMeal : meal
    );
    saveMeals(updatedMeals);
    
    setNewMeal({
      name: '',
      type: 'breakfast',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      notes: ''
    });
    setShowAddMeal(false);
    setEditingMeal(null);
    
    toast({
      title: "Repas mis à jour !",
      description: "Votre repas a été mis à jour avec succès."
    });
  };

  const handleDeleteMeal = (mealId) => {
    const updatedMeals = meals.filter(meal => meal.id !== mealId);
    saveMeals(updatedMeals);
    
    toast({
      title: "Repas supprimé",
      description: "Le repas a été retiré de votre journal."
    });
  };

  const handleExport = () => {
    if (!hasFeature('export_data')) {
      toast({
        title: "Fonctionnalité Pro/Premium",
        description: "Passez à un plan supérieur pour exporter vos données.",
        action: <Button onClick={() => navigate('/subscriptions')}>Mettre à niveau</Button>,
      });
      return;
    }

    const dataToExport = meals.map(meal => ({
      Date: new Date(meal.date).toLocaleDateString(),
      Type: meal.type,
      Nom: meal.name,
      Calories: meal.calories,
      Protéines: meal.protein,
      Glucides: meal.carbs,
      Lipides: meal.fat,
      Notes: meal.notes || '',
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `journal_alimentaire_yaps_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportation réussie",
      description: "Votre journal alimentaire a été téléchargé en CSV.",
    });
  };

  const filteredMeals = meals.filter(meal => {
    const mealDate = new Date(meal.date).toISOString().split('T')[0];
    const matchesDate = mealDate === selectedDate;
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDate && matchesSearch;
  });

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealsByType = mealTypes.reduce((acc, type) => {
    acc[type] = filteredMeals.filter(meal => meal.type === type);
    return acc;
  }, {});

  const dailyTotals = filteredMeals.reduce((totals, meal) => ({
    calories: totals.calories + meal.calories,
    protein: totals.protein + meal.protein,
    carbs: totals.carbs + meal.carbs,
    fat: totals.fat + meal.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Veuillez vous connecter pour accéder à votre journal alimentaire</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Journal Alimentaire - YapS</title>
        <meta name="description" content="Enregistrez vos repas quotidiens et suivez votre apport nutritionnel avec des informations détaillées sur les calories et les macronutriments." />
      </Helmet>

      <div className="min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('journal.title')}</h1>
              <p className="text-gray-300">{t('journal.subtitle')}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
              <Button
                onClick={handleExport}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                {!hasFeature('export_data') && <Crown className="w-4 h-4 mr-2 text-yellow-400" />}
                <Download className="w-4 h-4 mr-2" />
                {t('journal.export')}
              </Button>
              <Button
                onClick={() => setShowAddMeal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('journal.addMeal')}
              </Button>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('journal.selectDate')}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('journal.searchMeals')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('journal.searchMeals') + '...'}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Daily Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl p-4 border border-blue-500/30">
              <div className="text-2xl font-bold text-white">{dailyTotals.calories}</div>
              <div className="text-blue-300 text-sm">{t('journal.totalCalories')}</div>
            </div>
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-xl p-4 border border-green-500/30">
              <div className="text-2xl font-bold text-white">{Math.round(dailyTotals.protein)}g</div>
              <div className="text-green-300 text-sm">{t('journal.protein')}</div>
            </div>
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-xl p-4 border border-yellow-500/30">
              <div className="text-2xl font-bold text-white">{Math.round(dailyTotals.carbs)}g</div>
              <div className="text-yellow-300 text-sm">{t('journal.carbs')}</div>
            </div>
            <div className="bg-gradient-to-r from-pink-500/20 to-red-500/20 backdrop-blur-lg rounded-xl p-4 border border-pink-500/30">
              <div className="text-2xl font-bold text-white">{Math.round(dailyTotals.fat)}g</div>
              <div className="text-pink-300 text-sm">{t('journal.fat')}</div>
            </div>
          </motion.div>

          {/* Meals by Type */}
          <div className="space-y-6">
            {mealTypes.map((type, index) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-xl font-semibold text-white mb-4 capitalize">
                  {t(`journal.${type}`)} ({mealsByType[type].length} items)
                </h3>
                
                {mealsByType[type].length > 0 ? (
                  <div className="space-y-3">
                    {mealsByType[type].map((meal) => (
                      <div
                        key={meal.id}
                        className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-purple-500/30 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{meal.name}</h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                              <span>{meal.calories} cal</span>
                              {meal.protein > 0 && <span>{Math.round(meal.protein)}g protein</span>}
                              {meal.carbs > 0 && <span>{Math.round(meal.carbs)}g carbs</span>}
                              {meal.fat > 0 && <span>{Math.round(meal.fat)}g fat</span>}
                            </div>
                            {meal.notes && (
                              <p className="text-sm text-gray-400 mt-2">{meal.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditMeal(meal)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMeal(meal.id)}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>{t('journal.noMealLogged', { type: t(`journal.${type}`) })}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Add/Edit Meal Modal */}
          {showAddMeal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-white/10"
              >
                <h3 className="text-xl font-bold text-white mb-6">
                  {editingMeal ? t('journal.modal.edit') : t('journal.modal.add')}
                </h3>
                
                <form onSubmit={editingMeal ? handleUpdateMeal : handleAddMeal} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('journal.modal.name')} *
                    </label>
                    <input
                      type="text"
                      value={newMeal.name}
                      onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="ex: Salade de poulet grillé"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('journal.modal.type')}
                    </label>
                    <select
                      value={newMeal.type}
                      onChange={(e) => setNewMeal(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="breakfast">{t('journal.breakfast')}</option>
                      <option value="lunch">{t('journal.lunch')}</option>
                      <option value="dinner">{t('journal.dinner')}</option>
                      <option value="snack">{t('journal.snack')}</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('journal.modal.calories')} *
                      </label>
                      <input
                        type="number"
                        value={newMeal.calories}
                        onChange={(e) => setNewMeal(prev => ({ ...prev, calories: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="300"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('journal.modal.protein')}
                      </label>
                      <input
                        type="number"
                        value={newMeal.protein}
                        onChange={(e) => setNewMeal(prev => ({ ...prev, protein: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="25"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('journal.modal.carbs')}
                      </label>
                      <input
                        type="number"
                        value={newMeal.carbs}
                        onChange={(e) => setNewMeal(prev => ({ ...prev, carbs: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="30"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('journal.modal.fat')}
                      </label>
                      <input
                        type="number"
                        value={newMeal.fat}
                        onChange={(e) => setNewMeal(prev => ({ ...prev, fat: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="10"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('journal.modal.notes')}
                    </label>
                    <textarea
                      value={newMeal.notes}
                      onChange={(e) => setNewMeal(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="..."
                      rows="3"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddMeal(false);
                        setEditingMeal(null);
                        setNewMeal({
                          name: '',
                          type: 'breakfast',
                          calories: '',
                          protein: '',
                          carbs: '',
                          fat: '',
                          notes: ''
                        });
                      }}
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      {t('journal.modal.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      {editingMeal ? t('journal.modal.edit') : t('journal.addMeal')}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FoodJournal;
