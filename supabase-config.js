// supabase-config.js
// Supabase Configuration and Helper Functions

// ============================================
// CONFIGURATION - REPLACE WITH YOUR VALUES
// ============================================
const SUPABASE_URL = 'https://umydxlyuujibskkageox.supabase.co'; // e.g., https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVteWR4bHl1dWppYnNra2FnZW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTQ4NDEsImV4cCI6MjA4MDczMDg0MX0.mS7mjdFxpdlVjcVrukHS4qXmBX1XeTOd1JsWu-nznm0'; // Your public anon key

// Admin credentials (stored in code for simplicity - for demo purposes only)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// ============================================
// SUPABASE CLIENT INITIALIZATION
// ============================================
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// DONOR FUNCTIONS
// ============================================

/**
 * Register a new donor
 * @param {Object} donorData - Donor information
 * @returns {Promise<Object>} Result with success status and message
 */
async function registerDonor(donorData) {
    try {
        const { data, error } = await supabase
            .from('donors')
            .insert([
                {
                    full_name: donorData.fullName,
                    age: parseInt(donorData.age),
                    gender: donorData.gender,
                    blood_group: donorData.bloodGroup,
                    city: donorData.city,
                    contact_number: donorData.contactNumber,
                    email: donorData.email
                }
            ])
            .select();

        if (error) {
            console.error('Error registering donor:', error);
            
            // Check for duplicate email error
            if (error.code === '23505') {
                return { success: false, message: 'This email is already registered!' };
            }
            
            return { success: false, message: error.message };
        }

        return { success: true, message: 'Donor registered successfully!', data: data };
    } catch (err) {
        console.error('Exception in registerDonor:', err);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

/**
 * Search donors by city and blood group
 * @param {string} city - City name
 * @param {string} bloodGroup - Blood group (e.g., 'O+')
 * @returns {Promise<Object>} Result with donors array
 */
async function searchDonors(city, bloodGroup) {
    try {
        console.log('searchDonors called with:', { city, bloodGroup });
        
        let query = supabase.from('donors').select('*');

        // Add filters based on provided parameters
        if (city && city.trim() !== '') {
            console.log('Adding city filter:', city);
            query = query.ilike('city', `%${city}%`);
        }
        if (bloodGroup && bloodGroup.trim() !== '') {
            console.log('Adding blood group filter:', bloodGroup);
            query = query.eq('blood_group', bloodGroup);
        }

        console.log('Executing query...');
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error searching donors:', error);
            return { success: false, message: error.message, donors: [] };
        }

        console.log('Query successful, found donors:', data ? data.length : 0);
        return { success: true, donors: data || [] };
    } catch (err) {
        console.error('Exception in searchDonors:', err);
        return { success: false, message: 'An unexpected error occurred.', donors: [] };
    }
}

/**
 * Get all donors (for admin dashboard)
 * @returns {Promise<Object>} Result with all donors
 */
async function getAllDonors() {
    try {
        const { data, error } = await supabase
            .from('donors')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching donors:', error);
            return { success: false, message: error.message, donors: [] };
        }

        return { success: true, donors: data || [] };
    } catch (err) {
        console.error('Exception in getAllDonors:', err);
        return { success: false, message: 'An unexpected error occurred.', donors: [] };
    }
}

/**
 * Delete a donor by ID
 * @param {number} donorId - Donor ID
 * @returns {Promise<Object>} Result with success status
 */
async function deleteDonor(donorId) {
    try {
        const { error } = await supabase
            .from('donors')
            .delete()
            .eq('id', donorId);

        if (error) {
            console.error('Error deleting donor:', error);
            return { success: false, message: error.message };
        }

        return { success: true, message: 'Donor deleted successfully!' };
    } catch (err) {
        console.error('Exception in deleteDonor:', err);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

// ============================================
// ADMIN AUTHENTICATION FUNCTIONS (SIMPLE VERSION)
// ============================================

/**
 * Admin login (simple client-side validation)
 * NOTE: This is for demo purposes. In production, use proper authentication!
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {Promise<Object>} Result with success status
 */
async function adminLogin(username, password) {
    try {
        // Simple credential check (client-side only - for demo purposes)
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            // Store session in localStorage
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminUsername', username);
            localStorage.setItem('adminLoginTime', new Date().getTime().toString());
            return { success: true, message: 'Login successful!' };
        }

        return { success: false, message: 'Invalid username or password' };
    } catch (err) {
        console.error('Exception in adminLogin:', err);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

/**
 * Check if admin is logged in
 * @returns {boolean} True if admin is logged in
 */
function isAdminLoggedIn() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const loginTime = localStorage.getItem('adminLoginTime');
    
    // Optional: Add session timeout (24 hours)
    if (isLoggedIn && loginTime) {
        const timeDiff = new Date().getTime() - parseInt(loginTime);
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
            // Session expired
            adminLogout();
            return false;
        }
    }
    
    return isLoggedIn;
}

/**
 * Admin logout
 */
function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminLoginTime');
    window.location.href = 'admin.html';
}

/**
 * Get logged in admin username
 * @returns {string|null} Admin username or null
 */
function getAdminUsername() {
    return localStorage.getItem('adminUsername');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Display notification message
 * @param {string} message - Message to display
 * @param {string} type - Type of notification ('success' or 'error')
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (10 digits)
 * @param {string} phone - Phone number
 * @returns {boolean} True if valid
 */
function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Log initialization (for debugging)
console.log('Supabase configuration loaded');
console.log('Make sure to replace SUPABASE_URL and SUPABASE_ANON_KEY with your actual values!');