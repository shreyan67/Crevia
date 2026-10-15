import { describe, it, expect, beforeEach } from "vitest";
import { getCache, setCache, invalidateCache, invalidateDashboardCache, CACHE_KEYS } from "@/lib/redis";

describe("Redis & In-Memory Caching Layer", () => {
  beforeEach(async () => {
    await invalidateDashboardCache();
  });

  it("should return null for non-existent cache keys", async () => {
    const data = await getCache("non:existent:key");
    expect(data).toBeNull();
  });

  it("should store and retrieve data correctly", async () => {
    const summaryData = {
      todaysRevenue: 15400,
      pendingBakingCount: 3,
      readyOrdersCount: 2,
      totalOrdersCount: 15,
      recentOrders: [],
    };

    await setCache(CACHE_KEYS.ADMIN_DASHBOARD_SUMMARY, summaryData, 60);
    const cached = await getCache<typeof summaryData>(CACHE_KEYS.ADMIN_DASHBOARD_SUMMARY);

    expect(cached).not.toBeNull();
    expect(cached?.todaysRevenue).toBe(15400);
    expect(cached?.pendingBakingCount).toBe(3);
    expect(cached?.totalOrdersCount).toBe(15);
  });

  it("should explicitly invalidate cache when requested", async () => {
    const key = "test:order:summary";
    await setCache(key, { count: 42 }, 60);

    const before = await getCache<{ count: number }>(key);
    expect(before?.count).toBe(42);

    await invalidateCache(key);

    const after = await getCache(key);
    expect(after).toBeNull();
  });

  it("should invalidate the dashboard cache via invalidateDashboardCache", async () => {
    await setCache(CACHE_KEYS.ADMIN_DASHBOARD_SUMMARY, { test: true }, 60);
    expect(await getCache(CACHE_KEYS.ADMIN_DASHBOARD_SUMMARY)).not.toBeNull();

    await invalidateDashboardCache();
    expect(await getCache(CACHE_KEYS.ADMIN_DASHBOARD_SUMMARY)).toBeNull();
  });
});
