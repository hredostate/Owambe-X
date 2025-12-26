import { Badge } from './types';

const BASE_URL = '/badges/owambe/';

export const getBadgeUrl = (badge: Badge, size: 512 | 1080) => {
  const path = size === 1080 ? badge.file_1080 : badge.file_512;
  return `${BASE_URL}${path}`;
};

const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
};

const copyCaption = async (caption: string) => {
  try {
    await navigator.clipboard.writeText(caption);
  } catch {
    // ignore
  }
};

export const shareBadge = async (badge: Badge, caption: string): Promise<{ ok: boolean; reason?: string }> => {
  const url = getBadgeUrl(badge, 1080);
  const filename = `${badge.id}.png`;

  if (navigator.share && navigator.canShare) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: blob.type });
      const shareData = { files: [file], text: caption };

      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return { ok: true };
      }
    } catch {
      // fall through
    }
  }

  downloadFile(url, filename);
  await copyCaption(caption);
  return { ok: false, reason: 'fallback' };
};
