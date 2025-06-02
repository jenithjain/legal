// Sidebar functionality
function initializeSidebar() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Navigate to the corresponding page
            const page = this.getAttribute('data-page');
            if (page) {
                window.location.href = `/${page}.html`;
            }
        });
    });
}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeSidebar);