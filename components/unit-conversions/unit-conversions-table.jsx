"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

export const UnitConversionsTable = ({ 
  conversions,
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

  const getOperationBadge = (operation) => {
    const variants = {
      'MULTIPLY': 'default',
      'DIVIDE': 'secondary'
    }
    return (
      <Badge variant={variants[operation] || 'outline'}>
        {operation}
      </Badge>
    )
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table className="min-w-[700px]">
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('from_id')}
            >
              <div className="flex items-center gap-2">
                From Unit
                {getSortIcon('from_id')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('to_id')}
            >
              <div className="flex items-center gap-2">
                To Unit
                {getSortIcon('to_id')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('operation')}
            >
              <div className="flex items-center gap-2">
                Operation
                {getSortIcon('operation')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('factor')}
            >
              <div className="flex items-center gap-2">
                Factor
                {getSortIcon('factor')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('sequence')}
            >
              <div className="flex items-center gap-2">
                Sequence
                {getSortIcon('sequence')}
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
          {conversions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No unit conversions found
              </TableCell>
            </TableRow>
          ) : (
            conversions.map((conversion) => (
              <TableRow key={`${conversion.from_id}-${conversion.to_id}`}>
                <TableCell className="font-medium">
                  {conversion.from_unit?.name || `Unit ${conversion.from_id}`}
                </TableCell>
                <TableCell className="font-medium">
                  {conversion.to_unit?.name || `Unit ${conversion.to_id}`}
                </TableCell>
                <TableCell>
                  {getOperationBadge(conversion.operation)}
                </TableCell>
                <TableCell className="font-mono">
                  {conversion.factor}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{conversion.sequence}</Badge>
                </TableCell>
                <TableCell>{formatDate(conversion.created_at)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(conversion)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(conversion)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(conversion)} className="text-destructive">
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
