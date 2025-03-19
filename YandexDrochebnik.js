/**
 *              Instruction:
 *      1. Открываем любую страницу внутри курса
 *      2. Обновляем страницу
 *      3. Пастим этот скрипт в console
 *      4. Теперь у вас есть сила, способная решать примерно 10 задач в секунду
 * 
 * 
 * 
 * 
 * 
 * 
 */



const comSec = `
####################
#                  #
#   Fuck           #
#      The         #
#        Yandex    #
#  UwU             #
#       by qigan   #
#                  #
####################`


const ydt = "[Yandex Drochebink]"

var await_iter = 0;
var last = false;
var lam = 0;
var obbp = {}
var manual = false

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

function createSolutionFromResponse(obj, author) {
    var resultString;
    if (manual || author == undefined) {
        resultString = "s = ["
        for (var i = 0; i < obj.length; i++) {
            resultString += `"""${obj[i].correct_answer.replaceAll("\"", "\\\"")}""",`
        }
        resultString = resultString.substring(0, resultString.length-1) + "]\n"
        resultString += "z = 0\ntry:\n    z = int(open('file.txt', 'r').read())\nexcept:\n    pass\nprint(s[z])\nopen('file.txt', 'w').write(str(z+1))\n"
    } else {
        resultString = author
    }
    return comSec + "\n" + resultString
}

// const srcFetch = fetch;

// fetch = async function(...args) {
//     let buf = await srcFetch(...args);
//     console.log(buf);
//     return buf;
// }

// 158644695 593794427


async function solve(lesson, num) {
    var pobj = parseWindowCfg()
    let xd = await fetch(`https://education.yandex.ru/classroom/api/get-latest-clesson-result/${lesson}/`)
    xd.json().then(async (y) => {
        let clr = y.id;
        (await fetch(`https://education.yandex.ru/classroom/api/get-clesson-run/${lesson}/`)).json().then(async (z) => {
            //setTimeout(async () => {
                for (var k = 0; k < z.problems.length; k++) {
                    let lpl = z.problems[k].id
                    let solution = z.problems[k].problem.markup?.inputs
                    let layout = z.problems[k].problem.markup?.layout
                    let asws = z.problems[k].problem.markup?.answers
                    let author = z.problems[k].problem.markup?.languages
                    if (author != undefined) author = author[0]?.author_solution
                    let ggf = {
                        "clr_id": clr,
                        "lpl_id": lpl,
                        "sk": pobj["sk"],
                        "urlpt": `https://education.yandex.ru/classroom/courses/${getCourse()}/assignments/${lesson}/run/${k + 1}/`,
                        "lesson": lesson
                    }
                    if (num == 0 || num == k+1) {
                        if (solution != undefined || author != undefined) {
                            try {
                                (await postSolution(ggf, createSolutionFromResponse(solution, author))).json()
                                .then((x) => {
                                    console.log(`${ydt} solved ${lpl}`)
                                })
                                .catch((x) => console.log(`${ydt} failed ${lpl}`));
                            } catch (ex) {
                                console.log(`Error occured on ${lpl}`)
                                console.log(ex)
                            }
                        }
                        try {
                            builder_asw = "\\\"{"
                            if (asws != undefined) {
                                for (var v of layout) {
                                    if (v?.kind != "text") {
                                        let asw = asws[v.content.id]
                                        switch (v.content.type) {
                                            case "choice":
                                                builder_asw+=`\\\"${v.content.id}\\\":{\\"user_answer\\":${asw instanceof Array && asw.length > 1 ? asw : "[" + asw + "]"}}`
                                            break
                                        }
                                        obbp = asw
                                        console.log(`${v?.content?.id} - ${v?.content?.type}`)
                                        console.log(obbp)
                                    }
                                   
                                }
    
    
                                
                                continue
                                (await solvePresentation(ggf, asw_builder)).json()
                                .then((x) => {
                                    console.log(`${ydt} solved ${lpl}`)
                                })
                                .catch((x) => console.log(`${ydt} failed ${lpl}`));
                                }
                        } catch (ex) {
                            console.log(ex)
                        }
                    }
                }
            //}, 1000);
        });
    })
}

async function postSolution(pobj, code) {
    return await fetch("https://education.yandex.ru/classroom/api/v2/post-attempts/", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:108.0) Gecko/20100101 Firefox/108.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "X-Correlation-ID": "2eb741d7-6f2a-43ab-bcea-7b1e57391bf2",
            "x-csrf-token": pobj["sk"],
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin"
        },
        "referrer": `https://education.yandex.ru${pobj.urlpt}`,
        "body": `{\"lpl_id\":${pobj.lpl_id},\"clr_id\":${pobj.clr_id},\"attempt\":{\"answered\":true,\"completed\":true,\"markers\":{\"user_answer\":{\"code\":\"${code.replaceAll("\\", "\\\\").replaceAll("\n", "\\n").replaceAll("\"", "\\\"")}\",\"language\":\"python\"}}},\"sk\":\"${pobj["sk"]}\"}`,
        "method": "POST",
        "mode": "cors"
    });
}

async function requestLessons(id) {
    return await fetch(`https://education.yandex.ru/classroom/api/get-course-student-lessons/${id}/?list_type=active&page_size=12`)
}

async function demolish() {
    let zv = await requestLessons(getCourse())
    zv.json().then(async (x) => {
        for (var i = 0; i < x.clessons.length; i++) {
            let id = x.clessons[i].id
            solve(id, 0)
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

async function solvePresentation(pobj, answer) {

    await fetch("https://education.yandex.ru/classroom/api/patch-clesson-results/", {
    "credentials": "include",
    "headers": {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:108.0) Gecko/20100101 Firefox/108.0",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/json",
        "X-Correlation-ID": "ab29b60f-2170-4e68-acc6-394dbed0b012",
        "x-csrf-token": pobj["sk"],
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin"
    },
    "referrer": "https://education.yandex.ru/classroom/courses/14242470/assignments/249234592/run/5/",
    "body": `{\"clessonId\":${pobj["lesson"]},\"isEvaluable\":null,\"problemLinkId\":${pobj["lpl_id"]},\"resultId\":${pobj["clr_id"]},\"answered\":true,\"completed\":true,\"dateUpdated\":\"2025-02-19T09:24:37.273372Z\",\"answer\":\"${answer}\",\"sk\":\"${pobj["sk"]}\"}`,
    "method": "POST",
    "mode": "cors"
});
}

