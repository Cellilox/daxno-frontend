# Quick Setup Guide - Get Clerk Session Token

## Step 1: Login to Your App
1. Open your browser: `http://localhost:3001`
2. Sign in with Clerk

## Step 2: Get Session Token
1. Press **F12** (or Right-click → Inspect)
2. Go to **Application** tab (or **Storage** in Firefox)
3. Click **Cookies** → `http://localhost:3001`
4. Find cookie named: **`__session`**
5. **Copy the entire Value** (long string)

## Step 3: Add to Cypress

### Option A: Create cypress.env.json (Recommended)
```bash
cd /Users/pro_thierry/Documents/wrapper/daxno-frontend
cat > cypress.env.json <<'EOF'
{
  "CLERK_SESSION_TOKEN": "PASTE_YOUR_TOKEN_HERE"
}
EOF
```

### Option B: Environment Variable
```bash
export CYPRESS_CLERK_SESSION_TOKEN="PASTE_YOUR_TOKEN_HERE"
npm run cypress:run -- --spec "cypress/e2e/auth.cy.ts"
```

## Done! 🎉
All tests will now run automatically without manual sign-in.

**Note**: Token expires after ~1 hour. If tests start failing, get a fresh token.
