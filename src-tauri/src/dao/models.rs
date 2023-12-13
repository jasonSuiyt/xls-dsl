use chrono::NaiveDate;
use diesel::internal::derives::multiconnection::ReturningClause;
use diesel::prelude::*;
use serde::Deserialize;
use serde::Serialize;

#[derive(Queryable, Selectable,Identifiable, AsChangeset,Debug, Serialize, Deserialize)]
#[diesel(table_name = crate::dao::schema::file)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[derive(Clone)]
#[derive(PartialEq, PartialOrd)]
pub struct File {
    pub id: i32,
    pub name: String,
    pub xlx_template: String,
    pub code: String,
    pub created_date: NaiveDate,
    pub updated_date: NaiveDate,
}



#[derive(Insertable, Clone, Debug)]
#[diesel(table_name = crate::dao::schema::file)]
pub struct NewFile {
    pub name: String,
    pub xlx_template: String,
    pub code: String,
    pub created_date: NaiveDate,
    pub updated_date: NaiveDate,
}