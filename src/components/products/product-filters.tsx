'use client'

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface CategoryWithCount {
  id: string
  name: string
  slug: string
  _count: { products: number }
  children?: CategoryWithCount[]
}

interface ProductFiltersProps {
  categories: CategoryWithCount[]
  currentCategory?: string
  currentSort?: string
  minPrice?: number
  maxPrice?: number
}

export function ProductFilters({
  categories,
  currentCategory,
  currentSort,
  minPrice,
  maxPrice,
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [openFilters, setOpenFilters] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const createQueryString = useCallback(
    (params: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(searchParams.toString())
      Object.entries(params).forEach(([key, value]) => {
        if (value) newParams.set(key, value)
        else newParams.delete(key)
      })
      return newParams.toString()
    },
    [searchParams]
  )

  const handleCategoryChange = (slug: string) => {
    router.push(`?${createQueryString({ category: slug, page: undefined })}`)
  }

  const handleSortChange = (sort: string) => {
    router.push(`?${createQueryString({ sort, page: undefined })}`)
  }

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const params: Record<string, string | undefined> = { page: undefined }
    if (type === 'min') params.minPrice = value || undefined
    if (type === 'max') params.maxPrice = value || undefined
    router.push(`?${createQueryString(params)}`)
  }

  const clearFilters = () => {
    router.push('/shop')
  }

  const hasActiveFilters = currentCategory || currentSort || minPrice || maxPrice

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto px-2">
            <X className="mr-1 h-3.5 w-3.5" />
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="sort">Sort By</Label>
          <select
            id="sort"
            value={currentSort || 'newest'}
            onChange={(e) => handleSortChange(e.target.value)}
            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        <div>
          <Label>Price Range</Label>
          <div className="mt-2 flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice || ''}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              className="w-24"
              min="0"
              step="0.01"
            />
            <span className="flex items-center text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice || ''}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              className="w-24"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <Label>Categories</Label>
          <div className="mt-2 space-y-2">
            {categories.map((category) => (
              <CategoryFilterItem
                key={category.id}
                category={category}
                isActive={currentCategory === category.slug}
                onClick={handleCategoryChange}
                expanded={expandedCategories.includes(category.id)}
                onToggleExpand={() => {
                  setExpandedCategories((prev) =>
                    prev.includes(category.id)
                      ? prev.filter((id) => id !== category.id)
                      : [...prev, category.id]
                  )
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CategoryFilterItem({
  category,
  isActive,
  onClick,
  expanded,
  onToggleExpand,
}: {
  category: CategoryWithCount
  isActive: boolean
  onClick: (slug: string) => void
  expanded: boolean
  onToggleExpand: () => void
}) {
  return (
    <div className="space-y-1">
      <button
        onClick={() => onClick(category.slug)}
        className={cn(
          'w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        )}
      >
        <span>{category.name}</span>
        <span className="text-muted-foreground">{category._count.products}</span>
      </button>
      {category.children && category.children.length > 0 && (
        <div className="ml-4 space-y-1 border-l-2 border-muted/50 pl-2">
          {category.children.map((child) => (
            <button
              key={child.id}
              onClick={() => onClick(child.slug)}
              className={cn(
                'w-full flex items-center justify-between px-2 py-1 text-sm rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <span>{child.name}</span>
              <span className="text-muted-foreground">{child._count.products}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}