"use client";

import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount((c) => c + 1)}>
      count is {count}
    </button>
  );
}

export default function Home() {
  return (
    <div id="app">
      <div>
        <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">
          <img src="/next.svg" className="logo" alt="Next.js logo" />
        </a>
        <a
          href="https://webflow.com/cloud"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/webflow.svg" className="logo vanilla" alt="Webflow logo" />
        </a>
        <h1>Next.js + Webflow Cloud</h1>
        <div className="card">
          <Counter />
        </div>
        <p className="read-the-docs">
          Click on the Next.js and Webflow logos to learn more
        </p>
      </div>
    </div>
  );
}
