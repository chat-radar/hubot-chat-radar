import * as joi from 'joi';

const schema = joi.object({
  NODE_ENV: joi.string().allow(['development', 'production']).default('production'),
  PUBLIC_URI: joi.string().default('http://localhost:1337'),
  PARSE_SERVER_URI: joi.string().default('http://localhost:1337/api'),
  PARSE_MASTER_KEY: joi.string().required(),
});

const { error: err, value: env } = joi.validate(process.env, schema.unknown().required());

if (err) throw new Error(`Config validation error: ${err.message}`);

export default {
  'public URI': env.PUBLIC_URI,
  'parse appId': 'chatradar',
  'parse serverURI': env.PARSE_SERVER_URI,
  'parse masterKey': env.PARSE_MASTER_KEY,
};
