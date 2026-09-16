/*
 * Web Domain Configuration
 * 
 * Environment-specific domain and URL configuration for the frontend
 * Uses Vite environment variables (VITE_*)
 */

class DomainConfig {
    constructor() {
        this.env = import.meta.env.MODE || 'development';
        this.defaultWebDomain = this.env === 'production' ? 'www.hlquery.com' : 'localhost:5173';
        this.defaultDashboardDomain = this.env === 'production' ? 'dashboard.hlquery.com' : 'localhost:5174';
        this.defaultBlogDomain = this.env === 'production' ? 'guias.hlquery.com' : 'localhost:5176';
        this.loadConfig();
    }

    loadConfig() {
        const isLocalValue = (value = '') => {
            const raw = String(value || '').trim().toLowerCase();
            if (!raw) return false;
            return raw.includes('localhost') || raw.includes('127.0.0.1') || raw.includes('.local');
        };

        const preferDevFallback = (value, fallbackDomain) => {
            if (this.env !== 'development') {
                return value || fallbackDomain;
            }

            const raw = String(value || '').trim();
            if (!raw || !isLocalValue(raw)) {
                return fallbackDomain;
            }

            return raw;
        };

        const toAbsoluteBaseUrl = (value, fallbackDomain) => {
            const raw = String(value || '').trim();
            if (!raw) return `${this.config.protocol}://${fallbackDomain}`;
            if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, '');
            return `${this.config.protocol}://${raw}`;
        };

        // Load configuration from environment variables with fallbacks
        this.config = {
            baseDomain: import.meta.env.VITE_BASE_DOMAIN || this.defaultWebDomain,
            webDomain: preferDevFallback(import.meta.env.VITE_WEB_DOMAIN, this.defaultWebDomain),
            dashboardDomain: preferDevFallback(import.meta.env.VITE_DASHBOARD_DOMAIN, this.defaultDashboardDomain),
            blogDomain: preferDevFallback(import.meta.env.VITE_BLOG_DOMAIN, this.defaultBlogDomain),
            apiDomain: import.meta.env.VITE_API_DOMAIN || (this.env === 'production' ? 'api.hlquery.com' : 'localhost:7000'),
            protocol: import.meta.env.VITE_APP_PROTOCOL || import.meta.env.VITE_API_PROTOCOL || (this.env === 'production' ? 'https' : 'http'),
            dashboardPath: import.meta.env.VITE_DASHBOARD_PATH || '/',
            landingPath: import.meta.env.VITE_LANDING_PATH || '/',
            enableConsoleLogs: import.meta.env.VITE_ENABLE_CONSOLE_LOGS === 'true' || this.env === 'development',
            enableDebugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true' || this.env === 'development',
            corsOrigin: import.meta.env.VITE_CORS_ORIGIN || `http://${this.defaultWebDomain}`
        };

        // Build URLs from configuration
        this.config.apiBaseUrl = `${this.config.protocol}://${this.config.apiDomain}`;
        this.config.webBaseUrl = toAbsoluteBaseUrl(
            preferDevFallback(import.meta.env.VITE_WEB_URL, this.config.webDomain),
            this.config.webDomain
        );
        this.config.dashboardBaseUrl = toAbsoluteBaseUrl(
            preferDevFallback(import.meta.env.VITE_DASHBOARD_URL, this.config.dashboardDomain),
            this.config.dashboardDomain
        );
        this.config.blogBaseUrl = toAbsoluteBaseUrl(
            preferDevFallback(import.meta.env.VITE_BLOG_URL, this.config.blogDomain),
            this.config.blogDomain
        );
    }

    getConfig() {
        return this.config;
    }

    get(key) {
        return this.config[key];
    }

    isDevelopment() {
        return this.env === 'development';
    }

    isProduction() {
        return this.env === 'production';
    }

    isStaging() {
        return this.env === 'staging';
    }

    shouldLog() {
        return this.config.enableConsoleLogs;
    }

    shouldDebug() {
        return this.config.enableDebugMode;
    }

    getApiUrl(endpoint = '') {
        return `${this.config.apiBaseUrl}${endpoint}`;
    }

    getWebUrl(path = '') {
        return `${this.config.webBaseUrl}${path}`;
    }

    getDashboardUrl() {
        return `${this.config.dashboardBaseUrl}${this.config.dashboardPath}`;
    }

    getLandingUrl() {
        return `${this.config.webBaseUrl}${this.config.landingPath}`;
    }

    getBlogUrl(path = '/') {
        return `${this.config.blogBaseUrl}${path}`;
    }
}

export default new DomainConfig();
