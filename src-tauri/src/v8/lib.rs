use lazy_static::lazy_static;
use std::sync::Mutex;
use std::collections::HashMap;
use sonyflake::Sonyflake;


lazy_static! {
    static ref PATH:Mutex<HashMap<String, String>> = {
      let map = HashMap::new();
      Mutex::new(map)
    };

    static ref SNOW_ID:Mutex<Sonyflake> = {
        Mutex::new(Sonyflake::new().unwrap())
    };
}


#[cfg(test)]
mod tests {
    use crate::v8::lib::SNOW_ID;
    use v8::{FunctionCallbackArguments, FunctionTemplate, HandleScope, Local, Object, ObjectTemplate, ReturnValue, ScriptOrigin, Value};
    use serde_v8::Serializable;
    use crate::APP;
    use crate::dao::models::RunLog;
    use crate::parse_xls::lib::ParseXls;
    use crate::v8::lib::PATH;


    #[test]
    fn test_mini_v8() {
        let platform = v8::new_default_platform(0, false).make_shared();
        v8::V8::initialize_platform(platform);
        v8::V8::initialize();

        let isolate = &mut v8::Isolate::new(Default::default());
        let scope = &mut HandleScope::new(isolate);

        let object_template = ObjectTemplate::new(scope);


        let name = v8::String::new(scope, "yo").unwrap();
        let value = v8::String::new(scope, "yo").unwrap();
        object_template.set(name.into(), value.into());


        add_md5_fun(scope, object_template);
        add_snow_id_fun(scope, object_template);
        set_read_xls_fun(scope, object_template);
        set_println_fun(scope, object_template);


        let context = v8::Context::new_from_template(scope, object_template);
        let scope = &mut v8::ContextScope::new(scope, context);



        let code = v8::String::new(scope, r#"
const md5Str = md5('Hello'+read_xls()[0].A+snowId());
println(md5Str);
for(var i=0;i<100;i++){
   println(`${i} =======${md5Str}`);
}
        "#).unwrap();
        // println!("javascript code: {}", code.to_rust_string_lossy(scope));

        let script = v8::Script::compile(scope, code, None).unwrap();
        let result = script.run(scope).unwrap();
        let result = result.to_string(scope).unwrap();
        println!("result: {}", result.to_rust_string_lossy(scope));
    }

    fn set_println_fun(mut scope: &mut HandleScope<()>, object_template: Local<ObjectTemplate>) {

        let println_function = |scope: &mut HandleScope, args: FunctionCallbackArguments, mut res: ReturnValue| {
            let string = args.get(0).to_rust_string_lossy(scope);
            println!("console = {}", string);
            if let Ok(app) = APP.lock(){
                if let Some(window) =  app.get("window"){
                    window.emit("println", RunLog::log(string)).unwrap();
                }
            }
        };

        let name = v8::String::new(scope, "println").unwrap();
        let function = FunctionTemplate::new(scope, println_function);
        object_template.set(name.into(), function.into());
    }

    fn add_md5_fun(mut scope: &mut HandleScope<()>, object_template: Local<ObjectTemplate>) {
        let name = v8::String::new(scope, "md5").unwrap();
        let md5_function = FunctionTemplate::new(scope, md5_function);
        object_template.set(name.into(), md5_function.into());
    }

    fn set_read_xls_fun(mut scope: &mut HandleScope<()>, object_template: Local<ObjectTemplate>) {
        PATH.lock().unwrap().insert("path".to_string(), "/Users/suiyantao/Desktop/PLCC系统硬件清单列表_v1.1_202011181641.xlsx".to_string());

        let read_xls_callback = |scope: &mut HandleScope, args: FunctionCallbackArguments, mut res: ReturnValue| {
            let binding = PATH.lock().unwrap();
            let path = binding.get("path").unwrap();
            let mut parse_xls = ParseXls {
                xls_path: path.to_string(),
                js_content: "".to_string(),
            };
            let mut value2 = parse_xls.read_all().unwrap();

            let result1 = value2.to_v8(scope).unwrap();

            res.set(result1);
        };

        let name = v8::String::new(scope, "read_xls").unwrap();
        let md5_function = v8::FunctionTemplate::new(scope, read_xls_callback);
        object_template.set(name.into(), md5_function.into());
    }

    fn add_snow_id_fun(mut scope: &mut HandleScope<()>, object_template: Local<ObjectTemplate>) {
        let snow_id_callback = |scope: &mut HandleScope, args: FunctionCallbackArguments, mut res: ReturnValue| {
            let binding = SNOW_ID.lock().unwrap();
            if let Ok(id) = binding.next_id() {
                res.set(v8::String::new(scope, &id.to_string()).unwrap().into());
            }
        };

        let name = v8::String::new(scope, "snowId").unwrap();
        let snow_id_function = v8::FunctionTemplate::new(scope, snow_id_callback);
        object_template.set(name.into(), snow_id_function.into());
    }


    fn md5_function(
        scope: &mut HandleScope,
        args: FunctionCallbackArguments,
        mut res: ReturnValue,
    ) {
        let string = args.get(0).to_rust_string_lossy(scope);
        println!(" {}", string);
        let option = v8::String::new(scope, "md5").unwrap();
        let string1 = format!("{:x}", md5::compute(string));
        let local = v8::String::new(scope, &string1).unwrap();
        res.set(local.into());
    }
}