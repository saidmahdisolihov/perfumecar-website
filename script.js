document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. STICKY NAVBAR EFFECT
    // ==========================================
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.style.background = 'rgba(9, 11, 16, 0.95)';
            navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.6)';
            navbar.style.borderBottomColor = 'rgba(245, 158, 11, 0.2)';
        } else {
            navbar.style.background = 'rgba(9, 11, 16, 0.85)';
            navbar.style.boxShadow = 'none';
            navbar.style.borderBottomColor = 'rgba(255, 255, 255, 0.08)';
        }
    });

    // ==========================================
    // 2. SMOOTH SCROLLING FOR LINKS
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElem = document.querySelector(targetId);
            if (targetElem) {
                e.preventDefault();
                targetElem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ==========================================
    // 3. CATEGORY FILTERS
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            productCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px) scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // ==========================================
    // 4. TELEGRAM BOT SETTINGS
    // ==========================================
    const TELEGRAM_BOT_TOKEN = '8535722102:AAGOglEHsJqG9yUqVQTd-9GykWiBnCd8zpw';
    const TELEGRAM_CHAT_ID = '5942914275';

    // ==========================================
    // 5. SHOPPING CART (САБАДИ ХАРИД) LOGIC
    // ==========================================
    let cart = [];
    try {
        const saved = localStorage.getItem('eikosha_cart');
        if (saved) cart = JSON.parse(saved);
    } catch (e) {
        cart = [];
    }

    const openCartBtn = document.getElementById('openCartBtn');
    const floatingCartBtn = document.getElementById('floatingCartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartItemsCountText = document.getElementById('cartItemsCountText');
    const cartCount = document.getElementById('cartCount');
    const floatingCartCount = document.getElementById('floatingCartCount');
    const cartSummaryTotalQty = document.getElementById('cartSummaryTotalQty');
    const cartGrandTotal = document.getElementById('cartGrandTotal');
    const cartCheckoutForm = document.getElementById('cartCheckoutForm');
    const cartOrderStatus = document.getElementById('cartOrderStatus');
    const cartSubmitOrderBtn = document.getElementById('cartSubmitOrderBtn');
    const toastNotification = document.getElementById('toastNotification');

    function saveCart() {
        try {
            localStorage.setItem('eikosha_cart', JSON.stringify(cart));
        } catch (e) {
            console.error('Could not save cart:', e);
        }
    }

    function showToast(message) {
        if (!toastNotification) return;
        toastNotification.textContent = message;
        toastNotification.classList.add('show');
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 2800);
    }

    function openCart() {
        if (cartDrawerOverlay) {
            cartDrawerOverlay.classList.add('active');
            renderCart();
        }
    }

    function closeCart() {
        if (cartDrawerOverlay) {
            cartDrawerOverlay.classList.remove('active');
        }
    }

    if (openCartBtn) openCartBtn.addEventListener('click', openCart);
    if (floatingCartBtn) floatingCartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);

    if (cartDrawerOverlay) {
        cartDrawerOverlay.addEventListener('click', (e) => {
            if (e.target === cartDrawerOverlay) {
                closeCart();
            }
        });
    }

    // Add item to cart
    function addToCart(name, price, img) {
        const numericPrice = parseInt(price, 10) || 169;
        const existingIndex = cart.findIndex(item => item.name === name);

        if (existingIndex > -1) {
            cart[existingIndex].qty += 1;
        } else {
            cart.push({
                id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                name: name,
                price: numericPrice,
                img: img || 'images/marine-squash.jpg',
                qty: 1
            });
        }

        saveCart();
        renderCart();
        showToast(`✅ «${name}» ба сабад илова шуд!`);
    }

    // Update quantity
    window.updateCartItemQty = function(id, delta) {
        const item = cart.find(i => i.id === id);
        if (!item) return;

        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.id !== id);
        }

        saveCart();
        renderCart();
    };

    // Remove item
    window.removeCartItem = function(id) {
        cart = cart.filter(i => i.id !== id);
        saveCart();
        renderCart();
    };

    // Render cart items & totals
    function renderCart() {
        const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

        // Update badges
        if (cartCount) cartCount.textContent = totalItemsCount;
        if (floatingCartCount) floatingCartCount.textContent = totalItemsCount;
        if (cartItemsCountText) cartItemsCountText.textContent = `${totalItemsCount} маҳсулот`;
        if (cartSummaryTotalQty) cartSummaryTotalQty.textContent = `${totalItemsCount} дона`;
        if (cartGrandTotal) cartGrandTotal.textContent = `${totalPrice} TJS`;

        if (cartSubmitOrderBtn) {
            cartSubmitOrderBtn.querySelector('span').textContent = 
                totalPrice > 0 ? `Тасдиқ ва Ирсоли Фармоиш (${totalPrice} TJS)` : `Сабад холӣ аст`;
            cartSubmitOrderBtn.disabled = (totalItemsCount === 0);
        }

        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty-message">
                    <div class="cart-empty-icon">🛒</div>
                    <h4>Сабади шумо холӣ аст</h4>
                    <p>Ароматизаторҳои афсонавии Eikosha-ро аз каталог интихоб ва илова намоед!</p>
                    <a href="#catalog" class="primary-btn" onclick="document.getElementById('cartDrawerOverlay').classList.remove('active')">
                        Ба каталог гузаштан
                    </a>
                </div>
            `;
            return;
        }

        // Render rows
        let html = '';
        cart.forEach(item => {
            const itemTotal = item.price * item.qty;
            html += `
                <div class="cart-item-row">
                    <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price-unit">${item.price} TJS × ${item.qty} = <b>${itemTotal} TJS</b></div>
                        <div class="cart-item-controls">
                            <button type="button" class="qty-btn" onclick="updateCartItemQty('${item.id}', -1)" title="Кам кардан">-</button>
                            <span class="qty-val">${item.qty}</span>
                            <button type="button" class="qty-btn" onclick="updateCartItemQty('${item.id}', 1)" title="Зиёд кардан">+</button>
                        </div>
                    </div>
                    <button type="button" class="cart-item-del-btn" onclick="removeCartItem('${item.id}')" title="Нобуд кардан">🗑️</button>
                </div>
            `;
        });
        cartItemsContainer.innerHTML = html;
    }

    // Attach click events to "Add to Cart" buttons
    document.querySelectorAll('.add-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const product = btn.getAttribute('data-product');
            const price = btn.getAttribute('data-price');
            const img = btn.getAttribute('data-img');
            addToCart(product, price, img);
        });
    });

    // Cart Checkout Form Submission
    if (cartCheckoutForm) {
        cartCheckoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (cart.length === 0) {
                alert('Сабади шумо холӣ аст. Лутфан, маҳсулот интихоб кунед.');
                return;
            }

            const name = document.getElementById('cartCustomerName').value.trim();
            const phone = document.getElementById('cartCustomerPhone').value.trim();
            const address = document.getElementById('cartCustomerAddress').value.trim() || 'Душанбе (ройгон)';

            let productListText = '';
            let totalSum = 0;

            cart.forEach((item, index) => {
                const subtotal = item.price * item.qty;
                totalSum += subtotal;
                productListText += `${index + 1}. <b>${item.name}</b> — ${item.qty} дона × ${item.price} TJS = <b>${subtotal} TJS</b>\n`;
            });

            const message = `🛒 <b>ФАРМОИШИ НАВ АЗ САБАД (EIKOSHA)!</b>\n\n` +
                            `📦 <b>Рӯйхати маҳсулот:</b>\n${productListText}\n` +
                            `🚚 <b>Интиқол:</b> РОЙГОН (ш. Душанбе)\n` +
                            `💰 <b>МАБЛАҒИ УМУМӢ:</b> <b>${totalSum} TJS</b>\n\n` +
                            `👤 <b>Мизоҷ:</b> ${name}\n` +
                            `📞 <b>Телефон:</b> ${phone}\n` +
                            `📍 <b>Суроға:</b> ${address}\n` +
                            `⏰ <b>Вақт:</b> ${new Date().toLocaleString('ru-RU')}`;

            const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

            try {
                cartOrderStatus.textContent = 'Фармоиш ирсол шуда истодааст...';
                cartOrderStatus.style.color = 'var(--text-secondary)';

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_CHAT_ID,
                        text: message,
                        parse_mode: 'HTML'
                    })
                });

                if (response.ok) {
                    cartOrderStatus.textContent = '✅ Ташаккур! Фармоиши шумо қабул шуд. Мо ба зудӣ тамос мегирем!';
                    cartOrderStatus.style.color = '#10b981';
                    cartCheckoutForm.reset();
                    cart = [];
                    saveCart();
                    renderCart();
                    setTimeout(() => {
                        closeCart();
                        cartOrderStatus.textContent = '';
                    }, 4000);
                } else {
                    throw new Error('Хатогӣ ҳангоми ирсол');
                }
            } catch (err) {
                console.error('Cart submit error:', err);
                cartOrderStatus.textContent = '⚠️ Хатогӣ рӯй дод. Лутфан, ба рақами +992 00 505 4693 занг занед.';
                cartOrderStatus.style.color = '#ef4444';
            }
        });
    }

    // Initial render of cart
    renderCart();

    // ==========================================
    // 6. SINGLE PRODUCT MODAL (QUICK BUY) LOGIC
    // ==========================================
    const modal = document.getElementById("orderModal");
    const closeBtn = document.querySelector(".close");
    const orderForm = document.getElementById("orderForm");
    const productNameInput = document.getElementById("productName");
    const productPriceValInput = document.getElementById("productPriceVal");
    const modalProductTitle = document.getElementById("modalProductTitle");
    const modalProductPrice = document.getElementById("modalProductPrice");
    const modalProductImg = document.getElementById("modalProductImg");
    const orderStatus = document.getElementById("orderStatus");

    function openModalWithProduct(name, price, img) {
        productNameInput.value = name || 'Eikosha Air Spencer';
        productPriceValInput.value = price || '169 TJS';
        modalProductTitle.textContent = name || 'Eikosha Air Spencer';
        modalProductPrice.textContent = price || '169 TJS';
        if (img) {
            modalProductImg.src = img;
        } else {
            modalProductImg.src = 'images/marine-squash.jpg';
        }

        modal.classList.add('active');
        orderStatus.textContent = '';
        orderStatus.style.color = '';
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    // Attach click events to quick buy buttons
    document.querySelectorAll('.buy-btn, .order-nav-btn, .cta-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const product = btn.getAttribute('data-product') || 'Eikosha Air Spencer Машварат';
            const price = btn.getAttribute('data-price') || '169 TJS';
            const img = btn.getAttribute('data-img') || 'images/marine-squash.jpg';
            openModalWithProduct(product, price, img);
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('userName').value.trim();
            const phone = document.getElementById('userPhone').value.trim();
            const city = document.getElementById('userCity').value.trim() || 'Душанбе (ройгон)';
            const product = productNameInput.value;
            const price = productPriceValInput.value;

            const message = `🇯🇵 <b>ФАРМОИШИ НАВИ EIKOSHA (ХАРИДИ ФАВРӢ)!</b>\n\n` +
                            `📦 <b>Маҳсулот:</b> ${product}\n` +
                            `💰 <b>Нарх:</b> ${price}\n` +
                            `🚚 <b>Интиқол:</b> РОЙГОН (ш. Душанбе)\n` +
                            `👤 <b>Мизоҷ:</b> ${name}\n` +
                            `📞 <b>Телефон:</b> ${phone}\n` +
                            `📍 <b>Шаҳр/Суроға:</b> ${city}\n` +
                            `⏰ <b>Вақт:</b> ${new Date().toLocaleString('ru-RU')}`;

            const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

            try {
                orderStatus.textContent = 'Ирсол шуда истодааст... Лутфан каме сабр кунед.';
                orderStatus.style.color = 'var(--text-secondary)';

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_CHAT_ID,
                        text: message,
                        parse_mode: 'HTML'
                    })
                });

                if (response.ok) {
                    orderStatus.textContent = '✅ Ташаккур! Фармоиши шумо қабул шуд. Мо ба зудӣ ба шумо занг мезанем!';
                    orderStatus.style.color = '#10b981';
                    orderForm.reset();
                    setTimeout(() => {
                        closeModal();
                    }, 3500);
                } else {
                    throw new Error('Хатогӣ ҳангоми ирсоли дархост');
                }
            } catch (error) {
                console.error('Telegram order error:', error);
                orderStatus.textContent = '⚠️ Хатогӣ рӯй дод. Лутфан, ба рақами +992 00 505 4693 занг занед ё дар WhatsApp нависед.';
                orderStatus.style.color = '#ef4444';
            }
        });
    }

    // ==========================================
    // 7. SCROLL ANIMATIONS
    // ==========================================
    const animatedElements = document.querySelectorAll('.product-card, .feature-box, .step-card, .review-card');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(25px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        observer.observe(el);
    });
});
