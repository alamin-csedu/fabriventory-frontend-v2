"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { authApi } from '@/lib/api/auth'
import { User, Role, Permission } from '@/lib/types/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Shield, 
  Key, 
  UserPlus, 
  UserMinus, 
  ShieldPlus, 
  ShieldMinus,
  Plus,
  KeyMinus,
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'

export default function SuperAdminPanel() {
  const { user, hasRole } = useAuth()
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [isCreatePermissionOpen, setIsCreatePermissionOpen] = useState(false)

  // Check if user is super admin
  if (!hasRole('super_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access denied. Super admin privileges required.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersData, rolesData, permissionsData] = await Promise.all([
        authApi.getUsers(),
        authApi.getRoles(),
        authApi.getPermissions()
      ])
      
      setUsers(usersData.users || [])
      setRoles(rolesData.roles || [])
      setPermissions(permissionsData.permissions || [])
    } catch (error) {
      console.error('Failed to load admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (userData) => {
    try {
      await authApi.createUser(userData)
      toast.success('User created successfully')
      setIsCreateUserOpen(false)
      loadData()
    } catch (error) {
      console.error('Failed to create user:', error)
      toast.error('Failed to create user')
    }
  }

  const handleCreateRole = async (roleData) => {
    try {
      await authApi.createRole(roleData)
      toast.success('Role created successfully')
      setIsCreateRoleOpen(false)
      loadData()
    } catch (error) {
      console.error('Failed to create role:', error)
      toast.error('Failed to create role')
    }
  }

  const handleCreatePermission = async (permissionData) => {
    try {
      await authApi.createPermission(permissionData)
      toast.success('Permission created successfully')
      setIsCreatePermissionOpen(false)
      loadData()
    } catch (error) {
      console.error('Failed to create permission:', error)
      toast.error('Failed to create permission')
    }
  }

  const handleToggleUserStatus = async (userId, isActive) => {
    try {
      if (isActive) {
        await authApi.activateUser(userId)
        toast.success('User activated')
      } else {
        await authApi.deactivateUser(userId)
        toast.success('User deactivated')
      }
      loadData()
    } catch (error) {
      console.error('Failed to toggle user status:', error)
      toast.error('Failed to update user status')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      await authApi.deleteUser(userId)
      toast.success('User deleted successfully')
      loadData()
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error('Failed to delete user')
    }
  }

  const handleDeleteRole = async (roleId) => {
    if (!confirm('Are you sure you want to delete this role?')) return
    
    try {
      await authApi.deleteRole(roleId)
      toast.success('Role deleted successfully')
      loadData()
    } catch (error) {
      console.error('Failed to delete role:', error)
      toast.error('Failed to delete role')
    }
  }

  const handleDeletePermission = async (permissionId) => {
    if (!confirm('Are you sure you want to delete this permission?')) return
    
    try {
      await authApi.deletePermission(permissionId)
      toast.success('Permission deleted successfully')
      loadData()
    } catch (error) {
      console.error('Failed to delete permission:', error)
      toast.error('Failed to delete permission')
    }
  }

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPermissions = permissions.filter(permission => 
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.action.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Super Admin Panel</h1>
          <p className="text-muted-foreground mt-2">
            Manage users, roles, and permissions across the system
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Users</span> ({users.length})
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Roles</span> ({roles.length})
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Key className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Perms</span> ({permissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UsersManagement 
              users={filteredUsers}
              roles={roles}
              onCreateUser={handleCreateUser}
              onToggleUserStatus={handleToggleUserStatus}
              onDeleteUser={handleDeleteUser}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <RolesManagement 
              roles={filteredRoles}
              permissions={permissions}
              onCreateRole={handleCreateRole}
              onDeleteRole={handleDeleteRole}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </TabsContent>

          <TabsContent value="permissions" className="mt-6">
            <PermissionsManagement 
              permissions={filteredPermissions}
              onCreatePermission={handleCreatePermission}
              onDeletePermission={handleDeletePermission}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Users Management Component
function UsersManagement({ 
  users, 
  roles, 
  onCreateUser, 
  onToggleUserStatus, 
  onDeleteUser, 
  searchTerm, 
  onSearchChange 
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role_id: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onCreateUser(newUser)
    setNewUser({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role_id: ''
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 shrink-0">
              <UserPlus className="h-4 w-4" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system with appropriate role assignment.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={newUser.first_name}
                    onChange={e => setNewUser({...newUser, first_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={newUser.last_name}
                    onChange={e => setNewUser({...newUser, last_name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role_id} onValueChange={value => setNewRole({...newRole, role_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-lg font-medium text-primary">
                      {user.first_name[0]}{user.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.first_name} {user.last_name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                    <div className="flex gap-2 mt-2">
                      {user.roles && user.roles.length > 0 ? user.roles.map((role) => (
                        <Badge key={role.id} variant="secondary">
                          {role.name}
                        </Badge>
                      )) : (
                        <Badge variant="outline">No roles</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={user.is_active}
                    onCheckedChange={checked => onToggleUserStatus(user.id, checked)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteUser(user.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Roles Management Component
function RolesManagement({ 
  roles, 
  permissions, 
  onCreateRole, 
  onDeleteRole, 
  searchTerm, 
  onSearchChange 
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permission_ids: []
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onCreateRole(newRole)
    setNewRole({
      name: '',
      description: '',
      permission_ids: []
    })
  }

  const togglePermission = (permissionId) => {
    setNewRole(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permissionId)
        ? prev.permission_ids.filter(id => id !== permissionId)
        : [...prev.permission_ids, permissionId]
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 shrink-0">
              <ShieldPlus className="h-4 w-4" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Create a new role with specific permissions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={newRole.name}
                  onChange={e => setNewRole({...newRole, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newRole.description}
                  onChange={e => setNewRole({...newRole, description: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-md p-4">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`perm-${permission.id}`}
                        checked={newRole.permission_ids.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                        className="rounded"
                      />
                      <Label htmlFor={`perm-${permission.id}`} className="text-sm">
                        {permission.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Role</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {roles && roles.length > 0 ? roles.map((role) => (
          <Card key={role.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{role.name}</h3>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                  <div className="flex gap-2 mt-2">
                    {role.permissions && role.permissions.length > 0 ? (
                      <>
                        {role.permissions.slice(0, 5).map((permission) => (
                          <Badge key={permission.id} variant="outline" className="text-xs">
                            {permission.name}
                          </Badge>
                        ))}
                        {role.permissions.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 5} more
                          </Badge>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        No permissions
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteRole(role.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No roles found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Permissions Management Component
function PermissionsManagement({ 
  permissions, 
  onCreatePermission, 
  onDeletePermission, 
  searchTerm, 
  onSearchChange 
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newPermission, setNewPermission] = useState({
    name: '',
    resource: '',
    action: '',
    description: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onCreatePermission(newPermission)
    setNewPermission({
      name: '',
      resource: '',
      action: '',
      description: ''
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Create Permission
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Permission</DialogTitle>
              <DialogDescription>
                Create a new permission for the system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Permission Name</Label>
                <Input
                  id="name"
                  value={newPermission.name}
                  onChange={(e) => setNewPermission({...newPermission, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="resource">Resource</Label>
                <Input
                  id="resource"
                  value={newPermission.resource}
                  onChange={e => setNewPermission({...newPermission, resource: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="action">Action</Label>
                <Input
                  id="action"
                  value={newPermission.action}
                  onChange={e => setNewPermission({...newPermission, action: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newPermission.description}
                  onChange={(e) => setNewPermission({...newPermission, description: e.target.value})}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Permission</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {permissions.map((permission) => (
          <Card key={permission.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{permission.name}</h3>
                  <p className="text-sm text-muted-foreground">{permission.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{permission.resource}</Badge>
                    <Badge variant="outline">{permission.action}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeletePermission(permission.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
