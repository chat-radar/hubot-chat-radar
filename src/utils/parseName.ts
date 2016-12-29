/**
 * Parse city from nickname
 *
 * @example
 * // returns { nickname: 'James', cityName: 'Greensboro' }
 * parseName('James (Greensboro)');
 *
 * @example
 * // returns { nickname: 'Ivan', cityName: 'Moscow' }
 * parseName('Ivan [Moscow]');
 *
 * @param   {string}             fullName user full nickname
 * @return  {nickname, cityName}          name splited to nickname and cityName
 */
export default function parseName(fullName: string) {
  let nickname: string = null;
  let cityName: string = null;

  const matches = fullName.match(/^(.*)(\(|\[)(.*)(\)|\])$/);

  if (matches === null) {
    nickname = fullName.trim();
  } else {
    nickname = matches[1].trim();
    cityName = matches[3].trim();
  }

  return { nickname, cityName };
}
