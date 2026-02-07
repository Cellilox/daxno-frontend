# Testing PWA in Docker

## 🐳 Quick Docker Test

### **Option 1: Using Docker Compose (Recommended)**

```bash
cd /Users/pro_thierry/Documents/wrapper/daxno-frontend

# Build and run in one command
docker-compose up --build

# Access at: http://localhost:3001
# PWA will be enabled (production mode)
```

**Stop:**
```bash
docker-compose down
```

---

### **Option 2: Using Docker directly**

```bash
cd /Users/pro_thierry/Documents/wrapper/daxno-frontend

# Build the image
docker build -t daxno-frontend-pwa \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 \
  --build-arg NEXT_PUBLIC_CLIENT_URL=http://localhost:3001 \
  .

# Run the container
docker run -p 3001:3000 \
  -e NODE_ENV=production \
  daxno-frontend-pwa

# Access at: http://localhost:3001
```

---

## ✅ What to Test

### **1. PWA Installation**

1. Open **Chrome** on desktop or phone
2. Visit `http://localhost:3001` (or your machine's IP on phone)
3. Look for **install icon** in address bar
4. Click **"Install Daxno"**
5. App should open in standalone window!

### **2. Offline Mode (Basic)**

1. Open app
2. Open DevTools → Application → Service Workers
3. Check "Offline" checkbox
4. Reload page
5. App should still load (basic shell)

### **3. Service Worker Registration**

1. Open DevTools → Application → Service Workers
2. Should see: `sw.js` registered and activated
3. Status: "Activated and is running"

---

## 📱 Testing on Phone

### **Same Network Test:**

1. Find your computer's IP:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. On phone, visit: `http://YOUR_IP:3001`

3. Phone should show **"Add to Home Screen"** prompt

4. Install and test!

---

## 🔍 Expected Behavior

### **Current Phase 1:**
- ✅ App can be installed
- ✅ Service Worker registers
- ✅ Manifest loads
- ✅ Basic offline support (app shell)
- ❌ Upload doesn't queue offline yet (Phase 3)
- ❌ No camera yet (Phase 5)

### **After All Phases:**
- ✅ All above +
- ✅ Upload queues offline
- ✅ Auto-sync when online
- ✅ Camera capture
- ✅ Document scanner

---

## 🐛 Troubleshooting

### **"Install button doesn't appear"**
- PWA only works on HTTPS or localhost
- Use Chrome/Edge (Safari has limited support)
- Check DevTools → Application → Manifest for errors

### **"Service Worker not registering"**
- Check console for errors
- Ensure NODE_ENV=production (dev disables SW)
- Clear cache and reload

### **"Can't access on phone"**
- Ensure phone on same WiFi
- Check firewall isn't blocking port 3001
- Try with computer's IP address

---

## 📋 Quick Commands

**Start Docker:**
```bash
docker-compose up --build
```

**View logs:**
```bash
docker-compose logs -f
```

**Stop:**
```bash
docker-compose down
```

**Rebuild after changes:**
```bash
docker-compose up --build --force-recreate
```

---

## 🎯 Ready to Test?

Run:
```bash
cd /Users/pro_thierry/Documents/wrapper/daxno-frontend
docker-compose up --build
```

Then open Chrome and visit `http://localhost:3001`

Look for the **install icon** ⬇️ in the address bar!
