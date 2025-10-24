import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Save, X, FileCode, Folder, ChevronRight, ChevronDown, Search, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface CodeEditorWithSidebarProps {
  code: string;
  gameName: string;
  componentName: string;
  onSave: (code: string) => void;
  onClose: () => void;
}

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  content?: string;
}

const CodeEditorWithSidebar = ({ code, gameName, componentName, onSave, onClose }: CodeEditorWithSidebarProps) => {
  const [editorCode, setEditorCode] = useState(code || generateDefaultCode(gameName, componentName));
  const [showWarning1, setShowWarning1] = useState(false);
  const [showWarning2, setShowWarning2] = useState(false);
  const [showFinalWarning, setShowFinalWarning] = useState(false);
  const [lineCount, setLineCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string>("main");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['components']));

  const fileStructure: FileNode[] = [
    {
      name: "components",
      type: "folder",
      path: "components",
      children: [
        { name: `${componentName}.tsx`, type: "file", path: `components/${componentName}.tsx`, content: editorCode },
        { name: "types.ts", type: "file", path: "components/types.ts", content: generateTypesFile() },
        { name: "utils.ts", type: "file", path: "components/utils.ts", content: generateUtilsFile() },
      ]
    },
    {
      name: "styles",
      type: "folder",
      path: "styles",
      children: [
        { name: "game.css", type: "file", path: "styles/game.css", content: generateStylesFile() },
      ]
    },
  ];

  const [fileContents, setFileContents] = useState<Record<string, string>>({
    "main": editorCode,
    [`components/${componentName}.tsx`]: editorCode,
    "components/types.ts": generateTypesFile(),
    "components/utils.ts": generateUtilsFile(),
    "styles/game.css": generateStylesFile(),
  });

  useEffect(() => {
    setLineCount(editorCode.split('\n').length);
  }, [editorCode]);

  const handleSaveClick = () => {
    setShowWarning1(true);
  };

  const handleWarning1Confirm = () => {
    setShowWarning1(false);
    setShowWarning2(true);
  };

  const handleWarning2Confirm = () => {
    setShowWarning2(false);
    setShowFinalWarning(true);
  };

  const handleFinalConfirm = () => {
    setShowFinalWarning(false);
    onSave(fileContents[`components/${componentName}.tsx`] || editorCode);
  };

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || "";
    setEditorCode(newCode);
    setFileContents(prev => ({
      ...prev,
      [selectedFile]: newCode,
      [`components/${componentName}.tsx`]: selectedFile === "main" || selectedFile === `components/${componentName}.tsx` ? newCode : prev[`components/${componentName}.tsx`],
    }));
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleFileSelect = (path: string) => {
    setSelectedFile(path);
    setEditorCode(fileContents[path] || "");
  };

  const renderFileTree = (nodes: FileNode[], depth: number = 0) => {
    return nodes.map((node) => {
      if (node.type === 'folder') {
        const isExpanded = expandedFolders.has(node.path);
        return (
          <div key={node.path}>
            <button
              onClick={() => toggleFolder(node.path)}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800 text-slate-300 text-sm"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              <Folder className="h-4 w-4 text-blue-400" />
              <span>{node.name}</span>
            </button>
            {isExpanded && node.children && (
              <div>{renderFileTree(node.children, depth + 1)}</div>
            )}
          </div>
        );
      } else {
        return (
          <button
            key={node.path}
            onClick={() => handleFileSelect(node.path)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800 text-sm ${
              selectedFile === node.path ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
            style={{ paddingLeft: `${depth * 12 + 24}px` }}
          >
            <FileCode className="h-4 w-4" />
            <span>{node.name}</span>
          </button>
        );
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-100">Code Editor</h2>
          <span className="text-sm text-slate-400">{gameName}</span>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Lines: {lineCount}</span>
            <span>Chars: {editorCode.length}</span>
            <span>UTF-8</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSaveClick} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={onClose} variant="outline" className="bg-slate-800 border-slate-700 text-slate-300">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
          <Tabs defaultValue="explorer" className="flex-1 flex flex-col">
            <TabsList className="w-full bg-slate-800 rounded-none border-b border-slate-700">
              <TabsTrigger value="explorer" className="flex-1">Explorer</TabsTrigger>
              <TabsTrigger value="search" className="flex-1">Search</TabsTrigger>
            </TabsList>
            
            <TabsContent value="explorer" className="flex-1 overflow-y-auto mt-0 p-2">
              <div className="mb-2">
                <p className="text-xs text-slate-500 uppercase font-semibold px-2 py-1">Project Files</p>
              </div>
              {renderFileTree(fileStructure)}
            </TabsContent>

            <TabsContent value="search" className="flex-1 overflow-y-auto mt-0 p-4">
              <div className="space-y-2">
                <Input
                  placeholder="Search in files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-slate-200"
                />
                <p className="text-xs text-slate-500">Enter search term to find in all files</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
          {/* File Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 border-b border-slate-700 px-2 py-1">
            <button
              onClick={() => handleFileSelect("main")}
              className={`px-3 py-1.5 text-sm rounded-t ${
                selectedFile === "main" ? 'bg-[#1e1e1e] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {componentName}.tsx
            </button>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="typescript"
              theme="vs-dark"
              value={editorCode}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: "on",
                lineNumbersMinChars: 4,
                glyphMargin: true,
                folding: true,
                showFoldingControls: "always",
                cursorBlinking: "smooth",
                smoothScrolling: true,
                renderWhitespace: "selection",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                renderLineHighlight: "all",
                quickSuggestions: true,
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: "on",
                snippetSuggestions: "top",
                formatOnPaste: true,
                formatOnType: true,
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
                autoIndent: "full",
                bracketPairColorization: {
                  enabled: true,
                },
              }}
            />
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between px-4 py-1 bg-blue-600 text-white text-xs">
            <div className="flex items-center gap-4">
              <span>Ln {lineCount}, Col 1</span>
              <span>Spaces: 2</span>
              <span>UTF-8</span>
              <span>TypeScript React</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3" />
              <span>Unsaved Changes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Dialogs */}
      <AlertDialog open={showWarning1} onOpenChange={setShowWarning1}>
        <AlertDialogContent className="bg-slate-900 border-yellow-500/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-yellow-500 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              WARNING #1: Database & Website Code Modification
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 space-y-3">
              <p className="font-semibold text-lg">You are about to modify database-stored code for <span className="text-white">{gameName}</span>!</p>
              
              <div className="space-y-2 bg-slate-800/50 p-4 rounded border border-yellow-500/30">
                <p className="text-yellow-400 font-medium">⚠️ This action will:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Update the game component code in the database</li>
                  <li>Modify your website's functionality immediately</li>
                  <li>Affect all users who access this game</li>
                  <li>Log this change in the admin activity log</li>
                </ul>
              </div>

              <div className="space-y-2 bg-orange-500/10 p-4 rounded border border-orange-500/30">
                <p className="text-orange-400 font-medium">⚡ Impact:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Changes take effect after rebuild/deployment</li>
                  <li>Broken code can crash the application</li>
                  <li>No automatic rollback - manual restore required</li>
                </ul>
              </div>

              <p className="text-yellow-400 font-semibold">
                Have you tested this code and are you ready to proceed?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-slate-300">Cancel - Go Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleWarning1Confirm} className="bg-yellow-600 hover:bg-yellow-700">
              Yes, Continue to Next Warning
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showWarning2} onOpenChange={setShowWarning2}>
        <AlertDialogContent className="bg-slate-900 border-orange-500/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-orange-500 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              WARNING #2: Pre-Save Checklist
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 space-y-3">
              <p className="font-semibold text-lg text-orange-400">Before you save, confirm you have:</p>
              
              <div className="space-y-2 bg-slate-800/50 p-4 rounded border border-orange-500/30">
                <p className="text-orange-400 font-medium">✓ Pre-Save Checklist:</p>
                <ul className="list-none space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">□</span>
                    <span>Tested the code locally or in a development environment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">□</span>
                    <span>Reviewed all changes for syntax errors and bugs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">□</span>
                    <span>Verified TypeScript types are correct</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">□</span>
                    <span>Ensured imports and dependencies are available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">□</span>
                    <span>Created a backup of the current working version</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">□</span>
                    <span>Consulted with team members if necessary</span>
                  </li>
                </ul>
              </div>

              <p className="text-orange-400 font-semibold">
                Have you completed all checklist items?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-slate-300">No, Go Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleWarning2Confirm} className="bg-orange-600 hover:bg-orange-700">
              Yes, Checklist Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showFinalWarning} onOpenChange={setShowFinalWarning}>
        <AlertDialogContent className="bg-slate-900 border-red-500 border-2 max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 flex items-center gap-2 text-xl">
              <AlertTriangle className="h-7 w-7" />
              FINAL WARNING: Last Chance to Cancel
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 space-y-3">
              <p className="font-bold text-red-400 text-xl">⛔ THIS IS YOUR LAST CHANCE! ⛔</p>
              
              <div className="space-y-2 bg-red-500/10 p-4 rounded border border-red-500/50">
                <p className="text-red-400 font-semibold text-lg">Clicking "SAVE NOW" will:</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li className="text-red-300"><strong>IMMEDIATELY</strong> update the game code in the database</li>
                  <li className="text-red-300"><strong>MODIFY</strong> your website's core functionality</li>
                  <li className="text-red-300"><strong>AFFECT</strong> all users after next deployment</li>
                  <li className="text-red-300"><strong>REQUIRE MANUAL</strong> rollback if something breaks</li>
                  <li className="text-red-300"><strong>BE LOGGED</strong> in admin activity records</li>
                </ul>
              </div>

              <div className="space-y-2 bg-slate-800/50 p-4 rounded border border-red-500/30">
                <p className="text-red-400 font-medium">🚨 Potential Consequences:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                  <li>Broken code will crash the game for all users</li>
                  <li>TypeScript errors may prevent compilation</li>
                  <li>Missing imports will cause runtime failures</li>
                  <li>Logic errors may corrupt user data</li>
                </ul>
              </div>

              <div className="bg-black/50 p-4 rounded border-2 border-red-500 mt-4">
                <p className="font-bold text-red-400 text-center text-lg">
                  ARE YOU ABSOLUTELY, POSITIVELY SURE?
                </p>
                <p className="text-center text-slate-400 text-sm mt-2">
                  Think carefully - there's no undo button.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-slate-800 text-slate-300 hover:bg-slate-700">
              🛑 Cancel - Don't Save
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalConfirm} className="bg-red-600 hover:bg-red-700 font-bold">
              💾 SAVE NOW - I'm Sure
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

function generateDefaultCode(gameName: string, componentName: string): string {
  return `import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ${componentName}Props {
  onComplete?: (score: number) => void;
  onPointsEarned?: (points: number) => void;
}

const ${componentName} = ({ onComplete, onPointsEarned }: ${componentName}Props) => {
  const { toast } = useToast();
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [level, setLevel] = useState(1);

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setLevel(1);
    toast({
      title: "Game Started!",
      description: "Good luck with ${gameName}!",
    });
  };

  const endGame = () => {
    setGameActive(false);
    onComplete?.(score);
    onPointsEarned?.(Math.floor(score / 2));
    toast({
      title: "Game Over!",
      description: \`Final Score: \${score}\`,
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          ${gameName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center p-4 bg-slate-800 rounded-lg">
          <div>
            <span className="text-sm text-slate-400">Score</span>
            <p className="text-2xl font-bold text-white">{score}</p>
          </div>
          <div>
            <span className="text-sm text-slate-400">Level</span>
            <p className="text-2xl font-bold text-white">{level}</p>
          </div>
        </div>

        <div className="min-h-[300px] bg-slate-900 rounded-lg p-8 flex items-center justify-center">
          {!gameActive ? (
            <Button onClick={startGame} size="lg" className="text-lg px-8 py-6">
              Start Game
            </Button>
          ) : (
            <div className="text-center">
              <p className="text-white text-lg mb-4">Game is running...</p>
              <Button onClick={endGame} variant="destructive">
                End Game
              </Button>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-slate-400">
          {/* Add your game instructions here */}
          Click Start Game to begin playing!
        </div>
      </CardContent>
    </Card>
  );
};

export default ${componentName};
`;
}

function generateTypesFile(): string {
  return `// Type definitions for the game
export interface GameState {
  score: number;
  level: number;
  isActive: boolean;
}

export interface GameProps {
  onComplete?: (score: number) => void;
  onPointsEarned?: (points: number) => void;
}

export interface PlayerData {
  name: string;
  highScore: number;
  lastPlayed: Date;
}
`;
}

function generateUtilsFile(): string {
  return `// Utility functions for the game

export const calculateScore = (correct: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
};

export const randomInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
`;
}

function generateStylesFile(): string {
  return `/* Game-specific styles */

.game-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.game-board {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.game-item {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.game-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.score-animation {
  animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
`;
}

export default CodeEditorWithSidebar;
