const getBalance = require("../modules/getBalance");
const getListReload = require("../modules/getListReload");
const collectEgg = require("../modules/collectEgg");
const layEgg = require("../modules/layEgg");
const getGoldenDuckInfo = require("../modules/getGoldenDuckInfo");
const getGoldenDuckReward = require("../modules/getGoldenDuckReward");
const claimGoldenDuck = require("../modules/claimGoldenDuck");
const goldenDuckRewardText = require("../modules/goldenDuckRewardText");
const collectDuck = require("../modules/collectDuck");
const randomSleep = require("../modules/randomSleep");
const addLog = require("../modules/addLog");
const randomUseragent = require("random-useragent");
const Timer = require("easytimer.js").Timer;

const ua = randomUseragent.getRandom((ua) => {
  return ua.browserName === "Chrome";
});
// console.log(ua);

const ERROR_MESSAGE = "Chup man hinh va tao issue Github de tui tim cach fix";

const RARE_EGG = [
  undefined,
  "Common *",
  "Common **",
  "Rare *",
  "Rare **",
  "Rare ***",
  "Rare ****",
  "Rare *****",
  "Rare ******",
  "Mythic *",
  "Mythic **",
  "Mythic ***",
  "Mythic ****",
  "Eternal",
];

let accessToken = null;
let run = false;
let timerInstance = new Timer();
let eggs = 0;
let pets = 0;
let goldenDuck = 0;
let timeToGoldenDuck = 0;
let myInterval = null;
let wallets = null;
let balanceEgg = 0;
let balancePet = 0;
let msg = null;

function getDuckToLay(ducks) {
  const duck = ducks.reduce((prev, curr) =>
    prev.last_active_time < curr.last_active_time ? prev : curr
  );

  return duck;
}

async function collectFromListInternal(token, listNests, listDucks) {
  const randomIndex = Math.floor(Math.random() * listNests.length);
  // console.log(randomIndex);
  const nest = listNests[randomIndex];
  // console.log(nest);
  const nestStatus = nest.status;
  const duck = getDuckToLay(listDucks);

  if (nestStatus === 2) {
    const collectEggData = await collectEgg(token, ua, nest.id);
    // console.log("collectEggData", collectEggData);

    if (collectEggData.error_code !== "") {
      const error_code = collectEggData.error_code;
      console.log("collectEggData error", error_code);

      switch (error_code) {
        case "DUPLICATE_REQUEST":
          await randomSleep();
          collectFromList(token, listNests, listDucks);
          break;
        case "THIS_NEST_DONT_HAVE_EGG_AVAILABLE":
          const layEggData = await layEgg(token, ua, nest.id, duck.id);

          listNests = listNests.filter((n) => n.id !== nest.id);
          listDucks = listDucks.filter((d) => d.id !== duck.id);

          await randomSleep();
          collectFromList(token, listNests, listDucks);
          break;
        default:
          console.log(ERROR_MESSAGE);
          await randomSleep();
          harvestEggGoldenDuck(token);
          break;
      }
    } else {
      const layEggData = await layEgg(token, ua, nest.id, duck.id);
      // console.log("layEggData", layEggData);

      if (layEggData.error_code !== "") {
        const error_code = layEggData.error_code;
        console.log("layEggData error", error_code);

        switch (error_code) {
          case "THIS_DUCK_NOT_ENOUGH_TIME_TO_LAY":
            await randomSleep();
            collectFromList(token, listNests, listDucks);
            break;
          case "THIS_NEST_IS_UNAVAILABLE":
            await randomSleep();
            harvestEggGoldenDuck(token);
            break;
          default:
            await randomSleep();
            harvestEggGoldenDuck(token);
            break;
        }
      } else {
        const rareEgg = RARE_EGG[nest.type_egg];
        msg = `Da thu hoach [ NEST 🌕 ${nest.id} ] : [ EGG 🥚 ${rareEgg} ]`;
        console.log(msg);

        balanceEgg++;
        eggs++;

        listNests = listNests.filter((n) => n.id !== nest.id);
        listDucks = listDucks.filter((d) => d.id !== duck.id);

        await randomSleep();
        collectFromList(token, listNests, listDucks);
      }
    }
  } else if (nestStatus === 3) {
    console.log(
      `[ NEST 🌕 ${nest.id} ] dang ap trung > tu dong thu hoach vit de tiep tuc`
    );
    const collectDuckData = await collectDuck(token, ua, nest.id);

    const duck = getDuckToLay(listDucks);
    const layEggData = await layEgg(token, ua, nest.id, duck.id);

    listNests = listNests.filter((n) => n.id !== nest.id);
    listDucks = listDucks.filter((d) => d.id !== duck.id);

    await randomSleep();
    harvestEggGoldenDuck(token);
  } else {
    console.log(nest);
    console.log("Loi nay tui chua nghi den");
    console.log(ERROR_MESSAGE);
  }
}

async function collectFromList(token, listNests, listDucks) {
  if (timeToGoldenDuck <= 0) {
    clearInterval(myInterval);
    myInterval = null;
    harvestEggGoldenDuck(token);
  } else {
    if (listNests.length === 0)
      return console.clear(), harvestEggGoldenDuck(token);

    return collectFromListInternal(token, listNests, listDucks);
  }
}

async function harvestEggGoldenDuck(token) {
  accessToken = token;

  if (!run) {
    wallets = await getBalance(accessToken, ua);
    wallets.forEach((w) => {
      if (w.symbol === "EGG") balanceEgg = Number(w.balance);
      if (w.symbol === "PET") balancePet = Number(w.balance);
    });
    timerInstance.start();
    run = true;
  }

  console.log("[ ALL EGG AND GOLDEN DUCK MODE ]");
  console.log();
  console.log("Link Tool : [ j2c.cc/quack ]");
  console.log(
    `Ban dang co : [ ${balanceEgg.toFixed(2)} EGG 🥚 ] [ ${balancePet.toFixed(
      2
    )} PET 🐸 ]`
  );
  console.log();
  console.log(
    `Thoi gian chay : [ ${timerInstance
      .getTimeValues()
      .toString(["days", "hours", "minutes", "seconds"])} ]`
  );
  console.log(
    `Tong thu hoach : [ ${eggs.toFixed(2)} EGG 🥚 ] [ ${pets.toFixed(
      2
    )} PET 🐸 ]`
  );
  console.log();

  if (timeToGoldenDuck <= 0) {
    const getGoldenDuckInfoData = await getGoldenDuckInfo(accessToken, ua);
    // console.log("getGoldenDuckInfoData", getGoldenDuckInfoData);

    if (getGoldenDuckInfoData.error_code !== "") {
      console.log(
        "getGoldenDuckInfoData error",
        getGoldenDuckInfoData.error_code
      );
      console.log(ERROR_MESSAGE);
    } else {
      if (getGoldenDuckInfoData.data.time_to_golden_duck === 0) {
        clearInterval(myInterval);

        console.log("[ GOLDEN DUCK 🐥 ] : ZIT ZANG xuat hien");
        const getGoldenDuckRewardData = await getGoldenDuckReward(
          accessToken,
          ua
        );

        const { data } = getGoldenDuckRewardData;
        if (data.type === 0) {
          msg = "Chuc ban may man lan sau";
          console.log(`[ GOLDEN DUCK 🐥 ] : ${msg}`);
          addLog(msg, "golden");
        } else if (data.type === 1 || data.type === 4) {
          msg = goldenDuckRewardText(data);
          console.log(`[ GOLDEN DUCK 🐥 ] : ${msg}`);
          addLog(msg, "golden");
        } else {
          const claimGoldenDuckData = await claimGoldenDuck(accessToken, ua);

          goldenDuck++;

          if (data.type === 2) {
            pets += Number();
            balancePet += Number(data.amount);
          }
          if (data.type === 3) {
            eggs += Number(data.amount);
            balanceEgg += Number(data.amount);
          }

          msg = goldenDuckRewardText(data);
          console.log(`[ GOLDEN DUCK 🐥 ] : ${msg}`);
          addLog(msg, "golden");
        }
      } else {
        timeToGoldenDuck = getGoldenDuckInfoData.data.time_to_golden_duck;

        myInterval = setInterval(() => {
          timeToGoldenDuck--;
        }, 1e3);
      }
    }
  }
  msg = `[ GOLDEN DUCK 🐥 ] : [ ${goldenDuck} 🐥 ] | ${timeToGoldenDuck}s nua gap`;
  console.log(msg);

  const { listNests, listDucks } = await getListReload(
    accessToken,
    ua,
    run ? false : true
  );

  const nestIds = listNests.map((i) => i.id);
  console.log(`[ ${listNests.length} NEST 🌕 ] : [ ${nestIds.join(", ")} ]`);
  console.log();
  collectFromList(accessToken, listNests, listDucks);
}

module.exports = harvestEggGoldenDuck;
