'use client';

/**
 * AI Assistant Recommendations Management Page
 * Displays and manages AI recommendations
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// Force dynamic rendering to avoid prerender issues with useSearchParams
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  CheckCircle,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Search,
} from 'lucide-react';
import { Recommendation } from '@/lib/ai-assistant/types';

export default function RecommendationsPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [rating, setRating] = useState(3);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (projectId) {
      loadRecommendations();
    }
  }, [projectId, filterType, filterStatus]);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        projectId: projectId || '',
        ...(filterType !== 'all' && { type: filterType }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
      });

      const response = await fetch(`/api/ai-assistant/recommendations?${params}`);
      if (!response.ok) throw new Error('Failed to load recommendations');

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (recId: string) => {
    try {
      const response = await fetch('/api/ai-assistant/recommendations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId: recId, action: 'apply' }),
      });

      if (!response.ok) throw new Error('Failed to apply recommendation');

      setRecommendations((prev) =>
        prev.map((r) =>
          r.id === recId ? { ...r, status: 'applied' as any, appliedAt: new Date() } : r
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to apply recommendation');
    }
  };

  const handleReject = async (recId: string) => {
    try {
      const response = await fetch('/api/ai-assistant/recommendations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId: recId, action: 'reject' }),
      });

      if (!response.ok) throw new Error('Failed to reject recommendation');

      setRecommendations((prev) =>
        prev.map((r) => (r.id === recId ? { ...r, status: 'rejected' as any } : r))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject recommendation');
    }
  };

  const handleRate = async () => {
    if (!selectedRec) return;

    try {
      const response = await fetch('/api/ai-assistant/recommendations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendationId: selectedRec.id,
          action: 'rate',
          rating,
          feedback,
        }),
      });

      if (!response.ok) throw new Error('Failed to rate recommendation');

      setRecommendations((prev) =>
        prev.map((r) =>
          r.id === selectedRec.id ? { ...r, rating, feedback } : r
        )
      );

      setShowRatingDialog(false);
      setSelectedRec(null);
      setRating(3);
      setFeedback('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to rate recommendation');
    }
  };

  const handleDelete = async (recId: string) => {
    if (!confirm('Are you sure you want to delete this recommendation?')) return;

    try {
      const response = await fetch(
        `/api/ai-assistant/recommendations?recommendationId=${recId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete recommendation');

      setRecommendations((prev) => prev.filter((r) => r.id !== recId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete recommendation');
    }
  };

  const filteredRecommendations = recommendations.filter((rec) =>
    rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'secondary';
      case 'LOW':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (!projectId) {
    return (
      <div className="p-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Project ID is required</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Recommendations</h1>
        <p className="text-gray-600 mt-2">
          {recommendations.length} recommendations for your project
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search recommendations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="task_optimization">Task Optimization</SelectItem>
            <SelectItem value="progress_prediction">Progress Prediction</SelectItem>
            <SelectItem value="risk_analysis">Risk Analysis</SelectItem>
            <SelectItem value="resource_allocation">Resource Allocation</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">No recommendations found</p>
            </CardContent>
          </Card>
        ) : (
          filteredRecommendations.map((rec) => (
            <Card key={rec.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{rec.title}</h3>
                      <Badge variant={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(rec.status)}`}>
                        {rec.status}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{rec.description}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Reasoning */}
                <div>
                  <p className="text-sm font-medium mb-1">Reasoning</p>
                  <p className="text-sm text-gray-700">{rec.reasoning}</p>
                </div>

                {/* Expected Benefit */}
                {rec.expectedBenefit && (
                  <div>
                    <p className="text-sm font-medium mb-1">Expected Benefit</p>
                    <p className="text-sm text-gray-700">{rec.expectedBenefit}</p>
                  </div>
                )}

                {/* Rating */}
                {rec.rating && (
                  <div>
                    <p className="text-sm font-medium mb-1">Your Rating</p>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < rec.rating ? '⭐' : '☆'
                            }`}
                          >
                            {i < rec.rating ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      {rec.feedback && (
                        <p className="text-sm text-gray-600 ml-2">"{rec.feedback}"</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  {rec.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApply(rec.id)}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(rec.id)}
                        className="flex-1"
                      >
                        <ThumbsDown className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedRec(rec);
                      setRating(rec.rating || 3);
                      setFeedback(rec.feedback || '');
                      setShowRatingDialog(true);
                    }}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Rate
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(rec.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Recommendation</DialogTitle>
            <DialogDescription>
              How helpful was this recommendation?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Star Rating */}
            <div>
              <p className="text-sm font-medium mb-2">Rating</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="text-3xl transition-transform hover:scale-110"
                  >
                    {star <= rating ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div>
              <p className="text-sm font-medium mb-2">Feedback (optional)</p>
              <Input
                placeholder="Share your thoughts..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowRatingDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleRate}>Submit Rating</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
