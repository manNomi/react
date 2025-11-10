// This test verifies that eslint-disable-next-line only affects the next line,
// not the entire function. The component should compile successfully.
function Component() {
  const item = [];
  const foo = useCallback(
    () => {
      item.push(1);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return <Button foo={foo} />;
}

