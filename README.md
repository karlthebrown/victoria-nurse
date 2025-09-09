# Victoria Nurse

A modern, mobile-friendly web app to capture **Patient Summary**, **Daily Vitals**, and a **Nurse Vital Signs Checklist**, then **Preview / Share via WhatsApp / Export to PDF**.

## ✨ Features
- **Landing page** with nurse hero image and welcoming gradient.
- **Patient Summary** (week, weights, recipient, note).
- **Daily Vitals** table (add AM/PM rows fast).
- **Nurse Checklist** (core + extended vitals, observations, notes).
- **Preview** the compiled message.
- **Share to WhatsApp** (with or without a phone number).
- **Print / Export to PDF** (uses browser print).
- **PWA installable**: add to home screen (Android/iOS).

## 🚀 Quick Start (GitHub Pages)
1. Upload all files in this folder to your GitHub repo (root).
2. Ensure icons at `icons/icon-192.png` and `icons/icon-512.png`.
3. Enable **Settings → Pages** → Source: `main` → `/ (root)`.
4. Open: `https://<your-username>.github.io/victoria-nurse/`

## 📁 Project Structure
```
index.html
manifest.webmanifest
service-worker.js
favicon.ico
icons/
 ├─ icon-192.png
 └─ icon-512.png
assets/
 └─ nurse-hero.jpg
```

## 📱 Install to Home Screen
- **Android/Chrome**: open the site → ⋮ menu → *Install app*.
- **iPhone/Safari**: share icon → *Add to Home Screen*.

## 🔧 Development Tips
- When you change icons or HTML, bump the cache in `service-worker.js` (e.g., `victoria-nurse-v2`) so updates appear immediately.
- To share to a specific number, enter full international format (e.g., `+23324…`). If left blank, WhatsApp opens with the text to pick a contact.
- Avoid sharing sensitive identifiers in notes.

---

Developed by **Karl Brown** © 2025
