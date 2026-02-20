import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Welcome from './pages/Welcome'
import Home from './pages/Home'
import BookPage from './pages/BookPage'
import Essays from './pages/Essays'
import EssayPage from './pages/EssayPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/books" element={<Home />} />
        <Route path="/book/:id" element={<BookPage />} />
        <Route path="/essays" element={<Essays />} />
        <Route path="/essays/:id" element={<EssayPage />} />
      </Routes>
    </Layout>
  )
}
