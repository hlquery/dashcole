#!/usr/bin/env node

/**
 * Search Index Generator
 * Creates a searchable JSON index of all content for the search functionality
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SearchIndexGenerator {
  constructor() {
    this.index = {
      pages: [],
      components: [],
      docs: [],
      api: [],
      lastUpdated: new Date().toISOString()
    };
    this.baseDir = path.join(__dirname, '..');
  }

  /**
   * Extract text content from Vue files
   */
  extractVueContent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract template content
      const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/);
      const templateContent = templateMatch ? templateMatch[1] : '';
      
      // Extract script content (comments and strings)
      const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
      const scriptContent = scriptMatch ? scriptMatch[1] : '';
      
      // Extract style content (comments)
      const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/);
      const styleContent = styleMatch ? styleMatch[1] : '';
      
      // Clean HTML tags and extract text
      const cleanTemplate = templateContent
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Extract comments and strings from script
      const scriptText = scriptContent
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/\/\/.*$/gm, ' ')
        .replace(/['"`]([^'"`]*?)['"`]/g, ' $1 ')
        .replace(/\s+/g, ' ')
        .trim();
      
      return {
        template: cleanTemplate,
        script: scriptText,
        style: styleContent,
        fullContent: content
      };
    } catch (error) {
      console.warn(`Error reading ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Extract content from markdown files
   */
  extractMarkdownContent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const { data: frontmatter, content: markdownContent } = matter(content);
      
      // Clean markdown syntax
      const cleanContent = markdownContent
        .replace(/#{1,6}\s+/g, '') // Remove headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/`(.*?)`/g, '$1') // Remove code
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
        .replace(/<[^>]*>/g, ' ') // Remove HTML
        .replace(/\s+/g, ' ')
        .trim();
      
      return {
        frontmatter,
        content: cleanContent,
        fullContent: markdownContent
      };
    } catch (error) {
      console.warn(`Error reading ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Generate searchable text from content
   */
  generateSearchableText(content, type) {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !this.isStopWord(word));
    
    return [...new Set(words)]; // Remove duplicates
  }

  /**
   * Check if word is a stop word
   */
  isStopWord(word) {
    const stopWords = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
      'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
      'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
      'must', 'can', 'shall', 'a', 'an', 'some', 'any', 'all', 'both', 'each',
      'every', 'few', 'many', 'much', 'several', 'such', 'no', 'not', 'only',
      'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now', 'here',
      'there', 'when', 'where', 'why', 'how', 'what', 'which', 'who', 'whom'
    ];
    return stopWords.includes(word);
  }

  /**
   * Process Vue files
   */
  processVueFiles() {
    const vueFiles = this.findFiles('**/*.vue');
    
    vueFiles.forEach(filePath => {
      const relativePath = path.relative(this.baseDir, filePath);
      const content = this.extractVueContent(filePath);
      
      if (!content) return;
      
      const fileName = path.basename(filePath, '.vue');
      const category = this.getCategoryFromPath(relativePath);
      
      const searchableText = [
        ...this.generateSearchableText(content.template, 'template'),
        ...this.generateSearchableText(content.script, 'script'),
        fileName.toLowerCase()
      ].join(' ');
      
      const item = {
        id: `vue-${fileName}`,
        title: this.generateTitle(fileName, content.template),
        type: 'vue',
        category,
        path: relativePath,
        fileName,
        content: content.template.substring(0, 200) + '...',
        searchableText,
        lastModified: fs.statSync(filePath).mtime.toISOString()
      };
      
      this.index[category].push(item);
    });
  }

  /**
   * Process markdown files
   */
  processMarkdownFiles() {
    const mdFiles = this.findFiles('**/*.md');
    
    mdFiles.forEach(filePath => {
      const relativePath = path.relative(this.baseDir, filePath);
      const content = this.extractMarkdownContent(filePath);
      
      if (!content) return;
      
      const fileName = path.basename(filePath, '.md');
      const category = this.getCategoryFromPath(relativePath);
      
      const searchableText = [
        ...this.generateSearchableText(content.content, 'markdown'),
        fileName.toLowerCase()
      ].join(' ');
      
      const item = {
        id: `md-${fileName}`,
        title: content.frontmatter?.title || this.generateTitle(fileName, content.content),
        type: 'markdown',
        category,
        path: relativePath,
        fileName,
        content: content.content.substring(0, 200) + '...',
        searchableText,
        lastModified: fs.statSync(filePath).mtime.toISOString()
      };
      
      this.index[category].push(item);
    });
  }

  /**
   * Process API documentation
   */
  processApiFiles() {
    const apiFiles = this.findFiles('api/**/*.js');
    
    apiFiles.forEach(filePath => {
      const relativePath = path.relative(this.baseDir, filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const fileName = path.basename(filePath, '.js');
      const category = 'api';
      
      // Extract function names and comments
      const functionMatches = content.match(/function\s+(\w+)|const\s+(\w+)\s*=|async\s+(\w+)/g) || [];
      const commentMatches = content.match(/\/\*\*[\s\S]*?\*\//g) || [];
      
      const searchableText = [
        ...functionMatches.map(match => match.replace(/[^\w]/g, ' ').trim()),
        ...commentMatches.map(comment => comment.replace(/\/\*|\*\/|\*/g, '').trim()),
        fileName.toLowerCase()
      ].join(' ');
      
      const item = {
        id: `api-${fileName}`,
        title: this.generateTitle(fileName, content),
        type: 'api',
        category,
        path: relativePath,
        fileName,
        content: content.substring(0, 200) + '...',
        searchableText,
        lastModified: fs.statSync(filePath).mtime.toISOString()
      };
      
      this.index.api.push(item);
    });
  }

  /**
   * Find files matching pattern
   */
  findFiles(pattern) {
    const files = [];
    const searchDir = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        // Skip editor temporary files (Emacs, Vim, etc.)
        if (item.startsWith('.#') || item.startsWith('~')) {
          return;
        }
        
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          searchDir(fullPath);
        } else if (stat.isFile()) {
          if (pattern.includes('**/*.vue') && item.endsWith('.vue')) {
            files.push(fullPath);
          } else if (pattern.includes('**/*.md') && item.endsWith('.md')) {
            files.push(fullPath);
          } else if (pattern.includes('api/**/*.js') && fullPath.includes('api/') && item.endsWith('.js')) {
            files.push(fullPath);
          }
        }
      });
    };
    
    searchDir(this.baseDir);
    return files;
  }

  /**
   * Get category from file path
   */
  getCategoryFromPath(filePath) {
    if (filePath.includes('views/')) return 'pages';
    if (filePath.includes('components/')) return 'components';
    if (filePath.includes('docs/') || filePath.includes('README')) return 'docs';
    if (filePath.includes('api/')) return 'api';
    return 'pages';
  }

  /**
   * Generate title from filename and content
   */
  generateTitle(fileName, content) {
    // Try to extract title from content first
    const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>|<h1[^>]*>(.*?)<\/h1>|#\s+(.*)/);
    if (titleMatch) {
      return titleMatch[1] || titleMatch[2] || titleMatch[3];
    }
    
    // Fallback to formatted filename
    return fileName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Generate the search index
   */
  async generate() {
    console.log('🔍 Generating search index...');
    
    try {
      this.processVueFiles();
      this.processMarkdownFiles();
      this.processApiFiles();

      const generatedAt = new Date().toISOString();
      
      // Add some static content
      this.index.docs.push({
        id: 'static-getting-started',
        title: 'Getting Started',
        type: 'static',
        category: 'docs',
        path: '/docs#getting-started',
        content: 'Learn how to get started with dashcole open source search engine',
        searchableText: 'getting started tutorial setup installation',
        lastModified: generatedAt
      });
      
      this.index.docs.push({
        id: 'static-api-reference',
        title: 'API Reference',
        type: 'static',
        category: 'docs',
        path: '/docs#api-reference',
        content: 'Complete API reference for dashcole platform',
        searchableText: 'api reference endpoints authentication',
        lastModified: generatedAt
      });
      
      // Write index to file
      const outputPath = path.join(this.baseDir, 'public/search-index.json');
      const comparableIndex = (index) => {
        const comparable = structuredClone(index);
        delete comparable.lastUpdated;
        comparable.docs?.forEach((item) => {
          if (item.type === 'static') delete item.lastModified;
        });
        return JSON.stringify(comparable);
      };
      let existingIndex = null;
      try { existingIndex = JSON.parse(fs.readFileSync(outputPath, 'utf8')); } catch { /* generate a new index */ }
      if (existingIndex && comparableIndex(existingIndex) === comparableIndex(this.index)) {
        console.log('✅ Search index is already up to date.');
        return;
      }
      this.index.lastUpdated = generatedAt;
      fs.writeFileSync(outputPath, JSON.stringify(this.index, null, 2));
      
      console.log('✅ Search index generated successfully!');
      console.log(`📊 Indexed ${this.index.pages.length} pages, ${this.index.components.length} components, ${this.index.docs.length} docs, ${this.index.api.length} API files`);
      console.log(`📁 Output: ${outputPath}`);
      
    } catch (error) {
      console.error('❌ Error generating search index:', error);
      process.exit(1);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new SearchIndexGenerator();
  generator.generate();
}

export default SearchIndexGenerator;
