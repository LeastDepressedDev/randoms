use std::{fs::File, io::Read};

use crate::{parser::Parser, sets::{DiscreteObject::Literal, DiscreteSet}};

mod sets;
mod parser;

fn test() {
    let mut A = DiscreteSet::from(1024, vec![Literal(64), Literal(32), Literal(656)]);
    let mut B = DiscreteSet::from(1024, vec![Literal(64), Literal(1), Literal(2)]);
    let mut C = DiscreteSet::from(1024, vec![Literal(9), Literal(5), Literal(7)]);

    

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
    test();
}