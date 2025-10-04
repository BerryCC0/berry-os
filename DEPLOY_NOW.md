# 🚀 Deploy Nouns OS as Farcaster Mini App

All URLs updated to **https://nounsos.wtf** - ready to deploy!

---

## ✅ **What's Already Done**

- ✅ All production URLs updated to `https://nounsos.wtf`
- ✅ Farcaster manifest configured
- ✅ Frame metadata configured
- ✅ Wallet metadata configured
- ✅ PWA manifest configured
- ✅ Mini App SDK integrated
- ✅ Wagmi connector configured
- ✅ Solana provider ready
- ✅ Build successful

---

## 🔴 **DEPLOY NOW**

### **Step 1: Push to Production**

```bash
git add .
git commit -m "Add Farcaster Mini App - Production ready for nounsos.wtf"
git push origin main
```

Vercel will auto-deploy to https://nounsos.wtf

---

## ⏳ **After Deploy is Live**

### **Step 2: Verify Manifest is Accessible**

Open in browser:
```
https://nounsos.wtf/.well-known/farcaster.json
```

✅ **Should show:** Your miniapp JSON
❌ **If 404:** Wait a minute for deploy, then refresh

---

### **Step 3: Sign the Manifest (CRITICAL!)**

**This is REQUIRED for Mini App to work in Farcaster.**

1. **Go to Manifest Tool** (desktop browser):
   ```
   https://warpcast.com/~/developers/frames
   ```

2. **Enter Domain:**
   ```
   nounsos.wtf
   ```
   (no https://, just the domain)

3. **Click "Validate"**
   - Should show your manifest details

4. **Scroll to Bottom → Click "Claim Ownership"**

5. **Sign with Farcaster Custody Address:**
   - You'll get a prompt to sign with your phone
   - Open Warpcast app on your phone
   - Follow the signing flow
   - This proves you own nounsos.wtf

6. **Copy the Signed Manifest:**
   - After signing, the tool shows the full manifest
   - Copy the ENTIRE JSON (includes `accountAssociation` section)
   - Should look like:
   ```json
   {
     "accountAssociation": {
       "header": "eyJmaWQ...",
       "payload": "eyJkb21...",
       "signature": "MHgwZmJ..."
     },
     "miniapp": {
       "version": "1",
       ...
     }
   }
   ```

7. **Update Your Manifest File:**
   ```bash
   # Replace the contents of public/.well-known/farcaster.json
   # with the signed version you just copied
   ```

8. **Deploy the Signed Manifest:**
   ```bash
   git add public/.well-known/farcaster.json
   git commit -m "Add signed Farcaster manifest"
   git push origin main
   ```

---

### **Step 4: Test Your Mini App**

#### **A. Test Frame Rendering**

1. Go to Warpcast (app or web)
2. Create a cast with:
   ```
   Nouns OS is now a Farcaster Mini App! 🎉
   
   https://nounsos.wtf
   ```
3. **Expected:** Frame appears with "Launch Nouns OS" button

#### **B. Test Mini App Launch**

1. Click "Launch Nouns OS" button in the frame
2. **Expected:**
   - Splash screen with Berry icon
   - App loads in Farcaster
   - Mac OS 8 interface appears
   - Your wallet auto-connects

#### **C. Test Features**

- [ ] Desktop icons appear
- [ ] Windows open/close
- [ ] Menu bar works
- [ ] Dock functions
- [ ] Apps launch (Calculator, Finder, etc.)
- [ ] Wallet connection active
- [ ] Mobile gestures work

---

## 🎉 **Launch Announcement**

Once everything works, share it!

**Suggested cast:**
```
Just launched Nouns OS as a Farcaster Mini App! 🎨💻

A full Mac OS 8 emulator running in Farcaster with:
• Desktop & windows
• File system & apps
• Web3 wallet integration
• Multi-chain support (EVM + Solana)
• Mobile optimized

Try it: https://nounsos.wtf

Built with @neynar
```

---

## 🐛 **Quick Troubleshooting**

### **Frame not appearing?**
- Check metadata in browser: View Page Source → search for `fc:frame`
- Verify manifest at: https://nounsos.wtf/.well-known/farcaster.json

### **"Claim Ownership" button not working?**
- Must use **custody address** (not connected wallet)
- Must sign via Warpcast mobile app
- Check you're logged into correct Farcaster account

### **Mini App won't launch?**
- Verify manifest is **signed** (has `accountAssociation`)
- Check all URLs point to `nounsos.wtf` (not localhost or vercel)
- Ensure using HTTPS (not HTTP)

### **Wallet not connecting?**
- Verify `NEXT_PUBLIC_REOWN_PROJECT_ID` set in Vercel
- Test in Warpcast app (not browser)
- Check `farcasterMiniApp()` connector in wagmi config

---

## 📋 **Environment Variables**

Make sure these are set in Vercel:

### **Required:**
```env
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id
```

### **Optional (but recommended):**
```env
NEYNAR_API_KEY=your_api_key
NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_client_id
FARCASTER_DEVELOPER_MNEMONIC="your mnemonic"
```

---

## 📚 **Resources**

- **Manifest Tool:** https://warpcast.com/~/developers/frames
- **Frame Validator:** https://warpcast.com/~/developers/frames
- **Neynar Docs:** https://docs.neynar.com/docs/convert-web-app-to-mini-app
- **Detailed Checklist:** `/docs/MINIAPP_GO_LIVE_CHECKLIST.md`

---

## ✅ **Deployment Checklist**

- [ ] Push to production (`git push origin main`)
- [ ] Wait for Vercel deploy to complete
- [ ] Verify https://nounsos.wtf loads correctly
- [ ] Verify manifest accessible at https://nounsos.wtf/.well-known/farcaster.json
- [ ] Go to https://warpcast.com/~/developers/frames
- [ ] Enter "nounsos.wtf" and validate
- [ ] Click "Claim Ownership" and sign with phone
- [ ] Copy signed manifest
- [ ] Update `/public/.well-known/farcaster.json` with signed version
- [ ] Deploy signed manifest (`git push`)
- [ ] Test frame rendering in Warpcast
- [ ] Test Mini App launch
- [ ] Share with community! 🎊

---

**You're ready to go! Just push and follow the checklist.** 🚀

