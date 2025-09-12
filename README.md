# Victoria Nurse

A sleek PWA for homecare nurses to record vital signs and share summaries via WhatsApp and email (with PDF export).

- **App name:** Victoria Nurse  
- **Tagline:** Care Together  
- **Footer:** _Powered by: karlthebrown_  
- **Hosting:** GitHub Pages

## Privacy (Stateless Mode)
- **No patient information is stored** on the device or in the cloud.
- After sharing (PDF/WhatsApp/email), the app **clears all fields** automatically.
- **Undo clear (3 seconds)**: transient in-memory snapshot lets you restore once.
- **Send confirmation** dialog appears before actions.
- Inputs use **autocomplete off** and **theme-colored focus rings**.
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
- **Neon vitals dashboard** PDF (dark background, colored chips & values).
- **“Victoria Nurse”** in PDF uses **indigo** (`#6366f1`) instead of black.
- **Unit labels** shown in PDF: **bpm**, **mmHg**, **%**, **rpm**, **°C**.
- **Tagline** styled with display font.
- **Powered by: karlthebrown** uses indigo to match theme (in-app + PDF).

## Local Run
```bash
python -m http.server 8080
# open http://localhost:8080

---

Developed by **Karl Brown** © 2025
