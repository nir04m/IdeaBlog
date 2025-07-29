// backend/middleware/validate.js
import Joi from 'joi';

export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      // send all validation errors
      const messages = error.details.map(d => d.message);
      return res.status(400).json({ errors: messages });
    }
    next();
  };
};


