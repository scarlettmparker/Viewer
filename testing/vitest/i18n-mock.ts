const mocks = vi.hoisted(() => ({
  mockT: vi.fn((key: string) => key),
}));

export const mockT = mocks.mockT;

export const useTranslation = vi.fn(() => ({
  t: mocks.mockT,
}));

vi.mock("i18next", () => ({
  createInstance: vi.fn(() => ({
    use: vi.fn().mockReturnThis(),
    init: vi.fn(),
  })),
  use: vi.fn().mockReturnThis(),
  init: vi.fn(),
}));

vi.mock("@sun/i18n", () => ({
  useTranslation,
  setI18n: vi.fn(),
  getI18n: vi.fn(() => null),
}));
