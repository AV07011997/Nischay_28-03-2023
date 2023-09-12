export const DateMilisec = (array) => {
  let response = [];

  for (let data of array) {
    data.date_of_action = new Date(data.date_of_action);
  }
  // console.log(array);
  return array;
};
