use std::{collections::BTreeSet, ops::{Add, Mul, Sub}, process::exit};

use crate::sets::DiscreteObject::Literal;


pub enum DiscreteObject {
    Literal(usize)
}

type IteType = usize;
#[derive(Clone)]
pub struct DiscreteSet {
    ite: Vec<usize>,
    ate: BTreeSet<usize>
}

///
/// Copy: O(n)
/// 
impl DiscreteSet {
    pub fn new(sectors: usize) -> DiscreteSet {
        DiscreteSet { ite: Vec::from_iter(std::iter::repeat(0).take(sectors)), ate: BTreeSet::new() }
    }

    pub fn size(&self) -> usize {
        let mut sum = 0usize;
        for i in 0..self.sector_capacity() {
            let sc = DiscreteSet::sec_and_slot(i);
            if self.ite[sc.0] & sc.1 != 0 {sum+=1;}
        }
        return sum;
    }

    pub fn active_sectors(&self) -> usize {
        self.ate.len()
    }

    pub fn sectors(&self) -> usize {
        self.ite.len()
    }

    pub fn single_sector() -> usize {
        size_of::<IteType>()*8
    }

    pub fn sector_capacity(&self) -> usize {
        self.sectors()*DiscreteSet::single_sector()
    }

    fn check_lit_c(&self, lit: usize) {
        if lit >= self.sector_capacity() {
            println!("Literal: {} over sectors capacity [0; {})", lit, self.sector_capacity());
            exit(1);
        }
    }

    fn sec_and_slot(lit: usize) -> (usize, usize) {
        return (lit/DiscreteSet::single_sector(), 1 << (lit % DiscreteSet::single_sector()));
    }

    pub fn put(&mut self, element: DiscreteObject) {
        match element {
            Literal(lit) => {
                self.check_lit_c(lit);
                let sc = DiscreteSet::sec_and_slot(lit);

                self.ite[sc.0] |= sc.1;
                self.ate.insert(sc.0);
            }
        }
    }

    pub fn rm(&mut self, element: DiscreteObject) {
        match element {
            Literal(lit) => {
                self.check_lit_c(lit);
                let sc = DiscreteSet::sec_and_slot(lit);

                self.ite[sc.0] &= !sc.1;
                if self.ite[sc.0]==0 {
                    self.ate.remove(&sc.0);
                }
            }
        }
    }

    pub fn has(&self, element: DiscreteObject) -> bool {
        match element {
            Literal(lit) => {
                self.check_lit_c(lit);
                let sc = DiscreteSet::sec_and_slot(lit);

                (self.ite[sc.0] & sc.1) != 0
            }
        }
    }
}

impl PartialEq for DiscreteSet {
    fn eq(&self, other: &Self) -> bool {
        self.active_sectors() == other.active_sectors() && self.sectors() == other.sectors() &&
            self.ite==other.ite
    }

    fn ne(&self, other: &Self) -> bool {
        !self.eq(other)
    }
}

impl Eq for DiscreteSet {}

impl Add for DiscreteSet {
    type Output = DiscreteSet;

    ///
    /// O(min(n, k))
    /// 
    fn add(mut self, mut rhs: Self) -> Self::Output {
        if self.active_sectors() >= rhs.active_sectors() {
            rhs.ate.iter().for_each(|x| {
                let sec = *x;
                self.ite[sec] |= rhs.ite[sec];
                self.ate.insert(sec); // const log
            });
            return self;
        } else {
            self.ate.iter().for_each(|x| {
                let sec = rhs.ite[*x];
                rhs.ite[sec] |= self.ite[sec];
                rhs.ate.insert(sec); // const log
            });
            return rhs;
        }
    }
}

impl Mul for DiscreteSet {
    type Output = DiscreteSet;

    ///
    /// O(m+k)
    /// 
    fn mul(mut self, rhs: Self) -> Self::Output {
        let sat = self.ate.clone();
        let secx = sat.union(&rhs.ate);

        secx.for_each(|x| {
            let x = *x;
            self.ite[x] &= rhs.ite[x];
            if self.ite[x]==0 {
                self.ate.remove(&x);
            }
        });

        return self;
    }
}

impl Sub for DiscreteSet {
    type Output = DiscreteSet;

    fn sub(mut self, rhs: Self) -> Self::Output {
        
        let sat = self.ate.clone();
        let secx = sat.intersection(&rhs.ate);

        secx.for_each(|x| {
            let x = *x;
            self.ite[x] &= !rhs.ite[x];
            if self.ite[x]==0 {
                self.ate.remove(&x);
            }
        });

        return self;
    }
}