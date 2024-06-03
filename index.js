const puppeteer = require("puppeteer");
const cron = require("node-cron");

const LEETCODE_USERNAME = "avinash_reddy157";
const LEETCODE_PASSWORD = "reddy555...";
const PROBLEM_URL = "https://leetcode.com/problems/two-sum/";
const SOLUTION_CODE = `class Solution {
public:
vector<int> twoSum(vector<int>& nums, int target) {
for(int i=0;i<nums.size();i++){
for(int j=i+1;j<nums.size();j++){
if(nums[i]+nums[j]==target)
return {i,j};
}
}
return {};
}
};`;

let isTaskRunning = false;

async function submitLeetCodeSolution() {
  if (isTaskRunning) {
    console.log("Task is already running. Skipping new task trigger.");
    return;
  }

  isTaskRunning = true;
  console.log("Starting the LeetCode solution submission process");

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Login to LeetCode
    console.log("Navigating to LeetCode login page");
    await page.goto("https://leetcode.com/accounts/login/", {
      waitUntil: "networkidle2",
    });

    // Verify the login page has loaded
    await page.waitForSelector('input[name="login"]', { visible: true });
    await page.waitForSelector('input[name="password"]', { visible: true });
    console.log("Login page loaded");

    // Enter login details
    console.log("Entering login details");
    await page.type("#id_login", LEETCODE_USERNAME);
    await page.type("#id_password", LEETCODE_PASSWORD);
    await page.screenshot({ path: "login.png" });

    // Wait for the verification to complete
    console.log("Waiting for verification to complete");
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait for 60 seconds to allow verification to complete

    // Click login button
    console.log("Clicking login button");
    await page.evaluate(() => {
      const signInButton = document.evaluate(
        '//span[text()="Sign In"]',
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
      if (signInButton) {
        signInButton.click();
      } else {
        throw new Error("Sign In button not found");
      }
    });
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    console.log("Logged in successfully");

    // Navigate to problem page
    console.log("Navigating to the problem page");
    await page.goto(PROBLEM_URL, { waitUntil: "networkidle2" });

    // Verify the problem page has loaded
    await page.waitForSelector(
      `#editor > div.flex.flex-1.flex-col.overflow-hidden.pb-2 >
    div.flex-1.overflow-hidden > div > div > div.overflow-guard >
    div.monaco-scrollable-element.editor-scrollable.vs-dark
    `,
      {
        visible: true,
        timeout: 60000,
      }
    );
    console.log("Problem page loaded");

    // Paste the solution code
    console.log("Pasting the solution code");
    const codeMirror =
      await page.$(`#editor > div.flex.flex-1.flex-col.overflow-hidden.pb-2 >
    div.flex-1.overflow-hidden > div > div > div.overflow-guard >
    div.monaco-scrollable-element.editor-scrollable.vs-dark
    `);
    await codeMirror.click();
    await page.keyboard.down("Control");
    await page.keyboard.press("A");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    await page.keyboard.type(SOLUTION_CODE, { delay: 50 });
    await page.keyboard.down("Shift");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Backspace");

    // Submit the solution
    console.log("Submitting the solution");
    await page.click(
      `#ide-top-btns > div:nth-child(1) > div > div > div:nth-child(2) > div > div:nth-child(2) > div > div:nth-child(3) > div:nth-child(3) > div > button > span`
    );
    //await page.waitForTimeout(5000); // Wait for the submission to complete
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    console.log("Solution submitted successfully");
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await browser.close();
    console.log("Browser closed");
    isTaskRunning = false;
  }
}

// Schedule the task to run every minute
cron.schedule("* * * * *", async () => {
  console.log("Scheduled task triggered");
  await submitLeetCodeSolution();
});

console.log("Cron job scheduled to run every minute");
