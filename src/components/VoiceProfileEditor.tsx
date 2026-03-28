"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Plus,
  Trash2,
  Loader2,
  FileText,
  Volume2,
  Wand2,
  Check,
  AlertCircle,
} from "lucide-react";
import { useAppStore, VoiceProfile } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";

const SAMPLE_CATEGORIES = [
  { value: "email", label: "Email" },
  { value: "slack", label: "Slack Message" },
  { value: "linkedin", label: "LinkedIn Post" },
  { value: "client-email", label: "Client Email" },
  { value: "text", label: "Text Message" },
  { value: "memo", label: "Memo / Brief" },
  { value: "other", label: "Other" },
] as const;

type SampleCategory = (typeof SAMPLE_CATEGORIES)[number]["value"];

interface CategorizedSample {
  text: string;
  category: SampleCategory;
}

function useSpeechRecognitionSupport(): boolean {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    );
  }, []);
  return supported;
}

export function VoiceProfileEditor() {
  const {
    voiceProfiles,
    addVoiceProfile,
    deleteVoiceProfile,
    setDefaultVoiceProfile,
    user,
  } = useAppStore();

  const speechSupported = useSpeechRecognitionSupport();

  const [activeTab, setActiveTab] = useState<"samples" | "record">("samples");
  const [samples, setSamples] = useState<CategorizedSample[]>([{ text: "", category: "email" }]);
  const [profileName, setProfileName] = useState("Personal Voice");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Web Speech API refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // MediaRecorder fallback refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const addSample = () => setSamples([...samples, { text: "", category: "email" }]);
  const removeSample = (index: number) =>
    setSamples(samples.filter((_, i) => i !== index));
  const updateSampleText = (index: number, value: string) =>
    setSamples(samples.map((s, i) => (i === index ? { ...s, text: value } : s)));
  const updateSampleCategory = (index: number, category: SampleCategory) =>
    setSamples(samples.map((s, i) => (i === index ? { ...s, category } : s)));

  const analyzeSamples = async () => {
    const validSamples = samples.filter((s) => s.text.trim().length > 0);
    if (validSamples.length < 1) {
      setError("Add at least one writing sample");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/voice-profile/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          samples: validSamples.map((s) => s.text),
          categories: validSamples.map((s) => s.category),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const { profileData } = await res.json();

      const profile: VoiceProfile = {
        id: uuidv4(),
        name: profileName,
        source: "samples",
        profileData,
        writingSamples: validSamples.map((s) => `[${s.category}] ${s.text}`),
        isDefault: voiceProfiles.length === 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addVoiceProfile(profile);
      setSuccess(`"${profileName}" voice profile created!`);
      setSamples([{ text: "", category: "email" }]);
      setProfileName("Personal Voice");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit transcript (from either Speech API or Whisper) for voice analysis
  const analyzeTranscript = useCallback(async (transcript: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/voice-profile/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const { profileData, transcript: returnedTranscript } = await res.json();

      const profile: VoiceProfile = {
        id: uuidv4(),
        name: profileName,
        source: "voice",
        profileData,
        writingSamples: [],
        voiceTranscript: returnedTranscript,
        isDefault: voiceProfiles.length === 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addVoiceProfile(profile);
      setSuccess(`"${profileName}" voice profile created from recording!`);
      setLiveTranscript("");
      setInterimText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setIsAnalyzing(false);
    }
  }, [profileName, voiceProfiles.length, addVoiceProfile]);

  // --- Web Speech API recording ---
  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
          setLiveTranscript(finalTranscript.trim());
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimText(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "aborted") {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    recognition.onend = () => {
      // Speech API can stop on its own (silence timeout). If we're still
      // "recording", restart it to keep capturing.
      if (recognitionRef.current === recognition && isRecording) {
        try {
          recognition.start();
        } catch {
          // already stopped, ignore
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setLiveTranscript("");
    setInterimText("");
    setIsRecording(true);
    setRecordingTime(0);
    setError(null);
    setSuccess(null);

    timerRef.current = setInterval(() => {
      setRecordingTime((t) => {
        if (t >= 90) {
          stopRecording();
          return 90;
        }
        return t + 1;
      });
    }, 1000);
  }, []);

  // --- MediaRecorder fallback ---
  const startMediaRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processRecordingFallback(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setError(null);
      setSuccess(null);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => {
          if (t >= 90) {
            stopRecording();
            return 90;
          }
          return t + 1;
        });
      }, 1000);
    } catch {
      setError("Microphone access denied");
    }
  };

  const processRecordingFallback = async (blob: Blob) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const res = await fetch("/api/voice-profile/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Transcription failed");
      }

      const { profileData, transcript } = await res.json();

      const profile: VoiceProfile = {
        id: uuidv4(),
        name: profileName,
        source: "voice",
        profileData,
        writingSamples: [],
        voiceTranscript: transcript,
        isDefault: voiceProfiles.length === 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addVoiceProfile(profile);
      setSuccess(`"${profileName}" voice profile created from recording!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Unified start/stop ---
  const startRecording = () => {
    if (speechSupported) {
      startSpeechRecognition();
    } else {
      startMediaRecording();
    }
  };

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    // Stop Speech API
    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      rec.stop();
    }

    // Stop MediaRecorder (fallback)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // When recording stops via Speech API, auto-submit the transcript
  const prevIsRecording = useRef(isRecording);
  useEffect(() => {
    if (prevIsRecording.current && !isRecording && !isAnalyzing) {
      // Recording just stopped
      if (speechSupported && liveTranscript.trim().length > 0) {
        analyzeTranscript(liveTranscript.trim());
      }
    }
    prevIsRecording.current = isRecording;
  }, [isRecording, isAnalyzing, speechSupported, liveTranscript, analyzeTranscript]);

  // Fix: stopRecording reference for timer callback
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Profile Name */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-dark-400 font-medium mb-2">
          Profile Name
        </label>
        <input
          type="text"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          className="w-full bg-dark-900/50 border border-dark-700/50 rounded-xl px-4 py-3 text-sm text-dark-100 focus:outline-none focus:border-crisp-500/50 transition-colors"
          placeholder="e.g., Personal, Board, Team"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: "samples" as const, label: "Paste Samples", icon: FileText },
          { id: "record" as const, label: "Record Voice", icon: Volume2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-crisp-500/10 text-crisp-400 border border-crisp-500/20"
                : "text-dark-400 hover:text-dark-200 border border-dark-700/30 hover:border-dark-600/50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Samples Tab */}
      <AnimatePresence mode="wait">
        {activeTab === "samples" && (
          <motion.div
            key="samples"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <p className="text-xs text-dark-400">
              Paste 3-5 real writing samples — emails, Slack messages, LinkedIn
              posts. The more samples, the better the voice match.
            </p>
            {samples.map((sample, i) => (
              <div key={i} className="relative space-y-1.5">
                <div className="flex items-center gap-2">
                  <select
                    value={sample.category}
                    onChange={(e) => updateSampleCategory(i, e.target.value as SampleCategory)}
                    className="bg-dark-900/50 border border-dark-700/50 rounded-lg px-2.5 py-1.5 text-xs text-dark-300 focus:outline-none focus:border-crisp-500/30 transition-colors appearance-none cursor-pointer"
                  >
                    {SAMPLE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-dark-600">Sample {i + 1}</span>
                  {samples.length > 1 && (
                    <button
                      onClick={() => removeSample(i)}
                      className="ml-auto p-1 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <textarea
                  value={sample.text}
                  onChange={(e) => updateSampleText(i, e.target.value)}
                  placeholder={`Paste a ${SAMPLE_CATEGORIES.find(c => c.value === sample.category)?.label.toLowerCase() || "writing"} sample...`}
                  className="w-full bg-dark-900/50 border border-dark-700/50 rounded-xl px-4 py-3 text-sm text-dark-200 placeholder-dark-600 focus:outline-none focus:border-crisp-500/30 min-h-[100px] resize-none transition-colors"
                />
              </div>
            ))}
            {samples.length < 5 && (
              <button
                onClick={addSample}
                className="flex items-center gap-2 text-xs text-dark-400 hover:text-crisp-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add another sample
              </button>
            )}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={analyzeSamples}
              disabled={isAnalyzing || !samples.some((s) => s.text.trim())}
              className="w-full py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-crisp-600 to-crisp-500 text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing voice patterns...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Analyze Voice
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Record Tab */}
        {activeTab === "record" && (
          <motion.div
            key="record"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <p className="text-xs text-dark-400">
              Talk for 60-90 seconds about anything — how you&apos;d explain your work,
              a recent project, or your strategy. Your spoken voice is often more
              natural and more &quot;you&quot; than writing.
            </p>

            {!speechSupported && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/5 border border-amber-400/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Your browser doesn&apos;t support live transcription. Recording will be sent to server for processing.
              </div>
            )}

            <div className="flex flex-col items-center gap-4 py-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isAnalyzing}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? "bg-red-500/20 border-2 border-red-500/50 text-red-400 animate-pulse"
                    : "bg-crisp-500/10 border-2 border-crisp-500/30 text-crisp-400 hover:bg-crisp-500/20"
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8" />
                ) : isAnalyzing ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </motion.button>
              {isRecording && (
                <div className="text-center">
                  <div className="text-2xl font-mono text-dark-200">
                    {formatTime(recordingTime)}
                  </div>
                  <div className="text-xs text-dark-500 mt-1">
                    {recordingTime < 60 ? "Keep talking..." : "Great length! Click to finish."}
                  </div>
                </div>
              )}
              {!isRecording && !isAnalyzing && (
                <p className="text-xs text-dark-500">
                  Click to start recording (90s max)
                </p>
              )}
              {isAnalyzing && (
                <p className="text-xs text-dark-400">
                  Analyzing voice patterns...
                </p>
              )}
            </div>

            {/* Live transcript preview (Speech API only) */}
            {speechSupported && (isRecording || liveTranscript) && (
              <div className="bg-dark-900/50 border border-dark-700/50 rounded-xl px-4 py-3 min-h-[80px] max-h-[160px] overflow-y-auto">
                <div className="text-xs uppercase tracking-wider text-dark-500 mb-2">
                  Live transcript
                </div>
                <p className="text-sm text-dark-200 leading-relaxed">
                  {liveTranscript}
                  {interimText && (
                    <span className="text-dark-500">{interimText}</span>
                  )}
                  {isRecording && !liveTranscript && !interimText && (
                    <span className="text-dark-600">Listening...</span>
                  )}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-sm text-red-400 bg-red-400/5 border border-red-400/20 rounded-xl px-4 py-3"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/5 border border-emerald-400/20 rounded-xl px-4 py-3"
          >
            <Check className="w-4 h-4 flex-shrink-0" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Profiles */}
      {voiceProfiles.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-dark-800/50">
          <h3 className="text-sm font-medium text-dark-200">Your Voice Profiles</h3>
          {voiceProfiles.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center justify-between p-4 rounded-xl border border-dark-700/50 bg-dark-900/30"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    profile.source === "voice"
                      ? "bg-violet-400/10 text-violet-400"
                      : profile.source === "calibration"
                      ? "bg-amber-400/10 text-amber-400"
                      : "bg-crisp-400/10 text-crisp-400"
                  }`}
                >
                  {profile.source === "voice" ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-dark-100 flex items-center gap-2">
                    {profile.name}
                    {profile.isDefault && (
                      <span className="text-[10px] uppercase tracking-wider bg-crisp-500/10 text-crisp-400 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-dark-500">
                    {profile.source} · updated{" "}
                    {new Date(profile.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!profile.isDefault && (
                  <button
                    onClick={() => setDefaultVoiceProfile(profile.id)}
                    className="text-xs text-dark-400 hover:text-crisp-400 px-3 py-1.5 rounded-lg hover:bg-crisp-500/5 transition-colors"
                  >
                    Set default
                  </button>
                )}
                <button
                  onClick={() => deleteVoiceProfile(profile.id)}
                  className="p-1.5 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {user.plan === "free" && voiceProfiles.length >= 1 && (
            <p className="text-xs text-dark-500 text-center">
              Free plan: 1 voice profile. Upgrade to Pro for up to 3.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
