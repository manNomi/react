function Component() {
  const item = [];
  // eslint-disable react-hooks/exhaustive-deps
  const foo = useCallback(
    () => {
      item.push(1);
    },
    []
  );
  // eslint-enable react-hooks/exhaustive-deps

  return <Button foo={foo} />;
}
