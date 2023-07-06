export const removeCharactersFromKeys = (obj) => {
  const newObj = {};

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = key.replace(/fy|_/g, "");
      newObj[newKey] = obj[key];
    }
  }

  return newObj;
};
