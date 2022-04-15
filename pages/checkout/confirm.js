import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic'

const OrderConfirm = dynamic(() => import('../../components/checkout/Confirm'),
  { ssr: false }
)

function Confirm() {
  return (
    <>
      <Head>
        <title>Order | commerce</title>
      </Head>
      <OrderConfirm />
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {
      page: 'order confirm',
      category: 'checkout'
    }, // is passed up to the custom app as pageProps
  }
}

export default Confirm;
