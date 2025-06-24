import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      text,
      voice = "rachel",
      speed = 1.0,
      chapterId,
    } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Check if ElevenLabs API key is configured
    if (!process.env.ELEVENLABS_API_KEY) {
      console.warn("ElevenLabs API key not configured, using mock audio");

      const mockAudioData = {
        audioUrl: generateMockAudioUrl(text),
        duration: Math.ceil(text.split(" ").length / 2.5),
        wordTimestamps: generateMockTimestamps(text),
        voice: voice,
        voiceId: "mock-voice-id",
        speed,
        chapterId,
      };

      return NextResponse.json({
        success: true,
        audio: mockAudioData,
        warning: "Using mock audio - ElevenLabs API key not configured",
      });
    }

    try {
      // Use direct fetch API to call ElevenLabs REST API
      const voiceMapping: Record<string, string> = {
        rachel: "EXAVITQu4vr4xnSDxMaL",
        adam: "pNInz6obpgDQGcFmaJgB",
        bella: "EHCm3I64Uw9SIjyQQjU5",
        charlie: "9BWtsMINqrJLrRacOk9x",
      };

      const voiceId =
        voiceMapping[voice.toLowerCase()] || voiceMapping["rachel"];

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            Accept: "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": process.env.ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
              style: 0.0,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `ElevenLabs API error: ${response.status} - ${errorText}`
        );
      }

      // Get the audio data as array buffer
      const audioBuffer = await response.arrayBuffer();

      // Convert to base64 for client
      const audioBase64 = Buffer.from(audioBuffer).toString("base64");
      const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

      // Generate word timestamps (approximation)
      const wordTimestamps = generateMockTimestamps(text);
      const totalDuration =
        wordTimestamps.length > 0
          ? wordTimestamps[wordTimestamps.length - 1].end
          : Math.ceil(text.split(" ").length / 2.5);

      return NextResponse.json({
        success: true,
        audio: {
          audioUrl,
          duration: Math.ceil(totalDuration),
          wordTimestamps,
          voice: getVoiceName(voiceId),
          voiceId: voiceId,
          speed,
          chapterId,
        },
      });
    } catch (elevenLabsError) {
      console.error("ElevenLabs API error:", elevenLabsError);

      // Return mock audio if ElevenLabs fails
      const mockAudioData = {
        audioUrl: generateMockAudioUrl(text),
        duration: Math.ceil(text.split(" ").length / 2.5),
        wordTimestamps: generateMockTimestamps(text),
        voice: voice,
        voiceId: "mock-voice-id",
        speed,
        chapterId,
      };

      return NextResponse.json({
        success: true,
        audio: mockAudioData,
        warning: `Using mock audio due to API error: ${
          elevenLabsError instanceof Error
            ? elevenLabsError.message
            : "Unknown error"
        }`,
      });
    }
  } catch (error) {
    console.error("TTS generation failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate audio",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch available voices
export async function GET() {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json({
        success: true,
        voices: getMockVoices(),
        warning: "Using mock voices - ElevenLabs API key not configured",
      });
    }

    try {
      const response = await fetch("https://api.elevenlabs.io/v1/voices", {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const data = await response.json();

      const formattedVoices = data.voices.map(
        (voice: {
          voice_id: string;
          name: string;
          category: string;
          description: string;
          preview_url: string;
          labels: string;
        }) => ({
          id: voice.voice_id,
          name: voice.name,
          category: voice.category,
          description: voice.description || `${voice.name} voice`,
          preview_url: voice.preview_url,
          labels: voice.labels || {},
        })
      );

      return NextResponse.json({
        success: true,
        voices: formattedVoices,
      });
    } catch (elevenLabsError) {
      console.error("Failed to fetch voices from ElevenLabs:", elevenLabsError);

      return NextResponse.json({
        success: true,
        voices: getMockVoices(),
        warning: "Using mock voices due to API error",
      });
    }
  } catch (error) {
    console.error("Failed to fetch voices:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch available voices",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function getMockVoices() {
  return [
    {
      id: "rachel",
      name: "Rachel",
      category: "premade",
      description: "Calm and clear American female voice",
      preview_url: null,
      labels: { accent: "american", gender: "female", age: "young_adult" },
    },
    {
      id: "adam",
      name: "Adam",
      category: "premade",
      description: "Deep and authoritative American male voice",
      preview_url: null,
      labels: { accent: "american", gender: "male", age: "middle_aged" },
    },
    {
      id: "bella",
      name: "Bella",
      category: "premade",
      description: "Warm and friendly British female voice",
      preview_url: null,
      labels: { accent: "british", gender: "female", age: "young_adult" },
    },
    {
      id: "charlie",
      name: "Charlie",
      category: "premade",
      description: "Professional British male voice",
      preview_url: null,
      labels: { accent: "british", gender: "male", age: "middle_aged" },
    },
  ];
}

function getVoiceName(voiceId: string): string {
  const voiceNames: Record<string, string> = {
    EXAVITQu4vr4xnSDxMaL: "Rachel",
    pNInz6obpgDQGcFmaJgB: "Adam",
    EHCm3I64Uw9SIjyQQjU5: "Bella",
    "9BWtsMINqrJLrRacOk9x": "Charlie",
  };
  return voiceNames[voiceId] || "Unknown";
}

function generateMockTimestamps(text: string) {
  const words = text.split(/\s+/);
  let currentTime = 0;

  return words.map((word) => {
    const duration = word.length * 0.08 + 0.15;
    const timestamp = {
      word,
      start: currentTime,
      end: currentTime + duration,
    };
    currentTime = timestamp.end + 0.05;
    return timestamp;
  });
}

function generateMockAudioUrl(text: string): string {
  // Create a simple silence audio file as base64
  const duration = Math.ceil(text.split(" ").length / 2.5);
  const sampleRate = 22050;
  const samples = sampleRate * duration;

  const bufferSize = 44 + samples * 2;
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, bufferSize - 8, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples * 2, true);

  // Fill with silence
  for (let i = 0; i < samples; i++) {
    view.setInt16(44 + i * 2, 0, true);
  }

  // Convert to base64
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return `data:audio/wav;base64,${btoa(binary)}`;
}
