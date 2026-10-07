use crate::{containers::{BinContainer, Container}, sets::{DiscreteObject::Integer, DiscreteSet}};

mod sets;
mod containers;

fn main() {

    let vec_i: Vec<i64> = vec![5, 1, 5, 7, 4, 9];
    let vec_f: Vec<f64> = vec![5., 1., 5., 7., 4., 9.];
    let mut dset = DiscreteSet::new();

    vec_i.iter().for_each(|x| dset.put(Integer(*x)));
    vec_f.iter().for_each(|x| dset.put(Integer(x.clone() as i64)));

    println!("{}", dset.size());
}
