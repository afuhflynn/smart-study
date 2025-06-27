"use client";

import { useState, useRef, useEffect, useCallback, MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
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
  currentChapter: number;
  onChapterChange: (chapter: number) => void;
  onWordHighlight?: (wordIndex: number) => void;
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
  currentChapter,
  onChapterChange,
  onWordHighlight,
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
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [autoAdvance, setAutoAdvance] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Fetch available voices on component mount
  useEffect(() => {
    fetchVoices();
  }, []);

  const getCurrentChapterContent = useCallback(() => {
    const chapter = document?.chapters[currentChapter];
    const nextChapter = document?.chapters[currentChapter + 1];

    const startIndex = chapter.startIndex;
    const endIndex = nextChapter
      ? nextChapter.startIndex
      : document?.content?.length;

    return document?.content?.slice(startIndex, endIndex);
  }, [currentChapter, document?.chapters, document?.content]);

  const generateAudioForChapter = useCallback(() => {
    return async () => {
      if (!document || currentChapter < 0) return;

      setIsGenerating(true);
      setError(null);
      setWarning(null);

      try {
        const chapterContent = getCurrentChapterContent();

        // Clean the content for better TTS
        const cleanContent = chapterContent
          .replace(/#{1,6}\s/g, "") // Remove markdown headers
          .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markdown
          .replace(/\*(.*?)\*/g, "$1") // Remove italic markdown
          .replace(/\n\s*\n/g, ". ") // Replace double newlines with periods
          .replace(/\n/g, " ") // Replace single newlines with spaces
          .trim();

        const response = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: cleanContent,
            voice: selectedVoice,
            speed: playbackSpeed,
            chapterId: document?.chapters[currentChapter].id,
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
          setCurrentWordIndex(-1);

          if (data.warning) {
            console.warn("TTS warning:", data.warning);
          }
        } else {
          throw new Error(data.error || "Failed to generate audio");
        }
      } catch (error) {
        console.error("Error generating audio:", error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to generate audio");
        }
      } finally {
        setIsGenerating(false);
      }
    };
  }, [currentChapter, document, getCurrentChapterContent, playbackSpeed]);

  // Generate audio when chapter changes
  useEffect(() => {
    if (document && currentChapter >= 0) {
      generateAudioForChapter();
    }
  }, [document, currentChapter, selectedVoice, generateAudioForChapter]);

  const startWordTracking = useCallback(() => {
    return () => {
      if (!audioData?.wordTimestamps) return;

      intervalRef.current = setInterval(() => {
        if (audioRef.current) {
          const currentTime = audioRef.current.currentTime;
          setCurrentTime(currentTime);

          // Find current word being spoken
          const wordIndex = audioData.wordTimestamps.findIndex(
            (timestamp, index) => {
              const nextTimestamp = audioData.wordTimestamps[index + 1];
              return (
                currentTime >= timestamp.start &&
                (!nextTimestamp || currentTime < nextTimestamp.start)
              );
            }
          );

          if (wordIndex !== -1 && wordIndex !== currentWordIndex) {
            setCurrentWordIndex(wordIndex);
            onWordHighlight?.(wordIndex);
          }
        }
      }, 100);
    };
  }, [audioData?.wordTimestamps, currentWordIndex, onWordHighlight]);
  // Handle audio playback
  useEffect(() => {
    if (audioRef.current && audioData) {
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error("Audio play failed:", err);
          setError("Failed to play audio");
        });
        startWordTracking();
      } else {
        audioRef.current.pause();
        stopWordTracking();
      }
    }
  }, [isPlaying, audioData, startWordTracking]);

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Auto-play when chapter changes if was playing and auto-advance is enabled
  useEffect(() => {
    if (audioData && isPlaying && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.error("Auto-play failed:", err);
      });
    }
  }, [audioData, currentChapter, isPlaying]);
  const fetchVoices = async () => {
    try {
      const response = await fetch("/api/tts");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      const data = await response.json();

      if (data.success) {
        setAvailableVoices(data.voices || []);
        if (data.warning) {
          console.warn("Voice API warning:", data.warning);
        }
      } else {
        throw new Error(data.error || "Failed to fetch voices");
      }
    } catch (error) {
      console.error("Failed to fetch voices:", error);
      console.warn("Using default voices due to API error");
      // Set default voices if API fails
      setAvailableVoices([
        {
          id: "rachel",
          name: "Rachel",
          category: "premade",
          description: "Calm and clear American female voice",
        },
        {
          id: "adam",
          name: "Adam",
          category: "premade",
          description: "Deep and authoritative American male voice",
        },
        {
          id: "bella",
          name: "Bella",
          category: "premade",
          description: "Warm and friendly British female voice",
        },
        {
          id: "charlie",
          name: "Charlie",
          category: "premade",
          description: "Professional British male voice",
        },
      ]);
    }
  };

  const stopWordTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(
        0,
        Math.min(duration, audioRef.current.currentTime + seconds)
      );
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const handleAudioEnd = () => {
    setCurrentTime(0);
    setCurrentWordIndex(-1);
    onWordHighlight?.(-1);
    stopWordTracking();

    // Auto-advance to next chapter if enabled and available
    if (autoAdvance && currentChapter < document.chapters.length - 1) {
      const nextChapter = currentChapter + 1;
      console.log("Auto-advancing to chapter:", nextChapter);
      onChapterChange(nextChapter);
      // Keep playing state true so the new chapter will auto-play
    } else {
      // Stop playing if we're at the last chapter or auto-advance is disabled
      console.log("Stopping playback - last chapter or auto-advance disabled");
      onPlayPause();
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioError = () => {
    console.error("Audio playback error occurred");
    setError("Audio playback failed");
    onPlayPause(); // Stop playing
  };

  const handleAudioLoadedData = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };
  const canAdvanceToNext = currentChapter < document?.chapters?.length - 1;
  const canGoToPrevious = currentChapter > 0;
  console.log(canGoToPrevious);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-t  shadow-lg"
    >
      {/* Hidden audio element */}
      {audioData && (
        <audio
          ref={audioRef}
          src={audioData.audioUrl}
          onTimeUpdate={handleAudioTimeUpdate}
          onEnded={handleAudioEnd}
          onLoadedMetadata={handleAudioLoadedData}
          onLoadedData={handleAudioLoadedData}
          onError={handleAudioError}
          onCanPlay={() => {
            // Ensure duration is set when audio can play
            if (audioRef.current && audioRef.current.duration) {
              setDuration(audioRef.current.duration);
            }
          }}
          preload="metadata"
        />
      )}

      <div className="px-6 py-4">
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center"
          >
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Warning Display */}
        {warning && !error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center"
          >
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" />
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              {warning}
            </p>
          </motion.div>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            onValueChange={handleSeek}
            max={duration || 100}
            step={1}
            className="w-full text-gray-800 bg-gray-800"
            disabled={!audioData || isGenerating}
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Left: Chapter Info */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {document?.chapters[currentChapter]?.title || "Audio Narration"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Chapter {currentChapter + 1} of {document?.chapters?.length}
                {audioData && ` • ${audioData.voice}`}
                {autoAdvance && canAdvanceToNext && (
                  <span className="ml-2 text-blue-600 dark:text-blue-400">
                    • Auto-advance enabled
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Center: Playback Controls */}
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
              onClick={onPlayPause}
              disabled={isGenerating || (!audioData && !isGenerating)}
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

          {/* Right: Volume & Settings */}
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
                    className="absolute bottom-full right-0 mb-2 border  rounded-lg shadow-xl p-4 min-w-[280px] z-50 bg-background"
                  >
                    <div className="space-y-4">
                      {/* Auto-advance Setting */}
                      <div className="flex items-center justify-between">
                        <div>
                          <Label
                            htmlFor="auto-advance"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Auto-advance chapters
                          </Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Automatically play next chapter when current ends
                          </p>
                        </div>
                        <Switch
                          id="auto-advance"
                          checked={autoAdvance}
                          onCheckedChange={setAutoAdvance}
                        />
                      </div>

                      {/* Voice Selection */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                          Voice
                        </label>
                        <span className="w-full border rounded-xl p-3 text-gray-900 dark:text-white">
                          {availableVoices[0].name}
                        </span>
                      </div>

                      {/* Playback Speed */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                          Playback Speed
                        </label>
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

                      {/* Mobile Volume */}
                      <div className="sm:hidden">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                          Volume
                        </label>
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
                        onClick={generateAudioForChapter}
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

        {/* Current word highlight info */}
        {audioData && currentWordIndex >= 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-center"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Now reading:{" "}
              <span className="font-medium text-purple-600 dark:text-purple-400">
                {audioData.wordTimestamps[currentWordIndex]?.word}
              </span>
            </span>
          </motion.div>
        )}

        {/* Generation status */}
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

        {/* Auto-advance status */}
        {autoAdvance && isPlaying && canAdvanceToNext && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-center"
          >
            <span className="text-xs text-blue-600 dark:text-blue-400">
              Will auto-advance to Chapter {currentChapter + 2} when finished
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
