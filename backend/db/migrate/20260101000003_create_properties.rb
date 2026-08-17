class CreateProperties < ActiveRecord::Migration[7.1]
  def change
    create_table :properties do |t|
      t.string :title, null: false
      t.string :slug, null: false
      t.text :description, null: false
      t.string :address, null: false
      t.string :city, null: false
      t.string :state, null: false
      t.string :zip_code, null: false
      t.decimal :price, precision: 12, scale: 2, null: false
      t.integer :bedrooms
      t.decimal :bathrooms, precision: 3, scale: 1
      t.integer :square_feet
      t.string :property_type, null: false, default: "single_family"
      t.string :status, null: false, default: "active"
      t.boolean :featured, null: false, default: false
      t.date :listed_at

      t.timestamps
    end

    add_index :properties, :slug, unique: true
    add_index :properties, :status
    add_index :properties, :featured
  end
end
