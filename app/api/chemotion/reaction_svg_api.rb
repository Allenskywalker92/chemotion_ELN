module Chemotion
  class ReactionSvgAPI < Grape::API

    resource :reaction_svg do
      desc "Get reaction_svg_filename by reaction_id"
      params do
        requires :id, type: Integer, desc: "Reaction id"
      end
      get do
        inchikeys = {}
        reaction = Reaction.find(params[:id])
        inchikeys[:starting_materials] = reaction.starting_materials.map do |material|
          material.molecule.inchikey
        end
        inchikeys[:reactants] = reaction.reactants.map do |material|
          material.molecule.inchikey
        end
        inchikeys[:products] = reaction.products.map do |material|
          material.molecule.inchikey
        end

        hash_of_inchikeys = Digest::SHA256.hexdigest(inchikeys.values.join)
        hash_of_inchikeys + '.svg'
      end
    end
  end
end