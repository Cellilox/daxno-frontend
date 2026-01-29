# Offline Sync + Camera Implementation Plan for daxno-frontend

## 🎯 Goal

Enable users in **daxno-frontend** to:
1. **Take photos and scan documents** with phone camera (instead of uploading from device)
2. **Queue operations** while offline (including photos/scans)
3. **Auto-sync when online** (upload files, process documents)
4. **Use the app offline** (view cached data, prepare uploads)
5. **Background processing** continues automatically when connectivity is restored

---

## 📊 Current Architecture vs Offline-First Architecture

### Current Flow (Online Only)
```
User → daxno-frontend → File Picker → Upload → daxno-backend → Processing
                          (FAILS if offline)
```

### New Flow (Offline-First with Camera)
```
User → daxno-frontend → Camera/Scanner → Local Storage (IndexedDB)
         ↓                                      ↓
    PWA Service Worker                   Sync Queue
         ↓                                      ↓
    Online Check    →      daxno-backend → Background Processing
         ↓                                      ↓
    Auto-retry                          Process queued items
```

---

## 🏗️ Architecture Components

### 1. Frontend (Next.js - daxno-frontend)

**Technologies Needed:**
- **Service Worker** (PWA) - Offline capability
- **IndexedDB** - Local storage (files, photos, scanned docs)
- **Background Sync API** - Auto-sync when online
- **Camera API** - Photo capture and document scanning
- **Workbox** - Service worker tooling

**What Gets Cached Offline:**
- ✅ App shell (UI, CSS, JS)
- ✅ Previously uploaded files metadata
- ✅ Queued photos/scans (pending upload)
- ✅ User preferences
- ✅ Upload history

### 2. Sync Queue System

**Components:**
- **Photo Queue** - Photos waiting to be uploaded
- **Scan Queue** - Scanned documents waiting to be uploaded
- **File Queue** - Regular files waiting to be uploaded

**Storage:**
```typescript
// IndexedDB Schema for daxno-frontend
{
  syncQueue: {
    id: string,
    type: 'photo' | 'scan' | 'file',
    payload: any,
    status: 'pending' | 'syncing' | 'failed',
    createdAt: timestamp,
    retryCount: number
  },
  
  offlinePhotos: {
    id: string,
    file: Blob,
    metadata: {
      name: string,
      capturedAt: timestamp,
      projectId?: string
    },
    status: 'pending' | 'uploaded' | 'processing' | 'completed'
  },
  
  offlineScans: {
    id: string,
    pages: Blob[],
    pdfBlob?: Blob,
    metadata: {
      name: string,
      pageCount: number,
      createdAt: timestamp
    },
    status: 'pending' | 'uploaded' | 'processing' | 'completed'
  }
}
```

### 3. Backend (daxno-backend)

**New Endpoints:**
```python
# /api/sync/status
GET - Check what needs syncing

# /api/sync/photos
POST - Batch photo upload with metadata

# /api/sync/scans
POST - Upload scanned documents (PDFs)

# /api/sync/health
GET - Quick connectivity check
```

**Background Job Updates:**
- Detect when files come from sync queue
- Prioritize synced files
- Send progress updates

---

## 📋 Implementation Phases

### **Phase 1: PWA Setup in daxno-frontend** (Week 1)
*Time: 3-5 days*  
*Complexity: Medium*

**Tasks:**
1. Add PWA manifest (`manifest.json`) to daxno-frontend
2. Create Service Worker for daxno-frontend
3. Implement app shell caching
4. Add "Install App" prompt
5. Test offline app loading

**Deliverable:** daxno-frontend loads UI when offline

**Files to Create/Modify:**
```
daxno-frontend/
├── public/
│   ├── manifest.json          ← NEW
│   ├── sw.js                  ← NEW
│   └── icons/                 ← NEW
│       ├── icon-192.png
│       └── icon-512.png
│
└── src/
    ├── hooks/
    │   └── useOnlineStatus.ts ← NEW
    └── contexts/
        └── SyncContext.tsx    ← NEW
```

---

### **Phase 2: IndexedDB Storage** (Week 1-2)
*Time: 4-6 days*  
*Complexity: Medium*

**Tasks:**
1. Set up IndexedDB wrapper for daxno-frontend
2. Create storage schemas (photos, scans, files)
3. Implement CRUD operations for offline data
4. Add data expiration logic
5. Create storage management UI

**Deliverable:** Data persists locally when offline

**Files to Create:**
```
daxno-frontend/
└── src/
    ├── lib/
    │   └── db/
    │       ├── indexedDB.ts        ← NEW
    │       ├── schemas.ts          ← NEW
    │       └── operations.ts       ← NEW
    └── hooks/
        └── useOfflineStorage.ts    ← NEW
```

---

### **Phase 3: Camera Integration** (Week 2-3)
*Time: 5-7 days*  
*Complexity: Medium-High*

**Tasks:**
1. Implement camera access API
2. Create photo capture component
3. Add front/back camera switching
4. Implement live preview
5. Add flash/torch control
6. Store captured photos in IndexedDB
7. **Integrate with existing Dropzone component**

**Deliverable:** Users can take photos instead of selecting from device

**Files to Create/Modify:**
```
daxno-frontend/
└── src/
    ├── components/
    │   ├── Camera/                    ← NEW
    │   │   ├── CameraCapture.tsx
    │   │   ├── PhotoPreview.tsx
    │   │   └── CameraButton.tsx
    │   │
    │   └── files/
    │       ├── Dropzone.tsx           ← MODIFY (Add camera option)
    │       ├── DropzoneWrapper.tsx    ← MODIFY (Add camera button)
    │       └── ScanFilesModal.tsx     ← MODIFY (Add scanner)
    │
    ├── hooks/
    │   └── useCamera.ts               ← NEW
    │
    └── lib/
        └── camera/
            └── cameraUtils.ts         ← NEW
```

**Integration Point:**
- Add camera button to existing Dropzone
- Replace file picker with camera option
- Maintain existing upload flow

---

### **Phase 4: Document Scanner** (Week 3-4)
*Time: 5-7 days*  
*Complexity: High*

**Tasks:**
1. Create document scanner interface
2. Implement manual crop/rotate tools
3. Add image filters (B&W, contrast enhancement)
4. Build multi-page capture flow
5. Implement PDF generation from images
6. Add document naming and categorization
7. **Integrate with ScanFilesModal**

**Deliverable:** Full document scanning capability

**Files to Create:**
```
daxno-frontend/
└── src/
    ├── components/
    │   └── Scanner/
    │       ├── DocumentScanner.tsx    ← NEW
    │       ├── CropTool.tsx           ← NEW
    │       └── FilterControls.tsx     ← NEW
    │
    └── lib/
        └── scanner/
            ├── imageProcessing.ts     ← NEW
            └── pdfGenerator.ts        ← NEW
```

**Features Delivered:**
- ✅ Live camera view for scanning
- ✅ Manual crop with corner handles
- ✅ Rotate 90°/180°/270°
- ✅ Filters: Auto, B&W, Color, Enhanced
- ✅ Multi-page document support
- ✅ PDF generation
- ✅ Name and categorize scanned docs

---

### **Phase 5: Offline File Upload Queue** (Week 4)
*Time: 4-5 days*  
*Complexity: High*

**Tasks:**
1. Intercept file upload when offline
2. Queue photos/scans in IndexedDB
3. Show "Queued for upload" UI in Dropzone
4. Implement chunked upload for large files
5. Handle upload failures and retries

**Deliverable:** Users can "upload" files/photos offline

**Files to Create/Modify:**
```
daxno-frontend/
└── src/
    ├── components/
    │   ├── files/
    │   │   └── UploadQueue.tsx        ← NEW
    │   │
    │   └── Camera/
    │       └── OfflinePhotoQueue.tsx  ← NEW
    │
    ├── lib/
    │   └── sync/
    │       └── fileQueue.ts           ← NEW
    │
    └── hooks/
        └── useFileUpload.ts           ← MODIFY
```

---

### **Phase 6: Background Sync** (Week 4-5)
*Time: 5-7 days*  
*Complexity: High*

**Tasks:**
1. Implement Background Sync API
2. Create sync manager
3. Handle online/offline detection
4. Implement retry logic
5. Add conflict resolution
6. Create sync status UI (show in existing UI)

**Deliverable:** Queued items (photos/scans) auto-sync when online

**Files to Create:**
```
daxno-frontend/
└── src/
    ├── lib/
    │   └── sync/
    │       ├── syncManager.ts         ← NEW
    │       ├── photoSyncHandler.ts    ← NEW
    │       └── conflictResolver.ts    ← NEW
    │
    ├── hooks/
    │   └── useSyncStatus.ts           ← NEW
    │
    └── components/
        └── SyncStatus.tsx             ← NEW
```

---

### **Phase 7: Backend Sync Endpoints** (Week 5)
*Time: 3-5 days*  
*Complexity: Medium*

**Tasks:**
1. Create batch sync endpoint in daxno-backend
2. Implement idempotency (prevent duplicates)
3. Add sync queue processing
4. Update background jobs to handle synced files/photos
5. Add progress updates

**Deliverable:** daxno-backend accepts and processes synced data

**Files to Create in daxno-backend:**
```
daxno-backend/
└── app/
    └── api/
        └── sync/
            ├── router.py              ← NEW
            ├── models.py              ← NEW
            ├── photo_handler.py       ← NEW
            └── scan_handler.py        ← NEW
```

---

### **Phase 8: Testing & Polish** (Week 6)
*Time: 5-7 days*  
*Complexity: Medium*

**Tasks:**
1. Test camera on iOS/Android/Desktop
2. Test offline → online transitions
3. Test large file/photo uploads
4. Test integration with existing Dropzone
5. Add error handling
6. Performance optimization
7. UI polish (loading states, error messages)
8. Test with existing daxno-frontend workflows

**Deliverable:** Production-ready offline sync + camera in daxno-frontend

---

## 📊 Timeline & Resources

### Total Timeline: **6 weeks** (1 developer)

| Phase | Duration | Developer | Focus |
|-------|----------|-----------|-------|
| Phase 1: PWA Setup | 3-5 days | Frontend | Service Workers, manifest |
| Phase 2: IndexedDB | 4-6 days | Frontend | Local storage |
| Phase 3: Camera Integration | 5-7 days | Frontend | **Photo capture** |
| Phase 4: Document Scanner | 5-7 days | Frontend | **Scanning, filters, PDF** |
| Phase 5: Offline Upload | 4-5 days | Frontend | File/photo queuing |
| Phase 6: Background Sync | 5-7 days | Frontend | Auto-sync logic |
| Phase 7: Backend Sync | 3-5 days | Backend | API endpoints |
| Phase 8: Testing | 5-7 days | Full Stack | QA, polish, integration |

### With 2 Developers: **3-4 weeks**
- Frontend dev handles Phases 1-6, 8
- Backend dev handles Phase 7
- Both work on Phase 8

---

## 🎯 MVP vs Full Implementation

### MVP (3-4 weeks)
*Focus: Core offline + basic camera*

**Include:**
- ✅ PWA setup in daxno-frontend
- ✅ IndexedDB for file/photo storage
- ✅ **Basic photo capture** 
- ✅ **Integration with existing Dropzone**
- ✅ Offline file/photo upload queue
- ✅ Auto-sync when online
- ✅ Basic UI indicators

**Skip for later:**
- ⏸️ Document scanner (crop/rotate/filters)
- ⏸️ Multi-page PDF
- ⏸️ Advanced retry logic

**Budget**: **$15K-$18K**

### Full Implementation (6 weeks)
*Everything above +*

- ✅ **Full document scanner**
- ✅ **Manual crop/rotate**
- ✅ **Filters & image processing**
- ✅ **Multi-page PDF generation**
- ✅ Smart conflict resolution
- ✅ Advanced retry strategies
- ✅ Real-time sync status
- ✅ Storage management UI
- ✅ Performance optimization

**Budget**: **$22K-$28K**

---

## 💰 Cost Analysis

### Development Cost (daxno-frontend)
- **1 Senior Full-Stack Dev (6 weeks)**: $18K-$24K
- **2 Developers (3-4 weeks)**: $18K-$24K
- **Testing & QA**: $3K-$4K
- **Total**: **$22K-$28K**

### Ongoing Costs
- **Additional server storage**: $10-20/month (for queued files)
- **PWA hosting**: $0 (same as current)
- **Total**: **$10-20/month**

---

## 📝 Next Steps

### 1. **Validate Requirements**
- Confirm camera/scanner features needed
- Review existing Dropzone implementation
- Decide on MVP vs full implementation
- Get stakeholder buy-in

### 2. **Technical Proof-of-Concept** (3 days)
- Build minimal PWA in daxno-frontend
- Test camera integration with Dropzone
- Verify sync works with daxno-backend

### 3. **Start Phase 1**
- If POC successful, begin Phase 1
- Set up project board with tasks
- Assign developers

---

## ✅ Success Criteria

**The feature is successful when:**
1. ✅ Users can take photos in daxno-frontend
2. ✅ Photos auto-sync within 5 minutes of coming online
3. ✅ Documents can be scanned (multi-page)
4. ✅ Camera integrates seamlessly with existing Dropzone
5. ✅ No data loss during offline → online transition
6. ✅ Works on 95%+ of target browsers
7. ✅ <5% sync failure rate
8. ✅ Existing upload workflows remain functional

---

**Ready to start?** I recommend beginning with a **3-day POC** to validate the approach in daxno-frontend, then commit to the full MVP (3-4 weeks) if successful.
