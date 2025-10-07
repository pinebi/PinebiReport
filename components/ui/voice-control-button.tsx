'use client';

import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useVoiceCommands } from '@/hooks/use-voice-commands';
import { Button } from './button';
import { useEffect } from 'react';

export function VoiceControlButton() {
  const { isListening, transcript, startListening, stopListening, speak, supported } = useVoiceCommands();

  useEffect(() => {
    if (transcript) {
      console.log('Voice command:', transcript);
    }
  }, [transcript]);

  if (!supported) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {/* Voice Command Button */}
      <Button
        onClick={isListening ? stopListening : startListening}
        size="lg"
        className={`rounded-full w-16 h-16 shadow-lg transition-all ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
        title={isListening ? 'Dinlemeyi Durdur' : 'Sesli Komut'}
      >
        {isListening ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>

      {/* Read Current Page Button */}
      <Button
        onClick={() => {
          const pageTitle = document.title;
          const mainContent = document.querySelector('main')?.textContent?.slice(0, 500) || '';
          speak(`${pageTitle}. ${mainContent}`);
        }}
        size="lg"
        variant="secondary"
        className="rounded-full w-16 h-16 shadow-lg"
        title="Sayfayı Oku"
      >
        <Volume2 className="h-6 w-6" />
      </Button>

      {/* Transcript Display */}
      {transcript && (
        <div className="absolute bottom-full mb-4 right-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl max-w-sm">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Komut:</strong> {transcript}
          </p>
        </div>
      )}
    </div>
  );
}

