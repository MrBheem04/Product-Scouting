// Chrome Extension Background Service Worker
console.log('[ScoutPrice Background] Service worker active.');

// Listen to message packets from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchPriceStats') {
    const { url, store } = request;
    
    // Call the backend API search/scrape endpoint
    fetch('http://localhost:5000/api/products/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, store })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          sendResponse({ success: true, product: data.product });
        } else {
          sendResponse({ success: false, message: data.message });
        }
      })
      .catch(err => {
        console.error('[Background] Error calling API:', err);
        sendResponse({ success: false, message: 'Server is currently offline.' });
      });
      
    return true; // Keep message channel open for async response
  }
});
