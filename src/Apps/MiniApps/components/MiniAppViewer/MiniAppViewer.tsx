/**
 * MiniAppViewer Component
 * Iframe container for displaying launched Mini Apps
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { getIframeSandbox, getIframeAllow } from '../../utils/helpers/launchHelpers';
import styles from './MiniAppViewer.module.css';

interface MiniAppViewerProps {
  windowId: string;
  url?: string;
  name?: string;
  splashImage?: string | null;
  splashColor?: string;
  userFid?: number | null;
  username?: string | null;
  displayName?: string | null;
  pfpUrl?: string | null;
}

export default function MiniAppViewer({
  windowId,
  url: propUrl,
  name: propName,
  splashImage: propSplashImage,
  splashColor: propSplashColor,
  userFid,
  username,
  displayName,
  pfpUrl,
}: MiniAppViewerProps) {
  // Get data from props (passed via initialState) or use defaults
  const url = propUrl || '';
  const name = propName || 'Mini App';
  const splashImage = propSplashImage;
  const splashColor = propSplashColor || '#DDDDDD';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('MiniAppViewer props:', {
      windowId,
      url: propUrl,
      name: propName,
      splashImage: propSplashImage,
      splashColor: propSplashColor,
    });
    console.log('MiniAppViewer computed values:', {
      url,
      name,
      splashImage,
      splashColor,
    });
  }, [windowId, propUrl, propName, propSplashImage, propSplashColor, url, name, splashImage, splashColor]);

  // Validate URL
  useEffect(() => {
    if (!url || url === '') {
      console.error('MiniAppViewer: No URL provided');
      setError('No Mini App URL provided');
      setLoading(false);
    } else {
      console.log('MiniAppViewer: Loading URL:', url);
    }
  }, [url]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      // Don't hide loading on iframe load - wait for SDK ready message
      console.log('Iframe loaded, waiting for Mini App SDK ready signal');
    };

    const handleError = () => {
      setLoading(false);
      setError('Failed to load Mini App');
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    // Fallback timeout: show iframe after 3 seconds even without ready message
    const fallbackTimeout = setTimeout(() => {
      console.log('Fallback: showing iframe after 3 seconds');
      setLoading(false);
    }, 3000);

    // Final timeout: force display after 30 seconds
    const finalTimeout = setTimeout(() => {
      console.warn('Mini App loading timeout - forcing display');
      setLoading(false);
    }, 30000);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
      clearTimeout(fallbackTimeout);
      clearTimeout(finalTimeout);
    };
  }, [url]);

  // Handle iframe messages for SDK capabilities
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !url) return;

    const handleMessage = (event: MessageEvent) => {
      // Verify origin matches the Mini App URL
      try {
        const miniAppOrigin = new URL(url).origin;
        if (event.origin !== miniAppOrigin) {
          return;
        }

        console.log('Mini App SDK message:', event.data);

        const { id, type, path } = event.data;

        // Handle GET requests
        if (type === 'GET') {
          if (path && path[0] === 'context') {
            // Send user context with authenticated user data
            const response = {
              id,
              type: 'RESPONSE',
              data: {
                user: userFid ? {
                  fid: userFid,
                  username: username || undefined,
                  displayName: displayName || undefined,
                  pfpUrl: pfpUrl || undefined,
                } : null,
                location: {
                  type: 'cast' as const,
                },
              },
            };
            iframe.contentWindow?.postMessage(response, event.origin);
            console.log('Sent context response:', response);
          }
        }

        // Handle APPLY requests (actions)
        if (type === 'APPLY') {
          if (path && path[0] === 'ready') {
            // Mini App is ready - hide loading screen
            console.log('Mini App ready - hiding loading screen');
            setLoading(false);
            setError(null);
          }
        }

        // Handle other SDK messages
        // TODO: Implement additional handlers:
        // - actions.openUrl
        // - actions.close
        // - eip6963RequestProvider (wallet provider injection)
      } catch (err) {
        console.error('Error handling Mini App message:', err);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [url, userFid, username, displayName, pfpUrl]);

  return (
    <div className={styles.viewer}>
      {/* Loading/Splash Screen */}
      {loading && (
        <div
          className={styles.splash}
          style={{ backgroundColor: splashColor }}
        >
          {splashImage ? (
            <img
              src={splashImage}
              alt={name}
              className={styles.splashImage}
            />
          ) : (
            <div className={styles.splashPlaceholder}>
              <div className={styles.loadingIcon}>⏳</div>
              <p className={styles.loadingText}>Loading {name}...</p>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className={styles.error}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3 className={styles.errorTitle}>Failed to Load Mini App</h3>
          <p className={styles.errorMessage}>{error}</p>
          <p className={styles.errorHint}>
            The Mini App may be unavailable or there may be a connection issue.
          </p>
        </div>
      )}

      {/* Iframe Container */}
      {url && (
        <iframe
          ref={iframeRef}
          src={url}
          className={styles.iframe}
          sandbox={getIframeSandbox()}
          allow={getIframeAllow()}
          title={name}
          style={{ display: loading || error ? 'none' : 'block' }}
        />
      )}
    </div>
  );
}

