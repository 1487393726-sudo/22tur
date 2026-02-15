'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Filter,
  X,
} from "lucide-react";
import { format } from "date-fns";

/**
 * Successful Project data structure
 * As defined in the design document section 9
 */
export interface SuccessfulProject {
  id: string;
  name: string;
  category: string;
  completionDate: Date;
  investmentAmount: number;
  finalReturn: number;
  returnPercentage: number;
  revenueGenerated: number;
  userAdoption: number;
}

/**
 * Filter options for successful projects
 */
export interface SuccessfulProjectsFilters {
  dateRange?: { start: Date; end: Date };
  minReturn?: number;
  category?: string;
}

/**
 * SuccessfulProjectsTable component props
 */
export interface SuccessfulProjectsTableProps {
  userId: string;
  filters?: SuccessfulProjectsFilters;
}

/**
 * SuccessfulProjectsTable Component
 * 
 * Displays a table of successfully completed projects with filtering capabilities.
 * Implements requirements 10.1, 10.2, 10.3, 10.4, 10.5 from the design specification.
 * 
 * Display Elements:
 * - Table of successful projects (Requirement 10.1)
 * - Project name, completion date, and returns (Requirement 10.2)
 * - Revenue generated and user adoption metrics (Requirement 10.3)
 * - Filtering controls for date, return, and category (Requirement 10.4)
 * - Investor-specific returns display (Requirement 10.5)
 * 
 * @param {SuccessfulProjectsTableProps} props - Component props
 * @returns {JSX.Element} Rendered successful projects table
 */
export function SuccessfulProjectsTable({
  userId,
  filters: initialFilters,
}: SuccessfulProjectsTableProps): JSX.Element {
  // State management
  const [projects, setProjects] = useState<SuccessfulProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minReturn, setMinReturn] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch successful projects from API
  useEffect(() => {
    const fetchSuccessfulProjects = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Build query parameters
        const params = new URLSearchParams();
        
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (minReturn) params.append('minReturn', minReturn);
        if (selectedCategory && selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }

        const response = await fetch(
          `/api/investments/successful-projects?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Unauthorized access. Please ensure you are logged in as an investor.');
          }
          throw new Error(`Failed to fetch successful projects: ${response.status}`);
        }

        const data = await response.json();
        
        // Convert date strings to Date objects
        const projectsWithDates = data.projects.map((project: any) => ({
          ...project,
          completionDate: new Date(project.completionDate),
        }));

        setProjects(projectsWithDates);
      } catch (err) {
        console.error('Error fetching successful projects:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch successful projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuccessfulProjects();
  }, [userId, startDate, endDate, minReturn, selectedCategory]);

  // Apply initial filters if provided
  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.dateRange?.start) {
        setStartDate(format(initialFilters.dateRange.start, 'yyyy-MM-dd'));
      }
      if (initialFilters.dateRange?.end) {
        setEndDate(format(initialFilters.dateRange.end, 'yyyy-MM-dd'));
      }
      if (initialFilters.minReturn !== undefined) {
        setMinReturn(initialFilters.minReturn.toString());
      }
      if (initialFilters.category) {
        setSelectedCategory(initialFilters.category);
      }
    }
  }, [initialFilters]);

  // Extract unique categories from projects
  const categories = useMemo(() => {
    const uniqueCategories = new Set(projects.map(p => p.category));
    return Array.from(uniqueCategories).sort();
  }, [projects]);

  // Clear all filters
  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setMinReturn('');
    setSelectedCategory('all');
  };

  // Check if any filters are active
  const hasActiveFilters = startDate || endDate || minReturn || (selectedCategory && selectedCategory !== 'all');

  // Format currency values
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage values
  const formatPercentage = (percentage: number): string => {
    return `+${percentage.toFixed(2)}%`;
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            Successful Projects
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            View all successfully completed projects and their performance metrics
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading successful projects...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            Successful Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          Successful Projects
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          View all successfully completed projects and their performance metrics
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filtering Controls - Requirement 10.4 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Filters</Label>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Start Date Filter */}
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-xs">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9"
              />
            </div>

            {/* End Date Filter */}
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-xs">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Minimum Return Filter */}
            <div className="space-y-2">
              <Label htmlFor="min-return" className="text-xs">
                Min Return (%)
              </Label>
              <Input
                id="min-return"
                type="number"
                placeholder="e.g., 10"
                value={minReturn}
                onChange={(e) => setMinReturn(e.target.value)}
                className="h-9"
                min="0"
                step="0.1"
              />
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs">
                Category
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category" className="h-9">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Projects Table - Requirements 10.1, 10.2, 10.3, 10.5 */}
        {projects.length === 0 ? (
          <div className="flex items-center justify-center py-12 border rounded-lg bg-slate-50">
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? 'No successful projects match your filters'
                  : 'No successful projects found'}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Project Name</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Completion Date
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      <div className="flex items-center justify-end gap-1">
                        <DollarSign className="h-4 w-4" />
                        Investment
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Return
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Revenue
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Users className="h-4 w-4" />
                        Users
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id} className="hover:bg-slate-50">
                      {/* Project Name - Requirement 10.2 */}
                      <TableCell className="font-medium">
                        {project.name}
                      </TableCell>

                      {/* Category - Requirement 10.4 */}
                      <TableCell>
                        <Badge variant="outline">{project.category}</Badge>
                      </TableCell>

                      {/* Completion Date - Requirement 10.2 */}
                      <TableCell>
                        {formatDate(project.completionDate)}
                      </TableCell>

                      {/* Investment Amount - Requirement 10.5 */}
                      <TableCell className="text-right font-medium">
                        {formatCurrency(project.investmentAmount)}
                      </TableCell>

                      {/* Final Return - Requirements 10.2, 10.5 */}
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-semibold text-green-600">
                            {formatCurrency(project.finalReturn)}
                          </span>
                          <span className="text-xs text-green-600">
                            {formatPercentage(project.returnPercentage)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Revenue Generated - Requirement 10.3 */}
                      <TableCell className="text-right">
                        {formatCurrency(project.revenueGenerated)}
                      </TableCell>

                      {/* User Adoption - Requirement 10.3 */}
                      <TableCell className="text-right">
                        {formatNumber(project.userAdoption)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-muted-foreground mb-1">Total Projects</p>
              <p className="text-2xl font-bold text-blue-900">{projects.length}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
              <p className="text-sm text-muted-foreground mb-1">Total Invested</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(projects.reduce((sum, p) => sum + p.investmentAmount, 0))}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm text-muted-foreground mb-1">Total Returns</p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(projects.reduce((sum, p) => sum + p.finalReturn, 0))}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-muted-foreground mb-1">Avg Return</p>
              <p className="text-2xl font-bold text-amber-900">
                {projects.length > 0
                  ? formatPercentage(
                      projects.reduce((sum, p) => sum + p.returnPercentage, 0) / projects.length
                    )
                  : '0%'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
