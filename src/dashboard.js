const blessed = require("blessed");

const screen = blessed.screen({
  smartCSR: true,
  title: "Session Variables Dashboard",
});

function startDashboard() {
  // Define and configure your dashboard widgets here
  sessionsWindow(screen);

  screen.key(["C-c"], (ch, key) => {
    process.exit(0);
  });

  screen.render();
}

module.exports = {
  startDashboard,
};

// Get the screen width
const screenWidth = screen.width;

// Calculate the left position for the box widget
const boxLeft = Math.floor(screenWidth * 0.5); // Adjust the percentage as needed

// Create a box to display session variables
const box = blessed.box({
  top: "center",
  left: boxLeft,
  width: "50%",
  height: "100%",
  content: "Starting up...",
  tags: true,
  border: {
    type: "line",
  },
  style: {
    fg: "white",
    bg: "blue",
    border: {
      fg: "white",
    },
  },
});

function sessionsWindow() {
  // Call the updateSessionVariables function periodically
  setInterval(updateSessionVariables, 1000); // Update every second

  screen.append(box);
}

// Update the box with session variable values
function updateSessionVariables() {
  if (global.sessions) {
    const workerIds = Object.keys(global.sessions);
    const variables = workerIds
      .map((key) => {
        const s = global.sessions[key];
        return `Scraped: ${global.totalSaved}/${global.totalToScrape} (${global.subjectsToScrape.length} remaining).\n\n${key}: ${s.term}_${s.school}_${s.subject} -- (${s.courseN}/${s.courseT})}`;
      })
      .join("\n");
    box.setContent(variables);
  } else {
    box.setContent(`No sessions`);
  }
  screen.render();
}
