import './App.css';
import '@/styles/globals.css';
function MyApp({ Component, pageProps}) {
  return (
    <div className="w-[40vw] mx-auto p-5 shadow-md rounded-md">
      <header>
        <h1>My ChatBot</h1>

      </header>

      <main>
        <Component {...pageProps} />
      </main>
    </div>
  )
}

export default MyApp
