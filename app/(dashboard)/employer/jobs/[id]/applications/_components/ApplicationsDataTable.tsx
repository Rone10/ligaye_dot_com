'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { 
    DropdownMenu, 
    DropdownMenuCheckboxItem, 
    DropdownMenuContent, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { formatColumnName } from '../_utils/format-column-name'
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function ApplicationsDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({}) // Added for column visibility toggle
  const [rowSelection, setRowSelection] = React.useState({}) // Added for row selection (if needed)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility, // Added
    onRowSelectionChange: setRowSelection, // Added
    state: {
      sorting,
      columnFilters,
      columnVisibility, // Added
      rowSelection, // Added
    },
  })


  return (
    <div className="w-full px-4">
         <div className="flex items-center py-4 gap-2">
             {/* Example Filter Input - Filter by Candidate Name */}
            <Input
                placeholder="Filter by candidate name..."
                value={(table.getColumn('candidateName')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                    table.getColumn('candidateName')?.setFilterValue(event.target.value)
                }
                className="max-w-sm h-9 text-sm"
            />
             {/* Column Visibility Toggle */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="ml-auto h-9">
                        Columns <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {table
                        .getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => {
                            return (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) =>
                                        column.toggleVisibility(!!value)
                                    }
                                >

                                    {formatColumnName(column.id)}
                                </DropdownMenuCheckboxItem>
                            )
                        })}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className="rounded-md border border-[#e1e5f2]">
            <Table>
                <TableHeader className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                        return (
                        <TableHead key={header.id} className="text-xs font-semibold text-[#1a1e2d] uppercase tracking-wider">
                            {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                                )}
                        </TableHead>
                        )
                    })}
                    </TableRow>
                ))}
                </TableHeader>
                <TableBody>
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                    <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className="hover:bg-gray-50/70 transition-colors duration-150"
                    >
                        {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3 px-4 text-sm">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                        ))}
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500 italic">
                        No applications found.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
         {/* Pagination Controls */}
        <div className="flex items-center justify-end px-4 space-x-2 py-4">
             {/* Optional: Display selected row count */}
             <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
                Previous
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
                Next
            </Button>
        </div>
    </div>
  )
} 