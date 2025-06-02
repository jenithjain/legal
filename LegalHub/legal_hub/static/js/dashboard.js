// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Sample data - in a real app, this would come from an API
    const activityData = {
        contractsAnalyzed: 24,
        queriesAnswered: 38,
        documentsSummarized: 15,
        recentDocuments: [
            { name: 'Service Agreement.pdf', type: 'contract', date: '2023-06-15', score: 78 },
            { name: 'Employment Contract.docx', type: 'contract', date: '2023-06-12', score: 92 },
            { name: 'Privacy Policy.pdf', type: 'document', date: '2023-06-10', score: 85 }
        ],
        activityTimeline: [
            { action: 'Contract Analysis', document: 'Service Agreement.pdf', date: '2023-06-15 14:30' },
            { action: 'Legal Query', query: 'Requirements for forming an LLC', date: '2023-06-14 10:15' },
            { action: 'Document Summary', document: 'Privacy Policy.pdf', date: '2023-06-10 09:45' }
        ]
    };

    // Render metrics
    document.getElementById('contractsAnalyzed').textContent = activityData.contractsAnalyzed;
    document.getElementById('queriesAnswered').textContent = activityData.queriesAnswered;
    document.getElementById('documentsSummarized').textContent = activityData.documentsSummarized;
    
    // Render recent documents
    const recentDocsContainer = document.getElementById('recentDocuments');
    if (recentDocsContainer) {
        let docsHTML = '';
        activityData.recentDocuments.forEach(doc => {
            const scoreColor = getScoreColor(doc.score);
            docsHTML += `
                <div class="recent-document">
                    <div class="doc-icon">
                        <i class="fas fa-${doc.type === 'contract' ? 'file-contract' : 'file-alt'}"></i>
                    </div>
                    <div class="doc-info">
                        <div class="doc-name">${doc.name}</div>
                        <div class="doc-date">${doc.date}</div>
                    </div>
                    <div class="doc-score" style="color: ${scoreColor}">${doc.score}</div>
                </div>
            `;
        });
        recentDocsContainer.innerHTML = docsHTML;
    }
    
    // Render activity timeline
    const timelineContainer = document.getElementById('activityTimeline');
    if (timelineContainer) {
        let timelineHTML = '';
        activityData.activityTimeline.forEach(item => {
            const icon = item.action.includes('Contract') ? 'file-contract' : 
                        item.action.includes('Query') ? 'comments' : 'file-alt';
            timelineHTML += `
                <div class="timeline-item">
                    <div class="timeline-icon">
                        <i class="fas fa-${icon}"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-action">${item.action}</div>
                        <div class="timeline-detail">
                            ${item.document ? item.document : item.query}
                        </div>
                        <div class="timeline-date">${item.date}</div>
                    </div>
                </div>
            `;
        });
        timelineContainer.innerHTML = timelineHTML;
    }
    
    // Create usage chart
    createUsageChart();
});

function createUsageChart() {
    const ctx = document.getElementById('usageChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Contract Reviews',
                    data: [5, 8, 12, 15, 20, 24],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Legal Queries',
                    data: [8, 15, 20, 25, 30, 38],
                    borderColor: '#f093fb',
                    backgroundColor: 'rgba(240, 147, 251, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Document Summaries',
                    data: [3, 5, 7, 10, 12, 15],
                    borderColor: '#4facfe',
                    backgroundColor: 'rgba(79, 172, 254, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Usage Trends'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
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