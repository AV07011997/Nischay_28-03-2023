export const navBarValues = {
  HOME: " /images/home.png",
  UPLOAD: "/images/upload.png",
  // DOWNLOAD: "/images/download.png",
  BUREAU: "/images/bureau.png",
  ANALYZE: "/images/analyze.png",
  SUMMARY: "/images/summary.png",
};

export const convertObjectIntoArrayOfObjects = (obj) => {
  let array = [];

  for (let x in obj) {
    array.push({ x: obj[x] });
  }

  return array;
};
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
