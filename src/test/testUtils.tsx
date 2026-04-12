import type { ReactElement } from "react";
import { fireEvent, render as rtlRender, screen, waitFor, type RenderOptions } from "@testing-library/react";

import { TestProviders } from "./TestProviders";

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => rtlRender(ui, { wrapper: TestProviders, ...options });

export { fireEvent, screen, waitFor };
export { customRender as render };
