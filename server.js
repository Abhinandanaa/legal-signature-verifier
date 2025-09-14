const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Load legal cases data
let legalCasesData;
try {
    const dataPath = path.join(__dirname, 'data', 'legal-cases.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    legalCasesData = JSON.parse(rawData);
    console.log('✅ Legal cases data loaded successfully');
    console.log(`📊 Loaded ${legalCasesData.cases.length} cases and ${legalCasesData.advocates.length} advocates`);
} catch (error) {
    console.error('❌ Error loading legal cases data:', error);
    process.exit(1);
}

/**
 * Keyword matching algorithm
 * Matches user query against case keywords and problem statements
 * Returns cases ranked by relevance score
 */
function findMatchingCases(query) {
    if (!query || typeof query !== 'string') {
        return [];
    }

    const searchTerms = query.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .split(/\s+/)
        .filter(term => term.length > 2); // Filter out short words

    if (searchTerms.length === 0) {
        return [];
    }

    const casesWithScores = legalCasesData.cases.map(legalCase => {
        let score = 0;
        
        // Check keywords (higher weight)
        legalCase.keywords.forEach(keyword => {
            searchTerms.forEach(term => {
                if (keyword.toLowerCase().includes(term) || term.includes(keyword.toLowerCase())) {
                    score += 10; // High score for keyword matches
                }
            });
        });

        // Check problem statement (medium weight)
        const problemStatement = legalCase.problem_statement.toLowerCase();
        searchTerms.forEach(term => {
            if (problemStatement.includes(term)) {
                score += 5; // Medium score for problem statement matches
            }
        });

        // Check law explanation (lower weight)
        const lawExplanation = legalCase.simulated_law.explanation.toLowerCase();
        searchTerms.forEach(term => {
            if (lawExplanation.includes(term)) {
                score += 2; // Lower score for law explanation matches
            }
        });

        return {
            ...legalCase,
            relevanceScore: score
        };
    });

    // Filter cases with score > 0 and sort by relevance
    return casesWithScores
        .filter(caseItem => caseItem.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5); // Return top 5 matches
}

/**
 * Get advocate information by ID
 */
function getAdvocateById(advocateId) {
    return legalCasesData.advocates.find(advocate => advocate.id === advocateId);
}

// API Routes

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Legal-Ease AI Backend is running',
        timestamp: new Date().toISOString(),
        casesLoaded: legalCasesData.cases.length,
        advocatesLoaded: legalCasesData.advocates.length
    });
});

/**
 * POST /api/search
 * Search for legal cases based on user query
 */
app.post('/api/search', (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({
                error: 'Query parameter is required',
                message: 'Please provide a search query'
            });
        }

        console.log(`🔍 Search query received: "${query}"`);
        
        const matchingCases = findMatchingCases(query);
        
        // Enhance results with advocate information
        const enhancedResults = matchingCases.map(legalCase => {
            const advocate = getAdvocateById(legalCase.advocate_id);
            return {
                ...legalCase,
                advocate: advocate
            };
        });

        console.log(`📊 Found ${enhancedResults.length} matching cases`);

        res.json({
            query: query,
            results: enhancedResults,
            totalMatches: enhancedResults.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error in search endpoint:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while processing your search'
        });
    }
});

/**
 * GET /api/cases
 * Get all legal cases (for development/testing)
 */
app.get('/api/cases', (req, res) => {
    try {
        res.json({
            cases: legalCasesData.cases,
            total: legalCasesData.cases.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error in cases endpoint:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while fetching cases'
        });
    }
});

/**
 * GET /api/cases/:id
 * Get specific legal case by ID
 */
app.get('/api/cases/:id', (req, res) => {
    try {
        const caseId = parseInt(req.params.id);
        const legalCase = legalCasesData.cases.find(c => c.id === caseId);
        
        if (!legalCase) {
            return res.status(404).json({
                error: 'Case not found',
                message: `No case found with ID ${caseId}`
            });
        }

        const advocate = getAdvocateById(legalCase.advocate_id);
        
        res.json({
            case: {
                ...legalCase,
                advocate: advocate
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error in case detail endpoint:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while fetching case details'
        });
    }
});

/**
 * GET /api/advocates
 * Get all advocates
 */
app.get('/api/advocates', (req, res) => {
    try {
        res.json({
            advocates: legalCasesData.advocates,
            total: legalCasesData.advocates.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error in advocates endpoint:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while fetching advocates'
        });
    }
});

/**
 * GET /api/advocates/:id
 * Get specific advocate by ID
 */
app.get('/api/advocates/:id', (req, res) => {
    try {
        const advocateId = req.params.id;
        const advocate = getAdvocateById(advocateId);
        
        if (!advocate) {
            return res.status(404).json({
                error: 'Advocate not found',
                message: `No advocate found with ID ${advocateId}`
            });
        }

        // Find cases handled by this advocate
        const advocateCases = legalCasesData.cases.filter(c => c.advocate_id === advocateId);
        
        res.json({
            advocate: {
                ...advocate,
                casesHandled: advocateCases.length,
                recentCases: advocateCases.slice(0, 3) // Show 3 recent cases
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error in advocate detail endpoint:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while fetching advocate details'
        });
    }
});

/**
 * GET /api/suggestions
 * Get search suggestions based on available keywords
 */
app.get('/api/suggestions', (req, res) => {
    try {
        // Extract all unique keywords from cases
        const allKeywords = new Set();
        legalCasesData.cases.forEach(legalCase => {
            legalCase.keywords.forEach(keyword => {
                allKeywords.add(keyword);
            });
        });

        const suggestions = Array.from(allKeywords).sort();
        
        res.json({
            suggestions: suggestions,
            total: suggestions.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error in suggestions endpoint:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while fetching suggestions'
        });
    }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'API endpoint not found',
        message: `The endpoint ${req.originalUrl} does not exist`
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Legal-Ease AI Backend Server Started');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌐 API available at http://localhost:${PORT}/api`);
    console.log('📋 Available endpoints:');
    console.log('   GET  /api/health - Health check');
    console.log('   POST /api/search - Search legal cases');
    console.log('   GET  /api/cases - Get all cases');
    console.log('   GET  /api/cases/:id - Get specific case');
    console.log('   GET  /api/advocates - Get all advocates');
    console.log('   GET  /api/advocates/:id - Get specific advocate');
    console.log('   GET  /api/suggestions - Get search suggestions');
    console.log('');
    console.log('⚠️  DISCLAIMER: This is a simulated educational tool.');
    console.log('   All legal content is fictional and for demonstration only.');
});

module.exports = app;