/**
 * CaseDetailModal Component
 * 案例详情模态框组件
 * 
 * Displays detailed case study information in a glassmorphism modal
 * Includes project timeline, key metrics, and image gallery
 * 
 * Validates Requirements: 14.2, 14.5
 */

'use client';

import React from 'react';
import { 
  GlassModal, 
  GlassModalCloseButton, 
  GlassModalHeader,
  GlassModalTitle,
  GlassModalBody 
} from '@/components/ui/glass-modal';
import { cn } from '@/lib/utils';

export interface CaseDetailData {
  title: string;
  client: string;
  category: string;
  description: string;
  results: string[];
  tags: string[];
  timeline?: {
    duration: string;
    startDate: string;
    endDate: string;
  };
  metrics?: {
    label: string;
    value: string;
  }[];
  images?: string[];
  challenges?: string;
  solution?: string;
  technologies?: string[];
}

export interface CaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: CaseDetailData | null;
  translations: {
    timeline: string;
    duration: string;
    startDate: string;
    endDate: string;
    keyMetrics: string;
    results: string;
    challenges: string;
    solution: string;
    technologies: string;
    gallery: string;
  };
}

export function CaseDetailModal({
  isOpen,
  onClose,
  caseData,
  translations: t,
}: CaseDetailModalProps) {
  if (!caseData) return null;

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={`Case study details: ${caseData.title}`}
      className="max-w-4xl"
    >
      <GlassModalCloseButton onClick={onClose} />
      
      <GlassModalHeader>
        <GlassModalTitle>{caseData.title}</GlassModalTitle>
        <div className="flex items-center gap-3 mt-2 text-sm text-foreground/70">
          <span>{caseData.client}</span>
          <span className="w-1 h-1 rounded-full bg-foreground/30" />
          <span 
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: 'var(--color-secondary-100)',
              color: 'var(--color-secondary-700)'
            }}
          >
            {caseData.category}
          </span>
        </div>
      </GlassModalHeader>

      <GlassModalBody>
        {/* Description */}
        <div className="mb-6">
          <p className="text-foreground/90 leading-relaxed">
            {caseData.description}
          </p>
        </div>

        {/* Project Timeline (Req 14.5) */}
        {caseData.timeline && (
          <div className="mb-6 p-4 rounded-lg glass-light border border-white/10">
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              {t.timeline}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-foreground/60 mb-1">{t.duration}</div>
                <div className="font-medium text-foreground">{caseData.timeline.duration}</div>
              </div>
              <div>
                <div className="text-sm text-foreground/60 mb-1">{t.startDate}</div>
                <div className="font-medium text-foreground">{caseData.timeline.startDate}</div>
              </div>
              <div>
                <div className="text-sm text-foreground/60 mb-1">{t.endDate}</div>
                <div className="font-medium text-foreground">{caseData.timeline.endDate}</div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics (Req 14.5) */}
        {caseData.metrics && caseData.metrics.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              {t.keyMetrics}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {caseData.metrics.map((metric, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg glass-light border border-white/10"
                >
                  <div className="text-sm text-foreground/60 mb-1">{metric.label}</div>
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: 'var(--color-accent-500)' }}
                  >
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-foreground">
            {t.results}
          </h3>
          <ul className="space-y-2">
            {caseData.results.map((result, index) => (
              <li 
                key={index}
                className="flex items-start gap-3 text-foreground/90"
              >
                <span 
                  className="mt-0.5 flex-shrink-0 text-lg"
                  style={{ color: 'var(--color-accent-500)' }}
                >
                  ✓
                </span>
                <span>{result}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Challenges */}
        {caseData.challenges && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              {t.challenges}
            </h3>
            <p className="text-foreground/90 leading-relaxed">
              {caseData.challenges}
            </p>
          </div>
        )}

        {/* Solution */}
        {caseData.solution && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              {t.solution}
            </h3>
            <p className="text-foreground/90 leading-relaxed">
              {caseData.solution}
            </p>
          </div>
        )}

        {/* Technologies/Tags */}
        {caseData.tags && caseData.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              {t.technologies}
            </h3>
            <div className="flex flex-wrap gap-2">
              {caseData.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1.5 text-sm rounded-full transition-colors"
                  style={{ 
                    backgroundColor: 'var(--color-primary-50)',
                    color: 'var(--color-primary-700)',
                    border: '1px solid var(--color-primary-200)'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Image Gallery (Req 14.5) */}
        {caseData.images && caseData.images.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              {t.gallery}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {caseData.images.map((image, index) => (
                <div 
                  key={index}
                  className="aspect-video rounded-lg overflow-hidden glass-light border border-white/10"
                >
                  <div 
                    className="w-full h-full flex items-center justify-center text-4xl"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--color-primary-100) 0%, var(--color-primary-200) 100%)'
                    }}
                  >
                    🖼️
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassModalBody>
    </GlassModal>
  );
}
