"use client";

import { X } from "lucide-react";
import { Modal } from "@/components/react-aria/Modal";
import { Dialog, Heading } from "@/components/react-aria/Dialog";
import { Button } from "@/components/react-aria/Button";
import { PetitionUpdateForm } from "./petition-update-form";
import styles from "./petition-update.module.scss";

/**
 * The brief pins this modal open: no outside click, Escape press or button
 * inside may close it, hence the controlled `isOpen` with no `onOpenChange`.
 * Note: an a11y optimized modal should be dismissable with the escape key and the close and x buttons.
 */
export function PetitionUpdateModal() {
  return (
    <Modal isOpen isDismissable={false} isKeyboardDismissDisabled>
      <Dialog>
        <div className={styles.titleRow}>
          {/* level 1: the inert page behind the overlay is hidden from the
              accessibility tree, so this title is the page's one <h1>. */}
          <Heading slot="title" level={1}>
            Neues Update erstellen
          </Heading>
          {/* In the design but dead by the brief's rule that no button in the
              modal closes it. */}
          <Button type="button" variant="quiet" aria-label="Schließen">
            <X aria-hidden />
          </Button>
        </div>
        <PetitionUpdateForm />
      </Dialog>
    </Modal>
  );
}
