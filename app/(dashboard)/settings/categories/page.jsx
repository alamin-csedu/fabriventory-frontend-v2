"use client"

import { CategoriesTable } from "@/components/categories/categories-table"
import { AddCategoryDialog } from "@/components/categories/add-category-dialog"
import { EditCategoryDialog } from "@/components/categories/edit-category-dialog"
import { DeleteCategoryDialog } from "@/components/categories/delete-category-dialog"
import { ViewCategoryDialog } from "@/components/categories/view-category-dialog"
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
import { Plus, Search, Tag, TrendingUp, Package } from "lucide-react"
import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    totalItems: 0
  })
  const [loading, setLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [totalCategories, setTotalCategories] = useState(0)
  const [sorting, setSorting] = useState({
    sortBy: 'created_at',
    sortOrder: 'DESC'
  })

  // Centralized API functions
  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories({
        page: currentPage,
        size: perPage,
        name: debouncedSearchTerm || undefined,
        sort_by: sorting.sortBy,
        sort_direction: sorting.sortOrder,
      })
      if (response.data?.data) {
        setCategories(response.data.data)
        // Update total count
        if (response.data.total !== undefined) {
          setTotalCategories(response.data.total)
        }
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to fetch categories')
      setCategories([])
    } finally {
      setTableLoading(false)
      setIsSearching(false)
    }
  }
  
  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await apiService.getCategories({ page: 1, size: 10 })
      
      if (response.data?.data) {
        const categories = response.data.data
        setStats({
          totalCategories: categories.length,
          activeCategories: categories.length, // All categories are considered active for now
          totalItems: 0 // This would need to be calculated from items using categories
        })
      }
    } catch (error) {
      console.error('Error fetching category stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (categoryData) => {
    try {
      await apiService.createCategory(categoryData)
      toast.success("Category created successfully")
      setIsAddDialogOpen(false)
      await fetchCategories()
      await fetchStats()
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error("Failed to create category. Please try again.")
      throw error
    }
  }

  const updateCategory = async (categoryId, categoryData) => {
    try {
      await apiService.updateCategory(categoryId, categoryData)
      toast.success("Category updated successfully")
      setIsEditDialogOpen(false)
      setSelectedCategory(null)
      await fetchCategories()
      await fetchStats()
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error("Failed to update category. Please try again.")
      throw error
    }
  }

  const deleteCategory = async (categoryId) => {
    try {
      await apiService.deleteCategory(categoryId)
      toast.success("Category deleted successfully")
      setIsDeleteDialogOpen(false)
      setSelectedCategory(null)
      await fetchCategories()
      await fetchStats()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error("Failed to delete category. Please try again.")
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

  // Fetch categories when dependencies change
  useEffect(() => {
    fetchCategories()
  }, [debouncedSearchTerm, currentPage, perPage, sorting.sortBy, sorting.sortOrder])

  useEffect(() => {
    fetchStats()
  }, [])

  const handleRefresh = () => {
    fetchStats()
    fetchCategories()
  }

  const handleSortingChange = (newSortBy, newSortOrder) => {
    setSorting({
      sortBy: newSortBy,
      sortOrder: newSortOrder
    })
  }

  // Dialog handlers
  const handleEditCategory = (category) => {
    setSelectedCategory(category)
    setIsEditDialogOpen(true)
  }

  const handleDeleteCategory = (category) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  const handleViewCategory = (category) => {
    setSelectedCategory(category)
    setIsViewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Categories Management</h1>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalCategories}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary">Available</span> categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.activeCategories}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary">Currently</span> in use
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalItems}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary">Items</span> using categories
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
                placeholder="Search categories..."
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
            <CategoriesTable 
              categories={categories}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              onView={handleViewCategory}
              sorting={sorting}
              onSortingChange={handleSortingChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!tableLoading && totalCategories > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 bg-white rounded-lg border shadow-sm p-4">
          <div className="text-sm text-gray-500 text-center sm:text-left">
            Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalCategories)} of {totalCategories} entries
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
                  const totalPages = Math.ceil(totalCategories / perPage)
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
                    if (currentPage < Math.ceil(totalCategories / perPage) && !tableLoading) {
                      setCurrentPage(currentPage + 1)
                    }
                  }}
                  className={currentPage === Math.ceil(totalCategories / perPage) || tableLoading ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <AddCategoryDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onSuccess={createCategory}
      />

      {selectedCategory && (
        <>
          <EditCategoryDialog
            category={selectedCategory}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSuccess={updateCategory}
          />
          <DeleteCategoryDialog
            category={selectedCategory}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onSuccess={deleteCategory}
          />
          <ViewCategoryDialog 
            category={selectedCategory} 
            open={isViewDialogOpen} 
            onOpenChange={setIsViewDialogOpen} 
          />
        </>
      )}
    </div>
  )
}
