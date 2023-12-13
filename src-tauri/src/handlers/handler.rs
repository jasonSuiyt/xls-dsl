use std::borrow::Borrow;
use crate::dao::file_dao;
use crate::dao::models::{File, NewFile};

#[tauri::command]
pub(crate) fn find_all_file() -> Vec<File> {
    file_dao::select().unwrap()
}

#[tauri::command]
pub(crate) fn add_file(new_file: NewFile)-> File  {
    file_dao::insert(new_file).unwrap()
}

#[tauri::command]
pub(crate) fn remove_file(id: i32)  {
    file_dao::remove(id).unwrap();
}

#[tauri::command]
pub(crate) fn update_code_by_id(id: i32, code: String)   {
    file_dao::update_code_by_id(id, code).unwrap();
}

#[tauri::command]
pub(crate) fn update_file(update_file: File)   {
    file_dao::update(update_file).unwrap();
}

