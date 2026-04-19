jest.mock("../src/services/analyticsService", () => ({
  getAccuracySnapshot: jest.fn(),
  getProgressSummary: jest.fn(),
  getWeakTopics: jest.fn(),
}));

const {
  getAccuracySnapshot,
  getProgressSummary,
  getWeakTopics,
} = require("../src/services/analyticsService");
const { buildRecommendations } = require("../src/services/recommendationService");

describe("buildRecommendations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("builds readiness score, label, and prioritized next topics", async () => {
    getWeakTopics.mockResolvedValue([
      { topic: "Graphs", accuracy: 45, total: 6 },
      { topic: "OS Scheduling", accuracy: 55, total: 4 },
      { topic: "Normalization", accuracy: 60, total: 3 },
      { topic: "TCP", accuracy: 62, total: 3 },
    ]);
    getProgressSummary.mockResolvedValue({ overallPercent: 80, dailyChecklistUpdated: true });
    getAccuracySnapshot.mockResolvedValue({ overallAccuracy: 85 });

    const result = await buildRecommendations({ _id: "user-1", streak: 5 });

    expect(result.readinessScore).toBe(90);
    expect(result.readinessLabel).toBe("Interview ready");
    expect(result.nextTopics).toHaveLength(3);
    expect(result.nextTopics[0].topic).toBe("Graphs");
    expect(result.suggestions).toContain("Adaptive mode tip: attempt your next test with adaptive=true to focus on weak topics.");
  });

  it("adds starter suggestion when weak topics are unavailable", async () => {
    getWeakTopics.mockResolvedValue([]);
    getProgressSummary.mockResolvedValue({ overallPercent: 20, dailyChecklistUpdated: false });
    getAccuracySnapshot.mockResolvedValue({ overallAccuracy: 30 });

    const result = await buildRecommendations({ _id: "user-2", streak: 1 });

    expect(result.readinessLabel).toBe("Needs revision");
    expect(result.nextTopics).toEqual([]);
    expect(result.suggestions).toContain(
      "No weak topics identified yet. Attempt a subject test to unlock smart suggestions."
    );
    expect(result.suggestions).toContain(
      "Build momentum: complete at least one checklist item daily to improve your streak."
    );
  });
});
