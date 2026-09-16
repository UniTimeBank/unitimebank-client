import { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  saveRecordingToStorage,
  getRecordingsByRoomFromStorage,
  deleteRecordingFromStorage,
  clearRecordingsByRoomFromStorage,
} from '../utils/recordingStorage';

export const MAX_SESSION_RECORDING_BYTES = 100 * 1024 * 1024; // 100MB

export interface SessionRecordingClip {
  id: string;
  name: string;
  blob: Blob;
  file: File;
  sizeBytes: number;
  durationSeconds: number;
  createdAt: Date;
  previewUrl: string;
}

export interface UseSessionRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  currentDuration: number;
  currentClipBytes: number;
  clips: SessionRecordingClip[];
  totalBytes: number;
  remainingBytes: number;
  usedPercentage: number;
  latestClip: SessionRecordingClip | null;
  startRecording: () => Promise<boolean>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => Promise<SessionRecordingClip | null>;
  deleteClip: (id: string) => void;
  downloadClip: (id: string) => void;
  clearAllClips: () => void;
}

export const useSessionRecorder = (roomId?: string): UseSessionRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [currentClipBytes, setCurrentClipBytes] = useState(0);
  const [clips, setClips] = useState<SessionRecordingClip[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const durationTimerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const currentBytesRef = useRef<number>(0);
  const clipsRef = useRef<SessionRecordingClip[]>([]);

  // Stop and release ALL media tracks (display video/audio, mic audio, audioContext)
  const stopAllMediaTracks = useCallback(() => {
    if (displayStreamRef.current) {
      displayStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.debug('Error stopping display track:', e);
        }
      });
      displayStreamRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.debug('Error stopping mic track:', e);
        }
      });
      micStreamRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.debug('Error stopping combined track:', e);
        }
      });
      streamRef.current = null;
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch (e) {
        console.debug('Error closing audioContext:', e);
      }
      audioCtxRef.current = null;
    }
  }, []);

  // Sync ref with state
  useEffect(() => {
    clipsRef.current = clips;
  }, [clips]);

  // Load persisted recording clips from IndexedDB on mount / room enter
  useEffect(() => {
    if (!roomId) return;
    let isMounted = true;

    getRecordingsByRoomFromStorage(roomId).then((stored) => {
      if (!isMounted || stored.length === 0) return;
      const loadedClips: SessionRecordingClip[] = stored.map((s) => {
        const file = new File([s.blob], s.fileName, { type: s.mimeType || s.blob.type });
        const previewUrl = URL.createObjectURL(s.blob);
        return {
          id: s.id,
          name: s.name,
          blob: s.blob,
          file,
          sizeBytes: s.sizeBytes,
          durationSeconds: s.durationSeconds,
          createdAt: new Date(s.createdAt),
          previewUrl,
        };
      });
      setClips(loadedClips);
    });

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  // Clean up object URLs and active tracks on unmount / room exit
  useEffect(() => {
    return () => {
      clipsRef.current.forEach((c) => {
        if (c.previewUrl) {
          URL.revokeObjectURL(c.previewUrl);
        }
      });
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
      stopAllMediaTracks();
    };
  }, [stopAllMediaTracks]);

  const totalBytes = clips.reduce((acc, c) => acc + c.sizeBytes, 0);
  const remainingBytes = Math.max(0, MAX_SESSION_RECORDING_BYTES - totalBytes);
  const usedPercentage = Math.min(100, Math.round((totalBytes / MAX_SESSION_RECORDING_BYTES) * 1000) / 10);
  const latestClip = clips.length > 0 ? clips[clips.length - 1] : null;

  const stopRecordingInternal = useCallback(async (): Promise<SessionRecordingClip | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        setIsRecording(false);
        if (durationTimerRef.current) clearInterval(durationTimerRef.current);
        stopAllMediaTracks();
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        if (durationTimerRef.current) clearInterval(durationTimerRef.current);
        setIsRecording(false);
        setIsPaused(false);

        // Stop all display, mic and combined media tracks completely
        stopAllMediaTracks();

        const chunks = recordedChunksRef.current;
        if (chunks.length === 0) {
          resolve(null);
          return;
        }

        const mimeType = recorder.mimeType || 'video/webm';
        const blob = new Blob(chunks, { type: mimeType });
        const sizeBytes = blob.size;
        const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
        const timestamp = new Date();
        const clipNumber = clipsRef.current.length + 1;
        const fileName = `session_${roomId || 'room'}_clip_${clipNumber}_${timestamp.getTime()}.webm`;
        const file = new File([blob], fileName, { type: mimeType });
        const previewUrl = URL.createObjectURL(blob);

        const newClip: SessionRecordingClip = {
          id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: `Đoạn quay #${clipNumber} (${(sizeBytes / (1024 * 1024)).toFixed(1)} MB)`,
          blob,
          file,
          sizeBytes,
          durationSeconds,
          createdAt: timestamp,
          previewUrl,
        };

        // Persist to IndexedDB so clips survive page reload and room re-entry
        saveRecordingToStorage({
          id: newClip.id,
          roomId: roomId || 'default_room',
          name: newClip.name,
          fileName: newClip.file.name,
          mimeType,
          blob,
          sizeBytes,
          durationSeconds,
          createdAt: timestamp.getTime(),
        });

        setClips((prev) => [...prev, newClip]);
        setCurrentDuration(0);
        setCurrentClipBytes(0);
        currentBytesRef.current = 0;
        recordedChunksRef.current = [];
        mediaRecorderRef.current = null;

        toast.success(`Đã lưu đoạn video #${clipNumber} (${(sizeBytes / (1024 * 1024)).toFixed(1)} MB)`);
        resolve(newClip);
      };

      try {
        recorder.stop();
      } catch (err) {
        console.error('Error stopping recorder:', err);
        stopAllMediaTracks();
        resolve(null);
      }
    });
  }, [roomId, stopAllMediaTracks]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    // Check remaining quota
    const total = clipsRef.current.reduce((acc, c) => acc + c.sizeBytes, 0);
    const available = MAX_SESSION_RECORDING_BYTES - total;

    if (available < 1024 * 1024) {
      toast.error('Bạn đã sử dụng hết hạn mức 100MB cho buổi học này. Vui lòng xóa bớt clip cũ để quay tiếp.');
      return false;
    }

    try {
      // Prompt user to pick screen/window/tab to capture with audio (prefer current tab like Zoom)
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          frameRate: { ideal: 30, max: 30 },
        },
        audio: true,
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
        systemAudio: 'include',
        surfaceSwitching: 'include',
      } as any);

      displayStreamRef.current = displayStream;

      // Optionally mix microphone audio if available
      let combinedStream = displayStream;
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const dest = audioCtx.createMediaStreamDestination();

        micStreamRef.current = micStream;
        audioCtxRef.current = audioCtx;

        if (displayStream.getAudioTracks().length > 0) {
          const displayAudioSource = audioCtx.createMediaStreamSource(displayStream);
          displayAudioSource.connect(dest);
        }

        if (micStream.getAudioTracks().length > 0) {
          const micSource = audioCtx.createMediaStreamSource(micStream);
          micSource.connect(dest);
        }

        const mixedAudioTrack = dest.stream.getAudioTracks()[0];
        const videoTrack = displayStream.getVideoTracks()[0];
        const tracks: MediaStreamTrack[] = [];
        if (videoTrack) tracks.push(videoTrack);
        if (mixedAudioTrack) tracks.push(mixedAudioTrack);
        combinedStream = new MediaStream(tracks);
      } catch (micErr) {
        // Fallback to display stream only if mic is unavailable/denied
        console.debug('Using display stream audio only:', micErr);
      }

      streamRef.current = combinedStream;

      // When user clicks browser native "Stop sharing" button
      const videoTrack = displayStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          stopRecordingInternal();
        };
      }

      // Pick supported mime type
      let mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4';
        }
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 1200000, // ~1.2 Mbps for balanced quality & lightweight file size
      });

      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];
      currentBytesRef.current = 0;
      startTimeRef.current = Date.now();

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
          currentBytesRef.current += e.data.size;
          setCurrentClipBytes(currentBytesRef.current);

          // Check if cumulative total exceeds 100MB
          const latestTotal = clipsRef.current.reduce((acc, c) => acc + c.sizeBytes, 0) + currentBytesRef.current;
          if (latestTotal >= MAX_SESSION_RECORDING_BYTES) {
            toast.error('Đã đạt giới hạn tối đa 100MB cho buổi học này! Ghi hình đã tự động dừng lại.');
            stopRecordingInternal();
          }
        }
      };

      recorder.start(1000); // Collect data every 1 second
      setIsRecording(true);
      setIsPaused(false);
      setCurrentDuration(0);

      // Start duration timer (increments every second while active)
      durationTimerRef.current = setInterval(() => {
        setCurrentDuration((prev) => prev + 1);
      }, 1000);

      toast.success('Bắt đầu ghi hình buổi học (Giới hạn tối đa 100MB)');
      return true;
    } catch (err: any) {
      stopAllMediaTracks();
      if (err?.name === 'NotAllowedError') {
        toast.error('Bạn đã hủy chia sẻ màn hình để quay video.');
      } else {
        toast.error('Không thể kích hoạt ghi hình: ' + (err?.message || 'Lỗi trình duyệt'));
      }
      return false;
    }
  }, [stopRecordingInternal, stopAllMediaTracks]);

  const pauseRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') {
      recorder.pause();
      setIsPaused(true);
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
      toast('Đã tạm dừng ghi hình buổi học', { icon: '⏸️' });
    }
  }, []);

  const resumeRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'paused') {
      recorder.resume();
      setIsPaused(false);
      durationTimerRef.current = setInterval(() => {
        setCurrentDuration((prev) => prev + 1);
      }, 1000);
      toast('Đã tiếp tục ghi hình buổi học', { icon: '▶️' });
    }
  }, []);

  const deleteClip = useCallback((id: string) => {
    deleteRecordingFromStorage(id);
    setClips((prev) => {
      const target = prev.find((c) => c.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((c) => c.id !== id);
    });
    toast.success('Đã xóa đoạn video và giải phóng dung lượng');
  }, []);

  const downloadClip = useCallback((id: string) => {
    const clip = clipsRef.current.find((c) => c.id === id);
    if (!clip) {
      toast.error('Không tìm thấy đoạn video cần tải.');
      return;
    }

    const a = document.createElement('a');
    a.href = clip.previewUrl;
    a.download = clip.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Đang tải file "${clip.file.name}" về máy tính`);
  }, []);

  const clearAllClips = useCallback(() => {
    if (roomId) {
      clearRecordingsByRoomFromStorage(roomId);
    }
    clipsRef.current.forEach((c) => {
      if (c.previewUrl) URL.revokeObjectURL(c.previewUrl);
    });
    setClips([]);
    setCurrentClipBytes(0);
    setCurrentDuration(0);
  }, [roomId]);

  return {
    isRecording,
    isPaused,
    currentDuration,
    currentClipBytes,
    clips,
    totalBytes,
    remainingBytes,
    usedPercentage,
    latestClip,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording: stopRecordingInternal,
    deleteClip,
    downloadClip,
    clearAllClips,
  };
};
