/*
 * Ultraviolet Configuration
 * This file contains the main configuration for the Ultraviolet proxy.
 */

self.__uv$config = {
    // Prefix for Ultraviolet resources
    prefix: '/uv/',
    
    // Bare server URL for the proxy backend
    // In production, you should use your own Bare server
    bare: 'https://bare.titaniumnetwork.org/',
    
    // URL encoding methods
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    
    // Handler Script
    handler: '/uv/uv.handler.js',
    
    // Client Bundle
    bundle: '/uv/uv.bundle.js',
    
    // Config File (this file)
    config: '/uv/uv.config.js',
    
    // Service Worker Script
    sw: '/uv/sw.js',
    
    // Various proxy settings
    timeoutDuration: 30000, // 30 seconds
    
    // Custom injection (optional advanced settings)
    inject: {
        // Custom scripts to inject into the proxied page
        scripts: [],
        
        // Custom styles to inject into the proxied page
        styles: [
            // Custom CSS for the proxy
            `
            /* Ultraviolet CSS Injector */
            .uv-embedded-badge {
                position: fixed;
                bottom: 10px;
                right: 10px;
                background: rgba(0, 20, 0, 0.7);
                color: #0f0;
                padding: 5px 10px;
                border-radius: 5px;
                z-index: 999999;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                border: 1px solid #0f0;
                pointer-events: none;
                opacity: 0.7;
            }
            
            /* Fix common issues with proxied sites */
            .uv-inprogress { opacity: 0.7; }
            `
        ]
    }
}; 