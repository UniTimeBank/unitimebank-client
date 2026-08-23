import React, { useState, useEffect, useMemo } from 'react';
import { Mic, Video, Volume2, Check } from 'lucide-react';
import { Modal, Button, Select, type SelectOption } from '@/shared/components/ui';

interface DeviceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    const loadDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audios = devices.filter((d) => d.kind === 'audioinput');
        const videos = devices.filter((d) => d.kind === 'videoinput');

        setAudioInputs(audios);
        setVideoInputs(videos);

        if (audios.length > 0 && !selectedAudio) {
          setSelectedAudio(audios[0].deviceId);
        }
        if (videos.length > 0 && !selectedVideo) {
          setSelectedVideo(videos[0].deviceId);
        }
      } catch (err) {
        console.error('Error enumerating devices:', err);
      }
    };

    loadDevices();
  }, [isOpen]);

  const audioOptions: SelectOption[] = useMemo(() => {
    if (audioInputs.length === 0) {
      return [{ value: '', label: 'Không tìm thấy thiết bị Microphone' }];
    }
    return audioInputs.map((device, idx) => ({
      value: device.deviceId,
      label: device.label || `Microphone ${idx + 1}`,
    }));
  }, [audioInputs]);

  const videoOptions: SelectOption[] = useMemo(() => {
    if (videoInputs.length === 0) {
      return [{ value: '', label: 'Không tìm thấy thiết bị Camera' }];
    }
    return videoInputs.map((device, idx) => ({
      value: device.deviceId,
      label: device.label || `Camera ${idx + 1}`,
    }));
  }, [videoInputs]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <span>Cài đặt Thiết bị Âm thanh & Video</span>
        </div>
      }
      description="Tuỳ chỉnh nguồn đầu vào Microphone và Camera cho phòng học."
      size="md"
    >
      <div className="space-y-4 py-2">
        {/* Microphone Dropdown */}
        <div>
          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-gray-700 uppercase tracking-wider">
            <Mic className="w-3.5 h-3.5 text-emerald-600" />
            <span>Microphone (Đầu vào)</span>
          </div>
          <Select
            options={audioOptions}
            value={selectedAudio}
            onChange={setSelectedAudio}
            placeholder="Chọn Microphone..."
          />
        </div>

        {/* Camera Dropdown */}
        <div>
          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-gray-700 uppercase tracking-wider">
            <Video className="w-3.5 h-3.5 text-primary-600" />
            <span>Camera (Máy ảnh)</span>
          </div>
          <Select
            options={videoOptions}
            value={selectedVideo}
            onChange={setSelectedVideo}
            placeholder="Chọn Camera..."
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <Button onClick={onClose} variant="primary" className="flex items-center gap-1.5">
          <Check className="w-4 h-4" />
          <span>Hoàn tất</span>
        </Button>
      </div>
    </Modal>
  );
};
export default DeviceSettingsModal;
