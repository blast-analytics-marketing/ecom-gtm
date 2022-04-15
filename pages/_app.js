/* global process */
import React, {useEffect, useState} from 'react';
import '../style/scss/style.scss';
import { useStore } from '../store';
import { Provider  } from 'react-redux';
import commerce from '../lib/commerce';
import { loadStripe } from '@stripe/stripe-js';
import { setCustomer } from '../store/actions/authenticateActions';
import 'swiper/components/effect-fade/effect-fade.scss';
import { useRouter } from 'next/router'
import { route } from 'next/dist/server/router';

const gtmVirtualPageView = (rest) => {
  window.dataLayer?.push({
    event: 'VirtualPageView',
    _clear: true,
    ...rest,
  });
};

const MyApp = ({Component, pageProps}) => {

  const store = useStore(pageProps.initialState);
  const [stripePromise, setStripePromise] = useState(null);
  const router = useRouter()

  useEffect(() => {
    // view order page data layer is built using the router.pathname
    // because it's not possible to get the details from getStaticProps
    // because getStaticProps and a dynamic route requires getStaticPaths
    // and getStaticPaths is incompatible with next export when using fallback: 'blocking' || true
    // but when settings fallback: false in getStaticPaths we need to specify the paths array of paths that exist
    // but this isn't possible serer-side because the list of paths are the list of the customers orders and that method is protected
    // unless the user is authenticated on the client side
    if(/\/account\/\[id\]/.test(router.pathname)) {
      gtmVirtualPageView({
        page: {
          pageName: 'view order',
          pageCategory: 'account',
          pageUrl: router.pathname,
        },
      });
    } else {
      gtmVirtualPageView({
        page: {
          pageName: pageProps.page || null,
          pageCategory: pageProps.category || null,
          pageUrl: router.pathname,
        },
      });
    }


  }, [pageProps])

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) { // has API key
      setStripePromise(loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY));
    }

    store.dispatch(setCustomer());

    commerce.products.list().then((res) => {
      store.dispatch({
        type: 'STORE_PRODUCTS',
        payload: res.data
      })
    });

    commerce.categories.list().then((res) => {
      store.dispatch({
        type: 'STORE_CATEGORIES',
        payload: res.data
      })
    });

  }, [store])

  return (
    <Provider store={store}>
      <Component
        {...pageProps}
        stripe={stripePromise}
      />
    </Provider>
  );

}

export default MyApp;
