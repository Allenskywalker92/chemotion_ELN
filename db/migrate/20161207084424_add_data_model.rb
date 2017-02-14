class AddDataModel < ActiveRecord::Migration
  def up
    create_table :containers do |t|
      t.string :ancestry, index: true
      t.integer :element_id
      t.string :element_type
      t.string :name
      t.string :container_type
      t.text :description
      t.hstore :extended_metadata, default: ''

      t.timestamps null: false
    end

    create_table :attachments do |t|
      t.integer :container_id, null: false
      t.string :filename, null: false
      t.string :identifier, null: false

      t.timestamps null: false
    end

    Sample.find_each do |s|
      if s.container == nil
        s.container = ContainerHelper.create_root_container
        s.save!
      end
    end

    Reaction.find_each do |r|
      if r.container == nil
        r.container = ContainerHelper.create_root_container
        r.save!
      end
    end

  end

  def down
  end
end
