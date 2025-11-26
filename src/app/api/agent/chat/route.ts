import { NextRequest, NextResponse } from 'next/server';
import { SolanaAgentKit } from 'solana-agent-kit';

// Agent Tool Definitions
const AGENT_TOOLS = {
    aqar: {
        name: 'Aqar Property Manager',
        description: 'AI agent for real estate analysis and property management',
        tools: [
            {
                name: 'calculate_property_value',
                description: 'Calculate property valuation based on location, size, and market data',
                parameters: {
                    type: 'object',
                    properties: {
                        location: { type: 'string', description: 'Property location (city, district)' },
                        size: { type: 'number', description: 'Property size in square meters' },
                        property_type: { type: 'string', description: 'Apartment, villa, commercial, etc.' },
                        bedrooms: { type: 'number', description: 'Number of bedrooms' },
                        amenities: { type: 'array', description: 'List of property amenities', items: { type: 'string' } }
                    },
                    required: ['location', 'size']
                }
            },
            {
                name: 'get_crypto_price',
                description: 'Get real-time cryptocurrency prices',
                parameters: {
                    type: 'object',
                    properties: {
                        symbol: { type: 'string', description: 'Cryptocurrency symbol (SOL, BTC, ETH)' },
                        currency: { type: 'string', description: 'Target currency (SAR, USD, EUR)' }
                    },
                    required: ['symbol']
                }
            },
            {
                name: 'search_market_trends',
                description: 'Analyze real estate market trends in specific area',
                parameters: {
                    type: 'object',
                    properties: {
                        area: { type: 'string', description: 'Area to analyze' },
                        time_range: { type: 'string', description: 'Time period (6 months, 1 year, 3 years)' },
                        property_type: { type: 'string', description: 'Filter by property type' }
                    },
                    required: ['area']
                }
            },
            {
                name: 'calculate_roi',
                description: 'Calculate Return on Investment for rental properties',
                parameters: {
                    type: 'object',
                    properties: {
                        purchase_price: { type: 'number', description: 'Property purchase price' },
                        monthly_rent: { type: 'number', description: 'Expected monthly rental income' },
                        expenses: { type: 'number', description: 'Monthly expenses (maintenance, fees, etc.)' }
                    },
                    required: ['purchase_price', 'monthly_rent']
                }
            }
        ]
    },
    mawid: {
        name: 'Mawid Appointment Manager',
        description: 'AI agent for scheduling, calendar management, and cultural timekeeping',
        tools: [
            {
                name: 'hijri_calendar',
                description: 'Convert dates between Gregorian and Hijri calendars, and get prayer times. Use this when users ask about Hijri dates, Ramadan, Eid, or prayer times.',
                parameters: {
                    type: 'object',
                    properties: {
                        action: { type: 'string', description: 'Action to perform: "convert_date" or "get_prayer_times"' },
                        date: { type: 'string', description: 'Gregorian date to convert (YYYY-MM-DD)' },
                        city: { type: 'string', description: 'City for prayer times' },
                        country: { type: 'string', description: 'Country for prayer times' }
                    },
                    required: ['action']
                }
            }
        ]
    },
    tajer: {
        name: 'Tajer E-Commerce & DeFi Negotiator',
        description: 'AI agent for e-commerce negotiation, market analysis, and blockchain operations',
        tools: [
            {
                name: 'quran_search',
                description: 'Search the Quran for verses related to ethics, finance, and guidance. Use this for questions about "Riba", "Halal investment", or ethical business practices.',
                parameters: {
                    type: 'object',
                    properties: {
                        keyword: { type: 'string', description: 'Search keyword (e.g., Riba, Trade, Debt)' },
                        language: { type: 'string', description: 'Language for results (ar or en)' }
                    },
                    required: ['keyword']
                }
            },
            {
                name: 'analyze_competitor',
                description: 'Analyze competitor pricing and strategies',
                parameters: {
                    type: 'object',
                    properties: {
                        product_category: { type: 'string', description: 'Product category to analyze' },
                        competitor_urls: { type: 'array', description: 'List of competitor websites', items: { type: 'string' } },
                        target_price_range: { type: 'string', description: 'Desired price range (budget, premium, economy)' }
                    },
                    required: ['product_category', 'competitor_urls']
                }
            },
            {
                name: 'fetch_competitor_pricing',
                description: 'Retrieves real-time lowest price from competitor websites for a given product',
                parameters: {
                    type: 'object',
                    properties: {
                        product_name: { type: 'string', description: 'Product name to search for' },
                        competitor_urls: { type: 'array', description: 'List of competitor websites to check', items: { type: 'string' } }
                    },
                    required: ['product_name']
                }
            },
            {
                name: 'analyze_inventory_levels',
                description: 'Checks internal D1 database for current stock levels and alerts if inventory is low',
                parameters: {
                    type: 'object',
                    properties: {
                        product_id: { type: 'string', description: 'Product identifier or SKU' },
                        warehouse_location: { type: 'string', description: 'Warehouse or store location (optional)' }
                    },
                    required: ['product_id']
                }
            },
            {
                name: 'optimize_pricing',
                description: 'Calculate optimal pricing based on market data',
                parameters: {
                    type: 'object',
                    properties: {
                        cost_price: { type: 'number', description: 'Product cost price' },
                        market_position: { type: 'string', description: 'Market position (leader, challenger, niche)' },
                        target_margin: { type: 'number', description: 'Desired profit margin percentage' }
                    },
                    required: ['cost_price', 'market_position']
                }
            },
            {
                name: 'deploy_token',
                description: 'Deploy a new SPL token on Solana blockchain',
                parameters: {
                    type: 'object',
                    properties: {
                        token_name: { type: 'string', description: 'Token name (e.g., AXIOM)' },
                        token_symbol: { type: 'string', description: 'Token symbol (e.g., AXM)' },
                        decimals: { type: 'number', description: 'Token decimals (default: 9)' },
                        initial_supply: { type: 'number', description: 'Initial token supply' }
                    },
                    required: ['token_name', 'token_symbol']
                }
            },
            {
                name: 'trade_token',
                description: 'Swap tokens using Jupiter aggregator on Solana',
                parameters: {
                    type: 'object',
                    properties: {
                        input_token: { type: 'string', description: 'Input token mint address or symbol (SOL, USDC, etc.)' },
                        output_token: { type: 'string', description: 'Output token mint address or symbol' },
                        input_amount: { type: 'number', description: 'Amount to swap' },
                        slippage: { type: 'number', description: 'Slippage tolerance percentage (default: 3)' }
                    },
                    required: ['input_token', 'output_token', 'input_amount']
                }
            },
            {
                name: 'get_balance',
                description: 'Check wallet balance for SOL and SPL tokens',
                parameters: {
                    type: 'object',
                    properties: {
                        token_mint: { type: 'string', description: 'Token mint address (optional, defaults to SOL)' }
                    }
                }
            }
        ]
    },
    general: {
        name: 'General Assistant',
        description: 'AI assistant for general tasks and calculations',
        tools: [
            {
                name: 'quran_search',
                description: 'Search the Quran for verses related to ethics, finance, and guidance.',
                parameters: {
                    type: 'object',
                    properties: {
                        keyword: { type: 'string', description: 'Search keyword' },
                        language: { type: 'string', description: 'Language for results (ar or en)' }
                    },
                    required: ['keyword']
                }
            },
            {
                name: 'web_search',
                description: 'Search the web for current information',
                parameters: {
                    type: 'object',
                    properties: {
                        query: { type: 'string', description: 'Search query' },
                        num_results: { type: 'number', description: 'Number of results to return' }
                    },
                    required: ['query']
                }
            },
            {
                name: 'calculator',
                description: 'Perform mathematical calculations',
                parameters: {
                    type: 'object',
                    properties: {
                        expression: { type: 'string', description: 'Mathematical expression to evaluate' },
                        variables: { type: 'object', description: 'Variables and their values' }
                    },
                    required: ['expression']
                }
            },
            {
                name: 'save_report',
                description: 'Save analysis results to user profile',
                parameters: {
                    type: 'object',
                    properties: {
                        report_title: { type: 'string', description: 'Title of the report' },
                        report_data: { type: 'object', description: 'Report data to save' },
                        category: { type: 'string', description: 'Report category (analysis, valuation, market_trend)' }
                    },
                    required: ['report_title', 'report_data']
                }
            }
        ]
    }
};

// Mock data for demonstration
const MOCK_DATA = {
    riyadhPropertyPrices: {
        'north_riyadh': 4500, // SAR per sqm
        'east_riyadh': 3800,
        'west_riyadh': 3200,
        'downtown': 5500
    },
    marketTrends: {
        'riyadh_6months': '+5.2%',
        'riyadh_1year': '+12.8%',
        'riyadh_3years': '+18.3%'
    }
};

export async function POST(request: NextRequest) {
    try {
        const { message, agentId, agentType } = await request.json();

        if (!message || !agentType) {
            return NextResponse.json(
                { error: 'Missing required fields: message, agentId, agentType' },
                { status: 400 }
            );
        }

        // Get agent tools configuration
        const agentConfig = AGENT_TOOLS[agentType as keyof typeof AGENT_TOOLS] || AGENT_TOOLS.general;
        const systemPrompt = `You are ${agentConfig.name}. ${agentConfig.description}. 
      You have access to these tools: ${agentConfig.tools.map(t => t.name).join(', ')}.
      When a user asks for help, use the appropriate tool to provide accurate, data-driven responses.
      Always explain your calculations and show your work process.`;

        console.log(`🤖 ${agentConfig.name} processing: "${message}"`);

        // Call Gemini API with Function Calling
        const geminiResponse = await callGeminiWithTools(message, systemPrompt, agentConfig.tools);

        return NextResponse.json({
            reply: geminiResponse.reply,
            tool_calls: geminiResponse.tool_calls,
            agent: agentConfig.name,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Agent Chat Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Gemini API integration with Function Calling
async function callGeminiWithTools(message: string, systemPrompt: string, tools: any[], solanaKit?: SolanaAgentKit | null) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY not found in environment');
        return {
            reply: 'AI service temporarily unavailable. Please contact support.',
            tool_calls: []
        };
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: message
                    }]
                }],
                systemInstruction: {
                    parts: [{
                        text: systemPrompt
                    }]
                },
                tools: tools.map(tool => ({
                    functionDeclaration: {
                        name: tool.name,
                        description: tool.description,
                        parameters: tool.parameters
                    }
                })),
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048
                }
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0]) {
            const candidate = data.candidates[0];
            const content = candidate.content.parts[0];

            // Check for function calls
            if (content.functionCall) {
                const toolResults = await executeToolCalls([content.functionCall], solanaKit);

                return {
                    reply: candidate.content.parts[0].text || `Executed ${content.functionCall.name}`,
                    tool_calls: [{
                        tool: content.functionCall.name,
                        result: toolResults[content.functionCall.name],
                        execution_time: Date.now()
                    }]
                };
            }

            return {
                reply: candidate.content.parts[0].text || 'I processed your request.',
                tool_calls: []
            };
        }

        return {
            reply: 'I apologize, but I encountered an error processing your request.',
            tool_calls: []
        };

    } catch (error) {
        console.error('❌ Gemini API Error:', error);
        return {
            reply: 'AI service temporarily unavailable. Please try again later.',
            tool_calls: []
        };
    }
}

// Tajer Agent Enhanced Tool Implementations
async function fetchCompetitorPricing(args: any) {
    const { product_name, competitor_urls } = args;

    console.log(`🔍 Fetching competitor pricing for: ${product_name}`);

    // Mock competitor pricing data - in production would use web scraping
    const mockCompetitorData = [
        { site: 'Amazon', price: 299.99, currency: 'USD', availability: 'In Stock' },
        { site: 'eBay', price: 275.50, currency: 'USD', availability: 'Limited Stock' },
        { site: 'Best Buy', price: 319.99, currency: 'USD', availability: 'Pre-order' },
        { site: 'Target', price: 289.99, currency: 'USD', availability: 'In Stock' }
    ];

    const lowestPrice = Math.min(...mockCompetitorData.map(c => c.price));
    const averagePrice = mockCompetitorData.reduce((sum, c) => sum + c.price, 0) / mockCompetitorData.length;

    return {
        product_name: product_name,
        competitor_analysis: mockCompetitorData,
        lowest_price: lowestPrice,
        average_price: averagePrice.toFixed(2),
        price_difference: (averagePrice - lowestPrice).toFixed(2),
        recommendation: lowestPrice < 280 ? 'Excellent competitive opportunity' : 'Consider value proposition',
        last_updated: new Date().toISOString(),
        data_source: 'Competitor Web Analysis'
    };
}

async function analyzeInventoryLevels(args: any) {
    const { product_id, warehouse_location = 'Main Warehouse' } = args;

    console.log(`📦 Analyzing inventory for: ${product_id} at ${warehouse_location}`);

    // Mock inventory data - in production would query D1 database
    const mockInventory = {
        current_stock: Math.floor(Math.random() * 1000) + 50,
        reorder_point: Math.floor(Math.random() * 100) + 20,
        last_restocked: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        warehouse_location: warehouse_location,
        product_id: product_id,
        status: 'Active'
    };

    const stockStatus = mockInventory.current_stock <= mockInventory.reorder_point ? 'Low Stock - Reorder Required' : 'Adequate Stock';
    const daysUntilReorder = Math.max(0, Math.floor((mockInventory.current_stock - mockInventory.reorder_point) / (Math.random() * 10 + 5)));

    return {
        product_id: product_id,
        warehouse_location: warehouse_location,
        current_stock: mockInventory.current_stock,
        reorder_point: mockInventory.reorder_point,
        stock_status: stockStatus,
        days_until_reorder: daysUntilReorder,
        last_restocked: mockInventory.last_restocked,
        recommended_action: stockStatus.includes('Low') ? 'Immediate reorder recommended' : 'Monitor stock levels',
        inventory_health: mockInventory.current_stock > mockInventory.reorder_point * 2 ? 'Excellent' : 'Needs Attention',
        data_source: 'D1 Database Query'
    };
}

// Execute tool calls
async function executeToolCalls(toolCalls: any[], solanaKit?: SolanaAgentKit | null) {
    const results: Record<string, any> = {};

    for (const call of toolCalls) {
        try {
            switch (call.name) {
                case 'calculate_property_value':
                    results[call.name] = calculatePropertyValue(call.args);
                    break;

                case 'search_market_trends':
                    results[call.name] = await searchMarketTrends(call.args);
                    break;

                case 'calculate_roi':
                    results[call.name] = calculateROI(call.args);
                    break;

                case 'fetch_competitor_pricing':
                    results[call.name] = await fetchCompetitorPricing(call.args);
                    break;

                case 'analyze_inventory_levels':
                    results[call.name] = await analyzeInventoryLevels(call.args);
                    break;

                case 'optimize_pricing':
                    results[call.name] = optimizePricing(call.args);
                    break;

                case 'web_search':
                    results[call.name] = await performWebSearch(call.args);
                    break;

                case 'calculator':
                    results[call.name] = performCalculation(call.args);
                    break;

                case 'save_report':
                    results[call.name] = saveReport(call.args);
                    break;

                case 'deploy_token':
                    results[call.name] = await deployToken(call.args, solanaKit);
                    break;

                case 'trade_token':
                    results[call.name] = await tradeToken(call.args, solanaKit);
                    break;

                case 'get_balance':
                    results[call.name] = await getBalance(call.args, solanaKit);
                    break;

                case 'hijri_calendar':
                    results[call.name] = await executeHijriCalendar(call.args);
                    break;

                case 'quran_search':
                    results[call.name] = await executeQuranSearch(call.args);
                    break;

                default:
                    results[call.name] = `Tool ${call.name} not implemented yet`;
            }
        } catch (error) {
            console.error(`❌ Tool ${call.name} Error:`, error);
            results[call.name] = `Error executing ${call.name}: ${error}`;
        }
    }

    return results;
}

// Tool Implementations
function calculatePropertyValue(args: any) {
    const { location, size, property_type, bedrooms, amenities } = args;
    const locationKey = (location as string).toLowerCase().replace(' ', '_') as keyof typeof MOCK_DATA.riyadhPropertyPrices;
    const basePrice = MOCK_DATA.riyadhPropertyPrices[locationKey] || 4000;
    const value = basePrice * size;

    return {
        estimated_value: value,
        price_per_sqm: basePrice,
        confidence: '85%',
        market_comparison: 'This property is priced ' + (value > basePrice * size * 1.1 ? 'above' : 'at') + ' market average',
        factors: {
            location_multiplier: basePrice / 4000,
            size_impact: size > 200 ? '+15%' : 'baseline',
            amenities_bonus: amenities ? '+5%' : '0%'
        }
    };
}

async function searchMarketTrends(args: any) {
    const { area, time_range } = args;
    const trendKey = `${area.toLowerCase()}_${time_range}`;
    const trend = MOCK_DATA.marketTrends[trendKey as keyof typeof MOCK_DATA.marketTrends] || '+5.0%';

    return {
        area: area,
        time_period: time_range,
        trend_percentage: trend,
        analysis: `Real estate in ${area} has shown ${trend} growth over the past ${time_range}`,
        recommendation: trend.startsWith('+') ? 'Good time to sell' : 'Wait for market improvement',
        data_points: generateMockTrendData(trend)
    };
}

function calculateROI(args: any) {
    const { purchase_price, monthly_rent, expenses } = args;
    const annualRent = monthly_rent * 12;
    const annualExpenses = expenses * 12;
    const netAnnualIncome = annualRent - annualExpenses;
    const roi = (netAnnualIncome / purchase_price) * 100;

    return {
        roi_percentage: roi.toFixed(2),
        annual_yield: ((annualRent / purchase_price) * 100).toFixed(2),
        monthly_cash_flow: (monthly_rent - expenses).toFixed(2),
        break_even_point: purchase_price / (monthly_rent - expenses),
        analysis: roi > 8 ? 'Excellent investment' : roi > 5 ? 'Good investment' : 'Consider market conditions'
    };
}


function optimizePricing(args: any) {
    const { cost_price, market_position, target_margin } = args;
    const targetPrice = cost_price * (1 + target_margin / 100);

    return {
        current_cost: cost_price,
        recommended_price: targetPrice.toFixed(2),
        target_margin: target_margin + '%',
        market_strategy: market_position === 'leader' ? 'Maintain premium positioning' : 'Competitive pricing',
        expected_volume: 'Projected 15-25% increase in sales'
    };
}

async function performWebSearch(args: any) {
    const { query, num_results = 5 } = args;

    // Mock web search results
    return {
        query: query,
        results: Array.from({ length: num_results }, (_, i) => ({
            title: `Search result ${i + 1} for "${query}"`,
            url: `https://example.com/result${i + 1}`,
            snippet: `This is a mock search result for "${query}". In production, this would be actual web content.`,
            relevance: Math.random() > 0.5 ? 'High' : 'Medium'
        })),
        total_results: num_results,
        search_time: '0.3 seconds'
    };
}

function performCalculation(args: any) {
    const { expression, variables } = args;

    try {
        // Simple math evaluation (in production, use a proper math library)
        const result = eval(`let ${JSON.stringify(variables).replace(/[{}]/g, '')}; ${expression}`);

        return {
            expression: expression,
            variables: variables,
            result: result,
            explanation: `Calculated ${expression} = ${result}`
        };
    } catch (error) {
        return {
            expression: expression,
            error: `Invalid expression: ${error}`,
            result: null
        };
    }
}

function saveReport(args: any) {
    const { report_title, report_data, category } = args;

    // In production, save to database
    console.log(`💾 Saving report: ${report_title}`, report_data);

    return {
        report_id: `report_${Date.now()}`,
        title: report_title,
        category: category,
        saved_at: new Date().toISOString(),
        status: 'Saved successfully'
    };
}

function generateMockTrendData(trend: string) {
    const trendValue = parseFloat(trend.replace('%', ''));
    const baseValue = 100;
    const points = [];

    for (let i = 0; i < 12; i++) {
        const variation = (Math.random() - 0.5) * 10;
        points.push(baseValue + (trendValue * i / 12) + variation);
    }

    return points;
}

// Solana Agent Kit Tool Implementations
async function deployToken(args: any, solanaKit?: SolanaAgentKit | null) {
    if (!solanaKit) {
        return {
            error: 'Solana Agent Kit not initialized',
            message: 'Please check environment configuration'
        };
    }

    try {
        const { token_name, token_symbol, decimals = 9, initial_supply = 1000000 } = args;

        console.log(`🚀 Deploying token: ${token_name} (${token_symbol})`);

        // Use Solana Agent Kit to deploy token
        // Note: Using mock implementation for now - will be replaced with actual ADK calls
        const tokenMint = `mock_token_${Date.now()}`;

        return {
            success: true,
            token_name: token_name,
            token_symbol: token_symbol,
            mint_address: tokenMint.toString(),
            decimals: decimals,
            initial_supply: initial_supply,
            explorer_url: `https://explorer.solana.com/address/${tokenMint.toString()}`,
            message: `✅ Successfully deployed ${token_name} (${token_symbol}) token!`
        };
    } catch (error) {
        console.error('❌ Deploy token error:', error);
        return {
            error: 'Failed to deploy token',
            details: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

async function tradeToken(args: any, solanaKit?: SolanaAgentKit | null) {
    if (!solanaKit) {
        return {
            error: 'Solana Agent Kit not initialized',
            message: 'Please check environment configuration'
        };
    }

    try {
        const { input_token, output_token, input_amount, slippage = 3 } = args;

        console.log(`💱 Trading ${input_amount} ${input_token} for ${output_token}`);

        // Use Solana Agent Kit to trade tokens
        // Note: Using mock implementation for now - will be replaced with actual ADK calls
        const mockOutputAmount = input_amount * 0.95; // Mock 5% slippage
        const mockSignature = `mock_tx_${Date.now()}`;

        return {
            success: true,
            input_token: input_token,
            output_token: output_token,
            input_amount: input_amount,
            output_amount: mockOutputAmount,
            transaction_id: mockSignature,
            slippage: slippage,
            explorer_url: `https://explorer.solana.com/tx/${mockSignature}`,
            message: `✅ Successfully swapped ${input_amount} ${input_token} for ${mockOutputAmount} ${output_token}!`
        };
    } catch (error) {
        console.error('❌ Trade token error:', error);
        return {
            error: 'Failed to trade tokens',
            details: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

async function getBalance(args: any, solanaKit?: SolanaAgentKit | null) {
    if (!solanaKit) {
        return {
            error: 'Solana Agent Kit not initialized',
            message: 'Please check environment configuration'
        };
    }

    try {
        const { token_mint } = args;

        console.log(`💰 Checking balance for token: ${token_mint || 'SOL'}`);

        // Use Solana Agent Kit to get balance
        // Note: Using mock implementation for now - will be replaced with actual ADK calls
        const mockBalance = token_mint ? Math.random() * 1000 : 2.5; // Mock SOL balance

        return {
            success: true,
            token_mint: token_mint || 'SOL',
            balance: mockBalance,
            decimals: 9,
            formatted_balance: mockBalance.toFixed(9),
            address: '5xqZTQLZhxFZFPhYDK6Lo1zHEij3uwQkMhAKGLQtrwYg', // From our generated wallet
            message: `💰 Current balance: ${mockBalance.toFixed(9)} ${token_mint || 'SOL'}`
        };
    } catch (error) {
        console.error('❌ Get balance error:', error);
    }
}

// Helper functions for new tools
async function executeHijriCalendar(args: any) {
    try {
        const response = await fetch('http://localhost:3000/api/agents/tools/hijri_calendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(args)
        });
        return await response.json();
    } catch (error) {
        return { error: 'Failed to execute Hijri Calendar tool' };
    }
}

async function executeQuranSearch(args: any) {
    try {
        const response = await fetch('http://localhost:3000/api/agents/tools/quran_search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(args)
        });
        return await response.json();
    } catch (error) {
        return { error: 'Failed to execute Quran Search tool' };
    }
}