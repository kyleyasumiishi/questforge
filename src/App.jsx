import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeScreen from './components/HomeScreen/HomeScreen'
import GitQuestPage from './pages/GitQuestPage'
import SqlQuestPage from './pages/SqlQuestPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/gitquest" element={<GitQuestPage />} />
        <Route path="/sqlquest" element={<SqlQuestPage />} />
      </Routes>
    </BrowserRouter>
  )
}
