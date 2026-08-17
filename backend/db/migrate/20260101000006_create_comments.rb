class CreateComments < ActiveRecord::Migration[7.1]
  def change
    create_table :comments do |t|
      t.references :commentable, polymorphic: true, null: false
      t.references :user, null: true, foreign_key: true
      t.references :parent, null: true, foreign_key: { to_table: :comments }
      t.string :guest_name
      t.string :guest_email
      t.text :body, null: false
      t.boolean :approved, null: false, default: true

      t.timestamps
    end

    add_index :comments, :approved
  end
end
