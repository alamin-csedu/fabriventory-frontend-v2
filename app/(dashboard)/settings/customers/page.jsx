"use client"

import { CustomersTable } from "@/components/customers/customers-table"
import { AddCustomerDialog } from "@/components/customers/add-customer-dialog"
import { EditCustomerDialog } from "@/components/customers/edit-customer-dialog"
import { DeleteCustomerDialog } from "@/components/customers/delete-customer-dialog"
import { ViewCustomerDialog } from "@/components/customers/view-customer-dialog"
import { CustomersPageSkeleton, CustomersTableSkeleton } from "@/components/customers/customers-page-skeleton"
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

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const initialLoadDone = useRef(false)
  const [tableLoading, setTableLoading] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [sorting, setSorting] = useState({
    sortBy: 'created_at',
    sortOrder: 'DESC'
  })

  // Centralized API functions
  const fetchCustomers = async () => {
    try {
      if (!initialLoadDone.current) {
        setLoading(true)
      }
      const response = await apiService.getCustomers({
        page: currentPage,
        size: perPage,
        name: debouncedSearchTerm || undefined,
        sort_by: sorting.sortBy,
        sort_direction: sorting.sortOrder,
      })
      if (response.data?.data) {
        setCustomers(response.data.data)
        // Update total count
        if (response.data.total !== undefined) {
          setTotalCustomers(response.data.total)
        }
      } else {
        setCustomers([])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Failed to fetch customers')
      setCustomers([])
    } finally {
      setTableLoading(false)
      setIsSearching(false)
      if (!initialLoadDone.current) {
        setLoading(false)
        initialLoadDone.current = true
      }
    }
  }

  const createCustomer = async (customerData) => {
    try {
      await apiService.createCustomer(customerData)
      toast.success("Customer created successfully")
      setIsAddDialogOpen(false)
      await fetchCustomers()
    } catch (error) {
      console.error('Error creating customer:', error)
      toast.error("Failed to create customer. Please try again.")
      throw error
    }
  }

  const updateCustomer = async (customerId, customerData) => {
    try {
      await apiService.updateCustomer(customerId, customerData)
      toast.success("Customer updated successfully")
      setIsEditDialogOpen(false)
      setSelectedCustomer(null)
      await fetchCustomers()
    } catch (error) {
      console.error('Error updating customer:', error)
      toast.error("Failed to update customer. Please try again.")
      throw error
    }
  }

  const deleteCustomer = async (customerId) => {
    try {
      await apiService.deleteCustomer(customerId)
      toast.success("Customer deleted successfully")
      setIsDeleteDialogOpen(false)
      setSelectedCustomer(null)
      await fetchCustomers()
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error("Failed to delete customer. Please try again.")
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

  // Fetch customers when dependencies change
  useEffect(() => {
    fetchCustomers()
  }, [debouncedSearchTerm, currentPage, perPage, sorting.sortBy, sorting.sortOrder])

  const handleRefresh = () => {
    fetchCustomers()
  }

  const handleSortingChange = (newSortBy, newSortOrder) => {
    setSorting({
      sortBy: newSortBy,
      sortOrder: newSortOrder
    })
  }

  // Dialog handlers
  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer)
    setIsEditDialogOpen(true)
  }

  const handleDeleteCustomer = (customer) => {
    setSelectedCustomer(customer)
    setIsDeleteDialogOpen(true)
  }

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer)
    setIsViewDialogOpen(true)
  }

  // Show full page skeleton on initial load
  if (loading && !debouncedSearchTerm) {
    return <CustomersPageSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-balance">Customers Management</h1>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
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
            <CustomersTableSkeleton />
          ) : (
            <CustomersTable 
              customers={customers}
              onEdit={handleEditCustomer}
              onDelete={handleDeleteCustomer}
              onView={handleViewCustomer}
              sorting={sorting}
              onSortingChange={handleSortingChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!tableLoading && totalCustomers > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 bg-card rounded-lg border shadow-sm p-3 sm:p-4">
          <div className="text-sm text-gray-500 text-center sm:text-left">
            Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalCustomers)} of {totalCustomers} entries
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
                  const totalPages = Math.ceil(totalCustomers / perPage)
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
                    if (currentPage < Math.ceil(totalCustomers / perPage) && !tableLoading) {
                      setCurrentPage(currentPage + 1)
                    }
                  }}
                  className={currentPage === Math.ceil(totalCustomers / perPage) || tableLoading ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <AddCustomerDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onSubmit={createCustomer}
      />

      {selectedCustomer && (
        <>
          <EditCustomerDialog
            customer={selectedCustomer}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSubmit={updateCustomer}
          />
          <DeleteCustomerDialog
            customer={selectedCustomer}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onSubmit={deleteCustomer}
          />
          <ViewCustomerDialog 
            customer={selectedCustomer} 
            open={isViewDialogOpen} 
            onOpenChange={setIsViewDialogOpen} 
          />
        </>
      )}
    </div>
  )
}
