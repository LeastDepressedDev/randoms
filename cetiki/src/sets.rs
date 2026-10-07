use std::{collections::LinkedList, fmt::Display};

use crate::{containers::{Container, F64Container, I64Container}, sets::DiscreteObject::{Integer, NonInteger}};



#[derive(Clone, Copy)]
pub enum DiscreteObject {
    Integer(i64),
    NonInteger(f64)
}

impl Display for DiscreteObject {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Integer(v) => f.write_str(format!("Integer ( {} )", v).as_str()),
            NonInteger(v) => f.write_str(format!("NonInteger ( {} )", v).as_str())
        };
        return Ok(());
    }
}

pub struct DiscreteSet {
    c_i64: Option<I64Container>,
    c_f64: Option<F64Container>
}

impl Container<DiscreteObject> for DiscreteSet {
    fn put(&mut self, element: DiscreteObject) {
        match element {
            Integer(val) => {
                let container = self.c_i64.as_mut();
                match container {
                    Some(cont) => cont.put(val),
                    None => {
                        self.c_i64 = Some(I64Container::new(val));
                    }
                }
            },
            NonInteger(val) => {
                let container = self.c_f64.as_mut();
                match container {
                    Some(cont) => cont.put(val),
                    None => {
                        self.c_f64 = Some(F64Container::new(val));
                    }
                }
            }
            _ => ()   
        }
    }

    fn has(&self, element: DiscreteObject) -> bool {
        match element {
            
            Integer(val) => self.c_i64.as_ref().is_some_and(|x| x.has(val)),
            NonInteger(val) => self.c_f64.as_ref().is_some_and(|x| x.has(val)),
            _ => false

        }
    }
}

impl DiscreteSet {
    pub fn new() -> DiscreteSet {
        return DiscreteSet { c_i64: None, c_f64: None };
    }

    pub fn size(&self) -> usize {
        self.c_i64.as_ref().map_or(0, |x| x.size())
        +
        self.c_f64.as_ref().map_or(0, |x| x.size())
    }

    pub fn peek(&self) -> LinkedList<DiscreteObject> {
        let mut ll = LinkedList::new();
        // TODO: We are here
        return ll;
    }
}

