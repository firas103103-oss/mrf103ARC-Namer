# MRF103 Arc Namer VSCode Extension

This document provides a quick start guide for developing the MRF103 Arc Namer extension for Visual Studio Code.

## Getting Started

To get started with the MRF103 Arc Namer extension, follow these steps:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/firas103103-oss/mrf103ARC-Namer.git
   cd mrf103ARC-Namer/arc-namer-vscode
   ```

2. **Install Dependencies**
   Make sure you have Node.js installed. Then, run:
   ```bash
   npm install
   ```

3. **Run the Extension**
   To run the extension in the Extension Development Host, press `F5` in Visual Studio Code.

## Extension Structure

The extension is structured as follows:

- `src/extension.ts`: The main entry point for the extension.
- `src/commands/index.ts`: Contains command definitions for the extension.
- `src/providers/index.ts`: Provides various functionalities for the extension.
- `src/types/index.ts`: Type definitions used throughout the extension.
- `resources/icons`: Contains icon resources for the extension.
- `tests/extension.test.ts`: Contains tests for the extension.

## Packaging the Extension

To package the extension for distribution, run:
```bash
npm run package
```

## Publishing the Extension

To publish the extension, ensure you have an account on the Visual Studio Code Marketplace and run:
```bash
npm run publish
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements

Thanks to the Visual Studio Code team for their excellent documentation and support.