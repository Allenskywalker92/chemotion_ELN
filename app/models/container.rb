class Container < ActiveRecord::Base
  include ElementCodes
  belongs_to :containable, :polymorphic => true
  has_many :attachments
  #has_ancestry
  has_closure_tree
  #accepts_nested_attributes_for :container
  #scope :ordered, -> { order("name ASC") }

  def analyses
    if self.children
      analyses = self.children.where(container_type: "analyses").first

      return analyses.children.where(container_type: "analysis") if analyses
    end

    return []
  end

  def root_element
    self.root.containable
  end

  def self.create_root_container
    root_con = Container.create(name: "root", container_type: "root")
    root_con.children.create(container_type: "analyses")
    root_con
  end

end
