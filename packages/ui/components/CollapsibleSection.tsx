import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface CollapsibleSectionProps {
  /**
   * The title displayed in the header
   */
  title: string;
  /**
   * Content to render when expanded
   */
  children: React.ReactNode;
  /**
   * Whether the section starts collapsed
   * @default false
   */
  defaultCollapsed?: boolean;
  /**
   * Optional callback when the collapsed state changes
   */
  onToggle?: (isCollapsed: boolean) => void;
  /**
   * Optional className for the container
   */
  className?: string;
}

/**
 * A reusable collapsible section component with chevron toggle.
 * Follows the pattern from Viewer.tsx CalloutBlock component.
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultCollapsed = false,
  onToggle,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggle?.(newState);
  };

  return (
    <div className={`collapsible-section ${className}`}>
      <button
        type="button"
        className="collapsible-section-header"
        onClick={handleToggle}
        aria-expanded={!isCollapsed}
      >
        <span className="collapsible-section-title">{title}</span>
        <div
          className={`collapsible-section-chevron ${isCollapsed ? 'is-collapsed' : ''}`}
        >
          <ChevronDown size={16} />
        </div>
      </button>

      {!isCollapsed && (
        <div className="collapsible-section-content">
          {children}
        </div>
      )}
    </div>
  );
};
