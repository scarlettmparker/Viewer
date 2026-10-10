const originalConsoleError = console.error;

/**
 * Only console error if inside component.
 */
export const suppressConsoleErrorsFromTests = () => {
  vi.spyOn(console, "error").mockImplementation((...args) => {
    const maybeError = args.find((arg) => arg instanceof Error);

    if (maybeError && typeof maybeError.stack === "string") {
      const stack = maybeError.stack;
      if (stack.includes("runTest")) {
        originalConsoleError(...args);
      }
    }
  });
};

export const restoreConsoleError = () => {
  vi.restoreAllMocks();
};
