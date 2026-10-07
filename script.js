document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(15, 17, 21, 0.95)';
            navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)';
        } else {
            navbar.style.background = 'rgba(15, 17, 21, 0.8)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add simple entrance animation to product cards
    const cards = document.querySelectorAll('.product-card');
    
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });

    // Modal & Telegram Bot Logic
    const modal = document.getElementById("orderModal");
    const closeBtn = document.querySelector(".close");
    const orderForm = document.getElementById("orderForm");
    const productNameInput = document.getElementById("productName");
    const orderStatus = document.getElementById("orderStatus");

    // Open modal on buy button click
    document.querySelectorAll('.buy-btn, .cta-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const product = e.target.getAttribute('data-product') || 'Умумӣ';
            productNameInput.value = product;
            modal.style.display = "flex";
            orderStatus.textContent = '';
        });
    });

    // Close modal
    closeBtn.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Telegram Bot Settings
    const TELEGRAM_BOT_TOKEN = '8535722102:AAGOglEHsJqG9yUqVQTd-9GykWiBnCd8zpw';
    const TELEGRAM_CHAT_ID = '5942914275';

    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('userName').value;
        const phone = document.getElementById('userPhone').value;
        const product = productNameInput.value;

        const message = `🔔 <b>Фармоиши нав!</b>\n\n📦 <b>Маҳсулот:</b> ${product}\n👤 <b>Ном:</b> ${name}\n📞 <b>Телефон:</b> ${phone}`;

        const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

        try {
            orderStatus.textContent = 'Ирсол шуда истодааст...';
            orderStatus.style.color = 'var(--text-muted)';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: 'HTML'
                })
            });

            if (response.ok) {
                orderStatus.textContent = '✅ Фармоиши шумо бо муваффақият ирсол шуд!';
                orderStatus.style.color = 'green';
                orderForm.reset();
                setTimeout(() => {
                    modal.style.display = "none";
                }, 3000);
            } else {
                throw new Error('Хатогӣ ҳангоми ирсол');
            }
        } catch (error) {
            console.error('Error:', error);
            orderStatus.textContent = '❌ Хатогӣ рӯй дод. Лутфан, дертар кӯшиш кунед ё ба мо занг занед.';
            orderStatus.style.color = 'red';
            // Even if token is missing, we show error
        }
    });
});
