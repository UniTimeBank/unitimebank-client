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
  onDisconnected?: () => void;
  onDataReceived?: (msg: InRoomChatMessage) => void;
}

export const useLiveKitRoom = ({
  wsUrl,
  token,
  autoConnect = true,
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
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
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

        // Enable default Mic and Camera
        try {
          await currentRoom.localParticipant.enableCameraAndMicrophone();
          setIsCameraEnabled(true);
          setIsMicEnabled(true);
        } catch (err: any) {
          console.warn('Could not enable default cam/mic:', err);
          toast.warning('Không thể truy cập Microphone hoặc Camera.', 'Vui lòng kiểm tra quyền trình duyệt');
          setIsCameraEnabled(false);
          setIsMicEnabled(false);
        }
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
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare,
    publishChatMessage,
    disconnect,
  };
};
