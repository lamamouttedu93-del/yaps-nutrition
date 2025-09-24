import React from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="bg-black/20 backdrop-blur-lg border-t border-white/10 py-8 px-4 mt-16"
    >
      <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
        <p className="mb-2">© 2025 YapS inc. Tous droits réservés.</p>
        <p className="flex items-center justify-center">
          <Mail className="w-4 h-4 mr-2" />
          <a href="mailto:info@yaps.blog" className="hover:text-white transition-colors">info@yaps.blog</a>
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;
