"use client";
import {
  Meter as AriaMeter,
  type MeterProps as AriaMeterProps,
} from "react-aria-components/Meter";
import type { CSSProperties } from "react";
import { Label } from "./Form";
import "./Meter.scss";

export interface MeterProps extends AriaMeterProps {
  label?: string;
}

export function Meter({ label, ...props }: MeterProps) {
  return (
    <AriaMeter {...props}>
      {({ percentage, valueText }) => (
        <>
          <Label>{label}</Label>
          <span className="value">{valueText}</span>
          <div className="track inset">
            <div
              className="fill"
              style={
                {
                  width: percentage + "%",
                  "--fill-color":
                    percentage < 70
                      ? "var(--green)"
                      : percentage < 90
                        ? "var(--orange)"
                        : "var(--red)",
                } as CSSProperties
              }
            />
          </div>
        </>
      )}
    </AriaMeter>
  );
}
