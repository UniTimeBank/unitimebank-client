export const formatRelativeTime = (dateStr?: string | Date | null): string => {
  if (!dateStr) return '';
  try {
    let d: Date;
    if (dateStr instanceof Date) {
      d = dateStr;
    } else {
      const str = String(dateStr).trim();
      // If string does not have timezone info (Z or +/- offset), treat as UTC timestamp from server
      if (!str.endsWith('Z') && !str.includes('+') && !/-\d{2}:\d{2}$/.test(str)) {
        d = new Date(str.replace(' ', 'T') + 'Z');
      } else {
        d = new Date(str);
      }
    }

    const diffMs = Date.now() - d.getTime();
    const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(
      2,
      '0',
    )}/${d.getFullYear()}`;
  } catch {
    return '';
  }
};
