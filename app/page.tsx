import { FC } from 'react'
import React from 'react'
import Link from 'next/link'

const HomePage: FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>
      <div className="relative w-full h-full overflow-auto">
        <div className="min-h-full flex flex-col">
          {/* 主要内容 */}
          <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
            {/* Logo和标题 */}
            <div className="text-center mb-10">
              <div className="inline-block mb-6">
                <div className="bg-white p-3 rounded-full shadow-sm">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="40" rx="20" fill="#EBF5FF"/>
                    <path d="M12 14C12 12.8954 12.8954 12 14 12H26C27.1046 12 28 12.8954 28 14V18C28 19.1046 27.1046 20 26 20H14C12.8954 20 12 19.1046 12 18V14Z" fill="#3B82F6"/>
                    <path d="M12 22C12 20.8954 12.8954 20 14 20H26C27.1046 20 28 20.8954 28 22V26C28 27.1046 27.1046 28 26 28H14C12.8954 28 12 27.1046 12 26V22Z" fill="#2563EB"/>
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Text-to-SQL
              </h1>
              <p className="mt-3 text-xl text-gray-600 max-w-lg">
                轻松将自然语言转换为精准的SQL查询语句
              </p>
            </div>
            
            {/* 主卡片 */}
            <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
              {/* 卡片内容 */}
              <div className="p-6">
                <div className="flex space-x-3 mb-6">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">AI驱动</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">高效转换</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">准确可靠</span>
                </div>
                
                <h2 className="text-lg font-medium text-gray-900 mb-4">三步轻松生成SQL</h2>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="mx-auto w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold mb-2">1</div>
                    <p className="text-xs text-gray-700">点击下方按钮开始对话</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="mx-auto w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold mb-2">2</div>
                    <p className="text-xs text-gray-700">描述您需要查询的数据</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="mx-auto w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold mb-2">3</div>
                    <p className="text-xs text-gray-700">获取SQL查询语句</p>
                  </div>
                </div>
              </div>
              
              {/* 示例 */}
              <div className="px-6 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-3">示例查询</p>
                <div className="space-y-2 mb-4">
                  <div className="text-xs bg-gray-50 p-2 rounded text-gray-700">找出销售额超过1000元的订单</div>
                  <div className="text-xs bg-gray-50 p-2 rounded text-gray-700">统计每个部门的平均工资</div>
                </div>
              </div>
              
              {/* 按钮 */}
              <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600">
                <Link href="/conversation" className="block w-full py-2 bg-white text-blue-600 font-medium rounded-md text-center text-sm hover:bg-blue-50 transition-colors">
                  开始对话
                </Link>
              </div>
            </div>
          </main>
          
          {/* 页脚 */}
          <footer className="text-center py-3">
            <p className="text-xs text-gray-500">© 2025 Text-to-SQL 助手</p>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default HomePage
