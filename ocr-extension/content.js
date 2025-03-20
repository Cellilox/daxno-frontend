// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getRecords") {
      // Forward request to background script ASYNC
      chrome.runtime.sendMessage(
        { action: "FETCH_RECORDS", tabId: sender.tab.id },
        (response) => {
          sendResponse({ records: response.records }); // Reply to popup
        }
      );
      return true; // Keep message channel open
    }
  });