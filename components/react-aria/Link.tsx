"use client";
import { Link as RACLink, type LinkProps } from "react-aria-components/Link";
import NextLink from "next/link";
import "./Link.scss";

export function Link(props: LinkProps) {
  return (
    <RACLink
      {...props}
      render={(linkProps) =>
        "href" in linkProps ? (
          <NextLink {...linkProps} />
        ) : (
          <span {...linkProps} />
        )
      }
    />
  );
}
