# PWA Development & Offline Workflow Guide

## 🎯 Two Critical Questions Answered

### **Question 1: How do developers develop for PWA?**
**Answer**: Same as regular web development! PWA is just **enhanced** web development.

### **Question 2: How does PWA interact with backend offline?**
**Answer**: It **queues requests locally**, then sends them when connection returns.

---

## 👨‍💻 Development Workflow

### **Normal Web Development (Current)**

```bash
cd /Users/pro_thierry/Documents/wrapper/daxno-frontend

# Start development server
npm run dev

# Developer makes changes
# Browser auto-reloads
# Test in browser
```

**What developer sees:**
- Regular Next.js app
- Hot reload works
- Console, debugger work normally

---

### **PWA Development (After Implementation)**

```bash
cd /Users/pro_thierry/Documents/wrapper/daxno-frontend

# SAME development command!
npm run dev

# Developer makes changes
# Browser auto-reloads
# Test in browser
# PLUS: Can test offline mode
```

**What developer sees:**
- Same as before
- PLUS: Offline mode available
- PLUS: Can test camera features
- PLUS: Can test sync queue

---

## 🔄 Key Difference: PWA Features Disabled in Development

### **In Development Mode (npm run dev):**

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // ← PWA OFF in dev!
});
```

**Why?**
- Service Workers can cache aggressively
- Makes debugging harder (stale cache)
- Hot reload conflicts with Service Worker

**Development is 100% normal web development!**

---

### **In Production Mode (deployed):**

```javascript
// PWA features ENABLED
disable: false  // Service Worker active
```

**Users get:**
- Offline capability
- App installation
- Background sync

---

## 🧪 How to Test PWA Features During Development

### **Option 1: Build and Preview**

```bash
# Build production version locally
npm run build

# Start production server
npm start

# Now PWA features work!
# Open: http://localhost:3001
# Can test offline mode
```

### **Option 2: Use Separate Config**

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // ← Force enable for testing
});
```

**Only use when testing PWA features!**

---

## 📡 How PWA Interacts with Backend (The Important Part!)

### **Scenario 1: ONLINE (Normal Operation)**

```
┌──────────────────────────────────────────────────┐
│  User Action: Upload Photo                       │
└──────────────────────────────────────────────────┘
                    ↓
        ┌──────────────────────┐
        │  daxno-frontend      │
        │  (PWA)               │
        └──────────────────────┘
                    ↓
            Online? ✅ YES
                    ↓
        ┌──────────────────────┐
        │  Direct API Call     │
        │  to daxno-backend    │
        └──────────────────────┘
                    ↓
        POST /api/files/upload
                    ↓
        ┌──────────────────────┐
        │  daxno-backend       │
        │  Processes file      │
        └──────────────────────┘
                    ↓
            Response 200 OK
                    ↓
        User sees: "Upload complete!"
```

**When ONLINE:**
- ✅ App calls API directly (like now)
- ✅ Same as regular web app
- ✅ No difference from current behavior

---

### **Scenario 2: OFFLINE (New Behavior)**

```
┌──────────────────────────────────────────────────┐
│  User Action: Take Photo (offline)               │
└──────────────────────────────────────────────────┘
                    ↓
        ┌──────────────────────┐
        │  daxno-frontend      │
        │  (PWA)               │
        └──────────────────────┘
                    ↓
            Online? ❌ NO
                    ↓
        ┌──────────────────────┐
        │  IndexedDB           │
        │  (Local Storage)     │
        └──────────────────────┘
                    ↓
        Store photo + metadata
                    ↓
        Add to sync queue:
        {
          type: 'photo',
          file: <blob>,
          status: 'pending'
        }
                    ↓
        User sees: "Photo saved! 
                    Will upload when online"
                    
        ❌ NO API CALL TO BACKEND
        (Backend unreachable offline)
```

**When OFFLINE:**
- ❌ Cannot call backend API (no internet!)
- ✅ Store data in **IndexedDB** (browser storage)
- ✅ Add to **sync queue**
- ✅ Show user "queued" message

---

### **Scenario 3: BACK ONLINE (Auto-Sync)**

```
┌──────────────────────────────────────────────────┐
│  Connection Restored!                            │
└──────────────────────────────────────────────────┘
                    ↓
        ┌──────────────────────┐
        │  Background Sync API │
        │  (Browser feature)   │
        └──────────────────────┘
                    ↓
        Triggers sync event
                    ↓
        ┌──────────────────────┐
        │  Sync Manager        │
        │  (Your code)         │
        └──────────────────────┘
                    ↓
        Check IndexedDB for pending items
                    ↓
        Found 3 queued photos
                    ↓
        For each photo:
                    ↓
        ┌──────────────────────┐
        │  Upload to           │
        │  daxno-backend       │
        └──────────────────────┘
                    ↓
        POST /api/sync/photos
        (Send photo + metadata)
                    ↓
        ┌──────────────────────┐
        │  daxno-backend       │
        │  Processes file      │
        └──────────────────────┘
                    ↓
        Response 200 OK
                    ↓
        Remove from IndexedDB
                    ↓
        User sees: "3 photos uploaded!"
```

**When BACK ONLINE:**
- ✅ Background Sync automatically triggers
- ✅ Reads queued items from IndexedDB
- ✅ Calls backend API for each item
- ✅ Removes from queue on success
- ✅ Retries on failure

---

## 💾 Data Flow: Online vs Offline

### **ONLINE Mode (Normal):**

```typescript
// User uploads file
async function uploadFile(file: File) {
  // Check connection
  if (navigator.onLine) {
    // Direct API call
    const response = await fetch('http://localhost:8000/api/files/upload', {
      method: 'POST',
      body: formData,
    });
    
    return response.json(); // ✅ Immediate result
  }
}
```

**Data flow:**
```
User → daxno-frontend → daxno-backend → Database
                ↓
        Immediate response
```

---

### **OFFLINE Mode (New):**

```typescript
// User takes photo offline
async function uploadFile(file: File) {
  // Check connection
  if (!navigator.onLine) {
    // Store locally
    const db = await getDB();
    await db.add('offlinePhotos', {
      id: crypto.randomUUID(),
      file: file,
      status: 'pending',
      createdAt: Date.now(),
    });
    
    // Add to sync queue
    await addToSyncQueue({
      type: 'photo',
      payload: { fileId: id },
    });
    
    return { status: 'queued' }; // ✅ Queued for later
  }
}
```

**Data flow:**
```
User → daxno-frontend → IndexedDB (local)
                ↓
        "Queued" message
        
        (Later, when online)
        ↓
IndexedDB → Background Sync → daxno-backend → Database
```

---

## 🔍 Detailed: What Happens to API Calls Offline?

### **Question: Can PWA call backend API offline?**

**Answer: NO! ❌**

**Why?**
- Backend is on a server (localhost:8000 or cloud)
- Offline = no internet = can't reach server
- Physics limitation, not PWA limitation!

### **Solution: Queue and Retry**

```typescript
// Smart API wrapper
async function apiCall(endpoint: string, data: any) {
  if (navigator.onLine) {
    // ONLINE: Call API directly
    return fetch(`http://localhost:8000${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } else {
    // OFFLINE: Queue for later
    await queueForSync(endpoint, data);
    return { status: 'queued', queued: true };
  }
}
```

**Usage in component:**

```typescript
// Component code stays same!
const result = await apiCall('/api/files/upload', formData);

if (result.queued) {
  alert('Saved! Will upload when online');
} else {
  alert('Uploaded successfully!');
}
```

---

## 📦 What Data is Stored Locally?

### **IndexedDB Stores:**

1. **Queued Photos/Scans**
   - Actual file blobs
   - Metadata (name, date, size)
   - Status (pending, syncing, failed)

2. **Sync Queue**
   - What needs to be uploaded
   - Retry count
   - Timestamp

3. **App Cache (Optional)**
   - Previously viewed data
   - UI state
   - User preferences

### **What's NOT Stored:**

- ❌ Backend database data (too large)
- ❌ Real-time data (only when online)
- ❌ Sensitive secrets

---

## 🔄 Complete Example Flow

### **User Story: Upload Document While Subway (Offline)**

**Step 1: User takes photo (underground, offline)**
```typescript
// User clicks "Take Photo"
const photo = await capturePhoto();

// Code checks connection
if (!navigator.onLine) {
  // Store in IndexedDB
  await storePhotoLocally(photo);
  
  // Show message
  toast.success('Photo saved! Will upload when online');
}
```

**Step 2: App stores photo**
```
IndexedDB
└── offlinePhotos
    └── {
          id: 'abc123',
          file: <Blob 2MB>,
          status: 'pending',
          metadata: { name: 'document.jpg' }
        }
```

**Step 3: User exits subway (online)**
```typescript
// Browser detects online
window.addEventListener('online', () => {
  // Trigger sync
  syncManager.startSync();
});
```

**Step 4: Background sync uploads**
```typescript
// Sync manager runs
const pending = await db.getAll('offlinePhotos', { status: 'pending' });

for (const photo of pending) {
  // NOW we can call backend!
  const response = await fetch('http://localhost:8000/api/sync/photos', {
    method: 'POST',
    body: createFormData(photo),
  });
  
  if (response.ok) {
    // Remove from IndexedDB
    await db.delete('offlinePhotos', photo.id);
    
    toast.success('Photo uploaded!');
  }
}
```

**Step 5: Backend processes**
```python
# daxno-backend receives the photo
@router.post("/sync/photos")
async def sync_photos(file: UploadFile):
    # Process like normal upload
    # No difference from regular upload!
    return {"status": "success"}
```

---

## 🎯 Key Takeaways

### **For Development:**
1. ✅ Develop like normal web app
2. ✅ Same `npm run dev` command
3. ✅ PWA features disabled in dev (for easier debugging)
4. ✅ Test PWA with `npm run build && npm start`

### **For Offline Mode:**
1. ❌ **CANNOT** call backend API when offline (impossible!)
2. ✅ **CAN** store data locally (IndexedDB)
3. ✅ **CAN** queue for later upload
4. ✅ **AUTO** sync when connection returns

### **For Backend:**
1. ✅ Backend code unchanged (mostly)
2. ✅ Add new `/api/sync/*` endpoints
3. ✅ Process queued uploads like normal uploads
4. ✅ No special offline handling needed

---

## 📋 Summary Diagram

```
┌─────────────────────────────────────────────────┐
│              DEVELOPMENT WORKFLOW                │
├─────────────────────────────────────────────────┤
│                                                  │
│  npm run dev     →    Regular web development   │
│  (PWA disabled)       No difference from now    │
│                                                  │
│  npm run build   →    Test PWA features         │
│  npm start            Offline mode works        │
│                                                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              PRODUCTION (OFFLINE MODE)           │
├─────────────────────────────────────────────────┤
│                                                  │
│  ONLINE:    App → Backend API → Database        │
│             (Normal operation)                   │
│                                                  │
│  OFFLINE:   App → IndexedDB (local storage)     │
│             (Queue for later)                    │
│                                                  │
│  BACK ONLINE: IndexedDB → Backend API → Database│
│               (Auto-sync queued items)           │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## ✅ Final Answers

### **Question 1: Development Mode?**
**Answer**: Normal web development! Same workflow, same commands. PWA features only enabled in production.

### **Question 2: Offline API Calls?**
**Answer**: 
- ❌ Cannot call APIs offline (impossible - no internet!)
- ✅ Store data in IndexedDB locally
- ✅ Auto-upload when connection returns
- ✅ Backend receives data as if it was uploaded normally

**PWA doesn't magically make APIs work offline. It queues requests and sends them later!**
