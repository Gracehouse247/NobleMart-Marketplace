document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || user.role !== 'vendor') {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('userInitials').textContent = user.full_name ? user.full_name.match(/\b(\w)/g).join('').substring(0, 2).toUpperCase() : 'V';

    const viewContainer = document.getElementById('viewContainer');
    const sidebar = document.getElementById('sidebar');

    try {
        const response = await fetch('https://api.noblemart.com.ng/vendors/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.clear();
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Failed to load dashboard data');
        }

        const data = await response.json();

        if (data.status === 'pending') {
            renderPendingState();
        } else if (data.status === 'rejected') {
            renderRejectedState(data.verification_notes);
        } else if (data.status === 'active') {
            renderDashboard(data);
        } else {
            renderPendingState();
        }

    } catch (error) {
        console.error('Dashboard Error:', error);
        viewContainer.innerHTML = `
            <div class="pending-state" style="border-color: #fca5a5;">
                <span class="material-symbols-outlined" style="font-size: 3rem; color: #ef4444;">error</span>
                <h3 style="margin: 1rem 0; font-size: 1.5rem;">Connection Error</h3>
                <p style="color: var(--slate-500);">Could not connect to NobleMart services. Please try again.</p>
                <button onclick="window.location.reload()" class="btn-primary" style="margin-top: 1.5rem; width: auto; padding: 0 2rem;">Retry</button>
            </div>
        `;
    }

    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'login.html';
    });

    // View Switching
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            const view = item.getAttribute('data-view');

            // Update Active State
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Update Page Title
            document.getElementById('pageTitle').textContent = view.charAt(0).toUpperCase() + view.slice(1);

            if (view === 'products') {
                await renderProducts();
            } else if (view === 'orders') {
                await renderOrders();
            } else if (view === 'properties') {
                await renderProperties();
            } else if (view === 'earnings') {
                await renderEarnings();
            } else if (view === 'overview') {
                // Re-fetch overview stats
                const response = await fetch('https://api.noblemart.com.ng/vendors/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                renderDashboard(data);
            }
        });
    });

    function renderPendingState() {
        sidebar.style.pointerEvents = 'none';
        sidebar.style.opacity = '0.5';

        viewContainer.innerHTML = `
            <div class="pending-state">
                <span class="material-symbols-outlined" style="font-size: 4rem; color: #3b82f6;">hourglass_top</span>
                <h2 style="margin: 1.5rem 0 1rem; font-size: 1.75rem;">Application Under Review</h2>
                <p style="color: var(--slate-600); line-height: 1.6; max-width: 400px; margin: 0 auto;">
                    Thank you for applying to NobleMart. Our team is currently reviewing your KYC documents and business details.
                </p>
                <div style="margin-top: 2rem; padding: 1rem; background: var(--slate-50); border-radius: 0.5rem; border: 1px dashed var(--slate-300);">
                    <p style="font-size: 0.875rem; color: var(--slate-500); margin: 0;">Expected Review Time: <strong>24 Hours</strong></p>
                </div>
            </div>
        `;
    }

    function renderRejectedState(notes) {
        sidebar.style.pointerEvents = 'none';
        sidebar.style.opacity = '0.5';

        viewContainer.innerHTML = `
            <div class="pending-state" style="border-color: #fca5a5;">
                <span class="material-symbols-outlined" style="font-size: 4rem; color: #ef4444;">block</span>
                <h2 style="margin: 1.5rem 0 1rem; font-size: 1.75rem;">Action Required</h2>
                <p style="color: var(--slate-600);">Your application needs some corrections before we can proceed.</p>
                
                <div style="margin: 2rem 0; text-align: left; background: #fef2f2; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #fecaca;">
                    <h4 style="color: #991b1b; margin-bottom: 0.5rem;">Admin Notes:</h4>
                    <p style="color: #b91c1c;">${notes || 'Please verify your submitted documents and try again.'}</p>
                </div>

                <button class="btn-secondary" style="width: auto; padding: 0 2rem;">Update Application</button>
            </div>
        `;
    }

    function renderDashboard(stats) {
        viewContainer.innerHTML = `
            <div class="stat-grid">
                <div class="stat-card">
                    <div class="stat-label">Total Revenue</div>
                    <div class="stat-value">₦${(stats.revenue || 0).toLocaleString()}</div>
                    <div style="font-size: 0.8rem; color: #10b981;">+0% this month</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Active Orders</div>
                    <div class="stat-value">${stats.pending_orders || 0}</div>
                    <div style="font-size: 0.8rem; color: var(--slate-400);">Processing</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Total Products</div>
                    <div class="stat-value">${stats.total_products || 0}</div>
                    <div style="font-size: 0.8rem; color: var(--primary);">In Stock</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Rating</div>
                    <div class="stat-value">${stats.rating || 'N/A'}</div>
                    <div style="font-size: 0.8rem; color: #f59e0b;">★★★★★</div>
                </div>
            </div>

            <div class="stat-card" style="min-height: 400px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                <img src="https://illustrations.popsy.co/gray/success.svg" style="height: 150px; opacity: 0.5; margin-bottom: 1.5rem;">
                <h3 style="color: var(--slate-700);">You're all set!</h3>
                <p style="color: var(--slate-500);">Start adding products to your store to see analytics here.</p>
                <button class="btn-primary" style="margin-top: 1.5rem; width: auto; padding: 0 2rem;" onclick="document.querySelector('[data-view=products]').click()">Build Your Inventory</button>
            </div>
        `;
    }

    async function renderProducts() {
        viewContainer.innerHTML = `<div class="pending-state"><p>Loading products...</p></div>`;

        try {
            const res = await fetch('https://api.noblemart.com.ng/products/vendor/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const products = await res.json();

            viewContainer.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h3>My Products (${products.length})</h3>
                    <button class="btn-primary" style="width: auto; padding: 0.75rem 1.5rem;" onclick="showAddProductModal()">+ Add New Product</button>
                </div>

                <div class="products-table-wrapper" style="background: white; border-radius: 1rem; border: 1px solid var(--slate-200); overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background: var(--slate-50); border-bottom: 1px solid var(--slate-200);">
                            <tr>
                                <th style="padding: 1rem;">Product</th>
                                <th style="padding: 1rem;">Price</th>
                                <th style="padding: 1rem;">Stock</th>
                                <th style="padding: 1rem;">Status</th>
                                <th style="padding: 1rem;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.length === 0 ? '<tr><td colspan="5" style="padding: 3rem; text-align: center; color: var(--slate-400);">No products found. Click "Add New Product" to start selling.</td></tr>' :
                    products.map(p => `
                                <tr style="border-bottom: 1px solid var(--slate-100);">
                                    <td style="padding: 1rem; display: flex; align-items: center; gap: 1rem;">
                                        <img src="${p.images ? JSON.parse(p.images)[0] : 'https://placehold.co/40?text=P'}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                                        <div>
                                            <div style="font-weight: 600;">${p.name}</div>
                                            <div style="font-size: 0.75rem; color: var(--slate-400);">${p.category_name || 'General'}</div>
                                        </div>
                                    </td>
                                    <td style="padding: 1rem; font-weight: 600;">₦${parseFloat(p.price).toLocaleString()}</td>
                                    <td style="padding: 1rem;">${p.stock_quantity}</td>
                                    <td style="padding: 1rem;">
                                        <span style="padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.75rem; font-weight: 600; 
                                            ${p.status === 'active' ? 'background: #dcfce7; color: #166534;' : 'background: #f1f5f9; color: #475569;'}">
                                            ${p.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style="padding: 1rem;">
                                        <button class="material-symbols-outlined" style="color: var(--slate-400); cursor: pointer; border: none; background: none;">edit</button>
                                        <button class="material-symbols-outlined" style="color: #ef4444; cursor: pointer; border: none; background: none;" onclick="deleteProduct(${p.id})">delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (err) {
            console.error('Error loading products:', err);
        }
    }

    // Modal Handling
    window.showAddProductModal = async () => {
        // Fetch categories first
        const catRes = await fetch('https://api.noblemart.com.ng/categories');
        const categories = await catRes.json();

        const modalHtml = `
            <div id="productModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;">
                <div style="background: white; border-radius: 1.5rem; width: 100%; max-width: 600px; padding: 2.5rem; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h2 style="font-size: 1.5rem;">Add New Product</h2>
                        <span class="material-symbols-outlined" style="cursor: pointer; color: var(--slate-400);" onclick="document.getElementById('productModal').remove()">close</span>
                    </div>

                    <form id="addProductForm">
                        <div class="field-group">
                            <label class="field-label">Product Name</label>
                            <input type="text" class="premium-input" id="pName" placeholder="e.g. Premium Leather Sneakers" required>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="field-group">
                                <label class="field-label">Price (₦)</label>
                                <input type="number" class="premium-input" id="pPrice" placeholder="0.00" required>
                            </div>
                            <div class="field-group">
                                <label class="field-label">Stock Quantity</label>
                                <input type="number" class="premium-input" id="pStock" placeholder="0" required>
                            </div>
                        </div>

                        <div class="field-group">
                            <label class="field-label">Category</label>
                            <select class="premium-input" id="pCategory" required>
                                <option value="" disabled selected>Select Category</option>
                                ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                            </select>
                        </div>

                        <div class="field-group">
                            <label class="field-label">Description</label>
                            <textarea class="premium-input premium-textarea" id="pDesc" style="min-height: 100px;" required></textarea>
                        </div>

                        <div class="field-group">
                            <label class="field-label">Product Images (Max 5)</label>
                            <input type="file" id="pImages" multiple accept="image/*" class="premium-input">
                        </div>

                        <button type="submit" class="btn-primary" style="margin-top: 1rem;">Create Product</button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('addProductForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = e.target.querySelector('button');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating...';

            const formData = new FormData();
            formData.append('name', document.getElementById('pName').value);
            formData.append('price', document.getElementById('pPrice').value);
            formData.append('stock_quantity', document.getElementById('pStock').value);
            formData.append('category_id', document.getElementById('pCategory').value);
            formData.append('description', document.getElementById('pDesc').value);

            const imageFiles = document.getElementById('pImages').files;
            for (let i = 0; i < imageFiles.length; i++) {
                formData.append('images', imageFiles[i]);
            }

            try {
                const res = await fetch('https://api.noblemart.com.ng/products/vendor/add', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (res.ok) {
                    alert('Product added successfully!');
                    document.getElementById('productModal').remove();
                    renderProducts();
                } else {
                    const error = await res.json();
                    alert(error.message || 'Failed to add product');
                }
            } catch (err) {
                alert('Connection error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Product';
            }
        });
    }

    window.deleteProduct = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await fetch(`https://api.noblemart.com.ng/products/vendor/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                renderProducts();
            } else {
                alert('Failed to delete product');
            }
        } catch (err) {
            alert('Connection error');
        }
    }

    async function renderOrders() {
        viewContainer.innerHTML = `<div class="pending-state"><p>Loading orders...</p></div>`;

        try {
            const res = await fetch('https://api.noblemart.com.ng/orders/vendor/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const orders = await res.json();

            viewContainer.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h3>Customer Orders (${orders.length})</h3>
                </div>

                <div class="orders-table-wrapper" style="background: white; border-radius: 1rem; border: 1px solid var(--slate-200); overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background: var(--slate-50); border-bottom: 1px solid var(--slate-200);">
                            <tr>
                                <th style="padding: 1rem;">Order ID</th>
                                <th style="padding: 1rem;">Customer</th>
                                <th style="padding: 1rem;">Product</th>
                                <th style="padding: 1rem;">Total</th>
                                <th style="padding: 1rem;">Status</th>
                                <th style="padding: 1rem;">Date</th>
                                <th style="padding: 1rem;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.length === 0 ? '<tr><td colspan="7" style="padding: 3rem; text-align: center; color: var(--slate-400);">No orders found yet.</td></tr>' :
                    orders.map(o => `
                                <tr style="border-bottom: 1px solid var(--slate-100);">
                                    <td style="padding: 1rem; font-weight: 600;">#NM-${o.id}</td>
                                    <td style="padding: 1rem;">${o.customer_name}</td>
                                    <td style="padding: 1rem;">
                                        <div style="font-weight: 500;">${o.product_name}</div>
                                        <div style="font-size: 0.75rem; color: var(--slate-400);">Qty: ${o.quantity}</div>
                                    </td>
                                    <td style="padding: 1rem; font-weight: 600;">₦${(o.total_amount).toLocaleString()}</td>
                                    <td style="padding: 1rem;">
                                        <span class="status-badge" style="padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.75rem; font-weight: 600; 
                                            ${o.status === 'delivered' ? 'background: #dcfce7; color: #166534;' :
                            o.status === 'processing' ? 'background: #fef9c3; color: #854d0e;' :
                                o.status === 'pending' ? 'background: #f1f5f9; color: #475569;' : 'background: #fee2e2; color: #991b1b;'}">
                                            ${o.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style="padding: 1rem; color: var(--slate-500); font-size: 0.85rem;">
                                        ${new Date(o.created_at).toLocaleDateString()}
                                    </td>
                                    <td style="padding: 1rem;">
                                        <select onchange="updateOrderStatus(${o.id}, this.value)" style="padding: 0.4rem; border-radius: 0.4rem; border: 1px solid var(--slate-200); font-size: 0.85rem;">
                                            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                                            <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
                                            <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                                            <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (err) {
            console.error('Error loading orders:', err);
        }
    }

    window.updateOrderStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch(`https://api.noblemart.com.ng/orders/vendor/status/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                alert('Order status updated!');
                renderOrders();
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            alert('Connection error');
        }
    }

    async function renderEarnings() {
        viewContainer.innerHTML = `<div class="pending-state"><p>Loading wallet...</p></div>`;

        try {
            const res = await fetch('https://api.noblemart.com.ng/wallets/details', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            viewContainer.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h3>My Earnings</h3>
                    <button class="btn-primary" style="width: auto; padding: 0.75rem 1.5rem;" onclick="showWithdrawModal()">Withdraw Funds</button>
                </div>

                <div class="stat-grid">
                    <div class="stat-card">
                        <div class="stat-label">Available Balance</div>
                        <div class="stat-value">₦${(data.balance || 0).toLocaleString()}</div>
                        <div style="font-size: 0.8rem; color: #10b981;">Ready for withdrawal</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Pending (Escrow)</div>
                        <div class="stat-value" style="color: var(--slate-400);">₦${(data.pending_balance || 0).toLocaleString()}</div>
                        <div style="font-size: 0.8rem; color: var(--slate-400);">Released on delivery</div>
                    </div>
                </div>

                <h4 style="margin: 2rem 0 1rem;">Transaction History</h4>
                <div class="table-wrapper" style="background: white; border-radius: 1rem; border: 1px solid var(--slate-200); overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background: var(--slate-50);">
                            <tr>
                                <th style="padding: 1rem;">ID</th>
                                <th style="padding: 1rem;">Type</th>
                                <th style="padding: 1rem;">Description</th>
                                <th style="padding: 1rem;">Amount</th>
                                <th style="padding: 1rem;">Status</th>
                                <th style="padding: 1rem;">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.transactions.length === 0 ? '<tr><td colspan="6" style="padding: 3rem; text-align: center; color: var(--slate-400);">No transactions yet.</td></tr>' :
                    data.transactions.map(t => `
                                <tr style="border-bottom: 1px solid var(--slate-100);">
                                    <td style="padding: 1rem; font-size: 0.85rem; color: var(--slate-400);">#${t.id}</td>
                                    <td style="padding: 1rem; text-transform: capitalize;">${t.type}</td>
                                    <td style="padding: 1rem;">${t.description}</td>
                                    <td style="padding: 1rem; font-weight: 600; color: ${t.type === 'sale' ? '#10b981' : '#ef4444'}">
                                        ${t.type === 'sale' ? '+' : '-'}₦${(t.amount || 0).toLocaleString()}
                                    </td>
                                    <td style="padding: 1rem;">
                                        <span style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">${t.status}</span>
                                    </td>
                                    <td style="padding: 1rem; color: var(--slate-500); font-size: 0.85rem;">
                                        ${new Date(t.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (err) {
            console.error('Error loading wallet:', err);
        }
    }

    window.showWithdrawModal = () => {
        const modalHtml = `
            <div id="withdrawModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;">
                <div style="background: white; border-radius: 1.5rem; width: 100%; max-width: 500px; padding: 2.5rem;">
                    <h2 style="margin-bottom: 1.5rem;">Withdraw Funds</h2>
                    
                    <form id="withdrawForm">
                        <div class="field-group">
                            <label class="field-label">Amount to Withdraw (₦)</label>
                            <input type="number" class="premium-input" id="wAmount" placeholder="Min 1,000" required min="1000">
                        </div>

                        <div class="field-group">
                            <label class="field-label">Bank Name</label>
                            <select class="premium-input" id="wBank" required>
                                <option value="Access Bank">Access Bank</option>
                                <option value="First Bank">First Bank</option>
                                <option value="GTBank">GTBank</option>
                                <option value="Kuda Bank">Kuda Bank</option>
                                <option value="OPay">OPay</option>
                                <option value="UBA">UBA</option>
                                <option value="Zenith Bank">Zenith Bank</option>
                            </select>
                        </div>

                        <div class="field-group" style="margin-top: 1rem;">
                            <label class="field-label">Account Number</label>
                            <input type="text" class="premium-input" id="wAccountNumber" maxlength="10" required>
                        </div>

                        <div class="field-group" style="margin-top: 1rem;">
                            <label class="field-label">Account Name</label>
                            <input type="text" class="premium-input" id="wAccountName" required>
                        </div>

                        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                            <button type="button" class="btn-secondary" onclick="document.getElementById('withdrawModal').remove()">Cancel</button>
                            <button type="submit" class="btn-primary">Submit Request</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('withdrawForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = e.target.querySelector('.btn-primary');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';

            const payload = {
                amount: document.getElementById('wAmount').value,
                bank_name: document.getElementById('wBank').value,
                account_number: document.getElementById('wAccountNumber').value,
                account_name: document.getElementById('wAccountName').value
            };

            try {
                const res = await fetch('https://api.noblemart.com.ng/wallets/withdraw', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    alert('Withdrawal request submitted!');
                    document.getElementById('withdrawModal').remove();
                    renderEarnings();
                } else {
                    const error = await res.json();
                    alert(error.message || 'Withdrawal failed');
                }
            } catch (err) {
                alert('Connection error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Request';
            }
        });
    }

    async function renderProperties() {
        viewContainer.innerHTML = `<div class="pending-state"><p>Loading properties...</p></div>`;

        try {
            // Need to implement getVendorProperties in API too, adding to list
            const res = await fetch('https://api.noblemart.com.ng/properties', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const props = await res.json();
            // Filter by vendor id if the API doesn't do it yet for this specific vendor
            // Ideally should have /properties/vendor/all

            viewContainer.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h3>My Real Estate Listings</h3>
                    <button class="btn-primary" style="width: auto; padding: 0.75rem 1.5rem;" onclick="showAddPropertyModal()">List New Property</button>
                </div>

                <div class="product-grid">
                    ${props.length === 0 ? '<p style="grid-column: 1/-1; text-align: center; color: var(--slate-400); padding: 3rem;">No property listings found.</p>' :
                    props.map(p => `
                        <div class="prop-card" style="background: white; border-radius: 1rem; border: 1px solid var(--slate-200); overflow: hidden;">
                             <img src="${p.images ? JSON.parse(p.images)[0] : 'https://placehold.co/400x300?text=Property'}" style="width: 100%; height: 180px; object-fit: cover;">
                             <div style="padding: 1.25rem;">
                                <div style="font-weight: 700; margin-bottom: 0.25rem;">${p.title}</div>
                                <div style="font-size: 0.8rem; color: var(--slate-500); margin-bottom: 0.5rem;">${p.location}</div>
                                <div style="font-weight: 800; color: var(--primary);">₦${parseFloat(p.price).toLocaleString()}</div>
                                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                                    <button class="btn-secondary" style="font-size: 0.75rem; padding: 0.5rem;" onclick="editProperty(${p.id})">Edit</button>
                                    <button class="btn-secondary" style="font-size: 0.75rem; padding: 0.5rem; color: #ef4444;" onclick="deleteProperty(${p.id})">Delete</button>
                                </div>
                             </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (err) {
            console.error(err);
        }
    }

    window.showAddPropertyModal = () => {
        const modalHtml = `
            <div id="propModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;">
                <div style="background: white; border-radius: 1.5rem; width: 100%; max-width: 650px; padding: 2.5rem; max-height: 90vh; overflow-y: auto;">
                    <h2 style="margin-bottom: 1.5rem;">List New Property</h2>
                    <form id="propForm">
                        <div class="field-group">
                            <label class="field-label">Property Title</label>
                            <input type="text" class="premium-input" id="pTitle" placeholder="e.g. 5 Bedroom Duplex in Lekki" required>
                        </div>
                        <div class="field-group">
                            <label class="field-label">Description</label>
                            <textarea class="premium-input" id="pDesc" style="min-height: 80px;" required></textarea>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="field-group">
                                <label class="field-label">Price (₦)</label>
                                <input type="number" class="premium-input" id="pPrice" required>
                            </div>
                            <div class="field-group">
                                <label class="field-label">Property Type</label>
                                <select class="premium-input" id="pType" required>
                                    <option value="house">House</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="land">Land</option>
                                    <option value="commercial">Commercial</option>
                                </select>
                            </div>
                        </div>
                        <div class="field-group">
                            <label class="field-label">Location</label>
                            <input type="text" class="premium-input" id="pLoc" placeholder="City, State" required>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                            <div class="field-group">
                                <label class="field-label">Bedrooms</label>
                                <input type="number" class="premium-input" id="pBeds" value="0">
                            </div>
                            <div class="field-group">
                                <label class="field-label">Bathrooms</label>
                                <input type="number" class="premium-input" id="pBaths" value="0">
                            </div>
                            <div class="field-group">
                                <label class="field-label">Area (SqFt)</label>
                                <input type="number" class="premium-input" id="pArea" value="0">
                            </div>
                        </div>
                        <div class="field-group">
                            <label class="field-label">Property Images (Select multiple)</label>
                            <input type="file" class="premium-input" id="pImages" multiple accept="image/*">
                        </div>
                        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                            <button type="button" class="btn-secondary" onclick="document.getElementById('propModal').remove()">Cancel</button>
                            <button type="submit" class="btn-primary">List Property</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('propForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('.btn-primary');
            btn.disabled = true;
            btn.textContent = 'Listing...';

            const formData = new FormData();
            formData.append('title', document.getElementById('pTitle').value);
            formData.append('description', document.getElementById('pDesc').value);
            formData.append('price', document.getElementById('pPrice').value);
            formData.append('property_type', document.getElementById('pType').value);
            formData.append('location', document.getElementById('pLoc').value);
            formData.append('bedrooms', document.getElementById('pBeds').value);
            formData.append('bathrooms', document.getElementById('pBaths').value);
            formData.append('area_sqft', document.getElementById('pArea').value);

            const files = document.getElementById('pImages').files;
            for (let i = 0; i < files.length; i++) {
                formData.append('images', files[i]);
            }

            try {
                const res = await fetch('https://api.noblemart.com.ng/properties/add', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (res.ok) {
                    alert('Property listed successfully!');
                    document.getElementById('propModal').remove();
                    renderProperties();
                } else {
                    const err = await res.json();
                    alert(err.message || 'Listing failed');
                }
            } catch (err) {
                alert('Connection error');
            } finally {
                btn.disabled = false;
                btn.textContent = 'List Property';
            }
        });
    }

    window.editProperty = async (id) => {
        alert('Edit functionality coming soon in the next update!');
    }

    window.deleteProperty = async (id) => {
        if (!confirm('Are you sure you want to delete this property listing?')) return;

        try {
            const res = await fetch(`https://api.noblemart.com.ng/properties/vendor/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert('Property deleted successfully');
                renderProperties();
            } else {
                alert('Failed to delete property');
            }
        } catch (err) {
            alert('Connection error');
        }
    }
});
