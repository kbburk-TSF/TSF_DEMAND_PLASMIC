/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/* prettier-ignore-start */
import * as React from "react";

export const UnnamedGlobalGroupOfVariantsContext = React.createContext(
  "PLEASE_RENDER_INSIDE_PROVIDER"
);

export function UnnamedGlobalGroupOfVariantsContextProvider(props) {
  return (
    <UnnamedGlobalGroupOfVariantsContext.Provider value={props.value}>
      {props.children}
    </UnnamedGlobalGroupOfVariantsContext.Provider>
  );
}

export function useUnnamedGlobalGroupOfVariants() {
  return React.useContext(UnnamedGlobalGroupOfVariantsContext);
}

export default UnnamedGlobalGroupOfVariantsContext;
/* prettier-ignore-end */
