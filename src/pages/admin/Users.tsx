import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Shield, ShieldOff, Search, RefreshCw, UserPlus, HelpCircle, AlertTriangle, BookOpen, Info } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
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

    // Prevent deleting or demoting admin user
    if ((actionType === "delete" || actionType === "demote") && selectedUser.email === "admin@gmail.com") {
      toast({
        title: "Action Blocked",
        description: "Cannot delete or demote the primary admin account",
        variant: "destructive",
      });
      setSelectedUser(null);
      setActionType(null);
      return;
    }

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
          admin_user_id: (await supabase.auth.getUser()).data.user?.id,
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
          admin_user_id: (await supabase.auth.getUser()).data.user?.id,
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
          admin_user_id: (await supabase.auth.getUser()).data.user?.id,
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
          admin_user_id: (await supabase.auth.getUser()).data.user?.id,
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
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            User Management
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setHelpDialogOpen(true)}
              className="text-blue-400 hover:text-blue-300 hover:bg-slate-800"
            >
              <HelpCircle className="h-6 w-6" />
            </Button>
          </h1>
          <p className="text-slate-400 mt-2">Manage users and their permissions safely</p>
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

      {/* Warning Banner */}
      <Alert className="bg-yellow-500/10 border-yellow-500/50">
        <AlertTriangle className="h-5 w-5 text-yellow-500" />
        <AlertTitle className="text-yellow-500">User Database Management</AlertTitle>
        <AlertDescription className="text-slate-300">
          You are managing user accounts and permissions. Changes affect user access and data. 
          The primary admin account (admin@gmail.com) is protected and cannot be deleted or demoted.
        </AlertDescription>
      </Alert>

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
                            disabled={user.email === "admin@gmail.com"}
                            title={user.email === "admin@gmail.com" ? "Cannot demote primary admin" : "Remove admin role"}
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
                            title="Promote to admin"
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
                          disabled={user.email === "admin@gmail.com"}
                          title={user.email === "admin@gmail.com" ? "Cannot delete primary admin" : "Delete user"}
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
        <AlertDialogContent className="bg-slate-900 border-red-500/50 max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              {actionType === "delete" && "⚠️ WARNING: Delete User"}
              {actionType === "promote" && "⚠️ WARNING: Grant Admin Access"}
              {actionType === "demote" && "⚠️ WARNING: Remove Admin Access"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 space-y-3">
              {actionType === "delete" && (
                <>
                  <p className="font-semibold text-lg text-red-400">You are about to permanently delete user: {selectedUser?.user_name}</p>
                  <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                    <p className="font-medium text-red-400 mb-2">⛔ This will:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Permanently delete the user profile from the database</li>
                      <li>Remove all associated user data and progress</li>
                      <li>Revoke all access to the platform immediately</li>
                      <li>Cannot be undone - data recovery is not possible</li>
                    </ul>
                  </div>
                  <p className="text-red-400 font-semibold">Are you absolutely sure?</p>
                </>
              )}
              {actionType === "promote" && (
                <>
                  <p className="font-semibold text-lg text-orange-400">You are about to grant admin privileges to: {selectedUser?.user_name}</p>
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded p-3">
                    <p className="font-medium text-orange-400 mb-2">🔑 Admin privileges include:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Full access to user management (create, edit, delete users)</li>
                      <li>Ability to modify game code and configurations</li>
                      <li>Access to system controls and database operations</li>
                      <li>Can view and modify all platform data</li>
                    </ul>
                  </div>
                  <p className="text-orange-400 font-semibold">Only grant admin access to trusted individuals!</p>
                </>
              )}
              {actionType === "demote" && (
                <>
                  <p className="font-semibold text-lg text-yellow-400">You are about to remove admin privileges from: {selectedUser?.user_name}</p>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                    <p className="font-medium text-yellow-400 mb-2">📋 This will:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Revoke all admin panel access</li>
                      <li>Remove database modification permissions</li>
                      <li>Restrict to regular user privileges only</li>
                      <li>User will lose access immediately</li>
                    </ul>
                  </div>
                  <p className="text-yellow-400 font-semibold">Confirm removal of admin access?</p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-slate-300 hover:bg-slate-700">
              Cancel - Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={`${actionType === "delete" ? "bg-red-600 hover:bg-red-700" : actionType === "promote" ? "bg-orange-600 hover:bg-orange-700" : "bg-yellow-600 hover:bg-yellow-700"} font-semibold`}
            >
              {actionType === "delete" && "Yes, Delete User"}
              {actionType === "promote" && "Yes, Grant Admin Access"}
              {actionType === "demote" && "Yes, Remove Admin Access"}
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

      {/* Help Dialog */}
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-400" />
              User Management Help Guide
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Complete guide to managing users safely and effectively
            </DialogDescription>
          </DialogHeader>

          <Accordion type="single" collapsible className="w-full space-y-2">
            <AccordionItem value="overview" className="bg-slate-800 border-slate-700 rounded px-4">
              <AccordionTrigger className="text-slate-200 hover:text-white">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-400" />
                  What is User Management?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-300 space-y-2">
                <p>User Management allows you to control who has access to your learning platform and what permissions they have.</p>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 mt-2">
                  <p className="font-semibold text-blue-400">Key Features:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>View all registered users</li>
                    <li>Create new user accounts</li>
                    <li>Grant or revoke admin privileges</li>
                    <li>Delete user accounts</li>
                    <li>Search and filter users</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="roles" className="bg-slate-800 border-slate-700 rounded px-4">
              <AccordionTrigger className="text-slate-200 hover:text-white">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  Understanding User Roles
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-300 space-y-3">
                <div className="space-y-3">
                  <div className="bg-slate-900 p-3 rounded">
                    <p className="font-semibold text-green-400 flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Regular User
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                      <li>Access to learning games and activities</li>
                      <li>Can view their own progress and stats</li>
                      <li>Can participate in leaderboards</li>
                      <li>Cannot access admin panel</li>
                    </ul>
                  </div>
                  <div className="bg-slate-900 p-3 rounded">
                    <p className="font-semibold text-red-400 flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Admin User
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                      <li>All regular user permissions</li>
                      <li>Full access to admin panel</li>
                      <li>Can manage all users and permissions</li>
                      <li>Can modify game code and system settings</li>
                      <li>Can view activity logs and analytics</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="protected" className="bg-slate-800 border-slate-700 rounded px-4">
              <AccordionTrigger className="text-slate-200 hover:text-white">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  Protected Admin Account
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-300 space-y-2">
                <Alert className="bg-red-500/10 border-red-500/50">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-slate-300">
                    <strong className="text-red-400">Critical Security Feature:</strong> The primary admin account (admin@gmail.com) is permanently protected and cannot be deleted or demoted.
                  </AlertDescription>
                </Alert>
                <div className="mt-3 space-y-2">
                  <p className="font-semibold">Why is this important?</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Prevents accidental lockout from the admin panel</li>
                    <li>Ensures always at least one admin account exists</li>
                    <li>Protects against unauthorized access removal</li>
                  </ul>
                </div>
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
                      <li>Verify user identity before granting admin access</li>
                      <li>Use strong passwords for all accounts</li>
                      <li>Regularly review active admin accounts</li>
                      <li>Remove access for inactive users</li>
                      <li>Read all warning dialogs carefully</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                    <p className="font-semibold text-red-400">❌ DON'T:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Grant admin access to untrusted users</li>
                      <li>Share admin credentials</li>
                      <li>Delete users without confirmation</li>
                      <li>Ignore security warnings</li>
                      <li>Create multiple unnecessary admin accounts</li>
                    </ul>
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
    </div>
  );
};

export default AdminUsers;
