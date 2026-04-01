"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

export const VendorsTable = ({ 
  vendors = [],
  onEdit,
  onDelete,
  onView,
  sorting, 
  onSortingChange 
}) => {

  const handleEdit = (vendor) => {
    onEdit?.(vendor)
  }

  const handleDelete = (vendor) => {
    onDelete?.(vendor)
  }

  const handleView = (vendor) => {
    onView?.(vendor)
  }

  const handleSort = (column) => {
    const newSortOrder = sorting.sortBy === column && sorting.sortOrder === 'asc' ? 'desc' : 'asc'
    onSortingChange(column, newSortOrder)
  }

  const getSortIcon = (column) => {
    if (sorting.sortBy !== column) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sorting.sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatPhoneNumbers = (phoneNumbers) => {
    if (!phoneNumbers || phoneNumbers.length === 0) return "N/A"
    return phoneNumbers.join(", ")
  }


  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[700px]">
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
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
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
            {vendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No vendors found
                </TableCell>
              </TableRow>
            ) : (
              vendors.map((vendor) => (
                <TableRow
                  key={vendor.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleView(vendor)}
                >
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.email}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {formatPhoneNumbers(vendor.phone_number)}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">{vendor.address}</TableCell>
                  <TableCell>{formatDate(vendor.created_at)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(vendor)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(vendor)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(vendor)} className="text-destructive">
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


    </>
  )
}
