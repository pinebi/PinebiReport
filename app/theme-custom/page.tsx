'use client';

import { AdvancedThemeCustomizer } from '@/components/theme/advanced-theme-customizer';
import { Palette } from 'lucide-react';

export default function ThemeCustomPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Palette className="h-10 w-10 text-purple-500" />
            Tema Kişiselleştirme
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Dashboard'unuzu kendinize özel hale getirin
          </p>
        </div>

        <AdvancedThemeCustomizer />
      </div>
    </div>
  );
}

