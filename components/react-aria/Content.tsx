"use client";

import {
  Heading as AriaHeading,
  type HeadingProps,
} from "react-aria-components/Heading";
import { Text as AriaText, type TextProps } from "react-aria-components/Text";
import "./Content.scss";
import type { Ref } from "react";

export function Heading(props: HeadingProps) {
  return <AriaHeading {...props} />;
}

export function Text(props: TextProps & { ref?: Ref<HTMLElement> }) {
  return <AriaText {...props} />;
}
