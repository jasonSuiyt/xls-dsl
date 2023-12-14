diesel::table! {
    file (id) {
        id -> Integer,
        name -> Text,
        xlx_template -> Text,
        code -> Text,
        created_date -> Nullable<Timestamp>,
        updated_date -> Nullable<Timestamp>,
    }
}