/**
 * AI Tool Definitions — Unified Format
 * Converted to provider-specific format by each adapter
 */

export const tools = [
  {
    name: 'show_product',
    description: 'Show a single product card in the chat. Use when recommending or identifying a specific product.',
    parameters: {
      type: 'object',
      properties: {
        product_index: { type: 'integer', description: 'Product index in the catalog (0-based)' },
      },
      required: ['product_index'],
    },
  },
  {
    name: 'show_product_detail',
    description: 'Show a detailed product view with images, description, features, and reviews. Use when the user asks to "tell me more" or wants details.',
    parameters: {
      type: 'object',
      properties: {
        product_index: { type: 'integer', description: 'Product index in the catalog (0-based)' },
      },
      required: ['product_index'],
    },
  },
  {
    name: 'show_products',
    description: 'Show multiple product cards for comparison or browsing. Use when showing alternatives or search results.',
    parameters: {
      type: 'object',
      properties: {
        product_indices: {
          type: 'array',
          items: { type: 'integer' },
          description: 'Array of product indices to show',
        },
      },
      required: ['product_indices'],
    },
  },
  {
    name: 'add_to_cart',
    description: 'Add a product to the shopping cart. Always confirm the size before adding.',
    parameters: {
      type: 'object',
      properties: {
        product_index: { type: 'integer', description: 'Product index' },
        size: { type: 'string', description: 'Size to add (e.g. "10", "M", "One Size")' },
        color: { type: 'string', description: 'Color name (optional, defaults to first available)' },
      },
      required: ['product_index', 'size'],
    },
  },
  {
    name: 'remove_from_cart',
    description: 'Remove an item from the shopping cart.',
    parameters: {
      type: 'object',
      properties: {
        product_id: { type: 'string', description: 'Product slug ID' },
        size: { type: 'string', description: 'Size of the item to remove' },
      },
      required: ['product_id', 'size'],
    },
  },
  {
    name: 'show_order_summary',
    description: 'Show the current cart as an order summary for checkout. Use when user wants to check out or review their order.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'show_address',
    description: 'Show a saved shipping address card. Use during checkout when asking where to ship. The type matches the address label (home, office, or any custom label the user has saved).',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', description: 'Address label to show (e.g. "home", "office", or any custom label)' },
      },
      required: ['type'],
    },
  },
  {
    name: 'show_payment',
    description: 'Show the payment method card on file. Use before asking user to confirm payment.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'process_order',
    description: 'Process the order and show a confirmation. ONLY use after the user explicitly confirms payment.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'show_order_status',
    description: 'Show the status and timeline of a specific past order.',
    parameters: {
      type: 'object',
      properties: {
        order_id: { type: 'string', description: 'Order ID (e.g. "FM-4821")' },
      },
      required: ['order_id'],
    },
  },
  {
    name: 'show_all_orders',
    description: 'Show a summary of all past orders. Use when user asks about their orders generally.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'add_to_wishlist',
    description: 'Save a product to the wishlist.',
    parameters: {
      type: 'object',
      properties: {
        product_index: { type: 'integer', description: 'Product index' },
      },
      required: ['product_index'],
    },
  },
  {
    name: 'navigate_to',
    description: 'Navigate the user to a page or product on the website. Use when directing them to browse something.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'URL path (e.g. "/shop/footwear", "/product/court-classic", "/cart")' },
      },
      required: ['path'],
    },
  },
  {
    name: 'highlight_product',
    description: 'Highlight a product on the page grid with a golden glow animation to draw attention to it.',
    parameters: {
      type: 'object',
      properties: {
        product_id: { type: 'string', description: 'Product slug ID to highlight' },
      },
      required: ['product_id'],
    },
  },
  {
    name: 'show_reviews',
    description: 'Show customer reviews for a product. Use when user asks about reviews, ratings, what people think, or if a product is worth buying. Shows rating summary + individual reviews.',
    parameters: {
      type: 'object',
      properties: {
        product_index: { type: 'integer', description: 'Product index in the catalog' },
      },
      required: ['product_index'],
    },
  },
  {
    name: 'initiate_return',
    description: 'Initiate a return for an item from a past order. Shows return summary with refund details and return label. Only use for delivered orders.',
    parameters: {
      type: 'object',
      properties: {
        order_id: { type: 'string', description: 'Order ID (e.g. "FM-4821")' },
        item_name: { type: 'string', description: 'Name of the item being returned' },
        reason: { type: 'string', enum: ['doesnt_fit', 'not_as_expected', 'changed_mind', 'defective', 'other'], description: 'Return reason' },
      },
      required: ['order_id', 'item_name', 'reason'],
    },
  },
  {
    name: 'initiate_exchange',
    description: 'Initiate an exchange for a different size or color. Shows exchange summary. Only use for delivered orders.',
    parameters: {
      type: 'object',
      properties: {
        order_id: { type: 'string', description: 'Order ID' },
        item_name: { type: 'string', description: 'Name of the item being exchanged' },
        new_size: { type: 'string', description: 'New size requested' },
        new_color: { type: 'string', description: 'New color requested (optional)' },
      },
      required: ['order_id', 'item_name', 'new_size'],
    },
  },
  {
    name: 'notify_restock',
    description: 'Sign the user up for restock notifications when an out-of-stock product becomes available again. Use when a product is out of stock and the user wants to be notified.',
    parameters: {
      type: 'object',
      properties: {
        product_index: { type: 'integer', description: 'Product index in the catalog' },
      },
      required: ['product_index'],
    },
  },
  {
    name: 'apply_coupon',
    description: 'Apply a coupon/discount code to the cart. Use during checkout to offer the customer a discount. Available codes: FORMA10 (10% off), FORMA15 (15% off orders over $100), WELCOME20 (20% off first order).',
    parameters: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Coupon code: FORMA10, FORMA15, or WELCOME20' },
      },
      required: ['code'],
    },
  },
  {
    name: 'show_saved_addresses',
    description: 'Show all saved shipping addresses so the user can pick one during checkout. Use when asking where to ship.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'save_address',
    description: 'Save a new shipping address when the user provides one that is not already saved. Parse the address from what the user typed.',
    parameters: {
      type: 'object',
      properties: {
        label: { type: 'string', description: 'Short label for the address (e.g. "Parents House", "Girlfriend\'s Place", "Work")' },
        name: { type: 'string', description: 'Recipient name' },
        line1: { type: 'string', description: 'Street address' },
        city: { type: 'string', description: 'City' },
        state: { type: 'string', description: 'State abbreviation' },
        zip: { type: 'string', description: 'ZIP code' },
      },
      required: ['label', 'name', 'line1', 'city', 'state', 'zip'],
    },
  },
]
