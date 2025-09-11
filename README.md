# Victoria Nurse

A sleek PWA for homecare nurses to record vital signs and share summaries via WhatsApp and email (with PDF export).

- **App name:** Victoria Nurse  
- **Tagline:** Care Together  
- **Footer:** _Powered by: karlthebrown_  
- **Hosting:** GitHub Pages

## Privacy (Stateless Mode)
- **No patient information is stored** on the device or in the cloud.
- After sharing (PDF/WhatsApp/email), the app **clears all fields** automatically.
- Optional **3-second “Undo clear”** toast lets you restore once (memory only).
- Inputs use **autocomplete off** to reduce autofill.
- The service worker **does not cache** `index.html` or dynamic requests.

## Capture Order
1. Patient Name  
2. Temperature  
3. Pulse (Heart Rate)  
4. Respiratory Rate  
5. Blood Pressure  
6. Oxygen Saturation (SpO₂)  
7. Blood Sugar Level  
8. Pain Assessment  
9. Medication – Morning  
10. Medication – Afternoon  
11. Medication – Evening  
12. Notes  
13. Nurse’s Name (who performed the checks)

## Visual & PDF Updates
- **PDF** mimics a **neon vitals dashboard** (dark background with colored chips & values).
- **“Victoria Nurse”** header in PDF uses theme color (not black).
- **Unit labels** added in PDF: **bpm**, **mmHg**, **%**, **rpm**, **°C**.
- **Tagline** uses a display font.
- **Input focus rings** match theme (no black ring).
- **Powered by: karlthebrown** uses theme color.

## Local Run
```bash
python -m http.server 8080

---

Developed by **Karl Brown** © 2025
