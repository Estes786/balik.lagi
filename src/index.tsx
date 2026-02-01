// =================================================================
// BALIK.LAGI - Main Application
// =================================================================

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import type { Bindings } from './types';

// Import routes
import auth from './routes/auth';
import bookings from './routes/bookings';
import services from './routes/services';
import capsters from './routes/capsters';
import branches from './routes/branches';

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for API routes
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Serve static files from public/static directory
app.use('/static/*', serveStatic({ root: './public' }));

// API Routes
app.route('/api/auth', auth);
app.route('/api/bookings', bookings);
app.route('/api/services', services);
app.route('/api/capsters', capsters);
app.route('/api/branches', branches);

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Dashboard Routes
app.get('/dashboard/customer', serveStatic({ path: '/static/dashboard-customer.html', root: './public' }));
app.get('/dashboard/capster', serveStatic({ path: '/static/dashboard-capster.html', root: './public' }));
app.get('/dashboard/admin', serveStatic({ path: '/static/dashboard-admin.html', root: './public' }));

// Home page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BALIK.LAGI - Platform Booking Barbershop</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/style.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg">
            <div class="container mx-auto px-4 py-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-cut text-3xl"></i>
                        <div>
                            <h1 class="text-2xl font-bold">BALIK.LAGI</h1>
                            <p class="text-sm text-amber-100">Sekali Cocok, Pengen Balik Lagi</p>
                        </div>
                    </div>
                    <nav class="hidden md:flex space-x-6">
                        <a href="/login" class="hover:text-amber-200 transition">Login</a>
                        <a href="/register" class="hover:text-amber-200 transition">Daftar</a>
                    </nav>
                </div>
            </div>
        </header>

        <!-- Hero Section -->
        <section class="py-20 bg-white">
            <div class="container mx-auto px-4 text-center">
                <h2 class="text-5xl font-bold text-gray-800 mb-6">
                    Platform Booking Barbershop
                    <span class="text-amber-600">Terpercaya</span>
                </h2>
                <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Booking online, pilih capster favorit, dan dapatkan poin loyalty setiap kunjungan
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="/register" class="bg-amber-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-amber-700 transition shadow-lg">
                        <i class="fas fa-user-plus mr-2"></i>
                        Daftar Sekarang
                    </a>
                    <a href="/login" class="bg-gray-200 text-gray-800 px-8 py-4 rounded-lg font-semibold hover:bg-gray-300 transition">
                        <i class="fas fa-sign-in-alt mr-2"></i>
                        Login
                    </a>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section class="py-16 bg-gray-50">
            <div class="container mx-auto px-4">
                <h3 class="text-3xl font-bold text-center mb-12">Kenapa BALIK.LAGI?</h3>
                <div class="grid md:grid-cols-3 gap-8">
                    <!-- Feature 1 -->
                    <div class="bg-white p-8 rounded-lg shadow-md text-center">
                        <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-calendar-check text-amber-600 text-2xl"></i>
                        </div>
                        <h4 class="text-xl font-bold mb-3">Booking Online</h4>
                        <p class="text-gray-600">
                            Pilih tanggal, jam, dan capster favorit. No antri!
                        </p>
                    </div>

                    <!-- Feature 2 -->
                    <div class="bg-white p-8 rounded-lg shadow-md text-center">
                        <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-gift text-amber-600 text-2xl"></i>
                        </div>
                        <h4 class="text-xl font-bold mb-3">Loyalty Rewards</h4>
                        <p class="text-gray-600">
                            Kumpulkan poin setiap kunjungan, tukar hadiah menarik
                        </p>
                    </div>

                    <!-- Feature 3 -->
                    <div class="bg-white p-8 rounded-lg shadow-md text-center">
                        <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-chart-line text-amber-600 text-2xl"></i>
                        </div>
                        <h4 class="text-xl font-bold mb-3">Tracking History</h4>
                        <p class="text-gray-600">
                            Lihat riwayat kunjungan dan preferensi Anda
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="py-16 bg-amber-600 text-white">
            <div class="container mx-auto px-4 text-center">
                <h3 class="text-3xl font-bold mb-4">Siap Untuk Pengalaman Berbeda?</h3>
                <p class="text-xl mb-8">Daftar sekarang dan nikmati kemudahan booking barbershop</p>
                <a href="/register" class="bg-white text-amber-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition inline-block">
                    Mulai Sekarang
                </a>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white py-8">
            <div class="container mx-auto px-4 text-center">
                <p class="mb-2">&copy; 2026 BALIK.LAGI - Platform Booking Barbershop</p>
                <p class="text-gray-400 text-sm">Made with <i class="fas fa-heart text-red-500"></i> for Indonesian Barbershops</p>
            </div>
        </footer>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    </body>
    </html>
  `);
});

// Login page
app.get('/login', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - BALIK.LAGI</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen flex items-center justify-center py-12 px-4">
            <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div class="text-center mb-8">
                    <i class="fas fa-cut text-amber-600 text-4xl mb-3"></i>
                    <h2 class="text-3xl font-bold text-gray-800">Login</h2>
                    <p class="text-gray-600 mt-2">Masuk ke akun BALIK.LAGI Anda</p>
                </div>

                <form id="loginForm" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" name="email" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                               placeholder="email@example.com">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input type="password" name="password" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                               placeholder="********">
                    </div>

                    <div id="error" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"></div>

                    <button type="submit" 
                            class="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition">
                        <i class="fas fa-sign-in-alt mr-2"></i>
                        Login
                    </button>
                </form>

                <p class="text-center mt-6 text-gray-600">
                    Belum punya akun? <a href="/register" class="text-amber-600 hover:text-amber-700 font-semibold">Daftar di sini</a>
                </p>
                
                <p class="text-center mt-2">
                    <a href="/" class="text-gray-600 hover:text-gray-700"><i class="fas fa-home mr-1"></i>Kembali ke Home</a>
                </p>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            document.getElementById('loginForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                    email: formData.get('email'),
                    password: formData.get('password')
                };

                try {
                    const response = await axios.post('/api/auth/login', data);
                    
                    if (response.data.success) {
                        // Redirect based on role
                        const role = response.data.user.role;
                        if (role === 'admin') {
                            window.location.href = '/dashboard/admin';
                        } else if (role === 'capster') {
                            window.location.href = '/dashboard/capster';
                        } else {
                            window.location.href = '/dashboard/customer';
                        }
                    }
                } catch (error) {
                    const errorDiv = document.getElementById('error');
                    errorDiv.textContent = error.response?.data?.error || 'Login failed';
                    errorDiv.classList.remove('hidden');
                }
            });
        </script>
    </body>
    </html>
  `);
});

// Register page
app.get('/register', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daftar - BALIK.LAGI</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen flex items-center justify-center py-12 px-4">
            <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div class="text-center mb-8">
                    <i class="fas fa-user-plus text-amber-600 text-4xl mb-3"></i>
                    <h2 class="text-3xl font-bold text-gray-800">Daftar</h2>
                    <p class="text-gray-600 mt-2">Buat akun BALIK.LAGI baru</p>
                </div>

                <form id="registerForm" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select name="role" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                            <option value="">Pilih Role</option>
                            <option value="customer">Customer</option>
                            <option value="capster">Capster</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Access Key</label>
                        <input type="text" name="access_key" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                               placeholder="CUSTOMER_XXXXX">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                        <input type="text" name="customer_name" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                               placeholder="Nama lengkap">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nomor HP</label>
                        <input type="tel" name="customer_phone"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                               placeholder="+628123456789">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" name="email" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                               placeholder="email@example.com">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input type="password" name="password" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                               placeholder="Minimal 6 karakter">
                    </div>

                    <div id="error" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"></div>

                    <button type="submit"
                            class="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition">
                        <i class="fas fa-user-plus mr-2"></i>
                        Daftar
                    </button>
                </form>

                <p class="text-center mt-6 text-gray-600">
                    Sudah punya akun? <a href="/login" class="text-amber-600 hover:text-amber-700 font-semibold">Login di sini</a>
                </p>
                
                <p class="text-center mt-2">
                    <a href="/" class="text-gray-600 hover:text-gray-700"><i class="fas fa-home mr-1"></i>Kembali ke Home</a>
                </p>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            document.getElementById('registerForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                    email: formData.get('email'),
                    password: formData.get('password'),
                    role: formData.get('role'),
                    access_key: formData.get('access_key'),
                    customer_name: formData.get('customer_name'),
                    customer_phone: formData.get('customer_phone')
                };

                try {
                    const response = await axios.post('/api/auth/register', data);
                    
                    if (response.data.success) {
                        alert('Registrasi berhasil! Silakan login.');
                        window.location.href = '/login';
                    }
                } catch (error) {
                    const errorDiv = document.getElementById('error');
                    errorDiv.textContent = error.response?.data?.error || 'Registration failed';
                    errorDiv.classList.remove('hidden');
                }
            });
        </script>
    </body>
    </html>
  `);
});

export default app;
