'use client';

import React from 'react';

interface StatCardProps {
  icon: string | React.ReactNode;
  value: string | number;
  label: string;
  className: string;      // The card container class
  iconClassName: string;  // The icon container class
  infoClassName: string;  // The info container class
  valueClassName: string; // The value text class
  labelClassName: string; // The label text class
  iconStyle?: React.CSSProperties;
}

export function StatCard({
  icon,
  value,
  label,
  className,
  iconClassName,
  infoClassName,
  valueClassName,
  labelClassName,
  iconStyle
}: StatCardProps) {
  return (
    <div className={className}>
      <div className={iconClassName} style={iconStyle}>
        {icon}
      </div>
      <div className={infoClassName}>
        <div className={valueClassName}>{value}</div>
        <div className={labelClassName}>{label}</div>
      </div>
    </div>
  );
}
