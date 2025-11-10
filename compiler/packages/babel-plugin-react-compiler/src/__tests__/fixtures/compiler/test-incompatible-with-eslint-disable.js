import {useVirtualizer} from '@tanstack/react-virtual';
import {useEffect} from 'react';

function useCustomHook() {
  const parentRef = {current: null};
  
  // This should show a warning
  const virtualizer = useVirtualizer({
    count: 10,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log('effect');
  }, []);
  
  return {virtualizer, parentRef};
}

export default function Component() {
  const {virtualizer} = useCustomHook();
  return <div>{virtualizer}</div>;
}

