/**
 * chatbotRules.js
 * Rule-based intent engine for the RentEase chatbot.
 * Each rule has an array of keyword triggers and a response string.
 * Rules are checked in order — first match wins.
 */

const RULES = [
  // ── Greetings ──────────────────────────────────────────
  {
    keywords: ["hello", "hi", "hey", "good morning", "good evening", "good afternoon", "howdy", "greetings"],
    response: "👋 Hello! I'm the **RentEase Assistant**. I can help you with:\n\n• 🏠 Finding & booking properties\n• 📋 Rental agreements\n• 🔧 Maintenance requests\n• 💳 Rent payments & wallet\n• ⭐ Reviews & favorites\n\nWhat would you like to know?",
  },

  // ── Booking ────────────────────────────────────────────
  {
    keywords: ["how to book", "book a property", "make a booking", "booking process", "reserve a property", "how do i book"],
    response: "📅 **How to Book a Property:**\n\n1. Browse listings on the **Listings** page\n2. Click a property you like\n3. Click **\"Request Booking\"** on the details page\n4. Choose your preferred bedroom slot\n5. Submit the request — the owner will approve or decline\n\n💡 You'll be notified once the owner responds. Go to **My Bookings** to track status.",
  },
  {
    keywords: ["booking status", "my booking", "check booking", "booking request", "pending booking"],
    response: "📋 **Check Your Booking Status:**\n\nGo to **Tenant Dashboard → My Bookings** to see all your bookings with real-time status:\n\n• 🟡 **Pending** — Awaiting owner approval\n• ✅ **Approved** — You're confirmed!\n• ❌ **Rejected** — Owner declined\n• 🔴 **Cancelled** — Booking was cancelled\n\nNeed to cancel? You can do that directly from the bookings page.",
  },
  {
    keywords: ["cancel booking", "cancellation", "cancel my booking", "how to cancel"],
    response: "❌ **Cancelling a Booking:**\n\n1. Go to **Tenant Dashboard → My Bookings**\n2. Find the booking you want to cancel\n3. Click the **Cancel** button\n\n⚠️ Note: Once a booking is approved and an agreement is created, cancellation may require owner coordination. Contact your owner if needed.",
  },

  // ── Properties / Listings ──────────────────────────────
  {
    keywords: ["find property", "search property", "browse listings", "find a rental", "looking for a house", "available properties", "search for"],
    response: "🔍 **Finding a Property:**\n\n1. Go to **Listings** page from the navigation\n2. Use **filters** (price, bedrooms, type, location)\n3. Use the **Search bar** to search by location or name\n4. Switch to **Map View** to explore properties geographically\n\n💡 Click **❤️** to save a property to your Favorites!",
  },
  {
    keywords: ["list my property", "add property", "post property", "list a property", "how to list", "owner listing"],
    response: "🏡 **Listing Your Property:**\n\n1. Log in as an **Owner**\n2. Go to **Owner Dashboard → My Properties**\n3. Click **\"Add New Property\"**\n4. Fill in details: title, description, price, bedrooms, amenities, photos\n5. Submit — an Admin will review and approve it\n\n⏱️ Approval usually takes 24-48 hours. You'll be notified once it's live!",
  },
  {
    keywords: ["property approved", "property rejected", "property status", "listing status", "moderation", "pending approval"],
    response: "📝 **Property Listing Status:**\n\nAfter submitting, your property goes through admin review:\n\n• 🟡 **Pending** — Under review\n• ✅ **Approved** — Live on the site!\n• ❌ **Rejected** — Check admin remarks and resubmit\n\nView status in **Owner Dashboard → My Properties**.",
  },

  // ── Maintenance ────────────────────────────────────────
  {
    keywords: ["maintenance", "repair", "fix", "broken", "issue with", "not working", "maintenance request", "submit a request"],
    response: "🔧 **Submitting a Maintenance Request:**\n\n1. Go to **Maintenance** from the menu\n2. Click **\"New Request\"**\n3. Describe the issue, select category & urgency\n4. Submit — a technician will be assigned\n\nTrack progress under **My Maintenance Requests**. For emergencies, select **🚨 Emergency** priority!",
  },
  {
    keywords: ["maintenance status", "track maintenance", "repair status", "technician", "maintenance update"],
    response: "📊 **Tracking Maintenance:**\n\nGo to **Tenant Dashboard → Maintenance** to see:\n\n• 🟡 **Pending** — Awaiting assignment\n• 🔵 **Assigned** — Technician selected\n• 🟠 **In Progress** — Work underway\n• ✅ **Resolved** — Issue fixed\n\nYou'll receive notifications at each status change.",
  },
  {
    keywords: ["emergency", "urgent repair", "emergency maintenance", "emergency request"],
    response: "🚨 **Emergency Maintenance:**\n\nFor urgent issues (water leak, electrical fault, security):\n\n1. Go to **Maintenance → Emergency Request**\n2. Describe the emergency clearly\n3. Submit — it will be **prioritized immediately**\n\nFor life-threatening emergencies, please also contact local emergency services (119/110).",
  },

  // ── Payments & Wallet ──────────────────────────────────
  {
    keywords: ["pay rent", "rent payment", "how to pay", "payment", "pay my rent", "due date"],
    response: "💳 **Paying Your Rent:**\n\n1. Go to **Tenant Dashboard → Rent Payment**\n2. View your current bill and due date\n3. Top up your **Wallet** if needed\n4. Click **\"Pay Now\"** to complete payment\n\n💡 Set up auto-reminders from your account settings so you never miss a due date!",
  },
  {
    keywords: ["wallet", "top up", "balance", "add money", "wallet balance", "recharge"],
    response: "👛 **Your RentEase Wallet:**\n\nYour wallet is used for rent payments and fees.\n\n• View balance: **Tenant Dashboard → Wallet**\n• Top up via bank transfer or card\n• Transaction history is available in the wallet section\n\n💡 Keep your wallet topped up before your rent due date!",
  },
  {
    keywords: ["invoice", "receipt", "payment history", "bill", "billing history"],
    response: "🧾 **Payment History & Invoices:**\n\n• Go to **Tenant Dashboard → Bills** to view all invoices\n• Each bill shows amount, due date, and payment status\n• Download PDF invoices for your records\n\nFor disputes, contact your property owner directly.",
  },

  // ── Agreements ─────────────────────────────────────────
  {
    keywords: ["rental agreement", "lease agreement", "contract", "tenancy agreement", "sign agreement"],
    response: "📄 **Rental Agreements:**\n\nAfter a booking is approved, a rental agreement is created:\n\n1. Go to **Tenant Dashboard → Agreements**\n2. Review the terms carefully\n3. Download as PDF for your records\n\nAgreements include: rental period, monthly rent, terms, and both party details.\n\n📩 Contact your owner if you need to discuss any terms.",
  },
  {
    keywords: ["terminate agreement", "end agreement", "break lease", "early termination", "exit agreement"],
    response: "⚠️ **Early Termination:**\n\nTo end a rental agreement early:\n\n1. Go to **Agreements** in your dashboard\n2. Click on the active agreement\n3. Select **\"Request Early Termination\"**\n4. Provide a reason\n\n📋 Terms of early termination are governed by your agreement. Review the penalty clauses before proceeding.",
  },

  // ── Reviews ────────────────────────────────────────────
  {
    keywords: ["review", "leave a review", "rate property", "rating", "feedback", "write review"],
    response: "⭐ **Leaving a Review:**\n\n1. Go to the property's detail page\n2. Scroll to **Reviews** section\n3. Click **\"Write a Review\"**\n4. Rate (1–5 stars) and write your feedback\n5. Submit — it goes for admin approval\n\n💡 Reviews help other tenants make better decisions!",
  },

  // ── Favorites ──────────────────────────────────────────
  {
    keywords: ["favorite", "favourites", "saved properties", "wishlist", "heart", "save property"],
    response: "❤️ **Saving Favorites:**\n\n• Click the **❤️ heart icon** on any listing card to save/unsave\n• View all saved properties under **Favorites** in your menu\n• Favorites sync across devices when you're logged in\n\nPerfect for comparing properties before making a decision!",
  },

  // ── Account / Profile ──────────────────────────────────
  {
    keywords: ["change password", "update password", "reset password", "forgot password"],
    response: "🔑 **Changing Your Password:**\n\n1. Go to **Account Settings** (via profile menu)\n2. Navigate to the **Security** section\n3. Enter current password + new password\n4. Save changes\n\n🔒 Use a strong password with at least 8 characters, including numbers and symbols.",
  },
  {
    keywords: ["update profile", "edit profile", "profile picture", "change name", "personal details"],
    response: "👤 **Updating Your Profile:**\n\n1. Click your avatar in the top-right navbar\n2. Select **Profile** or **Account Settings**\n3. Edit your name, phone, or profile picture\n4. Save changes\n\nYour contact details help owners and tenants reach you faster.",
  },
  {
    keywords: ["contact owner", "contact landlord", "reach owner", "message owner", "owner contact"],
    response: "📞 **Contacting Your Owner:**\n\nOwner contact details are available:\n\n• On the **Property Details** page (phone/email)\n• In your **Booking** confirmation details\n• In your **Rental Agreement**\n\n💡 For platform-related issues, use the **Help Center** from the main menu.",
  },

  // ── Documents ──────────────────────────────────────────
  {
    keywords: ["documents needed", "what documents", "required documents", "paperwork", "id required"],
    response: "📁 **Documents Typically Required:**\n\n• National ID / Passport copy\n• Proof of income (pay slip / bank statement)\n• Reference letter (optional but helpful)\n\n📋 Specific requirements depend on the owner. Check the property listing or contact the owner directly for their requirements.",
  },

  // ── Analytics (Owner) ──────────────────────────────────
  {
    keywords: ["analytics", "earnings", "revenue", "income", "statistics", "owner stats", "performance"],
    response: "📊 **Owner Analytics:**\n\nAs an owner, go to **Owner Dashboard → Analytics** to view:\n\n• Monthly rental income trends\n• Occupancy rates\n• Booking stats\n• Review scores\n• Top performing properties\n\n💡 Use milestones to track long-term goals!",
  },

  // ── Help / Support ─────────────────────────────────────
  {
    keywords: ["help", "support", "contact support", "customer service", "help center", "i need help"],
    response: "🆘 **Getting Help:**\n\n• Visit the **Help Center** from the main menu for FAQs\n• Browse the **Service Information** page for maintenance guidance\n• Contact your owner directly for property-specific issues\n\nFor technical issues with the platform, use the **Help Center** contact form.",
  },

  // ── Logout / Account Issues ────────────────────────────
  {
    keywords: ["logout", "log out", "sign out", "how to logout"],
    response: "🚪 **Logging Out:**\n\nClick your **avatar/profile picture** in the top-right corner of the navbar, then select **\"Logout\"**.\n\nYour session will be cleared and you'll be redirected to the home page.",
  },

  // ── Goodbye ────────────────────────────────────────────
  {
    keywords: ["bye", "goodbye", "thanks", "thank you", "cheers", "that's all"],
    response: "😊 You're welcome! Have a great experience with **RentEase**. Feel free to come back anytime you have questions. Happy renting! 🏠✨",
  },
];

/**
 * Matches user input against the rule set.
 * Returns the matched response string, or null if no match.
 * @param {string} input - Raw user message
 * @returns {string|null}
 */
export function matchRule(input) {
  const normalized = input.toLowerCase().trim();
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => normalized.includes(kw))) {
      return rule.response;
    }
  }
  return null;
}
