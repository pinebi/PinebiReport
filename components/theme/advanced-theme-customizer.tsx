'use client';

import { useState, useEffect } from 'react';
import { Palette, Moon, Sun, Contrast, Type, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface ThemeSettings {
  mode: 'light' | 'dark' | 'sepia' | 'high-contrast';
  primaryColor: string;
  fontSize: number;
  animationSpeed: number;
  reducedMotion: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

const defaultSettings: ThemeSettings = {
  mode: 'light',
  primaryColor: '#3B82F6',
  fontSize: 16,
  animationSpeed: 1,
  reducedMotion: false,
  colorBlindMode: 'none'
};

const colorPresets = [
  { name: 'Mavi', color: '#3B82F6' },
  { name: 'Yeşil', color: '#10B981' },
  { name: 'Mor', color: '#8B5CF6' },
  { name: 'Kırmızı', color: '#EF4444' },
  { name: 'Turuncu', color: '#F59E0B' },
  { name: 'Pembe', color: '#EC4899' },
];

export function AdvancedThemeCustomizer() {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('theme-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Apply theme settings
    applyTheme(settings);
    // Save to localStorage
    localStorage.setItem('theme-settings', JSON.stringify(settings));
  }, [settings]);

  const applyTheme = (theme: ThemeSettings) => {
    const root = document.documentElement;

    // Mode
    root.classList.remove('light', 'dark', 'sepia', 'high-contrast');
    root.classList.add(theme.mode);

    // Primary Color
    root.style.setProperty('--primary', theme.primaryColor);

    // Font Size
    root.style.setProperty('--base-font-size', `${theme.fontSize}px`);

    // Animation Speed
    root.style.setProperty('--animation-speed', `${theme.animationSpeed}s`);

    // Reduced Motion
    if (theme.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
    }

    // Color Blind Mode
    root.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (theme.colorBlindMode !== 'none') {
      root.classList.add(theme.colorBlindMode);
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Tema Kişiselleştirme
          </DialogTitle>
          <DialogDescription>
            Uygulamanın görünümünü ve davranışını özelleştirin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mode Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Tema Modu</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'light', label: 'Açık', icon: Sun },
                { value: 'dark', label: 'Koyu', icon: Moon },
                { value: 'sepia', label: 'Sepia', icon: Palette },
                { value: 'high-contrast', label: 'Yüksek Kontrast', icon: Contrast }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setSettings(prev => ({ ...prev, mode: value as any }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.mode === value
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">{label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Color */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Ana Renk</Label>
            <div className="grid grid-cols-6 gap-3">
              {colorPresets.map((preset) => (
                <button
                  key={preset.color}
                  onClick={() => setSettings(prev => ({ ...prev, primaryColor: preset.color }))}
                  className={`relative w-full aspect-square rounded-lg transition-all ${
                    settings.primaryColor === preset.color
                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                >
                  {settings.primaryColor === preset.color && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Type className="h-4 w-4" />
                Yazı Boyutu
              </Label>
              <span className="text-sm text-muted-foreground">{settings.fontSize}px</span>
            </div>
            <Slider
              value={[settings.fontSize]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, fontSize: value }))}
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
          </div>

          {/* Animation Speed */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Animasyon Hızı
              </Label>
              <span className="text-sm text-muted-foreground">{settings.animationSpeed}x</span>
            </div>
            <Slider
              value={[settings.animationSpeed]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, animationSpeed: value }))}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label className="text-base font-semibold">Azaltılmış Hareket</Label>
              <p className="text-sm text-muted-foreground">Animasyonları azalt</p>
            </div>
            <Switch
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, reducedMotion: checked }))}
            />
          </div>

          {/* Color Blind Mode */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Renk Körü Modu</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'none', label: 'Normal' },
                { value: 'protanopia', label: 'Protanopia (Kırmızı-Yeşil)' },
                { value: 'deuteranopia', label: 'Deuteranopia (Kırmızı-Yeşil)' },
                { value: 'tritanopia', label: 'Tritanopia (Mavi-Sarı)' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSettings(prev => ({ ...prev, colorBlindMode: value as any }))}
                  className={`p-3 rounded-lg border-2 text-sm transition-all ${
                    settings.colorBlindMode === value
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <Button
            onClick={resetToDefaults}
            variant="outline"
            className="w-full"
          >
            Varsayılanlara Dön
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

