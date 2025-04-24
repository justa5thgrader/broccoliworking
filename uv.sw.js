/* 
 * Ultraviolet Service Worker Bridge
 * This file connects the page to the service worker.
 */

// Make sure configuration exists
self.__uv$config = self.__uv$config || {};

// Service Worker Registration Helper
class UVServiceWorkerRegistration {
    constructor(config = self.__uv$config) {
        this.config = config;
        this.status = {
            registered: false,
            error: null
        };
    }
    
    // Register the service worker
    async register() {
        try {
            if (!('serviceWorker' in navigator)) {
                throw new Error('Service workers are not supported in this browser');
            }
            
            // Register the service worker with the correct scope
            const registration = await navigator.serviceWorker.register('/uv/sw.js', {
                scope: this.config.prefix
            });
            
            // Wait for the service worker to be ready
            if (registration.installing) {
                await new Promise((resolve) => {
                    registration.installing.addEventListener('statechange', (event) => {
                        if (event.target.state === 'activated') {
                            resolve();
                        }
                    });
                });
            }
            
            this.status.registered = true;
            console.log('UV service worker registered successfully');
            
            // Return the registration for further use
            return registration;
        } catch (error) {
            this.status.error = error;
            console.error('UV service worker registration failed:', error);
            throw error;
        }
    }
    
    // Get the current registration status
    getStatus() {
        return { ...this.status };
    }
    
    // Unregister the service worker
    async unregister() {
        try {
            // Get all service worker registrations
            const registrations = await navigator.serviceWorker.getRegistrations();
            
            // Find and unregister our service worker
            for (const registration of registrations) {
                if (registration.scope.includes(this.config.prefix)) {
                    await registration.unregister();
                    this.status.registered = false;
                    console.log('UV service worker unregistered');
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('UV service worker unregistration failed:', error);
            throw error;
        }
    }
}

// Create a global instance of the service worker registration helper
self.UVServiceWorkerRegistration = UVServiceWorkerRegistration;
self.__uv$serviceWorkerRegistration = new UVServiceWorkerRegistration(); 