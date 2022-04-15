import {
  VIRTUAL_PAGE_VIEW,
  PRODUCT_IMPRESSIONS,
  PRODUCT_CLICK,
  PRODUCT_DETAIL_VIEW,
  ADD_TO_CART,
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
      category: categories[0]?.name,
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
 * Send the productClick, product data
 */
export const productClick = (products, position, id, list) => {
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
      category: categories[0]?.name,
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
      eventLabel: id,
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
    category: categories[0]?.name,
    variant: `${variant_groups[0]?.name}: ${variant_groups[0]?.options[0]?.name}`,
  });
  return {
    type: PRODUCT_DETAIL_VIEW,
    payload: {
      event: "productDetailView",
      eventCategory: 'Enhanced Ecommerce',
      eventAction: 'Product Detail View',
      eventLabel: id,
      nonInteractive: true,
      ecommerce: ecomObj,
      customMetrics: {},
      customVariables: {},
    },
  }
}