use std::sync::{Arc, Mutex};

use anyhow::anyhow;
use boa_engine::object::ObjectInitializer;
use boa_engine::property::Attribute;
use boa_engine::{Context, JsObject, JsString, JsValue, NativeFunction};
use boa_parser::Source;
use calamine::{open_workbook, Reader, Xlsx};
use lazy_static::lazy_static;
use serde_json::{json, Map, Number, Value};
use tauri::Window;

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
    pub window: Arc<Mutex<Window>>
}

impl ParseXls {
    /// read xls function
    fn read_all(&mut self) -> anyhow::Result<Value> {
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

    pub(crate) async fn invoke_script(&mut self) -> anyhow::Result<String> {
        let result = self.read_all()?;
       
     
        let mut context = Context::default();

        unsafe {
            let window = self.window.clone();
          
            let println = move |_this: &JsValue, args: &[JsValue], _context: &mut Context<'_>| {
                let arg: Option<JsValue> = args.get(0).cloned();
                let p = arg.unwrap();
                if p.is_object() {
                    let v = p.to_json(_context).unwrap();
                    let  w = window.lock();
                    w.unwrap().emit("println", v.to_string()).unwrap();
                } else {
                    let v = p.to_string(_context).unwrap().to_std_string_escaped();
                    let  w = window.lock();
                    w.unwrap().emit("println", v).unwrap();
                }

                Ok(JsValue::Null)
            };
            context
                .register_global_builtin_callable(
                    "println",
                    1,
                    NativeFunction::from_closure(println),
                )
                .unwrap();

            let value = JsValue::from_json(&result, &mut context).unwrap();

            context
                .register_global_property("data", value, Attribute::all())
                .expect("property shouldn't exist");
        };

        match context.eval(Source::from_bytes(self.js_content.as_str())) {
            Ok(res) => {
                let res: String = res.to_string(&mut context).unwrap().to_std_string_escaped();
                Ok(res)
            }
            Err(e) => Err(anyhow!("{}", e)),
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::parse_xls::lib::ParseXls;

    #[actix_rt::test]
    async fn test_parse_xls_read_xls() {
        let mut parse = ParseXls {
            xls_path: "/Users/suiyantao/Desktop/PLCC系统硬件清单列表_v1.1_202011181641.xlsx"
                .to_string(),
            js_content: r#"
               for(let i=0,len=data.length; i<len; i++){
                  println(`${data[i].A}___${data[i].B}`)
               }
            "#
            .to_string(),
        };
        for _ in 0..1 {
            let value = parse.invoke_script().unwrap();
        }
    }
}
