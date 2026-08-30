import { fal } from "@fal-ai/client";

export interface KokoroTtsOptions {
  prompt: string;
  voice?: string;
  speed?: number;
  language?: 'american-english' | 'british-english' | 'japanese' | 'mandarin' | 'spanish' | 'french' | 'hindi' | 'italian' | 'br-portuguese';
  apiKey?: string;
}

export interface KokoroTtsResult {
  audioUrl?: string;
  success: boolean;
  source: 'fal-kokoro' | 'speech-synthesis' | 'fallback';
  error?: string;
}

/**
 * Generate speech using Kokoro TTS via @fal-ai/client
 */
export async function generateKokoroSpeech(options: KokoroTtsOptions): Promise<KokoroTtsResult> {
  const {
    prompt,
    voice = "af_heart",
    speed = 1.0,
    language = "american-english",
    apiKey
  } = options;

  const falApiKey = apiKey || (typeof process !== "undefined" && process.env?.FAL_KEY) || localStorage.getItem("forgeai_fal_key") || "";

  if (!prompt || prompt.trim().length === 0) {
    return {
      success: false,
      source: 'fallback',
      error: 'Prompt cannot be empty.'
    };
  }

  // 1. Try Fal AI Kokoro TTS if API key is provided
  if (falApiKey) {
    try {
      fal.config({
        credentials: falApiKey
      });

      const endpoint = `fal-ai/kokoro/${language}`;

      const response: any = await fal.subscribe(endpoint, {
        input: {
          prompt: prompt,
          voice: voice,
          speed: speed
        },
        logs: false
      });

      if (response && response.data && response.data.audio && response.data.audio.url) {
        return {
          audioUrl: response.data.audio.url,
          success: true,
          source: 'fal-kokoro'
        };
      }
    } catch (err: any) {
      console.warn("[Kokoro TTS @fal-ai/client] fal-ai API call encountered error, engaging Web Speech fallback:", err);
    }
  }

  // 2. Web Speech API Fallback for instant playback
  if (typeof window !== "undefined" && 'speechSynthesis' in window) {
    return new Promise((resolve) => {
      try {
        window.speechSynthesis.cancel(); // Stop current speech
        const utterance = new SpeechSynthesisUtterance(prompt);
        utterance.rate = speed;
        
        utterance.onend = () => {
          resolve({
            success: true,
            source: 'speech-synthesis'
          });
        };

        utterance.onerror = (e) => {
          resolve({
            success: false,
            source: 'speech-synthesis',
            error: e.error || 'SpeechSynthesis error'
          });
        };

        window.speechSynthesis.speak(utterance);
      } catch (err: any) {
        resolve({
          success: false,
          source: 'fallback',
          error: err?.message || 'Speech synthesis failed'
        });
      }
    });
  }

  return {
    success: false,
    source: 'fallback',
    error: 'No voice synthesis engine available.'
  };
}
