"use client";

import { useState, useRef, useCallback } from "react";

export function useAudioRecorder(maxDurationMs = 45_000) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      setAudioBlob(new Blob(chunks, { type: recorder.mimeType }));
      stream.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };

    mediaRecorder.current = recorder;
    recorder.start();
    setIsRecording(true);
    setAudioBlob(null);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setDuration(elapsed);
      if (elapsed >= maxDurationMs) recorder.stop();
    }, 100);
  }, [maxDurationMs]);

  const stop = useCallback(() => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  }, []);

  return { isRecording, audioBlob, duration, start, stop };
}
