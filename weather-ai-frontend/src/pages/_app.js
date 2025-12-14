import Head from 'next/head'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Weather AI Mining - Smart weather predictions for mining operations" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="icon" href="/favicon.ico" />
        <title>Weather AI Mining</title>
        
        {/* Open Graph tags untuk social media */}
        <meta property="og:title" content="Weather AI Mining" />
        <meta property="og:description" content="AI-powered weather predictions for mining operations" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp