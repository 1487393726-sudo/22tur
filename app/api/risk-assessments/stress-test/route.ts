/**
 * Stress Testing API Endpoint
 * 
 * POST /api/risk-assessments/stress-test - Perform stress testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { riskAssessmentEngine } from '@/lib/investment-management/risk-assessment-engine';
import { validateStressTestRequest } from '@/lib/investment-management/validation';
import { prisma } from '@/lib/prisma';
import { StressScenario } from '@/types/investment-management';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request data
    const validation = validateStressTestRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    const { portfolioId, scenarios } = body;

    // Check if portfolio exists
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        investments: true
      }
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Perform stress tests for all scenarios
    const stressTestResults = [];
    
    for (const scenario of scenarios) {
      try {
        const result = await riskAssessmentEngine.performStressTest(
          portfolio as any,
          scenario
        );
        stressTestResults.push(result);
      } catch (error) {
        console.error(`Stress test failed for scenario ${scenario.name}:`, error);
        stressTestResults.push({
          scenarioName: scenario.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          baseValue: portfolio.totalValue,
          stressedValue: 0,
          loss: 0,
          lossPercentage: 0,
          passesThreshold: false
        });
      }
    }

    // Calculate overall stress test summary
    const summary = {
      totalScenarios: scenarios.length,
      passedScenarios: stressTestResults.filter(r => r.passesThreshold).length,
      worstCaseScenario: stressTestResults.reduce((worst, current) => 
        current.lossPercentage > worst.lossPercentage ? current : worst
      ),
      averageLoss: stressTestResults.reduce((sum, r) => sum + r.lossPercentage, 0) / stressTestResults.length
    };

    return NextResponse.json({
      success: true,
      data: {
        portfolioId,
        portfolioValue: portfolio.totalValue,
        stressTestResults,
        summary,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Stress testing failed:', error);
    return NextResponse.json(
      { 
        error: 'Stress testing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Predefined stress test scenarios
export async function GET() {
  try {
    const predefinedScenarios: StressScenario[] = [
      {
        name: 'Market Crash 2008',
        type: 'MARKET_CRASH',
        description: 'Severe market downturn similar to 2008 financial crisis',
        maxLossThreshold: 30,
        factors: {
          equityDecline: -0.4,
          bondDecline: -0.1,
          realEstateDecline: -0.3,
          commodityDecline: -0.2
        }
      },
      {
        name: 'Interest Rate Shock',
        type: 'INTEREST_RATE_SHOCK',
        description: 'Sudden 3% increase in interest rates',
        maxLossThreshold: 15,
        factors: {
          rateIncrease: 0.03,
          bondImpact: -0.15,
          equityImpact: -0.1
        }
      },
      {
        name: 'Liquidity Crisis',
        type: 'LIQUIDITY_CRISIS',
        description: 'Severe liquidity constraints across markets',
        maxLossThreshold: 25,
        factors: {
          liquidityPremium: 0.05,
          highRiskImpact: -0.4,
          lowRiskImpact: -0.1
        }
      },
      {
        name: 'Sector Rotation',
        type: 'SECTOR_SPECIFIC',
        description: 'Major sector-specific downturn',
        maxLossThreshold: 20,
        factors: {
          sectorDecline: -0.3,
          correlationIncrease: 0.2
        }
      },
      {
        name: 'Inflation Spike',
        type: 'MARKET_CRASH',
        description: 'Sudden inflation increase to 8%+',
        maxLossThreshold: 18,
        factors: {
          inflationRate: 0.08,
          realReturnImpact: -0.15,
          bondImpact: -0.2
        }
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        scenarios: predefinedScenarios,
        description: 'Predefined stress test scenarios for portfolio analysis'
      }
    });

  } catch (error) {
    console.error('Failed to fetch stress test scenarios:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch scenarios',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}