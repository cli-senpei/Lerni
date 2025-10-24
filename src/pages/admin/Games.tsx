import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, RefreshCw, ArrowUp, ArrowDown, Power, PowerOff, Code } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GameCodeEditor from "@/components/GameCodeEditor";

interface Game {
  id: string;
  name: string;
  description: string;
  component_name: string;
  display_order: number;
  is_active: boolean;
  difficulty_level: string;
  code?: string;
  created_at: string;
}

const AdminGames = () => {
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editingCode, setEditingCode] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    component_name: "",
    difficulty_level: "beginner",
  });

  const fetchGames = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
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

  const handleSubmit = async () => {
    try {
      if (editingGame) {
        const { error } = await supabase
          .from("games")
          .update(formData)
          .eq("id", editingGame.id);

        if (error) throw error;

        await supabase.from("admin_actions").insert({
          action_type: "game_updated",
          target_table: "games",
          target_id: editingGame.id,
          description: `Updated game: ${formData.name}`,
        });

        toast({ title: "Game updated successfully" });
      } else {
        const { error } = await supabase
          .from("games")
          .insert({
            ...formData,
            display_order: games.length + 1,
          });

        if (error) throw error;

        await supabase.from("admin_actions").insert({
          action_type: "game_created",
          target_table: "games",
          description: `Created game: ${formData.name}`,
        });

        toast({ title: "Game created successfully" });
      }

      fetchGames();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving game:", error);
      toast({
        title: "Error",
        description: "Failed to save game",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (game: Game) => {
    if (!confirm(`Delete ${game.name}?`)) return;

    try {
      const { error } = await supabase
        .from("games")
        .delete()
        .eq("id", game.id);

      if (error) throw error;

      await supabase.from("admin_actions").insert({
        action_type: "game_deleted",
        target_table: "games",
        target_id: game.id,
        description: `Deleted game: ${game.name}`,
      });

      toast({ title: "Game deleted successfully" });
      fetchGames();
    } catch (error) {
      console.error("Error deleting game:", error);
      toast({
        title: "Error",
        description: "Failed to delete game",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (game: Game) => {
    try {
      const { error } = await supabase
        .from("games")
        .update({ is_active: !game.is_active })
        .eq("id", game.id);

      if (error) throw error;

      await supabase.from("admin_actions").insert({
        action_type: "game_toggled",
        target_table: "games",
        target_id: game.id,
        description: `${game.is_active ? "Deactivated" : "Activated"} game: ${game.name}`,
      });

      toast({ title: `Game ${game.is_active ? "deactivated" : "activated"}` });
      fetchGames();
    } catch (error) {
      console.error("Error toggling game:", error);
      toast({
        title: "Error",
        description: "Failed to toggle game status",
        variant: "destructive",
      });
    }
  };

  const handleReorder = async (game: Game, direction: "up" | "down") => {
    const currentIndex = games.findIndex(g => g.id === game.id);
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (swapIndex < 0 || swapIndex >= games.length) return;

    try {
      const swapGame = games[swapIndex];

      await supabase
        .from("games")
        .update({ display_order: swapGame.display_order })
        .eq("id", game.id);

      await supabase
        .from("games")
        .update({ display_order: game.display_order })
        .eq("id", swapGame.id);

      toast({ title: "Game order updated" });
      fetchGames();
    } catch (error) {
      console.error("Error reordering games:", error);
      toast({
        title: "Error",
        description: "Failed to reorder games",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      description: game.description || "",
      component_name: game.component_name,
      difficulty_level: game.difficulty_level || "beginner",
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingGame(null);
    setFormData({
      name: "",
      description: "",
      component_name: "",
      difficulty_level: "beginner",
    });
  };

  const handleEditCode = (game: Game) => {
    setEditingCode(game);
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
          <h1 className="text-3xl font-bold text-slate-100">Game Management</h1>
          <p className="text-slate-400 mt-2">Add, edit, and manage learning games</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchGames} variant="outline" className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Game
          </Button>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">All Games</CardTitle>
          <CardDescription className="text-slate-400">
            Total: {games.length} games ({games.filter(g => g.is_active).length} active)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-800 hover:bg-slate-800">
                  <TableHead className="text-slate-300">Order</TableHead>
                  <TableHead className="text-slate-300">Name</TableHead>
                  <TableHead className="text-slate-300">Component</TableHead>
                  <TableHead className="text-slate-300">Difficulty</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-400">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : games.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-400">
                      No games found
                    </TableCell>
                  </TableRow>
                ) : (
                  games.map((game, index) => (
                    <TableRow key={game.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell className="text-slate-400">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={index === 0}
                            onClick={() => handleReorder(game, "up")}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-200"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={index === games.length - 1}
                            onClick={() => handleReorder(game, "down")}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-200"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-200">{game.name}</TableCell>
                      <TableCell className="text-slate-400 font-mono text-xs">{game.component_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-slate-700 text-slate-400">
                          {game.difficulty_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {game.is_active ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="border-slate-700 text-slate-500">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                          onClick={() => handleToggleActive(game)}
                          title={game.is_active ? "Deactivate" : "Activate"}
                        >
                          {game.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-blue-600 border-blue-700 text-white hover:bg-blue-700"
                          onClick={() => handleEditCode(game)}
                          title="Edit Code"
                        >
                          <Code className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                          onClick={() => handleEdit(game)}
                          title="Edit Details"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(game)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>{editingGame ? "Edit Game" : "Add New Game"}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingGame ? "Update game details" : "Create a new learning game"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-slate-300">Game Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-200"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-slate-300">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-200"
              />
            </div>
            <div>
              <Label htmlFor="component" className="text-slate-300">Component Name</Label>
              <Input
                id="component"
                value={formData.component_name}
                onChange={(e) => setFormData({ ...formData, component_name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-200"
              />
            </div>
            <div>
              <Label htmlFor="difficulty" className="text-slate-300">Difficulty Level</Label>
              <Select
                value={formData.difficulty_level}
                onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} className="bg-slate-800 border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700">
              {editingGame ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Code Editor Modal */}
      {editingCode && (
        <GameCodeEditor
          code={editingCode.code || ""}
          gameName={editingCode.name}
          onSave={handleSaveCode}
          onClose={() => setEditingCode(null)}
        />
      )}
    </div>
  );
};

export default AdminGames;
