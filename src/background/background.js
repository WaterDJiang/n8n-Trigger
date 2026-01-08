import i18n from '../lib/i18n.js';

// Configure side panel behavior
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

const createContextMenus = () => {
  chrome.contextMenus.create({ id: "open_chat", title: i18n.t("context_open_chat"), contexts: ["page"] });
  chrome.contextMenus.create({ id: "chat_selection", title: i18n.t("context_chat_selection"), contexts: ["selection"] });
  chrome.contextMenus.create({ id: "send_selection_n8n", title: i18n.t("context_send_n8n"), contexts: ["selection"] });
};

const updateContextMenus = () => {
  chrome.contextMenus.update("open_chat", { title: i18n.t("context_open_chat") });
  chrome.contextMenus.update("chat_selection", { title: i18n.t("context_chat_selection") });
  chrome.contextMenus.update("send_selection_n8n", { title: i18n.t("context_send_n8n") });
};

chrome.runtime.onInstalled.addListener(async () => {
  await i18n.init();
  chrome.contextMenus.removeAll(() => {
    createContextMenus();
  });
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'local' && changes.language) {
    await i18n.init();
    updateContextMenus();
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  // Open side panel for all actions
  await chrome.sidePanel.open({ windowId: tab.windowId });

  if (info.menuItemId === "chat_selection") {
    const payload = {
      type: "chat_selection",
      selectionText: info.selectionText
    };
    
    // Store in storage so panel can pick it up if it's just opening
    chrome.storage.local.set({ pendingAction: payload });
    
    // Also try sending message directly if panel is already listening
    setTimeout(() => {
      chrome.runtime.sendMessage(payload).catch(() => {});
    }, 500);
  }

  if (info.menuItemId === "send_selection_n8n") {
    const payload = {
      type: "send_selection_n8n",
      selectionText: info.selectionText
    };
    
    chrome.storage.local.set({ pendingAction: payload });
    
    setTimeout(() => {
      chrome.runtime.sendMessage(payload).catch(() => {});
    }, 500);
  }
});
