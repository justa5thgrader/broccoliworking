/* 
 * Ultraviolet Bundle
 * This contains the core functionality for the Ultraviolet proxy.
 */

// Create a global Ultraviolet object to hold all our utilities
window.Ultraviolet = window.Ultraviolet || {};

// Define URL encoding/decoding utilities
Ultraviolet.codec = {
    // XOR encoding for URLs
    xor: {
        // XOR key used for encoding/decoding
        key: 'broccoli-direct',
        
        // Encode a URL using XOR
        encode: function(url) {
            try {
                // Convert the URL to a string
                url = url.toString();
                
                // Create a buffer for the result
                let result = '';
                
                // XOR each character with the corresponding character in the key
                for (let i = 0; i < url.length; i++) {
                    const charCode = url.charCodeAt(i);
                    const keyChar = this.key.charCodeAt(i % this.key.length);
                    const encodedChar = charCode ^ keyChar;
                    
                    // Convert the encoded char code to a hex string and append it
                    result += encodedChar.toString(16).padStart(2, '0');
                }
                
                // Return the encoded result
                return result;
            } catch (err) {
                console.error('UV encoding error:', err);
                // If encoding fails, return the original URL base64 encoded as fallback
                return btoa(url);
            }
        },
        
        // Decode a URL using XOR
        decode: function(encoded) {
            try {
                // Create a buffer for the result
                let result = '';
                
                // Decode each character
                for (let i = 0; i < encoded.length; i += 2) {
                    // Get the hex value and convert it to a character code
                    const hex = encoded.substring(i, i + 2);
                    const charCode = parseInt(hex, 16);
                    
                    // XOR with the key
                    const keyChar = this.key.charCodeAt((i / 2) % this.key.length);
                    const decodedChar = charCode ^ keyChar;
                    
                    // Append the decoded character
                    result += String.fromCharCode(decodedChar);
                }
                
                // Return the decoded result
                return result;
            } catch (err) {
                console.error('UV decoding error:', err);
                // If decoding fails, try base64 decoding as fallback
                try {
                    return atob(encoded);
                } catch (e) {
                    return encoded;
                }
            }
        }
    },
    
    // Add other encoding methods as needed
    // For example: base64, hex, etc.
};

// UV Service Worker class that will handle the proxying
class UVServiceWorker {
    constructor() {
        this.version = '1.0.0';
        this.browser = this.detectBrowser();
        console.log('UV Service Worker initialized');
    }
    
    // Handle fetch events in the service worker
    async fetch(event) {
        // Skip processing if not a valid request
        if (!event || !event.request) {
            return fetch(event.request);
        }
        
        const request = event.request;
        const url = new URL(request.url);
        
        // Check if the request is for a UV resource
        if (url.pathname.startsWith('/uv/')) {
            // Serve UV scripts from cache if available
            const cache = await caches.open('ultraviolet-cache');
            const cachedResponse = await cache.match(request);
            
            if (cachedResponse) {
                return cachedResponse;
            }
            
            // Otherwise, fetch it
            return fetch(request);
        }
        
        // Check if this is a proxied URL
        if (url.pathname.startsWith(self.__uv$config.prefix)) {
            try {
                // Extract the encoded URL from the path
                const encodedUrl = url.pathname.substring(self.__uv$config.prefix.length);
                
                // Decode the URL
                const decodedUrl = self.__uv$config.decodeUrl(encodedUrl);
                
                // Create a new request to the actual URL
                const newRequest = new Request(decodedUrl, {
                    method: request.method,
                    headers: request.headers,
                    body: request.body,
                    mode: 'cors',
                    credentials: 'omit', // Avoid sending cookies for security
                });
                
                // Fetch the resource from the bare server
                return await this.fetchWithBare(newRequest);
            } catch (err) {
                console.error('UV service worker proxy error:', err);
                return new Response('Proxy error: ' + err.toString(), {
                    status: 500,
                    headers: { 'Content-Type': 'text/plain' }
                });
            }
        }
        
        // For non-UV URLs, just pass through
        return fetch(request);
    }
    
    // Fetch a resource through the bare server
    async fetchWithBare(request) {
        // In a real implementation, this would use the bare server
        // For now, we'll simulate it by just fetching the URL directly
        // This won't work in production due to CORS, but is a placeholder
        
        try {
            const bareUrl = self.__uv$config.bare + 'v1/';
            
            // Create a request to the bare server
            const bareRequest = new Request(bareUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: request.url,
                    method: request.method,
                    headers: this.serializeHeaders(request.headers),
                    // You'd also include the request body for POST requests
                })
            });
            
            // Make the request to the bare server
            const response = await fetch(bareRequest);
            
            // Process the response
            return response;
        } catch (err) {
            console.error('Bare server fetch error:', err);
            return new Response('Error fetching through bare server: ' + err.toString(), {
                status: 500,
                headers: { 'Content-Type': 'text/plain' }
            });
        }
    }
    
    // Helper to convert Headers to a plain object
    serializeHeaders(headers) {
        const result = {};
        for (const [key, value] of headers.entries()) {
            result[key] = value;
        }
        return result;
    }
    
    // Detect browser for compatibility
    detectBrowser() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (userAgent.includes('firefox')) {
            return 'firefox';
        } else if (userAgent.includes('chrome')) {
            return 'chrome';
        } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
            return 'safari';
        } else if (userAgent.includes('edge')) {
            return 'edge';
        } else {
            return 'unknown';
        }
    }
}

// Expose the service worker class globally
window.UVServiceWorker = UVServiceWorker; 