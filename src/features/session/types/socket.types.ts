export interface WhiteboardDrawPoint {
  x: number;
  y: number;
}

export interface WhiteboardDrawElement {
  id: string;
  tool: 'pencil' | 'eraser' | 'line' | 'rectangle' | 'circle';
  color: string;
  strokeWidth: number;
  points?: WhiteboardDrawPoint[];
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
}

export interface WhiteboardPayload {
  elements: WhiteboardDrawElement[];
  clear?: boolean;
}

export interface CodeEditorPayload {
  code: string;
  language: string;
  senderId?: string;
}

export interface ParticipantJoinedEvent {
  roomId: string;
  userId: string;
  role: string;
  displayName?: string;
  timestamp: number;
}

export interface ParticipantLeftEvent {
  roomId: string;
  userId: string;
  timestamp: number;
}

export interface ParticipantMutedEvent {
  participantId: string;
  userId: string;
  isMuted: boolean;
}

export interface ParticipantKickedEvent {
  participantId: string;
  userId: string;
  isKicked: boolean;
}

export interface HeartbeatAckEvent {
  tickId?: string;
  creditDeducted: number;
  newBalance?: number;
  success?: boolean;
  error?: string;
}
