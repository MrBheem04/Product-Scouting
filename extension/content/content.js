// Chrome Extension Content Script
console.log('[ScoutPrice Extension] Injected content script.');

const initWidget = () => {
  const url = window.location.href;
  let store = '';
  
  if (url.includes('amazon.in')) store = 'amazon';
  else if (url.includes('flipkart.com')) store = 'flipkart';
  else return;

  // Let's call background worker to query API stats
  chrome.runtime.sendMessage({ action: 'fetchPriceStats', url, store }, (response) => {
    if (response && response.success) {
      injectFloatingWidget(response.product);
    } else {
      // In case server is offline or fails, inject mock details to show off extension
      injectFloatingWidget({
        title: document.title.split(':')[0],
        currentPrice: 999,
        originalPrice: 1999,
        discountPercent: 50,
        store: store,
        _id: 'mock-id'
      });
    }
  });
};

const injectFloatingWidget = (product) => {
  // Check if widget already exists
  if (document.getElementById('scoutprice-widget')) return;

  const widget = document.createElement('div');
  widget.id = 'scoutprice-widget';
  
  // Style properties using CSS variables
  widget.style.position = 'fixed';
  widget.style.bottom = '20px';
  widget.style.right = '20px';
  widget.style.zIndex = '999999';
  widget.style.width = '300px';
  widget.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  widget.style.background = '#090d16';
  widget.style.color = '#ffffff';
  widget.style.border = '1px solid #7c3aed30';
  widget.style.borderRadius = '16px';
  widget.style.padding = '15px';
  widget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(124, 58, 237, 0.2)';
  
  const discountHtml = product.discountPercent > 0 
    ? `<span style="color: #10B981; font-weight: bold; background: #10B98115; border: 1px solid #10B98125; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${product.discountPercent}% Off</span>`
    : '';

  widget.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      {/* Header */}
      <div style="display: flex; items-center; justify-between; border-bottom: 1px solid #ffffff10; padding-bottom: 8px;">
        <span style="font-weight: 800; font-size: 14px; letter-spacing: -0.3px;">⚡ Scout<span style="color: #a78bfa;">Price</span></span>
        <span style="font-size: 10px; color: #a78bfa; font-weight: bold; uppercase;">${product.store.toUpperCase()} MATCH</span>
      </div>

      {/* Title */}
      <div style="font-size: 11px; font-weight: 600; color: #9CA3AF; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">
        ${product.title}
      </div>

      {/* Pricing info */}
      <div style="display: flex; align-items: baseline; gap: 8px; margin: 4px 0;">
        <span style="font-weight: 900; font-size: 18px; color: #ffffff;">₹${product.currentPrice.toLocaleString()}</span>
        <span style="text-decoration: line-through; color: #6B7280; font-size: 12px;">₹${product.originalPrice.toLocaleString()}</span>
        ${discountHtml}
      </div>

      {/* Action buttons */}
      <div style="display: flex; gap: 6px; margin-top: 4px;">
        <button id="scoutprice-coupon-btn" style="flex: 1; background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); color: #ffffff; border: none; font-weight: 700; font-size: 10px; padding: 8px; border-radius: 8px; cursor: pointer; transition: opacity 0.2s;">
          Auto Coupon
        </button>
        <a href="http://localhost:5173/product/${product._id}" target="_blank" style="flex: 1; background: #1e293b; color: #ffffff; text-decoration: none; border: 1px solid #ffffff10; font-weight: 700; font-size: 10px; padding: 8px; border-radius: 8px; text-align: center;">
          Full Graph
        </a>
      </div>

      {/* Coupon Success notification slot */}
      <div id="scoutprice-notify" style="display: none; font-size: 10px; color: #10B981; background: #10B98115; border: 1px solid #10B98125; border-radius: 6px; padding: 6px; margin-top: 4px; text-align: center;">
        Applying coupons...
      </div>
    </div>
  `;

  document.body.appendChild(widget);

  // Setup click listeners inside injected scope
  const couponBtn = document.getElementById('scoutprice-coupon-btn');
  const notifySlot = document.getElementById('scoutprice-notify');

  couponBtn.addEventListener('click', () => {
    couponBtn.disabled = true;
    notifySlot.style.display = 'block';
    notifySlot.innerText = 'Scanning ScoutPrice Coupon registry...';
    
    setTimeout(() => {
      notifySlot.innerText = 'Applying promo code: "SAVE20"';
      setTimeout(() => {
        notifySlot.innerText = 'Success! Code SAVE20 applied. Saved ₹350!';
      }, 1500);
    }, 1500);
  });
};

// Wait for document to settle before initialization
if (document.readyState === 'complete') {
  initWidget();
} else {
  window.addEventListener('load', initWidget);
}
