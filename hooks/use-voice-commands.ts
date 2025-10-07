'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface VoiceCommandsHook {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  supported: boolean;
}

export function useVoiceCommands(): VoiceCommandsHook {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check Speech Recognition support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'tr-TR';

        recognitionInstance.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);
          processCommand(transcriptText);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
        setSupported(true);
      }

      // Check Speech Synthesis support
      if (window.speechSynthesis) {
        setSynthesis(window.speechSynthesis);
      }
    }
  }, []);

  const processCommand = useCallback((command: string) => {
    const lowerCommand = command.toLowerCase();

    // Dashboard komutları
    if (lowerCommand.includes('dashboard') || lowerCommand.includes('ana sayfa')) {
      router.push('/');
      speak('Dashboard açılıyor');
    }
    // Rapor komutları
    else if (lowerCommand.includes('rapor') || lowerCommand.includes('raporlar')) {
      if (lowerCommand.includes('çalıştır') || lowerCommand.includes('aç')) {
        router.push('/reports/run');
        speak('Rapor çalıştırma sayfası açılıyor');
      } else if (lowerCommand.includes('yönet')) {
        router.push('/reports');
        speak('Rapor yönetimi açılıyor');
      } else {
        router.push('/reports');
        speak('Raporlar sayfası açılıyor');
      }
    }
    // Bugünkü satışlar
    else if (lowerCommand.includes('bugün') && (lowerCommand.includes('satış') || lowerCommand.includes('ciro'))) {
      router.push('/?view=today');
      speak('Bugünkü satışlar gösteriliyor');
    }
    // Geçen ay
    else if (lowerCommand.includes('geçen ay') || lowerCommand.includes('önceki ay')) {
      router.push('/?view=lastmonth');
      speak('Geçen ayın verileri gösteriliyor');
    }
    // Excel export
    else if (lowerCommand.includes('excel') || lowerCommand.includes('dışa aktar')) {
      speak('Excel dışa aktarma başlatılıyor');
      // Excel export tetikle
    }
    // Karşılaştırma
    else if (lowerCommand.includes('karşılaştır') || lowerCommand.includes('karşılaştırma')) {
      router.push('/comparison');
      speak('Karşılaştırma sayfası açılıyor');
    }
    // Yardım
    else if (lowerCommand.includes('yardım') || lowerCommand.includes('komut')) {
      speak('Kullanılabilir komutlar: Dashboard aç, Raporları göster, Bugünkü satışları göster, Excel dışa aktar, Karşılaştırma yap');
    }
    else {
      speak('Komut anlaşılamadı. Yardım için yardım deyin');
    }
  }, [router]);

  const startListening = useCallback(() => {
    if (recognition) {
      setTranscript('');
      recognition.start();
      setIsListening(true);
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  const speak = useCallback((text: string) => {
    if (synthesis) {
      // Cancel any ongoing speech
      synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      synthesis.speak(utterance);
    }
  }, [synthesis]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    speak,
    supported
  };
}

