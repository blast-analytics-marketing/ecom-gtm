import {
  VIRTUAL_PAGE_VIEW,
  PRODUCT_IMPRESSIONS,
  PRODUCT_CLICK,
  PRODUCT_DETAIL_VIEW,
  TRACK_ADD_TO_CART,
  TRACK_REMOVE_FROM_CART,
  TRACK_CHECKOUT_CART,
  TRACK_CHECKOUT_SHIPPING_PAYMENT,
  TRACK_CHECKOUT_OPTION,
  TRACK_PURCHASE,
  TRACK_PROMOTION_IMPRESSION,
  TRACK_PROMOTION_CLICK,
  TRACK_NAVIGATION_CLICK,
  TRACK_LOGIN,
} from './actionTypes';

// Create all Analytics actions to be handled by the middleware, skips reducers

/**
 * Send the virtualPageView, page data
 */
export const virtualPageView = (pageProps) => {
  return {
    type: VIRTUAL_PAGE_VIEW,
    payload: {
      event: "virtualPageView",
      page: pageProps,
    },
  }
}

/**
 * Send the productImpressions, product data
 */
export const productImpressions = (products, list) => {
  const ecomObj =  {
    currencyCode: "USD",
    impressions: []
  };
  ecomObj.impressions = products.map((
    {
      name,
      id,
      price,
      categories,
      variant_groups,
    },
    index
  ) => {
    return {
      name,
      id,
      price: parseFloat(price.formatted),
      brand: "Blast",
      category: categories.map(cat => cat.name).sort().join(','),
      variant: `${variant_groups[0]?.name}: ${variant_groups[0]?.options[0]?.name}`,
      list,
      position: index + 1
    }
  });
  return {
    type: PRODUCT_IMPRESSIONS,
    payload: {
      event: "productImpressions",
      eventCategory: 'Enhanced Ecommerce',
      eventAction: 'Product Impressions',
      eventLabel: undefined,
      nonInteractive: true,
      ecommerce: ecomObj,
      customMetrics: {},
      customVariables: {},
    },
  }
}

/** 
 * A thunk for product impressions so that firing the action returns a promise.
 * We use this to sequence a state update in the collections component.
 */
export const doProductImpressions = (products, list) => (dispatch) => {
  dispatch(productImpressions(products, list));
  return Promise.resolve();
};


/**
 * Send the productClick, product data
 */
export const productClick = (products, position, name, list) => {
  const ecomObj =  {
    currencyCode: "USD",
    click: {
      actionField: { list },
      products: [],
    }
  };
  ecomObj.click.products = products.map((
    {
      name,
      id,
      price,
      categories,
      variant_groups,
    }
  ) => {
    return {
      name,
      id,
      price: parseFloat(price.formatted),
      brand: "Blast",
      category: categories.map(cat => cat.name).sort().join(','),
      variant: `${variant_groups[0]?.name}: ${variant_groups[0]?.options[0]?.name}`,
      position
    }
  });
  return {
    type: PRODUCT_CLICK,
    payload: {
      event: "productClick",
      eventCategory: 'Enhanced Ecommerce',
      eventAction: 'Product Click',
      eventLabel: name,
      nonInteractive: false,
      ecommerce: ecomObj,
      customMetrics: {},
      customVariables: {},
    },
  }
}

/**
 * Send the productDetailView, product data
 */
export const productDetailView = (product) => {
  const { name, id, price, categories, variant_groups } = product;
  const ecomObj =  {
    currencyCode: "USD",
    detail: {
      products: [],
    }
  };
  ecomObj.detail.products.push({
    name,
    id,
    price: parseFloat(price.formatted),
    brand: "Blast",
    category: categories.map(cat => cat.name).sort().join(','),
    variant: `${variant_groups[0]?.name}: ${variant_groups[0]?.options[0]?.name}`,
  });
  return {
    type: PRODUCT_DETAIL_VIEW,
    payload: {
      event: "productDetailView",
      eventCategory: 'Enhanced Ecommerce',
      eventAction: 'Product Detail View',
      eventLabel: name,
      nonInteractive: true,
      ecommerce: ecomObj,
      customMetrics: {},
      customVariables: {},
    },
  }
}

/**
 * Send the addToCart, product data
 */
export const trackAddToCart = (product, quantity, selected_options) => {
  const { name, id, price, categories, variant_groups } = product;
  const createVariantFromGroups = (selectedOption) => {
    const variantId = Object.keys(selectedOption)[0];
    const variant_option_id = selectedOption[Object.keys(selectedOption)[0]];
    const variant = variant_groups.find(variant => variant.id === variantId);
    const variant_name = variant?.name;
    const variant_option = variant?.options.find(option => option.id === variant_option_id);
    const variant_option_name = variant_option?.name;
    return `${variant_name}: ${variant_option_name}`
  }
  let variant = '';
  if(selected_options[0]?.group_name) {
    variant = selected_options.map(({group_name, option_name}) => `${group_name}: ${option_name}`).sort().join();
  } else {
    variant = createVariantFromGroups(selected_options);
  }
  const ecomObj =  {
    currencyCode: "USD",
    add: {
      products: [],
    }
  };
  ecomObj.add.products.push({
    name,
    id,
    price: parseFloat(price.formatted),
    brand: "Blast",
    category: categories.map(cat => cat.name).sort().join(','),
    variant,
    quantity,
  });
  return {
    type: TRACK_ADD_TO_CART,
    payload: {
      event: "addToCart",
      eventCategory: 'Enhanced Ecommerce',
      eventAction: 'Add to Cart',
      eventLabel: name,
      nonInteractive: false,
      ecommerce: ecomObj,
      customMetrics: {},
      customVariables: {},
    },
  }
}

/**
 * Send the removeFromCart, product data
 */
export const trackRemoveFromCart = (product, quantity, selected_options) => {
  const { name, id, price, categories } = product;
  const ecomObj =  {
    currencyCode: "USD",
    remove: {
      products: [],
    }
  };
  ecomObj.remove.products.push({
    name,
    id,
    price: parseFloat(price.formatted),
    brand: "Blast",
    category: categories.map(cat => cat.name).sort().join(','),
    variant: selected_options.map(({group_name, option_name}) => `${group_name}: ${option_name}`).sort().join(),
    quantity,
  });
  return {
    type: TRACK_REMOVE_FROM_CART,
    payload: {
      event: "removeFromCart",
      eventCategory: 'Enhanced Ecommerce',
      eventAction: 'Remove from Cart',
      eventLabel: name,
      nonInteractive: false,
      ecommerce: ecomObj,
      customMetrics: {},
      customVariables: {},
    },
  }
}

/**
 * Send the checkout cart, product data
 */
export const trackCheckoutCart = (products, cartId) => {
  const ecomObj =  {
    currencyCode: "USD",
    checkout: {
      actionField: {
        step: 1,
        cartId,
      },
      products: [],
    }
  };
  ecomObj.checkout.products = products.map((
    {
      name,
      id,
      price,
      quantity,
      categories,
      selected_options,
    }
  ) => {
    return {
      name,
      id,
      price: parseFloat(price.formatted),
      quantity,
      brand: "Blast",
      category: categories.map(cat => cat.name).sort().join(','),
      variant: selected_options.map(({group_name, option_name}) => `${group_name}: ${option_name}`).sort().join(),
    }
  });
  return {
    type: TRACK_CHECKOUT_CART,
    payload: {
      event: "checkout",
      eventCategory: 'Enhanced Ecommerce',
      eventAction: 'Checkout',
      eventLabel: undefined,
      nonInteractive: true,
      ecommerce: ecomObj,
      customMetrics: {},
      customVariables: {},
    },
  }
}

/**
 * Send the checkout shipping payment, product data
 */
export const trackCheckoutShippingPayment = (products, cartId) => {
  const ecomObj =  {
    currencyCode: "USD",
    checkout: {
      actionField: {
        step: 2,
        cartId
      },
      products: [],
    }
  };
  ecomObj.checkout.products = products.map((
    {
      name,
      id,
      price,
      quantity,
      categories,
      selected_options,
    }
  ) => {
    return {
      name,
      id,
      price: parseFloat(price.formatted),
      quantity,
      brand: "Blast",
      category: categories.map(cat => cat.name).sort().join(','),
      variant: selected_options.map(({group_name, option_name}) => `${group_name}: ${option_name}`).sort().join(),
    }
  });
  return {
    type: TRACK_CHECKOUT_SHIPPING_PAYMENT,
    payload: {
      event: "checkout",
      eventCategory: 'Enhanced Ecommerce',
      eventAction: 'Checkout',
      eventLabel: undefined,
      nonInteractive: true,
      ecommerce: ecomObj,
      customMetrics: {},
      customVariables: {},
    },
  }
}

/**
 * Send the checkout option, product data
 */
export const trackCheckoutOption = (option, cartId) => {
  const { description, price } = option;
  const ecomObj =  {
    currencyCode: "USD",
    checkout: {
      actionField: {
        step: 2,
        option: `${description} - ${price.formatted_with_code}`,
        cartId,
      },
    }
  };
  return {
    type: TRACK_CHECKOUT_OPTION,
    payload: {
      event: "checkout",
      eventCategory: 'Enhanced Ecommerce',
      eventAction: 'Checkout Option',
      eventLabel: `${description} - ${price.formatted_with_code}`,
      nonInteractive: false,
      ecommerce: ecomObj,
      customMetrics: {},
      customVariables: {},
    },
  }
}

/**
 * Send the purchase, product data
 */
export const trackPurchase = (products, orderReceipt) => {
  const ecomObj =  {
    currencyCode: orderReceipt.currency.code,
    purchase: {
      actionField: {
        id: orderReceipt.id,
        affiliation: orderReceipt.merchant.business_name,
        revenue: orderReceipt.order_value.formatted,
        tax: orderReceipt.tax.amount.formatted,
        shipping: orderReceipt.order.shipping.price.formatted,
        coupon: orderReceipt.order.discount.code,
        cartId: orderReceipt.cart_id,
        paymentType: orderReceipt.transactions.map(trans => {
          return trans.payment_source.brand
        }).sort().join()
      },
      products: [],
    }
  };
  ecomObj.purchase.products = products.map((
    {
      name,
      id,
      price,
      quantity,
      categories,
      selected_options,
    }
  ) => {
    return {
      name,
      id,
      price: parseFloat(price.formatted),
      quantity,
      brand: "Blast",
      category: categories.map(cat => cat.name).sort().join(','),
      variant: selected_options.map(({variant_name, option_name}) => `${variant_name}: ${option_name}`).sort().join(),
    }
  });
  return {
    type: TRACK_PURCHASE,
    payload: {
      event: "purchase",
      eventCategory: 'Enhanced Ecommerce',
      eventAction: 'Purchase',
      eventLabel: undefined,
      nonInteractive: true,
      ecommerce: ecomObj,
      customMetrics: {},
      customVariables: {},
    },
  }
}

/**
 * Send the promotion click, promotion data
 */
export const trackPromotionClick = (id, name, creative, position) => {
  const ecomObj =  {
    promoClick: {
      promotions: [id, name, creative, position]
    }
  };
  return {
    type: TRACK_PROMOTION_CLICK,
    payload: {
      event: "promotionClick",
      eventCategory: 'Enhanced Ecommerce',
      eventAction: 'Promotion Click',
      eventLabel: undefined,
      nonInteractive: false,
      ecommerce: ecomObj,
      customMetrics: {},
      customVariables: {},
    },
  }
}


/**
 * Send the navigation click, page data
 */
export const trackNavigationClick = (linkName) => {
  return {
    type: TRACK_NAVIGATION_CLICK,
    payload: {
      event: "loadEventData",
      eventCategory: 'Navigation',
      eventAction: 'Click',
      eventLabel: linkName,
      nonInteractive: false,
      customMetrics: {},
      customVariables: {},
    },
  }
}

/**
 * Send the login, page data
 */
export const trackLogin = (linkName) => {
  return {
    type: TRACK_LOGIN,
    payload: {
      event: "loadEventData",
      eventCategory: 'Account',
      eventAction: 'Login',
      eventLabel: undefined,
      nonInteractive: true,
      customMetrics: {},
      customVariables: {},
    },
  }
}
