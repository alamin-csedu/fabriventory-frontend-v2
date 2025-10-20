"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

export const StorageTable = ({ 
  storages,
  onEdit,
  onDelete,
  onView,
  sorting,
  onSortingChange
}) => {
  const handleSort = (column) => {
    const newSortOrder = sorting.sortBy === column && sorting.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    onSortingChange(column, newSortOrder)
  }

  const getSortIcon = (column) => {
    if (sorting.sortBy !== column) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sorting.sortOrder === 'ASC' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCapacity = (capacity) => {
    return capacity ? capacity.toFixed(2) : "N/A"
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-2">
                Name
                {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead>Parent</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('capacity')}
            >
              <div className="flex items-center gap-2">
                Capacity
                {getSortIcon('capacity')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('created_at')}
            >
              <div className="flex items-center gap-2">
                Created
                {getSortIcon('created_at')}
              </div>
            </TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {storages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No storage locations found
              </TableCell>
            </TableRow>
          ) : (
            storages.map((storage) => (
              <TableRow key={storage.id}>
                <TableCell className="font-medium">{storage.name}</TableCell>
                <TableCell>
                  {storage.parent_id ? (
                    <Badge variant="secondary">Sub-location</Badge>
                  ) : (
                    <Badge variant="outline">Main Location</Badge>
                  )}
                </TableCell>
                <TableCell>{formatCapacity(storage.capacity)}</TableCell>
                <TableCell>{formatDate(storage.created_at)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(storage)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(storage)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(storage)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
