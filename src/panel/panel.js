import i18n from '../lib/i18n.js';
import { SecurityGuardrails } from '../lib/security.js';

const qs = sel => document.querySelector(sel);
const messagesEl = qs('#messages');
const inputEl = qs('#input');
const sendBtn = qs('#send');
const providerSelect = qs('#providerSelect');
const modelInput = qs('#modelInput');
const webhookSelect = qs('#webhookSelect');
const useSelectionEl = null; // Removed
const useContextEl = qs('#useContext');
const sendToN8NEl = qs('#sendToN8N');
const btnContext = null; // Removed
const btnSelection = null; // Removed
const btnClose = qs('#btnClose');
const openSettings = qs('#openSettings');
const btnNewChat = qs('#btnNewChat');
const btnHistory = qs('#btnHistory');
const btnLang = qs('#btnLang');

const mainEl = qs('.main');
const historyMainEl = qs('#history-main');
const historyListEl = qs('#history-list');

let currentChatId = null;

const saveCurrentChatToHistory = async () => {
  if (!conversation || conversation.length === 0) return;
  // Skip if only system message
  if (conversation.length === 1 && conversation[0].role === 'system') return;

  const { chatHistory = [] } = await chrome.storage.local.get(['chatHistory']);
  
  // Determine title
  const firstUserMsg = conversation.find(m => m.role === 'user');
  let title = firstUserMsg ? firstUserMsg.content : i18n.t('new_chat') || 'New Chat';
  if (title.length > 50) title = title.substring(0, 50) + '...';

  const timestamp = Date.now();
  
  if (currentChatId) {
    const idx = chatHistory.findIndex(item => item.id === currentChatId);
    if (idx >= 0) {
      // Update existing
      chatHistory[idx].messages = conversation;
      chatHistory[idx].title = title;
      chatHistory[idx].date = timestamp;
      // Move to top
      const item = chatHistory.splice(idx, 1)[0];
      chatHistory.unshift(item);
    } else {
      // ID not found (maybe deleted), create new
      const newItem = { id: currentChatId, title, date: timestamp, messages: conversation };
      chatHistory.unshift(newItem);
    }
  } else {
    // New chat, create ID
    currentChatId = timestamp;
    const newItem = { id: currentChatId, title, date: timestamp, messages: conversation };
    chatHistory.unshift(newItem);
  }

  // Limit history
  if (chatHistory.length > 100) {
    chatHistory.length = 100;
  }

  await chrome.storage.local.set({ chatHistory, currentChatId });
};

const renderHistoryList = async () => {
  const { chatHistory = [] } = await chrome.storage.local.get(['chatHistory']);
  historyListEl.innerHTML = '';
  
  if (chatHistory.length === 0) {
    historyListEl.innerHTML = `<div class="history-empty">${i18n.t('no_history') || 'No history'}</div>`;
    return;
  }

  chatHistory.forEach(item => {
    const el = document.createElement('div');
    el.className = 'history-item';
    const dateStr = new Date(item.date).toLocaleString();
    
    el.innerHTML = `
      <div class="history-item-actions">
        <div class="history-item-title">${item.title}</div>
        <button class="btn-delete-history" title="${i18n.t('delete')}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
      <div class="history-item-date">${dateStr}</div>
    `;
    
    // Click to restore
    el.addEventListener('click', (e) => {
      // If clicked delete button, don't restore
      if (e.target.closest('.btn-delete-history')) return;
      restoreChat(item);
    });

    // Delete button
    const delBtn = el.querySelector('.btn-delete-history');
    delBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm(i18n.t('confirm_delete') || 'Delete this chat?')) {
        await deleteHistoryItem(item.id);
        renderHistoryList();
      }
    });

    historyListEl.appendChild(el);
  });
};

const deleteHistoryItem = async (id) => {
  let { chatHistory = [] } = await chrome.storage.local.get(['chatHistory']);
  chatHistory = chatHistory.filter(item => item.id !== id);
  await chrome.storage.local.set({ chatHistory });
  if (currentChatId === id) {
    currentChatId = null;
    await chrome.storage.local.set({ currentChatId: null });
  }
};

const restoreChat = async (item) => {
  await saveCurrentChatToHistory(); // Save current before switching
  
  conversation = item.messages || [];
  currentChatId = item.id;
  await chrome.storage.local.set({ conversation, currentChatId });
  
  messagesEl.innerHTML = '';
  conversation.forEach(m => renderMessage(m.role, m.content));
  if (conversation.length) heroEl.style.display = 'none'; else heroEl.style.display = 'block';
  
  showMainView();
};

const showMainView = () => {
  mainEl.style.display = 'flex';
  historyMainEl.style.display = 'none';
};

const showHistoryView = () => {
  saveCurrentChatToHistory(); // Auto save when going to history
  mainEl.style.display = 'none';
  historyMainEl.style.display = 'flex';
  renderHistoryList();
};

if (btnHistory) {
  btnHistory.addEventListener('click', () => {
    if (historyMainEl.style.display === 'none') {
      showHistoryView();
    } else {
      showMainView();
    }
  });
}

if (btnBackToChat) {
  btnBackToChat.addEventListener('click', showMainView);
}

const resetConversation = async () => {
  await saveCurrentChatToHistory();
  conversation = [];
  currentChatId = null;
  messagesEl.innerHTML = '';
  heroEl.style.display = 'block';
  updateSelectionPreview('');
  await chrome.storage.local.remove(['conversation']);
  await chrome.storage.local.set({ currentChatId: null });
  showMainView();
};

const sendMessageToActiveTab = async (payload) => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return null;
    return await chrome.tabs.sendMessage(tab.id, payload);
  } catch (e) {
    console.error('Failed to send message to active tab:', e);
    return null;
  }
};

useContextEl.addEventListener('change', async () => {
  if (useContextEl.checked && !contextCache) {
    const data = await sendMessageToActiveTab({ type: 'REQUEST_CONTEXT' });
    if (data) {
      contextCache = data.content || '';
      pageMeta = { url: data.url, title: data.title };
    }
  }
});

btnNewChat.addEventListener('click', resetConversation);

if (btnLang) {
  btnLang.addEventListener('click', () => {
    i18n.toggle();
  });
}

const updateLangButton = () => {
  if (btnLang) {
     const text = i18n.lang === 'zh' ? '中' : 'EN';
     const span = btnLang.querySelector('.lang-text');
     if (span) span.textContent = text;
     else btnLang.innerHTML = `<span class="lang-text" style="font-weight: 600; font-size: 13px;">${text}</span>`;
  }
};

// Re-render on language change
i18n.onChange(() => {
  updateLangButton();
  messagesEl.innerHTML = '';
  conversation.forEach(m => renderMessage(m.role, m.content));
  updateProviderLabel();
  updateWebhookLabel();
  
  if (historyMainEl.style.display !== 'none') {
    renderHistoryList();
  }
});

const heroEl = qs('#hero');
const modelPill = null; // Removed

const selectionPreviewEl = qs('#selection-preview');
const selectionTextEl = qs('.selection-text');
const selectionCloseBtn = qs('.selection-close');

let selectionCache = '';

const updateSelectionPreview = (text) => {
  selectionCache = text;
  if (text) {
    selectionTextEl.textContent = text;
    selectionPreviewEl.style.display = 'flex';
  } else {
    selectionPreviewEl.style.display = 'none';
  }
};

selectionCloseBtn.addEventListener('click', () => {
  updateSelectionPreview('');
});

// Image Modal Logic
const imageModal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-image');
const modalClose = document.querySelector('.image-modal-close');

if (modalClose) {
  modalClose.onclick = () => {
    imageModal.style.display = 'none';
  };
}

if (imageModal) {
  imageModal.onclick = (e) => {
    if (e.target === imageModal) {
      imageModal.style.display = 'none';
    }
  };
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && imageModal && imageModal.style.display === 'flex') {
    imageModal.style.display = 'none';
  }
});

// Delegate event listener for images in messages
messagesEl.addEventListener('click', (e) => {
  if (e.target.tagName === 'IMG') {
    if (imageModal && modalImg) {
      imageModal.style.display = 'flex';
      modalImg.src = e.target.src;
    }
  }
});

// useSelectionEl removed, so we don't need to listen to it.
// Logic will just check if selectionCache is present.
let contextCache = '';
let pageMeta = { url: '', title: '' };
let conversation = [];
let providers = [];

const loadEnv = async () => {
  try {
  const url = chrome.runtime.getURL('env.json');
    const r = await fetch(url);
    if (!r.ok) return {};
    return await r.json();
  } catch { return {}; }
};

const updateModelDisplay = () => {
  const idx = providerSelect.value ? Number(providerSelect.value) : -1;
  if (idx >= 0 && providers[idx]) {
    modelInput.value = providers[idx].model || '';
  } else {
    modelInput.value = '';
  }
};

const loadConfigs = async () => {
  const { llmProviders = [], n8nWebhooks = [], defaults = {} } = await chrome.storage.local.get(['llmProviders','n8nWebhooks','defaults']);
  providers = llmProviders;
  let defs = { ...defaults };
  if (!providers.length) {
    const env = await loadEnv();
    const zhipuKey = env.ZHIPU_API_KEY || '';
    providers = [{ name: 'GLM', type: 'glm', apiKey: zhipuKey, baseUrl: 'https://open.bigmodel.cn' }];
    await chrome.storage.local.set({ llmProviders: providers });
  }
  // if (!defs.model) defs.model = 'glm-4-flash-250414'; // Removed: Rely on provider config
  if (defs.providerIndex == null) defs.providerIndex = 0;
  await chrome.storage.local.set({ defaults: defs });
  providerSelect.innerHTML = '';
  providers.forEach((p, idx) => {
    const opt = document.createElement('option');
    opt.value = String(idx);
    opt.textContent = p.name;
    providerSelect.appendChild(opt);
  });
  webhookSelect.innerHTML = '';
  n8nWebhooks.forEach((w, idx) => {
    const opt = document.createElement('option');
    opt.value = String(idx);
    opt.textContent = w.name;
    webhookSelect.appendChild(opt);
  });
  if (defs.providerIndex != null) providerSelect.value = String(defs.providerIndex);
  if (defs.webhookIndex != null) webhookSelect.value = String(defs.webhookIndex);
  // if (defs.model) modelInput.value = defs.model; // Removed: Use provider config
  
  updateModelDisplay();
  
  // Ensure n8n trigger is disabled by default to prevent accidental sends
  sendToN8NEl.checked = false;
  
  updateProviderLabel();
  updateWebhookLabel();
  updateN8NVisualState();
};

const updateN8NVisualState = () => {
  const isChecked = sendToN8NEl.checked;
  const webhookSelector = qs('.webhook-selector');
  if (webhookSelector) {
    if (isChecked) webhookSelector.classList.add('active');
    else webhookSelector.classList.remove('active');
  }
};

const updateProviderLabel = () => {
  const idx = providerSelect.selectedIndex;
  if (idx >= 0) {
    qs('#providerLabel').textContent = providerSelect.options[idx].textContent;
  }
};

const updateWebhookLabel = () => {
  const idx = webhookSelect.selectedIndex;
  if (idx >= 0) {
    qs('#webhookLabel').textContent = webhookSelect.options[idx].textContent;
  }
};

const saveDefaults = async () => {
  await chrome.storage.local.set({ defaults: {
    providerIndex: providerSelect.value ? Number(providerSelect.value) : null,
    webhookIndex: webhookSelect.value ? Number(webhookSelect.value) : null,
    model: modelInput.value || ''
  } });
};

const renderMessage = (role, content) => {
  const wrap = document.createElement('div');
  wrap.className = 'msg ' + (role === 'assistant' ? 'assistant' : '');
  const roleEl = document.createElement('div');
  roleEl.className = 'role';
  roleEl.textContent = i18n.t(role + '_role') || role;
  const bubble = document.createElement('div');
  bubble.className = 'bubble markdown-body';
  if (typeof marked !== 'undefined') {
    bubble.innerHTML = marked.parse(content);
  } else {
    bubble.textContent = content;
  }
  wrap.appendChild(roleEl);
  wrap.appendChild(bubble);

  // Add copy button
  const actionsEl = document.createElement('div');
  actionsEl.className = 'msg-actions';
  const copyBtn = document.createElement('button');
  copyBtn.className = 'msg-action-btn';
  copyBtn.title = i18n.t('copy');
  copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
  copyBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(content);
      const originalIcon = copyBtn.innerHTML;
      copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.innerHTML = originalIcon;
        copyBtn.classList.remove('copied');
      }, 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };
  actionsEl.appendChild(copyBtn);

  // Add "Send to n8n" button
  const sendToN8NBtn = document.createElement('button');
  sendToN8NBtn.className = 'msg-action-btn';
  sendToN8NBtn.title = i18n.t('send_msg_to_n8n');
  sendToN8NBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
  sendToN8NBtn.onclick = async () => {
    if (!sendToN8NEl.checked) {
      alert(i18n.t('activate_n8n_first'));
      return;
    }
    
    // Visual feedback
    const originalIcon = sendToN8NBtn.innerHTML;
    sendToN8NBtn.innerHTML = `<div class="loading-dots" style="transform: scale(0.5); min-width: 20px;"><span></span><span></span><span></span></div>`;
    sendToN8NBtn.disabled = true;

    try {
      // Construct a payload similar to handleSend but for a single message
      // We still include page context if available in global scope, but focus on this message
      const payload = {
        page: pageMeta,
        selection: selectionCache || '',
        context: useContextEl.checked ? contextCache : '',
        input: content, // The message content becomes the input
        messages: [{ role, content }], // Only this message
        model: modelInput.value.trim(),
        provider: null
      };

      const answer = await sendToN8N(payload);
      
      if (answer && !answer.startsWith(i18n.t('n8n_failure'))) {
        sendToN8NBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        sendToN8NBtn.classList.add('copied'); // Re-use green style
        sendToN8NBtn.title = i18n.t('sent_to_n8n');
        
        // Add n8n response to chat
        conversation.push({ role: 'assistant', content: answer });
        renderMessage('assistant', answer);
        await chrome.storage.local.set({ conversation });
      } else {
        throw new Error(answer);
      }
    } catch (e) {
      console.error('Send to n8n failed', e);
      
      // Show error in chat
      const errorMsg = String(e && e.message ? e.message : e);
      // Remove n8n_failure prefix if already present to avoid duplication
      const cleanError = errorMsg.replace(i18n.t('n8n_failure'), '').trim();
      const displayError = `${i18n.t('n8n_failure')}\n${cleanError}`;
      
      conversation.push({ role: 'assistant', content: displayError });
      renderMessage('assistant', displayError);
      await chrome.storage.local.set({ conversation });

      sendToN8NBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      sendToN8NBtn.title = i18n.t('send_failed');
      sendToN8NBtn.style.color = 'var(--danger-color)';
    } finally {
      setTimeout(() => {
        sendToN8NBtn.innerHTML = originalIcon;
        sendToN8NBtn.classList.remove('copied');
        sendToN8NBtn.style.color = '';
        sendToN8NBtn.disabled = false;
        sendToN8NBtn.title = i18n.t('send_msg_to_n8n');
      }, 2000);
    }
  };
  actionsEl.appendChild(sendToN8NBtn);

  wrap.appendChild(actionsEl);

  messagesEl.appendChild(wrap);
  messagesEl.scrollTop = messagesEl.scrollHeight;
};

const showLoading = () => {
  const wrap = document.createElement('div');
  wrap.className = 'msg assistant';
  const roleEl = document.createElement('div');
  roleEl.className = 'role';
  roleEl.textContent = i18n.t('assistant_role');
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
  wrap.appendChild(roleEl);
  wrap.appendChild(bubble);
  messagesEl.appendChild(wrap);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return wrap;
};

const normalizeMessages = () => conversation.map(m => ({ role: m.role, content: m.content }));

const callProvider = async (provider, model, messages) => {
  if (provider.type === 'openai' || provider.type === 'other') {
    const baseUrl = provider.baseUrl || 'https://api.openai.com';
    const r = await fetch(baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + provider.apiKey },
      body: JSON.stringify({ model, messages })
    });
    const data = await r.json();
    if (data.error) throw new Error(data.error.message || 'Provider error');
    return data.choices[0].message.content;
  }
  if (provider.type === 'openrouter') {
    const r = await fetch((provider.baseUrl || 'https://openrouter.ai') + '/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + provider.apiKey },
      body: JSON.stringify({ model, messages })
    });
    const data = await r.json();
    if (data.error) throw new Error(data.error.message || 'OpenRouter error');
    return data.choices[0].message.content;
  }
  if (provider.type === 'glm') {
    const r = await fetch((provider.baseUrl || 'https://open.bigmodel.cn') + '/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + provider.apiKey },
      body: JSON.stringify({ model, messages })
    });
    const data = await r.json();
    if (data.error) throw new Error(data.error.message || 'GLM error');
    const choice = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
    return choice || data?.data?.output_text || '';
  }
  if (provider.type === 'gemini') {
    const baseUrl = provider.baseUrl || 'https://generativelanguage.googleapis.com';
    const targetModel = model || 'gemini-3-flash-preview';
    
    // Separate system message
    const systemMsg = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system');
    
    const contents = chatMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    
    const body = { contents };
    if (systemMsg) {
      body.system_instruction = { parts: [{ text: systemMsg.content }] };
    }
    
    const r = await fetch(`${baseUrl}/v1beta/models/${targetModel}:generateContent?key=${provider.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await r.json();
    if (data.error) throw new Error(data.error.message || 'Gemini error');
    
    if (!data.candidates || !data.candidates.length) {
       if (data.promptFeedback && data.promptFeedback.blockReason) {
          throw new Error(`Blocked: ${data.promptFeedback.blockReason}`);
       }
       throw new Error('No response from Gemini');
    }
    
    const parts = data.candidates[0].content.parts;
    if (parts && parts.length > 0) {
        return parts.map(p => p.text).join('');
    }
    return '';
  }
  throw new Error('Unsupported provider');
};

const sendToN8N = async payload => {
  const { n8nWebhooks = [] } = await chrome.storage.local.get(['n8nWebhooks']);
  const idx = webhookSelect.value ? Number(webhookSelect.value) : -1;
  if (idx < 0 || !n8nWebhooks[idx]) {
    return i18n.t('error_no_webhook');
  }
  const webhook = n8nWebhooks[idx];
  const headers = { 'Content-Type': 'application/json' };
  if (webhook.user && webhook.pass) {
    headers['Authorization'] = 'Basic ' + btoa(webhook.user + ':' + webhook.pass);
  }

  // Format payload as text
  const parts = [];
  if (payload.page && payload.page.title) parts.push(`Page: ${payload.page.title} (${payload.page.url})`);
  if (payload.selection) parts.push(`[Selection]\n${payload.selection}`);
  if (payload.context) parts.push(`[Context]\n${payload.context}`);
  if (payload.messages && payload.messages.length) {
    const history = payload.messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    parts.push(`[Chat History]\n${history}`);
  }
  if (payload.input) parts.push(`[User Input]\n${payload.input}`);
  const formattedText = parts.join('\n\n');

  // Add formatted text to payload
  // Add chatInput and guardrailsInput aliases for compatibility with various n8n nodes
  // Add message field to match user's n8n workflow configuration ({{ $json.body.message }})
  const finalPayload = { 
    ...payload, 
    text: formattedText,
    chatInput: formattedText,
    guardrailsInput: formattedText,
    message: formattedText
  };
  
  // Support custom field mapping
  if (webhook.field) {
    finalPayload[webhook.field] = formattedText;
  }

  try {
    const r = await fetch(webhook.url, { method: 'POST', headers, body: JSON.stringify(finalPayload) });
    const textBody = await r.text();

    if (!r.ok) {
      let errorMsg = `HTTP Error ${r.status}: ${r.statusText}`;
      try {
        const json = JSON.parse(textBody);
        if (json.message) errorMsg += `\nMessage: ${json.message}`;
        if (json.code) errorMsg += `\nCode: ${json.code}`;
        if (json.hint) errorMsg += `\nHint: ${json.hint}`;
      } catch {
        if (textBody && textBody.length < 500) errorMsg += `\nResponse: ${textBody}`;
        else if (textBody) errorMsg += `\nResponse: ${textBody.substring(0, 200)}...`;
      }

      // Add troubleshooting hints based on status code
      if (r.status === 500) {
        errorMsg += '\n\n建议排查:';
        errorMsg += '\n1. 检查 n8n 工作流执行日志 (Executions)，查看具体报错节点。';
        errorMsg += '\n2. 如果是 Test URL，请确保在 n8n 编辑器中点击了 "Execute" 按钮。';
        errorMsg += '\n3. 页面上下文可能过大，导致 Payload 超出服务器限制 (500/413)。尝试不勾选 "引用网页全文"。';
      } else if (r.status === 404) {
        errorMsg += '\n\n建议排查:';
        errorMsg += '\n1. Webhook URL 是否正确？';
        errorMsg += '\n2. 工作流是否已激活 (Active)？';
      } else if (r.status === 401 || r.status === 403) {
        errorMsg += '\n\n建议排查:';
        errorMsg += '\n1. 检查 Webhook 节点的身份验证设置 (Basic Auth/Header Auth)。';
        errorMsg += '\n2. 确认插件设置中的用户名密码是否匹配。';
      }

      return `${i18n.t('n8n_failure')}\n${errorMsg}`;
    }

    const contentType = r.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json') && textBody.trim()) {
      try {
        const json = JSON.parse(textBody);
        
        let responseText = '';

        // Handle n8n binary/image response format
        // Example: { "created": ..., "data": [ { "url": "..." } ] }
        if (json.data && Array.isArray(json.data)) {
          json.data.forEach(item => {
            if (item.url) {
              responseText += `![Image](${item.url})\n\n`;
            }
          });
        }

        // Try to find common text fields
        let textContent = json.output || json.text || json.message || json.content;
        
        // If we found images but no text, we are done (unless we want to dump the rest of json?)
        // If we found text, append it.
        if (textContent) {
           responseText += (typeof textContent === 'string' ? textContent : JSON.stringify(textContent, null, 2));
        } else if (!responseText) {
           // No images and no standard text field found, dump the whole JSON
           responseText = JSON.stringify(json, null, 2);
        }
        
        return responseText.trim();
      } catch (parseError) {
        // Fallback to text if parsing fails despite header
        return textBody;
      }
    }
    return textBody;
  } catch (e) {
    return `${i18n.t('n8n_failure')}\n${e.message}`;
  }
};

const handleSend = async () => {
  const userText = inputEl.value.trim();
  if (!userText) return;

  // Security Guardrails: Process Input
  // This validates against prompt injection and redacts sensitive info
  const securityCheck = SecurityGuardrails.process(userText);
  if (!securityCheck.safe) {
    // Block the request if unsafe
    renderMessage('assistant', i18n.t('security_alert') + securityCheck.error);
    inputEl.value = '';
    return;
  }

  const processedText = securityCheck.content;

  heroEl.style.display = 'none';
  const { llmProviders = [] } = await chrome.storage.local.get(['llmProviders']);
  const providerIdx = providerSelect.value ? Number(providerSelect.value) : -1;
  const provider = providerIdx >= 0 ? llmProviders[providerIdx] : null;
  const model = modelInput.value.trim();
  // Automatic selection usage if cache exists
  const selection = selectionCache || '';
  const context = useContextEl.checked ? contextCache : '';
  const systemParts = [];
  if (selection) systemParts.push(i18n.t('selection_prefix') + selection);
  if (context) systemParts.push(i18n.t('context_prefix') + context.substring(0, 8000));
  if (systemParts.length) conversation.push({ role: 'system', content: systemParts.join('\n\n') });
  conversation.push({ role: 'user', content: processedText });
  renderMessage('user', processedText);
  inputEl.value = '';
  // Clear selection after sending
  updateSelectionPreview('');

  let loadingEl = null;

  try {
    if (sendToN8NEl.checked) {
      loadingEl = showLoading();
      const answer = await sendToN8N({ page: pageMeta, selection, context, input: processedText, messages: normalizeMessages(), model, provider: null });
      if (loadingEl) loadingEl.remove();

      if (answer) {
        conversation.push({ role: 'assistant', content: answer });
        renderMessage('assistant', answer);
        await chrome.storage.local.set({ conversation });
      } else {
        const errMsg = i18n.t('n8n_no_response');
        conversation.push({ role: 'assistant', content: errMsg });
        renderMessage('assistant', errMsg);
        await chrome.storage.local.set({ conversation });
      }
    } else {
      if (!provider) throw new Error(i18n.t('error_no_provider'));
      if (!model) throw new Error(i18n.t('error_no_model'));
      
      loadingEl = showLoading();
      const answer = await callProvider(provider, model, normalizeMessages());
      if (loadingEl) loadingEl.remove();

      conversation.push({ role: 'assistant', content: answer });
      renderMessage('assistant', answer);
      await chrome.storage.local.set({ conversation });
    }
  } catch (e) {
    if (loadingEl) loadingEl.remove();
    const err = String(e && e.message ? e.message : e);
    renderMessage('assistant', i18n.t('error_prefix') + err);
  } finally {
    const last = conversation[conversation.length - 1];
    if (last && last.role === 'system') conversation.pop();
  }
};

sendBtn.addEventListener('click', handleSend);
inputEl.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } });
providerSelect.addEventListener('change', () => { 
  saveDefaults(); 
  updateProviderLabel(); 
  updateModelDisplay();
});
webhookSelect.addEventListener('change', () => { saveDefaults(); updateWebhookLabel(); });
sendToN8NEl.addEventListener('change', updateN8NVisualState);
modelInput.addEventListener('blur', () => { saveDefaults(); });

btnClose.style.display = 'none'; // Hide close button in Side Panel mode
const btnFullscreen = qs('#btnFullscreen');
  if (btnFullscreen) btnFullscreen.style.display = 'none'; // Hide fullscreen button

  // Listen for messages from content script or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SELECTION_UPDATE') {
    updateSelectionPreview(request.selection);
  }
  if (request.type === 'chat_selection') {
    updateSelectionPreview(request.selectionText);
  }
  if (request.type === 'send_selection_n8n') {
    handleExternalAction('send_selection_n8n', request.selectionText);
  }
});

openSettings.addEventListener('click', e => { e.preventDefault(); chrome.runtime.openOptionsPage(); });

const handleExternalAction = async (type, text, page) => {
  if (type === 'chat_selection') {
    updateSelectionPreview(text || '');
  }
  if (type === 'send_selection_n8n') {
    updateSelectionPreview(text || '');
    // Need page context for N8N?
    if (!page) {
       const data = await sendMessageToActiveTab({ type: 'REQUEST_CONTEXT' });
       if (data) page = { url: data.url, title: data.title };
    }
    pageMeta = page || pageMeta;
    
    const loadingEl = showLoading();
    sendToN8N({ page: pageMeta, selection: selectionCache, context: '', input: '', messages: [], model: modelInput.value.trim(), provider: null })
      .then(async answer => {
        if (loadingEl) loadingEl.remove();
        if (answer) {
          conversation.push({ role: 'assistant', content: answer });
          renderMessage('assistant', answer);
          await chrome.storage.local.set({ conversation });
        } else {
          const errMsg = i18n.t('n8n_no_response');
          conversation.push({ role: 'assistant', content: errMsg });
          renderMessage('assistant', errMsg);
          await chrome.storage.local.set({ conversation });
        }
      })
      .catch(e => {
        if (loadingEl) loadingEl.remove();
        const err = String(e && e.message ? e.message : e);
        renderMessage('assistant', i18n.t('error_prefix') + err);
      });
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'chat_selection') {
    handleExternalAction('chat_selection', request.selectionText);
  }
  if (request.type === 'send_selection_n8n') {
    handleExternalAction('send_selection_n8n', request.selectionText);
  }
  if (request.type === 'SELECTION_UPDATE') {
    updateSelectionPreview(request.selection);
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes.llmProviders || changes.defaults) {
      loadConfigs();
    }
    if (changes.language) {
      i18n.init().then(() => {
        i18n.apply();
        updateProviderLabel();
        updateLangButton();
      });
    }
  }
});

const bootstrap = async () => {
  await i18n.init();
  updateLangButton();
  await loadConfigs();
  const state = await chrome.storage.local.get(['conversation', 'pendingAction', 'currentChatId']);
  conversation = state.conversation || [];
  currentChatId = state.currentChatId || null;
  conversation.forEach(m => renderMessage(m.role, m.content));
  if (conversation.length) heroEl.style.display = 'none'; else heroEl.style.display = 'block';
  
  // Check for pending actions from context menu
  if (state.pendingAction) {
    const { type, selectionText } = state.pendingAction;
    await chrome.storage.local.remove('pendingAction'); // Clear it
    handleExternalAction(type, selectionText);
  }
};

bootstrap();
