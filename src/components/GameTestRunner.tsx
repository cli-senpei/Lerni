import { Suspense, lazy, ComponentType } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2, PlayCircle } from "lucide-react";

// Dynamically import all game components
const gameComponents: Record<string, ComponentType<any>> = {
  PhonicsPopGame: lazy(() => import("@/components/dashboard/PhonicsPopGame")),
  LetterMatchGame: lazy(() => import("@/components/dashboard/LetterMatchGame")),
  WordSortGame: lazy(() => import("@/components/dashboard/WordSortGame")),
  RhymeGameMode: lazy(() => import("@/components/dashboard/RhymeGameMode")),
  ReadingGame: lazy(() => import("@/components/dashboard/ReadingGame")),
  BaselineGame: lazy(() => import("@/components/dashboard/BaselineGame")),
  PhaserGame: lazy(() => import("@/components/dashboard/PhaserGame")),
};

interface GameTestRunnerProps {
  componentName: string;
  gameName: string;
}

const GameTestRunner = ({ componentName, gameName }: GameTestRunnerProps) => {
  const GameComponent = gameComponents[componentName];

  if (!GameComponent) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px] p-8">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-red-400 mb-2">Game Component Not Found</h3>
            <p className="text-sm text-slate-400">
              Component <span className="font-mono text-red-400">{componentName}</span> is not available
            </p>
          </div>
          <Alert className="bg-red-500/10 border-red-500/50 text-left">
            <AlertDescription className="text-xs text-slate-300">
              <strong>Available components:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {Object.keys(gameComponents).map((name) => (
                  <li key={name} className="font-mono text-xs">{name}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full min-h-[500px] bg-gradient-to-br from-slate-900 via-slate-950 to-black p-6 rounded-lg">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
              <div>
                <p className="text-slate-300 font-semibold">Loading {gameName}...</p>
                <p className="text-xs text-slate-500 mt-1">Initializing game component</p>
              </div>
            </div>
          </div>
        }
      >
        <div className="relative">
          {/* Live Game Indicator */}
          <div className="absolute top-0 right-0 z-10 bg-green-500/20 border border-green-500/50 rounded-full px-3 py-1 flex items-center gap-2 animate-pulse">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-ping"></span>
            <span className="text-green-400 text-xs font-bold">LIVE</span>
          </div>

          {/* Game Component */}
          <div className="game-container">
            <GameComponent />
          </div>
        </div>
      </Suspense>
    </div>
  );
};

export default GameTestRunner;
