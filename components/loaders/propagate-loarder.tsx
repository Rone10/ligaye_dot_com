"use client";

import { PropagateLoader } from "react-spinners";

export default function PropagateLoaderSpinner() {
  return <PropagateLoader 
  color="#4a6cfa" 
  size={20}
  aria-label="Loading Spinner"
        data-testid="loader"
  />;
}

