const localizer = {};

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

localizer.startOfWeek = () => 0;
localizer.format = (day, format) => {
  if (format === 'ddd') {
    return weekDays[day.getDay()];
  }
  return day.getDate();
};
localizer.formatDate = (day) => day.getDate();
export default localizer;
