import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Room,
  RoomEvent,
  Track,
  RemoteParticipant,
  LocalParticipant,
  RemoteTrackPublication,
  RemoteTrack,
  ConnectionState,
} from 'livekit-client';
import { toast } from '@/shared/utils';
import type { InRoomChatMessage } from '../types';

export interface UseLiveKitRoomProps {
  wsUrl?: string;
  token?: string;
  autoConnect?: boolean;
  initialMicEnabled?: boolean;
  initialCameraEnabled?: boolean;
  preferredAudioDeviceId?: string;
  preferredVideoDeviceId?: string;
  onDisconnected?: () => void;
  onDataReceived?: (msg: InRoomChatMessage) => void;
}

export const useLiveKitRoom = ({
  wsUrl,
  token,
  autoConnect = true,
  initialMicEnabled = true,
  initialCameraEnabled = true,
  preferredAudioDeviceId,
  preferredVideoDeviceId,
  onDisconnected,
  onDataReceived,
}: UseLiveKitRoomProps) => {
  const roomRef = useRef<Room | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.Disconnected,
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const onDataReceivedRef = useRef(onDataReceived);
  useEffect(() => {
    onDataReceivedRef.current = onDataReceived;
  }, [onDataReceived]);

  // Local Media States
  const [isMicEnabled, setIsMicEnabled] = useState(initialMicEnabled);
  const [isCameraEnabled, setIsCameraEnabled] = useState(initialCameraEnabled);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Participants & Tracks
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
  const [activeSpeakers, setActiveSpeakers] = useState<string[]>([]);
  const [screenShareTrack, setScreenShareTrack] = useState<{
    participantIdentity: string;
    track: Track;
  } | null>(null);

  // Initialize Room & Event Handlers
  useEffect(() => {
    if (!wsUrl || !token || !autoConnect) return;

    let isMounted = true;
    const currentRoom = new Room({
      adaptiveStream: true,
      dynacast: true,
      videoCaptureDefaults: {
        resolution: { width: 1280, height: 720, frameRate: 30 },
      },
    });

    roomRef.current = currentRoom;
    setRoom(currentRoom);
    setIsConnecting(true);

    const updateParticipants = () => {
      if (!isMounted) return;
      setRemoteParticipants(Array.from(currentRoom.remoteParticipants.values()));
      setLocalParticipant(currentRoom.localParticipant);
    };

    // Setup Listeners
    currentRoom
      .on(RoomEvent.ConnectionStateChanged, (state) => {
        if (!isMounted) return;
        setConnectionState(state);
        setIsConnected(state === ConnectionState.Connected);
        setIsConnecting(state === ConnectionState.Connecting);
      })
      .on(RoomEvent.Connected, async () => {
        if (!isMounted) return;
        setIsConnected(true);
        setIsConnecting(false);
        setLocalParticipant(currentRoom.localParticipant);
        updateParticipants();

        // Switch preferred devices if provided
        if (preferredAudioDeviceId) {
          try {
            await currentRoom.switchActiveDevice('audioinput', preferredAudioDeviceId);
          } catch (err) {
            console.warn('Could not switch to preferred audio device:', err);
          }
        }
        if (preferredVideoDeviceId) {
          try {
            await currentRoom.switchActiveDevice('videoinput', preferredVideoDeviceId);
          } catch (err) {
            console.warn('Could not switch to preferred video device:', err);
          }
        }

        // Enable / disable camera according to initial user choice
        if (initialCameraEnabled) {
          try {
            await currentRoom.localParticipant.setCameraEnabled(true);
            setIsCameraEnabled(true);
          } catch (err: any) {
            console.warn('Could not enable initial camera:', err);
            setIsCameraEnabled(false);
          }
        } else {
          try {
            await currentRoom.localParticipant.setCameraEnabled(false);
            setIsCameraEnabled(false);
          } catch (err: any) {
            console.warn('Could not disable camera:', err);
          }
        }

        // Enable / disable microphone according to initial user choice
        if (initialMicEnabled) {
          try {
            await currentRoom.localParticipant.setMicrophoneEnabled(true);
            setIsMicEnabled(true);
          } catch (err: any) {
            console.warn('Could not enable initial microphone:', err);
            setIsMicEnabled(false);
          }
        } else {
          try {
            await currentRoom.localParticipant.setMicrophoneEnabled(false);
            setIsMicEnabled(false);
          } catch (err: any) {
            console.warn('Could not disable microphone:', err);
          }
        }

        updateParticipants();
      })
      .on(RoomEvent.Disconnected, () => {
        if (!isMounted) return;
        setIsConnected(false);
        setIsConnecting(false);
        setScreenShareTrack(null);
        if (onDisconnected) onDisconnected();
      })
      .on(RoomEvent.ParticipantConnected, (participant) => {
        toast.info(`${participant.name || 'Người tham gia'} đã vào phòng.`);
        updateParticipants();
      })
      .on(RoomEvent.ParticipantDisconnected, (participant) => {
        toast.info(`${participant.name || 'Người tham gia'} đã rời phòng.`);
        updateParticipants();
      })
      .on(RoomEvent.TrackMuted, () => {
        if (!isMounted) return;
        updateParticipants();
      })
      .on(RoomEvent.TrackUnmuted, () => {
        if (!isMounted) return;
        updateParticipants();
      })
      .on(
        RoomEvent.TrackSubscribed,
        (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
          updateParticipants();
          if (track.source === Track.Source.ScreenShare) {
            setScreenShareTrack({
              participantIdentity: participant.identity,
              track,
            });
          }
        },
      )
      .on(
        RoomEvent.TrackUnsubscribed,
        (track: RemoteTrack, _pub: RemoteTrackPublication, participant: RemoteParticipant) => {
          updateParticipants();
          if (track.source === Track.Source.ScreenShare) {
            setScreenShareTrack((prev) =>
              prev?.participantIdentity === participant.identity ? null : prev,
            );
          }
        },
      )
      .on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        if (!isMounted) return;
        setActiveSpeakers(speakers.map((s) => s.identity));
      })
      .on(RoomEvent.LocalTrackPublished, (pub) => {
        if (!isMounted) return;
        updateParticipants();
        if (pub.source === Track.Source.Camera) {
          setIsCameraEnabled(true);
        }
        if (pub.source === Track.Source.Microphone) {
          setIsMicEnabled(true);
        }
        if (pub.source === Track.Source.ScreenShare && pub.track) {
          setIsScreenSharing(true);
          setScreenShareTrack({
            participantIdentity: currentRoom.localParticipant.identity,
            track: pub.track,
          });
        }
      })
      .on(RoomEvent.LocalTrackUnpublished, (pub) => {
        if (!isMounted) return;
        updateParticipants();
        if (pub.source === Track.Source.Camera) {
          setIsCameraEnabled(false);
        }
        if (pub.source === Track.Source.Microphone) {
          setIsMicEnabled(false);
        }
        if (pub.source === Track.Source.ScreenShare) {
          setIsScreenSharing(false);
          setScreenShareTrack((prev) =>
            prev?.participantIdentity === currentRoom.localParticipant.identity ? null : prev,
          );
        }
      })
      .on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant) => {
        try {
          const text = new TextDecoder().decode(payload);
          const parsed = JSON.parse(text);
          if (parsed && parsed.type === 'CHAT_MESSAGE' && parsed.payload) {
            onDataReceivedRef.current?.(parsed.payload);
          }
        } catch (err) {
          console.warn('Error handling RoomEvent.DataReceived:', err);
        }
      });

    // Connect
    currentRoom
      .connect(wsUrl, token)
      .catch((err) => {
        console.error('Failed to connect to LiveKit room:', err);
        if (isMounted) {
          setIsConnecting(false);
          setIsConnected(false);
          toast.error('Kết nối phòng học thất bại. Vui lòng thử lại!');
        }
      });

    return () => {
      isMounted = false;
      currentRoom.disconnect();
      roomRef.current = null;
    };
  }, [wsUrl, token, autoConnect]);

  // Publish in-room Chat Message via direct WebRTC reliable data channel
  const publishChatMessage = useCallback(async (msg: InRoomChatMessage) => {
    if (!roomRef.current || !roomRef.current.localParticipant) return;
    try {
      const data = new TextEncoder().encode(
        JSON.stringify({
          type: 'CHAT_MESSAGE',
          payload: msg,
        }),
      );
      await roomRef.current.localParticipant.publishData(data, { reliable: true });
    } catch (err) {
      console.warn('LiveKit publishData failed:', err);
    }
  }, []);

  // Set Microphone Enabled state directly
  const setMicrophoneEnabled = useCallback(async (enabled: boolean) => {
    if (!roomRef.current || !roomRef.current.localParticipant) return;
    try {
      await roomRef.current.localParticipant.setMicrophoneEnabled(enabled);
      setIsMicEnabled(enabled);
    } catch (err) {
      console.error('Failed to set mic enabled:', err);
    }
  }, []);

  // Set Camera Enabled state directly
  const setCameraEnabled = useCallback(async (enabled: boolean) => {
    if (!roomRef.current || !roomRef.current.localParticipant) return;
    try {
      await roomRef.current.localParticipant.setCameraEnabled(enabled);
      setIsCameraEnabled(enabled);
    } catch (err) {
      console.error('Failed to set camera enabled:', err);
    }
  }, []);

  // Toggle Microphone
  const toggleMicrophone = useCallback(async () => {
    if (!roomRef.current) return;
    try {
      const nextState = !isMicEnabled;
      await roomRef.current.localParticipant.setMicrophoneEnabled(nextState);
      setIsMicEnabled(nextState);
      if (nextState) {
        toast.success('Đã bật Micro');
      } else {
        toast.info('Đã tắt Micro');
      }
    } catch (err) {
      console.error('Failed to toggle mic:', err);
      toast.error('Lỗi khi thao tác với Micro.');
    }
  }, [isMicEnabled]);

  // Toggle Camera
  const toggleCamera = useCallback(async () => {
    if (!roomRef.current) return;
    try {
      const nextState = !isCameraEnabled;
      await roomRef.current.localParticipant.setCameraEnabled(nextState);
      setIsCameraEnabled(nextState);
      if (nextState) {
        toast.success('Đã bật Camera');
      } else {
        toast.info('Đã tắt Camera');
      }
    } catch (err) {
      console.error('Failed to toggle camera:', err);
      toast.error('Lỗi khi thao tác với Camera.');
    }
  }, [isCameraEnabled]);

  // Toggle Screen Share
  const toggleScreenShare = useCallback(async () => {
    if (!roomRef.current) return;
    try {
      const nextState = !isScreenSharing;
      await roomRef.current.localParticipant.setScreenShareEnabled(nextState);
      setIsScreenSharing(nextState);
      if (!nextState) {
        setScreenShareTrack(null);
      }
    } catch (err) {
      console.error('Failed to toggle screen share:', err);
      setIsScreenSharing(false);
    }
  }, [isScreenSharing]);

  // Disconnect & Leave
  const disconnect = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      setRoom(null);
      setIsConnected(false);
    }
  }, []);

  // Switch Audio Input Device
  const switchAudioDevice = useCallback(async (deviceId: string) => {
    if (roomRef.current) {
      try {
        await roomRef.current.switchActiveDevice('audioinput', deviceId);
      } catch (err) {
        console.warn('LiveKit switchActiveDevice audioinput failed:', err);
      }
    }
  }, []);

  // Switch Video Input Device
  const switchVideoDevice = useCallback(async (deviceId: string) => {
    if (roomRef.current) {
      try {
        await roomRef.current.switchActiveDevice('videoinput', deviceId);
      } catch (err) {
        console.warn('LiveKit switchActiveDevice videoinput failed:', err);
      }
    }
  }, []);

  return {
    room,
    connectionState,
    isConnecting,
    isConnected,
    localParticipant,
    remoteParticipants,
    activeSpeakers,
    screenShareTrack,
    isMicEnabled,
    isCameraEnabled,
    isScreenSharing,
    setMicrophoneEnabled,
    setCameraEnabled,
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare,
    switchAudioDevice,
    switchVideoDevice,
    publishChatMessage,
    disconnect,
  };
};

