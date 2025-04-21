"use client";

import RingLoader  from "react-spinners/RingLoader";

export default function RingLoaderSpinner() {
  return <RingLoader 
  color="#4a6cfa" 
  size={100}
  aria-label="Loading Spinner"
        data-testid="loader"
  />;
}

