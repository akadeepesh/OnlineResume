# Security Policy

## Supported Versions

Currently, we maintain security updates for the following versions of OnlineResume:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of OnlineResume seriously. If you discover a security vulnerability, please report it through one of these channels:

1. **Email**: akadeepesh1710@gmail.com
2. **GitHub Issues**: Create an issue in our repository

### When Reporting

Please include the following information in your report:
- A clear description of the vulnerability
- Steps to reproduce the issue
- Possible impacts
- Any suggested fixes (if available)

### Response Timeline

- Initial response: 2-3 working days
- Updates will be provided through the reported channel (email or GitHub issue)
- You'll receive confirmation once the issue is resolved

## Security Update Process

1. **Assessment**
   - Each report is reviewed within 2-3 working days
   - Critical vulnerabilities receive priority attention

2. **Resolution**
   - Security patches will be released as soon as possible
   - For critical issues, we aim to provide temporary mitigation steps while working on the fix

3. **Distribution**
   - Security updates will be released through npm
   - Major security issues will be documented in the GitHub releases

## Best Practices for Users

1. **Dependencies**
   - Regularly update your dependencies to their latest versions
   - Use `npm audit` to check for known vulnerabilities
   - Keep Next.js updated to the latest stable version

2. **Development**
   - Follow Next.js security best practices
   - Implement proper authentication and authorization
   - Use environment variables for sensitive information
   - Keep API routes properly secured

## Project Dependencies

This project uses several key dependencies that are regularly maintained and updated:
- Next.js 14.2.11
- React 18
- Various UI components from Radix UI
- TypeScript for type safety

## Version Control

The project follows semantic versioning (SemVer) for releases. Security updates may be released as:
- Patch versions for backwards-compatible security fixes
- Minor versions for security fixes that include new features
- Major versions for security fixes that include breaking changes

## Acknowledgments

We appreciate the security research community's efforts in responsibly disclosing vulnerabilities and helping improve our project's security.
