class InboxSerializer < ActiveModel::Serializer
  attributes :id, :name, :container_type, :children
  #has_many :attachments, :serializer => AttachmentSerializer

  def children
    all_containers = object.hash_tree
    root = all_containers.keys[0]
    arr = Array.new
    get_attchement_ids(arr, all_containers[root])
    attachments = Attachment.where(container_id: arr)

    json_tree(attachments, all_containers[root])
  end

  def get_attchement_ids(arr, containers)
    containers.map do |container, subcontainers|
      arr.push(container.id)
      get_attchement_ids(arr, subcontainers)
    end
  end

  def json_tree(attachments, containers)
      containers.map do |container, subcontainers|
        current_attachments = attachments.select{|attach| attach.container_id == container.id}
          {:id => container.id,
            :name => container.name,
            :container_type => container.container_type,
            :attachments => current_attachments,
            :children => json_tree(attachments, subcontainers).compact}
      end
  end

end
