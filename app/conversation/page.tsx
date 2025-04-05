'use client'
import { FC, useEffect, useState, useRef } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { produce } from 'immer'
import { useBoolean, useGetState } from 'ahooks'
import type { ChatItem, Feedbacktype, PromptConfig, VisionFile, VisionSettings } from '@/types/app'
import { Resolution, TransferMethod } from '@/types/app'
import Chat from '@/app/components/chat'
import Toast from '@/app/components/base/toast'
import useConversation from '@/hooks/use-conversation'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'
import { API_KEY, APP_ID, APP_INFO } from '@/config'
import { sendMessage, sendFeedback } from '@/app/service/api'

// 仿照原始Main组件的接口
export type IMainProps = {
  params: any
}

const ConversationPage: FC<IMainProps> = ({
  params,
}: any) => {
  const { t } = useTranslation()
  const { notify } = Toast
  const media = useBreakpoints()
  const isMobile = media === MediaType.mobile

  // 应用状态
  const [isResponding, { setTrue: setResponding, setFalse: setResponded }] = useBoolean(false)
  const [controlClearQuery, setControlClearQuery] = useState(0)
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null)
  const [visionConfig, setVisionConfig] = useState<VisionSettings | undefined>({
    enabled: false,
    number_limits: 2,
    detail: Resolution.low,
    transfer_methods: [TransferMethod.local_file],
  })

  // 对话状态管理
  const {
    conversationList,
    setConversationList,
    currConversationId,
    setCurrConversationId,
    isNewConversation,
    currConversationInfo,
  } = useConversation()

  const [chatList, setChatList, getChatList] = useGetState<ChatItem[]>([])
  const [hasStartedChat, setHasStartedChat] = useState(false)
  const chatListDomRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (chatListDomRef.current && hasStartedChat) {
      chatListDomRef.current.scrollTop = chatListDomRef.current.scrollHeight;
    }
  }, [chatList, hasStartedChat])

  // 初始化应用参数
  useEffect(() => {
    if (APP_INFO?.title)
      document.title = `${APP_INFO.title || 'Text-to-SQL 助手'}`

    // 初始化一个欢迎对话
    setConversationList([
      {
        id: '-1',
        name: '新对话',
        inputs: {},
        introduction: '',
      }
    ])
  }, [])

  // 处理发送消息
  const handleSendMessage = async (message: string, files: VisionFile[]) => {
    if (isResponding) {
      notify({ type: 'info', message: '请等待上一条消息的回复' })
      return
    }

    if (!hasStartedChat) {
      setHasStartedChat(true)
    }

    // 处理长文本，保留原样
    let processedMessage = message;

    const newChatList = [...getChatList()]
    const questionId = `question-${Date.now()}`
    const messageItem = {
      id: questionId,
      content: processedMessage,
      isAnswer: false,
    }

    newChatList.push(messageItem)
    setChatList(newChatList)

    // 显示加载状态
    setResponding()

    // 自动滚动到底部
    setTimeout(() => {
      if (chatListDomRef.current) {
        chatListDomRef.current.scrollTop = chatListDomRef.current.scrollHeight;
      }
    }, 100)

    try {
      // 调用API获取响应
      const response = await sendMessage(processedMessage);

      // 添加回答到聊天列表
      const newChatListWithAnswer = [...getChatList()];
      newChatListWithAnswer.push(response);

      setChatList(newChatListWithAnswer);
      setControlClearQuery(Date.now());
      setResponded();

      // 自动滚动到底部
      setTimeout(() => {
        if (chatListDomRef.current) {
          chatListDomRef.current.scrollTop = chatListDomRef.current.scrollHeight;
        }
      }, 100)
    } catch (error) {
      notify({ type: 'error', message: '发送消息失败，请重试' })
      setResponded();
    }
  }

  // 处理反馈，可切换取消
  const handleFeedback = async (messageId: string, feedback: Feedbacktype): Promise<any> => {
    try {
      const newChatList = [...getChatList()];
      const targetIndex = newChatList.findIndex(item => item.id === messageId);

      if (targetIndex !== -1) {
        const currentItem = newChatList[targetIndex];

        // 如果当前反馈与新反馈相同，则取消反馈
        if (currentItem.feedback?.rating === feedback.rating) {
          newChatList[targetIndex] = {
            ...currentItem,
            feedback: { rating: null }
          };
        } else {
          // 否则设置新反馈
          newChatList[targetIndex] = {
            ...currentItem,
            feedback
          };
        }

        setChatList(newChatList);

        // 发送反馈到服务器
        await sendFeedback(messageId, feedback);
      }
      return true;
    } catch (error) {
      notify({ type: 'error', message: '发送反馈失败，请重试' })
      return false;
    }
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="relative w-full h-full flex flex-col overflow-hidden bg-gray-50">
        {/* 顶部导航 */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shadow-sm z-10">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium text-gray-700">Text-to-SQL</span>
            </a>
          </div>
        </header>

        {!hasStartedChat ? (
          // 欢迎界面 - 居中显示
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-4 overflow-hidden">
            <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white mb-8">
                <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 8C6 6.89543 6.89543 6 8 6H24C25.1046 6 26 6.89543 26 8V12C26 13.1046 25.1046 14 24 14H8C6.89543 14 6 13.1046 6 12V8Z" fill="white" />
                  <path d="M6 20C6 18.8954 6.89543 18 8 18H24C25.1046 18 26 18.8954 26 20V24C26 25.1046 25.1046 26 24 26H8C6.89543 26 6 25.1046 6 24V20Z" fill="white" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-800">欢迎使用Text-to-SQL</h2>
              <p className="text-lg text-gray-600 mb-12 max-w-3xl">您可以输入自然语言，我会帮您转换为SQL查询语句</p>

              <div className="w-full max-w-3xl">
                <div className="relative">
                  <textarea
                    className="w-full px-6 py-4 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base shadow-sm"
                    placeholder="输入您想要查询的内容..."
                    rows={3}
                    style={{ maxHeight: '200px', minHeight: '100px', height: 'auto', overflowY: 'auto' }}
                    onInput={(e) => {
                      // 自动调整高度
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const target = e.target as HTMLTextAreaElement;
                        if (target.value.trim()) {
                          handleSendMessage(target.value.trim(), []);
                          target.value = '';
                          // 重置文本框高度
                          target.style.height = '100px';
                        }
                      }
                    }}
                  ></textarea>
                  <button
                    className="absolute right-3 bottom-3 text-white p-2 rounded-md bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      const textarea = document.querySelector('textarea');
                      if (textarea && textarea.value.trim()) {
                        handleSendMessage(textarea.value.trim(), []);
                        textarea.value = '';
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="text-center text-xs text-gray-500 mt-2">
                  按下 Enter 发送，Shift+Enter 换行
                </div>
                <div className="text-center text-xs text-gray-400 mt-1">
                  支持长文本输入，自动调整高度
                </div>
              </div>

              <div className="mt-10 w-full">
                <h3 className="text-sm font-medium text-gray-700 mb-3">示例：</h3>
                <div className="space-y-2">
                  {[
                    "查询所有销售额超过1000元的订单",
                    "统计每个部门的平均工资和员工数量",
                    "找出近30天内购买次数最多的前10名客户"
                  ].map((example, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white rounded-lg border border-gray-200 text-sm text-gray-800 cursor-pointer hover:bg-gray-50 text-left"
                      onClick={() => handleSendMessage(example, [])}
                    >
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 聊天界面 - 常规布局
          <div
            className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50"
            ref={chatListDomRef}
          >
            <div className="h-full max-w-7xl mx-auto py-4 px-4 sm:px-6">
              <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-6rem)] overflow-y-auto">
                {chatList.map((item) => (
                  <div key={item.id} className="p-4">
                    {item.isAnswer ? (
                      // AI 回复消息
                      <div className="py-2">
                        <div className="flex max-w-2xl mx-auto">
                          <div className="flex-shrink-0 mr-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 4C3 3.44772 3.44772 3 4 3H16C16.5523 3 17 3.44772 17 4V7C17 7.55228 16.5523 8 16 8H4C3.44772 8 3 7.55228 3 7V4Z" fill="white" />
                                <path d="M3 13C3 12.4477 3.44772 12 4 12H16C16.5523 12 17 12.4477 17 13V16C17 16.5523 16.5523 17 16 17H4C3.44772 17 3 16.5523 3 16V13Z" fill="white" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 relative">
                            <div className="bg-white p-4 rounded-lg shadow-md text-sm leading-relaxed text-gray-800 border border-gray-100">
                              {item.content}
                            </div>
                            <div className="flex mt-1.5 pl-1">
                              <button
                                onClick={() => handleFeedback(item.id, { rating: 'like' })}
                                className={`p-1 rounded-md mr-2 ${item.feedback?.rating === 'like' ? 'bg-green-50 text-green-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                title={item.feedback?.rating === 'like' ? '取消点赞' : '点赞'}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleFeedback(item.id, { rating: 'dislike' })}
                                className={`p-1 rounded-md ${item.feedback?.rating === 'dislike' ? 'bg-red-50 text-red-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                title={item.feedback?.rating === 'dislike' ? '取消不喜欢' : '不喜欢'}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // 用户消息
                      <div className="py-2">
                        <div className="flex justify-end max-w-2xl mx-auto">
                          <div className="max-w-[75%]">
                            <div className="bg-blue-600 p-4 rounded-lg text-white text-sm leading-relaxed shadow-md">
                              {item.content}
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-3">
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white overflow-hidden shadow-sm">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" fill="#94A3B8" />
                                <path d="M12 12C8.13401 12 5 15.134 5 19V21H19V19C19 15.134 15.866 12 12 12Z" fill="#94A3B8" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isResponding && (
                  <div className="py-2 mb-4">
                    <div className="flex max-w-2xl mx-auto">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 4C3 3.44772 3.44772 3 4 3H16C16.5523 3 17 3.44772 17 4V7C17 7.55228 16.5523 8 16 8H4C3.44772 8 3 7.55228 3 7V4Z" fill="white" />
                            <path d="M3 13C3 12.4477 3.44772 12 4 12H16C16.5523 12 17 12.4477 17 13V16C17 16.5523 16.5523 17 16 17H4C3.44772 17 3 16.5523 3 16V13Z" fill="white" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-white p-4 rounded-lg shadow-md inline-flex items-center border border-gray-100">
                          <div className="flex space-x-1.5">
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "600ms" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 底部输入区域 - 仅在聊天状态下显示 */}
        {hasStartedChat && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-6">
            <div className="bg-white border-t border-gray-200 py-3">
              <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="relative">
                  <textarea
                    className="w-full px-3 py-2 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm shadow-sm"
                    placeholder="输入您想要查询的内容..."
                    rows={1}
                    style={{ maxHeight: '150px', minHeight: '42px', height: 'auto', overflowY: 'auto' }}
                    onInput={(e) => {
                      // 自动调整高度
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const target = e.target as HTMLTextAreaElement;
                        if (target.value.trim()) {
                          handleSendMessage(target.value.trim(), []);
                          target.value = '';
                          // 重置文本框高度
                          target.style.height = '42px';
                        }
                      }
                    }}
                  ></textarea>
                  <button
                    className={`absolute right-2.5 bottom-2 text-white p-1 rounded-md ${isResponding ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    disabled={isResponding}
                    onClick={() => {
                      const textarea = document.querySelector('textarea');
                      if (textarea && textarea.value.trim() && !isResponding) {
                        handleSendMessage(textarea.value.trim(), []);
                        textarea.value = '';
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="text-center text-xs text-gray-500 mt-2">
                  由 Text-to-SQL 高级语言模型驱动
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationPage 