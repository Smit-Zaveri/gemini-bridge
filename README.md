<div align="center">
  <img width="1200" height="475" alt="Gemini Bridge Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  
  # 🌉 Gemini Bridge
  ### **AI-Powered Emergency Intake & Intelligence System**
  
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/)
  [![Gemini](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

---

## ⚡ Overview

**Gemini Bridge** is a next-generation emergency intelligence platform designed to bridge the gap between chaotic on-scene data and structured responder action. In high-pressure emergency situations, every second counts. Gemini Bridge uses **Multimodal AI (Google Gemini 2.5 Flash)** to process voice recordings, images, and text descriptions simultaneously, producing a unified, high-confidence incident report in seconds.

Built with a high-contrast **Neobrutalist design system**, the platform ensures maximum legibility and speed for dispatchers and first responders operating in critical environments.

---

## 🎯 Target Clients & Users

Gemini Bridge is designed for mission-critical organizations that require rapid information synthesis:

-   **Public Safety Answering Points (PSAPs):** Dispatchers use the system to triage multiple data streams (911 calls, bystander photos) into a single situational report.
-   **Emergency Medical Services (EMS):** Field responders receive AI-parsed medical record summaries and incident-specific criticality scores before arrival.
-   **Fire & Rescue Departments:** High-fidelity scene analysis helps in determining resource requirements (number of units, specific gear) based on visual evidence.
-   **Hospital Emergency Rooms:** Direct intake of incident data allows ER staff to prepare for arriving trauma cases with full context.

---

## 🚀 Key Features

### 1. Unified Incident Intake
Stop relying on single-channel communication. Upload images, audio recordings, and text notes. Gemini Bridge cross-references these inputs to flag contradictions and build a 360-degree view of the emergency.

### 2. Operations Command Center
A real-time dashboard featuring:
-   **Live Incident Feed:** Instantly updated list of active emergencies sorted by criticality.
-   **Criticality Trends:** Data-driven visualizations of incident frequency and severity.
-   **System Intelligence:** Monitoring AI confidence levels and average response times.

### 3. Medical Intelligence Portal
Upload medical records or patient documents. The system's AI extraction layer focuses on "Must-Know" clinical data:
-   Allergies & Medications
-   Blood Type
-   Active Conditions & Emergency Contacts

### 4. Smart Dispatch Drafting
Automated drafting of context-aware dispatch messages for Police, Fire, or EMS, ensuring authoritative communication without the delay of manual transcription.

---

## 🏗️ Technical Stack

-   **Frontend:** React 19 + Vite (Single Page Application)
-   **Backend:** Express.js (Node.js API Bridge)
-   **Styling:** Tailwind CSS 4 with a custom **Neobrutalist** design language.
-   **AI Engine:** Google Gemini 2.5 Flash (via `@google/genai`)
-   **Database & Auth:** Firebase (Firestore for real-time data, Firebase Auth for secure login)
-   **Charts & Visuals:** Recharts & Lucide React Icons

---

## 🛠️ Installation & Setup

### Prerequisites
-   Node.js (v18 or higher)
-   A Firebase Project (Firestore & Google Auth enabled)
-   A Gemini API Key (from Google AI Studio)

### Local Development

1.  **Clone the Repository:**
    ```bash
    git clone [repository-url]
    cd gemini-bridge
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    VITE_FIREBASE_API_KEY=...
    VITE_FIREBASE_AUTH_DOMAIN=...
    # (Add other Firebase config variables)
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

---

## 📖 How To Use

1.  **Authenticate:** Sign in using your organization-issued Google account.
2.  **Report an Incident:** Go to the "Report" tab, upload scene images or voice notes, and click "Analyze Incident".
3.  **Review Dashboard:** Monitor the "Dashboard" for a bird's-eye view of all reported emergencies.
4.  **Dispatch:** Use the "Dispatch" tool to generate and send official alerts to first responders based on AI analysis.
5.  **Medical Intake:** In clinical settings, use the "Medical" tab to parse incoming patient records for immediate trauma alerts.

---

## 🛡️ Security & Reliability
-   **Role-Based Access Control (RBAC):** Distinct interfaces for Responders, Nurses, and Admin staff.
-   **Offline Support:** Integrated Firebase synchronization for intermittent connectivity in rural or disaster-stricken areas.
-   **Verification Layers:** AI provides confidence scores (0.0 - 1.0) for all data extractions to ensure human-in-the-loop validation.

---

<p align="center">
  Built with 🖤 for First Responders by the Gemini Bridge Team.
</p>
