# Snap2Chef

Snap2Chef is an AI-powered web app that identifies food items from photos or voice commands and instantly generates detailed recipes with step-by-step instructions and cooking videos, using Google Gemini and Firebase.

## Features
- Upload a photo or use your camera to identify food
- Use voice commands to describe food items
- AI-powered food recognition and recipe generation
- Step-by-step instructions and cooking videos
- User authentication and history (via Firebase)

## Getting Started

### 1. Install dependencies
```
npm install
```

### 2. Set up Firebase
- Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
- Enable Authentication, Firestore, and Storage
- Copy your Firebase config to `src/firebase.js` (file to be created)

### 3. Set up Google Gemini API
- Get access to Google Gemini API for image and text analysis
- Store your API key securely (do not commit to source control)

### 4. Run the app
```
npm start
```

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and uses Firebase for backend services. 