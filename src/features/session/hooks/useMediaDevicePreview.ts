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
  const isMountedRef = useRef<boolean>(true);

  // Lưu giữ trạng thái qua Refs để tránh recreate các callback và trigger mount effect
  const isCameraEnabledRef = useRef<boolean>(true);
  const isMicEnabledRef = useRef<boolean>(true);
  const selectedAudioIdRef = useRef<string>('');
  const selectedVideoIdRef = useRef<string>('');

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

  // 1. Enumerate available media devices (Callback ổn định, không phụ thuộc state)
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

      if (audios.length > 0 && !selectedAudioIdRef.current) {
        selectedAudioIdRef.current = audios[0].deviceId;
        setSelectedAudioId(audios[0].deviceId);
      }
      if (videos.length > 0 && !selectedVideoIdRef.current) {
        selectedVideoIdRef.current = videos[0].deviceId;
        setSelectedVideoId(videos[0].deviceId);
      }
      setSelectedOutputId((prev) => {
        if (!prev && outputs.length > 0) return outputs[0].deviceId;
        return prev;
      });
    } catch (err) {
      console.warn('Failed to enumerate devices:', err);
    }
  }, []);

  // 2. Setup audio analysis for live VU meter
  const setupAudioAnalysis = useCallback((mediaStream: MediaStream) => {
    try {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }

      const audioTracks = mediaStream.getAudioTracks();
      if (audioTracks.length === 0 || !isMicEnabledRef.current) {
        setAudioLevel(0);
        return;
      }

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
        if (!analyserRef.current || !streamRef.current || !isMicEnabledRef.current) {
          setAudioLevel(0);
          return;
        }

        const currentAudioTrack = streamRef.current.getAudioTracks()[0];
        if (
          !currentAudioTrack ||
          !currentAudioTrack.enabled ||
          currentAudioTrack.readyState === 'ended'
        ) {
          setAudioLevel(0);
          return;
        }

        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        // Chuẩn hóa 0..100 với độ nhạy tối ưu
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

  // 3. Dọn dẹp toàn diện: ngắt mọi track, đóng AudioContext để giải phóng phần cứng
  const cleanup = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping preview track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream((prev) => {
      if (prev) {
        prev.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch {}
        });
      }
      return null;
    });
    setAudioLevel(0);
  }, []);

  // 4. Initialize media preview stream (Chỉ xin thiết bị nào đang được bật)
  const initStream = useCallback(
    async (audioId?: string, videoId?: string) => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setPermissionError('Trình duyệt không hỗ trợ truy cập Camera/Microphone.');
          setHasPermission(false);
          return;
        }

        const wantMic = isMicEnabledRef.current;
        const wantCam = isCameraEnabledRef.current;

        // Nếu cả hai đều đang tắt, TUYỆT ĐỐI không gọi getUserMedia (giải phóng hoàn toàn phần cứng)
        if (!wantMic && !wantCam) {
          cleanup();
          return;
        }

        // Dọn dẹp tracks cũ trước khi xin mới
        cleanup();

        const effectiveAudioId = audioId || selectedAudioIdRef.current;
        const effectiveVideoId = videoId || selectedVideoIdRef.current;

        const constraints: MediaStreamConstraints = {
          audio: wantMic
            ? effectiveAudioId
              ? { deviceId: { exact: effectiveAudioId } }
              : true
            : false,
          video: wantCam
            ? effectiveVideoId
              ? { deviceId: { exact: effectiveVideoId }, width: { ideal: 1280 }, height: { ideal: 720 } }
              : { width: { ideal: 1280 }, height: { ideal: 720 } }
            : false,
        };

        let newStream: MediaStream;
        try {
          newStream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (firstErr: any) {
          console.warn('Full constraints failed, falling back gracefully:', firstErr);
          try {
            newStream = await navigator.mediaDevices.getUserMedia({
              audio: wantMic,
              video: wantCam,
            });
          } catch (secondErr: any) {
            if (wantCam && wantMic) {
              try {
                newStream = await navigator.mediaDevices.getUserMedia({ video: true });
                isMicEnabledRef.current = false;
                setIsMicEnabled(false);
              } catch {
                newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                isCameraEnabledRef.current = false;
                setIsCameraEnabled(false);
              }
            } else {
              throw secondErr;
            }
          }
        }

        // BẢO VỆ TUYỆT ĐỐI: Nếu component đã unmount trong lúc chờ getUserMedia
        if (!isMountedRef.current) {
          if (newStream) {
            newStream.getTracks().forEach((t) => {
              try {
                t.stop();
              } catch {}
            });
          }
          return;
        }

        // Nếu trong thời gian await getUserMedia, người dùng đã bấm tắt cam hoặc mic
        if (!isCameraEnabledRef.current) {
          newStream.getVideoTracks().forEach((t) => {
            try {
              t.stop();
              newStream.removeTrack(t);
            } catch {}
          });
        }
        if (!isMicEnabledRef.current) {
          newStream.getAudioTracks().forEach((t) => {
            try {
              t.stop();
              newStream.removeTrack(t);
            } catch {}
          });
        }

        if (newStream.getTracks().length === 0) {
          streamRef.current = null;
          setStream(null);
          setHasPermission(true);
          setPermissionError(null);
          return;
        }

        streamRef.current = newStream;
        setStream(newStream);
        setHasPermission(true);
        setPermissionError(null);

        // Attach video element nếu camera bật
        if (isCameraEnabledRef.current && newStream.getVideoTracks().length > 0 && videoRef.current) {
          videoRef.current.srcObject = newStream;
          videoRef.current.play().catch(() => {});
        }

        // Setup VU meter nếu mic bật
        if (isMicEnabledRef.current && newStream.getAudioTracks().length > 0) {
          setupAudioAnalysis(newStream);
        } else {
          setAudioLevel(0);
        }

        // Cập nhật danh sách thiết bị khi đã có quyền
        await updateDevices();
      } catch (err: any) {
        console.error('Failed to get media devices:', err);
        setHasPermission(false);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionError(
            'Bạn đã chặn quyền truy cập Máy ảnh hoặc Micro. Vui lòng cấp quyền trong cài đặt trình duyệt để tiếp tục.',
          );
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setPermissionError('Không tìm thấy thiết bị Microphone hoặc Camera trên máy tính của bạn.');
        } else {
          setPermissionError('Không thể khởi động thiết bị ngoại vi. Vui lòng kiểm tra lại kết nối.');
        }
      }
    },
    [cleanup, setupAudioAnalysis, updateDevices],
  );

  // 5. Initial load on mount (Chỉ chạy đúng 1 lần khi mở màn hình chờ)
  useEffect(() => {
    isMountedRef.current = true;
    let didCancel = false;

    const checkInitialPermissions = async () => {
      if (navigator.permissions?.query) {
        try {
          const cam = await navigator.permissions.query({ name: 'camera' as any });
          const mic = await navigator.permissions.query({ name: 'microphone' as any });

          if (cam.state === 'granted' || mic.state === 'granted') {
            if (!didCancel) {
              await initStream();
            }
            return;
          }

          if (cam.state === 'denied' && mic.state === 'denied') {
            if (!didCancel) {
              setHasPermission(false);
              setPermissionError(
                'Bạn đã chặn quyền truy cập Máy ảnh hoặc Micro. Vui lòng cấp quyền trong cài đặt trình duyệt để tiếp tục.',
              );
            }
            return;
          }

          // State is 'prompt' -> Hiển thị hộp thoại xin quyền chuẩn Google Meet
          if (!didCancel) {
            setIsPermissionPromptOpen(true);
          }
          return;
        } catch {
          // Fallback nếu permissions query không hỗ trợ
        }
      }

      if (!didCancel) {
        await initStream();
      }
    };

    checkInitialPermissions();

    // Lắng nghe cắm / rút thiết bị
    const handleDeviceChange = () => {
      updateDevices();
    };
    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange);

    return () => {
      didCancel = true;
      isMountedRef.current = false;
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
    isCameraEnabledRef.current = false;
    isMicEnabledRef.current = false;
    setIsCameraEnabled(false);
    setIsMicEnabled(false);
    setHasPermission(false);
    cleanup();
  }, [cleanup]);

  // 6. Camera toggle: dừng hoàn toàn track khi tắt để giải phóng camera, xin lại track mới khi bật
  const setCameraEnabled = useCallback(async (enabled: boolean) => {
    isCameraEnabledRef.current = enabled;
    setIsCameraEnabled(enabled);

    if (!enabled) {
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((track) => {
          try {
            track.stop();
            streamRef.current?.removeTrack(track);
          } catch {}
        });
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (streamRef.current && streamRef.current.getTracks().length === 0) {
        streamRef.current = null;
        setStream(null);
      } else if (streamRef.current) {
        setStream(new MediaStream(streamRef.current.getTracks()));
      }
    } else {
      try {
        const videoConstraints: MediaTrackConstraints = selectedVideoIdRef.current
          ? { deviceId: { exact: selectedVideoIdRef.current }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { width: { ideal: 1280 }, height: { ideal: 720 } };

        const newVideoStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
        });

        const newTrack = newVideoStream.getVideoTracks()[0];
        if (newTrack) {
          if (!streamRef.current) {
            streamRef.current = new MediaStream();
          }
          streamRef.current.getVideoTracks().forEach((t) => {
            try {
              t.stop();
              streamRef.current?.removeTrack(t);
            } catch {}
          });
          streamRef.current.addTrack(newTrack);
          setStream(new MediaStream(streamRef.current.getTracks()));

          if (videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Could not re-enable camera:', err);
        isCameraEnabledRef.current = false;
        setIsCameraEnabled(false);
      }
    }
  }, []);

  const toggleCamera = useCallback(() => {
    setCameraEnabled(!isCameraEnabledRef.current);
  }, [setCameraEnabled]);

  // 7. Microphone toggle: dừng hoàn toàn track và AudioContext khi tắt để giải phóng mic
  const setMicrophoneEnabled = useCallback(
    async (enabled: boolean) => {
      isMicEnabledRef.current = enabled;
      setIsMicEnabled(enabled);

      if (!enabled) {
        setAudioLevel(0);
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }
        analyserRef.current = null;

        if (streamRef.current) {
          streamRef.current.getAudioTracks().forEach((track) => {
            try {
              track.stop();
              streamRef.current?.removeTrack(track);
            } catch {}
          });
        }
        if (streamRef.current && streamRef.current.getTracks().length === 0) {
          streamRef.current = null;
          setStream(null);
        } else if (streamRef.current) {
          setStream(new MediaStream(streamRef.current.getTracks()));
        }
      } else {
        try {
          const audioConstraints: boolean | MediaTrackConstraints = selectedAudioIdRef.current
            ? { deviceId: { exact: selectedAudioIdRef.current } }
            : true;

          const newAudioStream = await navigator.mediaDevices.getUserMedia({
            audio: audioConstraints,
          });

          const newTrack = newAudioStream.getAudioTracks()[0];
          if (newTrack) {
            if (!streamRef.current) {
              streamRef.current = new MediaStream();
            }
            streamRef.current.getAudioTracks().forEach((t) => {
              try {
                t.stop();
                streamRef.current?.removeTrack(t);
              } catch {}
            });
            streamRef.current.addTrack(newTrack);
            setStream(new MediaStream(streamRef.current.getTracks()));

            setupAudioAnalysis(streamRef.current);
          }
        } catch (err) {
          console.warn('Could not re-enable microphone:', err);
          isMicEnabledRef.current = false;
          setIsMicEnabled(false);
          setAudioLevel(0);
        }
      }
    },
    [setupAudioAnalysis],
  );

  const toggleMicrophone = useCallback(() => {
    setMicrophoneEnabled(!isMicEnabledRef.current);
  }, [setMicrophoneEnabled]);

  // 8. Device changes
  const changeAudioInput = useCallback(
    async (deviceId: string) => {
      selectedAudioIdRef.current = deviceId;
      setSelectedAudioId(deviceId);
      if (isMicEnabledRef.current) {
        try {
          const newAudioStream = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: { exact: deviceId } },
          });
          const newTrack = newAudioStream.getAudioTracks()[0];
          if (newTrack) {
            if (!streamRef.current) {
              streamRef.current = new MediaStream();
            }
            streamRef.current.getAudioTracks().forEach((t) => {
              try {
                t.stop();
                streamRef.current?.removeTrack(t);
              } catch {}
            });
            streamRef.current.addTrack(newTrack);
            setStream(new MediaStream(streamRef.current.getTracks()));
            setupAudioAnalysis(streamRef.current);
          }
        } catch (err) {
          console.warn('Could not switch audio input:', err);
        }
      }
    },
    [setupAudioAnalysis],
  );

  const changeVideoInput = useCallback(
    async (deviceId: string) => {
      selectedVideoIdRef.current = deviceId;
      setSelectedVideoId(deviceId);
      if (isCameraEnabledRef.current) {
        try {
          const newVideoStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } },
          });
          const newTrack = newVideoStream.getVideoTracks()[0];
          if (newTrack) {
            if (!streamRef.current) {
              streamRef.current = new MediaStream();
            }
            streamRef.current.getVideoTracks().forEach((t) => {
              try {
                t.stop();
                streamRef.current?.removeTrack(t);
              } catch {}
            });
            streamRef.current.addTrack(newTrack);
            setStream(new MediaStream(streamRef.current.getTracks()));
            if (videoRef.current) {
              videoRef.current.srcObject = streamRef.current;
              videoRef.current.play().catch(() => {});
            }
          }
        } catch (err) {
          console.warn('Could not switch video input:', err);
        }
      }
    },
    [],
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
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
