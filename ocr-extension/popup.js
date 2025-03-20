document.addEventListener('DOMContentLoaded', () => {
    const clerkLogin = document.getElementById('clerkLogin');
    const results = document.getElementById('results');
  
    // Immediate check on popup open
    chrome.storage.local.get(['clerkSession'], (data) => {
      if (data.clerkSession?.token) {
        loadRecords();
        clerkLogin.style.display = 'none'; // Hide the login button
      }
    });
  
    function loadRecords() {
      results.innerHTML = "⏳ Loading your records...";
      chrome.runtime.sendMessage({ action: "GET_RECORDS" }, (response) => {
        if (response.error) {
          results.innerHTML = `<div class="error">❌ ${response.error}</div>`;
        } else {
          // Clear previous results
          results.innerHTML = "";

          // Check if there are records
          if (response.data?.length) {
            response.data.forEach((record, index) => {
              const price = record.fields_data.Price.answer; // Get the price answer
              const organization = record.fields_data.Organization.answer; // Get the organization answer
              
              // Create a container for each record
              const recordContainer = document.createElement('div');
              recordContainer.style.display = 'flex'; // Use flexbox for alignment
              recordContainer.style.alignItems = 'center'; // Center items vertically
              recordContainer.style.margin = '5px 0'; // Margin between records

              // Create a styled box for the price
              const priceElement = document.createElement('div');
              priceElement.textContent = `${index + 1}. ${price}`;
              priceElement.style.border = '1px solid #ccc'; // Border
              priceElement.style.borderRadius = '5px'; // Rounded corners
              priceElement.style.padding = '10px'; // Padding
              priceElement.style.backgroundColor = '#f9f9f9'; // Background color
              priceElement.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)'; // Shadow
              priceElement.style.cursor = 'grab'; // Cursor style for draggable
              priceElement.style.marginRight = '10px'; // Space between price and organization

              // Create a styled box for the organization
              const organizationElement = document.createElement('div');
              organizationElement.textContent = organization;
              organizationElement.style.border = '1px solid #ccc'; // Border
              organizationElement.style.borderRadius = '5px'; // Rounded corners
              organizationElement.style.padding = '10px'; // Padding
              organizationElement.style.backgroundColor = '#f9f9f9'; // Background color
              organizationElement.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)'; // Shadow
              organizationElement.style.cursor = 'grab'; // Cursor style for draggable

              // Add drag event listeners
              priceElement.setAttribute('draggable', 'true');
              organizationElement.setAttribute('draggable', 'true');

              priceElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'price', value: price }));
              });

              organizationElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'organization', value: organization }));
              });

              // Append price and organization to the record container
              recordContainer.appendChild(priceElement);
              recordContainer.appendChild(organizationElement);

              // Append the record container to results
              results.appendChild(recordContainer);
            });
          } else {
            results.innerHTML = "<div>No records found</div>"; // Handle case where no records are found
          }
        }
      });
    }
  
    clerkLogin.addEventListener('click', () => {
      chrome.tabs.create({
        url: `http://localhost:3000/api/auth/clerk?extensionId=${chrome.runtime.id}`,
        active: true
      });
    });
  });