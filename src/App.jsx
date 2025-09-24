import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';

import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext.jsx';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext.jsx';
import { LanguageProvider } from '@/contexts/LanguageContext.jsx';

import Navbar from '@/components/Navbar.jsx';
import Footer from '@/components/Footer.jsx';

import Home from '@/pages/Home.jsx';
import Onboarding from '@/pages/Onboarding.jsx';
import Dashboard from '@/pages/Dashboard.jsx';
import FoodJournal from '@/pages/FoodJournal.jsx';
import Recipes from '@/pages/Recipes.jsx';
import RecipeDetail from '@/pages/RecipeDetail.jsx';
import MealPlanner from '@/pages/MealPlanner.jsx';
import Subscriptions from '@/pages/Subscriptions.jsx';
import Profile from '@/pages/Profile.jsx';
import Legal from '@/pages/Legal.jsx';

function App() {
  return (
    <LanguageProvider>
      <SupabaseAuthProvider>
        <SubscriptionProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex flex-col">
              <Helmet>
                <title>YapS - Smart Diet & Nutrition Tracking</title>
                <meta
                  name="description"
                  content="Track your nutrition, plan meals, and achieve your health goals with our intelligent diet tracking app."
                />
              </Helmet>

              <Navbar />

              <main className="flex-grow pt-16">
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

              <Footer />
              <Toaster />
            </div>
          </Router>
        </SubscriptionProvider>
      </SupabaseAuthProvider>
    </LanguageProvider>
  );
}

export default App;
