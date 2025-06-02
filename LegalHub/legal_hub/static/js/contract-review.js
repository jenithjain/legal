// Enhanced contract review functionality
async function analyzeContract() {
    const fileInput = document.getElementById('contractFile');
    const resultDiv = document.getElementById('contractResult');
    const loadingDiv = document.getElementById('contractLoading');
    const resultsContent = document.getElementById('resultsContent');

    if (!fileInput.files[0]) {
        showResult(resultDiv, 'Please select a contract file to analyze.', 'error');
        return;
    }

    // Show loading state
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

        showResult(resultDiv, 'Contract analysis completed successfully!', 'success');
        displayAnalysisResults(analysis, fileInput.files[0].name);
        
    } catch (error) {
        console.error('Contract analysis error:', error);
        showResult(resultDiv, 'Error analyzing contract. Please try again.', 'error');
        resultsContent.innerHTML = `
            <div class="placeholder-content">
                <h3>Analysis Failed</h3>
                <p>There was an error processing your contract. Please try again.</p>
            </div>
        `;
    } finally {
        loadingDiv.style.display = 'none';
    }
}

function showResult(element, message, type) {
    element.className = `result ${type}`;
    element.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    element.style.display = 'block';
}

function displayAnalysisResults(analysis, fileName) {
    const resultsContent = document.getElementById('resultsContent');
    
    // Create HTML for enhanced results
    resultsContent.innerHTML = `
        <div>
            <h3 class="analysis-title">Analysis for: ${fileName}</h3>
            
            <!-- Overall Assessment -->
            <div class="analysis-section">
                <h4 class="section-toggle active">
                    <i class="fas fa-star"></i> Overall Assessment
                    <span class="risk-badge" style="background: ${getScoreColor(analysis.overall_assessment.risk_score)};">
                        ${analysis.overall_assessment.recommendation}
                    </span>
                </h4>
                <div class="collapsible-content">
                    <div class="metric-grid">
                        <div class="metric-card">
                            <div>Risk Score</div>
                            <div class="score" style="color: ${getScoreColor(analysis.overall_assessment.risk_score)};">
                                ${analysis.overall_assessment.risk_score}/100
                            </div>
                            <div class="progress-bar">
                                <div style="width: ${analysis.overall_assessment.risk_score}%; background: ${getScoreColor(analysis.overall_assessment.risk_score)};"></div>
                            </div>
                        </div>
                        
                        <div class="metric-card">
                            <div>Completeness</div>
                            <div class="score" style="color: ${getScoreColor(analysis.overall_assessment.completeness_score)};">
                                ${analysis.overall_assessment.completeness_score}/100
                            </div>
                            <div class="progress-bar">
                                <div style="width: ${analysis.overall_assessment.completeness_score}%; background: ${getScoreColor(analysis.overall_assessment.completeness_score)};"></div>
                            </div>
                        </div>
                        
                        <div class="metric-card">
                            <div>Compliance</div>
                            <div class="score" style="color: ${getScoreColor(analysis.overall_assessment.compliance_score)};">
                                ${analysis.overall_assessment.compliance_score}/100
                            </div>
                            <div class="progress-bar">
                                <div style="width: ${analysis.overall_assessment.compliance_score}%; background: ${getScoreColor(analysis.overall_assessment.compliance_score)};"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Risk Analysis -->
            <div class="analysis-section">
                <h4 class="section-toggle">
                    <i class="fas fa-exclamation-triangle"></i> Risk Analysis
                    <span class="risk-badge high-risk">${analysis.risk_analysis.high_risks.length} High</span>
                    <span class="risk-badge medium-risk">${analysis.risk_analysis.medium_risks.length} Medium</span>
                    <span class="risk-badge low-risk">${analysis.risk_analysis.low_risks.length} Low</span>
                </h4>
                <div class="collapsible-content">
                    ${renderRiskSection('High Risks', analysis.risk_analysis.high_risks, 'high-risk')}
                    ${renderRiskSection('Medium Risks', analysis.risk_analysis.medium_risks, 'medium-risk')}
                    ${renderRiskSection('Low Risks', analysis.risk_analysis.low_risks, 'low-risk')}
                    
                    ${analysis.risk_analysis.mitigation_strategies.length ? `
                    <div class="mitigation-strategies">
                        <h5><i class="fas fa-shield-alt"></i> Mitigation Strategies</h5>
                        <ul class="strategy-list">
                            ${analysis.risk_analysis.mitigation_strategies.map(strategy => `<li>${strategy}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Completeness Check -->
            <div class="analysis-section">
                <h4 class="section-toggle">
                    <i class="fas fa-clipboard-check"></i> Completeness Check
                </h4>
                <div class="collapsible-content">
                    ${analysis.completeness_check.missing_clauses.length ? `
                    <div class="missing-clauses">
                        <h5><i class="fas fa-exclamation-circle"></i> Missing Clauses</h5>
                        <ul class="clause-list">
                            ${analysis.completeness_check.missing_clauses.map(clause => `<li>${clause}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                    
                    ${analysis.completeness_check.incomplete_sections.length ? `
                    <div class="incomplete-sections">
                        <h5><i class="fas fa-exclamation-triangle"></i> Incomplete Sections</h5>
                        <ul class="section-list">
                            ${analysis.completeness_check.incomplete_sections.map(section => `<li>${section}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                    
                    ${analysis.completeness_check.recommendations.length ? `
                    <div class="recommendations">
                        <h5><i class="fas fa-lightbulb"></i> Recommendations</h5>
                        <ul class="recommendation-list">
                            ${analysis.completeness_check.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Compliance Review -->
            <div class="analysis-section">
                <h4 class="section-toggle">
                    <i class="fas fa-balance-scale"></i> Compliance Review
                </h4>
                <div class="collapsible-content">
                    ${analysis.compliance_review.compliance_issues.length ? `
                    <div class="compliance-issues">
                        <h5><i class="fas fa-exclamation-circle"></i> Compliance Issues</h5>
                        <ul class="issue-list">
                            ${analysis.compliance_review.compliance_issues.map(issue => `<li>${issue}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                    
                    ${analysis.compliance_review.jurisdiction_specific.length ? `
                    <div class="jurisdiction-requirements">
                        <h5><i class="fas fa-gavel"></i> Jurisdiction-Specific Requirements</h5>
                        <ul class="requirement-list">
                            ${analysis.compliance_review.jurisdiction_specific.map(req => `<li>${req}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Term Analysis -->
            <div class="analysis-section">
                <h4 class="section-toggle">
                    <i class="fas fa-file-signature"></i> Term Analysis
                </h4>
                <div class="collapsible-content">
                    <h5>Key Terms</h5>
                    <div class="term-tags">
                        ${analysis.term_analysis.key_terms.map(term => `<span class="term-tag">${term}</span>`).join('')}
                    </div>
                    
                    ${analysis.term_analysis.unusual_terms.length ? `
                    <h5>Unusual Terms</h5>
                    <ul class="unusual-terms-list">
                        ${analysis.term_analysis.unusual_terms.map(term => `<li><span class="term-highlight">${term}</span></li>`).join('')}
                    </ul>
                    ` : ''}
                    
                    ${analysis.term_analysis.industry_comparison.length ? `
                    <h5>Industry Comparison</h5>
                    <ul class="industry-comparison-list">
                        ${analysis.term_analysis.industry_comparison.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                    ` : ''}
                </div>
            </div>
            
            <!-- Charts Section -->
            <div class="chart-container">
                <canvas id="metricsChart"></canvas>
            </div>
        </div>
    `;
    
    // Add toggle functionality
    document.querySelectorAll('.section-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
        
        // Trigger click on active toggles to expand them
        if (toggle.classList.contains('active')) {
            toggle.click();
        }
    });
    
    // Create enhanced chart
    createEnhancedChart(analysis);
}

// Add this function to improve the display of detailed analysis
function renderDetailedRiskSection(title, risks, riskClass) {
    if (!risks.length) return '';
    return `
        <div class="risk-section ${riskClass}-section">
            <h5><i class="fas fa-${riskClass === 'high-risk' ? 'exclamation-circle' : riskClass === 'medium-risk' ? 'exclamation' : 'info-circle'}"></i> ${title}</h5>
            <ul class="risk-list">
                ${risks.map(risk => {
                    // Check if the risk contains a citation (indicated by quotes or references)
                    const hasCitation = risk.includes('"') || risk.includes('\'') || risk.includes('Section');
                    return `
                        <li>
                            <span class="risk-badge ${riskClass}">${title.split(' ')[0]}</span>
                            <div class="risk-content">
                                <div class="risk-description">${risk}</div>
                                ${hasCitation ? `<div class="risk-citation"><i class="fas fa-quote-left"></i> Contains contract reference</div>` : ''}
                            </div>
                        </li>
                    `;
                }).join('')}
            </ul>
        </div>
    `;
}

// Replace the existing renderRiskSection function with this enhanced version
function renderRiskSection(title, risks, riskClass) {
    return renderDetailedRiskSection(title, risks, riskClass);
}

// Add this CSS to your style.css file or in a style tag in contract-review.html
// Add this to the <style> section in contract-review.html
/*
.risk-content {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-left: 10px;
    flex: 1;
}

.risk-citation {
    font-size: 0.8em;
    color: #666;
    font-style: italic;
}

.risk-list li {
    display: flex;
    margin-bottom: 12px;
    align-items: flex-start;
}

.term-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 15px;
}

.term-tag {
    background: #e2e8f0;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 0.9em;
}

.unusual-terms-list li {
    margin-bottom: 10px;
    padding: 8px;
    background: #f8f9fa;
    border-radius: 5px;
}
*/

function createEnhancedChart(analysis) {
    const ctx = document.getElementById('metricsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Risk', 'Completeness', 'Compliance'],
            datasets: [{
                label: 'Scores',
                data: [
                    analysis.overall_assessment.risk_score,
                    analysis.overall_assessment.completeness_score,
                    analysis.overall_assessment.compliance_score
                ],
                backgroundColor: [
                    getScoreColor(analysis.overall_assessment.risk_score),
                    getScoreColor(analysis.overall_assessment.completeness_score),
                    getScoreColor(analysis.overall_assessment.compliance_score)
                ],
                borderColor: [
                    darkenColor(getScoreColor(analysis.overall_assessment.risk_score)),
                    darkenColor(getScoreColor(analysis.overall_assessment.completeness_score)),
                    darkenColor(getScoreColor(analysis.overall_assessment.compliance_score))
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Score: ${context.raw}/100`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Score'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Categories'
                    }
                }
            }
        }
    });
}

function getScoreColor(score) {
    if (score >= 80) return '#48bb78';
    if (score >= 50) return '#ecc94b';
    return '#f56565';
}

function darkenColor(hex) {
    // Convert hex to RGB
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    
    // Darken by reducing each component by 20%
    r = Math.floor(r * 0.8);
    g = Math.floor(g * 0.8);
    b = Math.floor(b * 0.8);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Initialize file input label
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('contractFile');
    const fileLabel = document.querySelector('label[for="contractFile"] span');
    
    if (fileInput && fileLabel) {
        fileInput.addEventListener('change', function() {
            if (this.files[0]) {
                fileLabel.textContent = this.files[0].name;
            } else {
                fileLabel.textContent = 'Choose contract file';
            }
        });
    }
    
    // Initialize section toggles
    document.querySelectorAll('.section-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
});