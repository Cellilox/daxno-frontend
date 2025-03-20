// Handle external messages
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    if (sender.origin === 'http://localhost:3000' && request.type === 'CLERK_AUTH_COMPLETE') {
      chrome.storage.local.set({
        clerkSession: {
          token: request.token,
          sessionId: request.sessionId
        }
      }, () => {
        sendResponse({ success: true });
        chrome.tabs.query({ url: sender.url }, (tabs) => {
          tabs.forEach(tab => chrome.tabs.remove(tab.id));
        });
      });
      return true;
    }
  });
  
  // Handle internal messages
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_RECORDS") {
      chrome.storage.local.get(['clerkSession'], async (data) => {
        if (!data.clerkSession) {
          sendResponse({ error: "Please login first" });
          return;
        }
        
        try {
          const response = await fetch('http://localhost:3000/api/proxy', {
            headers: {
              'Authorization': `Bearer ${data.clerkSession.token}`,
              'sessionId': data.clerkSession.sessionId
            }
          });
          sendResponse({ data: await response.json() });
        } catch (error) {
          sendResponse({ error: error.message });
        }
      });
      return true;
    }
  });