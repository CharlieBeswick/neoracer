import React from 'react';
import './DevLog.css'; // Styles for this component

interface DevLogProps {
  onBackToMenu: () => void;
}

// Define a type for log entries for structure
interface LogEntry {
  date: string;
  version: string;
  title: string;
  content: React.ReactNode; // Allows embedding JSX like <p>, <ul> etc.
}

// Array to hold log entries - add new entries to the top
const logEntries: LogEntry[] = [
  // --- Newest Entry --- 
  {
    date: '2024-05-17', // Placeholder date
    version: 'v0.4.0',
    title: 'Image-Based Pedal Controls & Mobile Layout Refinements',
    content: (
      <>
        <p>Replaced text-based accelerator/brake buttons with image-based pedals for a more immersive feel during gameplay.</p>
        <ul>
          <li>Implemented Gas (Accelerate), Brake, and placeholder Clutch pedals using image assets (`gaspedal.png`).</li>
          <li>Applied distinct neon glows: Green (Gas), Red (Brake), Orange (Clutch).</li>
          <li>Positioned Clutch and Gas pedals on the left, Brake pedal on the right using fixed pixel offsets for consistent mobile layout.</li>
          <li>Adjusted pedal size using `clamp()` for responsive scaling.</li>
          <li>Added `:active` state styling for visual feedback when pedals are pressed.</li>
          <li>Implemented `onContextMenu` prevention to disable the default image context menu on long-press (mobile).</li>
          <li>Updated conditional disabling logic based on game state (`isPaused`, `isEngineOn`, `isBraking`).</li>
        </ul>
      </>
    ),
  },
  // --- Most Recent --- 
  {
    date: '2024-05-16', // Placeholder date
    version: 'v0.3.0',
    title: 'Font Update, Menu Controls & Mode Screen Layout',
    content: (
      <>
        <p>This update focused on aesthetic improvements and UI adjustments based on feedback.</p>
        <ul>
          <li><strong>Global Font Change:</strong> Updated the application font to 'Texturina' (via Google Fonts) for a consistent look across all screens. Updated `index.html` and relevant CSS files.</li>
          <li><strong>Main Menu Controls:</strong> 
            <ul>
              <li>Added a Mute/Unmute button next to the Fullscreen button in the top-left corner.</li>
              <li>Refactored mute state management to `App.tsx`.</li>
              <li>Adjusted styling for control buttons.</li>
              <li>Restored full text ("Fullscreen" / "Exit Fullscreen") to the fullscreen button.</li>
            </ul>
          </li>
          <li><strong>Mode Selection Screen Layout:</strong> Refined the layout, image sizes, button sizes, and spacing to better utilize screen real-estate and improve appearance, especially addressing elements potentially going off-screen. Fixed text centering within buttons.</li>
          <li><strong>Dev Log Image:</strong> Added the concept art image (`devlog.png`) as the oldest entry in the Dev Log.</li>
          <li><strong>Bug Fix:</strong> Ensured the Dev Log page is scrollable by fixing a global `overflow: hidden` style on the `body`.</li>
        </ul>
      </>
    ),
  },
  // --- Most Recent --- 
  {
    date: '2024-05-15', // Placeholder
    version: 'v0.2.1',
    title: 'Dev Log Implementation & Scroll Fix',
    content: (
      <>
        <p>Added the Dev Log screen accessible from the main menu. Implemented a template for displaying log entries.</p>
        <ul>
          <li>Populated the first entry based on the previous update (v0.2.0).</li>
          <li>Made the Dev Log screen scrollable by removing 'overflow: hidden' from the body style in index.css.</li>
          <li>Fixed credit text on the main menu.</li>
        </ul>
      </>
    ),
  },
  {
    date: '2024-05-15', // Placeholder from previous log
    version: 'v0.2.0',
    title: 'Garage Implementation & UI Refinements',
    content: (
      <>
        <p>This update focuses on laying the groundwork for car customization and progression by introducing the Garage screen and making UI responsive.</p>
        <ul>
          <li><strong>New Screen: Garage:</strong> Added a dedicated garage screen accessible after selecting Single Player mode. Features include:
            <ul>
              <li>Display of the player car (scaled up, lights on, beam hidden).</li>
              <li>Buttons for future features: Profile, Store, Select Car, Tune (placeholders).</li>
              <li>Navigation buttons: Back to Menu, Start Race.</li>
              <li>Unique background artwork.</li>
            </ul>
          </li>
          <li><strong>UI/UX Improvements (Responsiveness):</strong>
            <ul>
              <li>Refactored CSS using viewport units (vw, vh, vmin) and clamp() for proportional scaling on Menu, Mode Selection, Garage, and Game screens.</li>
              <li>Added a fullscreen toggle button to the Main Menu & refactored state to App.tsx.</li>
              <li>Ensured button hover states and navigation work correctly, fixing z-index issues.</li>
            </ul>
          </li>
          <li><strong>New Screen: Dev Log Setup:</strong> Added basic structure and state handling (content added in v0.2.1).</li>
        </ul>
      </>
    ),
  },
  // --- Older Commits Based on Image --- 
  {
    date: '2024-05-14', // Placeholder
    version: 'v0.1.6',
    title: 'Mode Selection Screen',
    content: (
      <>
        <p>Introduced the Mode Selection screen after clicking "Play" on the main menu.</p>
        <ul>
          <li>Allows choosing between Singleplayer (leading to Garage) and Multiplayer (disabled placeholder).</li>
          <li>Features images for each mode and styled buttons with hover effects.</li>
          <li>Added a "Back" button to return to the main menu.</li>
          <li>Menu music persists on this screen.</li>
        </ul>
      </>
    ),
  },
   {
    date: '2024-05-13', // Placeholder
    version: 'v0.1.5',
    title: 'Race Logic Enhancements',
    content: (
      <>
        <p>Improved the core racing gameplay loop and added win/loss conditions.</p>
        <ul>
          <li>Implemented race countdown (3, 2, 1, GO!).</li>
          <li>Added basic opponent AI (simple acceleration).</li>
          <li>Defined race distance and implemented win/loss detection based on crossing the finish line.</li>
          <li>Added visual feedback for winning/losing.</li>
          <li>Included distance traveled logging in the console.</li>
        </ul>
      </>
    ),
  },
  {
    date: '2024-05-12', // Placeholder
    version: 'v0.1.4',
    title: 'Parallax Updates & Basic Race Logic',
    content: (
      <>
        <p>Refined background parallax effects and introduced initial player acceleration/deceleration.</p>
        <ul>
          <li>Adjusted speeds for different background layers (Sun, Mountains, Buildings, Road).</li>
          <li>Implemented player car physics: acceleration (button press), deceleration (coasting), braking (button press), and engine-off deceleration.</li>
          <li>Set MAX_SPEED for player.</li>
          <li>Linked background scrolling speed to player speed.</li>
        </ul>
      </>
    ),
  },
  {
    date: '2024-05-11', // Placeholder
    version: 'v0.1.3',
    title: 'Opponent Car Visuals & Fixes',
    content: (
      <>
        <p>Added the opponent car visually and refined particle/light effects.</p>
        <ul>
          <li>Added OpponentCar component with its own sprite and wheel positioning.</li>
          <li>Included particle emitters (idle/speed) for opponent.</li>
          <li>Added headlight/taillight sources and glows for opponent (with engine on/off states).</li>
          <li>Implemented dynamic positioning for opponent car based on relative distance (using lerp for smoothing).</li>
        </ul>
       </>
    ),
  },
   {
    date: '2024-05-10', // Placeholder
    version: 'v0.1.2',
    title: 'Audio & Wheel/Light Fixes',
    content: (
      <>
        <p>Integrated background music and sound effects, refined visual details.</p>
        <ul>
          <li>Added menu music loop.</li>
          <li>Added engine idle sounds (dual loop with delay) and high-speed race sound.</li>
          <li>Implemented mute functionality.</li>
          <li>Added engine on/off toggle logic and linked sounds/lights to engine state.</li>
          <li>Refined player car wheel spin animation based on speed.</li>
          <li>Added taillight trails and adjusted headlight/taillight glow positions/styles.</li>
        </ul>
      </>
    ),
  },
  {
    date: '2024-05-09', // Placeholder
    version: 'v0.1.1',
    title: 'Fullscreen & Orientation Lock',
    content: (
      <>
        <p>Added fullscreen capability and mobile orientation handling.</p>
        <ul>
          <li>Implemented fullscreen toggle button and logic within the Game component.</li>
          <li>Added screen orientation detection (landscape required).</li>
          <li>Included an overlay prompting users to rotate their device if not in landscape.</li>
          <li>Attempted screen orientation lock (best effort).</li>
        </ul>
      </>
    ),
  },
  {
    date: '2024-05-08', // Placeholder
    version: 'v0.1.0',
    title: 'Initial Commit & Core Gameplay Setup',
    content: (
      <>
        <p>Project setup and initial implementation of core game elements.</p>
        <ul>
          <li>Created React project using Vite + TypeScript.</li>
          <li>Set up basic component structure (App, Game, Menu, PlayerCar, Background layers).</li>
          <li>Added parallax scrolling background layers (Gradient, Sun, Mountains, Buildings, Road).</li>
          <li>Implemented PlayerCar component with basic sprite and wheel elements.</li>
          <li>Added particle effects (dust/smoke) linked to player speed.</li>
          <li>Included initial headlight/taillight glow effects.</li>
          <li>Added basic UI overlay in Game screen for speed display and controls.</li>
        </ul>
      </>
    ),
  },
  // --- Add Image Entry --- 
  {
    date: '2024-05-07', // Pre-initial commit date?
    version: 'v0.0.1',
    title: 'Project Concept / Inception',
    content: (
      <>
        <p>The initial concept and visual target for the NeoRacer project.</p>
        <img src="/assets/devlog.png" alt="Dev Log Image" className="devlog-entry-image" />
      </>
    ),
  }
];

const DevLog: React.FC<DevLogProps> = ({ onBackToMenu }) => {
  return (
    <div className="devlog-container">
      {/* Back Button - Use same style as menu fullscreen button */}
      <button onClick={onBackToMenu} className="menu-button menu-top-left-button">
        &lt; Back to Menu
      </button>

      <h1 className="devlog-title">NeoRacer Dev Log</h1>

      <div className="devlog-entries-container">
        {logEntries.map((entry, index) => (
          <div key={index} className="devlog-entry">
            <div className="devlog-entry-header">
              <h2>{entry.title}</h2>
              <span>{entry.date} | {entry.version}</span>
            </div>
            <div className="devlog-entry-content">
              {entry.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DevLog; 