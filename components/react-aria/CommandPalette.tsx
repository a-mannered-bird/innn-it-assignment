"use client";
import {
  Autocomplete as AriaAutocomplete,
  type AutocompleteProps as AriaAutocompleteProps,
  useFilter,
} from "react-aria-components/Autocomplete";
import { type MenuProps as AriaMenuProps } from "react-aria-components/Menu";
import { Dialog } from "react-aria-components/Dialog";
import { Menu } from "./Menu";
import { SearchField } from "./SearchField";
import { Modal } from "./Modal";
import { useEffect } from "react";
import "./CommandPalette.scss";

export interface CommandPaletteProps<T>
  extends Omit<AriaAutocompleteProps, "children">, AriaMenuProps<T> {
  isOpen: boolean;
  onOpenChange: (isOpen?: boolean) => void;
}

export function CommandPalette<T>(props: CommandPaletteProps<T>) {
  const { isOpen, onOpenChange } = props;
  const { contains } = useFilter({ sensitivity: "base" });

  useEffect(() => {
    const isMacUA = /mac(os|intosh)/i.test(navigator.userAgent);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "j" && (isMacUA ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  return (
    <Modal isDismissable isOpen={isOpen} onOpenChange={onOpenChange}>
      <Dialog className="command-palette-dialog">
        <AriaAutocomplete filter={contains} {...props}>
          <SearchField
            // The rule guards against focus jumping without user action, e.g. on
            // page load. This is a modal dialog the user just opened, where the
            // APG dialog pattern requires focus to move inside on open, and a
            // command palette exists to be typed into. Without it, focus lands on
            // the dialog container and the user has to tab before searching.
            // https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            aria-label="Search commands"
            placeholder="Search commands"
          />
          <Menu {...props} renderEmptyState={() => "No results found."} />
        </AriaAutocomplete>
      </Dialog>
    </Modal>
  );
}
