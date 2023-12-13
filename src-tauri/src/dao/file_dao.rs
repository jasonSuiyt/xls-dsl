use diesel::{ExpressionMethods, QueryDsl, RunQueryDsl, SelectableHelper, SqliteConnection, Table};
use diesel::associations::HasTable;
use crate::dao::db;
use crate::dao::models::{File, NewFile};
use crate::dao::schema::file::{code, created_date, id};
use crate::dao::schema::file::dsl::file;




pub(crate) fn select() -> anyhow::Result<Vec<File>> {
    let mut connection = db::establish_db_connection();
    let result = file.select(File::as_select()).order_by(created_date.asc()).load(&mut connection)?;
    Ok(result)
}

pub(crate) fn insert(new_file: NewFile) -> anyhow::Result<File> {
    let mut connection = db::establish_db_connection();
    diesel::insert_into(file::table()).values(new_file).execute(&mut connection)?;
    let row  = file.order(id.desc()).first::<File>(&mut connection)?;
    Ok(row)
}

pub(crate) fn update(update_file: File) -> anyhow::Result<File> {
    let mut connection = db::establish_db_connection();
    let i = diesel::update(file::table()).set(update_file.clone()).execute(&mut connection)?;
    Ok(file.filter(id.eq(update_file.id)).first::<File>(&mut connection)?)
}

pub(crate) fn update_code_by_id(id_where: i32, code_str: String) -> anyhow::Result<File> {
    let mut connection = db::establish_db_connection();
    let i = diesel::update(file).set(code.eq(&code_str)).filter(id.eq(&id_where)).execute(&mut connection)?;
    Ok(file.filter(id.eq(id_where)).first::<File>(&mut connection)?)
}

pub(crate) fn remove(id_del: i32) -> anyhow::Result<usize> {
    let mut connection = db::establish_db_connection();
    let i = diesel::delete(file.filter(id.eq(&id_del))).execute(&mut connection)?;
    Ok(i)
}


#[cfg(test)]
mod tests {
    use std::env;
    use chrono::Local;
    use diesel::Connection;
    use super::*;

    pub fn establish_connection() -> SqliteConnection {
        let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
        SqliteConnection::establish(&database_url)
            .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
    }

    #[test]
    fn  select_test(){
        let vec = select().unwrap();
        println!("{:#?}",vec);
    }

    #[test]
    fn  insert_test(){
        let res = insert(NewFile{
            name: "test".to_string(),
            xlx_template: "test".to_string(),
            code: "test".to_string(),
            created_date: Local::now().date_naive(),
            updated_date: Local::now().date_naive(),
        }).unwrap();
        assert_eq!(res.name, "test");
    }

    #[test]
    fn  update_test(){
        let file_add = File{
            id:3,
            name: "test".to_string(),
            xlx_template: "test".to_string(),
            code: "test".to_string(),
            created_date: Local::now().date_naive(),
            updated_date: Local::now().date_naive(),
        };
        let res = update(file_add.clone()).unwrap();
        assert_eq!(res, file_add)
    }

    // #[test]
    // fn  update_code_by_id_test(){
    //     let res = update_code_by_id(establish_connection(), 3, "xxxxx".to_string()).unwrap();
    //     assert!(res>0)
    // }

    // #[test]
    // fn  remove_test(){
    //     let res = remove(establish_connection(), 3).unwrap();
    //     assert!(res>0)
    // }



}



