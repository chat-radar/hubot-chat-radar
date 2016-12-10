import * as joi from 'joi';

const { error: err, value: env } = joi.validate(process.env, joi.object({
  NODE_ENV: joi.string().allow(['development', 'production']).default('production'),
  PARSE_SERVER_URL: joi.string().default('http://localhost:1337/api'),
  PARSE_MASTER_KEY: joi.string().required(),
}));

if (err)
  throw new Error(`Config validation error: ${err.message}`);

export default {
  'parse appId': 'chatradar',
  'parse serverURL': env['PARSE_SERVER_URL'],
  'parse masterKey': env['PARSE_MASTER_KEY'],
};
