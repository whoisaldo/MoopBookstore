import React from 'react';
import { Grid as MuiGrid } from '@mui/material';

interface GridProps {
  item?: boolean;
  container?: boolean;
  xs?: boolean | number;
  sm?: boolean | number;
  md?: boolean | number;
  lg?: boolean | number;
  xl?: boolean | number;
  spacing?: number;
  alignItems?: string;
  children?: React.ReactNode;
  component?: string;
  sx?: any;
  key?: string | number;
  [key: string]: any;
}

const Grid: React.FC<GridProps> = (props) => {
  return <MuiGrid {...(props as any)} />;
};

export default Grid;
