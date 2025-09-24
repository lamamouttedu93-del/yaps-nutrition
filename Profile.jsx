import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { User, Scale, Target, Activity, Save, Edit3, CreditCard, XCircle, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { subscriptionDetails, cancelSubscription } = useSubscription();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    goal: '',
    activityLevel: ''
  });
  const [weightHistory, setWeightHistory] = useState([]);

  useEffect(() => {
    loadProfile();
    loadWeightHistory();
  }, []);

  const loadProfile = () => {
    const savedProfile = localStorage.getItem('nutritrack_profile');
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      setProfile(profileData);
      setFormData({
        age: profileData.age.toString(),
        gender: profileData.gender,
        weight: profileData.weight.toString(),
        height: profileData.height.toString(),
        goal: profileData.goal,
        activityLevel: profileData.activityLevel || 'moderate'
      });
    }
  };

  const loadWeightHistory = () => {
    const saved = localStorage.getItem('nutritrack_weight_history');
    if (saved) {
      setWeightHistory(JSON.parse(saved));
    }
  };

  const saveProfile = () => {
    const updatedProfile = {
      ...profile,
      age: parseInt(formData.age),
      gender: formData.gender,
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      goal: formData.goal,
      activityLevel: formData.activityLevel,
      updatedAt: new Date().toISOString()
    };

    if (profile && profile.weight !== updatedProfile.weight) {
      const newWeightEntry = {
        weight: updatedProfile.weight,
        date: new Date().toISOString(),
        id: Date.now().toString()
      };
      const updatedHistory = [...weightHistory, newWeightEntry];
      setWeightHistory(updatedHistory);
      localStorage.setItem('nutritrack_weight_history', JSON.stringify(updatedHistory));
    }

    setProfile(updatedProfile);
    localStorage.setItem('nutritrack_profile', JSON.stringify(updatedProfile));
    setIsEditing(false);
    
    toast({
      title: "Profil mis à jour !",
      description: "Votre profil a été enregistré avec succès."
    });
  };

  const calculateBMI = () => {
    if (!profile) return 0;
    const heightInM = profile.height / 100;
    return Math.round((profile.weight / (heightInM * heightInM)) * 10) / 10;
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: t('bmi.underweight'), color: 'text-blue-400' };
    if (bmi < 25) return { category: t('bmi.normal'), color: 'text-green-400' };
    if (bmi < 30) return { category: t('bmi.overweight'), color: 'text-yellow-400' };
    return { category: t('bmi.obese'), color: 'text-red-400' };
  };

  const goals = [
    { id: 'lose_weight', label: t('onboarding.goal.lose'), description: t('onboarding.goal.lose.desc') },
    { id: 'maintain_weight', label: t('onboarding.goal.maintain'), description: t('onboarding.goal.maintain.desc') },
    { id: 'gain_weight', label: t('onboarding.goal.gain'), description: t('onboarding.goal.gain.desc') },
    { id: 'improve_health', label: t('onboarding.goal.improve'), description: t('onboarding.goal.improve.desc') }
  ];

  const activityLevels = [
    { id: 'sedentary', label: t('onboarding.activity.sedentary'), description: t('onboarding.activity.sedentary.desc') },
    { id: 'light', label: t('onboarding.activity.light'), description: t('onboarding.activity.light.desc') },
    { id: 'moderate', label: t('onboarding.activity.moderate'), description: t('onboarding.activity.moderate.desc') },
    { id: 'active', label: t('onboarding.activity.active'), description: t('onboarding.activity.active.desc') },
    { id: 'very_active', label: t('onboarding.activity.veryActive'), description: t('onboarding.activity.veryActive.desc') }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Veuillez vous connecter pour accéder à votre profil</h1>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Aucun profil trouvé</h1>
          <p className="text-gray-300 mb-4">Complétez la configuration de votre profil pour commencer</p>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
            Compléter le profil
          </Button>
        </div>
      </div>
    );
  }

  const bmi = calculateBMI();
  const bmiInfo = getBMICategory(bmi);

  return (
    <>
      <Helmet>
        <title>Profil - YapS</title>
        <meta name="description" content="Gérez votre profil personnel, suivez vos progrès et mettez à jour vos objectifs et préférences nutritionnels." />
      </Helmet>

      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('profile.title')}</h1>
              <p className="text-gray-300">{t('profile.subtitle')}</p>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {t('profile.edit')}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      loadProfile();
                    }}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    {t('profile.cancel')}
                  </Button>
                  <Button
                    onClick={saveProfile}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {t('profile.save')}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center mb-6">
                  <User className="w-6 h-6 text-purple-400 mr-3" />
                  <h2 className="text-xl font-semibold text-white">{t('profile.basicInfo')}</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('profile.name')}
                    </label>
                    <input
                      type="text"
                      value={user.user_metadata?.full_name || user.email.split('@')[0]}
                      disabled
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('profile.email')}
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('onboarding.age')}
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-white/20 rounded-lg text-white ${
                        isEditing 
                          ? 'bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500' 
                          : 'bg-white/5 cursor-not-allowed'
                      }`}
                      min="13"
                      max="120"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('onboarding.gender')}
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-white/20 rounded-lg text-white ${
                        isEditing 
                          ? 'bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500' 
                          : 'bg-white/5 cursor-not-allowed'
                      }`}
                    >
                      <option value="male">{t('onboarding.male')}</option>
                      <option value="female">{t('onboarding.female')}</option>
                      <option value="other">{t('onboarding.other')}</option>
                    </select>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center mb-6">
                  <Scale className="w-6 h-6 text-blue-400 mr-3" />
                  <h2 className="text-xl font-semibold text-white">{t('profile.physicalStats')}</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('onboarding.weight')}
                    </label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-white/20 rounded-lg text-white ${
                        isEditing 
                          ? 'bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500' 
                          : 'bg-white/5 cursor-not-allowed'
                      }`}
                      min="20"
                      max="300"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('onboarding.height')}
                    </label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-white/20 rounded-lg text-white ${
                        isEditing 
                          ? 'bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500' 
                          : 'bg-white/5 cursor-not-allowed'
                      }`}
                      min="100"
                      max="250"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center mb-6">
                  <Target className="w-6 h-6 text-green-400 mr-3" />
                  <h2 className="text-xl font-semibold text-white">{t('profile.goalsActivity')}</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                      {t('onboarding.goal')}
                    </label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {goals.map((goal) => (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => isEditing && setFormData(prev => ({ ...prev, goal: goal.id }))}
                          disabled={!isEditing}
                          className={`p-4 rounded-lg border text-left transition-all ${
                            formData.goal === goal.id
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-white/20 bg-white/5 hover:border-purple-500/50'
                          } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                        >
                          <div className="font-medium text-white">{goal.label}</div>
                          <div className="text-sm text-gray-400">{goal.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                      {t('onboarding.activity')}
                    </label>
                    <div className="space-y-2">
                      {activityLevels.map((level) => (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => isEditing && setFormData(prev => ({ ...prev, activityLevel: level.id }))}
                          disabled={!isEditing}
                          className={`w-full p-3 rounded-lg border text-left transition-all ${
                            formData.activityLevel === level.id
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-white/20 bg-white/5 hover:border-purple-500/50'
                          } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-white">{level.label}</div>
                              <div className="text-sm text-gray-400">{level.description}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-lg font-semibold text-white mb-4">{t('profile.bmiAnalysis')}</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{bmi}</div>
                  <div className={`text-sm font-medium ${bmiInfo.color} mb-4`}>
                    {bmiInfo.category}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                style={{width: `${Math.min(100, (bmi / 40) * 100)}%`}} className={`h-2 rounded-full ${
                      bmi < 18.5 ? 'bg-blue-400' :
                      bmi < 25 ? 'bg-green-400' :
                      bmi < 30 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-lg font-semibold text-white mb-4">{t('profile.weightHistory')}</h3>
                {weightHistory.length > 0 ? (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {weightHistory.slice().reverse().map(entry => (
                      <div key={entry.id} className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                        <span className="text-sm text-white">{entry.weight} kg</span>
                        <span className="text-xs text-gray-400">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">{t('profile.noHistory')}</p>
                )}
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center mb-6">
              <CreditCard className="w-6 h-6 text-teal-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">Gérer mon abonnement</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Plan actuel :</span>
                <span className="font-semibold text-white capitalize">{t(`plan.${subscriptionDetails.plan}`)}</span>
              </div>
              {subscriptionDetails.plan !== 'free' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Début de l'abonnement :</span>
                    <span className="font-semibold text-white">
                      {subscriptionDetails.startDate ? new Date(subscriptionDetails.startDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Fin de l'abonnement :</span>
                    <span className="font-semibold text-white">
                      {subscriptionDetails.endDate ? new Date(subscriptionDetails.endDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button
                onClick={() => navigate('/subscriptions')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Repeat className="w-4 h-4 mr-2" />
                Changer de plan
              </Button>
              {subscriptionDetails.plan !== 'free' && (
                <Button
                  onClick={cancelSubscription}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Annuler l'abonnement
                </Button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
          >
            <h2 className="text-xl font-semibold text-white mb-6">{t('profile.accountActions')}</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => toast({
                  title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
                })}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                {t('profile.changePassword')}
              </Button>
              <Button
                onClick={signOut}
                variant="destructive"
                className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
              >
                {t('profile.logout')}
              </Button>
              <Button
                onClick={() => toast({
                  title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
                })}
                variant="destructive"
              >
                {t('profile.deleteAccount')}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Profile;