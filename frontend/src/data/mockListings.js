/**
 * Mock listing data for the Featured Listings section.
 * Each object represents a single rental property card.
 */
const mockListings = [
    {
        id: 1,
        title: "Luxury Studio Annex",
        location: "New Kandy Rd, Near SLIIT, Malabe",
        price: "LKR 35,000",
        beds: 1,
        baths: 1,
        amenity: "WiFi",
        amenityIcon: "wifi",
        rating: 4.9,
        badge: "FEATURED",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuALlivQwF9hYM_8QFRHZ--1jcVqwT7ySOOa0wA3kqj1MIDx7zBEKC6mGrFYsCgxgwlO-njj0K2numFsOnArui5lFQCHqVhRLTjVlzTUTPyFCtwIzhpMnIsI52xhJCrBk5Xa5Gw5hdHfsdOfiEbQNM3K4UPOuXOl-4vAbPwrJjZtVmcwtfBpsJ3XR7_kUjUE9fLhhr_4pu51gSwP84lU4DFWzfGy_z_344R4mET0Kgzhwm2TG2LDmicIi2NP2aTkCzFQn_Sh_bphRTZC",
        reviews: [
            { id: 101, user: "Sarah J.", avatar: "https://i.pravatar.cc/150?u=sarahj", rating: 5, date: "October 12, 2025", text: "Absolutely loved staying here! The interior is super modern and the WiFi is incredibly fast, which is perfect for my assignments. Highly recommend to any student." },
            { id: 102, user: "Keshani M.", avatar: "https://i.pravatar.cc/150?u=keshanim", rating: 4.8, date: "September 05, 2025", text: "Great place, very safe and close to the campus. The landlord is very responsive." }
        ]
    },
    {
        id: 2,
        title: "Metro Sky Apartment",
        location: "Bambalapitiya, Colombo 04",
        price: "LKR 85,000",
        beds: 2,
        baths: 2,
        amenity: "AC",
        amenityIcon: "ac_unit",
        rating: 4.7,
        badge: "STUDENT PICK",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuB689MR70TQLSEftbF4GT_8nbKxA4Viv1HhpCgk5YMSrSvq-12RqE_sfmXTepMmz_marf-8cz5iby5YKU89HunofjsJN0Ttb2H8cwIPMlQz8Rw_Ce-KoYgeeX5tRuuue6l19PoMsMBKPo5S7Qmo_Uz9lHxqv0T6dxXvFPbsWIeSTy--EUNVq1t-bBGcIe8j0tt_IPhIMTk67BRIHHdSyh2Lt_ndwHRkCZGk0kW53jXF2x6lxgKloZ0Z3kGJMxVKv1nEK5lKESIh8gfH",
        reviews: [
            { id: 201, user: "Ahmad R.", avatar: "https://i.pravatar.cc/150?u=ahmadr", rating: 4.5, date: "August 20, 2025", text: "Spacious and well-ventilated. The AC is a lifesaver during the summer. A bit pricey but worth it if you share with a roommate." },
            { id: 202, user: "Dinithi S.", avatar: "https://i.pravatar.cc/150?u=dinithis", rating: 5, date: "July 11, 2025", text: "Amazing views from the balcony. Secure building and very convenient location." },
            { id: 203, user: "Chris L.", avatar: "https://i.pravatar.cc/150?u=chrisl", rating: 4, date: "June 02, 2025", text: "Good apartment but the parking space is a bit tight." }
        ]
    },
    {
        id: 3,
        title: "Green View Annex",
        location: "Pittugala, Near SLIIT, Malabe",
        price: "LKR 28,000",
        beds: 1,
        baths: 1,
        amenity: "Parking",
        amenityIcon: "directions_car",
        rating: 4.5,
        badge: null,
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCPUW5B2BukUD8lqBk_sPNLMXAhqD6LwhptVJ_pA8pTWoQJ-aGg-Kg4Dp8SXzv6Xe4M_6MqfHNOs9X0OLCGODhYbM-3EXyJ3YRFwBA2NRqSJGL5dsb1V-7QeJ3Z17INJx8nARCNq4no2cjWi2XuOv80ztGdx8wTEZitUq1BosPVrpcHTeheCdEndZwi_j3vLMq2GnVuO4HXBgKfNmQ3SN6MEyQGF49ow8OjHLvD4hw7ha9u3OC72f2v20-5wbP1uiOx0ToRdFeHQPdc",
        reviews: [
             { id: 301, user: "Nimal W.", avatar: "https://i.pravatar.cc/150?u=nimalw", rating: 4.5, date: "November 03, 2025", text: "Very peaceful environment. Good value for money if you want a quiet place to study." }
        ]
    },
];

export default mockListings;
