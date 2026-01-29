# Testing PWA with Your Existing Docker Setup

## 🎯 Two Testing Modes

### **Mode 1: Development (Default) - PWA Disabled**
```bash
cd daxno-rag/deployment/docker_compose

# Your normal development command (PWA disabled for easier debugging)
docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.daxno.yml up -d
```

**Result:** 
- Fast reload, hot module replacement
- PWA features DISABLED (easier debugging)
- Access: http://localhost:3001

---

### **Mode 2: Production - PWA ENABLED ✨**
```bash
cd daxno-rag/deployment/docker_compose

# Set environment variables for production mode
export NODE_ENV=production
export START_COMMAND="npm run build && npm start"

# Rebuild and start with PWA enabled
docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.daxno.yml up -d --build daxno-frontend

# Wait for build (~2-3 minutes first time)
docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.daxno.yml logs -f daxno-frontend
```

**Result:**
- Production build with PWA enabled
- Can install app on phone/desktop
- Service Worker active
- Access: http://localhost:3001

---

## 📱 Testing PWA Features

### **1. Test on Desktop (Chrome)**

1. Open Chrome
2. Visit `http://localhost:3001`
3. Look for **install button** (⬇️) in address bar
4. Click to install
5. App opens in standalone window!

### **2. Test on Phone (Same Network)**

1. Find your computer's IP:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   # Example output: 192.168.1.100
   ```

2. On phone (same WiFi), visit: `http://YOUR_IP:3001`

3. Browser prompts: **"Add Daxno to Home Screen"**

4. Install and test!

### **3. Test Offline Mode (Basic)**

1. Open DevTools → Application → Service Workers
2. Check ✅ "Offline"
3. Reload page
4. App still loads (basic shell)

---

## 🔄 Switching Between Modes

### **Back to Development Mode:**
```bash
cd daxno-rag/deployment/docker_compose

# Unset production variables
unset NODE_ENV
unset START_COMMAND

# Restart in dev mode
docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.daxno.yml restart daxno-frontend
```

### **Or just rebuild without env vars:**
```bash
cd daxno-rag/deployment/docker_compose

# Normal dev startup (PWA disabled)
docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.daxno.yml up -d daxno-frontend
```

---

## 📋 Quick Commands Reference

### **Development (Default)**
```bash
cd daxno-rag/deployment/docker_compose

# Start dev stack
docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.daxno.yml up -d

# View logs
docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.daxno.yml logs -f daxno-frontend
```

### **Production (PWA Testing)**
```bash
cd daxno-rag/deployment/docker_compose

# Set production mode and rebuild
NODE_ENV=production START_COMMAND="npm run build && npm start" \
  docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.daxno.yml \
  up -d --build daxno-frontend

# Watch build progress
docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.daxno.yml \
  logs -f daxno-frontend
```

### **Restart Single Service**
```bash
cd daxno-rag/deployment/docker_compose

# Restart just daxno-frontend
docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.daxno.yml \
  restart daxno-frontend
```

---

## ✅ What to Check

### **In DevTools → Application:**

**Manifest (PWA Config):**
- Name: "Daxno"
- Start URL: "/"
- Display: "standalone"
- Icons: 192px, 512px

**Service Workers:**
- Status: "Activated and is running"
- Source: sw.js
- Scope: /

**Storage:**
- IndexedDB: (will have daxno databases after Phase 2)

---

## 🐛 Troubleshooting

### **"Install button doesn't appear"**

**Check 1:** Are you in production mode?
```bash
docker exec daxno-frontend printenv NODE_ENV
# Should output: production
```

**Check 2:** Is Service Worker registered?
```bash
docker exec daxno-frontend ls -la /app/public/sw.js
# Should exist
```

**Check 3:** Check browser console
- Open DevTools → Console
- Look for Service Worker registration success/errors

### **"Build taking too long"**

Production builds take 2-3 minutes. Check progress:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.daxno.yml \
  logs -f daxno-frontend
```

Look for:
```
> Building...
> Compiled successfully
> Server is running on http://0.0.0.0:3000
```

### **"Can't access on phone"**

1. Ensure phone on same WiFi
2. Check firewall:
   ```bash
   # Mac: Allow port 3001
   # System Preferences → Security & Privacy → Firewall → Options
   ```
3. Try computer's IP instead of localhost

---

## 🎯 Expected Behavior

### **Phase 1 (Current):**
- ✅ App can be installed
- ✅ Service Worker registers
- ✅ Manifest loads
- ✅ Basic offline (app shell)
- ❌ Uploads don't queue offline yet (Phase 3)
- ❌ No camera yet (Phase 5)

### **After All Phases:**
- ✅ All above +
- ✅ Upload queues offline
- ✅ Auto-sync when online
- ✅ Camera capture
- ✅ Document scanner

---

## 💡 Pro Tips

1. **Keep dev mode for daily work** (faster, better debugging)
2. **Use production mode to test PWA** (install, offline)
3. **Clear Service Worker cache** when testing changes:
   - DevTools → Application → Service Workers → Unregister
   - Then reload page

4. **Build cache persists** (faster subsequent builds)
   - Stored in /app/.next volume

---

## 🚀 Ready to Test?

**Quick test run:**
```bash
cd daxno-rag/deployment/docker_compose

# Enable PWA and rebuild
NODE_ENV=production START_COMMAND="npm run build && npm start" \
  docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.daxno.yml \
  up -d --build daxno-frontend

# Watch it build
docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.daxno.yml \
  logs -f daxno-frontend

# When you see "Server is running", open Chrome:
# http://localhost:3001
# Look for install button!
```

---

**Need to continue with Phases 2-5?** Just say "continue" and I'll add offline queue, camera, etc.
