"use client"

import { UnitsTable } from "@/components/units/units-table"
import { AddUnitDialog } from "@/components/units/add-unit-dialog"
import { EditUnitDialog } from "@/components/units/edit-unit-dialog"
import { DeleteUnitDialog } from "@/components/units/delete-unit-dialog"
import { ViewUnitDialog } from "@/components/units/view-unit-dialog"
import { SettingsListPageSkeleton } from "@/components/settings/settings-list-page-skeleton"
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
import { apiService } from "@/lib/api"
import { toast } from "sonner"

export default function UnitsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const initialLoadDone = useRef(false)
  const [tableLoading, setTableLoading] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [totalUnits, setTotalUnits] = useState(0)
  const [sorting, setSorting] = useState({
    sortBy: 'created_at',
    sortOrder: 'DESC'
  })

  // Centralized API functions
  const fetchUnits = async () => {
    try {
      if (!initialLoadDone.current) {
        setLoading(true)
      }
      const response = await apiService.getUnits({
        page: currentPage,
        size: perPage,
        name: debouncedSearchTerm || undefined,
        sort_by: sorting.sortBy,
        sort_direction: sorting.sortOrder,
      })
      if (response.data?.data) {
        setUnits(response.data.data)
        // Update total count
        if (response.data.total !== undefined) {
          setTotalUnits(response.data.total)
        }
      } else {
        setUnits([])
      }
    } catch (error) {
      console.error('Error fetching units:', error)
      toast.error('Failed to fetch units')
      setUnits([])
    } finally {
      setTableLoading(false)
      setIsSearching(false)
      if (!initialLoadDone.current) {
        setLoading(false)
        initialLoadDone.current = true
      }
    }
  }

  const createUnit = async (unitData) => {
    try {
      await apiService.createUnit(unitData)
      toast.success("Unit created successfully")
      setIsAddDialogOpen(false)
      await fetchUnits()
    } catch (error) {
      console.error('Error creating unit:', error)
      toast.error("Failed to create unit. Please try again.")
      throw error
    }
  }

  const updateUnit = async (unitId, unitData) => {
    try {
      await apiService.updateUnit(unitId, unitData)
      toast.success("Unit updated successfully")
      setIsEditDialogOpen(false)
      setSelectedUnit(null)
      await fetchUnits()
    } catch (error) {
      console.error('Error updating unit:', error)
      toast.error("Failed to update unit. Please try again.")
      throw error
    }
  }

  const deleteUnit = async (unitId) => {
    try {
      await apiService.deleteUnit(unitId)
      toast.success("Unit deleted successfully")
      setIsDeleteDialogOpen(false)
      setSelectedUnit(null)
      await fetchUnits()
    } catch (error) {
      console.error('Error deleting unit:', error)
      toast.error("Failed to delete unit. Please try again.")
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

  // Fetch units when dependencies change
  useEffect(() => {
    fetchUnits()
  }, [debouncedSearchTerm, currentPage, perPage, sorting.sortBy, sorting.sortOrder])

  const handleRefresh = () => {
    fetchUnits()
  }

  const handleSortingChange = (newSortBy, newSortOrder) => {
    setSorting({
      sortBy: newSortBy,
      sortOrder: newSortOrder
    })
  }

  // Dialog handlers
  const handleEditUnit = (unit) => {
    setSelectedUnit(unit)
    setIsEditDialogOpen(true)
  }

  const handleDeleteUnit = (unit) => {
    setSelectedUnit(unit)
    setIsDeleteDialogOpen(true)
  }

  const handleViewUnit = (unit) => {
    setSelectedUnit(unit)
    setIsViewDialogOpen(true)
  }

  if (loading && !debouncedSearchTerm) {
    return <SettingsListPageSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-balance">Units Management</h1>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Unit
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search units..."
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
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : (
            <UnitsTable 
              units={units}
              onEdit={handleEditUnit}
              onDelete={handleDeleteUnit}
              onView={handleViewUnit}
              sorting={sorting}
              onSortingChange={handleSortingChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!tableLoading && totalUnits > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 bg-card rounded-lg border shadow-sm p-3 sm:p-4">
          <div className="text-sm text-gray-500 text-center sm:text-left">
            Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalUnits)} of {totalUnits} entries
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
                  const totalPages = Math.ceil(totalUnits / perPage)
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
                    if (currentPage < Math.ceil(totalUnits / perPage) && !tableLoading) {
                      setCurrentPage(currentPage + 1)
                    }
                  }}
                  className={currentPage === Math.ceil(totalUnits / perPage) || tableLoading ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <AddUnitDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onSuccess={createUnit}
      />

      {selectedUnit && (
        <>
          <EditUnitDialog
            unit={selectedUnit}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSuccess={updateUnit}
          />
          <DeleteUnitDialog
            unit={selectedUnit}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onSuccess={deleteUnit}
          />
          <ViewUnitDialog 
            unit={selectedUnit} 
            open={isViewDialogOpen} 
            onOpenChange={setIsViewDialogOpen} 
          />
        </>
      )}
    </div>
  )
}
