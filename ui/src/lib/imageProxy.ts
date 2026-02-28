/**
 * Image proxy utility for handling Wikia CDN images
 * Routes images through a free public proxy service to bypass CDN restrictions
 */

/**
 * Transforms a Wikia image URL to use a proxy service
 * This bypasses CDN restrictions and CORS issues
 * 
 * @param imageUrl - The original image URL from Wikia CDN
 * @returns Proxied image URL or null if input is null
 */
export function getProxiedImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  
  // Only proxy Wikia URLs
  if (!imageUrl.includes('static.wikia.nocookie.net')) {
    return imageUrl; // Return original URL for non-Wikia images
  }
  
  // Use images.weserv.nl as a free public proxy service
  // It handles CORS, referrer policies, and caching
  const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}`;
  return proxyUrl;
}
