/* 
 * Ultraviolet Handler
 * This script handles client-side processing of requests for the Ultraviolet proxy.
 */

// Create a self-executing function to avoid polluting the global scope
(function(window) {
    // Define the handler class
    class UVHandler {
        constructor(config) {
            this.config = config;
            this.urls = new Map();
            
            // Initialize handler
            this.initialize();
        }
        
        initialize() {
            // Add event listener for message events from other scripts
            window.addEventListener('message', this.onMessage.bind(this));
            
            // Inject badge if needed
            this.injectBadge();
            
            // Hook key functions to improve compatibility
            this.hookFunctions();
            
            console.log('UV Handler initialized');
        }
        
        // Process a URL through the proxy
        processURL(url) {
            try {
                // Make sure URL is valid
                url = new URL(url).toString();
                
                // Encode the URL using the configured method
                const encodedURL = this.config.encodeUrl(url);
                
                // Create the proxied URL with the prefix
                const proxiedURL = this.config.prefix + encodedURL;
                
                // Store original to encoded mapping for later use
                this.urls.set(url, proxiedURL);
                
                return proxiedURL;
            } catch (err) {
                console.error('Error processing URL:', err);
                return url;
            }
        }
        
        // Receive messages from other components
        onMessage(event) {
            // Check if the message is for us
            if (!event.data || !event.data.type || !event.data.type.startsWith('uv:')) {
                return;
            }
            
            const { type, data } = event.data;
            
            // Handle different message types
            switch (type) {
                case 'uv:navigate':
                    // Navigate to a URL through the proxy
                    if (data && data.url) {
                        const proxiedURL = this.processURL(data.url);
                        window.location.href = proxiedURL;
                    }
                    break;
                    
                case 'uv:reload':
                    // Reload the current page
                    window.location.reload();
                    break;
                    
                // Add more message handlers as needed
            }
        }
        
        // Inject a badge into the proxied page to show it's being proxied
        injectBadge() {
            // Check if we're in a proxied page
            if (!window.location.pathname.startsWith(this.config.prefix)) {
                return;
            }
            
            // Create badge element
            const badge = document.createElement('div');
            badge.className = 'uv-embedded-badge';
            badge.textContent = 'Broccoli Proxy';
            
            // Add badge to the page when loaded
            window.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(badge);
            });
        }
        
        // Hook functions for compatibility
        hookFunctions() {
            // Hook window.open to process URLs
            const originalOpen = window.open;
            window.open = (url, ...args) => {
                if (url && typeof url === 'string') {
                    return originalOpen.call(window, this.processURL(url), ...args);
                }
                return originalOpen.call(window, url, ...args);
            };
            
            // Add more hooks as needed for things like fetch, XMLHttpRequest, etc.
        }
    }
    
    // Initialize the handler when the script loads
    window.UVHandler = UVHandler;
    
    // Create a global instance if config is available
    if (window.__uv$config) {
        window.__uv$handler = new UVHandler(window.__uv$config);
    }
})(window); 