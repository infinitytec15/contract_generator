"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Pencil, Trash2, Shield, Mail } from "lucide-react";
import FormMessage from "@/components/form-message";

type User = {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  roles: { id: string; name: string }[];
};

type Role = {
  id: string;
  name: string;
  permissions: any;
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, email, full_name, created_at");

      if (usersError) throw usersError;

      // For each user, fetch their roles
      const usersWithRoles = await Promise.all(
        usersData.map(async (user) => {
          const { data: userRoles, error: rolesError } = await supabase
            .from("user_roles")
            .select(
              `
              role_id,
              roles(id, name)
            `,
            )
            .eq("user_id", user.id);

          if (rolesError) throw rolesError;

          return {
            ...user,
            roles: userRoles.map((ur) => ur.roles),
          };
        }),
      );

      setUsers(usersWithRoles);
    } catch (error: any) {
      setError(error.message);
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from("roles")
        .select("id, name, permissions");

      if (error) throw error;
      setRoles(data);
    } catch (error: any) {
      setError(error.message);
      console.error("Error fetching roles:", error);
    }
  };

  const handleAddUser = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!newUserEmail || !newUserPassword || !newUserFullName) {
        setError("Todos os campos são obrigatórios");
        return;
      }

      // Create user in Auth
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: newUserEmail,
          password: newUserPassword,
          email_confirm: true,
          user_metadata: { full_name: newUserFullName },
        });

      if (authError) throw authError;

      // Create user in users table
      const { error: userError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: newUserEmail,
        full_name: newUserFullName,
        name: newUserFullName,
        user_id: authData.user.id,
        token_identifier: authData.user.id,
        created_at: new Date().toISOString(),
      });

      if (userError) throw userError;

      // Assign roles to user
      if (selectedRoles.length > 0) {
        const roleInserts = selectedRoles.map((roleId) => ({
          user_id: authData.user.id,
          role_id: roleId,
          created_at: new Date().toISOString(),
        }));

        const { error: rolesError } = await supabase
          .from("user_roles")
          .insert(roleInserts);

        if (rolesError) throw rolesError;
      }

      setSuccess("Usuário criado com sucesso");
      setIsAddDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      setError(error.message);
      console.error("Error adding user:", error);
    }
  };

  const handleEditUser = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!selectedUser) return;

      // Update user in users table
      const { error: userError } = await supabase
        .from("users")
        .update({
          full_name: newUserFullName || selectedUser.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedUser.id);

      if (userError) throw userError;

      // Delete existing roles
      const { error: deleteRolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", selectedUser.id);

      if (deleteRolesError) throw deleteRolesError;

      // Assign new roles
      if (selectedRoles.length > 0) {
        const roleInserts = selectedRoles.map((roleId) => ({
          user_id: selectedUser.id,
          role_id: roleId,
          created_at: new Date().toISOString(),
        }));

        const { error: rolesError } = await supabase
          .from("user_roles")
          .insert(roleInserts);

        if (rolesError) throw rolesError;
      }

      setSuccess("Usuário atualizado com sucesso");
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      setError(error.message);
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!selectedUser) return;

      // Delete user from Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(
        selectedUser.id,
      );

      if (authError) throw authError;

      // The user_roles and users entries will be deleted automatically due to cascade delete

      setSuccess("Usuário excluído com sucesso");
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      setError(error.message);
      console.error("Error deleting user:", error);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setNewUserFullName(user.full_name);
    setSelectedRoles(user.roles.map((role) => role.id));
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setNewUserEmail("");
    setNewUserFullName("");
    setNewUserPassword("");
    setSelectedRoles([]);
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case "super_admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "client":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando usuários...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {error && <FormMessage type="error" message={error} className="mb-4" />}
      {success && (
        <FormMessage type="success" message={success} className="mb-4" />
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Usuários</CardTitle>
            <CardDescription>
              Gerencie os usuários administrativos do sistema
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span>Adicionar Usuário</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Preencha os dados para criar um novo usuário administrativo
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    placeholder="Nome Completo"
                    value={newUserFullName}
                    onChange={(e) => setNewUserFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Senha"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Funções</Label>
                  <div className="space-y-2 border rounded-md p-3">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={() => handleRoleToggle(role.id)}
                        />
                        <Label
                          htmlFor={`role-${role.id}`}
                          className="flex items-center gap-2"
                        >
                          <Badge
                            variant="outline"
                            className={getRoleBadgeColor(role.name)}
                          >
                            {role.name}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddUser}>Adicionar Usuário</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Funções</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-gray-500"
                  >
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge
                            key={role.id}
                            variant="outline"
                            className={getRoleBadgeColor(role.name)}
                          >
                            {role.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editFullName">Nome Completo</Label>
              <Input
                id="editFullName"
                placeholder="Nome Completo"
                value={newUserFullName}
                onChange={(e) => setNewUserFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Funções</Label>
              <div className="space-y-2 border rounded-md p-3">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-role-${role.id}`}
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={() => handleRoleToggle(role.id)}
                    />
                    <Label
                      htmlFor={`edit-role-${role.id}`}
                      className="flex items-center gap-2"
                    >
                      <Badge
                        variant="outline"
                        className={getRoleBadgeColor(role.name)}
                      >
                        {role.name}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditUser}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedUser && (
              <div className="space-y-2">
                <p>
                  <strong>Nome:</strong> {selectedUser.full_name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Excluir Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
