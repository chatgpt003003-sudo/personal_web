# Security Documentation

This document outlines the security measures implemented in the portfolio website to protect against common web vulnerabilities and attacks.

## Security Features Implemented

### 1. Rate Limiting
- **API Endpoints**: Limited to prevent abuse and DDoS attacks
  - GET `/api/projects`: 100 requests per 15 minutes
  - POST `/api/projects`: 20 requests per 15 minutes
  - POST `/api/upload`: 10 requests per 10 minutes
  - POST `/api/auth/register`: 5 requests per hour

### 2. Input Validation & Sanitization
- **Joi Validation**: All API inputs validated using Joi schemas
- **XSS Prevention**: HTML tags stripped from user inputs
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **File Upload Validation**: Strict file type, size, and name validation

### 3. Authentication & Authorization
- **NextAuth.js**: Secure session management with JWT tokens
- **Password Hashing**: bcrypt with 12 salt rounds
- **Role-based Access**: Admin-only routes and API endpoints
- **Session Security**: HTTP-only cookies, secure flags in production

### 4. Security Headers
- **X-Content-Type-Options**: `nosniff` - Prevent MIME sniffing
- **X-Frame-Options**: `DENY` - Prevent clickjacking attacks
- **X-XSS-Protection**: `1; mode=block` - Enable XSS filtering
- **Referrer-Policy**: `strict-origin-when-cross-origin` - Control referrer info
- **Content-Security-Policy**: Strict CSP to prevent XSS and code injection
- **Permissions-Policy**: Disable unnecessary browser features
- **Strict-Transport-Security**: HTTPS enforcement in production

### 5. File Upload Security
- **File Type Validation**: Only allow specific MIME types and extensions
- **File Size Limits**: Maximum 50MB per upload
- **Malicious File Detection**: Check for executable file signatures
- **File Name Sanitization**: Remove dangerous characters and patterns
- **Virus Scanning**: Basic header-based malware detection

### 6. Data Protection
- **Environment Variables**: Secure storage of sensitive configuration
- **Database Security**: Connection pooling, query parameterization
- **Error Handling**: No sensitive information exposed in error messages
- **Logging**: Security events logged for monitoring and audit

### 7. Network Security
- **HTTPS Enforcement**: Automatic redirect to HTTPS in production
- **Origin Validation**: Check request origins to prevent CSRF
- **CORS Configuration**: Restricted cross-origin requests
- **IP-based Rate Limiting**: Track requests per IP address

## Security Headers Implemented

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; ...
Permissions-Policy: camera=(), microphone=(), location=(), payment=(), usb=()
```

## API Security

### Rate Limiting Configuration
```typescript
// General API endpoints
const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
});

// Authentication endpoints
const authRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // registration attempts
});
```

### Input Validation Example
```typescript
const projectSchema = Joi.object({
  title: Joi.string().required().min(1).max(200).trim(),
  description: Joi.string().max(2000).trim(),
  imageUrl: Joi.string().uri().allow(''),
  published: Joi.boolean().default(false),
});
```

## File Upload Security

### Allowed File Types
- **Images**: JPEG, PNG, GIF, WebP
- **Videos**: MP4, WebM, OGG
- **Maximum Size**: 50MB per file

### Security Checks
1. MIME type validation
2. File extension validation
3. File size limits
4. Malicious signature detection
5. File name sanitization
6. Upload rate limiting

## Security Monitoring

### Logged Security Events
- `INVALID_ORIGIN`: Requests from unauthorized origins
- `RATE_LIMIT_EXCEEDED`: Rate limit violations
- `FILE_VALIDATION_FAILED`: Invalid file uploads
- `MALICIOUS_FILE_DETECTED`: Potential malware uploads
- `UNAUTHORIZED_ACCESS`: Unauthorized API access attempts
- `REGISTRATION_FAILED`: Failed registration attempts

### Log Format
```json
{
  "timestamp": "2023-01-01T00:00:00.000Z",
  "event": "INVALID_ORIGIN",
  "ip": "192.168.1.1",
  "details": {
    "endpoint": "/api/projects",
    "method": "POST"
  }
}
```

## Production Security Checklist

### Deployment Security
- [ ] Environment variables properly configured
- [ ] HTTPS certificate installed and configured
- [ ] Database connections encrypted
- [ ] Security headers tested and verified
- [ ] Rate limiting tested under load
- [ ] File upload restrictions tested
- [ ] Admin access properly restricted

### Monitoring & Maintenance
- [ ] Security logs monitored regularly
- [ ] Dependency updates scheduled
- [ ] Security scanning automated
- [ ] Backup and recovery procedures tested
- [ ] Incident response plan documented

## Environment Variables Security

### Required Environment Variables
```bash
DATABASE_URL=postgresql://...           # Database connection
NEXTAUTH_URL=https://yourdomain.com     # Auth URL
NEXTAUTH_SECRET=<random-32-char-string> # Auth secret
AWS_ACCESS_KEY_ID=<aws-key>            # AWS credentials
AWS_SECRET_ACCESS_KEY=<aws-secret>     # AWS credentials
AWS_S3_BUCKET_NAME=<bucket-name>       # S3 bucket
```

### Security Requirements
- Use strong, randomly generated secrets
- Rotate secrets regularly (quarterly)
- Never commit secrets to version control
- Use different secrets for different environments
- Restrict AWS IAM permissions to minimum required

## Incident Response

### Security Incident Types
1. **Brute Force Attacks**: Monitor failed login attempts
2. **File Upload Attacks**: Monitor for malicious files
3. **DDoS Attacks**: Monitor rate limiting triggers
4. **Data Breaches**: Monitor unauthorized data access

### Response Procedures
1. **Immediate**: Block suspicious IP addresses
2. **Short-term**: Investigate logs and assess impact
3. **Long-term**: Update security measures and documentation

## Compliance & Standards

### Standards Followed
- **OWASP Top 10**: Protection against common vulnerabilities
- **NIST Cybersecurity Framework**: Risk management approach
- **GDPR Compliance**: Data protection (if handling EU users)

### Regular Security Tasks
- Dependency vulnerability scanning (weekly)
- Security header verification (monthly)
- Penetration testing (quarterly)
- Security documentation updates (quarterly)

## Security Testing

### Automated Testing
- Unit tests for security functions
- Integration tests for authentication flows
- End-to-end tests for complete user journeys

### Manual Testing
- Security header verification
- Input validation testing
- File upload security testing
- Rate limiting verification

## Contact Information

For security concerns or to report vulnerabilities:
- Email: security@yourdomain.com
- Response time: 24-48 hours for critical issues

## Changelog

### Version 1.0 (Current)
- Initial security implementation
- Rate limiting, input validation, and security headers
- File upload security and monitoring
- Authentication and authorization