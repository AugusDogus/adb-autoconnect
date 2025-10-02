# adb-autoconnect

Automatically discover and connect to wireless ADB devices via mDNS service discovery.

## Installation & Usage

### Option 1: Run with Bun (requires Bun installed)

```bash
# Run directly with bunx (no installation needed)
bunx adb-autoconnect

# Or install globally
bun install -g adb-autoconnect
adb-autoconnect
```

### Option 2: Download Pre-built Executables

Download the executable for your platform from [GitHub Releases](https://github.com/AugusDogus/adb-autoconnect/releases) - no runtime required!

- **Windows**: `adb-autoconnect-windows.exe`
- **macOS**: `adb-autoconnect-macos`
- **Linux**: `adb-autoconnect-linux`

## Usage Examples

```bash
# Default: minimal output - just shows "connected to <ip:port>"
bunx adb-autoconnect

# List discovered devices without connecting
bunx adb-autoconnect --list

# Connect to all discovered devices
bunx adb-autoconnect --all

# Info mode: show discovery progress and connection attempts
bunx adb-autoconnect --info

# Verbose mode: show all available information including device list
bunx adb-autoconnect --verbose

# Silent mode: suppress all output
bunx adb-autoconnect --silent

# Increase discovery timeout (default: 15000ms)
bunx adb-autoconnect --timeout 20000

# Combine options
bunx adb-autoconnect --all --info --timeout 30000
```

## Development

```bash
# Install dependencies
bun install

# Run locally
bun run src/index.ts

# Build executables for all platforms
bun run build
```

## Log Levels

- **Default** (no flag): Minimal output - only shows connection results (`connected to 192.168.86.242:37727`)
- **`--info`** (`-i`): Shows discovery progress, found targets, and connection attempts
- **`--verbose`** (`-v`): Shows everything including the full ADB device list at the end
- **`--silent`** (`-s`): Suppresses all output (useful for scripts)

## Requirements

- ADB installed and in PATH
- Wireless debugging enabled on Android device (Developer options → Wireless debugging)
- Device and computer on the same network
- First-time pairing for Android 11+: `adb pair <ip>:<pairing-port> <code>`

## Project Structure

```
src/
├── index.ts                  # Main entry point
├── cli/
│   ├── program.ts           # CLI configuration and option parsing
│   └── messages.ts          # User-facing output formatting
├── services/
│   └── adb-service.ts       # ADB device discovery and connection
├── utils/
│   ├── command.ts           # Command execution utilities
│   └── logger.ts            # Configurable logging system
└── validation/
    └── ip-validator.ts      # IP:port validation with Zod
```

## Architecture

The application is structured into focused modules:

- **CLI Layer**: Handles command-line interface and user output with configurable log levels
- **Services**: Core ADB functionality (discovery, connection)
- **Utils**: Reusable command execution and logging system
- **Validation**: IP address and port validation using Zod schemas

All modules rely on TypeScript type inference without explicit return types, keeping the code concise and maintainable.

The logging system provides four levels (silent, default, info, verbose) allowing you to control output verbosity based on your needs - from completely silent for scripts to verbose for debugging.

---

This project uses [Bun](https://bun.com) as the JavaScript runtime.
