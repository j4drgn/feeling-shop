import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import QuickAccessButton from "../QuickAccessButton";
import { ShoppingBag } from "lucide-react";

describe("QuickAccessButton", () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  test("renders with default props", () => {
    render(
      <QuickAccessButton
        icon={<ShoppingBag data-testid="icon" />}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  test("applies correct position class", () => {
    const { rerender } = render(
      <QuickAccessButton
        icon={<ShoppingBag />}
        onClick={mockOnClick}
        position="top-left"
      />
    );

    const container = screen.getByRole("button").parentElement;
    expect(container.className).toContain("top-4");
    expect(container.className).toContain("left-4");

    rerender(
      <QuickAccessButton
        icon={<ShoppingBag />}
        onClick={mockOnClick}
        position="bottom-right"
      />
    );

    expect(container.className).toContain("bottom-4");
    expect(container.className).toContain("right-4");
  });

  test("applies correct size class", () => {
    const { rerender } = render(
      <QuickAccessButton
        icon={<ShoppingBag />}
        onClick={mockOnClick}
        size="sm"
      />
    );

    let button = screen.getByRole("button");
    expect(button.className).toContain("w-10 h-10");

    rerender(
      <QuickAccessButton
        icon={<ShoppingBag />}
        onClick={mockOnClick}
        size="lg"
      />
    );

    button = screen.getByRole("button");
    expect(button.className).toContain("w-14 h-14");
  });

  test("calls onClick handler when clicked", () => {
    render(<QuickAccessButton icon={<ShoppingBag />} onClick={mockOnClick} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test("shows label when showLabel is true", () => {
    render(
      <QuickAccessButton
        icon={<ShoppingBag />}
        label="Test Label"
        onClick={mockOnClick}
        showLabel={true}
      />
    );

    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  test("does not show label when showLabel is false", () => {
    render(
      <QuickAccessButton
        icon={<ShoppingBag />}
        label="Test Label"
        onClick={mockOnClick}
        showLabel={false}
      />
    );

    expect(screen.queryByText("Test Label")).not.toBeInTheDocument();
  });
});
