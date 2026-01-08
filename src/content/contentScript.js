// contentScript.js
// Only handles page interaction and data retrieval

// Listen for messages from background or side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "REQUEST_CONTEXT") {
    sendResponse({
      content: document.body.innerText,
      url: window.location.href,
      title: document.title
    });
    return true;
  }
  
  if (request.type === "GET_SELECTION") {
    sendResponse({
      selection: window.getSelection().toString()
    });
    return true;
  }
});

// Monitor selection changes and push to panel
const sendSelection = () => {
  const selection = window.getSelection().toString().trim();
  if (selection) {
    chrome.runtime.sendMessage({
      type: 'SELECTION_UPDATE',
      selection
    }).catch(() => {
      // Ignore errors if panel is closed
    });
  }
};

// Debounce helper
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const debouncedSend = debounce(sendSelection, 300);

document.addEventListener('mouseup', debouncedSend);
document.addEventListener('keyup', debouncedSend);
