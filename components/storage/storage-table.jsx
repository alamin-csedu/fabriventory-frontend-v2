"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown, GitBranch, ChevronDown, ChevronRight, Loader2, ChevronRight as ChevronRightIcon } from "lucide-react"
import { apiService } from "@/lib/api"
import { getFirstNStoragePathSegments } from "@/lib/utils"
import { toast } from "sonner"

export const StorageTable = ({ 
  storages,
  onEdit,
  onDelete,
  onView,
  sorting,
  onSortingChange
}) => {
  const [expandedHierarchies, setExpandedHierarchies] = useState(new Set())
  const [hierarchyData, setHierarchyData] = useState({})
  const [loadingHierarchies, setLoadingHierarchies] = useState(new Set())
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

  const fetchHierarchy = async (storageId) => {
    try {
      setLoadingHierarchies(prev => new Set([...prev, storageId]))
      const response = await apiService.getStorageHierarchy(storageId)
      if (response.data) {
        setHierarchyData(prev => ({
          ...prev,
          [storageId]: response.data
        }))
      }
    } catch (error) {
      console.error('Error fetching hierarchy:', error)
      toast.error('Failed to fetch storage hierarchy')
    } finally {
      setLoadingHierarchies(prev => {
        const newSet = new Set(prev)
        newSet.delete(storageId)
        return newSet
      })
    }
  }

  const toggleHierarchy = (storageId) => {
    const isExpanded = expandedHierarchies.has(storageId)
    if (isExpanded) {
      setExpandedHierarchies(prev => {
        const newSet = new Set(prev)
        newSet.delete(storageId)
        return newSet
      })
    } else {
      setExpandedHierarchies(prev => new Set([...prev, storageId]))
      if (!hierarchyData[storageId]) {
        fetchHierarchy(storageId)
      }
    }
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table className="min-w-[600px]">
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
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                No storage locations found
              </TableCell>
            </TableRow>
          ) : (
            storages.map((storage) => (
              <>
                <TableRow
                  key={storage.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onView(storage)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span title={storage.address ?? storage.name}>
                        {(storage.address != null && storage.address !== "")
                          ? getFirstNStoragePathSegments(storage.address, 3)
                          : (getFirstNStoragePathSegments(storage.name, 3) || storage.name)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleHierarchy(storage.id)
                        }}
                        title={expandedHierarchies.has(storage.id) ? 'Hide Hierarchy' : 'Show Hierarchy'}
                      >
                        <GitBranch className="h-3 w-3 text-blue-600" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{formatCapacity(storage.capacity)}</TableCell>
                  <TableCell>{formatDate(storage.created_at)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
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
                
                {/* Hierarchy Display Row */}
                {expandedHierarchies.has(storage.id) && (
                  <TableRow key={`${storage.id}-hierarchy`} className="bg-blue-50/30">
                    <TableCell colSpan={4} className="p-0">
                      <div className="p-3 border-l-4 border-blue-500 bg-blue-50/50">
                        <div className="flex items-center gap-2 mb-2">
                          <GitBranch className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-800 text-sm">Storage Hierarchy</span>
                          {loadingHierarchies.has(storage.id) && (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          )}
                        </div>
                        
                        {hierarchyData[storage.id] && (
                          <div className="flex items-center gap-1 text-sm">
                            {hierarchyData[storage.id].map((item, index) => {
                              const isLast = index === hierarchyData[storage.id].length - 1
                              
                              return (
                                <div key={item.id} className="flex items-center gap-1">
                                  <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border">
                                    {item.name} ({formatCapacity(item.capacity)})
                                  </span>
                                  {!isLast && (
                                    <ChevronRightIcon className="h-3 w-3 text-gray-400" />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
