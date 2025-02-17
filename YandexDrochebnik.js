const ydt = "[Yandex Drochebink]"

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

async function solveAllC(amount) {
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
    "headers": {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:108.0) Gecko/20100101 Firefox/108.0",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/json",
        "X-Correlation-ID": "053e5b78-ec7a-4213-8eb7-9e060c22885c",
        "x-csrf-token": "DK0EIdgv-3cczqtrVTxo41P-XFqTz6aGj3FM",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin"
    },
    "referrer": `https://education.yandex.ru${pobj.urlpt}`,
    "body": `{\"lpl_id\":${pobj.lpl_id},\"clr_id\":${pobj.clr_id},\"attempt\":{\"answered\":true,\"completed\":true,\"markers\":{\"user_answer\":{\"code\":\"${code.replaceAll("\n", "\\n")}\",\"language\":\"python\"}}},\"sk\":\"kcAHJdOf-Jn27oyaSixbv3QQ2_LZ_BM7ULDk\"}`,
    "method": "POST",
    "mode": "cors"
    });
}

async function requestLessons(id) {
    return await fetch(`https://education.yandex.ru/classroom/api/get-course-student-lessons/${id}/?list_type=active&page_size=12`)
}

async function demolish() {
    let zv = await requestLessons(getCourse())
    let pobj = parseWindowCfg()
    zv.json().then(async (x) => {
        for (var i = 0; i < x.clessons.length; i++) {
            let id = x.clessons[i].id
            let xd = await fetch(`https://education.yandex.ru/classroom/api/get-latest-clesson-result/${id}/`)
            xd.json().then(async (y) => {
                let clr = y.id;
                (await fetch(`https://education.yandex.ru/classroom/api/get-clesson-run/${id}/`)).json().then(async (z) => {
                    for (var k = 0; k < z.problems.length; k++) {
                        let lpl = z.problems[k].id
                        let ggf = {
                            "clr_id": clr,
                            "lpl_id": lpl,
                            "sk": pobj["sk"],
                            "urlpt": `https://education.yandex.ru/classroom/courses/${getCourse()}/assignments/${id}/run/${k+1}/`
                        }
                        solve(ggf)
                    }
                });
            })
        }
    })
}

function getCourse() {
    return window._data.data.getCourse.id
}

//window._data.config.sk - sk
//window._data.data.getLatestCLessonResult.id
function parseWindowCfg() {
    return {
        "clr_id": window._data.data.getLatestCLessonResult?.id,
        "lpl_id": window._data.data.getLatestCLessonResult?.last_active,
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

//593479692 593479534
//158602081 158615971