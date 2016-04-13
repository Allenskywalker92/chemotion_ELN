module Labeled
  extend ActiveSupport::Concern

  included do
    attributes :collection_labels
  end

  def collection_labels
    collections = object.collections.where.not(label: 'All')
    collections.map {|c| {name: c.label, is_shared: c.is_shared,id: c.id}}.uniq
  end
end
