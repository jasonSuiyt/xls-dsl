use diesel::{ExpressionMethods, QueryDsl, RunQueryDsl, SelectableHelper, SqliteConnection};
use diesel::associations::HasTable;
use crate::dao::models::{File, NewFile};
use crate::dao::schema::file::{code, created_date, id};
use crate::dao::schema::file::dsl::file;


pub(crate) fn select(mut conn: SqliteConnection) -> anyhow::Result<Vec<File>> {
    let result = file.select(File::as_select()).order_by(created_date.asc()).load(&mut conn)?;
    Ok(result)
}

pub(crate) fn insert(mut conn: SqliteConnection, new_file: NewFile) -> anyhow::Result<usize> {
    let i = diesel::insert_into(file::table()).values(&vec![new_file]).execute(&mut conn)?;
    Ok(i)
}

pub(crate) fn update(mut conn: SqliteConnection, update_file: File) -> anyhow::Result<usize> {
    let i = diesel::update(file::table()).set(update_file).execute(&mut conn)?;
    Ok(i)
}

pub(crate) fn update_code_by_id(mut conn: SqliteConnection, id_where: i32, code_str: String) -> anyhow::Result<usize> {
    let i = diesel::update(file).set(code.eq(&code_str)).filter(id.eq(&id_where)).execute(&mut conn)?;
    Ok(i)
}

pub(crate) fn remove(mut conn: SqliteConnection, id_del: i32) -> anyhow::Result<usize> {
    let i = diesel::delete(file.filter(id.eq(&id_del))).execute(&mut conn)?;
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
        let vec = select(establish_connection()).unwrap();
        println!("{:#?}",vec);
    }

    #[test]
    fn  insert_test(){
        let res = insert(establish_connection(), NewFile{
            name: "test".to_string(),
            xlx_template: "test".to_string(),
            code: "test".to_string(),
            created_date: Local::now().date_naive(),
            updated_date: Local::now().date_naive(),
        }).unwrap();
        assert_eq!(res, 1)
    }

    #[test]
    fn  update_test(){
        let res = update(establish_connection(), File{
            id:3,
            name: "test".to_string(),
            xlx_template: "test".to_string(),
            code: "test".to_string(),
            created_date: Local::now().date_naive(),
            updated_date: Local::now().date_naive(),
        }).unwrap();
        assert!(res>0)
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



