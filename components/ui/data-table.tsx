"use client";

import * as React from "react";
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
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "搜索...",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full" data-oid="qzhkysw">
      <div className="flex items-center py-4" data-oid="2oyp0tc">
        {searchKey && (
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
            data-oid="zed:w7q"
          />
        )}
        <DropdownMenu data-oid="v7h4jij">
          <DropdownMenuTrigger asChild data-oid="l.kpl6:">
            <Button variant="outline" className="ml-auto" data-oid="ocadhxx">
              列显示{" "}
              <span className="ml-2" data-oid="7apgaaf">
                ⌄
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" data-oid=".ir-3g-">
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
                    data-oid="cl-m7rt"
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border" data-oid="-s1rs93">
        <Table data-oid="gmk811w">
          <TableHeader data-oid="o24bs92">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} data-oid="nwr77d0">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} data-oid="mfkrnjg">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody data-oid="9lzizwe">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  data-oid="2th_7wt"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} data-oid="y0ineuj">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow data-oid=".d-fr9.">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                  data-oid="y88wh.0"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div
        className="flex items-center justify-end space-x-2 py-4"
        data-oid="z:kb7re"
      >
        <div
          className="flex-1 text-sm text-muted-foreground"
          data-oid="em127p-"
        >
          已选择 {table.getFilteredSelectedRowModel().rows.length} 行，共{" "}
          {table.getFilteredRowModel().rows.length} 行
        </div>
        <div className="space-x-2" data-oid="t7ixy0o">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            data-oid="9be:jv:"
          >
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            data-oid="iinb.vq"
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
}
