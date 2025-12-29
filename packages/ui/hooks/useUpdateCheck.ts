import { useState, useEffect } from 'react';

declare const __APP_VERSION__: string;

interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  releaseUrl: string;
}

const GITHUB_API = 'https://api.github.com/repos/backnotprop/plannotator/releases/latest';

function compareVersions(current: string, latest: string): boolean {
  const cleanVersion = (v: string) => v.replace(/^v/, '');
  const currentParts = cleanVersion(current).split('.').map(Number);
  const latestParts = cleanVersion(latest).split('.').map(Number);

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const curr = currentParts[i] || 0;
    const lat = latestParts[i] || 0;
    if (lat > curr) return true;
    if (lat < curr) return false;
  }
  return false;
}

export function useUpdateCheck(): UpdateInfo | null {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const currentVersion = typeof __APP_VERSION__ !== 'undefined'
          ? __APP_VERSION__
          : '0.0.0';

        const response = await fetch(GITHUB_API);
        if (!response.ok) return;

        const release = await response.json();
        const latestVersion = release.tag_name;

        const updateAvailable = compareVersions(currentVersion, latestVersion);

        setUpdateInfo({
          currentVersion,
          latestVersion,
          updateAvailable,
          releaseUrl: release.html_url,
        });
      } catch (e) {
        // Silently fail - update check is not critical
        console.debug('Update check failed:', e);
      }
    };

    checkForUpdates();
  }, []);

  return updateInfo;
}
