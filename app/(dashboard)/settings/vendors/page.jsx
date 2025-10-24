"use client"

import { VendorsTable } from "@/components/vendors/vendors-table"
import { AddVendorDialog } from "@/components/vendors/add-vendor-dialog"
import { EditVendorDialog } from "@/components/vendors/edit-vendor-dialog"
import { DeleteVendorDialog } from "@/components/vendors/delete-vendor-dialog"
import { ViewVendorDialog } from "@/components/vendors/view-vendor-dialog"
import { VendorsPageSkeleton, VendorsTableSkeleton, StatsCardsSkeleton } from "@/components/vendors/vendors-page-skeleton"
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
import { Plus, Search, Building2, TrendingUp, DollarSign } from "lucide-react"
import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

export default function VendorsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [vendors, setVendors] = useState([])
  const [stats, setStats] = useState({
    totalVendors: 0,
    activeVendors: 0,
    totalValue: 0
  })
  const [loading, setLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [totalVendors, setTotalVendors] = useState(0)
  const [sorting, setSorting] = useState({
    sortBy: 'created_at',
    sortOrder: 'DESC'
  })

  // Centralized API functions
  const fetchVendors = async () => {
    try {
      const response = await apiService.getVendors({
        page: currentPage,
        size: perPage,
        name: debouncedSearchTerm || undefined,
        sort_by: sorting.sortBy,
        sort_direction: sorting.sortOrder,
      })
      if (response.data?.data) {
        setVendors(response.data.data)
        // Update total count
        if (response.data.total !== undefined) {
          setTotalVendors(response.data.total)
        }
      } else {
        setVendors([])
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
      toast.error('Failed to fetch vendors')
      setVendors([])
    } finally {
      setTableLoading(false)
      setIsSearching(false)
    }
  }
  

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await apiService.getVendors({ page: 1, size: 10 })
      
      if (response.data?.data) {
        const vendors = response.data.data
        setStats({
          totalVendors: vendors.length,
          activeVendors: vendors.length, // All vendors are considered active for now
          totalValue: 0 // This would need to be calculated from purchase invoices
        })
      }
    } catch (error) {
      console.error('Error fetching vendor stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const createVendor = async (vendorData) => {
    try {
      await apiService.createVendor(vendorData)
      toast.success("Vendor created successfully")
      setIsAddDialogOpen(false)
      await fetchVendors()
      await fetchStats()
    } catch (error) {
      console.error('Error creating vendor:', error)
      toast.error("Failed to create vendor. Please try again.")
      throw error
    }
  }

  const updateVendor = async (vendorId, vendorData) => {
    try {
      await apiService.updateVendor(vendorId, vendorData)
      toast.success("Vendor updated successfully")
      setIsEditDialogOpen(false)
      setSelectedVendor(null)
      await fetchVendors()
      await fetchStats()
    } catch (error) {
      console.error('Error updating vendor:', error)
      toast.error("Failed to update vendor. Please try again.")
      throw error
    }
  }

  const deleteVendor = async (vendorId) => {
    try {
      await apiService.deleteVendor(vendorId)
      toast.success("Vendor deleted successfully")
      setIsDeleteDialogOpen(false)
      setSelectedVendor(null)
      await fetchVendors()
      await fetchStats()
    } catch (error) {
      console.error('Error deleting vendor:', error)
      toast.error("Failed to delete vendor. Please try again.")
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

  // Fetch vendors when dependencies change
  useEffect(() => {
    fetchVendors()
  }, [debouncedSearchTerm, currentPage, perPage, sorting.sortBy, sorting.sortOrder])

  useEffect(() => {
    fetchStats()
  }, [])

  const handleRefresh = () => {
    fetchStats()
    fetchVendors()
  }


  const handleSortingChange = (newSortBy, newSortOrder) => {
    setSorting({
      sortBy: newSortBy,
      sortOrder: newSortOrder
    })
  }

  // Dialog handlers
  const handleEditVendor = (vendor) => {
    setSelectedVendor(vendor)
    setIsEditDialogOpen(true)
  }

  const handleDeleteVendor = (vendor) => {
    setSelectedVendor(vendor)
    setIsDeleteDialogOpen(true)
  }

  const handleViewVendor = (vendor) => {
    setSelectedVendor(vendor)
    setIsViewDialogOpen(true)
  }

  // Show full page skeleton on initial load
  if (loading && !debouncedSearchTerm) {
    return <VendorsPageSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Vendors Management</h1>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <StatsCardsSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalVendors}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary">Active</span> suppliers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.activeVendors}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary">Currently</span> active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $0
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary">This month</span>
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
                placeholder="Search vendors..."
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
            <VendorsTableSkeleton />
          ) : (
            <VendorsTable 
              vendors={vendors}
              onEdit={handleEditVendor}
              onDelete={handleDeleteVendor}
              onView={handleViewVendor}
              sorting={sorting}
              onSortingChange={handleSortingChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!tableLoading && totalVendors > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 bg-white rounded-lg border shadow-sm p-4">
          <div className="text-sm text-gray-500 text-center sm:text-left">
            Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalVendors)} of {totalVendors} entries
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
                  const totalPages = Math.ceil(totalVendors / perPage)
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
                    if (currentPage < Math.ceil(totalVendors / perPage) && !tableLoading) {
                      setCurrentPage(currentPage + 1)
                    }
                  }}
                  className={currentPage === Math.ceil(totalVendors / perPage) || tableLoading ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <AddVendorDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onSubmit={createVendor}
      />

      {selectedVendor && (
        <>
          <EditVendorDialog
            vendor={selectedVendor}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSubmit={updateVendor}
          />
          <DeleteVendorDialog
            vendor={selectedVendor}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onSubmit={deleteVendor}
          />
          <ViewVendorDialog 
            vendor={selectedVendor} 
            open={isViewDialogOpen} 
            onOpenChange={setIsViewDialogOpen} 
          />
        </>
      )}
    </div>
  )
}
