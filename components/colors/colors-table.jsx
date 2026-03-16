"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"

export const ColorsTable = ({ 
  colors, 
  onView, 
  onEdit, 
  onDelete, 
  loading = false 
}) => {
  const [sorting, setSorting] = useState({ sortBy: '', sortOrder: 'asc' })

  const handleSort = (field) => {
    setSorting(prev => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getSortIcon = (field) => {
    if (sorting.sortBy !== field) return null
    return sorting.sortOrder === 'asc' ? '↑' : '↓'
  }

  if (loading) {
    return (
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Color Code</TableHead>
              <TableHead>RGB</TableHead>
              <TableHead>Pantone Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (!colors || colors.length === 0) {
    return (
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Color Code</TableHead>
              <TableHead>RGB</TableHead>
              <TableHead>Pantone Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No colors found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table className="min-w-[700px]">
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('name')}
            >
              Name {getSortIcon('name')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('color_code')}
            >
              Color Code {getSortIcon('color_code')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('rgb')}
            >
              RGB {getSortIcon('rgb')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('pantone_code')}
            >
              Pantone Code {getSortIcon('pantone_code')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('description')}
            >
              Description {getSortIcon('description')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('created_at')}
            >
              Created {getSortIcon('created_at')}
            </TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {colors.map((color) => (
            <TableRow key={color.id}>
              <TableCell className="font-medium">
                {color.name}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: color.color_code }}
                  />
                  <span className="font-mono text-sm">{color.color_code}</span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {color.rgb}
              </TableCell>
              <TableCell>
                {color.pantone_code ? (
                  <Badge variant="outline">{color.pantone_code}</Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {color.description || <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell>
                {format(new Date(color.created_at), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onView(color)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onEdit(color)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(color)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
