// Legal chatbot functionality
async function sendQuery() {
    const input = document.getElementById('chatInput');
    const resultDiv = document.getElementById('chatResult');
    const loadingDiv = document.getElementById('chatLoading');
    const chatContent = document.getElementById('chatContent');

    if (!input.value.trim()) {
        showResult(resultDiv, 'Please enter a legal question.', 'error');
        return;
    }

    // Show loading state
    loadingDiv.style.display = 'flex';
    resultDiv.style.display = 'none';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: input.value })
        });

        if (!response.ok) throw new Error('Query failed');
        const data = await response.json();

        showResult(resultDiv, 'Question answered successfully!', 'success');
        displayChatResponse(data.response, input.value);
        
        // Clear input after successful query
        input.value = '';
        
    } catch (error) {
        console.error('Chat query error:', error);
        showResult(resultDiv, 'Error processing your question. Please try again.', 'error');
        chatContent.innerHTML = `
            <div class="placeholder-content">
                <h3>Query Failed</h3>
                <p>There was an error processing your question. Please try again.</p>
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

function displayChatResponse(response, question) {
    const chatContent = document.getElementById('chatContent');
    
    // Create HTML for chat response
    chatContent.innerHTML = `
        <div class="chat-container">
            <div class="chat-question">
                <div class="chat-bubble user-bubble">
                    <div class="chat-icon">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="chat-text">
                        ${question}
                    </div>
                </div>
            </div>
            <div class="chat-answer">
                <div class="chat-bubble ai-bubble">
                    <div class="chat-icon">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="chat-text">
                        ${response.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Add event listener for Enter key
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInput');
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendQuery();
            }
        });
    }
});