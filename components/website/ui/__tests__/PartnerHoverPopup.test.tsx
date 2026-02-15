import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PartnerHoverPopup } from "../PartnerHoverPopup";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockPartner = {
  name: "Test Partner Inc.",
  nameZh: "测试合作伙伴公司",
  industry: "Technology",
  industryZh: "科技",
  location: "San Francisco, USA",
  locationZh: "美国旧金山",
  partnerSince: "2020",
  employees: "1,000+",
  revenue: "$100M",
  rating: 4.8,
  description: "A leading technology company specializing in innovative solutions.",
  descriptionZh: "一家专注于创新解决方案的领先技术公司。",
};

describe("PartnerHoverPopup", () => {
  it("renders children correctly", () => {
    render(
      <PartnerHoverPopup partner={mockPartner} locale="en">
        <div>Test Card</div>
      </PartnerHoverPopup>
    );

    expect(screen.getByText("Test Card")).toBeInTheDocument();
  });

  it("shows popup on hover with English content", async () => {
    const user = userEvent.setup();
    
    render(
      <PartnerHoverPopup partner={mockPartner} locale="en">
        <div>Hover Me</div>
      </PartnerHoverPopup>
    );

    const trigger = screen.getByText("Hover Me");
    await user.hover(trigger);

    await waitFor(() => {
      expect(screen.getByText("Test Partner Inc.")).toBeInTheDocument();
      expect(screen.getByText("Technology")).toBeInTheDocument();
      expect(screen.getByText("San Francisco, USA")).toBeInTheDocument();
      expect(screen.getByText(/Partner since 2020/)).toBeInTheDocument();
      expect(screen.getByText(/1,000\+ employees/)).toBeInTheDocument();
      expect(screen.getByText(/\$100M revenue/)).toBeInTheDocument();
      expect(screen.getByText("4.8")).toBeInTheDocument();
    });
  });

  it("shows popup on hover with Chinese content", async () => {
    const user = userEvent.setup();
    
    render(
      <PartnerHoverPopup partner={mockPartner} locale="zh">
        <div>Hover Me</div>
      </PartnerHoverPopup>
    );

    const trigger = screen.getByText("Hover Me");
    await user.hover(trigger);

    await waitFor(() => {
      expect(screen.getByText("测试合作伙伴公司")).toBeInTheDocument();
      expect(screen.getByText("科技")).toBeInTheDocument();
      expect(screen.getByText("美国旧金山")).toBeInTheDocument();
      expect(screen.getByText(/合作始于 2020/)).toBeInTheDocument();
      expect(screen.getByText(/1,000\+ 员工/)).toBeInTheDocument();
      expect(screen.getByText(/\$100M 营收/)).toBeInTheDocument();
    });
  });

  it("hides popup on mouse leave", async () => {
    const user = userEvent.setup();
    
    render(
      <PartnerHoverPopup partner={mockPartner} locale="en">
        <div>Hover Me</div>
      </PartnerHoverPopup>
    );

    const trigger = screen.getByText("Hover Me");
    
    // Hover to show popup
    await user.hover(trigger);
    await waitFor(() => {
      expect(screen.getByText("Test Partner Inc.")).toBeInTheDocument();
    });

    // Unhover to hide popup
    await user.unhover(trigger);
    await waitFor(() => {
      expect(screen.queryByText("Test Partner Inc.")).not.toBeInTheDocument();
    });
  });

  it("displays rating with star icon", async () => {
    const user = userEvent.setup();
    
    render(
      <PartnerHoverPopup partner={mockPartner} locale="en">
        <div>Hover Me</div>
      </PartnerHoverPopup>
    );

    await user.hover(screen.getByText("Hover Me"));

    await waitFor(() => {
      expect(screen.getByText("4.8")).toBeInTheDocument();
    });
  });

  it("displays description with line clamp", async () => {
    const user = userEvent.setup();
    
    render(
      <PartnerHoverPopup partner={mockPartner} locale="en">
        <div>Hover Me</div>
      </PartnerHoverPopup>
    );

    await user.hover(screen.getByText("Hover Me"));

    await waitFor(() => {
      const description = screen.getByText(/A leading technology company/);
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass("line-clamp-3");
    });
  });

  it("shows click hint text", async () => {
    const user = userEvent.setup();
    
    render(
      <PartnerHoverPopup partner={mockPartner} locale="en">
        <div>Hover Me</div>
      </PartnerHoverPopup>
    );

    await user.hover(screen.getByText("Hover Me"));

    await waitFor(() => {
      expect(screen.getByText("Click for full details")).toBeInTheDocument();
    });
  });

  it("applies glass effect styling to popup", async () => {
    const user = userEvent.setup();
    
    render(
      <PartnerHoverPopup partner={mockPartner} locale="en">
        <div>Hover Me</div>
      </PartnerHoverPopup>
    );

    await user.hover(screen.getByText("Hover Me"));

    await waitFor(() => {
      const popup = screen.getByText("Test Partner Inc.").closest(".glass-medium");
      expect(popup).toBeInTheDocument();
    });
  });

  it("handles edge case with empty description", async () => {
    const user = userEvent.setup();
    const partnerWithoutDesc = { ...mockPartner, description: "", descriptionZh: "" };
    
    render(
      <PartnerHoverPopup partner={partnerWithoutDesc} locale="en">
        <div>Hover Me</div>
      </PartnerHoverPopup>
    );

    await user.hover(screen.getByText("Hover Me"));

    await waitFor(() => {
      expect(screen.getByText("Test Partner Inc.")).toBeInTheDocument();
    });
  });

  it("handles very long partner names gracefully", async () => {
    const user = userEvent.setup();
    const partnerWithLongName = {
      ...mockPartner,
      name: "Very Long Partner Name That Should Be Displayed Properly In The Popup Component",
      nameZh: "非常长的合作伙伴名称应该在弹出组件中正确显示",
    };
    
    render(
      <PartnerHoverPopup partner={partnerWithLongName} locale="en">
        <div>Hover Me</div>
      </PartnerHoverPopup>
    );

    await user.hover(screen.getByText("Hover Me"));

    await waitFor(() => {
      expect(screen.getByText(/Very Long Partner Name/)).toBeInTheDocument();
    });
  });
});
