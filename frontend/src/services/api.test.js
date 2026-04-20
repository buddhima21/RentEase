import { beforeEach, describe, expect, it, vi } from "vitest";

let requestInterceptor;

const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
        request: {
            use: vi.fn((fn) => {
                requestInterceptor = fn;
            }),
        },
    },
};

vi.mock("axios", () => ({
    default: {
        create: vi.fn(() => mockApi),
    },
}));

function createLocalStorageMock() {
    const store = new Map();
    return {
        getItem: (key) => (store.has(key) ? store.get(key) : null),
        setItem: (key, value) => store.set(key, String(value)),
        removeItem: (key) => store.delete(key),
        clear: () => store.clear(),
    };
}

global.localStorage = createLocalStorageMock();

const api = await import("./api.js");

describe("api request interceptor", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it("uses adminToken for admin endpoints", () => {
        localStorage.setItem("adminToken", "admin-token-123");

        const req = requestInterceptor({
            url: "/api/v1/admin/properties",
            headers: {},
        });

        expect(req.headers.Authorization).toBe("Bearer admin-token-123");
    });

    it("uses user.token for non-admin endpoints", () => {
        localStorage.setItem(
            "user",
            JSON.stringify({ id: "tenant-1", token: "tenant-token-abc" })
        );

        const req = requestInterceptor({
            url: "/api/v1/maintenance/tenant/tenant-1",
            headers: {},
        });

        expect(req.headers.Authorization).toBe("Bearer tenant-token-abc");
    });

    it("falls back to token when user object has no token", () => {
        localStorage.setItem("user", JSON.stringify({ id: "tenant-1" }));
        localStorage.setItem("token", "legacy-token-xyz");

        const req = requestInterceptor({
            url: "/api/v1/maintenance/admin/queue",
            headers: {},
        });

        expect(req.headers.Authorization).toBe("Bearer legacy-token-xyz");
    });
});

describe("maintenance API wrapper routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls admin queue endpoint with params", () => {
        const params = { status: "REPORTED", priority: "HIGH" };
        api.getAdminMaintenanceQueue(params);

        expect(mockApi.get).toHaveBeenCalledWith("/api/v1/maintenance/admin/queue", { params });
    });

    it("calls pause and resume endpoints", () => {
        api.pauseMaintenance("req-1");
        api.resumeMaintenance("req-1");

        expect(mockApi.patch).toHaveBeenCalledWith("/api/v1/maintenance/req-1/pause");
        expect(mockApi.patch).toHaveBeenCalledWith("/api/v1/maintenance/req-1/resume");
    });

    it("calls technician queue endpoint with status filter", () => {
        api.getTechnicianMaintenance("tech-1", "REPORTED");

        expect(mockApi.get).toHaveBeenCalledWith("/api/v1/maintenance/technician/tech-1", {
            params: { status: "REPORTED" },
        });
    });

    it("calls technician action endpoints for accept/start(alias)/resolve", () => {
        const payload = {
            completionSummary: "Issue fixed",
            technicianNotes: "Verified unit performance",
            completionImageUrls: ["https://img/after.jpg"],
        };

        api.acceptMaintenance("req-1");
        api.startMaintenance("req-1");
        api.resolveMaintenance("req-1", payload);

        expect(mockApi.patch).toHaveBeenCalledWith("/api/v1/maintenance/req-1/accept");
        expect(mockApi.patch).toHaveBeenCalledTimes(3);
        expect(mockApi.patch).toHaveBeenNthCalledWith(2, "/api/v1/maintenance/req-1/accept");
        expect(mockApi.patch).toHaveBeenCalledWith("/api/v1/maintenance/req-1/resolve", payload);
    });
});
