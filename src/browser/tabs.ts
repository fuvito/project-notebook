import { browser } from 'wxt/browser';

export interface TabInfo {
  url: string;
  title: string;
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
