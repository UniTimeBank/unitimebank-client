import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseMediaDevicePreviewReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  isCameraEnabled: boolean;
  isMicEnabled: boolean;
  audioLevel: number; // 0 to 100
  audioInputs: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
  audioOutputs: MediaDeviceInfo[];
  selectedAudioId: string;
  selectedVideoId: string;
  selectedOutputId: string;
  hasPermission: boolean | null;
  permissionError: string | null;
  isTestingSpeaker: boolean;
  isPermissionPromptOpen: boolean;
  requestPermissions: () => Promise<void>;
  dismissPermissionPrompt: () => void;
  toggleCamera: () => void;
  toggleMicrophone: () => void;
  setCameraEnabled: (enabled: boolean) => void;
  setMicrophoneEnabled: (enabled: boolean) => void;
  changeAudioInput: (deviceId: string) => Promise<void>;
  changeVideoInput: (deviceId: string) => Promise<void>;
  changeAudioOutput: (deviceId: string) => Promise<void>;
  testSpeaker: () => void;
  cleanup: () => void;
}

export const useMediaDevicePreview = (): UseMediaDevicePreviewReturn => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);

  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);

  const [selectedAudioId, setSelectedAudioId] = useState<string>('');
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [selectedOutputId, setSelectedOutputId] = useState<string>('');

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isTestingSpeaker, setIsTestingSpeaker] = useState(false);
  const [isPermissionPromptOpen, setIsPermissionPromptOpen] = useState(false);

  // 1. Enumerate available media devices
  const updateDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audios = devices.filter((d) => d.kind === 'audioinput');
      const videos = devices.filter((d) => d.kind === 'videoinput');
      const outputs = devices.filter((d) => d.kind === 'audiooutput');

      setAudioInputs(audios);
      setVideoInputs(videos);
      setAudioOutputs(outputs);

      if (audios.length > 0 && !selectedAudioId) {
        setSelectedAudioId(audios[0].deviceId);
      }
      if (videos.length > 0 && !selectedVideoId) {
        setSelectedVideoId(videos[0].deviceId);
      }
      if (outputs.length > 0 && !selectedOutputId) {
        setSelectedOutputId(outputs[0].deviceId);
      }
    } catch (err) {
      console.warn('Failed to enumerate devices:', err);
    }
  }, [selectedAudioId, selectedVideoId, selectedOutputId]);

  // 2. Setup audio analysis for live VU meter
  const setupAudioAnalysis = useCallback((mediaStream: MediaStream) => {
    try {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }

      const audioTracks = mediaStream.getAudioTracks();
      if (audioTracks.length === 0) {
        setAudioLevel(0);
        return;
      }

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.4;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(mediaStream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!analyserRef.current || !streamRef.current) {
          setAudioLevel(0);
          return;
        }

        const currentAudioTrack = streamRef.current.getAudioTracks()[0];
        if (!currentAudioTrack || !currentAudioTrack.enabled) {
          setAudioLevel(0);
          animFrameRef.current = requestAnimationFrame(checkVolume);
          return;
        }

        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        // Normalize 0..100 with boosted sensitivity
        const normalized = Math.min(100, Math.round((average / 128) * 100 * 1.5));
        setAudioLevel(normalized);

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn('Could not setup audio analysis:', err);
      setAudioLevel(0);
    }
  }, []);

  // 3. Initialize or restart media preview stream
  const initStream = useCallback(
    async (audioId?: string, videoId?: string) => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setPermissionError('Trình duyệt không hỗ trợ truy cập Camera/Microphone.');
          setHasPermission(false);
          return;
        }

        // Clean previous tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        const constraints: MediaStreamConstraints = {
          audio: audioId ? { deviceId: { exact: audioId } } : true,
          video: videoId
            ? { deviceId: { exact: videoId }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : { width: { ideal: 1280 }, height: { ideal: 720 } },
        };

        let newStream: MediaStream;
        try {
          newStream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (firstErr: any) {
          console.warn('Full constraints failed, falling back gracefully:', firstErr);
          // Fallback: try separate audio or video if one device is missing
          try {
            newStream = await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: true,
            });
          } catch {
            try {
              // Try video only
              newStream = await navigator.mediaDevices.getUserMedia({ video: true });
            } catch {
              // Try audio only
              newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            }
          }
        }

        streamRef.current = newStream;
        setStream(newStream);
        setHasPermission(true);
        setPermissionError(null);

        // Apply enabled states
        newStream.getVideoTracks().forEach((track) => {
          track.enabled = isCameraEnabled;
        });
        newStream.getAudioTracks().forEach((track) => {
          track.enabled = isMicEnabled;
        });

        // Attach to video element
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          videoRef.current.play().catch(() => {});
        }

        // Setup audio VU meter
        setupAudioAnalysis(newStream);

        // Update device list with labels now that permission is granted
        await updateDevices();
      } catch (err: any) {
        console.error('Failed to get media devices:', err);
        setHasPermission(false);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionError('Bạn đã chặn quyền truy cập Máy ảnh hoặc Micro. Vui lòng cấp quyền trong cài đặt trình duyệt để tiếp tục.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setPermissionError('Không tìm thấy thiết bị Microphone hoặc Camera trên máy tính của bạn.');
        } else {
          setPermissionError('Không thể khởi động thiết bị ngoại vi. Vui lòng kiểm tra lại kết nối.');
        }
      }
    },
    [isCameraEnabled, isMicEnabled, setupAudioAnalysis, updateDevices],
  );

  // 4. Initial load on mount
  useEffect(() => {
    const checkInitialPermissions = async () => {
      if (navigator.permissions?.query) {
        try {
          const cam = await navigator.permissions.query({ name: 'camera' as any });
          const mic = await navigator.permissions.query({ name: 'microphone' as any });

          if (cam.state === 'granted' || mic.state === 'granted') {
            initStream();
            return;
          }

          if (cam.state === 'denied' && mic.state === 'denied') {
            setHasPermission(false);
            setPermissionError(
              'Bạn đã chặn quyền truy cập Máy ảnh hoặc Micro. Vui lòng cấp quyền trong cài đặt trình duyệt để tiếp tục.',
            );
            return;
          }

          // State is 'prompt' -> Open Google Meet style permission prompt modal!
          setIsPermissionPromptOpen(true);
          return;
        } catch {
          // If query is not supported, fall through to initStream
        }
      }

      initStream();
    };

    checkInitialPermissions();

    // Listen for device plug/unplug
    const handleDeviceChange = () => {
      updateDevices();
    };
    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange);
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestPermissions = useCallback(async () => {
    setIsPermissionPromptOpen(false);
    await initStream();
  }, [initStream]);

  const dismissPermissionPrompt = useCallback(() => {
    setIsPermissionPromptOpen(false);
    setIsCameraEnabled(false);
    setIsMicEnabled(false);
    setHasPermission(false);
  }, []);

  // 5. Cleanup helper
  const cleanup = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setAudioLevel(0);
  }, []);

  // 6. Camera toggle
  const toggleCamera = useCallback(() => {
    const nextState = !isCameraEnabled;
    setIsCameraEnabled(nextState);
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }
  }, [isCameraEnabled]);

  const setCameraEnabled = useCallback((enabled: boolean) => {
    setIsCameraEnabled(enabled);
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }, []);

  // 7. Microphone toggle
  const toggleMicrophone = useCallback(() => {
    const nextState = !isMicEnabled;
    setIsMicEnabled(nextState);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }
    if (!nextState) {
      setAudioLevel(0);
    }
  }, [isMicEnabled]);

  const setMicrophoneEnabled = useCallback((enabled: boolean) => {
    setIsMicEnabled(enabled);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
    if (!enabled) {
      setAudioLevel(0);
    }
  }, []);

  // 8. Device changes
  const changeAudioInput = useCallback(
    async (deviceId: string) => {
      setSelectedAudioId(deviceId);
      await initStream(deviceId, selectedVideoId);
    },
    [initStream, selectedVideoId],
  );

  const changeVideoInput = useCallback(
    async (deviceId: string) => {
      setSelectedVideoId(deviceId);
      await initStream(selectedAudioId, deviceId);
    },
    [initStream, selectedAudioId],
  );

  const changeAudioOutput = useCallback(async (deviceId: string) => {
    setSelectedOutputId(deviceId);
    if (videoRef.current && (videoRef.current as any).setSinkId) {
      try {
        await (videoRef.current as any).setSinkId(deviceId);
      } catch (err) {
        console.warn('Failed to setSinkId on video element:', err);
      }
    }
  }, []);

  // 9. Speaker test tone generator (synthesized arpeggio chime, offline & 100% reliable)
  const testSpeaker = useCallback(() => {
    if (isTestingSpeaker) return;
    setIsTestingSpeaker(true);

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        setIsTestingSpeaker(false);
        return;
      }

      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      osc.type = 'sine';
      // Harmonic chime: E5 (659.25Hz) -> A5 (880Hz) -> C#6 (1108.73Hz)
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.setValueAtTime(880.0, now + 0.12);
      osc.frequency.setValueAtTime(1108.73, now + 0.24);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.04);
      gain.gain.setValueAtTime(0.25, now + 0.26);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.start(now);
      osc.stop(now + 0.65);

      setTimeout(() => {
        ctx.close().catch(() => {});
        setIsTestingSpeaker(false);
      }, 700);
    } catch (err) {
      console.warn('Error playing speaker test tone:', err);
      setIsTestingSpeaker(false);
    }
  }, [isTestingSpeaker]);

  return {
    videoRef,
    stream,
    isCameraEnabled,
    isMicEnabled,
    audioLevel,
    audioInputs,
    videoInputs,
    audioOutputs,
    selectedAudioId,
    selectedVideoId,
    selectedOutputId,
    hasPermission,
    permissionError,
    isTestingSpeaker,
    isPermissionPromptOpen,
    requestPermissions,
    dismissPermissionPrompt,
    toggleCamera,
    toggleMicrophone,
    setCameraEnabled,
    setMicrophoneEnabled,
    changeAudioInput,
    changeVideoInput,
    changeAudioOutput,
    testSpeaker,
    cleanup,
  };
};
