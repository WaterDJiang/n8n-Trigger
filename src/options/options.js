const providerList = document.getElementById('providerList');
const webhookList = document.getElementById('webhookList');

const provName = document.getElementById('provName');
const provType = document.getElementById('provType');
const provApiKey = document.getElementById('provApiKey');
const provBaseUrl = document.getElementById('provBaseUrl');
const addProvider = document.getElementById('addProvider');

const whName = document.getElementById('whName');
const whUrl = document.getElementById('whUrl');
const whField = document.getElementById('whField');
const whUser = document.getElementById('whUser');
const whPass = document.getElementById('whPass');
const addWebhook = document.getElementById('addWebhook');

const defModel = document.getElementById('defModel');

const load = async () => {
  try {
    const { llmProviders = [], n8nWebhooks = [], defaults = {} } = await chrome.storage.local.get(['llmProviders','n8nWebhooks','defaults']);
    
    // Render LLM Providers
    if (providerList) {
      providerList.innerHTML = '';
      llmProviders.forEach((p, idx) => {
        const el = document.createElement('div');
        el.className = 'item';
        const isDefault = defaults.providerIndex === idx;
        
        // Left side: Radio/Status + Info
        const info = document.createElement('div');
        info.style.display = 'flex';
        info.style.alignItems = 'center';
        info.style.gap = '10px';
        info.style.flex = '1';
        info.style.overflow = 'hidden'; // For text overflow
        
        // Default Indicator/Button
        const defaultBtn = document.createElement('div');
        defaultBtn.className = isDefault ? 'default-badge active' : 'default-badge';
        defaultBtn.innerHTML = isDefault 
          ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`
          : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
        defaultBtn.title = isDefault ? '当前默认' : '设为默认';
        defaultBtn.onclick = async () => {
          defaults.providerIndex = idx;
          await chrome.storage.local.set({ defaults });
          await load();
        };

        const text = document.createElement('div');
        text.textContent = `${p.name} (${p.type})`;
        text.style.whiteSpace = 'nowrap';
        text.style.overflow = 'hidden';
        text.style.textOverflow = 'ellipsis';
        if (isDefault) text.style.fontWeight = '600';

        info.appendChild(defaultBtn);
        info.appendChild(text);

        // Right side: Actions
        const actions = document.createElement('div');
        actions.style.flexShrink = '0';
        
        const edit = document.createElement('button');
        edit.textContent = '编辑';
        edit.onclick = () => { if(provName) provName.value = p.name; if(provType) provType.value = p.type; if(provApiKey) provApiKey.value = p.apiKey || ''; if(provBaseUrl) provBaseUrl.value = p.baseUrl || ''; };
        
        const del = document.createElement('button');
        del.textContent = '删除';
        del.onclick = async () => { 
          llmProviders.splice(idx,1);
          // Adjust default index if needed
          if (defaults.providerIndex === idx) defaults.providerIndex = null;
          else if (defaults.providerIndex > idx) defaults.providerIndex--;
          
          await chrome.storage.local.set({ llmProviders, defaults }); 
          await load(); 
        };
        
        actions.appendChild(edit);
        actions.appendChild(del);
        el.appendChild(info);
        el.appendChild(actions);
        providerList.appendChild(el);
      });
    }

    // Render Webhooks
    if (webhookList) {
      webhookList.innerHTML = '';
      n8nWebhooks.forEach((w, idx) => {
        const el = document.createElement('div');
        el.className = 'item';
        const isDefault = defaults.webhookIndex === idx;

        // Left side
        const info = document.createElement('div');
        info.style.display = 'flex';
        info.style.alignItems = 'center';
        info.style.gap = '10px';
        info.style.flex = '1';
        info.style.overflow = 'hidden';

        // Default Indicator/Button
        const defaultBtn = document.createElement('div');
        defaultBtn.className = isDefault ? 'default-badge active' : 'default-badge';
        defaultBtn.innerHTML = isDefault 
          ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`
          : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
        defaultBtn.title = isDefault ? '当前默认' : '设为默认';
        defaultBtn.onclick = async () => {
          defaults.webhookIndex = idx;
          await chrome.storage.local.set({ defaults });
          await load();
        };

        const text = document.createElement('div');
        text.textContent = `${w.name}`;
        text.style.whiteSpace = 'nowrap';
        text.style.overflow = 'hidden';
        text.style.textOverflow = 'ellipsis';
        if (isDefault) text.style.fontWeight = '600';

        info.appendChild(defaultBtn);
        info.appendChild(text);

        // Right side
        const actions = document.createElement('div');
        actions.style.flexShrink = '0';

        const edit = document.createElement('button');
        edit.textContent = '编辑';
        edit.onclick = () => { if(whName) whName.value = w.name; if(whUrl) whUrl.value = w.url; if(whField) whField.value = w.field || ''; if(whUser) whUser.value = w.user || ''; if(whPass) whPass.value = w.pass || ''; };
        
        const del = document.createElement('button');
        del.textContent = '删除';
        del.onclick = async () => { 
          n8nWebhooks.splice(idx,1); 
          // Adjust default index
          if (defaults.webhookIndex === idx) defaults.webhookIndex = null;
          else if (defaults.webhookIndex > idx) defaults.webhookIndex--;

          await chrome.storage.local.set({ n8nWebhooks, defaults }); 
          await load(); 
        };
        
        actions.appendChild(edit);
        actions.appendChild(del);
        el.appendChild(info);
        el.appendChild(actions);
        webhookList.appendChild(el);
      });
    }

    // Bind Default Model Input
    if (defModel) {
      defModel.value = defaults.model || '';
      // Auto-save logic for default model
      defModel.onchange = async () => {
        const { defaults = {} } = await chrome.storage.local.get(['defaults']);
        defaults.model = defModel.value.trim();
        await chrome.storage.local.set({ defaults });
      };
    }
  } catch (e) {
    console.error('Error loading options:', e);
  }
};

if (addProvider) {
  addProvider.onclick = async () => {
    const name = provName ? provName.value.trim() : '';
    const type = provType ? provType.value : 'openai';
    const apiKey = provApiKey ? provApiKey.value.trim() : '';
    const baseUrl = provBaseUrl ? provBaseUrl.value.trim() : '';
    if (!name) return;
    const { llmProviders = [] } = await chrome.storage.local.get(['llmProviders']);
    const existingIdx = llmProviders.findIndex(p => p.name === name);
    const record = { name, type, apiKey, baseUrl };
    if (existingIdx >= 0) llmProviders[existingIdx] = record; else llmProviders.push(record);
    await chrome.storage.local.set({ llmProviders });
    if (provName) provName.value = ''; 
    if (provApiKey) provApiKey.value=''; 
    if (provBaseUrl) provBaseUrl.value='';
    await load();
  };
}

if (addWebhook) {
  addWebhook.onclick = async () => {
    const name = whName ? whName.value.trim() : '';
    const url = whUrl ? whUrl.value.trim() : '';
    const field = whField ? whField.value.trim() : '';
    const user = whUser ? whUser.value.trim() : '';
    const pass = whPass ? whPass.value.trim() : '';
    if (!name || !url) return;
    const { n8nWebhooks = [] } = await chrome.storage.local.get(['n8nWebhooks']);
    const existingIdx = n8nWebhooks.findIndex(w => w.name === name);
    const record = { name, url, field, user, pass };
    if (existingIdx >= 0) n8nWebhooks[existingIdx] = record; else n8nWebhooks.push(record);
    await chrome.storage.local.set({ n8nWebhooks });
    if (whName) whName.value = ''; 
    if (whUrl) whUrl.value=''; 
    if (whField) whField.value=''; 
    if (whUser) whUser.value=''; 
    if (whPass) whPass.value='';
    await load();
  };
}

// Toggle Visibility Logic
const toggleButtons = document.querySelectorAll('.toggle-visibility');
toggleButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Prevent button from submitting forms if inside one (though here it's div structure)
    e.preventDefault();
    
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (!input) return;

    const eyeIcon = btn.querySelector('.eye-icon');
    const eyeOffIcon = btn.querySelector('.eye-off-icon');

    if (input.type === 'password') {
      input.type = 'text';
      if (eyeIcon) eyeIcon.style.display = 'none';
      if (eyeOffIcon) eyeOffIcon.style.display = 'block';
    } else {
      input.type = 'password';
      if (eyeIcon) eyeIcon.style.display = 'block';
      if (eyeOffIcon) eyeOffIcon.style.display = 'none';
    }
  });
});

document.addEventListener('DOMContentLoaded', load);
