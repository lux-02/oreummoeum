import "@/styles/globals.css";
import Head from "next/head";

const SITE_NAME = "오름모음";
const SITE_URL = "https://oreum.제주맹글이.site";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="robots" content="index, follow" />
        <meta name="author" content="오름모음" />
        <meta
          name="keywords"
          content="제주 오름, 제주 오름 지도, 오름 검색, 제주 산, 제주 트래킹, 제주 등산, 제주 여행"
        />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ko_KR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="theme-color" content="#2c3e2c" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
