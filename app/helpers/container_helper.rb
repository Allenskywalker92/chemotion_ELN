module ContainerHelper

  def self.update_datamodel(container)
    if !container.is_new
      root_container = Container.find_by id: container.id
      root_container.name = "root" #if it is created from client.side
    else
      root_container = Container.new
      root_container.name = "root"
      root_container.container_type = container.container_type
    end
    root_container.save!

    if container.children != nil
      create_or_update_containers(container.children, root_container)
    end

    #root-Container can not contain attachments!!


    return root_container
  end

  def self.export_datamodel(container)

  end

  def self.create_root_container
    root_con = Container.new
    root_con.name = "root"
    root_con.container_type = "root"
    root_con.save!

    analyses_con = Container.create! :container_type => "analyses", :parent => root_con

    return root_con
  end

private
  def self.read_Attachments(folder, container)
    path = File.join(folder, container.name) #wenn leer neue namen

    container.attachments.each do |attachment|
    end

    container.children.each do |child|
      read_Attachments(path, child)
    end

  end

  def self.create_or_update_containers(children, root_container)
    children.each do |child|
      if !child.is_new
        if child.is_deleted
          delete_containers_and_attachments(child)
        else
          #Update container
          oldcon = Container.find_by id: child.id
          oldcon.name = child.name
          oldcon.container_type = child.container_type
          oldcon.description = child.description

          extended_metadata = child.extended_metadata
          if child.container_type == "analysis" && extended_metadata.key?("content")
            extended_metadata["content"] = extended_metadata["content"].to_json
          end
          oldcon.extended_metadata = extended_metadata

          oldcon.save!

          create_or_update_attachments(oldcon.id, child.attachments)
          create_or_update_containers(child.children, oldcon)
        end
      else
        if !child.is_deleted
          #Create container
          newcon = Container.create! :name => child.name, :parent => root_container
          newcon.container_type = child.container_type
          newcon.description = child.description

          extended_metadata = child.extended_metadata
          if child.container_type == "analysis" && extended_metadata.key?("content")
            extended_metadata["content"] = extended_metadata["content"].to_json
          end
          newcon.extended_metadata = extended_metadata

          newcon.save!

          create_or_update_attachments(newcon.id, child.attachments)
          create_or_update_containers(child.children, newcon)
        end
      end
    end
  end

  def self.create_or_update_attachments(parent_container_id, attachments)
    attachments.each do |attachment|
      if !attachment.is_new
        if !attachment.is_deleted
          #todo: update
        else
          #delete
          storage = Storage.new
          storage.delete(attachment)
          Attachment.where(id: attachment.id).destroy_all
        end
      else
        if !attachment.is_deleted
          #create
          begin
            storage = Storage.new
            storage.update(attachment.id, parent_container_id)

          rescue Exception => e
            puts "ERROR: Can not create attachment: " + e.message
          end
        end
      end
    end
  end

  def self.delete_containers_and_attachments(container)
    attachments = Attachment.where(container_id: container.id)

    storage = Storage.new
    attachments.each do |attach|
      storage.delete(attach)
    end
    Attachment.where(container_id: container.id).destroy_all

    if container.children.length > 0
      container.children.each do |tmp|
        delete_containers_and_attachments(tmp)
      end
    end
    Container.where(id: container.id).destroy_all
  end

end #module
