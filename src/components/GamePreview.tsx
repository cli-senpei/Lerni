import { useEffect, useState, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2, CheckCircle } from "lucide-react";

interface GamePreviewProps {
  code: string;
  componentName: string;
  gameName: string;
}

const GamePreview = ({ code, componentName, gameName }: GamePreviewProps) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!code || !code.trim()) {
      setError("No code provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Create a safe HTML document with the game code
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${gameName} Preview</title>
          <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 20px;
              color: #e2e8f0;
            }
            #root {
              width: 100%;
              max-width: 1200px;
              background: rgba(30, 41, 59, 0.8);
              border-radius: 12px;
              padding: 24px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            .error-container {
              background: rgba(239, 68, 68, 0.1);
              border: 2px solid rgba(239, 68, 68, 0.3);
              border-radius: 8px;
              padding: 16px;
              color: #fca5a5;
            }
            .error-title {
              font-weight: bold;
              margin-bottom: 8px;
              font-size: 16px;
            }
            .error-message {
              font-size: 14px;
              font-family: 'Courier New', monospace;
            }
            .loading {
              text-align: center;
              padding: 40px;
              color: #94a3b8;
            }
          </style>
        </head>
        <body>
          <div id="root">
            <div class="loading">Loading game preview...</div>
          </div>
          
          <script type="text/babel">
            const { useState, useEffect, useCallback, useRef } = React;
            
            // Error boundary component
            class ErrorBoundary extends React.Component {
              constructor(props) {
                super(props);
                this.state = { hasError: false, error: null };
              }

              static getDerivedStateFromError(error) {
                return { hasError: true, error };
              }

              componentDidCatch(error, errorInfo) {
                console.error('Game Error:', error, errorInfo);
              }

              render() {
                if (this.state.hasError) {
                  return (
                    <div className="error-container">
                      <div className="error-title">⚠️ Game Error</div>
                      <div className="error-message">
                        {this.state.error?.toString() || 'Unknown error occurred'}
                      </div>
                    </div>
                  );
                }
                return this.props.children;
              }
            }

            try {
              // Parse and execute the game code
              ${code}

              // Render the game component
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(
                <ErrorBoundary>
                  <${componentName} />
                </ErrorBoundary>
              );
              
              // Signal success to parent
              window.parent.postMessage({ type: 'game-loaded', success: true }, '*');
            } catch (error) {
              console.error('Failed to load game:', error);
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(
                <div className="error-container">
                  <div className="error-title">⚠️ Failed to Load Game</div>
                  <div className="error-message">{error.toString()}</div>
                </div>
              );
              
              // Signal error to parent
              window.parent.postMessage({ 
                type: 'game-error', 
                error: error.toString() 
              }, '*');
            }
          </script>
        </body>
        </html>
      `;

      // Update iframe content
      if (iframeRef.current) {
        const iframe = iframeRef.current;
        iframe.srcdoc = htmlContent;
        
        // Set up timeout for loading
        const timeout = setTimeout(() => {
          setError("Preview timeout - game may be too complex or has errors");
          setLoading(false);
        }, 10000);

        // Listen for messages from iframe
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'game-loaded') {
            clearTimeout(timeout);
            setSuccess(true);
            setLoading(false);
          } else if (event.data.type === 'game-error') {
            clearTimeout(timeout);
            setError(event.data.error);
            setLoading(false);
          }
        };

        window.addEventListener('message', handleMessage);
        
        return () => {
          clearTimeout(timeout);
          window.removeEventListener('message', handleMessage);
        };
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preview");
      setLoading(false);
    }
  }, [code, componentName, gameName]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 z-10 backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-3" />
            <p className="text-slate-400">Loading game preview...</p>
          </div>
        </div>
      )}

      {error && (
        <Alert className="absolute top-4 left-4 right-4 z-20 bg-red-500/10 border-red-500/50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-400 text-sm">
            <strong>Preview Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {success && !loading && (
        <div className="absolute top-4 right-4 z-20 bg-green-500/10 border border-green-500/50 rounded px-3 py-2 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-green-400 text-xs font-medium">Preview Active</span>
        </div>
      )}

      <iframe
        ref={iframeRef}
        className="w-full h-full min-h-[400px] border-0 rounded-lg bg-slate-950"
        title={`${gameName} Preview`}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default GamePreview;
