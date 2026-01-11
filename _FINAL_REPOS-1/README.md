# MRF103 Project Repository

This repository contains the final structure for the MRF103 project, which has been split into three separate, production-ready folders. Each folder represents a distinct component of the project, ensuring modularity and ease of maintenance.

## Project Structure

- **1-mrf103-landing**: This folder contains the landing page for MRF103 Holdings.
  - **index.html**: The main HTML file featuring the latest "Futuristic Unicorn" design with a 3D background and 7 Pillars.
  - **README.md**: Documentation for the landing page.

- **2-xbook-engine**: This folder contains the core engine for the xbook functionality.
  - **index.ts**: Entry point for the xbook engine.
  - **types**: Contains type definitions used throughout the engine.
  - **utils**: Utility functions for the engine.
  - **config**: Configuration settings for the engine.
  - **tests**: Unit tests for the engine.
  - **package.json**: Lists dependencies and scripts.
  - **tsconfig.json**: TypeScript configuration.
  - **.gitignore**: Specifies files to ignore in Git.
  - **.npmignore**: Specifies files to ignore in npm.
  - **jest.config.js**: Jest configuration for testing.
  - **README.md**: Documentation for the xbook engine.

- **3-mrf103-arc-ecosystem**: This folder contains the command-line interface and ecosystem for the arc functionality.
  - **index.ts**: Entry point for the arc ecosystem.
  - **commands**: Command definitions for the ecosystem.
  - **cli.ts**: Command-line interface logic.
  - **types**: Type definitions used throughout the ecosystem.
  - **bin**: Contains the executable for the arc ecosystem.
  - **tests**: Unit tests for the CLI.
  - **package.json**: Lists dependencies and scripts.
  - **tsconfig.json**: TypeScript configuration.
  - **.gitignore**: Specifies files to ignore in Git.
  - **jest.config.js**: Jest configuration for testing.
  - **README.md**: Documentation for the arc ecosystem.

## Getting Started

To get started with the project, navigate to the respective folder of the component you wish to work on. Each component has its own README file with specific instructions and details.

## Contributing

Contributions are welcome! Please follow the standard procedures for contributing to open-source projects, including forking the repository and submitting pull requests.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.