import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Quiz from './pages/Quiz'
import Result from './pages/Result'
import Plan from './pages/Plan'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/resultat" element={<Result />} />
        <Route path="/plan" element={<Plan />} />
      </Routes>
    </BrowserRouter>
  )
}
