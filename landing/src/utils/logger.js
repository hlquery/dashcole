/*
 * Web Logger Utility
 * 
 * Environment-aware logging for the frontend
 */

import domainConfig from '@/config/domain';

class Logger {
    constructor(context = 'App') {
        this.context = context;
        this.shouldLog = domainConfig.shouldLog();
        this.shouldDebug = domainConfig.shouldDebug();
    }

    info(message, data = null) {
        if (this.shouldLog) {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] [INFO] [${this.context}] ${message}`);
            if (data) {
                console.log('Data:', data);
            }
        }
    }

    error(message, error = null) {
        if (this.shouldLog) {
            const timestamp = new Date().toISOString();
            console.error(`[${timestamp}] [ERROR] [${this.context}] ${message}`);
            if (error) {
                console.error('Error details:', error);
            }
        }
    }

    warn(message, data = null) {
        if (this.shouldLog) {
            const timestamp = new Date().toISOString();
            console.warn(`[${timestamp}] [WARN] [${this.context}] ${message}`);
            if (data) {
                console.warn('Data:', data);
            }
        }
    }

    debug(message, data = null) {
        if (this.shouldDebug) {
            const timestamp = new Date().toISOString();
            console.debug(`[${timestamp}] [DEBUG] [${this.context}] ${message}`);
            if (data) {
                console.debug('Data:', data);
            }
        }
    }

    success(message, data = null) {
        if (this.shouldLog) {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] [SUCCESS] [${this.context}] ${message}`);
            if (data) {
                console.log('Data:', data);
            }
        }
    }
}

// Create logger instance
export function createLogger(context) {
    return new Logger(context);
}

// Log environment info
export function logEnvironmentInfo() {
    const logger = new Logger('Environment');
    const config = domainConfig.getConfig();
    
    logger.info('Environment Configuration', {
        env: import.meta.env.MODE,
        baseDomain: config.baseDomain,
        apiDomain: config.apiDomain,
        protocol: config.protocol,
        apiBaseUrl: config.apiBaseUrl,
        webBaseUrl: config.webBaseUrl,
        enableConsoleLogs: config.enableConsoleLogs,
        enableDebugMode: config.enableDebugMode
    });
}

export default Logger;

