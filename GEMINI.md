# VS Code CMake Tools Extension

## Project Overview

This project is the source code for the Visual Studio Code CMake Tools extension. It enhances the CMake development experience in VS Code by providing a rich set of features for configuring, building, debugging, and testing CMake-based projects.

The extension is written in TypeScript and utilizes Node.js for its backend. It integrates with VS Code's extension API to provide UI elements, commands, and language services.

## Building and Running

The project uses `yarn` as its package manager and `webpack` to bundle the extension.

### Prerequisites

*   [Node.js](https://nodejs.org/en/)
*   [Yarn](https://yarnpkg.com/) (`npm install -g yarn`)

### Building

To build the extension, run the following command:

```bash
yarn compile
```

This will install dependencies and compile the source code into the `dist` directory.

For a development build that watches for file changes, use:

```bash
yarn compile-watch
```

To create a production build, use:

```bash
yarn compile-production
```

### Running and Debugging

The simplest way to run and debug the extension is to open the project in Visual Studio Code and press `F5`. This will build the extension and launch a new VS Code window with the extension installed.

### Testing

The project has a suite of tests, including unit, integration, and end-to-end tests.

*   **Run all tests:**
    The `pretest` script `tsc -p test.tsconfig.json` is run before all test scripts. There is no single command to run all tests.

*   **Run unit tests:**
    ```bash
    yarn unitTests
    ```

*   **Run integration tests:**
    ```bash
    yarn integrationTests
    ```

*   **Run smoke tests:**
    ```bash
    yarn smokeTests
    ```

*   **Run end-to-end tests:**
    ```bash
    yarn endToEndTestsSuccessfulBuild
    yarn endToEndTestsSingleRoot
    yarn endToEndTestsMultiRoot
    ```

## Development Conventions

### Formatting and Style

*   **Formatting:** The project uses the default TypeScript formatter in VS Code with 4-space indentation.
*   **Linting:** ESLint is used for linting. Run `yarn run lint` to check for linting errors.
*   **Style:** The project follows the [TypeScript Coding guidelines](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines). New variables should be `lowerCamelCase`.

### Commits and Pull Requests

*   Update `CHANGELOG.md` with any changes.
*   When adding or updating dependencies in `package.json`, team intervention is required to merge the PR due to a private Azure Artifacts feed. For local development, you can delete the `.npmrc` file.

### Main Components

*   `src/extension.ts`: The main entry point for the extension.
*   `package.json`: Defines the extension's metadata, dependencies, and scripts.
*   `webpack.config.js`: The webpack configuration for bundling the extension.
*   `gulpfile.js`: Contains gulp tasks for various development workflows.
*   `test/`: Contains all the tests for the extension.
*   `docs/`: Contains the documentation for the extension.
