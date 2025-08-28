"use client"

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type SortState = { id: string; dir: 'asc' | 'desc' } | null
export type FiltersState = Record<string, string | undefined>

export type ListState = {
  page: number
  pageSize: number
  search: string
  filters: FiltersState
  sort: SortState
  selected: Record<string, boolean>
  setPage: (v: number) => void
  setSearch: (v: string) => void
  setFilters: (f: FiltersState) => void
  setSort: (s: SortState) => void
  setSelected: (m: Record<string, boolean>) => void
  clear: () => void
}

export function createListSlice(key: string) {
  return create<ListState>()(
    persist(
      (set) => ({
        page: 1,
        pageSize: 20,
        search: '',
        filters: {},
        sort: null,
        selected: {},
        setPage: (page) => set({ page }),
        setSearch: (search) => set({ search, page: 1 }),
        setFilters: (filters) => set({ filters, page: 1 }),
        setSort: (sort) => set({ sort }),
        setSelected: (selected) => set({ selected }),
        clear: () => set({ page: 1, search: '', filters: {}, sort: null, selected: {} }),
      }),
      { name: `list-${key}`, storage: createJSONStorage(() => sessionStorage) }
    )
  )
}

