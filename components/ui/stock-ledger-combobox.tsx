"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface StockLedger {
  id: number
  job_id: number
  type: string
  parent_id: number | null
  vendor_id: number
  delivery_receipt_url: string
  payment_reference: string
  job?: {
    id: number
    name: string
    description: string
    customer_id: number
    created_at: string
    updated_at: string
    deleted_at: string | null
  }
  vendor?: {
    id: number
    name: string
    address: string
    phone_number: string[]
    email: string
    created_at: string
    updated_at: string
    deleted_at: string | null
  }
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface StockLedgerComboboxProps {
  value?: number
  onValueChange: (value: number | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  stockLedgers?: StockLedger[]
}

export function StockLedgerCombobox({
  value,
  onValueChange,
  placeholder = "Select stock ledger...",
  disabled = false,
  className,
  stockLedgers: propStockLedgers
}: StockLedgerComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [stockLedgers, setStockLedgers] = React.useState<StockLedger[]>(propStockLedgers || [])
  const [loading, setLoading] = React.useState(false)

  const fetchStockLedgers = async (search?: string) => {
    try {
      setLoading(true)
      const { apiService } = await import("@/lib/api")
      const response = await apiService.getStockLedgers({
        page: 1,
        size: 50,
        search: search || ""
      })
      setStockLedgers(response.data.data || [])
    } catch (error) {
      console.error("Error fetching stock ledgers:", error)
      setStockLedgers([])
    } finally {
      setLoading(false)
    }
  }

  // Update stockLedgers when prop changes
  React.useEffect(() => {
    if (propStockLedgers) {
      setStockLedgers(propStockLedgers)
    }
  }, [propStockLedgers])

  React.useEffect(() => {
    if (open && stockLedgers.length === 0) {
      fetchStockLedgers()
    }
  }, [open])

  // Fetch stock ledgers when value is provided to show selected item
  React.useEffect(() => {
    if (value && stockLedgers.length === 0 && !propStockLedgers) {
      fetchStockLedgers()
    }
  }, [value, propStockLedgers])

  const selectedStockLedger = stockLedgers.find(ledger => ledger.id === value)

  const jobLabel = (ledger: StockLedger) => ledger.job?.name ?? "—"
  const vendorLabel = (ledger: StockLedger) => ledger.vendor?.name ?? "—"

  const handleSearch = (search: string) => {
    fetchStockLedgers(search)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-auto py-3 px-3", className)}
          disabled={disabled}
        >
          {selectedStockLedger ? (
            <div className="flex flex-col items-start text-left w-full">
              <div className="flex items-center gap-2 w-full">
                <span className="font-medium text-sm">
                  {jobLabel(selectedStockLedger)}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {selectedStockLedger.type}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>{vendorLabel(selectedStockLedger)}</span>
                <span className="text-blue-600 font-medium">
                  {new Date(selectedStockLedger.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search stock ledgers..."
            onValueChange={handleSearch}
          />
          <CommandList>
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : stockLedgers.length === 0 ? (
              <CommandEmpty>No stock ledgers found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {stockLedgers.map((ledger) => (
                  <CommandItem
                    key={ledger.id}
                    value={`${jobLabel(ledger)} ${ledger.type} ${vendorLabel(ledger)}`}
                    onSelect={() => {
                      onValueChange(ledger.id === value ? undefined : ledger.id)
                      setOpen(false)
                    }}
                    className="py-3 px-3"
                  >
                    <Check
                      className={cn(
                        "mr-3 h-4 w-4",
                        value === ledger.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col w-full">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {jobLabel(ledger)}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {ledger.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{vendorLabel(ledger)}</span>
                        <span className="text-blue-600 font-medium">
                          {new Date(ledger.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
