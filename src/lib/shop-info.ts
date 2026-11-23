/**
 * One source of truth for shop details shown across the site (footer, 404,
 * fallbacks). The PDF flagged inconsistent shop numbers (A01 vs A02): confirm
 * the real unit with the client and change it here only.
 */
export const SHOP_INFO = {
  name: "Yuricart Electronics",
  addressLines: [
    "Bazaar Plaza, Moi Avenue",
    "1st Floor, Shop A02",
    "Nairobi CBD, Kenya",
  ],
  addressOneLine: "Bazaar Plaza, Moi Avenue, 1st Floor, Shop A02, Nairobi CBD",
};
