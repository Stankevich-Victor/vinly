// js/cart.js

let cartOverlay; // Глобальна змінна для посилання на оверлей
let cartItems = []; // За замовчуванням кошик порожній

// Ця функція виконується, коли DOM повністю завантажений
document.addEventListener('DOMContentLoaded', () => {
    // 1. Створюємо елемент оверлею (напівпрозорий фон)
    cartOverlay = document.createElement('div');
    cartOverlay.classList.add('cart-overlay');
    document.body.appendChild(cartOverlay); // Додаємо його в кінець <body>

    // 2. Додаємо обробник кліку на оверлей для закриття модального вікна
    cartOverlay.addEventListener('click', (event) => {
        // Якщо клік був саме на оверлеї, а не на вмісті модального вікна
        if (event.target === cartOverlay) {
            closeCartModal();
        }
    });

    // Налаштовуємо кнопку "Додати до кошика" на сторінці товару
    const addToCartButton = document.querySelector('.add-to-cart');
    if (addToCartButton) {
        addToCartButton.addEventListener('click', () => {
            // Отримуємо елемент product-details, який містить data-атрибути
            const productDetails = document.querySelector('.product-details');
            if (!productDetails) {
                console.error('Елемент .product-details не знайдено на сторінці.');
                return;
            }

            // Отримуємо дані про товар з data-атрибутів
            const productId = productDetails.dataset.productId;
            const productName = productDetails.dataset.productName;
            const productPrice = parseFloat(productDetails.dataset.productPrice); // Перетворюємо в число
            const productImage = productDetails.dataset.productImage;

            const quantityInput = document.getElementById('quantity');
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

            if (!productId || !productName || isNaN(productPrice) || !productImage) {
                console.error('Не вдалося отримати повну інформацію про товар з data-атрибутів.');
                return;
            }

            // Перевіряємо, чи вже є товар у кошику, щоб оновити кількість, а не додавати знову
            const existingItemIndex = cartItems.findIndex(item => item.id === productId);

            if (existingItemIndex > -1) {
                cartItems[existingItemIndex].quantity += quantity;
            } else {
                cartItems.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: quantity
                });
            }

            alert(`Додано до кошика: ${quantity} x ${productName}!`);
            console.log("Поточний кошик:", cartItems);
            openCartModal(); // Відкриваємо кошик після додавання
        });
    }

    // Додаємо обробник для іконки кошика в хедері (працює на всіх сторінках, де підключено cart.js)
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', openCartModal);
    }
});

// Функція для відкриття модального вікна кошика
function openCartModal() {
    let cartContentHtml = '';

    if (cartItems.length === 0) {
        // Кошик порожній, використовуємо захардкоджений HTML для порожнього кошика
        cartContentHtml = `
            <div class="cart-header">
                <h2>Кошик</h2>
                <button class="close-button" onclick="closeCartModal()">×</button>
            </div>
            <div class="empty-cart-message">
                <p>Ваш кошик порожній 😔</p>
                <p>Додайте товари, щоб почати покупки!</p>
                <button class="continue-shopping" onclick="closeCartModal()">Продовжити покупки</button>
            </div>
            <section class="also-buy-section">
                <h2>Рекомендуємо до покупки</h2>
                <div class="also-buy-carousel">
                    <button class="carousel-arrow left-arrow">‹</button>
                    <div class="also-buy-items">
                        <div class="also-buy-item">
                            <div class="also-buy-img-wrapper">
                                <img src="image/mousepad_game.jpg" alt="Ігровий килимок">
                                <span class="discount-badge-small">-20%</span>
                            </div>
                            <p class="also-buy-name">Ігровий килимок для миші HyperX Fury S Speed Edition XL (900x420x4мм)</p>
                            <span class="old-price-small">899 ₴</span>
                            <span class="current-price-small">719 ₴</span>
                        </div>
                        <span class="plus-sign">+</span>
                        <div class="also-buy-item">
                            <div class="also-buy-img-wrapper">
                                <img src="image/qk65v2.jpg" alt="Набір свічів">
                            </div>
                            <p class="also-buy-name">Набір свічів Gateron Yellow Pro 2.0 (100 шт.)</p>
                            <span class="current-price-small">1200 ₴</span>
                        </div>
                        <span class="plus-sign">+</span>
                        <div class="also-buy-item">
                            <div class="also-buy-img-wrapper">
                                <img src="image/power_adapter.jpg" alt="Зарядний пристрій">
                                <span class="discount-badge-small">-15%</span>
                            </div>
                            <p class="also-buy-name">Зарядний пристрій ArmorStandart AMHJ83 20 W USB-C Power Adapter (ARM58528)</p>
                            <span class="old-price-small">269 ₴</span>
                            <span class="current-price-small">229 ₴</span>
                        </div>
                    </div>
                    <button class="carousel-arrow right-arrow">›</button>
                </div>
                <div class="carousel-dots">
                    <span class="dot active"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </div>
            </section>
            <button class="continue-shopping" onclick="closeCartModal()">Продовжити покупки</button>
        `;
        const modalContent = document.createElement('div');
        modalContent.classList.add('cart-modal');
        modalContent.innerHTML = cartContentHtml;
        cartOverlay.innerHTML = '';
        cartOverlay.appendChild(modalContent);

        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        setupCarousel(); // Налаштовуємо карусель навіть для порожнього кошика
    } else {
        // Кошик НЕ порожній, завантажуємо вміст з cart-modal.html
        fetch('cart-modal.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load cart content');
                }
                return response.text();
            })
            .then(html => {
                const modalContent = document.createElement('div');
                modalContent.classList.add('cart-modal');
                modalContent.innerHTML = html;

                const itemContainer = modalContent.querySelector('.cart-items-container');
                if (itemContainer) { // Перевірка, чи знайдено контейнер
                    itemContainer.innerHTML = ''; // Очищаємо вміст, щоб додати з cartItems
                } else {
                    console.error('Елемент .cart-items-container не знайдено в cart-modal.html');
                    return; // Виходимо, якщо контейнер не знайдено
                }

                let totalCartPrice = 0;

                cartItems.forEach(item => {
                    const itemHtml = `
                        <div class="cart-item" data-item-id="${item.id}">
                            <div class="item-img-wrapper">
                                <img src="${item.image}" alt="${item.name}" class="item-image">
                            </div>
                            <div class="item-details">
                                <p class="item-name">${item.name}</p>
                                <p class="item-vendor">Продавець: ВІНЛІ</p>
                            </div>
                            <div class="item-quantity-controls">
                                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                                <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-id="${item.id}">
                                <button class="quantity-btn plus" data-id="${item.id}">+</button>
                            </div>
                            <div class="item-price-info">
                                <span class="current-price">${(item.price * item.quantity).toLocaleString('uk-UA')} ₴</span>
                                <button class="more-options" data-id="${item.id}">⋮</button>
                            </div>
                        </div>
                    `;
                    itemContainer.innerHTML += itemHtml;
                    totalCartPrice += (item.price * item.quantity);
                });

                // Оновлюємо загальну ціну
                const totalPriceElement = modalContent.querySelector('.total-price-text');
                if (totalPriceElement) {
                    totalPriceElement.textContent = `${totalCartPrice.toLocaleString('uk-UA')} ₴`;
                }

                cartOverlay.innerHTML = '';
                cartOverlay.appendChild(modalContent);

                cartOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';

                setupQuantityControls();
                setupCarousel();
                setupRemoveItemButtons(); // Нова функція для кнопок видалення
            })
            .catch(error => console.error("Помилка завантаження кошика:", error));
    }
}


// Функція для закриття модального вікна кошика
function closeCartModal() {
    if (cartOverlay) {
        cartOverlay.classList.remove('active'); // Приховуємо оверлей
        document.body.style.overflow = ''; // Дозволяємо прокрутку основного вмісту
        setTimeout(() => {
            if (cartOverlay) {
                cartOverlay.innerHTML = ''; // Очищаємо вміст для наступного відкриття
            }
        }, 300); // 300ms відповідає тривалості transition в CSS
    }
}

// Функція для налаштування кнопок зміни кількості
function setupQuantityControls() {
    const quantityInputs = document.querySelectorAll('.cart-modal .quantity-input');
    quantityInputs.forEach(input => {
        const itemId = input.dataset.id;
        const minusBtn = input.previousElementSibling; // Button '-'
        const plusBtn = input.nextElementSibling;     // Button '+'

        if (minusBtn && plusBtn) {
            minusBtn.onclick = () => {
                let currentValue = parseInt(input.value);
                if (currentValue > 1) {
                    input.value = currentValue - 1;
                    updateCartItemQuantity(itemId, -1);
                } else if (currentValue === 1) {
                    // Якщо кількість стає 1 і натискаємо '-', запитуємо видалення
                    if (confirm('Ви дійсно хочете видалити цей товар з кошика?')) {
                        updateCartItemQuantity(itemId, -1, true); // Передаємо true, щоб видалити товар
                    }
                }
            };

            plusBtn.onclick = () => {
                let currentValue = parseInt(input.value);
                input.value = currentValue + 1;
                updateCartItemQuantity(itemId, 1);
            };

            // Додаємо обробник для ручного введення
            input.onchange = () => {
                let newValue = parseInt(input.value);
                if (isNaN(newValue) || newValue < 1) {
                    input.value = 1;
                    newValue = 1;
                }
                const currentStoredQuantity = cartItems.find(item => item.id === itemId)?.quantity || 0;
                const change = newValue - currentStoredQuantity;
                if (change !== 0) { // Оновлюємо лише якщо є зміна
                    updateCartItemQuantity(itemId, change, true); // Передаємо true, бо це абсолютне значення
                }
            };
        }
    });
}

// Функція для оновлення кількості товару в cartItems
function updateCartItemQuantity(itemId, change, isAbsolute = false) {
    const itemIndex = cartItems.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        if (isAbsolute) {
            cartItems[itemIndex].quantity = change;
        } else {
            cartItems[itemIndex].quantity += change;
        }

        // Якщо кількість стала 0 або менше, видаляємо товар з кошика
        if (cartItems[itemIndex].quantity <= 0) {
            cartItems.splice(itemIndex, 1);
        }
        // Після будь-якої зміни кількості, заново відкриваємо кошик, щоб оновити інтерфейс
        openCartModal();
    }
}

// Нова функція для обробки кнопки "Більше опцій" (видалення товару)
function setupRemoveItemButtons() {
    const moreOptionsButtons = document.querySelectorAll('.cart-item .more-options');
    moreOptionsButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const itemId = event.target.dataset.id;
            if (confirm('Ви впевнені, що хочете видалити цей товар з кошика?')) {
                removeItemFromCart(itemId);
            }
        });
    });
}

// Нова функція для видалення товару з кошика
function removeItemFromCart(itemId) {
    cartItems = cartItems.filter(item => item.id !== itemId);
    openCartModal(); // Оновлюємо відображення кошика
}


// Функція для налаштування каруселі "Ще беруть до товару"
function setupCarousel() {
    const carousel = document.querySelector('.cart-modal .also-buy-items');
    const leftArrow = document.querySelector('.cart-modal .carousel-arrow.left-arrow');
    const rightArrow = document.querySelector('.cart-modal .carousel-arrow.right-arrow');
    const dotsContainer = document.querySelector('.cart-modal .carousel-dots');

    if (!carousel || !leftArrow || !rightArrow || !dotsContainer) {
        return; // Виходимо, якщо елементи не знайдені
    }

    const scrollAmount = 200; // На скільки пікселів прокручувати

    leftArrow.addEventListener('click', () => {
        carousel.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });

    rightArrow.addEventListener('click', () => {
        carousel.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    // Створення точок (індикаторів) каруселі
    // Зауважте: якщо у вас є плюси між елементами, їх потрібно враховувати при розрахунку слайдів
    const itemsInCarousel = Array.from(carousel.children).filter(el => el.classList.contains('also-buy-item'));
    const totalSlides = itemsInCarousel.length;
    dotsContainer.innerHTML = ''; // Очищаємо існуючі точки

    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (i === 0) {
            dot.classList.add('active');
        }
        dot.addEventListener('click', () => {
            // Оскільки у нас є "+" знаки, краще орієнтуватися на зміщення елементів
            // Кожен "also-buy-item" має ширину + gap.
            const item = itemsInCarousel[i];
            if (item) {
                const itemOffsetLeft = item.offsetLeft;
                carousel.scrollTo({
                    left: itemOffsetLeft - carousel.offsetLeft, // Виправлений розрахунок
                    behavior: 'smooth'
                });
                updateDots(i);
            }
        });
        dotsContainer.appendChild(dot);
    }

    // Функція для оновлення активної точки
    function updateDots(activeDotIndex = -1) {
        const dots = dotsContainer.querySelectorAll('.dot');
        let currentIndex = activeDotIndex;

        if (activeDotIndex === -1) { // Якщо не передано конкретний індекс (наприклад, при скролі)
            if (itemsInCarousel.length > 0) {
                const firstItem = itemsInCarousel[0];
                const itemWidth = firstItem.offsetWidth;
                // Припустимо, що gap = 20px, як у вашому CSS для .product-details .gap
                // Зауважте: також є span.plus-sign, що додає ширину
                // Найкраще було б заміряти scrollWidth та clientWidth та розраховувати
                // Або простіше: орієнтуватися на центральний елемент у viewport
                const centerScroll = carousel.scrollLeft + (carousel.clientWidth / 2);
                for (let i = 0; i < itemsInCarousel.length; i++) {
                    const item = itemsInCarousel[i];
                    if (centerScroll >= item.offsetLeft && centerScroll < (item.offsetLeft + item.offsetWidth + 20)) { // 20px - приблизний gap + plus-sign
                        currentIndex = i;
                        break;
                    }
                }
            }
        }

        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    carousel.addEventListener('scroll', () => {
        // Затримка для оновлення точок, щоб уникнути частого спрацьовування під час скролу
        clearTimeout(carousel.scrollTimeout);
        carousel.scrollTimeout = setTimeout(updateDots, 100);
    });

    updateDots(); // Викликаємо при першому завантаженні для встановлення активної точки
}