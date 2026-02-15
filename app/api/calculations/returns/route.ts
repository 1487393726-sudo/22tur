/**
 * Return Calculation API Endpoint
 * POST /api/calculations/returns
 * 
 * Provides comprehensive return calculation services for investments and portfolios
 * Requirements: 3.2, 3.4, 3.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { returnCalculationEngine } from '@/lib/investment-management/return-calculation-engine';
import { 
  ReturnCalculationRequest,
  ReturnCalculationResponse,
  InvestmentBusinessError,
  BusinessErrorCodes
} from '@/types/investment-management';
import { validateReturnCalculationRequest } from '@/lib/investment-management/validation';

/**
 * POST /api/calculations/returns
 * Calculate returns for investments using various methods
 */
export async function POST(request: NextRequest) {
  try {
    const body: ReturnCalculationRequest = await request.json();

    // Validate request data
    const validation = validateReturnCalculationRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Calculate returns using the engine
    const results = await returnCalculationEngine.batchCalculateReturns(body);

    return NextResponse.json({
      success: true,
      data: results,
      calculationType: body.calculationType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Return calculation API error:', error);

    if (error instanceof InvestmentBusinessError) {
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: error.details
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error during return calculation',
        code: BusinessErrorCodes.CALCULATION_ERROR
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/calculations/returns
 * Get available calculation methods and their descriptions
 */
export async function GET() {
  try {
    const calculationMethods = {
      ABSOLUTE: {
        name: 'Absolute Return',
        description: 'Current Value - Initial Investment',
        formula: 'Current Value - Initial Investment',
        unit: 'currency'
      },
      ANNUALIZED: {
        name: 'Annualized Return',
        description: 'Return rate adjusted for time period',
        formula: '((Current Value / Initial Investment) ^ (365 / Days Held)) - 1',
        unit: 'percentage'
      },
      IRR: {
        name: 'Internal Rate of Return',
        description: 'Discount rate that makes NPV equal to zero',
        formula: 'NPV = 0 when discount rate = IRR',
        unit: 'percentage',
        requirements: 'Requires cash flow data'
      },
      SHARPE: {
        name: 'Sharpe Ratio',
        description: 'Risk-adjusted return measure',
        formula: '(Portfolio Return - Risk-free Rate) / Standard Deviation',
        unit: 'ratio',
        requirements: 'Requires historical returns and risk-free rate'
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        availableMethods: calculationMethods,
        supportedCurrencies: ['USD', 'CNY', 'EUR', 'GBP'],
        maxInvestments: 100,
        cacheEnabled: true,
        cacheDuration: '5 minutes'
      }
    });

  } catch (error) {
    console.error('Return calculation methods API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve calculation methods',
        code: BusinessErrorCodes.CALCULATION_ERROR
      },
      { status: 500 }
    );
  }
}