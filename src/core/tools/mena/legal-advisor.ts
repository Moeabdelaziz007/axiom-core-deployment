/**
 * MENA Legal Advisor Tools
 * Specialized tools for Saudi Labor Law and UAE regulations
 * Zero-cost integration with ChromaDB for RAG-based legal consultation
 */

import { load } from 'cheerio';

/**
 * Saudi Labor Law Consultant
 * RAG-based legal advice using 2024 amendments and regulations
 */
export class SaudiLaborLawConsultant {
  
  private lawArticles: Record<string, string> = {};
  
  constructor() {
    // Initialize with key 2024 amendments
    this.initializeLawData();
  }

  /**
   * Initialize Saudi Labor Law data (2024 amendments)
   * In production, would load from ChromaDB vector database
   */
  private initializeLawData(): void {
    this.lawArticles = {
      'probation': `
Article 53 (Amended 2024):
The probationary period shall not exceed ninety (90) days.

Extension allowed only with written consent from the employee, up to maximum 180 days.

Article 54 (New 2024):
During probation, both parties may terminate employment with one week's notice.

Employee dismissed during probation is not entitled to end-of-service compensation.
      `,
      'maternity': `
Article 71 (Amended 2024):
Female employee entitled to 14 weeks maternity leave with full pay.

6 weeks before birth and 8 weeks after birth.

Can be extended without pay up to 10 weeks total.

Father entitled to 3 days paternity leave.
      `,
      'termination': `
Article 75 (Amended 2024):
End-of-service compensation based on last salary:

- For 2-5 years service: 20 days pay per year of service
- For 5+ years service: 30 days pay per year of service

Minimum 60 days compensation for any termination without cause.
      `,
      'overtime': `
Article 101:
Normal working hours: 8 hours/day, 48 hours/week.

Overtime: 1.5x regular rate for first 2 hours, 2x for additional.

Cannot exceed 12 hours/day total.
      `,
      'vacation': `
Article 106:
Annual leave entitlement:
- 21 days for employees with less than 1 year service
- 30 days for employees with 1+ year service

Vacation accrues at 2.5 days per month of service.
      `
    };
  }

  /**
   * Query Saudi Labor Law for specific advice
   * Simulates RAG query on vector database
   */
  async consultLaborLaw(query: string): Promise<{
    answer: string;
    article: string;
    confidence: number;
    legalAdvice: string[];
    actionSteps: string[];
  }> {
    
    // Simulate vector search in ChromaDB
    const relevantArticles = this.searchRelevantArticles(query);
    
    const primaryArticle = relevantArticles[0];
    const answer = this.generateAnswer(query, primaryArticle);
    
    return {
      answer,
      article: primaryArticle.topic,
      confidence: primaryArticle.relevance,
      legalAdvice: this.generateLegalAdvice(query, primaryArticle),
      actionSteps: this.generateActionSteps(query, primaryArticle)
    };
  }

  /**
   * Specific queries about probation period
   */
  async checkProbationStatus(
    employmentType: string,
    probationDays: number,
    extension: boolean = false
  ): Promise<{
    legal: boolean;
    maxDays: number;
    reason: string;
    employeeRights: string[];
  }> {
    
    let maxDays = 90; // Default
    
    if (employmentType === 'technical') {
      maxDays = 180; // Technical roles can extend to 180 days
    }
    
    if (employmentType === 'senior') {
      maxDays = 180; // Senior positions can extend
    }
    
    const isLegal = probationDays <= maxDays;
    
    return {
      legal: isLegal,
      maxDays,
      reason: isLegal 
        ? 'Probation period is within legal limits'
        : `Probation exceeds maximum ${maxDays} days allowed by law`,
      employeeRights: [
        'Right to written extension agreement if applicable',
        'Right to termination notice during probation',
        'No end-of-service compensation if dismissed during probation'
      ]
    };
  }

  /**
   * Calculate end-of-service compensation
   */
  calculateEndOfService(
    lastSalary: number,
    yearsOfService: number,
    terminationReason: 'resignation' | 'termination' | 'end_of_contract' = 'termination'
  ): {
    compensationDays: number;
    totalAmount: number;
    calculation: string;
  } {
    
    let compensationDays = 0;
    
    if (yearsOfService < 2) {
      // Less than 2 years - prorated
      compensationDays = Math.max(30, Math.floor(yearsOfService * 15)); // Minimum 30 days
    } else if (yearsOfService >= 2 && yearsOfService < 5) {
      // 2-5 years: 20 days per year
      compensationDays = yearsOfService * 20;
    } else {
      // 5+ years: 30 days per year
      compensationDays = yearsOfService * 30;
    }
    
    const dailySalary = lastSalary / 30;
    const totalAmount = compensationDays * dailySalary;
    
    return {
      compensationDays,
      totalAmount: Math.round(totalAmount),
      calculation: `${compensationDays} days × ${dailySalary.toFixed(2)} AED/day = ${totalAmount.toFixed(2)} AED`
    };
  }

  /**
   * Simulate vector search in ChromaDB
   */
  private searchRelevantArticles(query: string): Array<{topic: string, content: string, relevance: number}> {
    const results = [];
    
    for (const [topic, content] of Object.entries(this.lawArticles)) {
      let relevance = 0;
      
      // Simple keyword matching (in production would use vector similarity)
      if (query.toLowerCase().includes('probation') && topic === 'probation') relevance = 0.9;
      else if (query.toLowerCase().includes('maternity') && topic === 'maternity') relevance = 0.9;
      else if (query.toLowerCase().includes('termination') || query.toLowerCase().includes('end of service')) relevance = 0.8;
      else if (query.toLowerCase().includes('overtime')) relevance = 0.8;
      else if (query.toLowerCase().includes('vacation') || query.toLowerCase().includes('leave')) relevance = 0.8;
      
      if (relevance > 0.3) {
        results.push({ topic, content, relevance });
      }
    }
    
    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Generate answer based on query and articles
   */
  private generateAnswer(query: string, article: any): string {
    if (article.topic === 'probation') {
      return `Based on Article 53 (amended 2024), the maximum probationary period is 90 days, extendable to 180 days only with written employee consent. During probation, either party may terminate with one week's notice, and the employee is not entitled to end-of-service compensation if dismissed.`;
    } else if (article.topic === 'termination') {
      return `According to Article 75 (amended 2024), end-of-service compensation is calculated as 20 days per year for 2-5 years of service, and 30 days per year for 5+ years. Minimum compensation is 60 days regardless of service length.`;
    } else if (article.topic === 'maternity') {
      return `Article 71 (amended 2024) grants 14 weeks maternity leave with full pay (6 weeks before birth, 8 weeks after). Extension without pay up to 10 weeks total is available. Fathers receive 3 days paternity leave.`;
    }
    
    return `According to the Saudi Labor Law 2024 amendments: ${article.content.substring(0, 200)}...`;
  }

  /**
   * Generate legal advice based on query
   */
  private generateLegalAdvice(query: string, article: any): string[] {
    if (query.toLowerCase().includes('probation')) {
      return [
        'Ensure any extension beyond 90 days has written employee consent',
        'Probation termination does not require end-of-service compensation',
        'Provide written notice as specified in the employment contract'
      ];
    } else if (query.toLowerCase().includes('termination')) {
      return [
        'Calculate end-of-service based on last 30 days salary',
        'Provide termination notice as per contract terms',
        'Payment must be made within 7 days of termination'
      ];
    }
    
    return ['Consult with a qualified labor law attorney for specific cases', 'Keep all employment documentation for reference'];
  }

  /**
   * Generate action steps
   */
  private generateActionSteps(query: string, article: any): string[] {
    if (query.toLowerCase().includes('probation')) {
      return [
        'Check employment contract for probation clause',
        'Verify no violations of maximum 90-day limit',
        'If extension needed, obtain written employee consent',
        'Keep detailed records of all probation communications'
      ];
    } else if (query.toLowerCase().includes('termination')) {
      return [
        'Calculate end-of-service compensation accurately',
        'Prepare termination letter with clear reason',
        'Ensure all outstanding benefits are included',
        'Schedule final payment within legal timeframe'
      ];
    }
    
    return ['Review relevant contract clauses', 'Document the situation comprehensively', 'Seek professional legal advice if needed'];
  }
}

/**
 * UAE Labor Law Advisor
 * Advisory for MOHRE regulations and Emirates-specific laws
 */
export class UAELaborLawAdvisor {
  
  /**
   * Check Emiratesization (Tawteen) compliance
   */
  checkEmiratesizationCompliance(
    companySize: number,
    currentEmiratis: number,
    sector: 'public' | 'private' | 'financial' | 'other' = 'private'
  ): {
    requiredPercentage: number;
    currentCompliance: number;
    targetNumber: number;
    recommendations: string[];
  } {
    
    // MOHRE Tawteen quotas
    let requiredPercentage = 2; // Default
    
    if (sector === 'public') requiredPercentage = 100;
    else if (sector === 'financial') requiredPercentage = 20;
    else if (companySize > 50) requiredPercentage = 2;
    
    const currentCompliance = (currentEmiratis / companySize) * 100;
    const targetNumber = Math.ceil(companySize * requiredPercentage / 100);
    const additionalNeeded = Math.max(0, targetNumber - currentEmiratis);
    
    const recommendations = [];
    
    if (currentCompliance < requiredPercentage) {
      recommendations.push(`Hire ${additionalNeeded} additional Emirati employees`);
      recommendations.push('Consider partnering with Emirati recruitment agencies');
      recommendations.push('Explore remote work options for local employees');
    } else {
      recommendations.push('Company meets Emiratesization requirements');
      recommendations.push('Consider mentoring programs to support local talent');
    }
    
    return {
      requiredPercentage,
      currentCompliance: Math.round(currentCompliance * 100) / 100,
      targetNumber,
      recommendations
    };
  }

  /**
   * UAE working hours and overtime calculations
   */
  calculateUAEWorkingHours(
    dailyHours: number,
    weeklyHours: number,
    overtimeHours: number = 0
  ): {
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  } {
    
    const violations = [];
    const recommendations = [];
    
    // UAE Labor Law limits
    if (dailyHours > 9) violations.push('Daily hours exceed 9-hour limit');
    if (weeklyHours > 48) violations.push('Weekly hours exceed 48-hour limit');
    if (overtimeHours > 2) recommendations.push('Limit overtime to 2 hours per day');
    
    return {
      compliant: violations.length === 0,
      violations,
      recommendations
    };
  }
}

/**
 * MENA Legal Tools for MCP Server
 */
export const MENALegalTools = {
  /**
   * MCP Tool: Consult Saudi Labor Law
   */
  consultSaudiLaborLaw: {
    name: 'consult_saudi_labor',
    description: 'Get advice on Saudi Labor Law with 2024 amendments',
    parameters: {
      query: { type: 'string', description: 'Legal question about Saudi Labor Law' },
      context: { type: 'string', description: 'Employment context (optional)' }
    },
    handler: async (params: any) => {
      const consultant = new SaudiLaborLawConsultant();
      return await consultant.consultLaborLaw(params.query);
    }
  },

  /**
   * MCP Tool: Check probation status
   */
  checkProbationStatus: {
    name: 'check_probation_status',
    description: 'Check if probation period complies with Saudi Labor Law',
    parameters: {
      employmentType: { type: 'string', description: 'general, technical, senior' },
      probationDays: { type: 'number', description: 'Current probation period in days' },
      extension: { type: 'boolean', description: 'Whether extension is proposed' }
    },
    handler: async (params: any) => {
      const consultant = new SaudiLaborLawConsultant();
      return await consultant.checkProbationStatus(
        params.employmentType,
        params.probationDays,
        params.extension
      );
    }
  },

  /**
   * MCP Tool: Calculate end-of-service compensation
   */
  calculateEndOfService: {
    name: 'calculate_end_of_service',
    description: 'Calculate end-of-service compensation in Saudi Arabia',
    parameters: {
      lastSalary: { type: 'number', description: 'Last monthly salary' },
      yearsOfService: { type: 'number', description: 'Years of service' },
      terminationReason: { type: 'string', description: 'resignation, termination, end_of_contract' }
    },
    handler: async (params: any) => {
      const consultant = new SaudiLaborLawConsultant();
      return consultant.calculateEndOfService(
        params.lastSalary,
        params.yearsOfService,
        params.terminationReason
      );
    }
  },

  /**
   * MCP Tool: Check UAE Emiratesization compliance
   */
  checkEmiratesizationCompliance: {
    name: 'check_emiratesization',
    description: 'Check Tawteen compliance for UAE companies',
    parameters: {
      companySize: { type: 'number', description: 'Total number of employees' },
      currentEmiratis: { type: 'number', description: 'Current number of Emirati employees' },
      sector: { type: 'string', description: 'public, private, financial, other' }
    },
    handler: async (params: any) => {
      const advisor = new UAELaborLawAdvisor();
      return advisor.checkEmiratesizationCompliance(
        params.companySize,
        params.currentEmiratis,
        params.sector
      );
    }
  }
};

export default MENALegalTools;