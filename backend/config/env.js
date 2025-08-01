// backend/config/env.js
import Joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();

const schema = Joi.object({
  // existing validations…
  DATABASE_URI:         Joi.string().uri().required(),
  ACCESS_TOKEN_SECRET:  Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(),
  ACCESS_EXPIRES_IN:    Joi.string().default('1h'),
  REFRESH_EXPIRES_IN:   Joi.string().default('7d'),
  PORT:                 Joi.number().default(5000),
  CORS_ORIGIN:          Joi.string().uri().default('http://localhost:3000'),

  // ADD these four:
  CF_ACCOUNT_ID:           Joi.string().required()
    .description('Your Cloudflare Account ID'),
  CF_R2_ACCESS_KEY_ID:     Joi.string().required()
    .description('Your Cloudflare R2 Access Key ID'),
  CF_R2_SECRET_ACCESS_KEY: Joi.string().required()
    .description('Your Cloudflare R2 Secret Access Key'),
  CF_R2_BUCKET:            Joi.string().required()
    .description('Your Cloudflare R2 Bucket name'),
})
.unknown(); // allow other vars

const { error, value: env } = schema.validate(process.env, {
  abortEarly: false,  // report all missing/invalid vars at once
  allowUnknown: true
});

if (error) {
  console.error('Invalid environment variables:\n', error.details.map(d => d.message).join('\n'));
  process.exit(1);
}

export default env;
