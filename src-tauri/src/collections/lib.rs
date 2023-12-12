use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

struct Node{
    is_word: bool,
    next: HashMap<char, Rc<RefCell<Node>>>
}

impl Node {
    pub fn new_with_is_word(&self, is_word: bool) -> Self {
        return Self{
            is_word,
            next: HashMap::new()
        }
    }

    pub fn new()->Self {
        return Self{
            is_word: false,
            next: HashMap::new()
        }
    }
}

// 字典树
struct Trie {
    root: Rc<RefCell<Node>>,
    size: usize,
}

impl Trie {
    pub fn new() -> Self{
        return Trie{
            root: Rc::new(RefCell::new(Node::new())),
            size: 0
        }
    }

    pub fn get_size(&self) -> usize {
        return self.size;
    }

    // 添加单词
    pub fn insert(&mut self, word: String){
        let mut temp = self.root.clone();
        for c in word.chars() {
            let n = temp.borrow().next.get(&c).cloned();
            if let Some(no) = n {
                temp = no.clone();
            }else {
                let t = Rc::new(RefCell::new(Node::new()));
                temp.borrow_mut().next.insert(c, t.clone());
                temp = t.clone();
            }
        }

        if temp.borrow().is_word == false {
            temp.borrow_mut().is_word = true;
            self.size +=1;
        }
    }

    // 查询
    pub fn search(&self, word: String)->bool{
        let mut tmp = self.root.clone();
        let mut i =1;
        for c in word.chars(){
            let n = tmp.borrow().next.get(&c).cloned();
            if let Some(no) = n {
                i+=1;
                tmp = no.clone();
            } else {
                return false;
            }
        }
        if tmp.borrow().is_word == true{
            return true;
        }
        false
    }

    // 查询
    pub fn start_with(&self, word: String)->bool{
        let mut tmp = self.root.clone();
        let mut i =1;
        for c in word.chars(){
            let n = tmp.borrow().next.get(&c).cloned();
            if let Some(no) = n {
                i+=1;
                tmp = no.clone();
            } else {
                return false;
            }
        }
        true
    }
}

#[cfg(test)]
mod tests{
    use crate::collections::lib::Trie;

    #[test]
    pub fn test_trie_search(){
        let mut  trie = Trie::new();
        trie.insert("hello".to_string());
        trie.insert("suiyantao".to_string());
        trie.insert("RustroverProjects".to_string());

        assert_eq!(trie.search("hello".to_string()), true);
        assert_eq!(trie.search("suiyantao".to_string()), true);
        assert_eq!(trie.search("RustroverProjects".to_string()), true);
        assert_eq!(trie.search("RustroverProje".to_string()), false);
    }

    #[test]
    pub fn test_trie_start_with(){
        let mut  trie = Trie::new();
        trie.insert("hello".to_string());
        trie.insert("suiyantao".to_string());
        trie.insert("RustroverProjects".to_string());

        assert_eq!(trie.start_with("hello".to_string()), true);
        assert_eq!(trie.start_with("suiyantao".to_string()), true);
        assert_eq!(trie.start_with("RustroverProjects".to_string()), true);
        assert_eq!(trie.start_with("RustroverProje".to_string()), true);
        assert_eq!(trie.start_with("verProje".to_string()), false);
    }
}