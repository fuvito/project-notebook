import { browser } from 'wxt/browser';

// Opens the popup page as a large centered window at 80% of screen size.
export async function openFullscreenWindow(): Promise<void> {
  const w = Math.round(screen.width * 0.8);
  const h = Math.round(screen.height * 0.8);
  const left = Math.round((screen.width - w) / 2);
  const top = Math.round((screen.height - h) / 2);

  // Derive the URL from the current page so it works in both dev and prod.
  const base = window.location.href.split('?')[0];

  await browser.windows.create({
    url: `${base}?mode=fullscreen`,
    type: 'popup',
    width: w,
    height: h,
    left,
    top,
    focused: true,
  });

  // Close the popup so only one window is open at a time.
  window.close();
}

export function closeCurrentWindow(): void {
  window.close();
}

export function isFullscreenMode(): boolean {
  return new URLSearchParams(window.location.search).get('mode') === 'fullscreen';
}
