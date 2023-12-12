diesel::table! {
    file (id) {
        id -> Integer,
        name -> Text,
        xlx_template -> Text,
        code -> Text,
        created_date -> Date,
        updated_date -> Date,
    }
}