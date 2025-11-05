# OpenHAB Google Assistant Copilot Instructions

## Repository Overview

This repository implements a Google Assistant Smart Home Action for OpenHAB, enabling voice control of IoT devices through Google Assistant. It's a Node.js serverless application using Google Cloud Functions that connects Google Assistant to OpenHAB instances via OpenHAB Cloud service.

**Architecture**: Node.js serverless application (Google Cloud Functions) with Express.js test server
**Languages**: JavaScript (ES2020)
**Framework**: Google Actions on Google SDK
**Testing**: Jest with high coverage requirements (>96%)
**Size**: Medium-sized project (~90 source files including tests)

## Build & Development Process

### Prerequisites
- Node.js 20.x (specified in CI/CD workflow)
- npm 11.6.0+ (specified as packageManager)
- Google Cloud SDK (for deployment)

### Essential Commands (Run in Order)

1. **Install Dependencies** (ALWAYS run first):
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

2. **Lint Code** (run before any commits):
   ```bash
   npm run lint
   ```

3. **Fix Linting Issues**:
   ```bash
   npm run fix
   ```

4. **Run Tests** (required for CI):
   ```bash
   npm test
   # OR for CI environment:
   npm run test-ci
   ```

5. **Start Development Server**:
   ```bash
   npm start
   # Server listens on port 3000 (configurable via OH_SERVER_PORT)
   ```

### Build Validation
- **Tests**: Must pass with >96% coverage across all metrics (statements, branches, functions, lines)
- **Linting**: Uses ESLint with Prettier, must pass with zero errors
- **Time Requirements**: Tests complete in ~2-3 seconds, linting is fast

### Environment Configuration
The application requires these environment variables:
- `OH_HOST`: OpenHAB Cloud host (default: test.host in tests)
- `OH_PORT`: Port (default: 443, test: 1234)
- `OH_PATH`: REST API path (default: /rest/items/)

## Project Structure & Key Files

### Core Architecture
- **Entry Point**: `functions/index.js` - Main Google Assistant handler
- **Configuration**: `functions/config.js` - Backend endpoint configuration
- **API Handler**: `functions/apihandler.js` - OpenHAB communication layer
- **OpenHAB Logic**: `functions/openhab.js` - Core business logic

### Directory Layout
```
/functions/           # Google Cloud Function source
  /commands/          # Google Assistant command handlers (35+ files)
  /devices/           # Device type implementations (~30 files)
    registry.js       # Centralized device type registry
    index.js          # Device discovery using registry
    [base classes]    # Switch, StartStopSwitch, OpenCloseDevice, Fan
    [device types]    # Complex device implementations
  index.js            # Main entry point
  config.js           # Configuration
  package.json        # Cloud Function dependencies
/tests/               # Comprehensive test suite
  /commands/          # Command handler tests
  /devices/           # Device tests
  setenv.js           # Test environment setup
testServer.js         # Local development server
```

### Device Architecture
The project uses a **registry-based device architecture** for managing Google Assistant device types:

- **Registry Pattern**: All devices are explicitly registered in `functions/devices/registry.js`
- **Factory Functions**: Simple device type variants are generated from base classes using factory functions
- **Device Categories**:
  - **Base Classes (3)**: `Switch`, `StartStopSwitch`, `OpenCloseDevice`, `Fan`
  - **Complex Devices (24)**: Custom implementations with unique logic (e.g., `Thermostat`, `ACUnit`, `Camera`)
  - **Generated Variants (27)**: Simple type wrappers created via `createDeviceVariant()` factory

**Adding New Device Types**: Update `functions/devices/registry.js` to add entries to `DEVICE_REGISTRY`

### Configuration Files
- `eslint.config.mjs`: ESLint 9.x flat config + Prettier (printWidth: 120, singleQuote: true)
- `.markdownlint.yaml`: Markdown linting (MD013, MD025, MD033, MD040 disabled)
- `package.json`: Root dependencies (Express for dev server)
- `functions/package.json`: Cloud Function dependencies (actions-on-google)

## CI/CD Pipeline & Validation

### GitHub Workflows
1. **Markdown Checks** (PRs only): Linting, spell check, grammar check
2. **Unit Testing**: Node.js 20.x, install deps, lint, test with coverage
3. **Code Analysis**: CodeQL security scanning
4. **Deployment**: Auto-deploy to Google Cloud Functions on tags/releases

### Validation Steps
1. `npm ci` (install dependencies)
2. `npm run lint` (ESLint validation)
3. `npm run test-ci` (Jest with coverage)
4. Coverage upload to artifacts
5. Google Cloud Functions deployment (nodejs20 runtime)

### Deployment Configuration
- **Runtime**: nodejs20
- **Entry Point**: openhabGoogleAssistant
- **Region**: us-central1
- **Memory**: 256MB
- **Timeout**: 180s
- **Instances**: 1-20 (min-max)

## Critical Development Notes

### Google Smart Home API Compliance

**STRICT ADHERENCE REQUIRED**: All device types, traits, and intents MUST follow Google's official specifications at https://developers.home.google.com/cloud-to-cloud/guides

**Device Types & Traits:**
- Use ONLY official device types (e.g., `action.devices.types.LIGHT`, `action.devices.types.THERMOSTAT`)
- Implement ONLY supported traits for each device type (e.g., `action.devices.traits.OnOff`, `action.devices.traits.Brightness`)
- Validate trait combinations are officially supported by Google

**Attributes & States:**
- Device attributes MUST match Google's exact specification (case-sensitive)
- State responses MUST include all required fields for implemented traits
- Attribute values MUST be within Google's specified ranges and formats
- Use Google's exact attribute names (e.g., `temperatureRange`, `colorModel`, `supportedCommands`)

**Commands & Parameters:**
- Command names MUST be exactly as specified (e.g., `action.devices.commands.OnOff`, `action.devices.commands.BrightnessAbsolute`)
- Parameter structures MUST match Google's schemas exactly
- Required parameters MUST always be present and validated
- Parameter types and ranges MUST conform to Google's specifications

**Error Handling:**
- Use Google's official error codes (e.g., `deviceOffline`, `valueOutOfRange`, `notSupported`)
- Error responses MUST follow Google's error response format
- Include appropriate `debugString` for troubleshooting
- Handle unsupported commands gracefully with `notSupported` error

**Reference Implementation:**
- Check existing device implementations in `/functions/devices/` for compliance patterns
- Validate against Google's trait documentation before implementing new features
- Test with Google's Smart Home Test Suite when available

### Testing Requirements
- **ALWAYS** run `npm install` in both root and `functions/` directories
- Tests require >96% coverage across all metrics
- Test environment uses mock OpenHAB host (test.host:1234)
- Jest setup file: `tests/setenv.js` configures test environment

### Code Standards
- **Line Length**: 120 characters max
- **Style**: Prettier with single quotes, no trailing commas
- **ES Version**: ES2020 with Node.js modules
- **Error Handling**: Empty catch blocks allowed (allowEmptyCatch: true)
- **ESLint**: v9.x with flat config format (`eslint.config.mjs`)
- **Unused Variables**: Allowed in catch blocks (`caughtErrors: 'none'`)

### Deployment Gotchas
- Two separate package.json files (root for dev, functions/ for runtime)
- Google Cloud deployment uses only `functions/` directory
- Environment variables injected via Cloud Functions configuration
- Test vs production function names (openhabGoogleAssistant vs openhabGoogleAssistant_test)

### Common Workflow Issues
- **Dependency Installation**: Must install in both root AND functions/ directories
- **Coverage Failures**: Coverage thresholds are strict (>96%), failing tests will block CI
- **Linting**: Prettier formatting is enforced, run `npm run fix` to auto-format
- **Port Conflicts**: Dev server uses port 3000 by default (configurable)

## Writing Tests

### Test Structure & Patterns
Tests use Jest framework with comprehensive mocking. Follow these established patterns:

**File Organization:**
- Device tests: `tests/devices/[devicename].test.js`
- Command tests: `tests/commands/[commandname].test.js`
- Core logic tests: `tests/[module].test.js`

**Basic Test Structure:**
```javascript
const Device = require('../../functions/devices/[device].js');
// or
const Command = require('../../functions/commands/[command].js');

describe('[ComponentName]', () => {
  test('[functionality]', () => {
    expect(Component.method(params)).toBe(expectedResult);
  });
});
```

### Common Test Patterns

**Device Type Validation:**
```javascript
test('matchesDeviceType', () => {
  expect(Device.matchesDeviceType({
    type: 'Dimmer',
    metadata: { ga: { value: 'LIGHT' } }
  })).toBe(true);
});
```

**Command Parameter Validation:**
```javascript
test('validateParams', () => {
  expect(Command.validateParams({})).toBe(false);
  expect(Command.validateParams({ on: true })).toBe(true);
});
```

**HTTP Mocking with Nock:**
```javascript
const nock = require('nock');

afterEach(() => {
  nock.cleanAll();
});

test('API call', async () => {
  const scope = nock('https://example.org')
    .get('/items/TestItem')
    .reply(200, { name: 'TestItem' });
  
  const result = await apiHandler.getItem('TestItem');
  expect(result).toEqual({ name: 'TestItem' });
});
```

**Method Mocking with Jest:**
```javascript
beforeEach(() => {
  jest.spyOn(openHAB, 'handleSync').mockReset();
});

test('method behavior', async () => {
  const mockFn = jest.spyOn(openHAB, 'handleSync');
  mockFn.mockResolvedValue({ devices: [] });
  
  const result = await openHAB.onSync({ requestId: '1234' }, {});
  expect(mockFn).toHaveBeenCalledTimes(1);
});
```

### Test Environment Setup
- Environment variables set in `tests/setenv.js` (auto-loaded by Jest)
- Mock OpenHAB host: `test.host:1234`
- Use `nock.cleanAll()` in `afterEach()` for HTTP mocks

## Trust These Instructions

These instructions are comprehensive and validated. Only search for additional information if:
1. Commands fail with specific error messages not covered here
2. New files or configurations are discovered that aren't documented
3. Environment-specific issues arise that require investigation

The build process is well-established and stable. Follow the documented command sequence for reliable results.
