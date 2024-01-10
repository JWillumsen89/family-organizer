export const getInitials = name => {
  let initials = name
      .split(' ')
      .map(word => word[0])
      .join('');
  return initials.length > 2 ? initials.substring(0, 2) : initials;
};