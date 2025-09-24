import React from 'react';
import Home from "@/pages/Home.jsx";
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import SubscriptionContext, { SubscriptionProvider, useSubscription } from "./contexts/SubscriptionContext.jsx";
import { LanguageProvider } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer'; // Import the new Footer component
import Home from '@/pages/Home.jsx';
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import FoodJournal from '@/pages/FoodJournal';
import Recipes from '@/pages/Recipes';
import RecipeDetail from '@/pages/RecipeDetail';
import MealPlanner from '@/pages/MealPlanner';
import Subscriptions from '@/pages/Subscriptions';
import Profile from '@/pages/Profile';
import Legal from '@/pages/Legal';

function App() {
  return (
    <LanguageProvider>
      <SupabaseAuthProvider>
        <SubscriptionProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex flex-col">
              <Helmet>
                <title>YapS - Smart Diet & Nutrition Tracking</title>
                <meta name="description" content="Track your nutrition, plan meals, and achieve your health goals with our intelligent diet tracking app." />
              </Helmet>
              <Navbar />
              <main className="flex-grow pt-16"> {/* Use flex-grow to push footer to bottom */}
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/journal" element={<FoodJournal />} />
                  <Route path="/recipes" element={<Recipes />} />
                  <Route path="/recipe/:id" element={<RecipeDetail />} />
                  <Route path="/planner" element={<MealPlanner />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/legal" element={<Legal />} />
                </Routes>
              </main>
              <Footer /> {/* Render the Footer component */}
              <Toaster />
            </div>
          </Router>
        </SubscriptionProvider>
      </SupabaseAuthProvider>
    </LanguageProvider>
  );
}

export default App;
