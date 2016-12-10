const config = {
  'parse appId': 'chatradar',
  'parse serverURL': process.env['PARSE_SERVER_URL'] || 'http://localhost:1337/api',
  'parse masterKey': process.env['PARSE_MASTER_KEY'],
};

export default config;
