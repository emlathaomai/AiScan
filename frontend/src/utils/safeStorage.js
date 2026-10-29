/**
 * Safe LocalStorage Wrapper for Mobile Browsers.
 * Prevents DOMException: QuotaExceededError from crashing React to a blank white screen.
 */

export function safeSetItem(key, value) {
  try {
    const stringVal = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringVal);
    return true;
  } catch (err) {
    console.warn(`[SafeStorage] Quota exceeded while saving "${key}". Running cleanup...`, err);
    try {
      // 1. Evict older items or shrink list if it's an array
      if (Array.isArray(value)) {
        // Strip heavy thumbnails or reduce to 3 items
        const sanitized = value.slice(0, 3).map(item => {
          if (item && item.thumbnail && item.thumbnail.length > 50000) {
            return { ...item, thumbnail: '' };
          }
          if (item && item.image && item.image.length > 50000) {
            return { ...item, image: '' };
          }
          return item;
        });
        localStorage.setItem(key, JSON.stringify(sanitized));
        return true;
      }

      // 2. If single item fails, try clearing non-essential cache
      localStorage.removeItem('meatguard_scans_v1');
      const stringVal = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringVal);
      return true;
    } catch (fallbackErr) {
      console.error('[SafeStorage] Storage quota completely full on device:', fallbackErr);
      return false;
    }
  }
}

export function safeGetItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (err) {
    console.warn(`[SafeStorage] Error parsing stored value for "${key}":`, err);
    return defaultValue;
  }
}

export function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.warn(`[SafeStorage] Error removing "${key}":`, err);
    return false;
  }
}
