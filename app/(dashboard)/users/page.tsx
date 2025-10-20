"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Shield,
  Mail,
  Calendar,
  Filter
} from 'lucide-react'
import { SuperAdminGuard } from '@/components/auth/role-guard'
import { authApi } from '@/lib/api/auth'
import { User, Role, CreateUserRequest, UpdateUserRequest } from '@/lib/types/auth'
import { useAuth } from '@/contexts/auth-context'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    is_active: true,
    role_ids: []
  })

  const { user: currentUser } = useAuth()

  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await authApi.getUsers({
        page: 1,
        size: 100,
        search: searchTerm || undefined,
        role_id: selectedRole !== 'all' ? parseInt(selectedRole) : undefined
      })
      setUsers(response.data)
    } catch (error) {
      setError('Failed to load users')
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const response = await authApi.getRoles({ page: 1, page_size: 100 })
      setRoles(response.data || [])
    } catch (error) {
      console.error('Error loading roles:', error)
      setRoles([]) // Set empty array on error
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedRole])

  const handleCreateUser = async () => {
    try {
      await authApi.createUser(formData)
      setIsCreateDialogOpen(false)
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        is_active: true,
        role_ids: []
      })
      loadUsers()
    } catch (error) {
      setError('Failed to create user')
      console.error('Error creating user:', error)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    
    try {
      const updateData: UpdateUserRequest = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        is_active: formData.is_active,
        role_ids: formData.role_ids
      }
      
      await authApi.updateUser(selectedUser.id, updateData)
      setIsEditDialogOpen(false)
      setSelectedUser(null)
      loadUsers()
    } catch (error) {
      setError('Failed to update user')
      console.error('Error updating user:', error)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      await authApi.deleteUser(userId)
      loadUsers()
    } catch (error) {
      setError('Failed to delete user')
      console.error('Error deleting user:', error)
    }
  }

  const handleToggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      if (isActive) {
        await authApi.deactivateUser(userId)
      } else {
        await authApi.activateUser(userId)
      }
      loadUsers()
    } catch (error) {
      setError('Failed to update user status')
      console.error('Error updating user status:', error)
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Don't pre-fill password
      first_name: user.first_name,
      last_name: user.last_name,
      is_active: user.is_active,
      role_ids: user.roles ? user.roles.map(role => role.id) : []
    })
    setIsEditDialogOpen(true)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRole === 'all' || 
      (user.roles && user.roles.some(role => role.id.toString() === selectedRole))
    
    return matchesSearch && matchesRole
  })

  return (
    <SuperAdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage users, roles, and permissions for your organization
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system. They will receive login credentials.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roles">Roles</Label>
                  <Select
                    value={formData.role_ids && formData.role_ids.length > 0 ? formData.role_ids[0].toString() : ''}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      role_ids: value ? [parseInt(value)] : [] 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles && roles.length > 0 ? roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name} - {role.description}
                        </SelectItem>
                      )) : (
                        <SelectItem value="" disabled>
                          No roles available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser}>Create User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage all users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span className="ml-2">Loading users...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {user.first_name[0]}{user.last_name[0]}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles && user.roles.length > 0 ? user.roles.map((role) => (
                              <Badge key={role.id} variant="secondary" className="text-xs">
                                {role.name?.replace('_', ' ') || 'Unknown Role'}
                              </Badge>
                            )) : (
                              <Badge variant="outline" className="text-xs">
                                No roles
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? "default" : "secondary"}>
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {user.last_login_at 
                                ? new Date(user.last_login_at).toLocaleDateString()
                                : 'Never'
                              }
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                              disabled={user.id === currentUser?.id}
                            >
                              {user.is_active ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.id === currentUser?.id}
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
            </div>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and roles.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input
                    id="editFirstName"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editUsername">Username</Label>
                <Input
                  id="editUsername"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRoles">Roles</Label>
                <Select
                  value={formData.role_ids && formData.role_ids.length > 0 ? formData.role_ids[0].toString() : ''}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    role_ids: value ? [parseInt(value)] : [] 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                  {roles && roles.length > 0 ? roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name} - {role.description}
                    </SelectItem>
                  )) : (
                    <SelectItem value="" disabled>
                      No roles available
                    </SelectItem>
                  )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser}>Update User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminGuard>
  )
}
