class CreateAdminInvitations < ActiveRecord::Migration[7.1]
  def change
    create_table :admin_invitations do |t|
      t.string :email, null: false
      t.string :token, null: false
      t.references :invited_by, null: false, foreign_key: { to_table: :users }
      t.datetime :accepted_at
      t.datetime :expires_at, null: false

      t.timestamps
    end

    add_index :admin_invitations, :token, unique: true
    add_index :admin_invitations, :email
  end
end
