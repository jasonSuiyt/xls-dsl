use lazy_static::lazy_static;
use std::sync::{Mutex, Once};
use std::collections::HashMap;
use std::time::Duration;
use serde_json::Value;
use serde_v8::Serializable;
use sonyflake::Sonyflake;
use v8::{FunctionCallbackArguments, FunctionTemplate, HandleScope, Local, ObjectTemplate, ReturnValue};
use crate::APP;
use crate::dao::models::RunLog;
use crate::parse_xls::lib::ParseXls;

lazy_static! {
    static ref PATH:Mutex<HashMap<String, String>> = {
        let map = HashMap::new();
        Mutex::new(map)
    };
    static ref SNOW_ID:Mutex<Sonyflake> = {
        Mutex::new(Sonyflake::new().unwrap())
    };
}
static INITIALIZE_V8: Once = Once::new();

#[derive(Clone)]
pub(crate) struct V8Runtime {
    code: String,
    xls_path: String,
}

impl V8Runtime {
    pub fn new(code: String, xls_path: String) -> Self {
        INITIALIZE_V8.call_once(|| {
            let platform = v8::new_default_platform(0, false).make_shared();
            v8::V8::initialize_platform(platform);
            v8::V8::initialize();
        });
        Self {
            code,
            xls_path,
        }
    }
    pub fn run_script(self) {
        PATH.lock().unwrap().insert("path".to_string(), self.xls_path);

        let isolate = &mut v8::Isolate::new(Default::default());
        let scope = &mut HandleScope::new(isolate);

        let object_template = ObjectTemplate::new(scope);

        V8Runtime::add_md5_fun(scope, object_template);
        V8Runtime::add_snow_id_fun(scope, object_template);
        V8Runtime::set_read_xls_fun(scope, object_template);
        V8Runtime::add_println_fun(scope, object_template);
        V8Runtime::add_uuid_fun(scope, object_template);

        let context = v8::Context::new_from_template(scope, object_template);
        let scope = &mut v8::ContextScope::new(scope, context);

        extern "C" fn check_message_0(
            message: Local<v8::Message>,
            _exception: Local<v8::Value>,
        ) {
            let scope = &mut unsafe { v8::CallbackScope::new(message) };
            let scope = &mut HandleScope::new(scope);
            let message_str = message.get(scope);
            let line = message.get_line_number(scope).unwrap();
            if let Some(w) = APP.lock().unwrap().get("window") {
                w.emit("println", RunLog::result(format!("line:{}\n{}", line, message_str.to_rust_string_lossy(scope)).to_string())).unwrap();
            }
        }
        scope.add_message_listener(check_message_0);

        let code = v8::String::new(scope, &self.code).unwrap();

        let script = v8::Script::compile(scope, code, None).unwrap();

        match script.run(scope) {
            None => {
                V8Runtime::emit_result("".to_string());
            }
            Some(result) => {
                if result.is_string() {
                    V8Runtime::emit_result(result.to_rust_string_lossy(scope));
                } else if result.is_undefined() {
                    V8Runtime::emit_result("".to_string());
                } else {
                    if let Ok(res) = serde_v8::from_v8::<Value>(scope, result.into()) {
                        V8Runtime::emit_result(serde_json::to_string_pretty(&res).unwrap());
                    }
                }
            }
        }
    }

    fn emit_result(msg: String) {
        if let Some(w) = APP.lock().unwrap().get("window") {
            w.emit("println", RunLog::result(msg)).unwrap();
        }
    }


    fn add_md5_fun(scope: &mut HandleScope<()>, object_template: Local<ObjectTemplate>) {
        let name = v8::String::new(scope, "md5").unwrap();
        let md5_function = FunctionTemplate::new(scope, V8Runtime::md5_function);
        object_template.set(name.into(), md5_function.into());
    }


    fn add_println_fun(scope: &mut HandleScope<()>, object_template: Local<ObjectTemplate>) {
        let function = |scope: &mut HandleScope, args: FunctionCallbackArguments, _: ReturnValue| {
            let arg = args.get(0);
            if let Some(w) = APP.lock().unwrap().get("window") {
                std::thread::sleep(Duration::from_millis(1));
                if arg.is_string() {
                    w.emit("println", RunLog::log(arg.to_rust_string_lossy(scope))).unwrap();
                } else {
                    if let Ok(res) = serde_v8::from_v8::<Value>(scope, arg.into()) {
                        w.emit("println", RunLog::log(serde_json::to_string_pretty(&res).unwrap())).unwrap();
                    }
                }
            }
        };
        let function = FunctionTemplate::new(scope, function);
        let name = v8::String::new(scope, "println").unwrap();
        object_template.set(name.into(), function.into());
    }

    fn set_read_xls_fun(scope: &mut HandleScope<()>, object_template: Local<ObjectTemplate>) {
        let read_xls_callback = |scope: &mut HandleScope, _: FunctionCallbackArguments, mut res: ReturnValue| {
            let binding = PATH.lock().unwrap();
            let path = binding.get("path").unwrap();
            let mut parse_xls = ParseXls {
                xls_path: path.to_string()
            };
            let mut value2 = parse_xls.read_all().unwrap();
            let result1 = value2.to_v8(scope).unwrap();
            res.set(result1);
        };

        let name = v8::String::new(scope, "read_xls").unwrap();
        let md5_function = FunctionTemplate::new(scope, read_xls_callback);
        object_template.set(name.into(), md5_function.into());
    }

    fn add_snow_id_fun(scope: &mut HandleScope<()>, object_template: Local<ObjectTemplate>) {
        let snow_id_callback = |scope: &mut HandleScope, _: FunctionCallbackArguments, mut res: ReturnValue| {
            let binding = SNOW_ID.lock().unwrap();
            if let Ok(id) = binding.next_id() {
                res.set(v8::String::new(scope, &id.to_string()).unwrap().into());
            }
        };

        let name = v8::String::new(scope, "snowid").unwrap();
        let snow_id_function = FunctionTemplate::new(scope, snow_id_callback);
        object_template.set(name.into(), snow_id_function.into());
    }

    fn add_uuid_fun(scope: &mut HandleScope<()>, object_template: Local<ObjectTemplate>) {
        let uuid_id_callback = |scope: &mut HandleScope, args: FunctionCallbackArguments, mut res: ReturnValue| {
            let uuid = uuid::Uuid::new_v4().to_string();
            res.set(v8::String::new(scope, &uuid).unwrap().into());
        };

        let name = v8::String::new(scope, "uuid").unwrap();
        let snow_id_function = FunctionTemplate::new(scope, uuid_id_callback);
        object_template.set(name.into(), snow_id_function.into());
    }


    fn md5_function(
        scope: &mut HandleScope,
        args: FunctionCallbackArguments,
        mut res: ReturnValue,
    ) {
        let string = args.get(0).to_rust_string_lossy(scope);
        let local = v8::String::new(scope, &format!("{:x}", md5::compute(string))).unwrap();
        res.set(local.into());
    }
}


#[cfg(test)]
mod tests {
    use crate::v8::lib::V8Runtime;


    #[test]
    fn test_run_code() {
        let code = include_str!("test.js");

        for i in 0..1 {
            let v8_runtime = V8Runtime {
                code: code.to_string(),
                xls_path: "/Users/suiyantao/Desktop/PLCC系统硬件清单列表_v1.1_202011181641.xlsx".to_string(),
            };
            v8_runtime.run_script()
        }
    }
}