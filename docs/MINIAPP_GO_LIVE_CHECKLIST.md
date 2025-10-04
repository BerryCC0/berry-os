# Farcaster Mini App - Go Live Checklist

Complete checklist to launch Nouns OS as a Farcaster Mini App. Based on [Neynar documentation](https://docs.neynar.com/docs/convert-web-app-to-mini-app).

---

## ✅ **Already Completed**

- ✅ Installed `@neynar/react` package
- ✅ Added `MiniAppProvider` to app layout
- ✅ Configured Farcaster Wagmi connector
- ✅ Added Solana provider support
- ✅ Created basic `farcaster.json` manifest
- ✅ Added `fc:frame` metadata to layout
- ✅ Build successful, no errors

---

## 🚀 **Pre-Launch Steps**

### **Step 1: Deploy to Production**

```bash
git add .
git commit -m "Add Farcaster Mini App integration"
git push origin main
```

Vercel will auto-deploy. Wait for deployment to complete.

---

### **Step 2: Update Manifest URLs**

Once deployed, update `/public/.well-known/farcaster.json` with your **PRODUCTION DOMAIN**:

```json
{
  "miniapp": {
    "version": "1",
    "name": "Nouns OS",
    "iconUrl": "https://YOUR-PRODUCTION-DOMAIN.com/icons/apps/berry.svg",
    "homeUrl": "https://YOUR-PRODUCTION-DOMAIN.com",
    "imageUrl": "https://YOUR-PRODUCTION-DOMAIN.com/icons/apps/berry.svg",
    "buttonTitle": "Launch Nouns OS",
    "splashImageUrl": "https://YOUR-PRODUCTION-DOMAIN.com/icons/apps/berry.svg",
    "splashBackgroundColor": "#FFFFFF"
  }
}
```

**Replace:**
- `YOUR-PRODUCTION-DOMAIN.com` with your actual domain (e.g., `nouns-os.vercel.app`)

---

### **Step 3: Update Frame Metadata**

Edit `/app/layout.tsx` and update the `frameMetadata` URLs:

```typescript
const frameMetadata = {
  version: "next",
  imageUrl: "https://YOUR-PRODUCTION-DOMAIN.com/icons/apps/berry.svg",
  button: {
    title: "Launch Nouns OS",
    action: {
      type: "launch_miniapp",
      name: "Nouns OS",
      url: "https://YOUR-PRODUCTION-DOMAIN.com",
      splashImageUrl: "https://YOUR-PRODUCTION-DOMAIN.com/icons/apps/berry.svg",
      splashBackgroundColor: "#FFFFFF"
    }
  }
};
```

**Commit and push changes:**
```bash
git add .
git commit -m "Update Mini App URLs for production"
git push origin main
```

---

### **Step 4: Verify Manifest is Accessible**

Once deployed, test the manifest URL in your browser:

```
https://YOUR-PRODUCTION-DOMAIN.com/.well-known/farcaster.json
```

✅ **Should return:** JSON with your miniapp metadata
❌ **If 404:** Check that file is in `/public/.well-known/farcaster.json`

---

### **Step 5: Sign the Manifest with Farcaster Custody Address**

This is **REQUIRED** for the Mini App to work in Farcaster.

#### **Steps:**

1. **Go to Manifest Tool** (on desktop browser):
   ```
   https://warpcast.com/~/developers/frames
   ```

2. **Enter Your Domain:**
   - Input: `YOUR-PRODUCTION-DOMAIN.com`
   - Click "Validate"

3. **Scroll to Bottom:**
   - Click **"Claim Ownership"**

4. **Sign with Farcaster:**
   - Follow prompts to sign with your **Farcaster custody address**
   - You'll need to do this on your phone via Warpcast app

5. **Copy Signed Manifest:**
   - After signing, the tool will show the full signed manifest
   - Copy the entire JSON (includes `accountAssociation` section)

6. **Update Your Manifest:**
   - Replace `/public/.well-known/farcaster.json` with the signed version
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
       "name": "Nouns OS",
       ...
     }
   }
   ```

7. **Deploy Updated Manifest:**
   ```bash
   git add public/.well-known/farcaster.json
   git commit -m "Add signed Farcaster manifest"
   git push origin main
   ```

---

### **Step 6: Test the Mini App**

#### **A. Test Frame Rendering:**

1. Go to Warpcast (mobile or desktop)
2. Cast a message with your app URL:
   ```
   Check out Nouns OS! https://YOUR-PRODUCTION-DOMAIN.com
   ```
3. ✅ **Expected:** Frame appears with "Launch Nouns OS" button
4. ❌ **If no frame:** Check `fc:frame` metadata in `layout.tsx`

#### **B. Test Mini App Launch:**

1. Click the "Launch Nouns OS" button in the frame
2. ✅ **Expected:** 
   - Splash screen appears
   - App loads in Farcaster
   - User's wallet auto-connects
3. ❌ **If doesn't launch:** Check manifest signature and URLs

#### **C. Test Wallet Connection:**

1. Inside the Mini App, try wallet interactions
2. ✅ **Expected:** User's Farcaster wallet is connected
3. ❌ **If no wallet:** Check `farcasterMiniApp()` connector in wagmi config

---

## 📋 **Post-Launch Checklist**

### **Environment Variables Verification:**

Ensure these are set in Vercel:

```env
# REQUIRED
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id

# OPTIONAL (for Farcaster features)
NEYNAR_API_KEY=your_api_key
NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_client_id
FARCASTER_DEVELOPER_MNEMONIC="your mnemonic"
```

---

### **Verify Features Work:**

- [ ] Mini App launches from Farcaster feed
- [ ] Splash screen displays correctly
- [ ] User wallet auto-connects
- [ ] Desktop icons work
- [ ] Windows open/close properly
- [ ] Dock functions correctly
- [ ] Menu bar accessible
- [ ] Apps launch successfully
- [ ] Mobile gestures work (swipe to close, etc.)
- [ ] Safe areas respected (notch/home indicator)

---

### **Optional Enhancements:**

- [ ] Add webhook URL to manifest for notifications
- [ ] Implement Mini App analytics tracking
- [ ] Add custom splash screen image
- [ ] Create promotional cast with Mini App link
- [ ] Add to Farcaster Mini App directory
- [ ] Monitor analytics in Neynar dashboard

---

## 🐛 **Troubleshooting**

### **Frame Not Appearing:**

**Problem:** URL shared but no frame shows
**Solutions:**
- Verify `fc:frame` metadata in `layout.tsx`
- Check that page is accessible at the URL
- Ensure metadata is in `<head>` section

### **"Claim Ownership" Fails:**

**Problem:** Can't sign manifest
**Solutions:**
- Must use **custody address** (not connected wallet)
- Use Warpcast app on phone to sign
- Check you're logged into correct Farcaster account

### **Mini App Won't Launch:**

**Problem:** Frame appears but button doesn't work
**Solutions:**
- Verify manifest is signed (`accountAssociation` present)
- Check all URLs in manifest point to production domain
- Ensure manifest is at `/.well-known/farcaster.json`
- Verify HTTPS (not HTTP)

### **Wallet Not Connecting:**

**Problem:** Mini App loads but no wallet
**Solutions:**
- Verify `farcasterMiniApp()` in wagmi config
- Check `NEXT_PUBLIC_REOWN_PROJECT_ID` is set
- Test in Warpcast app (not browser)

---

## 📚 **Resources**

- [Neynar Mini App Docs](https://docs.neynar.com/docs/convert-web-app-to-mini-app)
- [Manifest Tool](https://warpcast.com/~/developers/frames)
- [Frame Validator](https://warpcast.com/~/developers/frames)
- [Farcaster Mini Apps Spec](https://docs.farcaster.xyz/developers/frames/spec)
- [Neynar Support](https://neynar.com/support)

---

## ✅ **Launch Day Checklist Summary**

1. [ ] Deploy to production (Vercel)
2. [ ] Update all URLs in manifest to production domain
3. [ ] Update frame metadata URLs in `layout.tsx`
4. [ ] Verify manifest accessible at `/.well-known/farcaster.json`
5. [ ] Sign manifest with Farcaster custody address
6. [ ] Deploy signed manifest
7. [ ] Test frame rendering in Warpcast
8. [ ] Test Mini App launch
9. [ ] Test wallet connection
10. [ ] Share with community! 🎉

---

**Once all steps are complete, Nouns OS will be live as a Farcaster Mini App!**

