import React from 'react';
import { toast as hotToast } from 'react-hot-toast';
import type { Toast } from 'react-hot-toast';
import { CheckCircle2, XCircle, Info, Gift, Flame } from 'lucide-react';

// ─── Custom Toast Card Component ────────────────────────────────────────────

interface CustomToastProps {
  t: Toast;
  icon: React.ReactNode;
  accentColor: string;
  glowColor: string;
  title: string;
  message?: string;
}

const CustomToastCard: React.FC<CustomToastProps> = ({
  t,
  icon,
  accentColor,
  glowColor,
  title,
  message,
}) => {
  const hasMessage = Boolean(message && message.trim());

  return (
    <div
      style={{
        opacity: t.visible ? 1 : 0,
        transform: t.visible ? 'translateX(0) scale(1)' : 'translateX(-18px) scale(0.97)',
        transition: 'all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)',
        display: 'flex',
        alignItems: hasMessage ? 'flex-start' : 'center',
        gap: '12px',
        background: 'rgba(15, 23, 42, 0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: '18px',
        padding: hasMessage ? '13px 16px' : '10px 14px',
        minWidth: '280px',
        maxWidth: '380px',
        boxShadow: `0 8px 32px -8px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow accent line on left */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: hasMessage ? '14%' : '20%',
          bottom: hasMessage ? '14%' : '20%',
          width: '3px',
          borderRadius: '0 3px 3px 0',
          background: accentColor,
          boxShadow: `0 0 12px 2px ${glowColor}`,
        }}
      />

      {/* Icon */}
      <div
        style={{
          flexShrink: 0,
          width: hasMessage ? '36px' : '32px',
          height: hasMessage ? '36px' : '32px',
          borderRadius: hasMessage ? '12px' : '10px',
          background: `linear-gradient(135deg, ${glowColor}22, ${glowColor}11)`,
          border: `1px solid ${glowColor}33`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: '2px',
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            fontWeight: 700,
            color: '#F1F5F9',
            lineHeight: '1.35',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </p>
        {hasMessage && (
          <p
            style={{
              margin: '3px 0 0',
              fontSize: '11.5px',
              fontWeight: 500,
              color: '#94A3B8',
              lineHeight: '1.4',
            }}
          >
            {message}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => hotToast.dismiss(t.id)}
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#475569',
          padding: '2px',
          lineHeight: 1,
          fontSize: '14px',
          borderRadius: '6px',
          transition: 'color 0.15s',
          alignSelf: hasMessage ? 'flex-start' : 'center',
        }}
        onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#CBD5E1')}
        onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#475569')}
      >
        ✕
      </button>
    </div>
  );
};

// ─── Toast Helper API ────────────────────────────────────────────────────────

export const toast = {
  success: (title: string, message?: string) => {
    hotToast.custom(
      (t) => (
        <CustomToastCard
          t={t}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          accentColor="linear-gradient(180deg, #10B981, #059669)"
          glowColor="#10B981"
          title={title}
          message={message}
        />
      ),
      { duration: 4500, id: `success-${Date.now()}` },
    );
  },

  error: (title: string, message?: string) => {
    hotToast.custom(
      (t) => (
        <CustomToastCard
          t={t}
          icon={<XCircle className="w-5 h-5 text-red-400" />}
          accentColor="linear-gradient(180deg, #EF4444, #DC2626)"
          glowColor="#EF4444"
          title={title}
          message={message}
        />
      ),
      { duration: 5000, id: `error-${Date.now()}` },
    );
  },

  info: (title: string, message?: string) => {
    hotToast.custom(
      (t) => (
        <CustomToastCard
          t={t}
          icon={<Info className="w-5 h-5 text-blue-400" />}
          accentColor="linear-gradient(180deg, #3B82F6, #2563EB)"
          glowColor="#3B82F6"
          title={title}
          message={message}
        />
      ),
      { duration: 4000, id: `info-${Date.now()}` },
    );
  },

  reward: (title: string, message?: string) => {
    hotToast.custom(
      (t) => (
        <CustomToastCard
          t={t}
          icon={<Gift className="w-5 h-5 text-amber-400" />}
          accentColor="linear-gradient(180deg, #F59E0B, #D97706)"
          glowColor="#F59E0B"
          title={title}
          message={message}
        />
      ),
      { duration: 5500, id: `reward-${Date.now()}` },
    );
  },

  checkin: (title: string, message?: string) => {
    hotToast.custom(
      (t) => (
        <CustomToastCard
          t={t}
          icon={<Flame className="w-5 h-5 text-primary-400" />}
          accentColor="linear-gradient(180deg, #0B654D, #059669)"
          glowColor="#10B981"
          title={title}
          message={message}
        />
      ),
      { duration: 5000, id: `checkin-${Date.now()}` },
    );
  },
};
