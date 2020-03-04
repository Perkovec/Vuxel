const removeElement = (arr, element) => {
  let idx = arr.indexOf(element);
  while (idx !== -1) {
    arr.splice(idx, 1);
    idx = arr.indexOf(element);
  }
  return arr;
};

export default (store) => {
  store.on('@init', () => ({ keys: [] }));

  store.on(
    'projects/key_down',
    ({ keys }, key) => ({
      keys: !keys.include(key) ? keys.push(key) : keys,
    }),
  );

  store.on(
    'projects/key_up',
    ({ keys }, key) => ({
      keys: !keys.include(key) ? keys : removeElement(keys, key),
    }),
  );
};
