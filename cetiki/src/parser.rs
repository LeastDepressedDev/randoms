use std::{collections::{HashMap, HashSet, LinkedList}, process::exit};


pub enum Sections {
    PRE,
    DATA,
    PROG
}

pub struct Parser {
    section: Sections,
    pub vars: HashMap<String, String>
}

pub fn compilation_error(msg: &str) {
    println!("Compilation error:\n\t{msg}");
    exit(1);
}

impl Parser {
    pub fn new() -> Parser {
        return Parser { section: Sections::PRE, vars: HashMap::new() };
    } 

    pub fn line(&mut self, line: String) {
        if line.is_empty() {return;}
        let lst = line.as_str();
        if lst==".data" {
            self.section = Sections::DATA;
            return;
        } else if lst==".prog" {
            self.section = Sections::PROG;
            return;
        }

        match self.section {
            Sections::PRE => (),
            Sections::DATA => {
                let split = line.split("=");
                let size = split.clone().count();
                
                let mut i= 1;
                let mut ll = LinkedList::<String>::new();
                let mut s: String = String::new();
                split.for_each(|x| {
                    let x = x.trim();
                    // println!("{x}");
                    if x.is_empty() || x==" " {compilation_error("One section of .data is empty");}
                    if i==size {s = x.to_string();}
                    else {ll.push_back(x.to_string());}
                    i+=1;
                });

                ll.iter().for_each(|x| {
                    self.vars.insert(x.to_string(), (*s).to_string());
                });
            },
            Sections::PROG => ()
        };
    }
}