import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ServiceCard } from "./service-card";
import type { Service } from "@/lib/types/services";

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: any) => (
    <a href={href} data-testid="service-link">
      {children}
    </a>
  );
});

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const mockService: Service = {
  id: "service-design-001",
  category: "design",
  title: "UI/UX设计",
  titleEn: "UI/UX Design",
  description: "专业的用户界面和用户体验设计服务",
  descriptionEn: "Professional UI/UX design services",
  icon: "palette",
  features: ["响应式设计", "用户研究", "原型设计", "设计系统"],
  featuresEn: ["Responsive Design", "User Research", "Prototyping", "Design System"],
  priceRange: {
    min: 5000,
    max: 20000,
    unit: "CNY",
  },
  deliveryTime: "2-4 weeks",
  popular: true,
  order: 1,
};

describe("ServiceCard", () => {
  describe("Rendering", () => {
    it("renders service title correctly", () => {
      render(
        <ServiceCard service={mockService} category="design" />
      );
      expect(screen.getByText("UI/UX设计")).toBeInTheDocument();
    });

    it("renders service description", () => {
      render(
        <ServiceCard service={mockService} category="design" />
      );
      expect(
        screen.getByText("专业的用户界面和用户体验设计服务")
      ).toBeInTheDocument();
    });

    it("renders all service features", () => {
      render(
        <ServiceCard service={mockService} category="design" />
      );
      // Only first 3 features are displayed
      mockService.features.slice(0, 3).forEach((feature) => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });

    it("renders price range", () => {
      render(
        <ServiceCard service={mockService} category="design" />
      );
      expect(screen.getByText(/¥5,000 - ¥20,000/)).toBeInTheDocument();
    });

    it("renders delivery time", () => {
      render(
        <ServiceCard service={mockService} category="design" />
      );
      expect(screen.getByText(/交付周期: 2-4 weeks/)).toBeInTheDocument();
    });

    it("renders popular badge when service is popular", () => {
      render(
        <ServiceCard service={mockService} category="design" />
      );
      expect(screen.getByText("热门")).toBeInTheDocument();
    });

    it("does not render popular badge when service is not popular", () => {
      const nonPopularService = { ...mockService, popular: false };
      render(
        <ServiceCard service={nonPopularService} category="design" />
      );
      expect(screen.queryByText("热门")).not.toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("renders link with correct href", () => {
      render(
        <ServiceCard service={mockService} category="design" />
      );
      const links = screen.getAllByTestId("service-link");
      // First link is the main card link
      expect(links[0]).toHaveAttribute("href", "/services/design/service-design-001");
    });

    it("renders consultation button", () => {
      render(
        <ServiceCard service={mockService} category="design" />
      );
      expect(screen.getByText("在线咨询")).toBeInTheDocument();
    });

    it("renders appointment button", () => {
      render(
        <ServiceCard service={mockService} category="design" />
      );
      expect(screen.getByText("预约")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("calls onConsult when consultation button is clicked", () => {
      const mockOnConsult = jest.fn();
      render(
        <ServiceCard
          service={mockService}
          category="design"
          onConsult={mockOnConsult}
        />
      );

      const consultButton = screen.getByText("在线咨询");
      fireEvent.click(consultButton);

      expect(mockOnConsult).toHaveBeenCalledWith(mockService);
    });

    it("does not call onConsult if not provided", () => {
      render(
        <ServiceCard service={mockService} category="design" />
      );

      const consultButton = screen.getByText("在线咨询");
      fireEvent.click(consultButton);

      // Should not throw error
      expect(consultButton).toBeInTheDocument();
    });

    it("renders appointment button with correct href", () => {
      render(
        <ServiceCard service={mockService} category="design" />
      );

      const appointmentButton = screen.getByText("预约");
      expect(appointmentButton.closest("a")).toHaveAttribute(
        "href",
        "/appointment?service=service-design-001"
      );
    });
  });

  describe("Feature Display", () => {
    it("displays only first 3 features by default", () => {
      const serviceWithManyFeatures = {
        ...mockService,
        features: ["特性1", "特性2", "特性3", "特性4", "特性5"],
      };

      render(
        <ServiceCard service={serviceWithManyFeatures} category="design" />
      );

      expect(screen.getByText("特性1")).toBeInTheDocument();
      expect(screen.getByText("特性2")).toBeInTheDocument();
      expect(screen.getByText("特性3")).toBeInTheDocument();
      expect(screen.getByText("+2 更多特性")).toBeInTheDocument();
    });

    it("displays all features if less than 3", () => {
      const serviceWithFewFeatures = {
        ...mockService,
        features: ["特性1", "特性2"],
      };

      render(
        <ServiceCard service={serviceWithFewFeatures} category="design" />
      );

      expect(screen.getByText("特性1")).toBeInTheDocument();
      expect(screen.getByText("特性2")).toBeInTheDocument();
      expect(screen.queryByText(/更多特性/)).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles service with minimum price range", () => {
      const minPriceService = {
        ...mockService,
        priceRange: { min: 0, max: 1000, unit: "CNY" },
      };

      render(
        <ServiceCard service={minPriceService} category="design" />
      );

      expect(screen.getByText(/¥0 - ¥1,000/)).toBeInTheDocument();
    });

    it("handles service with large price range", () => {
      const largePriceService = {
        ...mockService,
        priceRange: { min: 100000, max: 1000000, unit: "CNY" },
      };

      render(
        <ServiceCard service={largePriceService} category="design" />
      );

      expect(screen.getByText(/¥100,000 - ¥1,000,000/)).toBeInTheDocument();
    });

    it("renders with different categories", () => {
      const categories = ["design", "development", "startup"];

      categories.forEach((category) => {
        const { unmount } = render(
          <ServiceCard service={mockService} category={category} />
        );

        const links = screen.getAllByTestId("service-link");
        expect(links[0]).toHaveAttribute("href", `/services/${category}/${mockService.id}`);

        unmount();
      });
    });
  });

  describe("Accessibility", () => {
    it("renders semantic HTML structure", () => {
      const { container } = render(
        <ServiceCard service={mockService} category="design" />
      );

      const link = container.querySelector("a");
      expect(link).toBeInTheDocument();
    });

    it("has descriptive button text", () => {
      render(
        <ServiceCard service={mockService} category="design" />
      );

      expect(screen.getByText("在线咨询")).toBeInTheDocument();
      expect(screen.getByText("预约")).toBeInTheDocument();
    });
  });
});
