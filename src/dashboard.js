const blessed = require("blessed");
const { giveMeANewWorker, killAWorker } = require("./workerControl.js");
const contrib = require("blessed-contrib");

const screen = blessed.screen({
  smartCSR: true,
  title: "Session Variables Dashboard",
});

function startDashboard() {
  // Define and configure your dashboard widgets here
  screen.append(box);

  screen.key(["C-c"], (ch, key) => {
    process.exit(0);
  });

  screen.key(["C-k"], (ch, key) => {
    killAWorker();
  });
  screen.key(["C-s"], (ch, key) => {
    giveMeANewWorker();
  });

  screen.render();
}

const log = contrib.log({
  parent: screen,
  width: "50%",
  height: "100%",
  border: "line",
  label: "Console Output",
  scrollable: false, // Disable scrolling
});

console.log = (...args) => {
  log.log(args.join(" ") + "\n");
  screen.render();
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

// Update the box with session variable values
function updateSessionVariables(freeMem, totalMem) {
  if (global.sessions) {
    const workerIds = Object.keys(global.sessions);
    const header = `Scraped: ${global.totalSaved}/${global.totalToScrape} (${
      global.subjectsToScrape.length
    } remaining).\nMemory: ${formatBytes(freeMem)}/${formatBytes(
      totalMem
    )}.\nBrowsers: ${
      Object.keys(global.browsers).length
    }.\nctrl-s => start worker\nctrl-k => kill worker\nctrl-c => exit\n`;
    const workerStatuses = workerIds.map((key) => {
      const s = global.sessions[key];
      if (s) {
        return `\n${key}: ${s.term}_${s.school}_${s.subject} -- (${s.courseN}/${s.courseT})}`;
      } else {
        return "";
      }
    });

    box.setContent(header + workerStatuses);
  } else {
    box.setContent(`No sessions`);
  }
  screen.render();
}

function formatBytes(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log2(bytes) / 10);
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

module.exports = {
  startDashboard,
  updateSessionVariables,
};
