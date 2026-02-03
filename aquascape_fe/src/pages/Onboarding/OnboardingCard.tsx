import { Image } from 'antd'

interface OnboardingCardProps {
  image: string
  title: string
  description: string
  currentIndex: number
  total: number
  onNext: () => void
  onDotClick: (index: number) => void
  buttonText: string
}

export default function OnboardingCard({
  image,
  title,
  description,
  currentIndex,
  total,
  onNext,
  onDotClick,
  buttonText,
}: OnboardingCardProps) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden">
      <div className="px-6 pt-6">
        <Image
          src={image}
          alt={title}
          preview={false}
          className="rounded-2xl object-cover"
        />
      </div>

      <div className="p-6 text-center">
        <h2 className="text-base font-semibold text-gray-900 mb-2">
          {title}
        </h2>

        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          {description}
        </p>

        <div className="flex justify-center items-center gap-3 mb-8">
          {Array.from({ length: total }).map((_, index) => (
            <button
              key={index}
              onClick={() => onDotClick(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-blue-500'
                  : 'w-4 bg-gray-400'
              }`}
            />
          ))}
        </div>

        <button
          onClick={onNext}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-full shadow-md active:scale-95 transition"
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}
