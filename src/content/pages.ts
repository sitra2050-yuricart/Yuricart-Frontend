/**
 * Copy for the information pages. Only facts the store already runs on are
 * stated here (payment options, delivery fee shown at checkout, analytics in
 * use). Specifics the shop owner decides, like warranty length or a return
 * window, are not invented: the pages say they are confirmed when you order.
 * Edit this file to change the wording.
 */
export interface ContentSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

export interface ContentPageData {
  slug: string;
  title: string;
  description: string;
  intro: string;
  sections: ContentSection[];
  faqs?: Array<{ q: string; a: string }>;
  contact?: boolean;
  updated?: string;
}

export const CONTENT_PAGES: Record<string, ContentPageData> = {
  about: {
    slug: "about",
    title: "About Yuricart",
    description:
      "Yuricart Electronics sells laptops, printers, tablets and accessories from Bazaar Plaza on Moi Avenue, Nairobi, with delivery across Kenya.",
    intro:
      "Yuricart Electronics is a shop in Nairobi CBD selling laptops, desktops, printers, tablets and accessories, in store and online.",
    sections: [
      {
        heading: "What we sell",
        paragraphs: [
          "Business and everyday laptops, all-in-one computers, MacBooks, printers, tablets and the accessories that go with them. Each product page shows the specifications, the condition and what is in stock.",
        ],
      },
      {
        heading: "Visit the shop",
        paragraphs: [
          "Bazaar Plaza, Moi Avenue, 1st Floor, Shop A02, Nairobi CBD. You can see and test a device before you buy.",
        ],
      },
      {
        heading: "Buy online",
        paragraphs: [
          "Order on the website and pay on delivery or by M-Pesa, or send the order on WhatsApp. We deliver across Nairobi and Kenya.",
        ],
      },
    ],
  },

  contact: {
    slug: "contact",
    title: "Contact us",
    description:
      "Contact Yuricart Electronics in Nairobi CBD: WhatsApp, the shop address on Moi Avenue, and how to reach us about an order.",
    intro: "The fastest way to reach us is WhatsApp. You can also visit the shop.",
    contact: true,
    sections: [
      {
        heading: "About an order",
        paragraphs: [
          "Have your order number ready. You can check an order any time on the Track your order page.",
        ],
      },
    ],
  },

  delivery: {
    slug: "delivery",
    title: "Delivery",
    description:
      "How delivery works at Yuricart Kenya: the fee is shown at checkout before you pay, and we deliver across Nairobi and Kenya.",
    intro: "We deliver across Nairobi and the rest of Kenya.",
    sections: [
      {
        heading: "Delivery fee",
        paragraphs: [
          "The delivery fee depends on where you are. Enter your city at checkout and the fee and the total are shown before you place the order. Some orders qualify for free delivery, and checkout says when they do.",
        ],
      },
      {
        heading: "When it arrives",
        paragraphs: [
          "After you order we confirm the delivery time with you on WhatsApp or by phone. You can follow the status of your order any time on the Track your order page.",
        ],
      },
      {
        heading: "Collect from the shop",
        paragraphs: [
          "You can also collect your order from Bazaar Plaza, Moi Avenue, 1st Floor, Shop A02. Tell us when you order.",
        ],
      },
    ],
  },

  warranty: {
    slug: "warranty",
    title: "Warranty",
    description:
      "Warranty at Yuricart Kenya: terms depend on the product and are confirmed when you order. Ask us on WhatsApp before you buy.",
    intro:
      "Warranty depends on the product. New and used devices are not covered in the same way, so we confirm it with you before you pay.",
    sections: [
      {
        heading: "Before you buy",
        paragraphs: [
          "Each product page shows its condition (for example new or ex-UK). Ask us on WhatsApp what warranty applies to the exact device you want, and we will confirm it in writing when you order.",
        ],
      },
      {
        heading: "If something is wrong",
        paragraphs: [
          "Message us on WhatsApp with your order number and a short description or photo of the problem. We will tell you what to do next.",
        ],
      },
    ],
  },

  returns: {
    slug: "returns",
    title: "Returns and refunds",
    description:
      "What to do if there is a problem with your Yuricart order: contact us with your order number and we will tell you the next step.",
    intro:
      "If your order is not what you expected or arrives with a problem, contact us first. We will sort it out with you.",
    sections: [
      {
        heading: "How to start a return",
        list: [
          "Message us on WhatsApp with your order number.",
          "Tell us what is wrong and, if you can, send a photo.",
          "We reply with the next step, whether that is a replacement, a repair or a refund.",
        ],
      },
      {
        heading: "Check on delivery",
        paragraphs: [
          "Please check the device when it is delivered, before the courier leaves where you can. It is much easier to fix a problem we know about straight away.",
        ],
      },
    ],
  },

  privacy: {
    slug: "privacy",
    title: "Privacy policy",
    description:
      "What personal information Yuricart Kenya collects when you order, how it is used, and which analytics tools the website uses.",
    intro:
      "This page explains what we collect when you use yuricart.com, and why.",
    updated: "November 2026",
    sections: [
      {
        heading: "What we collect",
        list: [
          "Order details: your name, email, phone number, delivery address and the items you order.",
          "If you create an account: your name, email, phone number and an encrypted password.",
          "Messages you send us, for example on WhatsApp.",
        ],
      },
      {
        heading: "How we use it",
        paragraphs: [
          "To process and deliver your order, to email you the order confirmation and updates, to reply to your questions, and to keep the shop running. We do not sell your information.",
        ],
      },
      {
        heading: "Payment",
        paragraphs: [
          "The website does not take card payments and does not store card numbers. You pay on delivery or by M-Pesa.",
        ],
      },
      {
        heading: "Analytics and cookies",
        paragraphs: [
          "The site uses Google Analytics and the Meta (Facebook) Pixel to count visits and measure advertising. Your cart is kept in your browser so it is still there when you come back.",
        ],
      },
      {
        heading: "Your choices",
        paragraphs: [
          "To see, correct or delete the information we hold about you, message us on WhatsApp.",
        ],
      },
    ],
  },

  terms: {
    slug: "terms",
    title: "Terms of sale",
    description:
      "Terms for buying from Yuricart Kenya: prices, availability, payment, delivery, warranty and returns.",
    intro: "These terms apply to orders placed on yuricart.com.",
    updated: "November 2026",
    sections: [
      {
        heading: "Prices and availability",
        paragraphs: [
          "Prices are in Kenya shillings (KES). Stock and prices can change, so an order is confirmed only when we confirm it with you. If an item is no longer available we will tell you and offer an alternative or a refund.",
        ],
      },
      {
        heading: "Payment",
        paragraphs: [
          "You can pay on delivery, by M-Pesa, or arrange payment on WhatsApp. For M-Pesa and WhatsApp orders we send the payment details after you place the order, and we confirm the order when payment is received.",
        ],
      },
      {
        heading: "Delivery",
        paragraphs: [
          "The delivery fee is shown at checkout before you place the order. See the Delivery page for how it works.",
        ],
      },
      {
        heading: "Warranty and returns",
        paragraphs: [
          "Warranty depends on the product and is confirmed when you order. See the Warranty and Returns pages.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "Questions about these terms? Message us on WhatsApp or visit Bazaar Plaza, Moi Avenue, 1st Floor, Shop A02, Nairobi CBD.",
        ],
      },
    ],
  },

  "how-to-buy": {
    slug: "how-to-buy",
    title: "How to buy",
    description:
      "How to buy from Yuricart Kenya: choose a product, add it to the cart, enter your delivery details and pay on delivery or by M-Pesa.",
    intro: "Ordering takes a few minutes. You do not need an account.",
    sections: [
      {
        heading: "Steps",
        list: [
          "Find a product from the shop, a category or the search box.",
          "Check the specifications and condition, then add it to the cart.",
          "Open the checkout and enter your name, phone, email and delivery address.",
          "See the delivery fee and total, choose how you will pay, and place the order.",
          "We confirm your order and the delivery time. You can follow it on the Track your order page.",
        ],
      },
      {
        heading: "Prefer WhatsApp?",
        paragraphs: [
          "Every product page has an Order on WhatsApp button that sends us the product, quantity and price.",
        ],
      },
    ],
  },

  faq: {
    slug: "faq",
    title: "Frequently asked questions",
    description:
      "Answers about ordering, paying, delivery, warranty and collecting from the Yuricart shop in Nairobi.",
    intro: "Quick answers. If yours is not here, message us on WhatsApp.",
    sections: [],
    faqs: [
      {
        q: "Do I need an account to order?",
        a: "No. You can check out as a guest. An account lets you see your past orders.",
      },
      {
        q: "How can I pay?",
        a: "Pay on delivery, by M-Pesa, or arrange payment on WhatsApp. For M-Pesa and WhatsApp orders we send the payment details after you place the order.",
      },
      {
        q: "How much is delivery?",
        a: "It depends on your location. Enter your city at checkout and the fee and total are shown before you place the order.",
      },
      {
        q: "Can I collect from the shop?",
        a: "Yes. We are at Bazaar Plaza, Moi Avenue, 1st Floor, Shop A02, Nairobi CBD. Tell us when you order.",
      },
      {
        q: "Is there a warranty?",
        a: "It depends on the product. Ask us on WhatsApp which warranty applies to the exact device, and we confirm it when you order.",
      },
      {
        q: "How do I check my order?",
        a: "Use the Track your order page with your order number and the email you ordered with.",
      },
    ],
  },
};

export const HELP_LINKS: Array<{ href: string; label: string }> = [
  { href: "/how-to-buy", label: "How to buy" },
  { href: "/delivery", label: "Delivery" },
  { href: "/warranty", label: "Warranty" },
  { href: "/returns", label: "Returns" },
  { href: "/faq", label: "FAQ" },
  { href: "/track", label: "Track your order" },
  { href: "/contact", label: "Contact us" },
];
