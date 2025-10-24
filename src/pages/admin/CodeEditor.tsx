import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Code, Plus, RefreshCw, FileCode, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import CodeEditorWithSidebar from "@/components/CodeEditorWithSidebar";

interface Game {
  id: string;
  name: string;
  component_name: string;
  code?: string;
}

const AdminCodeEditor = () => {
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [addGameDialogOpen, setAddGameDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<Game | null>(null);
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
        .select("id, name, component_name, code")
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

  const handleAddGame = async () => {
    if (!newGameData.name || !newGameData.component_name) {
      toast({
        title: "Error",
        description: "Name and component name are required",
        variant: "destructive",
      });
      return;
    }

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
          <h1 className="text-3xl font-bold text-slate-100">Code Editor</h1>
          <p className="text-slate-400 mt-2">Create and edit game components</p>
        </div>
        <div className="flex gap-2">
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
                  <div className="flex items-center justify-between mt-4 text-xs">
                    <span className="text-slate-500">
                      {game.code ? `${game.code.split('\n').length} lines` : 'No code yet'}
                    </span>
                    <span className="text-blue-400 group-hover:text-blue-300">Edit Code →</span>
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
            <Button onClick={handleAddGame} className="bg-red-600 hover:bg-red-700">
              Create Game
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
    </div>
  );
};

export default AdminCodeEditor;
