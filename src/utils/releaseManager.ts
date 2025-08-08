/**
 * Release Management Utilities
 * Handles APK downloads, version checking, and release information
 */

export interface ReleaseInfo {
  version: string;
  tagName: string;
  downloadUrl: string;
  fileSize: string;
  releaseDate: string;
  changelog: string[];
  isAvailable: boolean;
}

export interface APKInfo {
  version: string;
  buildNumber: number;
  fileSize: string;
  minAndroidVersion: string;
  targetAndroidVersion: string;
  permissions: string[];
  features: string[];
}

class ReleaseManager {
  private static instance: ReleaseManager;
  private readonly GITHUB_REPO = 'abira1/ohms-releases';
  private readonly GITHUB_API_BASE = 'https://api.github.com/repos';
  
  static getInstance(): ReleaseManager {
    if (!ReleaseManager.instance) {
      ReleaseManager.instance = new ReleaseManager();
    }
    return ReleaseManager.instance;
  }

  /**
   * Get the latest release information from GitHub
   */
  async getLatestRelease(): Promise<ReleaseInfo | null> {
    try {
      const response = await fetch(`${this.GITHUB_API_BASE}/${this.GITHUB_REPO}/releases/latest`);
      
      if (!response.ok) {
        console.warn('Latest release not found, using fallback');
        return this.getFallbackRelease();
      }

      const release = await response.json();
      const apkAsset = release.assets.find((asset: any) => 
        asset.name.endsWith('.apk') && asset.name.includes('OhmS')
      );

      if (!apkAsset) {
        console.warn('APK asset not found in release');
        return this.getFallbackRelease();
      }

      return {
        version: release.tag_name.replace('v', ''),
        tagName: release.tag_name,
        downloadUrl: apkAsset.browser_download_url,
        fileSize: this.formatFileSize(apkAsset.size),
        releaseDate: new Date(release.published_at).toLocaleDateString(),
        changelog: this.parseChangelog(release.body || ''),
        isAvailable: true
      };
    } catch (error) {
      console.error('Failed to fetch latest release:', error);
      return this.getFallbackRelease();
    }
  }

  /**
   * Get all releases from GitHub
   */
  async getAllReleases(): Promise<ReleaseInfo[]> {
    try {
      const response = await fetch(`${this.GITHUB_API_BASE}/${this.GITHUB_REPO}/releases`);
      
      if (!response.ok) {
        return [this.getFallbackRelease()];
      }

      const releases = await response.json();
      
      return releases.map((release: any) => {
        const apkAsset = release.assets.find((asset: any) => 
          asset.name.endsWith('.apk') && asset.name.includes('OhmS')
        );

        return {
          version: release.tag_name.replace('v', ''),
          tagName: release.tag_name,
          downloadUrl: apkAsset?.browser_download_url || '',
          fileSize: apkAsset ? this.formatFileSize(apkAsset.size) : 'Unknown',
          releaseDate: new Date(release.published_at).toLocaleDateString(),
          changelog: this.parseChangelog(release.body || ''),
          isAvailable: !!apkAsset
        };
      });
    } catch (error) {
      console.error('Failed to fetch releases:', error);
      return [this.getFallbackRelease()];
    }
  }

  /**
   * Get APK information
   */
  getAPKInfo(): APKInfo {
    return {
      version: '1.0.0',
      buildNumber: 1,
      fileSize: '~3.5 MB',
      minAndroidVersion: '7.0 (API 24)',
      targetAndroidVersion: '14 (API 34)',
      permissions: [
        'Internet access',
        'Network state',
        'Vibration (for haptic feedback)',
        'Wake lock (prevent sleep)',
        'Install shortcuts'
      ],
      features: [
        'Pull-to-refresh functionality',
        'Haptic feedback',
        'Offline support',
        'Push notifications',
        'Dark/Light theme',
        'Retro CRT effects'
      ]
    };
  }

  /**
   * Check if APK download is available
   */
  async isAPKAvailable(): Promise<boolean> {
    try {
      const release = await this.getLatestRelease();
      return release?.isAvailable || false;
    } catch {
      return false;
    }
  }

  /**
   * Get direct download URL for latest APK
   */
  async getDownloadUrl(): Promise<string> {
    try {
      const release = await this.getLatestRelease();
      return release?.downloadUrl || this.getFallbackDownloadUrl();
    } catch {
      return this.getFallbackDownloadUrl();
    }
  }

  /**
   * Track download analytics
   */
  trackDownload(version: string, source: 'direct' | 'page' | 'button' = 'direct'): void {
    try {
      // Analytics tracking (can be enhanced with Google Analytics, etc.)
      console.log(`APK Download: v${version} from ${source}`);
      
      // Store in localStorage for basic analytics
      const downloads = JSON.parse(localStorage.getItem('ohms_downloads') || '[]');
      downloads.push({
        version,
        source,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
      
      // Keep only last 100 downloads
      if (downloads.length > 100) {
        downloads.splice(0, downloads.length - 100);
      }
      
      localStorage.setItem('ohms_downloads', JSON.stringify(downloads));
    } catch (error) {
      console.warn('Failed to track download:', error);
    }
  }

  /**
   * Initiate APK download
   */
  async downloadAPK(source: 'direct' | 'page' | 'button' = 'direct'): Promise<void> {
    try {
      const release = await this.getLatestRelease();
      
      if (!release || !release.isAvailable) {
        throw new Error('APK not available');
      }

      // Track the download
      this.trackDownload(release.version, source);

      // Initiate download
      const link = document.createElement('a');
      link.href = release.downloadUrl;
      link.download = `OhmS-${release.version}.apk`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to releases page
      window.open(`https://github.com/${this.GITHUB_REPO}/releases`, '_blank');
    }
  }

  /**
   * Private helper methods
   */
  private getFallbackRelease(): ReleaseInfo {
    return {
      version: '1.0.0',
      tagName: 'v1.0.0',
      downloadUrl: this.getFallbackDownloadUrl(),
      fileSize: '~3.5 MB',
      releaseDate: new Date().toLocaleDateString(),
      changelog: [
        'Enhanced mobile experience with pull-to-refresh',
        'Haptic feedback integration',
        'Smart refresh logic',
        'Retro-themed visual indicators',
        'Performance optimizations',
        'Comprehensive device compatibility'
      ],
      isAvailable: false // Set to true once APK is uploaded
    };
  }

  private getFallbackDownloadUrl(): string {
    return `https://github.com/${this.GITHUB_REPO}/releases/download/v1.0.0/OhmS-44.apk`;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private parseChangelog(body: string): string[] {
    // Simple changelog parsing - can be enhanced
    const lines = body.split('\n').filter(line => line.trim());
    return lines.length > 0 ? lines : ['Bug fixes and improvements'];
  }
}

// Export singleton instance
export const releaseManager = ReleaseManager.getInstance();

// Convenience functions
export const getLatestRelease = () => releaseManager.getLatestRelease();
export const downloadAPK = (source?: 'direct' | 'page' | 'button') => releaseManager.downloadAPK(source);
export const isAPKAvailable = () => releaseManager.isAPKAvailable();
export const getAPKInfo = () => releaseManager.getAPKInfo();
