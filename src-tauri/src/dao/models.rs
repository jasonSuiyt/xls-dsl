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

