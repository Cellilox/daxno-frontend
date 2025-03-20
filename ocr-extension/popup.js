document.addEventListener('DOMContentLoaded', () => {
    const clerkLogin = document.getElementById('clerkLogin');
    const loadBtn = document.getElementById('loadBtn');
    const results = document.getElementById('results');
  
    // Update UI when storage changes
    chrome.storage.onChanged.addListener(updateAuthState);
    
    function updateAuthState() {
      chrome.storage.local.get(['clerkSession'], (data) => {
        const hasSession = !!data.clerkSession?.token;
        clerkLogin.textContent = hasSession ? "✅ Logged In" : "🔑 Login with Clerk";
        clerkLogin.disabled = hasSession;
        loadBtn.disabled = !hasSession;
        if (!hasSession) results.innerHTML = '';
      });
    }
  
    clerkLogin.addEventListener('click', () => {
      chrome.tabs.create({
        url: 'http://localhost:3000/api/auth/clerk',
        active: true
      });
    });
  
    loadBtn.addEventListener('click', () => {
      results.textContent = "⏳ Loading...";
      chrome.runtime.sendMessage({ action: "GET_RECORDS" }, (response) => {
        if (response.error) {
          results.innerHTML = `<div class="error">❌ Error: ${response.error}</div>`;
        } else {
          results.innerHTML = `<pre>${JSON.stringify(response.data, null, 2)}</pre>`;
        }
      });
    });
  
    // Initial check
    updateAuthState();
  });