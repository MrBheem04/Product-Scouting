// Extension Popup Script
console.log('[ScoutPrice Popup] Popup script active.');

document.getElementById('search-btn').addEventListener('click', () => {
  const query = document.getElementById('popup-search').value.trim();
  if (query) {
    // Open main page search in new tab
    chrome.tabs.create({ url: `http://localhost:5173/search?q=${encodeURIComponent(query)}` });
  }
});

// Pressing enter triggers search
document.getElementById('popup-search').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('search-btn').click();
  }
});
