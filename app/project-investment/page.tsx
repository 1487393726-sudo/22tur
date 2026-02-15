import { Metadata } from "next";
import { ProjectInvestmentShowcase } from "@/lib/data/project-investment-examples";

export const metadata: Metadata = {
  title: "项目投资规划 | 创意机构",
  description:
    "探索不同行业数字化项目的投资规划，包括启动成本、时间规划、人力资源需求和预期回报率。",
};

export default function ProjectInvestmentPage() {
  return (
    <main className="min-h-screen relative" data-oid="a__7gyg">
      {/* Background decoration */}
      <div
        className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-950/30 to-indigo-950/20 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/20"
        data-oid="dn2x:q."
      />

      <div
        className="fixed top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"
        data-oid="pn0-dia"
      />

      <div
        className="fixed bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"
        data-oid="m0f7etb"
      />

      <div className="relative z-10" data-oid="656_ei-">
        {/* Header */}
        <div
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50"
          data-oid="rp-6hg0"
        >
          <div className="container mx-auto px-4 py-12" data-oid="-fewe5s">
            <div className="text-center" data-oid="v8en_ss">
              <div
                className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6"
                data-oid="6oxrbnk"
              >
                <div
                  className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"
                  data-oid="iu.fczo"
                />

                <span
                  className="text-sm font-semibold text-blue-700 dark:text-blue-300"
                  data-oid="qy4.kvp"
                >
                  投资规划方案
                </span>
              </div>

              <h1
                className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-6"
                data-oid=".2o2nd."
              >
                项目投资规划
              </h1>
              <p
                className="text-xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed"
                data-oid="o60a4jb"
              >
                为您的数字化项目提供详细的投资规划，包括精准的预算估算、科学的时间安排和优化的团队配置建议，助您成功实现数字化转型目标
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="py-8" data-oid="dr71my5">
          <ProjectInvestmentShowcase data-oid="hb2byvi" />
        </div>

        {/* CTA Section */}
        <div className="relative" data-oid="1ko6cfe">
          <div
            className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
            data-oid="ks.hl0_"
          />

          <div className="relative py-16" data-oid="p0:v3.f">
            <div
              className="container mx-auto px-4 text-center"
              data-oid="wfd6mog"
            >
              <h2
                className="text-4xl font-bold text-white mb-6"
                data-oid="48are_k"
              >
                准备开始您的数字化转型之旅了吗？
              </h2>
              <p
                className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed"
                data-oid="sw5i384"
              >
                联系我们的专业投资规划团队，获取免费的项目咨询、详细的投资分析报告和个性化的实施方案
              </p>
              <div
                className="flex flex-col sm:flex-row gap-6 justify-center"
                data-oid="y-6kqx7"
              >
                <button
                  className="px-10 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-translate-y-1"
                  data-oid="x3j7px0"
                >
                  <span className="inline-flex items-center" data-oid="eab1anm">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      data-oid="sz:adsi"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                        data-oid="lhdpura"
                      />
                    </svg>
                    免费投资咨询
                  </span>
                </button>
                <button
                  className="px-10 py-4 bg-transparent text-white border-3 border-white rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300 font-bold text-lg transform hover:scale-105 hover:-translate-y-1"
                  data-oid="5z2.7gg"
                >
                  <span className="inline-flex items-center" data-oid="4v1dxr:">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      data-oid="ardbu:3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        data-oid="4_1go-b"
                      />
                    </svg>
                    下载投资指南PDF
                  </span>
                </button>
              </div>

              <div
                className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
                data-oid="x6wqxoi"
              >
                <div
                  className="bg-white/10 backdrop-blur rounded-lg p-4"
                  data-oid="1s..syq"
                >
                  <div
                    className="text-3xl font-bold text-white"
                    data-oid="m94rmtw"
                  >
                    500+
                  </div>
                  <div className="text-blue-100" data-oid="gdt97i5">
                    成功案例
                  </div>
                </div>
                <div
                  className="bg-white/10 backdrop-blur rounded-lg p-4"
                  data-oid="9dqimiy"
                >
                  <div
                    className="text-3xl font-bold text-white"
                    data-oid="w9a3hct"
                  >
                    98%
                  </div>
                  <div className="text-blue-100" data-oid="biosklq">
                    客户满意度
                  </div>
                </div>
                <div
                  className="bg-white/10 backdrop-blur rounded-lg p-4"
                  data-oid="iwj3zzx"
                >
                  <div
                    className="text-3xl font-bold text-white"
                    data-oid="nlq4ht:"
                  >
                    24h
                  </div>
                  <div className="text-blue-100" data-oid=".-74goa">
                    快速响应
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
