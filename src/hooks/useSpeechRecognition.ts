'use client';

import { useState, useEffect, useCallback } from 'react';

// Type declarations for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
    error: 'no-speech' | 'audio-capture' | 'not-allowed' | 'network' | 'aborted' | 'language-not-supported' | 'service-not-allowed' | 'bad-grammar';
    message: string;
}

interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
    onend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
}

declare global {
    interface Window {
        SpeechRecognition: { new(): SpeechRecognition };
        webkitSpeechRecognition: { new(): SpeechRecognition };
    }
}

export function useSpeechRecognition() {
    const [text, setText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognitionInstance = new SpeechRecognition();
                recognitionInstance.continuous = true;
                recognitionInstance.interimResults = true;

                // We set the language to English (US) as the default to capture the student's 
                // English as well as transliterated Tamil accents reasonably well. 
                recognitionInstance.lang = 'en-US';

                recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
                    let currentTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        currentTranscript += event.results[i][0].transcript;
                    }
                    setText(currentTranscript);
                };

                recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
                    console.error('Speech recognition error:', event.error);
                    setIsListening(false);
                };

                recognitionInstance.onend = () => {
                    setIsListening(false);
                };

                // eslint-disable-next-line react-hooks/set-state-in-effect
                setRecognition(recognitionInstance);
            } else {
                console.warn('Speech recognition not supported in this browser.');
            }
        }
    }, []);

    const startListening = useCallback(() => {
        setText('');
        setIsListening(true);
        recognition?.start();
    }, [recognition]);

    const stopListening = useCallback(() => {
        setIsListening(false);
        recognition?.stop();
    }, [recognition]);

    return {
        text,
        setText,
        isListening,
        startListening,
        stopListening,
        hasSupport: !!recognition
    };
}
