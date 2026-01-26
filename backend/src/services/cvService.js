/**
 * CVService - Extracts and parses content from CV/Resume files
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CVService {
    /**
     * Extract text content from PDF file
     */
    async extractFromPDF(filePath) {
        try {
            // For PDF parsing, we'll use a simple approach
            const pdfParseModule = await import('pdf-parse').catch(() => null);
            const pdfParse = pdfParseModule?.default || pdfParseModule;

            if (pdfParse && typeof pdfParse === 'function') {
                const dataBuffer = await fs.readFile(filePath);
                const data = await pdfParse(dataBuffer);
                return this.parseCVContent(data.text);
            } else {
                // Fallback: return basic structure
                const content = await fs.readFile(filePath, 'utf-8').catch(() => '');
                return this.parseCVContent(content || 'PDF content extraction requires pdf-parse package');
            }
        } catch (error) {
            console.error('PDF extraction error:', error);
            throw new Error(`Failed to extract PDF content: ${error.message}`);
        }
    }

    /**
     * Extract text content from DOCX file
     */
    async extractFromDOCX(filePath) {
        try {
            // For DOCX parsing, use mammoth
            const mammothModule = await import('mammoth').catch(() => null);
            const mammoth = mammothModule?.default || mammothModule;

            if (mammoth && typeof mammoth.extractRawText === 'function') {
                const result = await mammoth.extractRawText({ path: filePath });
                return this.parseCVContent(result.value);
            } else {
                return this.parseCVContent('DOCX content extraction requires mammoth package');
            }
        } catch (error) {
            console.error('DOCX extraction error:', error);
            throw new Error('Failed to extract DOCX content');
        }
    }

    /**
     * Parse extracted text into structured CV data
     */
    parseCVContent(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        const skills = this.extractSkills(text);
        const experience = this.extractExperience(text);
        const education = this.extractEducation(text);
        const summary = this.extractSummary(text);

        return {
            rawText: text,
            skills,
            experience,
            education,
            summary,
            technologies: this.extractTechnologies(text),
            projects: this.extractProjects(text)
        };
    }

    /**
     * Extract skills from CV text
     */
    extractSkills(text) {
        const skillKeywords = [
            'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'C#',
            'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Azure', 'Docker', 'Kubernetes',
            'Git', 'CI/CD', 'REST API', 'GraphQL', 'Microservices', 'Machine Learning', 'AI',
            'Angular', 'Vue', 'Express', 'Django', 'Flask', 'Spring', 'Go', 'Rust', 'PHP'
        ];

        const foundSkills = [];
        const lowerText = text.toLowerCase();

        skillKeywords.forEach(skill => {
            if (lowerText.includes(skill.toLowerCase())) {
                foundSkills.push(skill);
            }
        });

        return foundSkills;
    }

    /**
     * Extract work experience
     */
    extractExperience(text) {
        const experiencePatterns = [
            /(\d+)\+?\s*(years?|yrs?)\s*(of\s*)?(experience|exp)/gi,
            /(senior|junior|mid-level|lead|principal)\s+(developer|engineer|architect)/gi,
            /(worked|experience)\s+(at|with|in)\s+([A-Z][a-zA-Z\s]+)/gi
        ];

        const experiences = [];
        experiencePatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                experiences.push(...matches);
            }
        });

        return experiences.slice(0, 5); // Limit to 5
    }

    /**
     * Extract education information
     */
    extractEducation(text) {
        const educationPatterns = [
            /(bachelor|master|phd|degree|diploma|certification)\s+(in|of)\s+([A-Z][a-zA-Z\s]+)/gi,
            /(university|college|institute)\s+([A-Z][a-zA-Z\s]+)/gi
        ];

        const education = [];
        educationPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                education.push(...matches);
            }
        });

        return education.slice(0, 3); // Limit to 3
    }

    /**
     * Extract summary/objective
     */
    extractSummary(text) {
        const summaryKeywords = ['summary', 'objective', 'about', 'profile'];
        const lines = text.split('\n');

        for (let i = 0; i < Math.min(10, lines.length); i++) {
            const line = lines[i].toLowerCase();
            if (summaryKeywords.some(keyword => line.includes(keyword))) {
                return lines.slice(i, i + 3).join(' ').substring(0, 500);
            }
        }

        // Return first few lines as summary
        return lines.slice(0, 3).join(' ').substring(0, 500);
    }

    /**
     * Extract technologies mentioned
     */
    extractTechnologies(text) {
        const techKeywords = [
            'React', 'Angular', 'Vue', 'JavaScript', 'TypeScript', 'Node.js', 'Express',
            'Python', 'Django', 'Flask', 'Java', 'Spring', 'C#', '.NET', 'Go', 'Rust',
            'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
            'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI',
            'GraphQL', 'REST', 'gRPC', 'Microservices', 'Serverless'
        ];

        const foundTechs = [];
        const lowerText = text.toLowerCase();

        techKeywords.forEach(tech => {
            if (lowerText.includes(tech.toLowerCase())) {
                foundTechs.push(tech);
            }
        });

        return [...new Set(foundTechs)]; // Remove duplicates
    }

    /**
     * Extract project information
     */
    extractProjects(text) {
        const projectPatterns = [
            /(project|built|developed|created)\s+([A-Z][a-zA-Z\s]+)/gi,
            /(github|gitlab|portfolio|repository)/gi
        ];

        const projects = [];
        projectPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                projects.push(...matches);
            }
        });

        return projects.slice(0, 5);
    }

    /**
     * Process uploaded CV file
     */
    async processCV(filePath, fileName) {
        const ext = path.extname(fileName).toLowerCase();

        let extractedData;
        if (ext === '.pdf') {
            extractedData = await this.extractFromPDF(filePath);
        } else if (ext === '.docx') {
            extractedData = await this.extractFromDOCX(filePath);
        } else {
            throw new Error('Unsupported file format. Please upload PDF or DOCX.');
        }

        return extractedData;
    }
}
