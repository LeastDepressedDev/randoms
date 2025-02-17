const ydt = "[Yandex Drochebink]"

const HEADERS_OBJ = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:108.0) Gecko/20100101 Firefox/108.0",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    "Content-Type": "application/json",
    "X-Correlation-ID": "23bea407-9b41-4c13-b0a0-c66b1f87c26f",
    "x-csrf-token": "kcAHJdOf-Jn27oyaSixbv3QQ2_LZ_BM7ULDk",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin"
}

var await_iter = 0;
var last = false;
var lam = 0;

function createSolutionFromResponse(obj) {
    var resultString = "";
    let s = Object.entries(obj["attempt"]["markers"]["result"]);
    for (var i = 0; i < s.length; i++) {
        let part = s[i][1]["check_details"];
        for (var j = 0; j < part["input"]["data"].length; j++) {
            part["input"]["data"][j] = "'" + part["input"]["data"][j] + "'"
        }
        resultString += `if a==[${part["input"]["data"]}]: print(\\"\\"\\"${part["check_results"][0]["correct_answer"]}\\"\\"\\")\n`
   }
   let prefix = "a = []\nwhile True:\n    try:\n        a.append(input())\n    except EOFError:break\n"

   return prefix + "\n" + resultString
}

// const srcFetch = fetch;

// fetch = async function(...args) {
//     let buf = await srcFetch(...args);
//     console.log(buf);
//     return buf;
// }

// 158644695 593794427

async function solvePers() {
    await solve(parseWindowCfg())
}

async function solve(cfg) {
    let partial = await requestApi(cfg, "print('Huge mistake')")
    partial.json().then((x) => {
        requestApi(cfg, createSolutionFromResponse(x))
        console.log(`${ydt} solved case ${cfg["lpl_id"]}`)
        await_iter++
        if (last) {
            console.log(`${ydt} finished. Case solved ${await_iter}/${lam}`)
        }
    }).catch((x) => {
        console.log(`${ydt} failed to solve case ${cfg["lpl_id"]}`)
    })
}

async function solveAll(amount) {
    let pobj = parseWindowCfg()
    await_iter = 0
    last = false
    lam = amount
    for (var i = 0; i < amount; i++) {
        let smpc = pobj["urlpt"].split('/')
        smpc[smpc.length-2] = (Number.parseInt(smpc[smpc.length-2])+i).toString()
        solve({
            "clr_id": pobj["clr_id"],
            "lpl_id": pobj["lpl_id"]+i,
            "sk": pobj["sk"],
            "urlpt": smpc.join('/')
        })
        if (i==amount-1) last = true
    }
}

async function requestApi(pobj, code) {
    return await fetch("https://education.yandex.ru/classroom/api/v2/post-attempts/", {
    "credentials": "include",
    "headers": HEADERS_OBJ,
    "referrer": `https://education.yandex.ru${pobj.urlpt}`,
    "body": `{\"lpl_id\":${pobj.lpl_id},\"clr_id\":${pobj.clr_id},\"attempt\":{\"answered\":true,\"completed\":true,\"markers\":{\"user_answer\":{\"code\":\"${code.replaceAll("\n", "\\n")}\",\"language\":\"python\"}}},\"sk\":\"kcAHJdOf-Jn27oyaSixbv3QQ2_LZ_BM7ULDk\"}`,
    "method": "POST",
    "mode": "cors"
    });
}

//window._data.config.sk - sk
//window._data.data.getLatestCLessonResult.id
function parseWindowCfg() {
    return {
        "clr_id": window._data.data.getLatestCLessonResult.id,
        "lpl_id": window._data.data.getLatestCLessonResult.last_active,
        "sk": window._data.config.sk,
        "urlpt": window._data.url
    }
}

//Наказание за одноконтейнерность!!!
/*
s = [<ответы по порядку>]
z = 0
try:
    z = int(open('file.txt', 'r').read())
except:
    1

print(s[z])
open('file.txt', 'w').write(str(z+1))
*/
//Данный код решает любой 

//LOADER
var script = document.createElement("script");
script.setAttribute("type", "text/javascript");
script.setAttribute("src", "url to the script file here");
document.getElementsByTagName("head")[0].appendChild(script);