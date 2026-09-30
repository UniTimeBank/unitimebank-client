import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Mic,
  Video,
  VideoOff,
  Volume2,
  Settings,
  X,
  Check,
  Smile,
  Loader2,
} from 'lucide-react';
import { Modal, Select, type SelectOption } from '@/shared/components/ui';

export type SettingsTab = 'AUDIO' | 'VIDEO' | 'GENERAL' | 'REACTIONS';

export interface DeviceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAudioDeviceId?: string;
  currentVideoDeviceId?: string;
  onSelectAudioDevice?: (deviceId: string) => void;
  onSelectVideoDevice?: (deviceId: string) => void;
  previewStream?: MediaStream | null;
  audioLevel?: number;
}

/** Google Meet / Material 3 Style Toggle Switch */
const MaterialSwitch: React.FC<{
  checked: boolean;
  onChange: (val: boolean) => void;
  id?: string;
}> = ({ checked, onChange, id }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-[#0b57d0]' : 'bg-[#e0e2ec] border border-[#747775]/40'
      }`}
    >
      <span
        className={`pointer-events-none flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
          checked ? 'translate-x-6 text-[#0b57d0]' : 'translate-x-1 text-[#747775]'
        }`}
      >
        {checked ? (
          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
        ) : (
          <X className="h-3 w-3 stroke-[2.5]" />
        )}
      </span>
    </button>
  );
};

export const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({
  isOpen,
  onClose,
  currentAudioDeviceId,
  currentVideoDeviceId,
  onSelectAudioDevice,
  onSelectVideoDevice,
  previewStream,
  audioLevel = 0,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('GENERAL');
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);

  const [selectedAudio, setSelectedAudio] = useState<string>(currentAudioDeviceId || '');
  const [selectedVideo, setSelectedVideo] = useState<string>(currentVideoDeviceId || '');
  const [selectedOutput, setSelectedOutput] = useState<string>('');
  const [isTestingSpeaker, setIsTestingSpeaker] = useState(false);

  // Settings for: "Cài đặt chung"
  const [pipMode, setPipMode] = useState<string>('ALWAYS'); // "Luôn tự động hiển thị"
  const [screenNotifications, setScreenNotifications] = useState(false); // "Thông báo trên màn hình"
  const [autoLeaveEmptyCall, setAutoLeaveEmptyCall] = useState(true); // "Rời khỏi cuộc gọi không có ai tham gia"

  // Settings for: "Phản ứng"
  const [enableReactions, setEnableReactions] = useState(true);
  const [reactionSounds, setReactionSounds] = useState(true);

  // Video resolution
  const [sendResolution, setSendResolution] = useState('720p');

  const miniVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoStreamRef = useRef<MediaStream | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Live mic analyser state
  const [internalAudioLevel, setInternalAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const localAudioStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (currentAudioDeviceId) setSelectedAudio(currentAudioDeviceId);
    if (currentVideoDeviceId) setSelectedVideo(currentVideoDeviceId);
  }, [currentAudioDeviceId, currentVideoDeviceId]);

  // 1. Enumerate devices when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const loadDevices = async () => {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) return;
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audios = devices.filter((d) => d.kind === 'audioinput');
        const videos = devices.filter((d) => d.kind === 'videoinput');
        const outputs = devices.filter((d) => d.kind === 'audiooutput');

        setAudioInputs(audios);
        setVideoInputs(videos);
        setAudioOutputs(outputs);

        if (audios.length > 0 && !selectedAudio) {
          setSelectedAudio(audios[0].deviceId);
        }
        if (videos.length > 0 && !selectedVideo) {
          setSelectedVideo(videos[0].deviceId);
        }
        if (outputs.length > 0 && !selectedOutput) {
          setSelectedOutput(outputs[0].deviceId);
        }
      } catch (err) {
        console.error('Error enumerating devices:', err);
      }
    };

    loadDevices();
  }, [isOpen, selectedAudio, selectedVideo, selectedOutput]);

  // 2. Manage Camera Preview: Full-width live mirror with fallback
  useEffect(() => {
    if (!isOpen || activeTab !== 'VIDEO') {
      if (localVideoStreamRef.current) {
        localVideoStreamRef.current.getTracks().forEach((t) => t.stop());
        localVideoStreamRef.current = null;
      }
      setVideoStream(null);
      return;
    }

    // Check if previewStream has an active video track
    const hasLiveVideoTrack =
      previewStream &&
      previewStream.getVideoTracks().some((t) => t.readyState === 'live' && t.enabled !== false);

    if (hasLiveVideoTrack) {
      if (localVideoStreamRef.current) {
        localVideoStreamRef.current.getTracks().forEach((t) => t.stop());
        localVideoStreamRef.current = null;
      }
      setVideoStream(previewStream);
      setIsCameraLoading(false);
      setCameraError(null);
      return;
    }

    // Otherwise, acquire local video stream for selected camera
    let isCancelled = false;

    const startCamera = async () => {
      try {
        setIsCameraLoading(true);
        setCameraError(null);

        if (localVideoStreamRef.current) {
          localVideoStreamRef.current.getTracks().forEach((t) => t.stop());
          localVideoStreamRef.current = null;
        }

        let stream: MediaStream;
        try {
          const constraints: MediaStreamConstraints = {
            video: selectedVideo
              ? { deviceId: { exact: selectedVideo }, width: { ideal: 1280 }, height: { ideal: 720 } }
              : { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          };
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (exactErr) {
          console.warn('Exact camera constraint failed, retrying without exact deviceId:', exactErr);
          stream = await navigator.mediaDevices.getUserMedia({
            video: selectedVideo ? { deviceId: selectedVideo } : true,
            audio: false,
          });
        }

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localVideoStreamRef.current = stream;
        setVideoStream(stream);
      } catch (err: any) {
        if (!isCancelled) {
          console.warn('Could not acquire local video preview:', err);
          setCameraError(
            'Không thể mở máy ảnh. Vui lòng kiểm tra quyền truy cập camera hoặc thiết bị đang được ứng dụng khác sử dụng.',
          );
        }
      } finally {
        if (!isCancelled) {
          setIsCameraLoading(false);
        }
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      if (localVideoStreamRef.current) {
        localVideoStreamRef.current.getTracks().forEach((t) => t.stop());
        localVideoStreamRef.current = null;
      }
      setVideoStream(null);
    };
  }, [isOpen, activeTab, selectedVideo, previewStream]);

  // Synchronize videoStream to HTML video element
  useEffect(() => {
    if (activeTab === 'VIDEO' && miniVideoRef.current && videoStream) {
      if (miniVideoRef.current.srcObject !== videoStream) {
        miniVideoRef.current.srcObject = videoStream;
      }
      miniVideoRef.current.play().catch((err) => {
        console.warn('Video preview play failed:', err);
      });
    }
  }, [videoStream, activeTab]);

  // 3. Manage Microphone Live Sensitivity Analyser
  useEffect(() => {
    if (!isOpen || activeTab !== 'AUDIO') {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      if (localAudioStreamRef.current) {
        localAudioStreamRef.current.getTracks().forEach((t) => t.stop());
        localAudioStreamRef.current = null;
      }
      setInternalAudioLevel(0);
      return;
    }

    let isCancelled = false;

    const setupMicAnalysis = async () => {
      try {
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }
        if (localAudioStreamRef.current) {
          localAudioStreamRef.current.getTracks().forEach((t) => t.stop());
          localAudioStreamRef.current = null;
        }

        let micStream: MediaStream | null = null;
        if (
          previewStream &&
          previewStream.getAudioTracks().some((t) => t.readyState === 'live')
        ) {
          micStream = previewStream;
        } else {
          const constraints: MediaStreamConstraints = {
            audio: selectedAudio ? { deviceId: { exact: selectedAudio } } : true,
            video: false,
          };
          micStream = await navigator.mediaDevices.getUserMedia(constraints);
          localAudioStreamRef.current = micStream;
        }

        if (isCancelled || !micStream) return;

        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.4;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(micStream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkVolume = () => {
          if (!analyserRef.current) {
            setInternalAudioLevel(0);
            return;
          }

          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          // Scale 0..100 with sensitivity multiplier
          const normalized = Math.min(100, Math.round((average / 128) * 100 * 1.8));
          setInternalAudioLevel(normalized);

          animFrameRef.current = requestAnimationFrame(checkVolume);
        };

        checkVolume();
      } catch (err) {
        console.warn('Could not setup mic analysis in DeviceSettingsModal:', err);
        setInternalAudioLevel(0);
      }
    };

    setupMicAnalysis();

    return () => {
      isCancelled = true;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      if (localAudioStreamRef.current) {
        localAudioStreamRef.current.getTracks().forEach((t) => t.stop());
        localAudioStreamRef.current = null;
      }
      setInternalAudioLevel(0);
    };
  }, [isOpen, activeTab, selectedAudio, previewStream]);

  const displayAudioLevel = audioLevel > 0 ? audioLevel : internalAudioLevel;

  const handleAudioChange = (deviceId: string) => {
    setSelectedAudio(deviceId);
    onSelectAudioDevice?.(deviceId);
  };

  const handleVideoChange = (deviceId: string) => {
    setSelectedVideo(deviceId);
    onSelectVideoDevice?.(deviceId);
  };

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

  // Options mapped for custom <Select />
  const audioInputOptions: SelectOption[] = useMemo(() => {
    if (audioInputs.length === 0) return [{ value: '', label: 'Không tìm thấy Micrô' }];
    return audioInputs.map((device, idx) => ({
      value: device.deviceId,
      label: device.label || `Microphone ${idx + 1}`,
    }));
  }, [audioInputs]);

  const audioOutputOptions: SelectOption[] = useMemo(() => {
    if (audioOutputs.length === 0) return [{ value: '', label: 'Loa mặc định hệ thống' }];
    return audioOutputs.map((device, idx) => ({
      value: device.deviceId,
      label: device.label || `Loa ${idx + 1}`,
    }));
  }, [audioOutputs]);

  const videoInputOptions: SelectOption[] = useMemo(() => {
    if (videoInputs.length === 0) return [{ value: '', label: 'Không tìm thấy Máy ảnh' }];
    return videoInputs.map((device, idx) => ({
      value: device.deviceId,
      label: device.label || `Camera ${idx + 1}`,
    }));
  }, [videoInputs]);

  const resolutionOptions: SelectOption[] = useMemo(
    () => [
      { value: '720p', label: 'Độ nét cao (720p HD)' },
      { value: '360p', label: 'Độ nét chuẩn (360p)' },
      { value: 'auto', label: 'Tự động điều chỉnh' },
    ],
    [],
  );

  const pipModeOptions: SelectOption[] = useMemo(
    () => [
      { value: 'ALWAYS', label: 'Luôn tự động hiển thị' },
      { value: 'TAB_CHANGE', label: 'Chỉ khi chuyển thẻ trình duyệt' },
      { value: 'DISABLED', label: 'Không tự động hiển thị' },
    ],
    [],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      showCloseButton={false}
      className="max-w-[840px] w-full p-0 overflow-hidden rounded-[28px] border border-slate-200/90 shadow-2xl bg-white"
    >
      <div className="flex flex-col h-[560px] select-none bg-white">
        {/* Header Bar */}
        <div className="px-7 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-normal text-slate-800 tracking-tight">Cài đặt</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Body (Google Meet Style) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Vertical Tabs */}
          <div className="w-56 sm:w-60 border-r border-slate-100 p-3.5 space-y-1.5 shrink-0 bg-white">
            {/* Tab 1: Audio */}
            <button
              type="button"
              onClick={() => setActiveTab('AUDIO')}
              className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'AUDIO'
                  ? 'bg-[#e8f0fe] text-[#1967d2]'
                  : 'text-[#444746] hover:bg-[#f1f3f4]'
              }`}
            >
              <Volume2 className="w-5 h-5 shrink-0" />
              <span>Âm thanh</span>
            </button>

            {/* Tab 2: Video */}
            <button
              type="button"
              onClick={() => setActiveTab('VIDEO')}
              className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'VIDEO'
                  ? 'bg-[#e8f0fe] text-[#1967d2]'
                  : 'text-[#444746] hover:bg-[#f1f3f4]'
              }`}
            >
              <Video className="w-5 h-5 shrink-0" />
              <span>Video</span>
            </button>

            {/* Tab 3: General */}
            <button
              type="button"
              onClick={() => setActiveTab('GENERAL')}
              className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'GENERAL'
                  ? 'bg-[#e8f0fe] text-[#1967d2]'
                  : 'text-[#444746] hover:bg-[#f1f3f4]'
              }`}
            >
              <Settings className="w-5 h-5 shrink-0" />
              <span>Cài đặt chung</span>
            </button>

            {/* Tab 4: Reactions */}
            <button
              type="button"
              onClick={() => setActiveTab('REACTIONS')}
              className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'REACTIONS'
                  ? 'bg-[#e8f0fe] text-[#1967d2]'
                  : 'text-[#444746] hover:bg-[#f1f3f4]'
              }`}
            >
              <Smile className="w-5 h-5 shrink-0" />
              <span>Phản ứng</span>
            </button>
          </div>

          {/* Right Column: Tab Content */}
          <div className="flex-1 px-8 sm:px-10 py-7 overflow-y-auto space-y-7">
            {/* ══════════════════ TAB 1: ÂM THANH (AUDIO) ══════════════════ */}
            {activeTab === 'AUDIO' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Microphone Section */}
                <div className="space-y-2 relative z-20">
                  <label className="text-sm font-medium text-slate-800 block">
                    Micrô
                  </label>

                  <Select
                    options={audioInputOptions}
                    value={selectedAudio}
                    onChange={handleAudioChange}
                    placeholder="Chọn Micrô..."
                    size="md"
                  />

                  {/* Sensitivity Wave Bar with Live Reactivity */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs text-slate-500 shrink-0">Độ nhạy mic:</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden flex items-center p-0.5 border border-slate-200/60">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-75"
                        style={{ width: `${Math.max(4, displayAudioLevel)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-slate-400 w-9 text-right shrink-0">
                      {displayAudioLevel}%
                    </span>
                  </div>
                </div>

                {/* Speaker Section */}
                <div className="space-y-2 pt-3 border-t border-slate-100 relative z-10">
                  <label className="text-sm font-medium text-slate-800 block">
                    Loa
                  </label>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Select
                        options={audioOutputOptions}
                        value={selectedOutput}
                        onChange={setSelectedOutput}
                        placeholder="Chọn Loa..."
                        size="md"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={testSpeaker}
                      disabled={isTestingSpeaker}
                      className={`h-11 px-5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer border ${
                        isTestingSpeaker
                          ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                          : 'bg-white hover:bg-slate-50 text-[#0b57d0] border-slate-300 hover:border-[#0b57d0] shadow-2xs'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{isTestingSpeaker ? 'Đang phát...' : 'Kiểm tra'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════ TAB 2: VIDEO ══════════════════ */}
            {activeTab === 'VIDEO' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* Camera Select */}
                <div className="space-y-2 relative z-20">
                  <label className="text-sm font-medium text-slate-800 block">
                    Máy ảnh
                  </label>

                  <Select
                    options={videoInputOptions}
                    value={selectedVideo}
                    onChange={handleVideoChange}
                    placeholder="Chọn Máy ảnh..."
                    size="md"
                  />
                </div>

                {/* Live Full-Width Preview Frame */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 block">
                    Xem trước hình ảnh
                  </label>
                  <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm relative flex items-center justify-center">
                    <video
                      ref={(el) => {
                        miniVideoRef.current = el;
                        if (el && videoStream && el.srcObject !== videoStream) {
                          el.srcObject = videoStream;
                          el.play().catch(() => {});
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />

                    {isCameraLoading && (
                      <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-slate-400 text-xs gap-2 z-10 backdrop-blur-xs">
                        <Loader2 className="w-7 h-7 text-primary-400 animate-spin" />
                        <span>Đang khởi động máy ảnh...</span>
                      </div>
                    )}

                    {cameraError && !isCameraLoading && (
                      <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-slate-400 text-xs gap-1.5 px-4 text-center z-10">
                        <VideoOff className="w-7 h-7 text-rose-400" />
                        <span className="text-rose-300 font-medium">{cameraError}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resolution option */}
                <div className="space-y-2 pt-2 border-t border-slate-100 relative z-10">
                  <label className="text-sm font-medium text-slate-800 block">
                    Độ phân giải gửi (tối đa)
                  </label>
                  <Select
                    options={resolutionOptions}
                    value={sendResolution}
                    onChange={setSendResolution}
                    size="md"
                  />
                </div>
              </div>
            )}

            {/* ══════════════════ TAB 3: CÀI ĐẶT CHUNG (GENERAL) ══════════════════ */}
            {activeTab === 'GENERAL' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Section 1: Chế độ hình trong hình tự động */}
                <div className="space-y-2 relative z-20">
                  <h3 className="text-sm font-medium text-slate-900">
                    Chế độ hình trong hình tự động
                  </h3>
                  <p className="text-xs text-slate-600">
                    Chọn thời điểm bạn muốn tự động hiển thị chế độ hình trong hình
                  </p>

                  <div className="mt-2">
                    <Select
                      options={pipModeOptions}
                      value={pipMode}
                      onChange={setPipMode}
                      size="md"
                    />
                  </div>
                </div>

                {/* Section 2: Thông báo trên màn hình */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="space-y-1 pr-2">
                    <h3 className="text-sm font-medium text-slate-900">
                      Thông báo trên màn hình
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Meet có thể gửi các thông báo trên màn hình để bạn có thể trả lời cuộc gọi video đến và làm những việc khác trong Meet
                    </p>
                  </div>
                  <MaterialSwitch
                    checked={screenNotifications}
                    onChange={setScreenNotifications}
                    id="screen-notifications-toggle"
                  />
                </div>

                {/* Section 3: Rời khỏi cuộc gọi không có ai tham gia */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="space-y-1 pr-2">
                    <h3 className="text-sm font-medium text-slate-900">
                      Rời khỏi cuộc gọi không có ai tham gia
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Xoá bạn khỏi cuộc gọi sau vài phút nếu không có ai khác tham gia
                    </p>
                  </div>
                  <MaterialSwitch
                    checked={autoLeaveEmptyCall}
                    onChange={setAutoLeaveEmptyCall}
                    id="auto-leave-toggle"
                  />
                </div>

                {/* Section 4: Thêm hoặc thay đổi số điện thoại */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="space-y-1 pr-2">
                    <h3 className="text-sm font-medium text-slate-900">
                      Thêm hoặc thay đổi số điện thoại
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Khi thêm số điện thoại vào Tài khoản Google, bạn có thể nhận thông báo buổi học và tăng cường bảo mật
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {}}
                    className="shrink-0 px-4 py-2 rounded-full border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
                  >
                    Thêm hoặc thay đổi
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════ TAB 4: PHẢN ỨNG (REACTIONS) ══════════════════ */}
            {activeTab === 'REACTIONS' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1 pr-2">
                    <h3 className="text-sm font-medium text-slate-900">
                      Hiển thị biểu tượng cảm xúc
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Cho phép bạn và các thành viên gửi biểu tượng cảm xúc (thả tim, vỗ tay, giơ tay) trong lúc học
                    </p>
                  </div>
                  <MaterialSwitch
                    checked={enableReactions}
                    onChange={setEnableReactions}
                  />
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="space-y-1 pr-2">
                    <h3 className="text-sm font-medium text-slate-900">
                      Âm thanh phản ứng
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Phát âm thanh nhẹ khi nhận được biểu tượng cảm xúc từ thành viên khác
                    </p>
                  </div>
                  <MaterialSwitch
                    checked={reactionSounds}
                    onChange={setReactionSounds}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeviceSettingsModal;
