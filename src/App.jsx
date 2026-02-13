import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Dialogue from './pages/Dialogue'
import Flashcards from './pages/Flashcards'
import Notes from './pages/Notes'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dialogue/:id" element={<Dialogue />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/notes" element={<Notes />} />
      </Routes>
    </Layout>
  )
}
