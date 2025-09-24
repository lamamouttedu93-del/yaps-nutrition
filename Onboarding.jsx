import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { ArrowRight, ArrowLeft, User, Target, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPasswordForEmail } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState(user ? 2 : 1);
  const [formData, setFormData] = useState({
    // Auth data
    email: '',
    password: '',
    name: '',
    isLogin: true,
    // Profile data
    age: '',
    gender: '',
    weight: '',
    height: '',
    goal: '',
    activityLevel: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    let authResult;
    if (formData.isLogin) {
      authResult = await signIn(formData.email, formData.password);
    } else {
      authResult = await signUp(formData.email, formData.password, { data: { full_name: formData.name } });
    }

    if (!authResult.error) {
      if (formData.isLogin) {
        navigate('/dashboard');
      } else {
        setStep(2);
        toast({
          title: "Bienvenue !",
          description: "Configurons votre profil pour obtenir des recommandations personnalisées."
        });
      }
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.age || !formData.gender || !formData.weight || !formData.height || !formData.goal) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    const profile = {
      age: parseInt(formData.age),
      gender: formData.gender,
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      goal: formData.goal,
      activityLevel: formData.activityLevel || 'moderate',
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('nutritrack_profile', JSON.stringify(profile));
    
    toast({
      title: "Profil créé !",
      description: "Votre parcours nutritionnel personnalisé commence maintenant."
    });

    navigate('/dashboard');
  };

  const handleForgotPassword = () => {
    if (!formData.email) {
      toast({
        variant: "destructive",
        title: "Email manquant",
        description: "Veuillez entrer votre adresse e-mail pour réinitialiser votre mot de passe.",
      });
      return;
    }
    resetPasswordForEmail(formData.email);
  };

  const handleForgotId = () => {
    toast({
      title: "Identifiant",
      description: "Votre identifiant est l'adresse e-mail que vous avez utilisée pour vous inscrire.",
    });
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

  const PrivacyPolicyModal = () => (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="text-purple-400 hover:text-purple-300 text-sm underline">
          Politique de confidentialité
        </button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-purple-500/30 text-white max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            YapS Politique de Confidentialité
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-4 text-gray-300 space-y-4">
            <p><strong>Dernière mise à jour : 21/09/2025</strong></p>
            <p>La présente politique décrit comment l’application YapS (« l’Application ») collecte, utilise et protège vos données personnelles conformément au Règlement (UE) 2016/679 (RGPD) et aux lois applicables. Cette page est publique et accessible sans authentification.</p>
            
            <h3 className="font-bold text-lg text-white">1. Responsable du traitement</h3>
            <p><strong>Nom légal/Entreprise :</strong> Yaps Inc.<br/>
            <strong>Adresse :</strong> Arpajon - FRANCE<br/>
            <strong>Contact :</strong> info@yaps.blog</p>

            <h3 className="font-bold text-lg text-white">2. Données que nous traitons</h3>
            <ul className="list-disc list-inside pl-4 space-y-2">
                <li><strong>Compte :</strong> e‑mail, mot de passe haché, pays.</li>
                <li><strong>Profil :</strong> âge, sexe, taille, poids, objectif.</li>
                <li><strong>Suivi nutritionnel :</strong> journal des repas, calories et macronutriments, mesures (poids/IMC).</li>
                <li><strong>Abonnement :</strong> identifiants de paiement gérés par un prestataire (ex. Stripe). Nous ne stockons pas les numéros de carte.</li>
                <li><strong>Données Santé (option Premium) :</strong> poids, pas, calories actives provenant d’Apple HealthKit et/ou Google Fit, uniquement avec votre consentement explicite.</li>
                <li><strong>Support & analytique :</strong> logs techniques, événements d’usage agrégés.</li>
            </ul>

            <h3 className="font-bold text-lg text-white">3. Finalités et bases légales</h3>
            <ul className="list-disc list-inside pl-4 space-y-2">
                <li><strong>Fourniture du service :</strong> création du compte, calculs IMC/MB/ATEJ, recommandations, recettes et planification — exécution du contrat.</li>
                <li><strong>Abonnements :</strong> gestion de la facturation — exécution du contrat.</li>
                <li><strong>Coach IA :</strong> réponses et contenus personnalisés Premium — exécution du contrat.</li>
                <li><strong>Synchronisation Santé :</strong> import de mesures via HealthKit/Google Fit — consentement. Ces données ne sont jamais utilisées pour la publicité.</li>
                <li><strong>Amélioration & sécurité :</strong> statistiques anonymisées, prévention de fraude/abus — intérêt légitime.</li>
            </ul>

            <h3 className="font-bold text-lg text-white">4. Partage avec des tiers</h3>
            <ul className="list-disc list-inside pl-4 space-y-2">
                <li><strong>Authentification & base de données :</strong> ex. Firebase/Supabase (hébergement de données, sauvegarde, sécurité).</li>
                <li><strong>Paiements :</strong> ex. Stripe (abonnements, conformité PCI‑DSS).</li>
                <li><strong>Recettes :</strong> Spoonacular (recherche d’idées de repas). Nous envoyons des requêtes de recherche ; pas de données de paiement.</li>
                <li><strong>Coach IA :</strong> OpenAI (génération de conseils et programmes). Le texte que vous soumettez est traité pour produire la réponse.</li>
                <li><strong>Apple HealthKit / Google Fit :</strong> données importées depuis votre appareil avec votre autorisation. Elles ne sont partagées avec aucun annonceur.</li>
            </ul>
            <p>Chaque prestataire traite les données en notre nom et selon nos instructions. Les transferts hors UE sont encadrés par des clauses contractuelles types et/ou des mécanismes équivalents.</p>

            <h3 className="font-bold text-lg text-white">5. Durées de conservation</h3>
            <ul className="list-disc list-inside pl-4 space-y-2">
                <li><strong>Compte et profil :</strong> tant que votre compte est actif, puis suppression sous 90 jours après clôture.</li>
                <li><strong>Journal/mesures :</strong> jusqu’à 36 mois ou jusqu’à suppression par vous.</li>
                <li><strong>Logs techniques :</strong> 12 mois max.</li>
                <li><strong>Données Santé importées :</strong> supprimables à tout moment depuis l’app ; vous pouvez révoquer l’accès dans iOS/Android.</li>
            </ul>

            <h3 className="font-bold text-lg text-white">6. Vos droits</h3>
            <p>Vous disposez des droits d’accès, rectification, effacement, limitation, opposition, portabilité, et du droit d’introduire une réclamation auprès de la CNIL. Pour exercer vos droits : info@yaps.blog.</p>

            <h3 className="font-bold text-lg text-white">7. Sécurité</h3>
            <p>Données chiffrées en transit (HTTPS), contrôle d’accès par rôles, bonnes pratiques de sécurité applicative et sauvegardes. Nous minimisons les données collectées.</p>

            <h3 className="font-bold text-lg text-white">8. Cookies</h3>
            <p>Cookies techniques nécessaires au fonctionnement (session, préférences). Des cookies d’analyse peuvent être utilisés de manière agrégée. Vous pouvez les gérer via les paramètres du navigateur.</p>

            <h3 className="font-bold text-lg text-white">9. Mineurs</h3>
            <p>L’Application n’est pas destinée aux moins de 16 ans. Si un compte mineur est identifié, il sera supprimé.</p>

            <h3 className="font-bold text-lg text-white">10. Modifications</h3>
            <p>Nous pouvons mettre à jour cette politique. La date de mise à jour apparaît en haut de page. En cas de changements importants, nous vous en informerons dans l’application ou par e‑mail.</p>

            <h3 className="font-bold text-lg text-white">11. Contact</h3>
            <p>Pour toute question : info@yaps.blog.</p>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <Helmet>
        <title>Commencer - YapS</title>
        <meta name="description" content="Créez votre compte et configurez votre profil nutritionnel personnalisé pour commencer à suivre votre alimentation et atteindre vos objectifs de santé." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl w-full">
          {/* Step 1: Authentication */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border border-white/10"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {formData.isLogin ? t('onboarding.welcome') : t('onboarding.createAccount')}
                </h1>
                <p className="text-gray-300">
                  {formData.isLogin ? t('onboarding.signInContinue') : t('onboarding.startJourney')}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-6">
                {!formData.isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('onboarding.fullName')}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={t('onboarding.fullName')}
                      required={!formData.isLogin}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('onboarding.email')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={t('onboarding.email')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('onboarding.password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                      placeholder={t('onboarding.password')}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:bg-transparent"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-3"
                >
                  {formData.isLogin ? t('onboarding.signIn') : t('onboarding.createAccount')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange('isLogin', !formData.isLogin)}
                    className="text-purple-400 hover:text-purple-300 text-sm"
                  >
                    {formData.isLogin 
                      ? t('onboarding.noAccount')
                      : t('onboarding.hasAccount')
                    }
                  </button>
                  <div className="flex justify-center gap-4 text-sm">
                    <button
                      type="button"
                      onClick={handleForgotId}
                      className="text-gray-400 hover:text-gray-200"
                    >
                      Identifiant oublié ?
                    </button>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-gray-400 hover:text-gray-200"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  {!formData.isLogin && (
                    <div className="text-xs text-gray-400 pt-2">
                      En créant un compte, vous acceptez notre <PrivacyPolicyModal />.
                    </div>
                  )}
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 2: Profile Setup */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border border-white/10"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">{t('onboarding.profile.title')}</h1>
                <p className="text-gray-300">{t('onboarding.profile.subtitle')}</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('onboarding.age')} *
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="25"
                      min="13"
                      max="120"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('onboarding.gender')} *
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="">{t('onboarding.selectGender')}</option>
                      <option value="male">{t('onboarding.male')}</option>
                      <option value="female">{t('onboarding.female')}</option>
                      <option value="other">{t('onboarding.other')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('onboarding.weight')} *
                    </label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="70"
                      min="20"
                      max="300"
                      step="0.1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('onboarding.height')} *
                    </label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="175"
                      min="100"
                      max="250"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    {t('onboarding.goal')} *
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {goals.map((goal) => (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => handleInputChange('goal', goal.id)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          formData.goal === goal.id
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-white/20 bg-white/5 hover:border-purple-500/50'
                        }`}
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
                        onClick={() => handleInputChange('activityLevel', level.id)}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          formData.activityLevel === level.id
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-white/20 bg-white/5 hover:border-purple-500/50'
                        }`}
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

                <div className="flex gap-4">
                  {!user && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      <ArrowLeft className="mr-2 w-5 h-5" />
                      {t('onboarding.back')}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {t('onboarding.complete')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Onboarding;