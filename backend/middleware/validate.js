// backend/middleware/validate.js
import Joi from 'joi';

export const validateBody = (schema) => {
  return (req, res, next) => {
    const { value, error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,     // <- remove unexpected fields
    });

    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({ errors: messages });
    }

    req.body = value;         // <- use normalized, validated payload
    next();
  };
};


