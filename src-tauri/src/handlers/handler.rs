use std::sync::{Arc, Mutex};

use chrono::Local;
use tauri::Window;

use crate::dao::file_dao;
use crate::dao::models::{File, NewFile};
use crate::parse_xls::lib::ParseXls;

#[tauri::command]
pub(crate) fn find_all_file() -> Vec<File> {
   
    file_dao::select().unwrap()
}

#[tauri::command]
pub(crate) fn add_file(new_file: NewFile)-> File  {
    println!("new_file: {:?}", new_file);
    
    file_dao::insert(NewFile { created_date: Some(Local::now().naive_local()), updated_date: Some(Local::now().naive_local()), ..new_file }).unwrap()
}

#[tauri::command]
pub(crate) fn remove_file(id: i32)  {
    file_dao::remove(id).unwrap();
}

#[tauri::command]
pub(crate) fn update_code_by_id(id: i32, code: String)->File{
    file_dao::update_code_by_id(id, code).unwrap()
}

#[tauri::command]
pub(crate) fn update_name_xls_by_id(id: i32, name: String, xls: String)->File{
    file_dao::update_name_xls_by_id(id, name, xls).unwrap()
}


#[tauri::command]
pub(crate) fn update_file(update_file: File) ->File{
    file_dao::update(update_file).unwrap()
}

#[tauri::command]
pub(crate) fn get_by_id(id: i32)-> File{
    file_dao::get_by_id(id).unwrap()
}

#[tauri::command]
pub(crate) async fn run(window: Window, id: i32)-> Result<String, String>{
    let file  = file_dao::get_by_id(id).expect("id not found");
    let mut parse = ParseXls {
        xls_path: file.xlx_template,
        js_content: file.code,
        window: Arc::new(Mutex::new(window))
    };
    let res = parse.invoke_script().await.unwrap();
    Ok(res)
}

