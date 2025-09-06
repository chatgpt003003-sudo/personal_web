import Joi from 'joi';

// User validation schemas
export const userRegistrationSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .max(255)
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
      'string.max': 'Email must not exceed 255 characters',
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),
  role: Joi.string().valid('admin', 'user').default('user'),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required().max(255),
  password: Joi.string().required().max(128),
});

// Project validation schemas
export const projectCreateSchema = Joi.object({
  title: Joi.string()
    .required()
    .min(1)
    .max(200)
    .trim()
    .messages({
      'any.required': 'Project title is required',
      'string.min': 'Project title cannot be empty',
      'string.max': 'Project title must not exceed 200 characters',
    }),
  description: Joi.string()
    .allow('')
    .max(2000)
    .trim()
    .messages({
      'string.max': 'Description must not exceed 2000 characters',
    }),
  imageUrl: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': 'Image URL must be a valid URL',
    }),
  videoUrl: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': 'Video URL must be a valid URL',
    }),
  metadata: Joi.object({
    tags: Joi.array().items(Joi.string().max(50)).max(20),
    techStack: Joi.array().items(Joi.string().max(50)).max(20),
    duration: Joi.string().max(100),
    client: Joi.string().max(200),
    demoUrl: Joi.string().uri().allow(''),
    repositoryUrl: Joi.string().uri().allow(''),
  }).unknown(true),
  published: Joi.boolean().default(false),
});

export const projectUpdateSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200)
    .trim()
    .messages({
      'string.min': 'Project title cannot be empty',
      'string.max': 'Project title must not exceed 200 characters',
    }),
  description: Joi.string()
    .allow('')
    .max(2000)
    .trim()
    .messages({
      'string.max': 'Description must not exceed 2000 characters',
    }),
  imageUrl: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': 'Image URL must be a valid URL',
    }),
  videoUrl: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': 'Video URL must be a valid URL',
    }),
  metadata: Joi.object().unknown(true),
  published: Joi.boolean(),
});

// Blog post validation schemas (for future use)
export const blogPostCreateSchema = Joi.object({
  title: Joi.string()
    .required()
    .min(1)
    .max(300)
    .trim()
    .messages({
      'any.required': 'Blog post title is required',
      'string.min': 'Title cannot be empty',
      'string.max': 'Title must not exceed 300 characters',
    }),
  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .max(200)
    .messages({
      'string.pattern.base':
        'Slug can only contain lowercase letters, numbers, and hyphens',
      'string.max': 'Slug must not exceed 200 characters',
    }),
  content: Joi.string()
    .required()
    .min(10)
    .max(50000)
    .messages({
      'any.required': 'Blog post content is required',
      'string.min': 'Content must be at least 10 characters long',
      'string.max': 'Content must not exceed 50,000 characters',
    }),
  excerpt: Joi.string()
    .max(500)
    .trim()
    .messages({
      'string.max': 'Excerpt must not exceed 500 characters',
    }),
  tags: Joi.array()
    .items(Joi.string().max(50))
    .max(10)
    .messages({
      'array.max': 'Maximum 10 tags allowed',
    }),
  published: Joi.boolean().default(false),
  featuredImage: Joi.string().uri().allow(''),
});

// File upload validation
export const fileUploadSchema = Joi.object({
  fileName: Joi.string()
    .required()
    .max(255)
    .pattern(/^[^<>:"/\\|?*]+$/)
    .messages({
      'any.required': 'File name is required',
      'string.max': 'File name must not exceed 255 characters',
      'string.pattern.base': 'File name contains invalid characters',
    }),
  fileSize: Joi.number()
    .required()
    .max(10 * 1024 * 1024) // 10MB
    .messages({
      'any.required': 'File size is required',
      'number.max': 'File size must not exceed 10MB',
    }),
  mimeType: Joi.string()
    .required()
    .valid(
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/ogg'
    )
    .messages({
      'any.required': 'File type is required',
      'any.only': 'File type not supported',
    }),
});

// Contact form validation (if needed)
export const contactFormSchema = Joi.object({
  name: Joi.string()
    .required()
    .min(2)
    .max(100)
    .trim()
    .pattern(/^[a-zA-Z\s]+$/)
    .messages({
      'any.required': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 100 characters',
      'string.pattern.base': 'Name can only contain letters and spaces',
    }),
  email: Joi.string()
    .email()
    .required()
    .max(255)
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
      'string.max': 'Email must not exceed 255 characters',
    }),
  subject: Joi.string()
    .required()
    .min(5)
    .max(200)
    .trim()
    .messages({
      'any.required': 'Subject is required',
      'string.min': 'Subject must be at least 5 characters long',
      'string.max': 'Subject must not exceed 200 characters',
    }),
  message: Joi.string()
    .required()
    .min(20)
    .max(2000)
    .trim()
    .messages({
      'any.required': 'Message is required',
      'string.min': 'Message must be at least 20 characters long',
      'string.max': 'Message must not exceed 2000 characters',
    }),
});

// Common validation helper
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  data?: unknown;
}

export function validateData(
  data: unknown,
  schema: Joi.ObjectSchema
): ValidationResult {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    allowUnknown: false,
  });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ');
    return {
      isValid: false,
      error: errorMessage,
    };
  }

  return {
    isValid: true,
    data: value,
  };
}

// Sanitize and validate combined function
export function sanitizeAndValidate(
  data: unknown,
  schema: Joi.ObjectSchema
): ValidationResult {
  // First sanitize the data
  const sanitizedData = sanitizeObject(data);

  // Then validate
  return validateData(sanitizedData, schema);
}

// Object sanitization helper
function sanitizeObject(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return obj
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

// Rate limiting validation
export const rateLimitSchema = Joi.object({
  ip: Joi.string().ip().required(),
  userAgent: Joi.string().max(500),
  endpoint: Joi.string().required(),
  timestamp: Joi.date().default(Date.now),
});

// API key validation (for future API access)
export const apiKeySchema = Joi.object({
  key: Joi.string()
    .required()
    .length(32)
    .pattern(/^[a-f0-9]+$/)
    .messages({
      'any.required': 'API key is required',
      'string.length': 'API key must be exactly 32 characters',
      'string.pattern.base': 'API key format is invalid',
    }),
});