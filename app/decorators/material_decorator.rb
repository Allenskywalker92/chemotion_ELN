class MaterialDecorator
  attr_reader :reaction_materials

  def initialize(reaction_materials)
    @reaction_materials = reaction_materials
  end

  def decorated
    reaction_materials_attributes = Hash[Array(reaction_materials).map {|r|
      [r.sample_id, r.attributes]
    }]

    reaction_materials.map do |reaction_material|
      m = Material.new(reaction_material.sample.attributes)
      rma = reaction_materials_attributes[reaction_material.sample_id] || {}
      m.reference = rma['reference']
      m.equivalent = rma['equivalent']

      if reaction_material.class.to_s === "ReactionsProductSample"
        m.container = reaction_material.sample.container
      end

      m
    end
  end
end
