"use client";

import RiseLoader  from "react-spinners/RiseLoader";

export default function RiseLoaderSpinner() {
  return <RiseLoader 
  color="#4a6cfa" 
  size={40}
  aria-label="Loading Spinner"
        data-testid="loader"
  />;
}

