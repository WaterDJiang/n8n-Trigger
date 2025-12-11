const togglePanelOnTab = async tabId => {
  try {
    await chrome.tabs.sendMessage(tabId, { type: "toggle_panel" });
  } catch {}
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: "open_chat", title: "打开侧边聊天", contexts: ["page"] });
  chrome.contextMenus.create({ id: "chat_selection", title: "用选中内容聊天", contexts: ["selection"] });
  chrome.contextMenus.create({ id: "send_selection_n8n", title: "将选中内容发送到 n8n", contexts: ["selection"] });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id) return;
  if (info.menuItemId === "open_chat") togglePanelOnTab(tab.id);
  if (info.menuItemId === "chat_selection") chrome.tabs.sendMessage(tab.id, { type: "chat_selection" });
  if (info.menuItemId === "send_selection_n8n") chrome.tabs.sendMessage(tab.id, { type: "send_selection_n8n" });
});

chrome.action.onClicked.addListener(tab => {
  if (!tab || !tab.id) return;
  togglePanelOnTab(tab.id);
});
