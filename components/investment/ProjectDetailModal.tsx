"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  Clock,
  Target,
  BarChart3,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { ProjectSummary } from "./project-card";

/**
 * Development stage information
 * Requirement 7.1, 7.3
 */
export interface DevelopmentStage {
  id: string;
  projectId: string;
  stageName: string;
  startDate: Date;
  expectedEndDate: Date;
  actualEndDate: Date | null;
  status: 'in_progress' | 'completed' | 'delayed';
}

/**
 * Financial performance data
 * Requirement 8.1, 8.2, 8.4
 */
export interface FinancialPerformance {
  id: string;
  projectId: string;
  reportingPeriod: Date;
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  revenueBreakdown: Array<{ source: string; amount: number }>;
  expenseBreakdown: Array<{ category: string; amount: number }>;
}

/**
 * Team member information
 * Requirement 9.1, 9.2, 9.3
 */
export interface TeamMember {
  id: string;
  projectId: string;
  name: string;
  role: string;
  expertiseLevel: 'junior' | 'mid' | 'senior' | 'lead';
  contributionScore: number;
  performanceRating: number;
  joinedDate: Date;
  leftDate: Date | null;
}

/**
 * Detailed project information
 * Requirement 4.6
 */
export interface ProjectDetail extends ProjectSummary {
  currentStage: DevelopmentStage | null;
  stageHistory: DevelopmentStage[];
  financialPerformance: FinancialPerformance | null;
  teamMembers: TeamMember[];
}

/**
 * ProjectDetailModal component props
 */
export interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectDetail | null;
  onInvest: (projectId: string, amount: number) => Promise<void>;
}

/**
 * ProjectDetailModal Component
 * 
 * Displays comprehensive project information in a modal dialog.
 * Implements requirements 4.6 and 4.7 from the design specification.
 * 
 * Features:
 * - Display comprehensive project information
 * - Show financial projections and historical performance
 * - Add investment form with amount input
 * - Implement investment submission logic
 * 
 * @param {ProjectDetailModalProps} props - Component props
 * @returns {JSX.Element} Rendered project detail modal
 */
export function ProjectDetailModal({
  isOpen,
  onClose,
  project,
  onInvest,
}: ProjectDetailModalProps): JSX.Element {
  const [investmentAmount, setInvestmentAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  // Reset state when modal closes
  const handleClose = () => {
    setInvestmentAmount("");
    setError("");
    setIsSubmitting(false);
    onClose();
  };

  // Handle investment submission
  const handleInvestmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!project) return;

    const amount = parseFloat(investmentAmount);

    // Validate investment amount
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid investment amount");
      return;
    }

    if (amount < project.minimumInvestment) {
      setError(`Minimum investment is ${formatCurrency(project.minimumInvestment)}`);
      return;
    }

    const remainingFunding = project.fundingGoal - project.currentFunding;
    if (amount > remainingFunding) {
      setError(`Maximum investment available is ${formatCurrency(remainingFunding)}`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onInvest(project.id, amount);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit investment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency values
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date values
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  // Calculate funding progress
  const fundingProgress = project
    ? Math.min((project.currentFunding / project.fundingGoal) * 100, 100)
    : 0;

  // Risk level configuration
  const riskConfig = {
    low: { color: "bg-green-100 text-green-800", label: "Low Risk" },
    medium: { color: "bg-yellow-100 text-yellow-800", label: "Medium Risk" },
    high: { color: "bg-red-100 text-red-800", label: "High Risk" },
  };

  // Expertise level configuration
  const expertiseConfig = {
    junior: { color: "bg-blue-100 text-blue-800", label: "Junior" },
    mid: { color: "bg-purple-100 text-purple-800", label: "Mid-Level" },
    senior: { color: "bg-orange-100 text-orange-800", label: "Senior" },
    lead: { color: "bg-pink-100 text-pink-800", label: "Lead" },
  };

  if (!project) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{project.name}</DialogTitle>
              <DialogDescription className="mt-2">
                {project.description}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{project.category}</Badge>
              <Badge
                variant="outline"
                className={riskConfig[project.riskLevel].color}
              >
                {riskConfig[project.riskLevel].label}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Funding Progress Section */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Funding Progress</span>
            <span className="font-medium">{fundingProgress.toFixed(1)}%</span>
          </div>
          <Progress value={fundingProgress} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="font-medium">{formatCurrency(project.currentFunding)} raised</span>
            <span className="text-muted-foreground">{formatCurrency(project.fundingGoal)} goal</span>
          </div>
        </div>

        <Separator />

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Expected Return</span>
            </div>
            <span className="text-lg font-semibold text-green-600">
              {project.expectedReturn}%
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Duration</span>
            </div>
            <span className="text-lg font-semibold">
              {Math.round(project.operationalDuration / 30)} months
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Min. Investment</span>
            </div>
            <span className="text-lg font-semibold">
              {formatCurrency(project.minimumInvestment)}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs">Team Size</span>
            </div>
            <span className="text-lg font-semibold">
              {project.teamMembers.filter(m => !m.leftDate).length}
            </span>
          </div>
        </div>

        <Separator />

        {/* Tabbed Content - Requirements 4.6, 7.1, 8.1, 9.1 */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stages">Development</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {project.description}
                  </p>
                </div>

                {project.currentStage && (
                  <div>
                    <h4 className="font-medium mb-2">Current Stage</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {project.currentStage.stageName}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Started {formatDate(project.currentStage.startDate)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Category</span>
                    <p className="font-medium">{project.category}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Risk Level</span>
                    <p className="font-medium">{riskConfig[project.riskLevel].label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Development Stages Tab - Requirement 7.1, 7.3, 7.4 */}
          <TabsContent value="stages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Development Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {project.stageHistory.length > 0 ? (
                  <div className="space-y-4">
                    {project.stageHistory.map((stage, index) => (
                      <div key={stage.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              stage.status === 'completed'
                                ? 'bg-green-100 text-green-600'
                                : stage.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-yellow-100 text-yellow-600'
                            }`}
                          >
                            {stage.status === 'completed' ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                          </div>
                          {index < project.stageHistory.length - 1 && (
                            <div className="w-0.5 h-12 bg-border" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{stage.stageName}</h4>
                            <Badge
                              variant="outline"
                              className={
                                stage.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : stage.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {stage.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Started: {formatDate(stage.startDate)}</p>
                            <p>Expected: {formatDate(stage.expectedEndDate)}</p>
                            {stage.actualEndDate && (
                              <p>Completed: {formatDate(stage.actualEndDate)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No development stages available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Performance Tab - Requirement 8.1, 8.2, 8.4 */}
          <TabsContent value="financials" className="space-y-4">
            {project.financialPerformance ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Financial Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Revenue</span>
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(project.financialPerformance.revenue)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Expenses</span>
                        <p className="text-lg font-semibold text-red-600">
                          {formatCurrency(project.financialPerformance.expenses)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Profit</span>
                        <p
                          className={`text-lg font-semibold ${
                            project.financialPerformance.profit >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(project.financialPerformance.profit)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Profit Margin</span>
                        <p
                          className={`text-lg font-semibold ${
                            project.financialPerformance.profitMargin >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {project.financialPerformance.profitMargin.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue Breakdown */}
                {project.financialPerformance.revenueBreakdown.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Revenue Sources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {project.financialPerformance.revenueBreakdown.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{item.source}</span>
                            <span className="font-medium">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Expense Breakdown */}
                {project.financialPerformance.expenseBreakdown.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Expense Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {project.financialPerformance.expenseBreakdown.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{item.category}</span>
                            <span className="font-medium">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-8">
                  <p className="text-sm text-muted-foreground text-center">
                    Financial data not yet available
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Team Members Tab - Requirement 9.1, 9.2, 9.3 */}
          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                {project.teamMembers.length > 0 ? (
                  <div className="space-y-4">
                    {project.teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-start justify-between p-3 rounded-lg border"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{member.name}</h4>
                            <Badge
                              variant="outline"
                              className={expertiseConfig[member.expertiseLevel].color}
                            >
                              {expertiseConfig[member.expertiseLevel].label}
                            </Badge>
                            {member.leftDate && (
                              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                Former
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Contribution: {member.contributionScore.toFixed(1)}</span>
                            <span>Rating: {member.performanceRating.toFixed(1)}/5.0</span>
                            <span>Joined: {formatDate(member.joinedDate)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No team members available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Investment Form - Requirement 4.7 */}
        <form onSubmit={handleInvestmentSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="investment-amount">Investment Amount</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="investment-amount"
                  type="number"
                  placeholder={`Minimum ${formatCurrency(project.minimumInvestment)}`}
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="pl-9"
                  min={project.minimumInvestment}
                  step="100"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Minimum investment: {formatCurrency(project.minimumInvestment)} • 
              Available: {formatCurrency(project.fundingGoal - project.currentFunding)}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Invest Now
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
