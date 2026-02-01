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

// Dashboard Routes - Fixed for Cloudflare Workers
// NOTE: Cloudflare Pages automatically strips .html extension for clean URLs
// Redirect to paths without .html extension
app.get('/dashboard/customer', (c) => {
  return c.redirect('/static/dashboard-customer');
});

app.get('/dashboard/capster', (c) => {
  return c.redirect('/static/dashboard-capster');
});

app.get('/dashboard/admin', (c) => {
  return c.redirect('/static/dashboard-admin');
});

// Home page - ULTRA-SOPHISTICATED UI
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="id" class="dark">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BALIK.LAGI - Enterprise Barbershop Platform</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <script>
            tailwind.config = {
                darkMode: 'class',
                theme: {
                    extend: {
                        fontFamily: {
                            sans: ['Inter', 'system-ui', 'sans-serif']
                        },
                        colors: {
                            primary: '#d97706',
                            dark: {
                                50: '#f8fafc',
                                800: '#1e293b',
                                900: '#0f172a',
                                950: '#020617'
                            }
                        }
                    }
                }
            }
        </script>
        <style>
            .gradient-text {
                background: linear-gradient(135deg, #d97706 0%, #ea580c 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .glassmorphism {
                background: rgba(15, 23, 42, 0.8);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(148, 163, 184, 0.1);
            }
            .bento-card {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .bento-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 20px 25px -5px rgba(217, 119, 6, 0.2);
            }
        </style>
    </head>
    <body class="bg-dark-950 text-gray-100">
        <!-- Navigation - Glassmorphism Style -->
        <header class="fixed top-0 left-0 right-0 z-50 glassmorphism">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-primary to-orange-600 rounded-lg flex items-center justify-center">
                            <i class="fas fa-cut text-white text-lg"></i>
                        </div>
                        <div>
                            <h1 class="text-xl font-bold text-white">BALIK.LAGI</h1>
                            <p class="text-xs text-gray-400">Enterprise Grade</p>
                        </div>
                    </div>
                    <nav class="hidden md:flex items-center space-x-8">
                        <a href="#features" class="text-gray-300 hover:text-white transition text-sm font-medium">Features</a>
                        <a href="#pricing" class="text-gray-300 hover:text-white transition text-sm font-medium">Pricing</a>
                        <a href="/login" class="text-gray-300 hover:text-white transition text-sm font-medium">Login</a>
                        <a href="/register" class="px-6 py-2.5 bg-gradient-to-r from-primary to-orange-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary/50 transition-all">Get Started</a>
                    </nav>
                </div>
            </div>
        </header>

        <!-- Hero Section - Modern & Sophisticated -->
        <section class="pt-32 pb-20 px-4 relative overflow-hidden">
            <!-- Background Gradient -->
            <div class="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-black"></div>
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
            
            <div class="max-w-7xl mx-auto relative">
                <div class="text-center">
                    <!-- Badge -->
                    <div class="inline-flex items-center px-4 py-2 rounded-full bg-dark-900 border border-primary/20 mb-8">
                        <span class="relative flex h-2 w-2 mr-2">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span class="text-sm text-gray-300">Enterprise Barbershop Platform</span>
                    </div>
                    
                    <!-- Main Heading -->
                    <h1 class="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 tracking-tight">
                        <span class="gradient-text">Transform</span><br/>
                        <span class="text-white">Your Barbershop</span>
                    </h1>
                    
                    <p class="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                        The most sophisticated booking platform designed for modern barbershops.
                        <span class="text-white font-medium">Seamless. Elegant. Powerful.</span>
                    </p>
                    
                    <!-- CTA Buttons -->
                    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a href="/register" class="group relative px-8 py-4 bg-gradient-to-r from-primary to-orange-600 text-white rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/50">
                            <span class="relative z-10 flex items-center">
                                <i class="fas fa-sparkles mr-2"></i>
                                Start Free Trial
                            </span>
                            <div class="absolute inset-0 bg-gradient-to-r from-orange-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </a>
                        <a href="/login" class="px-8 py-4 border-2 border-gray-700 text-white rounded-xl font-semibold hover:border-primary/50 hover:bg-dark-900 transition-all">
                            <i class="fas fa-sign-in-alt mr-2"></i>
                            Sign In
                        </a>
                    </div>
                    
                    <!-- Trust Indicators -->
                    <div class="mt-16 flex justify-center items-center space-x-12 text-sm text-gray-500">
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-check-circle text-primary"></i>
                            <span>No credit card required</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-lock text-primary"></i>
                            <span>Enterprise security</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-bolt text-primary"></i>
                            <span>Deploy in minutes</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section - Bento Grid Layout -->
        <section id="features" class="py-24 px-4 bg-dark-950\">
            <div class="max-w-7xl mx-auto">
                <!-- Section Header -->
                <div class="text-center mb-16">
                    <span class="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4\">FEATURES</span>
                    <h2 class="text-4xl md:text-5xl font-bold mb-4 text-white\">Everything you need,<br/>nothing you don't</h2>
                    <p class="text-xl text-gray-400 max-w-2xl mx-auto\">Powerful features that scale with your business</p>
                </div>

                <!-- Bento Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Large Feature Card -->
                    <div class="lg:col-span-2 lg:row-span-2 bento-card bg-gradient-to-br from-dark-900 to-dark-800 p-8 rounded-2xl border border-gray-800 hover:border-primary/30">
                        <div class="flex items-start justify-between mb-6">
                            <div class="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
                                <i class="fas fa-calendar-check text-primary text-2xl"></i>
                            </div>
                            <span class="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-semibold">MOST POPULAR</span>
                        </div>
                        <h3 class="text-2xl font-bold text-white mb-3">Intelligent Booking System</h3>
                        <p class="text-gray-400 mb-6 text-lg">
                            Seamless appointment scheduling with real-time availability. Customers choose their preferred capster, time, and service in seconds.
                        </p>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="flex items-center space-x-2 text-sm text-gray-300">
                                <i class="fas fa-check text-primary"></i>
                                <span>Real-time sync</span>
                            </div>
                            <div class="flex items-center space-x-2 text-sm text-gray-300">
                                <i class="fas fa-check text-primary"></i>
                                <span>Auto-confirmation</span>
                            </div>
                            <div class="flex items-center space-x-2 text-sm text-gray-300">
                                <i class="fas fa-check text-primary"></i>
                                <span>WhatsApp reminders</span>
                            </div>
                            <div class="flex items-center space-x-2 text-sm text-gray-300">
                                <i class="fas fa-check text-primary"></i>
                                <span>No-show protection</span>
                            </div>
                        </div>
                    </div>

                    <!-- Feature Card 1 -->
                    <div class="bento-card bg-gradient-to-br from-dark-900 to-dark-800 p-6 rounded-2xl border border-gray-800 hover:border-primary/30">
                        <div class="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                            <i class="fas fa-gift text-orange-500 text-xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-2">Loyalty Program</h3>
                        <p class="text-gray-400 text-sm">
                            Automatic rewards system that keeps customers coming back
                        </p>
                    </div>

                    <!-- Feature Card 2 -->
                    <div class="bento-card bg-gradient-to-br from-dark-900 to-dark-800 p-6 rounded-2xl border border-gray-800 hover:border-primary/30">
                        <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                            <i class="fas fa-chart-line text-blue-500 text-xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-2">Analytics Dashboard</h3>
                        <p class="text-gray-400 text-sm">
                            Real-time insights into your business performance
                        </p>
                    </div>

                    <!-- Feature Card 3 -->
                    <div class="bento-card bg-gradient-to-br from-dark-900 to-dark-800 p-6 rounded-2xl border border-gray-800 hover:border-primary/30">
                        <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                            <i class="fas fa-users text-green-500 text-xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-2">Customer Profiles</h3>
                        <p class="text-gray-400 text-sm">
                            Track preferences and history for personalized service
                        </p>
                    </div>

                    <!-- Feature Card 4 -->
                    <div class="lg:col-span-2 bento-card bg-gradient-to-br from-dark-900 to-dark-800 p-6 rounded-2xl border border-gray-800 hover:border-primary/30">
                        <div class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                            <i class="fas fa-mobile-alt text-purple-500 text-xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-2">Mobile-First Experience</h3>
                        <p class="text-gray-400 text-sm">
                            Optimized for mobile devices. Your customers book on the go, anywhere, anytime.
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
                        // FIX: Use redirectTo from backend response (1 Account = 1 Role = 1 Dashboard)
                        // This ensures consistent routing logic and prevents infinity loops
                        const redirectUrl = response.data.redirectTo || '/dashboard/customer';
                        window.location.href = redirectUrl;
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
