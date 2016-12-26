export default function parseName(fullName: string) {
  let nickName: string = null;
  let cityName: string = null;

  const matches = fullName.match(/^(.*)(\(|\[)(.*)(\)|\])$/);

  if (matches === null) {
    nickName = fullName.trim();
  } else {
    nickName = matches[1].trim();
    cityName = matches[3].trim();
  }

  return { nickName, cityName };
}
