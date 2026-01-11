# DigitalOcean Spaces Setup Guide

## Quick Setup (Recommended - No CDN)

For most use cases, the regular Spaces endpoint works perfectly and doesn't require any additional setup.

### Environment Variables

Add these to your `apps/backend/.env` file:

```env
# DigitalOcean Spaces Configuration
DO_SPACES_ACCESS_KEY=your_access_key_here
DO_SPACES_SECRET_KEY=your_secret_key_here
DO_SPACES_BUCKET=dev.quick-certify
DO_SPACES_REGION=sfo3

# Leave CDN endpoint empty or unset to use regular endpoint
# DO_SPACES_CDN_ENDPOINT=
# DO_SPACES_USE_CDN=false
```

### URL Format

Files will be accessible at:
```
https://dev.quick-certify.sfo3.digitaloceanspaces.com/organizations/.../logo/...jpg
```

This endpoint works immediately without any additional configuration.

---

## CDN Setup (Optional - For Better Performance)

If you want to use CDN for faster global delivery, you need to:

### 1. Enable CDN on DigitalOcean

1. Go to your DigitalOcean Control Panel
2. Navigate to **Spaces** → Select your Space
3. Click on **Settings** tab
4. Under **CDN**, click **Enable CDN**
5. Wait for CDN to be provisioned (usually takes a few minutes)

### 2. Update Environment Variables

```env
# DigitalOcean Spaces Configuration
DO_SPACES_ACCESS_KEY=your_access_key_here
DO_SPACES_SECRET_KEY=your_secret_key_here
DO_SPACES_BUCKET=dev.quick-certify
DO_SPACES_REGION=sfo3

# Enable CDN
DO_SPACES_USE_CDN=true
DO_SPACES_CDN_ENDPOINT=https://dev.quick-certify.sfo3.cdn.digitaloceanspaces.com
```

### 3. URL Format with CDN

Files will be accessible at:
```
https://dev.quick-certify.sfo3.cdn.digitaloceanspaces.com/organizations/.../logo/...jpg
```

---

## File Permissions

All uploaded files are automatically set with `public-read` ACL, so they are publicly accessible via the URLs.

## Troubleshooting

### Images not loading?

1. **Check if CDN is enabled** (if using CDN endpoint):
   - Go to DigitalOcean Control Panel → Spaces → Your Space → Settings
   - Verify CDN is enabled and active

2. **Use regular endpoint instead**:
   - Set `DO_SPACES_USE_CDN=false` or leave it unset
   - This uses the regular Spaces endpoint which works without CDN

3. **Verify file permissions**:
   - Files are uploaded with `public-read` ACL
   - Check in DigitalOcean Control Panel that files are publicly accessible

4. **Check bucket name**:
   - Make sure `DO_SPACES_BUCKET` is just the bucket name (e.g., `dev.quick-certify`)
   - Not the full URL

5. **Test URL directly in browser**:
   - Copy the URL from the API response
   - Paste it directly in a browser to see if it loads
   - If it doesn't load in browser, the issue is with DigitalOcean configuration, not the code

