# 🔐 SSL Setup for Custom Domains

## ✅ Domain Status (تم)
- ✅ cli.mrf103.com → HTTP active
- ✅ core.mrf103.com → HTTP active  
- ✅ ecosystem.mrf103.com → HTTP active
- ✅ vscode.mrf103.com → HTTP active

## 🔒 تفعيل HTTPS (الخطوة التالية)

### Railway Dashboard Steps:

1. **mrf103-arc-ecosystem** project:
   ```
   Settings → Domains → ecosystem.mrf103.com
   ✓ Enable "Generate SSL Certificate"
   ✓ Wait 5-10 minutes for certificate
   ```

2. **arc-namer-cli** (إذا موجود):
   ```
   Settings → Domains → cli.mrf103.com
   ✓ Enable SSL
   ```

3. **arc-namer-core**:
   ```
   Settings → Domains → core.mrf103.com
   ✓ Enable SSL
   ```

4. **arc-namer-vscode**:
   ```
   Settings → Domains → vscode.mrf103.com
   ✓ Enable SSL
   ```

### 🔍 التحقق من SSL:

```bash
# Test after 10 minutes
curl -I https://ecosystem.mrf103.com
curl -I https://cli.mrf103.com
curl -I https://core.mrf103.com
curl -I https://vscode.mrf103.com
```

## 📝 ملاحظات مهمة:

- **Railway SSL**: تلقائي ومجاني من Let's Encrypt
- **Waiting Time**: 5-10 دقائق لإصدار الشهادة
- **Auto-Renewal**: تتجدد تلقائياً كل 90 يوم
- **301 Redirect**: HTTP → HTTPS تلقائي بعد SSL

## 🚀 Post-SSL Checks:

1. ✅ Browser test (no warnings)
2. ✅ API endpoints working
3. ✅ CORS configured for HTTPS
4. ✅ Environment variables updated

## 🔗 Railway SSL Docs:
https://docs.railway.app/guides/public-networking#custom-domains
