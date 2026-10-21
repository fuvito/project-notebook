import { browser } from 'wxt/browser';

export interface TabInfo {
  url: string;
  title: string;
}

// Opens a URL as a background tab so the popup keeps focus and stays open.
// Falls back to window.open in non-extension contexts (e.g. vite serve).
export function openUrl(url: string): void {
  browser.tabs.create({ url, active: false }).catch(() => {
    window.open(url, '_blank', 'noopener,noreferrer');
  });
}

// Returns the active tab's URL and title, or null if the tab is a
// restricted page (chrome://, about:, etc.) or has no URL/title.
export async function getActiveTab(): Promise<TabInfo | null> {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab?.url || !tab.title) return null;
  try {
    const { protocol } = new URL(tab.url);
    if (protocol !== 'http:' && protocol !== 'https:') return null;
  } catch {
    return null;
  }
  return { url: tab.url, title: tab.title };
}
