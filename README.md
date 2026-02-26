# Daily Stand-up Timer

An animated web application for managing daily stand-up meetings with configurable participant timers and visual progress indicators.

## Features

- **Dark Theme by Default**: Clean, minimal dark theme designed for developers with light theme toggle
- **Persistent Configuration**: Automatically saves and restores your last loaded config
- **JSON Configuration**: Load participant names and time allocations from a JSON file
- **Random Order**: Participants are automatically shuffled each time the config loads
- **Drag & Drop Reordering**: Click and drag participants to reorder the queue in real-time
- **Animated Timer**: Visual countdown with color-coded warnings (teal → yellow → red)
- **Progress Bar**: Animated progress indicator for current speaker
- **Queue Display**: See who's speaking now and who's up next
- **Real-time Stats**: Track current position, remaining participants, and total time
- **Audio Notifications**: Beep sound when time is up
- **Pause/Resume**: Full control over the meeting flow
- **Responsive Design**: Clean UI that fits perfectly in the viewport

## Getting Started

### 1. Quick Start

Simply open `index.html` in your web browser. The app will automatically load the configuration from `config.json` and you can start your stand-up immediately!

```bash
# Option 1: Open directly (double-click index.html)
open index.html

# Option 2: Use a simple HTTP server
python3 -m http.server 8000
# Then visit http://localhost:8000
```

### 2. Customizing Configuration

Click the "Edit Configuration" button at the bottom of the page to open the built-in config editor. You can:
- Edit participants and times directly in the dialog
- Click "Reset to Default" to restore the original config
- Changes are automatically saved to localStorage

**Simple Format (with default duration):**
```json
{
  "defaultDuration": 120,
  "participants": [
    {"name": "Alice Johnson"},
    {"name": "Bob Smith"},
    {"name": "Charlie Davis"}
  ]
}
```

**Custom Format (individual durations):**
```json
{
  "defaultDuration": 120,
  "participants": [
    {"name": "Alice Johnson"},
    {"name": "Bob Smith", "duration": 90},
    {"name": "Charlie Davis"}
  ]
}
```

**Configuration Format:**
- `defaultDuration`: Number (optional) - Default time in seconds for all participants
- `participants`: Array of participant objects
  - `name`: String (required) - The participant's name
  - `duration`: Number (optional) - Time allocation in seconds (overrides defaultDuration)

If `defaultDuration` is set, participants without a `duration` will use the default value. Participants can still override this by specifying their own `duration`.

See `config-simple.example.json` for a simpler example with all participants using the same duration.

### 3. Run Your Stand-up

The configuration loads automatically when you open the app. Simply click **Start** to begin!

**To load a different configuration file:**
1. Click the "Load Custom Config" button at the bottom of the page
2. Select a different JSON configuration file
3. Click "Start" to begin the timer

**Controls:**
- **Theme Toggle**: Click the ☀️/🌙 icon in the top-right to switch between dark and light themes
- **Start**: Begin the timer
- **Pause/Resume**: Temporarily stop/continue the timer
- **Reset**: Restart from the beginning (shuffles participants again)
- **← Back**: Go back to the previous speaker at their last time (blue button below timer)
- **+30s**: Add 30 seconds to the current speaker's time (teal button below timer)
- **Next →**: Move to the next speaker immediately (yellow button below timer)
- **Edit Configuration**: Open the built-in config editor dialog (at bottom of page)
- **Drag & Drop**: Click and drag any participant to reorder the queue

## Features Explained

### Configuration Editor
Click "Edit Configuration" at the bottom to open the built-in editor dialog:
- **Live Editor**: Edit your config in JSON format with syntax highlighting
- **Validation**: Automatic validation with helpful error messages
- **Reset to Default**: One-click restore to original config
- **Auto-save**: Changes are saved to localStorage automatically
- **Preview**: Apply changes and see them immediately

### Dark Theme
The app defaults to a clean, minimal dark theme designed for developers:
- **Dark Mode**: Easy on the eyes with `#1a1a1a` background and teal accents
- **Light Mode**: Click the theme toggle (☀️/🌙) in the top-right corner
- **Persistent**: Your theme preference is saved in localStorage

### Timer Controls
While the stand-up is running, you have quick access to three control buttons:
- **← Back (Blue)**: Made a mistake or someone got skipped? Go back to the previous speaker. Their timer will restore to exactly where it was when you moved forward. You can go back multiple times through the history.
- **+30s (Green)**: Sometimes someone needs a bit more time. Click this to add 30 seconds to the current speaker's timer. Can be clicked multiple times.
- **Next → (Orange)**: If someone is done early or ready to move on, advance to the next person. Plays a notification sound and marks the current speaker as completed.

### Random Order
Every time you load or reset the configuration, participants are automatically shuffled into a random order. This ensures fairness and variety in your daily stand-ups!

### Drag & Drop Reordering
- **Grab Handle**: Each participant has a `⋮⋮` icon on the left
- **Click & Drag**: Click and hold on any participant, then drag to reorder
- **Live Updates**: The queue updates in real-time, even during an active stand-up
- **Visual Feedback**: Items being dragged show reduced opacity, drop targets show a blue line

### Visual Indicators

- **Green Timer**: More than 50% time remaining
- **Yellow Timer**: 20-50% time remaining (warning)
- **Red Timer**: Less than 20% time remaining (danger - shakes!)

### Participant List

- **Gray Background**: Waiting
- **Purple Gradient**: Currently speaking
- **Light Green**: Completed
- **Drag Handle (`⋮⋮`)**: Grab to reorder participants

### Stats Panel

- **Current**: Shows X of Y participants
- **Remaining**: Number of people left to speak
- **Total Time**: Remaining time for entire stand-up (MM:SS)

## Example Configurations

### Quick Stand-up (1 min each - using default)
```json
{
  "defaultDuration": 60,
  "participants": [
    {"name": "Alex"},
    {"name": "Blake"},
    {"name": "Casey"}
  ]
}
```

### Standard Stand-up (2 min each - using default)
```json
{
  "defaultDuration": 120,
  "participants": [
    {"name": "Developer 1"},
    {"name": "Developer 2"},
    {"name": "Designer"}
  ]
}
```

### Variable Time Stand-up (mix of default and custom)
```json
{
  "defaultDuration": 120,
  "participants": [
    {"name": "Project Manager", "duration": 300},
    {"name": "Senior Dev", "duration": 180},
    {"name": "Junior Dev", "duration": 90},
    {"name": "QA Engineer"}
  ]
}
```

### No Default (all custom durations)
```json
{
  "participants": [
    {"name": "Team Lead", "duration": 180},
    {"name": "Developer", "duration": 120},
    {"name": "Designer", "duration": 90}
  ]
}
```

## Keyboard Shortcuts

Currently, all controls are button-based. Keyboard shortcuts may be added in future versions.

## Browser Compatibility

Works in all modern browsers that support:
- ES6 JavaScript
- CSS Grid and Flexbox
- Web Audio API

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Customization

### Changing Colors

Edit `styles.css` to customize the color scheme. Main gradient colors are defined at:
- Line 8: Body background gradient
- Line 23: Header gradient
- Line 113: Progress bar gradient

### Adjusting Animation Speed

Modify animation durations in `styles.css`:
- Line 79: Fade-in animation
- Line 88: Pulse animation for speaker name
- Line 103: Timer shake animation

### Changing Sound

The notification sound is generated in `app.js` at line 243. Modify the `playNotificationSound()` function to change frequency, duration, or type.

## License

MIT License - Feel free to use and modify for your team's needs!

## Contributing

This is a standalone project. Feel free to fork and customize for your team's specific requirements.
