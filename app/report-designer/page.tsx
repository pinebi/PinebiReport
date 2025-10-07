'use client';

import { useState } from 'react';
import { PencilRuler, Plus, Save, Eye, BarChart3, PieChart, LineChart, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const widgetTypes = [
  { id: 'bar', name: 'Bar Chart', icon: BarChart3, color: 'bg-blue-500' },
  { id: 'pie', name: 'Pie Chart', icon: PieChart, color: 'bg-purple-500' },
  { id: 'line', name: 'Line Chart', icon: LineChart, color: 'bg-green-500' },
  { id: 'table', name: 'Table', icon: Table, color: 'bg-orange-500' },
];

export default function ReportDesignerPage() {
  const [reportName, setReportName] = useState('Yeni Rapor');
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);

  const toggleWidget = (id: string) => {
    setSelectedWidgets(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <PencilRuler className="h-10 w-10 text-purple-500" />
              Rapor Tasarımcı
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Drag & drop ile özel raporlarınızı oluşturun
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              Önizle
            </Button>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Kaydet
            </Button>
          </div>
        </div>

        {/* Report Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Rapor Ayarları</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label>Rapor Adı</Label>
              <Input
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Rapor adı..."
                className="mt-2"
              />
            </div>
            <div>
              <Label>Kategori</Label>
              <select className="w-full mt-2 p-2 border rounded-lg">
                <option>Satış Raporları</option>
                <option>Finans Raporları</option>
                <option>Müşteri Raporları</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Widget Library */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Widget Kütüphanesi
              </h2>
              <div className="space-y-3">
                {widgetTypes.map((widget) => (
                  <button
                    key={widget.id}
                    onClick={() => toggleWidget(widget.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedWidgets.includes(widget.id)
                        ? `${widget.color} text-white border-transparent shadow-lg scale-105`
                        : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${selectedWidgets.includes(widget.id) ? 'bg-white/20' : 'bg-gray-100'}`}>
                        <widget.icon className={`h-5 w-5 ${selectedWidgets.includes(widget.id) ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <span className="font-semibold">{widget.name}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Quick Templates */}
              <div className="mt-8">
                <h3 className="font-semibold mb-3">Hızlı Şablonlar</h3>
                <div className="space-y-2">
                  <button className="w-full p-3 text-left rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-200 transition-all">
                    <div className="font-medium text-blue-900">Satış Dashboard</div>
                    <div className="text-xs text-blue-600">Bar + Line + Table</div>
                  </button>
                  <button className="w-full p-3 text-left rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 transition-all">
                    <div className="font-medium text-purple-900">Finans Özet</div>
                    <div className="text-xs text-purple-600">Pie + Bar Charts</div>
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Canvas */}
          <div className="lg:col-span-2">
            <Card className="p-6 min-h-[600px]">
              <h2 className="text-xl font-bold mb-4">Rapor Tasarımı</h2>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 min-h-[500px] border-2 border-dashed border-gray-300">
                {selectedWidgets.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                    <PencilRuler className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">Widget eklemek için tıklayın</p>
                    <p className="text-sm mt-2">Sol taraftaki widget kütüphanesinden seçim yapın</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedWidgets.map((widgetId, index) => {
                      const widget = widgetTypes.find(w => w.id === widgetId);
                      if (!widget) return null;
                      
                      return (
                        <div key={index} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border-2 border-gray-200 hover:border-purple-300 transition-all">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-lg ${widget.color}`}>
                                <widget.icon className="h-5 w-5 text-white" />
                              </div>
                              <span className="font-semibold">{widget.name}</span>
                            </div>
                            <button
                              onClick={() => toggleWidget(widgetId)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                          <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
                            <widget.icon className="h-12 w-12 text-gray-300" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Data Source */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Veri Kaynağı</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Rapor API</Label>
              <select className="w-full mt-2 p-2 border rounded-lg">
                <option>Satış Raporu API</option>
                <option>Ciro Raporu API</option>
                <option>Müşteri Raporu API</option>
              </select>
            </div>
            <div>
              <Label>Tarih Aralığı</Label>
              <select className="w-full mt-2 p-2 border rounded-lg">
                <option>Son 7 Gün</option>
                <option>Son 30 Gün</option>
                <option>Bu Ay</option>
                <option>Özel Tarih</option>
              </select>
            </div>
            <div>
              <Label>Güncelleme Sıklığı</Label>
              <select className="w-full mt-2 p-2 border rounded-lg">
                <option>Gerçek Zamanlı</option>
                <option>Her 5 Dakika</option>
                <option>Saatlik</option>
                <option>Günlük</option>
              </select>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

