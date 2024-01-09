use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::Deserialize;
use serde::Serialize;

#[derive(Queryable, Selectable,Identifiable, AsChangeset ,Debug, Serialize, Deserialize)]
#[diesel(table_name = crate::dao::schema::file)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[derive(Clone)]
#[derive(PartialEq, PartialOrd)]
#[serde(rename_all = "camelCase")]
pub struct File {
    pub id: i32,
    pub name: String,
    pub xlx_template: String,
    pub code: String,
    pub created_date: Option<NaiveDateTime>,
    pub updated_date: Option<NaiveDateTime>,
}



#[derive(Insertable, Clone, Debug, Serialize, Deserialize)]
#[diesel(table_name = crate::dao::schema::file)]
#[serde(rename_all = "camelCase")]
pub struct NewFile {
    pub name: String,
    pub xlx_template: String,
    pub code: String,
    pub created_date: Option<NaiveDateTime>,
    pub updated_date: Option<NaiveDateTime>
}



#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RunLog {
    pub log_type:String,
    pub msg:String,
}

impl RunLog {
    pub fn result(msg: String) -> Self{
        RunLog { log_type: "result".to_string(), msg }
    }

    pub fn error(msg: String) -> Self{
        RunLog { log_type: "error".to_string(), msg }
    }

    pub fn log(msg: String) -> Self{
        RunLog { log_type: "log".to_string(), msg }
    }
}

