import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlayCircle, Database, Trash2, RefreshCcw, Shield, Code, HelpCircle, AlertTriangle, BookOpen, Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const AdminSystem = () => {
  const { toast } = useToast();
  const [jsCode, setJsCode] = useState("");
  const [executing, setExecuting] = useState(false);
  const [output, setOutput] = useState("");
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);
  const [actionTitle, setActionTitle] = useState("");

  const handleClearLeaderboard = async () => {
    try {
      const { error } = await supabase
        .from("leaderboard_entries")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (error) throw error;

      await supabase.from("admin_actions").insert({
        action_type: "system_action",
        target_table: "leaderboard_entries",
        description: "Cleared all leaderboard entries",
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
      });

      toast({ title: "Leaderboard cleared successfully" });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to clear leaderboard",
        variant: "destructive",
      });
    } finally {
      setConfirmDialogOpen(false);
      setPendingAction(null);
    }
  };

  const handleResetUserProgress = async () => {
    try {
      const { error } = await supabase
        .from("user_progress")
        .update({
          level: 1,
          total_points: 0,
          total_lessons_completed: 0,
          current_streak: 0,
        })
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;

      await supabase.from("admin_actions").insert({
        action_type: "system_action",
        target_table: "user_progress",
        description: "Reset all user progress",
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
      });

      toast({ title: "User progress reset successfully" });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to reset user progress",
        variant: "destructive",
      });
    } finally {
      setConfirmDialogOpen(false);
      setPendingAction(null);
    }
  };

  const showConfirmDialog = (action: () => Promise<void>, title: string) => {
    setPendingAction(() => action);
    setActionTitle(title);
    setConfirmDialogOpen(true);
  };

  const handleExecuteJS = async () => {
    if (!jsCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter JavaScript code",
        variant: "destructive",
      });
      return;
    }

    setExecuting(true);
    setOutput("");

    try {
      // Create a console.log interceptor
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
        originalLog(...args);
      };

      // Execute the code with supabase available
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const fn = new AsyncFunction('supabase', `
        ${jsCode}
      `);
      
      const result = await fn(supabase);
      
      // Restore console.log
      console.log = originalLog;

      // Format output
      let outputText = logs.length > 0 ? logs.join('\n') + '\n\n' : '';
      if (result !== undefined) {
        outputText += 'Return value:\n' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result));
      }

      setOutput(outputText || 'Code executed successfully (no output)');

      await supabase.from("admin_actions").insert({
        action_type: "system_action",
        description: "Executed custom JavaScript code",
        metadata: { code: jsCode.substring(0, 500) },
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
      });

      toast({ title: "Code executed successfully" });
    } catch (error) {
      console.error("Execution error:", error);
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Execution Error",
        description: error instanceof Error ? error.message : "Failed to execute code",
        variant: "destructive",
      });
    } finally {
      setExecuting(false);
    }
  };

  const systemActions = [
    {
      title: "Clear Leaderboard",
      description: "Remove all entries from the leaderboard",
      icon: Trash2,
      action: () => showConfirmDialog(handleClearLeaderboard, "Clear Leaderboard"),
      variant: "destructive" as const,
    },
    {
      title: "Reset User Progress",
      description: "Reset all user progress to level 1",
      icon: RefreshCcw,
      action: () => showConfirmDialog(handleResetUserProgress, "Reset User Progress"),
      variant: "destructive" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            System Controls
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setHelpDialogOpen(true)}
              className="text-blue-400 hover:text-blue-300 hover:bg-slate-800"
            >
              <HelpCircle className="h-6 w-6" />
            </Button>
          </h1>
          <p className="text-slate-400 mt-2">Advanced system operations - use with extreme caution</p>
        </div>
        <Button 
          onClick={() => setHelpDialogOpen(true)} 
          variant="outline" 
          className="bg-blue-600/10 border-blue-500 text-blue-400 hover:bg-blue-600/20"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Help Guide
        </Button>
      </div>

      {/* Critical Warning Banner */}
      <Alert className="bg-red-500/10 border-red-500/50">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <AlertTitle className="text-red-500 font-bold">⚠️ CRITICAL SYSTEM AREA ⚠️</AlertTitle>
        <AlertDescription className="text-slate-300">
          These operations directly modify the database and cannot be undone. Incorrect use can cause permanent data loss 
          or system failure. Only proceed if you fully understand the consequences. All actions are logged.
        </AlertDescription>
      </Alert>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-400" />
            Dangerous Operations
          </CardTitle>
          <CardDescription className="text-slate-400">
            These actions cannot be undone. Use with caution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemActions.map((action) => (
              <div
                key={action.title}
                className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-red-500/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <action.icon className="h-5 w-5 text-red-400 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-200">{action.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{action.description}</p>
                    <Button
                      variant={action.variant}
                      size="sm"
                      className="mt-3"
                      onClick={action.action}
                    >
                      Execute
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Code className="h-5 w-5 text-purple-400" />
            JavaScript Executor
          </CardTitle>
          <CardDescription className="text-slate-400">
            Execute custom JavaScript code with Supabase access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="jscode" className="text-slate-300">JavaScript Code</Label>
            <Textarea
              id="jscode"
              value={jsCode}
              onChange={(e) => setJsCode(e.target.value)}
              placeholder={`// Example:\nconst { data } = await supabase\n  .from('games')\n  .select('*');\nconsole.log(data);`}
              className="bg-slate-800 border-slate-700 text-slate-200 font-mono h-48 mt-2"
            />
          </div>

          <Button
            onClick={handleExecuteJS}
            disabled={executing}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            {executing ? "Executing..." : "Execute Code"}
          </Button>

          {output && (
            <div className="mt-4">
              <Label className="text-slate-300">Output</Label>
              <pre className="mt-2 p-4 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-sm overflow-auto max-h-64">
                {output}
              </pre>
            </div>
          )}

          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-amber-400">
              <strong>Warning:</strong> Only execute trusted code. You have full Supabase access.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-400" />
            Database Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Tables</span>
              <span className="text-slate-200 font-mono">7</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">User Profiles</span>
              <span className="text-slate-200 font-mono">user_learning_profiles</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Leaderboard</span>
              <span className="text-slate-200 font-mono">leaderboard_entries</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Games</span>
              <span className="text-slate-200 font-mono">games</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-red-500 border-2 max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 flex items-center gap-2 text-xl">
              <AlertTriangle className="h-7 w-7" />
              ⛔ CRITICAL WARNING: {actionTitle}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 space-y-3">
              <p className="font-bold text-red-400 text-xl">THIS ACTION CANNOT BE UNDONE!</p>
              
              <div className="bg-red-500/10 border border-red-500/50 rounded p-4">
                <p className="font-semibold text-red-400 text-lg mb-2">⚠️ You are about to:</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  {actionTitle === "Clear Leaderboard" && (
                    <>
                      <li>Permanently delete ALL leaderboard entries</li>
                      <li>Remove all user rankings and scores</li>
                      <li>Erase competition history</li>
                      <li>This affects ALL users immediately</li>
                    </>
                  )}
                  {actionTitle === "Reset User Progress" && (
                    <>
                      <li>Reset ALL user progress to level 1</li>
                      <li>Remove ALL earned points and achievements</li>
                      <li>Clear ALL lesson completion records</li>
                      <li>Reset ALL user streaks to zero</li>
                      <li>This affects EVERY user on the platform</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="bg-slate-800/50 p-4 rounded border border-red-500/30">
                <p className="text-red-400 font-medium">🚨 Consequences:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-300 mt-2">
                  <li>Data cannot be recovered</li>
                  <li>Users will lose their progress permanently</li>
                  <li>This action will be logged in admin records</li>
                  <li>May cause user complaints and confusion</li>
                </ul>
              </div>

              <div className="bg-black/50 p-4 rounded border-2 border-red-500 mt-4">
                <p className="font-bold text-red-400 text-center text-lg">
                  ARE YOU ABSOLUTELY CERTAIN?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-slate-800 text-slate-300 hover:bg-slate-700"
              onClick={() => {
                setConfirmDialogOpen(false);
                setPendingAction(null);
              }}
            >
              🛑 Cancel - Don't Do This
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 font-bold"
              onClick={() => pendingAction && pendingAction()}
            >
              ⚠️ Yes, Execute Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Help Dialog - Similar to Users page */}
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-400" />
              System Controls Help Guide
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Critical information about system operations
            </DialogDescription>
          </DialogHeader>

          <Alert className="bg-red-500/10 border-red-500/50">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <AlertDescription className="text-slate-300">
              <strong className="text-red-400">DANGER ZONE:</strong> All operations on this page modify the database directly and cannot be undone. Use only when absolutely necessary.
            </AlertDescription>
          </Alert>

          <Accordion type="single" collapsible className="w-full space-y-2">
            <AccordionItem value="overview" className="bg-slate-800 border-slate-700 rounded px-4">
              <AccordionTrigger className="text-slate-200 hover:text-white">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-400" />
                  What are System Controls?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-300 space-y-2">
                <p>System Controls provide direct access to critical database operations. These are powerful tools that should only be used by experienced administrators who understand the full implications.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="operations" className="bg-slate-800 border-slate-700 rounded px-4">
              <AccordionTrigger className="text-slate-200 hover:text-white">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-400" />
                  Dangerous Operations Explained
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-300 space-y-3">
                <div className="space-y-3">
                  <div className="bg-slate-900 p-3 rounded border-l-4 border-red-500">
                    <p className="font-semibold text-red-400">Clear Leaderboard</p>
                    <p className="text-sm mt-1">Permanently deletes all leaderboard entries. Use when:</p>
                    <ul className="list-disc list-inside text-sm mt-1 ml-4">
                      <li>Starting a new competition season</li>
                      <li>Removing invalid or test entries</li>
                      <li>Resetting after system changes</li>
                    </ul>
                  </div>
                  <div className="bg-slate-900 p-3 rounded border-l-4 border-red-500">
                    <p className="font-semibold text-red-400">Reset User Progress</p>
                    <p className="text-sm mt-1">Resets all users to level 1 with zero points. Use when:</p>
                    <ul className="list-disc list-inside text-sm mt-1 ml-4">
                      <li>Major system overhaul requires fresh start</li>
                      <li>Testing new progression systems</li>
                      <li>Correcting widespread data corruption</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="js-executor" className="bg-slate-800 border-slate-700 rounded px-4">
              <AccordionTrigger className="text-slate-200 hover:text-white">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-purple-400" />
                  JavaScript Executor
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-300 space-y-2">
                <p>Execute custom JavaScript with full Supabase database access. Extremely powerful and dangerous.</p>
                <Alert className="bg-red-500/10 border-red-500/50 mt-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription>
                    Only execute trusted code. You can query, modify, or delete any data in the database.
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="safety" className="bg-slate-800 border-slate-700 rounded px-4">
              <AccordionTrigger className="text-slate-200 hover:text-white">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  Safety Guidelines
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-300 space-y-3">
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                  <p className="font-semibold text-green-400">✅ Before any operation:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Verify you understand what will happen</li>
                    <li>Check if a backup exists</li>
                    <li>Notify users if appropriate</li>
                    <li>Have a rollback plan ready</li>
                    <li>Read ALL warning dialogs completely</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <DialogFooter>
            <Button onClick={() => setHelpDialogOpen(false)} className="bg-blue-600 hover:bg-blue-700">
              I understand the risks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSystem;
