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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Pencil, Trash2, Plus } from "lucide-react";
import FormMessage from "@/components/form-message";

type Role = {
  id: string;
  name: string;
  permissions: Record<string, boolean>;
  created_at: string;
};

const availablePermissions = [
  { id: "manage_contracts", label: "Gerenciar Contratos" },
  { id: "manage_forms", label: "Gerenciar Formulários" },
  { id: "manage_clients", label: "Gerenciar Clientes" },
  { id: "view_analytics", label: "Visualizar Análises" },
  { id: "manage_users", label: "Gerenciar Usuários" },
  { id: "manage_roles", label: "Gerenciar Funções" },
  { id: "manage_own_contracts", label: "Gerenciar Próprios Contratos" },
  { id: "manage_own_forms", label: "Gerenciar Próprios Formulários" },
  { id: "manage_own_clients", label: "Gerenciar Próprios Clientes" },
];

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Form states
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, boolean>
  >({});

  const supabase = createClient();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("name");

      if (error) throw error;
      setRoles(data);
    } catch (error: any) {
      setError(error.message);
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!newRoleName) {
        setError("O nome da função é obrigatório");
        return;
      }

      // Create role
      const { error } = await supabase.from("roles").insert({
        name: newRoleName,
        permissions: selectedPermissions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSuccess("Função criada com sucesso");
      setIsAddDialogOpen(false);
      resetForm();
      fetchRoles();
    } catch (error: any) {
      setError(error.message);
      console.error("Error adding role:", error);
    }
  };

  const handleEditRole = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!selectedRole) return;

      // Don't allow editing super_admin role
      if (selectedRole.name === "super_admin") {
        setError("A função super_admin não pode ser editada");
        return;
      }

      // Update role
      const { error } = await supabase
        .from("roles")
        .update({
          name: newRoleName || selectedRole.name,
          permissions: selectedPermissions,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedRole.id);

      if (error) throw error;

      setSuccess("Função atualizada com sucesso");
      setIsEditDialogOpen(false);
      fetchRoles();
    } catch (error: any) {
      setError(error.message);
      console.error("Error updating role:", error);
    }
  };

  const handleDeleteRole = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!selectedRole) return;

      // Don't allow deleting default roles
      if (["super_admin", "admin", "client"].includes(selectedRole.name)) {
        setError("As funções padrão não podem ser excluídas");
        return;
      }

      // Check if role is assigned to any users
      const { data: userRoles, error: checkError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role_id", selectedRole.id);

      if (checkError) throw checkError;

      if (userRoles && userRoles.length > 0) {
        setError(
          `Esta função está atribuída a ${userRoles.length} usuário(s) e não pode ser excluída`,
        );
        return;
      }

      // Delete role
      const { error } = await supabase
        .from("roles")
        .delete()
        .eq("id", selectedRole.id);

      if (error) throw error;

      setSuccess("Função excluída com sucesso");
      setIsDeleteDialogOpen(false);
      fetchRoles();
    } catch (error: any) {
      setError(error.message);
      console.error("Error deleting role:", error);
    }
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setNewRoleName(role.name);
    setSelectedPermissions(role.permissions || {});
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setNewRoleName("");
    setSelectedPermissions({});
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [permissionId]: !prev[permissionId],
    }));
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
          <CardTitle>Carregando funções...</CardTitle>
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
            <CardTitle>Funções</CardTitle>
            <CardDescription>
              Gerencie as funções e permissões do sistema
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Adicionar Função</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Função</DialogTitle>
                <DialogDescription>
                  Defina o nome e as permissões para a nova função
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName">Nome da Função</Label>
                  <Input
                    id="roleName"
                    placeholder="Nome da função"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Permissões</Label>
                  <div className="space-y-2 border rounded-md p-3 max-h-60 overflow-y-auto">
                    {availablePermissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`permission-${permission.id}`}
                          checked={!!selectedPermissions[permission.id]}
                          onCheckedChange={() =>
                            handlePermissionToggle(permission.id)
                          }
                        />
                        <Label htmlFor={`permission-${permission.id}`}>
                          {permission.label}
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
                <Button onClick={handleAddRole}>Adicionar Função</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Permissões</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-4 text-gray-500"
                  >
                    Nenhuma função encontrada
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getRoleBadgeColor(role.name)}
                      >
                        {role.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions &&
                          Object.entries(role.permissions)
                            .filter(([_, value]) => value)
                            .map(([key]) => {
                              const permission = availablePermissions.find(
                                (p) => p.id === key,
                              );
                              return (
                                <Badge
                                  key={key}
                                  variant="outline"
                                  className="bg-gray-100"
                                >
                                  {permission?.label || key}
                                </Badge>
                              );
                            })}
                        {role.name === "super_admin" && (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-800"
                          >
                            Todas as permissões
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(role.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(role)}
                          disabled={role.name === "super_admin"}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(role)}
                          disabled={["super_admin", "admin", "client"].includes(
                            role.name,
                          )}
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

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Função</DialogTitle>
            <DialogDescription>
              Atualize o nome e as permissões da função
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editRoleName">Nome da Função</Label>
              <Input
                id="editRoleName"
                placeholder="Nome da função"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                disabled={
                  selectedRole?.name === "admin" ||
                  selectedRole?.name === "client"
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Permissões</Label>
              <div className="space-y-2 border rounded-md p-3 max-h-60 overflow-y-auto">
                {availablePermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`edit-permission-${permission.id}`}
                      checked={!!selectedPermissions[permission.id]}
                      onCheckedChange={() =>
                        handlePermissionToggle(permission.id)
                      }
                    />
                    <Label htmlFor={`edit-permission-${permission.id}`}>
                      {permission.label}
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
            <Button onClick={handleEditRole}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Função</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta função? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedRole && (
              <div className="space-y-2">
                <p>
                  <strong>Nome:</strong> {selectedRole.name}
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
            <Button variant="destructive" onClick={handleDeleteRole}>
              Excluir Função
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
