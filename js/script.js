
document.addEventListener('DOMContentLoaded', function() {
            const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
            const nav = document.querySelector('nav');
            
            mobileMenuBtn.addEventListener('click', function() {
                nav.classList.toggle('active');
                this.innerHTML = nav.classList.contains('active') ? 
                    '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
            });
            
            document.querySelectorAll('nav a').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    if (nav.classList.contains('active')) {
                        nav.classList.remove('active');
                        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                    
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                });
            });
            
            let cart = [];
            const cartCountElement = document.getElementById('cart-count');
            const cartItemsContainer = document.getElementById('cart-items');
            const cartTotalElement = document.getElementById('cart-total');
            const cartSection = document.querySelector('.cart-section');
            const cartIcon = document.getElementById('cart-icon');
            
            if (localStorage.getItem('cart')) {
                cart = JSON.parse(localStorage.getItem('cart'));
                updateCartDisplay();
            }
            
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    const productName = this.getAttribute('data-name');
                    const productPrice = parseInt(this.getAttribute('data-price'));
                    
                    const existingItem = cart.find(item => item.id === productId);
                    
                    if (existingItem) {
                        existingItem.quantity++;
                    } else {
                        cart.push({
                            id: productId,
                            name: productName,
                            price: productPrice,
                            quantity: 1,
                            image: this.closest('.product-card').querySelector('.product-image').src
                        });
                    }
                    
                    localStorage.setItem('cart', JSON.stringify(cart));                    
                    updateCartDisplay();                    
                    showAlert(`${productName} telah ditambahkan ke keranjang!`);                    
                    cartSection.style.display = 'block';                    
                    window.scrollTo({
                        top: cartSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                });
            });
            
            cartIcon.addEventListener('click', function(e) {
                e.preventDefault();
                cartSection.style.display = cartSection.style.display === 'block' ? 'none' : 'block';
                
                if (cartSection.style.display === 'block') {
                    window.scrollTo({
                        top: cartSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
            
            // Update cart display
            function updateCartDisplay() {
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                cartCountElement.textContent = totalItems;
                
                if (cart.length === 0) {
                    cartItemsContainer.innerHTML = `
                        <div class="empty-cart">
                            <i class="fas fa-shopping-cart" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                            <p>Keranjang belanja Anda masih kosong</p>
                        </div>
                    `;
                } else {
                    cartItemsContainer.innerHTML = '';
                    
                    cart.forEach(item => {
                        const cartItemElement = document.createElement('div');
                        cartItemElement.className = 'cart-item';
                        cartItemElement.innerHTML = `
                            <div class="cart-item-info">
                                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                                <div>
                                    <div class="cart-item-name">${item.name}</div>
                                    <div class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</div>
                                </div>
                            </div>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                                <span>${item.quantity}</span>
                                <button class="quantity-btn increase" data-id="${item.id}">+</button>
                            </div>
                        `;
                        cartItemsContainer.appendChild(cartItemElement);
                    });
                    
                    document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const itemId = this.getAttribute('data-id');
                            updateQuantity(itemId, -1);
                        });
                    });
                    
                    document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const itemId = this.getAttribute('data-id');
                            updateQuantity(itemId, 1);
                        });
                    });
                }
                
                const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                cartTotalElement.textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;
            }
            
            function updateQuantity(itemId, change) {
                const itemIndex = cart.findIndex(item => item.id === itemId);
                
                if (itemIndex !== -1) {
                    cart[itemIndex].quantity += change;
                    
                    if (cart[itemIndex].quantity <= 0) {
                        cart.splice(itemIndex, 1);
                        showAlert('Item telah dihapus dari keranjang');
                    }
                    
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartDisplay();
                }
            }
            
            // tobol checkout
            document.getElementById('checkout-form').addEventListener('submit', function(e) {
                e.preventDefault();
                
                if (cart.length === 0) {
                    showAlert('Keranjang belanja Anda masih kosong', 'error');
                    return;
                }
                
                const formData = {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    address: document.getElementById('address').value,
                    city: document.getElementById('city').value,
                    province: document.getElementById('province').value,
                    postalCode: document.getElementById('postal-code').value,
                    notes: document.getElementById('notes').value,
                    paymentMethod: document.getElementById('payment-method').value
                };
                
                if (!formData.name || !formData.email || !formData.phone || !formData.address || 
                    !formData.city || !formData.province || !formData.postalCode || !formData.paymentMethod) {
                    showAlert('Harap lengkapi semua field yang wajib diisi', 'error');
                    return;
                }
                
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.email)) {
                    showAlert('Format email tidak valid', 'error');
                    return;
                }
                
                if (formData.phone.length < 10) {
                    showAlert('Nomor telepon harus minimal 10 digit', 'error');
                    return;
                }
                
                const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                
                console.log('Checkout data:', {
                    customerInfo: formData,
                    items: cart,
                    total: totalPrice
                });
                
                // pesan notif pesanan berhasil
                showAlert(
                    `Pesanan atas nama ${formData.name} sebesar Rp ${totalPrice.toLocaleString('id-ID')} ` +
                    `berhasil diproses! Kami akan mengirimkan konfirmasi ke ${formData.email}`,
                    'success'
                );
                
                cart = [];
                localStorage.removeItem('cart');
                updateCartDisplay();
                
                this.reset();
                
                cartSection.style.display = 'none';
            });
            
            function getPaymentMethodName(method) {
                switch(method) {
                    case 'credit-card': return 'Kartu Kredit';
                    case 'bank-transfer': return 'Transfer Bank';
                    case 'e-wallet': return 'E-Wallet';
                    case 'cash-on-delivery': return 'Bayar di Tempat';
                    default: return method;
                }
            }
            
            function showAlert(message, type = 'success') {
                const alertDiv = document.createElement('div');
                alertDiv.className = `alert ${type}`;
                alertDiv.textContent = message;
                
                alertDiv.style.position = 'fixed';
                alertDiv.style.bottom = '20px';
                alertDiv.style.right = '20px';
                alertDiv.style.padding = '15px 25px';
                alertDiv.style.backgroundColor = type === 'success' ? '#4CAF50' : '#F44336';
                alertDiv.style.color = 'white';
                alertDiv.style.borderRadius = '5px';
                alertDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                alertDiv.style.zIndex = '10000';
                alertDiv.style.animation = 'fadeInUp 0.5s ease';
                
                document.body.appendChild(alertDiv);
                
                setTimeout(() => {
                    alertDiv.style.animation = 'fadeOut 0.5s ease';
                    setTimeout(() => {
                        document.body.removeChild(alertDiv);
                    }, 500);
                }, 3000);
            }
        });