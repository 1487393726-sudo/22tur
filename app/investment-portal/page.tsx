"use client";

import { useState, useEffect } from "react";

// Force dynamic rendering to prevent prerender errors with context
export const dynamic = 'force-dynamic';
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Loader2, AlertCircle } from "lucide-react";
import { ProjectCard, ProjectSummary } from "@/components/investment/project-card";
import { ProjectDetailModal, ProjectDetail } from "@/components/investment/ProjectDetailModal";
import { useInvestorAccess } from "@/hooks/use-investor-access";

/**
 * ProjectInvestmentPage Component
 * 
 * Main page for browsing and investing in projects.
 * Implements requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 from the design specification.
 * 
 * Features:
 * - Display list of all available projects
 * - Search and filter controls
 * - Project selection and detail modal
 * - Investment submission
 * 
 * @returns {JSX.Element} Rendered investment portal page
 */
export default function ProjectInvestmentPage(): JSX.Element {
  const router = useRouter();
  const { refreshStatus, markAsInvestor } = useInvestorAccess();

  // State management
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectSummary[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string>("");

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  // Extract unique categories from projects
  const categories = Array.from(new Set(projects.map(p => p.category))).sort();

  /**
   * Fetch projects from API
   * Requirement 4.1: Display list of all available projects
   */
  const fetchProjects = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/projects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      const data = await response.json();
      setProjects(data.projects || []);
      setFilteredProjects(data.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch detailed project information
   * Requirement 4.6: Display detailed financial projections and historical performance
   */
  const fetchProjectDetails = async (projectId: string) => {
    setIsLoadingDetail(true);
    setError("");

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(`Failed to fetch project details: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform API response to ProjectDetail format
      const projectDetail: ProjectDetail = {
        ...data.project,
        // Convert ISO date strings back to Date objects for the modal
        currentStage: data.project.currentStage ? {
          ...data.project.currentStage,
          startDate: new Date(data.project.currentStage.startDate),
          expectedEndDate: new Date(data.project.currentStage.expectedEndDate),
          actualEndDate: data.project.currentStage.actualEndDate 
            ? new Date(data.project.currentStage.actualEndDate) 
            : null,
        } : null,
        stageHistory: data.project.stageHistory.map((stage: any) => ({
          ...stage,
          startDate: new Date(stage.startDate),
          expectedEndDate: new Date(stage.expectedEndDate),
          actualEndDate: stage.actualEndDate ? new Date(stage.actualEndDate) : null,
        })),
        financialPerformance: data.project.financialPerformance ? {
          ...data.project.financialPerformance,
          reportingPeriod: new Date(data.project.financialPerformance.reportingPeriod),
        } : null,
        teamMembers: data.project.teamMembers.map((member: any) => ({
          ...member,
          joinedDate: new Date(member.joinedDate),
          leftDate: member.leftDate ? new Date(member.leftDate) : null,
        })),
      };

      setSelectedProject(projectDetail);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load project details');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  /**
   * Handle investment submission
   * Requirement 4.7: Provide investment form with amount input and confirmation
   * Requirement 5.1: Update InvestorContext after successful investment
   * Requirement 5.2: Redirect to portfolio after investment
   * Requirement 12.1: Update investor status immediately
   * Requirement 12.3: Trigger UI refresh for access-controlled components
   */
  const handleInvest = async (projectId: string, amount: number): Promise<void> => {
    try {
      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to submit investment');
      }

      // Requirement 5.1, 12.1: Immediately mark user as investor for instant UI feedback
      // This updates all access-controlled components without waiting for API call (Requirement 12.3)
      markAsInvestor();

      // Also refresh status from API to get accurate investment count and total
      await refreshStatus();

      // Requirement 5.2: Redirect to portfolio after investment
      router.push('/investor-portal');
    } catch (err) {
      console.error('Error submitting investment:', err);
      throw err; // Re-throw to be handled by modal
    }
  };

  /**
   * Apply filters and search to projects
   * Requirements 4.1, 4.2, 4.3, 4.4, 4.5: Filter and sort projects
   */
  const applyFilters = () => {
    let filtered = [...projects];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((project) => project.category === categoryFilter);
    }

    // Apply risk level filter
    if (riskFilter !== "all") {
      filtered = filtered.filter((project) => project.riskLevel === riskFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "funding":
          return b.currentFunding - a.currentFunding;
        case "return":
          return b.expectedReturn - a.expectedReturn;
        case "duration":
          return a.operationalDuration - b.operationalDuration;
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  };

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    applyFilters();
  }, [searchQuery, categoryFilter, riskFilter, sortBy, projects]);

  // Handle project card click
  const handleProjectClick = (projectId: string) => {
    fetchProjectDetails(projectId);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Investment Portal</h1>
              <p className="text-muted-foreground mt-2">
                Explore investment opportunities and grow your portfolio
              </p>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search projects by name, description, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]" data-testid="category-filter">
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

              {/* Risk Level Filter */}
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-full md:w-[180px]" data-testid="risk-filter">
                  <SelectValue placeholder="All Risk Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]" data-testid="sort-filter">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="funding">Funding Amount</SelectItem>
                  <SelectItem value="return">Expected Return</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || categoryFilter !== "all" || riskFilter !== "all") && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <button
                      onClick={() => setSearchQuery("")}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {categoryFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Category: {categoryFilter}
                    <button
                      onClick={() => setCategoryFilter("all")}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {riskFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Risk: {riskFilter}
                    <button
                      onClick={() => setRiskFilter("all")}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setRiskFilter("all");
                  }}
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-destructive">Error</h3>
              <p className="text-sm text-destructive/90 mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchProjects}
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProjects.length === 0 && !error && (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || categoryFilter !== "all" || riskFilter !== "all"
                ? "Try adjusting your filters to see more results"
                : "There are no investment projects available at this time"}
            </p>
            {(searchQuery || categoryFilter !== "all" || riskFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setRiskFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Project Grid - Requirement 4.1 */}
        {!isLoading && filteredProjects.length > 0 && (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => handleProjectClick(project.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Project Detail Modal - Requirements 4.6, 4.7 */}
      <ProjectDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        project={selectedProject}
        onInvest={handleInvest}
      />

      {/* Loading Detail Overlay */}
      {isLoadingDetail && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading project details...</p>
          </div>
        </div>
      )}
    </div>
  );
}
