"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Briefcase,
  Target,
  BarChart3,
  Zap,
} from "lucide-react";

interface ProjectInvestmentCardProps {
  industry: string;
  description: string;
  startupCost: string;
  planningTime: string;
  buildTime: string;
  teamSize: number;
  positions: string[];
  roi: string;
  details: string[];
  className?: string;
}

export function ProjectInvestmentCard({
  industry,
  description,
  startupCost,
  planningTime,
  buildTime,
  teamSize,
  positions,
  roi,
  details,
  className = "",
}: ProjectInvestmentCardProps) {
  const { t } = useLanguage();

  return (
    <Card
      className={`w-full max-w-2xl mx-auto border-0 shadow-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 ${className}`}
      data-oid="_rcz_l6"
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-lg pointer-events-none"
        data-oid="gc..d0f"
      />

      <CardHeader className="relative" data-oid="rt_fxnj">
        <div className="flex items-center justify-between" data-oid="-3n0sbi">
          <Badge
            className="bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium border-0 shadow-lg"
            data-oid="ygsi415"
          >
            <Target className="w-4 h-4 mr-1" data-oid="8.i1wxl" />
            {industry}
          </Badge>
          <Badge
            className="bg-gradient-to-r from-secondary to-primary text-white border-0 shadow-lg"
            data-oid="424869l"
          >
            <BarChart3 className="w-4 h-4 mr-1" data-oid="8588g.5" />
            ROI: {roi}
          </Badge>
        </div>
        <CardTitle
          className="text-xl font-bold bg-gradient-to-r from-primary to-secondary dark:from-primary/90 dark:to-secondary/90 bg-clip-text text-transparent"
          data-oid="-14m8w."
        >
          {description}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 relative" data-oid="_y75sfn">
        {/* Financial Information */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          data-oid="e_2wmtp"
        >
          <div
            className="group relative overflow-hidden bg-gradient-to-br from-primary to-secondary p-3 rounded-xl text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            data-oid="xm37nf_"
          >
            <div
              className="absolute inset-0 bg-white/20 transform rotate-45 translate-x-full group-hover:translate-x-0 transition-transform duration-500"
              data-oid="4n.-wzq"
            />

            <DollarSign
              className="w-5 h-5 mb-2 relative z-10"
              data-oid="3r5q5.o"
            />

            <div className="relative z-10" data-oid="a4w6jra">
              <p
                className="text-xs text-primary-foreground/80"
                data-oid="5puhq_i"
              >
                {t.investment.startupCost}
              </p>
              <p className="font-bold text-white text-sm" data-oid="c7jjn68">
                {startupCost}
              </p>
            </div>
          </div>

          <div
            className="group relative overflow-hidden bg-gradient-to-br from-secondary to-primary p-3 rounded-xl text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            data-oid="h4axjew"
          >
            <div
              className="absolute inset-0 bg-white/20 transform rotate-45 translate-x-full group-hover:translate-x-0 transition-transform duration-500"
              data-oid="psrbwr6"
            />

            <Calendar
              className="w-5 h-5 mb-2 relative z-10"
              data-oid="r0ga-t_"
            />

            <div className="relative z-10" data-oid="w0l90cq">
              <p
                className="text-xs text-secondary-foreground/80"
                data-oid="9o4ylmo"
              >
                {t.investment.planningTime}
              </p>
              <p className="font-bold text-white text-sm" data-oid="0b-jnm2">
                {planningTime}
              </p>
            </div>
          </div>

          <div
            className="group relative overflow-hidden bg-gradient-to-br from-primary/80 to-secondary/80 p-3 rounded-xl text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            data-oid="_yj.k7g"
          >
            <div
              className="absolute inset-0 bg-white/20 transform rotate-45 translate-x-full group-hover:translate-x-0 transition-transform duration-500"
              data-oid="253fuh9"
            />

            <Zap className="w-5 h-5 mb-2 relative z-10" data-oid="7hm0owx" />
            <div className="relative z-10" data-oid="h6.c0_r">
              <p
                className="text-xs text-primary-foreground/60"
                data-oid="3u.99gt"
              >
                {t.investment.buildTime}
              </p>
              <p className="font-bold text-white text-sm" data-oid=".g_-ep9">
                {buildTime}
              </p>
            </div>
          </div>
        </div>

        {/* Human Resources */}
        <div className="space-y-4" data-oid="-k-tp.i">
          <div
            className="flex items-center space-x-3 bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg"
            data-oid="_hy6jv-"
          >
            <div
              className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg"
              data-oid="t5ah.6c"
            >
              <Users className="w-5 h-5 text-white" data-oid="lteeed8" />
            </div>
            <div className="flex-1" data-oid="gw9d2yo">
              <h3 className="font-semibold text-foreground" data-oid="pc52gw:">
                {t.investment.humanResources}
              </h3>
              <Badge
                className="bg-gradient-to-r from-primary/80 to-secondary/80 text-white border-0 mt-1"
                data-oid="ihqgqeq"
              >
                {teamSize} {t.investment.people}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2" data-oid="u93kwrw">
            {positions.map((position, index) => (
              <Badge
                key={index}
                className="bg-gradient-to-r from-primary/20 to-secondary/20 text-foreground border-border hover:from-primary/30 hover:to-secondary/30 transition-all duration-300"
                data-oid="v150w9y"
              >
                {position}
              </Badge>
            ))}
          </div>
        </div>

        {/* Project Details */}
        <div className="space-y-4" data-oid="zqh7wm:">
          <h3
            className="font-semibold text-foreground flex items-center"
            data-oid="40t-knm"
          >
            <div
              className="w-2 h-6 bg-gradient-to-b from-primary to-secondary rounded-full mr-3"
              data-oid="w54qj4p"
            />

            {t.investment.projectDetails}
          </h3>
          <ul className="space-y-3" data-oid="rxykxh-">
            {details.map((detail, index) => (
              <li
                key={index}
                className="flex items-start space-x-3 group"
                data-oid="yj-pag5"
              >
                <div
                  className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
                  data-oid="kr15.ut"
                >
                  {index + 1}
                </div>
                <span
                  className="text-sm text-muted-foreground group-hover:text-foreground transition-colors"
                  data-oid="u9__-2y"
                >
                  {detail}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4" data-oid="0hchgui">
          <Button
            className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            data-oid="-5m1n0q"
          >
            <Target className="w-4 h-4 mr-2" data-oid="vnex5lr" />
            {t.investment.learnMore}
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            data-oid="qv:zeva"
          >
            <Briefcase className="w-4 h-4 mr-2" data-oid="ke4sowz" />
            {t.investment.contactUs}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
