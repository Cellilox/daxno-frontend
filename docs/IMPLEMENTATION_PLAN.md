# Quick Implementation Plan - PWA + Camera for daxno-frontend

## 🎯 Goal
Add PWA + offline sync + camera to existing daxno-frontend without breaking current flow.

---

## 📋 Implementation Order (Minimal Changes First)

### **Phase 1: Core PWA Setup** (5 files)
*Time: 30 minutes*

1. ✅ Add PWA dependencies
2. ✅ Create manifest.json
3. ✅ Create basic Service Worker
4. ✅ Update next.config.ts
5. ✅ Test installability

**Deliverable:** App can be installed, works offline (basic)

---

### **Phase 2: IndexedDB Queue** (3 files)
*Time: 20 minutes*

1. ✅ Create IndexedDB wrapper
2. ✅ Create queue operations
3. ✅ Test storage works

**Deliverable:** Can store files locally

---

### **Phase 3: Modify Dropzone** (1 file)
*Time: 15 minutes*

1. ✅ Add offline detection to handleUpload
2. ✅ Queue uploads when offline
3. ✅ Close popup immediately
4. ✅ Show appropriate status

**Deliverable:** Upload works offline/online

---

### **Phase 4: Background Sync** (2 files)
*Time: 25 minutes*

1. ✅ Create sync manager
2. ✅ Auto-sync when online
3. ✅ Retry logic

**Deliverable:** Queued uploads auto-process

---

### **Phase 5: Camera Integration** (3 files)
*Time: 30 minutes*

1. ✅ Create camera hook
2. ✅ Create camera component
3. ✅ Add to Dropzone options

**Deliverable:** Can take photos instead of upload

---

## 🎯 Total Time: ~2 hours for MVP

---

## 📁 Files to Create/Modify

### **NEW Files (11):**
```
daxno-frontend/
├── public/
│   ├── manifest.json          (NEW)
│   ├── sw.js                  (NEW)
│   └── icons/
│       ├── icon-192.png       (NEW)
│       └── icon-512.png       (NEW)
│
└── src/
    ├── lib/
    │   ├── db/
    │   │   └── indexedDB.ts   (NEW)
    │   └── sync/
    │       └── syncManager.ts (NEW)
    │
    ├── hooks/
    │   ├── useCamera.ts        (NEW)
    │   └── useOnlineStatus.ts  (NEW)
    │
    └── components/
        └── Camera/
            └── CameraCapture.tsx (NEW)
```

### **MODIFIED Files (3):**
```
daxno-frontend/
├── next.config.ts                        (MODIFY - add PWA)
├── package.json                          (MODIFY - add deps)
└── src/components/files/Dropzone.tsx     (MODIFY - add offline queue)
```

---

## ✅ Let's Start Implementation!

**Ready to implement in this order:**
1. Phase 1: PWA setup (dependencies, manifest, service worker)
2. Phase 2: IndexedDB queue
3. Phase 3: Modify Dropzone
4. Phase 4: Background sync
5. Phase 5: Camera

**Proceeding now...**
