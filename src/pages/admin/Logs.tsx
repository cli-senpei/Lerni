import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Trash2, Activity } from "lucide-react";
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

interface AdminAction {
  id: string;
  action_type: string;
  target_table: string | null;
  target_id: string | null;
  description: string | null;
  metadata: any;
  created_at: string;
}

const AdminLogs = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_actions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch activity logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleClearLogs = async () => {
    try {
      const { error } = await supabase
        .from("admin_actions")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (error) throw error;

      toast({ title: "Activity logs cleared" });
      setClearDialogOpen(false);
      fetchLogs();
    } catch (error) {
      console.error("Error clearing logs:", error);
      toast({
        title: "Error",
        description: "Failed to clear logs",
        variant: "destructive",
      });
    }
  };

  const getActionBadge = (actionType: string) => {
    const colors: Record<string, string> = {
      user_promoted: "bg-green-500/20 text-green-400 border-green-500/30",
      user_demoted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      user_deleted: "bg-red-500/20 text-red-400 border-red-500/30",
      game_created: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      game_updated: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      game_deleted: "bg-red-500/20 text-red-400 border-red-500/30",
      game_toggled: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      system_action: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    };

    return (
      <Badge className={colors[actionType] || "bg-slate-700 text-slate-300 border-slate-600"}>
        {actionType.replace(/_/g, " ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Activity Logs</h1>
          <p className="text-slate-400 mt-2">View all administrative actions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchLogs} variant="outline" className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setClearDialogOpen(true)} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-slate-400">
            Showing last {logs.length} actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-800 hover:bg-slate-800">
                  <TableHead className="text-slate-300">Timestamp</TableHead>
                  <TableHead className="text-slate-300">Action Type</TableHead>
                  <TableHead className="text-slate-300">Description</TableHead>
                  <TableHead className="text-slate-300">Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-400">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-400">
                      No activity logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell className="text-slate-400 text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action_type)}</TableCell>
                      <TableCell className="text-slate-300">
                        {log.description || "No description"}
                      </TableCell>
                      <TableCell className="text-slate-400 font-mono text-xs">
                        {log.target_table || "-"}
                        {log.target_id && (
                          <span className="block text-slate-500">
                            {log.target_id.slice(0, 8)}...
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">Clear All Activity Logs?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete all activity logs. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-slate-300 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleClearLogs} className="bg-red-600 hover:bg-red-700">
              Clear Logs
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminLogs;
