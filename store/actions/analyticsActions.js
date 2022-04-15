import {
  VIRTUAL_PAGE_VIEW,
  PRODUCT_IMPRESSIONS,
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