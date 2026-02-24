// ...existing code above...
// --- Dark/Light Mode Toggle ---
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        if (!themeToggle.querySelector('.fa-sun')) {
            const sunIcon = document.createElement('i');
            sunIcon.className = 'fas fa-sun';
            themeToggle.appendChild(sunIcon);
        }
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
        }
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    }
});