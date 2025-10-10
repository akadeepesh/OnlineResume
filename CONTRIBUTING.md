# Contributing to OnlineResume

We appreciate your interest in contributing to **OnlineResume**! Your contributions, whether they are bug reports, feature suggestions, code improvements, or documentation enhancements, help improve the project for everyone. This guide will help you get started with contributing effectively.

## Table of Contents

- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Issues and Feature Requests](#issues-and-feature-requests)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Security Guidelines](#security-guidelines)
- [License](#license)

## How to Contribute

1. Fork the repository to your own GitHub account.
2. Clone your fork to your local machine:
   ```bash
   git clone https://github.com/your-username/OnlineResume.git
   ```
3. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. Make your changes and test thoroughly.
5. Commit your changes following the [commit message guidelines](#commit-messages).
6. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. Open a pull request against the main repository's `main` branch, describing the changes you've made.

## Development Workflow

1. **Install Dependencies**: Ensure you have installed all required dependencies:
   ```bash
   npm install
   ```
2. **Run the Development Server**: Use the following command to run the project locally:
   ```bash
   npm run dev
   ```
3. **Make Your Changes**: Work on your feature or bug fix. Test your changes thoroughly.
4. **Run Linting & Tests**: Ensure that your code meets the project's coding standards:
   ```bash
   npm run lint
   ```
5. **Submit a Pull Request**: Once your changes are ready and tested, submit a pull request for review.

## Issues and Feature Requests

If you find a bug or have a suggestion for a new feature, please [open an issue](https://github.com/akadeepesh/OnlineResume/issues) to report it. When reporting an issue, please provide as much context as possible to help us address it quickly and effectively.

- **Bug Reports**: Please include details on how to reproduce the issue, expected behavior, and screenshots or logs if applicable.
- **Feature Requests**: Clearly describe the proposed feature, its benefits, and any potential risks or challenges.

## Code Style

- Follow the existing code style of the project (Prettier and ESLint rules are enforced).
- Use descriptive variable and function names.
- Keep functions small and focused.
- Write comments to explain complex or non-obvious code.

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. Please ensure your commit messages are structured as follows:

```
<type>(<scope>): <short summary>
```

- **Type**: Indicates the purpose of the commit, e.g., `fix`, `feat`, `docs`, `chore`, etc.
- **Scope**: Optional, describes the part of the codebase being affected.
- **Summary**: A brief description of the change (max 50 characters).

Example:

```
feat(projects): add GitHub project data fetching
fix(ui): resolve button alignment issue in mobile view
```

## Security Guidelines

**Do not share your GitHub private secret keys or any other sensitive credentials** in any part of the code, pull requests, or issues. If any sensitive data is accidentally included in a commit, please remove it immediately and regenerate your secret keys. Never commit any `.env` or configuration files containing private credentials.

## License

By contributing to this project, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

## Thank You!

Thank you for considering contributing to **OnlineResume**! Every contribution, no matter how small, helps make this project better for everyone.
