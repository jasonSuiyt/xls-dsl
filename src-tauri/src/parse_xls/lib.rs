use anyhow::anyhow;
// use boa_engine::{Context, JsString, JsValue, NativeFunction};
// use boa_engine::property::Attribute;
// use boa_parser::Source;
use calamine::{open_workbook, Reader, Xlsx};
use chrono::format;
use lazy_static::lazy_static;
use serde_json::{json, Map, Number, Value};

use crate::APP;
use crate::dao::models::RunLog;

lazy_static! {
    static ref COLUMN_INDEX: Vec<String> = column_index();
}

pub type JsonObject = Map<String, Value>;

fn column_index() -> Vec<String> {
    let chars: Vec<String> = (b'A'..=b'Z')
        .map(|x| (x as char).to_string())
        .collect::<Vec<String>>();
    let mut chars_vec = vec![];
    for i in 0..702 {
        if i >= 26 {
            let two_len = i % 26;
            let one_len = (i / 26) - 1;
            chars_vec.push(format!("{}{}", chars[one_len], chars[two_len]));
        } else {
            chars_vec.push(format!("{}", chars[i]));
        }
    }
    chars_vec
}

pub(crate) struct ParseXls {
    pub xls_path: String,
    pub js_content: String,
}

impl ParseXls {
    /// read xls function
    pub fn read_all(&mut self) -> anyhow::Result<Value> {
        let mut workbook: Xlsx<_> = open_workbook(self.xls_path.as_str())?;

        match workbook.worksheets().first() {
            Some((_, sheet_data)) => {
                let row_len = sheet_data.rows().len();
                println!("row_len: {}", row_len);

                let mut row_data_ve: Vec<JsonObject> = vec![];

                sheet_data.rows().for_each(|x| {
                    let mut row_data: JsonObject = JsonObject::new();
                    for i in 0..x.len() {
                        let ele = &x[i];
                        let index_s = COLUMN_INDEX.get(i).unwrap();
                        if ele.is_bool() {
                            row_data.insert(index_s.clone(), Value::Bool(ele.get_bool().unwrap()));
                        } else if ele.is_float() {
                            let data: f64 = ele.get_float().unwrap();
                            let dataview = Number::from_f64(data);
                            row_data.insert(index_s.clone(), Value::Number(dataview.unwrap()));
                        } else if ele.is_int() {
                            row_data.insert(
                                index_s.clone(),
                                Value::Number(Number::from(ele.get_int().unwrap())),
                            );
                        } else if ele.is_string() {
                            row_data.insert(
                                index_s.clone(),
                                Value::String(ele.get_string().unwrap().to_string()),
                            );
                        } else {
                            row_data.insert(index_s.clone(), Value::Null);
                        }
                    }
                    row_data_ve.push(row_data)
                });
                return Ok(json!(row_data_ve));
                //println!("{}", json!(row_data_ve).to_string());
            }
            None => return Err(anyhow!("file sheet not found")),
        }
    }


    // pub(crate) async fn invoke_script(&mut self) -> anyhow::Result<String> {
    //     let result = self.read_all()?;
    //
    //     let mut context = Context::default();
    //     let snow = sonyflake::Sonyflake::new().unwrap();
    //
    //     unsafe {
    //         let println = move |_this: &JsValue, args: &[JsValue], _context: &mut Context<'_>| {
    //             let arg: Option<JsValue> = args.get(0).cloned();
    //             let app = APP.lock().unwrap();
    //             let w = app.get("window");
    //             let p: JsValue = arg.clone().unwrap();
    //
    //             if p.is_object() {
    //                 let p = p.to_json(_context);
    //                 let v = p.clone().unwrap();
    //                 w.unwrap().emit("println", RunLog::log(v.to_string())).unwrap();
    //             } else {
    //                 let p = p.to_string(_context);
    //                 let v = p.unwrap().to_std_string_escaped();
    //                 if let Ok(_) = w.unwrap().emit("println", RunLog::log(v.clone())) {}
    //             }
    //             drop(p);
    //             drop(arg);
    //             Ok(JsValue::Null)
    //         };
    //         context
    //             .register_global_callable("println", 1, NativeFunction::from_closure(println))
    //             .unwrap();
    //
    //         let snoyflake_id = move |_this: &JsValue, _: &[JsValue], _context: &mut Context<'_>| {
    //             let next_id = snow.next_id().unwrap();
    //             Ok(JsValue::String(JsString::from(next_id.to_string())))
    //         };
    //
    //         context
    //             .register_global_callable("snowid", 0, NativeFunction::from_closure(snoyflake_id))
    //             .unwrap();
    //
    //         let uu_id_call = move |_this: &JsValue, _: &[JsValue], _context: &mut Context<'_>| {
    //             let uuid = uuid::Uuid::new_v4().to_string();
    //             Ok(JsValue::String(JsString::from(uuid)))
    //         };
    //
    //         context
    //             .register_global_callable("uuid", 0, NativeFunction::from_closure(uu_id_call))
    //             .unwrap();
    //
    //
    //         let md5_call = move |_this: &JsValue, args: &[JsValue], _context: &mut Context<'_>| {
    //             let arg: Option<JsValue> = args.get(0).cloned();
    //             if let Some(ref arg1) = arg{
    //                 let p: JsValue = arg.clone().unwrap();
    //                 if let Ok(res) = p.to_string(_context){
    //                     let arg1_val = res.to_std_string_escaped();
    //                     let md5_val = format!("{:x}", md5::compute(arg1_val));
    //                     drop(arg);
    //                     return Ok(JsValue::String(md5_val.into()));
    //                 }
    //             }
    //             drop(arg);
    //             Ok(JsValue::Undefined)
    //         };
    //
    //         context
    //             .register_global_callable("md5", 1, NativeFunction::from_closure(md5_call))
    //             .unwrap();
    //     };
    //
    //     let value = JsValue::from_json(&result, &mut context).unwrap();
    //
    //     context
    //         .register_global_property("data", value, Attribute::all())
    //         .expect("property shouldn't exist");
    //
    //     match context.eval(Source::from_bytes(self.js_content.as_str())) {
    //         Ok(res) => {
    //             let res: String = res.to_string(&mut context).unwrap().to_std_string_escaped();
    //             Ok(res)
    //         }
    //         Err(e) => Err(anyhow!("{}", e)),
    //     }
    // }
}


// #[cfg(test)]
// mod tests {
//     use deno_core::{JsRuntime, RuntimeOptions, serde_v8};
//     use deno_core::_ops::serde_v8_to_rust;
//     use deno_core::v8::Local;
//
//     #[test]
//     fn test_v8() {
//         let options = RuntimeOptions::default();
//         let mut rt = JsRuntime::new(options);
//
//         let code = r#"
//             let name = {
//                 name: "zhangsan",
//                 age: 23
//             };
//             console.log(name);
//             name
//         "#;
//         let global = rt.execute_script("", deno_core::FastString::Static(code)).unwrap();
//         let mut scope = rt.handle_scope();
//         let value = global.open(&mut scope);
//         if value.is_object(){
//             let local = value.to_object(&mut scope).unwrap();
//             // println!("{:?}", obj.to_(&mut scope));
//             let value1 = serde_v8::from_v8::<serde_json::Value>(&mut scope, local.into()).unwrap();
//             println!("{:?}", value1.to_string())
//         }
//         let value_str = value.to_rust_string_lossy(&mut scope);
//         println!("{}", value_str);
//
//     }
// }
