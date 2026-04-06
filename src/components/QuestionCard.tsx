import type { Question, Answer } from '../config/questions'

interface Props {
  question: Question
  onAnswer: (answer: Answer) => void
}

export default function QuestionCard({ question, onAnswer }: Props) {
  return (
    <div className="max-w-xl mx-auto">
      <h2 className="font-heading font-bold text-2xl md:text-3xl text-light mb-8 text-center">
        {question.text}
      </h2>
      <div className="flex flex-col gap-3">
        {question.options.map((option) => (
          <button
            key={option.key}
            onClick={() => onAnswer(option.key)}
            className="w-full text-left px-6 py-4 rounded-xl border border-light/10 bg-light/5
                       hover:border-accent hover:bg-accent/10 transition-all duration-200
                       text-light/90 font-body text-base cursor-pointer"
          >
            <span className="font-semibold text-accent mr-3">{option.key}.</span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
