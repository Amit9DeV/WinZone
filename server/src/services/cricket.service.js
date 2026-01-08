const axios = require('axios');

class CricketService {
    constructor() {
        this.apiKey = process.env.CRICKET_DATA_API_KEY;
        this.baseUrl = 'https://api.cricapi.com/v1';
        this.cache = {
            matches: [],
            lastUpdated: 0
        };
    }

    /**
     * Fetch current live matches
     * Returns a list of active matches with scores
     */
    async getCurrentMatches() {
        // Simple caching to avoid rate limits (10s cache)
        const now = Date.now();
        if (now - this.cache.lastUpdated < 10000 && this.cache.matches.length > 0) {
            return this.cache.matches;
        }

        try {
            if (!this.apiKey) {
                console.warn('⚠️ CRICKET_DATA_API_KEY is missing. Using mock data.');
                return this.getMockData();
            }

            console.log('📡 Fetching live cricket data...');
            const response = await axios.get(`${this.baseUrl}/currentMatches?apikey=${this.apiKey}&offset=0`);

            if (response.data.status !== "success") {
                throw new Error(response.data.reason || 'API Error');
            }

            // Filter for ongoing matches only
            const matches = response.data.data.filter(m => m.matchEnded === false);

            this.cache.matches = matches;
            this.cache.lastUpdated = now;

            return matches;
        } catch (error) {
            console.error('❌ Cricket API Error:', error.message);
            return this.getMockData(); // Fallback to mock on error
        }
    }

    /**
     * Provide mock data for testing or fallback
     */
    getMockData() {
        return [
            {
                id: 'mock-1',
                name: 'CSK vs MI',
                matchType: 't20',
                venue: 'Wankhede Stadium, Mumbai',
                status: 'Live',
                matchEnded: false,
                score: [
                    { r: 145, w: 3, o: 15.2, inning: 'CSK' }
                ],
                teamInfo: [
                    { name: 'Chennai Super Kings', shortname: 'CSK', img: 'https://g.cricapi.com/iapi/63-63307e53-997c-471c-99b7-b0b3065a3962_240x240.png' },
                    { name: 'Mumbai Indians', shortname: 'MI', img: 'https://g.cricapi.com/iapi/55-55555555-5555-5555-5555-555555555555_240x240.png' }
                ]
            }
        ];
    }
}

module.exports = new CricketService();
