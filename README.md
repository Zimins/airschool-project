# AirSchool - Flight School Platform

AirSchool is a React Native for Web prototype application that connects aspiring pilots with flight schools in Korea. Built with Expo and React Native Web, it provides a modern, responsive interface for browsing flight schools, reading reviews, and accessing community features.

## Features

- **Flight School Directory**: Browse and search flight schools across Korea
- **Detailed School Information**: View programs, facilities, location, and reviews
- **Community Board**: Share experiences and ask questions with fellow pilots
- **Study Materials Board**: Access and share aviation study resources
- **Review System**: Read and write reviews for flight schools
- **Responsive Design**: Works seamlessly on web, iOS, and Android

## Tech Stack

- **Framework**: React Native with Expo
- **Web Support**: React Native Web
- **Navigation**: React Navigation (Native Stack)
- **Routing**: Expo Router
- **Styling**: React Native StyleSheet with custom theme
- **TypeScript**: For type safety
- **Icons**: Expo Vector Icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (optional, but recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/airschool-project.git
cd airschool-project
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Running the Application

- **Web**: `npm run web` or press `w` in the Expo CLI
- **iOS**: `npm run ios` or press `i` in the Expo CLI (requires macOS and Xcode)
- **Android**: `npm run android` or press `a` in the Expo CLI (requires Android Studio)

## Deployment

### EAS (Expo Application Services) Deployment

This project is configured for deployment using EAS with project ID: `f565a3ab-2f02-4143-ae06-9410a6d0bf57`

#### Prerequisites

1. Install EAS CLI globally:
```bash
npm install -g eas-cli
```

2. Login to your Expo account:
```bash
eas login
```

3. Configure EAS (if not already configured):
```bash
eas build:configure
```

#### Build Commands

- **Web Build**:
```bash
eas build --platform web
```

- **iOS Build** (requires Apple Developer account):
```bash
eas build --platform ios
```

- **Android Build**:
```bash
eas build --platform android
```

- **All Platforms**:
```bash
eas build --platform all
```

#### Deploy Updates

EAS Update allows you to deploy JavaScript updates without rebuilding:

```bash
# Deploy to default branch
eas update

# Deploy to specific branch
eas update --branch preview
eas update --branch production

# Deploy with a message
eas update --message "Fixed navigation bug"
```

#### Local Web Build

To build and test the web version locally:

```bash
# Build static files
npm run build:web

# Serve locally (requires serve package)
npx serve web-build
```

The built files will be in the `web-build/` directory, which can be deployed to any static hosting service.

### Alternative Deployment Options

#### Vercel
```bash
npm i -g vercel
vercel
```

#### Netlify
1. Build the project: `npm run build:web`
2. Deploy the `web-build` folder to Netlify

## Project Structure

```
airschool-project/
├── app/                    # Expo Router pages
│   ├── community/         # Community board pages
│   ├── post/             # Post detail pages
│   ├── school/           # School detail pages
│   └── study-post/       # Study material pages
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation configuration
│   ├── data/           # Mock data and types
│   └── styles/         # Theme and global styles
├── assets/              # Images and static assets
└── web-build/          # Production build output
```

## Development

### Adding New Screens

1. Create a new screen component in `src/screens/`
2. Add the route in `app/` directory
3. Update navigation types if using TypeScript

### Styling

The project uses a centralized theme system defined in `src/styles/theme.ts`. Use theme values for consistent styling:

```typescript
import { theme } from '../styles/theme';

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
});
```

### Mock Data

All data is currently mocked in `src/data/mockData.ts`. In a production app, this would be replaced with API calls.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is a prototype and is not currently licensed for production use.

## Contact

For questions or support, please contact the development team.

---

Built with ❤️ using Expo and React Native