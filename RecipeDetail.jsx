import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Clock, Users, Leaf, Wheat, UtensilsCrossed as UtensilsCross, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: functionError } = await supabase.functions.invoke('fetch-spoonacular', {
          body: {
            endpoint: `/recipes/${id}/information`,
            params: {
              includeNutrition: true,
            },
          },
        });

        if (functionError) throw functionError;
        if (data.error) throw new Error(data.error);
        
        setRecipe(data);
      } catch (err) {
        console.error("Error fetching recipe details:", err);
        setError("Failed to fetch recipe details. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to fetch recipe details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-white animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <UtensilsCross className="w-16 h-16 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong.</h1>
        <p className="text-red-400 mb-6">{error}</p>
        <Button onClick={() => navigate('/recipes')}>Back to Recipes</Button>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  const nutrition = recipe.nutrition?.nutrients;
  const calories = nutrition?.find(n => n.name === 'Calories')?.amount;
  const protein = nutrition?.find(n => n.name === 'Protein')?.amount;
  const carbs = nutrition?.find(n => n.name === 'Carbohydrates')?.amount;
  const fat = nutrition?.find(n => n.name === 'Fat')?.amount;

  return (
    <>
      <Helmet>
        <title>{recipe.title} - YapS</title>
        <meta name="description" content={recipe.summary?.replace(/<[^>]+>/g, '').slice(0, 160)} />
      </Helmet>

      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Recipes
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10"
          >
            <img src={recipe.image} alt={recipe.title} className="w-full h-64 md:h-96 object-cover" />
            
            <div className="p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{recipe.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-6">
                <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-purple-400" /> {recipe.readyInMinutes} minutes</div>
                <div className="flex items-center gap-2"><Users className="w-5 h-5 text-purple-400" /> Serves {recipe.servings}</div>
                {recipe.vegetarian && <div className="flex items-center gap-2"><Leaf className="w-5 h-5 text-green-400" /> Vegetarian</div>}
                {recipe.glutenFree && <div className="flex items-center gap-2"><Wheat className="w-5 h-5 text-yellow-400" /> Gluten-Free</div>}
              </div>

              <div
                className="text-gray-300 prose prose-invert max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: recipe.summary }}
              />

              <div className="grid md:grid-cols-2 gap-8">
                {/* Ingredients */}
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-4">Ingredients</h2>
                  <ul className="space-y-3">
                    {recipe.extendedIngredients?.map(ing => (
                      <li key={ing.id} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                        <span className="text-gray-300">{ing.original}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Nutrition */}
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-4">Nutrition Facts</h2>
                  <div className="bg-white/10 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-white"><span className="font-medium">Calories</span><span>{calories?.toFixed(0)}</span></div>
                    <div className="flex justify-between text-gray-300"><span>Protein</span><span>{protein?.toFixed(1)}g</span></div>
                    <div className="flex justify-between text-gray-300"><span>Carbohydrates</span><span>{carbs?.toFixed(1)}g</span></div>
                    <div className="flex justify-between text-gray-300"><span>Fat</span><span>{fat?.toFixed(1)}g</span></div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Instructions</h2>
                <div className="space-y-4">
                  {recipe.analyzedInstructions?.[0]?.steps.map(step => (
                    <div key={step.number} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-500/50 rounded-full flex items-center justify-center text-white font-bold mt-1">{step.number}</div>
                      <p className="text-gray-300">{step.step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default RecipeDetail;