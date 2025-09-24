import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Shield, FileText, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Legal = () => {
  const { t } = useLanguage();

  const faqs = [
    {
      question: t('legal.faq1.q'),
      answer: t('legal.faq1.a')
    },
    {
      question: t('legal.faq2.q'),
      answer: t('legal.faq2.a')
    },
    {
      question: t('legal.faq3.q'),
      answer: t('legal.faq3.a')
    },
    {
      question: t('legal.faq4.q'),
      answer: t('legal.faq4.a')
    }
  ];

  return (
    <>
      <Helmet>
        <title>Légal & FAQ - YapS</title>
        <meta name="description" content="Trouvez les réponses aux questions fréquemment posées et consultez nos conditions d'utilisation, notre politique de confidentialité et nos informations sur la conformité RGPD." />
      </Helmet>

      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('legal.title')}
            </h1>
            <p className="text-xl text-gray-300">
              {t('legal.subtitle')}
            </p>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 mb-8"
          >
            <div className="flex items-center mb-6">
              <HelpCircle className="w-6 h-6 text-blue-400 mr-3" />
              <h2 className="text-2xl font-semibold text-white">{t('legal.faq.title')}</h2>
            </div>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-white/10 pb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                  <p className="text-gray-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Legal Documents Section */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Privacy Policy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
            >
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-green-400 mr-3" />
                <h2 className="text-2xl font-semibold text-white">{t('legal.privacy.title')}</h2>
              </div>
              <p className="text-gray-300 mb-4">
                {t('legal.privacy.updated', { date: new Date().toLocaleDateString() })}
              </p>
              <p className="text-gray-300 mb-4">
                {t('legal.privacy.desc')}
              </p>
              <a href="#" className="text-purple-400 hover:text-purple-300">{t('legal.readFull')}</a>
            </motion.div>

            {/* Terms of Service */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
            >
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-semibold text-white">{t('legal.terms.title')}</h2>
              </div>
              <p className="text-gray-300 mb-4">
                {t('legal.terms.desc1')}
              </p>
              <p className="text-gray-300 mb-4">
                {t('legal.terms.desc2')}
              </p>
              <a href="#" className="text-purple-400 hover:text-purple-300">{t('legal.readFull')}</a>
            </motion.div>
          </div>

          {/* GDPR Compliance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
          >
            <h2 className="text-2xl font-semibold text-white mb-4">{t('legal.gdpr.title')}</h2>
            <p className="text-gray-300 mb-4">
              {t('legal.gdpr.desc1')}
            </p>
            <p className="text-gray-300">
              {t('legal.gdpr.desc2')}
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Legal;