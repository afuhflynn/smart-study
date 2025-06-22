import { ElevenLabsClient, stream } from "@elevenlabs/elevenlabs-js";
import { Readable } from "stream";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

export async function elevenLabsStream() {
  const audioStream = await elevenlabs.textToSpeech.stream(
    "JBFqnCBsd6RMkjVDRZzb",
    {
      text: "This is a test",
      modelId: "eleven_multilingual_v2",
    }
  );

  // option 1: play the streamed audio locally
  const nodeStream = Readable.fromWeb(audioStream as any);
  await stream(nodeStream);

  // option 2: process the audio manually
  const reader = audioStream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    console.log(value);
  }
}

elevenLabsStream();
