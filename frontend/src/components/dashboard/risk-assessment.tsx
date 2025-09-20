"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Shield, Clock, Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

interface RiskQuestion {
  id: string
  question: string
  type: 'multiple_choice' | 'scale' | 'text'
  options?: string[]
  weight: number
  category: string
}

interface RiskAssessmentProps {}

const riskQuestions: RiskQuestion[] = [
  {
    id: '1',
    question: 'What is your primary investment goal?',
    type: 'multiple_choice',
    options: ['Capital preservation', 'Income generation', 'Growth', 'Aggressive growth'],
    weight: 3,
    category: 'Investment Goals'
  },
  {
    id: '2',
    question: 'What is your investment time horizon?',
    type: 'multiple_choice',
    options: ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', 'More than 10 years'],
    weight: 4,
    category: 'Time Horizon'
  },
  {
    id: '3',
    question: 'How would you react to a 20% decline in your portfolio value?',
    type: 'multiple_choice',
    options: [
      'Sell all investments immediately',
      'Sell some investments to reduce risk',
      'Hold and wait for recovery',
      'Buy more while prices are low'
    ],
    weight: 5,
    category: 'Risk Tolerance'
  },
  {
    id: '4',
    question: 'What percentage of your income do you invest?',
    type: 'multiple_choice',
    options: ['Less than 5%', '5-10%', '10-20%', '20-30%', 'More than 30%'],
    weight: 2,
    category: 'Financial Situation'
  },
  {
    id: '5',
    question: 'Rate your investment knowledge (1-10)',
    type: 'scale',
    weight: 2,
    category: 'Knowledge'
  },
  {
    id: '6',
    question: 'How important is it to beat the market average?',
    type: 'multiple_choice',
    options: [
      'Not important at all',
      'Somewhat important',
      'Very important',
      'Extremely important'
    ],
    weight: 3,
    category: 'Performance Expectations'
  }
]

const riskProfiles = {
  conservative: {
    name: 'Conservative',
    description: 'Focus on capital preservation with minimal risk',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    allocation: {
      stocks: '20%',
      bonds: '60%',
      cash: '20%'
    }
  },
  moderate: {
    name: 'Moderate',
    description: 'Balanced approach with moderate risk and return',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    allocation: {
      stocks: '50%',
      bonds: '40%',
      cash: '10%'
    }
  },
  aggressive: {
    name: 'Aggressive',
    description: 'Growth-focused with higher risk tolerance',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    allocation: {
      stocks: '80%',
      bonds: '15%',
      cash: '5%'
    }
  }
}

export function RiskAssessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [riskProfile, setRiskProfile] = useState<keyof typeof riskProfiles | null>(null)

  const handleAnswer = (questionId: string, answer: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (currentQuestion < riskQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      calculateRiskProfile()
      setIsCompleted(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateRiskProfile = () => {
    let totalScore = 0
    let maxScore = 0

    riskQuestions.forEach(question => {
      const answer = answers[question.id]
      if (answer !== undefined) {
        if (question.type === 'multiple_choice') {
          const optionIndex = question.options?.indexOf(answer as string) || 0
          totalScore += (optionIndex + 1) * question.weight
        } else if (question.type === 'scale') {
          totalScore += (answer as number) * question.weight
        }
        maxScore += (question.options?.length || 10) * question.weight
      }
    })

    const riskScore = (totalScore / maxScore) * 100

    if (riskScore < 30) {
      setRiskProfile('conservative')
    } else if (riskScore < 70) {
      setRiskProfile('moderate')
    } else {
      setRiskProfile('aggressive')
    }
  }

  const resetAssessment = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setIsCompleted(false)
    setRiskProfile(null)
  }

  const progress = ((currentQuestion + 1) / riskQuestions.length) * 100
  const currentQuestionData = riskQuestions[currentQuestion]

  if (isCompleted && riskProfile) {
    const profile = riskProfiles[riskProfile]
    
    return (
      <div className="space-y-6">
        <Card className={`${profile.bgColor} ${profile.borderColor} border-2`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-full">
                <Shield className={`h-8 w-8 ${profile.color}`} />
              </div>
            </div>
            <CardTitle className={`text-2xl ${profile.color}`}>
              {profile.name} Risk Profile
            </CardTitle>
            <CardDescription className="text-lg">
              {profile.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Recommended Asset Allocation</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.allocation.stocks}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Stocks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.allocation.bonds}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Bonds</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.allocation.cash}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Cash</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Investment Recommendations</h3>
              <div className="space-y-2">
                {riskProfile === 'conservative' && (
                  <>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Focus on high-quality bonds and dividend stocks</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Consider Treasury bonds and blue-chip stocks</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Maintain higher cash reserves for stability</span>
                    </div>
                  </>
                )}
                {riskProfile === 'moderate' && (
                  <>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Balanced mix of growth and value stocks</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Include both domestic and international exposure</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Consider index funds and ETFs for diversification</span>
                    </div>
                  </>
                )}
                {riskProfile === 'aggressive' && (
                  <>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Focus on growth stocks and emerging markets</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Consider technology and innovation sectors</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Higher allocation to small-cap and mid-cap stocks</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button onClick={resetAssessment} variant="outline" className="flex-1">
                Retake Assessment
              </Button>
              <Button className="flex-1">
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Risk Assessment</span>
          </CardTitle>
          <CardDescription>
            Answer these questions to determine your risk tolerance and investment profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Question {currentQuestion + 1} of {riskQuestions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Question */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Target className="h-4 w-4" />
              <span>{currentQuestionData.category}</span>
            </div>
            
            <h3 className="text-lg font-semibold">
              {currentQuestionData.question}
            </h3>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestionData.type === 'multiple_choice' && currentQuestionData.options && (
                currentQuestionData.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(currentQuestionData.id, option)}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      answers[currentQuestionData.id] === option
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {option}
                  </button>
                ))
              )}

              {currentQuestionData.type === 'scale' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>1 - Beginner</span>
                    <span>10 - Expert</span>
                  </div>
                  <div className="grid grid-cols-10 gap-2">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
                      <button
                        key={value}
                        onClick={() => handleAnswer(currentQuestionData.id, value)}
                        className={`p-2 border rounded-lg text-center transition-colors ${
                          answers[currentQuestionData.id] === value
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={answers[currentQuestionData.id] === undefined}
            >
              {currentQuestion === riskQuestions.length - 1 ? 'Complete Assessment' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
