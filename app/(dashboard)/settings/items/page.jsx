"use client"

import { ItemsTable } from "@/components/items/items-table"
import { AddItemDialog } from "@/components/items/add-item-dialog"
import { EditItemDialog } from "@/components/items/edit-item-dialog"
import { DeleteItemDialog } from "@/components/items/delete-item-dialog"
import { ViewItemDialog } from "@/components/items/view-item-dialog"
import { ItemsPageSkeleton, ItemsTableSkeleton } from "@/components/items/items-page-skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination"
import { Plus, Search } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { OpenModalFromAction } from "@/components/open-modal-from-action"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

export default function ItemsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const initialLoadDone = useRef(false)
  const [tableLoading, setTableLoading] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [sorting, setSorting] = useState({
    sortBy: 'created_at',
    sortOrder: 'DESC'
  })

  // Centralized API functions
  const fetchItems = async () => {
    try {
      if (!initialLoadDone.current) {
        setLoading(true)
      }
      const response = await apiService.getItems({
        page: currentPage,
        size: perPage,
        name: debouncedSearchTerm || undefined,
        sort_by: sorting.sortBy,
        sort_direction: sorting.sortOrder,
      })
      if (response.data?.data) {
        setItems(response.data.data)
        // Update total count
        if (response.data.total !== undefined) {
          setTotalItems(response.data.total)
        }
      } else {
        setItems([])
      }
    } catch (error) {
      console.error('Error fetching items:', error)
      toast.error('Failed to fetch items')
      setItems([])
    } finally {
      setTableLoading(false)
      setIsSearching(false)
      if (!initialLoadDone.current) {
        setLoading(false)
        initialLoadDone.current = true
      }
    }
  }

  const createItem = async (itemData) => {
    try {
      await apiService.createItem(itemData)
      toast.success("Item created successfully")
      setIsAddDialogOpen(false)
      await fetchItems()
    } catch (error) {
      console.error('Error creating item:', error)
      toast.error("Failed to create item. Please try again.")
      throw error
    }
  }

  const updateItem = async (itemId, itemData) => {
    try {
      await apiService.updateItem(itemId, itemData)
      toast.success("Item updated successfully")
      setIsEditDialogOpen(false)
      setSelectedItem(null)
      await fetchItems()
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error("Failed to update item. Please try again.")
      throw error
    }
  }

  const deleteItem = async (itemId) => {
    try {
      await apiService.deleteItem(itemId)
      toast.success("Item deleted successfully")
      setIsDeleteDialogOpen(false)
      setSelectedItem(null)
      await fetchItems()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error("Failed to delete item. Please try again.")
      throw error
    }
  }

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== debouncedSearchTerm) {
        setIsSearching(true)
        setTableLoading(true)
        setDebouncedSearchTerm(searchTerm)
      }
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [searchTerm, debouncedSearchTerm])

  // Fetch items when dependencies change
  useEffect(() => {
    fetchItems()
  }, [debouncedSearchTerm, currentPage, perPage, sorting.sortBy, sorting.sortOrder])

  const handleRefresh = () => {
    fetchItems()
  }

  const handleSortingChange = (newSortBy, newSortOrder) => {
    setSorting({
      sortBy: newSortBy,
      sortOrder: newSortOrder
    })
  }

  // Dialog handlers
  const handleEditItem = (item) => {
    setSelectedItem(item)
    setIsEditDialogOpen(true)
  }

  const handleDeleteItem = (item) => {
    setSelectedItem(item)
    setIsDeleteDialogOpen(true)
  }

  const handleViewItem = (item) => {
    setSelectedItem(item)
    setIsViewDialogOpen(true)
  }

  // Show full page skeleton on initial load
  if (loading && !debouncedSearchTerm) {
    return (
      <>
        <OpenModalFromAction action="add-item" onOpen={() => setIsAddDialogOpen(true)} />
        <ItemsPageSkeleton />
      </>
    )
  }

  return (
    <div className="space-y-6">
      <OpenModalFromAction action="add-item" onOpen={() => setIsAddDialogOpen(true)} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-balance">Items Management</h1>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {tableLoading && debouncedSearchTerm && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          </div>

          {tableLoading ? (
            <ItemsTableSkeleton />
          ) : (
            <ItemsTable 
              items={items}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onView={handleViewItem}
              sorting={sorting}
              onSortingChange={handleSortingChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!tableLoading && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 bg-card rounded-lg border shadow-sm p-3 sm:p-4">
          <div className="text-sm text-gray-500 text-center sm:text-left">
            Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalItems)} of {totalItems} entries
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1 && !tableLoading) {
                      setCurrentPage(currentPage - 1)
                    }
                  }}
                  className={currentPage === 1 || tableLoading ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              <div className="hidden sm:flex">
                {(() => {
                  const totalPages = Math.ceil(totalItems / perPage)
                  const maxVisiblePages = 7
                  const pages = []
                  
                  if (totalPages <= maxVisiblePages) {
                    // Show all pages if total is small
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i)
                    }
                  } else {
                    // Show limited pages with ellipsis
                    const currentPageNum = currentPage
                    const halfVisible = Math.floor(maxVisiblePages / 2)
                    
                    // Always show first page
                    pages.push(1)
                    
                    if (currentPageNum > halfVisible + 2) {
                      pages.push('...')
                    }
                    
                    // Show pages around current page
                    const start = Math.max(2, currentPageNum - halfVisible)
                    const end = Math.min(totalPages - 1, currentPageNum + halfVisible)
                    
                    for (let i = start; i <= end; i++) {
                      if (i !== 1 && i !== totalPages) {
                        pages.push(i)
                      }
                    }
                    
                    if (currentPageNum < totalPages - halfVisible - 1) {
                      pages.push('...')
                    }
                    
                    // Always show last page
                    if (totalPages > 1) {
                      pages.push(totalPages)
                    }
                  }
                  
                  return pages.map((page, index) => (
                    <PaginationItem key={index}>
                      {page === '...' ? (
                        <span className="px-3 py-2 text-gray-500">...</span>
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (!tableLoading) {
                              setCurrentPage(page)
                            }
                          }}
                          isActive={page === currentPage}
                          className={tableLoading ? "pointer-events-none opacity-50" : ""}
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))
                })()}
              </div>
              <div className="sm:hidden">
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                    }}
                    isActive={true}
                  >
                    Page {currentPage}
                  </PaginationLink>
                </PaginationItem>
              </div>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < Math.ceil(totalItems / perPage) && !tableLoading) {
                      setCurrentPage(currentPage + 1)
                    }
                  }}
                  className={currentPage === Math.ceil(totalItems / perPage) || tableLoading ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <AddItemDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onSubmit={createItem}
      />

      {selectedItem && (
        <>
          <EditItemDialog
            item={selectedItem}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSubmit={updateItem}
          />
          <DeleteItemDialog
            item={selectedItem}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onSubmit={deleteItem}
          />
          <ViewItemDialog 
            item={selectedItem} 
            open={isViewDialogOpen} 
            onOpenChange={setIsViewDialogOpen} 
          />
        </>
      )}
    </div>
  )
}
