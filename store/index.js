import { useMemo } from 'react'
import { createStore, applyMiddleware, compose } from 'redux';
import { HYDRATE } from 'next-redux-wrapper';
import thunk from 'redux-thunk';

import {
  STORE_PRODUCTS,
  STORE_CATEGORIES,
  RETRIEVE_CART_SUCCESS,
  ADD_TO_CART_SUCCESS,
  UPDATE_CART_ITEM_SUCCESS,
  REMOVE_FROM_CART_SUCCESS,
  CAPTURE_ORDER_SUCCESS,
  GENERATE_CHECKOUT_TOKEN,
  GET_SHIPPING_OPTIONS,
  REMOVE_SHIPPING_OPTIONS,
  UPDATE_CHECKOUT_LIVE_OBJECT,
  ABORT_CHECKOUT,
  SET_CUSTOMER,
  CLEAR_CUSTOMER,
} from './actions/actionTypes';

let store
// Declare initial state
const initialState = {
  categories: [],
  products: [],
  cart: {},
  checkout: {
    shippingOptions: [],
    checkoutTokenObject: {},
  },
  orderReceipt: null,
  customer: null,
  loading: {
    customer: true,
  },
};

// Create reducer
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case HYDRATE:
      // These are server side rendered from MyApp.getInitialProps, everything else should
      // come from client side state and should not be overwritten here by subsequent server
      // side hydration actions.
      const { categories, products } = action.payload;

      return {
        ...state,
        categories,
        products,
      };
    // Dispatch in App SSR
    // Check if action dispatched is STORE_CATEGORIES and act on that
    case STORE_CATEGORIES:
      return { ...state, categories: action.payload };
    // Dispatch in App SSR
    // Check if action dispatched is STORE_PRODUCTS and act on that
    case STORE_PRODUCTS:
      return { ...state, products: action.payload };
    // Dispatch in App client-side
    // Check if action dispatched is SET_CUSTOMER and act on that
    case CLEAR_CUSTOMER:
      return { ...state, customer: null, loading: { ...state.loading, customer: false } };
    case SET_CUSTOMER:
      return { ...state, customer: action.payload, loading: { ...state.loading, customer: false } };
    // Dispatch in Product client-side
    // Check if action dispatched is STORE_CART and act on that
    case RETRIEVE_CART_SUCCESS:
      return { ...state, cart: action.payload };
    // Dispatch in ProductDetail client-side
    // Check if action dispatched is ADD_TO_CART and act on that
    case ADD_TO_CART_SUCCESS:
      return { ...state, cart: action.payload.cart };
    // Dispatch in Cart client-side
    // Check if action dispatched is UPDATE_CART_ITEM and act on that
    case UPDATE_CART_ITEM_SUCCESS:
      return { ...state, cart: action.payload.cart };
    // Dispatch in Cart client-side
    // Check if action dispatched is REMOVE_FROM_CART and act on that
    case REMOVE_FROM_CART_SUCCESS:
      return { ...state, cart: action.payload.cart };
    // Dispatch in Checkout client-side
    case GENERATE_CHECKOUT_TOKEN:
      return { ...state, checkout: { ...state.checkout, checkoutTokenObject: action.payload }};
    // Dispatch in Checkout client-side
    case GET_SHIPPING_OPTIONS:
      return { ...state, checkout: { ...state.checkout, shippingOptions: action.payload }};
    // Dispatch in Checkout client-side
    case REMOVE_SHIPPING_OPTIONS:
      return { ...state, checkout: { ...state.checkout, shippingOptions: [] }};
    // Dispatch in Checkout client-side
    case UPDATE_CHECKOUT_LIVE_OBJECT:
      return {
        ...state,
        checkout: {
          ...state.checkout,
          checkoutTokenObject: {
            ...state.checkout.checkoutTokenObject,
            live: action.payload
          },
        },
      };
    // Dispatch in Checkout client-side
    case ABORT_CHECKOUT:
      return { ...state, checkout: initialState.checkout };
    // Dispatch in Checkout client-side
    case CAPTURE_ORDER_SUCCESS:
      return { ...state, checkout: initialState.checkout, orderReceipt: action.payload };
    default:
      return state;
  }
};



// Enable Redux dev tools
const devtools = (process.browser && window.__REDUX_DEVTOOLS_EXTENSION__)
  ? window.__REDUX_DEVTOOLS_EXTENSION__(
    { trace: true, traceLimit: 25 }
  )
  : f => f;

//Analytics middleware for GTM
const analyticsMiddleware = () => next => action => {
  const sendEvents = (...events) => {
    const dataLayer = window.dataLayer || [];
    dataLayer.push(...events);
    window.dataLayer = dataLayer;
  };
  
  const { type, payload } = action;

  switch(type) {
    case "VIRTUAL_PAGE_VIEW":
    case "PRODUCT_IMPRESSIONS":
    case "PRODUCT_CLICK":
    case "PRODUCT_DETAIL_VIEW":
    case "TRACK_ADD_TO_CART":
    case "TRACK_REMOVE_FROM_CART":
    case "TRACK_CHECKOUT_CART":
    case "TRACK_CHECKOUT_SHIPPING_PAYMENT":
    case "TRACK_CHECKOUT_OPTION":
    case "TRACK_PURCHASE":
    case "TRACK_PROMOTION_CLICK":
    case "TRACK_NAVIGATION_CLICK":
    case "TRACK_LOGIN":
      sendEvents({...payload, _clear: true});
      break;
    case "SET_CUSTOMER":
      sendEvents({
        event: "loadUserData",
        user: {
          userID: payload.id,
          loggedIn: payload.isLoggedIn,
        },
        _clear: true,
      });
      break;
    case "CLEAR_CUSTOMER":
      sendEvents({
        event: "loadUserData",
        user: {
          loggedIn: false,
        },
        _clear: true,
      });
      break;
    default:
      //sendEvents({event: type, payload, _clear: true});
      break;
  }

  return next(action);
}

// Create a makeStore function and pass in reducer to create the store
const makeStore = () => {
  return createStore(
    reducer,
    initialState,
    compose(applyMiddleware(thunk, analyticsMiddleware), devtools)
  );
};


export const initializeStore = (initialState) => {
  let _store = store ?? makeStore(initialState)

  // After navigating to a page with an initial Redux state, merge that state
  // with the current state in the store, and create a new store
  if (initialState && store) {
    _store = makeStore({
      ...store.getState(),
      ...initialState,
    })
    // Reset the current store
    store = undefined
  }

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') {
    return _store
  }
  // Create the store once in the client
  if (!store) {
    store = _store
  }

  return _store
}


export function useStore(initialState) {
  const store = useMemo(() => initializeStore(initialState), [initialState])
  return store
}

