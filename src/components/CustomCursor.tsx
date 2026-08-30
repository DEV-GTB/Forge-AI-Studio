import React from "react";
import { UserPreferences } from "../types";

interface CustomCursorProps {
  preferences?: UserPreferences;
  isAiGenerating?: boolean;
}

export default function CustomCursor(_props: CustomCursorProps) {
  // Cursor tracer removed as requested by the user. Native browser cursor is preserved.
  return null;
}
