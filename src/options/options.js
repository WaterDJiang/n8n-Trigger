import i18n from '../lib/i18n.js';

const providerList = document.getElementById('providerList');
const webhookList = document.getElementById('webhookList');

const provName = document.getElementById('provName');
const provType = document.getElementById('provType');
const provModel = document.getElementById('provModel');
const provApiKey = document.getElementById('provApiKey');
const provBaseUrl = document.getElementById('provBaseUrl');
const addProvider = document.getElementById('addProvider');
const cancelProvider = document.getElementById('cancelProvider');

const whName = document.getElementById('whName');
const whUrl = document.getElementById('whUrl');
const whField = document.getElementById('whField');
const whUser = document.getElementById('whUser');
const whPass = document.getElementById('whPass');
const addWebhook = document.getElementById('addWebhook');
const cancelWebhook = document.getElementById('cancelWebhook');

let editingProviderIndex = null;
let editingWebhookIndex = null;

const PROVIDER_NAMES = {
  'openai': 'OpenAI',
  'openrouter': 'OpenRouter',
  'glm': 'GLM',
  'gemini': 'Gemini'
};

const PROVIDER_DEFAULTS = {
  'openai': 'https://api.openai.com',
  'openrouter': 'https://openrouter.ai',
  'glm': 'https://open.bigmodel.cn',
  'gemini': 'https://generativelanguage.googleapis.com'
};

const updateProviderNameState = () => {
  if (!provType || !provName) return;
  const type = provType.value;
  if (type === 'other') {
    provName.readOnly = false;
    provName.placeholder = i18n.t('provider_name_placeholder');
    // If the name is currently one of the standard ones, clear it to prompt user
    const isStandardName = Object.values(PROVIDER_NAMES).includes(provName.value);
    if (isStandardName) {
      provName.value = '';
    }
  } else {
    provName.readOnly = true;
    provName.value = PROVIDER_NAMES[type] || type;
  }
};

const resetProviderForm = () => {
  editingProviderIndex = null;
  if (provName) provName.value = ''; 
  if (provType) provType.value = 'openai'; // Reset to default type
  if (provModel) provModel.value = '';
  if (provApiKey) provApiKey.value = ''; 
  if (provBaseUrl) provBaseUrl.value = '';
  
  if (addProvider) {
    addProvider.textContent = i18n.t('add_btn');
    addProvider.classList.remove('update-btn'); // Optional styling
  }
  if (cancelProvider) cancelProvider.style.display = 'none';
  
  updateProviderNameState();
  // Reset URL placeholder based on default type
  if (provBaseUrl) provBaseUrl.placeholder = PROVIDER_DEFAULTS['openai'];
};

const resetWebhookForm = () => {
  editingWebhookIndex = null;
  if (whName) whName.value = ''; 
  if (whUrl) whUrl.value = ''; 
  if (whField) whField.value = ''; 
  if (whUser) whUser.value = ''; 
  if (whPass) whPass.value = '';
  
  if (addWebhook) {
    addWebhook.textContent = i18n.t('add_btn');
    addWebhook.classList.remove('update-btn');
  }
  if (cancelWebhook) cancelWebhook.style.display = 'none';
};

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
        defaultBtn.title = isDefault ? i18n.t('current_default') : i18n.t('set_default');
        defaultBtn.onclick = async () => {
          defaults.providerIndex = idx;
          await chrome.storage.local.set({ defaults });
          await load();
        };

        const text = document.createElement('div');
        const modelInfo = p.model ? ` - ${p.model}` : '';
        text.textContent = `${p.name} (${p.type})${modelInfo}`;
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
        edit.textContent = i18n.t('edit');
        edit.onclick = () => { 
          editingProviderIndex = idx;
          if(provType) provType.value = p.type; 
          updateProviderNameState();
          if(provName && p.type === 'other') provName.value = p.name;
          
          if(provModel) provModel.value = p.model || '';
          if(provApiKey) provApiKey.value = p.apiKey || ''; 
          if(provBaseUrl) provBaseUrl.value = p.baseUrl || '';
          
          if (addProvider) addProvider.textContent = i18n.t('update_btn');
          if (cancelProvider) cancelProvider.style.display = 'inline-block';
          
          // Scroll to form
          provName.scrollIntoView({ behavior: 'smooth' });
        };
        
        const del = document.createElement('button');
        del.textContent = i18n.t('delete');
        del.onclick = async () => { 
          if(confirm(i18n.t('confirm_delete'))) {
            llmProviders.splice(idx,1);
            // Adjust default index if needed
            if (defaults.providerIndex === idx) defaults.providerIndex = null;
            else if (defaults.providerIndex > idx) defaults.providerIndex--;
            
            await chrome.storage.local.set({ llmProviders, defaults }); 
            await load(); 
          }
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
        defaultBtn.title = isDefault ? i18n.t('current_default') : i18n.t('set_default');
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
        edit.textContent = i18n.t('edit');
        edit.onclick = () => { 
          editingWebhookIndex = idx;
          if(whName) whName.value = w.name; 
          if(whUrl) whUrl.value = w.url; 
          if(whField) whField.value = w.field || ''; 
          if(whUser) whUser.value = w.user || ''; 
          if(whPass) whPass.value = w.pass || ''; 
          
          if (addWebhook) addWebhook.textContent = i18n.t('update_btn');
          if (cancelWebhook) cancelWebhook.style.display = 'inline-block';
          
          whName.scrollIntoView({ behavior: 'smooth' });
        };
        
        const del = document.createElement('button');
        del.textContent = i18n.t('delete');
        del.onclick = async () => { 
          if(confirm(i18n.t('confirm_delete_webhook'))) {
            n8nWebhooks.splice(idx,1); 
            // Adjust default index
            if (defaults.webhookIndex === idx) defaults.webhookIndex = null;
            else if (defaults.webhookIndex > idx) defaults.webhookIndex--;

            await chrome.storage.local.set({ n8nWebhooks, defaults }); 
            await load(); 
          }
        };
        
        actions.appendChild(edit);
        actions.appendChild(del);
        el.appendChild(info);
        el.appendChild(actions);
        webhookList.appendChild(el);
      });
    }

  } catch (e) {
    console.error('Error loading options:', e);
  }
};

if (addProvider) {
  addProvider.onclick = async () => {
    const name = provName ? provName.value.trim() : '';
    const type = provType ? provType.value : 'openai';
    const model = provModel ? provModel.value.trim() : '';
    const apiKey = provApiKey ? provApiKey.value.trim() : '';
    const baseUrl = provBaseUrl ? provBaseUrl.value.trim() : '';
    
    if (!name) {
        alert(i18n.t('error_llm_required'));
        return;
    }

    const { llmProviders = [] } = await chrome.storage.local.get(['llmProviders']);
    
    // Check for duplicate name only if adding new or renaming to another existing name
    // If editing, we allow keeping same name (it's the same record)
    const existingIdx = llmProviders.findIndex(p => p.name === name);
    if (existingIdx >= 0 && existingIdx !== editingProviderIndex) {
        // Name conflict with another record
        // In "Add" mode (editingProviderIndex is null), any match is a conflict
        // In "Edit" mode, match with DIFFERENT index is a conflict
        // But for simplicity, let's just allow overwrite if user really wants? 
        // Actually user said "Add and Update UX distinction", so we should be strict or smart.
        // Let's assume:
        // - If Add mode: if name exists, warn or overwrite? Previously it overwrote. 
        //   Now we want clear distinction. Maybe alert "Name already exists"?
        // - If Update mode: we are updating specific index.
    }

    const record = { name, type, model, apiKey, baseUrl };
    
    if (editingProviderIndex !== null) {
      // Update existing
      if (editingProviderIndex >= 0 && editingProviderIndex < llmProviders.length) {
        llmProviders[editingProviderIndex] = record;
      }
    } else {
      // Add new
      // Check if name exists to prevent accidental overwrite? 
      // Previous logic was: if name exists, overwrite.
      // Let's keep it but maybe we should prefer unique names?
      // For now, let's stick to: if editingIndex is null, we push (or overwrite if name matches?)
      // User wants distinction. 
      // If I am in "Add" mode, and I type a name that exists, should I update it? 
      // Probably NOT, because that's what "Update" mode is for.
      // So if name exists in Add mode, we should probably alert or generate unique name?
      // Or just overwrite. Overwriting is dangerous if unintentional.
      
      // Let's allow overwrite for now but maybe we should rely on editingIndex.
      // Actually, if we use editingIndex, we don't need to match by name anymore.
      
      if (existingIdx >= 0) {
         if (!confirm(i18n.t('confirm_overwrite') || 'Name already exists. Overwrite?')) {
            return;
         }
         llmProviders[existingIdx] = record;
      } else {
         llmProviders.push(record);
      }
    }
    
    await chrome.storage.local.set({ llmProviders });
    
    resetProviderForm();
    
    const originalText = addProvider.textContent;
    addProvider.textContent = i18n.t('saved');
    setTimeout(() => {
        // Restore correct text based on state (which is reset now, so "Add")
        addProvider.textContent = i18n.t('add_btn'); 
    }, 1500);
    
    await load();
  };
}

if (cancelProvider) {
  cancelProvider.onclick = () => {
    resetProviderForm();
  };
}

if (addWebhook) {
  addWebhook.onclick = async () => {
    const name = whName ? whName.value.trim() : '';
    const url = whUrl ? whUrl.value.trim() : '';
    const field = whField ? whField.value.trim() : '';
    const user = whUser ? whUser.value.trim() : '';
    const pass = whPass ? whPass.value.trim() : '';
    
    if (!name || !url) {
        alert(i18n.t('error_required'));
        return;
    }

    const { n8nWebhooks = [] } = await chrome.storage.local.get(['n8nWebhooks']);
    const existingIdx = n8nWebhooks.findIndex(w => w.name === name);
    const record = { name, url, field, user, pass };
    
    if (editingWebhookIndex !== null) {
       // Update mode
       if (editingWebhookIndex >= 0 && editingWebhookIndex < n8nWebhooks.length) {
         n8nWebhooks[editingWebhookIndex] = record;
       }
    } else {
       // Add mode
       if (existingIdx >= 0) {
         if (!confirm(i18n.t('confirm_overwrite') || 'Name already exists. Overwrite?')) {
            return;
         }
         n8nWebhooks[existingIdx] = record;
       } else {
         n8nWebhooks.push(record);
       }
    }

    await chrome.storage.local.set({ n8nWebhooks });
    
    resetWebhookForm();
    
    const originalText = addWebhook.textContent;
    addWebhook.textContent = i18n.t('saved');
    setTimeout(() => {
        addWebhook.textContent = i18n.t('add_btn');
    }, 1500);

    await load();
  };
}

if (cancelWebhook) {
    cancelWebhook.onclick = () => {
      resetWebhookForm();
    };
  }
  
  // Export Configuration
  const exportConfigBtn = document.getElementById('exportConfig');
  if (exportConfigBtn) {
    exportConfigBtn.onclick = async () => {
      const data = await chrome.storage.local.get(['llmProviders', 'n8nWebhooks']);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `n8n-trigger-config-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
  }

  // Import Configuration
  const importConfigBtn = document.getElementById('importConfigBtn');
  const importConfigFile = document.getElementById('importConfigFile');
  
  if (importConfigBtn && importConfigFile) {
    importConfigBtn.onclick = () => {
      importConfigFile.click();
    };
    
    importConfigFile.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.llmProviders || data.n8nWebhooks) {
            // Validate structure if needed, or just trust the JSON for now.
            // Ideally we should merge or overwrite.
            // Current approach: Overwrite existing keys if present in file.
            
            const updates = {};
            if (data.llmProviders && Array.isArray(data.llmProviders)) {
                updates.llmProviders = data.llmProviders;
            }
            if (data.n8nWebhooks && Array.isArray(data.n8nWebhooks)) {
                updates.n8nWebhooks = data.n8nWebhooks;
            }
            
            if (Object.keys(updates).length > 0) {
                await chrome.storage.local.set(updates);
                alert(i18n.t('import_success'));
                load();
            } else {
                alert(i18n.t('import_error'));
            }
          } else {
            alert(i18n.t('import_error'));
          }
        } catch (err) {
          console.error(err);
          alert(i18n.t('import_error'));
        }
        // Reset file input so same file can be selected again if needed
        importConfigFile.value = '';
      };
      reader.readAsText(file);
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

// Modal Logic
const setupModal = (modalId, btnId) => {
  const modal = document.getElementById(modalId);
  const btn = document.getElementById(btnId);
  const closeBtn = modal ? modal.querySelector('.close-modal') : null;

  if (btn && modal && closeBtn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.style.display = "block";
    });

    closeBtn.addEventListener('click', () => {
      modal.style.display = "none";
    });

    window.addEventListener('click', (event) => {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    });
  }
};

setupModal('infoModal', 'showFieldInfo');
setupModal('authModal', 'showAuthInfo');

if (provType) {
  provType.addEventListener('change', () => {
    updateProviderNameState();
    const type = provType.value;
    const defaultUrl = PROVIDER_DEFAULTS[type];
    
    if (provBaseUrl) {
      provBaseUrl.placeholder = defaultUrl || i18n.t('base_url_placeholder');
      
      if (defaultUrl) {
        provBaseUrl.value = defaultUrl;
      } else {
        // Switching to 'other' or unknown
        // If current value is a known default, clear it
        const isKnownDefault = Object.values(PROVIDER_DEFAULTS).some(u => provBaseUrl.value === u);
        if (isKnownDefault) {
          provBaseUrl.value = '';
        }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
    await i18n.init();
    i18n.apply();
    updateProviderNameState();
    await load();
});
