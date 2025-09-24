import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 text-center max-w-md w-full border border-white/20"
      >
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">Paiement Annulé</h1>
        <p className="text-gray-300 mb-8">
          Le processus de paiement a été annulé. Votre abonnement n'a pas été modifié.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => navigate('/subscriptions')}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Voir les abonnements
          </Button>
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            Retour au tableau de bord
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;
