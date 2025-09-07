const dateTimeUtilsToDateFormat = (date=null) => {
  if (!date) {
      date = new Date();
  }
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
}

export default dateTimeUtilsToDateFormat