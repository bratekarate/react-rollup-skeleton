import React from "react";

interface ComponentProps {
  flag?: boolean;
}

export const Component: React.FC<ComponentProps> = () => (
  <div>
    <div>jmarceli-react-ts-library</div>
    <div>sample component</div>
    <div>rly?</div>
  </div>
);
