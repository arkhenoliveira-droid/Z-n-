'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Calendar,
  SortAsc,
  SortDesc,
  RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FilterOption {
  value: string
  label: string
  count?: number
}

export interface SearchFilterProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  filters?: Array<{
    key: string
    label: string
    options: FilterOption[]
    multiple?: boolean
  }>
  selectedFilters?: Record<string, string[]>
  onFilterChange: (key: string, values: string[]) => void
  sortOptions?: Array<{
    value: string
    label: string
  }>
  selectedSort?: string
  onSortChange?: (value: string) => void
  sortDirection?: 'asc' | 'desc'
  onSortDirectionChange?: (direction: 'asc' | 'desc') => void
  dateRange?: {
    start?: string
    end?: string
  }
  onDateRangeChange?: (range: { start?: string; end?: string }) => void
  className?: string
  showResultsCount?: boolean
  totalResults?: number
}

export function SearchFilter({
  placeholder = 'Search...',
  value,
  onChange,
  filters = [],
  selectedFilters = {},
  onFilterChange,
  sortOptions = [],
  selectedSort,
  onSortChange,
  sortDirection = 'asc',
  onSortDirectionChange,
  dateRange,
  onDateRangeChange,
  className,
  showResultsCount = false,
  totalResults
}: SearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }, [onChange])

  const handleFilterChange = useCallback((key: string, optionValue: string, multiple?: boolean) => {
    const currentValues = selectedFilters[key] || []
    let newValues: string[]

    if (multiple) {
      newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue]
    } else {
      newValues = currentValues.includes(optionValue) ? [] : [optionValue]
    }

    onFilterChange(key, newValues)
  }, [selectedFilters, onFilterChange])

  const clearAllFilters = useCallback(() => {
    Object.keys(selectedFilters).forEach(key => {
      onFilterChange(key, [])
    })
    onChange('')
    if (onDateRangeChange) {
      onDateRangeChange({})
    }
  }, [selectedFilters, onFilterChange, onChange, onDateRangeChange])

  const hasActiveFilters = Object.values(selectedFilters).some(values => values.length > 0) ||
                          value.trim() !== '' ||
                          (dateRange?.start || dateRange?.end)

  const getActiveFilterCount = () => {
    let count = 0
    Object.values(selectedFilters).forEach(values => {
      count += values.length
    })
    if (value.trim() !== '') count++
    if (dateRange?.start || dateRange?.end) count++
    return count
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={handleSearchChange}
                className="pl-10"
              />
              {value && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {filters.length > 0 && (
                <Button
                  variant={hasActiveFilters ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {getActiveFilterCount()}
                    </Badge>
                  )}
                  <ChevronDown className={cn('h-3 w-3 transition-transform', showFilters && 'rotate-180')} />
                </Button>
              )}

              {sortOptions.length > 0 && (
                <Button
                  variant={selectedSort ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-2"
                >
                  {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  Sort
                  <ChevronDown className={cn('h-3 w-3 transition-transform', showSort && 'rotate-180')} />
                </Button>
              )}

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Results Count */}
          {showResultsCount && totalResults !== undefined && (
            <div className="mt-3 text-sm text-muted-foreground">
              {totalResults} result{totalResults !== 1 ? 's' : ''} found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters Panel */}
      {showFilters && filters.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <h4 className="text-sm font-medium">{filter.label}</h4>
                  <div className="flex flex-wrap gap-2">
                    {filter.options.map((option) => {
                      const isSelected = selectedFilters[filter.key]?.includes(option.value) || false
                      return (
                        <Badge
                          key={option.value}
                          variant={isSelected ? 'default' : 'outline'}
                          className={cn(
                            'cursor-pointer text-xs',
                            isSelected && 'hover:bg-primary/80'
                          )}
                          onClick={() => handleFilterChange(filter.key, option.value, filter.multiple)}
                        >
                          {option.label}
                          {option.count !== undefined && (
                            <span className="ml-1 opacity-70">({option.count})</span>
                          )}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Date Range Filter */}
            {onDateRangeChange && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Date Range</h4>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateRange?.start || ''}
                    onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                    className="text-sm"
                  />
                  <span className="self-center text-sm text-muted-foreground">to</span>
                  <Input
                    type="date"
                    value={dateRange?.end || ''}
                    onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                    className="text-sm"
                  />
                  {(dateRange?.start || dateRange?.end) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDateRangeChange({})}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sort Panel */}
      {showSort && sortOptions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Sort By</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {sortOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={selectedSort === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onSortChange?.(option.value)}
                    className="text-xs justify-start"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant={sortDirection === 'asc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSortDirectionChange?.('asc')}
                  className="flex items-center gap-1"
                >
                  <SortAsc className="h-3 w-3" />
                  Ascending
                </Button>
                <Button
                  variant={sortDirection === 'desc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSortDirectionChange?.('desc')}
                  className="flex items-center gap-1"
                >
                  <SortDesc className="h-3 w-3" />
                  Descending
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Hook for managing search and filter state
export function useSearchFilter<T>(
  data: T[],
  searchFields: (keyof T)[],
  filterConfig?: Array<{
    key: string
    field: keyof T
    label: string
    multiple?: boolean
  }>
) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const filteredData = data.filter(item => {
    // Search filter
    if (searchTerm.trim() !== '') {
      const searchMatch = searchFields.some(field => {
        const value = item[field]
        if (value === undefined || value === null) {
          return false
        }
        return String(value).toLowerCase().includes(searchTerm.toLowerCase())
      })
      if (!searchMatch) return false
    }

    // Other filters
    for (const [key, values] of Object.entries(selectedFilters)) {
      if (values.length > 0) {
        const filterConfigItem = filterConfig?.find(f => f.key === key)
        if (filterConfigItem) {
          const fieldValue = item[filterConfigItem.field]
          if (fieldValue === undefined || fieldValue === null) {
            return false
          }
          if (!values.includes(String(fieldValue))) {
            return false
          }
        }
      }
    }

    return true
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0

    const aValue = a[sortField as keyof T]
    const bValue = b[sortField as keyof T]

    // Handle undefined or null values
    if (aValue === undefined || aValue === null) return 1
    if (bValue === undefined || bValue === null) return -1

    // Compare values
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleFilterChange = (key: string, values: string[]) => {
    setSelectedFilters(prev => ({
      ...prev,
      [key]: values
    }))
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedFilters({})
    setSortField('')
    setSortDirection('asc')
  }

  return {
    searchTerm,
    setSearchTerm,
    selectedFilters,
    handleFilterChange,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    filteredData: sortedData,
    clearFilters,
    hasActiveFilters: searchTerm.trim() !== '' ||
                     Object.values(selectedFilters).some(values => values.length > 0) ||
                     sortField !== ''
  }
}