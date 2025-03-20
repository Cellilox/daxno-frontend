// Handle external messages from auth page
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    if (sender.url.startsWith('http://localhost:3000/') && request.type === 'CLERK_AUTH_COMPLETE') {
      chrome.storage.local.set({
        clerkSession: {
          token: request.token,
          sessionId: request.sessionId
        }
      }, () => {
        chrome.tabs.query({url: "http://localhost:3000/api/auth/clerk*"}, (tabs) => {
          tabs.forEach(tab => chrome.tabs.remove(tab.id));
        });
        sendResponse({success: true});
      });
      return true;
    }
  });
  
  // Handle internal messages
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_RECORDS") {
      chrome.storage.local.get(['clerkSession'], async (data) => {
        if (!data.clerkSession) {
          sendResponse({error: "Not authenticated"});
          return;
        }
        
        try {
          const response = await fetch('http://localhost:3000/api/proxy', {
            headers: {
              'Authorization': `Bearer ${data.clerkSession.token}`,
              'sessionId': data.clerkSession.sessionId
            }
          });
          sendResponse({data: await response.json()});
        } catch (error) {
          sendResponse({error: error.message});
        }
      });
      return true;
    }
  });