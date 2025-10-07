'use client';

import { useState } from 'react';
import { Calendar, ArrowLeftRight, BarChart3, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ComparisonPage() {
  const [period1, setPeriod1] = useState({ start: '2024-01-01', end: '2024-12-31' });
  const [period2, setPeriod2] = useState({ start: '2025-01-01', end: '2025-12-31' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <ArrowLeftRight className="h-10 w-10 text-blue-500" />
              Karşılaştırma Modu
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              İki dönem arasında detaylı karşılaştırma yapın
            </p>
          </div>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Excel İndir
          </Button>
        </div>

        {/* Period Selection */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Period 1 */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">1. Dönem</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Başlangıç</label>
                <input
                  type="date"
                  value={period1.start}
                  onChange={(e) => setPeriod1({ ...period1, start: e.target.value })}
                  className="w-full p-3 rounded-lg border-2 border-blue-200 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bitiş</label>
                <input
                  type="date"
                  value={period1.end}
                  onChange={(e) => setPeriod1({ ...period1, end: e.target.value })}
                  className="w-full p-3 rounded-lg border-2 border-blue-200 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </Card>

          {/* Period 2 */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">2. Dönem</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Başlangıç</label>
                <input
                  type="date"
                  value={period2.start}
                  onChange={(e) => setPeriod2({ ...period2, start: e.target.value })}
                  className="w-full p-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bitiş</label>
                <input
                  type="date"
                  value={period2.end}
                  onChange={(e) => setPeriod2({ ...period2, end: e.target.value })}
                  className="w-full p-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Comparison Results */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Toplam Ciro</h4>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">1. Dönem</span>
                <span className="font-bold text-blue-600">4.2M₺</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">2. Dönem</span>
                <span className="font-bold text-purple-600">4.8M₺</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Fark</span>
                  <span className="font-bold text-green-600">+600K₺ (%14.3)</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Müşteri Sayısı</h4>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">1. Dönem</span>
                <span className="font-bold text-blue-600">3,456</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">2. Dönem</span>
                <span className="font-bold text-purple-600">4,123</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Fark</span>
                  <span className="font-bold text-green-600">+667 (%19.3)</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Ort. Sepet</h4>
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">1. Dönem</span>
                <span className="font-bold text-blue-600">1,215₺</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">2. Dönem</span>
                <span className="font-bold text-purple-600">1,164₺</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Fark</span>
                  <span className="font-bold text-red-600">-51₺ (-4.2%)</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Period 1 Details */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10">
            <h3 className="text-xl font-bold text-blue-600 mb-6">1. Dönem Detayları</h3>
            <div className="space-y-4">
              {[
                { label: 'Toplam İşlem', value: '12,345' },
                { label: 'Nakit', value: '1.8M₺' },
                { label: 'Kredi Kartı', value: '2.4M₺' },
                { label: 'En İyi Gün', value: 'Cuma (245K₺)' },
                { label: 'En Çok Satan', value: 'Ürün A' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Period 2 Details */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
            <h3 className="text-xl font-bold text-purple-600 mb-6">2. Dönem Detayları</h3>
            <div className="space-y-4">
              {[
                { label: 'Toplam İşlem', value: '14,892' },
                { label: 'Nakit', value: '2.1M₺' },
                { label: 'Kredi Kartı', value: '2.7M₺' },
                { label: 'En İyi Gün', value: 'Cumartesi (289K₺)' },
                { label: 'En Çok Satan', value: 'Ürün B' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

