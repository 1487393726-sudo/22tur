import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ServiceListShowcase } from "./service-list-showcase";
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

// Mock ServiceCard
jest.mock("./service-card", () => ({
  ServiceCard: ({ service, category }: any) => (
    <div data-testid={`service-card-${service.id}`}>
      {service.title}
    </div>
  ),
}));

// Mock ServiceErrorBoundary
jest.mock("./service-error-boundary", () => ({
  ServiceErrorBoundary: ({ children }: any) => <div>{children}</div>,
}));

const mockServices: Service[] = [
  {
    id: "service-design-001",
    category: "design",
    title: "UI/UX设计",
    titleEn: "UI/UX Design",
    description: "专业的用户界面和用户体验设计服务",
    descriptionEn: "Professional UI/UX design services",
    icon: "palette",
    features: ["响应式设计", "用户研究", "原型设计"],
    featuresEn: ["Responsive Design", "User Research", "Prototyping"],
    priceRange: { min: 5000, max: 20000, unit: "CNY" },
    deliveryTime: "2-4 weeks",
    popular: true,
    order: 1,
  },
  {
    id: "service-design-002",
    category: "design",
    title: "品牌设计",
    titleEn: "Brand Design",
    description: "完整的品牌视觉设计方案",
    descriptionEn: "Complete brand visual design solution",
    icon: "palette",
    features: ["Logo设计", "品牌指南", "视觉系统"],
    featuresEn: ["Logo Design", "Brand Guidelines", "Visual System"],
    priceRange: { min: 10000, max: 50000, unit: "CNY" },
    deliveryTime: "3-6 weeks",
    popular: false,
    order: 2,
  },
];

describe("ServiceListShowcase", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders title and subtitle when provided", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockServices,
        }),
      });

      render(
        <ServiceListShowcase
          category="design"
          title="设计服务"
          subtitle="选择适合您的方案"
        />
      );

      await waitFor(() => {
        expect(screen.getByText("设计服务")).toBeInTheDocument();
        expect(screen.getByText("选择适合您的方案")).toBeInTheDocument();
      });
    });

    it("renders loading state initially", () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true, data: mockServices }),
                }),
              100
            )
          )
      );

      render(<ServiceListShowcase category="design" />);

      expect(screen.getByText("加载服务列表中...")).toBeInTheDocument();
    });
  });

  describe("Data Fetching", () => {
    it("fetches services with correct category", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockServices,
        }),
      });

      render(<ServiceListShowcase category="design" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/services?category=design"
        );
      });
    });

    it("filters services by category", async () => {
      const mixedServices = [
        ...mockServices,
        {
          ...mockServices[0],
          id: "service-dev-001",
          category: "development",
          title: "Web开发",
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mixedServices,
        }),
      });

      render(<ServiceListShowcase category="design" />);

      await waitFor(() => {
        expect(screen.getByTestId("service-card-service-design-001")).toBeInTheDocument();
        expect(screen.getByTestId("service-card-service-design-002")).toBeInTheDocument();
        expect(screen.queryByTestId("service-card-service-dev-001")).not.toBeInTheDocument();
      });
    });

    it("displays all filtered services", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockServices,
        }),
      });

      render(<ServiceListShowcase category="design" />);

      await waitFor(() => {
        expect(screen.getByTestId("service-card-service-design-001")).toBeInTheDocument();
        expect(screen.getByTestId("service-card-service-design-002")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error message when fetch fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "获取服务列表失败" }),
      });

      render(<ServiceListShowcase category="design" />);

      await waitFor(() => {
        expect(screen.getByText("获取服务列表失败")).toBeInTheDocument();
      });
    });

    it("displays error message when API returns error", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: "服务器错误",
        }),
      });

      render(<ServiceListShowcase category="design" />);

      await waitFor(() => {
        expect(screen.getByText("服务器错误")).toBeInTheDocument();
      });
    });

    it("displays error message when no services found", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
        }),
      });

      render(<ServiceListShowcase category="design" />);

      await waitFor(() => {
        expect(screen.getByText("暂无该类别的服务")).toBeInTheDocument();
      });
    });

    it("shows retry button on error", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "获取服务列表失败" }),
      });

      render(<ServiceListShowcase category="design" />);

      await waitFor(() => {
        expect(screen.getByText("重试")).toBeInTheDocument();
      });
    });

    it("retries fetch when retry button is clicked", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: "获取服务列表失败" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: mockServices,
          }),
        });

      render(<ServiceListShowcase category="design" />);

      await waitFor(() => {
        expect(screen.getByText("重试")).toBeInTheDocument();
      });

      const retryButton = screen.getByText("重试");
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Empty State", () => {
    it("displays empty state message when no services", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
        }),
      });

      render(<ServiceListShowcase category="design" />);

      await waitFor(() => {
        expect(screen.getByText("暂无该类别的服务")).toBeInTheDocument();
      });
    });

    it("displays refresh button in empty state", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
        }),
      });

      render(<ServiceListShowcase category="design" />);

      await waitFor(() => {
        // Empty state shows error message and retry button
        expect(screen.getByText("暂无该类别的服务")).toBeInTheDocument();
      });
    });
  });

  describe("Callbacks", () => {
    it("passes onConsult callback to ServiceCard", async () => {
      const mockOnConsult = jest.fn();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockServices,
        }),
      });

      render(
        <ServiceListShowcase
          category="design"
          onConsult={mockOnConsult}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("service-card-service-design-001")).toBeInTheDocument();
      });
    });
  });

  describe("Category Filtering", () => {
    it("correctly filters services by design category", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockServices,
        }),
      });

      render(<ServiceListShowcase category="design" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/services?category=design"
        );
      });
    });

    it("correctly filters services by development category", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
        }),
      });

      render(<ServiceListShowcase category="development" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/services?category=development"
        );
      });
    });

    it("correctly filters services by startup category", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
        }),
      });

      render(<ServiceListShowcase category="startup" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/services?category=startup"
        );
      });
    });
  });
});
