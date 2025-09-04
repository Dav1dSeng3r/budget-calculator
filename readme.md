# mobile.de Budget Calculator - Interactive Prototype

## 1. Overview

**Author:** Senior UX Designer
**Date:** August 13, 2025
**Purpose:** This interactive prototype demonstrates the core functionality and user flow of the new **Budget Calculator** feature for mobile.de. It is based on the official Product Requirements Document (PRD) and user flow diagram.

The goal of this prototype is to showcase the feature's primary "budget-first" user journey to product and business stakeholders, helping to visualize the concept and gather feedback for further refinement.

---

## 2. Prototype Features & Alignment with PRD

This prototype simulates the user journey on a desktop browser and focuses on the Minimum Viable Product (MVP) scope outlined in the PRD.

* **Touchpoints:** The prototype includes the two core MVP touchpoints:
    * **Search Results Page (SRP):** The starting point (`index.html`) where users can see multiple car listings.
    * **Vehicle Information Page (VIP):** The product detail page (`vip.html`).

* **Budget Calculator:** A modal window that allows users to input their financial parameters.
    * **Inputs:** Includes fields for Down Payment, Trade-in Value (manual entry), Loan Term, and Interest Rate.
    * **Personalized Payments:** After submitting the calculator, estimated monthly payments are displayed on all car listings.

* **Persistent Data:** The user's budget inputs are saved and persist across the SRP and VIP, creating a customized and seamless Browse experience. This is achieved using the browser's `localStorage` to simulate the cookie-based persistence required by the PRD.

* **User Flow:** The prototype demonstrates the key flow:
    1.  User opens the Budget Calculator from the SRP.
    2.  User enters financial data and applies it.
    3.  The SRP updates to show personalized monthly payments.
    4.  User clicks a car to navigate to the VIP.
    5.  The VIP displays the same personalized payment and allows for further budget adjustments.
    6.  The user can simulate a "Request financing" action.

---

## 3. How to Use

1.  Unzip the folder.
2.  Open the `index.html` file in any modern web browser (e.g., Chrome, Firefox, Safari).
3.  No web server or special setup is needed.

### **Walkthrough Scenario:**

1.  **Start on the SRP (`index.html`):** You'll see several car listings with only the cash price visible.
2.  **Open Calculator:** Click the **"Calculate Your Budget"** button.
3.  **Enter Data:** Input your desired down payment, trade-in value, and select a loan term and interest rate. Click **"Apply Budget."**
4.  **View Personalized Payments:** Notice how all car listings now display an estimated monthly payment below the cash price.
5.  **Go to VIP:** Click on any car listing (e.g., the "Volkswagen Golf").
6.  **Review VIP:** The VIP (`vip.html`) shows the same monthly payment for that specific car. The budget details you entered are summarized.
7.  **Adjust Budget:** Click **"Adjust Budget"** on the VIP to reopen the calculator, make changes, and see the payment update in real-time on this page.
8.  **Request Financing:** Click the **"Request Financing"** button to see a confirmation message, simulating the final step of the flow.