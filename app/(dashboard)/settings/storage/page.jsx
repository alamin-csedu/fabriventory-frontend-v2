"use client"

import { StorageTable } from "@/components/storage/storage-table"
import { AddStorageDialog } from "@/components/storage/add-storage-dialog"
import { EditStorageDialog } from "@/components/storage/edit-storage-dialog"
import { DeleteStorageDialog } from "@/components/storage/delete-storage-dialog"
import { ViewStorageDialog } from "@/components/storage/view-storage-dialog"
import { StoragePageSkeleton, StorageTableSkeleton, StatsCardsSkeleton } from "@/components/storage/storage-page-skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination"
import { Plus, Search, Warehouse, TrendingUp, Package } from "lucide-react"
import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

export default function StoragePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedStorage, setSelectedStorage] = useState(null)
  const [storages, setStorages] = useState([])
  const [stats, setStats] = useState({
    totalStorages: 0,
    activeStorages: 0,
    totalCapacity: 0
  })
  const [loading, setLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(2)
  const [totalStorages, setTotalStorages] = useState(0)
  const [sorting, setSorting] = useState({
    sortBy: 'created_at',
    sortOrder: 'DESC'
  })

  // Centralized API functions
  const fetchStorages = async () => {
    try {
      const response = await apiService.getStorages({
        page: currentPage,
        size: perPage,
        name: debouncedSearchTerm || undefined,
        sort_by: sorting.sortBy,
        sort_direction: sorting.sortOrder,
      })
      if (response.data?.data) {
        setStorages(response.data.data)
        // Update total count
        if (response.data.total !== undefined) {
          setTotalStorages(response.data.total)
        }
      } else {
        setStorages([])
      }
    } catch (error) {
      console.error('Error fetching storages:', error)
      toast.error('Failed to fetch storages')
      setStorages([])
    } finally {
      setTableLoading(false)
      setIsSearching(false)
    }
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await apiService.getStorages({ page: 1, size: 10 })
      
      if (response.data?.data) {
        const storages = response.data.data
        const totalCapacity = storages.reduce((sum, storage) => sum + (storage.capacity || 0), 0)
        setStats({
          totalStorages: storages.length,
          activeStorages: storages.length, // All storages are considered active for now
          totalCapacity: totalCapacity
        })
      }
    } catch (error) {
      console.error('Error fetching storage stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const createStorage = async (storageData) => {
    try {
      await apiService.createStorage(storageData)
      toast.success("Storage created successfully")
      setIsAddDialogOpen(false)
      await fetchStorages()
      await fetchStats()
    } catch (error) {
      console.error('Error creating storage:', error)
      toast.error("Failed to create storage. Please try again.")
      throw error
    }
  }

  const updateStorage = async (storageId, storageData) => {
    try {
      await apiService.updateStorage(storageId, storageData)
      toast.success("Storage updated successfully")
      setIsEditDialogOpen(false)
      setSelectedStorage(null)
      await fetchStorages()
      await fetchStats()
    } catch (error) {
      console.error('Error updating storage:', error)
      toast.error("Failed to update storage. Please try again.")
      throw error
    }
  }

  const deleteStorage = async (storageId) => {
    try {
      await apiService.deleteStorage(storageId)
      toast.success("Storage deleted successfully")
      setIsDeleteDialogOpen(false)
      setSelectedStorage(null)
      await fetchStorages()
      await fetchStats()
    } catch (error) {
      console.error('Error deleting storage:', error)
      toast.error("Failed to delete storage. Please try again.")
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

  // Fetch storages when dependencies change
  useEffect(() => {
    fetchStorages()
  }, [debouncedSearchTerm, currentPage, perPage, sorting.sortBy, sorting.sortOrder])

  useEffect(() => {
    fetchStats()
  }, [])

  const handleRefresh = () => {
    fetchStats()
    fetchStorages()
  }

  const handleSortingChange = (newSortBy, newSortOrder) => {
    setSorting({
      sortBy: newSortBy,
      sortOrder: newSortOrder
    })
  }

  // Dialog handlers
  const handleEditStorage = (storage) => {
    setSelectedStorage(storage)
    setIsEditDialogOpen(true)
  }

  const handleDeleteStorage = (storage) => {
    setSelectedStorage(storage)
    setIsDeleteDialogOpen(true)
  }

  const handleViewStorage = (storage) => {
    setSelectedStorage(storage)
    setIsViewDialogOpen(true)
  }

  // Show full page skeleton on initial load
  if (loading && !debouncedSearchTerm) {
    return <StoragePageSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Storage Management</h1>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Storage
        </Button>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <StatsCardsSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Storages</CardTitle>
              <Warehouse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalStorages}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary">Active</span> locations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Storages</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.activeStorages}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary">Currently</span> active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalCapacity.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary">Units</span> available
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search storage locations..."
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
            <StorageTableSkeleton />
          ) : (
            <StorageTable 
              storages={storages}
              onEdit={handleEditStorage}
              onDelete={handleDeleteStorage}
              onView={handleViewStorage}
              sorting={sorting}
              onSortingChange={handleSortingChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!tableLoading && totalStorages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 bg-white rounded-lg border shadow-sm p-4">
          <div className="text-sm text-gray-500 text-center sm:text-left">
            Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalStorages)} of {totalStorages} entries
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
                  const totalPages = Math.ceil(totalStorages / perPage)
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
                    if (currentPage < Math.ceil(totalStorages / perPage) && !tableLoading) {
                      setCurrentPage(currentPage + 1)
                    }
                  }}
                  className={currentPage === Math.ceil(totalStorages / perPage) || tableLoading ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <AddStorageDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onSubmit={createStorage}
      />

      {selectedStorage && (
        <>
          <EditStorageDialog
            storage={selectedStorage}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSubmit={updateStorage}
          />
          <DeleteStorageDialog
            storage={selectedStorage}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onSubmit={deleteStorage}
          />
          <ViewStorageDialog 
            storage={selectedStorage} 
            open={isViewDialogOpen} 
            onOpenChange={setIsViewDialogOpen} 
          />
        </>
      )}
    </div>
  )
}
