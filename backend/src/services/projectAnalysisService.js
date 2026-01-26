/**
 * ProjectAnalysisService - Analyzes GitHub repositories and deployed projects
 */
import https from 'https';
import { URL } from 'url';

export class ProjectAnalysisService {
    /**
     * Analyze GitHub repository
     */
    async analyzeGitHubRepo(repoUrl) {
        try {
            // Extract owner and repo from URL
            const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
            if (!match) {
                throw new Error('Invalid GitHub URL format');
            }

            const [, owner, repo] = match;
            
            // Fetch repository information from GitHub API
            const repoInfo = await this.fetchGitHubRepoInfo(owner, repo);
            const readme = await this.fetchGitHubReadme(owner, repo);
            const languages = await this.fetchGitHubLanguages(owner, repo);
            const commits = await this.fetchGitHubCommits(owner, repo);
            
            return {
                owner,
                repo,
                description: repoInfo.description || '',
                readme: readme || '',
                languages: languages || {},
                commitCount: commits?.length || 0,
                recentCommits: commits?.slice(0, 10) || [],
                stars: repoInfo.stargazers_count || 0,
                forks: repoInfo.forks_count || 0,
                createdAt: repoInfo.created_at || '',
                updatedAt: repoInfo.updated_at || '',
                topics: repoInfo.topics || [],
                technologies: this.extractTechnologies(readme, languages),
                architecture: this.analyzeArchitecture(readme),
                features: this.extractFeatures(readme)
            };
        } catch (error) {
            console.error('GitHub analysis error:', error);
            // Return basic structure if API fails
            return {
                repoUrl,
                error: error.message,
                technologies: [],
                architecture: '',
                features: []
            };
        }
    }

    /**
     * Fetch repository info from GitHub API
     */
    async fetchGitHubRepoInfo(owner, repo) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.github.com',
                path: `/repos/${owner}/${repo}`,
                method: 'GET',
                headers: {
                    'User-Agent': 'InterVueX',
                    'Accept': 'application/vnd.github.v3+json'
                }
            };

            https.get(options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(JSON.parse(data));
                    } else {
                        reject(new Error(`GitHub API error: ${res.statusCode}`));
                    }
                });
            }).on('error', reject);
        });
    }

    /**
     * Fetch README content
     */
    async fetchGitHubReadme(owner, repo) {
        try {
            return new Promise((resolve, reject) => {
                const options = {
                    hostname: 'api.github.com',
                    path: `/repos/${owner}/${repo}/readme`,
                    method: 'GET',
                    headers: {
                        'User-Agent': 'InterVueX',
                        'Accept': 'application/vnd.github.v3+json'
                    }
                };

                https.get(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => { data += chunk; });
                    res.on('end', () => {
                        if (res.statusCode === 200) {
                            const response = JSON.parse(data);
                            // Decode base64 content
                            const content = Buffer.from(response.content, 'base64').toString('utf-8');
                            resolve(content);
                        } else {
                            resolve(''); // README not found
                        }
                    });
                }).on('error', () => resolve(''));
            });
        } catch (error) {
            return '';
        }
    }

    /**
     * Fetch repository languages
     */
    async fetchGitHubLanguages(owner, repo) {
        try {
            return new Promise((resolve, reject) => {
                const options = {
                    hostname: 'api.github.com',
                    path: `/repos/${owner}/${repo}/languages`,
                    method: 'GET',
                    headers: {
                        'User-Agent': 'InterVueX',
                        'Accept': 'application/vnd.github.v3+json'
                    }
                };

                https.get(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => { data += chunk; });
                    res.on('end', () => {
                        if (res.statusCode === 200) {
                            resolve(JSON.parse(data));
                        } else {
                            resolve({});
                        }
                    });
                }).on('error', () => resolve({}));
            });
        } catch (error) {
            return {};
        }
    }

    /**
     * Fetch recent commits
     */
    async fetchGitHubCommits(owner, repo) {
        try {
            return new Promise((resolve, reject) => {
                const options = {
                    hostname: 'api.github.com',
                    path: `/repos/${owner}/${repo}/commits?per_page=10`,
                    method: 'GET',
                    headers: {
                        'User-Agent': 'InterVueX',
                        'Accept': 'application/vnd.github.v3+json'
                    }
                };

                https.get(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => { data += chunk; });
                    res.on('end', () => {
                        if (res.statusCode === 200) {
                            resolve(JSON.parse(data));
                        } else {
                            resolve([]);
                        }
                    });
                }).on('error', () => resolve([]));
            });
        } catch (error) {
            return [];
        }
    }

    /**
     * Extract technologies from README and languages
     */
    extractTechnologies(readme, languages) {
        const techKeywords = [
            'React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'Node.js', 'Express',
            'Python', 'Django', 'Flask', 'Java', 'Spring', 'C#', '.NET', 'Go', 'Rust',
            'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'AWS', 'Azure', 'Docker',
            'Kubernetes', 'GraphQL', 'REST', 'Microservices'
        ];

        const foundTechs = [];
        const lowerReadme = (readme || '').toLowerCase();
        const langKeys = Object.keys(languages || {});

        techKeywords.forEach(tech => {
            if (lowerReadme.includes(tech.toLowerCase()) || langKeys.includes(tech)) {
                foundTechs.push(tech);
            }
        });

        // Add languages from GitHub API
        langKeys.forEach(lang => {
            if (!foundTechs.includes(lang)) {
                foundTechs.push(lang);
            }
        });

        return [...new Set(foundTechs)];
    }

    /**
     * Analyze architecture from README
     */
    analyzeArchitecture(readme) {
        if (!readme) return '';

        const architecturePatterns = [
            /architecture/i,
            /system design/i,
            /tech stack/i,
            /technologies/i,
            /framework/i
        ];

        const lines = readme.split('\n');
        const relevantLines = [];

        lines.forEach((line, index) => {
            if (architecturePatterns.some(pattern => pattern.test(line))) {
                // Get context around the match
                const start = Math.max(0, index - 2);
                const end = Math.min(lines.length, index + 5);
                relevantLines.push(...lines.slice(start, end));
            }
        });

        return relevantLines.join('\n').substring(0, 1000);
    }

    /**
     * Extract features from README
     */
    extractFeatures(readme) {
        if (!readme) return [];

        const featurePatterns = [
            /## Features/i,
            /### Features/i,
            /Features:/i,
            /## What it does/i,
            /## Key Features/i
        ];

        const features = [];
        const lines = readme.split('\n');

        let inFeaturesSection = false;
        lines.forEach(line => {
            if (featurePatterns.some(pattern => pattern.test(line))) {
                inFeaturesSection = true;
                return;
            }

            if (inFeaturesSection) {
                if (line.trim().startsWith('##') || line.trim().startsWith('###')) {
                    inFeaturesSection = false;
                    return;
                }

                if (line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./)) {
                    features.push(line.trim().replace(/^[-*\d+\.]\s*/, ''));
                }
            }
        });

        return features.slice(0, 10); // Limit to 10 features
    }

    /**
     * Analyze deployed project
     */
    async analyzeDeployedProject(liveLink) {
        try {
            // In production, you might want to fetch the page and analyze it
            // For now, return basic structure
            return {
                url: liveLink,
                accessible: true,
                technologies: [],
                notes: 'Deployed project analysis would be performed here'
            };
        } catch (error) {
            return {
                url: liveLink,
                accessible: false,
                error: error.message
            };
        }
    }
}
