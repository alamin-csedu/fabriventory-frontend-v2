"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Plus, Edit, Eye, Calendar, Package, Truck, CheckCircle, Clock, AlertCircle, TrendingUp, BarChart3 } from "lucide-react"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import { AddStockLedgerDialog } from "@/components/stock-ledger/add-stock-ledger-dialog"
import { EditStockLedgerDialog } from "@/components/stock-ledger/edit-stock-ledger-dialog"
import { ViewStockLedgerDialog } from "@/components/stock-ledger/view-stock-ledger-dialog"

export default function StockLedgerTimelinePage() {
  const params = useParams()
  const router = useRouter()
  const stockLedgerId = params.id 

  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)

  const fetchTimeline = async () => {
    try {
      setLoading(true)
      const response = await apiService.getStockLedgerTimeline(stockLedgerId)
      setTimeline(response.data || [])
    } catch (error) {
      console.error("Error fetching timeline:", error)
      toast.error("Failed to fetch timeline")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (stockLedgerId) {
      fetchTimeline()
    }
  }, [stockLedgerId])

  const handleEdit = (entry) => {
    setSelectedEntry(entry)
    setIsEditDialogOpen(true)
  }

  const handleView = (entry) => {
    setSelectedEntry(entry)
    setIsViewDialogOpen(true)
  }

  const handleAddDelivery = () => {
    setIsAddDialogOpen(true)
  }

  const getStatusIcon = (type, index) => {
    if (type === "Booking") {
      return <Package className="h-5 w-5 text-blue-600" />
    } else if (type === "Delivery") {
      return <Truck className="h-5 w-5 text-green-600" />
    }
    return <Clock className="h-5 w-5 text-gray-600" />
  }

  const getStatusColor = (type) => {
    if (type === "Booking") {
      return "bg-blue-100 text-blue-800 border-blue-200"
    } else if (type === "Delivery") {
      return "bg-green-100 text-green-800 border-green-200"
    }
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const bookingEntry = timeline.find((entry) => entry.type === "Booking")
  const deliveryEntries = timeline.filter((entry) => entry.type === "Delivery")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-balance">Stock Ledger Timeline</h1>
            <p className="text-muted-foreground text-pretty text-sm">
              {bookingEntry?.job?.name || "Timeline Details"}
            </p>
          </div>
        </div>
        <Button onClick={handleAddDelivery} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add Delivery
        </Button>
      </div>

      {/* Booking Details */}
      {bookingEntry && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Job Information</h4>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Job:</strong> {bookingEntry.job.name}
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Description:</strong> {bookingEntry.job.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Created:</strong> {formatDate(bookingEntry.created_at)}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Vendor Information</h4>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Vendor:</strong> {bookingEntry.vendor.name}
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Email:</strong> {bookingEntry.vendor.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Address:</strong> {bookingEntry.vendor.address}
                </p>
              </div>
            </div>
            
            {/* Item-wise Delivery Breakdown */}
            {bookingEntry.items && bookingEntry.items.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Item Delivery Status</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-sm">Item</th>
                        <th className="text-center py-3 px-4 font-semibold text-sm">Ordered</th>
                        <th className="text-center py-3 px-4 font-semibold text-sm">Delivered</th>
                        <th className="text-center py-3 px-4 font-semibold text-sm">Remaining</th>
                        <th className="text-center py-3 px-4 font-semibold text-sm">Progress</th>
                        <th className="text-center py-3 px-4 font-semibold text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingEntry.items.map((item, index) => (
                        <tr key={item.id} className="border-b hover:bg-muted/30">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-blue-600" />
                              <div>
                                <div className="font-medium">{item.item.name}</div>
                                <div className="text-xs text-muted-foreground">{item.unit.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="font-semibold text-blue-600">
                              {item.quantity.toLocaleString()}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="font-semibold text-green-600">
                              {item.item_stats.delivered.toLocaleString()}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="font-semibold text-orange-600">
                              {item.item_stats.remaining.toLocaleString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${item.item_stats.percentage}%` }}
                                />
                              </div>
                              <div className="text-xs text-center text-muted-foreground">
                                {item.item_stats.percentage}%
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge 
                              variant="outline"
                              className={
                                item.item_stats.percentage === 100
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : item.item_stats.percentage > 0
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                              }
                            >
                              {item.item_stats.percentage === 100 ? "Complete" : 
                               item.item_stats.percentage > 0 ? "In Progress" : "Pending"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Delivery Timeline
          </CardTitle>
          <CardDescription>
            Track all deliveries and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deliveryEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No deliveries yet</p>
              <p className="text-sm">Add a delivery to start tracking</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveryEntries.map((entry, index) => (
                <div key={entry.id} className="relative">
                  {index < deliveryEntries.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-8 bg-border" />
                  )}
                    <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-card">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                      {getStatusIcon(entry.type, index)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-sm sm:text-base">Delivered on {formatDate(entry.created_at)}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getStatusColor(entry.type)}>
                            {entry.type}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleView(entry)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(entry)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-2 text-sm text-muted-foreground">
                        {entry.payment_reference && (
                          <p><strong>Payment Reference:</strong> {entry.payment_reference}</p>
                        )}
                        {entry.delivery_receipt_url && (
                          <p><strong>Receipt:</strong> 
                            <a 
                              href={
                                entry.delivery_receipt_url.startsWith('http') 
                                  ? entry.delivery_receipt_url 
                                  : `${process.env.NEXT_PUBLIC_FILE_URL}${entry.delivery_receipt_url}`
                              }
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline ml-1"
                            >
                              View Receipt
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddStockLedgerDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchTimeline}
        initialData={{ 
          type: "Delivery", 
          parent_id: bookingEntry?.id,
          job_id: bookingEntry?.job_id,
          vendor_id: bookingEntry?.vendor_id 
        }}
      />
      
      <EditStockLedgerDialog 
        stockLedger={selectedEntry}
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        onSuccess={fetchTimeline}
      />
      
      <ViewStockLedgerDialog 
        stockLedger={selectedEntry}
        open={isViewDialogOpen} 
        onOpenChange={setIsViewDialogOpen}
      />
    </div>
  )
}
