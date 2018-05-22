const localizer = {};

// TODO: this is not portable...
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

localizer.startOfWeek = () => 1;
localizer.format = (day, format) => {
  if (format === 'ddd') {
    return weekDays[day.getDay()];
  }
  return day.getDate();
};
localizer.formatDate = (day) => day.getDate();
export default localizer;
