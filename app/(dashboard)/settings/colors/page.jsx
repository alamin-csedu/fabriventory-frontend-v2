"use client"

import { ColorsTable } from "@/components/colors/colors-table"
import { AddColorDialog } from "@/components/colors/add-color-dialog"
import { EditColorDialog } from "@/components/colors/edit-color-dialog"
import { DeleteColorDialog } from "@/components/colors/delete-color-dialog"
import { ViewColorDialog } from "@/components/colors/view-color-dialog"
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
import { Plus, Search, Palette, TrendingUp, Hash } from "lucide-react"
import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

export default function ColorsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState(null)
  const [colors, setColors] = useState([])
  const [stats, setStats] = useState({
    totalColors: 0,
    colorsWithPantone: 0,
    uniqueColorCodes: 0
  })
  const [loading, setLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [totalColors, setTotalColors] = useState(0)
  const [sorting, setSorting] = useState({
    sortBy: 'created_at',
    sortOrder: 'DESC'
  })

  // Centralized API functions
  const createColor = async (colorData) => {
    try {
      await apiService.createColor(colorData)
      toast.success("Color created successfully")
      fetchColors()
    } catch (error) {
      console.error("Error creating color:", error)
      throw error
    }
  }

  const updateColor = async (id, colorData) => {
    try {
      await apiService.updateColor(id, colorData)
      toast.success("Color updated successfully")
      fetchColors()
    } catch (error) {
      console.error("Error updating color:", error)
      throw error
    }
  }

  const deleteColor = async (id) => {
    try {
      await apiService.deleteColor(id)
      toast.success("Color deleted successfully")
      fetchColors()
    } catch (error) {
      console.error("Error deleting color:", error)
      throw error
    }
  }

  const getColor = async (id) => {
    try {
      const response = await apiService.getColor(id)
      return response.data
    } catch (error) {
      console.error("Error fetching color:", error)
      throw error
    }
  }

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch colors when search term or page changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setIsSearching(true)
    }
    fetchColors()
  }, [debouncedSearchTerm, currentPage, perPage, sorting])

  const fetchColors = async () => {
    try {
      setTableLoading(true)
      const response = await apiService.getColors({
        page: currentPage,
        size: perPage,
        name: debouncedSearchTerm || undefined,
        search: debouncedSearchTerm || undefined,
        sort_by: sorting.sortBy,
        sort_direction: sorting.sortOrder,
      })
      
      if (response.data?.data) {
        setColors(response.data.data)
        if (response.data.total !== undefined) {
          setTotalColors(response.data.total)
        }
      } else {
        setColors([])
      }
    } catch (error) {
      console.error('Error fetching colors:', error)
      toast.error('Failed to fetch colors')
      setColors([])
    } finally {
      setTableLoading(false)
      setIsSearching(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await apiService.getColors({ size: 1000 })
      const allColors = response.data.data || []
      
      const colorsWithPantone = allColors.filter(color => color.pantone_code).length
      const uniqueColorCodes = new Set(allColors.map(color => color.color_code)).size
      
      setStats({
        totalColors: allColors.length,
        colorsWithPantone,
        uniqueColorCodes
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([fetchColors(), fetchStats()])
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleView = (color) => {
    setSelectedColor(color)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (color) => {
    setSelectedColor(color)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (color) => {
    setSelectedColor(color)
    setIsDeleteDialogOpen(true)
  }

  const handleSort = (field) => {
    setSorting(prev => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    }))
  }

  const totalPages = Math.ceil(totalColors / perPage)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage)
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Color Management</h1>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                </CardTitle>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-1" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Colors Management</h1>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Color
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Colors</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalColors}</div>
            <p className="text-xs text-muted-foreground">
              All colors in your palette
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Pantone</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.colorsWithPantone}</div>
            <p className="text-xs text-muted-foreground">
              Colors with Pantone codes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Codes</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueColorCodes}</div>
            <p className="text-xs text-muted-foreground">
              Unique color codes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Color Management</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search colors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              {isSearching && (
                <div className="absolute right-2 top-2.5">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ColorsTable 
            colors={colors}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={tableLoading}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalColors)} of {totalColors} colors
                </p>
                <select
                  value={perPage}
                  onChange={(e) => handlePerPageChange(Number(e.target.value))}
                  className="h-8 w-16 rounded border border-input bg-background px-2 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) handlePageChange(currentPage - 1)
                      }}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    if (pageNum > totalPages) return null
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            handlePageChange(pageNum)
                          }}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) handlePageChange(currentPage + 1)
                      }}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddColorDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onSuccess={createColor}
      />

      {selectedColor && (
        <>
          <EditColorDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            color={selectedColor}
            onSuccess={updateColor}
          />
          
          <DeleteColorDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            color={selectedColor}
            onSuccess={deleteColor}
          />
          
          <ViewColorDialog
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
            colorId={selectedColor.id}
            onSuccess={getColor}
          />
        </>
      )}
    </div>
  )
}
