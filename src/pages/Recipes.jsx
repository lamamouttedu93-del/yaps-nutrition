import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Search, Filter, Clock, Users, Heart, Star, Crown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';

const Recipes = () => {
  const { user } = useAuth();
  const { subscription, isAdmin } = useSubscription();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filters = [
    { id: 'all', label: t('recipes.all') },
    { id: 'vegetarian', label: t('recipes.vegetarian') },
    { id: 'vegan', label: t('recipes.vegan') },
    { id: 'keto', label: t('recipes.keto') },
    { id: 'gluten-free', label: t('recipes.glutenFree'), diet: 'gluten free' },
    { id: 'quick', label: t('recipes.quick') }
  ];

  const getWeekOfYear = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);

    const weekNumber = getWeekOfYear(new Date());
    const offset = (weekNumber % 4) * 25;

    const params = {
      query: searchTerm,
      number: 25,
      addRecipeInformation: true,
      offset: offset,
    };

    const selectedFilterObject = filters.find(f => f.id === selectedFilter);

    if (selectedFilter !== 'all') {
      if (selectedFilter === 'quick') {
        params.maxReadyTime = 30;
      } else {
        params.diet = selectedFilterObject?.diet || selectedFilter;
      }
    }

    try {
      const { data, error: functionError } = await supabase.functions.invoke('fetch-spoonacular', {
        body: {
          endpoint: '/recipes/complexSearch',
          params,
        },
      });

      if (functionError) throw functionError;
      if (data.error) throw new Error(data.error);
      
      setRecipes(data.results || []);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Failed to fetch recipes. The API might be unavailable. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to fetch recipes. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedFilter]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('yaps_favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const toggleFavorite = (recipeId) => {
    const updatedFavorites = favorites.includes(recipeId)
      ? favorites.filter(id => id !== recipeId)
      : [...favorites, recipeId];
    
    setFavorites(updatedFavorites);
    localStorage.setItem('yaps_favorites', JSON.stringify(updatedFavorites));
    
    toast({
      title: favorites.includes(recipeId) ? "Retiré des favoris" : "Ajouté aux favoris",
      description: "Vos favoris ont été mis à jour."
    });
  };

  const handleRecipeClick = (recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecipes();
  };

  const displayedRecipes = subscription === 'free' && !isAdmin ? recipes.slice(0, 3) : recipes;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Veuillez vous connecter pour accéder aux recettes</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Recettes - YapS</title>
        <meta name="description" content="Découvrez des recettes saines et délicieuses adaptées à vos préférences alimentaires et à vos objectifs nutritionnels." />
      </Helmet>

      <div className="min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {t('recipes.title')}
            </h1>
            <p className="text-gray-300">
              {t('recipes.subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-8"
          >
            <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('recipes.search')}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <Button
                    key={filter.id}
                    type="button"
                    onClick={() => setSelectedFilter(filter.id)}
                    variant={selectedFilter === filter.id ? "default" : "outline"}
                    size="sm"
                    className={
                      selectedFilter === filter.id
                        ? "bg-gradient-to-r from-purple-500 to-pink-500"
                        : "border-white/20 text-white hover:bg-white/10"
                    }
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
               <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </form>
          </motion.div>

          {subscription === 'free' && !isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/30 mb-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Crown className="w-8 h-8 text-yellow-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{t('recipes.premiumBanner')}</h3>
                    <p className="text-gray-300">{t('recipes.premiumBanner.desc')}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/subscriptions')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  {t('recipes.upgradeNow')}
                </Button>
              </div>
            </motion.div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">
              <h3 className="text-xl font-semibold mb-2">Oops! Something went wrong.</h3>
              <p>{error}</p>
            </div>
          ) : displayedRecipes.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedRecipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/30 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleRecipeClick(recipe)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(recipe.id);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                    >
                      <Heart 
                        className={`w-4 h-4 ${
                          favorites.includes(recipe.id) 
                            ? 'text-red-500 fill-current' 
                            : 'text-white'
                        }`} 
                      />
                    </button>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {recipe.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {recipe.readyInMinutes}m
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {recipe.servings}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-400" />
                        {(recipe.spoonacularScore / 20).toFixed(1)}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {recipe.diets.slice(0, 3).map((diet) => (
                        <span
                          key={diet}
                          className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                        >
                          {diet}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t('recipes.noResults')}</h3>
              <p className="text-gray-400">{t('recipes.noResults.desc')}</p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Recipes;
