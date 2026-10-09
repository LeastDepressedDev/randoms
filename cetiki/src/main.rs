use std::{fs::File, io::Read};

use crate::{parser::Parser, sets::{DiscreteObject::Literal, DiscreteSet}};

mod sets;
mod parser;

fn test() {
    let mut A = DiscreteSet::new(1024);
    let mut B = DiscreteSet::new(1024);
    let mut C = DiscreteSet::new(1024);

    A.put(Literal(63)); A.put(Literal(23)); A.put(Literal(656));
    B.put(Literal(64)); B.put(Literal(1)); B.put(Literal(2));
    C.put(Literal(9)); C.put(Literal(5)); C.put(Literal(7));

    

    println!("{}", A.clone()+(B.clone()+C.clone())==(A.clone()+B.clone())+C.clone());
}

fn run() {
    let mut parser = Parser::new();

    let mut file = File::open("test.ck").unwrap();
    let mut content: String = String::new();
    file.read_to_string(&mut content).unwrap();
    let lines = content.split("\n");

    lines.for_each(|line| {
        let line = line.trim();
        parser.line(line.to_string());
    });

    parser.vars.iter().for_each(|x| {
        println!("{} {}", x.0, x.1);
    });
}

fn main() {
    run();
}