import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import ProtectedRoleRoute from "./ProtectedRoleRoute";

let mockAuthUser = null;

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: mockAuthUser }),
}));

function renderRoleRoute(roles = ["TENANT"], fallback = "/login") {
  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route element={<ProtectedRoleRoute roles={roles} fallback={fallback} />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

function renderAdminRoute() {
  return render(
    <MemoryRouter initialEntries={["/admin/protected"]}>
      <Routes>
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin/protected" element={<div>Admin Content</div>} />
        </Route>
        <Route path="/admin/login" element={<div>Admin Login</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoleRoute", () => {
  beforeEach(() => {
    localStorage.clear();
    mockAuthUser = null;
  });

  it("redirects to fallback when no user is available", () => {
    renderRoleRoute(["TENANT"], "/login");

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("allows access when role matches", () => {
    mockAuthUser = { id: "tenant-1", role: "TENANT" };

    renderRoleRoute(["TENANT"]);

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects when role does not match allowed roles", () => {
    mockAuthUser = { id: "tech-1", role: "TECHNICIAN" };

    renderRoleRoute(["TENANT"]);

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("falls back when localStorage user payload is corrupted", () => {
    localStorage.setItem("user", "{bad-json}");

    renderRoleRoute(["TENANT"]);

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});

describe("ProtectedAdminRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("redirects when admin token is missing", () => {
    localStorage.setItem("adminUser", JSON.stringify({ id: "a1", role: "ADMIN" }));

    renderAdminRoute();

    expect(screen.getByText("Admin Login")).toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("redirects when admin user role is not ADMIN", () => {
    localStorage.setItem("adminToken", "token");
    localStorage.setItem("adminUser", JSON.stringify({ id: "u1", role: "TENANT" }));

    renderAdminRoute();

    expect(screen.getByText("Admin Login")).toBeInTheDocument();
  });

  it("redirects when admin user JSON is malformed", () => {
    localStorage.setItem("adminToken", "token");
    localStorage.setItem("adminUser", "{broken-json}");

    renderAdminRoute();

    expect(screen.getByText("Admin Login")).toBeInTheDocument();
  });

  it("allows access when admin token and role are valid", () => {
    localStorage.setItem("adminToken", "token");
    localStorage.setItem("adminUser", JSON.stringify({ id: "a1", role: "ADMIN" }));

    renderAdminRoute();

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });
});
