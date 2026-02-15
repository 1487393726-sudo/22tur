import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Calendar,
  Timer,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

/**
 * Development stage information
 * As defined in the design document section 8
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
 * DevelopmentStageTimeline component props
 */
export interface DevelopmentStageTimelineProps {
  currentStage: DevelopmentStage | null;
  stageHistory: DevelopmentStage[];
}

/**
 * DevelopmentStageTimeline Component
 * 
 * Displays the development progress of a project with a visual timeline.
 * Implements requirements 7.1, 7.3, 7.4 from the design specification.
 * 
 * Display Elements:
 * - Current development stage (Requirement 7.1)
 * - Stage name, start date, and expected completion date (Requirement 7.3)
 * - All previous stages with their durations (Requirement 7.4)
 * - Visual timeline representation with status indicators
 * 
 * @param {DevelopmentStageTimelineProps} props - Component props
 * @returns {JSX.Element} Rendered development stage timeline
 */
export function DevelopmentStageTimeline({
  currentStage,
  stageHistory,
}: DevelopmentStageTimelineProps): JSX.Element {
  // Format date for display
  const formatDate = (date: Date): string => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  // Calculate duration in days
  const calculateDuration = (stage: DevelopmentStage): number => {
    const endDate = stage.actualEndDate || new Date();
    return differenceInDays(new Date(endDate), new Date(stage.startDate));
  };

  // Get status configuration
  const getStatusConfig = (status: DevelopmentStage['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle2 className="h-5 w-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          badgeVariant: 'default' as const,
          label: 'Completed',
        };
      case 'in_progress':
        return {
          icon: <Clock className="h-5 w-5" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          badgeVariant: 'secondary' as const,
          label: 'In Progress',
        };
      case 'delayed':
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          badgeVariant: 'destructive' as const,
          label: 'Delayed',
        };
    }
  };

  // Combine current stage and history, sorted by start date (newest first)
  const allStages = currentStage 
    ? [currentStage, ...stageHistory]
    : stageHistory;
  
  const sortedStages = [...allStages].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Development Timeline</CardTitle>
        {currentStage && (
          <p className="text-sm text-muted-foreground mt-1">
            Current Stage: <span className="font-medium">{currentStage.stageName}</span>
          </p>
        )}
      </CardHeader>

      <CardContent>
        {sortedStages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Circle className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No development stages available yet
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedStages.map((stage, index) => {
              const statusConfig = getStatusConfig(stage.status);
              const duration = calculateDuration(stage);
              const isCurrentStage = currentStage?.id === stage.id;

              return (
                <div
                  key={stage.id}
                  className={`relative pl-8 pb-4 ${
                    index !== sortedStages.length - 1 ? 'border-l-2 border-gray-200 ml-2' : 'ml-2'
                  }`}
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-0 top-0 -ml-[9px] p-1 rounded-full bg-white border-2 ${
                      isCurrentStage ? statusConfig.borderColor : 'border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isCurrentStage ? statusConfig.bgColor : 'bg-gray-200'
                      }`}
                    />
                  </div>

                  {/* Stage content */}
                  <div
                    className={`p-4 rounded-lg border ${
                      isCurrentStage
                        ? `${statusConfig.bgColor} ${statusConfig.borderColor}`
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    {/* Stage header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={statusConfig.color}>
                          {statusConfig.icon}
                        </div>
                        <h3 className="font-semibold text-base truncate">
                          {stage.stageName}
                        </h3>
                        {isCurrentStage && (
                          <Badge variant="outline" className="ml-auto shrink-0">
                            Current
                          </Badge>
                        )}
                      </div>
                      <Badge variant={statusConfig.badgeVariant} className="shrink-0">
                        {statusConfig.label}
                      </Badge>
                    </div>

                    {/* Stage details - Requirement 7.3 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {/* Start date */}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">Started: </span>
                          <span className="font-medium">
                            {formatDate(stage.startDate)}
                          </span>
                        </div>
                      </div>

                      {/* Expected/Actual end date */}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">
                            {stage.actualEndDate ? 'Completed: ' : 'Expected: '}
                          </span>
                          <span className="font-medium">
                            {formatDate(stage.actualEndDate || stage.expectedEndDate)}
                          </span>
                        </div>
                      </div>

                      {/* Duration - Requirement 7.4 */}
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">Duration: </span>
                          <span className="font-medium">
                            {duration} {duration === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                      </div>

                      {/* Status indicator */}
                      {stage.status === 'delayed' && (
                        <div className="flex items-center gap-2 col-span-full">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <span className="text-sm text-orange-600 font-medium">
                            This stage is behind schedule
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary footer */}
        {sortedStages.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Total stages: <span className="font-semibold">{sortedStages.length}</span>
              {' • '}
              Completed: <span className="font-semibold text-green-600">
                {sortedStages.filter(s => s.status === 'completed').length}
              </span>
              {' • '}
              In Progress: <span className="font-semibold text-blue-600">
                {sortedStages.filter(s => s.status === 'in_progress').length}
              </span>
              {sortedStages.some(s => s.status === 'delayed') && (
                <>
                  {' • '}
                  Delayed: <span className="font-semibold text-orange-600">
                    {sortedStages.filter(s => s.status === 'delayed').length}
                  </span>
                </>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
