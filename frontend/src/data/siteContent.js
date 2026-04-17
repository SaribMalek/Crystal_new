export const megaMenuGroups = [
  {
    title: 'Bracelets',
    items: [
      { label: 'All Bracelets', to: '/shop?search=bracelet' },
      { label: 'Intention Bracelets', to: '/shop?search=intention bracelet' },
      { label: 'Zodiac Bracelets', to: '/shop?search=zodiac bracelet' },
      { label: 'Numerology Bracelets', to: '/shop?search=numerology bracelet' },
      { label: 'Chakra Bracelets', to: '/shop?search=chakra bracelet' },
    ],
  },
  {
    title: 'Jewellery',
    items: [
      { label: 'Japa Malas', to: '/shop?search=japa mala' },
      { label: 'Pendants', to: '/shop/crystal-pendants' },
      { label: 'Silver Pendants', to: '/shop?search=silver pendant' },
      { label: 'Rings & Earrings', to: '/shop?search=crystal ring' },
      { label: 'Neck Pieces', to: '/shop?search=necklace' },
    ],
  },
  {
    title: 'Crystals',
    items: [
      { label: 'Raw Stones', to: '/shop/raw-crystals' },
      { label: 'Tumble Stones', to: '/shop/tumbled-stones' },
      { label: 'Spheres', to: '/shop/crystal-spheres' },
      { label: 'Clusters & Geodes', to: '/shop/crystal-clusters' },
      { label: '7 Chakra Crystals', to: '/shop/chakra-sets' },
    ],
  },
  {
    title: 'Decor & Care',
    items: [
      { label: 'Crystal Trees', to: '/shop?search=crystal tree' },
      { label: 'Lamps & Candle Holders', to: '/shop?search=lamp' },
      { label: 'Self Care Tools', to: '/shop?search=roller' },
      { label: 'Smudging', to: '/shop?search=smudging' },
      { label: 'Gift Hampers', to: '/shop/gift-sets' },
    ],
  },
];

export const quickLinks = [
  { label: 'Gift Sets', to: '/shop/gift-sets' },
  { label: 'Services', to: '/services/crystal-consultation' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
];

export const servicePages = {
  'crystal-consultation': {
    eyebrow: 'Services',
    title: 'Crystal consultation for gifting, intentions, and personal ritual guidance.',
    intro: 'Offer customers a guided starting point when they are unsure what to buy. This service page is inspired by premium crystal brands that blend ecommerce with education.',
    sections: [
      {
        title: 'Who this helps',
        body: 'This is ideal for first-time buyers, gift shoppers, and customers building crystal routines for clarity, grounding, love, abundance, or home energy.',
      },
      {
        title: 'What the session includes',
        body: 'You can position this as a short discovery call or guided recommendation service that suggests crystals, combinations, and ritual pairings based on the customer intention.',
      },
      {
        title: 'How to use it on your store',
        body: 'Use this page as a lead-generation step with booking, WhatsApp support, or a simple consultation request form when you are ready.',
      },
    ],
  },
  'astro-consultation': {
    eyebrow: 'Services',
    title: 'Astro-inspired recommendations for more personalized crystal selections.',
    intro: 'This page can later support astrology-led shopping journeys such as zodiac gifting, numerology collections, and personalized crystal pairings.',
    sections: [
      {
        title: 'Why customers like it',
        body: 'Astrology and numerology give shoppers a more guided entry point into crystal buying, especially for gifts and special occasions.',
      },
      {
        title: 'Recommended use',
        body: 'Keep the offer simple at launch: explain the consultation format, expected outcome, and how recommendations connect to store products.',
      },
    ],
  },
};

export const infoPages = {
  about: {
    eyebrow: 'About Us',
    title: 'A crystal brand built around authenticity, beauty, and a calmer way to shop.',
    intro: 'AS Crystal brings together premium crystals, jewellery, decor, self-care tools, and gifting ideas in one polished, easy-to-browse experience.',
    sections: [
      {
        title: 'Our approach',
        body: 'We combine aesthetic presentation with practical guidance so customers can shop by category, intention, chakra, and gifting moment without feeling overwhelmed.',
      },
      {
        title: 'What we curate',
        body: 'From raw stones and tumbles to pendants, home decor, smudging tools, and spiritual accessories, each collection is chosen to feel clear, cohesive, and gift-worthy.',
      },
      {
        title: 'What makes the brand feel premium',
        body: 'Thoughtful product grouping, elegant design, strong navigation, clear store policies, and trust-building educational content all help the site feel more professional.',
      },
    ],
  },
  blog: {
    eyebrow: 'Blog',
    title: 'A crystal content hub that can educate, inspire, and improve conversion.',
    intro: 'Use this area for crystal meanings, chakra guides, cleansing methods, gifting edits, zodiac recommendations, and styling inspiration.',
    sections: [
      {
        title: 'Best content to publish first',
        body: 'Start with articles like how to choose your first crystal, cleansing basics, gifting by intention, zodiac crystal recommendations, and how to style crystals at home.',
      },
      {
        title: 'Why it matters',
        body: 'Helpful content improves trust and helps visitors understand products before they buy, especially in spiritual and wellness categories.',
      },
    ],
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Common store questions answered simply and clearly.',
    intro: 'A clear FAQ reduces customer hesitation and makes the storefront feel reliable and complete.',
    sections: [
      {
        title: 'Are the crystals natural?',
        body: 'Yes. Product pages should clearly mention size, finish, material type, and any treatment notes when applicable so shoppers know exactly what they are buying.',
      },
      {
        title: 'How do I choose the right crystal?',
        body: 'Customers can shop by intention, category, chakra, bracelet type, decor, or gifting need. This makes discovery easier for new and returning shoppers.',
      },
      {
        title: 'Do you offer gifting support?',
        body: 'Yes. Gift sets, premium hampers, zodiac recommendations, and consultation-led suggestions are strong ways to support occasion-based shopping.',
      },
    ],
  },
  shipping: {
    eyebrow: 'Shipping Policy',
    title: 'Clear shipping details help premium ecommerce feel trustworthy.',
    intro: 'This page can later be customized with your actual courier partners, regions, timelines, and international delivery rules.',
    sections: [
      {
        title: 'Processing time',
        body: 'A good starting policy is dispatch within 1 to 2 business days unless otherwise mentioned on the product page.',
      },
      {
        title: 'Delivery windows',
        body: 'Domestic and international delivery timelines can vary by city and courier, so customers should receive tracking updates as soon as their parcel ships.',
      },
      {
        title: 'Packaging',
        body: 'Protective and gift-ready packaging is especially important for crystal products, jewellery, and fragile decor pieces.',
      },
    ],
  },
  returns: {
    eyebrow: 'Returns & Refunds',
    title: 'A simple return and refund policy makes customers more comfortable ordering.',
    intro: 'Use this page to explain return windows, damaged item handling, exchanges, and refund expectations in plain language.',
    sections: [
      {
        title: 'Return window',
        body: 'A 7-day return or exchange window for unused items in original condition is a strong baseline for a small crystal store.',
      },
      {
        title: 'Damaged deliveries',
        body: 'Ask customers to share photos and order details quickly if an item arrives damaged so the support team can resolve it smoothly.',
      },
      {
        title: 'Refund notes',
        body: 'Clarify how refunds are processed, how long they usually take, and whether any product types are excluded.',
      },
    ],
  },
  privacy: {
    eyebrow: 'Privacy Policy',
    title: 'Explain what data you collect and how it supports the customer journey.',
    intro: 'We respect your privacy and only collect the information needed to process orders, improve support, and provide a secure shopping experience.',
    sections: [
      {
        title: 'Data collected',
        body: 'We may collect your name, contact details, delivery address, order information, account details, and communication history when you browse, order, or contact support.',
      },
      {
        title: 'How it is used',
        body: 'This information is used to process payments, fulfill orders, send delivery updates, provide support, maintain your account, and share optional marketing only when you choose to receive it.',
      },
      {
        title: 'How it is protected',
        body: 'We take reasonable steps to protect customer information, limit unnecessary access, and work only with trusted services needed for payments, shipping, and store operations.',
      },
    ],
  },
  terms: {
    eyebrow: 'Terms & Conditions',
    title: 'Set expectations for product information, ordering, and store policies.',
    intro: 'These terms help set clear expectations for shopping on AS Crystal, including orders, pricing, delivery, and product presentation.',
    sections: [
      {
        title: 'Orders and pricing',
        body: 'Orders are subject to product availability, payment authorization, and confirmation. We may update pricing, discontinue products, or cancel an order if incorrect information or stock issues arise.',
      },
      {
        title: 'Natural variation',
        body: 'Because crystals and gemstones are natural materials, variations in color, inclusions, pattern, size, and shape are part of their character and should be expected.',
      },
      {
        title: 'Use of the website',
        body: 'Customers are expected to use the site lawfully, provide accurate order information, and avoid misuse of accounts, content, pricing, or store systems.',
      },
    ],
  },
  disclaimers: {
    eyebrow: 'Disclaimers',
    title: 'Set healthy expectations around wellness, spirituality, and natural variation.',
    intro: 'A disclaimer page is common for crystal brands and helps clarify product intent without overpromising outcomes.',
    sections: [
      {
        title: 'Wellness disclaimer',
        body: 'Crystal products are typically presented for personal, decorative, or spiritual use and should not be described as a substitute for professional medical advice.',
      },
      {
        title: 'Product variation disclaimer',
        body: 'Every natural stone is unique, so customers should expect differences in shade, texture, markings, and exact shape.',
      },
    ],
  },
  sitemap: {
    eyebrow: 'Sitemap',
    title: 'A store structure that makes discovery easier across products, content, and services.',
    intro: 'This site map can grow over time, but it already helps present the storefront as organized and launch-ready.',
    sections: [
      {
        title: 'Shopping areas',
        body: 'Bracelets, jewellery, crystals, decor, self-care, smudging, gift sets, featured collections, and intention-led shopping are the strongest storefront anchors.',
      },
      {
        title: 'Support areas',
        body: 'Customers should also be able to find About, Contact, FAQ, Shipping, Returns, Privacy, Terms, Disclaimers, Blog, and service pages easily.',
      },
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Make support details easy to find so the store feels real and trustworthy.',
    intro: 'A polished contact page helps customers reach AS Crystal for orders, product questions, gifting help, and consultations.',
    sections: [
      {
        title: 'Working hours',
        body: 'Support hours can be listed clearly, such as Monday to Saturday from 10:00 AM to 6:00 PM, with Sunday closed.',
      },
      {
        title: 'Contact options',
        body: 'Email, phone, WhatsApp, and social channels are all useful for crystal ecommerce because customers often ask for guidance before purchase.',
      },
      {
        title: 'Address',
        body: 'Adding a real location or fulfillment city increases trust, especially when paired with shipping and return policy pages.',
      },
    ],
  },
};

export const helpLinks = [
  { label: 'Sizing & Details', to: '/faq' },
  { label: 'Returns, Exchange & Refund policy', to: '/returns' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Disclaimers', to: '/disclaimers' },
  { label: 'Shipping Policy', to: '/shipping' },
  { label: 'Blog', to: '/blog' },
];

export const fallbackMenus = {
  shop: megaMenuGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({ title: item.label, link: item.to })),
  })),
  quick: quickLinks.map((item) => ({ title: item.label, link: item.to, items: [] })),
  help: helpLinks.map((item) => ({ title: item.label, link: item.to, items: [] })),
};

