"use client"

import { JobsTable } from "@/components/jobs/jobs-table"
import { AddJobDialog } from "@/components/jobs/add-job-dialog"
import { EditJobDialog } from "@/components/jobs/edit-job-dialog"
import { DeleteJobDialog } from "@/components/jobs/delete-job-dialog"
import { ViewJobDialog } from "@/components/jobs/view-job-dialog"
import { JobsPageSkeleton, JobsTableSkeleton } from "@/components/jobs/jobs-page-skeleton"
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

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const initialLoadDone = useRef(false)
  const [tableLoading, setTableLoading] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [totalJobs, setTotalJobs] = useState(0)
  const [sorting, setSorting] = useState({
    sortBy: 'created_at',
    sortOrder: 'DESC'
  })

  // Centralized API functions
  const fetchJobs = async () => {
    try {
      if (!initialLoadDone.current) {
        setLoading(true)
      }
      const response = await apiService.getJobs({
        page: currentPage,
        size: perPage,
        name: debouncedSearchTerm || undefined,
        sort_by: sorting.sortBy,
        sort_direction: sorting.sortOrder,
      })
      if (response.data?.data) {
        setJobs(response.data.data)
        // Update total count
        if (response.data.total !== undefined) {
          setTotalJobs(response.data.total)
        }
      } else {
        setJobs([])
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast.error('Failed to fetch jobs')
      setJobs([])
    } finally {
      setTableLoading(false)
      setIsSearching(false)
      if (!initialLoadDone.current) {
        setLoading(false)
        initialLoadDone.current = true
      }
    }
  }

  const createJob = async (jobData) => {
    try {
      await apiService.createJob(jobData)
      toast.success("Job created successfully")
      setIsAddDialogOpen(false)
      await fetchJobs()
    } catch (error) {
      console.error('Error creating job:', error)
      toast.error("Failed to create job. Please try again.")
      throw error
    }
  }

  const updateJob = async (jobId, jobData) => {
    try {
      await apiService.updateJob(jobId, jobData)
      toast.success("Job updated successfully")
      setIsEditDialogOpen(false)
      setSelectedJob(null)
      await fetchJobs()
    } catch (error) {
      console.error('Error updating job:', error)
      toast.error("Failed to update job. Please try again.")
      throw error
    }
  }

  const deleteJob = async (jobId) => {
    try {
      await apiService.deleteJob(jobId)
      toast.success("Job deleted successfully")
      setIsDeleteDialogOpen(false)
      setSelectedJob(null)
      await fetchJobs()
    } catch (error) {
      console.error('Error deleting job:', error)
      toast.error("Failed to delete job. Please try again.")
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

  // Fetch jobs when dependencies change
  useEffect(() => {
    fetchJobs()
  }, [debouncedSearchTerm, currentPage, perPage, sorting.sortBy, sorting.sortOrder])

  const handleRefresh = () => {
    fetchJobs()
  }

  const handleSortingChange = (newSortBy, newSortOrder) => {
    setSorting({
      sortBy: newSortBy,
      sortOrder: newSortOrder
    })
  }

  // Dialog handlers
  const handleEditJob = (job) => {
    setSelectedJob(job)
    setIsEditDialogOpen(true)
  }

  const handleDeleteJob = (job) => {
    setSelectedJob(job)
    setIsDeleteDialogOpen(true)
  }

  const handleViewJob = (job) => {
    setSelectedJob(job)
    setIsViewDialogOpen(true)
  }

  // Show full page skeleton on initial load
  if (loading && !debouncedSearchTerm) {
    return (
      <>
        <OpenModalFromAction action="add-job" onOpen={() => setIsAddDialogOpen(true)} />
        <JobsPageSkeleton />
      </>
    )
  }

  return (
    <div className="space-y-6">
      <OpenModalFromAction action="add-job" onOpen={() => setIsAddDialogOpen(true)} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-balance">Jobs Management</h1>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Job
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
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
            <JobsTableSkeleton />
          ) : (
            <JobsTable 
              jobs={jobs}
              onEdit={handleEditJob}
              onDelete={handleDeleteJob}
              onView={handleViewJob}
              sorting={sorting}
              onSortingChange={handleSortingChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!tableLoading && totalJobs > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 bg-card rounded-lg border shadow-sm p-3 sm:p-4">
          <div className="text-sm text-gray-500 text-center sm:text-left">
            Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalJobs)} of {totalJobs} entries
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
                  const totalPages = Math.ceil(totalJobs / perPage)
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
                    if (currentPage < Math.ceil(totalJobs / perPage) && !tableLoading) {
                      setCurrentPage(currentPage + 1)
                    }
                  }}
                  className={currentPage === Math.ceil(totalJobs / perPage) || tableLoading ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <AddJobDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onSubmit={createJob}
      />

      {selectedJob && (
        <>
          <EditJobDialog
            job={selectedJob}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSubmit={updateJob}
          />
          <DeleteJobDialog
            job={selectedJob}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onSubmit={deleteJob}
          />
          <ViewJobDialog 
            job={selectedJob} 
            open={isViewDialogOpen} 
            onOpenChange={setIsViewDialogOpen} 
          />
        </>
      )}
    </div>
  )
}
