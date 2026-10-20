import React from "react";
import { vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BookingPage from "./pages/BookingPage";
import Login from "./pages/LoginPage";

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const originalFetch = global.fetch;

beforeEach(() => {
  localStorage.clear();
  global.fetch = vi.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
});

test("pay-later booking opens the booking history route", async () => {
  global.fetch
    .mockResolvedValueOnce(jsonResponse({
      name: "Test Plumber",
      profession: "Plumbing",
      services: [{ id: 4, services: "Pipe repair", description: "Local test", price: "150.00" }],
    }))
    .mockResolvedValueOnce(jsonResponse({ id: 12, status: "pending" }, 201));

  const { container } = render(
    <MemoryRouter initialEntries={["/booking/7"]}>
      <Routes>
        <Route path="/booking/:workerId" element={<BookingPage />} />
        <Route path="/booking/details" element={<h1>Booking history page</h1>} />
      </Routes>
    </MemoryRouter>
  );

  fireEvent.click(await screen.findByRole("button", { name: /Pipe repair/i }));
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  fireEvent.change(container.querySelector('input[type="date"]'), { target: { value: tomorrow } });
  fireEvent.change(container.querySelector('input[type="time"]'), { target: { value: "10:00" } });
  fireEvent.click(screen.getByRole("button", { name: "Confirm Booking" }));
  fireEvent.click(screen.getByRole("button", { name: /Pay Later/i }));

  expect(await screen.findByRole("heading", { name: "Booking history page" })).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledTimes(2);
  expect(JSON.parse(global.fetch.mock.calls[1][1].body)).toMatchObject({
    service_id: 4,
    date: tomorrow,
    time: "10:00",
    payment_mode: "later",
  });
});

test("worker login stores tokens and opens the worker dashboard", async () => {
  global.fetch.mockResolvedValueOnce(jsonResponse({
    access: "test-access",
    refresh: "test-refresh",
    role: "worker",
    username: "test-worker",
  }));

  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/worker/dashboard" element={<h1>Worker dashboard page</h1>} />
      </Routes>
    </MemoryRouter>
  );

  fireEvent.change(screen.getByPlaceholderText("Enter your username"), { target: { value: "test-worker" } });
  fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "password" } });
  fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

  expect(await screen.findByRole("heading", { name: "Worker dashboard page" })).toBeInTheDocument();
  expect(localStorage.getItem("access")).toBe("test-access");
  expect(JSON.parse(localStorage.getItem("user"))).toMatchObject({ username: "test-worker", role: "worker" });
});

test("login shows the backend error for invalid credentials", async () => {
  global.fetch.mockResolvedValueOnce(jsonResponse({ detail: "Invalid Credentials" }, 401));

  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    </MemoryRouter>
  );

  fireEvent.change(screen.getByPlaceholderText("Enter your username"), { target: { value: "test-worker" } });
  fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "wrong" } });
  fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

  expect(await screen.findByText("Invalid Credentials")).toBeInTheDocument();
  await waitFor(() => expect(localStorage.getItem("access")).toBeNull());
});
