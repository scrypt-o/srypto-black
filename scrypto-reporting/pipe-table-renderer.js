/**
 * Generic Pipe-Delimited Table Renderer
 * Parses | delimited data and renders tables with smart formatting
 */

class PipeTableRenderer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            theme: options.theme || 'light',
            className: options.className || 'pipe-table',
            ...options
        };
        this.headers = [];
        this.rows = [];
    }

    /**
     * Parse pipe-delimited content
     * @param {string} content - The pipe-delimited content
     */
    parseContent(content) {
        const lines = content.trim().split('\n').filter(line => line.trim());
        
        if (lines.length === 0) return;
        
        // Parse headers from first row
        this.headers = this.parsePipeLine(lines[0]);
        
        // Parse data rows
        this.rows = lines.slice(1).map(line => this.parsePipeLine(line));
    }

    /**
     * Parse a single pipe-delimited line
     * @param {string} line - The line to parse
     * @returns {Array} Array of cell values
     */
    parsePipeLine(line) {
        // Split by | and clean up whitespace
        return line.split('|')
            .map(cell => cell.trim())
            .filter((cell, index, array) => {
                // Remove empty cells at start/end (from leading/trailing |)
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
        let backgroundColor = null;

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
        
        // Status icons
        if (lowerText === 'yes' || lowerText === 'ticked' || lowerText === 'checked') {
            return `<span class="status-icon status-success" ${color ? `style="color: ${color};"` : ''}>✓</span>`;
        }
        
        if (lowerText === 'no' || lowerText === 'x' || lowerText === 'err' || lowerText === 'wrong') {
            return `<span class="status-icon status-error" ${color ? `style="color: ${color};"` : ''}>✗</span>`;
        }
        
        if (lowerText === 'ongoing') {
            return `<span class="status-text status-ongoing" ${color ? `style="color: ${color};"` : ''}>●</span>`;
        }

        // Handle ! with color
        if (text.startsWith('!(') && text.endsWith(')')) {
            const colorName = text.slice(2, -1);
            const exclamationColor = this.getColorCode(colorName);
            return `<span class="status-icon" style="color: ${exclamationColor};">!</span>`;
        }

        // Regular text with optional color
        if (color) {
            return `<span style="color: ${color};">${text}</span>`;
        }

        return text;
    }

    /**
     * Convert color names to hex codes
     * @param {string} colorName - Color name (red, blue, etc.)
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
            'grey': '#6b7280',
            'black': '#000000',
            'white': '#ffffff'
        };
        
        return colorMap[colorName.toLowerCase()] || colorName;
    }

    /**
     * Render the table with optional stat blocks
     */
    render() {
        if (!this.container) return;
        
        const tableClass = this.options.theme === 'dark' ? 
            `${this.options.className} ${this.options.className}-dark` : 
            this.options.className;
        
        let html = '';
        
        // Add stat blocks if column definitions exist
        if (this.columnDefs && this.columnDefs.length > 0) {
            html += this.generateStatBlocks();
        }
        
        html += `
            <div class="pipe-table-container">
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
        if (this.headers.length === 0) return '';
        
        const headerCells = this.headers.map(header => 
            `<th>${header}</th>`
        ).join('');
        
        return `
            <thead>
                <tr>${headerCells}</tr>
            </thead>
        `;
    }

    /**
     * Render table body
     */
    renderBody() {
        if (this.rows.length === 0) {
            const colspan = this.headers.length;
            return `
                <tbody>
                    <tr>
                        <td colspan="${colspan}" class="pipe-table-empty">
                            No data available
                        </td>
                    </tr>
                </tbody>
            `;
        }

        const rowsHtml = this.rows.map(row => {
            const cells = row.map(cell => `<td>${this.formatCell(cell)}</td>`).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        return `<tbody>${rowsHtml}</tbody>`;
    }

    /**
     * Parse column definitions from the beginning of content
     * @param {string} content - Content that may include column definitions
     * @returns {object} Parsed definitions and remaining content
     */
    parseColumnDefinitions(content) {
        const lines = content.trim().split('\n');
        const columnDefs = [];
        let dataStartIndex = 0;
        
        // Look for column definition lines at the start
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('|col-display-name=')) {
                columnDefs.push(this.parseColumnDefinition(line));
                dataStartIndex = i + 1;
            } else if (line === '' || line.startsWith('#')) {
                continue; // Skip empty lines and headers
            } else {
                break; // Found actual data
            }
        }
        
        return {
            columnDefs,
            tableContent: lines.slice(dataStartIndex).join('\n')
        };
    }
    
    /**
     * Parse a single column definition line
     * @param {string} line - Column definition line
     * @returns {object} Parsed column definition
     */
    parseColumnDefinition(line) {
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
     * Load data from a pipe-delimited string or file
     * @param {string} data - Pipe delimited data or URL to fetch
     */
    async load(data) {
        try {
            let content;
            
            // Check if it's a URL or direct data
            if (data.startsWith('http') || data.startsWith('./') || data.startsWith('/')) {
                const response = await fetch(data);
                content = await response.text();
            } else {
                content = data;
            }
            
            const parsed = this.parseColumnDefinitions(content);
            this.columnDefs = parsed.columnDefs;
            this.parseContent(parsed.tableContent);
            this.render();
        } catch (error) {
            console.error('Error loading pipe table data:', error);
            this.container.innerHTML = '<div class="pipe-table-error">Error loading data</div>';
        }
    }
    
    /**
     * Generate stat blocks from column definitions and data
     * @returns {string} HTML for stat blocks
     */
    generateStatBlocks() {
        if (!this.columnDefs || this.columnDefs.length === 0) return '';
        
        let html = '<div class="stat-blocks-grid">';
        
        this.columnDefs.forEach(def => {
            const value = this.calculateStat(def);
            html += `
                <div class="stat-block">
                    <div class="stat-value">${value}</div>
                    <div class="stat-label">${def['col-display-name']}</div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    /**
     * Calculate statistic based on column definition
     * @param {object} def - Column definition
     * @returns {string} Calculated statistic
     */
    calculateStat(def) {
        const statType = def['col-stat-type'];
        const groupBy = def['col-stat-groupby'];
        
        if (statType === 'count') {
            return this.rows.length.toString();
        }
        
        if (statType === 'percentage') {
            // Calculate percentage of Yes/green items
            let total = 0;
            let completed = 0;
            
            this.rows.forEach(row => {
                // Look for Yes or green indicators
                row.forEach(cell => {
                    if (cell && cell !== 'N/A') {
                        total++;
                        if (cell.toLowerCase().includes('yes') || cell.includes('@green')) {
                            completed++;
                        }
                    }
                });
            });
            
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            return `${percentage}%`;
        }
        
        if (statType === 'pie') {
            return '📊'; // Placeholder for pie chart
        }
        
        return 'N/A';
    }

    /**
     * Update table with new data
     * @param {string} data - New pipe delimited data
     */
    update(data) {
        this.parseContent(data);
        this.render();
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PipeTableRenderer;
}