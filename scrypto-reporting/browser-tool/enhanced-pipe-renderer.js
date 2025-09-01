/**
 * Enhanced Pipe Table Renderer with 3-Section Support
 * Handles: Header + Stats + Summary + Data sections
 */

class EnhancedPipeRenderer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            theme: options.theme || 'light',
            className: options.className || 'enhanced-pipe-table',
            ...options
        };
        this.sections = {
            header: '',
            statDefs: [],
            summary: '',
            headers: [],
            rows: []
        };
    }

    /**
     * Parse 3-section report format
     * @param {string} content - Content with ## STATS, ## SUMMARY, ## DATA sections
     */
    parse3SectionFormat(content) {
        // Split into sections using ## headers
        const sections = content.split(/^## /m);
        
        sections.forEach(section => {
            const lines = section.trim().split('\n');
            const sectionType = lines[0].toLowerCase();
            
            if (sectionType.startsWith('stats')) {
                this.parseStatsSection(lines.slice(1).join('\n'));
            } else if (sectionType.startsWith('summary')) {
                this.sections.summary = lines.slice(1).join('\n').trim();
            } else if (sectionType.startsWith('data')) {
                this.parseDataSection(lines.slice(1).join('\n'));
            } else if (!sectionType.includes('stats') && !sectionType.includes('summary') && !sectionType.includes('data')) {
                // This is header content
                this.sections.header = section.trim();
            }
        });
        
        // Handle content before first ## (main header)
        const firstSectionIndex = content.indexOf('## ');
        if (firstSectionIndex > 0) {
            this.sections.header = content.substring(0, firstSectionIndex).trim();
        }
    }

    /**
     * Parse stats section
     * @param {string} content - Stats section content
     */
    parseStatsSection(content) {
        const lines = content.trim().split('\n');
        lines.forEach(line => {
            if (line.startsWith('|stat-name=')) {
                this.sections.statDefs.push(this.parseStatDefinition(line));
            }
        });
    }

    /**
     * Parse stat definition line
     * @param {string} line - Stat definition line
     * @returns {object} Parsed stat definition
     */
    parseStatDefinition(line) {
        const def = {};
        const content = line.slice(1, -1); // Remove | at start/end
        const parts = content.split(';');
        
        parts.forEach(part => {
            const [key, value] = part.split('=');
            if (key && value) {
                def[key] = value.replace(/"/g, '');
            }
        });
        
        return def;
    }

    /**
     * Parse data section into table
     * @param {string} content - Data section content
     */
    parseDataSection(content) {
        const lines = content.trim().split('\n').filter(line => line.trim() && !line.startsWith('|---'));
        
        if (lines.length === 0) return;
        
        // Parse headers from first row
        this.sections.headers = this.parsePipeLine(lines[0]);
        
        // Parse data rows
        this.sections.rows = lines.slice(1).map(line => this.parsePipeLine(line));
    }

    /**
     * Parse a single pipe-delimited line
     * @param {string} line - The line to parse
     * @returns {Array} Array of cell values
     */
    parsePipeLine(line) {
        return line.split('|')
            .map(cell => cell.trim())
            .filter((cell, index, array) => {
                return !(cell === '' && (index === 0 || index === array.length - 1));
            });
    }

    /**
     * Format cell content based on value and color rules
     * @param {string} value - The cell value
     * @returns {string} Formatted HTML
     */
    formatCell(value) {
        if (!value || value === '') return '';

        // Handle color specification: "text@color" or "text#hexcode"
        let text = value;
        let color = null;

        // Check for @color or #hexcode
        if (value.includes('@')) {
            const parts = value.split('@');
            text = parts[0];
            color = this.getColorCode(parts[1]);
        } else if (value.includes('#') && value.indexOf('#') > 0) {
            const parts = value.split('#');
            text = parts[0];
            color = '#' + parts[1];
        }

        // Apply styling based on text content
        const lowerText = text.toLowerCase();
        
        // Status icons and text
        if (lowerText === 'yes' || lowerText === 'complete' || lowerText === 'ticked' || lowerText === 'checked') {
            return `<span class="status-icon status-success" ${color ? `style="color: ${color};"` : ''}>✓</span>`;
        }
        
        if (lowerText === 'no' || lowerText === 'failed' || lowerText === 'x' || lowerText === 'err' || lowerText === 'wrong') {
            return `<span class="status-icon status-error" ${color ? `style="color: ${color};"` : ''}>✗</span>`;
        }
        
        if (lowerText === 'partial' || lowerText === 'ongoing' || lowerText === 'in progress') {
            return `<span class="status-text status-warning" ${color ? `style="color: ${color};"` : ''}>${text}</span>`;
        }

        if (lowerText === 'n/a' || lowerText === 'na') {
            return '<span class="status-icon status-na">-</span>';
        }

        // Regular text with optional color
        if (color) {
            return `<span style="color: ${color};">${text}</span>`;
        }

        return text;
    }

    /**
     * Convert color names to hex codes
     * @param {string} colorName - Color name
     * @returns {string} Hex color code
     */
    getColorCode(colorName) {
        const colorMap = {
            'red': '#ef4444',
            'green': '#22c55e', 
            'blue': '#3b82f6',
            'yellow': '#eab308',
            'orange': '#f97316',
            'purple': '#a855f7',
            'pink': '#ec4899',
            'gray': '#6b7280',
            'grey': '#6b7280'
        };
        
        return colorMap[colorName.toLowerCase()] || colorName;
    }

    /**
     * Generate stat blocks from definitions
     * @returns {string} HTML for stat blocks
     */
    generateStatBlocks() {
        if (!this.sections.statDefs || this.sections.statDefs.length === 0) return '';
        
        let html = '<div class="enhanced-stats-grid">';
        
        this.sections.statDefs.forEach(def => {
            const value = this.calculateStat(def);
            html += `
                <div class="enhanced-stat-block">
                    <div class="enhanced-stat-value">${value}</div>
                    <div class="enhanced-stat-label">${def['stat-name']}</div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Calculate statistic based on definition
     * @param {object} def - Stat definition
     * @returns {string} Calculated value
     */
    calculateStat(def) {
        const statType = def['stat-type'];
        const source = def['stat-source'];
        const condition = def['stat-condition'];
        
        if (statType === 'count') {
            return this.sections.rows.length.toString();
        }
        
        if (statType === 'percentage') {
            if (source === 'all') {
                // Calculate overall completion
                let total = 0;
                let completed = 0;
                
                this.sections.rows.forEach(row => {
                    row.forEach(cell => {
                        if (cell && cell !== 'N/A') {
                            total++;
                            if (condition.split(',').some(cond => 
                                cell.toLowerCase().includes(cond.toLowerCase()) || 
                                cell.includes('@green')
                            )) {
                                completed++;
                            }
                        }
                    });
                });
                
                return total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%';
            }
            
            // Calculate for specific columns
            const columns = source.split(',').map(col => parseInt(col.replace('col-', '')) - 1);
            let total = 0;
            let completed = 0;
            
            this.sections.rows.forEach(row => {
                columns.forEach(colIndex => {
                    if (row[colIndex] && row[colIndex] !== 'N/A') {
                        total++;
                        if (condition.split(',').some(cond => 
                            row[colIndex].toLowerCase().includes(cond.toLowerCase()) ||
                            row[colIndex].includes('@green')
                        )) {
                            completed++;
                        }
                    }
                });
            });
            
            return total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%';
        }
        
        return '📊';
    }

    /**
     * Render complete report
     */
    render() {
        if (!this.container) return;
        
        let html = '';
        
        // Render header if exists
        if (this.sections.header) {
            html += `<div class="enhanced-header">${this.sections.header.replace(/\n/g, '<br>')}</div>`;
        }
        
        // Render stat blocks
        if (this.sections.statDefs.length > 0) {
            html += this.generateStatBlocks();
        }
        
        // Render summary if exists
        if (this.sections.summary) {
            html += `<div class="enhanced-summary">${this.sections.summary.replace(/\n/g, '<br>')}</div>`;
        }
        
        // Render table
        const tableClass = this.options.theme === 'dark' ? 
            `${this.options.className} ${this.options.className}-dark` : 
            this.options.className;
            
        html += `
            <div class="enhanced-table-container">
                <table class="${tableClass}">
                    ${this.renderHeader()}
                    ${this.renderBody()}
                </table>
            </div>
        `;
        
        this.container.innerHTML = html;
    }

    /**
     * Render table header
     */
    renderHeader() {
        if (this.sections.headers.length === 0) return '';
        
        const headerCells = this.sections.headers.map(header => 
            `<th>${header.replace(/_/g, ' ')}</th>`
        ).join('');
        
        return `<thead><tr>${headerCells}</tr></thead>`;
    }

    /**
     * Render table body
     */
    renderBody() {
        if (this.sections.rows.length === 0) {
            const colspan = this.sections.headers.length;
            return `
                <tbody>
                    <tr>
                        <td colspan="${colspan}" class="enhanced-table-empty">
                            No data available
                        </td>
                    </tr>
                </tbody>
            `;
        }

        const rowsHtml = this.sections.rows.map(row => {
            const cells = row.map(cell => `<td>${this.formatCell(cell)}</td>`).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        return `<tbody>${rowsHtml}</tbody>`;
    }

    /**
     * Load and parse content
     * @param {string} data - Report content or file path
     */
    async load(data) {
        try {
            let content = data;
            
            if (data.startsWith('http') || data.startsWith('./') || data.startsWith('/')) {
                const response = await fetch(data);
                content = await response.text();
            }
            
            // Try 3-section format first
            if (content.includes('## STATS') || content.includes('## DATA')) {
                const sections = this.parse3SectionFormat(content);
                this.sections = sections;
            } else {
                // Fallback to old format
                const parsed = this.parseColumnDefinitions(content);
                this.sections.statDefs = parsed.columnDefs;
                this.parseDataSection(parsed.tableContent);
            }
            
            this.render();
            
        } catch (error) {
            console.error('Error loading enhanced pipe table:', error);
            this.container.innerHTML = '<div class="enhanced-table-error">Error loading report data</div>';
        }
    }

    /**
     * Update with new data
     * @param {string} data - New report content
     */
    update(data) {
        this.load(data);
    }
    
    // Legacy methods for compatibility
    parseColumnDefinition(line) {
        const def = {};
        const content = line.slice(1, -1);
        const parts = content.split(';');
        
        parts.forEach(part => {
            const [key, value] = part.split('=');
            if (key && value) {
                def[key] = value.replace(/"/g, '');
            }
        });
        
        return def;
    }
    
    parseDataSection(content) {
        const lines = content.trim().split('\n').filter(line => line.trim() && !line.startsWith('|---'));
        
        if (lines.length === 0) return;
        
        this.sections.headers = this.parsePipeLine(lines[0]);
        this.sections.rows = lines.slice(1).map(line => this.parsePipeLine(line));
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedPipeRenderer;
}