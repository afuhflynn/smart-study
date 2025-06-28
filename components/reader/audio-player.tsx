"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Settings,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { defaultVoices } from "@/constants/constants";

interface Document {
  id: string;
  title: string;
  content: string;
  chapters: { id: string; title: string; startIndex: number }[];
}

interface AudioPlayerProps {
  document: Document;
  isPlaying: boolean;
  onPlayPause: () => void;
  content: string;
}

interface AudioData {
  audioUrl: string;
  duration: number;
  wordTimestamps: Array<{
    word: string;
    start: number;
    end: number;
  }>;
  voice: string;
  voiceId: string;
  speed: number;
  chapterId?: string;
}

interface Voice {
  id: string;
  name: string;
  category: string;
  description: string;
  preview_url?: string;
}

export function AudioPlayer({
  document,
  isPlaying,
  onPlayPause,
  content,
}: AudioPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const selectedVoice = "aria";
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [autoAdvance, setAutoAdvance] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Fetch available voices on component mount
  useEffect(() => {
    fetchVoices();
  }, []);

  // Generate audio when content changes
  const generateAudio = useCallback(async () => {
    if (!document || content.length === 0) return;
    setIsGenerating(true);
    setError(null);
    setWarning(null);

    try {
      const cleanContent = content
        .replace(/#{1,6}\s/g, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/\n\s*\n/g, ". ")
        .replace(/\n/g, " ")
        .trim();

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanContent.substring(0, 10000),
          voice: selectedVoice,
          speed: playbackSpeed,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Server returned HTML instead of JSON. Please check the API configuration."
        );
      }

      const data = await response.json();

      if (data.success) {
        setAudioData(data.audio);
        setDuration(data.audio.duration);
        setCurrentTime(0);
      } else {
        throw new Error(data.error || "Failed to generate audio");
      }
    } catch (error) {
      console.error("Error generating audio:", error);
      setError(
        error instanceof Error ? error.message : "Failed to generate audio"
      );
    } finally {
      setIsGenerating(false);
    }
  }, [content, document, playbackSpeed]);

  useEffect(() => {
    generateAudio();
  }, [generateAudio]);

  // Control playback rate and volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  // Play or pause audio according to isPlaying
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Fetch voices
  const fetchVoices = async () => {
    try {
      const response = await fetch("/api/tts");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json"))
        throw new Error("Response is not JSON");
      const data = await response.json();
      if (data.success) setAvailableVoices(data.voices || []);
      else throw new Error(data.error || "Failed to fetch voices");
    } catch (error) {
      console.error("Failed to fetch voices:", error);
      setAvailableVoices(defaultVoices);
    }
  };

  // Formatting and handlers
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${Math.floor(s % 60)
      .toString()
      .padStart(2, "0")}`;
  const handleSeek = (val: number[]) => {
    const t = val[0];
    setCurrentTime(t);
    if (audioRef.current) audioRef.current.currentTime = t;
  };
  const handleVolumeChange = (val: number[]) => {
    setVolume(val[0]);
    setIsMuted(val[0] === 0);
  };
  const toggleMute = () => setIsMuted(!isMuted);
  const skip = (sec: number) => {
    if (!audioRef.current) return;
    const newT = Math.max(
      0,
      Math.min(duration, audioRef.current.currentTime + sec)
    );
    audioRef.current.currentTime = newT;
    setCurrentTime(newT);
  };

  const handleAudioEnd = () => {
    setCurrentTime(0);
    onPlayPause();
  };

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-t shadow-lg"
    >
      {audioData && (
        <audio
          ref={audioRef}
          src={audioData.audioUrl}
          onTimeUpdate={() => setCurrentTime(audioRef.current!.currentTime)}
          onEnded={handleAudioEnd}
          onLoadedMetadata={() => setDuration(audioRef.current!.duration)}
          onError={() => {
            console.error("Audio playback error");
            setError("Audio playback failed");
            onPlayPause();
          }}
          preload="metadata"
        />
      )}

      <div className="px-6 py-4">
        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center"
          >
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Seek slider */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            onValueChange={handleSeek}
            max={duration || 100}
            step={1}
            className="w-full"
            disabled={!audioData || isGenerating}
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              Audio Narration
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skip(-10)}
              disabled={!audioData || isGenerating}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                onPlayPause();
              }}
              disabled={isGenerating || !audioData}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full w-12 h-12 p-0 shadow-lg"
            >
              {isGenerating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skip(10)}
              disabled={!audioData || isGenerating}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume and settings */}
          <div className="flex items-center space-x-2 flex-1 justify-end">
            <div className="hidden sm:flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-20"
              />
            </div>

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full right-0 mb-2 bg-background rounded-lg shadow-xl p-4 min-w-[280px] z-50"
                  >
                    <div className="space-y-4">
                      <div>
                        <Label
                          htmlFor="voice"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2"
                        >
                          Voice
                        </Label>
                        <p
                          id="voice"
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                        >
                          {availableVoices[0]?.name || "Default"}
                        </p>
                      </div>
                      <div>
                        <Label
                          htmlFor="speed"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2"
                        >
                          Playback Speed
                        </Label>
                        <div className="grid grid-cols-3 gap-1">
                          {speedOptions.map((speed) => (
                            <Button
                              key={speed}
                              variant={
                                playbackSpeed === speed ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setPlaybackSpeed(speed)}
                              className="text-xs"
                            >
                              {speed}x
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="sm:hidden">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                          Volume
                        </Label>
                        <div className="flex items-center space-x-2">
                          <VolumeX className="h-4 w-4" />
                          <Slider
                            value={[isMuted ? 0 : volume]}
                            onValueChange={handleVolumeChange}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <Volume2 className="h-4 w-4" />
                        </div>
                      </div>
                      <Button
                        onClick={generateAudio}
                        disabled={isGenerating}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Regenerate Audio
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Generating indicator */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-center"
          >
            <span className="text-xs text-blue-600 dark:text-blue-400">
              Generating audio with AI...
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
