import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, User, Crown, Globe, ShieldCheck, Star } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { subscription, isAdmin } = useSubscription();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const navigation = [
    { name: t('nav.dashboard'), href: '/dashboard', auth: true },
    { name: t('nav.journal'), href: '/journal', auth: true },
    { name: t('nav.recipes'), href: '/recipes', auth: true },
    { name: t('nav.planner'), href: '/planner', auth: true },
    { name: t('nav.subscriptions'), href: '/subscriptions', auth: true }
  ];

  const getSubscriptionBadge = () => {
    if (isAdmin) return { text: 'Admin', color: 'bg-gradient-to-r from-red-500 to-red-700', icon: <ShieldCheck className="w-3 h-3 mr-1" /> };
    if (subscription === 'premium') return { text: t('plan.premium'), color: 'bg-gradient-to-r from-yellow-400 to-orange-500', icon: <Crown className="w-3 h-3 mr-1" /> };
    if (subscription === 'pro') return { text: t('plan.pro'), color: 'bg-gradient-to-r from-blue-500 to-purple-600', icon: <Star className="w-3 h-3 mr-1" /> };
    return { text: t('plan.free'), color: 'bg-gray-600', icon: null };
  };

  const badge = getSubscriptionBadge();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Y</span>
            </div>
            <span className="text-white font-bold text-xl">YapS</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {user && navigation.map(item => (
              <Link key={item.name} to={item.href} className={`text-sm font-medium transition-colors ${location.pathname === item.href ? 'text-purple-400' : 'text-gray-300 hover:text-white'}`}>
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white">
                  <Globe className="w-4 h-4 mr-2" />
                  {language.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
                <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer hover:bg-slate-700">English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('fr')} className="cursor-pointer hover:bg-slate-700">Français</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('zh')} className="cursor-pointer hover:bg-slate-700">中文</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <>
                <div className={`px-3 py-1 rounded-full text-xs font-medium text-white flex items-center ${badge.color}`}>
                  {badge.icon}
                  {badge.text}
                </div>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="text-white">
                    <User className="w-4 h-4 mr-2" />
                    {t('nav.profile')}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={signOut} className="text-white">
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <Link to="/onboarding">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  {t('nav.getStarted')}
                </Button>
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-black/90 backdrop-blur-lg border-t border-white/10"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user && navigation.map(item => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${location.pathname === item.href ? 'text-purple-400 bg-purple-900/20' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10">
              <div className="px-3 py-2 text-gray-300">Language</div>
              <div className="flex justify-around px-3 py-2">
                <Button variant={language === 'en' ? 'secondary' : 'ghost'} size="sm" onClick={() => { setLanguage('en'); setIsOpen(false); }}>EN</Button>
                <Button variant={language === 'fr' ? 'secondary' : 'ghost'} size="sm" onClick={() => { setLanguage('fr'); setIsOpen(false); }}>FR</Button>
                <Button variant={language === 'zh' ? 'secondary' : 'ghost'} size="sm" onClick={() => { setLanguage('zh'); setIsOpen(false); }}>ZH</Button>
              </div>
            </div>
            {user ? (
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-gray-300">{t('nav.subscription')}:</span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium text-white flex items-center ${badge.color}`}>
                    {badge.icon}
                    {badge.text}
                  </div>
                </div>
                <Link to="/profile" className="block px-3 py-2 text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
                  {t('nav.profile')}
                </Link>
                <button
                  onClick={() => { signOut(); setIsOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <Link to="/onboarding" className="block px-3 py-2 text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md font-medium" onClick={() => setIsOpen(false)}>
                {t('nav.getStarted')}
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
