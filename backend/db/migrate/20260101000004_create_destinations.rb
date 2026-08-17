class CreateDestinations < ActiveRecord::Migration[7.1]
  def change
    create_table :destinations do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.text :description, null: false
      t.string :address
      t.string :city, null: false
      t.string :state, null: false
      t.string :category, null: false, default: "other"
      t.integer :t10_rating, null: false
      t.boolean :featured, null: false, default: false

      t.timestamps
    end

    add_index :destinations, :slug, unique: true
    add_index :destinations, :t10_rating
    add_index :destinations, :category
    add_check_constraint :destinations, "t10_rating BETWEEN 1 AND 10", name: "t10_rating_range"
  end
end
