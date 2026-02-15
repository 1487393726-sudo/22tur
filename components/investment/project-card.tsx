import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Clock,
  DollarSign,
  AlertTriangle,
  Calendar,
} from "lucide-react";

/**
 * ProjectSummary interface as defined in the design document
 * Represents the data structure for a project investment opportunity
 */
export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  category: string;
  fundingGoal: number;
  currentFunding: number;
  operationalDuration: number; // days
  minimumInvestment: number;
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn: number; // percentage
}

/**
 * ProjectCard component props
 */
export interface ProjectCardProps {
  project: ProjectSummary;
  onClick: () => void;
}

/**
 * ProjectCard Component
 * 
 * Displays summary information for a single investment project.
 * Implements requirements 4.2, 4.3, 4.4, 4.5 from the design specification.
 * 
 * Display Elements:
 * - Project name and category badge
 * - Progress bar showing funding percentage
 * - Key metrics: funding amount, duration, minimum investment
 * - Risk indicator and expected return
 * - "View Details" button
 * 
 * @param {ProjectCardProps} props - Component props
 * @returns {JSX.Element} Rendered project card
 */
export function ProjectCard({ project, onClick }: ProjectCardProps): JSX.Element {
  // Calculate funding progress percentage
  const fundingProgress = Math.min(
    (project.currentFunding / project.fundingGoal) * 100,
    100
  );

  // Convert operational duration from days to months for display
  const durationInMonths = Math.round(project.operationalDuration / 30);

  // Risk level styling configuration
  const riskConfig = {
    low: {
      color: "bg-green-100 text-green-800 border-green-200",
      label: "Low Risk",
      icon: <AlertTriangle className="h-3 w-3" />,
    },
    medium: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      label: "Medium Risk",
      icon: <AlertTriangle className="h-3 w-3" />,
    },
    high: {
      color: "bg-red-100 text-red-800 border-red-200",
      label: "High Risk",
      icon: <AlertTriangle className="h-3 w-3" />,
    },
  };

  const currentRiskConfig = riskConfig[project.riskLevel];

  // Format currency values
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
      <CardHeader className="pb-3">
        {/* Project name and category */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-2 flex-1">
              {project.name}
            </h3>
            <Badge variant="outline" className="shrink-0">
              {project.category}
            </Badge>
          </div>
          
          {/* Risk indicator */}
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${currentRiskConfig.color} flex items-center gap-1`}
            >
              {currentRiskConfig.icon}
              <span className="text-xs">{currentRiskConfig.label}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Project description */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {project.description}
        </p>

        {/* Funding progress bar - Requirement 4.2 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Funding Progress</span>
            <span className="font-medium">{fundingProgress.toFixed(1)}%</span>
          </div>
          <Progress value={fundingProgress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(project.currentFunding)} raised</span>
            <span>{formatCurrency(project.fundingGoal)} goal</span>
          </div>
        </div>

        {/* Key metrics grid - Requirements 4.3, 4.4, 4.5 */}
        <div className="grid grid-cols-2 gap-3">
          {/* Expected return - Requirement 4.5 */}
          <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
            <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground">Expected Return</span>
              <span className="font-semibold text-green-600">
                {project.expectedReturn}%
              </span>
            </div>
          </div>

          {/* Operational duration - Requirement 4.3 */}
          <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
            <Calendar className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground">Duration</span>
              <span className="font-semibold">
                {durationInMonths} {durationInMonths === 1 ? 'month' : 'months'}
              </span>
            </div>
          </div>

          {/* Minimum investment - Requirement 4.5 */}
          <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 col-span-2">
            <DollarSign className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground">Minimum Investment</span>
              <span className="font-semibold">
                {formatCurrency(project.minimumInvestment)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button 
          onClick={onClick} 
          className="w-full"
          variant="default"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
