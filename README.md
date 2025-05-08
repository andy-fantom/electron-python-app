# Electron Python App

A simple Electron application that runs Python commands without requiring Python installation on the end user's system.

## Features

- Electron-based UI for a desktop application
- Built-in Python processing capabilities
- No need for users to have Python installed
- Cross-platform support (Windows, macOS, Linux)

## Development Setup

### Prerequisites

To develop this application, you'll need:
- Node.js and npm
- Python 3.x
- PyInstaller (`pip install pyinstaller`)

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```

### Running in Development Mode

```
npm start
```

### Building the Application for Distribution

```
npm run build
```

This will create distributable packages for your current platform in the `out` directory.

## How It Works

The application uses:
1. Electron for the UI and application framework
2. PyInstaller to bundle Python scripts into standalone executables
3. Electron-builder to package everything together for distribution

## Sample Application

This sample demonstrates a simple calculator that performs basic arithmetic operations using Python in the background.

## License

MIT
