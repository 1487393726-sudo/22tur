"use client";

import {
  Code,
  Palette,
  Smartphone,
  TrendingUp,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { services as servicesData } from "@/lib/data/services";
import { useLanguage } from "@/lib/i18n/context";

const iconMap = {
  code: Code,
  palette: Palette,
  smartphone: Smartphone,
  "trending-up": TrendingUp,
  sparkles: Sparkles,
  lightbulb: Lightbulb,
};

const gradients = [
  "from-primary to-secondary",
  "from-secondary to-primary",
  "from-primary/80 to-secondary/80",
  "from-secondary/80 to-primary",
  "from-primary to-secondary/90",
  "from-secondary to-primary/90",
];

export function ServicesSection() {
  const { t } = useLanguage();

  return (
    <section
      id="services"
      className="relative py-24 md:py-40 overflow-hidden bg-gradient-to-b from-background to-muted/10"
      data-oid="va8zjui"
    >
      {/* Background decoration */}
      <div
        className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        data-oid="in2ucet"
      />

      <div
        className="absolute bottom-1/4 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
        data-oid="8pqr3qg"
      />

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-primary/3 via-transparent to-secondary/3 rounded-full blur-3xl"
        data-oid="sfryo1q"
      />

      <div
        className="relative container px-4 md:px-6 max-w-7xl mx-auto"
        data-oid="a048bur"
      >
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-20" data-oid="to.t9oj">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-8"
            data-oid="lb:hx1_"
          >
            <span
              className="text-sm font-medium text-primary"
              data-oid="hrrd-ft"
            >
              {t.services.badge}
            </span>
          </div>
          <h2
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8"
            data-oid="n9oajom"
          >
            <span
              className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent text-balance"
              data-oid=".mklh31"
            >
              {t.services.title}
            </span>
          </h2>
          <p
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed text-balance max-w-3xl mx-auto"
            data-oid="4sz6mel"
          >
            {t.services.subtitle}
          </p>
        </div>

        {/* Services Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-items-center md:justify-items-stretch"
          data-oid="jmwuumk"
        >
          {Object.entries(t.services.items).map(([key, service], index) => {
            const serviceData =
              servicesData.find((s) =>
                s.title
                  .toLowerCase()
                  .includes(
                    key.toLowerCase().replace("dev", "").replace("uiux", "ui"),
                  ),
              ) || servicesData[index];
            const IconComponent =
              iconMap[serviceData?.icon as keyof typeof iconMap] || Code;
            const gradient = gradients[index % gradients.length];

            return (
              <div
                key={key}
                className="group relative p-6 lg:p-8 bg-card/50 backdrop-blur-sm border border-border rounded-2xl hover:bg-card transition-all duration-500 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-2 hover:scale-[1.01] w-full max-w-md md:max-w-none h-full"
                style={{
                  animationDelay: `${index * 150}ms`,
                }}
                data-oid="1pb-s:_"
              >
                {/* Highlight Badge */}
                {service.highlight && (
                  <div
                    className={`absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${gradient} text-white shadow-lg animate-pulse`}
                    data-oid="kwzj0rc"
                  >
                    {service.highlight}
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${gradient} mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}
                  data-oid="6mgbkc9"
                >
                  <IconComponent
                    className="w-7 h-7 text-white"
                    data-oid="h:s-a9q"
                  />
                </div>

                {/* Content */}
                <h3
                  className="text-xl md:text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300"
                  data-oid="bicrupk"
                >
                  {service.title}
                </h3>
                <p
                  className="text-muted-foreground leading-relaxed mb-6 text-sm md:text-base"
                  data-oid="dy0-dd6"
                >
                  {service.description}
                </p>

                {service.features && service.features.length > 0 && (
                  <ul className="space-y-3" data-oid="8c9ou3c">
                    {service.features.map((feature, featureIndex) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-muted-foreground"
                        style={{
                          animationDelay: `${index * 150 + featureIndex * 50}ms`,
                        }}
                        data-oid="s9lxbqs"
                      >
                        <div
                          className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary mt-1.5 flex-shrink-0 group-hover:scale-125 group-hover:animate-pulse transition-all duration-300"
                          data-oid="7uprn04"
                        />

                        <span
                          className="group-hover:text-foreground transition-colors duration-300 leading-relaxed"
                          data-oid="ob0s.r6"
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Hover gradient effect */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  data-oid="afvx8f0"
                />

                {/* Decorative elements */}
                <div
                  className="absolute -top-2 -right-2 w-4 h-4 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"
                  data-oid="1l2s4:-"
                />

                <div
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-secondary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200"
                  data-oid="elh8kx1"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
