ActiveRecord::Schema[7.1].define(version: 2026_01_01_000007) do
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "admin_invitations", force: :cascade do |t|
    t.string "email", null: false
    t.string "token", null: false
    t.bigint "invited_by_id", null: false
    t.datetime "accepted_at"
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_admin_invitations_on_email"
    t.index ["invited_by_id"], name: "index_admin_invitations_on_invited_by_id"
    t.index ["token"], name: "index_admin_invitations_on_token", unique: true
  end

  create_table "blog_posts", force: :cascade do |t|
    t.string "title", null: false
    t.string "slug", null: false
    t.string "excerpt"
    t.text "body", null: false
    t.string "status", default: "draft", null: false
    t.datetime "published_at"
    t.bigint "author_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["author_id"], name: "index_blog_posts_on_author_id"
    t.index ["published_at"], name: "index_blog_posts_on_published_at"
    t.index ["slug"], name: "index_blog_posts_on_slug", unique: true
    t.index ["status"], name: "index_blog_posts_on_status"
  end

  create_table "comments", force: :cascade do |t|
    t.string "commentable_type", null: false
    t.bigint "commentable_id", null: false
    t.bigint "user_id"
    t.bigint "parent_id"
    t.string "guest_name"
    t.string "guest_email"
    t.text "body", null: false
    t.boolean "approved", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["approved"], name: "index_comments_on_approved"
    t.index ["commentable_type", "commentable_id"], name: "index_comments_on_commentable"
    t.index ["parent_id"], name: "index_comments_on_parent_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "destinations", force: :cascade do |t|
    t.string "name", null: false
    t.string "slug", null: false
    t.text "description", null: false
    t.string "address"
    t.string "city", null: false
    t.string "state", null: false
    t.string "category", default: "other", null: false
    t.integer "t10_rating", null: false
    t.boolean "featured", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category"], name: "index_destinations_on_category"
    t.index ["slug"], name: "index_destinations_on_slug", unique: true
    t.index ["t10_rating"], name: "index_destinations_on_t10_rating"
    t.check_constraint "t10_rating BETWEEN 1 AND 10", name: "t10_rating_range"
  end

  create_table "properties", force: :cascade do |t|
    t.string "title", null: false
    t.string "slug", null: false
    t.text "description", null: false
    t.string "address", null: false
    t.string "city", null: false
    t.string "state", null: false
    t.string "zip_code", null: false
    t.decimal "price", precision: 12, scale: 2, null: false
    t.integer "bedrooms"
    t.decimal "bathrooms", precision: 3, scale: 1
    t.integer "square_feet"
    t.string "property_type", default: "single_family", null: false
    t.string "status", default: "active", null: false
    t.boolean "featured", default: false, null: false
    t.date "listed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["featured"], name: "index_properties_on_featured"
    t.index ["slug"], name: "index_properties_on_slug", unique: true
    t.index ["status"], name: "index_properties_on_status"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "name", null: false
    t.string "role", default: "member", null: false
    t.string "jti", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "admin_invitations", "users", column: "invited_by_id"
  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "blog_posts", "users", column: "author_id"
  add_foreign_key "comments", "comments", column: "parent_id"
  add_foreign_key "comments", "users"
end
