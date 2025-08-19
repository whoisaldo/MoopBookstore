// Grid type declaration to handle MUI v7 typing issues
declare module '@mui/material/Grid' {
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
  }
}
