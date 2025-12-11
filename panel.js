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
const btnContext = qs('#btnContext');
const btnSelection = qs('#btnSelection');
const btnClose = qs('#btnClose');
const openSettings = qs('#openSettings');
const btnNewChat = qs('#btnNewChat');

const resetConversation = async () => {
  conversation = [];
  messagesEl.innerHTML = '';
  heroEl.style.display = 'block';
  updateSelectionPreview('');
  await chrome.storage.local.remove(['conversation']);
};

useContextEl.addEventListener('change', () => {
  if (useContextEl.checked && !contextCache) {
    parent.postMessage({ type: 'REQUEST_CONTEXT' }, '*');
  }
});

btnNewChat.addEventListener('click', resetConversation);
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

// useSelectionEl removed, so we don't need to listen to it.
// Logic will just check if selectionCache is present.
let contextCache = '';
let pageMeta = { url: '', title: '' };
let conversation = [];

const loadEnv = async () => {
  try {
    const url = chrome.runtime.getURL('env.json');
    const r = await fetch(url);
    if (!r.ok) return {};
    return await r.json();
  } catch { return {}; }
};

const loadConfigs = async () => {
  const { llmProviders = [], n8nWebhooks = [], defaults = {} } = await chrome.storage.local.get(['llmProviders','n8nWebhooks','defaults']);
  let providers = llmProviders;
  let defs = { ...defaults };
  if (!providers.length) {
    const env = await loadEnv();
    const zhipuKey = env.ZHIPU_API_KEY || '';
    providers = [{ name: 'GLM', type: 'glm', apiKey: zhipuKey, baseUrl: 'https://open.bigmodel.cn' }];
    await chrome.storage.local.set({ llmProviders: providers });
  }
  if (!defs.model) defs.model = 'glm-4-flash-250414';
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
  if (defs.model) modelInput.value = defs.model;
  
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
  roleEl.textContent = role;
  const bubble = document.createElement('div');
  bubble.className = 'bubble markdown-body';
  if (typeof marked !== 'undefined') {
    bubble.innerHTML = marked.parse(content);
  } else {
    bubble.textContent = content;
  }
  wrap.appendChild(roleEl);
  wrap.appendChild(bubble);
  messagesEl.appendChild(wrap);
  messagesEl.scrollTop = messagesEl.scrollHeight;
};

const showLoading = () => {
  const wrap = document.createElement('div');
  wrap.className = 'msg assistant';
  const roleEl = document.createElement('div');
  roleEl.className = 'role';
  roleEl.textContent = 'assistant';
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
  if (provider.type === 'openai') {
    const r = await fetch((provider.baseUrl || 'https://api.openai.com') + '/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + provider.apiKey },
      body: JSON.stringify({ model, messages })
    });
    const data = await r.json();
    if (data.error) throw new Error(data.error.message || 'OpenAI error');
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
  throw new Error('Unsupported provider');
};

const sendToN8N = async payload => {
  const { n8nWebhooks = [] } = await chrome.storage.local.get(['n8nWebhooks']);
  const idx = webhookSelect.value ? Number(webhookSelect.value) : -1;
  if (idx < 0 || !n8nWebhooks[idx]) {
    return '错误: 未选择有效的 n8n Webhook。请在设置中添加并选择一个 Webhook。';
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

      return `N8N 请求失败:\n${errorMsg}`;
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
    return 'Error calling N8N: ' + e.message;
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
    renderMessage('assistant', 'Security Alert: ' + securityCheck.error);
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
  if (selection) systemParts.push('选中内容: ' + selection);
  if (context) systemParts.push('页面上下文: ' + context.substring(0, 8000));
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
        const errMsg = 'n8n 未返回任何内容';
        conversation.push({ role: 'assistant', content: errMsg });
        renderMessage('assistant', errMsg);
        await chrome.storage.local.set({ conversation });
      }
    } else {
      if (!provider) throw new Error('未选择提供商');
      if (!model) throw new Error('未填写模型');
      
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
    renderMessage('assistant', '错误: ' + err);
  } finally {
    const last = conversation[conversation.length - 1];
    if (last && last.role === 'system') conversation.pop();
  }
};

sendBtn.addEventListener('click', handleSend);
inputEl.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } });
providerSelect.addEventListener('change', () => { saveDefaults(); updateProviderLabel(); });
webhookSelect.addEventListener('change', () => { saveDefaults(); updateWebhookLabel(); });
sendToN8NEl.addEventListener('change', updateN8NVisualState);
modelInput.addEventListener('blur', () => { saveDefaults(); });

btnClose.addEventListener('click', () => parent.postMessage({ type: 'TOGGLE_PANEL_FROM_IFRAME' }, '*'));
btnContext.addEventListener('click', () => parent.postMessage({ type: 'REQUEST_CONTEXT' }, '*'));
btnSelection.addEventListener('click', () => parent.postMessage({ type: 'REQUEST_SELECTION' }, '*'));
openSettings.addEventListener('click', e => { e.preventDefault(); window.open(chrome.runtime.getURL('options.html'), '_blank'); });
const btnFullscreen = qs('#btnFullscreen');
btnFullscreen.addEventListener('click', () => parent.postMessage({ type: 'PANEL_TOGGLE_FULLSCREEN' }, '*'));

window.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type === 'SELECTION') updateSelectionPreview(d.text || '');
  if (d.type === 'CONTEXT') { contextCache = d.text || ''; pageMeta = d.page || pageMeta; }
  if (d.type === 'SEND_SELECTION_N8N') {
    updateSelectionPreview(d.text || '');
    pageMeta = d.page || pageMeta;
    const loadingEl = showLoading();
    sendToN8N({ page: pageMeta, selection: selectionCache, context: '', input: '', messages: [], model: modelInput.value.trim(), provider: null })
      .then(async answer => {
        if (loadingEl) loadingEl.remove();
        if (answer) {
          conversation.push({ role: 'assistant', content: answer });
          renderMessage('assistant', answer);
          await chrome.storage.local.set({ conversation });
        } else {
          const errMsg = 'n8n 未返回任何内容';
          conversation.push({ role: 'assistant', content: errMsg });
          renderMessage('assistant', errMsg);
          await chrome.storage.local.set({ conversation });
        }
      })
      .catch(e => {
        if (loadingEl) loadingEl.remove();
        const err = String(e && e.message ? e.message : e);
        renderMessage('assistant', '错误: ' + err);
      });
  }
});

const bootstrap = async () => {
  await loadConfigs();
  const state = await chrome.storage.local.get(['conversation']);
  conversation = state.conversation || [];
  conversation.forEach(m => renderMessage(m.role, m.content));
  if (conversation.length) heroEl.style.display = 'none'; else heroEl.style.display = 'block';
  parent.postMessage({ type: 'PANEL_READY' }, '*');
};

bootstrap();
