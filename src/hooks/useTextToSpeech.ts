'use client';

import { useState, useCallback, useEffect } from 'react';

export function useTextToSpeech() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        // Load voices when they are available
        const updateVoices = () => {
            setVoices(window.speechSynthesis.getVoices());
        };

        if (typeof window !== 'undefined') {
            window.speechSynthesis.onvoiceschanged = updateVoices;
            updateVoices();
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, []);

    const speak = useCallback((text: string) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Sanitize text: remove asterisks, commas, newlines, hashes, and emojis
        const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

        // Remove [ta] tags as well if any leaked through from earlier interactions
        const sanitizedText = text.replace(/[*#,\n]/g, ' ').replace(emojiRegex, '').replace(/\[\/?ta\]/g, '');

        const utterance = new SpeechSynthesisUtterance(sanitizedText);

        // Prefer an Indian English voice for a balanced pronunciation of English and transliterated Tamil
        const preferredVoice = voices.find(
            (v) => v.lang.includes('en-IN') || v.lang.includes('ta-IN')
        ) || voices.find(v => v.lang.includes('en'));

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.rate = 0.9; // Slightly slower for language learning
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e: Event) => {
            console.error('Speech synthesis error:', e);
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    }, [voices]);

    const stop = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, []);

    return {
        speak,
        stop,
        isSpeaking,
        hasSupport: typeof window !== 'undefined' && 'speechSynthesis' in window
    };
}
