"use client"

import { StockLedgerTable } from "@/components/stock-ledger/stock-ledger-table"
import { AddStockLedgerDialog } from "@/components/stock-ledger/add-stock-ledger-dialog"
import { EditStockLedgerDialog } from "@/components/stock-ledger/edit-stock-ledger-dialog"
import { ViewStockLedgerDialog } from "@/components/stock-ledger/view-stock-ledger-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Receipt, TrendingUp, Clock, CheckCircle, Database } from "lucide-react"
import { useState } from "react"

export default function StockLedgerPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedStockLedger, setSelectedStockLedger] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleEdit = (stockLedger: any) => {
    setSelectedStockLedger(stockLedger)
    setIsEditDialogOpen(true)
  }

  const handleView = (stockLedger: any) => {
    setSelectedStockLedger(stockLedger)
    setIsViewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Stock Ledger</h1>
              <p className="text-muted-foreground text-pretty">Manage stock ledger entries and inventory transactions</p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Stock Ledger
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary">+18</span> new this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock IN</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">Stock received</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock OUT</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">Stock issued</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary">+3</span> this week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Ledger</CardTitle>
              <CardDescription>View and manage all stock ledger entries and inventory transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search stock ledgers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Booking">Booking</SelectItem>
                    <SelectItem value="Delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <StockLedgerTable 
                searchTerm={searchTerm} 
                typeFilter={typeFilter} 
                onRefresh={handleRefresh}
                onEdit={handleEdit}
                onView={handleView}
              />
            </CardContent>
          </Card>

          <AddStockLedgerDialog 
            open={isAddDialogOpen} 
            onOpenChange={setIsAddDialogOpen}
            onSuccess={handleRefresh}
          />
          
          <EditStockLedgerDialog 
            stockLedger={selectedStockLedger}
            open={isEditDialogOpen} 
            onOpenChange={setIsEditDialogOpen}
            onSuccess={handleRefresh}
          />
          
          <ViewStockLedgerDialog 
            stockLedger={selectedStockLedger}
            open={isViewDialogOpen} 
            onOpenChange={setIsViewDialogOpen}
          />
        </div>
  )
}
