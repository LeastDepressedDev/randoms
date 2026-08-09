function getNumericValueFromElement(id, deftVal) {
    var vl = Number.parseInt(document.getElementById(id).value);
    if (Number.isNaN(vl)) vl = deftVal;
    return vl;
}

function loadOlbj(olbj) {
    document.getElementById("characterName").value = olbj["chname"];
    document.getElementById("ac-base").value = olbj["ac_base"];
    document.getElementById("spd-base").value = olbj["spd_base"];
    document.getElementById("cur-hp").value = olbj["hp"];
    document.getElementById("max-hp").value = olbj["mhp"];
    StatNames.forEach(name => {
        document.getElementById(`stat.base.${name}`).value = olbj["stat"].base[name];
        document.getElementById(`st.pf.${name}`).checked = olbj["stat"].save_throw[name];
    });
    olbj["exps"].forEach(part => addExpChangeItem(part.source, part.amount));
    olbj["textnotes"].forEach(part => addNote(part.title, part.body));
    olbj["profs"].forEach(part => addProficiencyItem(part.source, part.effect));
    olbj["stat"].effects.forEach(part => addStatEffectItem(part.source, part.stat, part.mod));

    let qns = document.getElementById("qn-field");
    qns.value = olbj["qns"].content;
    qns.style.height = olbj["qns"].height;

    let inv = document.getElementById("inv-content");
    inv.value = olbj["inv"].content;
    inv.style.height = olbj["inv"].height;

    olbj["calcs"].forEach(part => addCalcItem(part.title, part.calc, part.descr));
}

function grabInfo() {
    var olbj = {};
    olbj["chname"] = document.getElementById("characterName").value;
    olbj["ac_base"] = getNumericValueFromElement("ac-base", 0);
    olbj["spd_base"] = getNumericValueFromElement("spd-base", 0);
    olbj["hp"] = getNumericValueFromElement("cur-hp", 0);
    olbj["mhp"] = getNumericValueFromElement("max-hp", 0);
    olbj["stat"] = {
        base: {},
        save_throw: {},
        effects: []
    }
    StatNames.forEach(name => {
        olbj["stat"]["base"][name] = getNumericValueFromElement(`stat.base.${name}`);
        olbj["stat"]["save_throw"][name] = document.getElementById(`st.pf.${name}`).checked;
    });
    let stat_effects = document.getElementsByClassName("stat-effects-item");
    for (let i = 0; i < stat_effects.length; i++) {
        let element = stat_effects.item(i);
        let part = {
            source: element.children[0].value,
            stat: element.children[1].value,
            mod: Number.parseInt(element.children[2].value)
        }
        if (!Number.isNaN(part.mod)) olbj["stat"].effects.push(part);
    }

    olbj["exps"] = []
    let exp_changes = document.getElementsByClassName("exp-change-item");
    for (let i = 0; i < exp_changes.length; i++) {
        let element = exp_changes.item(i);
        let part = {
            source: element.children[0].value,
            amount: Number.parseInt(element.children[1].value)
        }
        if (!Number.isNaN(part.amount)) olbj["exps"].push(part);
    }

    
    olbj["profs"] = []
    let profs_list = document.getElementsByClassName("proficiency-item");
    for (let i = 0; i < profs_list.length; i++) {
        let element = profs_list.item(i);
        olbj["profs"].push({
            source: element.children[0].value,
            effect: element.children[1].value
        });
    }

    
    olbj["textnotes"] = []
    let text_note_list = document.getElementsByClassName("note-item");
    for (let i = 0; i < text_note_list.length; i++) {
        let element = text_note_list.item(i);
        olbj["textnotes"].push({
            title: element.children[0].children[0].value,
            body: element.children[1].value
        });
    }

    let inv_element = document.getElementById("inv-content");
    olbj["inv"] = {
        content: inv_element.value,
        height: inv_element.style.height
    }

    let qn_element = document.getElementById("qn-field");
    olbj["qns"] = {
        content: qn_element.value,
        height: qn_element.style.height
    }

    
    let calcs_element = document.getElementsByClassName("rp-calc-item");
    olbj["calcs"] = []
    for (let i = 0; i < calcs_element.length; i++) {
        let element = calcs_element.item(i);
        olbj["calcs"].push({
            title: element.children[0].children[0].value,
            calc: element.children[1].children[0].value,
            descr: element.children[2].value
        });
    }

    return olbj;
}




var send_timer = 0;
var load_confirmation = false;

async function loadRecent() {
    let rps = await getPayloadFrom("/lld");
    if (rps.code == 0) {
        try {
            loadOlbj(rps.body);
        } 
        catch {}
        finally {load_confirmation = true;}
    } else {
        load_confirmation = true;
    }
}

setTimeout(() => loadRecent(), 200);

// Main update routine. Note: I am too lazy to put normal eventing here because it is handwritten, so its just interval. yeah...
setInterval(() => {
    var col_info = grabInfo();
    

    // Level exp calculation
    var exp = 0; // Experience points commulative
    col_info.exps.forEach(v => exp+=v.amount)
    document.getElementById("exp-val").innerText = exp;
    var lvl = 0; // Character level
    while (lvl <= 20 && exp >= ExpLevelTable[lvl+1]) lvl++;
    document.getElementById("lvl").innerText = lvl + (lvl == 20 ? " (MAX)" : "");
    document.getElementById("next-lvl").innerText = lvl+1;
    document.getElementById("next-lvl-exp").innerText = ExpLevelTable[lvl+1]-exp
    document.getElementById("til-twenty").innerText = Math.max(ExpLevelTable[20]-exp, 0);

    //Mastery
    var mastery = (2+Math.trunc((lvl-1)/4));
    document.getElementById("mastery-mod").innerText = "+" + mastery;

    //Stats
    var stat_fin_vals = {}
    var spd = getNumericValueFromElement("spd-base", 0);
    var armor_class = getNumericValueFromElement("ac-base", 0);
    StatNames.forEach(name => {
        stat_fin_vals[name] = col_info.stat.base[name]
    });

    // Applying stat effects
    col_info["stat"].effects.forEach(effect => {
        stat_fin_vals[effect.stat] += effect.mod;
    });

    // Skills
    var skillsVals = {}
    skillNames.forEach(name => {
        skillsVals[name] = -5+Math.trunc(stat_fin_vals[SkillToStatMapper[name]]/2)
    });

    // Add prods
    col_info.profs.forEach(prof => {
        skillsVals[prof.effect] += mastery;
    });

    // Update skills display
    skillNames.forEach(name => {
        let subname = name.replaceAll(" ", "_");
        let val = skillsVals[name];
        document.getElementById(`sk.${subname}`).innerText = (val > 0 ? "+" : "") + val;
    });

    //  Update up pars
    document.getElementById("final-ac").innerText = armor_class;
    document.getElementById("final-spd").innerText = spd;

    var mod_finals = {}
    var st_finals = {}
    // Update stats boxes
    StatNames.forEach(name => {
        let fin_stat = stat_fin_vals[name];
        let mod = -5+Math.trunc(fin_stat/2);
        mod_finals[name] = mod;
        let st = mod+(col_info.stat.save_throw[name] ? mastery : 0);
        st_finals[name] = st;
        document.getElementById(`stat.${name}`).innerText = fin_stat;
        document.getElementById(`bonus.${name}`).innerText = (mod>0 ? "+" : "") + mod;
        document.getElementById(`st.${name}`).innerText = (st>0 ? "+" : "") + st;
    });

    if (send_timer++ >= 5 && load_confirmation) {
        send_timer = 0;
        col_info["finals"] = {
            mastery: mastery,
            stats: stat_fin_vals,
            mods: mod_finals,
            throws: st_finals
        }
        postMsgPayload("/upd", col_info);
    }
}, 500);

function debugOlbjExport() {
    console.log(grabInfo());
}

async function postMsgPayload(addr, msg_obj) {
    const response = await fetch(addr, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(msg_obj),
    });
    return response;
}

async function getPayloadFrom(addr) {
    const respone = await fetch(addr, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    return (await respone.json());
}