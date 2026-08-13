"use client";
import {
  Modal as RACModal,
  type ModalOverlayProps,
} from "react-aria-components/Modal";
import "./Modal.scss";

export function Modal(props: ModalOverlayProps) {
  return <RACModal {...props} />;
}
