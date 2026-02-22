🎙️ AI Conversational Language Voice Tutor

An AI-powered voice agent that helps users learn and practice a new language through real spoken conversation.
Instead of reading lessons or typing messages, users interact with the system entirely by speaking. The agent listens, understands imperfect speech, responds naturally, and provides corrections and learning guidance.

The goal of this project is to simulate a patient human conversation partner so that learners can improve fluency, confidence, and pronunciation through continuous interaction.


------------------------------------------------------------------------------------------

✨ Features :

🧠 Teaching Mode

Introduces vocabulary and sentence structures
Demonstrates pronunciation
Gives speaking exercises
Evaluates user speech
Provides corrections with explanations

🗣️ Practice Mode

Role-play real-world situations (travel, hotel, shopping, directions)
User speaks answers using voice
Detects grammar and pronunciation mistakes
Suggests corrected sentences

💬 Conversation Mode

Natural free conversation
Understands mixed or broken language
Maintains context
Behaves like a friendly speaking partner
Gently corrects mistakes without interrupting flow


🏗️ How It Works

The system follows a speech-AI-speech pipeline:
User speaks into microphone
Speech Recognition converts voice → text
AI model processes conversation and learning logic
System generates a respons
Text-to-Speech converts response → natural voice
AI speaks back to the user
The user never needs to type or read during normal use.

🧰 Tech Stack

Frontend
Next.js (React Framework)
TypeScript
Web Speech / Microphone APIs
AI & Audio
Whisper Speech Recognition (Speech → Text)
Conversational AI API (Language reasoning & correction)
Text-to-Speech Engine (Voice responses)
Backend
Node.js API routes
Environment-based API configuration


🚀 Getting Started

1. Install dependencies
        --->  npm install
2. Add environment variables

       ---> Create a .env.local file in the root folder:

OPENAI_API_KEY=your_api_key_here

3. Run the development server
npm run dev
