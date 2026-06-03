const PRODUCT_URL_MAPPINGS = {
  'AMZ-SONYXM5': {
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    urls: {
      amazon: 'https://www.amazon.in/dp/B09XS7JWHH',
      flipkart: 'https://www.flipkart.com/sony-wh-1000xm5-active-noise-cancellation-anc-bluetooth-headset/p/itm50edef09cfb1e'
    }
  },
  'AMZ-1PNORD3': {
    title: 'OnePlus Nord CE 3 Lite 5G (Chromatic Gray, 128GB)',
    urls: {
      amazon: 'https://www.amazon.in/dp/B0BY8MCQ9S',
      flipkart: 'https://www.flipkart.com/oneplus-nord-ce-3-lite-5g-chromatic-gray-128-gb/p/itm2cd629f6db10a'
    }
  },
  'AMZ-OPW2': {
    title: 'OnePlus Bullets Wireless Z2 Earphones (Magico Black)',
    urls: {
      amazon: 'https://www.amazon.in/dp/B09TVV8428',
      flipkart: 'https://www.flipkart.com/oneplus-bullets-wireless-z2-bluetooth-headset/p/itm87a419eb38cbf'
    }
  },
  'FPK-NOISE2': {
    title: 'Noise ColorFit Icon 2 Smartwatch (Bluetooth Calling)',
    urls: {
      amazon: 'https://www.amazon.in/dp/B0B5LQWDF9',
      flipkart: 'https://www.flipkart.com/noise-colorfit-icon-2-1-8-display-bluetooth-calling-ai-voice-assistant-smartwatch/p/itmfa97e2fcabed9'
    }
  },
  'FPK-IPH15': {
    title: 'Apple iPhone 15 (Black, 128GB)',
    urls: {
      amazon: 'https://www.amazon.in/dp/B0CHX1W151',
      flipkart: 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4'
    }
  },
  'MYN-ROADSTER': {
    title: 'Roadster Men Black Solid Round Neck T-shirt',
    urls: {
      myntra: 'https://www.myntra.com/tshirts/roadster/the-roadster-lifestyle-co-men-black-typography-printed-pure-cotton-t-shirt/13620730/buy',
      flipkart: 'https://www.flipkart.com/roadster-men-solid-round-neck-black-t-shirt/p/itme358d7c4be4eb',
      ajio: 'https://www.ajio.com/p/469128374'
    },
    prices: {
      myntra: 251
    }
  },
  'MYN-PUMAWT': {
    title: 'Puma Men Black Wallet (Sport Edition)',
    urls: {
      myntra: 'https://www.myntra.com/wallets/puma/puma-leather-plain-bi-fold-wallet/25815670/buy',
      amazon: 'https://www.amazon.in/dp/B09V7NRY8Q',
      flipkart: 'https://www.flipkart.com/puma-men-black-artificial-leather-wallet/p/itmff41bcbe39bc1',
      ajio: 'https://www.ajio.com/p/469138472'
    },
    prices: {
      myntra: 1399
    }
  },
  'AMZ-BOAT131': {
    title: 'boAt Airdopes 131 M Wireless Earbuds',
    urls: {
      amazon: 'https://www.amazon.in/Airdopes-131-Technology-Bluetooth-Immersive/dp/B088FKCD4J?th=1',
      flipkart: 'https://www.flipkart.com/boat-airdopes-131-m-active-black-bluetooth-headset/p/itmf3df911961e5f'
    },
    prices: {
      amazon: 899
    }
  },
  'AJI-NIKEAM': {
    title: 'Nike Air Max SYSTM Lace-Up Sneakers',
    urls: {
      ajio: 'https://www.ajio.com/nike-sb-heritage-vulc-lace-up-sneakers/p/469812812_gray?',
      amazon: 'https://www.amazon.in/dp/B0B5G5PZ8N',
      flipkart: 'https://www.flipkart.com/nike-air-max-systm-sneakers-men/p/itm9f8d1c8172c3d',
      myntra: 'https://www.myntra.com/21938120'
    },
    prices: {
      ajio: 2748
    }
  },
  'MSH-SAREE': {
    title: 'Trendz Banarasi Silk Saree (Traditional Edition)',
    urls: {
      meesho: 'https://www.meesho.com/banarasi-silk-saree/p/etrjb2',
      flipkart: 'https://www.flipkart.com/trendz-exclusive-banarasi-silk-saree/p/itmfg3h4j5k6l7m8'
    },
    prices: {
      meesho: 400
    }
  },
  'AMZ-S24ULTRA': {
    title: 'Samsung Galaxy S24 Ultra (Titanium Gray, 256GB)',
    urls: {
      amazon: 'https://www.amazon.in/Samsung-Galaxy-Smartphone-Titanium-Storage/dp/B0CS5XW6TN',
      flipkart: 'https://www.flipkart.com/samsung-galaxy-s24-ultra-5g-titanium-gray-256-gb/p/itmef660a92d2426'
    }
  },
  'FPK-MBAIRM3': {
    title: 'Apple 2024 MacBook Air M3 Laptop (8GB RAM, 256GB SSD)',
    urls: {
      flipkart: 'https://www.flipkart.com/apple-macbook-air-m3-8-gb-256-gb-ssd-macos-sonoma-mryr3hn-a/p/itmab284bf2e06ed',
      amazon: 'https://www.amazon.in/dp/B0CXF1GQD6'
    },
    prices: {
      flipkart: 131990
    }
  },
  'MYN-LEVIS511': {
    title: 'Levi\'s Men\'s 511 Slim Fit Mild Wash Jeans',
    urls: {
      myntra: 'https://www.myntra.com/jeans/levis/levis-men-527-slim-bootcut-stretchable-light-fade-jeans/38810791/buy',
      amazon: 'https://www.amazon.in/dp/B09VCRRK8Q',
      flipkart: 'https://www.flipkart.com/levi-s-511-slim-fit-men-blue-jeans/p/itmd5fcfbce39bc1',
      ajio: 'https://www.ajio.com/p/469148592'
    },
    prices: {
      myntra: 1849
    }
  },
  'AJI-ADISUPER': {
    title: 'Adidas Originals Men\'s Superstar Sneakers (White/Black)',
    urls: {
      ajio: 'https://www.ajio.com/adidas-originals-men-drop-step-low-2-0-lace-up-sneakers/p/469818951_white',
      amazon: 'https://www.amazon.in/dp/B000I1DFN2',
      flipkart: 'https://www.flipkart.com/adidas-originals-superstar-sneakers-men/p/itm9f8d1c8172c3e',
      myntra: 'https://www.myntra.com/21920390'
    },
    prices: {
      ajio: 8599
    }
  },
  'MYN-FSTRKSG': {
    title: 'Fastrack Men\'s Polarized Rectangular Sunglasses',
    urls: {
      meesho: 'https://www.meesho.com/fastrack-polarized-rectangular-sunglasses/p/1z2y3x',
      amazon: 'https://www.amazon.in/dp/B08VCR8K87',
      flipkart: 'https://www.flipkart.com/fastrack-polarized-rectangular-sunglasses/p/itmff41bcbe39bc2',
      myntra: 'https://www.myntra.com/sunglasses/fastrack/fastrack-men-uv-protected-lens-rectangle-sunglasses---p448br7v-brown/40469663/buy',
      ajio: 'https://www.ajio.com/p/469138473'
    },
    prices: {
      myntra: 849
    }
  },
  'AMZ-KOREDB': {
    title: 'Kore DM 20kg Combo Home Gym Dumbbell Set',
    urls: {
      amazon: 'https://www.amazon.in/gp/aw/d/B0BDS4LHN5/?_encoding=UTF8&pd_rd_plhdr=t&aaxitk=dbd03c42f34f47591826d1e38ffbf7e1&hsa_cr_id=0&qid=1780110011&sr=1-1-e0fa1fdd-d857-4087-adda-5bd576b25987&aref=yrPY8wkiJM&ref_=sbx_s_sparkle_sbtcd_asin_0_img&pd_rd_w=3kKSh&content-id=amzn1.sym.9269eab1-ae85-443b-9ec2-b2fa4ebaad05%3Aamzn1.sym.9269eab1-ae85-443b-9ec2-b2fa4ebaad05&pf_rd_p=9269eab1-ae85-443b-9ec2-b2fa4ebaad05&pf_rd_r=MJ0MR6FVJ3ZQ1PB5D2GA&pd_rd_wg=pGziT&pd_rd_r=91b0a208-dfe2-4352-b0a8-64d874b18e35&th=1',
      flipkart: 'https://www.flipkart.com/kore-dm-20-kg-combo-home-gym-dumbbell-set/p/itm2b9a7c4be4eb2'
    },
    prices: {
      amazon: 1929
    }
  }
};

function getUrlsForSku(sku) {
  return PRODUCT_URL_MAPPINGS[sku] || null;
}

function getUrlsByTitle(title) {
  if (!title) return null;
  const cleanStr = title.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const searchWords = cleanStr.split(/\s+/).filter(w => w.length >= 2);
  
  if (searchWords.length === 0) return null;
  
  let bestMatch = null;
  let maxOverlap = 0;
  
  for (const entry of Object.values(PRODUCT_URL_MAPPINGS)) {
    const entryTitleClean = entry.title.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const entryWords = entryTitleClean.split(/\s+/).filter(w => w.length >= 2);
    
    let overlap = 0;
    for (const word of searchWords) {
      if (entryWords.includes(word)) {
        overlap++;
      }
    }
    
    const ratio = overlap / Math.min(searchWords.length, entryWords.length);
    if (ratio >= 0.5 && ratio > maxOverlap) {
      maxOverlap = ratio;
      bestMatch = entry;
    }
  }
  
  return bestMatch;
}

module.exports = {
  PRODUCT_URL_MAPPINGS,
  getUrlsForSku,
  getUrlsByTitle
};
