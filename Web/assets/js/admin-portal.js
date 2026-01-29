document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || user.role !== 'admin') {
        window.location.href = '../seller/login.html'; // Or a separate admin login
        return;
    }

    const adminView = document.getElementById('adminView');
    const viewTitle = document.getElementById('viewTitle');

    // Init Overview
    loadOverview();

    // Nav Logic
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.getAttribute('data-view');

            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            if (view === 'overview') loadOverview();
            else if (view === 'vendors') loadVendorVerification();
        });
    });

    async function loadOverview() {
        viewTitle.textContent = 'Marketplace Overview';
        adminView.innerHTML = '<p>Loading statistics...</p>';

        try {
            const res = await fetch('https://api.noblemart.com.ng/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const stats = await res.json();

            adminView.innerHTML = `
                <div class="stat-grid">
                    <div class="stat-card">
                        <div class="stat-lbl">Total Vendors</div>
                        <div class="stat-val">${stats.total_vendors}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-lbl">Pending Applications</div>
                        <div class="stat-val" style="color: #f59e0b;">${stats.pending_vendors}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-lbl">Total Orders</div>
                        <div class="stat-val">${stats.total_orders}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-lbl">All-time Revenue</div>
                        <div class="stat-val">₦${stats.total_revenue.toLocaleString()}</div>
                    </div>
                </div>

                <div class="data-card">
                    <div style="padding: 1.5rem; border-bottom: 1px solid var(--slate-100); display: flex; justify-content: space-between;">
                        <h4 style="font-weight: 700;">Recent Platform Activity</h4>
                        <button class="btn-secondary" style="width: auto; padding: 0.5rem 1rem; font-size: 0.8rem;">View Logs</button>
                    </div>
                    <div style="padding: 3rem; text-align: center; color: var(--slate-400);">
                        <span class="material-symbols-outlined" style="font-size: 3rem; margin-bottom: 1rem;">insights</span>
                        <p>Detailed activity logs will appear here as the marketplace grows.</p>
                    </div>
                </div>
            `;
        } catch (err) {
            console.error(err);
        }
    }

    async function loadVendorVerification() {
        viewTitle.textContent = 'Vendor Applications';
        adminView.innerHTML = '<p>Loading pending vendors...</p>';

        try {
            const res = await fetch('https://api.noblemart.com.ng/admin/vendors/pending', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const vendors = await res.json();

            adminView.innerHTML = `
                <div class="data-card">
                    <table>
                        <thead>
                            <tr>
                                <th>Vendor Details</th>
                                <th>Shop Name</th>
                                <th>NIN/BVN</th>
                                <th>Applied Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${vendors.length === 0 ? '<tr><td colspan="5" style="padding: 4rem; text-align: center;">No pending applications found.</td></tr>' :
                    vendors.map(v => `
                                <tr>
                                    <td>
                                        <div style="font-weight: 600;">${v.full_name}</div>
                                        <div style="font-size: 0.8rem; color: var(--slate-500);">${v.email}</div>
                                    </td>
                                    <td>${v.shop_name}</td>
                                    <td>${v.kyc_number || 'N/A'}</td>
                                    <td>${new Date(v.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button class="btn-primary" style="width: auto; padding: 0.5rem 1rem; font-size: 0.8rem;" onclick="verifyVendor(${v.id}, 'active')">Approve</button>
                                        <button class="btn-secondary" style="width: auto; padding: 0.5rem 1rem; font-size: 0.8rem; color: #ef4444;" onclick="verifyVendor(${v.id}, 'rejected')">Reject</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (err) {
            console.error(err);
        }
    }

    window.verifyVendor = async (id, status) => {
        const notes = prompt(`Enter ${status} notes (optional):`);
        try {
            const res = await fetch(`https://api.noblemart.com.ng/admin/vendors/verify/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status, notes })
            });

            if (res.ok) {
                alert(`Vendor ${status} successfully!`);
                loadVendorVerification();
            } else {
                alert('Verification failed.');
            }
        } catch (err) {
            alert('Connection error');
        }
    }

    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = '../seller/login.html';
    });
});
