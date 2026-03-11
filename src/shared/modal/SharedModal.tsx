import type { MouseEvent, ReactNode } from 'react';

import {
  SharedModalActions,
  SharedModalContent,
  SharedModalOverlay,
  SharedModalSurface,
  SharedModalTitle,
} from './SharedModalStyled';

export interface SharedModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export const SharedModal = ({ open, onClose, title, children, actions }: SharedModalProps) => (
  <SharedModalOverlay open={open} onClose={onClose}>
    <SharedModalSurface onClick={(reactEvent: MouseEvent) => reactEvent.stopPropagation()}>
      <SharedModalTitle>{title}</SharedModalTitle>
      <SharedModalContent>{children}</SharedModalContent>
      {actions ? <SharedModalActions>{actions}</SharedModalActions> : null}
    </SharedModalSurface>
  </SharedModalOverlay>
);
