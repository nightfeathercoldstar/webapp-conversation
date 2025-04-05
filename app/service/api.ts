import { ChatItem, Feedbacktype } from '@/types/app'

// API基础URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'

// 发送消息并获取响应
export const sendMessage = async (message: string): Promise<ChatItem> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data = await response.json()
    return {
      id: `answer-${Date.now()}`,
      content: data.response,
      isAnswer: true,
      feedback: { rating: null },
    }
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

// 发送反馈
export const sendFeedback = async (messageId: string, feedback: Feedbacktype): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageId, feedback }),
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    return true
  } catch (error) {
    console.error('Error sending feedback:', error)
    throw error
  }
} 