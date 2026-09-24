import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Mic,
  Video,
  Volume2,
  Settings,
  X,
  Check,
  Smile,
  ChevronDown,
} from 'lucide-react';
import { Modal } from '@/shared/components/ui';

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

  // Settings from Screenshot 2: "Cài đặt chung"
  const [pipMode, setPipMode] = useState<string>('ALWAYS'); // "Luôn tự động hiển thị"
  const [screenNotifications, setScreenNotifications] = useState(false); // "Thông báo trên màn hình"
  const [autoLeaveEmptyCall, setAutoLeaveEmptyCall] = useState(true); // "Rời khỏi cuộc gọi không có ai tham gia"

  // Settings for "Phản ứng"
  const [enableReactions, setEnableReactions] = useState(true);
  const [reactionSounds, setReactionSounds] = useState(true);

  // Video resolution
  const [sendResolution, setSendResolution] = useState('720p');

  const miniVideoRef = useRef<HTMLVideoElement | null>(null);

  // Attach preview stream to mini video element if available
  useEffect(() => {
    if (activeTab === 'VIDEO' && miniVideoRef.current && previewStream) {
      miniVideoRef.current.srcObject = previewStream;
      miniVideoRef.current.play().catch(() => {});
    }
  }, [activeTab, previewStream]);

  useEffect(() => {
    if (currentAudioDeviceId) setSelectedAudio(currentAudioDeviceId);
    if (currentVideoDeviceId) setSelectedVideo(currentVideoDeviceId);
  }, [currentAudioDeviceId, currentVideoDeviceId]);

  useEffect(() => {
    if (!isOpen) return;

    const loadDevices = async () => {
      try {
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

            {/* Tab 3: General (Active in user screenshot) */}
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 block">
                    Micrô
                  </label>

                  <div className="relative">
                    <select
                      value={selectedAudio}
                      onChange={(e) => handleAudioChange(e.target.value)}
                      className="w-full h-12 pl-4 pr-10 rounded-lg border border-[#747775]/50 hover:border-[#1F1F1F] focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] outline-none text-sm text-slate-800 bg-white appearance-none cursor-pointer"
                    >
                      {audioInputs.length > 0 ? (
                        audioInputs.map((device, idx) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Microphone ${idx + 1}`}
                          </option>
                        ))
                      ) : (
                        <option value="">Không tìm thấy Micrô</option>
                      )}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-4 pointer-events-none" />
                  </div>

                  {/* Sensitivity Wave Bar */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-slate-500">Độ nhạy mic:</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex items-center">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-75"
                        style={{ width: `${Math.max(4, audioLevel)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Speaker Section */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <label className="text-sm font-medium text-slate-800 block">
                    Loa
                  </label>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <select
                        value={selectedOutput}
                        onChange={(e) => setSelectedOutput(e.target.value)}
                        className="w-full h-12 pl-4 pr-10 rounded-lg border border-[#747775]/50 hover:border-[#1F1F1F] focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] outline-none text-sm text-slate-800 bg-white appearance-none cursor-pointer"
                      >
                        {audioOutputs.length > 0 ? (
                          audioOutputs.map((device, idx) => (
                            <option key={device.deviceId} value={device.deviceId}>
                              {device.label || `Loa ${idx + 1}`}
                            </option>
                          ))
                        ) : (
                          <option value="">Loa mặc định hệ thống</option>
                        )}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-4 pointer-events-none" />
                    </div>

                    <button
                      type="button"
                      onClick={testSpeaker}
                      disabled={isTestingSpeaker}
                      className={`h-12 px-5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer border ${
                        isTestingSpeaker
                          ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                          : 'bg-white hover:bg-slate-50 text-[#0b57d0] border-slate-300 hover:border-[#0b57d0]'
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 block">
                    Máy ảnh
                  </label>

                  <div className="relative">
                    <select
                      value={selectedVideo}
                      onChange={(e) => handleVideoChange(e.target.value)}
                      className="w-full h-12 pl-4 pr-10 rounded-lg border border-[#747775]/50 hover:border-[#1F1F1F] focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] outline-none text-sm text-slate-800 bg-white appearance-none cursor-pointer"
                    >
                      {videoInputs.length > 0 ? (
                        videoInputs.map((device, idx) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Camera ${idx + 1}`}
                          </option>
                        ))
                      ) : (
                        <option value="">Không tìm thấy Camera</option>
                      )}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-4 pointer-events-none" />
                  </div>
                </div>

                {/* Live Mini Preview Frame */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-slate-600">Xem trước hình ảnh</span>
                  <div className="w-[360px] max-w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm relative flex items-center justify-center">
                    {previewStream ? (
                      <video
                        ref={miniVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 text-xs gap-1.5">
                        <Video className="w-6 h-6 text-slate-500" />
                        <span>Chưa mở camera</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resolution option */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-sm font-medium text-slate-800 block">
                    Độ phân giải gửi (tối đa)
                  </label>
                  <div className="relative">
                    <select
                      value={sendResolution}
                      onChange={(e) => setSendResolution(e.target.value)}
                      className="w-full h-12 pl-4 pr-10 rounded-lg border border-[#747775]/50 hover:border-[#1F1F1F] focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] outline-none text-sm text-slate-800 bg-white appearance-none cursor-pointer"
                    >
                      <option value="720p">Độ nét cao (720p HD)</option>
                      <option value="360p">Độ nét chuẩn (360p)</option>
                      <option value="auto">Tự động điều chỉnh</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-4 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════ TAB 3: CÀI ĐẶT CHUNG (GENERAL) - EXACT SCREENSHOT 2 ══════════════════ */}
            {activeTab === 'GENERAL' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Section 1: Chế độ hình trong hình tự động */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-900">
                    Chế độ hình trong hình tự động
                  </h3>
                  <p className="text-xs text-slate-600">
                    Chọn thời điểm bạn muốn tự động hiển thị chế độ hình trong hình
                  </p>

                  <div className="relative mt-2">
                    <select
                      value={pipMode}
                      onChange={(e) => setPipMode(e.target.value)}
                      className="w-full h-12 pl-4 pr-10 rounded-lg border border-[#747775]/50 hover:border-[#1F1F1F] focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] outline-none text-sm text-slate-800 bg-white appearance-none cursor-pointer"
                    >
                      <option value="ALWAYS">Luôn tự động hiển thị</option>
                      <option value="TAB_CHANGE">Chỉ khi chuyển thẻ trình duyệt</option>
                      <option value="DISABLED">Không tự động hiển thị</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-4 pointer-events-none" />
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
