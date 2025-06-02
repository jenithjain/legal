// Document summarization functionality
async function summarizeDocument() {
    const fileInput = document.getElementById('summaryFile');
    const resultDiv = document.getElementById('summaryResult');
    const loadingDiv = document.getElementById('summaryLoading');
    const summaryContent = document.getElementById('summaryContent');

    if (!fileInput.files[0]) {
        showResult(resultDiv, 'Please select a document to summarize.', 'error');
        return;
    }

    // Show loading state
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

        showResult(resultDiv, 'Document summarization completed successfully!', 'success');
        displaySummaryResults(data.summary, fileInput.files[0].name);
        
    } catch (error) {
        console.error('Document summarization error:', error);
        showResult(resultDiv, 'Error summarizing document. Please try again.', 'error');
        summaryContent.innerHTML = `
            <div class="placeholder-content">
                <h3>Summarization Failed</h3>
                <p>There was an error processing your document. Please try again.</p>
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

function displaySummaryResults(summary, fileName) {
    const summaryContent = document.getElementById('summaryContent');
    
    // Create HTML for summary results
    summaryContent.innerHTML = `
        <div class="summary-container">
            <h3>Summary for: ${fileName}</h3>
            <div class="summary-content">
                <div class="summary-text">
                    ${summary.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
                </div>
            </div>
        </div>
    `;
}

// Initialize file input label
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('summaryFile');
    const fileLabel = document.querySelector('label[for="summaryFile"] span');
    
    if (fileInput && fileLabel) {
        fileInput.addEventListener('change', function() {
            if (this.files[0]) {
                fileLabel.textContent = this.files[0].name;
            } else {
                fileLabel.textContent = 'Choose document to summarize';
            }
        });
    }
});