use rand::seq::SliceRandom;

pub trait Container<T> {
    fn has(&self, element: T) -> bool;
    fn put(&mut self, element: T);
}

/// This version of binary tree allows you to use types without reflexivity. But the input should be stripped of cases, that breaks Ord and Eq
/// 
/// Asymptotics:
/// put - O(log n)
/// has - O(log n)
/// 
pub struct BinContainer<T: PartialOrd + PartialEq + Copy> {
    val: T,
    size: usize,

    left: Option<Box<BinContainer<T>>>,
    right: Option<Box<BinContainer<T>>>
}

impl <T: PartialOrd + PartialEq + Copy> BinContainer<T> {
    pub fn new(element: T) -> BinContainer<T> {
        return BinContainer { val: element, size: 1, left: None, right: None };
    }

    pub fn from(vec: &Vec<T>) -> BinContainer<T> {
        let mut vec = vec.clone();

        vec.shuffle(&mut rand::rng());

        let mut ix = vec.iter_mut();
        let mut bc: BinContainer<T> = BinContainer::new(ix.nth(0).unwrap().clone());
        
        ix.for_each(|x| bc.put(*x));

        return bc;
    }

    pub fn size(&self) -> usize {
        return self.size;
    }
}

impl <T: PartialOrd + PartialEq + Copy> Container<T> for BinContainer<T> {
    fn has(&self, element: T) -> bool {
        if element == self.val {return true;}
        else {
            if element < self.val {
                return self.left.as_ref().is_some_and(|x| x.has(element));
            } else {
                return self.right.as_ref().is_some_and(|x| x.has(element));
            }
        }
    }

    fn put(&mut self, element: T) {
        if element == self.val {return;}
        if element < self.val {
            let left = self.left.as_mut();
            match left {
                Some(node) => node.put(element),
                None => self.left = Some(Box::new(BinContainer::new(element)))
            }
        } else {
            let right = self.right.as_mut();
            match right {
                Some(node) => node.put(element),
                None => self.right = Some(Box::new(BinContainer::new(element)))
            }
        }
        self.size+=1;
    }
}

pub type I64Container = BinContainer<i64>;
pub type F64Container = BinContainer<f64>;
pub type StringContainer = BinContainer<String>;