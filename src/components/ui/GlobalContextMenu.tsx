'use client';

import React from 'react';
import { useContextMenu } from './ContextMenuContext';
import { ContextMenu } from './ContextMenu';

export const GlobalContextMenu: React.FC = () => {
  const { isOpen, state, closeMenu } = useContextMenu();
  if (!isOpen || !state) return null;
  return (
    <ContextMenu x={state.x} y={state.y} items={state.items} onCloseAction={closeMenu} />
  );
};
