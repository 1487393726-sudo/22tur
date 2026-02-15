"use client";

import { ProjectInvestmentCard } from "./project-investment-card";
import { useLanguage } from "@/lib/i18n/context";
import { Target } from "lucide-react";

export function ProjectInvestmentSection() {
  const { t } = useLanguage();

  const projectExamples = [
    {
      industry: t.investment.projects.ecommerce.industry,
      description: t.investment.projects.ecommerce.description,
      startupCost: t.investment.projects.ecommerce.cost,
      planningTime: t.investment.projects.ecommerce.planning,
      buildTime: t.investment.projects.ecommerce.build,
      teamSize: t.investment.projects.ecommerce.teamSize,
      positions: t.investment.projects.ecommerce.positions,
      roi: t.investment.projects.ecommerce.roi,
      details: t.investment.projects.ecommerce.details,
    },
    {
      industry: t.investment.projects.education.industry,
      description: t.investment.projects.education.description,
      startupCost: t.investment.projects.education.cost,
      planningTime: t.investment.projects.education.planning,
      buildTime: t.investment.projects.education.build,
      teamSize: t.investment.projects.education.teamSize,
      positions: t.investment.projects.education.positions,
      roi: t.investment.projects.education.roi,
      details: t.investment.projects.education.details,
    },
    {
      industry: t.investment.projects.enterprise.industry,
      description: t.investment.projects.enterprise.description,
      startupCost: t.investment.projects.enterprise.cost,
      planningTime: t.investment.projects.enterprise.planning,
      buildTime: t.investment.projects.enterprise.build,
      teamSize: t.investment.projects.enterprise.teamSize,
      positions: t.investment.projects.enterprise.positions,
      roi: t.investment.projects.enterprise.roi,
      details: t.investment.projects.enterprise.details,
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden" data-oid="758ioq0">
      <div className="container mx-auto px-4 relative z-10" data-oid=":llee--">
        <div className="text-center mb-16" data-oid="46oy9ly">
          <div
            className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6"
            data-oid="yurg9ca"
          >
            <div
              className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"
              data-oid="9x33k4w"
            />
            <span
              className="text-sm font-semibold text-blue-700 dark:text-blue-300"
              data-oid="l5yv6_k"
            >
              {t.investment.badge}
            </span>
          </div>

          <h2
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-6"
            data-oid="o5bf-dr"
          >
            {t.investment.title}
          </h2>
          <p
            className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto"
            data-oid="kmxp7pd"
          >
            {t.investment.subtitle}
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-items-center md:justify-items-stretch mb-16"
          data-oid="f7568sm"
        >
          {projectExamples.map((project, index) => (
            <div
              key={index}
              className="transform transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 w-full max-w-lg md:max-w-none"
              style={{
                animationDelay: `${index * 150}ms`,
              }}
              data-oid="_k2z9c1"
            >
              <ProjectInvestmentCard
                {...project}
                className="h-fit opacity-0 animate-fadeInUp"
                data-oid="6h:1u2k"
              />
            </div>
          ))}
        </div>

        <div
          className="text-center bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-2xl shadow-2xl relative overflow-hidden"
          data-oid="jlc9y_i"
        >
          <div
            className="absolute inset-0 bg-white/10 transform rotate-45 translate-x-full hover:translate-x-0 transition-transform duration-700"
            data-oid="fguivx0"
          />
          <div className="relative z-10" data-oid="6jeb7kh">
            <h3
              className="text-2xl font-bold text-white mb-4"
              data-oid="4q39_cx"
            >
              {t.investment.ctaTitle}
            </h3>
            <p
              className="text-blue-100 mb-6 max-w-2xl mx-auto"
              data-oid="dhohl46"
            >
              {t.investment.ctaSubtitle}
            </p>
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              data-oid="ti5..82"
            >
              <button
                type="button"
                className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                data-oid="9su.dx4"
              >
                <Target className="w-4 h-4 inline mr-2" data-oid="vi_ow7s" />
                {t.investment.getCustomAnalysis}
              </button>
              <button
                type="button"
                className="px-8 py-3 bg-transparent text-white border-2 border-white rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300 font-semibold"
                data-oid="86r00r:"
              >
                {t.investment.downloadGuide}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
