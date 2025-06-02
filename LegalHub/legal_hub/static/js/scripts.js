// File name display functionality
function updateFileLabel(inputId, labelId) {
    const input = document.getElementById(inputId);
    const label = document.querySelector(`label[for="${inputId}"] span`);
    
    input.addEventListener('change', function() {
        if (this.files[0]) {
            label.textContent = this.files[0].name;
        } else {
            label.textContent = inputId.includes('contract') ? 'Choose contract file' : 'Choose document to summarize';
        }
    });
}

// Initialize file input listeners
updateFileLabel('contractFile');
updateFileLabel('summaryFile');

// Navigation functionality
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        
        // Add active class to clicked item
        this.classList.add('active');
        
        // Scroll to corresponding card
        const section = this.getAttribute('data-section');
        const card = document.getElementById(section + 'Card');
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Enhanced contract review function
async function reviewContract() {
    const fileInput = document.getElementById('contractFile');
    const resultDiv = document.getElementById('contractResult');
    const loadingDiv = document.getElementById('contractLoading');
    const resultsContent = document.getElementById('resultsContent');
    const resultsTitle = document.getElementById('resultsTitle');
    const button = document.querySelector('#contractCard .btn');

    if (!fileInput.files[0]) {
        showResult(resultDiv, 'Please select a contract file to analyze.', 'error');
        return;
    }

    button.disabled = true;
    loadingDiv.style.display = 'flex';
    resultDiv.style.display = 'none';

    try {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        const response = await fetch('/api/analyze-contract', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Analysis failed');

        const analysis = await response.json();
        const resultHTML = createContractAnalysisHTML(analysis, fileInput.files[0].name);
        
        showResult(resultDiv, 'Contract analysis completed successfully!', 'success');
        
        resultsTitle.innerHTML = '<i class="fas fa-file-contract"></i> Contract Analysis Results';
        resultsContent.innerHTML = resultHTML;
        resultsContent.classList.add('fadeIn');

    } catch (error) {
        console.error('Contract analysis error:', error);
        showResult(resultDiv, 'Error analyzing contract. Please try again.', 'error');
        resultsContent.innerHTML = '<div class="placeholder-content"><h3>Analysis Failed</h3><p>There was an error processing your contract. Please try again.</p></div>';
    } finally {
        loadingDiv.style.display = 'none';
        button.disabled = false;
    }
}

// Enhanced chat function
async function sendQuery() {
    const input = document.getElementById('chatInput');
    const resultDiv = document.getElementById('chatResult');
    const loadingDiv = document.getElementById('chatLoading');
    const resultsContent = document.getElementById('resultsContent');
    const resultsTitle = document.getElementById('resultsTitle');
    const button = document.querySelector('#chatCard .btn');

    if (!input.value.trim()) {
        showResult(resultDiv, 'Please enter a legal question.', 'error');
        return;
    }

    const query = input.value.trim();
    
    button.disabled = true;
    loadingDiv.style.display = 'flex';
    resultDiv.style.display = 'none';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) throw new Error('Query failed');

        const data = await response.json();
        
        showResult(resultDiv, 'Query processed successfully!', 'success');
        
        resultsTitle.innerHTML = '<i class="fas fa-comments"></i> Legal Consultation';
        resultsContent.innerHTML = createChatResponseHTML(query, data.response);
        resultsContent.classList.add('fadeIn');
        
        input.value = '';

    } catch (error) {
        console.error('Chat query error:', error);
        showResult(resultDiv, 'Error processing query. Please try again.', 'error');
        resultsContent.innerHTML = '<div class="placeholder-content"><h3>Query Failed</h3><p>There was an error processing your question. Please try again.</p></div>';
    } finally {
        loadingDiv.style.display = 'none';
        button.disabled = false;
    }
}

// Enhanced summarization function
async function summarizeDocument() {
    const fileInput = document.getElementById('summaryFile');
    const resultDiv = document.getElementById('summaryResult');
    const loadingDiv = document.getElementById('summaryLoading');
    const resultsContent = document.getElementById('resultsContent');
    const resultsTitle = document.getElementById('resultsTitle');
    const button = document.querySelector('#summaryCard .btn');

    if (!fileInput.files[0]) {
        showResult(resultDiv, 'Please select a document to summarize.', 'error');
        return;
    }

    button.disabled = true;
    loadingDiv.style.display = 'flex';
    resultDiv.style.display = 'none';

    try {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        const response = await fetch('/api/summarize', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Summarization failed');

        const data = await response.json();
        const resultHTML = createSummaryHTML(data, fileInput.files[0].name);
        
        showResult(resultDiv, 'Document summarized successfully!', 'success');
        
        resultsTitle.innerHTML = '<i class="fas fa-file-alt"></i> Document Summary';
        resultsContent.innerHTML = resultHTML;
        resultsContent.classList.add('fadeIn');

    } catch (error) {
        console.error('Summarization error:', error);
        showResult(resultDiv, 'Error summarizing document. Please try again.', 'error');
        resultsContent.innerHTML = '<div class="placeholder-content"><h3>Summarization Failed</h3><p>There was an error processing your document. Please try again.</p></div>';
    } finally {
        loadingDiv.style.display = 'none';
        button.disabled = false;
    }
}

// Utility functions
function showResult(element, message, type) {
    element.className = `result ${type}`;
    element.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    element.style.display = 'block';
}

function createContractAnalysisHTML(analysis, fileName) {
    return `
        <div style="margin-bottom: 20px;">
            <h4 style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <i class="fas fa-file-contract"></i>
                Analysis for: ${fileName}
            </h4>
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="font-size: 24px; font-weight: bold;">Overall Score: ${analysis.overall_score}/100</div>
                <div style="opacity: 0.9;">Contract health assessment</div>
            </div>
        </div>

        <div style="display: grid; gap: 20px;">
            <div style="background: rgba(245, 101, 101, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #f56565;">
                <h5 style="color: #c53030; margin-bottom: 10px;"><i class="fas fa-exclamation-triangle"></i> Identified Risks</h5>
                <ul style="margin-left: 20px;">
                    ${analysis.risks.map(risk => `<li>${risk}</li>`).join('')}
                </ul>
            </div>

            <div style="background: rgba(251, 211, 141, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #f6ad55;">
                <h5 style="color: #c05621; margin-bottom: 10px;"><i class="fas fa-minus-circle"></i> Missing Clauses</h5>
                <ul style="margin-left: 20px;">
                    ${analysis.missing_clauses.map(clause => `<li>${clause}</li>`).join('')}
                </ul>
            </div>

            <div style="background: rgba(254, 178, 178, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #fc8181;">
                <h5 style="color: #c53030; margin-bottom: 10px;"><i class="fas fa-gavel"></i> Compliance Issues</h5>
                <ul style="margin-left: 20px;">
                    ${analysis.compliance_issues.map(issue => `<li>${issue}</li>`).join('')}
                </ul>
            </div>

            <div style="background: rgba(72, 187, 120, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #48bb78;">
                <h5 style="color: #2f855a; margin-bottom: 10px;"><i class="fas fa-lightbulb"></i> Recommendations</h5>
                <ul style="margin-left: 20px;">
                    ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function createChatResponseHTML(query, response) {
    return `
        <div style="margin-bottom: 20px;">
            <div style="background: rgba(102, 126, 234, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h5 style="color: #667eea; margin-bottom: 8px;"><i class="fas fa-user"></i> Your Question</h5>
                <p style="margin: 0;">${query}</p>
            </div>
            
            <div style="background: rgba(118, 75, 162, 0.1); padding: 15px; border-radius: 8px;">
                <h5 style="color: #764ba2; margin-bottom: 8px;"><i class="fas fa-robot"></i> AI Legal Assistant</h5>
                <div style="line-height: 1.6;">${response}</div>
            </div>
        </div>
    `;
}

function createSummaryHTML(summary, fileName) {
    return `
        <div style="margin-bottom: 20px;">
            <h4 style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <i class="fas fa-file-alt"></i>
                Summary for: ${fileName}
            </h4>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div style="background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${summary.document_type}</div>
                    <div style="opacity: 0.9;">Document Type</div>
                </div>
                <div style="background: linear-gradient(135deg, #f093fb, #f5576c); color: white; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${summary.word_count}</div>
                    <div style="opacity: 0.9;">Word Count</div>
                </div>
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">${summary.complexity_score}</div>
                    <div style="opacity: 0.9;">Complexity</div>
                </div>
            </div>
        </div>

        <div style="display: grid; gap: 20px;">
            <div style="background: rgba(79, 172, 254, 0.1); padding: 20px; border-radius: 8px; border-left: 4px solid #4facfe;">
                <h5 style="color: #2b6cb0; margin-bottom: 15px;"><i class="fas fa-align-left"></i> Executive Summary</h5>
                <p style="line-height: 1.6; margin: 0;">${summary.summary}</p>
            </div>

            <div style="background: rgba(240, 147, 251, 0.1); padding: 20px; border-radius: 8px; border-left: 4px solid #f093fb;">
                <h5 style="color: #b83280; margin-bottom: 15px;"><i class="fas fa-key"></i> Key Points</h5>
                <ul style="margin-left: 20px;">
                    ${summary.key_points.map(point => `<li style="margin-bottom: 8px;">${point}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function generateMockLegalResponse(query) {
    const responses = {
        'contract': 'A contract is a legally binding agreement between two or more parties. For a contract to be valid, it must contain: (1) Offer and acceptance, (2) Consideration, (3) Legal capacity of parties, and (4) Legal purpose. I recommend consulting with a qualified attorney for specific contract matters affecting your situation.',
        'liability': 'Liability refers to legal responsibility for damages or harm. There are different types including strict liability, negligent liability, and contractual liability. The extent of liability often depends on the specific circumstances and applicable laws in your jurisdiction.',
        'intellectual property': 'Intellectual property includes patents, trademarks, copyrights, and trade secrets. These provide legal protection for creative works and inventions. Registration requirements and protection periods vary by type. Consider consulting an IP attorney for comprehensive protection strategies.',
        'employment': 'Employment law governs the relationship between employers and employees, covering areas like wages, workplace safety, discrimination, and termination. Both federal and state laws apply, and requirements can vary significantly by jurisdiction and company size.',
        'privacy': 'Privacy laws like GDPR, CCPA, and HIPAA regulate how personal data is collected, processed, and stored. Organizations must implement appropriate safeguards and obtain proper consent. Violations can result in significant penalties and legal liability.'
    };

    // Simple keyword matching for demo purposes
    const queryLower = query.toLowerCase();
    for (const [keyword, response] of Object.entries(responses)) {
        if (queryLower.includes(keyword)) {
            return response;
        }
    }

    return 'Thank you for your legal question. Based on general legal principles, I recommend consulting with a qualified attorney who can provide advice specific to your situation and applicable laws in your jurisdiction. Legal matters often involve complex factors that require professional evaluation.';
}

// Enter key support for chat input
document.getElementById('chatInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendQuery();
    }
});

// Enhanced drag and drop functionality
function setupDragAndDrop(inputId) {
    const input = document.getElementById(inputId);
    const label = document.querySelector(`label[for="${inputId}"]`);
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        label.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        label.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        label.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        label.style.borderColor = '#667eea';
        label.style.background = 'rgba(102, 126, 234, 0.1)';
    }

    function unhighlight(e) {
        label.style.borderColor = '#e2e8f0';
        label.style.background = 'transparent';
    }

    label.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        input.files = files;
        
        // Update label text
        const span = label.querySelector('span');
        if (files[0]) {
            span.textContent = files[0].name;
        }
    }
}

// Initialize drag and drop for file inputs
setupDragAndDrop('contractFile');
setupDragAndDrop('summaryFile');

// Smooth scrolling enhancement
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            this.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    });
});

// Progress indication for file processing
function showProgress(elementId, message) {
    const element = document.getElementById(elementId);
    element.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <div class="spinner"></div>
            <span>${message}</span>
        </div>
    `;
    element.style.display = 'flex';
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to trigger actions
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.id === 'chatInput') {
            sendQuery();
        }
    }
});

// Add tooltips for better UX
function addTooltips() {
    const tooltips = {
        'contractFile': 'Supported formats: PDF, DOC, DOCX, TXT',
        'summaryFile': 'Supported formats: PDF, DOC, DOCX, TXT',
        'chatInput': 'Ask about contracts, liability, IP, employment law, etc.'
    };

    Object.entries(tooltips).forEach(([id, tooltip]) => {
        const element = document.getElementById(id);
        if (element) {
            element.title = tooltip;
        }
    });
}

// Initialize tooltips
addTooltips();

// Auto-resize chat input
const chatInput = document.getElementById('chatInput');
chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

// Add character counter for chat input
chatInput.addEventListener('input', function() {
    const maxLength = this.getAttribute('maxlength');
    const currentLength = this.value.length;
    
    let counter = document.getElementById('chatCounter');
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'chatCounter';
        counter.style.cssText = 'font-size: 12px; color: #718096; text-align: right; margin-top: 5px;';
        this.parentNode.appendChild(counter);
    }
    
    counter.textContent = `${currentLength}/${maxLength} characters`;
    counter.style.color = currentLength > maxLength * 0.9 ? '#e53e3e' : '#718096';
});
