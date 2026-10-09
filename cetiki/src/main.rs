use crate::sets::{DiscreteObject::Literal, DiscreteSet};

mod sets;

fn main() {
    let mut A = DiscreteSet::new(1024);
    let mut B = DiscreteSet::new(1024);
    let mut C = DiscreteSet::new(1024);

    A.put(Literal(63)); A.put(Literal(23)); A.put(Literal(656));
    B.put(Literal(64)); B.put(Literal(1)); B.put(Literal(2));
    C.put(Literal(9)); C.put(Literal(5)); C.put(Literal(7));

    

    println!("{}", A.clone()+(B.clone()+C.clone())==(A.clone()+B.clone())+C.clone());
}