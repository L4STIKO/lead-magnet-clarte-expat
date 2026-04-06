import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ProgressBar from '../components/ProgressBar'
import QuestionCard from '../components/QuestionCard'
import { questions, type Answer } from '../config/questions'
import { saveAnswer } from '../lib/storage'

export default function Quiz() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const navigate = useNavigate()

  const question = questions[currentIndex]

  function handleAnswer(answer: Answer) {
    saveAnswer(question.id, answer)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      navigate('/resultat')
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else {
      navigate('/')
    }
  }

  return (
    <Layout>
      <div className="pt-8 md:pt-16">
        <ProgressBar current={currentIndex + 1} total={questions.length} />

        {/* Bouton retour */}
        <div className="max-w-xl mx-auto mb-6">
          <button
            onClick={handleBack}
            className="text-light/40 hover:text-light/70 transition-colors text-sm font-body cursor-pointer"
          >
            ← Retour
          </button>
        </div>

        <QuestionCard question={question} onAnswer={handleAnswer} />
      </div>
    </Layout>
  )
}
