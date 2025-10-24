import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Save, X } from "lucide-react";
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

interface GameCodeEditorProps {
  code: string;
  gameName: string;
  onSave: (code: string) => void;
  onClose: () => void;
}

const GameCodeEditor = ({ code, gameName, onSave, onClose }: GameCodeEditorProps) => {
  const [editorCode, setEditorCode] = useState(code || `// Start writing your game component code here
// Example:
import { useState } from "react";
import { Card } from "@/components/ui/card";

const ${gameName.replace(/\s+/g, '')} = () => {
  const [score, setScore] = useState(0);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">${gameName}</h2>
      <div className="space-y-4">
        <p>Score: {score}</p>
        {/* Add your game logic here */}
      </div>
    </Card>
  );
};

export default ${gameName.replace(/\s+/g, '')};
`);
  const [showWarning1, setShowWarning1] = useState(false);
  const [showWarning2, setShowWarning2] = useState(false);
  const [showFinalWarning, setShowFinalWarning] = useState(false);
  const [lineCount, setLineCount] = useState(0);

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
    onSave(editorCode);
  };

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || "";
    setEditorCode(newCode);
    setLineCount(newCode.split('\n').length);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl h-[90vh] bg-slate-900 border-slate-700 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Game Code Editor</h2>
            <p className="text-sm text-slate-400 mt-1">Editing: {gameName}</p>
            <p className="text-xs text-slate-500 mt-1">Lines: {lineCount} | Characters: {editorCode.length}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveClick}
              className="bg-red-600 hover:bg-red-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-slate-800 border-slate-700 text-slate-300"
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-hidden">
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
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
              renderLineHighlight: "all",
              folding: true,
              showFoldingControls: "always",
              cursorBlinking: "smooth",
              smoothScrolling: true,
              renderWhitespace: "selection",
            }}
          />
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-2 text-amber-400 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Warning: Saving will update the game code in the project and affect GitHub repository</span>
          </div>
        </div>
      </Card>

      {/* First Warning */}
      <AlertDialog open={showWarning1} onOpenChange={setShowWarning1}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Warning #1: Code Changes Will Affect Live Game
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              You are about to modify the code for <span className="font-bold text-white">{gameName}</span>.
              <br /><br />
              This will:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Update the game component in the project</li>
                <li>Affect all users currently playing this game</li>
                <li>Be committed to the GitHub repository</li>
              </ul>
              <br />
              <span className="font-bold text-amber-400">Are you sure you want to continue?</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-slate-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWarning1Confirm}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Yes, Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Second Warning */}
      <AlertDialog open={showWarning2} onOpenChange={setShowWarning2}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Warning #2: Consult Team Before Committing
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              <span className="font-bold text-orange-400">IMPORTANT:</span> Before saving these changes, you should:
              <br /><br />
              <ul className="list-disc ml-6 space-y-2">
                <li>Consult with the development team</li>
                <li>Review the code changes thoroughly</li>
                <li>Test the game functionality</li>
                <li>Ensure no breaking changes are introduced</li>
                <li>Consider creating a backup of the current version</li>
              </ul>
              <br />
              <span className="font-bold text-orange-400">Have you consulted with the team?</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-slate-300">
              No, Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWarning2Confirm}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Yes, I've Consulted
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Final Warning */}
      <AlertDialog open={showFinalWarning} onOpenChange={setShowFinalWarning}>
        <AlertDialogContent className="bg-slate-900 border-red-900/50 border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              Final Warning: Last Chance to Cancel
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              <span className="font-bold text-red-400 text-lg">THIS IS YOUR LAST CHANCE!</span>
              <br /><br />
              Clicking "Save Now" will:
              <ul className="list-disc ml-6 mt-2 space-y-1 text-red-300">
                <li>Immediately update the game code</li>
                <li>Push changes to GitHub</li>
                <li>Affect all users in real-time</li>
                <li>Cannot be easily undone</li>
              </ul>
              <br />
              <span className="font-bold text-red-400">Are you ABSOLUTELY SURE?</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-slate-300">
              Cancel - Don't Save
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Save Now - I'm Sure
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GameCodeEditor;
