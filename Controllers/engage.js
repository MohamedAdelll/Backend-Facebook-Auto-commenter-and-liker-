const puppeteer = require("puppeteer-core");
const fetch = require("node-fetch");
const os = require("os");
const API = "http://localhost:3000";

let userDataDir = "";
let executablePath = "";
if (os.platform() === "win32") {
  userDataDir = `C:\\Users\\${
    os.userInfo().username
  }\\AppData\\Local\\Google\\Chrome\\User Data`;
  executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
} else if (os.platform() === "darwin") {
  executablePath =
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  userDataDir = "~/Library/Application Support/Google/Chrome/Default";
} else if (os.platform() === "linux") {
  executablePath = "/usr/bin/google-chrome";
  userDataDir = "~/.config/google-chrome/Default";
}
async function engage(body) {
  try {
    const { reactsObj } = body;
    const { maxFriends } = body;
    let { timeBetweenEngagement } = body;
    timeBetweenEngagement = +timeBetweenEngagement;
    const browser = await puppeteer.launch({
      executablePath,
      userDataDir,
      defaultViewport: false,
    });
    const page = await browser.newPage();
    await page.goto("https://www.facebook.com", {
      waitUntil: "networkidle2",
    });

    let index = 0;
    let friends = 0;
    while (friends < maxFriends) {
      let topReaction = await page.evaluate((index) => {
        const articles = Array.from(
          document.querySelectorAll(".x1ja2u2z.xh8yej3.x1n2onr6.x1yztbdb")
        );
        const toolBar = articles[index]?.querySelector(
          '[aria-label="See who reacted to this"]'
        );
        const topReactionEl =
          toolBar?.querySelector("[aria-label$='people']") ||
          toolBar?.querySelector("[aria-label$='person']");
        return (
          topReactionEl?.getAttribute("aria-label").split(":")[0] || "Like"
        );
      }, index);
      topReaction = topReaction.toLowerCase();
      await delay(1);
      const { Bool, engagedWith } = (await isFriend(
        index,
        page,
        timeBetweenEngagement
      )) || { Bool: false };
      await delay(timeBetweenEngagement / 6);
      if (Bool) {
        friends++;
        body.cred = { ...body.cred, engagedWith, topReaction };
        await doAReaction(topReaction, index, page, timeBetweenEngagement);
        await postReaction(body.cred);
        await delay(timeBetweenEngagement / 6);
        const msgIndex = Math.floor(
          Math.random() * reactsObj[topReaction].length
        );
        const msg = reactsObj[topReaction][msgIndex];
        await writeAComment(msg, index, page, timeBetweenEngagement);
        await postComment(body.cred, msg);
        await delay(timeBetweenEngagement / 6);
      } else {
        await page.evaluate(() => window.scrollBy(0, 500));
      }
      index++;
    }
  } catch (error) {
    return;
    // throw error;
  }
}

async function doAReaction(topReaction, index, page, timeBetweenEngagement) {
  try {
    await delay(1);
    const currArticle = await Array.from(
      await page.$$(".x1ja2u2z.xh8yej3.x1n2onr6.x1yztbdb")
    )[index];
    const likeButton = await currArticle?.$(`[aria-label="Like"]`);
    if (likeButton === null || likeButton === undefined) return;
    await likeButton.hover();
    await delay(timeBetweenEngagement / 6);
    const ReactionEl = await page?.$(
      `div[aria-label="Reactions"] [aria-label="${
        topReaction.slice(0, 1).toUpperCase() + topReaction.slice(1)
      }"]`
    );
    await ReactionEl?.click();
    await delay(3);
  } catch (error) {
    return;
  }
}

async function writeAComment(msg, index, page, timeBetweenEngagement) {
  try {
    await delay(1);
    const currArticle = await Array.from(
      await page?.$$(".x1ja2u2z.xh8yej3.x1n2onr6.x1yztbdb")
    )[index];
    const commentButton = await currArticle?.$(
      '[aria-label="Leave a comment"]'
    );
    if (!commentButton) return;
    commentButton.click();
    await delay(timeBetweenEngagement / 6);
    await page.keyboard.type(msg + " ", { delay: 200 });
    await page.keyboard.press("Enter");
  } catch (error) {
    return;
  }
}

async function isFriend(index, page, timeBetweenEngagement) {
  try {
    const currArticle = await Array.from(
      await page?.$$(".x1ja2u2z.xh8yej3.x1n2onr6.x1yztbdb")
    )[index];
    const name = await currArticle?.$(
      'a[role="link"][aria-label]:not([aria-label=""])'
    );
    if (!name) return { Bool: false };
    await name?.hover();
    await delay(timeBetweenEngagement / 6);
    const dialog = await page.$('[aria-label="Link preview"]');
    const isFriend = await dialog?.$('[aria-label="Friends"]');
    if (!isFriend) return { Bool: false };
    const engagedWith = await page.evaluate((index) => {
      const currArticle = document.querySelectorAll(
        ".x1ja2u2z.xh8yej3.x1n2onr6.x1yztbdb"
      )[index];
      return currArticle
        .querySelector('a [role="link"][aria-label]:not([aria-label=""])')
        ?.getAttribute("aria-label");
    }, index);
    return { Bool: true, engagedWith };
  } catch (error) {
    return;
  }
}

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time * 1000);
  });
}

async function postComment(body, msg) {
  try {
    const { token } = body;
    const session = body.session.valueOf() || body.session.toHexString();
    const obj = {
      like: false,
      comment: msg,
      topReaction: body.topReaction,
      session,
      engagedWith: body.engagedWith,
    };
    const objStr = JSON.stringify(obj);
    await fetch(`${API}/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `bearer ${token}`,
      },
      body: objStr,
    });
  } catch (error) {}
}
async function postReaction(body) {
  try {
    const { token } = body;
    const session = body.session.valueOf() || body.session.toHexString();
    const obj = {
      like: true,
      topReaction: body.topReaction,
      session,
      engagedWith: body.engagedWith,
    };
    const objStr = JSON.stringify(obj);
    await fetch(`${API}/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `bearer ${token}`,
      },
      body: objStr,
    });
  } catch (error) {}
}

module.exports = function (body) {
  return {
    engage: engage(body),
  };
};
