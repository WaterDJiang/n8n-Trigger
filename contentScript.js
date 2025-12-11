let panelIframe = null;
let resizeHandle = null;
let dragOverlay = null;
let originalBodyMarginRight = "";
let isPanelVisible = false; // Explicit state tracking
let panelWidth = 420; // Default width

const createPanel = () => {
  if (panelIframe) return panelIframe;
  
  // Create Iframe
  panelIframe = document.createElement("iframe");
  panelIframe.src = chrome.runtime.getURL("panel.html");
  panelIframe.style.position = "fixed";
  panelIframe.style.top = "0";
  panelIframe.style.right = "0";
  panelIframe.style.width = `${panelWidth}px`;
  panelIframe.style.height = "100vh";
  panelIframe.style.border = "0";
  panelIframe.style.zIndex = "2147483646";
  panelIframe.style.boxShadow = "-8px 0 24px rgba(0,0,0,0.12)";
  panelIframe.style.transition = "transform 0.35s cubic-bezier(0.19, 1, 0.22, 1)";
  panelIframe.style.transform = "translateX(100%)";
  document.documentElement.appendChild(panelIframe);

  // Create Resize Handle
  resizeHandle = document.createElement("div");
  resizeHandle.style.position = "fixed";
  resizeHandle.style.top = "0";
  resizeHandle.style.bottom = "0";
  resizeHandle.style.width = "12px"; // Hit area
  resizeHandle.style.right = `${panelWidth}px`; // Match iframe width
  resizeHandle.style.cursor = "col-resize";
  resizeHandle.style.zIndex = "2147483647"; // Above iframe
  resizeHandle.style.transform = "translateX(50%)"; // Center over edge
  resizeHandle.style.transition = "background 0.2s, transform 0.35s cubic-bezier(0.19, 1, 0.22, 1)"; // Sync slide with panel
  resizeHandle.style.transform = "translateX(100%)"; // Initially hidden
  
  // Visual line inside handle
  const line = document.createElement("div");
  line.style.width = "4px";
  line.style.height = "100%";
  line.style.margin = "0 auto";
  line.style.transition = "background 0.2s";
  resizeHandle.appendChild(line);

  resizeHandle.addEventListener("mouseenter", () => {
    line.style.background = "rgba(47, 129, 247, 0.5)";
  });
  resizeHandle.addEventListener("mouseleave", () => {
    if (!isDragging) line.style.background = "transparent";
  });
  
  resizeHandle.addEventListener("mousedown", startDrag);
  document.documentElement.appendChild(resizeHandle);

  return panelIframe;
};

let isDragging = false;
let startX = 0;
let startWidth = 0;

const startDrag = (e) => {
  e.preventDefault();
  isDragging = true;
  startX = e.clientX;
  startWidth = panelWidth;
  
  // Create overlay to catch events over iframe
  dragOverlay = document.createElement("div");
  dragOverlay.style.position = "fixed";
  dragOverlay.style.top = "0";
  dragOverlay.style.left = "0";
  dragOverlay.style.width = "100vw";
  dragOverlay.style.height = "100vh";
  dragOverlay.style.zIndex = "2147483648";
  dragOverlay.style.cursor = "col-resize";
  document.documentElement.appendChild(dragOverlay);
  
  // Disable transitions during drag
  panelIframe.style.transition = "none";
  resizeHandle.style.transition = "none";
  document.body.style.transition = "none";
  
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
};

const onDrag = (e) => {
  if (!isDragging) return;
  const deltaX = startX - e.clientX;
  let newWidth = startWidth + deltaX;
  
  // Constraints
  newWidth = Math.max(300, Math.min(newWidth, window.innerWidth - 50));
  
  panelWidth = newWidth;
  updatePanelWidth();
};

const stopDrag = () => {
  isDragging = false;
  if (dragOverlay) {
    dragOverlay.remove();
    dragOverlay = null;
  }
  
  // Re-enable transitions
  // Note: We only want transitions for transform (sliding in/out), 
  // but if we leave width transition on, resizing might lag. 
  // However, open/close uses transform, so we can restore the transform transition.
  panelIframe.style.transition = "transform 0.35s cubic-bezier(0.19, 1, 0.22, 1)";
  resizeHandle.style.transition = "background 0.2s, transform 0.35s cubic-bezier(0.19, 1, 0.22, 1)";
  
  // Clean up listeners
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
};

const updatePanelWidth = () => {
  if (panelIframe) panelIframe.style.width = `${panelWidth}px`;
  if (resizeHandle) resizeHandle.style.right = `${panelWidth}px`;
  if (isPanelVisible) document.body.style.marginRight = `${panelWidth}px`;
};

const openPanel = () => {
  if (!panelIframe) createPanel();
  isPanelVisible = true;
  requestAnimationFrame(() => {
    if (panelIframe) panelIframe.style.transform = "translateX(0)";
    if (resizeHandle) {
        resizeHandle.style.transform = "translateX(50%)"; // Move to edge position
        // Ensure right property is correct in case it was hidden
        resizeHandle.style.right = `${panelWidth}px`; 
    }
    if (document.body.style.marginRight !== `${panelWidth}px`) {
      originalBodyMarginRight = document.body.style.marginRight;
      document.body.style.transition = "margin-right 0.35s cubic-bezier(0.19, 1, 0.22, 1)";
      document.body.style.marginRight = `${panelWidth}px`;
    }
  });
  sendSelection();
};

const closePanel = () => {
  if (panelIframe) {
    isPanelVisible = false;
    panelIframe.style.transform = "translateX(100%)";
    if (resizeHandle) resizeHandle.style.transform = "translateX(100%)"; // Hide handle offscreen
    document.body.style.marginRight = originalBodyMarginRight;
  }
};

const togglePanel = () => {
  if (!panelIframe) {
    openPanel();
    return;
  }
  if (isPanelVisible) closePanel(); else openPanel();
};

const getSelectionText = () => {
  const sel = window.getSelection();
  return sel ? sel.toString().trim() : "";
};

const getPageText = () => document.body ? document.body.innerText || "" : "";

const sendSelection = () => {
  const text = getSelectionText();
  // Only send if panel is visible and we have text
  // Or if we just opened it (isPanelVisible is true)
  if (isPanelVisible && text && panelIframe && panelIframe.contentWindow) {
    panelIframe.contentWindow.postMessage({ type: "SELECTION", text }, "*");
  }
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "toggle_panel") togglePanel();
  if (msg.type === "chat_selection") {
    openPanel();
    // Force send even if it seems redundant, as user explicitly requested it
    setTimeout(sendSelection, 100);
  }
  if (msg.type === "send_selection_n8n") {
    openPanel();
    const text = getSelectionText();
    if (panelIframe && panelIframe.contentWindow) {
      panelIframe.contentWindow.postMessage({ 
        type: "SEND_SELECTION_N8N", 
        text, 
        page: { url: location.href, title: document.title } 
      }, "*");
    }
  }
});

let selectionTimeout;
const handleSelectionChange = () => {
  if (!panelIframe || !isPanelVisible) return;
  
  clearTimeout(selectionTimeout);
  selectionTimeout = setTimeout(() => {
    sendSelection();
  }, 200); // Debounce 200ms
};

document.addEventListener("selectionchange", handleSelectionChange);

// Also trigger on mouseup for faster response
document.addEventListener("mouseup", () => {
  if (!panelIframe || !isPanelVisible) return;
  setTimeout(sendSelection, 50);
});

window.addEventListener("message", e => {
  if (e.source !== panelIframe?.contentWindow) return;
  const data = e.data || {};
  
  if (data.type === "REQUEST_SELECTION") {
    sendSelection();
  }
  
  if (data.type === "REQUEST_CONTEXT") {
    const text = getPageText();
    panelIframe.contentWindow.postMessage({ type: "CONTEXT", text, page: { url: location.href, title: document.title } }, "*");
  }
  
  if (data.type === "PANEL_TOGGLE_FULLSCREEN") {
    const isFull = panelIframe && panelIframe.style.width === "100vw";
    if (panelIframe) {
      panelIframe.style.width = isFull ? "420px" : "100vw";
      panelIframe.style.right = "0";
      panelIframe.style.left = isFull ? "" : "0";
    }
  }
  
  if (data.type === "TOGGLE_PANEL_FROM_IFRAME") togglePanel();
  
  if (data.type === "PANEL_READY") {
    // Panel just loaded/reloaded
    isPanelVisible = true; // Ensure state is synced
    sendSelection();
  }
});
