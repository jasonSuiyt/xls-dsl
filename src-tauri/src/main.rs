// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod collections;
mod dao;
mod handlers;
mod parse_xls;

use handlers::handler;

use crate::dao::db;
use core::result::Result::Ok;
use std::env;

 
fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            db::init();
            Ok({})
        })
        .invoke_handler(tauri::generate_handler![
            handler::find_all_file,
            handler::add_file,
            handler::remove_file,
            handler::update_code_by_id,
            handler::update_file,
            handler::get_by_id,
            handler::update_name_xls_by_id,
            handler::run
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use boa_engine::{Context, JsResult, JsString, JsValue, NativeFunction, Source};

    use super::*;

    use std::future::Future;

    #[test]
    fn test_boa() {
        let js_code = r#"
             let two = 1 + 1;
             let res =  md5("我的utf-8");
             let res1 = md5(res);
             let res2 = md5(res1);
             let sql = `${md5(res)} ${md5(res)}`;
             let res3 = md5(sql);
             let definitely_not_four = two + "2";
             definitely_not_four
        "#;

        let mut context = Context::default();

        unsafe {
            let md5 = |_this: &JsValue, args: &[JsValue], _context: &mut Context<'_>| {
                let arg = args.get(0).cloned();
                let p = arg
                    .unwrap()
                    .to_string(_context)
                    .unwrap()
                    .to_std_string_escaped();
                println!("md5={}", p);
                Ok(JsValue::String(JsString::from(format!("md5={}", p))))
            };
            context
                .register_global_builtin_callable("md5", 1, NativeFunction::from_closure(md5))
                .unwrap();
        };

        match context.eval(Source::from_bytes(js_code)) {
            Ok(res) => {
                println!(
                    "res={}",
                    res.to_string(&mut context).unwrap().to_std_string_escaped()
                );
            }
            Err(e) => {
                println!("{:#?}", e);
            }
        }
    }
}
