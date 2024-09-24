# FunFacts Desktop Notifier

## Overview

The FunFacts Desktop Notifier is a simple Node.js application that fetches random fun facts from the internet and displays them as desktop notifications at regular intervals. This application also provides a configuration dashboard to customize notification settings such as the interval between notifications, types of facts, and caching options.

## Features

- **Fetch Fun Facts**: Automatically fetches fun facts from the API Ninjas service.
- **Desktop Notifications**: Displays fetched facts as desktop notifications at regular intervals.
- **Configuration Dashboard**: Allows customization of notification intervals, API key input, types of facts, caching amount, and scheduling through an interactive calendar.
- **Caching**: Caches a specified number of fun facts to minimize API calls.
- **API Key Management**: Easily manage and update your API key for fetching fun facts.

## How to Use

### Prerequisites
- **API Key**: Obtain an API key from API Ninjas (details below).

### Installation

1. **Download the Application**: Download the application package and extract it to your desired directory.
2. **Run the Application**: Start the application by running:
   ```bash
   npm start
   ```

### Configuration

1. **Open Dashboard**: Access the configuration dashboard by navigating to `http://localhost:50805` in your web browser.
2. **Set Interval**: Adjust the interval between notifications.
3. **Input API Key**: Enter your API key obtained from API Ninjas.
4. **Configure Schedules**: Use the interactive calendar to set notification schedules.
5. **Choose Fact Types**: Select the types of facts you wish to receive.
6. **Limit Cache Amount**: Set the maximum number of cached facts.
7. **Set Fetch Rate**: Adjust the rate at which new facts are fetched.

### Fetching and Displaying Fun Facts

- The application fetches fun facts at the specified interval and displays them as desktop notifications.
- Cached facts are used to minimize API calls and ensure a steady flow of notifications.

### How to Get an API Key from API Ninjas

1. **Visit API Ninjas**: Go to the [API Ninjas website](https://api-ninjas.com/).
2. **Sign Up/Login**: Create an account or log in if you already have one.
3. **Get API Key**: Navigate to the API section and generate an API key.
4. **Copy API Key**: Copy the provided API key and paste it into the configuration dashboard under the API key input section.

## Support

For any issues or questions, please refer to the support documentation provided with the application or contact the developer.
https://github.com/olamarvel/funfacts