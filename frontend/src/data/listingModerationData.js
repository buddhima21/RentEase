/**
 * listingModerationData.js
 * Mock data for the Admin Listing Moderation page.
 * Replace with API calls when backend is ready.
 */

export const moderationListings = [
  {
    id: 1,
    title: "Modern High-Rise Apartment",
    location: "Malabe, Colombo",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7Qeh0mrnpVe1lIPUl8phrf3m1GJ_7kMyYAue8pberxFNiUCsOdUFooXxoYeK4mxKrFl2QkHiO0kMdoLIyC6MrXDazU6GD_wbpOShoRqX-XVQkVkMyWZ7cdQDNGBCqsIwn7dBxNqoAe0aiTB7rM0-EJaVgTCien9e_woJj1l3FRUZubUakQfMCtwMbwIFsZrEGNCM7i_YbnmQ46NfFxg_G5Kdaj_4M2EhnKD137qAaNISe1Y-gwQ8fMNtPrd9k7O7HTX5HSWpMh4yZ",
    status: "pending",
    submittedBy: { name: "John Doe", initials: "JD" },
    submittedDate: "Oct 24, 2023 • 10:45 AM",
    listingType: "Full Apartment Rental",
    flagReason: null,
  },
  {
    id: 2,
    title: "Suburban Family Home",
    location: "Kaduwela, Malabe",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC03pXAF9K3B8ZML55UtkvGuBatRoFv4wnCgL7XiWqknIBizufbJo5mV2PQO4cHUnm6Er-l1kSe4Ls_-XrDdDR3vHbBDSd_yoTs-FPPbB1kdFFFYnsYT7plLA3oZNEULSkTFEeuUxyM087CzGvHbpuLobdMS_rlt8iTa99gu-0kQxX_AEM8j9VeX3oUgZXOqflx5xjmKyVoyf3Uiti8gLnPAY8ENRIIP3yRFWE0aLwlzTxReVi1AW2DOJmTbpxcdX3vDQDmvorwkJwz",
    status: "flagged",
    submittedBy: { name: "Sarah Jennings", initials: "SJ" },
    submittedDate: "Oct 23, 2023 • 03:12 PM",
    listingType: "Full House Rental",
    flagReason: "Multiple blurry photos detected. Owner contact details in description.",
  },
  {
    id: 3,
    title: "Studio Loft Near Campus",
    location: "Malabe Campus Area",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAYtTKc7lBrL0hnC2-4e2zUwmT0xs451OISz5aICJOTzhqRol37p2n2Ef9p3I3NBSMiD09vogDjld9gF-7XthNNZKQyp_B8NGZf-9yRPZ3TXJwKe9XoP8oTTH7EWMVQMd07CvwU0bJN89s6zZTJ3guXttssGGE2Wh42i4m8-NlzKqf8dmxPIOTcf5nE2nAWM1N4mDTd-RT0U9BhJxfd21I_oZ7bqq5jCGCD6gFTHR5bIZlOZKpFpWHTuBB4OgYuYdumJ2Nm_5-rtCz6",
    status: "pending",
    submittedBy: { name: "Asela Mendis", initials: "AM" },
    submittedDate: "Oct 24, 2023 • 09:20 AM",
    listingType: "Single Room",
    flagReason: null,
  },
];

export const moderationTabs = [
  { label: "Pending Review", icon: "pending_actions", key: "pending", count: 12 },
  { label: "Flagged", icon: "flag", key: "flagged", count: 3 },
  { label: "Approved", icon: "check_circle", key: "approved", count: null },
  { label: "Rejected", icon: "cancel", key: "rejected", count: null },
];
