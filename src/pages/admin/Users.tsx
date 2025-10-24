import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Shield, ShieldOff, Search, RefreshCw, UserPlus } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";

interface UserProfile {
  id: string;
  user_id: string;
  user_name: string;
  created_at: string;
  email?: string;
  isAdmin?: boolean;
}

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionType, setActionType] = useState<"delete" | "promote" | "demote" | null>(null);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: "",
    password: "",
    fullName: "",
    makeAdmin: false,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Call edge function to fetch all users (including auth.users data)
      const { data, error } = await supabase.functions.invoke('fetch-all-users');

      if (error) throw error;

      if (data?.users) {
        const formattedUsers = data.users.map((user: any) => ({
          id: user.profile_id || user.id,
          user_id: user.id,
          user_name: user.user_name,
          email: user.email,
          created_at: user.created_at,
          isAdmin: user.isAdmin,
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Make sure you have admin privileges.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async () => {
    if (!selectedUser) return;

    try {
      if (actionType === "promote") {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: selectedUser.user_id, role: "admin" });
        
        if (error) throw error;

        await supabase.from("admin_actions").insert({
          action_type: "user_promoted",
          target_table: "user_roles",
          target_id: selectedUser.user_id,
          description: `Promoted ${selectedUser.user_name} to admin`,
        });

        toast({ title: "User promoted to admin" });
      } else if (actionType === "demote") {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", selectedUser.user_id)
          .eq("role", "admin");
        
        if (error) throw error;

        await supabase.from("admin_actions").insert({
          action_type: "user_demoted",
          target_table: "user_roles",
          target_id: selectedUser.user_id,
          description: `Demoted ${selectedUser.user_name} from admin`,
        });

        toast({ title: "Admin privileges removed" });
      } else if (actionType === "delete") {
        const { error } = await supabase
          .from("user_learning_profiles")
          .delete()
          .eq("user_id", selectedUser.user_id);
        
        if (error) throw error;

        await supabase.from("admin_actions").insert({
          action_type: "user_deleted",
          target_table: "user_learning_profiles",
          target_id: selectedUser.user_id,
          description: `Deleted user ${selectedUser.user_name}`,
        });

        toast({ title: "User deleted" });
      }

      fetchUsers();
    } catch (error) {
      console.error("Error performing action:", error);
      toast({
        title: "Error",
        description: "Failed to perform action",
        variant: "destructive",
      });
    } finally {
      setSelectedUser(null);
      setActionType(null);
    }
  };

  const handleAddUser = async () => {
    if (!newUserData.email || !newUserData.password) {
      toast({
        title: "Error",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create user via Supabase admin API
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: newUserData.email,
        password: newUserData.password,
        options: {
          data: {
            full_name: newUserData.fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // If admin, add role
        if (newUserData.makeAdmin) {
          await supabase
            .from("user_roles")
            .insert({ user_id: authData.user.id, role: "admin" });
        }

        await supabase.from("admin_actions").insert({
          action_type: "user_created",
          target_table: "user_learning_profiles",
          target_id: authData.user.id,
          description: `Created user ${newUserData.email}${newUserData.makeAdmin ? " with admin role" : ""}`,
        });

        toast({ 
          title: "User created successfully",
          description: `User ${newUserData.email} has been added to the system`,
        });
        
        setAddUserDialogOpen(false);
        setNewUserData({ email: "", password: "", fullName: "", makeAdmin: false });
        fetchUsers();
      }
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add user",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">User Management</h1>
          <p className="text-slate-400 mt-2">Manage users and their permissions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchUsers} variant="outline" className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setAddUserDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">All Users</CardTitle>
          <CardDescription className="text-slate-400">
            Total: {users.length} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-800 hover:bg-slate-800">
                  <TableHead className="text-slate-300">Name</TableHead>
                  <TableHead className="text-slate-300">User ID</TableHead>
                  <TableHead className="text-slate-300">Role</TableHead>
                  <TableHead className="text-slate-300">Joined</TableHead>
                  <TableHead className="text-slate-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-400">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-400">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell className="font-medium text-slate-200">{user.user_name}</TableCell>
                      <TableCell className="text-slate-400 font-mono text-xs">{user.user_id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Admin</Badge>
                        ) : (
                          <Badge variant="outline" className="border-slate-700 text-slate-400">User</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {user.isAdmin ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType("demote");
                            }}
                          >
                            <ShieldOff className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType("promote");
                            }}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedUser(user);
                            setActionType("delete");
                          }}
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

      <AlertDialog open={!!selectedUser && !!actionType} onOpenChange={() => {
        setSelectedUser(null);
        setActionType(null);
      }}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">
              {actionType === "delete" && "Delete User"}
              {actionType === "promote" && "Promote to Admin"}
              {actionType === "demote" && "Remove Admin"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {actionType === "delete" && `Are you sure you want to delete ${selectedUser?.user_name}? This action cannot be undone.`}
              {actionType === "promote" && `Grant admin privileges to ${selectedUser?.user_name}?`}
              {actionType === "demote" && `Remove admin privileges from ${selectedUser?.user_name}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-slate-300 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={actionType === "delete" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add User Dialog */}
      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription className="text-slate-400">
              Create a new user account for the learning platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-slate-300">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-200"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-slate-300">Password *</Label>
              <Input
                id="password"
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-200"
                placeholder="Min. 6 characters"
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
              <Input
                id="fullName"
                value={newUserData.fullName}
                onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-200"
                placeholder="John Doe"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="makeAdmin"
                checked={newUserData.makeAdmin}
                onChange={(e) => setNewUserData({ ...newUserData, makeAdmin: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="makeAdmin" className="text-slate-300 cursor-pointer">
                Make this user an admin
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setAddUserDialogOpen(false);
                setNewUserData({ email: "", password: "", fullName: "", makeAdmin: false });
              }} 
              className="bg-slate-800 border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button onClick={handleAddUser} className="bg-red-600 hover:bg-red-700">
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
