// @noEmit
// Tests that in noEmit mode, the compiler continues analyzing
// even when ESLint suppressions are present (fixes #35105)

import {useEffect, useState} from 'react';

function Component() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log(count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentional suppression

  // Without the fix, the compiler would skip this entire function
  // and miss potential issues below
  const expensiveComputation = count * 2;

  return <div>{expensiveComputation}</div>;
}

export const FIXTURE_ENTRYPOINT = {
  fn: Component,
  params: [],
};

