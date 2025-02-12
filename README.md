# Fintech Mobile Application

This project is a React Native-based fintech mobile application that provides secure money management and transfer capabilities.

The application offers a user-friendly interface for managing finances, including features such as instant money transfers, secure account management, and real-time tracking of transactions. It is built using Expo, a framework that simplifies React Native development, and integrates with various libraries to provide a robust and secure financial platform.

## Repository Structure

The repository is structured as follows:

- `android/`: Contains Android-specific configuration and build files
- `ios/`: Contains iOS-specific configuration files
- `app/`: Main application code
  - `(authenticated)/`: Components and screens for authenticated users
  - `(public)/`: Components and screens for public (non-authenticated) users
  - `components/`: Reusable React components
- `constants/`: Application-wide constant values
- `assets/`: Static assets like images and fonts

Key Files:
- `app/_layout.tsx`: Main layout component for the application
- `app/index.tsx`: Entry point of the application
- `app/pinverification.tsx`: PIN verification screen
- `app/(authenticated)/(tabs)/home.tsx`: Home screen for authenticated users
- `package.json`: Project dependencies and scripts
- `app.json`: Expo configuration file
- `tsconfig.json`: TypeScript configuration

## Usage Instructions

### Installation

1. Ensure you have Node.js (v14 or later) and npm installed.
2. Install Expo CLI globally:
   ```
   npm install -g expo-cli
   ```
3. Clone the repository and navigate to the project directory.
4. Install dependencies:
   ```
   npm install
   ```

### Getting Started

1. Start the development server:
   ```
   npm start
   ```
2. Use the Expo Go app on your mobile device to scan the QR code displayed in the terminal or run on an emulator.

### Configuration

- Update the `API_URL` in `app/(authenticated)/(tabs)/home.tsx` to point to your backend server.
- Modify `app.json` to customize the app name, version, and other Expo settings.

### Common Use Cases

1. User Authentication:
   - The app uses Clerk for authentication. Users can sign up or log in via the signup screen.

2. PIN Creation and Verification:
   - New users are prompted to create a PIN for added security.
   - Existing users must verify their PIN to access the app.

3. Viewing Account Balance and Transactions:
   - The home screen displays the user's KES and USDC balances.
   - Transaction history is shown, grouped by date.

4. Making Transactions:
   - Users can add money, withdraw, or pay others using the action buttons on the home screen.

### Testing & Quality

- Run tests using:
  ```
  npm test
  ```

### Troubleshooting

1. Issue: App crashes on startup
   - Ensure all dependencies are installed correctly
   - Check for any configuration errors in `app.json`
   - Verify that the API_URL is correct and the backend server is running

2. Issue: PIN verification fails
   - Clear the app data or reinstall the app
   - Ensure the device has a stable internet connection
   - Check the server logs for any API errors

3. Issue: Transactions not updating
   - Pull down to refresh on the home screen
   - Verify the API endpoint for fetching transactions is correct and responding

For debugging:
- Enable debug mode in Expo by shaking the device and selecting "Debug JS Remotely"
- Check the Metro bundler logs in the terminal for any error messages
- Use `console.log` statements to track the flow of data in components

## Data Flow

The application follows a typical client-server architecture for handling financial transactions and user data. Here's an overview of the data flow:

1. User Authentication:
   - User credentials are sent to Clerk authentication service
   - Clerk returns authentication tokens
   - App stores tokens securely for subsequent API calls

2. PIN Verification:
   - User enters PIN
   - PIN is verified against locally stored (hashed) PIN
   - If correct, user is granted access to the app

3. Fetching Account Data:
   - App sends authenticated request to backend API
   - Backend returns user's balance and transaction history
   - Data is displayed on the home screen

4. Performing Transactions:
   - User initiates a transaction (add, withdraw, pay)
   - Transaction details sent to backend API
   - Backend processes transaction and updates account
   - Updated balance and transaction list sent back to app
   - App updates UI with new data

```
[User] <-> [Clerk Auth] <-> [App] <-> [Backend API] <-> [Database]
                             ^
                             |
                        [Local Storage]
                        (PIN, Cache)
```

The app uses AsyncStorage for caching some data locally to improve performance and provide offline capabilities where possible. Sensitive data like PINs are stored securely using Expo's SecureStore.

## Infrastructure

The application uses the following key infrastructure components:

- Android Application:
  - Configured in `android/app/build.gradle`
  - Uses Gradle for build automation
  - Implements React Native's new architecture
  - Configures ProGuard for release builds to optimize and obfuscate the code
  - Supports various image formats (GIF, WebP) based on configuration

- iOS Application:
  - Configured through Xcode project files in the `ios/` directory
  - Uses CocoaPods for dependency management

- Expo:
  - Provides a managed workflow for React Native development
  - Configures both Android and iOS projects
  - Handles building and deploying to app stores

- Backend API:
  - Not included in this repository
  - Expected to handle authentication, transaction processing, and data storage

Note: Specific server-side infrastructure details are not provided in the given context and would need to be implemented separately.