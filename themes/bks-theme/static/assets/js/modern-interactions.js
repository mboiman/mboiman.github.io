/**
 * Modern CV 2025 - Interactive Elements
 * Created by Michael Boiman
 * Optimized for modern user experience
 */

(function() {
    'use strict';

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        setupIntersectionObserver();
        setupSkillsAnimation();
        setupSmoothScrolling();
        setupParallaxEffect();
        setupTypingEffect();
        setupCardHoverEffects();
        setupProgressBars();
        setupThemeToggle();
        setupSearchFunctionality();
        setupPrintOptimization();
    }

    // Intersection Observer for animations
    function setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Trigger skill bar animations
                    if (entry.target.classList.contains('skill-card')) {
                        animateSkillBar(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observe all cards and sections
        document.querySelectorAll('.modern-card, .skill-card, .experience-item, .project-card').forEach(el => {
            observer.observe(el);
        });
    }

    // Skills animation
    function setupSkillsAnimation() {
        const skillCards = document.querySelectorAll('.skill-card');
        
        skillCards.forEach((card, index) => {
            // Staggered animation delay
            card.style.setProperty('--animation-delay', `${index * 0.1}s`);
        });
    }

    function animateSkillBar(card) {
        const progressBar = card.querySelector('.skill-progress');
        if (progressBar) {
            const width = progressBar.style.width;
            progressBar.style.width = '0%';
            setTimeout(() => {
                progressBar.style.width = width;
            }, 300);
        }
    }

    // Smooth scrolling for anchor links
    function setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Parallax effect for hero section
    function setupParallaxEffect() {
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        let ticking = false;

        function updateParallax() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            heroSection.style.transform = `translateY(${rate}px)`;
            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick);
    }

    // Typing effect for hero title
    function setupTypingEffect() {
        const heroTitle = document.querySelector('.hero-title');
        if (!heroTitle || window.innerWidth < 768) return;

        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        heroTitle.style.opacity = '1';

        let index = 0;
        function typeChar() {
            if (index < text.length) {
                heroTitle.textContent += text.charAt(index);
                index++;
                setTimeout(typeChar, 100);
            } else {
                heroTitle.classList.add('typing-complete');
            }
        }

        // Start typing after a short delay
        setTimeout(typeChar, 500);
    }

    // Enhanced card hover effects
    function setupCardHoverEffects() {
        const cards = document.querySelectorAll('.modern-card, .skill-card, .experience-item, .project-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
                card.classList.add('hover-active');
            });
            
            card.addEventListener('mouseleave', () => {
                card.classList.remove('hover-active');
            });
        });
    }

    // Animated progress bars
    function setupProgressBars() {
        const progressBars = document.querySelectorAll('.skill-progress');
        
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            
            // Animate when in view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            bar.style.width = width;
                        }, 500);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(bar);
        });
    }

    // Theme toggle functionality
    function setupThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (!themeToggle) return;

        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Update toggle button
            themeToggle.querySelector('i').className = newTheme === 'dark' ? 'fa fa-sun' : 'fa fa-moon';
        });
    }

    // Search functionality
    function setupSearchFunctionality() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const searchableElements = document.querySelectorAll('.experience-item, .skill-card, .project-card');
            
            searchableElements.forEach(element => {
                const text = element.textContent.toLowerCase();
                if (text.includes(query)) {
                    element.style.display = 'block';
                    element.classList.add('search-highlight');
                } else {
                    element.style.display = query ? 'none' : 'block';
                    element.classList.remove('search-highlight');
                }
            });
        });
    }

    // Print optimization
    function setupPrintOptimization() {
        window.addEventListener('beforeprint', () => {
            // Expand all collapsed sections
            document.querySelectorAll('.collapsed').forEach(el => {
                el.classList.remove('collapsed');
            });
            
            // Ensure all skill bars are visible
            document.querySelectorAll('.skill-progress').forEach(bar => {
                bar.style.width = bar.getAttribute('data-width') || bar.style.width;
            });
        });
    }

    // Utility functions
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Enhanced animations CSS injection
    const animationStyles = `
        <style>
        .modern-card, .skill-card, .experience-item, .project-card {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.6s ease-out;
        }
        
        .animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .skill-card {
            transition-delay: var(--animation-delay, 0s);
        }
        
        .hero-title {
            opacity: 0;
        }
        
        .typing-complete {
            opacity: 1;
        }
        
        .hover-active {
            position: relative;
        }
        
        .hover-active::before {
            content: '';
            position: absolute;
            top: var(--mouse-y);
            left: var(--mouse-x);
            width: 0;
            height: 0;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
            transform: translate(-50%, -50%);
            animation: ripple 0.6s ease-out;
        }
        
        @keyframes ripple {
            to {
                width: 200px;
                height: 200px;
            }
        }
        
        .search-highlight {
            background: rgba(59, 130, 246, 0.1);
            border-radius: 8px;
        }
        
        @media (prefers-reduced-motion: reduce) {
            .modern-card, .skill-card, .experience-item, .project-card {
                transition: none;
            }
        }
        </style>
    `;

    document.head.insertAdjacentHTML('beforeend', animationStyles);

})();