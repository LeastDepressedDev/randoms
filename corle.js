// ReshuEge solver for math problems 1 part
async function fetch_problem(url) {
    let xmobj;
    let x = (await fetch(url))
    await x.text().then((a) => {
        if (!a.includes("Ответ:</span>")) {
            console.log(`Не нашло для ${url}`);
        }
        let i = a.indexOf("Ответ:</span>")+"Ответ:</span>".length;
        let res = "";
        while (a.charAt(i) != '<') {
            res+=a.charAt(i);
            i++;
        }
        xmobj=res.substring(1, res.length-1);
    });
    return xmobj;
}

function find_prob_nums(ele) {
    
}

function vdt(str) {
    return str.replaceAll("&minus;", "-");
}

async function solve_problem(num) {
    const rgx = /id=([0-9]+)/
    let arr = document.getElementsByClassName("prob_view");
    for (let i = 0; i < arr.length; i++) {
        let vel = arr.item(i);
        let elm = vel.children.item(0).children.item(0).children.item(0).children.item(0).children.item(0).children.item(0);
        let nmx = elm.href.match(rgx)[1];
        if (num == 0) {
            let asw = await fetch_problem(`/problem?id=${nmx}`);
            vel.children[2].value = vdt(asw);
        }
        if (nmx == num) {
            let asw = await fetch_problem(`/problem?id=${num}`);
            vel.children[2].value = vdt(asw);
        }
    }
}