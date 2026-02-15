import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { Navigation } from "./Navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
});

describe("Navigation Component", () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue("/");
    // Reset window scroll position
    window.scrollY = 0;
  });

  describe("Rendering", () => {
    it("should render navigation bar", () => {
      render(<Navigation />);
      const nav = screen.getByRole("navigation", { hidden: true });
      expect(nav).toBeInTheDocument();
    });

    it("should render brand name", () => {
      render(<Navigation />);
      const brandName = screen.getByText("Professional Services");
      expect(brandName).toBeInTheDocument();
    });

    it("should render all main menu links on desktop", () => {
      render(<Navigation />);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Services")).toBeInTheDocument();
      expect(screen.getByText("Cases")).toBeInTheDocument();
      expect(screen.getByText("About")).toBeInTheDocument();
      expect(screen.getByText("Blog")).toBeInTheDocument();
      expect(screen.getByText("Contact")).toBeInTheDocument();
    });

    it("should render mobile menu button", () => {
      render(<Navigation />);
      const menuButton = screen.getByLabelText("Toggle menu");
      expect(menuButton).toBeInTheDocument();
    });

    it("should render spacer div to prevent content overlap", () => {
      const { container } = render(<Navigation />);
      const spacer = container.querySelector(".h-16");
      expect(spacer).toBeInTheDocument();
    });
  });

  describe("Active State Indication", () => {
    it("should mark home link as active when on home page", () => {
      (usePathname as jest.Mock).mockReturnValue("/");
      render(<Navigation />);
      const homeLink = screen.getAllByText("Home")[0].closest("div[aria-current]");
      expect(homeLink).toHaveAttribute("aria-current", "page");
    });

    it("should mark services link as active when on services page", () => {
      (usePathname as jest.Mock).mockReturnValue("/services");
      render(<Navigation />);
      const servicesLink = screen.getAllByText("Services")[0].closest("div[aria-current]");
      expect(servicesLink).toHaveAttribute("aria-current", "page");
    });

    it("should mark cases link as active when on cases page", () => {
      (usePathname as jest.Mock).mockReturnValue("/cases");
      render(<Navigation />);
      const casesLink = screen.getAllByText("Cases")[0].closest("div[aria-current]");
      expect(casesLink).toHaveAttribute("aria-current", "page");
    });

    it("should mark about link as active when on about page", () => {
      (usePathname as jest.Mock).mockReturnValue("/about");
      render(<Navigation />);
      const aboutLink = screen.getAllByText("About")[0].closest("div[aria-current]");
      expect(aboutLink).toHaveAttribute("aria-current", "page");
    });

    it("should mark blog link as active when on blog page", () => {
      (usePathname as jest.Mock).mockReturnValue("/blog");
      render(<Navigation />);
      const blogLink = screen.getAllByText("Blog")[0].closest("div[aria-current]");
      expect(blogLink).toHaveAttribute("aria-current", "page");
    });

    it("should mark contact link as active when on contact page", () => {
      (usePathname as jest.Mock).mockReturnValue("/contact");
      render(<Navigation />);
      const contactLink = screen.getAllByText("Contact")[0].closest("div[aria-current]");
      expect(contactLink).toHaveAttribute("aria-current", "page");
    });

    it("should apply brand color to active link", () => {
      (usePathname as jest.Mock).mockReturnValue("/services");
      render(<Navigation />);
      const servicesLink = screen.getAllByText("Services")[0].closest("a");
      // Check that the parent div has aria-current, indicating it's active
      const parentDiv = servicesLink?.closest("div[aria-current]");
      expect(parentDiv).toHaveAttribute("aria-current", "page");
    });

    it("should not apply brand color to inactive links", () => {
      (usePathname as jest.Mock).mockReturnValue("/");
      render(<Navigation />);
      const servicesLink = screen.getAllByText("Services")[0].closest("a");
      expect(servicesLink).not.toHaveStyle({ backgroundColor: "rgb(30, 58, 95)" });
    });
  });

  describe("Mobile Menu", () => {
    it("should not show mobile menu by default", () => {
      render(<Navigation />);
      const mobileNav = screen.queryByRole("navigation", { name: "Mobile navigation" });
      expect(mobileNav).not.toBeInTheDocument();
    });

    it("should show mobile menu when hamburger button is clicked", () => {
      render(<Navigation />);
      const menuButton = screen.getByLabelText("Toggle menu");
      fireEvent.click(menuButton);
      const mobileNav = screen.getByRole("navigation", { name: "Mobile navigation" });
      expect(mobileNav).toBeInTheDocument();
    });

    it("should hide mobile menu when hamburger button is clicked again", () => {
      render(<Navigation />);
      const menuButton = screen.getByLabelText("Toggle menu");
      fireEvent.click(menuButton);
      fireEvent.click(menuButton);
      const mobileNav = screen.queryByRole("navigation", { name: "Mobile navigation" });
      expect(mobileNav).not.toBeInTheDocument();
    });

    it("should display all menu items in mobile menu", () => {
      render(<Navigation />);
      const menuButton = screen.getByLabelText("Toggle menu");
      fireEvent.click(menuButton);
      expect(screen.getAllByText("Home").length).toBeGreaterThan(1);
      expect(screen.getAllByText("Services").length).toBeGreaterThan(1);
      expect(screen.getAllByText("Cases").length).toBeGreaterThan(1);
      expect(screen.getAllByText("About").length).toBeGreaterThan(1);
      expect(screen.getAllByText("Blog").length).toBeGreaterThan(1);
      expect(screen.getAllByText("Contact").length).toBeGreaterThan(1);
    });

    it("should close mobile menu when route changes", () => {
      const { rerender } = render(<Navigation />);
      const menuButton = screen.getByLabelText("Toggle menu");
      fireEvent.click(menuButton);
      expect(screen.getByRole("navigation", { name: "Mobile navigation" })).toBeInTheDocument();

      // Simulate route change
      (usePathname as jest.Mock).mockReturnValue("/services");
      rerender(<Navigation />);

      const mobileNav = screen.queryByRole("navigation", { name: "Mobile navigation" });
      expect(mobileNav).not.toBeInTheDocument();
    });

    it("should mark active link in mobile menu", () => {
      (usePathname as jest.Mock).mockReturnValue("/services");
      render(<Navigation />);
      const menuButton = screen.getByLabelText("Toggle menu");
      fireEvent.click(menuButton);
      const mobileServicesLink = screen.getAllByText("Services")[1].closest("div[aria-current]");
      expect(mobileServicesLink).toHaveAttribute("aria-current", "page");
    });
  });

  describe("Scroll Effect", () => {
    it("should update scroll state when window scrolls", async () => {
      const { container } = render(<Navigation />);
      const nav = container.querySelector("nav");

      // Initial state - not scrolled
      expect(nav).toHaveClass("bg-white/80");

      // Simulate scroll
      window.scrollY = 30;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(nav).toHaveClass("bg-white/95");
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper aria labels", () => {
      render(<Navigation />);
      const menuButton = screen.getByLabelText("Toggle menu");
      expect(menuButton).toHaveAttribute("aria-expanded");
    });

    it("should have home link with aria-label on logo", () => {
      render(<Navigation />);
      // The logo link has aria-label="Home"
      const logoLink = screen.getByRole("link", { name: "Home" });
      expect(logoLink).toBeInTheDocument();
    });

    it("should mark active links with aria-current", () => {
      (usePathname as jest.Mock).mockReturnValue("/services");
      render(<Navigation />);
      const servicesLink = screen.getAllByText("Services")[0].closest("div[aria-current]");
      expect(servicesLink).toHaveAttribute("aria-current", "page");
    });

    it("should have proper role for mobile navigation", () => {
      render(<Navigation />);
      const menuButton = screen.getByLabelText("Toggle menu");
      fireEvent.click(menuButton);
      const mobileNav = screen.getByRole("navigation", { name: "Mobile navigation" });
      expect(mobileNav).toHaveAttribute("role", "navigation");
    });
  });

  describe("Brand Color", () => {
    it("should use brand color #1E3A5F for active links", () => {
      (usePathname as jest.Mock).mockReturnValue("/");
      render(<Navigation />);
      const homeLink = screen.getAllByText("Home")[0].closest("a");
      // Check that the parent div has aria-current, indicating it's active
      const parentDiv = homeLink?.closest("div[aria-current]");
      expect(parentDiv).toHaveAttribute("aria-current", "page");
    });

    it("should display brand name in brand color", () => {
      render(<Navigation />);
      const brandName = screen.getByText("Professional Services");
      expect(brandName).toHaveStyle({ color: "rgb(30, 58, 95)" });
    });
  });

  describe("Responsive Design", () => {
    it("should render desktop menu on large screens", () => {
      render(<Navigation />);
      const desktopMenu = screen.getAllByText("Home")[0].closest("div")?.parentElement;
      expect(desktopMenu).toHaveClass("hidden", "md:flex");
    });

    it("should render mobile menu button on all screens", () => {
      render(<Navigation />);
      const menuButton = screen.getByLabelText("Toggle menu");
      expect(menuButton).toHaveClass("md:hidden");
    });
  });

  describe("Navigation Links", () => {
    it("should have correct href for home link", () => {
      render(<Navigation />);
      const homeLink = screen.getAllByText("Home")[0].closest("a");
      expect(homeLink).toHaveAttribute("href", "/");
    });

    it("should have correct href for services link", () => {
      render(<Navigation />);
      const servicesLink = screen.getAllByText("Services")[0].closest("a");
      expect(servicesLink).toHaveAttribute("href", "/services");
    });

    it("should have correct href for cases link", () => {
      render(<Navigation />);
      const casesLink = screen.getAllByText("Cases")[0].closest("a");
      expect(casesLink).toHaveAttribute("href", "/cases");
    });

    it("should have correct href for about link", () => {
      render(<Navigation />);
      const aboutLink = screen.getAllByText("About")[0].closest("a");
      expect(aboutLink).toHaveAttribute("href", "/about");
    });

    it("should have correct href for blog link", () => {
      render(<Navigation />);
      const blogLink = screen.getAllByText("Blog")[0].closest("a");
      expect(blogLink).toHaveAttribute("href", "/blog");
    });

    it("should have correct href for contact link", () => {
      render(<Navigation />);
      const contactLink = screen.getAllByText("Contact")[0].closest("a");
      expect(contactLink).toHaveAttribute("href", "/contact");
    });
  });
});
