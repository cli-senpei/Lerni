import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Code, Plus, RefreshCw, FileCode, Upload, HelpCircle, AlertTriangle, Info, BookOpen, PlayCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CodeEditorWithSidebar from "@/components/CodeEditorWithSidebar";
import GameTestRunner from "@/components/GameTestRunner";
import TestingFeedbackPanel from "@/components/TestingFeedbackPanel";

interface Game {
  id: string;
  name: string;
  component_name: string;
  code?: string;
  description?: string;
  difficulty_level?: string;
}

const AdminCodeEditor = () => {
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [addGameDialogOpen, setAddGameDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<Game | null>(null);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [createWarningOpen, setCreateWarningOpen] = useState(false);
  const [pendingCreate, setPendingCreate] = useState(false);
  const [previewGame, setPreviewGame] = useState<Game | null>(null);
  const [newGameData, setNewGameData] = useState({
    name: "",
    description: "",
    component_name: "",
    difficulty_level: "beginner",
    code: "",
  });

  const fetchGames = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("games")
        .select("id, name, component_name, code, description, difficulty_level")
        .order("display_order");

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error("Error fetching games:", error);
      toast({
        title: "Error",
        description: "Failed to fetch games",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleAddGameClick = () => {
    if (!newGameData.name || !newGameData.component_name) {
      toast({
        title: "Error",
        description: "Name and component name are required",
        variant: "destructive",
      });
      return;
    }
    setPendingCreate(true);
    setCreateWarningOpen(true);
  };

  const handleAddGame = async () => {
    setCreateWarningOpen(false);
    setPendingCreate(false);

    try {
      const { data, error } = await supabase
        .from("games")
        .insert({
          ...newGameData,
          display_order: games.length + 1,
          is_active: false,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from("admin_actions").insert({
        action_type: "game_created",
        target_table: "games",
        target_id: data.id,
        description: `Created game: ${newGameData.name}`,
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
      });

      toast({ title: "Game created successfully" });
      setAddGameDialogOpen(false);
      setNewGameData({ name: "", description: "", component_name: "", difficulty_level: "beginner", code: "" });
      fetchGames();
    } catch (error) {
      console.error("Error creating game:", error);
      toast({
        title: "Error",
        description: "Failed to create game",
        variant: "destructive",
      });
    }
  };

  const handleSaveCode = async (code: string) => {
    if (!editingCode) return;

    try {
      const { error } = await supabase
        .from("games")
        .update({ code })
        .eq("id", editingCode.id);

      if (error) throw error;

      await supabase.from("admin_actions").insert({
        action_type: "game_code_updated",
        target_table: "games",
        target_id: editingCode.id,
        description: `Updated code for game: ${editingCode.name}`,
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
      });

      toast({ 
        title: "Code saved successfully",
        description: "The game code has been updated. Changes will be reflected after rebuild.",
      });
      
      setEditingCode(null);
      fetchGames();
    } catch (error) {
      console.error("Error saving code:", error);
      toast({
        title: "Error",
        description: "Failed to save game code",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            Code Editor
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setHelpDialogOpen(true)}
              className="text-blue-400 hover:text-blue-300 hover:bg-slate-800"
            >
              <HelpCircle className="h-6 w-6" />
            </Button>
          </h1>
          <p className="text-slate-400 mt-2">Create and edit game components safely</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setHelpDialogOpen(true)} 
            variant="outline" 
            className="bg-blue-600/10 border-blue-500 text-blue-400 hover:bg-blue-600/20"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Help Guide
          </Button>
          <Button onClick={fetchGames} variant="outline" className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setAddGameDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            New Game
          </Button>
        </div>
      </div>

      {/* Warning Banner */}
      <Alert className="bg-yellow-500/10 border-yellow-500/50">
        <AlertTriangle className="h-5 w-5 text-yellow-500" />
        <AlertTitle className="text-yellow-500">Critical System Area</AlertTitle>
        <AlertDescription className="text-slate-300">
          You are in the code editor. Changes made here directly affect your website's functionality. 
          Always test changes thoroughly and keep backups. Incorrect code can break your application.
        </AlertDescription>
      </Alert>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-400" />
            All Game Components
          </CardTitle>
          <CardDescription className="text-slate-400">
            Select a game to edit its code
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading games...</div>
          ) : games.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No games found. Create a new game to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setEditingCode(game)}
                  className="p-6 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FileCode className="h-8 w-8 text-blue-400 group-hover:text-blue-300" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-200 group-hover:text-white">{game.name}</h3>
                      <p className="text-xs text-slate-500 font-mono">{game.component_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 text-xs gap-2">
                    <span className="text-slate-500">
                      {game.code ? `${game.code.split('\n').length} lines` : 'No code yet'}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs bg-green-600/10 border-green-500 text-green-400 hover:bg-green-600/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewGame(game);
                        }}
                        disabled={false}
                        title="Test game in live environment"
                      >
                        <PlayCircle className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                      <span className="text-blue-400 group-hover:text-blue-300">Edit →</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Game Dialog */}
      <Dialog open={addGameDialogOpen} onOpenChange={setAddGameDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Game</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a new game component with code
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-slate-300">Game Name *</Label>
                <Input
                  id="name"
                  value={newGameData.name}
                  onChange={(e) => setNewGameData({ ...newGameData, name: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-200"
                  placeholder="e.g., Word Matching Game"
                />
              </div>
              <div>
                <Label htmlFor="component" className="text-slate-300">Component Name *</Label>
                <Input
                  id="component"
                  value={newGameData.component_name}
                  onChange={(e) => setNewGameData({ ...newGameData, component_name: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-200"
                  placeholder="e.g., WordMatchGame"
                />
                <p className="text-xs text-slate-500 mt-1">Valid React component name</p>
              </div>
            </div>
            <div>
              <Label htmlFor="description" className="text-slate-300">Description</Label>
              <Input
                id="description"
                value={newGameData.description}
                onChange={(e) => setNewGameData({ ...newGameData, description: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-200"
                placeholder="Brief description of the game"
              />
            </div>
            <div>
              <Label htmlFor="difficulty" className="text-slate-300">Difficulty Level</Label>
              <Select
                value={newGameData.difficulty_level}
                onValueChange={(value) => setNewGameData({ ...newGameData, difficulty_level: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="paste" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                <TabsTrigger value="paste" className="data-[state=active]:bg-slate-700">Paste Code</TabsTrigger>
                <TabsTrigger value="upload" className="data-[state=active]:bg-slate-700">Upload File</TabsTrigger>
              </TabsList>
              <TabsContent value="paste" className="space-y-2">
                <Label htmlFor="code" className="text-slate-300">Game Code (TypeScript/React)</Label>
                <Textarea
                  id="code"
                  value={newGameData.code}
                  onChange={(e) => setNewGameData({ ...newGameData, code: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-200 font-mono text-sm min-h-[300px]"
                  placeholder="Paste your React component code here..."
                />
                <p className="text-xs text-slate-500">Paste the complete React component code</p>
              </TabsContent>
              <TabsContent value="upload" className="space-y-2">
                <Label htmlFor="file-upload" className="text-slate-300">Upload Code File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".ts,.tsx,.js,.jsx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const content = event.target?.result as string;
                          setNewGameData({ ...newGameData, code: content });
                        };
                        reader.readAsText(file);
                      }
                    }}
                    className="bg-slate-800 border-slate-700 text-slate-200"
                  />
                  <Button variant="outline" size="icon" className="bg-slate-800 border-slate-700">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {newGameData.code && (
                  <div className="p-3 bg-slate-800 rounded border border-slate-700">
                    <p className="text-xs text-green-400">✓ File loaded ({newGameData.code.split('\n').length} lines)</p>
                  </div>
                )}
                <p className="text-xs text-slate-500">Upload .ts, .tsx, .js, or .jsx files</p>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setAddGameDialogOpen(false);
                setNewGameData({ name: "", description: "", component_name: "", difficulty_level: "beginner", code: "" });
              }} 
              className="bg-slate-800 border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button onClick={handleAddGameClick} className="bg-red-600 hover:bg-red-700">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Create Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Game Warning Dialog */}
      <AlertDialog open={createWarningOpen} onOpenChange={setCreateWarningOpen}>
        <AlertDialogContent className="bg-slate-900 border-red-500/50 max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              WARNING: Database & Code Modification
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 space-y-3">
              <p className="font-semibold text-lg">You are about to modify the database and website code!</p>
              
              <div className="space-y-2 bg-slate-800/50 p-4 rounded border border-red-500/30">
                <p className="text-yellow-400 font-medium">⚠️ This action will:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Create a new entry in the games database table</li>
                  <li>Store the provided code in the database</li>
                  <li>Make this game available for editing and deployment</li>
                  <li>Log this action in the admin activity log</li>
                </ul>
              </div>

              <div className="space-y-2 bg-blue-500/10 p-4 rounded border border-blue-500/30">
                <p className="text-blue-400 font-medium">📝 Important Notes:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Test the code thoroughly before making it active</li>
                  <li>Ensure the component name follows React naming conventions</li>
                  <li>Code errors can break the application</li>
                  <li>Keep a backup of working code versions</li>
                </ul>
              </div>

              <p className="text-red-400 font-semibold mt-4">
                Do you want to proceed with creating this game?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setCreateWarningOpen(false);
                setPendingCreate(false);
              }}
              className="bg-slate-800 border-slate-700"
            >
              Cancel - Go Back
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAddGame}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Create Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Help Dialog */}
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-400" />
              Code Editor Help Guide
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Complete guide to using the code editor safely and effectively
            </DialogDescription>
          </DialogHeader>

          <Accordion type="single" collapsible className="w-full space-y-2">
            <AccordionItem value="overview" className="bg-slate-800 border-slate-700 rounded px-4">
              <AccordionTrigger className="text-slate-200 hover:text-white">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-400" />
                  Overview - What is this?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-300 space-y-2">
                <p>The Code Editor allows you to create and manage game components for your learning platform. Each game is a React component that can be customized and integrated into your application.</p>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 mt-2">
                  <p className="font-semibold text-blue-400">Key Features:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Create new game components with custom code</li>
                    <li>Edit existing game code in a VS Code-like editor</li>
                    <li>Paste code or upload files (.tsx, .ts, .jsx, .js)</li>
                    <li>Preview changes before deployment</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="create" className="bg-slate-800 border-slate-700 rounded px-4">
              <AccordionTrigger className="text-slate-200 hover:text-white">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-green-400" />
                  How to Create a New Game
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-300 space-y-3">
                <ol className="list-decimal list-inside space-y-3">
                  <li>
                    <span className="font-semibold">Click "New Game" button</span>
                    <p className="ml-6 mt-1">Opens the creation dialog</p>
                  </li>
                  <li>
                    <span className="font-semibold">Fill in game details:</span>
                    <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                      <li><strong>Game Name:</strong> User-friendly name (e.g., "Word Matching")</li>
                      <li><strong>Component Name:</strong> React component name (e.g., "WordMatchGame") - must use PascalCase</li>
                      <li><strong>Description:</strong> Brief explanation of the game</li>
                      <li><strong>Difficulty:</strong> Beginner, Intermediate, or Advanced</li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-semibold">Add your code (choose one method):</span>
                    <div className="ml-6 mt-2 space-y-2">
                      <div className="bg-slate-900 p-3 rounded">
                        <p className="font-medium text-green-400">Method 1: Paste Code</p>
                        <p className="text-sm mt-1">Copy your React component code and paste it directly into the text area</p>
                      </div>
                      <div className="bg-slate-900 p-3 rounded">
                        <p className="font-medium text-green-400">Method 2: Upload File</p>
                        <p className="text-sm mt-1">Click "Choose File" and select a .tsx, .ts, .jsx, or .js file from your computer</p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <span className="font-semibold">Review the warning dialog</span>
                    <p className="ml-6 mt-1 text-yellow-400">Read carefully - this modifies your database!</p>
                  </li>
                  <li>
                    <span className="font-semibold">Confirm creation</span>
                    <p className="ml-6 mt-1">Click "Yes, Create Game" to proceed</p>
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="edit" className="bg-slate-800 border-slate-700 rounded px-4">
              <AccordionTrigger className="text-slate-200 hover:text-white">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-purple-400" />
                  How to Edit Existing Code
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-300 space-y-3">
                <ol className="list-decimal list-inside space-y-3">
                  <li>
                    <span className="font-semibold">Click on a game card</span>
                    <p className="ml-6 mt-1">Opens the VS Code-style editor</p>
                  </li>
                  <li>
                    <span className="font-semibold">Navigate using the file explorer</span>
                    <p className="ml-6 mt-1">Browse folders and files in the left sidebar</p>
                  </li>
                  <li>
                    <span className="font-semibold">Edit the code</span>
                    <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                      <li>Full syntax highlighting and autocomplete</li>
                      <li>Line numbers and error detection</li>
                      <li>Search and replace functionality</li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-semibold">Save changes</span>
                    <p className="ml-6 mt-1">Click the "Save" button - you'll see confirmation dialogs</p>
                  </li>
                </ol>
                <Alert className="bg-yellow-500/10 border-yellow-500/50 mt-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-slate-300">
                    The editor shows multiple confirmation warnings before saving to prevent accidental changes
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="best-practices" className="bg-slate-800 border-slate-700 rounded px-4">
              <AccordionTrigger className="text-slate-200 hover:text-white">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                  Best Practices & Safety
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-300 space-y-3">
                <div className="space-y-3">
                  <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                    <p className="font-semibold text-green-400">✅ DO:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Test code locally before uploading</li>
                      <li>Use proper React component structure</li>
                      <li>Follow TypeScript typing conventions</li>
                      <li>Keep backup copies of working code</li>
                      <li>Read all warning dialogs carefully</li>
                      <li>Start with simple components and iterate</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                    <p className="font-semibold text-red-400">❌ DON'T:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Upload untested or unknown code</li>
                      <li>Ignore TypeScript errors</li>
                      <li>Use lowercase for component names</li>
                      <li>Make multiple rapid changes without testing</li>
                      <li>Skip the warning dialogs</li>
                      <li>Edit production games during peak hours</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="warnings" className="bg-slate-800 border-slate-700 rounded px-4">
              <AccordionTrigger className="text-slate-200 hover:text-white">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  Understanding Warnings
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-300 space-y-3">
                <p>The editor shows multiple warning dialogs to protect your application:</p>
                <div className="space-y-2">
                  <div className="bg-slate-900 p-3 rounded border-l-4 border-yellow-500">
                    <p className="font-semibold text-yellow-400">Database Modification Warning</p>
                    <p className="text-sm mt-1">Appears when creating games - confirms you're adding data to the database</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded border-l-4 border-orange-500">
                    <p className="font-semibold text-orange-400">Code Save Warning</p>
                    <p className="text-sm mt-1">Appears when saving code changes - confirms you're modifying website functionality</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded border-l-4 border-red-500">
                    <p className="font-semibold text-red-400">Final Confirmation</p>
                    <p className="text-sm mt-1">Last chance to review before committing changes</p>
                  </div>
                </div>
                <Alert className="bg-red-500/10 border-red-500/50 mt-3">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-slate-300">
                    <strong>Never skip warnings!</strong> They exist to prevent breaking changes and data loss.
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="troubleshooting" className="bg-slate-800 border-slate-700 rounded px-4">
              <AccordionTrigger className="text-slate-200 hover:text-white">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-cyan-400" />
                  Troubleshooting
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-300 space-y-3">
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-cyan-400">Game not appearing after creation?</p>
                    <p className="text-sm ml-4 mt-1">• Click the "Refresh" button to reload the game list</p>
                  </div>
                  <div>
                    <p className="font-semibold text-cyan-400">Code editor won't open?</p>
                    <p className="text-sm ml-4 mt-1">• Clear your browser cache and try again</p>
                    <p className="text-sm ml-4">• Check browser console for errors (F12)</p>
                  </div>
                  <div>
                    <p className="font-semibold text-cyan-400">Changes not saving?</p>
                    <p className="text-sm ml-4 mt-1">• Ensure you have admin permissions</p>
                    <p className="text-sm ml-4">• Check your network connection</p>
                    <p className="text-sm ml-4">• Look for error messages in toast notifications</p>
                  </div>
                  <div>
                    <p className="font-semibold text-cyan-400">Game broke after edit?</p>
                    <p className="text-sm ml-4 mt-1">• Check Activity logs to see what changed</p>
                    <p className="text-sm ml-4">• Restore from backup if available</p>
                    <p className="text-sm ml-4">• Review console errors in browser DevTools</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <DialogFooter>
            <Button onClick={() => setHelpDialogOpen(false)} className="bg-blue-600 hover:bg-blue-700">
              Got it, thanks!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Code Editor Modal */}
      {editingCode && (
        <CodeEditorWithSidebar
          code={editingCode.code || ""}
          gameName={editingCode.name}
          componentName={editingCode.component_name}
          onSave={handleSaveCode}
          onClose={() => setEditingCode(null)}
        />
      )}

      {/* Game Preview Dialog */}
      <Dialog open={!!previewGame} onOpenChange={() => setPreviewGame(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 w-screen h-screen max-w-none max-h-none m-0 p-0 rounded-none">
          <div className="flex flex-col h-full">
            <DialogHeader className="px-6 py-4 border-b border-slate-800 bg-slate-950">
              <DialogTitle className="text-xl flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-green-400" />
                Live Game Test: {previewGame?.name}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Playing {previewGame?.component_name} in fullscreen testing environment
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 flex overflow-hidden">
              {/* Game Area - 70% width */}
              <div className="flex-1 flex flex-col p-4 space-y-3 overflow-hidden">
                <Alert className="bg-green-500/10 border-green-500/50">
                  <PlayCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-slate-300 text-xs">
                    <strong>Live Game Mode:</strong> Test all features and provide feedback to improve the game.
                  </AlertDescription>
                </Alert>

                {/* Game Test Area */}
                <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
                  <GameTestRunner
                    componentName={previewGame?.component_name || ""}
                    gameName={previewGame?.name || ""}
                  />
                </div>
              </div>

              {/* Testing Panel - 30% width */}
              <TestingFeedbackPanel
                game={previewGame}
                onClose={() => setPreviewGame(null)}
                onEditCode={() => {
                  setPreviewGame(null);
                  setEditingCode(previewGame);
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCodeEditor;
