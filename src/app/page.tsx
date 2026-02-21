'use client';

import { useChat, Message } from 'ai/react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Loader2, Sparkles, User, BotMessageSquare } from 'lucide-react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, setInput, isLoading, append } = useChat();

  const {
    text: transcript,
    isListening,
    startListening,
    stopListening,
    hasSupport: hasSpeechSupport
  } = useSpeechRecognition();

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    hasSupport: hasTTSSupport
  } = useTextToSpeech();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sync speech transcript with input
  useEffect(() => {
    if (isListening) {
      setInput(transcript);
    }
  }, [transcript, isListening, setInput]);

  // Auto-submit when user stops talking (if transcript is not empty)
  // We use a separate state to track if we just finished listening to trigger send
  const [wasListening, setWasListening] = useState(false);
  useEffect(() => {
    if (isListening) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWasListening(true);
    } else if (wasListening && transcript.trim()) {
      // Trigger append manually since input might have been modified or cleared
      append({ role: 'user', content: transcript });
      setInput('');
      setWasListening(false);
    }
  }, [isListening, transcript, append, setInput, wasListening]);

  // Speak the AI's latest response when it finishes generating
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && !isLoading && autoSpeak) {
      speak(lastMessage.content);
    }
  }, [messages, isLoading, speak, autoSpeak]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking(); // Stop AI speaking if we want to talk
      startListening();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) stopListening();
    stopSpeaking();
    handleSubmit(e);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="flex items-center justify-between p-4 glass-panel z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary-500 p-2 rounded-xl text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg dark:text-white">Tamil AI Tutor</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Master Tamil naturally</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mounted && hasTTSSupport && (
            <button
              onClick={() => {
                if (autoSpeak) {
                  stopSpeaking();
                  setAutoSpeak(false);
                } else {
                  setAutoSpeak(true);
                  // Read the last message if available
                  const lastMessage = messages.slice().reverse().find((m: Message) => m.role === 'assistant');
                  if (lastMessage) speak(lastMessage.content);
                }
              }}
              className={`p-2 rounded-full transition-colors ${autoSpeak
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                }`}
              title={autoSpeak ? 'Voice enabled' : 'Voice disabled'}
            >
              {autoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-xl mb-4">
              <BotMessageSquare className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold dark:text-white">Vannakkam! (Welcome!)</h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-md">
              I am your friendly AI Tamil tutor. Ready to start? Tap the microphone and say &quot;Hello&quot;!
            </p>
          </div>
        ) : (
          messages.map((m: Message) => (
            <div
              key={m.id}
              className={`flex items-end gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-500 text-white'
                }`}>
                {m.role === 'user' ? <User className="w-5 h-5" /> : <BotMessageSquare className="w-5 h-5" />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white dark:bg-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-100 dark:border-slate-700'
                  }`}
              >
                <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                  {m.content.replace(/\[\/?ta\]/g, '')}
                </div>
              </div>
            </div>
          ))
        )}

        {/* AI Typing / Speaking Indicator */}
        {(isLoading || isSpeaking) && (
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm ml-10">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSpeaking && !isLoading && <Volume2 className="w-4 h-4 pulse-animation text-blue-500" />}
            <span>{isLoading ? 'Thinking...' : 'Speaking...'}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleManualSubmit} className="max-w-4xl mx-auto flex items-end gap-2 relative">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message or tap the mic to speak..."
              className={`w-full max-h-32 min-h-[56px] resize-none bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-4 py-4 pr-12 focus:ring-2 focus:ring-blue-500 dark:text-white transition-all ${isListening ? 'ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/30' : ''
                }`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim()) handleManualSubmit(e);
                }
              }}
            />
            {isListening && (
              <div className="absolute right-4 top-4 flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>

          {mounted && hasSpeechSupport && (
            <button
              type="button"
              onClick={toggleListening}
              className={`relative flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300 ${isListening
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800'
                }`}
            >
              {isListening && <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />}
              {isListening ? <MicOff className="w-6 h-6 z-10" /> : <Mic className="w-6 h-6 z-10" />}
            </button>
          )}

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
        <div className="text-center mt-2 text-xs text-slate-400 dark:text-slate-500">
          Powered by Gemini AI • Talk to learn Tamil naturally
        </div>
      </footer>
    </div>
  );
}
